var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 
// Copyright (C) Microsoft. All rights reserved.
//
// THIS IS ONLY HERE FOR UNIT TESTS. UNIT TESTS CURRENTLY BUILD IN SINGLE FILE MODE,
// FOLLOWING <reference> TAGS. THESE EXPECT THIS FILE TO BE IN THE SOURCE TREE IN THE COMMON
// DIRECTORY, WHEREAS IN REALITY IT'S ONLY IN THE COMMON DIRECTORY AFTER BUILDING.
var isDebugBuild = true;
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="isDebugBuild.ts" />
/// <reference path="common.d.ts" />
var Common;
(function (Common) {
    "use strict";
    var ErrorHandling = (function () {
        function ErrorHandling() {
        }
        /**
         * Reports to Watson given a textual stack, parsing out relevant information so it can be bucketed.
         * @param error The Error object.
         */
        ErrorHandling.reportErrorGivenStack = function (error) {
            // Example of error.stack:
            //
            // "Error: failure pretty printing
            //    at Anonymous function (res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/debugger/DebuggerMerged.js:11993:25)
            //    at notifySuccess(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6739:21)
            //    at enter(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6426:21)
            //    at _run(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6642:17)
            //    at _completed(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6610:13)
            //    at Anonymous function (res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/debugger/DebuggerMerged.js:11450:33)
            //    at notifySuccess(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6739:21)
            //    at enter(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6426:21)
            //    at _run(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6642:17)
            //    at _completed(res://C:\Program Files\Internet Explorer\iexplore.exe.local\F12Resources.dll/23/pluginhost/plugin.f12.js:6610:13)"
            //
            // In this case we want "debugger/debuggermerged.js", 11993 and 25.
            //
            var message = error.message;
            var stack = error.stack;
            // Remove all but the top function
            var firstCloseParen = stack.indexOf(")");
            if (firstCloseParen > 0) {
                stack = stack.substr(0, firstCloseParen + 1);
            }
            var result = ErrorHandling.StackRegex.exec(stack);
            if (result) {
                // result[1] is the function name
                var file = result[3];
                var line = parseInt(result[4], 10);
                var column = parseInt(result[5], 10);
                window.reportError(message, file, line, error.stack /* full stack */, column);
            }
        };
        ErrorHandling.StackRegex = new RegExp(".* at ([^(]+) \(.*/23/([^:]+):([0-9]+):([0-9]+)\)", "gim");
        return ErrorHandling;
    }());
    Common.ErrorHandling = ErrorHandling;
})(Common || (Common = {}));
// window is undefined in web workers
if (typeof window !== "undefined") {
    // Overrides the implementation from bptoob\ScriptedHost\Scripts\diagnostics.ts (typescriptapis\bptoob\inc\diagnostics.ts)
    // to add the ability to report the error to the window.errorDisplayHandler before doing "reportError"
    // It also does not call Microsoft.Plugin.Diagnostics.terminate() at the end of onerror.
    /**
     * Handles JavaScript errors in the toolwindows by reporting them as non-fatal errors
     * @param message The error message
     * @param file The file in which the error occurred
     * @param line The line on which the error occurred
     * @param additionalInfo Any additional information about the error such as callstack
     * @param column The column on which the error occurred
     */
    window.reportError = function (message, file, line, additionalInfo, column) {
        // Microsoft.Plugin error reporting causes an error if any of these values are null
        message = message || "";
        file = file || "";
        line = line || 0;
        additionalInfo = additionalInfo || "";
        column = column || 0;
        if (isDebugBuild) {
            // Report to the "UI" in some way
            var externalObj;
            if (window.parent.getExternalObj) {
                // Hosted in an IFRAME, so get the external object from there
                externalObj = window.parent.getExternalObj();
            }
            else if (window.external) {
                // Hosted in Visual Studio
                externalObj = window.external;
            }
            if (externalObj) {
                var component = (window.errorComponent ? window.errorComponent : "Common");
                console.error([component, message, file, line, column].join("\r\n"));
                // Display a warning message to the user
                if (window.errorDisplayHandler) {
                    window.errorDisplayHandler(message, file, line, additionalInfo, column);
                }
            }
        }
        // Report the NFE to the watson server
        if (Microsoft.Plugin && Microsoft.Plugin.Diagnostics && Microsoft.Plugin.Diagnostics.reportError) {
            Microsoft.Plugin.Diagnostics.reportError(message, file, line, additionalInfo, column);
        }
    };
    /**
     * Handles JavaScript errors in the toolwindows by reporting them as non-fatal errors
     * Some hosts then terminate, F12 does not.
     * @param message The error message
     * @param file The file in which the error occurred
     * @param line The line on which the error occurred
     * @param columnNumber Optional column number on which the error occurred
     * @return Returns true to mark the error as handled, False to display the default error dialog
     */
    window.onerror = function (message, file, line, columnNumber) {
        // In IE11 GDR onwards, there is actually a 5th argument, for error - but the Typescript stubs aren't updated
        var column = 0;
        var additionalInfo = "";
        if (arguments) {
            if (arguments[3] && typeof arguments[3] === "number") {
                column = arguments[3];
            }
            if (arguments[4] && arguments[4] instanceof Error) {
                additionalInfo = "Error number: " + arguments[4].number;
                additionalInfo += "\r\nStack: " + arguments[4].stack;
            }
        }
        window.reportError(message, file, line, additionalInfo, column);
        return true;
    };
}
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="errorHandling.ts" />
/// <disable code="SA9017" />
var F12;
(function (F12) {
    var Tools;
    (function (Tools) {
        var Utility;
        (function (Utility) {
            "use strict";
            /**
             * Utility functions for verifying internal state.
             * These assertions always be true unless there is a programming error or installation error.
             * User error should be tested with "if" and fail with a localized string.
             * Not intended to be used in unit test code, only product code.
             */
            var Assert = (function () {
                function Assert() {
                }
                // Possible other asserts:
                //
                // isInstanceOfType(value: any, comparand: any)
                // succeeded(message: string, (any)=>any)
                // isMatch(value: string, pattern: string)
                // isNumber/Array/Function/String
                //
                Assert.isTrue = function (condition, message) {
                    if (!condition) {
                        message = message ? "Internal error. " + message : "Internal error. Unexpectedly false.";
                        Assert.fail(message);
                    }
                };
                Assert.isFalse = function (condition, message) {
                    if (condition) {
                        message = message ? "Internal error. " + message : "Internal error. Unexpectedly true.";
                        Assert.fail(message);
                    }
                };
                Assert.isNull = function (value, message) {
                    if (value !== null) {
                        message = message ? "Internal error. " + message : "Internal error. Unexpectedly not null.";
                        message += " '" + value + "'";
                        Assert.fail(message);
                    }
                };
                Assert.isUndefined = function (value, message) {
                    if (undefined !== void 0) {
                        // This cannot happen in the Chakra engine.
                        message = "Internal error. Unexpectedly undefined has been redefined.";
                        message += " '" + undefined + "'";
                        Assert.fail(message);
                    }
                    if (value !== undefined) {
                        message = message ? "Internal error. " + message : "Internal error. Unexpectedly not undefined.";
                        message += " '" + value + "'";
                        Assert.fail(message);
                    }
                };
                Assert.hasValue = function (value, message) {
                    if (undefined !== void 0) {
                        // This cannot happen in the Chakra engine.
                        message = "Internal error. Unexpectedly undefined has been redefined.";
                        message += " '" + undefined + "'";
                        Assert.fail(message);
                    }
                    if (value === null || value === undefined) {
                        message = message ? "Internal error. " + message : ("Internal error. Unexpectedly " + (value === null ? "null" : "undefined") + ".");
                        Assert.fail(message);
                    }
                };
                Assert.areEqual = function (value1, value2, message) {
                    // Could probe for an equals() method?
                    if (value1 !== value2) {
                        message = message ? "Internal error. " + message : "Internal error. Unexpectedly not equal.";
                        message += " '" + value1 + "' !== '" + value2 + "'.";
                        Assert.fail(message);
                    }
                };
                Assert.areNotEqual = function (value1, value2, message) {
                    if (value1 === value2) {
                        message = message ? "Internal error. " + message : "Internal error. Unexpectedly equal.";
                        message += " '" + value1 + "' === '" + value2 + "'.";
                        Assert.fail(message);
                    }
                };
                Assert.fail = function (message) {
                    // Uncomment next line if you wish
                    // debugger;
                    var error = new Error((message || "Assert failed.") + "\n");
                    try {
                        // The error must be thrown in order to have a call stack for us to report
                        throw error;
                    }
                    catch (ex) {
                        if (Common && Common.ErrorHandling) {
                            // The error now has a call stack so we can report it
                            // If we simply let this throw, we would instead report it in windows.onerror, and would not have the callstack at that point
                            Common.ErrorHandling.reportErrorGivenStack(ex);
                        }
                        // We could choose to comment out this line to ship (or in release) so that we plow on.
                        // However, plowing on in an unknown state is rarely doing the user a favor.
                        // Instead, we should catch the exception at a sufficiently high level in the stack that we can recover.
                        // This will generally get trapped in the global exception handler, which Daytona will translate into a WER report (unless WER is disabled)
                        throw ex;
                    }
                };
                Assert.failDebugOnly = function (message) {
                    // Fail if it is a debug build
                    if (isDebugBuild) {
                        Assert.fail(message);
                    }
                };
                return Assert;
            }());
            Utility.Assert = Assert;
        })(Utility = Tools.Utility || (Tools.Utility = {}));
    })(Tools = F12.Tools || (F12.Tools = {}));
})(F12 || (F12 = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            // Create a new control with the given root HTMLElement. If the root is not
            // provided, a default <div> root is used.
            var Control = (function () {
                function Control(root) {
                    this._rootElement = root;
                    if (typeof this._rootElement === "undefined") {
                        // We must have a root element to start with, default to a div.
                        // This can change at any time by setting the property rootElement.
                        this._rootElement = document.createElement("div");
                        this._rootElement.style.width = this._rootElement.style.height = "100%";
                    }
                    else if (this._rootElement === null) {
                        throw new Error("Invalid root element for Control.");
                    }
                }
                Object.defineProperty(Control.prototype, "rootElement", {
                    get: function () { return this._rootElement; },
                    set: function (newRoot) {
                        if (!newRoot) {
                            throw new Error("Invalid root");
                        }
                        var oldRoot = this._rootElement;
                        this._rootElement = newRoot;
                        if (oldRoot && oldRoot.parentNode) {
                            oldRoot.parentNode.replaceChild(newRoot, oldRoot);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Control.prototype, "parent", {
                    get: function () { return this._parent; },
                    set: function (newParent) {
                        if (this._parent !== newParent) {
                            this._parent = newParent;
                            if (this._parent && !this._parent.rootElement.contains(this._rootElement)) {
                                this._parent.appendChild(this);
                            }
                            this.onParentChanged();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Control.prototype.appendChild = function (child) {
                    this._rootElement.appendChild(child.rootElement);
                    child.parent = this;
                };
                Control.prototype.removeChild = function (child) {
                    if (child.rootElement.parentElement) {
                        this._rootElement.removeChild(child.rootElement);
                        child.parent = null;
                    }
                };
                // overridable
                Control.prototype.onParentChanged = function () {
                };
                return Control;
            }());
            Legacy.Control = Control;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="control.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var Button = (function (_super) {
                __extends(Button, _super);
                function Button(element) {
                    var _this = this;
                    _super.call(this, element);
                    this.rootElement.addEventListener("click", function (e) { return _this.onClick(e); });
                    this.rootElement.addEventListener("keydown", function (e) { return _this.onKeydown(e); });
                    this.rootElement.addEventListener("mousedown", function (e) { return _this.onMouseDown(e); });
                    this.rootElement.addEventListener("mouseup", function (e) { return _this.onMouseUpLeave(e); });
                    this.rootElement.addEventListener("mouseleave", function (e) { return _this.onMouseUpLeave(e); });
                }
                Object.defineProperty(Button.prototype, "click", {
                    get: function () { return this._onClick; },
                    set: function (value) {
                        this._onClick = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Button.prototype, "content", {
                    get: function () { return this.rootElement.innerHTML; },
                    set: function (value) {
                        this.rootElement.innerHTML = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Button.prototype, "tooltip", {
                    get: function () { return this._tooltip; },
                    set: function (value) {
                        var _this = this;
                        this._tooltip = value;
                        this.rootElement.onmouseover = function () {
                            Microsoft.Plugin.Tooltip.show({ content: _this._tooltip });
                            return true;
                        };
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Button.prototype, "disabled", {
                    get: function () { return (this.rootElement).disabled; },
                    set: function (value) { (this.rootElement).disabled = value; },
                    enumerable: true,
                    configurable: true
                });
                // overridable
                Button.prototype.onClick = function (ev) {
                    this.rootElement.focus();
                    if (this._onClick) {
                        this._onClick();
                    }
                };
                // overridable
                Button.prototype.onKeydown = function (ev) {
                    if (ev.keyCode === Common.KeyCodes.Space || ev.keyCode === Common.KeyCodes.Enter) {
                        if (this._onClick) {
                            this._onClick();
                        }
                        ev.preventDefault();
                    }
                };
                Button.prototype.onMouseDown = function (ev) {
                    if (!this.disabled) {
                        this.rootElement.classList.add("BPT-ToolbarButton-MouseDown");
                    }
                };
                Button.prototype.onMouseUpLeave = function (ev) {
                    this.rootElement.classList.remove("BPT-ToolbarButton-MouseDown");
                };
                return Button;
            }(Legacy.Control));
            Legacy.Button = Button;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
    /**
     * Use the Keys members to test against KeyboardEvent.key.
     * This is preferred over testing KeyboardEvent.keyCode, which is deprecated.
     */
    var Keys = (function () {
        function Keys() {
        }
        Keys.C = "c";
        Keys.DEL = "Del";
        Keys.DOWN = "Down";
        Keys.END = "End";
        Keys.ENTER = "Enter";
        Keys.F10 = "F10";
        Keys.HOME = "Home";
        Keys.LEFT = "Left";
        Keys.RIGHT = "Right";
        Keys.SPACEBAR = "Spacebar";
        Keys.UP = "Up";
        return Keys;
    }());
    Common.Keys = Keys;
    /**
     * Use the KeyCodes enumeration to test against KeyboardEvent.keyCode.
     * This is deprecated in favor of testing KeyboardEvent.key.
     */
    (function (KeyCodes) {
        KeyCodes[KeyCodes["Backspace"] = 8] = "Backspace";
        KeyCodes[KeyCodes["Tab"] = 9] = "Tab";
        KeyCodes[KeyCodes["Enter"] = 13] = "Enter";
        KeyCodes[KeyCodes["Shift"] = 16] = "Shift";
        KeyCodes[KeyCodes["Control"] = 17] = "Control";
        KeyCodes[KeyCodes["Alt"] = 18] = "Alt";
        KeyCodes[KeyCodes["CapsLock"] = 20] = "CapsLock";
        KeyCodes[KeyCodes["Escape"] = 27] = "Escape";
        KeyCodes[KeyCodes["Space"] = 32] = "Space";
        KeyCodes[KeyCodes["PageUp"] = 33] = "PageUp";
        KeyCodes[KeyCodes["PageDown"] = 34] = "PageDown";
        KeyCodes[KeyCodes["End"] = 35] = "End";
        KeyCodes[KeyCodes["Home"] = 36] = "Home";
        KeyCodes[KeyCodes["ArrowLeft"] = 37] = "ArrowLeft";
        KeyCodes[KeyCodes["ArrowFirst"] = 37] = "ArrowFirst";
        KeyCodes[KeyCodes["ArrowUp"] = 38] = "ArrowUp";
        KeyCodes[KeyCodes["ArrowRight"] = 39] = "ArrowRight";
        KeyCodes[KeyCodes["ArrowDown"] = 40] = "ArrowDown";
        KeyCodes[KeyCodes["ArrowLast"] = 40] = "ArrowLast";
        KeyCodes[KeyCodes["Insert"] = 45] = "Insert";
        KeyCodes[KeyCodes["Delete"] = 46] = "Delete";
        KeyCodes[KeyCodes["A"] = 65] = "A";
        KeyCodes[KeyCodes["B"] = 66] = "B";
        KeyCodes[KeyCodes["C"] = 67] = "C";
        KeyCodes[KeyCodes["D"] = 68] = "D";
        KeyCodes[KeyCodes["E"] = 69] = "E";
        KeyCodes[KeyCodes["F"] = 70] = "F";
        KeyCodes[KeyCodes["G"] = 71] = "G";
        KeyCodes[KeyCodes["H"] = 72] = "H";
        KeyCodes[KeyCodes["I"] = 73] = "I";
        KeyCodes[KeyCodes["J"] = 74] = "J";
        KeyCodes[KeyCodes["K"] = 75] = "K";
        KeyCodes[KeyCodes["L"] = 76] = "L";
        KeyCodes[KeyCodes["M"] = 77] = "M";
        KeyCodes[KeyCodes["N"] = 78] = "N";
        KeyCodes[KeyCodes["O"] = 79] = "O";
        KeyCodes[KeyCodes["P"] = 80] = "P";
        KeyCodes[KeyCodes["Q"] = 81] = "Q";
        KeyCodes[KeyCodes["R"] = 82] = "R";
        KeyCodes[KeyCodes["S"] = 83] = "S";
        KeyCodes[KeyCodes["T"] = 84] = "T";
        KeyCodes[KeyCodes["U"] = 85] = "U";
        KeyCodes[KeyCodes["V"] = 86] = "V";
        KeyCodes[KeyCodes["W"] = 87] = "W";
        KeyCodes[KeyCodes["X"] = 88] = "X";
        KeyCodes[KeyCodes["Y"] = 89] = "Y";
        KeyCodes[KeyCodes["Z"] = 90] = "Z";
        KeyCodes[KeyCodes["ContextMenu"] = 93] = "ContextMenu";
        KeyCodes[KeyCodes["Multiply"] = 106] = "Multiply";
        KeyCodes[KeyCodes["Plus"] = 107] = "Plus";
        KeyCodes[KeyCodes["Minus"] = 109] = "Minus";
        KeyCodes[KeyCodes["F1"] = 112] = "F1";
        KeyCodes[KeyCodes["F2"] = 113] = "F2";
        KeyCodes[KeyCodes["F3"] = 114] = "F3";
        KeyCodes[KeyCodes["F4"] = 115] = "F4";
        KeyCodes[KeyCodes["F5"] = 116] = "F5";
        KeyCodes[KeyCodes["F6"] = 117] = "F6";
        KeyCodes[KeyCodes["F7"] = 118] = "F7";
        KeyCodes[KeyCodes["F8"] = 119] = "F8";
        KeyCodes[KeyCodes["F9"] = 120] = "F9";
        KeyCodes[KeyCodes["F10"] = 121] = "F10";
        KeyCodes[KeyCodes["F11"] = 122] = "F11";
        KeyCodes[KeyCodes["F12"] = 123] = "F12";
        KeyCodes[KeyCodes["Comma"] = 188] = "Comma";
        KeyCodes[KeyCodes["Period"] = 190] = "Period";
    })(Common.KeyCodes || (Common.KeyCodes = {}));
    var KeyCodes = Common.KeyCodes;
    (function (MouseButtons) {
        MouseButtons[MouseButtons["LeftButton"] = 0] = "LeftButton";
        MouseButtons[MouseButtons["MiddleButton"] = 1] = "MiddleButton";
        MouseButtons[MouseButtons["RightButton"] = 2] = "RightButton";
    })(Common.MouseButtons || (Common.MouseButtons = {}));
    var MouseButtons = Common.MouseButtons;
    // This maps to KeyFlags enum defined in 
    // $/devdiv/feature/VSClient_1/src/bpt/diagnostics/Host/Common/common.h
    (function (KeyFlags) {
        KeyFlags[KeyFlags["None"] = 0] = "None";
        KeyFlags[KeyFlags["Shift"] = 1] = "Shift";
        KeyFlags[KeyFlags["Ctrl"] = 2] = "Ctrl";
        KeyFlags[KeyFlags["Alt"] = 4] = "Alt";
    })(Common.KeyFlags || (Common.KeyFlags = {}));
    var KeyFlags = Common.KeyFlags;
    /**
     * Add listeners to the document to prevent certain IE browser accelerator keys from
     * triggering their default action in IE
     */
    function blockBrowserAccelerators() {
        // Prevent the default F5 refresh, default F6 address bar focus, and default SHIFT + F10 context menu
        document.addEventListener("keydown", function (e) {
            return preventIEKeys(e);
        });
        // Prevent the default context menu
        document.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        // Prevent mouse wheel zoom
        window.addEventListener("mousewheel", function (e) {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    }
    Common.blockBrowserAccelerators = blockBrowserAccelerators;
    /**
     * Checks to see if any of the ALT, SHIFT, or CTRL keys are pressed
     * @param e The keyboard event to check
     * @return true if the event has any of the key flags toggled on
     */
    function HasAnyOfAltCtrlShiftKeyFlags(e) {
        return e.shiftKey || e.ctrlKey || e.altKey;
    }
    Common.HasAnyOfAltCtrlShiftKeyFlags = HasAnyOfAltCtrlShiftKeyFlags;
    /**
     * Checks to see if only CTRL keys are pressed, not ALT or SHIFT
     * @param e The keyboard event to check
     * @return true if the event has any of the key flags toggled on
     */
    function HasOnlyCtrlKeyFlags(e) {
        return e.ctrlKey && !e.shiftKey && !e.altKey;
    }
    Common.HasOnlyCtrlKeyFlags = HasOnlyCtrlKeyFlags;
    /**
     * Prevents IE from executing default behavior for certain shortcut keys
     * This should be called from keydown handlers that do not already call preventDefault().
     * Some shortcuts cannot be blocked via javascript (such as CTRL + P print dialog) so these
     * are already blocked by the native hosting code and will not get sent to the key event handlers.
     * @param e The keyboard event to check and prevent the action on
     * @return false to stop the default action- which matches the keydown/keyup handlers
     */
    function preventIEKeys(e) {
        // Check if a known key combo is pressed
        if (e.keyCode === Common.KeyCodes.F5 ||
            e.keyCode === Common.KeyCodes.F6 ||
            (e.keyCode === Common.KeyCodes.F10 && e.shiftKey) ||
            (e.keyCode === Common.KeyCodes.F && e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
    }
    Common.preventIEKeys = preventIEKeys;
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="keyCodes.ts" />
var Common;
(function (Common) {
    "use strict";
    var ButtonHelpers = (function () {
        function ButtonHelpers() {
        }
        ButtonHelpers.changeButtonStatus = function (buttonDiv, enabled, pressed) {
            var wasEnabled = ButtonHelpers.isEnabled(buttonDiv);
            if (enabled && !wasEnabled) {
                buttonDiv.classList.remove("toolbarButtonStateDisabled");
                buttonDiv.setAttribute("aria-disabled", "false");
            }
            else if (!enabled && wasEnabled) {
                buttonDiv.classList.add("toolbarButtonStateDisabled");
                buttonDiv.setAttribute("aria-disabled", "true");
            }
            if (typeof pressed === "boolean") {
                ButtonHelpers.IsChangingAriaPressed = true;
                if (pressed) {
                    buttonDiv.setAttribute("aria-pressed", "true");
                    buttonDiv.classList.add("toolbarButtonStateActive");
                }
                else {
                    buttonDiv.setAttribute("aria-pressed", "false");
                    buttonDiv.classList.remove("toolbarButtonStateActive");
                }
                ButtonHelpers.IsChangingAriaPressed = false;
            }
        };
        ButtonHelpers.isEnabled = function (buttonDiv) {
            return !buttonDiv.classList.contains("toolbarButtonStateDisabled");
        };
        ButtonHelpers.isValidEvent = function (event) {
            return (event.type === "click" || event.keyCode === Common.KeyCodes.Enter || event.keyCode === Common.KeyCodes.Space) && ButtonHelpers.isEnabled(event.currentTarget);
        };
        ButtonHelpers.setButtonTooltip = function (buttonDiv, tooltipResourceName) {
            var tooltip = Microsoft.Plugin.Resources.getString(tooltipResourceName);
            buttonDiv.setAttribute("data-plugin-vs-tooltip", tooltip);
            buttonDiv.setAttribute("aria-label", tooltip);
        };
        ButtonHelpers.setupButton = function (buttonDiv, tooltipResourceName, clickHandler, isEnabled) {
            if (isEnabled === void 0) { isEnabled = true; }
            if (typeof tooltipResourceName === "string") {
                ButtonHelpers.setButtonTooltip(buttonDiv, tooltipResourceName);
                buttonDiv.setAttribute("role", "button");
            }
            if (clickHandler) {
                buttonDiv.addEventListener("click", function (event) { return ButtonHelpers.onButtonPress(event, clickHandler); });
                buttonDiv.addEventListener("keydown", function (event) { return ButtonHelpers.onButtonPress(event, clickHandler); });
                buttonDiv.addEventListener("DOMAttrModified", function (event) {
                    if (!ButtonHelpers.IsChangingAriaPressed && ButtonHelpers.isEnabled(buttonDiv) && event.attrName === "aria-pressed" && event.attrChange === event.MODIFICATION) {
                        clickHandler(event);
                    }
                });
            }
            buttonDiv.addEventListener("mousedown", ButtonHelpers.onButtonMouseDown);
            buttonDiv.addEventListener("mouseenter", ButtonHelpers.onButtonMouseEnter);
            buttonDiv.addEventListener("mouseleave", ButtonHelpers.onButtonMouseLeave);
            buttonDiv.addEventListener("mouseup", ButtonHelpers.onButtonMouseUp);
            if (!isEnabled) {
                ButtonHelpers.changeButtonStatus(buttonDiv, /* enabled = */ false);
            }
        };
        ButtonHelpers.onButtonMouseDown = function (event) {
            var buttonDiv = event.currentTarget;
            if (ButtonHelpers.isEnabled(buttonDiv)) {
                buttonDiv.classList.add("toolbarButtonMouseDown");
            }
            else {
                event.stopImmediatePropagation();
            }
        };
        ButtonHelpers.onButtonMouseEnter = function (event) {
            var buttonDiv = event.currentTarget;
            if (ButtonHelpers.isEnabled(buttonDiv)) {
                buttonDiv.classList.add("toolbarButtonMouseHover");
            }
            else {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
        ButtonHelpers.onButtonMouseLeave = function (event) {
            var buttonDiv = event.currentTarget;
            buttonDiv.classList.remove("toolbarButtonMouseHover");
            buttonDiv.classList.remove("toolbarButtonMouseDown");
        };
        ButtonHelpers.onButtonMouseUp = function (event) {
            var buttonDiv = event.currentTarget;
            buttonDiv.classList.remove("toolbarButtonMouseDown");
        };
        // Used for disabled handling
        ButtonHelpers.onButtonPress = function (event, clickHandler) {
            if (ButtonHelpers.isValidEvent(event)) {
                clickHandler(event);
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
        return ButtonHelpers;
    }());
    Common.ButtonHelpers = ButtonHelpers;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="control.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            // This ContentControl is a control that only allows a single child (content).
            var ContentControl = (function (_super) {
                __extends(ContentControl, _super);
                function ContentControl() {
                    _super.call(this);
                }
                Object.defineProperty(ContentControl.prototype, "content", {
                    get: function () { return this._content; },
                    set: function (newContent) {
                        if (this._content !== newContent) {
                            if (this._content) {
                                this.removeChild(this._content);
                            }
                            this._content = newContent;
                            this.appendChild(this._content);
                            this.onContentChanged();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                ContentControl.prototype.appendChild = function (child) {
                    if (this.rootElement.children.length !== 0) {
                        throw new Error("Only one child is allowed in a content control.");
                    }
                    _super.prototype.appendChild.call(this, child);
                };
                // overridable
                ContentControl.prototype.onContentChanged = function () {
                };
                return ContentControl;
            }(Legacy.Control));
            Legacy.ContentControl = ContentControl;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
    var CssUtilities = (function () {
        function CssUtilities() {
        }
        /**
         * Adds classes (and doesn't add duplicates)
         * @param originalClasses the original classes (space seperated) to add to
         * @param addClasses the classes (space seperated) to add
         * @return the original classes with the added additional classes
         */
        CssUtilities.addClasses = function (originalClasses, addClasses) {
            var newClasses = originalClasses ? originalClasses.split(" ") : [];
            var addList = addClasses ? addClasses.split(" ") : [];
            for (var i = 0; i < addList.length; i++) {
                if (newClasses.indexOf(addList[i]) === -1) {
                    newClasses.push(addList[i]);
                }
            }
            return newClasses.join(" ");
        };
        /**
         * Removes classes (does nothing if the class wasn't there)
         * @param originalClasses the original classes (space seperated) to remove from
         * @param removeClasses the classes (space seperated)  to remove
         * @return the original classes without the spcified classes to remove
         */
        CssUtilities.removeClasses = function (originalClasses, removeClasses) {
            var classes = originalClasses ? originalClasses.split(" ") : [];
            var removeList = removeClasses ? removeClasses.split(" ") : [];
            var newClasses = [];
            for (var i = 0; i < classes.length; i++) {
                if (removeList.indexOf(classes[i]) === -1) {
                    newClasses.push(classes[i]);
                }
            }
            return newClasses.join(" ");
        };
        return CssUtilities;
    }());
    Common.CssUtilities = CssUtilities;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="KeyCodes.ts" />
/// <reference path="control.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var DataListTextBox = (function (_super) {
                __extends(DataListTextBox, _super);
                function DataListTextBox(root) {
                    var _this = this;
                    _super.call(this, root);
                    this._idPostfix = DataListTextBox.GlobalIdPostfix++;
                    var dataListId = "textBoxDataList" + this._idPostfix;
                    this._inputElement = document.createElement("input");
                    this._inputElement.type = "text";
                    this._inputElement.setAttribute("list", dataListId);
                    this._inputElement.addEventListener("input", function (ev) { return _this.onInput(ev); });
                    this._inputElement.addEventListener("keydown", function (ev) { return _this.onKeydown(ev); });
                    this._inputElement.addEventListener("change", function (ev) { return _this.onChange(ev); });
                    this._dataListElement = document.createElement("datalist");
                    this._dataListElement.id = dataListId;
                    this._optionElements = null;
                    this.rootElement.appendChild(this._inputElement);
                    this.rootElement.appendChild(this._dataListElement);
                }
                Object.defineProperty(DataListTextBox.prototype, "items", {
                    get: function () {
                        return this._items;
                    },
                    set: function (value) {
                        this.clearItems();
                        this._optionElements = [];
                        for (var i = 0; i < value.length; ++i) {
                            var option = document.createElement("option");
                            option.text = value[i].text;
                            this._optionElements.push(option);
                            this._dataListElement.appendChild(option);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DataListTextBox.prototype, "text", {
                    get: function () { return this._inputElement.value; },
                    set: function (value) { this._inputElement.value = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DataListTextBox.prototype, "textChanged", {
                    get: function () { return this._valueChanged; },
                    set: function (handler) { this._valueChanged = handler; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DataListTextBox.prototype, "textCommitted", {
                    get: function () { return this._valueCommitted; },
                    set: function (handler) { this._valueCommitted = handler; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DataListTextBox.prototype, "focusableElement", {
                    get: function () { return this._inputElement; },
                    enumerable: true,
                    configurable: true
                });
                DataListTextBox.prototype.clearItems = function () {
                    if (this._optionElements) {
                        for (var i = 0; i < this._optionElements.length; ++i) {
                            this._dataListElement.removeChild(this._optionElements[i]);
                        }
                        this._optionElements = null;
                    }
                };
                DataListTextBox.prototype.onInput = function (ev) {
                    if (this.textChanged) {
                        this.textChanged(this.text);
                    }
                };
                DataListTextBox.prototype.onKeydown = function (ev) {
                    var _this = this;
                    if (ev.keyCode === Common.KeyCodes.Enter) {
                        // We want the commit to happen after all UI events have resolved
                        // (eg. datalist selection, etc)
                        window.setImmediate(function () {
                            if (_this.textCommitted) {
                                _this.textCommitted(_this.text);
                            }
                        });
                    }
                };
                DataListTextBox.prototype.onChange = function (ev) {
                    if (this.textCommitted) {
                        this.textCommitted(this.text);
                    }
                };
                DataListTextBox.GlobalIdPostfix = 1;
                return DataListTextBox;
            }(Legacy.Control));
            Legacy.DataListTextBox = DataListTextBox;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="assert.ts" />
var Common;
(function (Common) {
    "use strict";
    // This class allows fast access to get new HTML elements. When elements are not used they get
    // recycled and removed from the HTML tree. Also, only new elements are added to the container, 
    // thus reducing the number of times an element is added to the HTML tree.
    var ElementRecyclerFactory = (function () {
        function ElementRecyclerFactory(container, elementCreator) {
            this._container = container;
            this._elementCreator = elementCreator;
            this._index = null;
            this._elements = [];
            this._recycledElements = [];
        }
        // A convenient helper method to create an instance of ElementRecyclerFactory that creates
        // div elements with the given className.
        ElementRecyclerFactory.forDivWithClass = function (container, className) {
            return new ElementRecyclerFactory(container, function () {
                var element = document.createElement("div");
                element.className = className;
                return element;
            });
        };
        // Must be called before calling getNext
        ElementRecyclerFactory.prototype.start = function () {
            this._index = 0;
        };
        // Gets a new element. The returned element is already added to the parent container.
        // NOTE: start must be called first. When you are doing, call stop to recycle any unused elements.
        ElementRecyclerFactory.prototype.getNext = function () {
            F12.Tools.Utility.Assert.isTrue(this._index !== null, "Invalid operation. Method 'start' must be called before calling getNext.");
            var element = this._elements[this._index];
            if (!element) {
                if (this._recycledElements.length > 0) {
                    element = this._recycledElements.pop();
                }
                else {
                    element = this._elementCreator();
                }
                this._elements.push(element);
                this._container.appendChild(element);
            }
            this._index++;
            return element;
        };
        // Call this method when you finish getting all the needed elements. This ensures that any
        // unused element gets recycled.
        ElementRecyclerFactory.prototype.stop = function () {
            if (this._index === null) {
                return;
            }
            for (var i = this._elements.length - 1; i >= this._index; --i) {
                var element = this._elements.pop();
                this._recycledElements.push(element);
                this._container.removeChild(element);
            }
            this._index = null;
        };
        ElementRecyclerFactory.prototype.recycleAll = function () {
            for (var i = this._elements.length - 1; i >= 0; --i) {
                var element = this._elements.pop();
                this._recycledElements.push(element);
                this._container.removeChild(element);
            }
        };
        ElementRecyclerFactory.prototype.removeAll = function () {
            for (var i = this._elements.length - 1; i >= 0; --i) {
                var element = this._elements.pop();
                this._container.removeChild(element);
            }
            this._elements = [];
            this._recycledElements = [];
        };
        return ElementRecyclerFactory;
    }());
    Common.ElementRecyclerFactory = ElementRecyclerFactory;
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
    /**
     *  Class used to provide help with escaping user input
     */
    var EncodingUtilities = (function () {
        function EncodingUtilities() {
        }
        /**
         *  Escapes a string for use in a regular expression by prepending all regex special characters with a backslash
         *  A string input such as:
         *  bing.com/page.html?index=10#anchor
         *  Would become:
         *  bing\.com/page\.html\?index\=10#anchor
         *  @param value the string to escape
         *  @returns the escaped string
         */
        EncodingUtilities.escapeRegExp = function (value) {
            return String.prototype.replace.call(value, EncodingUtilities.ESCAPE_USER_INPUT_REGEX, "\\$&");
        };
        /**
         *  Escapes a string for use in a regular expression by prepending all regex special characters with a backslash
         *  except * which is prepended with '.'
         *  A string input such as:
         *  bing.com/*.html?index=10#anchor
         *  Would become:
         *  bing\.com/.*\.html\?index\=10#anchor
         *  @param value the string to escape
         *  @returns the escaped string
         */
        EncodingUtilities.escapeRegExpWithWildCard = function (value) {
            return String.prototype.replace.call(value, EncodingUtilities.ESCAPE_USER_INPUT_REGEX, function (match) {
                var newValue;
                if (match === "\*") {
                    newValue = ".*";
                }
                else {
                    newValue = "\\" + match;
                }
                return newValue;
            });
        };
        /**
         * Escapes a string so that it is wrapped in double quotes.
         * @param stringToWrap The javascript string that is to be escaped and wrapped in quotes
         * @return The escaped string
         */
        EncodingUtilities.wrapInQuotes = function (stringToWrap) {
            return "\"" + String.prototype.replace.call(stringToWrap, /\\"/g, "\"") + "\"";
        };
        /**
         * Restores an html escaped a string back to its default text values.
         * This only unescapes:
         *                    & " ' < >"
         * So any more complex unescape such as &#<value>; to invisible characters would need another function
         * @param htmlString The HTML escaped string that is to be restored
         * @return The restored text string
         */
        EncodingUtilities.unescapeHtml = function (htmlString) {
            // Ensure we have a string to escape
            if ((typeof htmlString) !== "string") {
                if (htmlString === null || htmlString === undefined) {
                    return "";
                }
                htmlString = "" + htmlString;
            }
            // Speed up the html escape by using chained regular expressions to decode html characters
            // Uses String.prototype to prevent a possible redefinition of "replace
            return (String.prototype.replace.call(String.prototype.replace.call(String.prototype.replace.call(String.prototype.replace.call(String.prototype.replace.call(htmlString, /&gt;/g, ">"), /&lt;/g, "<"), /&apos;/g, "'"), /&quot;/g, "\""), /&amp;/g, "&"));
        };
        /**
         * Escapes a string so that it can be safely displayed in html.
         * This only escapes:
         *                    & " ' < >"
         * So any more complex escape such as invisible character to &#<value>; would need another function
         * @param htmlString The javascript string that is to be HTML escaped
         * @return The escaped string
         */
        EncodingUtilities.escapeHtml = function (htmlString) {
            // Ensure we have a string to escape
            if ((typeof htmlString) !== "string") {
                if (htmlString === null || htmlString === undefined) {
                    return "";
                }
                htmlString = "" + htmlString;
            }
            // Speed up the html escape by using chained regular expressions to decode html characters
            // Uses String.prototype to prevent a possible redefinition of "replace
            return (String.prototype.replace.call(String.prototype.replace.call(String.prototype.replace.call(String.prototype.replace.call(String.prototype.replace.call(htmlString, /&/g, "&amp;"), /"/g, "&quot;"), /'/g, "&apos;"), /</g, "&lt;"), />/g, "&gt;"));
        };
        /**
         * RegEx used to escape special regex characters so that user input can be used in a regex match.
         */
        EncodingUtilities.ESCAPE_USER_INPUT_REGEX = /([.+?^=!:${}()|\[\]\/\\])|(\*)/g;
        return EncodingUtilities;
    }());
    Common.EncodingUtilities = EncodingUtilities;
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="control.ts" />
/// <reference path="Framework\Templating\ITemplateRepository.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            // This TemplateControl initializes the control from a template.
            var TemplateControl = (function (_super) {
                __extends(TemplateControl, _super);
                /**
                 * Constructor
                 * @param templateName The template name to load
                 * @param templateRepository The template repository to use to find the template, if not specified, the template will be loaded from the page
                 */
                function TemplateControl(templateName, templateRepository) {
                    _super.call(this);
                    // Assign the id postfix to use when fixing id's in the template
                    this._idPostfix = TemplateControl.GlobalIdPostfix++;
                    if (templateName) {
                        this.setTemplateFromName(templateName, templateRepository);
                    }
                }
                TemplateControl.prototype.setTemplateFromName = function (templateName, templateRepository) {
                    if (templateRepository) {
                        var htmlContent = templateRepository.getTemplateString(templateName);
                        this.setTemplateFromHTML(htmlContent);
                    }
                    else {
                        var root = this.getTemplateElementCopy(templateName);
                        this.adjustElementIds(root);
                        this.rootElement = root;
                    }
                };
                TemplateControl.prototype.setTemplateFromHTML = function (htmlContent) {
                    var root = this.getTemplateElementFromHTML(htmlContent);
                    this.adjustElementIds(root);
                    this.rootElement = root;
                };
                TemplateControl.prototype.findElement = function (id) {
                    var fullId = id + this._idPostfix;
                    return this.forAllSelfAndDescendants(this.rootElement, function (elem) {
                        if (elem.id && elem.id === fullId) {
                            return false;
                        }
                        return true;
                    });
                };
                TemplateControl.prototype.findElementsByClassName = function (className) {
                    var elements = [];
                    this.forAllSelfAndDescendants(this.rootElement, function (elem) {
                        if (elem.classList && elem.classList.contains(className)) {
                            elements.push(elem);
                        }
                        return true;
                    });
                    return elements;
                };
                TemplateControl.prototype.getTemplateElementCopy = function (templateName) {
                    var templateElement = document.getElementById(templateName);
                    if (!templateElement) {
                        throw new Error("Couldn't find the template with name: " + templateName);
                    }
                    if (templateElement.tagName.toLowerCase() !== "script") {
                        throw new Error("Expecting the template container to be a script element.");
                    }
                    return this.getTemplateElementFromHTML(templateElement.innerHTML);
                };
                TemplateControl.prototype.getTemplateElementFromHTML = function (htmlContent) {
                    var root = this.getTemplateRootElement();
                    root.innerHTML = htmlContent;
                    // If the template contains one child, use that as the root instead
                    if (root.childElementCount === 1) {
                        root = root.firstElementChild;
                    }
                    return root;
                };
                TemplateControl.prototype.getTemplateRootElement = function () {
                    var div = document.createElement("div");
                    div.style.width = div.style.height = "100%";
                    return div;
                };
                TemplateControl.prototype.adjustElementIds = function (root) {
                    // Postfix all id's with the new id
                    var idPostfix = this._idPostfix;
                    this.forAllSelfAndDescendants(root, function (elem) {
                        if (elem.id) {
                            elem.id = elem.id + idPostfix;
                        }
                        return true;
                    });
                };
                TemplateControl.prototype.forAllSelfAndDescendants = function (root, func) {
                    // <summary>Executes the given delegate on all the node and all its decendant elements. The callback function needs to return false to break the loop.</summary>
                    // <returns>The element at which the loop exit at, or null otherwise.</returns>
                    var brokeAtElement = null;
                    if (!func(root)) {
                        brokeAtElement = root;
                    }
                    else {
                        if (root.children) {
                            var children = root.children;
                            var childrenLength = children.length;
                            for (var i = 0; i < childrenLength; i++) {
                                brokeAtElement = this.forAllSelfAndDescendants(children[i], func);
                                if (brokeAtElement) {
                                    break;
                                }
                            }
                        }
                    }
                    return brokeAtElement;
                };
                TemplateControl.GlobalIdPostfix = 1;
                return TemplateControl;
            }(Common.Controls.Legacy.Control));
            Legacy.TemplateControl = TemplateControl;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="KeyCodes.ts" />
/// <reference path="templateControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            // Data model for a list box item
            var ListBoxItem = (function () {
                function ListBoxItem(value, text, info, itemClass) {
                    this.index = -1;
                    this.value = value;
                    this.text = text;
                    this.info = info || "";
                    this.itemClass = itemClass || "";
                }
                return ListBoxItem;
            }());
            Legacy.ListBoxItem = ListBoxItem;
            // ListBox control -- displays selectable, simple text based items in a
            // keyboard-navigable way.  Items themselves should be thought of as strings,
            // not having any complex embedded or additional behavior at all.
            var ListBox = (function (_super) {
                __extends(ListBox, _super);
                function ListBox(templateName, listItemElementType, listItemElementClass) {
                    var _this = this;
                    _super.call(this, templateName);
                    if (!templateName) {
                        this.setTemplateFromHTML("<ul class=\"listBox\"></ul>");
                    }
                    this.rootElement.setAttribute("tabindex", "0");
                    this.rootElement.setAttribute("role", "listbox");
                    this.rootElement.onkeydown = function (e) { return _this.onKeyDown(e); };
                    this._listItemElementType = listItemElementType || "li";
                    this._listItemElementClass = listItemElementClass || "";
                    this._listItemContainers = [];
                    this._selectedIndex = -1;
                    // Ensure we have an id that can be referenced by aria-owns, etc.
                    if (!this.rootElement.id) {
                        this.rootElement.id = ListBox.getUniqueID();
                    }
                }
                Object.defineProperty(ListBox.prototype, "selectedItemChanged", {
                    get: function () { return this._onSelectedItemChanged; },
                    set: function (value) {
                        this._onSelectedItemChanged = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "selectedIndexChanged", {
                    get: function () { return this._onSelectedIndexChanged; },
                    set: function (value) {
                        this._onSelectedIndexChanged = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "itemDoubleClicked", {
                    get: function () { return this._onItemDoubleClicked; },
                    set: function (value) {
                        this._onItemDoubleClicked = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "listItems", {
                    get: function () { return this._listItems; },
                    set: function (value) {
                        this.fireBuildListBoxStartEvent();
                        this.selectedIndex = -1;
                        this._listItems = [];
                        var itemIdx = 0;
                        if (value) {
                            for (; itemIdx < value.length; ++itemIdx) {
                                var item = value[itemIdx];
                                item.index = itemIdx; // it's useful if an item also knows its index
                                this._listItems.push(item);
                                if (itemIdx < this._listItemContainers.length) {
                                    this._listItemContainers[itemIdx].item = item;
                                    this._listItemContainers[itemIdx].rootElement.style.display = "list-item";
                                    this._listItemContainers[itemIdx].rootElement.removeAttribute("aria-hidden");
                                }
                                else {
                                    var itemContainer = this.createListItemContainer(item);
                                    this._listItemContainers.push(itemContainer);
                                    this.appendChild(itemContainer);
                                }
                            }
                        }
                        this.resetUnusedItems(itemIdx);
                        this.fireBuildListBoxEndEvent();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "listItemHeight", {
                    get: function () {
                        if (typeof this._listItemHeight === "undefined") {
                            if (this.listItems.length > 0) {
                                this._listItemHeight = this._listItemContainers[0].rootElement.offsetHeight;
                            }
                            else {
                                return ListBox.DEFAULT_LIST_ITEM_HEIGHT;
                            }
                        }
                        return this._listItemHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "itemContainers", {
                    // useful for unit tests and accessibility logic
                    get: function () { return this._listItemContainers; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "selectedIndex", {
                    get: function () { return this._selectedIndex; },
                    set: function (value) {
                        if (this._selectedIndex !== value) {
                            var oldIdx = this._selectedIndex;
                            this._selectedIndex = value;
                            if (oldIdx >= 0) {
                                var oldItem = this._listItemContainers[oldIdx];
                                oldItem.selected = false;
                            }
                            if (value >= 0 && value < this._listItemContainers.length) {
                                var newItem = this._listItemContainers[value];
                                newItem.selected = true;
                                if (value !== oldIdx) {
                                    if (this._onSelectedIndexChanged) {
                                        this._onSelectedIndexChanged(value);
                                    }
                                    if (this._onSelectedItemChanged) {
                                        this._onSelectedItemChanged(this._listItems[value]);
                                    }
                                }
                            }
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBox.prototype, "selectedItem", {
                    get: function () {
                        var i = this.selectedIndex;
                        if (i >= 0) {
                            return this._listItems[i];
                        }
                        return null;
                    },
                    set: function (value) {
                        var oldIdx = this.selectedIndex;
                        var newIdx = this._listItems.indexOf(value);
                        this.selectedIndex = newIdx;
                        // selectedIndex calls our event handler for us
                    },
                    enumerable: true,
                    configurable: true
                });
                ListBox.prototype.scrollIntoView = function (item, alignToTop) {
                    var index = this._listItems.indexOf(item);
                    if (index >= 0) {
                        // Find out if the element is already visible by testing its client rect on the document
                        var itemElement = this._listItemContainers[index].rootElement;
                        var rect = itemElement.getBoundingClientRect();
                        var topLeftCornerElement = document.elementFromPoint(rect.left + 1, rect.top + 1);
                        var bottomRightCornerElement = document.elementFromPoint(rect.right - 1, rect.bottom - 1);
                        // If both of these corner test elements are not our item element, it is either hidden or partially hidden
                        if (topLeftCornerElement !== itemElement || bottomRightCornerElement !== itemElement) {
                            this._listItemContainers[index].rootElement.scrollIntoView(alignToTop);
                        }
                    }
                };
                // Public for access by derived classes
                ListBox.prototype.createListItemContainer = function (item) {
                    return new ListBoxItemContainer(this, item, this._listItemElementType, this._listItemElementClass);
                };
                /** ETW helper -- override in derived classes */
                ListBox.prototype.fireBuildListBoxStartEvent = function () {
                    // NOOP
                };
                /** ETW helper -- override in derived classes */
                ListBox.prototype.fireBuildListBoxEndEvent = function () {
                    // NOOP
                };
                /** ETW helper -- override in derived classes */
                ListBox.prototype.fireResetListBoxStartEvent = function () {
                    // NOOP
                };
                /** ETW helper -- override in derived classes */
                ListBox.prototype.fireResetListBoxEndEvent = function () {
                    // NOOP
                };
                ListBox.getUniqueID = function () {
                    return "Common-Controls-Legacy-ListBox-" + ListBox.CurrentUniqueID++;
                };
                ListBox.prototype.resetUnusedItems = function (startingIndex) {
                    this.fireResetListBoxStartEvent();
                    for (var i = startingIndex; i < this._listItemContainers.length; ++i) {
                        this._listItemContainers[i].rootElement.style.display = "none";
                        this._listItemContainers[i].rootElement.setAttribute("aria-hidden", "true");
                        this._listItemContainers[i].item = null;
                    }
                    this.fireResetListBoxEndEvent();
                };
                ListBox.prototype.onKeyDown = function (e) {
                    var noKeys = !e.shiftKey && !e.ctrlKey && !e.altKey;
                    if (e.keyCode === Common.KeyCodes.ArrowUp && noKeys) {
                        if (this.selectedIndex > 0) {
                            this.selectedIndex--;
                            this.scrollIntoView(this.selectedItem, true);
                        }
                    }
                    else if (e.keyCode === Common.KeyCodes.ArrowDown && noKeys) {
                        if (this.selectedIndex < (this._listItemContainers.length - 1)) {
                            this.selectedIndex++;
                            this.scrollIntoView(this.selectedItem, false);
                        }
                    }
                };
                ListBox.DEFAULT_LIST_ITEM_HEIGHT = 10;
                ListBox.CurrentUniqueID = 0;
                return ListBox;
            }(Legacy.TemplateControl));
            Legacy.ListBox = ListBox;
            // View container for a list box item
            var ListBoxItemContainer = (function (_super) {
                __extends(ListBoxItemContainer, _super);
                function ListBoxItemContainer(owner, item, elementType, elementClass) {
                    var _this = this;
                    _super.call(this, document.createElement(elementType));
                    this._owner = owner;
                    this._item = item;
                    this.rootElement.innerText = item.text;
                    this.rootElement.value = item.value;
                    if (item.itemClass && item.itemClass.length > 0) {
                        this.rootElement.classList.add(item.itemClass);
                    }
                    if (elementClass !== "") {
                        this.rootElement.classList.add(elementClass);
                    }
                    this.rootElement.onmouseover = function () {
                        if (_this._item && _this._item.info) {
                            Microsoft.Plugin.Tooltip.show({ content: _this._item.info });
                        }
                        return true;
                    };
                    this.rootElement.setAttribute("role", "option");
                    this.rootElement.onmousedown = function (e) { return _this.onMouseDown(e); };
                    this.rootElement.onclick = function (e) { return _this.onMouseDown(e); };
                    this.rootElement.ondblclick = function (e) { return _this.onDoubleClicked(e); };
                    // Ensure there is an id that can be referenced by aria-activeDescendant.
                    if (!this.rootElement.getAttribute("id")) {
                        this.rootElement.setAttribute("id", ListBoxItemContainer.getUniqueID());
                    }
                }
                Object.defineProperty(ListBoxItemContainer.prototype, "selectedChanged", {
                    get: function () { return this._onSelectChanged; },
                    set: function (value) {
                        this._onSelectChanged = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBoxItemContainer.prototype, "selected", {
                    get: function () { return this._selected; },
                    set: function (value) {
                        var selectedChanged = value !== this._selected;
                        this._selected = value;
                        if (selectedChanged) {
                            if (value) {
                                this.rootElement.setAttribute("selected", "selected");
                                this.rootElement.setAttribute("aria-selected", "true");
                                this._owner.selectedItem = this._item;
                            }
                            else {
                                this.rootElement.removeAttribute("selected");
                                this.rootElement.removeAttribute("aria-selected");
                            }
                        }
                        if (this._onSelectChanged && selectedChanged) {
                            this._onSelectChanged(value);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListBoxItemContainer.prototype, "item", {
                    get: function () { return this._item; },
                    set: function (value) {
                        if (value) {
                            this._item = value;
                            this.rootElement.firstChild.nodeValue = this._item.text;
                            this.rootElement.setAttribute("aria-label", this._item.text);
                        }
                        else {
                            this._item = null;
                            this.rootElement.firstChild.nodeValue = "";
                            this.rootElement.removeAttribute("aria-label");
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                ListBoxItemContainer.getUniqueID = function () {
                    return "Common-Controls-Legacy-ListBoxItemContainer-" + ListBoxItemContainer.CurrentUniqueID++;
                };
                ListBoxItemContainer.prototype.onMouseDown = function (e) {
                    this.selected = true;
                    this._owner.rootElement.focus();
                };
                ListBoxItemContainer.prototype.onDoubleClicked = function (e) {
                    this.selected = true;
                    this._owner.rootElement.focus();
                    if (this._owner.itemDoubleClicked) {
                        this._owner.itemDoubleClicked(this._item);
                    }
                };
                ListBoxItemContainer.CurrentUniqueID = 0;
                ListBoxItemContainer.CONTENT_ELEMENT_ID = "content";
                return ListBoxItemContainer;
            }(Legacy.Control));
            Legacy.ListBoxItemContainer = ListBoxItemContainer;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="mInterfaces.ts" />
// A private class intended for use by the $m() factory function.  Albeit indirectly used by $m().
/// <disable code="SA1300" />
var $mNode = (function () {
    function $mNode(node) {
        this.length = 1;
        this._node = node;
    }
    $mNode.prototype.get = function () {
        return this._node;
    };
    $mNode.prototype.is = function (s) {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.is(s: string) : boolean - can only be called on HTML elements";
        }
        var element = this._node;
        if (s === ":hidden") {
            return element.style.display === "none";
        }
        else if (s === ":visible") {
            return element.style.display !== "none";
        }
        throw "$mNode.is(s: string) : boolean - can only be called with :hidden or :visible";
    };
    $mNode.prototype.hide = function () {
        if (!(this._node instanceof HTMLElement) && !(this._node instanceof SVGElement)) {
            throw "$mNode.hide(): IQueryNode - can only be called on HTML or SVG elements";
        }
        var element = this._node;
        element.style.display = "none";
        return this;
    };
    $mNode.prototype.show = function () {
        if (!(this._node instanceof HTMLElement) && !(this._node instanceof SVGElement)) {
            throw "$mNode.show(): IQueryNode - can only be called on HTML or SVG elements";
        }
        var element = this._node;
        element.style.display = "";
        var style = (element.ownerDocument).parentWindow.getComputedStyle(element);
        var display = style.display;
        if (display === "none") {
            element.style.display = "block";
        }
        return this;
    };
    $mNode.prototype.placeholder = function (s) {
        if (!(this._node instanceof HTMLInputElement)) {
            throw "$mNode.placeholder(s: string): IQueryNode - can only be called on HTMLInput elements";
        }
        var element = this._node;
        element.placeholder = s;
        return this;
    };
    $mNode.prototype.focus = function () {
        var element = this._node;
        element.focus();
        return this;
    };
    $mNode.prototype.scrollTop = function (value) {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.scrollTop(value?: number): number - can only be called on HTML elements";
        }
        var element = this._node;
        if (value !== undefined) {
            return element.scrollTop;
        }
        element.scrollTop = value;
        return value;
    };
    $mNode.prototype.addClass = function (className) {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.addClass(className: string) - can only be called on HTML elements";
        }
        var element = this._node;
        if (!element.classList.contains(className)) {
            element.classList.add(className);
        }
    };
    $mNode.prototype.removeClass = function (className) {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.removeClass(className: string) - can only be called on HTML elements";
        }
        var element = this._node;
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        }
    };
    $mNode.prototype.hasClass = function (className) {
        if (!(this._node instanceof HTMLElement)) {
            return false;
        }
        var element = this._node;
        return element.classList && element.classList.contains(className);
    };
    $mNode.prototype.scrollLeft = function (value) {
        if (!(this._node instanceof Element)) {
            throw "$mNode.scrollLeft(value?: number): number - can only be called on Elements";
        }
        var element = this._node;
        if (value !== undefined) {
            return element.scrollLeft;
        }
        element.scrollLeft = value;
        return value;
    };
    $mNode.prototype.data = function (key, value) {
        var data = this._node[$mNode.DATA_KEY];
        if (!data) {
            this._node[$mNode.DATA_KEY] = data = {};
        }
        if (key === undefined) {
            return data;
        }
        if (value !== undefined) {
            data[key] = value;
        }
        else {
            return data[key];
        }
        return data;
    };
    $mNode.prototype.attr = function (attributeName) {
        if (!(this._node instanceof Element)) {
            throw "$mNode.attr(attributeName: string): string - can only be called on Elements";
        }
        var element = this._node;
        var result = element[attributeName];
        if (result === undefined) {
            result = element.getAttribute(attributeName);
        }
        return result === null ? undefined : result;
    };
    $mNode.prototype.removeAttr = function (attributeName) {
        if (!(this._node instanceof Element)) {
            throw "$mNode.removeAttr(attributeName: string): string - can only be called on Elements";
        }
        var element = this._node;
        element.removeAttribute(attributeName);
    };
    $mNode.prototype.matchAttr = function (attributeName, value) {
        if (!(this._node instanceof Element)) {
            throw "$mNode.matchAttr(attributeName: string, value: string) - can only be called on Elements";
        }
        var element = this._node;
        return element.getAttribute(attributeName) === value;
    };
    $mNode.prototype.setAttr = function (attributeName, setValue) {
        if (!(this._node instanceof Element)) {
            throw "$mNode.setAttr(attributeName: string, setValue: any): void - can only be called on Elements";
        }
        var element = this._node;
        element.setAttribute(attributeName, setValue);
    };
    $mNode.prototype.parent = function (s) {
        if (!(this._node instanceof HTMLElement)) {
            return;
        }
        var parentNode = this._node.parentNode;
        return s === undefined || parentNode.classList.contains(s) ? new $mNode(parentNode) : undefined;
    };
    $mNode.prototype.parents = function (s) {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.parents(s: string): IQueryNode - can only be called on HTML elements";
        }
        var node = this._node;
        var results = [];
        while (node.parentNode instanceof HTMLElement) {
            var node = node.parentNode;
            if (node.classList.contains(s)) {
                results.push(new $mNode(node));
            }
        }
        return results;
    };
    $mNode.prototype.text = function (s) {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.text(s?: string): string - can only be called on HTML elements";
        }
        var element = this._node;
        if (s === undefined) {
            return element.innerText;
        }
        element.innerText = s;
        return s;
    };
    $mNode.prototype.html = function (htmlString) {
        // CAUTION: no validation of the htmlString is performed.  Malformed html can cause issues.
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.html(htmlString?: string): string - can only be called on HTML elements";
        }
        var element = this._node;
        if (htmlString === undefined) {
            return element.innerHTML;
        }
        element.innerHTML = htmlString;
        return htmlString;
    };
    $mNode.prototype.remove = function () {
        if (this._node.parentNode) {
            this._node.parentNode.removeChild(this._node);
        }
    };
    $mNode.prototype.prepend = function (node) {
        this._node.insertBefore(node, this._node.firstChild);
    };
    $mNode.prototype.append = function (node) {
        this._node.appendChild(node);
    };
    $mNode.prototype.replaceWith = function (node) {
        var parent = this._node.parentNode;
        if (parent) {
            var nextSibling = this._node.nextSibling;
            parent.removeChild(this._node);
            var replacement = node._node;
            if (nextSibling) {
                parent.insertBefore(replacement, nextSibling);
            }
            else {
                parent.appendChild(replacement);
            }
        }
    };
    $mNode.prototype.select = function () {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.select() - can only be called on HTML elements";
        }
        var element = this._node;
        element.select();
    };
    $mNode.prototype.val = function (s) {
        if (!(this._node instanceof HTMLInputElement)) {
            throw "$mNode.val(): string - can only be called on HTMLInput elements";
        }
        var element = this._node;
        if (s === undefined) {
            var value = element.value;
            if (typeof value === "string") {
                return value.replace(/\r/g, "");
            }
            if (value === undefined || value === null) {
                return "";
            }
            return value;
        }
        element.value = s;
    };
    $mNode.prototype.closest = function (classes) {
        var element = this._node;
        while (element) {
            if (element.classList) {
                for (var i = 0; i < classes.length; i++) {
                    if (element.classList.contains(classes[i])) {
                        return new $mNode(element);
                    }
                }
            }
            element = element.parentNode;
        }
    };
    $mNode.prototype.css = function (keyOrMap, value) {
        if (keyOrMap && typeof keyOrMap === "object") {
            var map = keyOrMap;
            for (var key in map) {
                this.css(key, map[key]);
            }
        }
        else {
            var styleKey = keyOrMap;
            var element = this._node;
            if (value !== undefined) {
                element.style[styleKey] = value;
            }
            return element.style ? element.style[styleKey] : undefined;
        }
    };
    $mNode.prototype.click = function () {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.click(): IQueryNode - can only be called on HTML elements";
        }
        var element = this._node;
        element.click();
        return this;
    };
    $mNode.prototype.dblclick = function () {
        if (!(this._node instanceof HTMLElement)) {
            throw "$mNode.dblclick(): IQueryNode - can only be called on HTML elements";
        }
        var element = this._node;
        element.fireEvent("ondblclick");
    };
    $mNode.prototype.changeEventBinding = function (isBind, target, event, fn, arg) {
        var element = this._node;
        var name = "on" + event;
        var oldBinding = element[name];
        var newBinding;
        var currentFuncs = oldBinding && oldBinding.boundFuncList ? oldBinding.boundFuncList : [];
        var index;
        if (isBind) {
            currentFuncs.push(fn);
        }
        else if (fn) {
            index = currentFuncs.indexOf(fn);
            if (index >= 0) {
                currentFuncs.splice(index, 1);
            }
        }
        else {
            currentFuncs = [];
        }
        if (currentFuncs.length) {
            if (target === undefined) {
                target = element;
            }
            newBinding = function (e) {
                var i;
                var bubble = true;
                e.target = target;
                for (i = 0; i < currentFuncs.length; i++) {
                    var result = currentFuncs[i].call(target, e, arg);
                    if (!result && typeof result === "boolean") {
                        e.preventDefault();
                        e.stopPropagation();
                        bubble = false;
                    }
                }
                return bubble;
            };
            newBinding.boundFuncList = currentFuncs;
        }
        element[name] = newBinding;
        return this;
    };
    $mNode.prototype.triggerEvent = function (event, extra) {
        var element = this._node;
        var trigger = element[event];
        if (trigger) {
            trigger.call(element, {}, extra);
        }
        return this;
    };
    $mNode.prototype.changeSpecialBinding = function (isBind, target, event, fn, arg) {
        var element = this._node;
        var key = $mNode.BINDING_KEY + event;
        element[key] = isBind ? fn : undefined;
        return this;
    };
    $mNode.prototype.triggerSpecial = function (event, extra) {
        var element = this._node;
        var key = $mNode.BINDING_KEY + event;
        var trigger = element[key];
        if (trigger) {
            trigger.call(element, {}, extra);
        }
        return this;
    };
    $mNode.prototype.position = function () {
        var element = this._node;
        var position = {
            top: element.offsetTop,
            left: element.offsetLeft
        };
        return position;
    };
    $mNode.prototype.height = function () {
        var element = this._node;
        // bounding client rect includes padding and border, but not margin
        var height = element.getBoundingClientRect().height;
        var compStyle = window.getComputedStyle(element, null);
        height -= parseInt(compStyle.paddingTop, 10);
        height -= parseInt(compStyle.paddingBottom, 10);
        height -= parseInt(compStyle.borderTopWidth, 10);
        height -= parseInt(compStyle.borderBottomWidth, 10);
        return height;
    };
    $mNode.prototype.outerHeight = function (includeMargin) {
        var element = this._node;
        // bounding client rect includes padding and border, but not margin
        var outerHeight = element.getBoundingClientRect().height;
        if (includeMargin) {
            var compStyle = window.getComputedStyle(element, null);
            outerHeight += parseInt(compStyle.marginTop, 10);
            outerHeight += parseInt(compStyle.marginBottom, 10);
        }
        return outerHeight;
    };
    $mNode.prototype.width = function () {
        var element = this._node;
        // bounding client rect includes padding and border, but not margin
        var width = element.getBoundingClientRect().width;
        var compStyle = window.getComputedStyle(element, null);
        width -= parseInt(compStyle.paddingLeft, 10);
        width -= parseInt(compStyle.paddingRight, 10);
        width -= parseInt(compStyle.borderLeftWidth, 10);
        width -= parseInt(compStyle.borderRightWidth, 10);
        return width;
    };
    $mNode.prototype.outerWidth = function (includeMargin) {
        var element = this._node;
        // bounding client rect includes padding and border, but not margin
        var outerWidth = element.getBoundingClientRect().width;
        if (includeMargin) {
            var compStyle = window.getComputedStyle(element, null);
            outerWidth += parseInt(compStyle.marginLeft, 10);
            outerWidth += parseInt(compStyle.marginRight, 10);
        }
        return outerWidth;
    };
    /// <enable code="SA1300" />
    $mNode.BINDING_KEY = "$BPT$Binding$";
    $mNode.DATA_KEY = "$BPT$QueryData$";
    return $mNode;
}());
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="mInterfaces.ts" />
/// <reference path="mNode.ts" />
"use strict";
// A private class intended for use by the $m() factory function.
/// <disable code="SA1300" />
var $mList = (function () {
    function $mList(selector, nodeListOrNode) {
        this.selector = selector;
        if (nodeListOrNode === null) {
            this._array = [];
        }
        else if (nodeListOrNode.length !== undefined) {
            this._array = [];
            var nodeList = nodeListOrNode;
            var len = nodeList.length;
            for (var i = 0; i < len; i++) {
                this._array.push(new $mNode(nodeList[i]));
            }
        }
        else {
            this._array = [new $mNode(nodeListOrNode)];
        }
    }
    Object.defineProperty($mList.prototype, "length", {
        get: function () {
            return this._array.length;
        },
        enumerable: true,
        configurable: true
    });
    $mList.prototype.is = function (s) {
        if (s === ":hidden") {
            // It is hidden if display is set to none on all things in the list
            for (var i = 0; i < this.length; i++) {
                if (!this._array[i].is(":hidden")) {
                    return false;
                }
            }
            return true;
        }
        if (s === ":visible") {
            return !this.is(":hidden");
        }
        throw "$mNode.is(s: string) : boolean - can only be called with :hidden or :visible";
    };
    $mList.prototype.scrollTop = function (value) {
        if (this.length === 0) {
            return;
        }
        return this._array[0].scrollTop();
    };
    $mList.prototype.scrollLeft = function (value) {
        if (this.length === 0) {
            return;
        }
        return this._array[0].scrollLeft();
    };
    $mList.prototype.data = function (key, value) {
        if (this.length === 0) {
            return;
        }
        return this._array[0].data(key, value);
    };
    $mList.prototype.attr = function (attributeName, setValue) {
        if (this.length === 0) {
            return;
        }
        if (setValue !== undefined) {
            for (var i = 0; i < this.length; i++) {
                this._array[i].setAttr(attributeName, setValue);
            }
            return this;
        }
        else {
            return this._array[0].attr(attributeName);
        }
    };
    $mList.prototype.removeAttr = function (attributeName) {
        for (var i = 0; i < this.length; i++) {
            this._array[i].removeAttr(attributeName);
        }
        return this;
    };
    $mList.prototype.matchAttr = function (attributeName, value) {
        // Non-mutating.  Returns a new $mList.
        var result = new $mList(this.selector + " → matchAttr", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var node = this._array[i];
            if (node.matchAttr(attributeName, value)) {
                result.push(node);
            }
        }
        return result;
    };
    $mList.prototype.addClass = function (className) {
        for (var i = 0; i < this.length; i++) {
            this._array[i].addClass(className);
        }
        return this;
    };
    $mList.prototype.removeClass = function (s) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].removeClass(s);
        }
        return this;
    };
    $mList.prototype.hasClass = function (className) {
        for (var i = 0; i < this.length; i++) {
            if (this._array[i].hasClass(className)) {
                return true;
            }
        }
        return false;
    };
    $mList.prototype.hide = function () {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].hide();
        }
        return this;
    };
    $mList.prototype.show = function () {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].show();
        }
        return this;
    };
    $mList.prototype.placeholder = function (s) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].placeholder(s);
        }
        return this;
    };
    $mList.prototype.focus = function () {
        if (this.length >= 1) {
            this._array[0].focus();
        }
        return this;
    };
    $mList.prototype.text = function (s) {
        if (s === undefined) {
            if (this.length > 0) {
                return this._array[0].text();
            }
            return;
        }
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].text(s);
        }
        return this;
    };
    $mList.prototype.html = function (htmlString) {
        if (htmlString === undefined) {
            if (this.length > 0) {
                return this._array[0].html();
            }
            return;
        }
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].html(htmlString);
        }
        return this;
    };
    $mList.prototype.each = function (fn) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            fn.call(this._array[i].get(), i, this._array[i].get());
        }
    };
    $mList.prototype.parent = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (s !== undefined) {
            if (!$mList.isClassSelector(s)) {
                return;
            }
            s = s.substr(1);
        }
        var result = new $mList(this.selector + " → parent", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var parent = this._array[i].parent(s);
            if (parent) {
                result.push(parent);
            }
        }
        return result;
    };
    $mList.prototype.parents = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (!$mList.isClassSelector(s)) {
            return;
        }
        s = s.substr(1);
        var result = new $mList(this.selector + " → parents", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var subResult = this._array[i].parents(s);
            if (subResult && subResult.length) {
                for (var j = 0; j < subResult.length; j++) {
                    result.push(subResult[j]);
                }
            }
        }
        return result;
    };
    $mList.prototype.children = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (s !== undefined) {
            if (!$mList.isClassSelector(s)) {
                return;
            }
            s = s.substr(1);
        }
        var result = new $mList(this.selector + " → children", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var element = this._array[i].get();
            var sibling = element.firstChild;
            while (sibling) {
                if (sibling.nodeType === 1) {
                    var node = new $mNode(sibling);
                    if (s === undefined || node.hasClass(s)) {
                        result.push(node);
                    }
                }
                sibling = sibling.nextSibling;
            }
        }
        return result;
    };
    $mList.prototype.siblings = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (s !== undefined) {
            if (!$mList.isClassSelector(s)) {
                return;
            }
            s = s.substr(1);
        }
        var result = new $mList(this.selector + " → siblings", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var thisChild = this._array[i].get();
            var element = this._array[i].get().parentNode;
            var sibling = element.firstChild;
            while (sibling) {
                if (sibling.nodeType === 1 && sibling !== thisChild) {
                    var node = new $mNode(sibling);
                    if (s === undefined || node.hasClass(s)) {
                        result.push(node);
                    }
                }
                sibling = sibling.nextSibling;
            }
        }
        return result;
    };
    $mList.prototype.next = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (s !== undefined) {
            if (!$mList.isClassSelector(s)) {
                return;
            }
            s = s.substr(1);
        }
        var result = new $mList(this.selector + " → next", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var child = this._array[i].get().nextSibling;
            while (child) {
                var node = new $mNode(child);
                if (s === undefined || node.hasClass(s)) {
                    result.push(node);
                    return result;
                }
                child = child.nextSibling;
            }
        }
        return result;
    };
    $mList.prototype.prev = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (s !== undefined) {
            if (!$mList.isClassSelector(s)) {
                return;
            }
            s = s.substr(1);
        }
        var result = new $mList(this.selector + " → prev", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var child = this._array[i].get().previousSibling;
            while (child) {
                var node = new $mNode(child);
                if (s === undefined || node.hasClass(s)) {
                    result.push(node);
                    return result;
                }
                child = child.previousSibling;
            }
        }
        return result;
    };
    $mList.prototype.appendTo = function (item) {
        if (item.length === 1) {
            var len = this.length;
            var parent = item.get(0);
            for (var i = 0; i < len; i++) {
                parent.appendChild(this.get(i));
            }
        }
        return this;
    };
    $mList.prototype.after = function (item) {
        if (item.length > 0) {
            var len = this.length;
            for (var i = 0; i < len; i++) {
                var child = this.get(i);
                var parent = child.parentNode;
                if (child.nextSibling) {
                    for (var j = 0; j < item.length; j++) {
                        parent.insertBefore(item.get(j), child.nextSibling);
                    }
                }
                else {
                    for (var j = 0; j < item.length; j++) {
                        parent.appendChild(item.get(j));
                    }
                }
            }
        }
        return this;
    };
    $mList.prototype.not = function (s) {
        // Non-mutating.  Returns a new $mList.
        if (!$mList.isClassSelector(s)) {
            return;
        }
        s = s.substr(1);
        var result = new $mList(this.selector + " → not", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var node = this._array[i];
            if (!node.hasClass(s)) {
                result.push(node);
            }
        }
        return result;
    };
    $mList.prototype.slice = function (start, end) {
        // Non-mutating.  Returns a new $mList.
        var result = new $mList(this.selector + " → slice", null);
        var len = this.length;
        if (typeof end === "undefined" || end > len) {
            end = len;
        }
        for (var i = start; i < end; i++) {
            var node = this._array[i];
            result.push(node);
        }
        return result;
    };
    $mList.prototype.closest = function (s) {
        // Currently only supports looking for a class.
        var classes = s.split(/[ ,]+/);
        for (var classIndex = 0; classIndex < classes.length; classIndex++) {
            if (!$mList.isClassSelector(classes[classIndex])) {
                return;
            }
            classes[classIndex] = classes[classIndex].substr(1);
        }
        // Non-mutating.  Returns a new $mList.
        var result = new $mList(this.selector + " → closest", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var element = this._array[i].closest(classes);
            if (element) {
                result.push(element);
            }
        }
        return result;
    };
    $mList.prototype.find = function (subselector) {
        // The jQuery immediate children subselector is not supported...
        //   find("> div")
        // ... to find the immediate children that are <div> nodes.
        // If/when there is a use case for it, then it will need to be implemented.
        //
        // Non-mutating.  Returns a new $mList.
        var result = new $mList(this.selector + " → find", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var element = this._array[i].get();
            var nodeList = element.querySelectorAll(subselector);
            if (nodeList) {
                for (var j = 0, nodeListLen = nodeList.length; j < nodeListLen; j++) {
                    result.push(new $mNode(nodeList[j]));
                }
            }
        }
        return result;
    };
    $mList.prototype.remove = function () {
        // Non-mutating.  Returns an empty new $mList.
        var result = new $mList(this.selector + " → remove", null);
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].remove();
        }
        return result;
    };
    $mList.prototype.prepend = function (item) {
        if (item.length > 0) {
            var len = this.length;
            for (var i = 0; i < len; i++) {
                for (var j = item.length - 1; j >= 0; j--) {
                    this._array[i].prepend(item._array[j].get());
                }
            }
        }
        return this;
    };
    $mList.prototype.append = function (item) {
        if (item.length > 0) {
            var len = this.length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < item.length; j++) {
                    this._array[i].append(item._array[j].get());
                }
            }
        }
        return this;
    };
    $mList.prototype.appendText = function (s) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var child = this._array[i];
            child.append(document.createTextNode(s));
        }
        return this;
    };
    $mList.prototype.replaceWith = function (item) {
        var len = this.length;
        if (len > 0 && item.length === 1) {
            for (var i = 0; i < len; i++) {
                this._array[i].replaceWith(item._array[0]);
            }
        }
        return this;
    };
    $mList.prototype.select = function () {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].select();
        }
        return this;
    };
    $mList.prototype.val = function (s) {
        var len = this.length;
        if (s !== undefined) {
            for (var i = 0; i < len; i++) {
                this._array[i].val(s);
            }
            return this;
        }
        if (len === 0) {
            return;
        }
        return this._array[0].val(s);
    };
    $mList.prototype.css = function (keyOrMap, value) {
        var len = this.length;
        if (value !== undefined) {
            for (var i = 0; i < len; i++) {
                this._array[i].css(keyOrMap, value);
            }
            return this;
        }
        if (len === 0) {
            return;
        }
        return this._array[0].css(keyOrMap);
    };
    $mList.prototype.click = function () {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].click();
        }
        return this;
    };
    $mList.prototype.dblclick = function () {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            this._array[i].dblclick();
        }
        return this;
    };
    $mList.prototype.bindTarget = function (target, events, fn, arg) {
        return this.changeBinding(target, true, events, fn, arg);
    };
    $mList.prototype.bind = function (events, fn, arg) {
        return this.changeBinding(undefined, true, events, fn, arg);
    };
    $mList.prototype.unbind = function (events, fn) {
        return this.changeBinding(undefined, false, events, fn);
    };
    $mList.prototype.trigger = function (events, extra) {
        var eventList = events.split(" ");
        var len = this.length;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < eventList.length; j++) {
                var event = eventList[j];
                if ($mList.DomEvents.indexOf(event) >= 0) {
                    this._array[i].triggerEvent(event, extra);
                }
                else {
                    this._array[i].triggerSpecial(event, extra);
                }
            }
        }
        return this;
    };
    $mList.prototype.get = function (n) {
        if (n < 0) {
            n = n + this.length;
        }
        if (n >= this.length || n < 0) {
            return null;
        }
        return this._array[n].get();
    };
    $mList.prototype.first = function () {
        // Non-mutating.  Returns a new $mList.
        var result = new $mList(this.selector + " → first", null);
        if (this.length > 0) {
            result.push(this._array[0]);
        }
        return result;
    };
    $mList.prototype.last = function () {
        // Non-mutating.  Returns a new $mList.
        var result = new $mList(this.selector + " → last", null);
        if (this.length > 0) {
            result.push(this._array[this.length - 1]);
        }
        return result;
    };
    $mList.prototype.position = function () {
        var len = this.length;
        if (len > 0) {
            return this._array[0].position();
        }
        return;
    };
    $mList.prototype.height = function () {
        var len = this.length;
        if (len > 0) {
            return this._array[0].height();
        }
        return;
    };
    $mList.prototype.outerHeight = function (includeMargin) {
        var len = this.length;
        if (len > 0) {
            return this._array[0].outerHeight(includeMargin);
        }
        return;
    };
    $mList.prototype.width = function () {
        var len = this.length;
        if (len > 0) {
            return this._array[0].width();
        }
        return;
    };
    $mList.prototype.outerWidth = function (includeMargin) {
        var len = this.length;
        if (len > 0) {
            return this._array[0].outerWidth(includeMargin);
        }
        return;
    };
    $mList.isClassSelector = function (selector) {
        if (selector[0] !== ".") {
            // Only supports class names right now.
            return false;
        }
        if (selector.indexOf(",") !== -1) {
            // Only supports a single class names right now.
            return false;
        }
        if (selector.indexOf("#") !== -1) {
            // Does not support an id.
            return false;
        }
        if (selector.indexOf(">") !== -1) {
            // Does not support fancy selectors.
            return false;
        }
        if (selector.indexOf(" ") !== -1) {
            // Does not support fancy selectors.
            return false;
        }
        if (selector.indexOf("[") !== -1) {
            // Does not support fancy selectors.
            return false;
        }
        return true;
    };
    // For use by non-mutating methods that return a new $mList.
    $mList.prototype.push = function (mNode) {
        this._array.push(mNode);
    };
    $mList.prototype.changeBinding = function (target, isBind, events, fn, arg) {
        var eventList = events.split(" ");
        var len = this.length;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < eventList.length; j++) {
                var event = eventList[j];
                if ($mList.DomEvents.indexOf(event) >= 0) {
                    this._array[i].changeEventBinding(isBind, target, event, fn, arg);
                }
                else {
                    this._array[i].changeSpecialBinding(isBind, target, event, fn, arg);
                }
            }
        }
        return this;
    };
    $mList.DomEvents = [
        // mouse events
        "click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu",
        // focus events
        "focus", "blur", "focusin", "focusout",
        // keyboard events
        "keydown", "keyup", "keypress",
        // form events
        "change", "reset", "select", "submit"
    ];
    return $mList;
}());
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="mInterfaces.ts" />
/// <reference path="mList.ts" />
function $m(arg) {
    if (typeof arg === "string") {
        var matches = arg.match(/<(\w+?)>/);
        if (matches) {
            return new $mList("", document.createElement(matches[1]));
        }
        else {
            var list;
            list = document.querySelectorAll(arg);
            return new $mList(arg, list);
        }
    }
    // Assuming the arg is either a NodeList or an Element.
    return new $mList("", arg);
}
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
var Common;
(function (Common) {
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    var PromiseHelper = (function () {
        function PromiseHelper() {
        }
        Object.defineProperty(PromiseHelper, "promiseWrapper", {
            get: function () {
                var promiseWrapper = {
                    completeHandler: null,
                    errorHandler: null,
                    promise: null
                };
                var promiseInitialization = function (completed, error) {
                    promiseWrapper.completeHandler = completed;
                    promiseWrapper.errorHandler = error;
                };
                promiseWrapper.promise = new Microsoft.Plugin.Promise(promiseInitialization);
                return promiseWrapper;
            },
            enumerable: true,
            configurable: true
        });
        PromiseHelper.getPromiseSuccess = function (result) {
            var promiseWrapper = PromiseHelper.promiseWrapper;
            PromiseHelper.safeInvokePromise(promiseWrapper.completeHandler, result);
            return promiseWrapper.promise;
        };
        PromiseHelper.getPromiseError = function (result) {
            var promiseWrapper = PromiseHelper.promiseWrapper;
            PromiseHelper.safeInvokePromise(promiseWrapper.errorHandler, result);
            return promiseWrapper.promise;
        };
        PromiseHelper.safeInvokePromise = function (callback, response) {
            try {
                callback(response);
            }
            catch (e) {
                this.logError(e.toString());
            }
        };
        Object.defineProperty(PromiseHelper, "logger", {
            get: function () {
                if (!PromiseHelper._logger) {
                    PromiseHelper._logger = DiagnosticsHub.getLogger();
                }
                return PromiseHelper._logger;
            },
            enumerable: true,
            configurable: true
        });
        PromiseHelper.logError = function (error) {
            PromiseHelper.logger.error(PromiseHelper.LoggerPrefixText + error);
        };
        PromiseHelper.LoggerPrefixText = "R2LControl: ";
        return PromiseHelper;
    }());
    Common.PromiseHelper = PromiseHelper;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="control.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var RadioButton = (function (_super) {
                __extends(RadioButton, _super);
                function RadioButton(element) {
                    var _this = this;
                    _super.call(this, element);
                    this._radioButtonElement = this.rootElement;
                    // Maintain a list of radio buttons in order to 
                    // support an un-checked aria state for each of them
                    RadioButton.RadioButtons.push(this);
                    this.rootElement.addEventListener("click", function (e) { return _this.onCheck(e); });
                    this.updateAriaProperties();
                }
                Object.defineProperty(RadioButton.prototype, "check", {
                    get: function () { return this._onCheck; },
                    set: function (value) {
                        this._onCheck = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RadioButton.prototype, "checked", {
                    get: function () { return this._radioButtonElement.checked; },
                    set: function (value) {
                        this._radioButtonElement.checked = value;
                        this.updateAriaProperties();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RadioButton.prototype, "disabled", {
                    get: function () { return this.rootElement.disabled; },
                    set: function (value) { this.rootElement.disabled = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RadioButton.prototype, "groupName", {
                    get: function () { return this._radioButtonElement.name; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RadioButton.prototype, "focusableElement", {
                    get: function () { return this._radioButtonElement; },
                    enumerable: true,
                    configurable: true
                });
                // overridable
                RadioButton.prototype.onCheck = function (ev) {
                    if (this.checked) {
                        // only fire events, etc, if we are the checked control
                        this.rootElement.focus();
                        if (this._onCheck) {
                            this._onCheck();
                        }
                        for (var i = 0; i < RadioButton.RadioButtons.length; ++i) {
                            var otherButton = RadioButton.RadioButtons[i];
                            if (otherButton !== this && otherButton.groupName === this.groupName) {
                                otherButton.updateAriaProperties();
                            }
                        }
                    }
                    this.updateAriaProperties();
                };
                RadioButton.prototype.updateAriaProperties = function () {
                    this.rootElement.setAttribute("aria-checked", "" + this.checked);
                };
                RadioButton.RadioButtons = [];
                return RadioButton;
            }(Legacy.Control));
            Legacy.RadioButton = RadioButton;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="keyCodes.ts" />
/// <reference path="Control.ts" />
/// <reference path="contentControl.ts" />
/// <reference path="tabControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var TabItem = (function (_super) {
                __extends(TabItem, _super);
                function TabItem() {
                    _super.call(this);
                    var elem = document.createElement("li");
                    elem.setAttribute("role", "tab");
                    elem.setAttribute("aria-selected", "false");
                    this.header = new Legacy.Control(elem);
                    this.header.rootElement.onclick = this.onHeaderClicked.bind(this);
                    this.header.rootElement.setAttribute("tabindex", "0");
                    this.header.rootElement.addEventListener("keydown", this.onKeyDown.bind(this));
                    this.rootElement.className = "tabItemContent";
                }
                Object.defineProperty(TabItem.prototype, "ownerTabControl", {
                    get: function () { return this._ownerTabControl; },
                    set: function (v) {
                        if (this._ownerTabControl !== v) {
                            this._ownerTabControl = v;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TabItem.prototype, "active", {
                    get: function () { return this._active; },
                    set: function (v) {
                        if (this._active !== v) {
                            this._active = v;
                            this.header.rootElement.classList.toggle("active");
                            this.rootElement.classList.toggle("active");
                            this.header.rootElement.setAttribute("aria-selected", this._active ? "true" : "false");
                            this.onActiveChanged();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TabItem.prototype, "title", {
                    get: function () { return this.header.rootElement.innerText; },
                    set: function (v) {
                        this.header.rootElement.innerText = v;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TabItem.prototype, "tooltipString", {
                    get: function () { return this.header.rootElement.getAttribute("data-plugin-vs-tooltip"); },
                    set: function (v) {
                        var tooltip = { content: v };
                        this.header.rootElement.setAttribute("data-plugin-vs-tooltip", JSON.stringify(tooltip));
                    },
                    enumerable: true,
                    configurable: true
                });
                /* overridable */
                TabItem.prototype.onActiveChanged = function () {
                };
                TabItem.prototype.onHeaderClicked = function () {
                    if (this.ownerTabControl) {
                        this.ownerTabControl.selectedItem = this;
                    }
                };
                TabItem.prototype.onKeyDown = function (e) {
                    if (e.keyCode === Common.KeyCodes.Enter || e.keyCode === Common.KeyCodes.Space) {
                        this.onHeaderClicked();
                    }
                };
                return TabItem;
            }(Legacy.ContentControl));
            Legacy.TabItem = TabItem;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="control.ts" />
/// <reference path="templateControl.ts" />
/// <reference path="tabItem.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var TabControl = (function (_super) {
                __extends(TabControl, _super);
                function TabControl() {
                    _super.call(this);
                    this._items = [];
                    this.setTemplateFromHTML('<div class="tabControl">' +
                        '   <div class="tabHeader">' +
                        '       <div id="beforeBarContainer" class="beforeBarContainer"></div>' +
                        '       <nav id="tabBarContainer" class="tabBarContainer">' +
                        '        <ul class="tabBar" role="tablist"></ul>' +
                        '       </nav>' +
                        '       <div id="afterBarContainer" class="afterBarContainer"></div>' +
                        '       <div id="tabHeaderFooter" class="tabHeaderFooter"></div>' +
                        '   </div>' +
                        '   <div class="tabContentPane"></div>' +
                        '</div>');
                    this._barPanel = new Legacy.Control(this.rootElement.getElementsByClassName("tabBar")[0]);
                    this._contentPane = new Legacy.Control(this.rootElement.getElementsByClassName("tabContentPane")[0]);
                    this.beforeBarContainer = new Legacy.Control(this.rootElement.getElementsByClassName("beforeBarContainer")[0]);
                    this.afterBarContainer = new Legacy.Control(this.rootElement.getElementsByClassName("afterBarContainer")[0]);
                    this._tabBarContainer = this.findElement("tabBarContainer");
                }
                Object.defineProperty(TabControl.prototype, "tabsLeftAligned", {
                    get: function () {
                        return this._tabBarContainer.classList.contains("tabBarContainerLeftAlign");
                    },
                    set: function (v) {
                        if (v) {
                            this._tabBarContainer.classList.add("tabBarContainerLeftAlign");
                        }
                        else {
                            this._tabBarContainer.classList.remove("tabBarContainerLeftAlign");
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                TabControl.prototype.addTab = function (tabItem) {
                    this._items.push(tabItem);
                    tabItem.ownerTabControl = this;
                    this._barPanel.appendChild(tabItem.header);
                    this._contentPane.appendChild(tabItem);
                    if (!this._selectedItem) {
                        this.selectedItem = tabItem;
                    }
                };
                TabControl.prototype.removeTab = function (tabItem) {
                    var indexOfItem = this._items.indexOf(tabItem);
                    if (indexOfItem < 0) {
                        return;
                    }
                    if (this.selectedItem === tabItem) {
                        this.selectedItem = null;
                    }
                    this._items.splice(indexOfItem, 1);
                    var newSelectedItemIndex = Math.min(this._items.length - 1, indexOfItem);
                    if (newSelectedItemIndex >= 0) {
                        this.selectedItem = this._items[newSelectedItemIndex];
                    }
                    this._barPanel.removeChild(tabItem.header);
                    this._contentPane.removeChild(tabItem);
                    tabItem.ownerTabControl = null;
                };
                TabControl.prototype.containsTab = function (tabItem) {
                    return this._items.indexOf(tabItem) >= 0;
                };
                TabControl.prototype.getTab = function (index) {
                    return this._items[index];
                };
                TabControl.prototype.length = function () {
                    return this._items.length;
                };
                Object.defineProperty(TabControl.prototype, "selectedItem", {
                    get: function () { return this._selectedItem; },
                    set: function (tabItem) {
                        if (this._selectedItem !== tabItem) {
                            if (!this.containsTab(tabItem)) {
                                return;
                            }
                            if (this._selectedItem) {
                                this._selectedItem.active = false;
                            }
                            this._selectedItem = tabItem;
                            if (this._selectedItem) {
                                this._selectedItem.active = true;
                            }
                            if (this.selectedItemChanged) {
                                this.selectedItemChanged();
                            }
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                TabControl.prototype.onTabItemSelected = function (item) {
                    this.selectedItem = item;
                };
                return TabControl;
            }(Legacy.TemplateControl));
            Legacy.TabControl = TabControl;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="button.ts" />
/// <reference path="assert.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            // NOTE: ToggleButton is intended to have a lifespan of the process.  If you plan on
            // creating/destroying ToggleButtons, you will need to add a dispose to remove the event listener.
            var ToggleButton = (function (_super) {
                __extends(ToggleButton, _super);
                function ToggleButton(element) {
                    var _this = this;
                    _super.call(this, element);
                    F12.Tools.Utility.Assert.areEqual(this.rootElement.getAttribute("role"), "button", "Missing button role");
                    this.rootElement.addEventListener("DOMAttrModified", function (evt) {
                        if (evt.attrName === "aria-pressed") {
                            var isSelected = evt.newValue === "true";
                            _this.rootElement.setAttribute("selected", "" + isSelected);
                            if (_this._onSelectChanged && evt.newValue !== evt.prevValue) {
                                _this._onSelectChanged(isSelected);
                            }
                        }
                    });
                    // Trigger downstream "DOMAttrModified" listeners side-effect by setting selected.
                    this.selected = this.selected;
                }
                Object.defineProperty(ToggleButton.prototype, "selectedChanged", {
                    get: function () { return this._onSelectChanged; },
                    set: function (value) {
                        this._onSelectChanged = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ToggleButton.prototype, "selected", {
                    get: function () { return this.rootElement.getAttribute("aria-pressed") === "true"; },
                    set: function (value) {
                        this.rootElement.setAttribute("aria-pressed", "" + value);
                    },
                    enumerable: true,
                    configurable: true
                });
                // overridable
                ToggleButton.prototype.onClick = function (ev) {
                    _super.prototype.onClick.call(this, ev);
                    this.selected = !this.selected;
                };
                // overridable
                ToggleButton.prototype.onKeydown = function (ev) {
                    if (ev.keyCode === Common.KeyCodes.Space || ev.keyCode === Common.KeyCodes.Enter) {
                        _super.prototype.onKeydown.call(this, ev);
                        this.selected = !this.selected;
                        ev.preventDefault();
                    }
                };
                return ToggleButton;
            }(Legacy.Button));
            Legacy.ToggleButton = ToggleButton;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="KeyCodes.ts" />
/// <reference path="common.d.ts" />
/// <reference path="isDebugBuild.ts" />
// Expected global variables:
/*global $m clipboardData */
var Common;
(function (Common) {
    "use strict";
    var ToolWindowHelpers = (function () {
        function ToolWindowHelpers() {
        }
        /**
         * Initializes common functionality of the tool windows
         * This includes adding event handlers and styling for buttons and togglebuttons, and
         * adding common keyboard navigation functionality
         */
        ToolWindowHelpers.initializeToolWindow = function () {
            // Add the handler that will activate our tool window in VS
            document.addEventListener("mousedown", function () {
                $m(document.body).removeClass("showFocus");
            }, true);
            // Prevent the default context menu
            $m(document).bind("contextmenu", function () {
                return false;
            });
            // Prevent the default F5 refresh and shift F10 WPF context menu (the jquery 'contextmenu' event will fire when desired)
            $m(document).bind("keydown", function (event) {
                if (event.keyCode === Common.KeyCodes.F5 ||
                    (event.keyCode === Common.KeyCodes.F10 && event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                else if (event.keyCode === Common.KeyCodes.Tab) {
                    $m(document.body).addClass("showFocus");
                }
            });
            // Setup the buttons and toggle buttons
            $m(".BPT-ToolbarButton").bind("mousedown", function (event) {
                var element = $m(this);
                if (!element.hasClass("BPT-ToolbarButton-StateDisabled")) {
                    element.addClass("BPT-ToolbarButton-MouseDown");
                }
                else {
                    event.stopImmediatePropagation();
                }
            });
            $m(".BPT-ToolbarButton").bind("mouseup", function () {
                $m(this).removeClass("BPT-ToolbarButton-MouseDown");
            });
            $m(".BPT-ToolbarButton").bind("mouseleave", function () {
                $m(this).removeClass("BPT-ToolbarButton-MouseDown BPT-ToolbarButton-MouseHover");
            });
            $m(".BPT-ToolbarButton").bind("mouseenter", function (event) {
                var element = $m(this);
                if (!element.hasClass("BPT-ToolbarButton-StateDisabled")) {
                    element.addClass("BPT-ToolbarButton-MouseHover");
                }
                else {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
            $m(".BPT-ToolbarButton").bind("click keydown", function (event) {
                if (event.type === "click" || event.keyCode === Common.KeyCodes.Enter || event.keyCode === Common.KeyCodes.Space) {
                    var element = $m(this);
                    if (!element.hasClass("BPT-ToolbarButton-StateDisabled")) {
                        var thisElement = element.get(0);
                        if (document.activeElement !== thisElement) {
                            thisElement.focus();
                        }
                    }
                    else {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                }
            });
            $m(".BPT-ToolbarToggleButton").bind("click keydown", function (event) {
                if (event.type === "click" || event.keyCode === Common.KeyCodes.Enter || event.keyCode === Common.KeyCodes.Space) {
                    var element = $m(this);
                    if (!element.hasClass("BPT-ToolbarButton-StateDisabled")) {
                        var thisElement = element.get(0);
                        if (document.activeElement !== thisElement) {
                            thisElement.focus();
                        }
                        if (element.hasClass("BPT-ToolbarToggleButton-StateOn")) {
                            element.removeClass("BPT-ToolbarToggleButton-StateOn");
                            element.attr("aria-pressed", false);
                        }
                        else {
                            element.addClass("BPT-ToolbarToggleButton-StateOn");
                            element.attr("aria-pressed", true);
                        }
                    }
                    else {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                }
            });
            // Setup keyboard navigation
            $m(".BPT-TabCycle-Horizontal, .BPT-TabCycle-Vertical").children(".BPT-TabCycle-Item").bind("keydown", function (event) {
                if (($m(this).parent().hasClass("BPT-TabCycle-Horizontal") && (event.keyCode === Common.KeyCodes.ArrowLeft || event.keyCode === Common.KeyCodes.ArrowRight)) ||
                    ($m(this).parent().hasClass("BPT-TabCycle-Vertical") && (event.keyCode === Common.KeyCodes.ArrowUp || event.keyCode === Common.KeyCodes.ArrowDown))) {
                    var currentElement = $m(this);
                    var newElement = ((event.keyCode === Common.KeyCodes.ArrowLeft || event.keyCode === Common.KeyCodes.ArrowUp) ?
                        currentElement.prev(".BPT-TabCycle-Item").first() :
                        currentElement.next(".BPT-TabCycle-Item").first());
                    // Ensure we are moving to a new element
                    if (newElement.length > 0) {
                        newElement.attr("tabindex", "1");
                        newElement.trigger("focus");
                        newElement.trigger("click");
                        currentElement.removeAttr("tabindex");
                    }
                }
            });
            $m(".BPT-TabCycle-Horizontal, .BPT-TabCycle-Vertical").children(".BPT-TabCycle-Item").bind("mousedown", function (event) {
                var oldElement = $m(this).siblings(".BPT-TabCycle-Item").matchAttr("tabindex", "1");
                var newElement = $m(this);
                // Replace the tab index from the old element, to the new one
                if (newElement.length > 0) {
                    newElement.attr("tabindex", "1");
                    newElement.trigger("focus");
                    oldElement.removeAttr("tabindex");
                }
            });
        };
        /**
         * Stores the component name and error handler function for non-fatal
         * error reporting
         * @param component The identifying name of the component
         * @param errorDisplayHandler The function that should be called to display an error message to the
         *                            user
         */
        ToolWindowHelpers.registerErrorComponent = function (component, errorDisplayHandler) {
            window.errorComponent = component;
            window.errorDisplayHandler = errorDisplayHandler;
        };
        ToolWindowHelpers.loadString = function (resourceId) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            // Need to use apply because getString expects the formatter values to be passed as individual args
            // but loadString is expecting them as an array.
            if (params.length === 1 && Array.isArray(params[0])) {
                params = params[0];
            }
            return Microsoft.Plugin.Resources.getString.apply(this, ["/Common/" + resourceId].concat(params));
        };
        /**
         * Fire a VS perf code marker with a specified identifier
         * @param codeMarker The value of the code marker
         */
        ToolWindowHelpers.codeMarker = function (codeMarker) {
            Microsoft.Plugin.VS.Internal.CodeMarkers.fire(codeMarker);
        };
        /**
         * Scrolls an element into view in a scroll container if it is currently outside of the view.
         * Ignores horizontal position - but presumably the container is wrapping anyway.
         * @param element The DOM element that should be scrolled into the view
         * @param scrollContainer The DOM element that has scrollbars and has the element being scrolled as a decendant
         * @return True if the view was scrolled, False if the element was already in the view and did not need scrolling
         */
        ToolWindowHelpers.scrollIntoView = function (element, scrollContainer) {
            // Ensure we have a valid element to scroll
            if (element && element.getBoundingClientRect) {
                // Choice: if even the closing tag is off the bottom, scroll the tag to the top of the viewport, which will fit as much of the children as possible.
                // There are various alternatives: scroll only if the opening tag is off the bottom (Chrome does this - but tricky to get the height of just the opening tag)
                // Or, we could scroll to the middle, so the user can see context.
                // Using recommendations from https://msdn.microsoft.com/en-us/library/ms530302(v=vs.85)
                var elementRect = element.getBoundingClientRect();
                var containerRect = scrollContainer.getBoundingClientRect();
                var elementTopIsAboveViewport = elementRect.top < containerRect.top;
                var elementBottomIsBelowViewport = elementRect.bottom > containerRect.bottom;
                if (elementTopIsAboveViewport || elementBottomIsBelowViewport) {
                    element.scrollIntoView(/*top=*/ true);
                    return true;
                }
            }
            return false;
        };
        /**
         * Sorts an object's property names alphabetically and returns an array of the sorted names
         * @param objectToSort The javascript object that contains the properties that need to be sorted
         * @return An array of the sorted property names that can be used as a list of sorted keys into the real object
         */
        ToolWindowHelpers.getSortedObjectProperties = function (objectToSort) {
            // Sort the property names for display
            var sortedPropNames = [];
            for (var propName in objectToSort) {
                sortedPropNames.push(propName);
            }
            sortedPropNames.sort(Common.ToolWindowHelpers.naturalSort);
            return sortedPropNames;
        };
        /**
         * Sorts an array of objects on a key property names alphabetically and respecting locale and returns an array of the sorted indicies
         * @param arrayToSort The javascript array that contains the objects that need to be sorted
         * @param key The name of the property to sort the array by
         * @param highPriorityValue Optional parameter to specify a value that should be treated with highest priority in the sort
         * @return An array of the sorted indicies that can be used as a list of sorted keys into the real array
         */
        ToolWindowHelpers.getSortedArrayProperties = function (arrayToSort, key, highPriorityValue) {
            // Sort the property names for display
            var i;
            var sortedProps = [];
            for (i = 0; i < arrayToSort.length; i++) {
                sortedProps.push({ property: arrayToSort[i][key], realIndex: i });
            }
            sortedProps.sort(function (a, b) {
                if (highPriorityValue) {
                    if (a.property === highPriorityValue && b.property === highPriorityValue) {
                        return 0;
                    }
                    else if (a.property === highPriorityValue) {
                        return -1;
                    }
                    else if (b.property === highPriorityValue) {
                        return 1;
                    }
                }
                return Common.ToolWindowHelpers.naturalSort(a.property, b.property);
            });
            var sortedList = [];
            for (i = 0; i < sortedProps.length; i++) {
                sortedList.push(sortedProps[i].realIndex);
            }
            return sortedList;
        };
        /**
         * Sorts two objects as strings alphabetically and returns a number representing the order
         * @param a The first string object to compare
         * @param b The second string object to compare
         * @return A number representing the sort order
         *          a > b = 1
         *          a < b = -1
         *          a == b = 0
         */
        ToolWindowHelpers.naturalSort = function (a, b) {
            // Regular Expression to pick groups of either digits or non digits (eg. 11bc34 - will return [11, bc, 34])
            var regexSortGroup = /(\d+)|(\D+)/g;
            // Convert to case insensitive strings and identify the sort groups
            var aGroups = String(a).toLocaleLowerCase().match(regexSortGroup);
            var bGroups = String(b).toLocaleLowerCase().match(regexSortGroup);
            if (!aGroups && bGroups) {
                return -1;
            }
            else if (aGroups && !bGroups) {
                return 1;
            }
            else if (!aGroups && !bGroups) {
                return 0;
            }
            // Loop through each group
            while (aGroups.length > 0 && bGroups.length > 0) {
                // Take the first group of each string
                var aFront = aGroups.shift();
                var bFront = bGroups.shift();
                // Check for digits
                var aAsDigit = parseInt(aFront, 10);
                var bAsDigit = parseInt(bFront, 10);
                if (isNaN(aAsDigit) && isNaN(bAsDigit)) {
                    // Compare as string characters
                    if (aFront !== bFront) {
                        // Chars not the same, so just return the sort value
                        return aFront.localeCompare(bFront);
                    }
                }
                else if (isNaN(aAsDigit)) {
                    // Letters come after numbers
                    return 1;
                }
                else if (isNaN(bAsDigit)) {
                    // Numbers come before letters
                    return -1;
                }
                else {
                    // Compare as numbers
                    if (aAsDigit !== bAsDigit) {
                        // Numbers not the same, so just return the sort value
                        return (aAsDigit - bAsDigit);
                    }
                }
            }
            // If we get here, we know all the groups checked were identical,
            // So we can return the length difference as the sort value.
            return aGroups.length - bGroups.length;
        };
        /**
         * Returns a short form of the URL for use in displaying file links to the user.  Adapted
         * from F12 toolbar code, this method removes any trailing query string or anchor location
         * and attempts to get the last file or directory following a '/' or '\'.
         * Assumes the url is normalized.
         * @param url The url to shorten.
         * @return A shortened version of the string
         */
        ToolWindowHelpers.createShortenedUrlText = function (url) {
            if (!url) {
                return url;
            }
            var shortenedText = url;
            // Special case: it is legal to use "javascript:" as a protocol,
            // followed by an arbitrarily long javascript stream. We don't want an arbitrarily
            // long URL shown where we want a short one. Use a fixed string; users can typically
            // use the tooltip to see the long URL to disambiguate.
            var javascriptPrefix = "javascript:";
            if (shortenedText.toLowerCase().substr(0, javascriptPrefix.length) === javascriptPrefix) {
                return "javascript:<URI>";
            }
            // Remove a query string if any
            var indexOfHash = shortenedText.indexOf("#");
            var indexOfQuestionMark = shortenedText.indexOf("?");
            var index = -1;
            if (indexOfHash > -1 && indexOfQuestionMark > -1) {
                index = Math.min(indexOfHash, indexOfQuestionMark);
            }
            else if (indexOfHash > -1) {
                index = indexOfHash;
            }
            else if (indexOfQuestionMark > -1) {
                index = indexOfQuestionMark;
            }
            if (index > -1) {
                shortenedText = shortenedText.substring(0, index);
            }
            index = Math.max(shortenedText.lastIndexOf("/"), shortenedText.lastIndexOf("\\"));
            // While the last character is '/' or '\', truncate it and find the next '\' or '/' or the start of the string
            while (index !== -1 && index === (shortenedText.length - 1)) {
                // Remove last '/' or '\'
                shortenedText = shortenedText.substring(0, shortenedText.length - 1);
                index = Math.max(shortenedText.lastIndexOf("/"), shortenedText.lastIndexOf("\\"));
            }
            if (index > -1) {
                shortenedText = shortenedText.substring(index + 1);
            }
            return shortenedText;
        };
        ToolWindowHelpers.getTruncatedFileName = function (filePath, maxLength) {
            if (maxLength === void 0) { maxLength = 20; }
            if (!filePath) {
                return filePath;
            }
            // We currently do not special case these:
            // "Function code (2)"
            // "about:blank"
            // "eval code (1)"
            // "script block (10)"
            // If a URL, shorten to the filename only
            var fileName = Common.ToolWindowHelpers.createShortenedUrlText(filePath);
            if (fileName.length > maxLength) {
                var index = maxLength / 2 - 2;
                fileName = fileName.substr(0, index) + this.loadString("Ellipsis") + fileName.substr(fileName.length - index);
            }
            return fileName;
        };
        /**
         * Create a file link for display.
         * @param fileUrl Optional file pathname or URL.
         * @param line Optional line number.
         * @param column Optional column number (ignored if line number not supplied as well).
         * @param maxLength Optional maximum length to represent fileUrl.
         * @return String in format depending on arguments:
         *    fileUrl
         *    fileUrl (line)
         *    fileUrl (line, column)
         *    (line)
         *    (line, column)
         *    <empty string>
         */
        ToolWindowHelpers.createFileLinkText = function (fileUrl, line, column, maxLength) {
            var linkText = fileUrl ? this.getTruncatedFileName(fileUrl, maxLength) : "";
            if (line) {
                if (fileUrl) {
                    linkText += " ";
                }
                linkText += "(" + line;
                if (column) {
                    linkText += ", " + column;
                }
                linkText += ")";
            }
            return linkText;
        };
        /**
         * A simple path combination method that adds necessary separators but
         * does not collapse any '..\' instances
         */
        ToolWindowHelpers.pathCombine = function (firstPart, secondPart) {
            var separators = /[\/\\]/; // Match '/' or '\'
            if (!secondPart) {
                return firstPart;
            }
            else if (this.isAbsoluteUrl(secondPart) || !firstPart) {
                return secondPart;
            }
            else if (secondPart.charAt(0) === "/" && this.isAbsoluteUrl(firstPart)) {
                return this.getRoot(firstPart) + secondPart;
            }
            else if (firstPart.charAt(firstPart.length - 1).match(separators) || secondPart.charAt(0).match(separators)) {
                return firstPart + secondPart;
            }
            else {
                var separator = ((firstPart + secondPart).lastIndexOf("\\") >= 0 ? "\\" : "/");
                return firstPart + separator + secondPart;
            }
        };
        ToolWindowHelpers.getRoot = function (url) {
            return url.substring(0, url.indexOf("/", url.indexOf("://") + 3));
        };
        /**
         * Determines if a url is absolute by checking for http://, https://,  file://, etc.
         * A url is also considered to be relative in case of urls like: file://..\js\default.js, http[s]://..\js\default.js etc,
         * but not in case of file://foo/../bar or http[s]://foo/../bar.
         */
        ToolWindowHelpers.isAbsoluteUrl = function (url) {
            // 1. A UNC like "\\server\share" is considered absolute
            // 2. A path like "c:\foo\bar" is considered absolute, even though it should have a "file://" prefix.
            if (this.isUncPath(url) || this.pathStartsWithDriveLetter(url)) {
                return true;
            }
            // A path like "file://.\foo\bar" or "file://..\foo\bar" 
            // or "file:///..\foo\bar" is considered NOT absolute
            if (!!url.match(/^file:\/{2,3}\./i)) {
                return false;
            }
            // After that we follow the RFC
            return !!url.match(/^[a-zA-Z][\w\+\-\.]*:/) || this.isDataURI(url); // scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ) from RFC 3986, but exclude scheme://../
        };
        /**
         * Determines whether the given url is a unc path or not
         * It simply checks whether the url is starting with \\. For example, "\\server\share"
         */
        ToolWindowHelpers.isUncPath = function (url) {
            return !!url.match(/^\\\\/);
        };
        /**
         * Determines whether the given url starts with a drive letter. A letter followed by a colon (:)
         */
        ToolWindowHelpers.pathStartsWithDriveLetter = function (url) {
            return !!url.match(/^[A-Za-z]:/);
        };
        ToolWindowHelpers.isFileURI = function (url) {
            return url.length > 5 && url.substr(0, 5).toLocaleLowerCase() === "file:";
        };
        ToolWindowHelpers.isDataURI = function (url) {
            return url.length > 5 && url.substr(0, 5).toLocaleLowerCase() === "data:";
        };
        /**
         * Clip the protocol from the given value.
         * For example,
         * 1. file://../js/default.js => ../js/default.js
         * 2. https://../foo.html => ../foo.html
         * 3. ../bar.ts => ../bar.ts
         */
        ToolWindowHelpers.truncateProtocolFromUrl = function (url) {
            return url.replace(/^[a-zAZ][\w\+\-\.]*:(\/\/)?/g, "");
        };
        ToolWindowHelpers.parseBase64DataUriContent = function (url) {
            // Terminate quickly if the url is not a data URI
            if (!ToolWindowHelpers.isDataURI(url) || url.indexOf("base64,") === -1) {
                return null;
            }
            try {
                return window.atob(url.substr(url.indexOf("base64,") + 7));
            }
            catch (ex) {
                // atob can throw an InvalidCharacterError
                return null;
            }
        };
        ToolWindowHelpers.parseDataUriMimeType = function (url) {
            // Terminate quickly if the url is not a data URI
            if (!ToolWindowHelpers.isDataURI(url) || url.indexOf(";") === -1) {
                return null;
            }
            return url.substring(5, url.indexOf(";"));
        };
        ToolWindowHelpers.hasSelectedText = function () {
            var selectedText = window.getSelection().toString();
            return !!selectedText;
        };
        ToolWindowHelpers.getSelectedText = function () {
            var selectedText = window.getSelection().toString();
            return selectedText;
        };
        /**
         * Gets the highlighted text in the document, compacts multiline text by converting multiple \r\n's to a single one, and then copies the text to the clipboard.
         * @return true if any text was copied; false otherwise.
         */
        ToolWindowHelpers.copySelectedTextToClipboard = function () {
            var selectedText = window.getSelection().toString();
            if (selectedText) {
                // Replace multiple white space lines with a single one
                var compactText = selectedText.replace(/[\r\n]+/g, "\r\n");
                // Copy to the clipboard
                window.clipboardData.setData("Text", compactText);
                return true;
            }
            return false;
        };
        /**
         * Checks the element's background color to see if it is being displayed in the dark theme
         * @param element The JQuery element to check the background for
         * @return True if the background color indicates the dark theme, False if it is light
         */
        ToolWindowHelpers.isDarkThemeBackground = function (element) {
            if (element) {
                var backgroundColor;
                while ((!backgroundColor || backgroundColor === "transparent") && element && element.length > 0) {
                    backgroundColor = element.css("background-color");
                    element = element.parent();
                }
                if (backgroundColor) {
                    var rgbParts = backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                    if (rgbParts && rgbParts.length === 4) {
                        // Brightness determined by W3C formula
                        var brightness = ((parseInt(rgbParts[1], 10) * 299) + (parseInt(rgbParts[2], 10) * 587) + (parseInt(rgbParts[3], 10) * 114)) / 1000;
                        return (brightness < 127);
                    }
                }
            }
            // Default to using light theme
            return false;
        };
        ToolWindowHelpers.isContextMenuUp = function () {
            return Common.ToolWindowHelpers.ContextMenuIsUp;
        };
        ToolWindowHelpers.contextMenuUp = function (flag) {
            Common.ToolWindowHelpers.ContextMenuIsUp = flag;
        };
        ToolWindowHelpers.nodeInDocument = function (node) {
            if (node) {
                while (node = node.parentNode) {
                    if (node === document) {
                        return true;
                    }
                }
            }
            return false;
        };
        // Focus is "good" if it is on something other than the BODY element, which is the fallback location.  BODY is not a useful element to have focus.
        ToolWindowHelpers.isFocusGood = function () {
            var nowFocus = document.querySelector(":focus");
            return nowFocus && nowFocus.tagName !== "BODY";
        };
        ToolWindowHelpers.fireCustomEvent = function (element, eventName) {
            // Create the event and attach custom data
            var customEvent = document.createEvent("CustomEvent");
            customEvent.initEvent(eventName, /* canBubbleArg = */ true, /* cancelableArg = */ true);
            // Fire the event via DOM
            element.dispatchEvent(customEvent);
        };
        /**
         * Returns the file extension from the supplied url
         */
        ToolWindowHelpers.getExtension = function (url) {
            if (!url) {
                return "";
            }
            // Strip off the path and querystring
            url = this.createShortenedUrlText(url);
            var indexOfDot = url.lastIndexOf(".");
            var extension;
            if (indexOfDot < 0) {
                return "";
            }
            else {
                return url.substr(indexOfDot).toLowerCase();
            }
        };
        /**
         * Guesses the best mime type for the file extension of the given url
         */
        ToolWindowHelpers.guessMimeTypeFromUrlExtension = function (url) {
            switch (this.getExtension(url)) {
                case ".html":
                case ".htm":
                    return "text/html";
                case ".xml":
                case ".svg":
                    return "text/xml";
                case ".ts":
                    return "text/typescript";
                case ".js":
                    return "text/javascript";
                case ".css":
                    return "text/css";
                case ".coffee":
                    return "text/coffeescript";
                case ".cs":
                    return "text/x-csharp";
                default:
                    return "text/plain";
            }
        };
        ToolWindowHelpers.ContextMenuIsUp = false;
        // A set of types used in the console for different output items
        ToolWindowHelpers.CodeMarkers = {
            perfBrowserTools_DiagnosticsToolWindowsConsoleReady: 23609,
            perfBrowserTools_DiagnosticsToolWindowsDomExplorerReady: 23610,
            perfBrowserTools_DiagnosticsToolWindowsExpandConsoleObjectBegin: 23611,
            perfBrowserTools_DiagnosticsToolWindowsExpandConsoleObjectEnd: 23612,
            perfBrowserTools_DiagnosticsToolWindowsExpandConsoleObjectInteractive: 23613,
            perfBrowserTools_DiagnosticsToolWindowsConsoleEvalBegin: 23614,
            perfBrowserTools_DiagnosticsToolWindowsConsoleEvalEnd: 23615,
            perfBrowserTools_DiagnosticsToolWindowsDataTreeToggleBegin: 23616,
            perfBrowserTools_DiagnosticsToolWindowsDataTreeToggleEnd: 23617,
            perfBrowserTools_DiagnosticsToolWindowsTreeViewToggleBegin: 23618,
            perfBrowserTools_DiagnosticsToolWindowsTreeViewToggleEnd: 23619,
            perfBrowserTools_DiagnosticsToolWindowsDomExplorerRefreshBegin: 23620,
            perfBrowserTools_DiagnosticsToolWindowsDomExplorerRefreshEnd: 23621,
            perfBrowserTools_DiagnosticsToolWindowsDomExplorerAttributeChanged: 23622,
            perfBrowserTools_DiagnosticsToolWindowsDomExplorerTabChanged: 23623,
            perfBrowserTools_DiagnosticsToolWindowsNetworkExplorerReady: 23624
        };
        // Should we be firing code markers to the HostBridge
        ToolWindowHelpers.AreCodeMarkersEnabled = false;
        return ToolWindowHelpers;
    }());
    Common.ToolWindowHelpers = ToolWindowHelpers;
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
// !! Don't auto format this file, need the indention in the enum for easier visual inspection. !!
var Common;
(function (Common) {
    "use strict";
    /**
     * Entries in this enum should be registered with matching name and value in bpt\diagnostics\common\PerfTrack\PerfTrack.man.template
     * As per adding ETW events instructions http://devdiv/sites/vsclient/team/wiki/Adding%20ETW%20events.aspx
     */
    /// <disable code="SA9016" justification="Values registered with external manifest should keep the same names" />
    (function (TraceEvents) {
        TraceEvents[TraceEvents["Timeline_Zoom_Start"] = 101] = "Timeline_Zoom_Start";
        TraceEvents[TraceEvents["Timeline_Zoom_Stop"] = 102] = "Timeline_Zoom_Stop";
        TraceEvents[TraceEvents["Timeline_GridSort_Start"] = 103] = "Timeline_GridSort_Start";
        TraceEvents[TraceEvents["Timeline_GridSort_Stop"] = 104] = "Timeline_GridSort_Stop";
        TraceEvents[TraceEvents["Timeline_LoadGraphs_Start"] = 105] = "Timeline_LoadGraphs_Start";
        TraceEvents[TraceEvents["Timeline_LoadGraphs_Stop"] = 106] = "Timeline_LoadGraphs_Stop";
        TraceEvents[TraceEvents["Timeline_GridScrolled"] = 107] = "Timeline_GridScrolled";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForTimeSelection"] = 108] = "Timeline_GridUpdatedForTimeSelection";
        TraceEvents[TraceEvents["Timeline_UserSelectedTimeSlice_Start"] = 109] = "Timeline_UserSelectedTimeSlice_Start";
        TraceEvents[TraceEvents["Timeline_UserSelectedTimeSlice_Stop"] = 110] = "Timeline_UserSelectedTimeSlice_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterBackground_Start"] = 111] = "Timeline_GridUpdatedForFilterBackground_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterBackground_Stop"] = 112] = "Timeline_GridUpdatedForFilterBackground_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterIO_Start"] = 113] = "Timeline_GridUpdatedForFilterIO_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterIO_Stop"] = 114] = "Timeline_GridUpdatedForFilterIO_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterScenarios_Start"] = 115] = "Timeline_GridUpdatedForFilterScenarios_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterScenarios_Stop"] = 116] = "Timeline_GridUpdatedForFilterScenarios_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterFrames_Start"] = 117] = "Timeline_GridUpdatedForFilterFrames_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterFrames_Stop"] = 118] = "Timeline_GridUpdatedForFilterFrames_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterName_Start"] = 119] = "Timeline_GridUpdatedForFilterName_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterName_Stop"] = 120] = "Timeline_GridUpdatedForFilterName_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowDuration_Start"] = 121] = "Timeline_GridUpdatedForShowDuration_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowDuration_Stop"] = 122] = "Timeline_GridUpdatedForShowDuration_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowQualifiers_Start"] = 123] = "Timeline_GridUpdatedForShowQualifiers_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowQualifiers_Stop"] = 124] = "Timeline_GridUpdatedForShowQualifiers_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowHintText_Start"] = 125] = "Timeline_GridUpdatedForShowHintText_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowHintText_Stop"] = 126] = "Timeline_GridUpdatedForShowHintText_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowThreadIndicator_Start"] = 127] = "Timeline_GridUpdatedForShowThreadIndicator_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForShowThreadIndicator_Stop"] = 128] = "Timeline_GridUpdatedForShowThreadIndicator_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterUI_Start"] = 129] = "Timeline_GridUpdatedForFilterUI_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterUI_Stop"] = 130] = "Timeline_GridUpdatedForFilterUI_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterDuration_Start"] = 131] = "Timeline_GridUpdatedForFilterDuration_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterDuration_Stop"] = 132] = "Timeline_GridUpdatedForFilterDuration_Stop";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterType_Start"] = 133] = "Timeline_GridUpdatedForFilterType_Start";
        TraceEvents[TraceEvents["Timeline_GridUpdatedForFilterType_Stop"] = 134] = "Timeline_GridUpdatedForFilterType_Stop";
        TraceEvents[TraceEvents["Memory_TakeSnapshot_Start"] = 201] = "Memory_TakeSnapshot_Start";
        TraceEvents[TraceEvents["Memory_TakeSnapshot_Stop"] = 202] = "Memory_TakeSnapshot_Stop";
        TraceEvents[TraceEvents["Memory_CompareSnapshot_Start"] = 203] = "Memory_CompareSnapshot_Start";
        TraceEvents[TraceEvents["Memory_CompareSnapshot_Stop"] = 204] = "Memory_CompareSnapshot_Stop";
        TraceEvents[TraceEvents["Memory_ViewSnapshot_Start"] = 205] = "Memory_ViewSnapshot_Start";
        TraceEvents[TraceEvents["Memory_ViewSnapshot_Stop"] = 206] = "Memory_ViewSnapshot_Stop";
        TraceEvents[TraceEvents["Memory_GridSort_Start"] = 207] = "Memory_GridSort_Start";
        TraceEvents[TraceEvents["Memory_GridSort_Stop"] = 208] = "Memory_GridSort_Stop";
        TraceEvents[TraceEvents["Memory_DisplayFirstLevelSnapshotData_Start"] = 209] = "Memory_DisplayFirstLevelSnapshotData_Start";
        TraceEvents[TraceEvents["Memory_DisplayFirstLevelSnapshotData_Stop"] = 210] = "Memory_DisplayFirstLevelSnapshotData_Stop";
        TraceEvents[TraceEvents["Memory_ToolReady_Start"] = 211] = "Memory_ToolReady_Start";
        TraceEvents[TraceEvents["Memory_ToolReady_Stop"] = 212] = "Memory_ToolReady_Stop";
        TraceEvents[TraceEvents["Memory_GridFilterResponse_Start"] = 213] = "Memory_GridFilterResponse_Start";
        TraceEvents[TraceEvents["Memory_GridFilterResponse_Stop"] = 214] = "Memory_GridFilterResponse_Stop";
        TraceEvents[TraceEvents["Memory_UpdateObjectReferenceGraph_Start"] = 215] = "Memory_UpdateObjectReferenceGraph_Start";
        TraceEvents[TraceEvents["Memory_UpdateObjectReferenceGraph_Stop"] = 216] = "Memory_UpdateObjectReferenceGraph_Stop";
        TraceEvents[TraceEvents["Memory_ProcessingSnapshot_Start"] = 217] = "Memory_ProcessingSnapshot_Start";
        TraceEvents[TraceEvents["Memory_ProcessingSnapshot_Stop"] = 218] = "Memory_ProcessingSnapshot_Stop";
        TraceEvents[TraceEvents["Memory_ProcessingDiffSnapshot_Start"] = 219] = "Memory_ProcessingDiffSnapshot_Start";
        TraceEvents[TraceEvents["Memory_ProcessingDiffSnapshot_Stop"] = 220] = "Memory_ProcessingDiffSnapshot_Stop";
        TraceEvents[TraceEvents["Debugger_StepOver_Start"] = 301] = "Debugger_StepOver_Start";
        TraceEvents[TraceEvents["Debugger_StepInto_Start"] = 302] = "Debugger_StepInto_Start";
        TraceEvents[TraceEvents["Debugger_StepOut_Start"] = 303] = "Debugger_StepOut_Start";
        TraceEvents[TraceEvents["Debugger_OnBreak_Start"] = 304] = "Debugger_OnBreak_Start";
        TraceEvents[TraceEvents["Debugger_OnBreak_Stop"] = 305] = "Debugger_OnBreak_Stop";
        TraceEvents[TraceEvents["Debugger_PrettyPrint_Start"] = 306] = "Debugger_PrettyPrint_Start";
        TraceEvents[TraceEvents["Debugger_PrettyPrint_Stop"] = 307] = "Debugger_PrettyPrint_Stop";
        // 0x134 and 0x135 are key events
        TraceEvents[TraceEvents["Debugger_CloseDocument_Start"] = 310] = "Debugger_CloseDocument_Start";
        TraceEvents[TraceEvents["Debugger_CloseDocument_Stop"] = 311] = "Debugger_CloseDocument_Stop";
        // 0x138 and 0x139 are key events
        TraceEvents[TraceEvents["Debugger_RevealRange_Start"] = 314] = "Debugger_RevealRange_Start";
        TraceEvents[TraceEvents["Debugger_RevealRange_Stop"] = 315] = "Debugger_RevealRange_Stop";
        TraceEvents[TraceEvents["Debugger_CallstackController_GoTo_Start"] = 316] = "Debugger_CallstackController_GoTo_Start";
        TraceEvents[TraceEvents["Debugger_CallstackController_GoTo_Stop"] = 317] = "Debugger_CallstackController_GoTo_Stop";
        TraceEvents[TraceEvents["Debugger_BreakpointController_SetAllEnabledStates_Start"] = 318] = "Debugger_BreakpointController_SetAllEnabledStates_Start";
        TraceEvents[TraceEvents["Debugger_BreakpointController_SetAllEnabledStates_Stop"] = 319] = "Debugger_BreakpointController_SetAllEnabledStates_Stop";
        TraceEvents[TraceEvents["Debugger_EditorWindow_NavigateTo_Start"] = 320] = "Debugger_EditorWindow_NavigateTo_Start";
        TraceEvents[TraceEvents["Debugger_EditorWindow_NavigateTo_Stop"] = 321] = "Debugger_EditorWindow_NavigateTo_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_SetModel_Start"] = 322] = "Debugger_Editor_SetModel_Start";
        TraceEvents[TraceEvents["Debugger_Editor_SetModel_Stop"] = 323] = "Debugger_Editor_SetModel_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_CreateModel_Start"] = 324] = "Debugger_Editor_CreateModel_Start";
        TraceEvents[TraceEvents["Debugger_Editor_CreateModel_Stop"] = 325] = "Debugger_Editor_CreateModel_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_Create_Start"] = 326] = "Debugger_Editor_Create_Start";
        TraceEvents[TraceEvents["Debugger_Editor_Create_Stop"] = 327] = "Debugger_Editor_Create_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_Layout_Start"] = 328] = "Debugger_Editor_Layout_Start";
        TraceEvents[TraceEvents["Debugger_Editor_Layout_Stop"] = 329] = "Debugger_Editor_Layout_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_ChangeViewZones_Start"] = 330] = "Debugger_Editor_ChangeViewZones_Start";
        TraceEvents[TraceEvents["Debugger_Editor_ChangeViewZones_Stop"] = 331] = "Debugger_Editor_ChangeViewZones_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_RevealPosition_Start"] = 332] = "Debugger_Editor_RevealPosition_Start";
        TraceEvents[TraceEvents["Debugger_Editor_RevealPosition_Stop"] = 333] = "Debugger_Editor_RevealPosition_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_SaveViewState_Start"] = 334] = "Debugger_Editor_SaveViewState_Start";
        TraceEvents[TraceEvents["Debugger_Editor_SaveViewState_Stop"] = 335] = "Debugger_Editor_SaveViewState_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_RestoreViewState_Start"] = 336] = "Debugger_Editor_RestoreViewState_Start";
        TraceEvents[TraceEvents["Debugger_Editor_RestoreViewState_Stop"] = 337] = "Debugger_Editor_RestoreViewState_Stop";
        TraceEvents[TraceEvents["Debugger_EditorWindow_CreateDataTipFromPosition_Start"] = 338] = "Debugger_EditorWindow_CreateDataTipFromPosition_Start";
        TraceEvents[TraceEvents["Debugger_EditorWindow_CreateDataTipFromPosition_Stop"] = 339] = "Debugger_EditorWindow_CreateDataTipFromPosition_Stop";
        TraceEvents[TraceEvents["Debugger_BreakpointController_SetEnabledState_Start"] = 340] = "Debugger_BreakpointController_SetEnabledState_Start";
        TraceEvents[TraceEvents["Debugger_BreakpointController_SetEnabledState_Stop"] = 341] = "Debugger_BreakpointController_SetEnabledState_Stop";
        TraceEvents[TraceEvents["Debugger_BreakpointController_BreakpointChanged_Start"] = 342] = "Debugger_BreakpointController_BreakpointChanged_Start";
        TraceEvents[TraceEvents["Debugger_BreakpointController_BreakpointChanged_Stop"] = 343] = "Debugger_BreakpointController_BreakpointChanged_Stop";
        TraceEvents[TraceEvents["Debugger_BreakpointWindow_BreakpointChanged_Start"] = 344] = "Debugger_BreakpointWindow_BreakpointChanged_Start";
        TraceEvents[TraceEvents["Debugger_BreakpointWindow_BreakpointChanged_Stop"] = 345] = "Debugger_BreakpointWindow_BreakpointChanged_Stop";
        TraceEvents[TraceEvents["Debugger_WatchWindowView_RefreshView_Start"] = 346] = "Debugger_WatchWindowView_RefreshView_Start";
        TraceEvents[TraceEvents["Debugger_WatchWindowView_RefreshView_Stop"] = 347] = "Debugger_WatchWindowView_RefreshView_Stop";
        TraceEvents[TraceEvents["Debugger_StepDocument_Start"] = 348] = "Debugger_StepDocument_Start";
        TraceEvents[TraceEvents["Debugger_ToggleJMC_Start"] = 349] = "Debugger_ToggleJMC_Start";
        TraceEvents[TraceEvents["Debugger_ToggleJMC_Stop"] = 350] = "Debugger_ToggleJMC_Stop";
        TraceEvents[TraceEvents["Debugger_ToggleCallstackLibraryFrames_Start"] = 351] = "Debugger_ToggleCallstackLibraryFrames_Start";
        TraceEvents[TraceEvents["Debugger_ToggleCallstackLibraryFrames_Stop"] = 352] = "Debugger_ToggleCallstackLibraryFrames_Stop";
        TraceEvents[TraceEvents["Debugger_SpecifyUrlAsJMCType_Start"] = 353] = "Debugger_SpecifyUrlAsJMCType_Start";
        TraceEvents[TraceEvents["Debugger_SpecifyUrlAsJMCType_Stop"] = 354] = "Debugger_SpecifyUrlAsJMCType_Stop";
        TraceEvents[TraceEvents["Debugger_Persistence_DataLoad_Start"] = 355] = "Debugger_Persistence_DataLoad_Start";
        TraceEvents[TraceEvents["Debugger_Persistence_DataLoad_Stop"] = 356] = "Debugger_Persistence_DataLoad_Stop";
        TraceEvents[TraceEvents["Debugger_Persistence_AddBreakpoints_Start"] = 357] = "Debugger_Persistence_AddBreakpoints_Start";
        TraceEvents[TraceEvents["Debugger_Persistence_AddBreakpoints_Stop"] = 358] = "Debugger_Persistence_AddBreakpoints_Stop";
        TraceEvents[TraceEvents["Debugger_Persistence_AddWatches_Start"] = 359] = "Debugger_Persistence_AddWatches_Start";
        TraceEvents[TraceEvents["Debugger_Persistence_AddWatches_Stop"] = 360] = "Debugger_Persistence_AddWatches_Stop";
        TraceEvents[TraceEvents["Debugger_Persistence_TabOpen_Start"] = 361] = "Debugger_Persistence_TabOpen_Start";
        TraceEvents[TraceEvents["Debugger_Persistence_TabOpen_Stop"] = 362] = "Debugger_Persistence_TabOpen_Stop";
        TraceEvents[TraceEvents["Debugger_Persistence_SaveState_Start"] = 363] = "Debugger_Persistence_SaveState_Start";
        TraceEvents[TraceEvents["Debugger_Persistence_SaveState_Stop"] = 364] = "Debugger_Persistence_SaveState_Stop";
        TraceEvents[TraceEvents["Debugger_SourceMap_ToggleSourceMap_Start"] = 365] = "Debugger_SourceMap_ToggleSourceMap_Start";
        TraceEvents[TraceEvents["Debugger_SourceMap_ToggleSourceMap_Stop"] = 366] = "Debugger_SourceMap_ToggleSourceMap_Stop";
        TraceEvents[TraceEvents["Debugger_SourceMap_ParseSourceMapAsync_Start"] = 367] = "Debugger_SourceMap_ParseSourceMapAsync_Start";
        TraceEvents[TraceEvents["Debugger_SourceMap_ParseSourceMapAsync_Stop"] = 368] = "Debugger_SourceMap_ParseSourceMapAsync_Stop";
        TraceEvents[TraceEvents["Debugger_Editor_GetOrCreateMode_Start"] = 369] = "Debugger_Editor_GetOrCreateMode_Start";
        TraceEvents[TraceEvents["Debugger_Editor_GetOrCreateMode_Stop"] = 370] = "Debugger_Editor_GetOrCreateMode_Stop";
        TraceEvents[TraceEvents["Debugger_OnAddDocuments_Info"] = 371] = "Debugger_OnAddDocuments_Info";
        TraceEvents[TraceEvents["Debugger_Intellisense_ListBox_Build_Start"] = 372] = "Debugger_Intellisense_ListBox_Build_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_ListBox_Build_Stop"] = 373] = "Debugger_Intellisense_ListBox_Build_Stop";
        TraceEvents[TraceEvents["Debugger_Intellisense_ListBox_Reset_Start"] = 374] = "Debugger_Intellisense_ListBox_Reset_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_ListBox_Reset_Stop"] = 375] = "Debugger_Intellisense_ListBox_Reset_Stop";
        TraceEvents[TraceEvents["Debugger_Intellisense_Menu_Filter_Start"] = 376] = "Debugger_Intellisense_Menu_Filter_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_Menu_Filter_Stop"] = 377] = "Debugger_Intellisense_Menu_Filter_Stop";
        TraceEvents[TraceEvents["Debugger_Intellisense_Menu_Layout_Start"] = 378] = "Debugger_Intellisense_Menu_Layout_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_Menu_Layout_Stop"] = 379] = "Debugger_Intellisense_Menu_Layout_Stop";
        TraceEvents[TraceEvents["Debugger_Intellisense_Provider_Get_Expression_Start"] = 380] = "Debugger_Intellisense_Provider_Get_Expression_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_Provider_Get_Expression_Stop"] = 381] = "Debugger_Intellisense_Provider_Get_Expression_Stop";
        TraceEvents[TraceEvents["Debugger_Intellisense_Provider_Update_Start"] = 382] = "Debugger_Intellisense_Provider_Update_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_Provider_Update_Stop"] = 383] = "Debugger_Intellisense_Provider_Update_Stop";
        TraceEvents[TraceEvents["Debugger_Intellisense_Provider_Get_Items_Start"] = 384] = "Debugger_Intellisense_Provider_Get_Items_Start";
        TraceEvents[TraceEvents["Debugger_Intellisense_Provider_Get_Items_Stop"] = 385] = "Debugger_Intellisense_Provider_Get_Items_Stop";
        TraceEvents[TraceEvents["Debugger_AsyncStackProvider_GetFrames_Start"] = 386] = "Debugger_AsyncStackProvider_GetFrames_Start";
        TraceEvents[TraceEvents["Debugger_AsyncStackProvider_GetFrames_Stop"] = 387] = "Debugger_AsyncStackProvider_GetFrames_Stop";
        TraceEvents[TraceEvents["Debugger_AsyncStackProvider_GetFrames_Timeout"] = 388] = "Debugger_AsyncStackProvider_GetFrames_Timeout";
        TraceEvents[TraceEvents["Console_Window_Create_Start"] = 401] = "Console_Window_Create_Start";
        TraceEvents[TraceEvents["Console_Window_Create_Stop"] = 402] = "Console_Window_Create_Stop";
        TraceEvents[TraceEvents["Console_Attach_Start"] = 403] = "Console_Attach_Start";
        TraceEvents[TraceEvents["Console_Attach_Stop"] = 404] = "Console_Attach_Stop";
        TraceEvents[TraceEvents["Console_Message_Start"] = 405] = "Console_Message_Start";
        TraceEvents[TraceEvents["Console_Message_Stop"] = 406] = "Console_Message_Stop";
        TraceEvents[TraceEvents["Console_Input_Start"] = 407] = "Console_Input_Start";
        TraceEvents[TraceEvents["Console_Input_Stop"] = 408] = "Console_Input_Stop";
        TraceEvents[TraceEvents["Console_Output_Start"] = 409] = "Console_Output_Start";
        TraceEvents[TraceEvents["Console_Output_Stop"] = 410] = "Console_Output_Stop";
        TraceEvents[TraceEvents["Console_Output_Render_Start"] = 411] = "Console_Output_Render_Start";
        TraceEvents[TraceEvents["Console_Output_Render_Stop"] = 412] = "Console_Output_Render_Stop";
        TraceEvents[TraceEvents["Console_Item_Toggle_Start"] = 413] = "Console_Item_Toggle_Start";
        TraceEvents[TraceEvents["Console_Item_Toggle_Stop"] = 414] = "Console_Item_Toggle_Stop";
        TraceEvents[TraceEvents["Console_HtmlLines_Expand_Start"] = 415] = "Console_HtmlLines_Expand_Start";
        TraceEvents[TraceEvents["Console_HtmlLines_Expand_Stop"] = 416] = "Console_HtmlLines_Expand_Stop";
        TraceEvents[TraceEvents["Console_Context_Menu_Loading_Start"] = 417] = "Console_Context_Menu_Loading_Start";
        TraceEvents[TraceEvents["Console_Context_Menu_Loading_Stop"] = 418] = "Console_Context_Menu_Loading_Stop";
        TraceEvents[TraceEvents["Console_Scroll_Start"] = 419] = "Console_Scroll_Start";
        TraceEvents[TraceEvents["Console_Scroll_Stop"] = 420] = "Console_Scroll_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_ListBox_Build_Start"] = 421] = "Console_Intellisense_ListBox_Build_Start";
        TraceEvents[TraceEvents["Console_Intellisense_ListBox_Build_Stop"] = 422] = "Console_Intellisense_ListBox_Build_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_ListBox_Reset_Start"] = 423] = "Console_Intellisense_ListBox_Reset_Start";
        TraceEvents[TraceEvents["Console_Intellisense_ListBox_Reset_Stop"] = 424] = "Console_Intellisense_ListBox_Reset_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_Menu_Filter_Start"] = 425] = "Console_Intellisense_Menu_Filter_Start";
        TraceEvents[TraceEvents["Console_Intellisense_Menu_Filter_Stop"] = 426] = "Console_Intellisense_Menu_Filter_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_Menu_Layout_Start"] = 427] = "Console_Intellisense_Menu_Layout_Start";
        TraceEvents[TraceEvents["Console_Intellisense_Menu_Layout_Stop"] = 428] = "Console_Intellisense_Menu_Layout_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_Provider_Get_Expression_Start"] = 429] = "Console_Intellisense_Provider_Get_Expression_Start";
        TraceEvents[TraceEvents["Console_Intellisense_Provider_Get_Expression_Stop"] = 430] = "Console_Intellisense_Provider_Get_Expression_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_Provider_Update_Start"] = 431] = "Console_Intellisense_Provider_Update_Start";
        TraceEvents[TraceEvents["Console_Intellisense_Provider_Update_Stop"] = 432] = "Console_Intellisense_Provider_Update_Stop";
        TraceEvents[TraceEvents["Console_Intellisense_Provider_Get_Items_Start"] = 433] = "Console_Intellisense_Provider_Get_Items_Start";
        TraceEvents[TraceEvents["Console_Intellisense_Provider_Get_Items_Stop"] = 434] = "Console_Intellisense_Provider_Get_Items_Stop";
        TraceEvents[TraceEvents["Dom_Window_Create_Start"] = 501] = "Dom_Window_Create_Start";
        TraceEvents[TraceEvents["Dom_Window_Create_Stop"] = 502] = "Dom_Window_Create_Stop";
        TraceEvents[TraceEvents["Dom_ExpandNode_Start"] = 503] = "Dom_ExpandNode_Start";
        TraceEvents[TraceEvents["Dom_ExpandNode_Stop"] = 504] = "Dom_ExpandNode_Stop";
        TraceEvents[TraceEvents["Dom_UndoRedo_Start"] = 505] = "Dom_UndoRedo_Start";
        TraceEvents[TraceEvents["Dom_UndoRedo_Stop"] = 506] = "Dom_UndoRedo_Stop";
        TraceEvents[TraceEvents["Dom_DragDrop_Start"] = 507] = "Dom_DragDrop_Start";
        TraceEvents[TraceEvents["Dom_DragDrop_Stop"] = 508] = "Dom_DragDrop_Stop";
        TraceEvents[TraceEvents["Dom_AddAttribute_Start"] = 509] = "Dom_AddAttribute_Start";
        TraceEvents[TraceEvents["Dom_AddAttribute_Stop"] = 510] = "Dom_AddAttribute_Stop";
        TraceEvents[TraceEvents["Dom_Intellisense_Start"] = 511] = "Dom_Intellisense_Start";
        TraceEvents[TraceEvents["Dom_Intellisense_Stop"] = 512] = "Dom_Intellisense_Stop";
        TraceEvents[TraceEvents["Dom_SelectElement_Start"] = 513] = "Dom_SelectElement_Start";
        TraceEvents[TraceEvents["Dom_SelectElement_Stop"] = 514] = "Dom_SelectElement_Stop";
        TraceEvents[TraceEvents["Dom_CutElement_Start"] = 515] = "Dom_CutElement_Start";
        TraceEvents[TraceEvents["Dom_CutElement_Stop"] = 516] = "Dom_CutElement_Stop";
        TraceEvents[TraceEvents["Dom_PasteElement_Start"] = 517] = "Dom_PasteElement_Start";
        TraceEvents[TraceEvents["Dom_PasteElement_Stop"] = 518] = "Dom_PasteElement_Stop";
        TraceEvents[TraceEvents["Dom_CollapseElement_Start"] = 519] = "Dom_CollapseElement_Start";
        TraceEvents[TraceEvents["Dom_CollapseElement_Stop"] = 520] = "Dom_CollapseElement_Stop";
        TraceEvents[TraceEvents["Dom_StylesTabLoad_Start"] = 521] = "Dom_StylesTabLoad_Start";
        TraceEvents[TraceEvents["Dom_StylesTabLoad_Stop"] = 522] = "Dom_StylesTabLoad_Stop";
        TraceEvents[TraceEvents["Dom_StylesTab_Intellisense_Start"] = 523] = "Dom_StylesTab_Intellisense_Start";
        TraceEvents[TraceEvents["Dom_StylesTab_Intellisense_Stop"] = 524] = "Dom_StylesTab_Intellisense_Stop";
        TraceEvents[TraceEvents["Dom_TreeItemExpand_Start"] = 525] = "Dom_TreeItemExpand_Start";
        TraceEvents[TraceEvents["Dom_TreeItemExpand_Stop"] = 526] = "Dom_TreeItemExpand_Stop";
        TraceEvents[TraceEvents["Dom_ComputedTabLoad_Start"] = 527] = "Dom_ComputedTabLoad_Start";
        TraceEvents[TraceEvents["Dom_ComputedTabLoad_Stop"] = 528] = "Dom_ComputedTabLoad_Stop";
        TraceEvents[TraceEvents["Dom_ChangesTabLoad_Start"] = 529] = "Dom_ChangesTabLoad_Start";
        TraceEvents[TraceEvents["Dom_ChangesTabLoad_Stop"] = 530] = "Dom_ChangesTabLoad_Stop";
        TraceEvents[TraceEvents["Dom_LayoutTabLoad_Start"] = 531] = "Dom_LayoutTabLoad_Start";
        TraceEvents[TraceEvents["Dom_LayoutTabLoad_Stop"] = 532] = "Dom_LayoutTabLoad_Stop";
        TraceEvents[TraceEvents["Dom_EventsTabLoad_Start"] = 533] = "Dom_EventsTabLoad_Start";
        TraceEvents[TraceEvents["Dom_EventsTabLoad_Stop"] = 534] = "Dom_EventsTabLoad_Stop";
        TraceEvents[TraceEvents["Dom_TreeItemCollapse_Start"] = 535] = "Dom_TreeItemCollapse_Start";
        TraceEvents[TraceEvents["Dom_TreeItemCollapse_Stop"] = 536] = "Dom_TreeItemCollapse_Stop";
        TraceEvents[TraceEvents["Dom_Search_Start"] = 537] = "Dom_Search_Start";
        TraceEvents[TraceEvents["Dom_Search_Stop"] = 538] = "Dom_Search_Stop";
        TraceEvents[TraceEvents["Dom_RemoteInjection_Start"] = 539] = "Dom_RemoteInjection_Start";
        TraceEvents[TraceEvents["Dom_RemoteInjection_Stop"] = 540] = "Dom_RemoteInjection_Stop";
        TraceEvents[TraceEvents["Dom_EnterEditAsHtml_Start"] = 541] = "Dom_EnterEditAsHtml_Start";
        TraceEvents[TraceEvents["Dom_EnterEditAsHtml_Stop"] = 542] = "Dom_EnterEditAsHtml_Stop";
        TraceEvents[TraceEvents["Dom_CommitEditAsHtml_Start"] = 543] = "Dom_CommitEditAsHtml_Start";
        TraceEvents[TraceEvents["Dom_CommitEditAsHtml_Stop"] = 544] = "Dom_CommitEditAsHtml_Stop";
        TraceEvents[TraceEvents["Dom_CommitEditAttribute_Start"] = 545] = "Dom_CommitEditAttribute_Start";
        TraceEvents[TraceEvents["Dom_CommitEditAttribute_Stop"] = 546] = "Dom_CommitEditAttribute_Stop";
        TraceEvents[TraceEvents["Emulation_Window_Create_Start"] = 601] = "Emulation_Window_Create_Start";
        TraceEvents[TraceEvents["Emulation_Window_Create_Stop"] = 602] = "Emulation_Window_Create_Stop";
        TraceEvents[TraceEvents["Generic_Debug_1_Start"] = 701] = "Generic_Debug_1_Start";
        TraceEvents[TraceEvents["Generic_Debug_1_Stop"] = 702] = "Generic_Debug_1_Stop";
        TraceEvents[TraceEvents["Generic_Debug_2_Start"] = 703] = "Generic_Debug_2_Start";
        TraceEvents[TraceEvents["Generic_Debug_2_Stop"] = 704] = "Generic_Debug_2_Stop";
        TraceEvents[TraceEvents["Generic_Debug_3_Start"] = 705] = "Generic_Debug_3_Start";
        TraceEvents[TraceEvents["Generic_Debug_3_Stop"] = 706] = "Generic_Debug_3_Stop";
        TraceEvents[TraceEvents["Generic_Debug_4_Start"] = 707] = "Generic_Debug_4_Start";
        TraceEvents[TraceEvents["Generic_Debug_4_Stop"] = 708] = "Generic_Debug_4_Stop";
        TraceEvents[TraceEvents["Generic_Debug_5_Start"] = 709] = "Generic_Debug_5_Start";
        TraceEvents[TraceEvents["Generic_Debug_5_Stop"] = 710] = "Generic_Debug_5_Stop";
        TraceEvents[TraceEvents["Generic_Debug_6_Start"] = 711] = "Generic_Debug_6_Start";
        TraceEvents[TraceEvents["Generic_Debug_6_Stop"] = 712] = "Generic_Debug_6_Stop";
        TraceEvents[TraceEvents["Generic_Debug_7_Start"] = 713] = "Generic_Debug_7_Start";
        TraceEvents[TraceEvents["Generic_Debug_7_Stop"] = 714] = "Generic_Debug_7_Stop";
        TraceEvents[TraceEvents["Generic_Debug_8_Start"] = 715] = "Generic_Debug_8_Start";
        TraceEvents[TraceEvents["Generic_Debug_8_Stop"] = 716] = "Generic_Debug_8_Stop";
        TraceEvents[TraceEvents["Generic_Debug_9_Start"] = 717] = "Generic_Debug_9_Start";
        TraceEvents[TraceEvents["Generic_Debug_9_Stop"] = 718] = "Generic_Debug_9_Stop";
        TraceEvents[TraceEvents["Header_InitializeTabs_Start"] = 801] = "Header_InitializeTabs_Start";
        TraceEvents[TraceEvents["Header_InitializeTabs_Stop"] = 802] = "Header_InitializeTabs_Stop";
    })(Common.TraceEvents || (Common.TraceEvents = {}));
    var TraceEvents = Common.TraceEvents;
    /**
     * Entries in this enum should be registered with matching name and value in bpt\diagnostics\common\PerfTrack\PerfTrack.man.template
     * Any events that should be triggered with key metadata, should be added to this list
     * As per adding ETW events instructions http://devdiv/sites/vsclient/team/wiki/Firing%20Keyed%20ETW%20events%20for%20PerfTrack.aspx
     */
    (function (TraceEventsWithKey) {
        TraceEventsWithKey[TraceEventsWithKey["Debugger_OpenDocument_Start"] = 308] = "Debugger_OpenDocument_Start";
        TraceEventsWithKey[TraceEventsWithKey["Debugger_OpenDocument_Stop"] = 309] = "Debugger_OpenDocument_Stop";
        TraceEventsWithKey[TraceEventsWithKey["Debugger_SwitchDocument_Start"] = 312] = "Debugger_SwitchDocument_Start";
        TraceEventsWithKey[TraceEventsWithKey["Debugger_SwitchDocument_Stop"] = 313] = "Debugger_SwitchDocument_Stop";
    })(Common.TraceEventsWithKey || (Common.TraceEventsWithKey = {}));
    var TraceEventsWithKey = Common.TraceEventsWithKey;
    /// <enable code="SA9016" />
    var DefaultTraceWriter = (function () {
        function DefaultTraceWriter() {
        }
        DefaultTraceWriter.prototype.raiseEvent = function (eventId) { };
        DefaultTraceWriter.prototype.raiseEventWithMessage = function (eventId, traceMessage) { };
        DefaultTraceWriter.prototype.raiseEventWithKey = function (eventId, key, traceMessage) { };
        return DefaultTraceWriter;
    }());
    Common.DefaultTraceWriter = DefaultTraceWriter;
    var TraceWriter = (function () {
        // Constructor without the optional parameter hooks up to the tracewriter we commonly use if present.
        function TraceWriter(performanceTracer) {
            if (!performanceTracer && Microsoft.Plugin) {
                if (Microsoft.Plugin.F12) {
                    performanceTracer = Microsoft.Plugin.F12.TraceWriter;
                }
                else if (Microsoft.Plugin.VS) {
                    performanceTracer = Microsoft.Plugin.VS.Utilities.createExternalObject("PerformanceTraceExtension", "{D76A409F-7234-4B71-9BFD-DEF3DC4CCCA6}");
                }
            }
            this._performanceTracer = performanceTracer;
        }
        TraceWriter.prototype.raiseEventWithKey = function (eventId, key, traceMessage) {
            if (this._performanceTracer) {
                this._performanceTracer.raiseEventWithKey(eventId, key, traceMessage);
            }
        };
        TraceWriter.prototype.raiseEventWithMessage = function (eventId, traceMessage) {
            if (this._performanceTracer) {
                this._performanceTracer.raiseEvent(eventId, traceMessage);
            }
        };
        TraceWriter.prototype.raiseEvent = function (eventId) {
            this.raiseEventWithMessage(eventId, "");
        };
        return TraceWriter;
    }());
    Common.TraceWriter = TraceWriter;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
    /** Types of change events that can occur on IObservableCollection objects */
    (function (CollectionChangedAction) {
        CollectionChangedAction[CollectionChangedAction["Add"] = 0] = "Add";
        CollectionChangedAction[CollectionChangedAction["Remove"] = 1] = "Remove";
        CollectionChangedAction[CollectionChangedAction["Reset"] = 2] = "Reset";
        CollectionChangedAction[CollectionChangedAction["Clear"] = 3] = "Clear";
    })(Common.CollectionChangedAction || (Common.CollectionChangedAction = {}));
    var CollectionChangedAction = Common.CollectionChangedAction;
    ;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="IEventHandler.ts" />
/// <reference path="IEventRegistration.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * An event object which can have multiple listeners which are called when the event is invoked
     */
    var EventSource = (function () {
        function EventSource() {
            this._handlers = null;
            this._eventsRunning = 0;
        }
        /**
         * Adds a handler to the event.  The handler can be removed by calling dispose on the returned object, or by calling removeHandler
         * @param handler - The function to be called when the event is invoked
         * @return A disposable object which removes the handler when it's disposed
         */
        EventSource.prototype.addHandler = function (handler) {
            var _this = this;
            F12.Tools.Utility.Assert.isTrue(typeof handler === "function", "handler must be function");
            if (!this._handlers) {
                this._handlers = [];
            }
            this._handlers.push(handler);
            return { unregister: function () { return _this.removeHandler(handler); } };
        };
        /**
         * Adds a handler which is called on the next invokation of the event, and then the handler is removed
         * @param handler - The handler to be called on the next invokation of the the event
         * @return A disposable object which removes the handler when it's disposed
         */
        EventSource.prototype.addOne = function (handler) {
            var registration = this.addHandler(function (args) {
                registration.unregister();
                handler(args);
            });
            return registration;
        };
        /**
         * Removes a handler from the list of handlers.  This can also be called by disposing the object returned from an
         * add call
         * @param handler - The event handler to remove
         */
        EventSource.prototype.removeHandler = function (handler) {
            F12.Tools.Utility.Assert.hasValue(this._handlers && this._handlers.length, "Shouldn't call remove before add");
            var i = this._handlers.length;
            while (i--) {
                if (this._handlers[i] === handler) {
                    if (this._eventsRunning > 0) {
                        this._handlers[i] = null;
                    }
                    else {
                        this._handlers.splice(i, 1);
                    }
                    return;
                }
            }
            F12.Tools.Utility.Assert.fail("Called remove on a handler which wasn't added");
        };
        /**
         * Invokes the event with the specified args
         * @param args - The event args to pass to each handler
         */
        EventSource.prototype.invoke = function (args) {
            if (this._handlers) {
                this._eventsRunning++;
                for (var i = 0; i < this._handlers.length; i++) {
                    this._handlers[i] && this._handlers[i](args);
                }
                this._eventsRunning--;
                if (this._eventsRunning === 0) {
                    this.cleanupNullHandlers();
                }
            }
        };
        /**
         * Invokes the event with the sepecified args and waits for the
         * returns a promise that completes when all the async handlers complete
         * @param args - The event args to pass to each handler
         */
        EventSource.prototype.invokeAsync = function (args) {
            if (this._handlers) {
                this._eventsRunning++;
                var promises = [];
                for (var i = 0; i < this._handlers.length; i++) {
                    var promise = this._handlers[i] && this._handlers[i](args);
                    if (promise && promise.then) {
                        promises.push(promise);
                    }
                }
                this._eventsRunning--;
                if (this._eventsRunning === 0) {
                    this.cleanupNullHandlers();
                }
                return Microsoft.Plugin.Promise.join(promises);
            }
            return Microsoft.Plugin.Promise.wrap(null);
        };
        /**
         * Event handlers that get removed while an invoke() is still iterating are set to null instead of
         * being removed from this._handlers. This method executes after all invocations finish.
         */
        EventSource.prototype.cleanupNullHandlers = function () {
            for (var i = this._handlers.length - 1; i >= 0; i--) {
                if (!this._handlers[i]) {
                    this._handlers.splice(i, 1);
                }
            }
        };
        return EventSource;
    }());
    Common.EventSource = EventSource;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="CollectionChangedAction.ts" />
/// <reference path="../EventSource.ts" />
var Common;
(function (Common) {
    "use strict";
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="IObservable.ts" />
var Common;
(function (Common) {
    "use strict";
    /** An object which fires propertyChanged events when its properties are updated */
    var Observable = (function () {
        function Observable() {
            this.propertyChanged = new Common.EventSource();
        }
        /**
         * Generates an ObservableObject from a given plain object.  The returned object
         * matches the shape of the supplied object, but with an additional propertyChanged
         * event source that can be subscribed to.
         */
        Observable.fromObject = function (obj) {
            // Prevent re-wrapping objects that statisfy IObservable already
            if (typeof obj.propertyChanged !== "undefined") {
                return obj;
            }
            var returnValue = new Observable();
            var backingData = {};
            Object.defineProperties(returnValue, ObservableHelpers.expandProperties(obj, backingData, returnValue));
            returnValue["_backingData"] = backingData;
            return returnValue;
        };
        return Observable;
    }());
    Common.Observable = Observable;
    /** Helper methods for the ObservableObject class */
    var ObservableHelpers = (function () {
        function ObservableHelpers() {
        }
        /**
         * Defines an observable property on a class' prototype
         * @param classToExtend The class which should be extended
         * @param propertyName The name of the property to add
         * @param onChanged Callback to handle value changes
         * @param onChanging Callback gets called before changing the value
         * @param defaultValue The initial value of the property
         */
        ObservableHelpers.defineProperty /*<T>*/ = function (classToExtend, propertyName, defaultValue /*T*/, onChanged, onChanging) {
            var backingFieldName = "_" + propertyName;
            Object.defineProperty(classToExtend.prototype, propertyName, {
                get: function () {
                    if (typeof this[backingFieldName] === "undefined") {
                        this[backingFieldName] = defaultValue;
                    }
                    return this[backingFieldName];
                },
                set: function (newValue) {
                    var oldValue = this[backingFieldName];
                    if (newValue !== oldValue) {
                        if (onChanging) {
                            onChanging(this, oldValue, newValue);
                        }
                        this[backingFieldName] = newValue;
                        var observable = this;
                        observable.propertyChanged.invoke(propertyName);
                        if (onChanged) {
                            onChanged(this, oldValue, newValue);
                        }
                    }
                }
            });
        };
        /**
         * Creates a PropertyDescriptor for a given property on a given object and stores backing data in a supplied dictionary object
         * for the purpose of generating a property that invokes a propertyChanged event when it is updated.
         * @param propertyName The property to generate a descriptor for
         * @param objectShape The plain object which contains the property in question
         * @param backingDataStore The object which will contain the backing data for the property that is generated
         * @param invokableObserver The observer which will receive the propertyChanged event when the property is changed
         */
        ObservableHelpers.describePropertyForObjectShape = function (propertyName, objectShape, backingDataStore, invokableObserver) {
            var returnValue = {
                get: function () { return backingDataStore[propertyName]; },
                enumerable: true
            };
            var propertyValue = objectShape[propertyName];
            if (typeof propertyValue === "object") {
                // Wrap objects in observers of their own
                backingDataStore[propertyName] = Observable.fromObject(propertyValue);
                returnValue.set = function (value) {
                    if (value !== backingDataStore[propertyName]) {
                        // Additionally, ensure that objects which replace this value are wrapped again
                        backingDataStore[propertyName] = Observable.fromObject(value);
                        invokableObserver.propertyChanged.invoke(propertyName);
                    }
                };
            }
            else {
                backingDataStore[propertyName] = propertyValue;
                returnValue.set = function (value) {
                    if (value !== backingDataStore[propertyName]) {
                        backingDataStore[propertyName] = value;
                        invokableObserver.propertyChanged.invoke(propertyName);
                    }
                };
            }
            return returnValue;
        };
        /**
         * Creates a PropertyDescriptorMap of all the enumerated properties on a given object and stores backing data
         * for each property in a supplied dictionary object for the purpose of generating equivalent properties,
         * matching the shape of the supplied object, which fire propertyChanged events when they are updated.
         * @param objectShape The plain object which we want to obtain properties for
         * @param backingDataStore The object which will contain the backing data for the properties that are generated
         * @param invokableObserver The observer which will receive the propertyChanged events when the properties are changed
         */
        ObservableHelpers.expandProperties = function (objectShape, backingDataStore, invokableObserver) {
            var properties = {};
            // Traverse prototype chain for all properties
            for (var propertyName in objectShape) {
                properties[propertyName] = ObservableHelpers.describePropertyForObjectShape(propertyName, objectShape, backingDataStore, invokableObserver);
            }
            return properties;
        };
        return ObservableHelpers;
    }());
    Common.ObservableHelpers = ObservableHelpers;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
    /**
     * Defines constants used with the template control and data binding
     */
    var TemplateDataAttributes = (function () {
        function TemplateDataAttributes() {
        }
        TemplateDataAttributes.BINDING = "data-binding";
        TemplateDataAttributes.CONTROL = "data-control";
        TemplateDataAttributes.NAME = "data-name";
        TemplateDataAttributes.CONTROL_TEMPLATE_ID = TemplateDataAttributes.CONTROL + "-templateId";
        TemplateDataAttributes.CONTROL_BINDING = "data-controlbinding";
        TemplateDataAttributes.OPTIONS = "data-options";
        TemplateDataAttributes.TEMPLATE_ID_OPTION = TemplateDataAttributes.OPTIONS + "-templateId";
        return TemplateDataAttributes;
    }());
    Common.TemplateDataAttributes = TemplateDataAttributes;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../Assert.ts" />
/// <reference path="ITemplateRepository.ts" />
// The ControlTemplates module is used to host all auto-generated templates.
// Before using the module below, we need to make sure it's declared first.
// This way we don't depend on what order the auto-genreated template file is injected or added.
var ControlTemplates;
(function (ControlTemplates) {
    var PlaceHolder = (function () {
        function PlaceHolder() {
        }
        return PlaceHolder;
    }());
})(ControlTemplates || (ControlTemplates = {}));
var Common;
(function (Common) {
    "use strict";
    /**
     * Implements a template repository used to access the templates
     * hosted in script.
     */
    var ScriptTemplateRepository = (function () {
        /**
         * Constructor
         * @param container The root object of where all script repository belongs
         */
        function ScriptTemplateRepository(container) {
            F12.Tools.Utility.Assert.hasValue(container, "Invalid template container.");
            this._container = container;
            this._registeredTemplates = {};
        }
        /**
         * Gets the template string using the template Id.
         * @param templateId The template ID
         * @return The template string
         */
        ScriptTemplateRepository.prototype.getTemplateString = function (templateId) {
            F12.Tools.Utility.Assert.isTrue(!!templateId, "Invalid template ID.");
            var template;
            // First lookup in the registry, otherwise use the container
            template = this._registeredTemplates[templateId];
            if (!template) {
                var container = this._container;
                var templateParts = templateId.split(".");
                for (var i = 0; i < templateParts.length; i++) {
                    var part = templateParts[i];
                    container = container[part];
                    F12.Tools.Utility.Assert.isTrue(!!container, "Couldn't find the template with the given ID '" + templateId + "'.");
                }
                template = container;
            }
            F12.Tools.Utility.Assert.areEqual(typeof template, "string", "The given template name doesn't point to a template.");
            return template;
        };
        /**
         * Register the given html with the repository
         * @param templateId The template ID. Must be unique.
         * @param html The html content of the template
         */
        ScriptTemplateRepository.prototype.registerTemplateString = function (templateId, html) {
            F12.Tools.Utility.Assert.isTrue(!!templateId, "Invalid template ID.");
            F12.Tools.Utility.Assert.isUndefined(this._registeredTemplates[templateId], "Template with id '" + templateId + "' already registered.");
            this._registeredTemplates[templateId] = html;
        };
        return ScriptTemplateRepository;
    }());
    Common.ScriptTemplateRepository = ScriptTemplateRepository;
    /**
     * The global templateRepository member is an instance of ScriptTemplateRepository
     */
    Common.templateRepository = new ScriptTemplateRepository(ControlTemplates);
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../Assert.ts" />
/// <reference path="../IControl.ts" />
/// <reference path="ITemplateRepository.ts" />
/// <reference path="TemplateControl.ts" />
/// <reference path="TemplateDataAttributes.ts" />
/// <reference path="ScriptTemplateRepository.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * Defines the template loader used to load templates, resolve template placeholders and then generate
     * HTML root element from the template.
     */
    var TemplateLoader = (function () {
        /**
         * Constructor
         * @param repository The repository used to find template strings
         */
        function TemplateLoader(repository) {
            F12.Tools.Utility.Assert.hasValue(repository, "Invalid template repository.");
            this._parsingNode = document.createElement("div");
            this._repository = repository;
            this._templateCache = {};
            this._visitedControls = {};
            this._visitedTemplates = {};
        }
        Object.defineProperty(TemplateLoader.prototype, "repository", {
            /**
             * Gets the repository used to host html contents with this loader
             */
            get: function () {
                return this._repository;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets the control type from the given control full name
         * @param controlName The fully qualified name of the control
         * @return The control type
         */
        TemplateLoader.getControlType = function (controlName) {
            F12.Tools.Utility.Assert.isTrue(!!controlName, "Invalid control name.");
            var controlType = window;
            var nameParts = controlName.split(".");
            for (var i = 0; i < nameParts.length; i++) {
                var part = nameParts[i];
                controlType = controlType[part];
                F12.Tools.Utility.Assert.hasValue(controlType, "Couldn't find the control with the given name '" + controlName + "'.");
            }
            F12.Tools.Utility.Assert.areEqual(typeof controlType, "function", "The given control '" + controlName + "' doesn't represent a control type which implements IControl.");
            return controlType;
        };
        /**
         * Loads the template providing its templateId. Caches the loaded templates by their templateId.
         * @param templateId The template ID to get the HTML for
         * @return The HTML element root for the template
         */
        TemplateLoader.prototype.loadTemplate = function (templateId) {
            var cachedElement = this._templateCache[templateId];
            if (!cachedElement) {
                var template = this._repository.getTemplateString(templateId);
                F12.Tools.Utility.Assert.isFalse(this._visitedTemplates[templateId], "Detected a recursive template. TemplateId '" + templateId + "' is part of the parents hierarchy.");
                this._visitedTemplates[templateId] = true;
                try {
                    cachedElement = this.loadTemplateUsingHtml(template);
                }
                finally {
                    this._visitedTemplates[templateId] = false;
                }
                this._templateCache[templateId] = cachedElement;
            }
            var rootElement = cachedElement.cloneNode(true);
            rootElement = this.resolvePlaceholders(rootElement);
            return rootElement;
        };
        /**
         * Loads the template providing the HTML string for the template.
         * @param templateHtml An HTML string for the template
         * @return The HTML element root for the template
         */
        TemplateLoader.prototype.loadTemplateUsingHtml = function (templateHtml) {
            this._parsingNode.innerHTML = templateHtml;
            F12.Tools.Utility.Assert.areEqual(this._parsingNode.childElementCount, 1, "Template should have only one root element.");
            var rootElement = this._parsingNode.children[0];
            // No use for the parsing node anymore. So, disconnect the rootElement from it.
            this._parsingNode.removeChild(rootElement);
            return rootElement;
        };
        TemplateLoader.prototype.getControlInstance = function (controlName, templateId) {
            F12.Tools.Utility.Assert.isTrue(!!controlName, "Invalid control name.");
            var controlType = TemplateLoader.getControlType(controlName);
            var control;
            // For template controls, pass the templateId to the constructor
            if (Common.TemplateControl.prototype.isPrototypeOf(controlType.prototype) ||
                Common.TemplateControl.prototype === controlType.prototype) {
                control = new controlType(templateId);
            }
            else {
                control = new controlType();
            }
            F12.Tools.Utility.Assert.hasValue(control.rootElement, "The given control '" + controlName + "' doesn't represent a control type which implements IControl.");
            // Attach the control to the root element if it's not yet attached
            if (control.rootElement.control !== control) {
                control.rootElement.control = control;
            }
            return control;
        };
        TemplateLoader.prototype.resolvePlaceholders = function (root) {
            // Test the node itself, otherwise test its children
            if (root.hasAttribute(Common.TemplateDataAttributes.CONTROL)) {
                root = this.resolvePlaceholder(root);
            }
            else {
                // Resolve all children
                var placeholders = root.querySelectorAll("div[" + Common.TemplateDataAttributes.CONTROL + "]");
                var placeholdersCount = placeholders.length;
                for (var i = 0; i < placeholdersCount; i++) {
                    var node = placeholders[i];
                    this.resolvePlaceholder(node);
                }
            }
            return root;
        };
        TemplateLoader.prototype.resolvePlaceholder = function (node) {
            F12.Tools.Utility.Assert.isFalse(node.hasChildNodes(), "Control placeholders cannot have children.");
            var controlName = node.getAttribute(Common.TemplateDataAttributes.CONTROL);
            var templateId = node.getAttribute(Common.TemplateDataAttributes.CONTROL_TEMPLATE_ID);
            var controlVisistedKey = controlName + (templateId ? "," + templateId : "");
            F12.Tools.Utility.Assert.isFalse(this._visitedControls[controlVisistedKey], "Detected a recursive control. Control '" + controlVisistedKey + "' is part of the parents hierarchy.");
            this._visitedControls[controlVisistedKey] = true;
            try {
                var controlInstance = this.getControlInstance(controlName, templateId);
            }
            finally {
                this._visitedControls[controlVisistedKey] = false;
            }
            var controlNode = controlInstance.rootElement;
            // Copy all properties from original node to the new node
            for (var i = 0; i < node.attributes.length; i++) {
                var sourceAttribute = node.attributes[i];
                controlNode.setAttribute(sourceAttribute.name, sourceAttribute.value);
            }
            if (node.parentElement) {
                node.parentElement.replaceChild(controlNode, node);
            }
            return controlNode;
        };
        return TemplateLoader;
    }());
    Common.TemplateLoader = TemplateLoader;
    /**
     * The global templateLoader member
     */
    Common.templateLoader = new TemplateLoader(Common.templateRepository);
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    "use strict";
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../Assert.ts" />
/// <reference path="../EventSource.ts" />
/// <reference path="IConverter.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * Access the target using properties, ex: obj[prop]
     */
    Common.targetAccessViaProperty = {
        getValue: function (target, prop) { return target[prop]; },
        isValueSupported: function (value, isConverter) {
            // - undefined is always not allowed
            // - null is allowed only if returned from a converter
            return value !== undefined && (isConverter || value !== null);
        },
        setValue: function (target, prop, value) { target[prop] = value; }
    };
    /**
     * Access the target by calling getAttribute/setAttribute. This is used with HTMLElements in some scenarios.
     */
    Common.targetAccessViaAttribute = {
        getValue: function (target, prop) { return target.getAttribute(prop); },
        isValueSupported: function (value, isConverter) {
            // All values are allowed. Undefined and null have special treatment in setValue.
            return true;
        },
        setValue: function (target, prop, value) {
            if (value === null || value === undefined) {
                target.removeAttribute(prop);
            }
            else {
                target.setAttribute(prop, value);
            }
        }
    };
    /**
     * A binding class which keeps the property value in sync between to objects.  It listens to the .changed event or the dom "onchange" event.
     * The binding is released by calling unbind
     */
    var Binding = (function () {
        /**
         * @constructor
         * @param source - The object to get the value from
         * @param sourceExpression - A property or property chain of the named property to retrieve from source can contain . but not []
         * @param destination - The object to assign the value to
         * @param destinationProperty - The property on destination which will receive the value.  Cannot contain . or []
         * @param converter - The function to convert from the value on source to the value on destination, default is no conversion
         * @param mode - The binding mode 'oneway' (default) or 'twoway'.  TwoWay binding will copy the value from destination to source when destination changes
         * @param targetAccess - An accessor object which provides us options between accessing the members of the target via attribute or property. Default is
         * Common.targetAccessViaProperty. Other option is Common.targetAccessViaAttribute
         */
        function Binding(source, sourceExpression, destination, destinationProperty, converter, mode, targetAccess) {
            var _this = this;
            // Validation
            F12.Tools.Utility.Assert.hasValue(sourceExpression, "sourceExpression");
            F12.Tools.Utility.Assert.hasValue(destination, "destination");
            F12.Tools.Utility.Assert.hasValue(destinationProperty, "destinationProperty");
            // Default the mode to OneWay
            mode = mode || Binding.ONE_WAY_MODE;
            var expressionParts = sourceExpression.split(".");
            this._source = null;
            this._sourceChangedRegistration = null;
            this._destChangedRegistration = null;
            this._sourceProperty = expressionParts[0];
            this._childBinding = null;
            this._paused = false;
            this._twoWay = false;
            this._converter = converter;
            this._destination = destination;
            this._destinationProperty = destinationProperty;
            this._targetAccess = targetAccess || Common.targetAccessViaProperty;
            // If there is more than one property in the sourceExpression, we have to create a child binding
            if (expressionParts.length > 1) {
                expressionParts.splice(0, 1);
                this._childBinding = new Binding(null, expressionParts.join("."), destination, destinationProperty, converter, mode, this._targetAccess);
            }
            else if (mode.toLowerCase() === Binding.TWO_WAY_MODE) {
                this._twoWay = true;
                this._destChangedRegistration = this.attachChangeHandler(destination, function (e) {
                    var propertyName = e;
                    if (typeof propertyName !== "string" || propertyName === null || propertyName === _this._destinationProperty) {
                        _this.updateSourceFromDest();
                    }
                });
            }
            this.setSource(source);
        }
        /**
         * Determines if the current binding is for the given destination and property
         */
        Binding.prototype.isForDestination = function (destination, destinationProperty) {
            return destination === this._destination && destinationProperty === this._destinationProperty;
        };
        /**
         * Unbinds the binding to clean up any object references and prevent any further updates from happening
         */
        Binding.prototype.unbind = function () {
            this._source = null;
            if (this._sourceChangedRegistration) {
                this._sourceChangedRegistration.unregister();
                this._sourceChangedRegistration = null;
            }
            if (this._childBinding) {
                this._childBinding.unbind();
                this._childBinding = null;
            }
            if (this._destChangedRegistration) {
                this._destChangedRegistration.unregister();
                this._destChangedRegistration = null;
            }
        };
        /**
         * Updates the source value when the destination value changes
         */
        Binding.prototype.updateSourceFromDest = function () {
            if (this._source && this._twoWay) {
                this._paused = true;
                var destValue = this._targetAccess.getValue(this._destination, this._destinationProperty);
                if (this._converter) {
                    destValue = this._converter.convertFrom(destValue);
                }
                this._source[this._sourceProperty] = destValue;
                this._paused = false;
            }
        };
        /**
         * Updates the destination or childBinding with the value from source
         * TODO: Once INotifyPropertyChanged or similar has been added, use the name property from that to filter this
         */
        Binding.prototype.updateDestination = function () {
            if (this._paused) {
                return;
            }
            this._paused = true;
            var value = this.getValue();
            if (this._childBinding) {
                this._childBinding.setSource(value);
            }
            else {
                // If the source is not set, we don't want to call the converter
                var hasConverter = !!this._source && !!this._converter;
                if (hasConverter) {
                    value = this._converter.convertTo(value);
                }
                if (this._targetAccess.isValueSupported(value, !!hasConverter)) {
                    this._targetAccess.setValue(this._destination, this._destinationProperty, value);
                }
            }
            this._paused = false;
        };
        /**
         * Sets the source of the binding.  In the case of a child binding, this updates as the parent binding's value changes
         * @param source - The source object that the binding is listening to
         */
        Binding.prototype.setSource = function (source) {
            var _this = this;
            // Dispose the previous source change handler first
            if (this._sourceChangedRegistration) {
                this._sourceChangedRegistration.unregister();
                this._sourceChangedRegistration = null;
            }
            this._source = source;
            // Listen to change event on the new source
            if (this._source) {
                this._sourceChangedRegistration = this.attachChangeHandler(this._source, function (propertyName) {
                    if (typeof propertyName !== "string" || propertyName === null || propertyName === _this._sourceProperty) {
                        _this.updateDestination();
                    }
                });
            }
            this.updateDestination();
            this.updateSourceFromDest();
        };
        /**
         * Attaches a change handler to obj and returns an object that can be disposed to remove the handler
         * Prefers obj.propertyChanged, but will use the dom onchange event if that doesn't exist
         * @param obj - The object to listen for changes on
         * @param handler - The function to be called when a change occurs
         * @return An object that can be disposed to remove the change handler
         */
        Binding.prototype.attachChangeHandler = function (obj, handler) {
            if (obj.propertyChanged) {
                return obj.propertyChanged.addHandler(handler);
            }
            else {
                var element = obj;
                if ((element.tagName === "INPUT" || element.tagName === "SELECT") &&
                    element.addEventListener && element.removeEventListener) {
                    element.addEventListener("change", handler);
                    return { unregister: function () { return element.removeEventListener("change", handler); } };
                }
            }
        };
        /**
         * Gets the current value from the source object
         * @return The current value from the source object
         */
        Binding.prototype.getValue = function () {
            return this._source && this._source[this._sourceProperty];
        };
        /** The string used to signify one way binding */
        Binding.ONE_WAY_MODE = "oneway";
        /** The string used to signify two way binding */
        Binding.TWO_WAY_MODE = "twoway";
        return Binding;
    }());
    Common.Binding = Binding;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../IControl.ts" />
/// <reference path="../Binding/Binding.ts" />
/// <reference path="TemplateControl.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * Holds all the binding relationships for the control.
     */
    var TemplateDataBinding = (function () {
        /**
         * @param control The template control to create the binding relationships for
         */
        function TemplateDataBinding(control) {
            this._bindings = TemplateDataBinding.bind(control);
        }
        /**
         * Find the binding that represents the given destination and destination property
         * @param destination The destination object
         * @param destinationProperty The name of the destination property
         * @returns The binding object which represents the given destination
         */
        TemplateDataBinding.prototype.findBinding = function (destination, destinationProperty) {
            var binding;
            if (this._bindings) {
                for (var i = 0; i < this._bindings.length; i++) {
                    var currBinding = this._bindings[i];
                    if (currBinding.isForDestination(destination, destinationProperty)) {
                        binding = currBinding;
                        break;
                    }
                }
            }
            return binding;
        };
        /**
         * Unbind all the binding relationships
         */
        TemplateDataBinding.prototype.unbind = function () {
            if (this._bindings) {
                for (var i = 0; i < this._bindings.length; i++) {
                    this._bindings[i].unbind();
                }
            }
            this._bindings = null;
        };
        TemplateDataBinding.buildBindingCommand = function (target, element, targetName, bindingSource, value) {
            var targetAccess = Common.targetAccessViaProperty;
            if (target === element) {
                // 1- if the target name begins with 'style.', change the target to be the style object and remove the 'style.' prefix.
                // 2- if the target name begins with 'attr-', use the attribute access method on the target and remove the 'attr-' prefix.
                // 3- if the target name begins with 'control.', change the target to be the control object and remove the 'control.' prefix.
                if (targetName.substr(0, TemplateDataBinding.STYLE_PREFIX.length) === TemplateDataBinding.STYLE_PREFIX) {
                    target = element.style;
                    targetName = targetName.substr(TemplateDataBinding.STYLE_PREFIX.length);
                }
                else if (targetName.substr(0, TemplateDataBinding.ATTRIBUTE_PREFIX.length) === TemplateDataBinding.ATTRIBUTE_PREFIX) {
                    targetName = targetName.substr(TemplateDataBinding.ATTRIBUTE_PREFIX.length);
                    targetAccess = Common.targetAccessViaAttribute;
                }
                else if (targetName.substr(0, TemplateDataBinding.CONTROL_PREFIX.length) === TemplateDataBinding.CONTROL_PREFIX) {
                    var elementControlLink = element;
                    target = elementControlLink.control;
                    targetName = targetName.substr(TemplateDataBinding.CONTROL_PREFIX.length);
                }
            }
            var bindingCommand = {
                target: target,
                targetAccess: targetAccess,
                targetName: targetName,
                source: bindingSource,
                value: value
            };
            return bindingCommand;
        };
        /**
         * The syntax for the binding statement:
         *   binding statement =    binding[, <binding statement>]
         *   binding           =    targetName:sourceName[; mode=(oneway|twoway); converter=<converter id>]
         */
        TemplateDataBinding.extractBindingCommandsForBinding = function (commands, target, element, allBindings, isControlBinding) {
            var bindings = allBindings.split(",");
            var bindingsCount = bindings.length;
            for (var i = 0; i < bindingsCount; i++) {
                var binding = bindings[i];
                var keyValue = binding.split(":", 2);
                F12.Tools.Utility.Assert.areEqual(keyValue.length, 2, "Invalid binding syntax, the keyvalue pair should have the syntax target:source '" + binding + "'.");
                var targetName = keyValue[0].trim();
                var sourceSyntax = keyValue[1].trim();
                var bindingSource = TemplateDataBinding.parseSourceSyntax(sourceSyntax);
                // For data binding, assume it's a control binding and add the model accessor at the front
                if (!isControlBinding) {
                    bindingSource.name = TemplateDataBinding.MODEL_PREFIX + bindingSource.name;
                }
                var bindingCommand = TemplateDataBinding.buildBindingCommand(target, element, targetName, bindingSource, /*value=*/ null);
                F12.Tools.Utility.Assert.isTrue(!!bindingCommand.targetName, "Invalid binding syntax. Target name is missing '" + binding + "'.");
                commands.push(bindingCommand);
            }
        };
        /**
         * The syntax for the option statement:
         *   option statement =    option[, <option statement>]
         *   option           =    targetName:value[; converter=<converter id>]
         */
        TemplateDataBinding.extractBindingCommandsForOptions = function (commands, target, element, allOptions) {
            var options = allOptions.split(",");
            var optionsCount = options.length;
            for (var i = 0; i < optionsCount; i++) {
                var option = options[i];
                var keyValue = option.split(":", 2);
                F12.Tools.Utility.Assert.areEqual(keyValue.length, 2, "Invalid options syntax, the keyvalue pair should have the syntax target:source '" + option + "'.");
                var targetName = keyValue[0].trim();
                var valueSyntax = keyValue[1].trim();
                // Get the converter and convert the value if it is present
                var valueSource = TemplateDataBinding.parseSourceSyntax(valueSyntax);
                var value = valueSource.name;
                if (valueSource.converter && valueSource.converter.convertTo) {
                    value = valueSource.converter.convertTo(value);
                }
                var bindingCommand = TemplateDataBinding.buildBindingCommand(target, element, targetName, /*bindingSource=*/ null, value);
                F12.Tools.Utility.Assert.isTrue(!!bindingCommand.targetName, "Invalid option syntax. Target name is missing '" + option + "'.");
                commands.push(bindingCommand);
            }
        };
        /**
         * Gets all the binding commands which will be used to create the
         * binding relationships
         * @param control The control to work on
         * @return An array of all the binding commands extracted from the control
         */
        TemplateDataBinding.getBindingCommands = function (control) {
            var bindingCommands;
            var elements = [];
            elements.push(control.rootElement);
            while (elements.length > 0) {
                var element = elements.pop();
                var childControl = element.control;
                // The target for the binding is always the element except for a child control in this case the target becomes the child control.
                var target = element;
                if (childControl && childControl !== control) {
                    target = childControl;
                }
                if (target) {
                    var attr;
                    attr = element.getAttributeNode(Common.TemplateDataAttributes.BINDING);
                    if (attr) {
                        bindingCommands = bindingCommands || [];
                        TemplateDataBinding.extractBindingCommandsForBinding(bindingCommands, target, element, attr.value, false /* isControlBinding */);
                        element.removeAttributeNode(attr);
                    }
                    attr = element.getAttributeNode(Common.TemplateDataAttributes.CONTROL_BINDING);
                    if (attr) {
                        bindingCommands = bindingCommands || [];
                        TemplateDataBinding.extractBindingCommandsForBinding(bindingCommands, target, element, attr.value, true /* isControlBinding */);
                        element.removeAttributeNode(attr);
                    }
                    attr = element.getAttributeNode(Common.TemplateDataAttributes.OPTIONS);
                    if (attr) {
                        bindingCommands = bindingCommands || [];
                        // The target for options is always the control except if it's an element
                        var optionsTarget = childControl || element;
                        TemplateDataBinding.extractBindingCommandsForOptions(bindingCommands, optionsTarget, element, attr.value);
                        element.removeAttributeNode(attr);
                    }
                }
                // Don't traverse through control children elements
                if (element.children && (!element.hasAttribute(Common.TemplateDataAttributes.CONTROL) || element === control.rootElement)) {
                    var childrenCount = element.children.length;
                    for (var i = 0; i < childrenCount; i++) {
                        elements.push(element.children[i]);
                    }
                }
            }
            return bindingCommands;
        };
        /**
         * Gets all the binding relationships from the given control
         * @param control The control to work on
         * @return An array of all the binding relationships extracted from the control
         */
        TemplateDataBinding.bind = function (control) {
            var bindings;
            var bindingCommands = TemplateDataBinding.getBindingCommands(control);
            if (bindingCommands) {
                bindings = [];
                var bindingCommandsCount = bindingCommands.length;
                for (var i = 0; i < bindingCommandsCount; i++) {
                    var bindingCommand = bindingCommands[i];
                    if (bindingCommand.source) {
                        // Create a binding to the control target
                        var binding = new Common.Binding(control, // source
                        bindingCommand.source.name, bindingCommand.target, bindingCommand.targetName, bindingCommand.source.converter, bindingCommand.source.mode, bindingCommand.targetAccess);
                        bindings.push(binding);
                    }
                    else if (bindingCommand.value !== undefined) {
                        // Assign the value
                        bindingCommand.targetAccess.setValue(bindingCommand.target, bindingCommand.targetName, bindingCommand.value);
                    }
                }
            }
            return bindings && bindings.length > 0 ? bindings : null;
        };
        /**
         * Get the converter instance for the given identifier
         * @param identifier The full id for the converter
         * @return The converter instance
         */
        TemplateDataBinding.getConverterInstance = function (identifier) {
            var obj = window;
            var parts = identifier.split(".");
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                obj = obj[part];
                F12.Tools.Utility.Assert.hasValue(obj, "Couldn't find the converter instance with the given name '" + identifier + "'.");
            }
            F12.Tools.Utility.Assert.hasValue(obj.convertFrom || obj.convertTo, "The converter instance with the given name '" + identifier + "' doesn't point to a valid converter instance.");
            return obj;
        };
        /**
         * Parse the source syntax extracting the source id, mode and converter
         * @param syntax The binding syntax
         * @return The binding source object
         */
        TemplateDataBinding.parseSourceSyntax = function (syntax) {
            F12.Tools.Utility.Assert.isTrue(!!syntax, "Invalid binding syntax.");
            var parts = syntax.split(";");
            var bindingSource = {
                name: parts[0].trim()
            };
            for (var i = 1; i < parts.length; i++) {
                var keyValue = parts[i].split("=", 2);
                F12.Tools.Utility.Assert.areEqual(keyValue.length, 2, "Invalid binding syntax, the keyvalue pair should have the syntax key=value.");
                switch (keyValue[0].trim().toLowerCase()) {
                    case "mode":
                        bindingSource.mode = keyValue[1].trim().toLowerCase();
                        break;
                    case "converter":
                        bindingSource.converter = TemplateDataBinding.getConverterInstance(keyValue[1].trim());
                        break;
                }
            }
            return bindingSource;
        };
        TemplateDataBinding.ATTRIBUTE_PREFIX = "attr-";
        TemplateDataBinding.MODEL_PREFIX = "model.";
        TemplateDataBinding.STYLE_PREFIX = "style.";
        TemplateDataBinding.CONTROL_PREFIX = "control.";
        return TemplateDataBinding;
    }());
    Common.TemplateDataBinding = TemplateDataBinding;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../IControl.ts" />
/// <reference path="../Model/Observable.ts" />
/// <reference path="TemplateLoader.ts" />
/// <reference path="TemplateDataBinding.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * A template control used to create controls from templates and uses data binding
     */
    var TemplateControl = (function (_super) {
        __extends(TemplateControl, _super);
        /**
         * Constructor
         * @param templateId The templateId to use with this control. If not provided the template root will be a <div> element.
         */
        function TemplateControl(templateId) {
            _super.call(this);
            // Call onInitialize before we set the rootElement
            this.onInitializeOverride();
            this._templateId = templateId;
            this.setRootElementFromTemplate();
        }
        Object.defineProperty(TemplateControl.prototype, "model", {
            /**
             * Gets the data model assigned to the control
             */
            get: function () {
                return this._model;
            },
            /**
             * Sets the data model on the control
             */
            set: function (value) {
                if (this._model !== value) {
                    this._model = value;
                    this.propertyChanged.invoke(TemplateControl.ModelPropertyName);
                    this.onModelChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateControl.prototype, "tabIndex", {
            /**
             * Gets the tabIndex value for the control.
             */
            get: function () {
                if (this._tabIndex) {
                    return this._tabIndex;
                }
                return 0;
            },
            /**
             * Sets the tabIndex value for the control.
             */
            set: function (value) {
                if (this._tabIndex !== value) {
                    var oldValue = this._tabIndex;
                    this._tabIndex = value >> 0; // Making sure the passed value is a number
                    this.propertyChanged.invoke(TemplateControl.TabIndexPropertyName);
                    this.onTabIndexChanged(oldValue, this._tabIndex);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateControl.prototype, "templateId", {
            /**
             * Gets the templateId used on the control
             */
            get: function () {
                return this._templateId;
            },
            /**
             * Sets a new templateId on the control
             */
            set: function (value) {
                if (this._templateId !== value) {
                    this._templateId = value;
                    this._binding.unbind();
                    this.setRootElementFromTemplate();
                    this.propertyChanged.invoke(TemplateControl.TemplateIdPropertyName);
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Static constructor used to initialize observable properties
         */
        TemplateControl.initialize = function () {
            Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.ClassNamePropertyName, /*defaultValue=*/ null, function (obj, oldValue, newValue) { return obj.onClassNameChanged(oldValue, newValue); });
            Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.IsEnabledPropertyName, /*defaultValue=*/ true, function (obj) { return obj.onIsEnabledChanged(); });
            Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.IsVisiblePropertyName, /*defaultValue=*/ true, function (obj) { return obj.onIsVisibleChanged(); });
            Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.TooltipPropertyName, /*defaultValue=*/ null, function (obj) { return obj.onTooltipChanged(); });
        };
        /**
         * Gets the binding that represents the given destination and destination property
         * @param destination The destination object
         * @param destinationProperty The name of the destination property
         * @returns the binding object that is associated with the given destination
         */
        TemplateControl.prototype.getBinding = function (destination, destinationProperty) {
            var binding;
            if (this._binding) {
                binding = this._binding.findBinding(destination, destinationProperty);
            }
            return binding;
        };
        /**
         * Protected virtual function used to notify subclasses that the template has changed
         */
        TemplateControl.prototype.onApplyTemplate = function () {
            this.onClassNameChanged(null, this.className);
            this.onIsVisibleChanged();
            this.onTabIndexChanged(null, this._tabIndex);
            this.onTooltipChanged();
        };
        /**
         * Protected virtual function called when initializing the control instance
         */
        TemplateControl.prototype.onInitializeOverride = function () {
        };
        /**
         * Protected virtual function used to notify subclasses that the model has changed
         */
        TemplateControl.prototype.onModelChanged = function () {
        };
        /**
         * Protected virtual function used to notify subclasses that the template is about to change.
         * Can used to perform cleanup on the previous root element
         */
        TemplateControl.prototype.onTemplateChanging = function () {
        };
        /**
         * Helper method to get a named control direct child from the subtree of the control, ignoring nested controls
         */
        TemplateControl.prototype.getNamedControl = function (name) {
            var element = this.getNamedElement(name);
            if (!element) {
                return null;
            }
            return element.control;
        };
        /**
         * Helper method to get a named element from the subtree of the control, ignoring nested controls
         */
        TemplateControl.prototype.getNamedElement = function (name) {
            var elements = [];
            elements.push(this.rootElement);
            while (elements.length > 0) {
                var element = elements.pop();
                if (element.getAttribute(Common.TemplateDataAttributes.NAME) === name) {
                    return element;
                }
                // Don't traverse through control children elements
                if (element.children && (!element.hasAttribute(Common.TemplateDataAttributes.CONTROL) || element === this.rootElement)) {
                    var childrenCount = element.children.length;
                    for (var i = 0; i < childrenCount; i++) {
                        elements.push(element.children[i]);
                    }
                }
            }
            return null;
        };
        /**
         * Protected overridable method. Gets called when isEnabled value changes
         */
        TemplateControl.prototype.onIsEnabledChangedOverride = function () {
        };
        /**
         * Protected overridable method. Gets called when isVisible value changes
         */
        TemplateControl.prototype.onIsVisibleChangedOverride = function () {
        };
        /**
         * Protected override method. Gets called when the tabIndex value changes
         */
        TemplateControl.prototype.onTabIndexChangedOverride = function () {
        };
        /**
         * Protected overridable method. Gets called when tooltip value changes
         */
        TemplateControl.prototype.onTooltipChangedOverride = function () {
        };
        TemplateControl.prototype.onClassNameChanged = function (oldValue, newValue) {
            if (this.rootElement) {
                if (oldValue) {
                    var oldClasses = oldValue.split(" ");
                    for (var i = 0; i < oldClasses.length; i++) {
                        this.rootElement.classList.remove(oldClasses[i]);
                    }
                }
                if (newValue) {
                    var newClasses = newValue.split(" ");
                    for (var i = 0; i < newClasses.length; i++) {
                        this.rootElement.classList.add(newClasses[i]);
                    }
                }
            }
        };
        /**
         * Handles a change to the isEnabled property
         */
        TemplateControl.prototype.onIsEnabledChanged = function () {
            if (this.rootElement) {
                if (this.isEnabled) {
                    this.rootElement.classList.remove(TemplateControl.CLASS_DISABLED);
                    this.rootElement.removeAttribute("aria-disabled");
                    this.onTabIndexChanged(this._tabIndex, this._tabIndex);
                }
                else {
                    this.rootElement.classList.add(TemplateControl.CLASS_DISABLED);
                    this.rootElement.setAttribute("aria-disabled", true);
                    this.rootElement.tabIndex = -1;
                }
                this.onIsEnabledChangedOverride();
            }
        };
        /**
         * Handles a change to the isVisible property
         */
        TemplateControl.prototype.onIsVisibleChanged = function () {
            if (this.rootElement) {
                if (this.isVisible) {
                    this.rootElement.classList.remove(TemplateControl.CLASS_HIDDEN);
                    this.rootElement.removeAttribute("aria-hidden");
                    this.onTabIndexChanged(this._tabIndex, this._tabIndex);
                }
                else {
                    this.rootElement.classList.add(TemplateControl.CLASS_HIDDEN);
                    this.rootElement.setAttribute("aria-hidden", "true");
                    this.rootElement.tabIndex = -1;
                }
                this.onIsVisibleChangedOverride();
            }
        };
        /**
         * Handles a change to the tabIndex property
         */
        TemplateControl.prototype.onTabIndexChanged = function (oldValue, newValue) {
            if (this.rootElement) {
                // Only set tabIndex on the root when the control is enabled and visible. Otherwise the isEnabled 
                // and isVisible change handlers will call this method to update the tabIndex on the element.
                if (this.isEnabled && this.isVisible) {
                    // Only set it on the rootElement if either we had a value or we got assigned a new value
                    // This way we don't set a 0 tabIndex on all elements at initialization
                    if (oldValue || newValue || newValue === 0) {
                        this.rootElement.tabIndex = newValue;
                    }
                }
                // Do the check here because the isEnabled handler will call us without really changing the tabIndex value
                if (oldValue !== newValue) {
                    this.onTabIndexChangedOverride();
                }
            }
        };
        /**
         * Handles a change to the tooltip property
         */
        TemplateControl.prototype.onTooltipChanged = function () {
            if (this.rootElement) {
                this.onTooltipChangedOverride();
            }
        };
        /**
         * Sets the rootElement from the current templateId and initialize
         * bindings relationships
         */
        TemplateControl.prototype.setRootElementFromTemplate = function () {
            var previousRoot;
            // Notify subclasses that the template is about to change
            this.onTemplateChanging();
            // Unattach ourselves from the previous rootElement before we 
            // create a new rootElement
            if (this.rootElement) {
                previousRoot = this.rootElement;
                this.rootElement.control = null;
            }
            if (this._templateId) {
                this.rootElement = Common.templateLoader.loadTemplate(this._templateId);
            }
            else {
                this.rootElement = document.createElement("div");
            }
            // Copy only the original name to the new root
            if (previousRoot) {
                var attr = previousRoot.attributes.getNamedItem(Common.TemplateDataAttributes.NAME);
                if (attr) {
                    this.rootElement.setAttribute(attr.name, attr.value);
                }
            }
            this.rootElement.control = this;
            this._binding = new Common.TemplateDataBinding(this);
            // If the previous root has a parentElement then replace it with the new root
            if (previousRoot && previousRoot.parentElement) {
                previousRoot.parentElement.replaceChild(this.rootElement, previousRoot);
            }
            this.onApplyTemplate();
        };
        TemplateControl.CLASS_DISABLED = "disabled";
        TemplateControl.CLASS_HIDDEN = "BPT-hidden";
        TemplateControl.ClassNamePropertyName = "className";
        TemplateControl.IsEnabledPropertyName = "isEnabled";
        TemplateControl.IsVisiblePropertyName = "isVisible";
        TemplateControl.ModelPropertyName = "model";
        TemplateControl.TabIndexPropertyName = "tabIndex";
        TemplateControl.TemplateIdPropertyName = "templateId";
        TemplateControl.TooltipPropertyName = "tooltip";
        return TemplateControl;
    }(Common.Observable));
    Common.TemplateControl = TemplateControl;
    TemplateControl.initialize();
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="../Framework/Model/Observable.ts" />
/// <reference path="../Framework/Templating/TemplateControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A base class for controls which have content
         */
        var ContentControl = (function (_super) {
            __extends(ContentControl, _super);
            /**
             * Constructor
             * @param templateId The id of the template to apply to the control
             */
            function ContentControl(templateId) {
                _super.call(this, templateId);
            }
            /**
             * Static constructor used to initialize observable properties
             */
            ContentControl.initialize = function () {
                Common.ObservableHelpers.defineProperty(ContentControl, "content", null);
            };
            return ContentControl;
        }(Common.TemplateControl));
        Controls.ContentControl = ContentControl;
        ContentControl.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="IConverter.ts" />
/// <reference path="../../../../../Common/Script/Hub/Plugin.redirect.d.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * Common converters used by the templating engine.
     */
    var CommonConverters = (function () {
        function CommonConverters() {
        }
        /**
         * Static constructor for the class
         */
        CommonConverters.initialize = function () {
            CommonConverters.AriaConverterElement = document.createElement("span");
            CommonConverters.HtmlTooltipFromResourceConverter = CommonConverters.getHtmlTooltipFromResourceConverter();
            CommonConverters.IntToStringConverter = CommonConverters.getIntToStringConverter();
            CommonConverters.InvertBool = CommonConverters.invertBoolConverter();
            CommonConverters.JsonHtmlTooltipToInnerTextConverter = CommonConverters.getJsonHtmlTooltipToInnerTextConverter();
            CommonConverters.ResourceConverter = CommonConverters.getResourceConverter();
            CommonConverters.StringToBooleanConverter = CommonConverters.getStringToBooleanConverter();
            CommonConverters.StringToIntConverter = CommonConverters.getStringToIntConverter();
            CommonConverters.ThemedImageConverter = CommonConverters.getThemedImageConverter();
        };
        CommonConverters.getResourceConverter = function () {
            return {
                convertTo: function (from) {
                    return Microsoft.Plugin.Resources.getString(from);
                },
                convertFrom: null
            };
        };
        CommonConverters.getThemedImageConverter = function () {
            return {
                convertTo: function (from) {
                    return Microsoft.Plugin.Theme.getValue(from);
                },
                convertFrom: null
            };
        };
        CommonConverters.getStringToBooleanConverter = function () {
            return {
                convertTo: function (from) {
                    return from === "true" ? true : false;
                },
                convertFrom: function (from) {
                    return from ? "true" : "false";
                }
            };
        };
        CommonConverters.getStringToIntConverter = function () {
            return {
                convertTo: function (from) {
                    return from >> 0;
                },
                convertFrom: function (from) {
                    return from.toString();
                }
            };
        };
        CommonConverters.getIntToStringConverter = function () {
            return {
                convertTo: function (from) {
                    return from.toString();
                },
                convertFrom: function (from) {
                    return from >> 0;
                }
            };
        };
        CommonConverters.invertBoolConverter = function () {
            return {
                convertTo: function (from) {
                    return !from;
                },
                convertFrom: function (to) {
                    return !to;
                }
            };
        };
        /**
         * Converts a resource name into a value for a daytona tooltip that contains HTML to be rendered
         */
        CommonConverters.getHtmlTooltipFromResourceConverter = function () {
            return {
                convertTo: function (from) {
                    return JSON.stringify({ content: Microsoft.Plugin.Resources.getString(from), contentContainsHTML: true });
                },
                convertFrom: null
            };
        };
        /**
         * Converts a JSON tooltip string with HTML into a text-only string of the tooltip content
         */
        CommonConverters.getJsonHtmlTooltipToInnerTextConverter = function () {
            return {
                convertTo: function (from) {
                    if (from.match(CommonConverters.JSONRegex)) {
                        try {
                            var options = JSON.parse(from);
                            if (options.contentContainsHTML) {
                                CommonConverters.AriaConverterElement.innerHTML = options.content;
                                var text = CommonConverters.AriaConverterElement.innerText;
                                CommonConverters.AriaConverterElement.innerHTML = "";
                                return text;
                            }
                            else {
                                return options.content;
                            }
                        }
                        catch (ex) { }
                    }
                    return from;
                },
                convertFrom: null
            };
        };
        CommonConverters.JSONRegex = /^\{.*\}$/; // Matches strings that start with '{' and end with '}', which could be JSON
        return CommonConverters;
    }());
    Common.CommonConverters = CommonConverters;
    CommonConverters.initialize();
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ContentControl.ts" />
/// <reference path="..\Assert.ts" />
/// <reference path="..\KeyCodes.ts" />
/// <reference path="..\Framework\binding\CommonConverters.ts" />
/// <disable code="SA1201" rule="ElementsMustAppearInTheCorrectOrder" justification="egregious TSSC rule"/>
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A Button class which is templatable and provides basic button functionality
         */
        var Button = (function (_super) {
            __extends(Button, _super);
            /**
             * Constructor
             * @param templateId The id of the template to apply to the control
             */
            function Button(templateId) {
                _super.call(this, templateId || "Common.defaultButtonTemplate");
            }
            /**
             * Static constructor used to initialize observable properties
             */
            Button.initialize = function () {
                Common.ObservableHelpers.defineProperty(Button, Button.IsPressedPropertyName, false, function (obj, oldValue, newValue) { return obj.onIsPressedChanged(oldValue, newValue); });
            };
            /** @inheritdoc */
            Button.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._mouseHandler = function (e) { return _this.onMouseEvent(e); };
                this._keyHandler = function (e) { return _this.onKeyboardEvent(e); };
                this.click = new Common.EventSource();
            };
            /**
             * Updates the control when the template has changed
             */
            Button.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                if (this.rootElement) {
                    if (!this.rootElement.hasAttribute("role")) {
                        // Consumers of this control are free to override this
                        // ie. A "link" is technically a button, but would override
                        // this attribute for accessibility reasons.
                        this.rootElement.setAttribute("role", "button");
                    }
                    this.rootElement.addEventListener("click", this._mouseHandler);
                    this.rootElement.addEventListener("mousedown", this._mouseHandler);
                    this.rootElement.addEventListener("mouseup", this._mouseHandler);
                    this.rootElement.addEventListener("mouseleave", this._mouseHandler);
                    this.rootElement.addEventListener("keydown", this._keyHandler);
                    this.rootElement.addEventListener("keyup", this._keyHandler);
                    // Ensure the control is in the correct state
                    this.onIsPressedChanged(null, this.isPressed);
                }
            };
            /**
             * Updates the control when the template is about to change. Removes event handlers from previous root element.
             */
            Button.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this.rootElement) {
                    this.rootElement.removeEventListener("click", this._mouseHandler);
                    this.rootElement.removeEventListener("mousedown", this._mouseHandler);
                    this.rootElement.removeEventListener("mouseup", this._mouseHandler);
                    this.rootElement.removeEventListener("mouseleave", this._mouseHandler);
                    this.rootElement.removeEventListener("keydown", this._keyHandler);
                    this.rootElement.removeEventListener("keyup", this._keyHandler);
                }
            };
            /**
             * Protected override. Handles a change to the tooltip property
             */
            Button.prototype.onTooltipChangedOverride = function () {
                _super.prototype.onTooltipChangedOverride.call(this);
                if (this.tooltip) {
                    this.rootElement.setAttribute("data-plugin-vs-tooltip", this.tooltip);
                    this.rootElement.setAttribute("aria-label", Common.CommonConverters.JsonHtmlTooltipToInnerTextConverter.convertTo(this.tooltip));
                }
                else {
                    this.rootElement.removeAttribute("data-plugin-vs-tooltip");
                    this.rootElement.removeAttribute("aria-label");
                }
            };
            /**
             * Dispatches a click event only if the button is enabled
             * @param e An optional event object.
             */
            Button.prototype.press = function (e) {
                if (this.isEnabled) {
                    this.click.invoke(e);
                }
            };
            /**
             * Handles a change to the isPressed property
             * @param oldValue The old value for the property
             * @param newValue The new value for the property
             */
            Button.prototype.onIsPressedChanged = function (oldValue, newValue) {
                if (this.rootElement) {
                    if (newValue) {
                        this.rootElement.classList.add(Button.CLASS_PRESSED);
                    }
                    else {
                        this.rootElement.classList.remove(Button.CLASS_PRESSED);
                    }
                }
            };
            /**
             * Handles mouse events to allow the button to be interacted with via the mouse
             * @param e The mouse event
             */
            Button.prototype.onMouseEvent = function (e) {
                if (this.isEnabled) {
                    var stopPropagation = false;
                    switch (e.type) {
                        case "click":
                            this.rootElement.focus();
                            this.click.invoke(e);
                            stopPropagation = true;
                            break;
                        case "mousedown":
                            this.isPressed = true;
                            break;
                        case "mouseup":
                        case "mouseleave":
                            this.isPressed = false;
                            break;
                        default:
                            F12.Tools.Utility.Assert.fail("Unexpected");
                    }
                    if (stopPropagation) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                }
            };
            /**
             * Handles keyboard events to allow the button to be interacted with via the keyboard
             * @param e The keyboard event
             */
            Button.prototype.onKeyboardEvent = function (e) {
                if (this.isEnabled && (e.keyCode === Common.KeyCodes.Enter || e.keyCode === Common.KeyCodes.Space)) {
                    switch (e.type) {
                        case "keydown":
                            this.isPressed = true;
                            break;
                        case "keyup":
                            // Narrator bypasses normal keydown/up events and clicks
                            // directly.  Make sure we only perform a click here when
                            // the button has really been pressed.  (ie. via regular
                            // keyboard interaction)
                            if (this.isPressed) {
                                this.isPressed = false;
                                this.click.invoke(e);
                            }
                            break;
                        default:
                            F12.Tools.Utility.Assert.fail("Unexpected");
                    }
                }
            };
            /** CSS class to apply to the button's root element when it's pressed */
            Button.CLASS_PRESSED = "pressed";
            Button.IsPressedPropertyName = "isPressed";
            return Button;
        }(Controls.ContentControl));
        Controls.Button = Button;
        Button.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        (function (NavigationDirection) {
            NavigationDirection[NavigationDirection["Next"] = 0] = "Next";
            NavigationDirection[NavigationDirection["Previous"] = 1] = "Previous";
        })(Controls.NavigationDirection || (Controls.NavigationDirection = {}));
        var NavigationDirection = Controls.NavigationDirection;
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../assert.ts" />
/// <reference path="ControlUtilities.ts" />
/// <reference path="Button.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * An enumeration that specifies the kind of the tab press
         */
        (function (TabPressKind) {
            TabPressKind[TabPressKind["None"] = 0] = "None";
            TabPressKind[TabPressKind["Tab"] = 1] = "Tab";
            TabPressKind[TabPressKind["ShiftTab"] = 2] = "ShiftTab";
        })(Controls.TabPressKind || (Controls.TabPressKind = {}));
        var TabPressKind = Controls.TabPressKind;
        /**
         * A PopupControl class which provides the popup behaviour to its given HTML template
         */
        var PopupControl = (function (_super) {
            __extends(PopupControl, _super);
            /**
             * @constructor
             * As part of initialization, caches references to event handler instances and loads the template content.
             * @param templateId: Optional template id for the control.
             */
            function PopupControl(templateId) {
                _super.call(this, templateId);
            }
            /**
             * Initializes the observable properties which should be performed once per each class.
             */
            PopupControl.initialize = function () {
                Common.ObservableHelpers.defineProperty(PopupControl, "targetButtonElement", /*defaultValue=*/ null, function (obj, oldValue, newValue) { return obj.onTargetButtonElementChanged(oldValue, newValue); });
            };
            /**
             * Updates the control when the template has changed
             */
            PopupControl.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                if (this.rootElement) {
                    this.rootElement.classList.add(PopupControl.CLASS_POPUP);
                }
                this.onTargetButtonElementChanged(null, this.targetButtonElement);
            };
            /**
             * Protected virtual function called when initializing the control instance
             */
            PopupControl.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._blurHandler = function (e) { return _this.onBlur(e); };
                this._focusOutHandler = function (e) { return _this.onFocusOut(e); };
                this._keyHandler = function (e) { return _this.onKeyEvent(e); };
                this._mouseHandler = function (e) { return _this.onDocumentMouseHandler(e); };
                this._targetButtonClickHandler = function () { return _this.onTargetButtonClick(); };
                this._targetButtonKeyHandler = function (e) { return _this.onTargetButtonKeyUp(e); };
                this._windowResizeHandler = function (e) { return _this.onWindowResize(e); };
                // By default the popup control is not visible
                this.isVisible = false;
            };
            /**
             * Protected virtual function used to notify subclasses that the template is about to change.
             * Can used to perform cleanup on the previous root element
             */
            PopupControl.prototype.onTemplateChanging = function () {
                if (this.rootElement) {
                    this.rootElement.classList.remove(PopupControl.CLASS_POPUP);
                }
            };
            /**
             * Protected overridable method. Gets called when the isVisible value changes
             */
            PopupControl.prototype.onIsVisibleChangedOverride = function () {
                var _this = this;
                _super.prototype.onIsVisibleChangedOverride.call(this);
                if (this.isVisible) {
                    window.setImmediate(function () {
                        _this.rootElement.focus();
                    });
                    this._tabLastPressed = TabPressKind.None;
                    if (this.targetButtonElement && !this.disablePopupActiveIndicator) {
                        this.targetButtonElement.classList.add(PopupControl.CLASS_POPUP_ACTIVE_ONTARGET);
                    }
                    this.setPopupPosition();
                    // Add event handlers for popup navigation and dismissal
                    window.addEventListener("resize", this._windowResizeHandler);
                    document.addEventListener("focusout", this._focusOutHandler, /*useCapture=*/ true);
                    document.addEventListener("mousedown", this._mouseHandler, /*useCapture=*/ true);
                    document.addEventListener("mouseup", this._mouseHandler, /*useCapture=*/ true);
                    document.addEventListener("mousewheel", this._mouseHandler, /*useCapture=*/ true);
                    document.addEventListener("click", this._mouseHandler, /*useCapture=*/ true);
                    this.rootElement.addEventListener("blur", this._blurHandler, /*useCapture=*/ true);
                    this.rootElement.addEventListener("keydown", this._keyHandler);
                    this.rootElement.addEventListener("keyup", this._keyHandler);
                }
                else {
                    if (this.targetButtonElement) {
                        this.targetButtonElement.classList.remove(PopupControl.CLASS_POPUP_ACTIVE_ONTARGET);
                        if (!this._skipTargetButtonFocus) {
                            window.setImmediate(function () {
                                if (_this.targetButtonElement) {
                                    _this.targetButtonElement.focus();
                                }
                            });
                        }
                    }
                    // Remove event handlers for popup navigation and dismissal
                    window.removeEventListener("resize", this._windowResizeHandler);
                    document.removeEventListener("focusout", this._focusOutHandler, /*useCapture=*/ true);
                    document.removeEventListener("mousedown", this._mouseHandler, /*useCapture=*/ true);
                    document.removeEventListener("mouseup", this._mouseHandler, /*useCapture=*/ true);
                    document.removeEventListener("mousewheel", this._mouseHandler, /*useCapture=*/ true);
                    document.removeEventListener("click", this._mouseHandler, /*useCapture=*/ true);
                    this.rootElement.removeEventListener("blur", this._blurHandler, /*useCapture=*/ true);
                    this.rootElement.removeEventListener("keydown", this._keyHandler);
                    this.rootElement.removeEventListener("keyup", this._keyHandler);
                }
            };
            /**
             * Protected overridable method. Gets called on the keydown event.
             * @param e the keyboard event object
             * @returns true if the event was handled and no need for extra processing
             */
            PopupControl.prototype.onKeyDownOverride = function (e) {
                return false;
            };
            /**
             * Protected overridable method. Gets called on the keyup event.
             * @param e the keyboard event object
             * @returns true if the event was handled and no need for extra processing
             */
            PopupControl.prototype.onKeyUpOverride = function (e) {
                return false;
            };
            /**
             * Displays the popup control at the given absolute co-ordinates
             * @param x x-coordinate of the right end of the popup control
             * @param y y-coordinate of the top of the popup control
             */
            PopupControl.prototype.show = function (x, y) {
                this.isVisible = true;
                if (x !== undefined && y !== undefined) {
                    this.rootElement.style.left = (x - this.rootElement.offsetWidth) + "px";
                    this.rootElement.style.top = y + "px";
                }
            };
            PopupControl.prototype.updatePopupPosition = function () {
                this.setPopupPosition();
            };
            PopupControl.totalOffsetLeft = function (elem) {
                var offsetLeft = 0;
                do {
                    if (!isNaN(elem.offsetLeft)) {
                        offsetLeft += elem.offsetLeft;
                    }
                } while (elem = elem.offsetParent);
                return offsetLeft;
            };
            PopupControl.totalOffsetTop = function (elem) {
                var offsetTop = 0;
                do {
                    if (!isNaN(elem.offsetTop)) {
                        offsetTop += elem.offsetTop;
                    }
                } while (elem = elem.offsetParent);
                return offsetTop;
            };
            PopupControl.prototype.setPopupPosition = function () {
                this.rootElement.style.left = "0px";
                this.rootElement.style.top = "0px";
                if (!this.targetButtonElement) {
                    // Cannot determine the position if there is no targetButtonElement
                    return;
                }
                var viewportTop = this.viewportMargin ? (this.viewportMargin.top || 0) : 0;
                var viewportBottom = window.innerHeight - (this.viewportMargin ? (this.viewportMargin.bottom || 0) : 0);
                var viewportLeft = this.viewportMargin ? (this.viewportMargin.left || 0) : 0;
                var viewportRight = window.innerWidth - (this.viewportMargin ? (this.viewportMargin.right || 0) : 0);
                // The positioning logic works by getting the viewport position of the target element then
                // mapping that position to the popup coordinates.
                // The mapping logic use the following arithmatic:
                //   pos = popup_scrollPos + targetElem_viewPortPos - popup_zeroOffsetToDocumnet
                //
                // Get the coordinates of target based on the viewport
                var targetRect = this.targetButtonElement.getBoundingClientRect();
                var targetViewportLeft = Math.round(targetRect.left);
                var targetViewportTop = Math.round(targetRect.top);
                // Get the total scroll position of the popup, so we can map the viewport coordinates to it
                var scrollTopTotal = 0;
                var scrollLeftTotal = 0;
                var elem = this.rootElement.offsetParent;
                while (elem) {
                    scrollLeftTotal += elem.scrollLeft;
                    scrollTopTotal += elem.scrollTop;
                    elem = elem.offsetParent;
                }
                // Gets the offset position when the popup control is at 0,0 to adjust later on this value.
                // because 0,0 doesn't necessarily land on document 0,0 if there is a parent with absolute position.
                var zeroOffsetLeft = PopupControl.totalOffsetLeft(this.rootElement);
                var zeroOffsetTop = PopupControl.totalOffsetTop(this.rootElement);
                // Calculate the left position 
                var left = targetViewportLeft;
                var right = left + this.rootElement.offsetWidth;
                if (right > viewportRight) {
                    var newRight = targetViewportLeft + this.targetButtonElement.offsetWidth;
                    var newLeft = newRight - this.rootElement.offsetWidth;
                    if (newLeft >= viewportLeft) {
                        left = newLeft;
                        right = newRight;
                    }
                }
                this.rootElement.style.left = scrollLeftTotal + left - zeroOffsetLeft + "px";
                // Calculate the top position
                var top = targetViewportTop + this.targetButtonElement.offsetHeight;
                var bottom = top + this.rootElement.offsetHeight;
                if (bottom > viewportBottom) {
                    var newBottom = targetViewportTop;
                    var newTop = newBottom - this.rootElement.offsetHeight;
                    if (newTop >= viewportTop) {
                        top = newTop;
                        bottom = newBottom;
                    }
                }
                // Move the menu up 1 pixel if both the menu and the target button have borders
                if (parseInt(window.getComputedStyle(this.rootElement).borderTopWidth) > 0 &&
                    parseInt(window.getComputedStyle(this.targetButtonElement).borderBottomWidth) > 0) {
                    top--;
                }
                this.rootElement.style.top = scrollTopTotal + top - zeroOffsetTop + "px";
            };
            PopupControl.prototype.onBlur = function (e) {
                if (!this.keepVisibleOnBlur && !document.hasFocus() && !this._tabLastPressed &&
                    !(this.targetButtonElement && this.targetButtonElement.contains(e.relatedTarget))) {
                    this.isVisible = false;
                }
            };
            /**
             * Handles a change to the targetButtonElement property. Updates the aria properties of the popup item
             * @param oldValue The old value for the property
             * @param newValue The new value for the property
             */
            PopupControl.prototype.onTargetButtonElementChanged = function (oldValue, newValue) {
                if (oldValue) {
                    oldValue.removeAttribute("aria-haspopup");
                    oldValue.removeAttribute("aria-owns");
                    if (this._targetButtonClickEvtReg) {
                        this._targetButtonClickEvtReg.unregister();
                        this._targetButtonClickEvtReg = null;
                    }
                    oldValue.removeEventListener("click", this._targetButtonClickHandler);
                    oldValue.removeEventListener("keyup", this._targetButtonKeyHandler);
                }
                if (newValue) {
                    newValue.setAttribute("aria-haspopup", "true");
                    newValue.setAttribute("aria-owns", this.rootElement.id);
                    var targetControl = newValue.control;
                    if (targetControl && targetControl instanceof Controls.Button) {
                        var targetButton = targetControl;
                        this._targetButtonClickEvtReg = targetButton.click.addHandler(this._targetButtonClickHandler);
                    }
                    else {
                        newValue.addEventListener("click", this._targetButtonClickHandler);
                        newValue.addEventListener("keyup", this._targetButtonKeyHandler);
                    }
                }
            };
            PopupControl.prototype.onTargetButtonClick = function () {
                this.show();
            };
            PopupControl.prototype.onTargetButtonKeyUp = function (e) {
                if (e.keyCode === Common.KeyCodes.Space || e.keyCode === Common.KeyCodes.Enter) {
                    this.show();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            };
            PopupControl.prototype.onWindowResize = function (e) {
                this.isVisible = false;
            };
            /**
             * Focus out listener for the popup control when it is visible.
             */
            PopupControl.prototype.onFocusOut = function (e) {
                if (e.relatedTarget && e.relatedTarget !== this.rootElement && !this.rootElement.contains(e.relatedTarget)) {
                    // If focus out was due to tabbing out, then we need to set focus on either the first or the last tabbable element
                    if (this._tabLastPressed !== TabPressKind.None) {
                        var tabbableChildren = this.rootElement.querySelectorAll("[tabindex]");
                        var tabbableElement = this.rootElement;
                        if (this._tabLastPressed === TabPressKind.Tab) {
                            // Find the first tabbable element
                            for (var i = 0; i < tabbableChildren.length; i++) {
                                var element = tabbableChildren.item(i);
                                // Check that it is both visible and tabbable
                                if (element.tabIndex >= 0 && element.offsetParent) {
                                    tabbableElement = element;
                                    break;
                                }
                            }
                        }
                        else {
                            // Find the last tabbable element
                            for (var i = tabbableChildren.length - 1; i >= 0; i--) {
                                var element = tabbableChildren.item(i);
                                // Check that it is both visible and tabbable
                                if (element.tabIndex >= 0 && element.offsetParent) {
                                    tabbableElement = element;
                                    break;
                                }
                            }
                        }
                        window.setImmediate(function () {
                            tabbableElement.focus();
                        });
                    }
                    else if (!(this.targetButtonElement && this.targetButtonElement.contains(e.relatedTarget))) {
                        this.isVisible = false;
                        // Dismiss the popup control and set focus on the requesting element
                        window.setImmediate(function () {
                            if (e.target) {
                                e.target.focus();
                            }
                        });
                    }
                }
                return false;
            };
            /**
             * Document click listener for the popup control when it is visible. Ignores click in the control itself.
             */
            PopupControl.prototype.onDocumentMouseHandler = function (e) {
                var withinPopup = this.rootElement.contains(e.target);
                if (!withinPopup) {
                    var withinTargetButton = this.targetButtonElement && this.targetButtonElement.contains(e.target);
                    if (!withinTargetButton) {
                        // Still check the element under the mouse click. Using a scrollbar inside the popup causes and event to be raised with the document as the target
                        var elementUnderPoint = document.elementFromPoint(e.x, e.y);
                        withinPopup = this.rootElement.contains(elementUnderPoint);
                        if (!withinPopup) {
                            // Not within the target button, just hide the popup and not set focus on the target button
                            // Because the normal mouse handler will move focus to the target element
                            this._skipTargetButtonFocus = true;
                            try {
                                this.isVisible = false;
                            }
                            finally {
                                this._skipTargetButtonFocus = false;
                            }
                        }
                    }
                    else {
                        // Within the target button
                        // Only hide the popup on the click event since it's the last event fired (mousedown -> mouseup -> click)
                        if (e.type === "click" && this.dismissOnTargetButtonClick) {
                            this.isVisible = false;
                        }
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                }
            };
            /**
             * Document key listener for the popup control when it is visible.
             */
            PopupControl.prototype.onKeyEvent = function (e) {
                // Prevent all key strokes from propagating up.
                e.stopImmediatePropagation();
                Common.preventIEKeys(e);
                this._tabLastPressed = e.keyCode === Common.KeyCodes.Tab ? (e.shiftKey ? TabPressKind.ShiftTab : TabPressKind.Tab) : TabPressKind.None;
                if (e.type === "keyup") {
                    var handled = this.onKeyUpOverride(e);
                    if (!handled) {
                        switch (e.keyCode) {
                            case Common.KeyCodes.Escape:
                                this.isVisible = false;
                                break;
                        }
                    }
                }
                else if (e.type === "keydown") {
                    this.onKeyDownOverride(e);
                }
                return false;
            };
            /** CSS class to apply on the root element */
            PopupControl.CLASS_POPUP = "BPT-popup";
            /** CSS class to apply to the target element when the popup is visible */
            PopupControl.CLASS_POPUP_ACTIVE_ONTARGET = "BPT-popupActive";
            return PopupControl;
        }(Common.TemplateControl));
        Controls.PopupControl = PopupControl;
        PopupControl.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="ControlUtilities.ts" />
/// <reference path="PopupControl.ts" />
/// <reference path="MenuItem.ts" />
/// <reference path="Button.ts" />
/// <disable code="SA1201" rule="ElementsMustAppearInTheCorrectOrder" justification="egregious TSSC rule"/>
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A MenuControl class which is templatable and provide menu functionality
         */
        var MenuControl = (function (_super) {
            __extends(MenuControl, _super);
            /**
             * @constructor
             * As part of initialization, caches references to event handler instances and loads the template content.
             * @param templateId: Optional template id for the control. Default template is Common.menuControlTemplate.
             */
            function MenuControl(templateId) {
                _super.call(this, templateId || "Common.menuControlTemplate");
            }
            /**
             * Initializes the observable properties which should be performed once per each class.
             */
            MenuControl.initialize = function () {
                Common.ObservableHelpers.defineProperty(MenuControl, MenuControl.MenuItemsTemplateIdPropertyName, /*defaultValue=*/ null, function (obj, oldValue, newValue) { return obj.onMenuTemplateIdChanged(oldValue, newValue); });
                Common.ObservableHelpers.defineProperty(MenuControl, MenuControl.SelectedItemPropertyName, /*defaultValue=*/ null, function (obj) { return obj.onSelectedItemChanged(); });
            };
            /** @inheritdoc */
            MenuControl.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._focusInHandler = function (e) { return _this.onFocusIn(e); };
                this._selectedIndex = -1;
                this._menuItemsClickRegistration = [];
                this._menuItemsPropChangedRegistration = [];
                this.menuItems = [];
            };
            /**
             * Attach a handler to the given menu item
             * @param menu item name of the control as provided in data-name attribute
             * @param clickHandler Click handler to be added to the menu item
             */
            MenuControl.prototype.addClickHandlerToMenuItem = function (menuItemName, clickHandler) {
                var element = this.getNamedElement(menuItemName);
                if (element && element.control) {
                    element.control.click.addHandler(clickHandler);
                }
            };
            /**
             * Protected overridable. Handles a change to the isVisible property. Updates the menu controls display properties and event handlers.
             */
            MenuControl.prototype.onIsVisibleChangedOverride = function () {
                _super.prototype.onIsVisibleChangedOverride.call(this);
                if (this.isVisible) {
                    this.rootElement.addEventListener("focusin", this._focusInHandler);
                    // Always reset the selected index when the menu opens
                    this.selectedItem = null;
                    for (var i = 0; i < this.menuItems.length; i++) {
                        this.menuItems[i].rootElement.classList.remove(MenuControl.CLASS_SELECTED);
                    }
                }
                else {
                    this.rootElement.removeEventListener("focusin", this._focusInHandler);
                }
            };
            /**
             * Protected overridable method. Gets called on the keyup event.
             * @param e the keyboard event object
             * @returns true if the event was handled and no need for extra processing
             */
            MenuControl.prototype.onKeyUpOverride = function (e) {
                var handled = false;
                switch (e.keyCode) {
                    case Common.KeyCodes.ArrowDown:
                        this.changeSelection(Controls.NavigationDirection.Next);
                        handled = true;
                        break;
                    case Common.KeyCodes.ArrowUp:
                        this.changeSelection(Controls.NavigationDirection.Previous);
                        handled = true;
                        break;
                    case Common.KeyCodes.Space:
                    case Common.KeyCodes.Enter:
                        this.pressSelectedItem();
                        handled = true;
                        break;
                }
                if (!handled) {
                    handled = _super.prototype.onKeyUpOverride.call(this, e);
                }
                return handled;
            };
            MenuControl.prototype.onMenuItemClick = function () {
                if (this.dismissOnMenuItemClick) {
                    this.isVisible = false;
                }
            };
            /**
             * Handles update of the menu items in the same group when one of the menu items in that group is changed.
             * @param menuItem A menu item which is changed.
             * @param propertyName Name of the observable property which was changed on the menu item.
             */
            MenuControl.prototype.onMenuItemPropertyChanged = function (menuItem, propertyName) {
                if (propertyName === "isChecked" || propertyName === "groupName") {
                    if (menuItem.groupName && menuItem.isChecked) {
                        // If a menu item is checked, then it unchecks other menu items in the same group. If a menu item is added to the
                        // group and is checked, then it unchecks menu items of the same group.
                        for (var index = 0; index < this.menuItems.length; index++) {
                            var item = this.menuItems[index];
                            if (item !== menuItem && item.groupName === menuItem.groupName && item.isChecked) {
                                item.isChecked = false;
                            }
                        }
                    }
                }
            };
            /**
             * Handles a change to menuTemplateId. Resets the menuItems arrays with new menuItems
             * @param oldValue The old value for the property
             * @param newValue The new value for the property
             */
            MenuControl.prototype.onMenuTemplateIdChanged = function (oldValue, newValue) {
                // Unregister the event handlers of the previous menu items if they exist
                while (this._menuItemsPropChangedRegistration.length > 0) {
                    this._menuItemsPropChangedRegistration.pop().unregister();
                }
                while (this._menuItemsClickRegistration.length > 0) {
                    this._menuItemsClickRegistration.pop().unregister();
                }
                if (newValue) {
                    this.menuItems = [];
                    this.selectedItem = null;
                    this._menuItemsPropChangedRegistration = [];
                    this._menuItemsClickRegistration = [];
                    var menuItemElements = this.rootElement.querySelectorAll("li[" + Common.TemplateDataAttributes.CONTROL + "]");
                    for (var index = 0; index < menuItemElements.length; index++) {
                        var menuItemElement = menuItemElements[index];
                        F12.Tools.Utility.Assert.isTrue(!!menuItemElement.control, "All menuItemElements must have a control");
                        var menuItem = menuItemElement.control;
                        this.menuItems.push(menuItem);
                        this._menuItemsPropChangedRegistration.push(menuItem.propertyChanged.addHandler(this.onMenuItemPropertyChanged.bind(this, menuItem)));
                        this._menuItemsClickRegistration.push(menuItem.click.addHandler(this.onMenuItemClick.bind(this)));
                    }
                }
            };
            /**
             * Handles a change to selectedItem.
             */
            MenuControl.prototype.onSelectedItemChanged = function () {
                if (!this.selectedItem) {
                    this.setSelectedIndex(-1, false);
                }
                else {
                    var itemIndex = this.menuItems.indexOf(this.selectedItem);
                    if (itemIndex !== this._selectedIndex) {
                        this.setSelectedIndex(itemIndex, /*setFocus =*/ false);
                    }
                }
            };
            MenuControl.prototype.onFocusIn = function (e) {
                // Find the menu item which contains the target and set it as the selected index
                var menuItemIndex = 0;
                for (; menuItemIndex < this.menuItems.length; menuItemIndex++) {
                    var menuItem = this.menuItems[menuItemIndex];
                    if (menuItem.rootElement.contains(e.target)) {
                        break;
                    }
                }
                if (menuItemIndex < this.menuItems.length) {
                    this.setSelectedIndex(menuItemIndex, /*setFocus=*/ false);
                }
            };
            /**
             * Changes the selection to the next or the previous menu item
             * @param direction A direction to move selection in (Next/Previous)
             */
            MenuControl.prototype.changeSelection = function (direction) {
                if (this.menuItems.length === 0) {
                    return;
                }
                var step = (direction === Controls.NavigationDirection.Next) ? 1 : -1;
                var startingMenuItem = this.menuItems[this._selectedIndex];
                var newMenuItem;
                var newIndex = this._selectedIndex;
                // Find the first next/previous menu item that is visibile and enabled
                do {
                    newIndex = (newIndex + step) % this.menuItems.length;
                    if (newIndex < 0) {
                        newIndex = this.menuItems.length - 1;
                    }
                    newMenuItem = this.menuItems[newIndex];
                    if (!startingMenuItem) {
                        startingMenuItem = newMenuItem;
                    }
                    else if (newMenuItem === startingMenuItem) {
                        break; // looped over to reach the same starting item
                    }
                } while (!(newMenuItem.isVisible && newMenuItem.isEnabled));
                if (newMenuItem.isVisible && newMenuItem.isEnabled) {
                    this.setSelectedIndex(newIndex, /*setFocus=*/ true);
                }
            };
            /**
             * Call press method on the selected menu item
             */
            MenuControl.prototype.pressSelectedItem = function () {
                var selectedItem = this.menuItems[this._selectedIndex];
                if (selectedItem) {
                    selectedItem.press();
                }
            };
            /**
             * Sets the selected index to the given index
             * @param newIndex the index to set to
             * @param setFocus, if true the method will set focus on the menu item
             */
            MenuControl.prototype.setSelectedIndex = function (newIndex, setFocus) {
                if (this._selectedIndex >= 0 && this._selectedIndex < this.menuItems.length) {
                    this.menuItems[this._selectedIndex].rootElement.classList.remove(MenuControl.CLASS_SELECTED);
                }
                this._selectedIndex = newIndex;
                var menuItem = this.menuItems[this._selectedIndex];
                if (menuItem) {
                    menuItem.rootElement.classList.add(MenuControl.CLASS_SELECTED);
                    if (setFocus) {
                        menuItem.rootElement.focus();
                    }
                    this.selectedItem = menuItem;
                }
            };
            /** CSS class to apply to the menu item root element when it's selected */
            MenuControl.CLASS_SELECTED = "selected";
            MenuControl.MenuItemsTemplateIdPropertyName = "menuItemsTemplateId";
            MenuControl.SelectedItemPropertyName = "selectedItem";
            return MenuControl;
        }(Controls.PopupControl));
        Controls.MenuControl = MenuControl;
        MenuControl.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="ContentControl.ts" />
/// <reference path="MenuControl.ts" />
/// <reference path="../KeyCodes.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A MenuItem class which is templatable and is a single menu item in the menu control
         */
        var MenuItem = (function (_super) {
            __extends(MenuItem, _super);
            /**
             * @constructor
             * As part of initialization, caches references to event handler instances and loads the template content.
             * @param templateId: Optional template id for the control. Default is Common.menuItemTemplate. Other option can
             * be Common.menuItemCheckMarkTemplate
             */
            function MenuItem(templateId) {
                _super.call(this, templateId || "Common.menuItemTemplate");
            }
            /**
             * Initializes the observable properties which should be performed once per each class.
             */
            MenuItem.initialize = function () {
                Common.ObservableHelpers.defineProperty(MenuItem, MenuItem.GroupNamePropertyName, /*defaultValue=*/ null);
                Common.ObservableHelpers.defineProperty(MenuItem, MenuItem.IsChecked, /*defaultValue=*/ false, function (obj, oldValue, newValue) { return obj.onIsCheckedChanged(oldValue, newValue); });
            };
            /** @inheritdoc */
            MenuItem.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._mouseHandler = function (e) { return _this.onMouseEvent(e); };
                this._keyUpHandler = function (e) { return _this.onKeyUp(e); };
                this._domEventHanlder = function (e) { return _this.onDomAttributeModified(e); };
                this.click = new Common.EventSource();
            };
            /**
             * Updates the control when the template has changed. Adds event handlers to the current root element.
             */
            MenuItem.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                if (this.rootElement) {
                    this.rootElement.addEventListener("click", this._mouseHandler);
                    this.rootElement.addEventListener("mousedown", this._mouseHandler);
                    this.rootElement.addEventListener("mouseup", this._mouseHandler);
                    this.rootElement.addEventListener("mouseleave", this._mouseHandler);
                    this.rootElement.addEventListener("keyup", this._keyUpHandler);
                    this.rootElement.addEventListener("DOMAttrModified", this._domEventHanlder);
                }
                // Ensure the control is in the correct state
                this.onIsCheckedChanged(null, this.isChecked);
            };
            /**
             * Handles a change to the isEnabled property
             */
            MenuItem.prototype.onIsEnabledChangedOverride = function () {
                _super.prototype.onIsEnabledChangedOverride.call(this);
                if (this.isEnabled) {
                    this.rootElement.removeAttribute("disabled");
                }
                else {
                    this.rootElement.setAttribute("disabled", "disabled");
                }
            };
            /**
             * Overridable protected to allow the derived class to intercept handling key-up event.
             * @param e The keyboard event
             */
            MenuItem.prototype.onKeyUpOverride = function (e) {
                return false;
            };
            /**
             * Overridable protected to allow the derived class to intercept handling mouse click evnet
             * @param e The mouse event
             */
            MenuItem.prototype.onMouseClickOverride = function (e) {
                return false;
            };
            /**
             * Updates the control when the template is about to change. Removes event handlers from previous root element.
             */
            MenuItem.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this.rootElement) {
                    this.rootElement.removeEventListener("click", this._mouseHandler);
                    this.rootElement.removeEventListener("mousedown", this._mouseHandler);
                    this.rootElement.removeEventListener("mouseup", this._mouseHandler);
                    this.rootElement.removeEventListener("mouseleave", this._mouseHandler);
                    this.rootElement.removeEventListener("keyup", this._keyUpHandler);
                    this.rootElement.removeEventListener("DOMAttrModified", this._domEventHanlder);
                }
            };
            /**
             * Dispatches a click event on the menu item only if the menu item is enabled
             * @param e An optional event object.
             */
            MenuItem.prototype.press = function (e) {
                if (this.isEnabled) {
                    this.click.invoke(e);
                }
            };
            /**
             * Handles mutation events to allow the menu item to be interacted with via the accessibility tool.
             * @param e The DOM mutation event
             */
            MenuItem.prototype.onDomAttributeModified = function (e) {
                if (e.attrName === "aria-checked") {
                    var checked = e.newValue === "true";
                    if (this.isChecked !== checked) {
                        this.isChecked = checked;
                    }
                }
            };
            /**
             * Handles changes to isChecked by displaying a check mark on the DOM element and unchecking any other items in the radio group
             * @param oldValue The old value for the property
             * @param newValue The new value for the property
             */
            MenuItem.prototype.onIsCheckedChanged = function (oldValue, newValue) {
                if (this.rootElement) {
                    if (newValue) {
                        this.rootElement.classList.remove(MenuItem.CLASS_HIDDEN_CHECK_MARK);
                    }
                    else {
                        this.rootElement.classList.add(MenuItem.CLASS_HIDDEN_CHECK_MARK);
                    }
                    this.rootElement.setAttribute("aria-checked", "" + newValue);
                    this.rootElement.focus();
                }
            };
            /**
             * Handles keyboard events to allow the menu item to be interacted with via the keyboard
             * @param e The keyboard event
             */
            MenuItem.prototype.onKeyUp = function (e) {
                if (this.isEnabled) {
                    var handled = this.onKeyUpOverride(e);
                    if (!handled) {
                        if (e.keyCode === Common.KeyCodes.Enter || e.keyCode === Common.KeyCodes.Space) {
                            this.press(e);
                            handled = true;
                        }
                    }
                    if (handled) {
                        e.stopImmediatePropagation();
                    }
                }
            };
            /**
             * Handles mouse events to allow the menu item to be interacted with via the mouse
             * @param e The mouse event
             */
            MenuItem.prototype.onMouseEvent = function (e) {
                if (this.isEnabled) {
                    switch (e.type) {
                        case "click":
                            var handled = this.onMouseClickOverride(e);
                            if (!handled) {
                                this.press(e);
                            }
                            break;
                        case "mousedown":
                        case "mouseup":
                        case "mouseleave":
                            break;
                        default:
                            F12.Tools.Utility.Assert.fail("Unexpected");
                    }
                    e.stopImmediatePropagation();
                }
            };
            /** CSS class to apply to the menu item root element when it's checked */
            MenuItem.CLASS_HIDDEN_CHECK_MARK = "hiddenCheckMark";
            MenuItem.GroupNamePropertyName = "groupName";
            MenuItem.IsChecked = "isChecked";
            return MenuItem;
        }(Controls.ContentControl));
        Controls.MenuItem = MenuItem;
        MenuItem.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="MenuItem.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A menu item with a checkbox input.
         */
        var CheckBoxMenuItem = (function (_super) {
            __extends(CheckBoxMenuItem, _super);
            function CheckBoxMenuItem(templateId) {
                _super.call(this, templateId || "Common.menuItemCheckBoxTemplate");
            }
            /**
             * Overridable protected to allow the derived class to intercept handling key-up event.
             * @param e The keyboard event
             */
            CheckBoxMenuItem.prototype.onKeyUpOverride = function (e) {
                var handled = false;
                if (e.key === Common.Keys.SPACEBAR) {
                    this.isChecked = !this.isChecked;
                    handled = true;
                }
                if (!handled) {
                    handled = _super.prototype.onKeyUpOverride.call(this, e);
                }
                return handled;
            };
            /**
             * Handles checking the menuitem when clicked
             * @param e An optional event object.
             */
            CheckBoxMenuItem.prototype.press = function (e) {
                // If the source element was the checkbox, then we don't want to flip isChecked (because it is taken care of by the control binding)
                // and we don't want to raise the click event
                var checkBox = this.getNamedElement("BPT-menuItemCheckBox");
                if (!e || e.srcElement !== checkBox) {
                    this.isChecked = !this.isChecked;
                    _super.prototype.press.call(this, e);
                }
            };
            return CheckBoxMenuItem;
        }(Common.Controls.MenuItem));
        Controls.CheckBoxMenuItem = CheckBoxMenuItem;
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="IObservable.ts" />
var Common;
(function (Common) {
    "use strict";
    /**
     * An collection (array) which fires events when items are added and removed
     * NB: This does not fully implement Array<T>, but may incorporate more functionality
     *     in the future if it is needed.
     */
    var ObservableCollection = (function () {
        /**
         * @constructor
         * @param list An optional list containing data to populate into the ObservableCollection
         */
        function ObservableCollection(list) {
            if (list === void 0) { list = []; }
            this._list = list.slice(0);
            this.propertyChanged = new Common.EventSource();
            this.collectionChanged = new Common.EventSource();
        }
        Object.defineProperty(ObservableCollection.prototype, "length", {
            /**
             * Gets the current length of the collection
             */
            get: function () {
                return this._list.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Adds an item or items to the end of the collection
         * @param items New item(s) to add to the collection
         * @return The new length of the collection
         */
        ObservableCollection.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            var insertionIndex = this._list.length;
            var newLength = Array.prototype.push.apply(this._list, items);
            this.propertyChanged.invoke(ObservableCollection.LengthProperty);
            this.invokeCollectionChanged(Common.CollectionChangedAction.Add, items, insertionIndex);
            return newLength;
        };
        /**
         * Removes an item from the end of the collection
         * @return The item that was removed from the collection
         */
        ObservableCollection.prototype.pop = function () {
            var oldItem = this._list.pop();
            this.propertyChanged.invoke(ObservableCollection.LengthProperty);
            this.invokeCollectionChanged(Common.CollectionChangedAction.Remove, null, null, [oldItem], this._list.length);
            return oldItem;
        };
        /**
         * Remove items from the collection and add to the collection at the given index
         * @param index The location of where to remove and add items
         * @param removeCount The number of items to rmeove
         * @param items New item(s) to add to the collection
         * @return The removed items
         */
        ObservableCollection.prototype.splice = function (index, removeCount) {
            var items = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                items[_i - 2] = arguments[_i];
            }
            var args = [index, removeCount];
            if (items) {
                Array.prototype.push.apply(args, items);
            }
            var removedItems = Array.prototype.splice.apply(this._list, args);
            var itemsRemoved = removedItems.length > 0;
            var itemsAdded = items && items.length > 0;
            if (itemsRemoved || itemsAdded) {
                this.propertyChanged.invoke(ObservableCollection.LengthProperty);
                if (itemsRemoved) {
                    this.invokeCollectionChanged(Common.CollectionChangedAction.Remove, null, null, removedItems, index);
                }
                if (itemsAdded) {
                    this.invokeCollectionChanged(Common.CollectionChangedAction.Add, items, index, null, null);
                }
            }
            return removedItems;
        };
        /**
         * Returns the first occurrence of an item in the collection
         * @param searchElement The item to search for
         * @param fromIndex The starting index to search from (defaults to collection start)
         * @return The index of the first occurrence of the item, or -1 if it was not found
         */
        ObservableCollection.prototype.indexOf = function (searchElement, fromIndex) {
            return this._list.indexOf(searchElement, fromIndex);
        };
        /**
         * Returns the last occurrence of an item in the collection
         * @param searchElement The item to search for
         * @param fromIndex The starting index to search from (defaults to collection end)
         * @return The index of the last occurrence of the item, or -1 if it was not found
         */
        ObservableCollection.prototype.lastIndexOf = function (searchElement, fromIndex) {
            if (fromIndex === void 0) { fromIndex = -1; }
            return this._list.lastIndexOf(searchElement, fromIndex);
        };
        /**
         * Clears the contents of the collection to an empty collection
         */
        ObservableCollection.prototype.clear = function () {
            this._list = [];
            this.propertyChanged.invoke(ObservableCollection.LengthProperty);
            this.invokeCollectionChanged(Common.CollectionChangedAction.Clear);
        };
        /**
         * Returns the elements of the collection that meet the condition specified in a callback function.
         * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the collection.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        ObservableCollection.prototype.filter = function (callbackfn, thisArg) {
            return this._list.filter(callbackfn, thisArg);
        };
        /**
         * Calls a defined callback function on each element of the collection, and returns an array that contains the results.
         * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        ObservableCollection.prototype.map = function (callbackfn, thisArg) {
            return this._list.map(callbackfn, thisArg);
        };
        /**
         * Retrieves an item from the collection
         * @param index The index of the item to retrieve
         * @return The requested item, or undefined if the item does not exist
         */
        ObservableCollection.prototype.getItem = function (index) {
            return this._list[index];
        };
        /**
         * Replaces the contents of the collection with the supplied items
         * @return The new length of the collection
         */
        ObservableCollection.prototype.resetItems = function (items) {
            this._list = [];
            var newLength = Array.prototype.push.apply(this._list, items);
            this.propertyChanged.invoke(ObservableCollection.LengthProperty);
            this.invokeCollectionChanged(Common.CollectionChangedAction.Reset);
            return newLength;
        };
        /**
         * Helper method to invoke a CollectionChangedEvent
         * @param action The action which provoked the event (Add, Remove, Reset or Clear)
         * @param newItems The new items which were involved in an Add event
         * @param newStartingIndex The index at which the Add occurred
         * @param oldItems The old items which were involved in a Remove event
         * @param oldStartingIndex The index at which the Remove occurred
         */
        ObservableCollection.prototype.invokeCollectionChanged = function (action, newItems, newStartingIndex, oldItems, oldStartingIndex) {
            var event = {
                action: action,
                newItems: newItems,
                newStartingIndex: newStartingIndex,
                oldItems: oldItems,
                oldStartingIndex: oldStartingIndex
            };
            this.collectionChanged.invoke(event);
        };
        /** Represents the name of the length property on the ObservableCollection */
        ObservableCollection.LengthProperty = "length";
        return ObservableCollection;
    }());
    Common.ObservableCollection = ObservableCollection;
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="../Framework/Model/ObservableCollection.ts" />
/// <reference path="../Framework/Templating/TemplateControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A control which binds to an array or ObservableCollection and generates an item container for each
         */
        var ItemsControl = (function (_super) {
            __extends(ItemsControl, _super);
            /**
             * Constructor
             * @param templateId The id of the template to apply to the control.
             */
            function ItemsControl(templateId) {
                _super.call(this, templateId);
            }
            /**
             * Static constructor used to initialize observable properties
             */
            ItemsControl.initialize = function () {
                Common.ObservableHelpers.defineProperty(ItemsControl, "items", "", function (obj, oldValue, newValue) { return obj.onItemsChange(oldValue, newValue); });
                Common.ObservableHelpers.defineProperty(ItemsControl, "itemContainerControl", "", function (obj, oldValue, newValue) { return obj.onItemContainerControlChange(oldValue, newValue); });
            };
            /**
             * Retrieves an item from the current items collection
             * @param index The index of the item to retrieve
             * @return The requested item, or undefined if the item does not exist
             */
            ItemsControl.prototype.getItem = function (index) {
                F12.Tools.Utility.Assert.isTrue(!!this._collection, "Expecting a non-null collection in the ItemsControl");
                return this._collection.getItem(index);
            };
            /**
             * Retrieves the number of items in the current items collection
             * @return The number of items currently in the ItemsControl's collection
             */
            ItemsControl.prototype.getItemCount = function () {
                if (!this._collection) {
                    return 0;
                }
                return this._collection.length;
            };
            /**
             * Implemented by the derived class to dispose any events or resources created for the container
             */
            ItemsControl.prototype.disposeItemContainerOverride = function (control) {
                // Implemented by the derived class
            };
            /**
             * Implemented by the derived class to allow it to customize the container control
             */
            ItemsControl.prototype.prepareItemContainerOverride = function (control, item) {
                // Implemented by the derived class
            };
            /**
             * Updates the control when the template has changed.
             */
            ItemsControl.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                this._panelRootElement = this.getNamedElement(ItemsControl.PanelRootElementName) || this.rootElement;
                F12.Tools.Utility.Assert.isTrue(!!this._panelRootElement, "Expecting a root element for the panel in ItemsControl.");
                this.regenerateItemControls();
            };
            /**
             * Updates the control when the template is about to change.
             */
            ItemsControl.prototype.onTemplateChanging = function () {
                this.removeAllItemControls();
                _super.prototype.onTemplateChanging.call(this);
            };
            /**
             * Overridable and allows sub-classes to update when the items property changes
             */
            ItemsControl.prototype.onItemsChangedOverride = function () {
            };
            /**
             * Overridable and allows sub-classes to update when the items container control
             * changes (which results in a full rebuild of the child controls).
             */
            ItemsControl.prototype.onItemContainerControlChangedOverride = function () {
            };
            /**
             * Overridable and allows sub-classes to update when the container collection is changed
             */
            ItemsControl.prototype.onCollectionChangedOverride = function (args) {
            };
            ItemsControl.prototype.onItemsChange = function (oldValue, newValue) {
                if (this._collectionChangedRegistration) {
                    this._collectionChangedRegistration.unregister();
                    this._collectionChangedRegistration = null;
                }
                this._collection = null;
                if (this.items) {
                    if (this.items.collectionChanged) {
                        this._collectionChangedRegistration = this.items.collectionChanged.addHandler(this.onCollectionChanged.bind(this));
                        this._collection = this.items;
                    }
                    else {
                        // items is just an array, wrap it with a collection
                        this._collection = new Common.ObservableCollection(this.items);
                    }
                }
                this.regenerateItemControls();
                this.onItemsChangedOverride();
            };
            ItemsControl.prototype.onItemContainerControlChange = function (oldValue, newValue) {
                this._itemContainerClassType = null;
                this._itemContainerTemplateId = null;
                this._itemContainerIsTemplateControl = false;
                if (this.itemContainerControl) {
                    var parts = this.itemContainerControl.split(/[()]/, 2);
                    if (parts && parts.length > 0) {
                        // Retrieve the classname and verify it's a valid string.
                        var className = parts[0];
                        if (className) {
                            className = className.trim();
                        }
                        F12.Tools.Utility.Assert.isTrue(!!className, "Invalid itemContainerControl value. The control class name is required.");
                        // templateId can be null or empty. So, no checks for it.
                        var templateId = parts[1];
                        if (templateId) {
                            templateId = templateId.trim();
                        }
                        this._itemContainerClassType = Common.TemplateLoader.getControlType(className);
                        this._itemContainerTemplateId = templateId;
                        this._itemContainerIsTemplateControl = this._itemContainerClassType === Common.TemplateControl || this._itemContainerClassType.prototype instanceof Common.TemplateControl;
                    }
                }
                this.regenerateItemControls();
                this.onItemContainerControlChangedOverride();
            };
            ItemsControl.prototype.onCollectionChanged = function (args) {
                switch (args.action) {
                    case Common.CollectionChangedAction.Add:
                        this.insertItemControls(args.newStartingIndex, args.newItems.length);
                        break;
                    case Common.CollectionChangedAction.Clear:
                        this.removeAllItemControls();
                        break;
                    case Common.CollectionChangedAction.Remove:
                        this.removeItemControls(args.oldStartingIndex, args.oldItems.length);
                        break;
                    case Common.CollectionChangedAction.Reset:
                        this.regenerateItemControls();
                        break;
                }
                this.onCollectionChangedOverride(args);
            };
            ItemsControl.prototype.createItemControl = function (item) {
                var control = new this._itemContainerClassType(this._itemContainerTemplateId);
                this.prepareItemContainer(control, item);
                return control;
            };
            ItemsControl.prototype.disposeItemContainer = function (control) {
                this.disposeItemContainerOverride(control);
                if (control && control.model) {
                    control.model = null;
                }
            };
            ItemsControl.prototype.prepareItemContainer = function (control, item) {
                if (this._itemContainerIsTemplateControl) {
                    control.model = item;
                }
                this.prepareItemContainerOverride(control, item);
            };
            ItemsControl.prototype.regenerateItemControls = function () {
                this.removeAllItemControls();
                if (!this._collection) {
                    return;
                }
                this.insertItemControls(0, this._collection.length);
            };
            ItemsControl.prototype.insertItemControls = function (itemIndex, count) {
                if (!this._itemContainerClassType) {
                    return;
                }
                var end = itemIndex + count;
                F12.Tools.Utility.Assert.isTrue(end <= this._collection.length, "Unexpected range after inserting into items.");
                F12.Tools.Utility.Assert.isTrue(itemIndex <= this._panelRootElement.childElementCount, "Collection and child elements mismatch.");
                if (itemIndex === this._panelRootElement.childElementCount) {
                    // We are adding items at the end, use appendChild
                    for (var i = itemIndex; i < end; i++) {
                        var item = this._collection.getItem(i);
                        var control = this.createItemControl(item);
                        this._panelRootElement.appendChild(control.rootElement);
                    }
                }
                else {
                    // We are adding items in the middle, use insertBefore.
                    // Find the node we would want to insert before.
                    var endNode = this._panelRootElement.childNodes.item(itemIndex);
                    for (var i = itemIndex; i < end; i++) {
                        var item = this._collection.getItem(i);
                        var control = this.createItemControl(item);
                        this._panelRootElement.insertBefore(control.rootElement, endNode);
                    }
                }
            };
            ItemsControl.prototype.removeAllItemControls = function () {
                if (this._panelRootElement) {
                    var children = this._panelRootElement.children;
                    var childrenLength = children.length;
                    for (var i = 0; i < childrenLength; i++) {
                        var control = children[i].control;
                        this.disposeItemContainer(control);
                    }
                    this._panelRootElement.innerHTML = "";
                }
            };
            ItemsControl.prototype.removeItemControls = function (itemIndex, count) {
                for (var i = itemIndex + count - 1; i >= itemIndex; i--) {
                    var element = this._panelRootElement.children[i];
                    if (element) {
                        var control = element.control;
                        this.disposeItemContainer(control);
                        this._panelRootElement.removeChild(element);
                    }
                }
            };
            /** The root element which will be used to contain all items. If no element was found with this name, the control rootElement is used. */
            ItemsControl.PanelRootElementName = "_panel";
            return ItemsControl;
        }(Common.TemplateControl));
        Controls.ItemsControl = ItemsControl;
        ItemsControl.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="../Framework/Model/Observable.ts" />
/// <reference path="ItemsControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        var ComboBox = (function (_super) {
            __extends(ComboBox, _super);
            /**
             * Constructor
             * @param templateId The id of the template to apply to the control
             */
            function ComboBox(templateId) {
                _super.call(this, templateId || "Common.defaultComboBoxTemplate");
            }
            Object.defineProperty(ComboBox.prototype, "focusableElement", {
                get: function () { return this.rootElement; },
                enumerable: true,
                configurable: true
            });
            /**
             * Static constructor used to initialize observable properties
             */
            ComboBox.initialize = function () {
                Common.ObservableHelpers.defineProperty(ComboBox, ComboBox.SelectedValuePropertyName, "");
            };
            /** @inheritdoc */
            ComboBox.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._mouseHandler = function (e) { return _this.onMouseEvent(e); };
                this.itemContainerControl = "Common.TemplateControl(Common.defaultComboBoxItemTemplate)";
            };
            /**
             * Updates the control when the template has changed
             */
            ComboBox.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                if (this.rootElement) {
                    this.rootElement.addEventListener("mouseover", this._mouseHandler);
                }
            };
            /**
             * Updates the control when the template is about to change. Removes event handlers from previous root element.
             */
            ComboBox.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this.rootElement) {
                    this.rootElement.removeEventListener("mouseover", this._mouseHandler);
                }
            };
            /**
             * Overridable and allows sub-classes to update when the items property changes
             */
            ComboBox.prototype.onItemsChangedOverride = function () {
                // Ensure the view is notified so that the selection can be properly reflected
                this.propertyChanged.invoke(ComboBox.SelectedValuePropertyName);
            };
            /**
             * Overridable and allows sub-classes to update when the items container control
             * changes (which results in a full rebuild of the child controls).
             */
            ComboBox.prototype.onItemContainerControlChangedOverride = function () {
                // Ensure the view is notified so that the selection can be properly reflected
                this.propertyChanged.invoke(ComboBox.SelectedValuePropertyName);
            };
            /**
             * Overridable and allows sub-classes to update when the container collection is changed
             */
            ComboBox.prototype.onCollectionChangedOverride = function (args) {
                // Ensure the view is notified so that the selection can be properly reflected
                this.propertyChanged.invoke(ComboBox.SelectedValuePropertyName);
            };
            /**
             * Protected overridable method. Gets called when isEnabled value changes
             */
            ComboBox.prototype.onIsEnabledChangedOverride = function () {
                _super.prototype.onIsEnabledChangedOverride.call(this);
                if (this.isEnabled) {
                    this.rootElement.removeAttribute("disabled");
                }
                else {
                    this.rootElement.setAttribute("disabled", "disabled");
                }
            };
            /**
             * Handles mouse events to allow the button to be interacted with via the mouse
             * @param e The mouse event
             */
            ComboBox.prototype.onMouseEvent = function (e) {
                if (this.isEnabled) {
                    switch (e.type) {
                        case "mouseover":
                            var currentValue = this.selectedValue;
                            var itemCount = this.getItemCount();
                            for (var i = 0; i < itemCount; i++) {
                                var item = this.getItem(i);
                                if (item.value === currentValue) {
                                    if (item.tooltip) {
                                        Microsoft.Plugin.Tooltip.show({ content: item.tooltip });
                                    }
                                }
                            }
                            break;
                        default:
                            F12.Tools.Utility.Assert.fail("Unexpected");
                    }
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            };
            ComboBox.SelectedValuePropertyName = "selectedValue";
            return ComboBox;
        }(Controls.ItemsControl));
        Controls.ComboBox = ComboBox;
        ComboBox.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="MenuItem.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A menu item with a combobox input.
         */
        var ComboBoxMenuItem = (function (_super) {
            __extends(ComboBoxMenuItem, _super);
            function ComboBoxMenuItem(templateId) {
                _super.call(this, templateId || "Common.menuItemComboBoxTemplate");
            }
            /**
             * Static constructor used to initialize observable properties
             */
            ComboBoxMenuItem.initialize = function () {
                Common.ObservableHelpers.defineProperty(ComboBoxMenuItem, "items", null);
                Common.ObservableHelpers.defineProperty(ComboBoxMenuItem, "selectedValue", null);
            };
            /** @inheritdoc */
            ComboBoxMenuItem.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._focusInHandler = function (e) { return _this.onFocusIn(e); };
            };
            ComboBoxMenuItem.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                this._selectElement = this.getNamedElement("BPT-menuItemComboBox");
                F12.Tools.Utility.Assert.isTrue(!!this._selectElement, "Expecting a combobox with the name BPT-menuItemComboBox");
                this.rootElement.addEventListener("focusin", this._focusInHandler);
            };
            /**
             * Overridable protected to allow the derived class to intercept handling key-up event.
             * @param e The keyboard event
             */
            ComboBoxMenuItem.prototype.onKeyUpOverride = function (e) {
                var handled = false;
                // The combobox needs to handle the following keys in order to function as expected.
                if (e.srcElement === this._selectElement &&
                    e.key === Common.Keys.SPACEBAR || e.key === Common.Keys.ENTER || e.key === Common.Keys.DOWN || e.key === Common.Keys.UP) {
                    handled = true;
                }
                if (!handled) {
                    handled = _super.prototype.onKeyUpOverride.call(this, e);
                }
                return handled;
            };
            ComboBoxMenuItem.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this.rootElement) {
                    this.rootElement.removeEventListener("focusin", this._focusInHandler);
                }
            };
            /**
             * Handles checking the menuitem when clicked
             * @param e An optional event object.
             */
            ComboBoxMenuItem.prototype.press = function (e) {
                // The combobox menu item has no pressing logic
            };
            ComboBoxMenuItem.prototype.onFocusIn = function (e) {
                // Transfer focus to the combobox when the menu item gets focus
                this._selectElement.focus();
            };
            return ComboBoxMenuItem;
        }(Common.Controls.MenuItem));
        Controls.ComboBoxMenuItem = ComboBoxMenuItem;
        ComboBoxMenuItem.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="../Framework/Templating/TemplateControl.ts" />
/// <reference path="Button.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A panel class which is templatable and provides easy access to controls
         * for the purpose of event handler subscription, etc
         */
        var Panel = (function (_super) {
            __extends(Panel, _super);
            /**
             * Constructor
             * @constructor
             * @param templateId The templateId to use with this panel. If not provided the template root will be a <div> element.
             */
            function Panel(templateId) {
                _super.call(this, templateId);
            }
            /**
             * Static constructor used to initialize observable properties
             */
            Panel.initialize = function () {
            };
            /**
             * Updates the button with the given name with a click handler
             * @param buttonName Name of the button as provided in data-name attribute
             * @param clickHandler Click handler to be added to the button
             */
            Panel.prototype.addClickHandlerToButton = function (buttonName, clickHandler) {
                var element = this.getNamedElement(buttonName);
                if (element && element.control) {
                    element.control.click.addHandler(clickHandler);
                }
            };
            return Panel;
        }(Common.TemplateControl));
        Controls.Panel = Panel;
        Panel.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="../Framework/Model/Observable.ts" />
/// <reference path="../Framework/Templating/TemplateControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        var TextBox = (function (_super) {
            __extends(TextBox, _super);
            /**
             * Constructor
             * @param templateId The id of the template to apply to the control
             */
            function TextBox(templateId) {
                _super.call(this, templateId || "Common.defaultTextBoxTemplate");
            }
            Object.defineProperty(TextBox.prototype, "focusableElement", {
                get: function () { return this.rootElement; },
                enumerable: true,
                configurable: true
            });
            /**
             * Static constructor used to initialize observable properties
             */
            TextBox.initialize = function () {
                Common.ObservableHelpers.defineProperty(TextBox, TextBox.PlaceholderPropertyName, "");
                Common.ObservableHelpers.defineProperty(TextBox, TextBox.TextPropertyName, "");
            };
            /** @inheritdoc */
            TextBox.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._keyboardHandler = function (e) { return _this.onKeyboardEvent(e); };
            };
            /**
             * Updates the control when the template has changed
             */
            TextBox.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                this._inputRootElement = (this.getNamedElement(TextBox.InputElementName) || this.rootElement);
                F12.Tools.Utility.Assert.isTrue(!!this._inputRootElement, "Expecting a root element for the input element in TextBox.");
                this._textBinding = this.getBinding(this._inputRootElement, "value");
                this._inputRootElement.addEventListener("keydown", this._keyboardHandler);
                this._inputRootElement.addEventListener("keypress", this._keyboardHandler);
                this._inputRootElement.addEventListener("input", this._keyboardHandler);
            };
            /**
             * Handles a change to the isEnabled property
             */
            TextBox.prototype.onIsEnabledChangedOverride = function () {
                _super.prototype.onIsEnabledChangedOverride.call(this);
                if (this.isEnabled) {
                    this.rootElement.removeAttribute("disabled");
                }
                else {
                    this.rootElement.setAttribute("disabled", "disabled");
                }
            };
            /**
             * Updates the control when the template is about to change. Removes event handlers from previous root element.
             */
            TextBox.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this._inputRootElement) {
                    this._inputRootElement.removeEventListener("keypress", this._keyboardHandler);
                    this._inputRootElement.removeEventListener("keydown", this._keyboardHandler);
                    this._inputRootElement.removeEventListener("input", this._keyboardHandler);
                }
            };
            /**
             * Handles keyboard events to allow the button to be interacted with via the keyboard
             * @param e The mouse event
             */
            TextBox.prototype.onKeyboardEvent = function (e) {
                if (this.isEnabled) {
                    switch (e.type) {
                        case "keydown":
                            if (e.key === Common.Keys.ENTER) {
                                if (this._textBinding) {
                                    this._textBinding.updateSourceFromDest();
                                }
                            }
                            break;
                        case "keypress":
                            if (this.clearOnEscape && e.keyCode === Common.KeyCodes.Escape) {
                                this._inputRootElement.value = "";
                                if (this._textBinding) {
                                    this._textBinding.updateSourceFromDest();
                                }
                                // We don't want the textbox to handle escape
                                e.stopImmediatePropagation();
                                e.preventDefault();
                            }
                            break;
                        case "input":
                            if (this.updateOnInput) {
                                if (this._textBinding) {
                                    this._textBinding.updateSourceFromDest();
                                }
                            }
                            break;
                        default:
                            F12.Tools.Utility.Assert.fail("Unexpected");
                    }
                }
            };
            TextBox.PlaceholderPropertyName = "placeholder";
            TextBox.TextPropertyName = "text";
            /** The root element which will be used to contain all items. If no element was found with this name, the control rootElement is used. */
            TextBox.InputElementName = "_textBoxRoot";
            return TextBox;
        }(Common.TemplateControl));
        Controls.TextBox = TextBox;
        TextBox.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="MenuItem.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A menu item with a textbox input.
         */
        var TextBoxMenuItem = (function (_super) {
            __extends(TextBoxMenuItem, _super);
            function TextBoxMenuItem(templateId) {
                _super.call(this, templateId || "Common.menuItemTextBoxTemplate");
            }
            /**
             * Static constructor used to initialize observable properties
             */
            TextBoxMenuItem.initialize = function () {
                Common.ObservableHelpers.defineProperty(TextBoxMenuItem, TextBoxMenuItem.PlaceholderPropertyName, null);
            };
            /** @inheritdoc */
            TextBoxMenuItem.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._focusInHandler = function (e) { return _this.onFocusIn(e); };
            };
            TextBoxMenuItem.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                this._textBox = this.getNamedElement("BPT-menuItemTextBox");
                F12.Tools.Utility.Assert.isTrue(!!this._textBox, "Expecting a textbox with the name BPT-menuItemTextBox");
                this.rootElement.addEventListener("focusin", this._focusInHandler);
            };
            /**
             * Overridable protected to allow the derived class to intercept handling key-up event.
             * @param e The keyboard event
             */
            TextBoxMenuItem.prototype.onKeyUpOverride = function (e) {
                var handled = false;
                if (e.srcElement === this._textBox && e.keyCode === Common.KeyCodes.Escape) {
                    // We don't want the key to reach the menu control
                    e.stopImmediatePropagation();
                    handled = true;
                }
                if (!handled) {
                    handled = _super.prototype.onKeyUpOverride.call(this, e);
                }
                return handled;
            };
            TextBoxMenuItem.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this.rootElement) {
                    this.rootElement.removeEventListener("focusin", this._focusInHandler);
                }
            };
            /**
             * Handles checking the menuitem when clicked
             * @param e An optional event object.
             */
            TextBoxMenuItem.prototype.press = function (e) {
                // The textbox menu item cannot be pressed.
            };
            TextBoxMenuItem.prototype.onFocusIn = function (e) {
                // Transfer focus to the textbox when the menu item gets focus
                this._textBox.focus();
                // Don't stop the event from bubbling, we still want the event to reach the menu control to update the current selectedIndex
            };
            TextBoxMenuItem.PlaceholderPropertyName = "placeholder";
            return TextBoxMenuItem;
        }(Common.Controls.MenuItem));
        Controls.TextBoxMenuItem = TextBoxMenuItem;
        TextBoxMenuItem.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="Button.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A Button class which is templatable and provides basic button functionality
         */
        var ToggleButton = (function (_super) {
            __extends(ToggleButton, _super);
            /**
             * Constructor
             * @param templateId The id of the template to apply to the control
             */
            function ToggleButton(templateId) {
                var _this = this;
                _super.call(this, templateId);
                this.toggleIsCheckedOnClick = true;
                this.click.addHandler(function (e) {
                    if (_this.toggleIsCheckedOnClick) {
                        _this.isChecked = !_this.isChecked;
                    }
                });
            }
            /**
             * Static constructor used to initialize observable properties
             */
            ToggleButton.initialize = function () {
                Common.ObservableHelpers.defineProperty(Controls.Button, "isChecked", false, function (obj, oldValue, newValue) { return obj.onIsCheckedChanged(oldValue, newValue); });
            };
            /** @inheritdoc */
            ToggleButton.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._modificationHandler = function (e) { return _this.onModificationEvent(e); };
            };
            /**
             * Updates the control when the template has changed
             */
            ToggleButton.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                if (this.rootElement) {
                    this.rootElement.addEventListener("DOMAttrModified", this._modificationHandler);
                    // Ensure the control is in the correct state
                    this.onIsCheckedChanged(null, this.isChecked);
                }
            };
            /**
             * Updates the control when the template is about to change. Removes event handlers from previous root element.
             */
            ToggleButton.prototype.onTemplateChanging = function () {
                _super.prototype.onTemplateChanging.call(this);
                if (this.rootElement) {
                    this.rootElement.removeEventListener("DOMAttrModified", this._modificationHandler);
                }
            };
            /**
             * Handles a change to the isChecked property
             * @param oldValue The old value for the property
             * @param newValue The new value for the property
             */
            ToggleButton.prototype.onIsCheckedChanged = function (oldValue, newValue) {
                if (this.rootElement) {
                    if (!this._isChangingAriaPressed) {
                        this._isChangingAriaPressed = true;
                        this.rootElement.setAttribute("aria-pressed", newValue + "");
                        this._isChangingAriaPressed = false;
                    }
                    if (newValue) {
                        this.rootElement.classList.add(ToggleButton.CLASS_CHECKED);
                    }
                    else {
                        this.rootElement.classList.remove(ToggleButton.CLASS_CHECKED);
                    }
                }
            };
            /**
             * Handles DOM modification events to determine if an accessibility tool has changed aria-pressed
             * @param e The keyboard event
             */
            ToggleButton.prototype.onModificationEvent = function (e) {
                if (!this._isChangingAriaPressed && this.isEnabled && e.attrName === "aria-pressed" && e.attrChange === e.MODIFICATION) {
                    this._isChangingAriaPressed = true;
                    this.isChecked = e.newValue === "true";
                    this._isChangingAriaPressed = false;
                }
            };
            /** CSS class to apply to the button's root element when it's checked */
            ToggleButton.CLASS_CHECKED = "checked";
            return ToggleButton;
        }(Controls.Button));
        Controls.ToggleButton = ToggleButton;
        ToggleButton.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Assert.ts" />
/// <reference path="ControlUtilities.ts" />
/// <reference path="Panel.ts" />
/// <reference path="ContentControl.ts" />
/// <disable code="SA1513" rule="ClosingCurlyBracketMustBeFollowedByBlankLine" justification="tscop is not liking do/while syntax"/>
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        "use strict";
        /**
         * A toolbar class which is templatable and provides toolbar functionality
         */
        var ToolbarControl = (function (_super) {
            __extends(ToolbarControl, _super);
            /**
             * Constructor
             * @constructor
             * @param templateId The id of the template to apply to the control, for example: Common.toolbarTemplateWithSearchBox.
             *        Default is Common.defaultToolbarTemplate.
             */
            function ToolbarControl(templateId) {
                _super.call(this, templateId || "Common.defaultToolbarTemplate");
            }
            /**
             * Static constructor used to initialize observable properties
             */
            ToolbarControl.initialize = function () {
                Common.ObservableHelpers.defineProperty(ToolbarControl, ToolbarControl.PanelTemplateIdPropertyName, /*defaultValue=*/ "", function (obj, oldValue, newValue) { return obj.onPanelTemplateIdChanged(oldValue, newValue); });
                Common.ObservableHelpers.defineProperty(ToolbarControl, ToolbarControl.TitlePropertyName, /*defaultValue=*/ "");
            };
            /** @inheritdoc */
            ToolbarControl.prototype.onInitializeOverride = function () {
                var _this = this;
                _super.prototype.onInitializeOverride.call(this);
                this._activeIndex = -1;
                this._controls = [];
                this._controlsPropChangedRegistration = [];
                this._focusInHandler = function (e) { return _this.onFocusIn(e); };
                this._toolbarKeyHandler = function (e) { return _this.onToolbarKeyboardEvent(e); };
                this._toolbarPanel = null;
            };
            /**
             * Gets the active element that should have focus when tapping into the toolbar
             * @return The active element (or null if none if there isn't an active element)
             */
            ToolbarControl.prototype.getActiveElement = function () {
                if (this._activeIndex >= 0 && this._activeIndex < this._controls.length) {
                    return this._controls[this._activeIndex].rootElement;
                }
                return null;
            };
            /**
             * Moves focus to the next/previous control
             * @param direction A direction to move selection in (Next/Previous)
             */
            ToolbarControl.prototype.moveToControl = function (direction) {
                var step = (direction === Controls.NavigationDirection.Next) ? 1 : this._controls.length - 1;
                var focusedElement = document.activeElement;
                if (this._controls.length === 0 || this._activeIndex === -1 || !focusedElement) {
                    return;
                }
                var startIndex = this._activeIndex;
                // We need to find the startIndex form the document's activeElement if it's inside the toolbar
                // Because we can have a button that still has focus when it got disabled. So, in this case
                // while _activeIndex already moved, we still want to start from that index.
                for (var i = 0; i < this._controls.length; i++) {
                    if (this._controls[i].rootElement === focusedElement) {
                        startIndex = i;
                        break;
                    }
                }
                var currentIndex = startIndex;
                // Find the next visible and enabled control to focus (wrapping around the end/start if needed)
                while (startIndex !== (currentIndex = (currentIndex + step) % this._controls.length)) {
                    var control = this._controls[currentIndex];
                    if (control.isVisible && control.isEnabled) {
                        this.setActiveIndex(currentIndex, /*setFocus=*/ true);
                        break;
                    }
                }
            };
            ToolbarControl.prototype.onFocusIn = function (e) {
                // Find the control which contains the target and set it as the active index
                var controlIndex = 0;
                for (; controlIndex < this._controls.length; controlIndex++) {
                    var control = this._controls[controlIndex];
                    if (control.rootElement.contains(e.target)) {
                        break;
                    }
                }
                if (controlIndex < this._controls.length) {
                    this.setActiveIndex(controlIndex);
                }
            };
            /**
             * Handles a change to panelTemplateId. Resets the controls arrays with new controls
             * @param oldValue The old value for the property
             * @param newValue The new value for the property
             */
            ToolbarControl.prototype.onPanelTemplateIdChanged = function (oldValue, newValue) {
                if (this._toolbarPanel) {
                    this._toolbarPanel.removeEventListener("focusin", this._focusInHandler);
                    this._toolbarPanel.removeEventListener("keydown", this._toolbarKeyHandler);
                    this._toolbarPanel = null;
                }
                while (this._controlsPropChangedRegistration.length > 0) {
                    this._controlsPropChangedRegistration.pop().unregister();
                }
                if (newValue) {
                    this._controls = [];
                    this.setActiveIndex(-1);
                    this._toolbarPanel = this.getNamedElement(ToolbarControl.TOOLBAR_PANEL_ELEMENT_NAME);
                    F12.Tools.Utility.Assert.hasValue(this._toolbarPanel, "Expecting a toolbar panel with the name: " + ToolbarControl.TOOLBAR_PANEL_ELEMENT_NAME);
                    this._toolbarPanel.addEventListener("focusin", this._focusInHandler);
                    this._toolbarPanel.addEventListener("keydown", this._toolbarKeyHandler);
                    for (var elementIndex = 0; elementIndex < this._toolbarPanel.children.length; elementIndex++) {
                        var element = this._toolbarPanel.children[elementIndex];
                        if (element.control) {
                            F12.Tools.Utility.Assert.isTrue(element.control instanceof Common.TemplateControl, "We only support controls of type TemplateControl in the Toolbar");
                            var control = element.control;
                            this._controls.push(control);
                            this._controlsPropChangedRegistration.push(control.propertyChanged.addHandler(this.onChildControlPropertyChanged.bind(this, control)));
                        }
                    }
                }
                this.setTabStop();
            };
            ToolbarControl.prototype.onHostInfoChanged = function (e) {
                // Update the right margin of the toolbar area to ensure the shell buttons don't overlap it
                var scaledControlAreaWidth = e.controlAreaWidth * (screen.logicalXDPI / screen.deviceXDPI);
                var toolbarContents = this.rootElement.querySelector(".BPT-ToolbarContents");
                F12.Tools.Utility.Assert.hasValue(toolbarContents, "Unable to find an element with selector .BPT-ToolbarContents in the toolbar on hostInfoChanged");
                if (toolbarContents) {
                    toolbarContents.style.marginRight = scaledControlAreaWidth + "px";
                }
            };
            /**
             * Handles keyboard events to allow arrow key navigation for selecting the next/previous controls
             * @param e The keyboard event
             */
            ToolbarControl.prototype.onToolbarKeyboardEvent = function (e) {
                if (e.keyCode === Common.KeyCodes.ArrowLeft) {
                    this.moveToControl(Controls.NavigationDirection.Previous);
                    e.stopPropagation();
                }
                else if (e.keyCode === Common.KeyCodes.ArrowRight) {
                    this.moveToControl(Controls.NavigationDirection.Next);
                    e.stopPropagation();
                }
            };
            /**
             * Handles update of the tab index when child-controls have their enabled and visible settings toggled
             * @param button The button who's property has changed
             * @param propertyName Name of the observable property which changed on the button
             */
            ToolbarControl.prototype.onChildControlPropertyChanged = function (childControl, propertyName) {
                if (propertyName === Common.TemplateControl.IsEnabledPropertyName || propertyName === Common.TemplateControl.IsVisiblePropertyName) {
                    if (this._activeIndex === -1) {
                        this.setTabStop();
                    }
                    else {
                        var currentActiveControl = this._controls[this._activeIndex];
                        if (childControl === currentActiveControl) {
                            if (!(childControl.isEnabled && childControl.isVisible)) {
                                this.setTabStop(/*startAt=*/ this._activeIndex);
                            }
                        }
                    }
                }
            };
            /**
             * Ensures that if there is a visible and enabled control it will get a tab stop (1) and all the others will be disabled (-1)
             */
            ToolbarControl.prototype.setTabStop = function (startAt) {
                this.setActiveIndex(-1);
                startAt = startAt || 0;
                if (startAt < 0 || startAt >= this._controls.length) {
                    return;
                }
                var currentIndex = startAt;
                var foundTabStop = false;
                do {
                    var control = this._controls[currentIndex];
                    if (!foundTabStop && control.isVisible && control.isEnabled) {
                        this.setActiveIndex(currentIndex);
                        foundTabStop = true;
                    }
                    else {
                        control.tabIndex = -1;
                    }
                } while (startAt !== (currentIndex = (currentIndex + 1) % this._controls.length));
            };
            ToolbarControl.prototype.setActiveIndex = function (newIndex, setFocus) {
                if (this._activeIndex >= 0 && this._activeIndex < this._controls.length) {
                    this._controls[this._activeIndex].tabIndex = -1;
                }
                this._activeIndex = newIndex;
                var control = this._controls[this._activeIndex];
                if (control) {
                    control.tabIndex = 1;
                    if (setFocus) {
                        control.rootElement.focus();
                    }
                }
            };
            ToolbarControl.TOOLBAR_PANEL_ELEMENT_NAME = "_toolbarPanel";
            ToolbarControl.PanelTemplateIdPropertyName = "panelTemplateId";
            ToolbarControl.TitlePropertyName = "title";
            return ToolbarControl;
        }(Controls.Panel));
        Controls.ToolbarControl = ToolbarControl;
        ToolbarControl.initialize();
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../templateControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var ItemContainer = (function (_super) {
                __extends(ItemContainer, _super);
                function ItemContainer() {
                    var _this = this;
                    _super.call(this, document.createElement("div"));
                    this.rootElement.id = "listItemContainer" + (ItemContainer.IdCount++);
                    this.rootElement.className = ItemContainer.BASE_CSS_CLASSNAME;
                    this.rootElement.tabIndex = -1;
                    this.rootElement.addEventListener("focus", this.onFocus.bind(this));
                    this.rootElement.addEventListener("blur", this.onBlur.bind(this));
                    this.rootElement.addEventListener("click", this.onClick.bind(this));
                    this.rootElement.addEventListener("contextmenu", this.onContextMenu.bind(this));
                    this.rootElement.addEventListener("mouseover", function () {
                        _this.rootElement.classList.add(ItemContainer.HOVER_CSS_CLASSNAME);
                    });
                    this.rootElement.addEventListener("mouseleave", function () {
                        _this.rootElement.classList.remove(ItemContainer.HOVER_CSS_CLASSNAME);
                    });
                }
                Object.defineProperty(ItemContainer.prototype, "id", {
                    get: function () {
                        if (this.item) {
                            return this.item.id;
                        }
                        else {
                            return null;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ItemContainer.prototype, "isSelected", {
                    get: function () {
                        return this._isSelected;
                    },
                    set: function (value) {
                        if (this._isSelected !== value) {
                            this._isSelected = value;
                            this.updateStyle();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ItemContainer.prototype, "item", {
                    get: function () {
                        return this._item;
                    },
                    set: function (value) {
                        this._item = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ItemContainer.prototype, "template", {
                    get: function () {
                        return this._template;
                    },
                    set: function (value) {
                        this._template = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ItemContainer.prototype, "hasFocus", {
                    get: function () {
                        return this.id !== null && this.id === ItemContainer.FocusedContainerId;
                    },
                    set: function (value) {
                        if (value) {
                            ItemContainer.FocusedContainerId = this.id;
                        }
                        else {
                            ItemContainer.FocusedContainerId = null;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                ItemContainer.prototype.clearHoverState = function () {
                    this.rootElement.classList.remove(ItemContainer.HOVER_CSS_CLASSNAME);
                };
                ItemContainer.prototype.empty = function () {
                    this.item = null;
                    // Set to null as appose to false so the next time
                    // isSelected is called it gets through into updateStyle
                    // regardless whether the new value is true or false.
                    this._isSelected = null;
                    this.rootElement.classList.remove("itemContainerHover");
                };
                ItemContainer.prototype.focus = function () {
                    this.isSelected = true;
                    this.hasFocus = true;
                    this.updateStyle();
                    this.rootElement.focus();
                };
                ItemContainer.prototype.updateStyle = function () {
                    if (this._isSelected) {
                        if (this.hasFocus) {
                            this.rootElement.classList.add(ItemContainer.SELECTED_ACTIVE_CSS_CLASSNAME);
                        }
                        else {
                            this.rootElement.classList.add(ItemContainer.SELECTED_CSS_CLASSNAME);
                            this.rootElement.classList.remove(ItemContainer.SELECTED_ACTIVE_CSS_CLASSNAME);
                        }
                    }
                    else {
                        this.rootElement.classList.remove(ItemContainer.SELECTED_CSS_CLASSNAME);
                        this.rootElement.classList.remove(ItemContainer.SELECTED_ACTIVE_CSS_CLASSNAME);
                    }
                };
                ItemContainer.prototype.onBlur = function () {
                    this.hasFocus = false;
                    this.updateStyle();
                };
                ItemContainer.prototype.onClick = function (e) {
                    if (this.clicked) {
                        this.clicked(e);
                        e.stopImmediatePropagation();
                    }
                };
                ItemContainer.prototype.onContextMenu = function (e) {
                    if (this.contextMenu) {
                        this.contextMenu();
                    }
                };
                ItemContainer.prototype.onFocus = function () {
                    this.hasFocus = true;
                    this.updateStyle();
                };
                ItemContainer.BASE_CSS_CLASSNAME = "BPT-listItemContainer";
                ItemContainer.HOVER_CSS_CLASSNAME = "BPT-listItemContainerHover";
                ItemContainer.SELECTED_CSS_CLASSNAME = "BPT-listItemSelected";
                ItemContainer.SELECTED_ACTIVE_CSS_CLASSNAME = "BPT-listItemSelectedActive";
                ItemContainer.IdCount = 0;
                return ItemContainer;
            }(Common.Controls.Legacy.Control));
            Legacy.ItemContainer = ItemContainer;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ItemContainer.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ItemContainer.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="DataSource.ts" />
/// <reference path="ItemContainer.ts" />
/// <reference path="IItemContainerGenerator.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var ItemContainerGenerator = (function () {
                function ItemContainerGenerator() {
                    this._itemContainers = {};
                    this._unusedItemContainers = [];
                }
                Object.defineProperty(ItemContainerGenerator.prototype, "count", {
                    get: function () {
                        if (!this._dataSource) {
                            return 0;
                        }
                        return this._dataSource.count;
                    },
                    enumerable: true,
                    configurable: true
                });
                ItemContainerGenerator.prototype.setDataSource = function (dataSource) {
                    if (this._dataSource !== dataSource) {
                        this._dataSource = dataSource;
                        this._currentIndex = null;
                        this.recycleAll();
                    }
                };
                ItemContainerGenerator.prototype.startAt = function (index) {
                    if (!this._dataSource) {
                        return;
                    }
                    F12.Tools.Utility.Assert.isTrue(index >= 0 && index < this._dataSource.count, "Index out of range.");
                    this._currentIndex = index;
                    this._dataSource.startAt(this._currentIndex);
                };
                ItemContainerGenerator.prototype.stop = function () {
                    if (!this._dataSource) {
                        return;
                    }
                    this._currentIndex = null;
                    this._dataSource.stop();
                };
                ItemContainerGenerator.prototype.ensureDataAvailable = function (startIndex, endIndex) {
                    var promise;
                    if (!this._dataSource) {
                        promise = Common.PromiseHelper.getPromiseSuccess();
                    }
                    else {
                        promise = this._dataSource.ensureDataAvailable(startIndex, endIndex);
                    }
                    return promise;
                };
                ItemContainerGenerator.prototype.getNext = function () {
                    if (!this._dataSource) {
                        return null;
                    }
                    F12.Tools.Utility.Assert.isTrue(this._currentIndex !== null, "Invalid operation. startAt must be called before calling getNext.");
                    var itemContainer = null;
                    if (this._currentIndex < this._dataSource.count) {
                        var item = this._dataSource.getNext();
                        if (item) {
                            itemContainer = this._itemContainers[this._currentIndex];
                            if (!itemContainer) {
                                itemContainer = this.getItemContainer(this._currentIndex, item);
                                this._itemContainers[this._currentIndex] = itemContainer;
                            }
                            this._currentIndex += 1;
                        }
                    }
                    return itemContainer;
                };
                ItemContainerGenerator.prototype.getItemContainerFromItemId = function (itemId) {
                    for (var key in this._itemContainers) {
                        var itemContainer = this._itemContainers[key];
                        if (itemContainer.id === itemId) {
                            return itemContainer;
                        }
                    }
                    // Item wasn't realized
                    return null;
                };
                ItemContainerGenerator.prototype.getItemContainerFromIndex = function (index) {
                    return this._itemContainers[index];
                };
                ItemContainerGenerator.prototype.recycle = function (index) {
                    var itemContainer = this._itemContainers[index];
                    if (itemContainer) {
                        delete this._itemContainers[index];
                        itemContainer.empty();
                        this._unusedItemContainers.push(itemContainer);
                    }
                };
                ItemContainerGenerator.prototype.recycleAll = function () {
                    for (var key in this._itemContainers) {
                        var itemContainer = this._itemContainers[key];
                        if (itemContainer) {
                            itemContainer.empty();
                            this._unusedItemContainers.push(itemContainer);
                        }
                    }
                    this._itemContainers = {};
                };
                ItemContainerGenerator.prototype.getItemContainer = function (itemIndex, item) {
                    var itemContainer;
                    if (this._unusedItemContainers.length > 0) {
                        itemContainer = this._unusedItemContainers.pop();
                    }
                    else {
                        itemContainer = new Legacy.ItemContainer();
                    }
                    itemContainer.item = item;
                    return itemContainer;
                };
                return ItemContainerGenerator;
            }());
            Legacy.ItemContainerGenerator = ItemContainerGenerator;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ItemContainer.ts" />
/// <reference path="IItemContainerGenerator.ts" />
/// <reference path="IItemContainerTemplateBinder.ts" />
/// <reference path="../TemplateControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var StackPanel = (function (_super) {
                __extends(StackPanel, _super);
                function StackPanel(parentContainer) {
                    _super.call(this, "Common.stackPanelTemplate", Common.templateRepository);
                    this._parentContainer = parentContainer;
                    this._parentContainer.appendChild(this.rootElement);
                    this._content = this.findElement("content");
                    this.children = {};
                    this._requestScrollToOffset = null;
                    this.rootElement.addEventListener("scroll", this.onScroll.bind(this), true /*capture*/);
                    this._scrollTopCached = null;
                }
                Object.defineProperty(StackPanel.prototype, "content", {
                    get: function () {
                        return this._content;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "parentContainer", {
                    get: function () {
                        return this._parentContainer;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "rowHeight", {
                    get: function () {
                        if (!this._rowHeight) {
                            var itemContainer = new Legacy.ItemContainer();
                            this.content.appendChild(itemContainer.rootElement);
                            this._rowHeight = itemContainer.rootElement.offsetHeight;
                            try {
                                this.content.removeChild(itemContainer.rootElement);
                            }
                            catch (e) {
                            }
                        }
                        return this._rowHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "viewportHeight", {
                    get: function () {
                        if (!this._viewportHeight) {
                            this._viewportHeight = Math.floor(this._parentContainer.getBoundingClientRect().height);
                        }
                        return this._viewportHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "viewportItemsCount", {
                    get: function () {
                        if (this.rowHeight === 0 || isNaN(this.rowHeight)) {
                            return 0;
                        }
                        return Math.floor(this.viewportHeight / this.rowHeight);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "scrollHeight", {
                    get: function () {
                        return this.rootElement.scrollHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "scrollTop", {
                    get: function () {
                        // Use the requested scrollToOffset value if there is one, otherwise use the element's scrollTop value.
                        if (this._requestScrollToOffset !== null) {
                            // Cap offset to this range [0, this.rootElement.scrollHeight - this.viewportHeight].
                            // This simulates what the element's scrollTop does
                            var offset = Math.min(this._requestScrollToOffset, this.scrollHeight - this.viewportHeight);
                            offset = Math.max(0, offset);
                            return offset;
                        }
                        return this.scrollTopCached;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StackPanel.prototype, "scrollTopCached", {
                    // Represents a cached access to the rootElement's scrollTop value
                    get: function () {
                        if (this._scrollTopCached === null) {
                            this._scrollTopCached = this.rootElement.scrollTop;
                        }
                        return this._scrollTopCached;
                    },
                    enumerable: true,
                    configurable: true
                });
                // Ensures that the given index is visible in the current scroll page
                // If not scrolls to it.
                StackPanel.prototype.ensureVisible = function (visibleIndex) {
                    // Get the top and bottom coordinates of the item
                    var itemTop = visibleIndex * this.rowHeight;
                    var itemBottom = itemTop + this.rowHeight;
                    // Get the top and bottom coordinates of the current visible page
                    var viewportTop = this.scrollTop;
                    var viewportBottom = viewportTop + this.viewportHeight;
                    if (itemTop < viewportTop || itemBottom > viewportBottom) {
                        // The item is outside the page (either completely or partially)
                        var scrollToPos;
                        if (itemTop < viewportTop) {
                            // Set the position at the top
                            scrollToPos = itemTop;
                        }
                        else {
                            // Set the position at the bottom
                            scrollToPos = itemBottom - this.viewportHeight;
                        }
                        return this.scrollToOffset(scrollToPos);
                    }
                    return Common.PromiseHelper.getPromiseSuccess();
                };
                StackPanel.prototype.getItemContainerFromItem = function (item) {
                    return this.itemContainerGenerator.getItemContainerFromItemId(item.id);
                };
                StackPanel.prototype.getItemContainerFromIndex = function (index) {
                    return this.itemContainerGenerator.getItemContainerFromIndex(index);
                };
                StackPanel.prototype.recycleItem = function (index) {
                    this.itemContainerGenerator.recycle(index);
                };
                StackPanel.prototype.setDataSource = function (datasource) {
                    this.itemContainerGenerator.setDataSource(datasource);
                };
                Object.defineProperty(StackPanel.prototype, "itemsCount", {
                    get: function () {
                        return this.itemContainerGenerator.count;
                    },
                    enumerable: true,
                    configurable: true
                });
                // Returns the viewport offset of the given container. In other words, it's the offset
                // between the item and the beginning of the viewport.
                // If the container doesn't belong to the current viewport the method return 0.
                StackPanel.prototype.getScrollViewportOffset = function (itemContainer) {
                    var top = parseInt(itemContainer.rootElement.style.top);
                    var scrollTop = this.scrollTop;
                    var viewportHeight = this.viewportHeight;
                    var viewportOffset = top - scrollTop;
                    if (viewportOffset > 0 && viewportOffset <= viewportHeight - this.rowHeight) {
                        return viewportOffset;
                    }
                    return 0;
                };
                StackPanel.prototype.invalidate = function () {
                    for (var key in this.children) {
                        var itemContainer = this.children[key];
                        if (itemContainer) {
                            this.templateBinder.unbind(itemContainer);
                        }
                    }
                    this.itemContainerGenerator.recycleAll();
                    this.children = {};
                };
                StackPanel.prototype.invalidateSizeCache = function () {
                    this._viewportHeight = null;
                    this._rowHeight = 0;
                };
                StackPanel.prototype.render = function (detachBeforeRender) {
                    var _this = this;
                    if (detachBeforeRender === void 0) { detachBeforeRender = false; }
                    var promise;
                    if (this._isRendering) {
                        // Mark that we have skipped a render request so we can trigger a new pass when we are done with the current render cycle
                        this._renderCallsSkipped = true;
                        promise = Common.PromiseHelper.getPromiseSuccess();
                    }
                    else if (!this.templateBinder) {
                        // Cannot render without the template binder
                        promise = Common.PromiseHelper.getPromiseSuccess();
                    }
                    else {
                        this._isRendering = true;
                        try {
                            promise = this.renderCoreOverride(detachBeforeRender)
                                .then(function () {
                                // Scroll if there is a request to scroll on render
                                if (_this._requestScrollToOffset !== null) {
                                    if (_this.scrollTopCached !== _this._requestScrollToOffset) {
                                        _this._scrollTopCached = null;
                                        _this.rootElement.scrollTop = _this._requestScrollToOffset;
                                    }
                                }
                                _this._requestScrollToOffset = null;
                                _this._isRendering = false;
                                if (_this._renderCallsSkipped) {
                                    // We skipped one or more render requests while we were busy doing this render cycle, so
                                    // we need to recurse and trigger another render to make sure the view 
                                    // remains in sync with the user actions that triggered the render requests that we skipped. 
                                    // The classic case is when the user uses the mouse wheel or scroll bar to continuously scroll 
                                    // the view, which will cause (particularly on slow machines) for the view to get out of sync 
                                    // with the scroll position and display a set of empty rows at the top or bottom.   
                                    _this._renderCallsSkipped = false;
                                    return _this.render(detachBeforeRender);
                                }
                            }, function (error) {
                                _this._isRendering = false;
                                _this._renderCallsSkipped = false;
                                throw error;
                            });
                        }
                        catch (e) {
                            this._isRendering = false;
                            this._renderCallsSkipped = false;
                            throw e;
                        }
                    }
                    return promise;
                };
                StackPanel.prototype.renderCoreOverride = function (detachBeforeRender) {
                    var _this = this;
                    if (detachBeforeRender === void 0) { detachBeforeRender = false; }
                    var index = 0;
                    this.itemContainerGenerator.startAt(0);
                    return this.itemContainerGenerator.ensureDataAvailable(0, this.itemContainerGenerator.count)
                        .then(function () {
                        var itemContainer = _this.itemContainerGenerator.getNext();
                        while (itemContainer) {
                            _this.templateBinder.bind(itemContainer, index++);
                            _this.rootElement.appendChild(itemContainer.rootElement);
                            itemContainer = _this.itemContainerGenerator.getNext();
                        }
                        _this.itemContainerGenerator.stop();
                    });
                };
                StackPanel.prototype.scrollToIndex = function (visibleIndex, scrollOffset, postponeUntilRender) {
                    if (scrollOffset === void 0) { scrollOffset = 0; }
                    var position = visibleIndex * this.rowHeight + scrollOffset;
                    return this.scrollToOffset(position, postponeUntilRender);
                };
                // When postponeUntilRender is set, we don't do the actual scrolling until the next render is called.
                // This allows us to prevent scrolling into a non-realized area which results in showing an empty space for
                // a small period of time (flickering).
                StackPanel.prototype.scrollToOffset = function (offset, postponeUntilRender) {
                    if (postponeUntilRender) {
                        this._requestScrollToOffset = offset;
                    }
                    else {
                        this._requestScrollToOffset = null;
                        this._scrollTopCached = null;
                        this.rootElement.scrollTop = offset;
                        // Force render to happen
                        this._skipNextOnScroll = true;
                        return this.render();
                    }
                    return Common.PromiseHelper.getPromiseSuccess();
                };
                StackPanel.prototype.onScroll = function (e) {
                    this._scrollTopCached = null;
                    // We need to skip rendering when we already performed explicit rendering in the scrollToOffset call
                    if (this._skipNextOnScroll) {
                        this._skipNextOnScroll = false;
                        return;
                    }
                    this.render();
                    if (this.onScrolled) {
                        this.onScrolled(e);
                    }
                };
                return StackPanel;
            }(Common.Controls.Legacy.TemplateControl));
            Legacy.StackPanel = StackPanel;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="StackPanel.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            var VirtualizingStackPanel = (function (_super) {
                __extends(VirtualizingStackPanel, _super);
                function VirtualizingStackPanel(parentContainer) {
                    _super.call(this, parentContainer);
                    this._contentSizer = this.findElement("contentSizer");
                    this._firstVisibleItemIndex = 0;
                }
                Object.defineProperty(VirtualizingStackPanel.prototype, "actualHeight", {
                    get: function () {
                        return this.viewportHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VirtualizingStackPanel.prototype, "scrollHeight", {
                    get: function () {
                        return this.virtualHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VirtualizingStackPanel.prototype, "virtualHeight", {
                    get: function () {
                        return this.rowHeight * this.itemContainerGenerator.count;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VirtualizingStackPanel.prototype, "firstVisibleItemIndex", {
                    get: function () {
                        return this._firstVisibleItemIndex;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VirtualizingStackPanel.prototype, "lastVisibleItemIndex", {
                    get: function () {
                        return this._lastVisibleItemIndex;
                    },
                    enumerable: true,
                    configurable: true
                });
                VirtualizingStackPanel.prototype.renderCoreOverride = function (detachBeforeRender) {
                    var _this = this;
                    if (detachBeforeRender === void 0) { detachBeforeRender = false; }
                    var promise;
                    this.updateVirtualHeight();
                    var visibleItemsCount = Math.ceil(this.getVisibleItemsScrollFraction());
                    var firstVisibleItemIndexFractional = this.getFirstVisibleItemScrollFraction();
                    //if (detachBeforeRender) {
                    //    var tempContentParent: HTMLElement = this.content.parentElement;
                    //    tempContentParent.removeChild(this.content);
                    //}
                    if (firstVisibleItemIndexFractional < this.itemContainerGenerator.count) {
                        var overflowItemsCount = Math.ceil(visibleItemsCount / 4); // Consider 1/4 of a page before and after the visible page
                        var newFirstVisibleItemIndexFloor = Math.max(0, Math.floor(firstVisibleItemIndexFractional) - overflowItemsCount);
                        var newFirstVisibleItemIndexCeiling = Math.max(0, Math.ceil(firstVisibleItemIndexFractional) - overflowItemsCount);
                        var newLastVisibleItemIndex = Math.min(this.itemContainerGenerator.count - 1, Math.ceil(this.getFirstVisibleItemScrollFraction()) + visibleItemsCount + overflowItemsCount);
                        // Remove items from the top if scrolling down.
                        for (var i = this._firstVisibleItemIndex; i < newFirstVisibleItemIndexFloor; ++i) {
                            this.removeItemContainerByIndex(i);
                        }
                        // Remove items from the bottom if scrolling up.
                        for (var i = newLastVisibleItemIndex + 1; i <= this._lastVisibleItemIndex; ++i) {
                            this.removeItemContainerByIndex(i);
                        }
                        this.itemContainerGenerator.startAt(newFirstVisibleItemIndexFloor);
                        var firstChild = this.content.firstChild;
                        promise = this.itemContainerGenerator.ensureDataAvailable(newFirstVisibleItemIndexFloor, newLastVisibleItemIndex)
                            .then(function () {
                            for (var i = newFirstVisibleItemIndexFloor; i <= newLastVisibleItemIndex; ++i) {
                                var itemContainer = _this.itemContainerGenerator.getNext();
                                if (!itemContainer) {
                                    break;
                                }
                                // We need to clear the hover state. This is important when scrolling using the mouse wheel.
                                itemContainer.clearHoverState();
                                _this.templateBinder.bind(itemContainer, i);
                                itemContainer.rootElement.style.top = (i * _this.rowHeight) + "px";
                                if (_this.children[i.toString()] !== itemContainer) {
                                    if (!_this.content.contains(itemContainer.rootElement)) {
                                        _this.content.appendChild(itemContainer.rootElement);
                                    }
                                    _this.children[i.toString()] = itemContainer;
                                }
                            }
                            _this.itemContainerGenerator.stop();
                            _this._firstVisibleItemIndex = newFirstVisibleItemIndexFloor;
                            _this._lastVisibleItemIndex = newLastVisibleItemIndex;
                            _this.removeOrphanElements();
                        });
                    }
                    else {
                        this.removeOrphanElements();
                        promise = Common.PromiseHelper.getPromiseSuccess();
                    }
                    return promise;
                };
                VirtualizingStackPanel.prototype.getFirstVisibleItemScrollFraction = function () {
                    return this.scrollTop / this.rowHeight;
                };
                VirtualizingStackPanel.prototype.getVisibleItemsScrollFraction = function () {
                    return this.viewportHeight / this.rowHeight;
                };
                VirtualizingStackPanel.prototype.removeItemContainerByIndex = function (index) {
                    var itemContainer = this.children[index.toString()];
                    delete this.children[index.toString()];
                    if (itemContainer) {
                        this.templateBinder.unbind(itemContainer);
                    }
                    this.itemContainerGenerator.recycle(index);
                };
                VirtualizingStackPanel.prototype.removeOrphanElements = function () {
                    var map = {};
                    for (var key in this.children) {
                        var child = this.children[key];
                        map[child.rootElement.id] = true;
                    }
                    for (var elementIndex = this.content.children.length - 1; elementIndex >= 0; --elementIndex) {
                        var element = this.content.children[elementIndex];
                        if (!map[element.id]) {
                            this.content.removeChild(element);
                        }
                    }
                };
                VirtualizingStackPanel.prototype.updateVirtualHeight = function () {
                    this._contentSizer.style.top = this.virtualHeight + "px";
                };
                return VirtualizingStackPanel;
            }(Legacy.StackPanel));
            Legacy.VirtualizingStackPanel = VirtualizingStackPanel;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../keycodes.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../control.ts" />
/// <reference path="DataSource.ts" />
/// <reference path="IItemContainerTemplateBinder.ts" />
/// <reference path="ItemContainerGenerator.ts" />
/// <reference path="VirtualizingStackPanel.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            /**
             * The item data template used with the list control. Any customized template should override from this class
             */
            var ListItemDataTemplate = (function (_super) {
                __extends(ListItemDataTemplate, _super);
                function ListItemDataTemplate(templateId, templateRepository) {
                    _super.call(this, templateId, templateRepository);
                }
                ListItemDataTemplate.prototype.updateData = function (dataItem) {
                    if (this.item !== dataItem) {
                        this.item = dataItem;
                        this.updateUiOverride(dataItem);
                    }
                };
                ListItemDataTemplate.prototype.updateUiOverride = function (item) {
                    // Implemented by the override class
                };
                return ListItemDataTemplate;
            }(Common.Controls.Legacy.TemplateControl));
            Legacy.ListItemDataTemplate = ListItemDataTemplate;
            /**
             * The list control.
             */
            var ListControl = (function (_super) {
                __extends(ListControl, _super);
                function ListControl(rootElement) {
                    var _this = this;
                    _super.call(this, rootElement);
                    /*
                     * To customize the UI of the data template, set a type that extends TreeItemDataTemplate.
                     */
                    this.dataItemTemplateType = Common.Controls.Legacy.ListItemDataTemplate;
                    this._selectedItemVisibleIndex = -1;
                    this.rootElement.tabIndex = 0;
                    this.rootElement.addEventListener("keydown", this.onKeyDown.bind(this));
                    this.panel = new Legacy.VirtualizingStackPanel(this.rootElement);
                    this.panel.templateBinder = this;
                    this.panel.onScrolled = function (e) {
                        if (_this.onScrolled) {
                            _this.onScrolled(e);
                        }
                    };
                    this._itemContainerGenerator = new Legacy.ItemContainerGenerator();
                    this.panel.itemContainerGenerator = this._itemContainerGenerator;
                    this.invalidateSizeCache();
                    this.keepCurrentScrollPositionWhenDataSourceChanges = false;
                }
                Object.defineProperty(ListControl.prototype, "ariaLabel", {
                    get: function () { return this.rootElement.getAttribute("aria-label"); },
                    set: function (value) {
                        this.rootElement.setAttribute("aria-label", value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListControl.prototype, "dataSource", {
                    get: function () { return this._dataSource; },
                    enumerable: true,
                    configurable: true
                });
                ListControl.prototype.setDataSource = function (value) {
                    var _this = this;
                    this.cancelPromise(this._setDatasourcePromise);
                    if (this._dataSource !== value) {
                        var selectionViewportOffset = 0;
                        // Before setting the new datasource, get the viewport offset of the current selected item.
                        // This is used to maintain the offset of the selected item in the current viewport after changing the
                        // data source.
                        if (this._selectedItem && this._itemContainerGenerator) {
                            var selectedItemContainer = this._itemContainerGenerator.getItemContainerFromItemId(this._selectedItem.id);
                            if (selectedItemContainer) {
                                selectionViewportOffset = this.panel.getScrollViewportOffset(selectedItemContainer);
                            }
                        }
                        // Set the new datasource with all the related helper objects (item container generator and branch state provider)
                        this._dataSource = value;
                        // After setting the new datasource, see if we need to keep the current scroll view position.
                        // If we need to keep the current scroll view position we just set the data source and return,
                        // otherwise we get the visible index of the selectedItem and scroll to it.
                        // The visible index might be different (after changing sort order) or it might not even exist.
                        // In case we had a viewport offset, apply it to maintain the position of the selected item
                        // within the viewport.
                        if (this.keepCurrentScrollPositionWhenDataSourceChanges) {
                            this._setDatasourcePromise = Common.PromiseHelper.getPromiseSuccess()
                                .then(function () {
                                _this.panel.setDataSource(value);
                                _this.panel.invalidate();
                            });
                        }
                        else if (this._selectedItem && this._dataSource) {
                            //Scrolling to selected event is handled through promise
                            this._setDatasourcePromise = this.getVisibleIndexOfItem(this._selectedItem).
                                then(function (selectedItemVisibleIndex) {
                                _this._selectedItemVisibleIndex = selectedItemVisibleIndex;
                                if (_this._selectedItemVisibleIndex < 0) {
                                    // The selected item doesn't belong in the new dataset, reset the selection
                                    return _this.setSelectedItem(null);
                                }
                                return Common.PromiseHelper.getPromiseSuccess();
                            })
                                .then(function () {
                                if (!_this.selectedItem) {
                                    return _this.panel.scrollToOffset(0, /*postponeUntilRender=*/ true);
                                }
                                else {
                                    // Pass true to postpone scrolling until after render is called to avoid flickering
                                    return _this.panel.scrollToIndex(_this._selectedItemVisibleIndex, -selectionViewportOffset, true);
                                }
                            })
                                .then(function () {
                                _this.panel.setDataSource(value);
                                _this.panel.invalidate();
                            });
                        }
                        else {
                            this._setDatasourcePromise = this.panel.scrollToOffset(0, /*postponeUntilRender=*/ true)
                                .then(function () {
                                _this.panel.setDataSource(value);
                                _this.panel.invalidate();
                            });
                        }
                    }
                    else {
                        this._setDatasourcePromise = Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this._setDatasourcePromise;
                };
                Object.defineProperty(ListControl.prototype, "itemContainerGenerator", {
                    get: function () {
                        return this._itemContainerGenerator;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListControl.prototype, "selectedItem", {
                    get: function () { return this._selectedItem; },
                    enumerable: true,
                    configurable: true
                });
                ListControl.prototype.setSelectedItem = function (value) {
                    var _this = this;
                    //Ignoring future events until past request is processed.
                    if (this._setSelectedItemProcessing) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    if (this._selectedItem !== value || (this._selectedItem && value && this._selectedItem.id !== value.id)) {
                        this._setSelectedItemProcessing = true;
                        // Unselect the previous selected container
                        return this.getSelectedItemContainer()
                            .then(function (itemContainer) {
                            if (itemContainer) {
                                itemContainer.isSelected = false;
                            }
                            _this._selectedItem = value;
                            // Get the selected item visible index of the selected item
                            if (_this._selectedItem) {
                                return _this.getVisibleIndexOfItem(_this._selectedItem);
                            }
                            else {
                                _this._selectedItemVisibleIndex = -1;
                                return Microsoft.Plugin.Promise.wrap(-1);
                            }
                        })
                            .then(function (selectedItemVisibleIndex) {
                            _this._selectedItemVisibleIndex = selectedItemVisibleIndex;
                            // Select the new container
                            return _this.getSelectedItemContainer(true);
                        })
                            .then(function (itemContainer) {
                            if (itemContainer) {
                                _this.setItemContainerAriaLabel(itemContainer);
                                itemContainer.focus();
                            }
                            // Ensure the selectedItem is visible
                            if (_this._selectedItemVisibleIndex >= 0) {
                                return _this.panel.ensureVisible(_this._selectedItemVisibleIndex);
                            }
                            return Common.PromiseHelper.getPromiseSuccess();
                        })
                            .then(function () {
                            if (_this.selectedItemChanged) {
                                _this.selectedItemChanged(_this._selectedItem);
                            }
                            _this._setSelectedItemProcessing = false;
                        }, function (error) {
                            _this._setSelectedItemProcessing = false;
                            throw error;
                        });
                    }
                    return Common.PromiseHelper.getPromiseSuccess();
                };
                Object.defineProperty(ListControl.prototype, "offsetLeft", {
                    get: function () {
                        if (this._offsetLeft === null) {
                            this._offsetLeft = this.rootElement.offsetLeft;
                        }
                        return this._offsetLeft;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ListControl.prototype, "offsetTop", {
                    get: function () {
                        if (this._offsetTop === null) {
                            this._offsetTop = this.rootElement.offsetTop;
                        }
                        return this._offsetTop;
                    },
                    enumerable: true,
                    configurable: true
                });
                ListControl.prototype.bind = function (itemContainer, itemIndex) {
                    var dataItem = itemContainer.item;
                    if (!itemContainer.template) {
                        if (!this.dataItemTemplateType) {
                            throw new Error("Expecting a data item template type.");
                        }
                        // For first time using this container, create the template and attach its
                        // root element to the item container.
                        itemContainer.template = new this.dataItemTemplateType();
                        itemContainer.rootElement.tabIndex = -1;
                        itemContainer.rootElement.appendChild(itemContainer.template.rootElement);
                    }
                    itemContainer.rootElement.setAttribute("data-id", itemContainer.id.toString());
                    this.updateContainerOverride(itemContainer, itemIndex);
                    itemContainer.clicked = this.onItemSelected.bind(this, itemContainer);
                    itemContainer.contextMenu = this.onItemContextMenu.bind(this, itemContainer);
                    // Set the selection state on the the container
                    itemContainer.isSelected = this._selectedItem && itemContainer.id === this._selectedItem.id;
                };
                /**
                 * Overridable. Cleanup any events setup on the container
                 */
                ListControl.prototype.cleanupContainerOverride = function (container) {
                };
                ListControl.prototype.cancelPromise = function (promise) {
                    if (promise) {
                        promise.cancel();
                    }
                };
                ListControl.prototype.getItemContainerFromItem = function (item, scrollIfNeeded) {
                    var _this = this;
                    var itemContainer = this.panel.getItemContainerFromItem(item);
                    var promise;
                    if (!itemContainer && scrollIfNeeded) {
                        // item wasn't realized, we need to scroll in order for it to realize
                        promise = this.scrollToItem(item)
                            .then(function () {
                            // try to get the container again after scrolling
                            itemContainer = _this.panel.getItemContainerFromItem(item);
                            if (itemContainer) {
                                return itemContainer;
                            }
                            else {
                                return null;
                            }
                        });
                    }
                    else {
                        promise = Common.PromiseHelper.getPromiseSuccess(itemContainer);
                    }
                    return promise;
                };
                ListControl.prototype.getSelectedItemContainer = function (scrollIfNeeded) {
                    var promise;
                    if (this.selectedItem) {
                        promise = this.getItemContainerFromItem(this.selectedItem, scrollIfNeeded);
                    }
                    else {
                        promise = Common.PromiseHelper.getPromiseSuccess(null);
                    }
                    return promise;
                };
                ListControl.prototype.invalidate = function () {
                    var _this = this;
                    this.panel.invalidate();
                    return this.panel.render(/* detachBeforeRender = */ true)
                        .then(function () {
                        // Invalidate the size cache whenever the panel scrollbar state changes
                        var panelScrollBarShown = _this.panel.virtualHeight > _this.panel.viewportHeight;
                        if (panelScrollBarShown !== _this._panelScrollBarShown) {
                            _this._panelScrollBarShown = panelScrollBarShown;
                            _this.invalidateSizeCache();
                        }
                        _this.onInvalidated();
                    });
                };
                ListControl.prototype.invalidateSizeCache = function () {
                    this._offsetLeft = null;
                    this._offsetTop = null;
                    this.panel.invalidateSizeCache();
                };
                /**
                 * Called when the list control gets invalidated
                 */
                ListControl.prototype.onInvalidated = function () {
                };
                /**
                 * Overridable. Gives the derived a class a chance to intercept key events
                 * @returns true if handled
                 */
                ListControl.prototype.onKeyDownOverride = function (event) {
                    return Microsoft.Plugin.Promise.wrap(false);
                };
                /**
                 * Called when the user invoked the context menu on the list control
                 */
                ListControl.prototype.onShowContextMenu = function () {
                };
                ListControl.prototype.onWindowResize = function () {
                    this.invalidateSizeCache();
                    this.invalidate();
                };
                ListControl.prototype.render = function () {
                    return this.invalidate();
                };
                ListControl.prototype.scrollToItem = function (item) {
                    var _this = this;
                    return this.getVisibleIndexOfItem(item)
                        .then(function (visibleIndex) {
                        if (visibleIndex >= 0) {
                            return _this.panel.ensureVisible(visibleIndex);
                        }
                        return Common.PromiseHelper.getPromiseSuccess();
                    });
                };
                ListControl.prototype.selectEnd = function () {
                    if (this._selectedItemVisibleIndex < 0) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this.setSelectedItemVisibleIndex(this._itemContainerGenerator.count - 1);
                };
                ListControl.prototype.selectHome = function () {
                    if (this._selectedItemVisibleIndex < 0) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this.setSelectedItemVisibleIndex(0);
                };
                ListControl.prototype.selectPreviousItem = function () {
                    if (this._selectedItemVisibleIndex < 0) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this.setSelectedItemVisibleIndex(this._selectedItemVisibleIndex - 1);
                };
                ListControl.prototype.selectPageDown = function () {
                    if (this._selectedItemVisibleIndex < 0) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this.setSelectedItemVisibleIndex(this._selectedItemVisibleIndex + this.panel.viewportItemsCount);
                };
                ListControl.prototype.selectPageUp = function () {
                    if (this._selectedItemVisibleIndex < 0) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this.setSelectedItemVisibleIndex(this._selectedItemVisibleIndex - this.panel.viewportItemsCount);
                };
                ListControl.prototype.selectNextItem = function () {
                    if (this._selectedItemVisibleIndex < 0) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    return this.setSelectedItemVisibleIndex(this._selectedItemVisibleIndex + 1);
                };
                ListControl.prototype.selectItem = function (itemIndex) {
                    return this.setSelectedItemVisibleIndex(itemIndex);
                };
                ListControl.prototype.unbind = function (itemContainer) {
                    itemContainer.clicked = null;
                    itemContainer.rootElement.removeAttribute("aria-label");
                    this.cleanupContainerOverride(itemContainer);
                };
                /**
                 * Overridable. Sets the data on the template and execute all the bindings
                 */
                ListControl.prototype.updateContainerOverride = function (container, itemIndex) {
                    var data = container.item;
                    var template = container.template;
                    this.updateTemplateData(template, data);
                };
                /**
                 * Updates the data inside the template
                 */
                ListControl.prototype.updateTemplateData = function (template, data) {
                    template.updateData(data);
                };
                ListControl.prototype.getVisibleIndexOfItem = function (item) {
                    return this._dataSource.indexOfItem(item.id);
                };
                ListControl.prototype.onKeyDown = function (event) {
                    var _this = this;
                    var toBeHandled = false;
                    switch (event.keyCode) {
                        case Common.KeyCodes.ArrowUp:
                        case Common.KeyCodes.ArrowDown:
                        case Common.KeyCodes.PageUp:
                        case Common.KeyCodes.PageDown:
                        case Common.KeyCodes.Home:
                        case Common.KeyCodes.End:
                        case Common.KeyCodes.ArrowRight:
                        case Common.KeyCodes.ArrowLeft:
                        case Common.KeyCodes.Plus:
                        case Common.KeyCodes.Minus:
                        case Common.KeyCodes.ContextMenu:
                            {
                                toBeHandled = true;
                                event.preventDefault();
                                event.stopPropagation();
                            }
                    }
                    if (this._keyDownEventProcessing || !toBeHandled) {
                        return;
                    }
                    this._keyDownEventProcessing = true;
                    //We handle the events even if past requests fail
                    this.onKeyDownHandler(event)
                        .then(function () {
                        _this._keyDownEventProcessing = false;
                    }),
                        (function () {
                            _this._keyDownEventProcessing = false;
                        });
                };
                ListControl.prototype.onKeyDownHandler = function (event) {
                    var _this = this;
                    // Allow the derived claass to handle the keydown event first
                    this.onKeyDownOverride(event)
                        .done(function (handled) {
                        if (!handled) {
                            handled = true; // Will get set to false in the default block below if not handled
                            switch (event.keyCode) {
                                case Common.KeyCodes.ArrowUp:
                                    if (_this._selectedItemVisibleIndex < 0) {
                                        return _this.setSelectedItemVisibleIndex(0);
                                    }
                                    else {
                                        return _this.selectPreviousItem();
                                    }
                                case Common.KeyCodes.ArrowDown:
                                    if (_this._selectedItemVisibleIndex < 0) {
                                        return _this.setSelectedItemVisibleIndex(0);
                                    }
                                    else {
                                        return _this.selectNextItem();
                                    }
                                case Common.KeyCodes.PageUp:
                                    return _this.selectPageUp();
                                case Common.KeyCodes.PageDown:
                                    return _this.selectPageDown();
                                case Common.KeyCodes.Home:
                                    return _this.selectHome();
                                case Common.KeyCodes.End:
                                    return _this.selectEnd();
                                case Common.KeyCodes.ContextMenu:
                                    _this.onShowContextMenu();
                                    return Common.PromiseHelper.getPromiseSuccess();
                                case Common.KeyCodes.F10:
                                    if (event.shiftKey && !event.ctrlKey && !event.altKey) {
                                        _this.onShowContextMenu();
                                        return Common.PromiseHelper.getPromiseSuccess();
                                    }
                                    break;
                            }
                            return Common.PromiseHelper.getPromiseSuccess();
                        }
                    });
                    return Common.PromiseHelper.getPromiseSuccess();
                };
                ListControl.prototype.onItemContextMenu = function (itemContainer, e) {
                    if (this.onItemContextMenuTriggered) {
                        this.onItemContextMenuTriggered(itemContainer);
                    }
                    this.onItemSelected(itemContainer, e);
                };
                ListControl.prototype.onItemSelected = function (itemContainer, e) {
                    var select;
                    if (e && !e.altKey && e.ctrlKey && !e.shiftKey) {
                        select = !itemContainer.isSelected;
                    }
                    else {
                        select = true;
                    }
                    if (select) {
                        this.setSelectedItem(itemContainer.item)
                            .then(function () {
                            itemContainer.focus();
                        });
                    }
                    else {
                        this.setSelectedItem(null);
                    }
                };
                ListControl.prototype.setItemContainerAriaLabel = function (itemContainer) {
                    if (itemContainer) {
                        var ariaLabel;
                        var dataItem = itemContainer.item;
                        if (dataItem && this.onGetItemContainerAriaLabel) {
                            ariaLabel = this.onGetItemContainerAriaLabel(itemContainer);
                        }
                        if (ariaLabel) {
                            itemContainer.rootElement.setAttribute("aria-label", ariaLabel);
                        }
                        else {
                            itemContainer.rootElement.removeAttribute("aria-label");
                        }
                    }
                };
                ListControl.prototype.setSelectedItemVisibleIndex = function (newVisibleIndex) {
                    var _this = this;
                    //Ignoring future requests
                    if (this._setSelectedItemVisibleIndexProcessing) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    var totalVisibleCount;
                    var itemContainer;
                    this._setSelectedItemVisibleIndexProcessing = true;
                    totalVisibleCount = this.panel.itemsCount;
                    if (newVisibleIndex < 0) {
                        newVisibleIndex = 0;
                    }
                    if (newVisibleIndex >= totalVisibleCount) {
                        newVisibleIndex = totalVisibleCount - 1;
                    }
                    if (this._selectedItemVisibleIndex >= 0 && this._selectedItemVisibleIndex === newVisibleIndex) {
                        // no selection changes necessary
                        return this.getSelectedItemContainer()
                            .then(function (itemContainer) {
                            _this._setSelectedItemVisibleIndexProcessing = false;
                        }, function (error) {
                            _this._setSelectedItemVisibleIndexProcessing = false;
                            throw error;
                        });
                    }
                    else {
                        itemContainer = this.panel.getItemContainerFromIndex(newVisibleIndex);
                        //To avoid flickering we should check if the itemContainer is already available before selecting. Else, the item will be scrolled and then selected
                        if (itemContainer) {
                            if (!itemContainer.rootElement.parentElement) {
                                // If not part of the ui, recycle
                                this.panel.recycleItem(newVisibleIndex);
                            }
                            return this.setSelectedItem(itemContainer.item)
                                .then(function () {
                                _this._setSelectedItemVisibleIndexProcessing = false;
                            }, function (error) {
                                _this._setSelectedItemVisibleIndexProcessing = false;
                            });
                        }
                        else {
                            return this.panel.ensureVisible(newVisibleIndex)
                                .then(function () {
                                var promise;
                                itemContainer = _this.panel.getItemContainerFromIndex(newVisibleIndex);
                                if (itemContainer) {
                                    var item = itemContainer.item;
                                    if (!itemContainer.rootElement.parentElement) {
                                        // If not part of the ui, recycle
                                        _this.panel.recycleItem(newVisibleIndex);
                                    }
                                    promise = _this.setSelectedItem(item);
                                }
                                else {
                                    //Item is not in the dataset anymore or someother request was processed by js in the wait time
                                    promise = Common.PromiseHelper.getPromiseSuccess();
                                }
                                return promise;
                            })
                                .then(function () {
                                _this._setSelectedItemVisibleIndexProcessing = false;
                            }, function (error) {
                                _this._setSelectedItemVisibleIndexProcessing = false;
                                throw error;
                            });
                        }
                    }
                };
                return ListControl;
            }(Common.Controls.Legacy.Control));
            Legacy.ListControl = ListControl;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../keycodes.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../control.ts" />
/// <reference path="ListControl.ts" />
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var Legacy;
        (function (Legacy) {
            "use strict";
            /**
             * The item data template used with the tree-list control. It provides the UI and functionality for the
             * expander. The template provided should has an element with an id 'expander'.
             */
            var TreeItemDataTemplate = (function (_super) {
                __extends(TreeItemDataTemplate, _super);
                /**
                 * Constructor
                 * @param templateId The template to use to represent the data for the tree item and any derived templates, it should contain an expander element, ex:
                 *  <div>
                 *      <div id="expander"></div>
                 *      <!-- extra HTML to hold the data -->
                 *  </div>
                 * @param templateRepository The template repository to use to find the template, if not specified, the template will be loaded from the page
                 */
                function TreeItemDataTemplate(templateId, templateRepository) {
                    _super.call(this, templateId, templateRepository);
                    this.indentationInPixels = TreeItemDataTemplate.INDENTATION_IN_PIXELS_DEFAULT;
                    this._expander = this.findElement("expander");
                    F12.Tools.Utility.Assert.isTrue(!!this._expander, "Expecting an expander element");
                    this._expander.addEventListener("click", this.onExpansionClicked.bind(this));
                    this.rootElement.addEventListener("dblclick", this.onRootElementDblClicked.bind(this));
                }
                TreeItemDataTemplate.prototype.collapse = function () {
                    if (this.item && this.item.hasChildren) {
                        if (!this._expander.classList.contains(TreeItemDataTemplate.COLLAPSED_CSS_CLASS)) {
                            return this.onExpansionClicked(null)
                                .then(function () {
                                return true;
                            });
                        }
                    }
                    return Microsoft.Plugin.Promise.wrap(false);
                };
                TreeItemDataTemplate.prototype.expand = function () {
                    if (this.item && this.item.hasChildren) {
                        if (!this._expander.classList.contains(TreeItemDataTemplate.EXPANDED_CSS_CLASS)) {
                            return this.onExpansionClicked(null)
                                .then(function () {
                                return true;
                            });
                        }
                    }
                    return Microsoft.Plugin.Promise.wrap(false);
                };
                TreeItemDataTemplate.prototype.updateUiOverride = function (dataItem) {
                    _super.prototype.updateUiOverride.call(this, dataItem);
                    if (dataItem) {
                        this._expander.style.marginLeft = (dataItem.level * this.indentationInPixels) + "px";
                        this.setExpanderCss(dataItem);
                    }
                };
                TreeItemDataTemplate.prototype.onExpansionClicked = function (e) {
                    if (e) {
                        e.stopImmediatePropagation();
                    }
                    if (this.expansionToggledCallback) {
                        return this.expansionToggledCallback();
                    }
                    return Common.PromiseHelper.getPromiseSuccess();
                };
                TreeItemDataTemplate.prototype.onRootElementDblClicked = function (e) {
                    if (e) {
                        // Ignore dbl-click if it originated from the expander element
                        if (e.srcElement && e.srcElement === this._expander) {
                            e.stopImmediatePropagation();
                            return;
                        }
                    }
                    this.onExpansionClicked(e);
                };
                TreeItemDataTemplate.prototype.setExpanderCss = function (dataItem) {
                    if (dataItem.hasChildren) {
                        this._expander.classList.remove(TreeItemDataTemplate.NO_EXPANDER_CSS_CLASS);
                        if (!dataItem.isExpanded) {
                            this._expander.classList.remove(TreeItemDataTemplate.EXPANDED_CSS_CLASS);
                            this._expander.classList.add(TreeItemDataTemplate.COLLAPSED_CSS_CLASS);
                        }
                        else {
                            this._expander.classList.remove(TreeItemDataTemplate.COLLAPSED_CSS_CLASS);
                            this._expander.classList.add(TreeItemDataTemplate.EXPANDED_CSS_CLASS);
                        }
                    }
                    else {
                        this._expander.classList.remove(TreeItemDataTemplate.EXPANDED_CSS_CLASS);
                        this._expander.classList.remove(TreeItemDataTemplate.COLLAPSED_CSS_CLASS);
                        this._expander.classList.add(TreeItemDataTemplate.NO_EXPANDER_CSS_CLASS);
                    }
                };
                TreeItemDataTemplate.INDENTATION_IN_PIXELS_DEFAULT = 13;
                TreeItemDataTemplate.COLLAPSED_CSS_CLASS = "BPT-itemCollapsed";
                TreeItemDataTemplate.EXPANDED_CSS_CLASS = "BPT-itemExpanded";
                TreeItemDataTemplate.NO_EXPANDER_CSS_CLASS = "BPT-noExpander";
                return TreeItemDataTemplate;
            }(Legacy.ListItemDataTemplate));
            Legacy.TreeItemDataTemplate = TreeItemDataTemplate;
            /**
             * The tree-list control.
             */
            var TreeListControl = (function (_super) {
                __extends(TreeListControl, _super);
                function TreeListControl(rootElement) {
                    _super.call(this, rootElement);
                    this.dataItemTemplateType = Common.Controls.Legacy.TreeItemDataTemplate;
                    this._onAriaExpandedModifiedHandler = this.onAriaExpandedModified.bind(this);
                }
                TreeListControl.prototype.updateContainerOverride = function (itemContainer, itemIndex) {
                    _super.prototype.updateContainerOverride.call(this, itemContainer, itemIndex);
                    var dataItem = itemContainer.item;
                    var template = itemContainer.template;
                    if (dataItem) {
                        itemContainer.rootElement.removeEventListener("DOMAttrModified", this._onAriaExpandedModifiedHandler);
                        if (dataItem.hasChildren) {
                            itemContainer.rootElement.setAttribute("aria-expanded", dataItem.isExpanded ? "true" : "false");
                            template.expansionToggledCallback = this.onExpansionToggled.bind(this, itemContainer, itemIndex);
                            itemContainer.rootElement.addEventListener("DOMAttrModified", this._onAriaExpandedModifiedHandler);
                        }
                        else {
                            itemContainer.rootElement.removeAttribute("aria-expanded");
                        }
                    }
                };
                /**
                 * Overridable. Gives the derived a class a chance to intercept key events
                 * @returns true if handled
                 */
                TreeListControl.prototype.onKeyDownOverride = function (event) {
                    var _this = this;
                    switch (event.keyCode) {
                        case Common.KeyCodes.ArrowRight:
                            return this.getSelectedItemContainer()
                                .then(function (selectedItemContainer) {
                                if (selectedItemContainer) {
                                    selectedItemContainer.template.expand()
                                        .then(function (expanded) {
                                        if (!expanded && selectedItemContainer.item.hasChildren) {
                                            // If already expanded and has children go down to the first child
                                            _this.selectNextItem()
                                                .then(function () {
                                                return true;
                                            });
                                        }
                                    });
                                }
                                return true;
                            });
                        case Common.KeyCodes.ArrowLeft:
                            return this.getSelectedItemContainer()
                                .then(function (selectedItemContainer) {
                                if (selectedItemContainer) {
                                    selectedItemContainer.template.collapse()
                                        .then(function (collapsed) {
                                        if (!collapsed && selectedItemContainer.item.level > 0) {
                                            // If already collapsed and not root go up to the parent
                                            _this.dataSource.indexOfParent(selectedItemContainer.id)
                                                .then(function (parentIndex) {
                                                if (parentIndex >= 0) {
                                                    _this.selectItem(parentIndex)
                                                        .then(function () {
                                                        return true;
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                                return true;
                            });
                        case Common.KeyCodes.Plus:
                            return this.getSelectedItemContainer()
                                .then(function (selectedItemContainer) {
                                if (selectedItemContainer) {
                                    selectedItemContainer.template.expand()
                                        .then(function (expanded) {
                                        return true;
                                    });
                                }
                                return true;
                            });
                        case Common.KeyCodes.Minus:
                            return this.getSelectedItemContainer()
                                .then(function (selectedItemContainer) {
                                if (selectedItemContainer) {
                                    selectedItemContainer.template.collapse()
                                        .then(function (collapsed) {
                                        return true;
                                    });
                                }
                                return true;
                            });
                    }
                    return Microsoft.Plugin.Promise.wrap(false);
                };
                TreeListControl.prototype.cleanupContainerOverride = function (itemContainer) {
                    var template = itemContainer.template;
                    if (template) {
                        template.expansionToggledCallback = null;
                    }
                    itemContainer.rootElement.removeEventListener("DOMAttrModified", this._onAriaExpandedModifiedHandler);
                };
                // The only way to detect the Expand/Collapse control pattern for accessiblity is to watch for dom mutations
                TreeListControl.prototype.onAriaExpandedModified = function (event) {
                    if (event.attrName === "aria-expanded") {
                        var element = event.target;
                        var itemId = parseInt(element.getAttribute("data-id"));
                        var itemContainer = this.itemContainerGenerator.getItemContainerFromItemId(itemId);
                        if (itemContainer) {
                            var itemTemplate = itemContainer.template;
                            if (event.newValue === "true") {
                                itemTemplate.expand();
                            }
                            else {
                                itemTemplate.collapse();
                            }
                        }
                    }
                };
                TreeListControl.prototype.onExpansionToggled = function (itemContainer, itemIndex) {
                    var _this = this;
                    if (this._onExpansionToggledProcessing) {
                        return Common.PromiseHelper.getPromiseSuccess();
                    }
                    var dataItem = itemContainer.item;
                    var expansionToggledHandler;
                    this._onExpansionToggledProcessing = true;
                    if (dataItem.isExpanded) {
                        expansionToggledHandler = this.dataSource.collapseBranch(itemIndex);
                    }
                    else {
                        expansionToggledHandler = this.dataSource.expandBranch(itemIndex);
                    }
                    return expansionToggledHandler
                        .then(function () {
                        return _this.setSelectedItem(dataItem);
                    })
                        .then(function () {
                        return _this.invalidate();
                    })
                        .then(function () {
                        //The item container will be different after calling invalidate. We set the previously selected item
                        return _this.getSelectedItemContainer();
                    })
                        .then(function (selectedItemContainer) {
                        if (selectedItemContainer) {
                            selectedItemContainer.focus();
                        }
                        _this._onExpansionToggledProcessing = false;
                    }, function (error) {
                        _this._onExpansionToggledProcessing = false;
                        throw error;
                    });
                };
                return TreeListControl;
            }(Legacy.ListControl));
            Legacy.TreeListControl = TreeListControl;
        })(Legacy = Controls.Legacy || (Controls.Legacy = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var ModelView;
    (function (ModelView) {
        "use strict";
        var ListModel = (function () {
            function ListModel(listSource) {
                this.listSource = listSource;
            }
            Object.defineProperty(ListModel.prototype, "length", {
                get: function () {
                    if (!this.cache) {
                        return;
                    }
                    return this.cache.length;
                },
                enumerable: true,
                configurable: true
            });
            ListModel.prototype.load = function (loadCompleteCallback) {
                var _this = this;
                this.listSource(function (results) {
                    _this.cache = results;
                    loadCompleteCallback();
                }, this._loadArgs);
            };
            ListModel.prototype.setLoadArgs = function (loadArgs) {
                this._loadArgs = loadArgs;
            };
            ListModel.prototype.item = function (index) {
                if (!this.cache) {
                    return;
                }
                return this.cache[index];
            };
            return ListModel;
        }());
        ModelView.ListModel = ListModel;
    })(ModelView = Common.ModelView || (Common.ModelView = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var ModelView;
    (function (ModelView) {
        "use strict";
        var ListReconciler = (function () {
            function ListReconciler(idPropertyName, sortPropertyName, insertBeforeCallback, updateCallback, deleteCallback, isChanged, clearDirtyFlag) {
                this._idPropertyName = idPropertyName;
                this._sortPropertyName = sortPropertyName;
                this._insertBeforeCallback = insertBeforeCallback;
                this._updateCallback = updateCallback;
                this._deleteCallback = deleteCallback;
                this._isChanged = isChanged;
                this._clearDirtyFlag = clearDirtyFlag;
                if (!this._isChanged) {
                    this._isChanged = function (newThing, oldThing) {
                        return newThing !== oldThing;
                    };
                }
            }
            // Find all of the new, updated and deleted items by comparing the old version of the list with the new one.
            // For each new, updated or deleted item, call the appropriate callback method configured when the reconciler was created.
            ListReconciler.prototype.reconcile = function (oldList, newList) {
                var _this = this;
                if (oldList === null || oldList === undefined) {
                    oldList = [];
                }
                if (newList === null || newList === undefined) {
                    newList = [];
                }
                // Sort the new list.  Old list should already be started.  The while loop below assumes that both lists are sorted.
                if (this._sortPropertyName) {
                    newList.sort(function (a, b) {
                        var aValue = a[_this._sortPropertyName];
                        var bValue = b[_this._sortPropertyName];
                        if (aValue === bValue) {
                            return 0;
                        }
                        else if (aValue < bValue) {
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    });
                }
                var oldIndex = 0;
                var newIndex = 0;
                while (oldIndex < oldList.length || newIndex < newList.length) {
                    if (newIndex >= newList.length) {
                        this._deleteCallback(oldList[oldIndex++]);
                    }
                    else if (oldIndex >= oldList.length) {
                        this._insertBeforeCallback(newList[newIndex++], oldIndex < oldList.length ? oldList[oldIndex] : null);
                    }
                    else if (newList[newIndex][this._idPropertyName] === oldList[oldIndex][this._idPropertyName]) {
                        if (this._isChanged(newList[newIndex], oldList[oldIndex])) {
                            this._updateCallback(newList[newIndex], oldList[oldIndex]);
                            if (this._clearDirtyFlag) {
                                this._clearDirtyFlag(newList[newIndex]);
                            }
                        }
                        newIndex++;
                        oldIndex++;
                    }
                    else if (newList[newIndex][this._sortPropertyName] > oldList[oldIndex][this._sortPropertyName]) {
                        this._deleteCallback(oldList[oldIndex++]);
                    }
                    else {
                        this._insertBeforeCallback(newList[newIndex++], oldList[oldIndex]);
                    }
                }
            };
            return ListReconciler;
        }());
        ModelView.ListReconciler = ListReconciler;
    })(ModelView = Common.ModelView || (Common.ModelView = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var Block = (function () {
            function Block() {
                this.blocks = [];
            }
            Block.prototype.addBlock = function (block) {
                this.blocks.push(block);
            };
            Block.prototype.process = function (obj) {
                return "";
            };
            return Block;
        }());
        Templating.Block = Block;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var Range = (function () {
            function Range(firstIndex, lastIndex, content, isFromComplexBlock, isStart, rangeType) {
                this.firstIndex = firstIndex;
                this.lastIndex = lastIndex;
                this.content = content;
                this.isFromComplexBlock = isFromComplexBlock;
                this.isStart = isStart;
                this.rangeType = rangeType;
            }
            return Range;
        }());
        Templating.Range = Range;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="block.ts" />
/// <reference path="range.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var TextBlock = (function (_super) {
            __extends(TextBlock, _super);
            function TextBlock(range) {
                _super.call(this);
                this._text = range.content;
                this.containerType = "text";
            }
            TextBlock.prototype.process = function (model) {
                var replaceWhat;
                var text = this._text;
                while (replaceWhat = this.findNextDelimitedString(text)) {
                    var propertyPath = replaceWhat.substring(TextBlock.DelimiterLength, replaceWhat.length - TextBlock.DelimiterLength);
                    var replaceWith = "";
                    var subModel = model;
                    propertyPath.split(".").forEach(function (value, index, array) {
                        if (!subModel) {
                            return;
                        }
                        subModel = subModel[value];
                    });
                    if (typeof subModel !== "undefined" && subModel !== null) {
                        if (typeof subModel === "string") {
                            replaceWith = subModel;
                        }
                        else {
                            replaceWith = subModel.toString();
                        }
                    }
                    replaceWith = replaceWith
                        .replace(TextBlock.GTRegex, "&gt;")
                        .replace(TextBlock.LTRegex, "&lt;")
                        .replace(TextBlock.DoubleQuoteRegex, "&quot;")
                        .replace(TextBlock.SingleQuoteRegex, "&apos;")
                        .replace(TextBlock.DollarRegex, "$$$$");
                    text = text.replace(replaceWhat, replaceWith);
                }
                return text;
            };
            TextBlock.prototype.findNextDelimitedString = function (s) {
                var allResults = TextBlock.DelimiterRegex.exec(s);
                if (!allResults) {
                    return null;
                }
                return allResults[0];
            };
            // The following regex matches valid javascript identifiers (excluding valid Unicode characters greater than U+007F) separated by dots.
            TextBlock.DelimiterRegex = /%%[$a-zA-Z_][$a-zA-Z0-9_]*(\.[$a-zA-Z_][$a-zA-Z0-9_]*)*%%/;
            TextBlock.GTRegex = />/g;
            TextBlock.LTRegex = /</g;
            TextBlock.DoubleQuoteRegex = /"/g;
            TextBlock.SingleQuoteRegex = /'/g;
            TextBlock.DollarRegex = /[$]/g;
            TextBlock.DelimiterLength = 2;
            return TextBlock;
        }(Templating.Block));
        Templating.TextBlock = TextBlock;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="range.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var RangeFinder = (function () {
            function RangeFinder() {
            }
            RangeFinder.prototype.findRanges = function (text) {
                var result = [];
                if (!text || text.length === 0) {
                    return result;
                }
                result = result.concat(this.internalFindRanges("##forEach(", ")##", text, "forEach", true));
                result = result.concat(this.internalFindRanges("##endForEach##", null, text, "forEach", false));
                result = result.concat(this.internalFindRanges("##if(", ")##", text, "if", true));
                result = result.concat(this.internalFindRanges("##endIf##", null, text, "if", false));
                result = result.concat(this.internalFindRanges("##include(", ")##", text, "include", false));
                result.sort(this.compareRanges);
                result = result.concat(this.findRemainingRanges(text, result));
                result.sort(this.compareRanges);
                return result;
            };
            RangeFinder.prototype.compareRanges = function (a, b) {
                if (a.firstIndex === b.firstIndex) {
                    return 0;
                }
                return a.firstIndex < b.firstIndex ? -1 : 1;
            };
            RangeFinder.prototype.internalFindRanges = function (startsWith, endsWith, textToSearch, rangeType, isStart) {
                var indexStartsWith;
                var minimumIndex = 0;
                var indexEndsWith;
                var results = [];
                var content;
                var lastIndex;
                while (minimumIndex < textToSearch.length) {
                    indexStartsWith = textToSearch.indexOf(startsWith, minimumIndex);
                    indexEndsWith = null;
                    content = null;
                    lastIndex = null;
                    // verify found
                    if (indexStartsWith === -1) {
                        return results;
                    }
                    if (endsWith) {
                        // verify there's enough space for an end
                        minimumIndex = indexStartsWith + startsWith.length + 1;
                        if (minimumIndex >= textToSearch.length) {
                            return results;
                        }
                        indexEndsWith = textToSearch.indexOf(endsWith, minimumIndex);
                        // verify found
                        if (indexEndsWith === -1) {
                            return results;
                        }
                        content = textToSearch.substring(indexStartsWith + startsWith.length, indexEndsWith);
                        lastIndex = indexEndsWith + endsWith.length - 1;
                    }
                    else {
                        lastIndex = indexStartsWith + startsWith.length - 1;
                    }
                    results.push(new Templating.Range(indexStartsWith, lastIndex, content, true, isStart, rangeType));
                    minimumIndex = results[results.length - 1].lastIndex + 1;
                }
                return results;
            };
            RangeFinder.prototype.findRemainingRanges = function (text, rangesFound) {
                var result = [];
                // it is one big text block
                if (rangesFound.length === 0) {
                    result.push(new Templating.Range(0, text.length - 1, text, false, false, "text"));
                    return result;
                }
                var startIndex = 0;
                var precedingGapLength;
                for (var i = 0; i < rangesFound.length; i++) {
                    precedingGapLength = rangesFound[i].firstIndex - startIndex;
                    if (precedingGapLength > 0) {
                        result.push(new Templating.Range(startIndex, startIndex + precedingGapLength - 1, text.substring(startIndex, startIndex + precedingGapLength), false, false, "text"));
                    }
                    startIndex = rangesFound[i].lastIndex + 1;
                }
                if (startIndex < text.length - 1) {
                    result.push(new Templating.Range(startIndex, text.length - 1, text.substring(startIndex, text.length), false, false, "text"));
                }
                return result;
            };
            return RangeFinder;
        }());
        Templating.RangeFinder = RangeFinder;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="block.ts" />
/// <reference path="range.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var ForEachBlock = (function (_super) {
            __extends(ForEachBlock, _super);
            function ForEachBlock(range, text) {
                _super.call(this);
                this._iterationVariable = range.content;
                this.containerType = "forEach";
            }
            ForEachBlock.prototype.process = function (obj) {
                var result = "";
                var collection = obj[this._iterationVariable];
                var i, j;
                for (i = 0; i < collection.length; i++) {
                    var item = collection[i];
                    for (j = 0; j < this.blocks.length; j++) {
                        result = result + this.blocks[j].process(item);
                    }
                }
                return result;
            };
            return ForEachBlock;
        }(Templating.Block));
        Templating.ForEachBlock = ForEachBlock;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="block.ts" />
/// <reference path="range.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var IfBlock = (function (_super) {
            __extends(IfBlock, _super);
            function IfBlock(range, text) {
                _super.call(this);
                this._negate = false;
                this._decisionVariable = range.content;
                if (this._decisionVariable[0] === "!") {
                    this._negate = true;
                    this._decisionVariable = this._decisionVariable.substr(1);
                }
                this.containerType = "if";
            }
            IfBlock.prototype.process = function (obj) {
                var result = "";
                var decisionValue = obj[this._decisionVariable];
                if (typeof decisionValue === "function") {
                    var decisionFunction = decisionValue;
                    decisionValue = decisionFunction.call(obj);
                }
                if (this._negate) {
                    decisionValue = !decisionValue;
                }
                if (decisionValue) {
                    for (var i = 0; i < this.blocks.length; i++) {
                        result = result + this.blocks[i].process(obj);
                    }
                }
                return result;
            };
            return IfBlock;
        }(Templating.Block));
        Templating.IfBlock = IfBlock;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="block.ts" />
/// <reference path="range.ts" />
/// <reference path="template.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var IncludeBlock = (function (_super) {
            __extends(IncludeBlock, _super);
            function IncludeBlock(range) {
                _super.call(this);
                this._template = range.content;
                this.containerType = "include";
            }
            IncludeBlock.prototype.process = function (obj) {
                var template = new Templating.Template({ htmlElementSource: document, templateId: this._template });
                return template.createTemplateText(obj);
            };
            return IncludeBlock;
        }(Templating.Block));
        Templating.IncludeBlock = IncludeBlock;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="range.ts" />
/// <reference path="rangeFinder.ts" />
/// <reference path="block.ts" />
/// <reference path="forEachBlock.ts" />
/// <reference path="ifBlock.ts" />
/// <reference path="textBlock.ts" />
/// <reference path="includeBlock.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        var BlockFactory = (function () {
            function BlockFactory() {
            }
            BlockFactory.prototype.loadBlocks = function (container, text) {
                var rangeFinder = new Templating.RangeFinder();
                var ranges = rangeFinder.findRanges(text);
                var stack = [container];
                var range;
                var complexBlock;
                var containerType;
                var rangeType;
                for (var i = 0; i < ranges.length; i++) {
                    range = ranges[i];
                    if (range.rangeType === "text") {
                        stack[stack.length - 1].addBlock(new Templating.TextBlock(range));
                    }
                    else if (range.rangeType === "include") {
                        stack[stack.length - 1].addBlock(new Templating.IncludeBlock(range));
                    }
                    else if (range.isStart) {
                        if (range.rangeType === "if") {
                            complexBlock = new Templating.IfBlock(range, text);
                        }
                        else if (range.rangeType === "forEach") {
                            complexBlock = new Templating.ForEachBlock(range, text);
                        }
                        if (!complexBlock) {
                            throw new Error("unrecognized block type " + range.rangeType);
                        }
                        stack[stack.length - 1].addBlock(complexBlock);
                        stack.push(complexBlock);
                        complexBlock = null;
                    }
                    else {
                        // must be an ending range
                        rangeType = range.rangeType;
                        containerType = stack[stack.length - 1].containerType;
                        if (rangeType !== containerType) {
                            throw new Error("the current container (" + containerType + ") is missing an end tag. Found a (" + rangeType + ") end tag instead");
                        }
                        stack.pop();
                    }
                }
            };
            return BlockFactory;
        }());
        Templating.BlockFactory = BlockFactory;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../IHtmlElementSource.ts" />
/// <reference path="block.ts" />
/// <reference path="textBlock.ts" />
/// <reference path="../mInterfaces.ts" />
/// <reference path="blockFactory.ts" />
var Common;
(function (Common) {
    var Templating;
    (function (Templating) {
        "use strict";
        ;
        var Template = (function () {
            function Template(documentSource, htmlText, localizer) {
                this._templateId = "";
                this._blocks = [];
                this.containerType = "template";
                if (documentSource) {
                    this._htmlElementSource = documentSource.htmlElementSource;
                    this._templateId = documentSource.templateId;
                    var templateContainerElement = this._htmlElementSource.getElementById(this._templateId);
                    if (!templateContainerElement) {
                        throw new Error("Template with id " + this._templateId + " is not valid.");
                    }
                    var templateText = templateContainerElement.innerHTML;
                    var localizedTemplateText = this.localize(templateText, localizer);
                    this.initialize(localizedTemplateText);
                }
                else {
                    this.initialize(htmlText);
                }
            }
            Template.prototype.addBlock = function (block) {
                this._blocks.push(block);
            };
            Template.prototype.createTemplateText = function (obj) {
                return this.processBlocks(obj);
            };
            Template.prototype.createTemplateElement = function (obj) {
                var templateInstance = this._htmlElementSource.createElement("div");
                templateInstance.innerHTML = this.createTemplateText(obj);
                var elementNode;
                for (var i = 0; i < templateInstance.childNodes.length; i++) {
                    if (templateInstance.childNodes[i].nodeType === Node.TEXT_NODE) {
                        if (!templateInstance.childNodes[i].textContent.match(/^\s+$/)) {
                            return templateInstance;
                        }
                    }
                    if (templateInstance.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                        if (elementNode) {
                            return templateInstance;
                        }
                        elementNode = templateInstance.childNodes[i];
                    }
                }
                return elementNode;
            };
            Template.prototype.appendChild = function (parent, obj, className) {
                var child = this.createTemplateElement(obj);
                if (className) {
                    child.classList.add(className);
                }
                parent.appendChild(child);
            };
            Template.prototype.replaceChildren = function (parent, obj, className) {
                parent.innerHTML = "";
                this.appendChild(parent, obj, className);
            };
            Template.prototype.localize = function (text, localizer) {
                if (!localizer) {
                    return text;
                }
                var replaceWhat;
                var thingsToReplace = Template.LocalizationRegex.exec(text);
                if (!thingsToReplace || thingsToReplace.length === 0) {
                    return text;
                }
                for (var i = 0; i < thingsToReplace.length; i++) {
                    replaceWhat = thingsToReplace[i];
                    var localizationKey = replaceWhat.substring(Template.DelimiterLength, replaceWhat.length - Template.DelimiterLength);
                    var replaceWith = localizer.getString(localizationKey);
                    text = text.replace(replaceWhat, replaceWith);
                }
                return text;
            };
            Template.prototype.initialize = function (text) {
                var blockFactory = new Templating.BlockFactory();
                blockFactory.loadBlocks(this, text);
            };
            Template.prototype.processBlocks = function (model) {
                var result = "";
                for (var i = 0; i < this._blocks.length; i++) {
                    result = result + this._blocks[i].process(model);
                }
                return result;
            };
            Template.LocalizationRegex = /%L%[a-zA-Z]+%L%/;
            Template.DelimiterLength = 3;
            return Template;
        }());
        Templating.Template = Template;
    })(Templating = Common.Templating || (Common.Templating = {}));
})(Common || (Common = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../IHtmlElementSource.ts" />
/// <reference path="../Templating/template.ts" />
/// <reference path="listModel.ts" />
/// <reference path="../mInterfaces.ts" />
/// <reference path="../m.ts" />
/// <reference path="../toolwindow.ts" />
var Common;
(function (Common) {
    var ModelView;
    (function (ModelView) {
        "use strict";
        var T = Common.Templating;
        ;
        var ListView = (function () {
            function ListView(htmlElementSource, listViewDivId, defaultItemTemplateId, model, alternateTemplates, localizer) {
                var _this = this;
                this._alternateTemplates = [];
                this._handlersAdded = [];
                this.htmlElementSource = htmlElementSource;
                this.listViewDivId = listViewDivId;
                this.listRoot = htmlElementSource.getElementById(listViewDivId);
                if (!this.listRoot) {
                    throw new Error("Can't find list root element with id '" + listViewDivId + "'.");
                }
                this._defaultTemplate = this.createTemplate(defaultItemTemplateId, localizer);
                if (!this.listRoot) {
                    throw new Error("Can't find default template element with id '" + defaultItemTemplateId + "'.");
                }
                this.model = model;
                if (alternateTemplates) {
                    alternateTemplates.forEach(function (value, index, array) {
                        var template = _this.createTemplate(value.templateId);
                        _this._alternateTemplates.push({ selectionFunction: value.templateMatchFunction, template: template });
                    });
                }
            }
            ListView.prototype.createTemplate = function (id, localizer) {
                return new T.Template({ htmlElementSource: this.htmlElementSource, templateId: id }, null, localizer);
            };
            ListView.prototype.addAutoRemoveHandlers = function (baseElement, event, classes, func) {
                var _this = this;
                // Find the elements for each class and add an event listener.
                var handler = function (evt) { return _this.eventHandler(func, evt); };
                classes.forEach(function (className) {
                    var elements = [];
                    var childElements = baseElement.querySelectorAll("." + className);
                    for (var i = 0; i < childElements.length; i++) {
                        elements.push(childElements[i]);
                    }
                    if (baseElement.classList.contains(className)) {
                        elements.push(baseElement);
                    }
                    elements.forEach(function (element) {
                        element.addEventListener(event, handler);
                        _this._handlersAdded.push({ element: element, event: event, handler: handler });
                    });
                });
            };
            ListView.prototype.addHandler = function (element, event, classes, func) {
                var _this = this;
                element.addEventListener(event, function (evt) { return _this.eventHandler(func, evt, classes); });
            };
            ListView.prototype.updateView = function () {
                var _this = this;
                this.model.load(function () {
                    _this.renderView();
                });
            };
            ListView.prototype.renderView = function () {
                this.clearView();
                this.preViewProcessing();
                for (var i = 0; i < this.model.length; i++) {
                    this.preItemViewProcessing(i);
                    this.listRoot.appendChild(this.renderItem(this.model.item(i), "BPT-List-Item"));
                    this.postItemViewProcessing(i);
                }
                this.postViewProcessing();
                if (this.renderViewCallback) {
                    this.renderViewCallback();
                }
            };
            ListView.prototype.renderItem = function (item, className) {
                var selectedTemplate = this.chooseTemplate(item);
                var element = selectedTemplate.createTemplateElement(item);
                if (className) {
                    element.classList.add(className);
                }
                return element;
            };
            ListView.prototype.renderItemText = function (item) {
                var selectedTemplate = this.chooseTemplate(item);
                return selectedTemplate.createTemplateText(item);
            };
            ListView.prototype.clearView = function () {
                this.removeAllHandlers();
                $m(this.listRoot).children().remove();
            };
            ListView.prototype.removeAllHandlers = function () {
                this._handlersAdded.forEach(function (handler) {
                    handler.element.removeEventListener(handler.event, handler.handler);
                });
                this._handlersAdded = [];
            };
            ListView.prototype.setFocus = function (element) {
                this.setTabIndex(element);
                element.focus();
            };
            ListView.prototype.setTabIndex = function (element) {
                // Clear other tabIndexes under our root, because we only want one.
                var tabElements = this.listRoot.querySelectorAll("[tabIndex='1']");
                for (var i = 0; i < tabElements.length; i++) {
                    tabElements[i].removeAttribute("tabIndex");
                }
                element.setAttribute("tabIndex", "1");
            };
            // The following method provides a way for subclasses to do processing after the view is rendered. It is called from renderView()
            ListView.prototype.postViewProcessing = function () {
                this.addAutoRemoveHandlers(this.listRoot, "mouseenter", [ListView.TOOLTIP_ITEM], function (evt) {
                    var tip = evt.target.getAttribute("data-tooltip");
                    if (tip) {
                        Microsoft.Plugin.Tooltip.show({ content: tip });
                    }
                    return true;
                });
                this.addAutoRemoveHandlers(this.listRoot, "mouseleave", [ListView.TOOLTIP_ITEM], function (evt) {
                    Microsoft.Plugin.Tooltip.dismiss();
                    return true;
                });
            };
            // The following method provides a way for subclasses to do processing before the view is rendered. It is called from renderView()
            ListView.prototype.preViewProcessing = function () {
            };
            // The following method provides a way for subclasses to do processing before each item is rendered. It is called from renderView()
            ListView.prototype.preItemViewProcessing = function (index) {
            };
            // The following method provides a way for subclasses to do processing before each item is rendered. It is called from renderView()
            ListView.prototype.postItemViewProcessing = function (index) {
            };
            ListView.prototype.chooseTemplate = function (item) {
                var selectedTemplate = null;
                this._alternateTemplates.forEach(function (value, index, array) {
                    if (value.selectionFunction(item)) {
                        selectedTemplate = value.template;
                        return;
                    }
                });
                if (!selectedTemplate) {
                    selectedTemplate = this._defaultTemplate;
                }
                return selectedTemplate;
            };
            ListView.prototype.eventHandler = function (func, evt, classes) {
                if (Common.ToolWindowHelpers.isContextMenuUp()) {
                    return;
                }
                var element = evt.target;
                if (!element) {
                    return;
                }
                var classMatches;
                if (classes && classes.length && element.classList) {
                    classMatches = false;
                    for (var i = 0; i < classes.length; i++) {
                        if (element.classList.contains(classes[i])) {
                            classMatches = true;
                            break;
                        }
                    }
                }
                else {
                    classMatches = true;
                }
                if (classMatches && !func(evt)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            };
            ListView.TOOLTIP_ITEM = "BPT-Tooltip-Item";
            return ListView;
        }());
        ModelView.ListView = ListView;
    })(ModelView = Common.ModelView || (Common.ModelView = {}));
})(Common || (Common = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Templating/template.ts" />
/// <reference path="listModel.ts" />
/// <reference path="listView.ts" />
/// <reference path="listReconciler.ts" />
/// <reference path="../mInterfaces.ts" />
/// <reference path="../m.ts" />
var Common;
(function (Common) {
    var ModelView;
    (function (ModelView) {
        "use strict";
        var ReconcilingListView = (function (_super) {
            __extends(ReconcilingListView, _super);
            function ReconcilingListView(htmlElementSource, listViewDivId, defaultItemTemplateId, model, alternateTemplates, localizer, idPropertyName, sortPropertyName, isChanged, clearDirtyFlag) {
                _super.call(this, htmlElementSource, listViewDivId, defaultItemTemplateId, model, alternateTemplates, localizer);
                this.objectsPreviouslyRendered = [];
                this.htmlElementSource = htmlElementSource;
                this.listViewDivId = listViewDivId;
                this.idPropertyName = idPropertyName;
                this._sortPropertyName = sortPropertyName;
                if (this.idPropertyName && this._sortPropertyName) {
                    this.listReconciler = new ModelView.ListReconciler(idPropertyName, sortPropertyName, this.insertBefore.bind(this), this.update.bind(this), this.deleteItem.bind(this), isChanged, clearDirtyFlag);
                }
            }
            ReconcilingListView.prototype.renderView = function () {
                if (!this.listReconciler) {
                    _super.prototype.renderView.call(this);
                    return;
                }
                this.preViewProcessing();
                this.listReconciler.reconcile(this.objectsPreviouslyRendered, this.model.cache);
                this.objectsPreviouslyRendered = this.model.cache.slice(0);
                this.postViewProcessing();
                if (this.renderViewCallback) {
                    this.renderViewCallback();
                }
            };
            // The following method provides a way for subclasses to do processing before the item is updated. It is called from update()
            ReconcilingListView.prototype.beforeUpdate = function (newThing, oldThing, updatedElement) {
            };
            // The following method provides a way for subclasses to do processing after the item is updated. It is called from update()
            ReconcilingListView.prototype.afterUpdate = function (newThing, oldThing, updatedElement) {
            };
            // The following method provides a way for subclasses to do processing before the item is deleted. It is called from deleteItem()
            ReconcilingListView.prototype.beforeDelete = function (oldThing, deletedElement) {
            };
            // The following method provides a way for subclasses to do processing after the item is deleted. It is called from deleteItem()
            ReconcilingListView.prototype.afterDelete = function () {
            };
            ReconcilingListView.prototype.clearView = function () {
                _super.prototype.clearView.call(this);
                this.objectsPreviouslyRendered = [];
            };
            ReconcilingListView.prototype.insertBefore = function (newThing, insertBefore) {
                var newElement = this.renderItem(newThing, ReconcilingListView.ListItemClassName);
                if (!insertBefore) {
                    this.listRoot.appendChild(newElement);
                    return;
                }
                var insertBeforeElement = this.listRoot.querySelector("[data-listid='" + insertBefore[this.idPropertyName] + "']");
                if (insertBeforeElement) {
                    this.listRoot.insertBefore(newElement, insertBeforeElement);
                }
                else {
                    this.listRoot.appendChild(newElement);
                }
            };
            ReconcilingListView.prototype.update = function (newThing, oldThing) {
                var oldElement = this.listRoot.querySelector("[data-listid='" + oldThing[this.idPropertyName] + "']");
                if (oldElement) {
                    this.beforeUpdate(newThing, oldThing, oldElement);
                    var newElementText = this.renderItemText(newThing);
                    oldElement.outerHTML = newElementText;
                    oldElement.classList.add(ReconcilingListView.ListItemClassName);
                    this.afterUpdate(newThing, oldThing, oldElement);
                }
            };
            ReconcilingListView.prototype.deleteItem = function (thingToDelete) {
                var oldElement = this.listRoot.querySelector("[data-listid='" + thingToDelete[this.idPropertyName] + "']");
                if (oldElement) {
                    this.beforeDelete(thingToDelete, oldElement);
                    //oldElement.removeNode(true); -- dshoots: not needed for AppResponsiveness.
                    this.afterDelete();
                }
            };
            ReconcilingListView.ListItemClassName = "BPT-List-Item";
            return ReconcilingListView;
        }(ModelView.ListView));
        ModelView.ReconcilingListView = ReconcilingListView;
    })(ModelView = Common.ModelView || (Common.ModelView = {}));
})(Common || (Common = {}));
//
//  Copyright (C) Microsoft. All rights reserved.
//
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------
var ControlTemplates;
(function (ControlTemplates) {
    var Common = (function () {
        function Common() {
        }
        Common.defaultButtonTemplate = "\
<div class=\"BPT-button\" tabindex=\"1\"></div>\
";
        Common.iconButton24x24 = "\
<div class=\"BPT-button iconButton24x24\" tabindex=\"1\"><span class=\"buttonIcon\"></span></div>\
";
        Common.menuButton33x24 = "\
<div class=\"BPT-button menuButton33x24\" tabindex=\"1\"><span class=\"buttonIcon\"></span></div>\
";
        Common.menuButton33x24x5 = "\
<div class=\"BPT-button menuButton33x24 imageStates5\" tabindex=\"1\"><span class=\"buttonIcon\"></span></div>\
";
        Common.iconButton = "\
<div class=\"BPT-button iconButton\" tabindex=\"1\"><span class=\"buttonIcon\"></span></div>\
";
        Common.labeledIconButton = "\
<div class=\"BPT-button labeledIconButton\" tabindex=\"1\">\
            <span class=\"buttonIcon\"></span>\
            <span class=\"buttonText\" data-controlbinding=\"innerText:content\"></span>\
        </div>\
";
        Common.defaultToolbarTemplate = "\
<div class=\"BPT-Toolbar\" role=\"toolbar\">\
            <div class=\"BPT-ToolbarContents\">\
                <span class=\"BPT-ToolTitle\" data-controlbinding=\"innerText:title,                                            attr-aria-label:title\"></span>\
                <div data-name=\"_toolbarPanel\" data-control=\"Common.TemplateControl\" data-controlbinding=\"model:model,                                           templateId:panelTemplateId\" data-options=\"className:buttons\"></div>\
            </div>\
        </div>\
";
        Common.toolbarTemplateWithSearchBox = "\
<div class=\"BPT-Toolbar\" role=\"toolbar\">\
            <div class=\"BPT-ToolbarContents\">\
                <span class=\"BPT-ToolTitle\" data-controlbinding=\"innerText:title,                                            attr-aria-label:title\"></span>\
                <div data-name=\"_toolbarPanel\" data-control=\"Common.TemplateControl\" data-controlbinding=\"model:model,                                           templateId:panelTemplateId\" data-options=\"className:buttons\"></div>\
                <div id=\"searchBoxBorder\" class=\"BPT-SearchBox-Border\">\
                    <input type=\"text\" id=\"searchbox\" class=\"BPT-SearchBox\" tabindex=\"1\" role=\"search\" />\
                    <div id=\"searchPreviousResult\" class=\"BPT-Search-Button\" role=\"button\" tabindex=\"1\">\
                        <div class=\"BPT-Search-Previous\"></div>\
                    </div>\
                    <div id=\"searchNextResult\" class=\"BPT-Search-Button\" role=\"button\" tabindex=\"1\">\
                        <div class=\"BPT-Search-Next\"></div>\
                    </div>\
                </div>\
            </div>\
        </div>\
";
        Common.menuControlTemplate = "\
<div class=\"BPT-menuControl\" role=\"menu\">\
            <div data-control=\"Common.TemplateControl\" data-controlbinding=\"model:model,                                       templateId:menuItemsTemplateId\" data-options=\"className:BPT-menuContent\"></div>\
        </div>\
";
        Common.menuItemTemplate = "\
<li class=\"menuItem\" role=\"menuitem\" tabindex=\"0\" data-controlbinding=\"attr-aria-label:tooltip,                                   attr-data-plugin-vs-tooltip:tooltip\">\
            <div class=\"gutter\"></div>\
            <span data-controlbinding=\"innerText:content,                                        attr-aria-label:content\"></span>\
        </li>\
";
        Common.menuItemCheckMarkTemplate = "\
<li class=\"menuItem\" role=\"menuitemcheckbox\" tabindex=\"0\" data-controlbinding=\"attr-aria-label:tooltip,                                   attr-data-plugin-vs-tooltip:tooltip\">\
            <img class=\"menuToggleItem gutter\" data-options=\"src:plugin-menu-item-checkmark; converter=Common.CommonConverters.ThemedImageConverter\" />\
            <span data-controlbinding=\"innerText:content,                                        attr-aria-label:content\"></span>\
        </li>\
";
        Common.menuItemCheckBoxTemplate = "\
<li class=\"menuItem\" role=\"menuitemcheckbox\" tabindex=\"0\" data-controlbinding=\"attr-aria-label:tooltip,                                   attr-data-plugin-vs-tooltip:tooltip\">\
            <input type=\"checkbox\" tabindex=\"-1\" data-name=\"BPT-menuItemCheckBox\" data-controlbinding=\"checked:isChecked; mode=twoway\" />\
            <span data-controlbinding=\"innerText:content,                                        attr-aria-label:content\"></span>\
        </li>\
";
        Common.menuItemComboBoxTemplate = "\
<li class=\"menuItem comboBoxMenuItem\" role=\"menuitem\" tabindex=\"-1\">\
            <div data-control=\"Common.Controls.ComboBox\" data-name=\"BPT-menuItemComboBox\" data-controlbinding=\"items:items,                                      selectedValue:selectedValue; mode=twoway,                                      tooltip:tooltip\" data-options=\"tabIndex:0\"></div>\
        </li>\
";
        Common.menuItemTextBoxTemplate = "\
<li class=\"menuItem textBoxMenuItem\" role=\"menuitem\" tabindex=\"-1\">\
            <div data-control=\"Common.Controls.TextBox\" data-name=\"BPT-menuItemTextBox\" data-controlbinding=\"isEnabled:isEnabled,                                      placeholder:placeholder,                                      text:content; mode=twoway,                                      tooltip:tooltip\" data-options=\"clearOnEscape:1,                               tabIndex:0,                               updateOnInput:1\"></div>\
        </li>\
";
        Common.defaultComboBoxTemplate = "\
<select data-controlbinding=\"value:selectedValue; mode=twoway\"></select>\
";
        Common.defaultComboBoxItemTemplate = "\
<option data-binding=\"attr-aria-label:label,                               attr-data-plugin-vs-tooltip:tooltip,                               title:tooltip,                               text:text,                               value:value\"></option>\
";
        Common.defaultTextBoxTemplate = "\
<input type=\"text\" class=\"BPT-TextBox\" data-controlbinding=\"attr-data-plugin-vs-tooltip:tooltip,                                     value:text; mode=twoway,                                     placeholder:placeholder\" />\
";
        Common.stackPanelTemplate = "\
<div class=\"BPT-stackPanel\">\
            <div id=\"contentSizer\" class=\"BPT-contentSizer\"></div>\
            <div id=\"content\"></div>\
        </div>\
";
        return Common;
    }());
    ControlTemplates.Common = Common;
})(ControlTemplates || (ControlTemplates = {}));
//# sourceMappingURL=Bpt.Diagnostics.CommonMerged.js.map
// SIG // Begin signature block
// SIG // MIIjnQYJKoZIhvcNAQcCoIIjjjCCI4oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // iHNGeh+3Z0BvROkmATu0p9AkXCBQT7Wrl9VSaNxtyDig
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAd9r8C6Sp0q00AAA
// SIG // AAAB3zANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIwMTIxNTIxMzE0NVoX
// SIG // DTIxMTIwMjIxMzE0NVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // trsZWRAAo6nx5LhcqAsHy9uaHyPQ2VireMBI9yQUOPBj
// SIG // 7dVLA7/N+AnKFFDzJ7P+grT6GkOE4cv5GzjoP8yQJ6yX
// SIG // ojEKkXti7HW/zUiNoF11/ZWndf8j1Azl6OBjcD416tSW
// SIG // Yvh2VfdW1K+mY83j49YPm3qbKnfxwtV0nI9H092gMS0c
// SIG // pCUsxMRAZlPXksrjsFLqvgq4rnULVhjHSVOudL/yps3z
// SIG // OOmOpaPzAp56b898xC+zzHVHcKo/52IRht1FSC8V+7QH
// SIG // TG8+yzfuljiKU9QONa8GqDlZ7/vFGveB8IY2ZrtUu98n
// SIG // le0WWTcaIRHoCYvWGLLF2u1GVFJAggPipwIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFDj2zC/CHZDRrQnzJlT7byOl
// SIG // WfPjMFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ2MzAwOTAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBAJ56h7Q8mFBWlQJLwCtHqqup4aC/eUmULt0Z
// SIG // 6We7XUPPUEd/vuwPuIa6+1eMcZpAeQTm0tGCvjACxNNm
// SIG // rY8FoD3aWEOvFnSxq6CWR5G2XYBERvu7RExZd2iheCqa
// SIG // EmhjrJGV6Uz5wmjKNj16ADFTBqbEBELMIpmatyEN50UH
// SIG // wZSdD6DDHDf/j5LPGUy9QaD2LCaaJLenKpefaugsqWWC
// SIG // MIMifPdh6bbcmxyoNWbUC1JUl3HETJboD4BHDWSWoDxI
// SIG // D2J4uG9dbJ40QIH9HckNMyPWi16k8VlFOaQiBYj09G9s
// SIG // LMc0agrchqqZBjPD/RmszvHmqJlSLQmAXCUgcgcf6UtH
// SIG // EmMAQRwGcSTg1KsUl6Ehg75k36lCV57Z1pC+KJKJNRYg
// SIG // g2eI6clzkLp2+noCF75IEO429rjtujsNJvEcJXg74TjK
// SIG // 5x7LqYjj26Myq6EmuqWhbVUofPWm1EqKEfEHWXInppqB
// SIG // YXFpBMBYOLKc72DT+JyLNfd9utVsk2kTGaHHhrp+xgk9
// SIG // kZeud7lI/hfoPeHOtwIc0quJIXS+B5RSD9nj79vbJn1J
// SIG // x7RqusmBQy509Kv2Pg4t48JaBfBFpJB0bUrl5RVG05sK
// SIG // /5Qw4G6WYioS0uwgUw499iNC+Yud9vrh3M8PNqGQ5mJm
// SIG // JiFEjG2ToEuuYe/e64+SSejpHhFCaAFcMIIHejCCBWKg
// SIG // AwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
// SIG // OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQD
// SIG // Ex9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDEx
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // q/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4Bjga
// SIG // BEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSH
// SIG // fpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpg
// SIG // GgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpc
// SIG // oRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnn
// SIG // Db6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD
// SIG // 2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLT
// SIG // swM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOE
// SIG // y/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2
// SIG // z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
// SIG // A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
// SIG // 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
// SIG // jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyim
// SIG // p31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8Hh
// SIG // hUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX
// SIG // 3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXT
// SIG // gqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMA
// SIG // dQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUw
// SIG // AwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx
// SIG // 0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4G
// SIG // CCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
// SIG // HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
// SIG // BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUF
// SIG // BwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5
// SIG // AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOS
// SIG // mUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np
// SIG // 22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r
// SIG // 4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION
// SIG // 9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWlu
// SIG // WpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiX
// SIG // mE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ
// SIG // 2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNA
// SIG // BQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPD
// SIG // XVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yH
// SIG // PgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
// SIG // XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
// SIG // oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
// SIG // GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E9
// SIG // 0Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZO
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCFXQw
// SIG // ghVwAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAHfa/AukqdKtNAAAAAAAd8wDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIAJEp7gk05/KF33sBKQw
// SIG // ym7ogMVp7veAV3XayRCrpAwmMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAi7b1TY5DCTBqGmi3rzM5eUpthXwhmTQlCGw1
// SIG // RJ2TC4sO9zyag56vW++EX+Nmr1U3N39R44doLuQqdt8I
// SIG // Dw/iAnPKgjDlpsCJOS6V4zQOnpOIiKfaECTZodYJGnF1
// SIG // Lo15nSoJ0dlFDHECxbOl/4LsRWCpL2XpwXeOzQF/94l7
// SIG // rk0f4c2J9t6I3mBkQ4SeB1qmvLVsN4H6yJk/+TbqaXYP
// SIG // KfgRL1HZvEAnsf1BYZmpBfA8613Z+av1H0I2Xd78PAuv
// SIG // ZeCCs4u0WkkQfZi7susAzc9wetHldui91R8mBnvYi0SU
// SIG // Tv/iSiIer91fEcwe3MH8DKNleyAIpbVu5plDt0JnZ6GC
// SIG // Ev4wghL6BgorBgEEAYI3AwMBMYIS6jCCEuYGCSqGSIb3
// SIG // DQEHAqCCEtcwghLTAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCAUVGKq
// SIG // NXtfiezMayg7QaImqHiXBcQ1DytLys/pO17xzwIGYIrN
// SIG // mSVXGBMyMDIxMDUwMzIyMjQyOC40NTZaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjhE
// SIG // NDEtNEJGNy1CM0I3MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIOTTCCBPkwggPhoAMC
// SIG // AQICEzMAAAE6jY0x93dJScIAAAAAATowDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjAxMDE1MTcyODIyWhcNMjIwMTEyMTcyODIyWjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo4RDQxLTRC
// SIG // RjctQjNCNzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCASIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggEPADCCAQoCggEBAM5fJOdfD5c/CUyF2J/zvTmpKnFq
// SIG // nSfGVyYQJLPYciwfPgDVu2Z4G9be4sO05oHqKDsDJ24Q
// SIG // kEB9eFMFnfIUBVnsSqlaXCBZ2N29efj2JoFXkOFyn1id
// SIG // zzzI04l7u93qVx4/V1+5oUtiFasBLwzrnTiN8kC/A/Dj
// SIG // htuG/tdMwwxMjecL2eQNVnL5dnkIQhutRnhzWl71zpaE
// SIG // 0G5VRWzFjphr4h74EZUYUY4DZrr9Sdsun0BbYhMNKXVy
// SIG // gkBuvMUJQYXLuC5/m2C+B6Hk9pq7ZKRxMg2fn66/imv8
// SIG // 1Az9wbHB5CnZDRjjg37yXVh2ldFs69cJz7lILTm35wTt
// SIG // KEoyKQUCAwEAAaOCARswggEXMB0GA1UdDgQWBBQUVqCf
// SIG // Fl8Sa6bJbxx1rK0JhUXzyzAfBgNVHSMEGDAWgBTVYzpc
// SIG // ijGQ80N7fEYbxTNoWoVtVTBWBgNVHR8ETzBNMEugSaBH
// SIG // hkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9NaWNUaW1TdGFQQ0FfMjAxMC0wNy0w
// SIG // MS5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAC
// SIG // hj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2Nl
// SIG // cnRzL01pY1RpbVN0YVBDQV8yMDEwLTA3LTAxLmNydDAM
// SIG // BgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MA0GCSqGSIb3DQEBCwUAA4IBAQBeN+Q+pAEto3gCfARt
// SIG // Sk5uQM9I6W3Y6akrzC7e3zla2gBB5XYJNOASnE5oc420
// SIG // 17I8IAjDAkvo1+E6KotHJ83EqA9i6YWQPfA13h+pUR+6
// SIG // kHV2x4MdP726tGMlZJbUkzL9Y88yO+WeXYab3OFMJ+BW
// SIG // +ggmhdv/q+0a9I/tgxgsJfGlqr0Ks4Qif6O3DaGFHyeF
// SIG // kgh7NTrI4DJlk5oJbjyMbd5FfIi2ZdiGYMq+XDTojYk6
// SIG // 2hQ6u4cSNeqA7KFtBECglfOJ1dcFklntUogCiMK+Qbam
// SIG // MCfoZaHD8OanoVmwYky57XC68CnQG8LYRa9Qx390WMBa
// SIG // A88jbSkgf0ybAdmzMIIGcTCCBFmgAwIBAgIKYQmBKgAA
// SIG // AAAAAjANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3Qg
// SIG // Q2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMTAw
// SIG // NzAxMjEzNjU1WhcNMjUwNzAxMjE0NjU1WjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDCCASIwDQYJKoZIhvcN
// SIG // AQEBBQADggEPADCCAQoCggEBAKkdDbx3EYo6IOz8E5f1
// SIG // +n9plGt0VBDVpQoAgoX77XxoSyxfxcPlYcJ2tz5mK1vw
// SIG // FVMnBDEfQRsalR3OCROOfGEwWbEwRA/xYIiEVEMM1024
// SIG // OAizQt2TrNZzMFcmgqNFDdDq9UeBzb8kYDJYYEbyWEeG
// SIG // MoQedGFnkV+BVLHPk0ySwcSmXdFhE24oxhr5hoC732H8
// SIG // RsEnHSRnEnIaIYqvS2SJUGKxXf13Hz3wV3WsvYpCTUBR
// SIG // 0Q+cBj5nf/VmwAOWRH7v0Ev9buWayrGo8noqCjHw2k4G
// SIG // kbaICDXoeByw6ZnNPOcvRLqn9NxkvaQBwSAJk3jN/LzA
// SIG // yURdXhacAQVPIk0CAwEAAaOCAeYwggHiMBAGCSsGAQQB
// SIG // gjcVAQQDAgEAMB0GA1UdDgQWBBTVYzpcijGQ80N7fEYb
// SIG // xTNoWoVtVTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMA
// SIG // QTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAf
// SIG // BgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBW
// SIG // BgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jv
// SIG // c29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29D
// SIG // ZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUHAQEE
// SIG // TjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNydDCBoAYDVR0gAQH/BIGVMIGSMIGP
// SIG // BgkrBgEEAYI3LgMwgYEwPQYIKwYBBQUHAgEWMWh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9QS0kvZG9jcy9DUFMv
// SIG // ZGVmYXVsdC5odG0wQAYIKwYBBQUHAgIwNB4yIB0ATABl
// SIG // AGcAYQBsAF8AUABvAGwAaQBjAHkAXwBTAHQAYQB0AGUA
// SIG // bQBlAG4AdAAuIB0wDQYJKoZIhvcNAQELBQADggIBAAfm
// SIG // iFEN4sbgmD+BcQM9naOhIW+z66bM9TG+zwXiqf76V20Z
// SIG // MLPCxWbJat/15/B4vceoniXj+bzta1RXCCtRgkQS+7lT
// SIG // jMz0YBKKdsxAQEGb3FwX/1z5Xhc1mCRWS3TvQhDIr79/
// SIG // xn/yN31aPxzymXlKkVIArzgPF/UveYFl2am1a+THzvbK
// SIG // egBvSzBEJCI8z+0DpZaPWSm8tv0E4XCfMkon/VWvL/62
// SIG // 5Y4zu2JfmttXQOnxzplmkIz/amJ/3cVKC5Em4jnsGUpx
// SIG // Y517IW3DnKOiPPp/fZZqkHimbdLhnPkd/DjYlPTGpQqW
// SIG // hqS9nhquBEKDuLWAmyI4ILUl5WTs9/S/fmNZJQ96LjlX
// SIG // dqJxqgaKD4kWumGnEcua2A5HmoDF0M2n0O99g/DhO3EJ
// SIG // 3110mCIIYdqwUB5vvfHhAN/nMQekkzr3ZUd46PioSKv3
// SIG // 3nJ+YWtvd6mBy6cJrDm77MbL2IK0cs0d9LiFAR6A+xuJ
// SIG // KlQ5slvayA1VmXqHczsI5pgt6o3gMy4SKfXAL1QnIffI
// SIG // rE7aKLixqduWsqdCosnPGUFN4Ib5KpqjEWYw07t0Mkvf
// SIG // Y3v1mYovG8chr1m1rtxEPJdQcdeh0sVV42neV8HR3jDA
// SIG // /czmTfsNv11P6Z0eGTgvvM9YBS7vDaBQNdrvCScc1bN+
// SIG // NR4Iuto229Nfj950iEkSoYIC1zCCAkACAQEwggEAoYHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjhE
// SIG // NDEtNEJGNy1CM0I3MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoD
// SIG // FQAHJZHZ9Y9YF4Hcr2I+NQfK5DWeCKCBgzCBgKR+MHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqGSIb3
// SIG // DQEBBQUAAgUA5DqR7zAiGA8yMDIxMDUwMzIzMTQ1NVoY
// SIG // DzIwMjEwNTA0MjMxNDU1WjB3MD0GCisGAQQBhFkKBAEx
// SIG // LzAtMAoCBQDkOpHvAgEAMAoCAQACAheoAgH/MAcCAQAC
// SIG // AhEmMAoCBQDkO+NvAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAEXGhUO//gS9S
// SIG // V3Eomi8W4a9jsyjv87cMHPmmUue31FGrZOsdeU58B+gA
// SIG // ZjPB+N/D1aPO8gSEjXG4KJLgv5rasEAA/DiEzGTIN6KD
// SIG // 0w41GzVYiO9vZN20hENDwwSFxQGsgOParMMm8mhIHJBr
// SIG // +fYaF7qpTcI2XAiAgUankwF5IuMxggMNMIIDCQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // ATqNjTH3d0lJwgAAAAABOjANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCAYmoAaK7hca67gjpAD0I7WQOv5
// SIG // wh1xV+TZfw8+bbFWXDCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIJ+v0IQHqSxf+wXbL37vBjk/ooS/XOHI
// SIG // KOTX9WlDfLRtMIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAE6jY0x93dJScIAAAAAATow
// SIG // IgQg6j8oWjkFYTZBOAQtliW6T4616B7XvMQwUs4w24oU
// SIG // uaYwDQYJKoZIhvcNAQELBQAEggEAvHYDp4yuewk5uN0a
// SIG // cJfMZq99QJN82PN/k/ys02LlMWVrw3KrJP2TCxLykvUj
// SIG // G7bb5W+eQN/qw3Uup+hHfCT1gyXPCQAIrstVVNx/+LuL
// SIG // G/f0Fx7V0pdyrmvha0XNtN5fmDNBD9l3MGvUYBHqI3QG
// SIG // reZ4dwI1CLSpp1Yj96XWJPOEum6q6fP2+ykUe0SgiurN
// SIG // mUPh/AZ6AGCc/9By6qHzORP/jLAfHLxO6VEGLArszSd7
// SIG // XcM3EKnG6wi2fepJkmDcJ12uUCNQ3UvO30f8+d8J3tgG
// SIG // hKuhbI8VtjZTKXAeydOAsDGTKyFpBS32C1jeSnHbafRQ
// SIG // oj/Tu2ZGXiPyWwo3sA==
// SIG // End signature block
