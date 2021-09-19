var __n = window.__n || function () { };

var $$modules = $$modules || {};

function registerModule(name, factory) {
    $$modules[name] = $$modules[name] || factory;
}

function loadModule(name) {
    var res = $$modules[name];
    if (typeof res === 'function') {
        $$modules[name] = res = res();
    }
    return res;
}

// Put an implementation of setImmediate and msSetImmediate in place for browsers < IE10
window.setImmediate = window.setImmediate || function (callback) {
    window.setTimeout(callback, 0);
};

window.msSetImmediate = window.msSetImmediate || window.setImmediate;

// Provide a replacement for classList if we are < IE10
if (!("classList" in document.documentElement)) {
    var ClassListObject = function (element) {
        var classNameString = element.className.trim();
        var classNameArray = classNameString ? classNameString.split(/\s+/) : [];
        for (var i = 0; i < classNameArray.length; i++) {
            this.push(classNameArray[i]);
        }
        this._update = function () {
            element.className = this.toString();
        };
    };
    var classListPrototype = ClassListObject["prototype"] = [];

    // classList is a DOMTokenList, which supports item, contains, add, remove, toggle methods and a length property, 
    // we'll add a toString just for convienence.
    classListPrototype.item = function (index) {
        return this[index] || null;
    };
    classListPrototype.contains = function (toCheck) {
        return this.indexOf(toCheck + "") !== -1;
    };
    classListPrototype.add = function (className) {
        className += "";
        if (className.match(/\s+/)) {
            var err = new Error();
            err.code = DOMException.INVALID_CHARACTER_ERR;
            throw err;
        }

        var alreadyPresent = this.contains(className);
        if (!alreadyPresent) {
            this.push(className);
            this._update();
        }
    };
    classListPrototype.remove = function (className) {
        className += "";
        var itemIndex = this.indexOf(className);
        var present = (itemIndex !== -1);
        if (present) {
            this.splice(itemIndex, 1);
            this._update();
        }
    };
    classListPrototype.toggle = function (className) {
        className += "";
        this.contains(className) ? this.remove(className) : this.add(className);
    }
    classListPrototype.toString = function () {
        return this.join(" ");
    };

    var classListFactory = function () {
        return new ClassListObject(this);
    };

    var classListPropertyDescriptor = { get: classListFactory, enumerable: true, configurable: true };
    Object.defineProperty(self.HTMLElement["prototype"], "classList", classListPropertyDescriptor);
}/// <reference path="plugin.host.common.d.ts" />
var CoreImpl = (function () {
    function CoreImpl() {
        var _this = this;
        window.__hostMessageReceived = function (message) {
            if (_this.messageReceived)
                _this.messageReceived(message);
        };
    }
    CoreImpl.prototype.hostDescription = function () {
        return window.external.getHostDescription();
    };
    CoreImpl.prototype.postMessage = function (message) {
        window.external.postMessage(message);
    };
    return CoreImpl;
}());
registerModule("plugin.host.core", function () { return new CoreImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var DiagnosticsImpl = (function () {
    function DiagnosticsImpl() {
    }
    DiagnosticsImpl.prototype.reportError = function (message, url, lineNumber, additionalInfo, columnNumber) {
        return window.external.reportError(message, url, lineNumber, additionalInfo, columnNumber);
    };
    DiagnosticsImpl.prototype.terminate = function () {
        window.external.terminate();
    };
    return DiagnosticsImpl;
}());
registerModule("plugin.host.diagnostics", function () { return new DiagnosticsImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var OutputImpl = (function () {
    function OutputImpl() {
        this.outputObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Output");
    }
    OutputImpl.prototype.log = function (message) {
        this.outputObject._post("log", message);
    };
    return OutputImpl;
}());
registerModule("plugin.host.output", function () { return new OutputImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var ResourcesImpl = (function () {
    function ResourcesImpl() {
        this.resourcesObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Resources");
        this.addEventListener = this.resourcesObject.addEventListener.bind(this.resourcesObject);
        this.removeEventListener = this.resourcesObject.removeEventListener.bind(this.resourcesObject);
    }
    ResourcesImpl.prototype.loadResources = function (resourceAlias) {
        return this.resourcesObject._call("loadResources", resourceAlias);
    };
    return ResourcesImpl;
}());
registerModule("plugin.host.resources", function () { return new ResourcesImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var StorageImpl = (function () {
    function StorageImpl() {
        this.storageObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Storage");
    }
    StorageImpl.prototype.closeFile = function (streamId) {
        return this.storageObject._call("close", streamId);
    };
    StorageImpl.prototype.fileDialog = function (mode, dialogOptions, fileOptions) {
        return this.storageObject._call("fileDialog", mode, dialogOptions, fileOptions);
    };
    StorageImpl.prototype.getFileList = function (path, persistence, index, count) {
        persistence = (persistence === null || typeof persistence === "undefined") ? Microsoft.Plugin.Storage.FilePersistence.temporary : persistence;
        index = index || 0;
        count = count || 0;
        return this.storageObject._call("getFileList", path, persistence, index, count);
    };
    StorageImpl.prototype.openFile = function (path, options) {
        return this.storageObject._call("openFile", path, options);
    };
    StorageImpl.prototype.read = function (streamId, count, type) {
        switch (type) {
            case Microsoft.Plugin.Storage.FileType.binary:
                return this.storageObject._call("readBinary", streamId, count);
            case Microsoft.Plugin.Storage.FileType.text:
                return this.storageObject._call("readText", streamId, count);
            default:
                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.7004"));
        }
    };
    StorageImpl.prototype.seek = function (streamId, offset, origin) {
        return this.storageObject._call("seek", streamId, offset, origin);
    };
    StorageImpl.prototype.write = function (streamId, data, offset, count, type) {
        switch (type) {
            case Microsoft.Plugin.Storage.FileType.binary:
                return this.storageObject._call("writeBinary", streamId, data, offset, count);
            case Microsoft.Plugin.Storage.FileType.text:
                return this.storageObject._call("writeText", streamId, data, offset, count);
            default:
                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.7004"));
        }
    };
    return StorageImpl;
}());
registerModule("plugin.host.storage", function () { return new StorageImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var ThemeImpl = (function () {
    function ThemeImpl() {
        this.themeObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Theme");
    }
    ThemeImpl.prototype.addEventListener = function (name, callback) {
        this.themeObject.addEventListener(name, callback);
    };
    ThemeImpl.prototype.fireThemeReady = function () {
        this.themeObject._post("fireThemeReady");
    };
    ThemeImpl.prototype.getCssFile = function (name, requirePluginRelativeLocation) {
        return this.themeObject._call("getCssFile", name, requirePluginRelativeLocation);
    };
    return ThemeImpl;
}());
registerModule("plugin.host.theme", function () { return new ThemeImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var CodeMarkersImpl = (function () {
    function CodeMarkersImpl() {
        this.codeMarkerObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.VS.Internal.CodeMarkers", {}, true);
    }
    CodeMarkersImpl.prototype.fireCodeMarker = function (marker) {
        // Fire the code maker immediately in the sandbox process.
        window.external.fireCodeMarker(marker);
        // Schedule the code marker to fire in the Visual Studio host process.
        this.codeMarkerObject._post("fireVSCodeMarker", marker);
    };
    return CodeMarkersImpl;
}());
registerModule("plugin.host.codemarkers", function () { return new CodeMarkersImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var CommandsImpl = (function () {
    function CommandsImpl() {
        this.commandsObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.VS.Commands");
    }
    CommandsImpl.prototype.showContextMenu = function (menuName, xPosition, yPosition) {
        return this.commandsObject._call("showContextMenu", menuName, xPosition, yPosition);
    };
    CommandsImpl.prototype.setCommandsStates = function (states) {
        return this.commandsObject._call("setCommandsStates", states);
    };
    CommandsImpl.prototype.addEventListener = function (eventType, listener) {
        this.commandsObject.addEventListener(eventType, listener);
    };
    return CommandsImpl;
}());
registerModule("plugin.host.commands", function () { return new CommandsImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var CultureImpl = (function () {
    function CultureImpl() {
        this.cultureObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Culture");
    }
    CultureImpl.prototype.addEventListener = function (eventType, listener) {
        this.cultureObject.addEventListener(eventType, listener);
    };
    return CultureImpl;
}());
registerModule("plugin.host.culture", function () { return new CultureImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var TooltipImpl = (function () {
    function TooltipImpl() {
        this.tooltipObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Tooltip");
    }
    TooltipImpl.prototype.canCreatePopup = function () {
        return true;
    };
    TooltipImpl.prototype.getScreenSizeForXY = function (screenX, screenY) {
        var JSONBounds = window.external.getScreenBounds(screenX, screenY);
        if (typeof JSONBounds != 'undefined') {
            return JSON.parse(JSONBounds);
        }
        else {
            return null;
        }
    };
    TooltipImpl.prototype.hostContentInPopup = function (popupDisplayParameters) {
        this.tooltipObject._post("hostContentInPopup", popupDisplayParameters);
    };
    TooltipImpl.prototype.dismissPopup = function () {
        this.tooltipObject._post("dismissPopup");
    };
    TooltipImpl.prototype.getDblClickTime = function () {
        return window.external.getDblClickTime();
    };
    return TooltipImpl;
}());
registerModule("plugin.host.tooltip", function () { return new TooltipImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var SettingsImpl = (function () {
    function SettingsImpl() {
        this.settingsObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Settings");
    }
    SettingsImpl.prototype.get = function (collection, requestedProperties) {
        return this.settingsObject._call("get", collection, requestedProperties);
    };
    SettingsImpl.prototype.set = function (collection, toSet) {
        this.settingsObject._post("set", collection, toSet);
    };
    return SettingsImpl;
}());
registerModule("plugin.host.settings", function () { return new SettingsImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var ActivityLogImpl = (function () {
    function ActivityLogImpl() {
        this.proxy = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.VS.ActivityLog", {}, true);
    }
    ActivityLogImpl.prototype.logEntry = function (entryType, message) {
        this.proxy._post("logEntry", entryType, message);
    };
    return ActivityLogImpl;
}());
registerModule("plugin.host.activitylog", function () { return new ActivityLogImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var ContextMenuImpl = (function () {
    function ContextMenuImpl() {
        this.contextMenuObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.ContextMenu");
    }
    ContextMenuImpl.prototype.addEventListener = function (name, callback) {
        this.contextMenuObject.addEventListener(name, callback);
    };
    ContextMenuImpl.prototype.adjustShowCoordinates = function (coordinates) {
        // If the host supports document.selection and the mouse coordinates are (0,0) 
        // try to position the context menu at the caret coordinates.
        var selection = document.selection;
        if (selection && selection.createRange !== undefined && coordinates.X === 0 && coordinates.Y === 0) {
            if (selection) {
                var xScaleFactor = screen.deviceXDPI / screen.logicalXDPI;
                var yScaleFactor = screen.deviceYDPI / screen.logicalYDPI;
                var range = selection.createRange();
                var height = range.boundingHeight;
                range.collapse(true);
                // We are dividing by the scale factor here because our caller expects unscaled coordinates, and will themselves later
                // scale them to account for high-DPI. The coordinates returned by the range object are already scaled, so if we don't
                // unscale them we end up scaling them later and ending up having them double scaled, and the popup ends up closer to 
                // the right edge and bottom edge of the screen than we want, comically so at high DPI (like 200%+).
                coordinates.X = range.boundingLeft / xScaleFactor;
                coordinates.Y = (range.boundingTop + height) / yScaleFactor;
            }
        }
        return coordinates;
    };
    ContextMenuImpl.prototype.callback = function (id) {
        return this.contextMenuObject._call("callback", id);
    };
    ContextMenuImpl.prototype.canCreatePopup = function () {
        return true;
    };
    ContextMenuImpl.prototype.disableZoom = function () {
        Microsoft.Plugin.VS.Keyboard.setZoomState(false);
    };
    ContextMenuImpl.prototype.dismiss = function () {
        return this.contextMenuObject._call("dismissAll");
    };
    ContextMenuImpl.prototype.dismissCurrent = function (ignoreDismissForRoot) {
        return this.contextMenuObject._call("dismissCurrent", ignoreDismissForRoot);
    };
    ContextMenuImpl.prototype.dismissSubmenus = function (currentCoordinates) {
        return this.contextMenuObject._call("dismissSubmenus", currentCoordinates);
    };
    ContextMenuImpl.prototype.fireContentReady = function () {
        return this.contextMenuObject._call("contentready");
    };
    ContextMenuImpl.prototype.show = function (menuId, ariaLabel, contextMenus, positionInfo) {
        return this.contextMenuObject._call("show", menuId, ariaLabel, contextMenus.innerHTML, positionInfo);
    };
    return ContextMenuImpl;
}());
registerModule("plugin.host.contextmenu", function () { return new ContextMenuImpl(); });
/// <reference path="plugin.host.common.d.ts" />
var HostImpl = (function () {
    function HostImpl(external) {
        this.external = external;
        this.hostObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.Host", {}, true);
        this.version = this.getVersion();
    }
    HostImpl.prototype.showDocument = function (documentPath, line, col) {
        return this.hostObject._call("showDocument", documentPath, line, col);
    };
    HostImpl.prototype.getDocumentLocation = function (documentPath) {
        return this.hostObject._call("getDocumentLocation", documentPath);
    };
    HostImpl.prototype.supportsAllowSetForeground = function () {
        return true;
    };
    HostImpl.prototype.allowSetForeground = function (processId) {
        if (this.external) {
            return this.external.allowSetForeground(processId);
        }
        return false;
    };
    HostImpl.prototype.getVersion = function () {
        if (typeof this.external === "undefined" || typeof this.external.getVersion === "undefined") {
            // Usually VS host will have window.external and window.external.getVersion defined. But in unit test the external is mocked.
            // Just return a default version number for unit test here.
            return {
                major: 0,
                minor: 0,
                build: 0,
                revision: 0
            };
        }
        var versionInfo = this.external.getVersion();
        var versionInfoArr = versionInfo.split(" ", 1);
        var versionStr = versionInfoArr[0];
        var versionStrArr = versionStr.split(".");
        return {
            major: parseInt(versionStrArr[0]),
            minor: parseInt(versionStrArr[1]),
            build: parseInt(versionStrArr[2]),
            revision: parseInt(versionStrArr[3])
        };
    };
    return HostImpl;
}());
registerModule("plugin.host", function () { return new HostImpl(window.external); });
/// <reference path="plugin.host.common.d.ts" />
var PerfAnalyticsImpl = (function () {
    function PerfAnalyticsImpl(external) {
        this.external = external;
        this.initialized = false;
        this.providerGuid = null;
        this.eventInfoMap = {};
    }
    PerfAnalyticsImpl.prototype.raiseEvent = function (id, data) {
        if (!this.initialized) {
            this.intializePerfAnalyticsInfo();
        }
        var eventInfo = this.eventInfoMap[id];
        if (typeof eventInfo === 'undefined') {
            throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.7008"));
        }
        else {
            this.external.raiseEvent(this.providerGuid, eventInfo.id, eventInfo.version, eventInfo.channel, eventInfo.level, eventInfo.opcode, eventInfo.task, eventInfo.keyword, data);
        }
    };
    PerfAnalyticsImpl.prototype.intializePerfAnalyticsInfo = function () {
        var initializationInfo = JSON.parse(this.external.getPerfAnalyticsInitInfo());
        this.providerGuid = initializationInfo.Provider;
        for (var propName in initializationInfo) {
            if (propName === "Provider" || !initializationInfo.hasOwnProperty(propName)) {
                continue;
            }
            var eventInfo = initializationInfo[propName];
            this.eventInfoMap[eventInfo.id] = eventInfo;
        }
        this.initialized = true;
    };
    return PerfAnalyticsImpl;
}());
registerModule("plugin.host.perfanalytics", function () { return new PerfAnalyticsImpl(window.external); });
/// <reference path="plugin.host.common.d.ts" />
var TelemetryAnalyticsImpl = (function () {
    function TelemetryAnalyticsImpl() {
        this.telemetryObject = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Plugin.TelemetryAnalytics");
    }
    TelemetryAnalyticsImpl.prototype.postSimpleEvent = function (eventName) {
        this.telemetryObject._post("postSimpleEvent", eventName);
    };
    TelemetryAnalyticsImpl.prototype.postEvent = function (eventName, keys, values) {
        this.telemetryObject._post("postEvent", eventName, keys, values);
    };
    return TelemetryAnalyticsImpl;
}());
registerModule("plugin.host.telemetryanalytics", function () { return new TelemetryAnalyticsImpl(); });
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        "use strict";
        var host = loadModule("plugin.host.core");
        /// <var>
        /// Commands used for control messages.
        ///
        /// Note: This data structure directs serialization/deserialization of messages; it needs to stay in-sync
        ///       with its counterpart in ScriptedHostCommunicationManager.cs.
        /// </var>
        var controlCommands;
        (function (controlCommands) {
            /// <field>
            /// Default value for a command. Used as a place holder for messages with no control commands.
            /// </field>
            controlCommands[controlCommands["none"] = 0] = "none";
            /// <field>
            /// Informs the host that a new port was created.
            /// </field>
            controlCommands[controlCommands["portCreated"] = 1] = "portCreated";
            /// <field>
            /// Informs the host that an existing port was closed.
            /// </field>
            controlCommands[controlCommands["portClosed"] = 2] = "portClosed";
            /// <field>
            /// Informs the plug-in that a port has been connected.
            /// </field>
            controlCommands[controlCommands["portConnected"] = 3] = "portConnected";
            /// <field>
            /// Informs the host that the plug-in is initialized and is ready to receive messages.
            /// </field>
            controlCommands[controlCommands["controlInitialized"] = 4] = "controlInitialized";
            /// <field>
            /// Informs the plug-in that the host has initialized its state and that ControlReady event should be fired.
            /// </field>
            controlCommands[controlCommands["hostReady"] = 5] = "hostReady";
            /// <field>
            /// Instructs the script that an event is fired.
            /// </field>
            controlCommands[controlCommands["event"] = 6] = "event";
            /// <field>
            /// An error occurred as a result of a previous message. This command should only occur
            /// in replies.
            /// </field>
            controlCommands[controlCommands["error"] = 7] = "error";
            /// <field>
            /// Informs the plug-in that the shutdown sequence has started and that the close event should be fired.
            /// </field>
            controlCommands[controlCommands["initiateShutdown"] = 8] = "initiateShutdown";
            /// <field>
            /// Informs the host that the plug-in has completed its shutdown logic and is ready to be terminated.
            /// </field>
            controlCommands[controlCommands["shutdownComplete"] = 9] = "shutdownComplete";
        })(controlCommands || (controlCommands = {}));
        ;
        var Utilities;
        (function (Utilities) {
            var EventImpl = (function () {
                function EventImpl(type, additionalProperties, target) {
                    this.type = type;
                    this.timeStamp = Date.now();
                    this.target = target;
                    // Copy additional properties
                    var eventObject = this;
                    if (additionalProperties && typeof additionalProperties === "object") {
                        Object.getOwnPropertyNames(additionalProperties).forEach(function (name) {
                            var pd = Object.getOwnPropertyDescriptor(additionalProperties, name);
                            Object.defineProperty(eventObject, name, pd);
                        });
                    }
                }
                Object.defineProperty(EventImpl.prototype, "bubbles", {
                    get: function () { return false; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "cancelable", {
                    get: function () { return false; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "currentTarget", {
                    get: function () { return this.target; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "defaultPrevented", {
                    get: function () { return !!this._preventDefaultsCalled; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "trusted", {
                    get: function () { return false; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "isTrusted", {
                    get: function () { return false; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "returnValue", {
                    get: function () { return false; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "CAPTURING_PHASE", {
                    get: function () { return EventImpl.CAPTURING_PHASE; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "AT_TARGET", {
                    get: function () { return EventImpl.AT_TARGET; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EventImpl.prototype, "BUBBLING_PHASE", {
                    get: function () { return EventImpl.BUBBLING_PHASE; },
                    enumerable: true,
                    configurable: true
                });
                EventImpl.prototype.preventDefault = function () {
                    this._preventDefaultsCalled = true;
                };
                EventImpl.prototype.stopImmediatePropagation = function () {
                    this._stopImmediatePropagationCalled = true;
                };
                EventImpl.prototype.stopPropagation = function () { };
                EventImpl.prototype.initEvent = function (eventTypeArg, canBubbleArg, cancelableArg) { };
                EventImpl.supportForProcessing = false;
                EventImpl.NONE = 0;
                EventImpl.CAPTURING_PHASE = 1;
                EventImpl.AT_TARGET = 2;
                EventImpl.BUBBLING_PHASE = 3;
                return EventImpl;
            }());
            EventImpl.prototype.eventPhase = 0;
            EventImpl.prototype.detail = null;
            var EventManager = (function () {
                function EventManager() {
                }
                EventManager.prototype.addEventListener = function (type, listener) {
                    /// <summary>
                    /// Adds an event listener.
                    /// </summary>
                    /// <param name="type" type="String">The type (name) of the event.</param>
                    /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                    this.listeners = this.listeners || {};
                    var eventListeners = (this.listeners[type] = this.listeners[type] || []);
                    for (var i = 0, len = eventListeners.length; i < len; i++) {
                        var l = eventListeners[i];
                        if (l.listener === listener) {
                            return;
                        }
                    }
                    eventListeners.push({ listener: listener });
                };
                EventManager.prototype.dispatchEvent = function (type, eventArg) {
                    /// <summary>
                    /// Raises an event of the specified type and with the specified additional properties.
                    /// </summary>
                    /// <param name="type" type="String">The type (name) of the event.</param>
                    /// <param name="eventArg" type="Object">The set of additional properties to be attached to the event object when the event is raised.</param>
                    /// <returns type="Boolean">true if preventDefault was called on the event.</returns>
                    var listeners = this.listeners && this.listeners[type];
                    var oneventAttribute = this.target && this.target["on" + type];
                    if (listeners || typeof oneventAttribute === "function") {
                        var eventValue = new EventImpl(type, eventArg, this.target);
                        if (listeners) {
                            // Need to copy the array to protect against people un-registering while we are dispatching
                            listeners = listeners.slice(0, listeners.length);
                            for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++) {
                                listeners[i].listener(eventValue);
                            }
                        }
                        if (typeof oneventAttribute === "function") {
                            oneventAttribute(eventValue);
                        }
                        return eventValue.defaultPrevented || false;
                    }
                    return false;
                };
                EventManager.prototype.removeEventListener = function (type, listener) {
                    /// <summary>
                    /// Removes an event listener.
                    /// </summary>
                    /// <param name="type" type="String">The type (name) of the event.</param>
                    /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                    var listeners = this.listeners && this.listeners[type];
                    if (listeners) {
                        for (var i = 0, len = listeners.length; i < len; i++) {
                            var l = listeners[i];
                            if (l.listener === listener) {
                                listeners.splice(i, 1);
                                if (listeners.length === 0) {
                                    delete this.listeners[type];
                                }
                                // Only want to remove one element for each call to removeEventListener
                                break;
                            }
                        }
                    }
                };
                EventManager.prototype.setTarget = function (value) {
                    this.target = value;
                };
                return EventManager;
            }());
            Utilities.EventManager = EventManager;
            function marshalHostError(hostErrorObject) {
                var error = new Error(hostErrorObject.message + "\r\n" + hostErrorObject.stack);
                error.innerError = hostErrorObject.innerError;
                error.source = hostErrorObject.source;
                error.helpLink = hostErrorObject.helpLink;
                return error;
            }
            Utilities.marshalHostError = marshalHostError;
            function formatString(message, optionalParams) {
                var currentParameterIndex = 0;
                var currentSubstringIndex = 0;
                var result = "";
                // Force the message to a string
                message = "" + message;
                while (currentSubstringIndex < message.length) {
                    var replacementIndex = message.indexOf("%", currentSubstringIndex);
                    // Add the previous message portion
                    if (replacementIndex === -1 || replacementIndex === message.length - 1) {
                        result += message.substring(currentSubstringIndex);
                        currentSubstringIndex = message.length;
                    }
                    else {
                        result += message.substring(currentSubstringIndex, replacementIndex);
                        currentSubstringIndex = replacementIndex + 1;
                        var argumentValue = optionalParams[currentParameterIndex];
                        switch (message[currentSubstringIndex]) {
                            case "d":
                            case "i":
                                // Truncate numbers instead of parseInt, which doesn't work right for large numbers.
                                if (typeof argumentValue !== "undefined") {
                                    if (typeof argumentValue === "number") {
                                        argumentValue = argumentValue >= 0 ? Math.floor(argumentValue) : Math.ceil(argumentValue);
                                    }
                                    else {
                                        argumentValue = parseInt(argumentValue);
                                    }
                                    // Use 0 for out of range numbers
                                    if (argumentValue !== ~~argumentValue) {
                                        argumentValue = 0;
                                    }
                                }
                                result += argumentValue;
                                currentParameterIndex++;
                                currentSubstringIndex++;
                                break;
                            case "f":
                                if (argumentValue === null) {
                                    argumentValue = 0;
                                }
                                else if (typeof argumentValue !== "undefined") {
                                    argumentValue = parseFloat(argumentValue);
                                }
                                result += argumentValue;
                                currentParameterIndex++;
                                currentSubstringIndex++;
                                break;
                            case "s":
                            case "o":
                                if (typeof argumentValue !== "undefined") {
                                    argumentValue = "" + argumentValue;
                                }
                                result += argumentValue;
                                currentParameterIndex++;
                                currentSubstringIndex++;
                                break;
                            case "%":
                                // Escape for %
                                result += "%";
                                currentSubstringIndex++;
                                break;
                            default:
                                // An invalid escape sequence, ignore only one character
                                result += "%";
                                break;
                        }
                    }
                }
                // Append any remaining parameters
                for (var i = currentParameterIndex; i < optionalParams.length; i++) {
                    result += optionalParams[i];
                }
                return result;
            }
            Utilities.formatString = formatString;
        })(Utilities = Plugin.Utilities || (Plugin.Utilities = {}));
        var Utilities;
        (function (Utilities) {
        })(Utilities = Plugin.Utilities || (Plugin.Utilities = {}));
        /// <var>
        /// The default port. Represents the private communication channel between the Communication
        /// manager and its counterpart on the control side. this port is used for control commands
        /// exchange between the host and the control.
        ///
        /// Note: This is used in serialization/deserialization of messages; it needs to stay in-sync
        ///       with its counterpart in ScriptedHostCommunicationManager.js.
        /// </var>
        var defaultPort = 0;
        /// <var>
        /// Delimiter character used to separate the Scripted Host control header from the user message contents.
        /// Scripted Host headers should not include this character.
        ///
        /// Note: This data structure directs serialization/deserialization of messages; it needs to stay in-sync
        ///       with its counterpart in ScriptedHostCommunicationManager.js.
        /// </var>
        var headerDelimiter = "$";
        /// <var>
        /// The id of the last message sent from the control
        /// </var>
        var lastMessageId = 0;
        /// <var>
        /// List of messages awaiting replies
        /// </var>
        var awaitingResultList = [];
        /// <var>
        /// Event manager
        /// </var>
        var globalEventManager = new Utilities.EventManager();
        var logger;
        (function (logger) {
            var messages = [];
            var domInitialized = false;
            function logMessageLocally(message) {
                if (!domInitialized) {
                    messages.push(message);
                    return;
                }
                else {
                    var messagesDiv = document.getElementById("pluginMessages");
                    if (messagesDiv) {
                        messagesDiv.innerHTML += "</br>" + message;
                    }
                }
            }
            // If the DOM is ready log messages directly, if not register to
            // receive the DOM load event before logging all messages.
            if (document.body) {
                domInitialized = true;
            }
            else {
                globalEventManager.addEventListener("load", function () {
                    domInitialized = true;
                    if (messages) {
                        for (var i = 0; i < messages.length; i++) {
                            logMessageLocally(messages[i]);
                        }
                        messages = null;
                    }
                    ;
                });
            }
            function log(message) {
                /// <summary>
                /// log a message
                /// </summary>
                /// <param name="message" type="String">The message to be logged</param>
                /// <param name="localOnly" type="Boolean" optional="true">Only use the local logger, and do not send a log message to the host</param>
                logMessageLocally(message);
            }
            logger.log = log;
            function logError(message) {
                /// <summary>
                /// log an error
                /// </summary>
                /// <param name="message" type="String">The message to be logged</param>
                log("Error: " + message);
            }
            logger.logError = logError;
        })(logger || (logger = {}));
        (function (PortState) {
            PortState[PortState["connected"] = 0] = "connected";
            PortState[PortState["disconnected"] = 1] = "disconnected";
            PortState[PortState["closed"] = 2] = "closed";
        })(Plugin.PortState || (Plugin.PortState = {}));
        var PortState = Plugin.PortState;
        var PortImpl = (function () {
            function PortImpl(name) {
                this.name = name;
                this.eventManager = new Utilities.EventManager();
                this.eventManager.setTarget(this);
                this._state = PortState.disconnected;
            }
            Object.defineProperty(PortImpl.prototype, "state", {
                get: function () { return this._state; },
                enumerable: true,
                configurable: true
            });
            PortImpl.prototype.removeEventListener = function (type, listener, useCapture) {
                this.eventManager.removeEventListener(type, listener);
            };
            PortImpl.prototype.addEventListener = function (type, listener, useCapture) {
                this.eventManager.addEventListener(type, listener);
            };
            PortImpl.prototype.dispatchEvent = function (evt) {
                return this.eventManager.dispatchEvent(evt);
            };
            PortImpl.prototype.connect = function () {
                /// <summary>
                /// Start listening on the port
                /// </summary>
                /// <returns type="Boolean"/>
                if (this._state !== PortState.disconnected) {
                    return false;
                }
                // Register with the manager to receive events
                var port = this;
                var cookie = portManager.registerPort(this.name, function onConnect() {
                    if (port._state !== PortState.disconnected) {
                        return;
                    }
                    // Mark the state
                    port._state = PortState.connected;
                    // Fire the event
                    var eventArgs = { port: port };
                    port.eventManager.dispatchEvent("connect", eventArgs);
                }, function onDisconnect() {
                    if (port._state !== PortState.connected) {
                        return;
                    }
                    // Mark the state
                    port._state = PortState.disconnected;
                }, function onMessage(message) {
                    if (port._state !== PortState.connected) {
                        return;
                    }
                    // Fire the message event
                    var eventArgs = { data: message };
                    port.eventManager.dispatchEvent("message", eventArgs);
                });
                // Remember the manager cookie
                this._cookie = cookie;
                return true;
            };
            PortImpl.prototype.postMessage = function (message) {
                /// <summary>
                /// Post a message to the host
                /// </summary>
                /// <param name="message" type="String">Message contents</param>
                if (this._state !== PortState.connected) {
                    return;
                }
                portManager.postMessage(this._cookie, message);
            };
            PortImpl.prototype.sendMessage = function (message) {
                /// <summary>
                /// Sends a message to the host, and returns a promise for the reply
                /// </summary>
                /// <param name="message" type="String">Message contents</param>
                /// <returns type="PluginUtilities.Promise">Promise for the reply for the message</returns>
                if (this._state !== PortState.connected) {
                    return;
                }
                return portManager.sendMessage(this._cookie, message);
            };
            PortImpl.prototype.close = function () {
                /// <summary>
                /// Close the port
                /// </summary>
                if (this._state === PortState.closed) {
                    return;
                }
                // Set the state
                this._state = PortState.closed;
                // Un-register the port
                portManager.unregisterPort(this._cookie);
                // Fire the event
                var eventArgs = {};
                this.eventManager.dispatchEvent("close", eventArgs);
            };
            return PortImpl;
        }());
        var portManager;
        (function (portManager) {
            // List of live ports
            var registeredPorts = {};
            // Lookup lists for faster access
            var portNameLookupList = {};
            var portIdLookupList = {};
            // Last live port cookie
            var lastPortIndex = 1;
            function createPort(name) {
                /// <summary>
                /// Create a new port
                /// </summary>
                /// <param name="name" type="String">Name of the port</param>
                /// <returns type="Port"></returns>
                // Validate port name
                if (typeof name !== "string" || name.length <= 0) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1001"));
                }
                // Do not create two ports with the same name
                if (portNameLookupList[name]) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1002") + "\r\n" + name);
                }
                return new PortImpl(name);
            }
            portManager.createPort = createPort;
            function registerPort(name, onConnect, onDisconnect, onMessage) {
                if (typeof name !== "string" || name.length <= 0) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1001"));
                }
                // Do not create two ports with the same name
                if (portNameLookupList[name]) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1002") + "\r\n" + name);
                }
                // Validate the event handlers
                if (typeof onConnect !== "function") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1003"));
                }
                if (typeof onDisconnect !== "function") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1004"));
                }
                if (typeof onMessage !== "function") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1005"));
                }
                // Assign an index for the port in the list
                var cookie = ++lastPortIndex;
                // Add the port to the list of registered ports
                registeredPorts[cookie] = portNameLookupList[name] = {
                    id: null,
                    name: name,
                    onConnect: onConnect,
                    onDisconnect: onDisconnect,
                    onMessage: onMessage
                };
                // Let the host know about the new port
                postMessageInternal(defaultPort, controlCommands.portCreated, [name]);
                return cookie;
            }
            portManager.registerPort = registerPort;
            function unregisterPort(cookie) {
                var entry = registeredPorts[cookie];
                if (entry) {
                    // Remove the port from the list
                    delete registeredPorts[cookie];
                    // Remove the port from lookup lists
                    if (entry.name) {
                        delete portNameLookupList[entry.name];
                    }
                    if (entry.id) {
                        delete portIdLookupList[entry.id];
                    }
                    // Let the host know that the port is closed
                    postMessageInternal(defaultPort, controlCommands.portClosed, [entry.name]);
                }
            }
            portManager.unregisterPort = unregisterPort;
            function postMessage(cookie, message) {
                if (!registeredPorts[cookie] || registeredPorts[cookie].id === null) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1006"));
                }
                postMessageInternal(registeredPorts[cookie].id, controlCommands.none, null, message);
            }
            portManager.postMessage = postMessage;
            function sendMessage(cookie, message) {
                if (!registeredPorts[cookie] || registeredPorts[cookie].id === null) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.1006"));
                }
                return sendMessageInternal(registeredPorts[cookie].id, controlCommands.none, null, message);
            }
            portManager.sendMessage = sendMessage;
            function processPortConnectedMessage(id, name) {
                var entry = portNameLookupList[name];
                if (entry) {
                    // Found a created port with the same name, entangle the two ports
                    entry.id = id;
                    // Add the port to the id lookup list
                    portIdLookupList[id] = entry;
                    // Fire the connect handler
                    entry.onConnect();
                }
                else {
                    logger.logError("JSPlugin.1010\r\n" + name);
                }
            }
            portManager.processPortConnectedMessage = processPortConnectedMessage;
            function processPortClosedMessage(id) {
                var entry = portIdLookupList[id];
                if (entry) {
                    // Fire the disconnect handler
                    entry.onDisconnect();
                }
                else {
                    logger.logError("JSPlugin.1011\r\n" + id);
                }
            }
            portManager.processPortClosedMessage = processPortClosedMessage;
            function processMessage(id, message) {
                var entry = portIdLookupList[id];
                if (entry) {
                    // Fire the message handler
                    entry.onMessage(message);
                }
                else {
                    logger.logError("JSPlugin.1012\r\n" + id);
                }
            }
            portManager.processMessage = processMessage;
        })(portManager || (portManager = {}));
        function postMessageInternal(portId, command, args, payload, expectResult) {
            /// <summary>
            /// Post an message to the host
            /// </summary>
            /// <param name="portId" type="Number">The port to send the message on</param>
            /// <param name="command" type="controlCommands">The command for the message</param>
            /// <param name="args" type="String" optional="true">The command arguments</param>
            /// <param name="payload" type="String" optional="true">User message contents</param>
            /// <param name="expectResult" type="Boolean" optional="true">Replies are expected if set to true</param>
            if (lastMessageId >= Infinity) {
                lastMessageId = 0;
            }
            // Create the header
            var header = {
                msgId: ++lastMessageId,
                portId: portId,
            };
            // Set the command information
            if (command) {
                header.command = command;
            }
            if (args) {
                header.args = args;
            }
            // Set the replyRequested flag on the message
            if (expectResult) {
                header.replyRequested = true;
            }
            // Serialize the message
            var message = JSON.stringify(header);
            // Attach the user payload
            if (payload) {
                message += headerDelimiter + payload;
            }
            // If results are expected, create a promise to wrap the operation
            var result;
            if (expectResult) {
                // Create the promise to send
                result = new Plugin.Promise(function (complete, error) {
                    awaitingResultList[header.msgId] = {
                        onComplete: complete,
                        onError: error
                    };
                });
            }
            // Post the message
            host.postMessage(message);
            return result;
        }
        function sendMessageInternal(portId, command, args, payload) {
            /// <summary>
            /// Post an message to the host
            /// </summary>
            /// <param name="portId" type="Number">The port to send the message on</param>
            /// <param name="command" type="controlCommands">The command for the message</param>
            /// <param name="args" type="String" optional="true">The command arguments</param>
            /// <param name="payload" type="String" optional="true">User message contents</param>
            /// <returns type="PluginUtilities.Promise"></returns>
            return postMessageInternal(portId, command, args, payload, true);
        }
        function marshalHostError(hostErrorObject) {
            var error = new Error(hostErrorObject.message + "\r\n" + hostErrorObject.stack);
            error.innerError = hostErrorObject.innerError;
            error.source = hostErrorObject.source;
            error.helpLink = hostErrorObject.helpLink;
            return error;
        }
        var InitializationState;
        (function (InitializationState) {
            var isHostReady = false;
            var isDOMLoaded = false;
            function checkAndFirePluginReady() {
                if (isHostReady && isDOMLoaded) {
                    globalEventManager.dispatchEvent("pluginready", {});
                }
            }
            window.addEventListener("DOMContentLoaded", function () {
                isDOMLoaded = true;
                checkAndFirePluginReady();
            });
            function setHostReady() {
                globalEventManager.dispatchEvent("hostready", {});
                isHostReady = true;
                checkAndFirePluginReady();
            }
            InitializationState.setHostReady = setHostReady;
        })(InitializationState || (InitializationState = {}));
        host.messageReceived = function (message) {
            if (typeof message === "string") {
                var separatorIndex = message.indexOf(headerDelimiter);
                // Check if this is a control only message (no payload)
                if (separatorIndex === -1) {
                    separatorIndex = message.length;
                }
                // 'Deserialize' the message
                var headerText = message.substr(0, separatorIndex);
                var header;
                try {
                    header = JSON.parse(headerText);
                }
                catch (e) {
                    logger.logError("JSPlugin.1013");
                }
                var payload = message.substr(separatorIndex + 1);
                var eventArgs;
                var i;
                var port;
                var portList;
                var portListItem;
                if (header.replyId > 0) {
                    var entry = awaitingResultList[header.replyId];
                    if (entry) {
                        // A reply to an earlier message, remove the entry form the list
                        delete awaitingResultList[header.replyId];
                        // Process the entry
                        switch (header.command) {
                            case controlCommands.none:
                                // The message is a reply to an earlier message. Call the promise completed event.
                                entry.onComplete(payload);
                                break;
                            case controlCommands.error:
                                // The message is a reply to an earlier message. Call the promise error event.
                                if (!header.args || !header.args.length) {
                                    logger.logError("JSPlugin.1014");
                                }
                                entry.onError(header.args[0]);
                                break;
                            default:
                                // Unexpected command in the message. Terminate the promise.
                                logger.logError("JSPlugin.1015");
                                // Fire the error event to move the promise in the error state instead of waiting indefinitely
                                entry.onError(new Error(Plugin.Resources.getErrorString("JSPlugin.1015")));
                                break;
                        }
                    }
                    else if (header.command === controlCommands.error) {
                        // Error message sent as a result of a control message. Raise an error event
                        if (header.args && header.args[0]) {
                            throw marshalHostError(header.args[0]);
                        }
                        else {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.1007"));
                        }
                    }
                }
                else if (header.portId > defaultPort && header.command === controlCommands.none) {
                    // A user message, Pass it to the port
                    portManager.processMessage(header.portId, payload);
                }
                else {
                    // A control message received
                    switch (header.command) {
                        case controlCommands.hostReady:
                            // Fire the ready event
                            InitializationState.setHostReady();
                            break;
                        case controlCommands.portClosed:
                            if (!header.args || !header.args.length) {
                                logger.logError("JSPlugin.1016");
                            }
                            var closedPortId = header.args[0];
                            if (typeof closedPortId !== "number") {
                                logger.logError("JSPlugin.1016");
                                return;
                            }
                            portManager.processPortClosedMessage(closedPortId);
                            break;
                        case controlCommands.portConnected:
                            if (!header.args || !header.args.length) {
                                logger.logError("JSPlugin.1017");
                            }
                            var connectedPortId = header.args[0];
                            var connectedPortName = header.args[1];
                            if (typeof connectedPortId !== "number" || typeof connectedPortName !== "string") {
                                logger.logError("JSPlugin.1017");
                                return;
                            }
                            portManager.processPortConnectedMessage(connectedPortId, connectedPortName);
                            break;
                        case controlCommands.event:
                            if (!header.args || !header.args.length) {
                                logger.logError("JSPlugin.1018");
                            }
                            var eventName = header.args[0];
                            eventArgs = header.args[1];
                            if (typeof eventName !== "string") {
                                logger.logError("JSPlugin.1018");
                            }
                            // Fire the event
                            globalEventManager.dispatchEvent(eventName, eventArgs);
                            break;
                        case controlCommands.initiateShutdown:
                            // Fire the close event
                            globalEventManager.dispatchEvent("close", eventArgs);
                            // Let the host know that the process has completed.
                            postMessageInternal(defaultPort, controlCommands.shutdownComplete);
                            break;
                        default:
                            var error;
                            if (header.args && header.args.length) {
                                error = marshalHostError(header.args[0]);
                            }
                            else {
                                error = new Error(Plugin.Resources.getErrorString("JSPlugin.1007"));
                            }
                            throw error;
                    }
                }
            }
        };
        function attachToPublishedObject(name, objectDefinition, messageHandler, closeHandler, createOnFirstUse) {
            /// <param name="name" type="String">Name of the object to attach to</param>
            /// <param name="objectDefinitions" type="Object">Definitions of the marshaler</param>
            /// <param name="messageHandler" type="Function">Handle to the messages received</param>
            /// <param name="closeHandler" type="Function">Handle to the close event on the port</param>
            /// <param name="createOnFirstUse" type="Boolean" optional="true">Connect the port on the first message sent</param>
            /// <returns type="Object">A proxy of the published object</returns>
            if (typeof name !== "string") {
                throw new Error(Plugin.Resources.getErrorString("JSPlugin.1008"));
            }
            if (typeof messageHandler !== "function") {
                throw new Error(Plugin.Resources.getErrorString("JSPlugin.1009"));
            }
            var interfacePortName = name;
            var interfaceObject = objectDefinition || {};
            var pendingMessages = [];
            var portConnectInitiated = false;
            // Force the port to be connected. This will trigger the creation of the object on the host side
            interfaceObject._forceConnect = function () {
                if (!portConnectInitiated) {
                    // Start listening on the port
                    port.connect();
                    portConnectInitiated = true;
                }
            };
            // Define the _postMessage function stub to collect calls and process them later
            interfaceObject._postMessage = function (message) {
                /// <param name="message" type="String">Message contents</param>
                // Store the message until the port is created
                pendingMessages.push({
                    message: message,
                });
                // If this the first time to use this method, force connect
                interfaceObject._forceConnect();
            };
            // Define the _sendMessage function stub to collect calls and process them later
            interfaceObject._sendMessage = function (message) {
                /// <param name="message" type="String">Message contents</param>
                /// <returns type="PluginUtilities.Promise">Promise for the reply of this message</returns>
                // Create a promise for _postMessage eventually sending the message, once the port is created
                var result = new Plugin.Promise(function (complete, error) {
                    // Store the message until the port is created
                    pendingMessages.push({
                        message: message,
                        onComplete: complete,
                        onError: error
                    });
                });
                // If this the first time to use this method, force connect
                interfaceObject._forceConnect();
                return result;
            };
            var port = portManager.createPort(interfacePortName);
            port.addEventListener("connect", function onConnect(e) {
                // Remove the listener
                port.removeEventListener("connect", onConnect);
                // Listen on the port message event
                port.addEventListener("message", function (eventArg) {
                    var serializedMessage = eventArg.data;
                    messageHandler(serializedMessage);
                });
                // Listen on the close event
                if (typeof closeHandler === "function") {
                    port.addEventListener("close", closeHandler);
                }
                // Now that the port is created, define the full _postMethod implementation
                interfaceObject._postMessage = function (message) {
                    /// <param name="message" type="String">Message contents</param>
                    return port.postMessage(message);
                };
                // Now that the port is created, define the full _postMethod implementation
                interfaceObject._sendMessage = function (message) {
                    /// <param name="message" type="String">Message contents</param>
                    /// <returns type="PluginUtilities.Promise">Promise for the reply of this message</returns>
                    return port.sendMessage(message);
                };
                // Flush the queue of any pending messages
                pendingMessages.forEach(function (m) {
                    if (m.onComplete) {
                        // Send message pending. We have already returned a promise for this message, so send the message, get a new promise, when it is done, complete the original promise
                        port.sendMessage(m.message)
                            .done(function (callbackMessage) {
                            m.onComplete(callbackMessage);
                        }, function (error) {
                            m.onError(error);
                        });
                    }
                    else {
                        // Post message pending
                        port.postMessage(m.message);
                    }
                });
                pendingMessages = null;
            });
            if (!createOnFirstUse) {
                // Start listening on the port
                interfaceObject._forceConnect();
            }
            return interfaceObject;
        }
        Plugin.attachToPublishedObject = attachToPublishedObject;
        function _logError(message) {
            logger.logError(message);
        }
        Plugin._logError = _logError;
        function addEventListener(type, listener) {
            /// <summary>
            /// Adds a plugin event listener.
            /// </summary>
            /// <param name="type" type="String">The type (name) of the event.</param>
            /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
            globalEventManager.addEventListener(type, listener);
        }
        Plugin.addEventListener = addEventListener;
        function removeEventListener(type, listener) {
            /// <summary>
            /// Removes an event listener.
            /// </summary>
            /// <param name="type" type="String">The type (name) of the event.</param>
            /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
            globalEventManager.removeEventListener(type, listener);
        }
        Plugin.removeEventListener = removeEventListener;
        function createPort(name) {
            /// <summary>
            /// Create a new port
            /// </summary>
            /// <param name="name" type="String">Name of the port</param>
            /// <returns type="Port"></returns>
            return portManager.createPort(name);
        }
        Plugin.createPort = createPort;
        // Set the Plugin as the target of all global events
        globalEventManager.setTarget(Plugin);
        // Register to receive the window load event
        window.addEventListener("load", function () {
            globalEventManager.dispatchEvent("load", {});
        });
        // Turn off text selection for all elements except for input and 'textarea'
        globalEventManager.addEventListener("load", function () {
            //var elements = <HTMLElement[]>document.getElementsByTagName("*");
            var elements = document.getElementsByTagName("*");
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].nodeName === "INPUT" || elements[i].nodeName === "TEXTAREA") {
                    elements[i].className += " selectElement";
                }
                else {
                    elements[i].className += " selectNone";
                }
            }
        });
        // Disable the context menu supplied by IE
        document.oncontextmenu = function () {
            return false;
        };
        // Disable drag/drop behavior
        document.ondragstart = function () {
            return false;
        };
        // Notify the host that the control is initialized
        postMessageInternal(defaultPort, controlCommands.controlInitialized);
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="core.ts" />
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Utilities;
        (function (Utilities) {
            var JSONMarshaler;
            (function (JSONMarshaler) {
                "use strict";
                function attachToPublishedObject(name, objectDefinition, createOnFirstUse) {
                    /// <param name="name" type="String">Name of the published object</param>
                    /// <param name="objectDefinition" type="Object">Marshaler definitions</param>
                    /// <param name="createOnFirstUse" type="Boolean" optional="true">Connect the port on the first message sent</param>
                    // Create an event manager for this object
                    var eventManager = new Plugin.Utilities.EventManager();
                    // Attach to the object
                    var interfaceObject = Plugin.attachToPublishedObject(name, objectDefinition, function onMessage(serializedMessage) {
                        if (typeof serializedMessage === "string") {
                            // Handle events
                            var message = JSON.parse(serializedMessage);
                            if (typeof message.eventName === "string") {
                                // Fire the event
                                eventManager.dispatchEvent(message.eventName, message.arg);
                            }
                            else {
                                Plugin._logError("JSPlugin.2000");
                            }
                        }
                        else {
                            Plugin._logError("JSPlugin.2001");
                        }
                    }, function onClose(error) {
                        Plugin._logError("JSPlugin.2002\r\n" + name);
                    }, createOnFirstUse);
                    // Set the new interface object as a target for all dispatched events
                    eventManager.setTarget(interfaceObject);
                    // Define the _post implementation
                    interfaceObject._post = function (name) {
                        /// <summary>
                        /// Call a method on an object exposed using JsonPortMarshaler
                        /// </summary>
                        /// <param name="name" type="String">Name of the method</param>
                        /// <param name="..." optional="true">Arguments of the call</param>
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        var message = {
                            method: name,
                            args: args.length ? args : undefined
                        };
                        // Post the message
                        this._postMessage(JSON.stringify(message));
                    };
                    // Define the _call implementation
                    interfaceObject._call = function (name) {
                        /// <summary>
                        /// Call a method on an object exposed using JsonPortMarshaler
                        /// </summary>
                        /// <param name="name" type="String">Name of the method</param>
                        /// <param name="..." optional="true">Arguments of the call</param>
                        /// <returns type="Plugin.Promise">Promise for the call result</returns>
                        var message = {
                            method: name,
                            args: arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined
                        };
                        // Send the message
                        var result = this._sendMessage(JSON.stringify(message));
                        if (!result) {
                            Plugin._logError("JSPlugin.1000");
                        }
                        return result.then(function (responseText) {
                            var response = JSON.parse(responseText);
                            return response.result;
                        });
                    };
                    // Expose the EventManager methods
                    if (createOnFirstUse) {
                        interfaceObject.addEventListener = function (type, listener) {
                            /// <summary>
                            /// Adds an event listener.
                            /// </summary>
                            /// <param name="type" type="String">The type (name) of the event.</param>
                            /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                            // If this is the first use of the interface, force connecting to the host
                            interfaceObject._forceConnect();
                            // We use TS 1.8 which does have it but Daytona partner F12 tools currently compiles this file using TS 1.1 which doesn't have this type definition.
                            // So, to prevent a build break of F12 tools we typecast "listener" object to "any" instead of "EventListenerObject".
                            // We should file a bug against F12 tools to upgrade to TS 1.8 and then we can typecast "listener" to "EventListenerObject".
                            if (listener.handleEvent !== undefined) {
                                eventManager.addEventListener(type, function (e) { return listener.handleEvent(e); });
                            }
                            else {
                                eventManager.addEventListener(type, function (e) { return listener(e); });
                            }
                            // Flip back to the normal behavior
                            interfaceObject.addEventListener = eventManager.addEventListener.bind(eventManager);
                        };
                    }
                    else {
                        interfaceObject.addEventListener = eventManager.addEventListener.bind(eventManager);
                    }
                    interfaceObject.removeEventListener = eventManager.removeEventListener.bind(eventManager);
                    return interfaceObject;
                }
                JSONMarshaler.attachToPublishedObject = attachToPublishedObject;
            })(JSONMarshaler = Utilities.JSONMarshaler || (Utilities.JSONMarshaler = {}));
        })(Utilities = Plugin.Utilities || (Plugin.Utilities = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Diagnostics;
        (function (Diagnostics) {
            "use strict";
            var host = loadModule("plugin.host.diagnostics");
            function onerror(message, uri, lineNumber, columnNumber, error) {
                /// <summary> 
                /// Generates a WER report for the error and terminates the sandbox process
                /// </summary>
                /// <param name="message" type="String">Error message</param>
                /// <param name="uri" type="String">Uri where error was occurred</param>
                /// <param name="lineNumber" type="String">Line number where error occurred</param>
                /// <param name="columnNumber" type="String" optional="true">Column number where error occurred</param>
                /// <param name="error" type="Error" optional="true">Error object that got us here, not available on all versions of IE (thus optional)</param>
                if (error) {
                    message = error;
                }
                reportError(message, uri, lineNumber, [] /*additional info*/, columnNumber);
                terminate();
                return true;
            }
            Diagnostics.onerror = onerror;
            window.onerror = onerror;
            function reportError(error, uri, lineNumber, additionalInfo, columnNumber) {
                /// <signature>
                /// <summary> 
                /// Generates a WER report with the information provided and queues it for submission to Watson server
                /// </summary>
                /// <param name="error" type="String|Error">Error message or Error object</param>
                /// <param name="uri" type="String">Uri where error was occurred</param>
                /// <param name="lineNumber" type="String" optional="true"> Line number where error occurred</param>
                /// <param name="additionalInfo" type="String" optional="true">Any additional information about the error</param>
                /// <param name="columnNumber" type="String" optional="true">Column number where error occurred</param>
                /// <returns type="Number">0 for success, positive value for partial success (able to report only some information), negative value for failure</returns>
                /// </signature>
                var message;
                var lineNumberText;
                var columnNumberText;
                if (error instanceof Error) {
                    message = error.message ? error.message.toString() : null;
                    var originalAdditionalInfo = additionalInfo;
                    if (error && error.number && (typeof error.number === "number")) {
                        // >>>0 is a quick way to ensure number is positive so we have something like 0x80070057 not -0x80070057.
                        additionalInfo = "Error number: 0x" + (error.number >>> 0).toString(16) + "\r\n";
                    }
                    additionalInfo += "Stack: " + error.stack;
                    if (originalAdditionalInfo) {
                        var additionalInfoString = originalAdditionalInfo.toString();
                        if (additionalInfoString && additionalInfoString.length > 0) {
                            additionalInfo += "\r\n\r\nAdditional Info: " + additionalInfoString;
                        }
                    }
                }
                else {
                    message = error ? error.toString() : null;
                    additionalInfo = additionalInfo ? additionalInfo.toString() : null;
                }
                uri = uri ? uri.toString() : null;
                lineNumberText = lineNumber ? lineNumber.toString() : null;
                columnNumberText = columnNumber ? columnNumber.toString() : null;
                return host.reportError(message, uri, lineNumberText, additionalInfo, columnNumberText);
            }
            Diagnostics.reportError = reportError;
            function terminate() {
                /// <summary>Terminates the sandbox process by raising a FailFastException</summary>
                host.terminate();
            }
            Diagnostics.terminate = terminate;
        })(Diagnostics = Plugin.Diagnostics || (Plugin.Diagnostics = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Culture;
        (function (Culture) {
            "use strict";
            var host = loadModule("plugin.host.culture");
            // Private variables 
            Culture.dir = "";
            Culture.lang = "";
            Culture.formatRegion = "";
            Culture.DateTimeFormat = {};
            Culture.NumberFormat = {};
            var domInitialized = false;
            var eventManager = new Plugin.Utilities.EventManager();
            eventManager.setTarget({});
            // Register to receive the culture initialize event
            host.addEventListener("cultureinitialize", function (eventArgs) {
                // If the DOM is ready set the culture attributes, if not
                // register to receive the DOM load event.
                if (!setCultureInfoAndAttributes(eventArgs.language, eventArgs.direction, eventArgs.formatRegion, eventArgs.dateTimeFormat, eventArgs.numberFormat)) {
                    Plugin.addEventListener("load", function () { return setCultureInfoAndAttributes(eventArgs.language, eventArgs.direction, eventArgs.formatRegion, eventArgs.dateTimeFormat, eventArgs.numberFormat); });
                }
            });
            // Register to receive the culture changed event
            host.addEventListener("culturechanged", function (eventArgs) {
                setCultureInfoAndAttributes(eventArgs.language, eventArgs.direction, eventArgs.formatRegion, eventArgs.dateTimeFormat, eventArgs.numberFormat);
                eventManager.dispatchEvent("culturechanged");
            });
            function setCultureInfoAndAttributes(language, direction, _formatRegion, dateTimeFormat, numberFormat) {
                /// <summary>
                /// Set culture information and the lang and dir culture attributes on the html tag
                /// </summary>
                /// <param name="language" type="String">HTML language</param>
                /// <param name="direction" type="String">HTML language direction</param>
                /// <param name="_formatRegion" type="String">The region that formats are based on</param>
                /// <param name="dateTimeFormat" type="Object">Date and time information for the current culture</param>
                /// <param name="numberFormat" type="Object">Number format information for the current culture</param>
                /// <returns type="Boolean">True if the culture attributes are set, false otherwise</returns>
                Culture.lang = language;
                Culture.dir = direction;
                Culture.formatRegion = _formatRegion;
                Culture.DateTimeFormat = dateTimeFormat;
                Culture.NumberFormat = numberFormat;
                // Only set the culture attributes once
                if (!domInitialized) {
                    var htmlTags = document.getElementsByTagName("html");
                    if (htmlTags.length > 0) {
                        domInitialized = true;
                        htmlTags[0].dir = Culture.dir;
                        htmlTags[0].lang = Culture.lang;
                        eventManager.dispatchEvent("cultureinitialize");
                    }
                    else {
                        return false;
                    }
                }
                return true;
            }
            function addEventListener(type, listener) {
                eventManager.addEventListener(type, listener);
            }
            Culture.addEventListener = addEventListener;
            function removeEventListener(type, listener) {
                eventManager.removeEventListener(type, listener);
            }
            Culture.removeEventListener = removeEventListener;
        })(Culture = Plugin.Culture || (Plugin.Culture = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        "use strict";
        var host = loadModule("plugin.host.output");
        function log(message) {
            /// <summary> log message to the host </summary>
            /// <param name='message' type='String' optional='true' />
            /// <param name='optionalParams' type='Object' optional='true'  />
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            host.log(Plugin.Utilities.formatString(message, optionalParams));
        }
        Plugin.log = log;
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Resources;
        (function (Resources) {
            "use strict";
            (function (ResourceType) {
                ResourceType[ResourceType["resx"] = 0] = "resx";
                ResourceType[ResourceType["resjson"] = 1] = "resjson";
                ResourceType[ResourceType["embedded"] = 2] = "embedded";
            })(Resources.ResourceType || (Resources.ResourceType = {}));
            var ResourceType = Resources.ResourceType;
            var host = loadModule("plugin.host.resources");
            // Private variables 
            var defaultAlias = "Resources";
            // Generic error string - replaced by the culture specific error string on initialization
            var error = "An error has occurred.  Please try the operation again.  You can search for the error online: ";
            // JSON resource map that gets set when a resources changed event is fired from the host
            var resourceMap = {};
            // Regular expression used for formatting the string
            // Matches the following: '{{' , '{0}' , '}}'  and un-escaped '{' and '}'.
            var formatRegEx = /\{{2}|\{(\d+)\}|\}{2}|\{|\}/g;
            function processResourceChangeEvent(eventArgs) {
                // Set the 'plugin' generic error string
                if (typeof eventArgs.GenericError !== "string" || eventArgs.GenericError === "") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.3000"));
                }
                error = eventArgs.GenericError;
                // Set the 'plugin' resource map
                var resources = eventArgs.ResourceMap;
                if (!resources) {
                    Plugin._logError("JSPlugin.3001");
                    return;
                }
                resourceMap = resources;
                // Set the default resource alias
                var defaultResource = eventArgs.DefaultAlias;
                if (defaultResource) {
                    defaultAlias = defaultResource;
                }
            }
            // Register to receive the resources initialized event
            host.addEventListener("resourcesinitialized", processResourceChangeEvent);
            // Register to receive the resources change event
            host.addEventListener("resourceschanged", processResourceChangeEvent);
            function format(resourceId, format, args) {
                /// <summary>
                /// Replaces the format item in a specified string with the text equivalent of the value of a corresponding Object instance in a specified array. 
                /// <param name="resourceId" type="String">The resource id of the string given as the format parameter. Used in error reporting.</param>
                /// <param name="format" type="String">A string containing zero or more format items.</param>
                /// <param name="args" type="object" optional="true">An argument array containing zero or more objects to format.</param>
                /// </summary>
                /// <returns type="String">A formatted string</returns>
                return format.replace(formatRegEx, function (match, index) {
                    var replacer;
                    // Process escaped braces, get the replacement argument 
                    // or throw an error for any un-escaped single braces.
                    switch (match) {
                        case "{{":
                            replacer = "{";
                            break;
                        case "}}":
                            replacer = "}";
                            break;
                        case "{":
                        case "}":
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.3002"));
                        default:
                            var argsIndex = parseInt(index);
                            if (args && args.length - 1 >= argsIndex) {
                                replacer = args[argsIndex];
                            }
                            else {
                                throw new Error(Plugin.Resources.getErrorString("JSPlugin.3003") + " (" + resourceId + ")");
                            }
                            break;
                    }
                    // If null or undefined replace with string empty
                    if (typeof replacer === "undefined" || replacer === null) {
                        replacer = "";
                    }
                    // Convert the 'replacer' to type string
                    if (typeof replacer !== "string") {
                        replacer = replacer.toString();
                    }
                    return replacer;
                });
            }
            // Return public functions
            function getString(resourceId) {
                /// <summary>
                /// Retrieves the resource value for a given resource id (or the formatted resource value if arguments are provided)
                /// </summary>
                /// <param name="resourceId" type="String">The resource id</param>
                /// <returns type="String">The resource value (or formatted resource value if arguments are provided)</returns>
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (typeof resourceId !== "string" || resourceId === "") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.3004"));
                }
                var fileName = defaultAlias;
                var key = "";
                var value = "";
                // Resource ids are constructed as follows: /ResourceFileName/Key
                // If the resource file name is omitted the default file name alias is used.
                var idParts = resourceId.split("/");
                switch (idParts.length) {
                    case 1:
                        key = idParts[0];
                        break;
                    case 3:
                        fileName = idParts[1];
                        key = idParts[2];
                        break;
                    default:
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.3004"));
                }
                if (!resourceMap[fileName] || !resourceMap[fileName][key]) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.3005") + " (" + resourceId + ")");
                }
                value = resourceMap[fileName][key];
                // If arguments are provided format the resource value
                // args are the replacement arguments.
                if (args.length > 0) {
                    value = format(resourceId, value, args);
                }
                return value;
            }
            Resources.getString = getString;
            function getErrorString(errorId) {
                /// <summary>
                /// Retrieves a generic error string with the specific error id 
                /// </summary>
                /// <param name="errorId" type="String">The error id</param>
                /// <returns type="String">The generic error string value</returns>
                if (typeof errorId !== "string" || errorId === "") {
                    throw new Error(error + "JSPlugin.3006");
                }
                return error + errorId;
            }
            Resources.getErrorString = getErrorString;
            function loadResourceFile(resourceAlias) {
                if (resourceAlias && typeof resourceAlias.isRelative === "undefined") {
                    resourceAlias.isRelative = true;
                }
                var hostPromise = host.loadResources(resourceAlias);
                if (hostPromise) {
                    return hostPromise.then(function (newResources) {
                        if (newResources) {
                            var alias = resourceAlias.alias;
                            var existingValues = resourceMap[alias];
                            if (existingValues) {
                                var keys = Object.keys(newResources);
                                for (var i = 0; i < keys.length; i++) {
                                    var key = keys[i];
                                    existingValues[key] = newResources[key];
                                }
                            }
                            else {
                                resourceMap[alias] = newResources;
                            }
                        }
                        if (resourceAlias.isDefault) {
                            defaultAlias = alias;
                        }
                    });
                }
                else {
                    return Plugin.Promise.wrap(null);
                }
            }
            Resources.loadResourceFile = loadResourceFile;
            function addEventListener(name, callback) {
                host.addEventListener(name, callback);
            }
            Resources.addEventListener = addEventListener;
            function removeEventListener(name, callback) {
                host.removeEventListener(name, callback);
            }
            Resources.removeEventListener = removeEventListener;
        })(Resources = Plugin.Resources || (Plugin.Resources = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Storage;
        (function (Storage) {
            "use strict";
            var host = loadModule("plugin.host.storage");
            // Force a var to be written before the first enum to avoid a TypeScript issue
            var TypeScriptFix;
            // Enumerations used for file storage
            // Note:  these enum values need to stay in-sync with their counterparts in VS Host
            (function (FileAccess) {
                FileAccess[FileAccess["read"] = 1] = "read";
                FileAccess[FileAccess["write"] = 2] = "write";
                FileAccess[FileAccess["readWrite"] = 3] = "readWrite";
            })(Storage.FileAccess || (Storage.FileAccess = {}));
            var FileAccess = Storage.FileAccess;
            (function (FileDialogMode) {
                FileDialogMode[FileDialogMode["open"] = 0] = "open";
                FileDialogMode[FileDialogMode["save"] = 1] = "save";
            })(Storage.FileDialogMode || (Storage.FileDialogMode = {}));
            var FileDialogMode = Storage.FileDialogMode;
            (function (FileMode) {
                // Create a new file. Throw an error if the file already exists.
                FileMode[FileMode["createNew"] = 1] = "createNew";
                // Create a new file. If the file already exists, it will be overwritten.
                FileMode[FileMode["create"] = 2] = "create";
                // Open an existing file. Throw an error if the file doesn't exist.
                FileMode[FileMode["open"] = 3] = "open";
                // Open a file if it exists; otherwise, a new file will be created.
                FileMode[FileMode["openOrCreate"] = 4] = "openOrCreate";
                // Open an existing file. When the file is opened, it will be truncated so that its size is zero bytes.
                FileMode[FileMode["truncate"] = 5] = "truncate";
                // Opens the file if it exists and seeks to the end of the file, or creates a new file. 
                FileMode[FileMode["append"] = 6] = "append";
            })(Storage.FileMode || (Storage.FileMode = {}));
            var FileMode = Storage.FileMode;
            (function (FileShare) {
                // Declines sharing of the current file. Any request to open the file will fail until the file is closed.
                FileShare[FileShare["none"] = 0] = "none";
                // Allows subsequent opening of the file for reading
                FileShare[FileShare["read"] = 1] = "read";
                // Allows subsequent opening of the file for writing.
                FileShare[FileShare["write"] = 2] = "write";
                // Allows subsequent opening of the file for reading or writing.
                FileShare[FileShare["readWrite"] = 3] = "readWrite";
                // Allows subsequent deleting of a file
                FileShare[FileShare["delete"] = 4] = "delete";
            })(Storage.FileShare || (Storage.FileShare = {}));
            var FileShare = Storage.FileShare;
            (function (FileType) {
                FileType[FileType["binary"] = 0] = "binary";
                FileType[FileType["text"] = 1] = "text";
            })(Storage.FileType || (Storage.FileType = {}));
            var FileType = Storage.FileType;
            (function (FilePersistence) {
                FilePersistence[FilePersistence["permanent"] = 0] = "permanent";
                FilePersistence[FilePersistence["temporary"] = 1] = "temporary";
            })(Storage.FilePersistence || (Storage.FilePersistence = {}));
            var FilePersistence = Storage.FilePersistence;
            (function (SeekOrigin) {
                SeekOrigin[SeekOrigin["begin"] = 0] = "begin";
                SeekOrigin[SeekOrigin["current"] = 1] = "current";
                SeekOrigin[SeekOrigin["end"] = 2] = "end";
            })(Storage.SeekOrigin || (Storage.SeekOrigin = {}));
            var SeekOrigin = Storage.SeekOrigin;
            var HostFile = (function () {
                function HostFile(streamId, options) {
                    this.maxBuffer = 32 * 1024;
                    this.id = streamId;
                    this.options = options;
                }
                Object.defineProperty(HostFile.prototype, "streamId", {
                    get: function () { return this.id; },
                    enumerable: true,
                    configurable: true
                });
                HostFile.prototype.close = function () {
                    /// <summary>
                    /// Closes the current stream associated with the file 
                    /// </summary>
                    /// <returns type="Plugin.Promise">A void Promise</returns> 
                    return host.closeFile(this.id);
                };
                HostFile.prototype.read = function (count) {
                    /// <summary>
                    /// Reads a block of bytes or characters from a file
                    /// </summary>
                    /// <param name="count" type="Number" optional="true">The maximum number of bytes or characters to read. 
                    /// If no count is specified the entire file is read.</param>
                    /// <returns type="Plugin.Promise">A Promise containing a string or byte[] of the data read.</returns>
                    if (!isNullOrUndefined(count) && !isInteger(count)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.7005"));
                    }
                    if (isNullOrUndefined(count)) {
                        var concatStart;
                        if (this.options.type === FileType.binary) {
                            concatStart = [];
                        }
                        else {
                            concatStart = "";
                        }
                        return this.readAllHelper(concatStart);
                    }
                    else {
                        return host.read(this.id, count, this.options.type);
                    }
                };
                HostFile.prototype.seek = function (offset, origin) {
                    /// <summary>
                    /// Sets the current position of the file stream to the given value. 
                    /// </summary>
                    /// <param name="offset" type="Number">The point relative to origin from which to begin seeking.</param>
                    /// <param name="origin" type="SeekOrigin">Specifies the beginning, the end, or the current position as a 
                    /// reference point for origin, using a value of type SeekOrigin.</param>
                    /// <returns type="Plugin.Promise">A Promise containing the new position in the stream.</returns>
                    if (!isInteger(offset)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.7000"));
                    }
                    if (isNullOrUndefined(origin)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.7001"));
                    }
                    return host.seek(this.id, offset, origin);
                };
                HostFile.prototype.write = function (data, offset, count) {
                    /// <summary>
                    /// Writes a block of bytes or characters to the file stream.
                    /// </summary>
                    /// <param name="data" type="Object">The data to write to the stream.</param>
                    /// <param name="offset" type="Number" optional="true">The zero-based byte offset in data from which to 
                    /// begin copying bytes/characters to the stream. If no offset is specified it is set to zero.</param>
                    /// <param name="count" type="Number" optional="true">The maximum number of bytes to write.
                    /// If no count is specified all data is written.</param>
                    /// <returns type="Plugin.Promise">A void Promise.</returns>
                    if (typeof data !== "string" && !(data instanceof Array)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.7002"));
                    }
                    if (!isNullOrUndefined(offset) && !isInteger(offset)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.7000"));
                    }
                    offset = offset || 0;
                    if (!isNullOrUndefined(count) && !isInteger(count)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.7007"));
                    }
                    count = count || data.length;
                    return host.write(this.id, data, offset, count, this.options.type);
                };
                HostFile.prototype.readAllHelper = function (content) {
                    var _this = this;
                    return host.read(this.id, this.maxBuffer, this.options.type).then(function (result) {
                        if (result === null || result.length === 0) {
                            return content;
                        }
                        else {
                            return _this.readAllHelper(content.concat(result));
                        }
                    });
                };
                return HostFile;
            }());
            function getFileList(path, persistence, index, count) {
                /// <summary>
                /// Returns the names of files in the specified directory.
                /// </summary>
                /// <param name="path" type="String" optional="true">The directory from which to retrieve the files.</param>
                /// <param name="persistence" type="Plugin.FilePeristence" optional="true">A constant that determines 
                /// the root storage location (permanent or temporary).</param>
                /// <param name="index" optional="true">The index of the element to skip to before returning the remaining elements.</param>
                /// <param name="count" optional="true">An integer representing the number of files to return.</param>
                /// <returns type="Plugin.Promise">A Promise containing a string array of file names in the specified directory.</returns>
                if (!isNullOrUndefined(path) && typeof path !== "string") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.7003"));
                }
                if (!isNullOrUndefined(index) && !isInteger(index)) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.7008"));
                }
                if (!isNullOrUndefined(count) && !isInteger(count)) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.7005"));
                }
                return host.getFileList(path, persistence, index, count);
            }
            Storage.getFileList = getFileList;
            function createFile(path, options) {
                /// <summary>
                /// Creates a file with the specified path and options and initializes a new instance of the File class 
                /// </summary>
                /// <param name="path" type="String" optional="true">A relative path for the file.</param>
                /// <param name="options" type="FileOptions" optional="true">A set of file options. 
                /// If file options are undefined the default FileOptions are used.</param>
                /// <returns type="Plugin.Promise">A Promise containing a file of type binary or text.</returns>
                if (!isNullOrUndefined(path) && typeof path !== "string") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.7006"));
                }
                var fileOptions = getDefaultFileOptions(options);
                fileOptions.mode = FileMode.createNew;
                return host.openFile(path, fileOptions).then(function (streamId) {
                    return new HostFile(streamId, fileOptions);
                });
            }
            Storage.createFile = createFile;
            function openFile(path, options) {
                /// <summary>
                /// Opens a file with the specified path and options and initializes a new instance of the File class
                /// </summary>
                /// <param name="path" type="String">The relative path to the file.</param>
                /// <param name="options" type="FileOptions" optional="true">A set of file options. 
                /// If file options are undefined the default FileOptions are used.</param>
                /// <returns type="Plugin.Promise">A Promise containing a file of type binary or text.</returns>
                if (typeof path !== "string" || path === "") {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.7003"));
                }
                var fileOptions = getDefaultFileOptions(options);
                return host.openFile(path, fileOptions).then(function (streamId) {
                    return new HostFile(streamId, fileOptions);
                });
            }
            Storage.openFile = openFile;
            function openFileDialog(dialogOptions, fileOptions) {
                /// <summary>
                /// Displays an open file dialog with the specified options and returns the file the user selected.
                /// </summary>
                /// <param name="dialogOptions" type="FileDialogOptions" optional="true">A set of file dialog options. 
                /// If file dialog options are undefined the default FileDialogOptions are used.</param>
                /// <param name="fileOptions" type="FileOptions" optional="true">A set of file options. 
                /// If file options are undefined the default FileOptions are used.</param>
                /// <returns type="Plugin.Promise">A Promise containing a file of type binary, text or undefined if the dialog was cancelled.</returns>
                var openDialogOptions = getDefaultFileDialogOptions(dialogOptions);
                var openFileOptions = getDefaultFileOptions(fileOptions);
                return host.fileDialog(Plugin.Storage.FileDialogMode.open, openDialogOptions, openFileOptions).then(function (streamId) {
                    if (streamId !== null && streamId !== "") {
                        return new HostFile(streamId, openFileOptions);
                    }
                });
            }
            Storage.openFileDialog = openFileDialog;
            function saveFileDialog(dialogOptions, fileOptions) {
                /// <summary>
                /// Displays a save file dialog with the specified options and initializes a new instance of the File class.
                /// </summary>
                /// <param name="dialogOptions" type="FileDialogOptions" optional="true">A set of file dialog options. 
                /// If file dialog options are undefined the default FileDialogOptions are used.</param>
                /// <param name="fileOptions" type="FileOptions" optional="true">A set of file options. 
                /// If file options are undefined the default FileOptions are used (FileMode is set to openOrCreate).</param>
                /// <returns type="Plugin.Promise">A Promise containing a file of type binary, text or undefined if the dialog was cancelled.</returns>
                var saveDialogOptions = getDefaultFileDialogOptions(dialogOptions);
                var saveFileOptions = getDefaultFileOptions(fileOptions);
                saveFileOptions.mode = FileMode.openOrCreate;
                return host.fileDialog(Plugin.Storage.FileDialogMode.save, saveDialogOptions, saveFileOptions).then(function (streamId) {
                    if (streamId !== null && streamId !== "") {
                        return new HostFile(streamId, saveFileOptions);
                    }
                });
            }
            Storage.saveFileDialog = saveFileDialog;
            function getDefaultFileOptions(options) {
                /// <summary>
                /// Returns the default file options for those that were not provided.
                /// File access type set to readWrite.
                /// Encoding set to UTF-8.
                /// File mode set to open.
                /// File persistence set to temporary.
                /// File share set to none.
                /// File type set to text.
                /// </summary>
                /// <returns type="FileOptions">File options with default values for those that were not provided.</returns>
                var fileOptions = {
                    access: FileAccess.readWrite,
                    encoding: "UTF-8",
                    mode: FileMode.open,
                    persistence: FilePersistence.temporary,
                    share: FileShare.none,
                    type: FileType.text
                };
                if (options) {
                    fileOptions.access = isNullOrUndefined(options.access) ? fileOptions.access : options.access;
                    fileOptions.encoding = options.encoding || fileOptions.encoding;
                    fileOptions.mode = isNullOrUndefined(options.mode) ? fileOptions.mode : options.mode;
                    fileOptions.persistence = isNullOrUndefined(options.persistence) ? fileOptions.persistence : options.persistence;
                    fileOptions.share = isNullOrUndefined(options.share) ? fileOptions.share : options.share;
                    fileOptions.type = isNullOrUndefined(options.type) ? fileOptions.type : options.type;
                }
                return fileOptions;
            }
            function getDefaultFileDialogOptions(options) {
                /// <summary>
                /// Returns the default file dialog options for those that were not provided.
                /// Name set to an empty string.
                /// Extensions set to empty array.
                /// Extensions index set to 0.
                /// Initial directory set to an empty string.
                /// Title set to an empty string.
                /// </summary>
                /// <returns type="FileOptions">File dialog options with default values for those that were not provided.</returns>
                var dialogOptions = {
                    name: "",
                    extensions: [],
                    extensionsIndex: 0,
                    initialDirectory: "",
                    title: ""
                };
                if (options) {
                    dialogOptions.name = options.name || dialogOptions.name;
                    dialogOptions.extensions = options.extensions || dialogOptions.extensions;
                    dialogOptions.extensionsIndex = options.extensionsIndex || dialogOptions.extensionsIndex;
                    dialogOptions.initialDirectory = options.initialDirectory || dialogOptions.initialDirectory;
                    dialogOptions.title = options.title || dialogOptions.title;
                }
                return dialogOptions;
            }
            function isInteger(value) {
                /// <summary>
                /// Returns true if the specified value is an integer. Otherwise returns false.
                /// </summary>
                /// <returns type="Boolean">Returns true if the specified value is an integer. Otherwise returns false.</returns>
                return ((parseFloat(value) === parseInt(value)) && !isNaN(value));
            }
            function isNullOrUndefined(value) {
                /// <summary>
                /// Returns true if the specified value is null or undefined. Otherwise returns false.
                /// </summary>
                /// <returns type="Boolean">Returns true if the specified value is null or undefined. Otherwise returns false.</returns>
                return (value === null || typeof value === "undefined");
            }
        })(Storage = Plugin.Storage || (Plugin.Storage = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="core.ts"/>
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Theme;
        (function (Theme) {
            "use strict";
            var host = loadModule("plugin.host.theme");
            // Private variables
            var domInitialized = false;
            var isCurrentThemeHighContrast = false;
            //  Indicates whether this is the initial theme changed event. (Set when a theme change is fired from the host.)
            var isInitial = false;
            /// JSON token map that gets set when a theme change event is fired from the host
            /// Token map property names match the token keys in plugin.css
            /// Example: tokenMap["plugin-scrollbar-background-color"] returns the value for the {plugin-scrollbar-background-color} token
            var tokenMap = {};
            // The base 'plugin' css that gets set when the theme is initialized
            var pluginCss;
            // Temporary element and regEx used to convert a token color to an rgba value
            var tempElement;
            var rgbaRegEx = /[^0-9]+/g;
            // These 'regex' match css declaration property name and value pairs using capture groups
            var declarationRegEx = /^(\s*)([\w\-]+)\s*:\s*([^;^\{\*]+|url\([^\)]+\));\s*\/\*\s*\[([^\[\]]+)\]\s*\*\/(.*)$/gm;
            // Token 'replacer' - allow any word character or dash to match in a token name.  Also allow
            // extra opening and closing parenthesis to match so that these can be error handled correctly.
            // The 'replacer' supports an alpha modifier and or a !HCOnly token ex: {plugin-color rgba(0.25)} or {plugin-color !HCOnly} or
            // {plugin-color !HCOnly rgba(0.25)} (order of rgba and !HCOnly, when both are present, doesn't matter)
            var rgbaValueRegex = /\(([^\)]+)\)/;
            var tokenNameRegex = /\s*([\{\}\w\-]*)/;
            var rgbaOrHCOnlyFragmentRegex = /(?:\s+((?:rgba\s*\([^\)]+\))|(?:\!HCOnly)))?/;
            // Matches the following pattern
            //
            // { <token name> <rgba specifier (optional)> <!HCOnly specifier (optional)> }
            //
            // The !HCOnly and rgba specifiers are both optional and their order, when both present, vis-a-vis one another, doesn't matter.
            var tokenRegEx = new RegExp("\\{" + tokenNameRegex.source + rgbaOrHCOnlyFragmentRegex.source + rgbaOrHCOnlyFragmentRegex.source + "\\s*\\}", "igm");
            var undefinedRegEx = /undefined|null/;
            var eventManager = new Plugin.Utilities.EventManager();
            eventManager.setTarget(host);
            // Register to receive the on theme initialize event
            host.addEventListener("themeinitialize", function (eventArgs) {
                pluginCss = eventArgs.PluginCss;
                if (!pluginCss) {
                    Plugin._logError("JSPlugin.4000");
                    return;
                }
                isCurrentThemeHighContrast = eventArgs.isHighContrastTheme;
                updateTheme(eventArgs.themeMap, /*isFirst*/ true, isCurrentThemeHighContrast).then(function () {
                    eventManager.dispatchEvent("themeinitialize");
                });
            });
            // Register to receive the on theme change event
            host.addEventListener("themechanged", function (eventArgs) {
                isCurrentThemeHighContrast = eventArgs.isHighContrastTheme;
                updateTheme(eventArgs.themeMap, /*isFirst*/ false, isCurrentThemeHighContrast).then(function () {
                    eventManager.dispatchEvent("themechanged");
                });
            });
            function updateTheme(themeMap, isFirst, isHighContrast) {
                /// <summary>
                /// Updates the theme, or, if the document is not in a ready state, queues listener to the load event and will update the theme after that fires. The returned promise
                /// will complete once the theme has been updated.
                /// </summary>
                /// <param name="themeMap" type="Object">The json theme map of token key value pairs</param>
                /// <param name="isFirst" type="Boolean">Indicates whether this is the initial theme update</param>
                /// <returns type="Promise">A promise representing the completion of the theme update</returns>
                // Set the 'plugin' token map, process css files and themed images
                tokenMap = themeMap;
                if (!tokenMap) {
                    Plugin._logError("JSPlugin.4001");
                    return createEmptyCompletedPromise();
                }
                isInitial = isInitial || isFirst;
                if (document.readyState !== "complete") {
                    var promise = new Plugin.Promise(function (c, e) {
                        document.onreadystatechange = function () {
                            if (document.readyState === "complete") {
                                c();
                            }
                        };
                    });
                    return promise.then(function (state) {
                        updateTheme(themeMap, isFirst, isHighContrast);
                    });
                }
                processCssFiles(isHighContrast);
                _cssHelpers.processImages(document);
                return createEmptyCompletedPromise();
            }
            function createEmptyCompletedPromise() {
                // Strangely there is no way to create a Promise<void> that is already completed nor is there any way to transition from a Promise<T> -> Promise<void> EXCEPT when T == any.
                // So we just create a Promise<bool> from a static result and expose it as a Promise<void> via a cast.
                return Plugin.Promise.wrap(true);
            }
            function getValue(key) {
                /// <summary>
                /// Retrieves a token value from the token map for a given key
                /// </summary>
                /// <param name="key" type="String">token key</param>
                /// <returns type="String">token value</returns>
                if (!tokenMap[key]) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.4002"));
                }
                return tokenMap[key];
            }
            Theme.getValue = getValue;
            function processInjectedSvg(target) {
                /// <summary>
                ///     Processes divs with 'data-plugin-svg' attribute by injecting the div with inline svg tags.
                ///     If element is null then this function will inject all svg images starting from root of document.
                ///     Only divs that contain the attribute 'data-plugin-svg' will be processed.
                /// </summary>
                /// <param name="targetDoc" type="HTMLDocument">
                ///     The document that contains the themed images to process
                /// </param>
                if (!target) {
                    target = document;
                }
                var divs = target.querySelectorAll("[data-plugin-svg]");
                for (var i = 0; i < divs.length; i++) {
                    // Explicitly call Microsoft.Plugin.Theme.getValue to make sure unit test could redefine getValue.
                    // This is for unit test.
                    var svgContentEncoded = Microsoft.Plugin.Theme.getValue(divs[i].getAttribute("data-plugin-svg"));
                    var svgContent = decodeHtml(svgContentEncoded);
                    divs[i].innerHTML = svgContent;
                    if (!divs[i].firstChild) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.4002"));
                    }
                    var svgDOM = divs[i].firstChild;
                    var parent = divs[i].parentNode;
                    parent.replaceChild(svgDOM, divs[i]);
                }
            }
            Theme.processInjectedSvg = processInjectedSvg;
            function decodeHtml(htmlString) {
                var map = {
                    '&lt;': '<',
                    '&gt;': '>',
                    '&quot;': '"',
                    '&apos;': '\'',
                    '&amp;': '&'
                };
                return htmlString.replace(/(&lt;|&gt;|&quot;|&apos;|&amp;)/g, function (str, item) {
                    return map[item];
                });
            }
            function processCSSFileForThemeing(path) {
                return host.getCssFile(path, /*requirePluginRelativeLocation*/ false).then(function (contents) {
                    return Plugin.Promise.wrap(tokenReplaceContents(contents, isCurrentThemeHighContrast));
                });
            }
            Theme.processCSSFileForThemeing = processCSSFileForThemeing;
            function processCssFiles(isHighContrast) {
                /// <summary>
                ///     Called when a theme change event is fired from the host.
                ///     Processes the css files so that theme tokens are replaced with the token map values.
                ///     Only links that contain the attribute data-plugin-theme="true" will be processed.
                /// </summary>
                // If the Initialized event never fired (i.e. there was a problem getting theme info in the host) then
                // pluginCss will be null, in which case we can't do much, but we shouldn't crash.
                if (!pluginCss)
                    return;
                // Create a new style element and token replace the base css 'plugin' styles
                var pluginStyle = document.createElement("style");
                pluginStyle.type = "text/css";
                pluginStyle.innerHTML = tokenReplaceContents(pluginCss, isHighContrast);
                // Insert this style element before all other head children to respect css overrides
                var firstNode = document.head.firstChild;
                if (firstNode) {
                    document.head.insertBefore(pluginStyle, firstNode);
                    if (firstNode.id === "pluginCss") {
                        // Remove the old 'pluginCss' style node
                        document.head.removeChild(firstNode);
                    }
                }
                else {
                    document.head.firstChild = pluginStyle;
                }
                // Set the id of the new style node
                pluginStyle.id = "pluginCss";
                // Determine if there are other css theme files to process
                var cssThemeFiles = (document.querySelectorAll("[data-plugin-theme='true']"));
                // If this is the initial theme change and there are no other
                // files to process notify the host that the theme is ready.
                if (isInitial && cssThemeFiles.length === 0) {
                    host.fireThemeReady();
                    isInitial = false;
                    return;
                }
                for (var i = 0; i < cssThemeFiles.length; i++) {
                    var styleNode = cssThemeFiles[i];
                    // Get the source of the file to process
                    var href = styleNode.href;
                    if (styleNode.hasAttribute("data-plugin-theme-href") && styleNode.getAttribute("data-plugin-theme-href")) {
                        href = styleNode.getAttribute("data-plugin-theme-href");
                    }
                    // If this is the initial theme change event and the final file to process
                    var fireThemeReady = (isInitial && (i === cssThemeFiles.length - 1));
                    var dataAttributes = {};
                    for (var attributeIndex = 0; attributeIndex < styleNode.attributes.length; attributeIndex++) {
                        var attribute = styleNode.attributes[attributeIndex];
                        var isDataAttribute = (attribute.nodeName.indexOf('data-') === 0);
                        if (isDataAttribute) {
                            dataAttributes[attribute.nodeName] = attribute.nodeValue;
                        }
                    }
                    _cssHelpers.processCssFileContents(href, document, styleNode, fireThemeReady, isHighContrast, dataAttributes);
                }
            }
            var _cssHelpers;
            (function (_cssHelpers) {
                function processCssFileContents(href, targetDoc, refNode, fireThemeReady, isHighContrast, additionalAttributes) {
                    /// <summary>
                    /// Process a css file so that theme tokens are replaced with the token map values
                    /// </summary>
                    /// <param name="href" type="String">
                    ///     The href of the file to process
                    /// </param>
                    /// <param name="targetDoc" type="Object">
                    ///     The document to add the new style to
                    /// </param>
                    /// <param name="refNode" type="Object" optional="true">
                    ///     The node used to position and name the new style node
                    /// </param>
                    /// <param name="fireThemeReady" type="Boolean" optional="true">
                    ///    A bool indicating whether to notify that the theme is ready
                    /// </param>
                    /// <param name="isHighContrast" type="Boolean" optional="true">
                    ///    A bool indicating whether the current theme is a high-contast theme
                    /// </param>
                    /// <param name="additionalAttributes" type="IStringMap{string}" optional="true">
                    ///     List of attributes to add to created style link
                    /// </param>
                    return host.getCssFile(href, /*requirePluginRelativeLocation*/ true).done(function (contents) {
                        /// <summary>
                        /// Get the css file contents from the host
                        /// </summary>
                        /// <param name="href" type="String">
                        ///     The href of the css file
                        /// </param>
                        /// <param name="callback" type="Function">
                        ///     The callback function to trigger when the host's css file contents is retrieved
                        /// </param>
                        if (contents) {
                            contents = tokenReplaceContents(contents, isHighContrast);
                            // Create the new style node
                            var newStyle = targetDoc.createElement("style");
                            newStyle.setAttribute("data-plugin-theme", "true");
                            newStyle.setAttribute("data-plugin-theme-href", href);
                            if (additionalAttributes) {
                                for (var key in additionalAttributes) {
                                    newStyle.setAttribute(key, additionalAttributes[key]);
                                }
                            }
                            newStyle.type = "text/css";
                            newStyle.innerHTML = contents;
                            if (refNode) {
                                // If the reference node has no parent node the
                                // CSS file contents have already been processed.
                                if (!refNode.parentNode) {
                                    return;
                                }
                                // Add the new style node before the old style node
                                targetDoc.head.insertBefore(newStyle, refNode);
                                // Remove the old style node and set the new style node id
                                targetDoc.head.removeChild(refNode);
                                newStyle.id = refNode.id;
                            }
                            else {
                                // Add the new style node to the document
                                targetDoc.head.appendChild(newStyle);
                            }
                        }
                        if (fireThemeReady) {
                            // Notify the host that the 'theme' is ready
                            host.fireThemeReady();
                            isInitial = false;
                        }
                    }, function (e) {
                        // On error, still notify the host to reveal the scripted control
                        if (fireThemeReady) {
                            host.fireThemeReady();
                            isInitial = false;
                        }
                        Plugin._logError("JSPlugin.4003\r\n" + e.message + "\r\n" + e.stack);
                    });
                }
                _cssHelpers.processCssFileContents = processCssFileContents;
                function processImages(targetDoc) {
                    /// <summary>
                    ///     Called when a theme change event is fired from the host.
                    ///     Processes images by replacing the image src with a data URI from the token map.
                    ///     Only images that contain the attribute 'data-plugin-theme-src' will be processed.
                    /// </summary>
                    /// <param name="targetDoc" type="Object">
                    ///     The document that contains the themed images to process
                    /// </param>
                    var images = targetDoc.querySelectorAll("[data-plugin-theme-src]");
                    for (var i = 0; i < images.length; i++) {
                        images[i].src = getValue(images[i].getAttribute("data-plugin-theme-src"));
                    }
                }
                _cssHelpers.processImages = processImages;
            })(_cssHelpers = Theme._cssHelpers || (Theme._cssHelpers = {}));
            function getRGBACandidate(candidate1, candidate2) {
                /// <summary>
                /// Finds the string from the two given strings that contains "rgba" (case insensitive).
                /// </summary>
                /// <param name="candidate1" type="String">The first candidate string to search for "rgba"</param>
                /// <param name="candidate2" type="String">The second candidate string to search for "rgba"</param>
                /// <returns type="String"> If both strings contain "rbga" then candidate1 is returned, otherwise the
                /// string that contains "rgba" is returned. If neither contain the substring then null is returned.</returns>
                if (candidate1 && (candidate1.match(/rgba/i) !== null)) {
                    return candidate1;
                }
                else if (candidate2 && (candidate2.match(/rgba/i) !== null)) {
                    return candidate2;
                }
                return null;
            }
            function tokenReplaceContents(contents, isHighContrast) {
                /// <summary>
                /// Token replace a css file contents so that theme tokens are replaced with the token map values
                /// </summary>
                /// <param name="contents" type="String">The css file contents to token replace</param>
                /// <returns type="String">The token replaced css file contents</returns>
                return contents.replace(declarationRegEx, function (declaration, indent, property, defaultValue, replacer, suffix) {
                    // 'declaration' - matches the css declaration property name and value pair with 'replacer' comments
                    // 'indent' - matches any white space before the css property so we keep it readable after transformation
                    // 'property' - matches characters before a colon (:) to give the property name
                    // 'defaultValue' - matches characters after the colon, up until the semicolon (;) to give the property's default value
                    // 'replacer' - matches the special comment style which will be used to replace the css value with the host's theme info.
                    // 'suffix' - matches any characters after the token 'replacer'.
                    // Keep track of the token replacement count
                    var replaceCount = 0;
                    // Replace the tokens with token map values
                    var newValue = replacer.replace(tokenRegEx, function (tokenMatch, token, rgbaOrHCOnlyMatch1, rgbaOrHCOnlyMatch2) {
                        // 'tokenMatch' - matches the full token and curly brackets ({token})
                        // 'token' - matches the token without the curly brackets.
                        // 'rgbaOrHCOnlyMatch1' - matches either the full rgba token (if it exists) or !HCOnly token (if it exists)
                        // 'rgbaOrHCOnlyMatch2' - matches either the full rgba token (if it exists) or !HCOnly token (if it exists)
                        var isHCOnly = false;
                        if (rgbaOrHCOnlyMatch1 && (rgbaOrHCOnlyMatch1.toUpperCase() === "!HCONLY")) {
                            isHCOnly = true;
                        }
                        else if (rgbaOrHCOnlyMatch2 && (rgbaOrHCOnlyMatch2.toUpperCase() === "!HCONLY")) {
                            isHCOnly = true;
                        }
                        // If the token is HC only and we know the status of the current theme then possibly bail out if it is a non-HC theme
                        if (isHCOnly && ((typeof isHighContrast !== "undefined") && !isHighContrast)) {
                            return null;
                        }
                        replaceCount++;
                        var colorValue = tokenMap[token];
                        var rgbaMatch = getRGBACandidate(rgbaOrHCOnlyMatch1, rgbaOrHCOnlyMatch2);
                        if (rgbaMatch) {
                            var rgbaValArr = rgbaMatch.match(rgbaValueRegex);
                            var rgba = "1.0";
                            if (rgbaValArr && rgbaValArr.length >= 1) {
                                rgba = rgbaValArr[0].replace(/\(|\)|\s/g, "");
                            }
                            // Convert the token to an rgb value using the temp element
                            tempElement = tempElement || document.createElement("div");
                            tempElement.style.backgroundColor = colorValue;
                            // Construct the rgba value
                            var parts = tempElement.style.backgroundColor.split(",");
                            if (parts.length === 3) {
                                var rgbParts = [];
                                for (var i = 0; i < 3; i++) {
                                    rgbParts.push(parseInt(parts[i].replace(rgbaRegEx, ''), 10));
                                }
                                // Convert the rgb value into an rgba value using the temp element to ensure the alpha is valid
                                tempElement.style.backgroundColor = "rgba(" + rgbParts.join(", ") + ", " + rgba + ")";
                                colorValue = tempElement.style.backgroundColor;
                            }
                        }
                        return colorValue;
                    });
                    // If the new value contains undefined or null,  or no tokens have been replaced, use the default value instead
                    if (replaceCount === 0 || newValue.match(undefinedRegEx)) {
                        newValue = defaultValue;
                    }
                    return indent + property + ": " + newValue + ";" + suffix;
                });
            }
            function addEventListener(type, listener) {
                /// <summary>
                /// Adds an event listener.
                /// </summary>
                /// <param name="type" type="String">The type (name) of the event.</param>
                /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                return eventManager.addEventListener(type, listener);
            }
            Theme.addEventListener = addEventListener;
            function removeEventListener(type, listener) {
                /// <summary>
                /// Removes an event listener.
                /// </summary>
                /// <param name="type" type="String">The type (name) of the event.</param>
                /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                return eventManager.removeEventListener(type, listener);
            }
            Theme.removeEventListener = removeEventListener;
        })(Theme = Plugin.Theme || (Plugin.Theme = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var VS;
        (function (VS) {
            var Commands;
            (function (Commands) {
                "use strict";
                var host = loadModule("plugin.host.commands");
                var ContextMenuBinding = (function () {
                    function ContextMenuBinding(name) {
                        this.name = name;
                    }
                    ContextMenuBinding.prototype.show = function (xPosition, yPosition) {
                        return host.showContextMenu(this.name, xPosition, yPosition);
                    };
                    return ContextMenuBinding;
                }());
                Commands.ContextMenuBinding = ContextMenuBinding;
                var CommandStateMarshaler = (function () {
                    function CommandStateMarshaler(name) {
                        this.name = name;
                        this.enabled = null;
                        this.visible = null;
                    }
                    return CommandStateMarshaler;
                }());
                var CommandBinding = (function () {
                    function CommandBinding(name, onexecute, enabled, visible) {
                        this._name = name;
                        this._onexecute = onexecute;
                        this._enabled = enabled;
                        this._visible = visible;
                    }
                    CommandBinding.prototype.setState = function (state) {
                        /// <summary>
                        /// Sets the state for a command.
                        /// </summary>
                        /// <param name="state" type="Object">The state for the command in the following format:<br/>
                        /// enabled: True if the command is enabled, false otherwise.<br/>
                        /// visible: True if the command is visible, false otherwise.<br/>
                        /// Note that all states are optional, if you don't specify a state it will not be updated for the command
                        /// </param>
                        var needToSetCommandStates = false;
                        var commandStateMarshaler = new CommandStateMarshaler(this._name);
                        if (state.hasOwnProperty("enabled") && state.enabled !== undefined) {
                            this._enabled = state.enabled;
                            commandStateMarshaler.enabled = state.enabled;
                            needToSetCommandStates = true;
                        }
                        if (state.hasOwnProperty("visible") && state.visible !== undefined) {
                            this._visible = state.visible;
                            commandStateMarshaler.visible = state.visible;
                            needToSetCommandStates = true;
                        }
                        if (needToSetCommandStates) {
                            host.setCommandsStates([commandStateMarshaler]);
                        }
                    };
                    return CommandBinding;
                }());
                Commands.CommandBinding = CommandBinding;
                var menuAliases, commandAliases;
                host.addEventListener("commandsinitialized", function (e) {
                    menuAliases = e.menuAliases;
                    commandAliases = e.commandAliases;
                });
                function bindContextMenu(name) {
                    /// <summary>
                    /// Creates a context menu binding for a host defined context menu
                    /// </summary>
                    /// <param name="name" type="String">The name of the context menu</param>
                    /// <returns value="ContextMenuBinding">The context menu binding.</returns>
                    if (!menuAliases || menuAliases.indexOf(name) === -1) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5000"));
                    }
                    return new ContextMenuBinding(name);
                }
                Commands.bindContextMenu = bindContextMenu;
                var commandBindings = {};
                host.addEventListener("commandexec", function (eventArgs) {
                    var commandName = eventArgs.CommandName;
                    if (commandBindings.hasOwnProperty(commandName)) {
                        commandBindings[commandName]._onexecute();
                    }
                });
                function bindCommand(command) {
                    /// <summary>
                    /// Creates a command binding for a host defined command
                    /// </summary>
                    /// <param name="command" type="Object">The command specifications in the following format:<br/>
                    /// name: The name of the command<br/>
                    /// onexecute: The function to call when the command is executed by the host<br/>
                    /// enabled: (Optional) True if the command is enabled, false otherwise.<br/>
                    /// visible: (Optional) True if the command is visible, false otherwise.
                    /// </param>
                    /// <returns value="CommandBinding">The command binding.</returns>
                    var isEnabled;
                    var isVisible;
                    var needToSetCommandState = false;
                    if (!command.hasOwnProperty("name")) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5001"));
                    }
                    if (!commandAliases || commandAliases.indexOf(command.name) === -1) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5002"));
                    }
                    if (!command.hasOwnProperty("onexecute") || typeof command.onexecute !== "function") {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5003"));
                    }
                    if (command.hasOwnProperty("enabled")) {
                        isEnabled = !!command.enabled;
                        needToSetCommandState = true;
                    }
                    if (command.hasOwnProperty("visible")) {
                        isVisible = !!command.visible;
                        needToSetCommandState = true;
                    }
                    // Verify that we haven't already constructed this command binding
                    if (commandBindings.hasOwnProperty(command.name)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5004"));
                    }
                    var newBinding = new CommandBinding(command.name, command.onexecute, isEnabled, isVisible);
                    commandBindings[command.name] = newBinding;
                    if (needToSetCommandState) {
                        newBinding.setState({
                            enabled: isEnabled,
                            visible: isVisible
                        });
                    }
                    return newBinding;
                }
                Commands.bindCommand = bindCommand;
                function setStates() {
                    /// <signature>
                    /// <summary>
                    /// Sets the states for multiple command bindings
                    /// </summary>
                    /// <param name="arguments" type="Object">The command binding for which to set the state, in the following format:<br/>
                    /// command: The CommandBinding for which to set the state.<br/>
                    /// enabled: True if the command is enabled, false otherwise.<br/>
                    /// visible: True if the command is visible, false otherwise.<br/>
                    /// Note that all states are optional, if you don't specify a state it will not be updated for the command
                    /// </param>
                    /// </signature>
                    var states = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        states[_i - 0] = arguments[_i];
                    }
                    var commandStateMarshalers = [];
                    for (var i = 0; i < states.length; i++) {
                        var commandInstance = states[i];
                        if (commandInstance.hasOwnProperty("command") && !!commandInstance.command && (commandInstance.command instanceof CommandBinding)) {
                            var commandStateMarshaler = new CommandStateMarshaler(commandInstance.command._name);
                            if (commandInstance.hasOwnProperty("enabled") && commandInstance.enabled !== undefined) {
                                commandStateMarshaler.enabled = commandInstance.enabled;
                            }
                            if (commandInstance.hasOwnProperty("visible") && commandInstance.visible !== undefined) {
                                commandStateMarshaler.visible = commandInstance.visible;
                            }
                            commandStateMarshalers.push(commandStateMarshaler);
                        }
                        else {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5005"));
                        }
                    }
                    if (commandStateMarshalers.length > 0) {
                        host.setCommandsStates(commandStateMarshalers);
                        // Now that the call was made, set the internal states
                        for (i = 0; i < states.length; i++) {
                            commandInstance = states[i];
                            if (commandInstance.hasOwnProperty("enabled") && commandInstance.enabled !== undefined) {
                                commandInstance.command._enabled = commandInstance.enabled;
                            }
                            if (commandInstance.hasOwnProperty("visible") && commandInstance.visible !== undefined) {
                                commandInstance.command._visible = commandInstance.visible;
                            }
                        }
                    }
                }
                Commands.setStates = setStates;
            })(Commands = VS.Commands || (VS.Commands = {}));
        })(VS = Plugin.VS || (Plugin.VS = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var VS;
        (function (VS) {
            var Internal;
            (function (Internal) {
                var CodeMarkers;
                (function (CodeMarkers) {
                    "use strict";
                    var host = loadModule("plugin.host.codemarkers");
                    function verifyMarker(marker) {
                        /// <summary>
                        /// Verify the given code marker id is valid
                        /// </summary>
                        /// <param name="marker" type="Number">id of the code marker</param>
                        /// <returns type="Number">the given marker if it is a finite number</returns>
                        if (typeof marker !== 'number' || !isFinite(marker)) {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.6000"));
                        }
                        return marker;
                    }
                    function fire(marker) {
                        /// <summary>
                        /// Fire a code marker with the given id
                        /// </summary>
                        /// <param name="marker">id of the code marker</param>
                        host.fireCodeMarker(verifyMarker(marker));
                    }
                    CodeMarkers.fire = fire;
                })(CodeMarkers = Internal.CodeMarkers || (Internal.CodeMarkers = {}));
            })(Internal = VS.Internal || (VS.Internal = {}));
        })(VS = Plugin.VS || (Plugin.VS = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Host;
        (function (Host) {
            "use strict";
            var host = loadModule("plugin.host");
            Object.defineProperty(Microsoft.Plugin.Host, "version", {
                get: function () {
                    return host.version;
                }
            });
            function showDocument(documentPath, line, col) {
                return host.showDocument("" + documentPath, +line, +col);
            }
            Host.showDocument = showDocument;
            ;
            function getDocumentLocation(documentPath) {
                return host.getDocumentLocation("" + documentPath);
            }
            Host.getDocumentLocation = getDocumentLocation;
            ;
            function supportsAllowSetForeground() {
                return host.supportsAllowSetForeground();
            }
            Host.supportsAllowSetForeground = supportsAllowSetForeground;
            function allowSetForeground(processId) {
                return host.allowSetForeground(processId);
            }
            Host.allowSetForeground = allowSetForeground;
            ;
        })(Host = Plugin.Host || (Plugin.Host = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var VS;
        (function (VS) {
            var Keyboard;
            (function (Keyboard) {
                "use strict";
                var clipboardGroup = 0;
                var zoomGroup = 1;
                var zoomState = true;
                function disableMouseWheelZoom(e) {
                    if (e.ctrlKey) {
                        e.preventDefault();
                    }
                }
                function setClipboardState(state) {
                    /// <summary>   
                    /// Set whether the browser will try to handle clipboard keys or allow 
                    /// Visual Studio to process them.
                    /// </summary>
                    /// <param name="state" type="Boolean">
                    /// True indicates the browser should handle the clipboard keys.
                    /// False, indicates the browser should ignore the clipboard keys 
                    /// allowing Visual Studio to see them.
                    /// </param>
                    window.external.setHotKeysState(clipboardGroup, !!state);
                }
                Keyboard.setClipboardState = setClipboardState;
                function setZoomState(state) {
                    /// <summary>   
                    /// Set whether the user should be allowed to control the zoom
                    /// state of the browser through hot keys, Ctrl -, Ctrl +, Ctrl 0,
                    /// and the mouse wheel, or should zooming be disabled.
                    /// </summary>
                    /// <param name="state" type="Boolean">
                    /// True indicates the user should be allowed to zoom the browser.
                    /// False indicates the user should not be allowed to zoom the browser.
                    /// </param>
                    state = !!state;
                    if (zoomState !== state) {
                        window.external.setHotKeysState(zoomGroup, state);
                        if (!state) {
                            window.addEventListener("mousewheel", disableMouseWheelZoom, false);
                        }
                        else {
                            window.removeEventListener("mousewheel", disableMouseWheelZoom);
                        }
                        zoomState = state;
                    }
                }
                Keyboard.setZoomState = setZoomState;
            })(Keyboard = VS.Keyboard || (VS.Keyboard = {}));
        })(VS = Plugin.VS || (Plugin.VS = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Tooltip;
        (function (Tooltip) {
            "use strict";
            ;
            ;
            ;
            Tooltip.defaultTooltipContentToHTML = true;
            var host = loadModule("plugin.host.tooltip");
            // Y-offset of the tooltip relative to the top-left corner of the mouse pointer
            var tooltipOffsetY = 15;
            var defaultDelay;
            var hasShownTooltipPopup = false;
            var tooltipObject = null;
            var tooltipReset = true;
            var scheduledShow;
            var scheduledDismiss;
            var mousePosition = { clientX: 0, clientY: 0, screenX: 0, screenY: 0 };
            var popupMeasureContainer;
            function canCreatePopup() {
                /// <summary> Determines if the host we are running in can support creating popups. </summary>
                return host.canCreatePopup();
            }
            function invalidatePopupTooltipDocumentCache() {
                /// <summary> Invalidates the cached document being used for popup tooltips. This has the effect of creating a new document, and copying CSS styles over to it, on the next popup tooltip showing. </summary>
                hasShownTooltipPopup = false;
            }
            Tooltip.invalidatePopupTooltipDocumentCache = invalidatePopupTooltipDocumentCache;
            var themeHost = loadModule("plugin.host.theme");
            themeHost.addEventListener("themechanged", function (eventArgs) {
                invalidatePopupTooltipDocumentCache();
            });
            function hostContentInPopup(displayParameters) {
                /// <summary> displays the given content in a popup allowing it to show outside the airspace of the host browser. </summary>
                /// <param name='displayParameters' type='PopupDisplayParameters'>The data required to show the popup.</param>
                // Default value for useCachedDocument will be considered to be true (i.e. caching of the document is the default behavior). If we have previously shown
                // a tooltip popup, then we will also check the displayParameters to see if the caller specified a value for useCachedDocument, if so we want to honor it,
                // if not we just stick with our default of true. If we have never shown a popup (hasShowTooltipPopup === false) then we obviously have no cached document
                // to use.
                var useCachedDocument = (hasShownTooltipPopup && ((typeof displayParameters.useCachedDocument === 'undefined') || (typeof displayParameters.useCachedDocument === 'boolean' && displayParameters.useCachedDocument)));
                if (!useCachedDocument) {
                    var dir = Plugin.Culture.dir;
                    var lang = Plugin.Culture.lang;
                    var docTypeTag = "<!DOCTYPE html>";
                    // NOTE: It is important that the HTML node (or another node 'high up' the tree) have overflow: hidden, otherwise IE will always
                    // add a vertical scroll bar and take the 17 pixels it takes up out of your layout space, this causes wrapping since we expect
                    // our callers to be giving us exact dimensions of their content.
                    var htmlAttributes = "xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"" + lang + "\" dir=\"" + dir + "\" style=\"overflow: hidden\"";
                    var htmlOpenTag = "<html " + htmlAttributes + ">";
                    var headOpenTag = "<head>";
                    var modeTag = "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\"/>";
                    var charSetTag = "<meta charset=\"UTF-16\">";
                    var headCloseTag = "</head>";
                    var preContentHTML = docTypeTag + htmlOpenTag + headOpenTag + modeTag + charSetTag;
                    // Pull in all the CSS styles from our current document, so we can transfer them to the popup DOM.
                    var styles = document.head.querySelectorAll("style, link[type='text/css']");
                    for (var i = 0; i < styles.length; i++) {
                        var styleElement = styles[i];
                        // Clone the element and apply it to the tooltip
                        var node = document.createElement(styleElement.nodeName);
                        var attributes = styleElement.attributes;
                        for (var j = 0; j < attributes.length; j++) {
                            if (attributes[j].specified) {
                                node.setAttribute(attributes[j].nodeName, attributes[j].nodeValue);
                            }
                        }
                        node.innerHTML = styleElement.innerHTML;
                        preContentHTML += node.outerHTML;
                    }
                    // IE has a default body margin of 8 px, which means children are offset by 8px unless this is
                    // cleaned up (i.e. taken away).
                    var bodyOpenTag = "<body style=\"margin: 0px\">";
                    preContentHTML += headCloseTag + bodyOpenTag;
                    var bodyCloseTag = "</body>";
                    var finalHTML = preContentHTML + displayParameters.content + bodyCloseTag;
                    displayParameters.content = finalHTML;
                }
                if (!hasShownTooltipPopup) {
                    hasShownTooltipPopup = true;
                }
                host.hostContentInPopup(displayParameters);
            }
            ;
            function dismissPopup() {
                /// <summary> Dismisses any currently visible popup. </summary>
                host.dismissPopup();
            }
            ;
            function resetTooltip(tooltip) {
                /// <summary>
                /// Resets the tooltip, so it can be assigned new styles and content.
                /// </summary>
                /// <param name="tooltip" type="HTMLElement">the tooltip to reset</param>
                if (tooltip) {
                    var contentDiv = tooltip["contentDiv"];
                    contentDiv.innerHTML = "";
                    tooltip["parent"] = null;
                    tooltipReset = true;
                }
            }
            function dismissTooltip(reset) {
                /// <summary>
                /// Cancels any pending tooltip show operations and hides the active tooltip.
                /// </summary>
                /// <param name="reset" type="Boolean" optional="true">whether to also reset the tooltipObject, defaults to true</param>
                var parent = null;
                if (scheduledShow) {
                    clearTimeout(scheduledShow);
                    scheduledShow = null;
                }
                if (scheduledDismiss) {
                    clearTimeout(scheduledDismiss);
                    scheduledDismiss = null;
                }
                if (tooltipObject) {
                    parent = tooltipObject.parent;
                    var usingPopup = canCreatePopup();
                    if (usingPopup) {
                        dismissPopup();
                    }
                    else {
                        if (document.body.contains(tooltipObject)) {
                            document.body.removeChild(tooltipObject);
                        }
                        tooltipObject.style.display = "none";
                    }
                    if (typeof reset === "undefined" || reset) {
                        resetTooltip(tooltipObject);
                    }
                }
                __n("TooltipDismiss", tooltipObject, parent, (typeof reset === "undefined" || reset));
            }
            function dismissTooltipOfParent(element, reset) {
                /// <summary>
                /// Dismiss tooltip if its parent is the given element
                /// </summary>
                /// <param name="element" type="Object">target parent element</param>
                /// <param name="reset" type="Boolean" optional="true">whether to also reset the tooltipObject, defaults to true</param>
                if (tooltipObject && tooltipObject.parent === element) {
                    dismissTooltip(reset);
                }
            }
            function createOuterTooltipDiv() {
                var tooltip = document.createElement("div");
                tooltip.setAttribute("id", "plugin-vs-tooltip");
                return tooltip;
            }
            function createNestedCellDiv() {
                var nestedCellDiv = document.createElement("div");
                nestedCellDiv.setAttribute("id", "plugin-vs-tooltip-nested-cell");
                return nestedCellDiv;
            }
            function createContentDiv() {
                var contentDiv = document.createElement("div");
                contentDiv.setAttribute("id", "plugin-vs-tooltip-content");
                return contentDiv;
            }
            function createPopupMeasureContainer() {
                var measureContainer = document.createElement("div");
                measureContainer.id = "plugin-vs-tooltip-measure-container";
                measureContainer["style"]["position"] = "absolute";
                measureContainer["style"]["display"] = "none";
                document.body.appendChild(measureContainer);
                return measureContainer;
            }
            function createTooltip() {
                var outerMostDiv = createOuterTooltipDiv();
                var nestedCellDiv = createNestedCellDiv();
                outerMostDiv.appendChild(nestedCellDiv);
                var contentDiv = createContentDiv();
                nestedCellDiv.appendChild(contentDiv);
                outerMostDiv["contentDiv"] = contentDiv;
                return outerMostDiv;
            }
            function createBlankTooltip() {
                /// <summary>
                /// Creates an empty tooltip with inherited and base tooltip styles
                /// </summary>
                /// <returns type="Object">tooltip object</returns>
                if (!tooltipReset) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.4004"));
                }
                var tooltip = tooltipObject;
                if (tooltip === null) {
                    tooltip = tooltipObject = createTooltip();
                    tooltip.contentDiv.addEventListener("mouseover", function () {
                        tooltip.style.display = "none";
                        __n("TooltipDismiss", tooltip, tooltip.parent, false);
                    });
                }
                return tooltip;
            }
            var htmlEncodingDiv = null;
            function htmlEncode(content) {
                /// <summary>
                /// Takes the given content (which may include markup) and assigned it to a divs innerText, thus having the brower 
                /// escape the markup for us as well as converting \n\r to <br> tags. This needs to be done as the \n\r -> <br>
                /// conversion is only done if the content is placed in a non-nested div, and our tooltip content divs are nested.
                /// </summary>
                /// <param name="content" type="String">Content to escape</param>
                /// <returns type="Object">Transformaed string with markup escaped and newlines transformed into line breaks.</returns>
                if (!htmlEncodingDiv) {
                    htmlEncodingDiv = document.createElement("div");
                }
                htmlEncodingDiv.innerText = content;
                return htmlEncodingDiv.innerHTML;
            }
            function createNewTooltipFromContent(config) {
                /// <summary>
                /// Creates a new tooltip with the given content.
                /// </summary>
                /// <param name="content" type="String">tooltip content</param>
                /// <returns type="Object">tooltip object</returns>
                var tooltip = createBlankTooltip();
                var pContent = tooltip["contentDiv"];
                if (pContent) {
                    // If the user provided a bit indicating their content does/doesn't contain HTML then use that, otherwise fall back on the global default for this plugin.
                    var hasValidContainsHTMLProperty = typeof config.contentContainsHTML === 'boolean';
                    var containsHTML = hasValidContainsHTMLProperty ? config.contentContainsHTML : Plugin.Tooltip.defaultTooltipContentToHTML;
                    if (typeof config.content === "string") {
                        pContent.innerHTML = containsHTML ? config.content : htmlEncode(config.content);
                        // Process VS themed images
                        Plugin.Theme._cssHelpers.processImages(pContent);
                    }
                    else if (config.content) {
                        // Otherwise, treat the content as text-only content, and set the innerText.
                        pContent.innerText = config.content;
                    }
                }
                return tooltip;
            }
            function createNewTooltipFromString(contentString) {
                /// <summary>
                /// Creates a new tooltip with the given text-only content and css styles
                /// </summary>
                /// <param name="contentString" type="String">content</param>
                /// <returns type="Object">tooltip object</returns>
                var tooltip = createBlankTooltip();
                if (tooltip && contentString) {
                    var pContent = tooltip["contentDiv"];
                    if (pContent) {
                        pContent.innerText = contentString;
                    }
                }
                return tooltip;
            }
            function adjustXPosForClientRight(x, width) {
                // Figure out if the given x position + the given width would push the tooltip out past the width 
                // of our client space (we don't want the tooltip to overflow or be partially in an offscreen area).
                var distToClientRight = document.documentElement.clientWidth - (x + width);
                if (distToClientRight < 0) {
                    // We want to bump the tooltip over so its right edge will be lined up with the edge of the client area
                    // we do width + 1 to deal with any sort of layout rounding issues (i.e. the fact that IE does
                    // laying in floating point numbers but reports width/height in rounded integers).
                    x = document.documentElement.clientWidth - (width + 1);
                }
                return x;
            }
            function adjustYPosForClientBottom(y, height, yOffset) {
                var distToClientBottom = document.documentElement.clientHeight - (y + height);
                if (distToClientBottom < 0) {
                    // We want to bump the tooltip up so its bottom edge will be above the original Y coordinate
                    y -= (height + 2 * yOffset + 1);
                    if (y < 0) {
                        // Don't want to bump it off screen.
                        y = 0;
                    }
                }
                return y;
            }
            function styleBoxSizingIsBorderBox(style) {
                var boxSizingMode = style["box-sizing"];
                return ((typeof boxSizingMode === "string") && (boxSizingMode.toLowerCase() === "border-box"));
            }
            function convertOffsetHeightToHeight(offsetHeight, style) {
                // When box-sizing mode is border-box it means the browser expects the height to include
                // the border and padding heights as well, so we just don't subtract anything in this case.
                if (styleBoxSizingIsBorderBox(style)) {
                    return offsetHeight;
                }
                var topBorderWidth = parseInt(style["border-top-width"], 10);
                var bottomBorderWidth = parseInt(style["border-bottom-width"], 10);
                var topPadding = parseInt(style["padding-top"], 10);
                var bottomPadding = parseInt(style["padding-bottom"], 10);
                return (offsetHeight - (topBorderWidth + bottomBorderWidth + topPadding + bottomPadding));
            }
            function convertOffsetWidthToWidth(offsetWidth, style) {
                // When box-sizing mode is border-box it means the browser expects the width to include
                // the border and padding widths as well, so we just don't subtract anything in this case.
                if (styleBoxSizingIsBorderBox(style)) {
                    return offsetWidth;
                }
                var leftBorderWidth = parseInt(style["border-right-width"], 10);
                var rightBorderWidth = parseInt(style["border-left-width"], 10);
                var leftPadding = parseInt(style["padding-left"], 10);
                var rightPadding = parseInt(style["padding-right"], 10);
                return (offsetWidth - (leftBorderWidth + rightBorderWidth + leftPadding + rightPadding));
            }
            function setLeftTopWidthHeight(element, settings) {
                if (settings.width) {
                    element.style.width = settings.width;
                }
                if (settings.height) {
                    element.style.height = settings.height;
                }
                if (settings.left) {
                    element.style.left = settings.left;
                }
                if (settings.top) {
                    element.style.top = settings.top;
                }
            }
            function propertyIsFiniteNumber(obj, propName) {
                return (typeof obj[propName] === 'number' && isFinite(obj[propName]));
            }
            function areValidScreenBounds(bounds) {
                return bounds != null &&
                    propertyIsFiniteNumber(bounds, "Width") &&
                    propertyIsFiniteNumber(bounds, "Height");
            }
            function showTooltipImmediate(args) {
                /// <summary>
                /// Displays the tooltip object 
                /// </summary>
                /// <param name="args" type="ShowTooltipArgs">A JavaScript object containing the information needed to display a tooltip.</param>
                if (args.tooltip) {
                    // Default the (x,y) coordinates to the current mouse position in the client coordinate system.
                    var useMousePosX = (typeof args.position === 'undefined') || (typeof args.position.clientX !== 'number');
                    var clientX = useMousePosX ? mousePosition.clientX : args.position.clientX;
                    var offsetFactor = 0;
                    var useMousePosY = (typeof args.position === 'undefined') || (typeof args.position.clientY !== 'number');
                    var clientY = useMousePosY ? mousePosition.clientY : args.position.clientY;
                    if (useMousePosY) {
                        offsetFactor = 1;
                    }
                    // Default duration is 10 times the Double Click time on the system
                    args.duration = (typeof args.duration === "number") ? args.duration : ((defaultDelay || (defaultDelay = host.getDblClickTime())) * 10);
                    var layoutScreenX = -500;
                    var layoutScreenY = -500;
                    var usingPopup = canCreatePopup();
                    if (usingPopup) {
                        if (!popupMeasureContainer) {
                            // Create a measure container that will be offscreen (i.e. at negative X and Y coordinates) and as big as the screen. This allows
                            // us to layout elements that will end up in a popup in a way that is unconstrained by the documents width/height. If we lay them
                            // out in the document body as a normal div IE will never let their width/height exceed the width/height of the visible document 
                            // area, which leads to strangly laid out tooltips when we hoist them into a popup.
                            popupMeasureContainer = createPopupMeasureContainer();
                        }
                        var currentScreenBounds = host.getScreenSizeForXY(window.screenX + clientX, window.screenY + clientY);
                        if (areValidScreenBounds(currentScreenBounds)) {
                            layoutScreenX = -currentScreenBounds.Width;
                            layoutScreenY = -currentScreenBounds.Height;
                            popupMeasureContainer.style.display = "inline";
                            popupMeasureContainer.style.top = layoutScreenY + "px";
                            popupMeasureContainer.style.left = layoutScreenX + "px";
                            popupMeasureContainer.style["min-width"] = currentScreenBounds.Width + "px";
                            popupMeasureContainer.style["min-height"] = currentScreenBounds.Height + "px";
                        }
                    }
                    // Reset any style properties on the tooltip div. We use the 'table' layout type for content centering 
                    // because table-cells can be vertically centered trivially. Place it at a -500,-500 position just
                    // to allow it to be laid out (measured) but not ever be visible in the actual UI during that process.
                    setLeftTopWidthHeight(args.tooltip, { left: layoutScreenX + "px", top: layoutScreenY + "px", width: "auto", height: "auto" });
                    if (usingPopup) {
                        popupMeasureContainer.appendChild(args.tooltip);
                    }
                    else {
                        document.body.appendChild(args.tooltip);
                    }
                    args.tooltip.style.display = "table";
                    // Get the measured width/height of the tooltip.
                    var width = args.tooltip.offsetWidth;
                    var height = args.tooltip.offsetHeight;
                    if (usingPopup) {
                        popupMeasureContainer.style.display = "none";
                    }
                    var yOffset = (offsetFactor * tooltipOffsetY);
                    if (!usingPopup) {
                        clientY += yOffset;
                    }
                    var style = window.getComputedStyle(args.tooltip);
                    if (usingPopup) {
                        setLeftTopWidthHeight(args.tooltip, { left: "0px",
                            top: "0px",
                            width: (convertOffsetWidthToWidth(width, style) + 1) + "px",
                            height: (convertOffsetHeightToHeight(height, style) + 1) + "px" });
                        // Deal with layout rounding issues (i.e. the fact that IE does layout in floating point but reports
                        // offsetWidth/Height in rounded integer units).
                        width += 1;
                        height += 1;
                        var popupArgs = { content: args.tooltip.outerHTML,
                            clientCoordinates: { X: clientX, Y: clientY },
                            contentSize: { Width: width, Height: height },
                            ensureNotUnderMouseCursor: true,
                            placementTargetIsMouseRect: useMousePosY,
                            useCachedDocument: args.useCachedDocument
                        };
                        hostContentInPopup(popupArgs);
                        // Make sure the div we use for local layout isn't actually visible in the client space
                        args.tooltip.style.display = "none";
                        popupMeasureContainer.removeChild(args.tooltip);
                    }
                    else {
                        // Make sure the tooltip wouldn't extend past the client's right border.
                        clientX = adjustXPosForClientRight(clientX, width);
                        // Make sure the tooltip wouldn't extend beyond the client's bottom border.
                        clientY = adjustYPosForClientBottom(clientY, height, yOffset);
                        // Adjust for any scroll offset on the hosting page, since we are using absolute positioning and an inline div.
                        clientX += window.pageXOffset;
                        clientY += window.pageYOffset;
                        // We explicitly set the width and to deal with an issue where the browser can end up wrapping 
                        // content if it falls on the edge of a scrollable div's viewport and width is set to 'auto'. 
                        setLeftTopWidthHeight(args.tooltip, { left: clientX + "px",
                            top: clientY + "px",
                            width: (convertOffsetWidthToWidth(width, style) + 1) + "px",
                            height: (convertOffsetHeightToHeight(height, style) + 1) + "px" });
                    }
                }
                scheduledShow = null;
                // If a duration is specified, schedule the tooltip to be dismissed after that time.
                if (args.duration > 0) {
                    scheduledDismiss = setTimeout(function () {
                        dismissTooltip(false);
                        scheduledDismiss = null;
                    }, args.duration);
                }
                if (!usingPopup) {
                    // Send the test contract notification now that the popup is visible.
                    __n("TooltipShow", args.tooltip, clientX, clientY, width, height, args.duration, scheduledDismiss);
                }
            }
            function scheduleShowTooltip(tooltip, delay, duration, position, useCachedDocument) {
                /// <summary>
                /// Schedule a tooltip to be shown
                /// </summary>
                /// <param name="tooltip" type="Object">tooltip object</param>
                /// <param name="delay" type="Number" optional="true">delay in milliseconds of tooltip show, defaults to system Double Click time</param>
                /// <param name="duration" type="Number" optional="true">duration of tooltip show in milliseconds</param>
                /// <param name="position" type="TooltipPosition" optional="true">position to display the tooltip</param>
                /// <param name="position" type="useCachedDocument" optional="true">indicates if we should use any cached document created for previous creations of a tooltip. Applicable only if tooltips are being shown in popups.</param>
                /// <returns type="Number">the indentifier of the timeout operation</returns>
                if (!tooltip) {
                    return null;
                }
                // Set default delay
                delay = (typeof delay === "number") ? delay : (defaultDelay || (defaultDelay = host.getDblClickTime()));
                useCachedDocument = (typeof useCachedDocument !== 'undefined' ? useCachedDocument : hasShownTooltipPopup);
                // If there is no delay, show the tooltip immediately
                if (delay <= 0) {
                    showTooltipImmediate({ tooltip: tooltip, duration: duration, position: position, useCachedDocument: useCachedDocument });
                    return null;
                }
                // Otherwise, schedule the tooltip to be shown after delay
                var timeout = setTimeout(function () {
                    showTooltipImmediate({ tooltip: tooltip, duration: duration, position: position, useCachedDocument: useCachedDocument });
                }, delay);
                __n("TooltipShowScheduled", tooltip, delay);
                return timeout;
            }
            function showTooltip(config, parent) {
                /// <summary>
                /// Creates and displays a new tooltip with the given configuration
                /// </summary>
                /// <param name="config" type="Object">configuration of the tooltip</param>
                /// <param name="parent" type="Object" optional="true">parent element</param>
                // Dismiss any active tooltip
                dismissTooltip();
                var useCachedDocument = hasShownTooltipPopup;
                var tooltip = null;
                var options = {};
                if (config && typeof config === "object") {
                    var tooltipContent;
                    // If we have never shown a tooltip, yielding a value of false for useCachedDocument, then we want to ignore what 
                    // the user has requested around this property, because either way we will need a complete document sent to the 
                    // tooltip popup call. This is why we only look what the user says if useCachedDocument is currently true.
                    if (useCachedDocument && (typeof config.useCachedDocument === 'boolean')) {
                        useCachedDocument = config.useCachedDocument;
                    }
                    if (config.resource) {
                        if (config.content || config.content === "") {
                            // If there is a content property to fall back to, ignore errors.
                            try {
                                tooltip = createNewTooltipFromString(Plugin.Resources.getString(config.resource));
                            }
                            catch (e) { }
                        }
                        else {
                            tooltip = createNewTooltipFromString(Plugin.Resources.getString(config.resource));
                        }
                    }
                    if (!tooltip && (config.content || config.content === "")) {
                        tooltip = createNewTooltipFromContent(config);
                    }
                    if (!tooltip) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.4005"));
                    }
                    options = config;
                }
                else {
                    tooltip = createNewTooltipFromString(config);
                }
                if (!tooltip) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.4006"));
                }
                tooltip.parent = parent;
                tooltipObject = tooltip;
                tooltipReset = false;
                scheduledShow = scheduleShowTooltip(tooltip, options.delay, options.duration, { clientX: options.x, clientY: options.y }, useCachedDocument);
            }
            function initializeElementTooltip(element) {
                /// <summary> 
                /// Initialize tooltip for the given element, based on its data-plugin-vs-tooltip attribute.
                /// </summary>
                /// <param name="element" type="Object">the HTML element for which to initialize a tooltip</param>
                if (!element || !element.addEventListener) {
                    Plugin._logError("JSPlugin.4007");
                    return;
                }
                if (element.__plugin_tooltip_initialized || !element.hasAttribute("data-plugin-vs-tooltip")) {
                    return;
                }
                // Helper function for determining if an element is a child of another.
                function hasChild(element, childCandidate) {
                    var currentParent = childCandidate ? childCandidate.parentNode : null;
                    while (currentParent && currentParent !== document.body) {
                        if (currentParent === element) {
                            return true;
                        }
                        currentParent = currentParent.parentNode;
                    }
                    return false;
                }
                // Show tooltip on 'mouseover'
                function onMouseOver(e) {
                    var currentTarget = e.currentTarget;
                    if (!currentTarget.hasAttribute("data-plugin-vs-tooltip")) {
                        // If this element no longer has a 'data-plugin-vs-tooltip' attribute, un-initialize it.
                        currentTarget.removeEventListener("mouseover", onMouseOver);
                        currentTarget.removeEventListener("mouseout", onMouseOut);
                        currentTarget.removeEventListener("mousedown", onMouseDown);
                        currentTarget.__plugin_tooltip_initialized = false;
                        return;
                    }
                    // If the tooltip for this element is already active, the target element's own tooltip is already 
                    // active (the most specific tooltip), or a tooltip belonging to a child element
                    // that is also a parent of the target element is active (a more specific tooltip), do not 
                    // show this tooltip.
                    if (tooltipObject && !tooltipReset && tooltipObject.parent &&
                        ((tooltipObject.parent === e.currentTarget) || (tooltipObject.parent === e.target) ||
                            (hasChild(tooltipObject.parent, e.target) && hasChild(e.currentTarget, tooltipObject.parent)))) {
                        return;
                    }
                    // Create the tooltip based on the value of the element's 'data-plugin-vs-tooltip' attribute
                    var tooltipConfigStr = currentTarget.getAttribute("data-plugin-vs-tooltip");
                    var config;
                    if ((typeof tooltipConfigStr === "string") && (tooltipConfigStr.length > 0) && (tooltipConfigStr[0] === "{")) {
                        config = JSON.parse(tooltipConfigStr);
                    }
                    else {
                        config = tooltipConfigStr;
                    }
                    showTooltip(config, e.currentTarget);
                }
                ;
                // Listen to this event on capture, so child tooltips will take precedence over parent tooltips
                element.addEventListener("mouseover", onMouseOver, true);
                // Dismiss tooltip on 'mouseout' only if the tooltip being dismissed belongs to this parent
                function onMouseOut(e) {
                    // Only take action if the relatedTarget is not the currentTarget or a child of the currentTarget
                    if (e.relatedTarget && (e.currentTarget !== e.relatedTarget) && !hasChild(e.currentTarget, e.relatedTarget)) {
                        dismissTooltipOfParent(e.currentTarget);
                    }
                }
                ;
                element.addEventListener("mouseout", onMouseOut);
                // Dismiss tooltip on 'mousedown' only if the tooltip being dismissed belongs to this parent
                function onMouseDown(e) {
                    dismissTooltipOfParent(e.currentTarget, false);
                }
                ;
                element.addEventListener("mousedown", onMouseDown);
                element.__plugin_tooltip_initialized = true;
            }
            Tooltip.initializeElementTooltip = initializeElementTooltip;
            document.addEventListener("DOMContentLoaded", function () {
                // Get all elements with the 'data-plugin-vs-tooltip' attribute and initialize them
                var withTooltipData = document.querySelectorAll("[data-plugin-vs-tooltip]");
                for (var i = 0; i < withTooltipData.length; i++) {
                    initializeElementTooltip(withTooltipData[i]);
                }
            }, false);
            document.addEventListener("mouseout", function (e) {
                // Dismiss the active tooltip when the mouse leaves the document
                if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
                    dismissTooltip();
                }
            }, false);
            document.addEventListener("mouseover", function (e) {
                var tooltipConfig;
                if (!e.target.__plugin_tooltip_initialized && e.target.hasAttribute("data-plugin-vs-tooltip")) {
                    initializeElementTooltip(e.target);
                }
            }, true);
            document.addEventListener("mousemove", function (e) {
                // Track the mouse position for positioning tooltips
                mousePosition.screenX = e.screenX;
                mousePosition.screenY = e.screenY;
                mousePosition.clientX = e.clientX;
                mousePosition.clientY = e.clientY;
            }, false);
            function show(config) {
                /// <signature>
                /// <summary> 
                ///     Show a tooltip with given configuration
                /// </summary>
                /// <param name="config" type="Object">
                ///     The configuration object describing the tooltip to show.<br/>
                ///     Must include at least one of the following properties:<br/>
                ///         'content' - String that contains the HTML content of the tooltip, used as default
                ///             if 'resource' is not provided or cannot be found<br/>
                ///         'resource' - String identifying the resource string to include as content<br/>
                ///     Other optional properties include:<br/>
                ///         'delay' - Number of milliseconds to delay before showing the tooltip<br/>
                ///         'duration' - maximum Number of milliseconds the tooltip should be displayed (0 is no maximum)<br/>
                ///         'x' - x-coordinate, relative to the screen, at which to show the tooltip<br/>
                ///         'y' - y-coordinate, relative to the screen, at which to show the tooltip<br/>
                /// </param>
                /// </signature>
                /// <signature>
                /// <summary> 
                ///     Show a tooltip with given text content
                /// </summary>
                /// <param name="config" type="String">string content to display in a text-only tooltip</param>
                /// </signature>
                showTooltip(config, null);
            }
            Tooltip.show = show;
            function dismiss(reset) {
                dismissTooltip(reset);
            }
            Tooltip.dismiss = dismiss;
        })(Tooltip = Plugin.Tooltip || (Plugin.Tooltip = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var Settings;
        (function (Settings) {
            "use strict";
            var host = loadModule("plugin.host.settings");
            function get(collection, requestedProperties) {
                /// <summary> get values for settings from the given collection </summary>
                /// <param name='collection' type='String' optional='true'>The name of the collection to retrieve values from.</param>
                /// <param name='requestedProperties' type='String[]' optional='true'>An array of property names whose values you want.</param>
                return host.get(collection, requestedProperties);
            }
            Settings.get = get;
            ;
            function set(collection, toSet) {
                /// <summary> set values for the given settings in the given collection </summary>
                /// <param name='collection' type='String' optional='true'>The name of the collection to retrieve values from.</param>
                /// <param name='toSet' type='Object' optional='false'>An object with property/value pairs corresponding to each property whose value you want to set/update.</param>
                return host.set(collection, toSet);
            }
            Settings.set = set;
            ;
        })(Settings = Plugin.Settings || (Plugin.Settings = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var VS;
        (function (VS) {
            var ActivityLog;
            (function (ActivityLog) {
                "use strict";
                var host = loadModule("plugin.host.activitylog");
                var EntryType;
                (function (EntryType) {
                    EntryType[EntryType["ALE_ERROR"] = 1] = "ALE_ERROR";
                    EntryType[EntryType["ALE_WARNING"] = 2] = "ALE_WARNING";
                    EntryType[EntryType["ALE_INFORMATION"] = 3] = "ALE_INFORMATION";
                })(EntryType || (EntryType = {}));
                function doLog(entryType, message, args) {
                    host.logEntry(entryType, Plugin.Utilities.formatString(message, args));
                }
                function info(message) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    doLog(EntryType.ALE_INFORMATION, message, args);
                }
                ActivityLog.info = info;
                function warn(message) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    doLog(EntryType.ALE_WARNING, message, args);
                }
                ActivityLog.warn = warn;
                function error(message) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    doLog(EntryType.ALE_ERROR, message, args);
                }
                ActivityLog.error = error;
            })(ActivityLog = VS.ActivityLog || (VS.ActivityLog = {}));
        })(VS = Plugin.VS || (Plugin.VS = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
/// <reference path="core.ts" />
/// <reference path="theme.ts" />
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var ContextMenu;
        (function (ContextMenu) {
            "use strict";
            var host = loadModule("plugin.host.contextmenu");
            // Force a var to be written before the first enum to avoid a TypeScript issue
            var TypeScriptFix;
            // Regex used to match the contents of the CSS background-image url property value 
            var urlRegEx = /url\(['"]?([^'"]*)['"]?\)/gm;
            // Regex used to detemine if an icon value is a token
            var iconIsTokenRegEx = /^[^\:\.]*$/;
            // Enumerations used for context menus
            (function (MenuItemType) {
                MenuItemType[MenuItemType["checkbox"] = 0] = "checkbox";
                MenuItemType[MenuItemType["command"] = 1] = "command";
                MenuItemType[MenuItemType["radio"] = 2] = "radio";
                MenuItemType[MenuItemType["separator"] = 3] = "separator";
            })(ContextMenu.MenuItemType || (ContextMenu.MenuItemType = {}));
            var MenuItemType = ContextMenu.MenuItemType;
            // Storage object to hold the context menus
            var contextMenuStorage = new Object();
            // Create a container to hold the active context menus
            var contextMenuContainer = document.createElement("div");
            contextMenuContainer.id = "plugin-contextmenu-container";
            Plugin.addEventListener("load", function () { return document.body.appendChild(contextMenuContainer); });
            // The id of the current target that triggered the contextmenu event
            var currentTargetId;
            // The active element before the context menu was launched
            var activeElement;
            // When set to true overrides the host canCreatePopup behavior and displays the context menu inline
            var shouldShowInline = false;
            var isContextMenuShowing = 0;
            Object.defineProperty(Plugin.ContextMenu, "isShowing", {
                get: function () {
                    return isContextMenuShowing !== 0;
                },
                enumerable: true
            });
            function dismissAll() {
                var promise;
                // Check to see if the host is taking care of the dismiss
                if (!Plugin.ContextMenu.canCreatePopup()) {
                    var promises = [];
                    for (var key in contextMenuStorage) {
                        // Filter properties that were inherited through the prototype chain.
                        if (contextMenuStorage.hasOwnProperty(key)) {
                            promises.push(contextMenuStorage[key].dismiss());
                        }
                    }
                    // Some extra typescript casting done here for Promise<void[]> returned from Promise.join to Promise<void>
                    // It's not important what type of promise is returned from here.
                    promise = Plugin.Promise.join(promises);
                }
                else {
                    promise = host.dismiss();
                }
                shouldShowInline = false;
                return promise;
            }
            ContextMenu.dismissAll = dismissAll;
            function getAbsoluteOffset(target) {
                var aggregateOffsetTop = target.offsetTop;
                var aggregateOffsetLeft = target.offsetLeft;
                while (target = target.offsetParent) {
                    aggregateOffsetTop += target.offsetTop;
                    aggregateOffsetLeft += target.offsetLeft;
                }
                return { left: aggregateOffsetLeft, top: aggregateOffsetTop };
            }
            function coordinatesAreOutsideOfVisibleClientArea(x, y) {
                return (x < 0 ||
                    y < 0 ||
                    x > document.documentElement.clientWidth ||
                    y > document.documentElement.clientHeight);
            }
            function determineVisibleTargetWidth(target, absoluteCoordinates) {
                var targetRight = absoluteCoordinates.left + target.offsetWidth;
                var visibleWindowAbsolute = {
                    left: window.pageXOffset,
                    top: window.pageYOffset,
                    right: window.pageXOffset + window.document.documentElement.clientWidth,
                    bottom: window.pageYOffset + window.document.documentElement.clientHeight
                };
                // Handle the easy case first.
                var isEntirelyOnScreen = ((absoluteCoordinates.left >= visibleWindowAbsolute.left) && (targetRight <= visibleWindowAbsolute.right));
                if (isEntirelyOnScreen) {
                    return target.offsetWidth;
                }
                // Okay, at least some portion of the element must be offscreen, so lets figure out how much is on screen.
                if ((targetRight < visibleWindowAbsolute.left) || (absoluteCoordinates.left > visibleWindowAbsolute.right)) {
                    // entirely off the left or right edge of the client area, nothing visible
                    return 0;
                }
                if ((absoluteCoordinates.left < visibleWindowAbsolute.left) && (targetRight <= visibleWindowAbsolute.right)) {
                    // Only left side of element is out of the client space.
                    return (target.offsetWidth - (visibleWindowAbsolute.left - absoluteCoordinates.left));
                }
                if ((targetRight > visibleWindowAbsolute.right) && (absoluteCoordinates.left >= visibleWindowAbsolute.left)) {
                    // Only the right side of element is out of the client space.                
                    return (target.offsetWidth - (targetRight - visibleWindowAbsolute.right));
                }
                // If we get here the element must be wider than the client area regardless of current scroll positioning
                return window.document.documentElement.clientWidth;
            }
            function determineVisibleTargetHeight(target, absoluteCoordinates) {
                var targetBottom = absoluteCoordinates.top + target.offsetHeight;
                var visibleWindowAbsolute = {
                    left: window.pageXOffset,
                    top: window.pageYOffset,
                    right: window.pageXOffset + window.document.documentElement.clientWidth,
                    bottom: window.pageYOffset + window.document.documentElement.clientHeight
                };
                // Handle the easy case first.
                var isEntirelyOnScreen = ((absoluteCoordinates.top >= visibleWindowAbsolute.top) && (targetBottom <= visibleWindowAbsolute.bottom));
                if (isEntirelyOnScreen) {
                    return target.offsetHeight;
                }
                // Okay, at least some portion of the element must be offscreen, so lets figure out how much is on screen.
                if ((targetBottom < visibleWindowAbsolute.top) || (absoluteCoordinates.top > visibleWindowAbsolute.bottom)) {
                    // entirely off the top or bottom edge of the client area
                    return 0;
                }
                if ((absoluteCoordinates.top < visibleWindowAbsolute.top) && (targetBottom <= visibleWindowAbsolute.bottom)) {
                    // Only the top of element is out of the client space
                    return (target.offsetHeight - (visibleWindowAbsolute.top - absoluteCoordinates.top));
                }
                if ((targetBottom > visibleWindowAbsolute.bottom) && (absoluteCoordinates.top >= visibleWindowAbsolute.top)) {
                    // Only the bottom of element is out of client space
                    return (target.offsetHeight - (targetBottom - visibleWindowAbsolute.bottom));
                }
                // If we get here the element must be taller than the client area regardless of current scroll positioning
                return window.document.documentElement.clientHeight;
            }
            function handleContextMenuShow(target, clientX, clientY) {
                // Show the context menu for the current element or parent element
                var id;
                if (!target) {
                    return false;
                }
                var originalTarget = target;
                while (target.parentElement) {
                    id = target.getAttribute("data-plugin-contextmenu");
                    if (id !== null) {
                        var contextMenu = contextMenuStorage[id];
                        var coordinates = { X: clientX, Y: clientY };
                        // Allow host specific coordinate adjustment before display
                        if (typeof (host.adjustShowCoordinates) === "function") {
                            coordinates = host.adjustShowCoordinates(coordinates);
                        }
                        // TODO: This prevents ever showing a context menu at (0,0), but it isn't clear otherwise how to detect a legitimate request to show at (0,0) from 
                        // say the host adjustment just failing and returning (0,0).
                        if (coordinates.X === 0 && coordinates.Y === 0) {
                            var absoluteOffset = getAbsoluteOffset(originalTarget);
                            var onscreenWidth = determineVisibleTargetWidth(originalTarget, absoluteOffset);
                            var onscreenHeight = determineVisibleTargetHeight(originalTarget, absoluteOffset);
                            if (onscreenWidth === 0 || onscreenHeight === 0) {
                                coordinates.X = coordinates.Y = 0;
                            }
                            else {
                                var midPointX = onscreenWidth / 2;
                                var midPointY = onscreenHeight / 2;
                                // I got these two cases  by drawing out the 6  possibilities for the targets:
                                //
                                // 1: Entirely on screen (client area scrolled or not)
                                // 2: Partially off the left/top (client area scrolled or not)
                                // 3: Partially off the right/bottom (client area scrolled or not)
                                // 4: Entirely off the left/top (client area scrolled or not)
                                // 5: Entirely off the right/bottom (client area scrolled or not)
                                // 6: Larger in width/height (or both) than client area.
                                //
                                // The offscreen cases are dealt with above (where I set X and Y to 0), the remaining
                                // four cases yield 2 equivalence classes wrt determining client coordinates, so a simple
                                // if/else suffices.
                                if (absoluteOffset.left < window.pageXOffset ||
                                    originalTarget.offsetWidth > window.document.documentElement.clientWidth) {
                                    coordinates.X = midPointX;
                                }
                                else {
                                    coordinates.X = ((absoluteOffset.left - window.pageXOffset) + midPointX);
                                }
                                if (absoluteOffset.top < window.pageYOffset ||
                                    originalTarget.offsetHeight > window.document.documentElement.clientHeight) {
                                    coordinates.Y = midPointY;
                                }
                                else {
                                    coordinates.Y = ((absoluteOffset.top - window.pageYOffset) + midPointY);
                                }
                            }
                        }
                        if (coordinatesAreOutsideOfVisibleClientArea(coordinates.X, coordinates.Y)) {
                            // This matches IE and VS behavior in this situation.
                            coordinates.X = coordinates.Y = 0;
                        }
                        contextMenu.show(coordinates.X, coordinates.Y, 0, target.id);
                        return true;
                    }
                    target = target.parentElement;
                    if (!target) {
                        return false;
                    }
                }
                return false;
            }
            document.addEventListener("keydown", function (event) {
                if (event.key === "F10" && event.shiftKey && !event.altKey && !event.ctrlKey) {
                    var element = document.activeElement;
                    // By passing (0,0) the context menu code will attempt to locate it near the cursor if focus is inside a container that supports
                    // selection. Otherwise handleContextMenuShow will center the menu based on the focused element.
                    if (handleContextMenuShow(element, /*clientX*/ 0, /*clientY*/ 0)) {
                        event.preventDefault();
                    }
                }
            }, false);
            // Disable the context menus supplied by IE and provide custom contextmenu event handling
            document.addEventListener("contextmenu", function (event) {
                handleContextMenuShow(event.target, event.clientX, event.clientY);
                event.preventDefault();
            }, false);
            // Handle the document click event to dismiss the active menus
            document.addEventListener("click", function (event) {
                // We will see this event both in the underlying WebOC (the document on top of which the context menu is displayed) and the context menu WebOC,
                // but we only want to handle the dismiss if it is a click on the underlying WebOC. Doing it inside the context menu WebOC would prevent the clicked
                // upon item from being executed.
                var currentElement = event.target;
                while (currentElement) {
                    if (currentElement.hasAttribute("data-plugin-is-contextmenu")) {
                        return;
                    }
                    currentElement = currentElement.parentElement;
                }
                dismissAll();
            }, true);
            // Handle the window resize event for inline context menus
            window.addEventListener("resize", function (event) {
                if (!Plugin.ContextMenu.canCreatePopup()) {
                    dismissAll();
                }
            }, false);
            // Stop event propagation and suppress the default event behaviour
            function stopPropagation(event) {
                event.stopPropagation();
                event.preventDefault();
            }
            ;
            var DisposableEventListener = (function () {
                function DisposableEventListener(target, type, listener, useCapture) {
                    this.target = target;
                    this.type = type;
                    this.listener = listener;
                    this.useCapture = useCapture;
                }
                DisposableEventListener.prototype.install = function () {
                    this.target.addEventListener(this.type, this.listener, this.useCapture);
                };
                DisposableEventListener.prototype.uninstall = function () {
                    this.target.removeEventListener(this.type, this.listener, this.useCapture);
                };
                return DisposableEventListener;
            }());
            var HostContextMenu = (function () {
                function HostContextMenu(menuItems, id, ariaLabel, cssClass, callback, parentMenu, parentMenuId) {
                    this.disposableEventListeners = [];
                    if (menuItems === null || typeof (menuItems) === "undefined" || menuItems.length === 0) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5006"));
                    }
                    // Check if id is valid
                    if (typeof (id) !== "string" && !isNullOrEmpty(id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5015"));
                    }
                    // Generate an id if none is provided
                    this.id = !isNullOrEmpty(id) ? id : generateId("plugin-contextmenu");
                    this.ariaLabel = ariaLabel;
                    // Ensure the id is unique 
                    if (!isNullOrEmpty(contextMenuStorage[this.id])) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5007"));
                    }
                    // Check if cssClass is valid
                    if (typeof (cssClass) !== "string" && !isNullOrEmpty(cssClass)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5016"));
                    }
                    // Set the menu callback
                    this.callback = callback;
                    // Add an event manager to the context menu
                    this.eventManager = new Plugin.Utilities.EventManager();
                    this.eventManager.setTarget(this);
                    // Create a new context menu
                    var contextMenu = document.createElement("ul");
                    contextMenu.id = this.id;
                    // Propogate the show event to refresh the submenus' menu items
                    if (!isNullOrEmpty(parentMenu)) {
                        var fireShowEvent = function (eventManager) {
                            return function (event) {
                                eventManager.dispatchEvent("show");
                            };
                        };
                        this.addDisposableEventListener(parentMenu, "show", fireShowEvent(this.eventManager));
                        // Set the parent context menu attribute
                        contextMenu.setAttribute("plugin-contextmenu-parent", parentMenuId);
                    }
                    // Set the context menu style
                    contextMenu.className = "plugin-contextmenu";
                    if (!isNullOrEmpty(cssClass)) {
                        contextMenu.classList.add(cssClass);
                    }
                    // put a marker attribute onto the context menu element so we can identify it later
                    contextMenu.setAttribute("data-plugin-is-contextmenu", "true");
                    var tabIndex = 1;
                    for (var item in menuItems) {
                        // Filter properties that were inherited through the prototype chain.
                        if (!menuItems.hasOwnProperty(item)) {
                            continue;
                        }
                        // Create a new context menu item
                        var contextMenuItem = document.createElement("li");
                        contextMenuItem.className = "menuitem";
                        // Set the tabindex for all context menu item types except separators
                        if (menuItems[item].type !== MenuItemType.separator) {
                            contextMenuItem.setAttribute("tabIndex", tabIndex.toString());
                            tabIndex++;
                        }
                        // Set the correct role based on type for the screen reader
                        var role = "";
                        switch (menuItems[item].type) {
                            case MenuItemType.checkbox:
                                role = "menuitemcheckbox";
                                break;
                            case MenuItemType.command:
                                role = "menuitem";
                                break;
                            case MenuItemType.separator:
                                role = "separator";
                                break;
                            case MenuItemType.radio:
                                role = "menuitemradio";
                                break;
                        }
                        contextMenuItem.setAttribute("role", role);
                        // Set the id
                        var itemId = menuItems[item].id;
                        contextMenuItem.id = !isNullOrEmpty(itemId) ? itemId : generateId("plugin-contextmenuitem");
                        // Set the label
                        var mainDiv = document.createElement("div");
                        mainDiv.className = "main";
                        var label = menuItems[item].label;
                        var isEmpty = isNullOrEmpty(label);
                        if ((isEmpty && (menuItems[item].type !== MenuItemType.separator)) || ((typeof (label) !== "string") && !isEmpty)) {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5018"));
                        }
                        if (!isEmpty) {
                            mainDiv.innerText = label;
                        }
                        // Add the div even if there is no label as this 
                        // main div is used for all menu item types.
                        contextMenuItem.appendChild(mainDiv);
                        // Check if the enabled icon is valid
                        var enabledIcon = menuItems[item].iconEnabled;
                        if (!isNullOrEmpty(enabledIcon) && typeof (enabledIcon) !== "string") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5019"));
                        }
                        // Check if the disabled icon is valid
                        var disabledIcon = menuItems[item].iconDisabled;
                        if (!isNullOrEmpty(disabledIcon) && typeof (disabledIcon) !== "string") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5020"));
                        }
                        // Set the icon
                        var iconImg = document.createElement("img");
                        iconImg.className = "icon";
                        iconImg.style.display = "none";
                        contextMenuItem.appendChild(iconImg);
                        // Set the access key
                        var shortcut = menuItems[item].accessKey;
                        if (!isNullOrEmpty(shortcut) && typeof (shortcut) !== "string") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5021"));
                        }
                        var shortcutDiv = document.createElement("div");
                        shortcutDiv.className = "shortcut";
                        if (!isNullOrEmpty(shortcut)) {
                            shortcutDiv.innerText = shortcut;
                        }
                        contextMenuItem.appendChild(shortcutDiv);
                        // Set the menu item callback, if none is defined use the parent callback
                        var menuItemCallback = menuItems[item].callback;
                        if (isNullOrEmpty(menuItemCallback)) {
                            menuItemCallback = this.callback;
                        }
                        // Check if the menu item callback is valid
                        if ((typeof (menuItemCallback) !== "function") && (menuItems[item].type !== MenuItemType.separator)) {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5017"));
                        }
                        // Helper function to pass the callback to the click event 
                        var passCallbackToClickEvent = function (callback) {
                            return function (event) {
                                // Only call the callback if the item is enabled and does not have a submenu
                                var item = event.currentTarget;
                                if (callback && !item.classList.contains("disabled") && isNullOrEmpty(item.getAttribute("data-plugin-contextmenu"))) {
                                    // Get the item type
                                    var type;
                                    switch (item.getAttribute("data-plugin-contextmenu-item-type")) {
                                        case "checkbox":
                                            type = MenuItemType.checkbox;
                                            break;
                                        case "command":
                                            type = MenuItemType.command;
                                            break;
                                        case "separator":
                                            type = MenuItemType.separator;
                                            break;
                                        case "radio":
                                            type = MenuItemType.radio;
                                            break;
                                        default:
                                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5008"));
                                    }
                                    // Create a context menu item
                                    var contextMenuItem = {
                                        id: item.id,
                                        callback: callback,
                                        label: item.getElementsByClassName("main")[0].innerText,
                                        type: type,
                                        iconEnabled: item.getElementsByClassName("icon")[0].src,
                                        iconDisabled: "",
                                        accessKey: item.getElementsByClassName("shortcut")[0].innerText,
                                        hidden: function () { return false; },
                                        disabled: function () { return false; },
                                        checked: function () { return item.getAttribute("aria-checked") === "true"; },
                                        cssClass: item.className,
                                        submenu: null
                                    };
                                    // Sequence the dismissal, where we may muck with focus to restore it to a pre-context menu display state, and
                                    // the user callback invocation, which may also affect focus. We want theirs to always trump ours. VS has an async
                                    // dismiss, F12's is sync, so to ensure the proper ordering in both cases we have to explicitly stage them like this.
                                    dismissAll().done(function () {
                                        callback(item.parentNode.id, contextMenuItem, currentTargetId);
                                    });
                                }
                                else {
                                    stopPropagation(event);
                                }
                            };
                        };
                        this.addDisposableEventListener(contextMenuItem, "click", passCallbackToClickEvent(menuItemCallback), false);
                        this.addDisposableEventListener(contextMenuItem, "contextmenu", passCallbackToClickEvent(menuItemCallback), false);
                        // Helper function to pass the callbacks to the show event 
                        var passMenuItemCallbacksToShowEvent = function (isHidden, isDisabled, isChecked, iconEnabled, iconDisabled, type, item) {
                            return function (event) {
                                // Set the hidden state
                                if (typeof (isHidden) === "function" && isHidden()) {
                                    item.classList.add("hidden");
                                }
                                else {
                                    item.classList.remove("hidden");
                                }
                                // Set the disabled state
                                var icon;
                                if (typeof (isDisabled) === "function" && isDisabled()) {
                                    item.classList.add("disabled");
                                    item.setAttribute("aria-disabled", "true");
                                    icon = iconDisabled;
                                }
                                else {
                                    item.classList.remove("disabled");
                                    item.removeAttribute("aria-disabled");
                                    icon = iconEnabled;
                                }
                                // Set type specific states
                                var iconImg = item.getElementsByClassName("icon")[0];
                                switch (type) {
                                    case MenuItemType.checkbox:
                                        item.removeAttribute("aria-checked"); // remove the aria-checked attribute so it doesn't trigger a change event on click
                                        if (typeof (isChecked) === "function" && isChecked()) {
                                            var backgroundSrc = getComputedStyle(iconImg).getPropertyValue("background-image");
                                            // Remove the url wrapper from the background-image before applying it to the src
                                            backgroundSrc = backgroundSrc.replace(urlRegEx, function (urlMatch, src) {
                                                // 'urlMatch' - the full match with the url wrapper - url(src)
                                                // 'src' - matches the src contents inside the url wrapper
                                                return src;
                                            });
                                            iconImg.src = backgroundSrc;
                                            item.setAttribute("aria-checked", "true");
                                            iconImg.style.display = "block";
                                        }
                                        else {
                                            item.setAttribute("aria-checked", "false");
                                            iconImg.style.display = "none";
                                        }
                                        break;
                                    case MenuItemType.command:
                                        if (!isNullOrEmpty(icon)) {
                                            if (iconIsTokenRegEx.test(icon)) {
                                                // Add the theme attribute for tokens  
                                                iconImg.setAttribute("data-plugin-theme-src", icon);
                                            }
                                            else {
                                                // Set the img src value and remove the theme attribute
                                                iconImg.src = icon;
                                                iconImg.removeAttribute("data-plugin-theme-src");
                                            }
                                            iconImg.style.display = "block";
                                        }
                                        else {
                                            iconImg.style.display = "none";
                                        }
                                        break;
                                }
                            };
                        };
                        // Check if isHidden is valid
                        var isHidden = menuItems[item].hidden;
                        if (!isNullOrEmpty(isHidden) && typeof (isHidden) !== "function") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5023"));
                        }
                        // Check if isDisabled is valid
                        var isDisabled = menuItems[item].disabled;
                        if (!isNullOrEmpty(isDisabled) && typeof (isDisabled) !== "function") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5024"));
                        }
                        // Check if isChecked is valid
                        var isChecked = menuItems[item].checked;
                        if (!isNullOrEmpty(isChecked) && typeof (isChecked) !== "function") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5025"));
                        }
                        this.addDisposableEventListener(this, "show", passMenuItemCallbacksToShowEvent(isHidden, isDisabled, isChecked, menuItems[item].iconEnabled, menuItems[item].iconDisabled, menuItems[item].type, contextMenuItem));
                        // Set the css class
                        var itemCssClass = menuItems[item].cssClass;
                        if (!isNullOrEmpty(itemCssClass) && typeof (itemCssClass) !== "string") {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5022"));
                        }
                        if (!isNullOrEmpty(itemCssClass)) {
                            contextMenuItem.classList.add(itemCssClass);
                        }
                        // Check if submenu is valid
                        var submenu = menuItems[item].submenu;
                        var isSubmenuNullOrUndefined = (typeof (submenu) === "undefined" || submenu === null);
                        if (!isSubmenuNullOrUndefined && !Array.isArray(submenu)) {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.5026"));
                        }
                        // Create the submenu
                        if (!isSubmenuNullOrUndefined) {
                            var submenuId = generateId("plugin-contextsubmenu");
                            var menu = new HostContextMenu(submenu, submenuId, null, cssClass, menuItemCallback, this, this.id);
                            var arrowDiv = document.createElement("div");
                            arrowDiv.className = "arrow";
                            contextMenuItem.setAttribute("data-plugin-contextmenu", submenuId);
                            contextMenuItem.appendChild(arrowDiv);
                        }
                        // Deactivates sibling submenus for the current target
                        var deactivateSiblingSubmenus = function (currentTarget) {
                            // Only deactivate sibling submenus if the target is visible
                            if (getComputedStyle(currentTarget.parentElement).getPropertyValue("display") !== "none") {
                                // Deactivate and hide any sibling submenus
                                var siblings = currentTarget.parentElement.querySelectorAll("[data-plugin-contextmenu]");
                                for (var i = 0; i < siblings.length; i++) {
                                    var sibling = siblings[i];
                                    if (sibling !== currentTarget) {
                                        if (typeof (sibling.className) !== "undefined") {
                                            sibling.classList.remove("active");
                                            submenuId = sibling.getAttribute("data-plugin-contextmenu");
                                            submenu = document.getElementById(submenuId);
                                            submenu.style.display = "none";
                                        }
                                    }
                                }
                            }
                        };
                        // Set the mouseover behaviour for the menu item 
                        this.addDisposableEventListener(contextMenuItem, "mouseover", function (event) {
                            var currentTarget = event.currentTarget;
                            if (shouldFocusMenuItem(currentTarget)) {
                                currentTarget.focus();
                            }
                            else {
                                deactivateSiblingSubmenus(event.currentTarget);
                            }
                            showSubmenu(currentTarget);
                        }, false);
                        // Set the mouseout behaviour for the menu item 
                        this.addDisposableEventListener(contextMenuItem, "mouseout", handleContextMenuItemMouseOut, false);
                        // Set the focus behaviour for the menu item 
                        this.addDisposableEventListener(contextMenuItem, "focus", function (event) {
                            deactivateSiblingSubmenus(event.currentTarget);
                        }, false);
                        // Set the keydown behaviour for the menu item 
                        this.addDisposableEventListener(contextMenuItem, "keydown", onMenuItemKeyDown, false);
                        // Set type specific settings
                        switch (menuItems[item].type) {
                            case MenuItemType.checkbox:
                                iconImg.classList.add("checkbox");
                                contextMenuItem.setAttribute("data-plugin-contextmenu-item-type", "checkbox");
                                break;
                            case MenuItemType.command:
                                contextMenuItem.setAttribute("data-plugin-contextmenu-item-type", "command");
                                break;
                            case MenuItemType.radio:
                                throw new Error("Not implemented");
                            case MenuItemType.separator:
                                mainDiv.classList.add("hr");
                                contextMenuItem.setAttribute("data-plugin-contextmenu-item-type", "separator");
                                break;
                            default:
                                throw new Error(Plugin.Resources.getErrorString("JSPlugin.5008"));
                        }
                        contextMenu.appendChild(contextMenuItem);
                    }
                    // Stop click (and right click) propagation to ensure the menu is not dismissed for disabled menu items
                    this.addDisposableEventListener(contextMenu, "click", stopPropagation, false);
                    this.addDisposableEventListener(contextMenu, "contextmenu", stopPropagation, false);
                    // Handle the host dismiss event
                    var fireDismiss = function (contextMenu, id) {
                        return function (event) {
                            if (id === event.id) {
                                // do focus restoration before dismiss, as dismiss is where the command handler will be invoked, so if it does
                                // focus changing itself we want it to win, not ours.
                                if (activeElement) {
                                    if (typeof (activeElement.focus) === "function") {
                                        activeElement.focus();
                                    }
                                    activeElement = null;
                                }
                                contextMenu.eventManager.dispatchEvent("dismiss");
                                isContextMenuShowing = Math.max(0, isContextMenuShowing - 1);
                            }
                        };
                    };
                    host.addEventListener("contextmenudismissed", fireDismiss(this, this.id));
                    // Add the context menu to the storage object and context menu container
                    contextMenuContainer.appendChild(contextMenu);
                    contextMenuStorage[contextMenu.id] = this;
                    // Set the keydown behaviour for the context menu
                    this.addDisposableEventListener(contextMenu, "keydown", onContextMenuKeyDown, false);
                }
                HostContextMenu.prototype.attach = function (element) {
                    /// <summary>
                    /// Attach the context menu to an HTML element.
                    /// </summary>
                    /// <param name="element" type="HTMLElement">The HTML element to attach to.</param>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    element.setAttribute("data-plugin-contextmenu", this.id);
                };
                HostContextMenu.prototype.detach = function (element) {
                    /// <summary>
                    /// Detach the context menu from an HTML element.
                    /// </summary>
                    /// <param name="element" type="HTMLElement">The HTML element to detach from.</param>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    if (element.getAttribute("data-plugin-contextmenu") === this.id) {
                        element.removeAttribute("data-plugin-contextmenu");
                    }
                };
                HostContextMenu.prototype.dismiss = function () {
                    /// <summary>
                    /// Dismiss the context menu and fire the dismiss event.
                    /// </summary>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    isContextMenuShowing = Math.max(0, isContextMenuShowing - 1);
                    // Check to see if the host is taking care of the dismiss
                    if (!Plugin.ContextMenu.canCreatePopup()) {
                        var contextMenu = document.getElementById(this.id);
                        if (contextMenu.style.display !== "none") {
                            document.getElementById(this.id).style.display = "none";
                            if (activeElement) {
                                if (typeof (activeElement.focus) === "function") {
                                    activeElement.focus();
                                }
                                activeElement = null;
                            }
                            this.eventManager.dispatchEvent("dismiss");
                        }
                    }
                    else {
                        host.dismiss();
                    }
                };
                HostContextMenu.prototype.dispose = function () {
                    /// <summary>
                    /// Dispose the context menu.
                    /// </summary>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    // Remove event listeners.
                    this.disposableEventListeners.forEach(function (listener) {
                        listener.uninstall();
                    });
                    this.disposableEventListeners = [];
                    // Detach from all elements
                    var nodeList = (document.querySelectorAll("[data-plugin-contextmenu=" + this.id + "]"));
                    for (var i = 0; i < nodeList.length; i++) {
                        nodeList[i].removeAttribute("data-plugin-contextmenu");
                    }
                    // Remove the context menu and all submenus from storage
                    removeContextMenuFromStorage(this.id);
                    // Set properties to null
                    this.id = null;
                    this.callback = null;
                };
                HostContextMenu.prototype.show = function (xPosition, yPosition, widthOffset, targetId) {
                    /// <summary>
                    /// Show the context menu at the specified coordinates.
                    /// </summary>
                    /// <param name="xPosition" type="number">The x position of the menu.</param>
                    /// <param name="yPosition" type="number">The y position of the menu.</param>
                    /// <param name="widthOffset" type="number" optional="true">The width offset of the parent item. 
                    /// (Used to position a submenu on the other side of a parent menu).</param> 
                    /// <param name="targetId" type="string" optional="true">The target id of the element that triggered the show.  
                    /// If provided, the id is passed back to the context menu item click callback.</param>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    if (!isFiniteNumber(xPosition) || !isFiniteNumber(yPosition)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5012"));
                    }
                    if (!isFiniteNumber(widthOffset) && !isNullOrEmpty(widthOffset)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5013"));
                    }
                    if (typeof (targetId) !== "string" && !isNullOrEmpty(targetId)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5014"));
                    }
                    // Dismiss active context menus
                    dismissAll();
                    // Set the target id that the context menu event was triggered on.
                    currentTargetId = targetId;
                    // Save the active element before launching the root context menu 
                    activeElement = document.activeElement;
                    var offset = widthOffset || 0;
                    var element = document.getElementById(this.id);
                    // Reset context menu items before showing the menu
                    for (var i = 0; i < element.children.length; i++) {
                        element.children[i].classList.remove("active");
                    }
                    // Dispatch the show event to update menu items before it displays
                    this.eventManager.dispatchEvent("show");
                    adjustMenuItemWidth(element);
                    _positionHelpers.show(element, this.ariaLabel, xPosition, yPosition, 0, offset, null, positionContextMenuInsideAirspace, host.show.bind(host));
                };
                HostContextMenu.prototype.addEventListener = function (type, listener) {
                    /// <summary>
                    /// Adds an event listener.
                    /// </summary>
                    /// <param name="type" type="String">The type (name) of the event.</param>
                    /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    this.eventManager.addEventListener(type, listener);
                };
                HostContextMenu.prototype.removeEventListener = function (type, listener) {
                    /// <summary>
                    /// Removes an event listener.
                    /// </summary>
                    /// <param name="type" type="String">The type (name) of the event.</param>
                    /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    this.eventManager.removeEventListener(type, listener);
                };
                HostContextMenu.prototype.dispatchEvent = function (evt) {
                    /// <summary>
                    /// Raises an event of the specified type and with the specified additional properties.
                    /// </summary>
                    /// <param name="evt" type="Event">The event to dispatch--only the event type is used.</param>
                    /// <returns type="Boolean">true if preventDefault was called on the event.</returns>
                    if (isNullOrEmpty(this.id)) {
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.5010"));
                    }
                    return this.eventManager.dispatchEvent(evt.type);
                };
                HostContextMenu.prototype.addDisposableEventListener = function (target, type, listener, useCapture) {
                    /// <summary>
                    /// Adds an event listener that will removed when we are disposed.
                    /// </summary>
                    /// <param name="target" type="EventTarget">The object to attach the event to.</param>
                    /// <param name="type" type="String">The type (name) of the event.</param>
                    /// <param name="listener" type="Function">The listener to invoke when the event gets raised.</param>
                    /// <param name="useCapture" type="Boolean">Event phase for the handler.</param>
                    var disposableListener = new DisposableEventListener(target, type, listener, useCapture);
                    disposableListener.install();
                    this.disposableEventListeners.push(disposableListener);
                };
                return HostContextMenu;
            }());
            function adjustMenuItemWidth(element) {
                /// <summary>
                /// Adjusts a context menu's item widths to ensure the shortcuts and submenu arrows align correctly.
                /// </summary>
                /// <param name="element" type="HTMLElement">The context menu HTMLElement to adjust.</param>
                // Calculate the max shortcut width 
                var maxWidth = 0;
                var shortcuts = element.querySelectorAll(".shortcut");
                for (var i = 0; i < shortcuts.length; i++) {
                    var shortcut = shortcuts[i];
                    element.style.display = "block";
                    var width = parseInt(getComputedStyle(shortcut).getPropertyValue("width"));
                    element.style.display = "none";
                    maxWidth = (width > maxWidth) ? width : maxWidth;
                }
                // Adjust the main menu item divs' right padding to accomodate the max shortcut width plus additional breathing room 
                var menuItemMainDivs = element.querySelectorAll(".main");
                maxWidth += 50;
                for (var i = 0; i < menuItemMainDivs.length; i++) {
                    menuItemMainDivs[i].style.paddingRight = maxWidth + "px";
                }
            }
            function removeContextMenuFromStorage(id) {
                /// <summary>
                /// Removes a context menu and all of its submenus from the container and storage list
                /// </summary>
                /// <param name="id" type="string">The id of the context menu to be removed.</param>
                // Remove menu from the container     
                var menu = document.getElementById(id);
                contextMenuContainer.removeChild(menu);
                // Remove the context menu from the storage list
                delete contextMenuStorage[id];
                // Remove each submenu element
                var submenuItems = menu.querySelectorAll("[data-plugin-contextmenu]");
                for (var i = 0; i < submenuItems.length; i++) {
                    removeContextMenuFromStorage(submenuItems[i].getAttribute("data-plugin-contextmenu"));
                }
            }
            function create(menuItems, id, ariaLabel, cssClass, callback) {
                /// <summary>
                /// Create a context menu
                /// </summary>
                /// <param name="menuItems" type="ContextMenuItem[]">An array of context menu items to add to the context menu.</param>
                /// <param name="id" type="String" optional="true">The id of the context menu.  If none is provided an id will be generated.</param>
                /// <param name="ariaLabel">The label to give to the context menu for the screen reader to read.</param>
                /// <param name="cssClass" type="String" optional="true">A css class to apply to the context menu.</param>
                /// <param name="callback" type="Function" optional="true">A callback function to handle actions on context menu items.</param>
                return new HostContextMenu(menuItems, id, ariaLabel, cssClass, callback);
            }
            ContextMenu.create = create;
            function canCreatePopup() {
                /// <summary> Determines if the host we are running in can support creating popups. </summary>
                return host.canCreatePopup() && !shouldShowInline;
            }
            ContextMenu.canCreatePopup = canCreatePopup;
            ;
            var _positionHelpers;
            (function (_positionHelpers) {
                function show(element, ariaLabel, xPosition, yPosition, elementOffsetTop, widthOffset, displayType, tryAdjustCoordinates, showOutsideOfAirspace) {
                    /// <summary>
                    /// Displays an HTMLElement at the specified coordinates.
                    /// </summary>
                    /// <param name="element" type="HTMLElement">The element to display.</param>
                    /// <param name="xPosition" type="number">The x position of the element.</param>
                    /// <param name="yPosition" type="number">The y position of the element.</param>
                    /// <param name="elementOffsetTop" type="number">The offset from the top of the parent element.</param>
                    /// <param name="widthOffset" type="number" optional="true">The width offset of the parent item. (Used in context menus to position a submenu on the other side of a parent menu).</param> 
                    /// <param name="displayType" type="string" optional="true">The display type for calculating the element's width and height. The default is "block".</param> 
                    /// <param name="tryAdjustCoordinates" type="function" optional="true">An optional callback function to specify a feature specific implementation to position the element inside of the viewport airspace.  If the element should be displayed outside of the airspace the left or top corrdinates should be set to 0.</param>
                    /// <param name="showOutsideOfAirspace" type="function" optional="true">An optional callback function to specify a host specific implementation to position the element outside of the viewport airspace.</param>
                    // Check to see if the element has submenus
                    var nodeList = element.querySelectorAll("[data-plugin-contextmenu]");
                    shouldShowInline = shouldShowInline || (nodeList.length > 0 && !host.canCreatePopup(true));
                    // Process the context menu icons to pick up the initial theme
                    Plugin.Theme._cssHelpers.processImages(element);
                    // Calculate the element's width and height
                    var display = displayType || "block";
                    element.style.display = display;
                    var height = element.offsetHeight;
                    var width = element.offsetWidth;
                    element.style.display = "none";
                    // Offsets for vertical and horzontal scroll
                    var scrollOffsetTop = window.pageYOffset;
                    var scrollOffsetLeft = window.pageXOffset;
                    // Get viewport width and height
                    var viewPortHeight = document.documentElement.clientHeight;
                    var viewPortWidth = document.documentElement.clientWidth;
                    // Set the position information
                    var positionInfo = {
                        clientCoordinates: { X: xPosition, Y: yPosition },
                        width: width,
                        height: height,
                        viewPortWidth: viewPortWidth,
                        viewPortHeight: viewPortHeight,
                        scrollOffsetLeft: scrollOffsetLeft,
                        scrollOffsetTop: scrollOffsetTop,
                        elementOffsetTop: elementOffsetTop,
                        widthOffset: widthOffset
                    };
                    isContextMenuShowing++;
                    // Check to see if the host can create a popup
                    // If so allow the host to deal with the positioning and display
                    if (Plugin.ContextMenu.canCreatePopup()) {
                        showOutsideOfAirspace(element.id, ariaLabel, contextMenuContainer, positionInfo);
                        return;
                    }
                    var adjustedPositionInfo = positionInfo;
                    if (yPosition + height > viewPortHeight || xPosition + width > viewPortWidth) {
                        if (typeof (tryAdjustCoordinates) === "function") {
                            adjustedPositionInfo = tryAdjustCoordinates(positionInfo);
                        }
                    }
                    element.style.left = adjustedPositionInfo.clientCoordinates.X + scrollOffsetLeft + "px";
                    element.style.top = adjustedPositionInfo.clientCoordinates.Y + scrollOffsetTop + "px";
                    element.style.display = display;
                    element.setAttribute("tabindex", "0");
                    element.focus();
                    // Send the test contract notification now that the inline context menu is visible.
                    __n("ContextMenuShow", adjustedPositionInfo.clientCoordinates.X + scrollOffsetLeft, adjustedPositionInfo.clientCoordinates.Y + scrollOffsetTop, adjustedPositionInfo.width, adjustedPositionInfo.height);
                }
                _positionHelpers.show = show;
            })(_positionHelpers = ContextMenu._positionHelpers || (ContextMenu._positionHelpers = {}));
            function positionContextMenuInsideAirspace(positionInfo) {
                /// <summary>
                /// Positions the context menu based on the position information provided
                /// </summary>
                // Element is taller than viewport height
                var y = positionInfo.clientCoordinates.Y;
                var yMirror = positionInfo.clientCoordinates.Y - positionInfo.height;
                if (positionInfo.clientCoordinates.Y + positionInfo.height > positionInfo.viewPortHeight && yMirror >= 0) {
                    y = yMirror;
                }
                // Element is wider than viewport width
                var x = positionInfo.clientCoordinates.X;
                var xMirror = positionInfo.clientCoordinates.X - (positionInfo.width + positionInfo.widthOffset);
                if (positionInfo.clientCoordinates.X + positionInfo.width > positionInfo.viewPortWidth && xMirror >= 0) {
                    x = xMirror;
                }
                positionInfo.clientCoordinates.Y = y;
                positionInfo.clientCoordinates.X = x;
                return positionInfo;
            }
            function generateId(prefix) {
                /// <summary>
                /// Generates a random id with the prefix provided.
                /// </summary>
                /// <param name="prefix" type="String">A prefix for the generated id.</param>
                /// <returns type="String">Returns a random id with the prefix provided (example: prefix-8262E0E4-9DB2-4FE3-A18F-7517ED776D60).</returns>
                if (isNullOrEmpty(prefix)) {
                    throw new Error(Plugin.Resources.getErrorString("JSPlugin.5009"));
                }
                function getHexDigits(count) {
                    var random = "";
                    while (random.length < count) {
                        random += Math.floor(Math.random() * 65536).toString(16);
                    }
                    return random.substr(0, count);
                }
                return prefix + "-" + getHexDigits(8) + "-" + getHexDigits(4) + "-" + getHexDigits(4) + "-" + getHexDigits(4) + "-" + getHexDigits(12);
            }
            function isNullOrEmpty(value) {
                /// <summary>
                /// Returns true if the specified value is null, undefined or empty. Otherwise returns false.
                /// </summary>
                /// <returns type="Boolean">Returns true if the specified value is null, undefined or empty. Otherwise returns false.</returns>
                return (value === null || typeof (value) === "undefined" || value === "");
            }
            function isFiniteNumber(value) {
                /// <summary>
                /// Returns true if the specified value is a finite number. Otherwise returns false.
                /// </summary>
                /// <returns type="Boolean">Returns true if the specified value is a finite number. Otherwise returns false.</returns>
                return (isFinite(value) && (typeof (value) === "number"));
            }
            function handlePopupMenuItemClick(event) {
                /// <summary>
                /// Route menu item clicks back to host for popup menu
                /// </summary>
                var target = event.currentTarget;
                if (!target.classList.contains("disabled") && isNullOrEmpty(target.getAttribute("data-plugin-contextmenu"))) {
                    host.callback(target.id);
                }
                else if (target.classList.contains("disabled")) {
                    // If a user clicks on a disabled menu item, force it to refocus on the
                    // disabled item so that screen readers don't focus on the root element
                    // and start reading the full path to the file.
                    target.focus();
                }
                stopPropagation(event);
            }
            function popupDeactivateSiblingSubmenus(currentTarget) {
                /// <summary>
                /// Route dismiss calls back to the host for popup menus
                /// </summary>
                /// <param name="currentTarget" type="HTMLElement">The HTML element of the current context menu item.</param>
                // Check to see if this menu item is already active
                if (!currentTarget.classList.contains("active")) {
                    // Get the (1, 1) position of the current context menu item relative to its offset parent
                    var coordinates = { X: 1, Y: currentTarget.offsetTop + 1 };
                    // Dismiss submenus
                    host.dismissSubmenus(coordinates);
                    // Deactivate any active siblings
                    var siblings = currentTarget.parentNode.querySelectorAll("[data-plugin-contextmenu]");
                    for (var i = 0; i < siblings.length; i++) {
                        var sibling = siblings[i];
                        if (sibling !== this) {
                            sibling.classList.remove("active");
                        }
                    }
                }
            }
            function popupShowSubmenu(currentTarget) {
                /// <summary>
                /// Route show calls back to the host for popup menus
                /// </summary>
                // Check to see if this menu item is already active
                if (!currentTarget.classList.contains("active")) {
                    // Display submenu for the current item
                    var submenuId = currentTarget.getAttribute("data-plugin-contextmenu");
                    if (submenuId !== null && typeof (submenuId) !== "undefined") {
                        var submenu = document.getElementById(submenuId);
                        currentTarget.classList.add("active");
                        adjustMenuItemWidth(submenu);
                        _positionHelpers.show(submenu, null, 0, 0, currentTarget.offsetTop, 0, null, null, host.show.bind(host));
                    }
                }
            }
            function handlePopupMenuItemMouseOver(event) {
                /// <summary>
                /// Route mouseover dismiss and show calls back to the host for popup menus
                /// </summary>
                var currentTarget = event.currentTarget;
                if (shouldFocusMenuItem(currentTarget)) {
                    currentTarget.focus();
                }
                else {
                    popupDeactivateSiblingSubmenus(event.currentTarget);
                }
                popupShowSubmenu(currentTarget);
            }
            function handleContextMenuItemMouseOut(event) {
                /// <summary>
                /// Deactivates context menu item on mouseout event
                /// </summary>
                var currentTarget = event.currentTarget;
                currentTarget.classList.remove("active");
                currentTarget.blur();
            }
            function handlePopupMenuItemFocus(event) {
                /// <summary>
                /// Route focus calls back to the host for popup menus
                /// </summary>
                popupDeactivateSiblingSubmenus(event.currentTarget);
            }
            // Handle the context menu focus event for popup menus
            host.addEventListener("contextmenufocused", function (event) {
                focusActiveMenuItem("contextmenu");
            });
            // Handle the context menu initialize event for popup menus
            host.addEventListener("contextmenuinitialized", function (event) {
                var contextmenu = document.getElementById("contextmenu");
                if (isNullOrEmpty(event.id)) {
                    // Reset context menu
                    contextmenu.innerHTML = "";
                    contextmenu.removeAttribute("aria-label");
                    contextMenuContainer.innerHTML = "";
                }
                else {
                    contextMenuContainer.innerHTML = event.contextMenus;
                    contextmenu.innerHTML = document.getElementById(event.id).innerHTML;
                    if (event.ariaLabel && event.ariaLabel.length !== 0) {
                        contextmenu.setAttribute("aria-label", event.ariaLabel);
                    }
                    // Add event handlers to menu and menu items
                    contextmenu.addEventListener("click", stopPropagation, false);
                    contextmenu.addEventListener("contextmenu", stopPropagation, false);
                    contextmenu.addEventListener("keydown", onContextMenuKeyDown, false);
                    var menuItems = contextmenu.getElementsByClassName("menuitem");
                    for (var i = 0; i < menuItems.length; i++) {
                        menuItems[i].addEventListener("mouseover", handlePopupMenuItemMouseOver, false);
                        menuItems[i].addEventListener("mouseout", handleContextMenuItemMouseOut, false);
                        menuItems[i].addEventListener("focus", handlePopupMenuItemFocus, false);
                        menuItems[i].addEventListener("click", handlePopupMenuItemClick, false);
                        menuItems[i].addEventListener("contextmenu", handlePopupMenuItemClick, false);
                        menuItems[i].addEventListener("keydown", onMenuItemKeyDown, false);
                        menuItems[i].addEventListener("DOMAttrModified", onAttrModified, false);
                    }
                    contextmenu.style.display = "block";
                    contextmenu.setAttribute("tabindex", "0");
                    // Request the host to disable zooming for popup context menus
                    host.disableZoom();
                    // Fire the content ready event to inform the host the popup is ready to display
                    host.fireContentReady();
                }
            });
            // Handle the context menu click event for popup menus
            host.addEventListener("contextmenuclicked", function (event) {
                var contextmenuItem = document.getElementById(event.Id);
                if (contextmenuItem) {
                    contextmenuItem.click();
                }
            });
            // Handle the context menu opened event for popup menus
            host.addEventListener("contextmenuopened", function (event) {
                // Send the test contract notification now that the popup context menu is visible.
                __n("ContextMenuShow", event.x, event.y, event.width, event.height);
            });
            // Keydown helper functions
            // Determines if the menu item element should be focused
            function shouldFocusMenuItem(element) {
                var allowDisabledItemNavigation = element.parentElement.classList.contains("allowDisabledItemNavigation");
                var isDisabled = element.classList.contains("disabled");
                var isHidden = element.classList.contains("hidden");
                return ((allowDisabledItemNavigation || !isDisabled) && !isHidden && element.hasAttribute("tabindex"));
            }
            ;
            // Retrieves the start index used when finding the next or previous active item
            function getMenuItemStartIndex(target, currentTarget, menuItems) {
                var startIndex = 0;
                if (target !== currentTarget) {
                    for (var i = 0; i < menuItems.length; i++) {
                        var element = menuItems[i];
                        if (element === target) {
                            startIndex = i + 1;
                            break;
                        }
                    }
                }
                return startIndex;
            }
            // Retrieves the previous active menu item from the start index 
            function getPreviousMenuItem(startIndex, menuItems) {
                var elementToFocus;
                for (var i = startIndex - 2; i >= 0; i--) {
                    var element = menuItems[i];
                    if (shouldFocusMenuItem(element)) {
                        elementToFocus = element;
                        break;
                    }
                }
                if (!elementToFocus) {
                    for (var i = menuItems.length - 1; i > startIndex - 1; i--) {
                        var element = menuItems[i];
                        if (shouldFocusMenuItem(element)) {
                            elementToFocus = element;
                            break;
                        }
                    }
                }
                return elementToFocus;
            }
            ;
            // Retrieves the next active menu item from the start index 
            function getNextMenuItem(startIndex, menuItems) {
                var elementToFocus;
                for (var i = startIndex; i < menuItems.length; i++) {
                    var element = menuItems[i];
                    if (shouldFocusMenuItem(element)) {
                        elementToFocus = element;
                        break;
                    }
                }
                if (!elementToFocus) {
                    for (var i = 0; i < startIndex - 1; i++) {
                        var element = menuItems[i];
                        if (shouldFocusMenuItem(element)) {
                            elementToFocus = element;
                            break;
                        }
                    }
                }
                return elementToFocus;
            }
            ;
            // Dismiss the current submenu (used for escape and left arrow keydown).  
            // Note: after dismissal focus is given to the active parent menu item.  
            function handleDismissCurrent(currentTarget, ignoreDismissForRoot) {
                if (Plugin.ContextMenu.canCreatePopup()) {
                    host.dismissCurrent(ignoreDismissForRoot);
                    return;
                }
                // Check to see if the target is a root menu
                var isRoot = !currentTarget.hasAttribute("plugin-contextmenu-parent");
                if (ignoreDismissForRoot && isRoot) {
                    return;
                }
                // Dismiss the menu
                contextMenuStorage[currentTarget.id].dismiss();
                // Focus the active parent menu item
                if (!isRoot) {
                    focusActiveMenuItem(currentTarget.getAttribute("plugin-contextmenu-parent"));
                }
            }
            ;
            // Focus the active menu item (or the menu if no items are active)
            function focusActiveMenuItem(menuId) {
                // Find the active element of the menu and focus 
                var menu = document.getElementById(menuId);
                menu.focus();
                var menuItems = menu.getElementsByClassName("menuitem");
                for (var i = 0; i < menuItems.length; i++) {
                    var element = menuItems[i];
                    if (element.classList.contains("active")) {
                        element.classList.remove("active");
                        element.focus();
                    }
                }
            }
            ;
            // Displays the submenu for the current target
            function showSubmenu(currentTarget) {
                // Check to see if this menu item is already active
                if (!currentTarget.classList.contains("active")) {
                    var submenuId = currentTarget.getAttribute("data-plugin-contextmenu");
                    if (submenuId !== null && typeof (submenuId) !== "undefined") {
                        // Set the menu item's active state
                        currentTarget.classList.add("active");
                        // Set the submenu's z-index
                        var submenu = document.getElementById(submenuId);
                        submenu.style.zIndex = (parseInt(getComputedStyle(currentTarget.parentElement).getPropertyValue("z-index")) + 1).toString();
                        // Calculate submenu coordinates
                        var parentWidth = parseInt(getComputedStyle(currentTarget.parentElement).getPropertyValue("width"));
                        var xPosition = parentWidth + parseInt(getComputedStyle(currentTarget.parentElement).getPropertyValue("left")) - window.pageXOffset;
                        var yPosition = currentTarget.offsetTop + parseInt(getComputedStyle(currentTarget.parentElement).getPropertyValue("top")) - window.pageYOffset;
                        // Subtract 3 from the parent width so that the submenu overlaps the parent menu  
                        var parentWidthOffset = parentWidth - 3;
                        adjustMenuItemWidth(submenu);
                        _positionHelpers.show(submenu, null, xPosition, yPosition, currentTarget.offsetTop, parentWidthOffset, null, positionContextMenuInsideAirspace, host.show.bind(host));
                    }
                }
            }
            ;
            function onMenuItemKeyDown(event) {
                var target = event.target;
                switch (event.keyCode) {
                    case 13:
                        // enter key
                        showSubmenu(target);
                        target.click();
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case 39:
                        // right arrow key
                        showSubmenu(target);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                }
            }
            ;
            function onContextMenuKeyDown(event) {
                var elementToFocus;
                var target = event.target;
                var currentTarget = event.currentTarget;
                var menuItems = currentTarget.getElementsByClassName("menuitem");
                var startIndex = getMenuItemStartIndex(target, currentTarget, menuItems);
                switch (event.keyCode) {
                    case 9:
                        // tab key
                        if (!event.shiftKey) {
                            elementToFocus = getNextMenuItem(startIndex, menuItems);
                        }
                        else {
                            // shift + tab
                            elementToFocus = getPreviousMenuItem(startIndex, menuItems);
                        }
                        event.preventDefault();
                        break;
                    case 18:
                        // alt key
                        dismissAll();
                        break;
                    case 27:
                        // escape key
                        handleDismissCurrent(currentTarget, false);
                        event.preventDefault();
                        break;
                    case 35:
                        // end key
                        // Find the last active menu item
                        elementToFocus = getPreviousMenuItem(0, menuItems);
                        event.preventDefault();
                        break;
                    case 36:
                        // home key
                        // Find the first active menu item
                        elementToFocus = getNextMenuItem(0, menuItems);
                        event.preventDefault();
                        break;
                    case 37:
                        // left arrow key
                        handleDismissCurrent(currentTarget, true);
                        event.preventDefault();
                        break;
                    case 38:
                        // up arrow key
                        elementToFocus = getPreviousMenuItem(startIndex, menuItems);
                        event.preventDefault();
                        break;
                    case 40:
                        // down arrow key
                        elementToFocus = getNextMenuItem(startIndex, menuItems);
                        event.preventDefault();
                        break;
                    case 93:
                        // menu key
                        dismissAll();
                        event.preventDefault();
                        break;
                }
                if (elementToFocus) {
                    elementToFocus.focus();
                }
            }
            ;
            // If an accessibility tool triggers a toggle on a checkbox menuitem,
            // then simulate the click event so the plugin knows to change its internal state.
            function onAttrModified(event) {
                // attrChange = 1 means an attribute's value changed (rather than the attribute being added[2] or removed[3])
                if (event.attrName === "aria-checked" && event.attrChange === 1) {
                    handlePopupMenuItemClick(event);
                }
            }
            ;
        })(ContextMenu = Plugin.ContextMenu || (Plugin.ContextMenu = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var VS;
        (function (VS) {
            var Utilities;
            (function (Utilities) {
                "use strict";
                function createExternalObject(fileAlias, clsid) {
                    return window.external.createExternalObject(fileAlias, clsid);
                }
                Utilities.createExternalObject = createExternalObject;
            })(Utilities = VS.Utilities || (VS.Utilities = {}));
        })(VS = Plugin.VS || (Plugin.VS = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var PerfAnalytics;
        (function (PerfAnalytics) {
            "use strict";
            var host = loadModule("plugin.host.perfanalytics");
            function isArgArray(arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            }
            function raiseEvent(id, data) {
                // TS won't allow you to pass a non-array here but straight JS callers could, so if we get a non-array make sure
                // we always pass the host an array, as that is our contract with them.
                if (data && !isArgArray(data)) {
                    data = [data];
                }
                host.raiseEvent(id, data);
            }
            PerfAnalytics.raiseEvent = raiseEvent;
            function raiseEventWithKey(id, key, data) {
                var argArray = [key];
                if (data) {
                    // TS won't allow you to pass a non-array here but straight JS callers could, so if we get a non-array make sure
                    // we always pass the host an array, as that is our contract with them.
                    if (!isArgArray(data)) {
                        data = [data];
                    }
                    argArray = argArray.concat(data);
                }
                raiseEvent(id, argArray);
            }
            PerfAnalytics.raiseEventWithKey = raiseEventWithKey;
        })(PerfAnalytics = Plugin.PerfAnalytics || (Plugin.PerfAnalytics = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var TelemetryAnalytics;
        (function (TelemetryAnalytics) {
            "use strict";
            var host = loadModule("plugin.host.telemetryanalytics");
            function isNumberIntegral(num) {
                return ((num % 1) === 0);
            }
            function validateArrayContainsAcceptableTypes(data) {
                for (var i = 0; i < data.length; i++) {
                    var type = typeof data[i];
                    if (type !== "number" && type !== "string" && type !== "boolean") {
                        throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8000"));
                    }
                }
            }
            function postSimpleEvent(eventName) {
                if (!eventName) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8003"));
                }
                host.postSimpleEvent(eventName);
            }
            TelemetryAnalytics.postSimpleEvent = postSimpleEvent;
            function postEvent(eventName, keys, values) {
                if (!eventName) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8003"));
                }
                if (!keys) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8003"));
                }
                if (keys.length === 0) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8004"));
                }
                if (!values) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8003"));
                }
                if (values.length === 0) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8004"));
                }
                if (values.length !== keys.length) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.8006"));
                }
                validateArrayContainsAcceptableTypes(values);
                host.postEvent(eventName, keys, values);
            }
            TelemetryAnalytics.postEvent = postEvent;
        })(TelemetryAnalytics = Plugin.TelemetryAnalytics || (Plugin.TelemetryAnalytics = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
var Microsoft;
(function (Microsoft) {
    var Plugin;
    (function (Plugin) {
        var SQMAnalytics;
        (function (SQMAnalytics) {
            "use strict";
            function addDataToStream(dataPointId, data) {
                // SQM deprecation
            }
            SQMAnalytics.addDataToStream = addDataToStream;
            function logBooleanData(dataPointId, data) {
                // SQM deprecation
            }
            SQMAnalytics.logBooleanData = logBooleanData;
            function logNumericData(dataPointId, data) {
                // SQM deprecation
            }
            SQMAnalytics.logNumericData = logNumericData;
            function logStringData(dataPointId, data) {
                // SQM deprecation
            }
            SQMAnalytics.logStringData = logStringData;
        })(SQMAnalytics = Plugin.SQMAnalytics || (Plugin.SQMAnalytics = {}));
    })(Plugin = Microsoft.Plugin || (Microsoft.Plugin = {}));
})(Microsoft || (Microsoft = {}));
(function baseInit(global, undefined) {
    "use strict";

    // Polyfills for Debug support that is only available in IE11 (and partially in IE10, which is why we don't simply
    // stomp over the entire Debug object, because some fields (like debuggerEnabled) do in fact exist in IE10 and we want
    // them to keep their true value).
    // 
    // We have to do the more verbose testing (if !<field> / if typeof <field> === "undefined") instead of the more normal 
    // pattern of field = (<field> || <value) because the fields are all readonly and if they exist, trying to set them, even 
    // to their current value, throws a runtime exception.
    Debug = (Debug || {});
    if (!Debug.msTraceAsyncOperationStarting) {
        Debug.msTraceAsyncOperationStarting = function () { return 0; };
    }

    if (!Debug.msTraceAsyncOperationCompleted) {
        Debug.msTraceAsyncOperationCompleted = function () { };
    }
    
    if (!Debug.msTraceAsyncCallbackStarting) {
        Debug.msTraceAsyncCallbackStarting = function () { };
    }

    if (!Debug.msTraceAsyncCallbackCompleted) {
        Debug.msTraceAsyncCallbackCompleted = function () { };
    }

    // We use typeof here instead of just if (!Debug.MS_ASYNC_CALLBACK_STATUS_ASSIGN_DELEGATE) because these are 
    // numeric fields and one (MS_ASYNC_CALLBACK_STATUS_ASSIGN_DELEGATE) has the value of 0, which evaluates to false.
    if (typeof Debug.MS_ASYNC_CALLBACK_STATUS_ASSIGN_DELEGATE === "undefined") {
        Debug.MS_ASYNC_CALLBACK_STATUS_ASSIGN_DELEGATE = 0;
    }

    if (typeof Debug.MS_ASYNC_CALLBACK_STATUS_CANCEL === "undefined") {
        Debug.MS_ASYNC_CALLBACK_STATUS_CANCEL = 3;
    }

    if (typeof Debug.MS_ASYNC_CALLBACK_STATUS_CHOOSEANY === "undefined") {
        Debug.MS_ASYNC_CALLBACK_STATUS_CHOOSEANY = 2;
    }

    if (typeof Debug.MS_ASYNC_CALLBACK_STATUS_ERROR === "undefined") {
        Debug.MS_ASYNC_CALLBACK_STATUS_ERROR = 4;
    }

    if (typeof Debug.MS_ASYNC_CALLBACK_STATUS_JOIN === "undefined") {
        Debug.MS_ASYNC_CALLBACK_STATUS_JOIN = 1;
    }

    if (typeof Debug.MS_ASYNC_OP_STATUS_CANCELED === "undefined") {
        Debug.MS_ASYNC_OP_STATUS_CANCELED = 2;
    }

    if (typeof Debug.MS_ASYNC_OP_STATUS_ERROR === "undefined") {
        Debug.MS_ASYNC_OP_STATUS_ERROR = 3;
    }

    if (typeof Debug.MS_ASYNC_OP_STATUS_SUCCESS === "undefined") {
        Debug.MS_ASYNC_OP_STATUS_SUCCESS = 1;
    }

    if (typeof Debug.debuggerEnabled === "undefined") {
        Debug.debuggerEnabled = false;
    }

    function initializeProperties(target, members, prefix) {
        var keys = Object.keys(members);
        var properties;
        var i, len;
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var enumerable = key.charCodeAt(0) !== /*_*/95;
            var member = members[key];
            if (member && typeof member === 'object') {
                if (member.value !== undefined || typeof member.get === 'function' || typeof member.set === 'function') {
                    if (member.enumerable === undefined) {
                        member.enumerable = enumerable;
                    }
                    if (prefix && member.setName && typeof member.setName === 'function') {
                        member.setName(prefix + "." + key)
                    }
                    properties = properties || {};
                    properties[key] = member;
                    continue;
                }
            }
            if (!enumerable) {
                properties = properties || {};
                properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true }
                continue;
            }
            target[key] = member;
        }
        if (properties) {
            Object.defineProperties(target, properties);
        }
    }

    (function (rootNamespace) {

        // Create the rootNamespace in the global namespace
        if (!global[rootNamespace]) {
            global[rootNamespace] = Object.create(Object.prototype);
        }

        // Cache the rootNamespace we just created in a local variable
        var _rootNamespace = global[rootNamespace];
        if (!_rootNamespace.Namespace) {
            _rootNamespace.Namespace = Object.create(Object.prototype);
        }

        function defineWithParent(parentNamespace, name, members) {
            /// <signature helpKeyword="PluginUtilities.Namespace.defineWithParent">
            /// <summary locid="PluginUtilities.Namespace.defineWithParent">
            /// Defines a new namespace with the specified name under the specified parent namespace.
            /// </summary>
            /// <param name="parentNamespace" type="Object" locid="PluginUtilities.Namespace.defineWithParent_p:parentNamespace">
            /// The parent namespace.
            /// </param>
            /// <param name="name" type="String" locid="PluginUtilities.Namespace.defineWithParent_p:name">
            /// The name of the new namespace.
            /// </param>
            /// <param name="members" type="Object" locid="PluginUtilities.Namespace.defineWithParent_p:members">
            /// The members of the new namespace.
            /// </param>
            /// <returns type="Object" locid="PluginUtilities.Namespace.defineWithParent_returnValue">
            /// The newly-defined namespace.
            /// </returns>
            /// </signature>
            var currentNamespace = parentNamespace || {};

            if (name) {
                var namespaceFragments = name.split(".");
                for (var i = 0, len = namespaceFragments.length; i < len; i++) {
                    var namespaceName = namespaceFragments[i];
                    if (!currentNamespace[namespaceName]) {
                        Object.defineProperty(currentNamespace, namespaceName,
                            { value: {}, writable: false, enumerable: true, configurable: true }
                        );
                    }
                    currentNamespace = currentNamespace[namespaceName];
                }
            }

            if (members) {
                initializeProperties(currentNamespace, members, name || "<ANONYMOUS>");
            }

            return currentNamespace;
        }

        function define(name, members) {
            /// <signature helpKeyword="PluginUtilities.Namespace.define">
            /// <summary locid="PluginUtilities.Namespace.define">
            /// Defines a new namespace with the specified name.
            /// </summary>
            /// <param name="name" type="String" locid="PluginUtilities.Namespace.define_p:name">
            /// The name of the namespace. This could be a dot-separated name for nested namespaces.
            /// </param>
            /// <param name="members" type="Object" locid="PluginUtilities.Namespace.define_p:members">
            /// The members of the new namespace.
            /// </param>
            /// <returns type="Object" locid="PluginUtilities.Namespace.define_returnValue">
            /// The newly-defined namespace.
            /// </returns>
            /// </signature>
            return defineWithParent(global, name, members);
        }

        var LazyStates = {
            uninitialized: 1,
            working: 2,
            initialized: 3,
        };

        function lazy(f) {
            if (typeof f === "string") {
                var target = f;
                f = function () {
                    return PluginUtilities.Utilities.getMember(target);
                };
            }
            var name;
            var state = LazyStates.uninitialized;
            var result;
            return {
                setName: function (value) {
                    name = value;
                },
                get: function () {
                    switch (state) {
                        case LazyStates.initialized:
                            return result;

                        case LazyStates.uninitialized:
                            state = LazyStates.working;
                            try {
                                msWriteProfilerMark("PluginUtilities.Namespace._lazy:" + name + ",StartTM");
                                result = f();
                            } finally {
                                msWriteProfilerMark("PluginUtilities.Namespace._lazy:" + name + ",StopTM");
                                state = LazyStates.uninitialized;
                            }
                            f = null;
                            state = LazyStates.initialized;
                            return result;

                        case LazyStates.working:
                            throw "Illegal: reentrancy on initialization";

                        default:
                            throw "Illegal";
                    }
                },
                set: function (value) {
                    switch (state) {
                        case LazyStates.working:
                            throw "Illegal: reentrancy on initialization";
                        
                        default:
                            state = LazyStates.initialized;
                            result = value;
                            break;
                    }
                },
                enumerable: true,
                configurable: true,
            }
        }

        // Establish members of the "PluginUtilities.Namespace" namespace
        Object.defineProperties(_rootNamespace.Namespace, {

            defineWithParent: { value: defineWithParent, writable: true, enumerable: true, configurable: true },

            define: { value: define, writable: true, enumerable: true, configurable: true },

            _lazy: { value: lazy, writable: true, enumerable: true, configurable: true },

        });

    })("PluginUtilities");

    (function (PluginUtilities) {

        function define(constructor, instanceMembers, staticMembers) {
            /// <signature helpKeyword="PluginUtilities.Class.define">
            /// <summary locid="PluginUtilities.Class.define">
            /// Defines a class using the given constructor and the specified instance members.
            /// </summary>
            /// <param name="constructor" type="Function" locid="PluginUtilities.Class.define_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <param name="instanceMembers" type="Object" locid="PluginUtilities.Class.define_p:instanceMembers">
            /// The set of instance fields, properties, and methods made available on the class.
            /// </param>
            /// <param name="staticMembers" type="Object" locid="PluginUtilities.Class.define_p:staticMembers">
            /// The set of static fields, properties, and methods made available on the class.
            /// </param>
            /// <returns type="Function" locid="PluginUtilities.Class.define_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            constructor = constructor || function () { };
            PluginUtilities.Utilities.markSupportedForProcessing(constructor);
            if (instanceMembers) {
                initializeProperties(constructor.prototype, instanceMembers);
            }
            if (staticMembers) {
                initializeProperties(constructor, staticMembers);
            }
            return constructor;
        }

        function derive(baseClass, constructor, instanceMembers, staticMembers) {
            /// <signature helpKeyword="PluginUtilities.Class.derive">
            /// <summary locid="PluginUtilities.Class.derive">
            /// Creates a sub-class based on the supplied baseClass parameter, using prototypal inheritance.
            /// </summary>
            /// <param name="baseClass" type="Function" locid="PluginUtilities.Class.derive_p:baseClass">
            /// The class to inherit from.
            /// </param>
            /// <param name="constructor" type="Function" locid="PluginUtilities.Class.derive_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <param name="instanceMembers" type="Object" locid="PluginUtilities.Class.derive_p:instanceMembers">
            /// The set of instance fields, properties, and methods to be made available on the class.
            /// </param>
            /// <param name="staticMembers" type="Object" locid="PluginUtilities.Class.derive_p:staticMembers">
            /// The set of static fields, properties, and methods to be made available on the class.
            /// </param>
            /// <returns type="Function" locid="PluginUtilities.Class.derive_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            if (baseClass) {
                constructor = constructor || function () { };
                var basePrototype = baseClass.prototype;
                constructor.prototype = Object.create(basePrototype);
                PluginUtilities.Utilities.markSupportedForProcessing(constructor);
                Object.defineProperty(constructor.prototype, "constructor", { value: constructor, writable: true, configurable: true, enumerable: true });
                if (instanceMembers) {
                    initializeProperties(constructor.prototype, instanceMembers);
                }
                if (staticMembers) {
                    initializeProperties(constructor, staticMembers);
                }
                return constructor;
            } else {
                return define(constructor, instanceMembers, staticMembers);
            }
        }

        function mix(constructor) {
            /// <signature helpKeyword="PluginUtilities.Class.mix">
            /// <summary locid="PluginUtilities.Class.mix">
            /// Defines a class using the given constructor and the union of the set of instance members
            /// specified by all the mixin objects. The mixin parameter list is of variable length.
            /// </summary>
            /// <param name="constructor" locid="PluginUtilities.Class.mix_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <returns type="Function" locid="PluginUtilities.Class.mix_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            constructor = constructor || function () { };
            var i, len;
            for (i = 1, len = arguments.length; i < len; i++) {
                initializeProperties(constructor.prototype, arguments[i]);
            }
            return constructor;
        }

        // Establish members of "PluginUtilities.Class" namespace
        PluginUtilities.Namespace.define("PluginUtilities.Class", {
            define: define,
            derive: derive,
            mix: mix
        });

    })(PluginUtilities);

})(this);

(function baseUtilsInit(global, PluginUtilities) {
    "use strict";

    var hasWinRT = !!global.Windows;

    var strings = {
        get notSupportedForProcessing() { return PluginUtilities.Resources._getPluginUtilitiesString("base/notSupportedForProcessing").value; }
    };

    function nop(v) {
        return v;
    }

    function getMemberFiltered(name, root, filter) {
        return name.split(".").reduce(function (currentNamespace, name) {
            if (currentNamespace) {
                return filter(currentNamespace[name]);
            }
            return null;
        }, root);
    }

    // Establish members of "PluginUtilities.Utilities" namespace
    PluginUtilities.Namespace.define("PluginUtilities.Utilities", {
        // Used for mocking in tests
        _setHasWinRT: {
            value: function (value) {
                hasWinRT = value;
            },
            configurable: false,
            writable: false,
            enumerable: false
        },

        /// <field type="Boolean" locid="PluginUtilities.Utilities.hasWinRT" helpKeyword="PluginUtilities.Utilities.hasWinRT">Determine if WinRT is accessible in this script context.</field>
        hasWinRT: {
            get: function () { return hasWinRT; },
            configurable: false,
            enumerable: true
        },

        _getMemberFiltered: getMemberFiltered,

        getMember: function (name, root) {
            /// <signature helpKeyword="PluginUtilities.Utilities.getMember">
            /// <summary locid="PluginUtilities.Utilities.getMember">
            /// Gets the leaf-level type or namespace specified by the name parameter.
            /// </summary>
            /// <param name="name" locid="PluginUtilities.Utilities.getMember_p:name">
            /// The name of the member.
            /// </param>
            /// <param name="root" locid="PluginUtilities.Utilities.getMember_p:root">
            /// The root to start in. Defaults to the global object.
            /// </param>
            /// <returns type="Object" locid="PluginUtilities.Utilities.getMember_returnValue">
            /// The leaf-level type or namespace in the specified parent namespace.
            /// </returns>
            /// </signature>
            if (!name) {
                return null;
            }
            return getMemberFiltered(name, root || global, nop);
        },

        ready: function (callback, async) {
            /// <signature helpKeyword="PluginUtilities.Utilities.ready">
            /// <summary locid="PluginUtilities.Utilities.ready">
            /// Ensures that the specified function executes only after the DOMContentLoaded event has fired
            /// for the current page.
            /// </summary>
            /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Utilities.ready_returnValue">A promise that completes after DOMContentLoaded has occurred.</returns>
            /// <param name="callback" optional="true" locid="PluginUtilities.Utilities.ready_p:callback">
            /// A function that executes after DOMContentLoaded has occurred.
            /// </param>
            /// <param name="async" optional="true" locid="PluginUtilities.Utilities.ready_p:async">
            /// If true, the callback is executed asynchronously.
            /// </param>
            /// </signature>
            return new PluginUtilities.Promise(function (c, e) {
                function complete() {
                    if (callback) {
                        try {
                            callback();
                            c();
                        }
                        catch (err) {
                            e(err);
                        }
                    }
                    else {
                        c();
                    }
                }

                var readyState = PluginUtilities.Utilities.testReadyState;
                if (!readyState) {
                    if (global.document) {
                        readyState = document.readyState;
                    }
                    else {
                        readyState = "complete";
                    }
                }
                if (readyState === "complete" || (global.document && document.body !== null)) {
                    if (async) {
                        PluginUtilities.Utilities.Scheduler.schedule(function () {
                            complete();
                        }, PluginUtilities.Utilities.Scheduler.Priority.normal, null, "PluginUtilities.Utilities.ready");
                    }
                    else {
                        complete();
                    }
                }
                else {
                    global.addEventListener("DOMContentLoaded", complete, false);
                }
            });
        },

        /// <field type="Boolean" locid="PluginUtilities.Utilities.strictProcessing" helpKeyword="PluginUtilities.Utilities.strictProcessing">Determines if strict declarative processing is enabled in this script context.</field>
        strictProcessing: {
            get: function () { return true; },
            configurable: false,
            enumerable: true,
        },

        markSupportedForProcessing: {
            value: function (func) {
                /// <signature helpKeyword="PluginUtilities.Utilities.markSupportedForProcessing">
                /// <summary locid="PluginUtilities.Utilities.markSupportedForProcessing">
                /// Marks a function as being compatible with declarative processing, such as PluginUtilities.UI.processAll
                /// or PluginUtilities.Binding.processAll.
                /// </summary>
                /// <param name="func" type="Function" locid="PluginUtilities.Utilities.markSupportedForProcessing_p:func">
                /// The function to be marked as compatible with declarative processing.
                /// </param>
                /// <returns type="Function" locid="PluginUtilities.Utilities.markSupportedForProcessing_returnValue">
                /// The input function.
                /// </returns>
                /// </signature>
                func.supportedForProcessing = true;
                return func;
            },
            configurable: false,
            writable: false,
            enumerable: true
        },

        requireSupportedForProcessing: {
            value: function (value) {
                /// <signature helpKeyword="PluginUtilities.Utilities.requireSupportedForProcessing">
                /// <summary locid="PluginUtilities.Utilities.requireSupportedForProcessing">
                /// Asserts that the value is compatible with declarative processing, such as PluginUtilities.UI.processAll
                /// or PluginUtilities.Binding.processAll. If it is not compatible an exception will be thrown.
                /// </summary>
                /// <param name="value" type="Object" locid="PluginUtilities.Utilities.requireSupportedForProcessing_p:value">
                /// The value to be tested for compatibility with declarative processing. If the
                /// value is a function it must be marked with a property 'supportedForProcessing'
                /// with a value of true.
                /// </param>
                /// <returns type="Object" locid="PluginUtilities.Utilities.requireSupportedForProcessing_returnValue">
                /// The input value.
                /// </returns>
                /// </signature>
                var supportedForProcessing = true;

                supportedForProcessing = supportedForProcessing && !(value === global);
                supportedForProcessing = supportedForProcessing && !(value === global.location);
                supportedForProcessing = supportedForProcessing && !(value instanceof HTMLIFrameElement);
                supportedForProcessing = supportedForProcessing && !(typeof value === "function" && !value.supportedForProcessing);

                switch (global.frames.length) {
                    case 0:
                        break;

                    case 1:
                        supportedForProcessing = supportedForProcessing && !(value === global.frames[0]);
                        break;

                    default:
                        for (var i = 0, len = global.frames.length; supportedForProcessing && i < len; i++) {
                            supportedForProcessing = supportedForProcessing && !(value === global.frames[i]);
                        }
                        break;
                }

                if (supportedForProcessing) {
                    return value;
                }

                throw new PluginUtilities.ErrorFromName("PluginUtilities.Utilities.requireSupportedForProcessing", PluginUtilities.Resources._formatString(strings.notSupportedForProcessing, value));
            },
            configurable: false,
            writable: false,
            enumerable: true
        },

        _shallowCopy: function _shallowCopy(a) {
            // Shallow copy a single object.
            return this._mergeAll([a]);
        },

        _merge: function _merge(a, b) {
            // Merge 2 objects together into a new object
            return this._mergeAll([a, b]);
        },

        _mergeAll: function _mergeAll(list) {
            // Merge a list of objects together
            var o = {};
            list.forEach(function (part) {
                Object.keys(part).forEach(function (k) {
                    o[k] = part[k];
                });
            });
            return o;
        },
        
        _getProfilerMarkIdentifier: function (element) {
            var profilerMarkIdentifier = "";
            if (element.id) {
                profilerMarkIdentifier += " id='" + element.id + "'";
            }
            if (element.className) {
                profilerMarkIdentifier += " class='" + element.className + "'";
            }
            return profilerMarkIdentifier;
        }
    });

    PluginUtilities.Namespace.define("PluginUtilities", {
        validation: false,

        strictProcessing: {
            value: function () {
                /// <signature helpKeyword="PluginUtilities.strictProcessing">
                /// <summary locid="PluginUtilities.strictProcessing">
                /// Strict processing is always enforced, this method has no effect.
                /// </summary>
                /// </signature>
            },
            configurable: false,
            writable: false,
            enumerable: false
        },
    });
})(this, PluginUtilities);

(function logInit() {
    "use strict";

    var spaceR = /\s+/g;
    var typeR = /^(error|warn|info|log)$/;

    function format(message, tag, type) {
        /// <signature helpKeyword="PluginUtilities.Utilities.formatLog">
        /// <summary locid="PluginUtilities.Utilities.formatLog">
        /// Adds tags and type to a logging message.
        /// </summary>
        /// <param name="message" type="String" locid="PluginUtilities.Utilities.startLog_p:message">The message to format.</param>
        /// <param name="tag" type="String" locid="PluginUtilities.Utilities.startLog_p:tag">
        /// The tag(s) to apply to the message. Separate multiple tags with spaces.
        /// </param>
        /// <param name="type" type="String" locid="PluginUtilities.Utilities.startLog_p:type">The type of the message.</param>
        /// <returns type="String" locid="PluginUtilities.Utilities.startLog_returnValue">The formatted message.</returns>
        /// </signature>
        var m = message;
        if (typeof (m) === "function") { m = m(); }

        return ((type && typeR.test(type)) ? ("") : (type ? (type + ": ") : "")) +
            (tag ? tag.replace(spaceR, ":") + ": " : "") +
            m;
    }
    function defAction(message, tag, type) {
        var m = PluginUtilities.Utilities.formatLog(message, tag, type);
        console[(type && typeR.test(type)) ? type : "log"](m);
    }
    function escape(s) {
        // \s (whitespace) is used as separator, so don't escape it
        return s.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    }
    PluginUtilities.Namespace.define("PluginUtilities.Utilities", {
        startLog: function (options) {
            /// <signature helpKeyword="PluginUtilities.Utilities.startLog">
            /// <summary locid="PluginUtilities.Utilities.startLog">
            /// Configures a logger that writes messages containing the specified tags from PluginUtilities.log to console.log.
            /// </summary>
            /// <param name="options" type="String" locid="PluginUtilities.Utilities.startLog_p:options">
            /// The tags for messages to log. Separate multiple tags with spaces.
            /// </param>
            /// </signature>
            /// <signature>
            /// <summary locid="PluginUtilities.Utilities.startLog2">
            /// Configure a logger to write PluginUtilities.log output.
            /// </summary>
            /// <param name="options" type="Object" locid="PluginUtilities.Utilities.startLog_p:options2">
            /// May contain .type, .tags, .excludeTags and .action properties.
            /// - .type is a required tag.
            /// - .excludeTags is a space-separated list of tags, any of which will result in a message not being logged.
            /// - .tags is a space-separated list of tags, any of which will result in a message being logged.
            /// - .action is a function that, if present, will be called with the log message, tags and type. The default is to log to the console.
            /// </param>
            /// </signature>
            options = options || {};
            if (typeof options === "string") {
                options = { tags: options };
            }
            var el = options.type && new RegExp("^(" + escape(options.type).replace(spaceR, " ").split(" ").join("|") + ")$");
            var not = options.excludeTags && new RegExp("(^|\\s)(" + escape(options.excludeTags).replace(spaceR, " ").split(" ").join("|") + ")(\\s|$)", "i");
            var has = options.tags && new RegExp("(^|\\s)(" + escape(options.tags).replace(spaceR, " ").split(" ").join("|") + ")(\\s|$)", "i");
            var action = options.action || defAction;

            if (!el && !not && !has && !PluginUtilities.log) {
                PluginUtilities.log = action;
                return;
            }

            var result = function (message, tag, type) {
                if (!((el && !el.test(type))          // if the expected log level is not satisfied
                    || (not && not.test(tag))         // if any of the excluded categories exist
                    || (has && !has.test(tag)))) {    // if at least one of the included categories doesn't exist
                        action(message, tag, type);
                    }

                result.next && result.next(message, tag, type);
            };
            result.next = PluginUtilities.log;
            PluginUtilities.log = result;
        },
        stopLog: function () {
            /// <signature helpKeyword="PluginUtilities.Utilities.stopLog">
            /// <summary locid="PluginUtilities.Utilities.stopLog">
            /// Removes the previously set up logger.
            /// </summary>
            /// </signature>
            delete PluginUtilities.log;
        },
        formatLog: format
    });
})();

(function eventsInit(PluginUtilities, undefined) {
    "use strict";


    function createEventProperty(name) {
        var eventPropStateName = "_on" + name + "state";

        return {
            get: function () {
                var state = this[eventPropStateName];
                return state && state.userHandler;
            },
            set: function (handler) {
                var state = this[eventPropStateName];
                if (handler) {
                    if (!state) {
                        state = { wrapper: function (evt) { return state.userHandler(evt); }, userHandler: handler };
                        Object.defineProperty(this, eventPropStateName, { value: state, enumerable: false, writable:true, configurable: true });
                        this.addEventListener(name, state.wrapper, false);
                    }
                    state.userHandler = handler;
                } else if (state) {
                    this.removeEventListener(name, state.wrapper, false);
                    this[eventPropStateName] = null;
                }
            },
            enumerable: true
        }
    }

    function createEventProperties(events) {
        /// <signature helpKeyword="PluginUtilities.Utilities.createEventProperties">
        /// <summary locid="PluginUtilities.Utilities.createEventProperties">
        /// Creates an object that has one property for each name passed to the function.
        /// </summary>
        /// <param name="events" locid="PluginUtilities.Utilities.createEventProperties_p:events">
        /// A variable list of property names.
        /// </param>
        /// <returns type="Object" locid="PluginUtilities.Utilities.createEventProperties_returnValue">
        /// The object with the specified properties. The names of the properties are prefixed with 'on'.
        /// </returns>
        /// </signature>
        var props = {};
        for (var i = 0, len = arguments.length; i < len; i++) {
            var name = arguments[i];
            props["on" + name] = createEventProperty(name);
        }
        return props;
    }

    var EventMixinEvent = PluginUtilities.Class.define(
        function EventMixinEvent_ctor(type, detail, target) {
            this.detail = detail;
            this.target = target;
            this.timeStamp = Date.now();
            this.type = type;
        },
        {
            bubbles: { value: false, writable: false },
            cancelable: { value: false, writable: false },
            currentTarget: {
                get: function () { return this.target; }
            },
            defaultPrevented: {
                get: function () { return this._preventDefaultCalled; }
            },
            trusted: { value: false, writable: false },
            eventPhase: { value: 0, writable: false },
            target: null,
            timeStamp: null,
            type: null,

            preventDefault: function () {
                this._preventDefaultCalled = true;
            },
            stopImmediatePropagation: function () {
                this._stopImmediatePropagationCalled = true;
            },
            stopPropagation: function () {
            }
        }, {
            supportedForProcessing: false,
        }
    );

    var eventMixin = {
        _listeners: null,

        addEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="PluginUtilities.Utilities.eventMixin.addEventListener">
            /// <summary locid="PluginUtilities.Utilities.eventMixin.addEventListener">
            /// Adds an event listener to the control.
            /// </summary>
            /// <param name="type" locid="PluginUtilities.Utilities.eventMixin.addEventListener_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="listener" locid="PluginUtilities.Utilities.eventMixin.addEventListener_p:listener">
            /// The listener to invoke when the event is raised.
            /// </param>
            /// <param name="useCapture" locid="PluginUtilities.Utilities.eventMixin.addEventListener_p:useCapture">
            /// if true initiates capture, otherwise false.
            /// </param>
            /// </signature>
            useCapture = useCapture || false;
            this._listeners = this._listeners || {};
            var eventListeners = (this._listeners[type] = this._listeners[type] || []);
            for (var i = 0, len = eventListeners.length; i < len; i++) {
                var l = eventListeners[i];
                if (l.useCapture === useCapture && l.listener === listener) {
                    return;
                }
            }
            eventListeners.push({ listener: listener, useCapture: useCapture });
        },
        dispatchEvent: function (type, details) {
            /// <signature helpKeyword="PluginUtilities.Utilities.eventMixin.dispatchEvent">
            /// <summary locid="PluginUtilities.Utilities.eventMixin.dispatchEvent">
            /// Raises an event of the specified type and with the specified additional properties.
            /// </summary>
            /// <param name="type" locid="PluginUtilities.Utilities.eventMixin.dispatchEvent_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="details" locid="PluginUtilities.Utilities.eventMixin.dispatchEvent_p:details">
            /// The set of additional properties to be attached to the event object when the event is raised.
            /// </param>
            /// <returns type="Boolean" locid="PluginUtilities.Utilities.eventMixin.dispatchEvent_returnValue">
            /// true if preventDefault was called on the event.
            /// </returns>
            /// </signature>
            var listeners = this._listeners && this._listeners[type];
            if (listeners) {
                var eventValue = new EventMixinEvent(type, details, this);
                // Need to copy the array to protect against people unregistering while we are dispatching
                listeners = listeners.slice(0, listeners.length);
                for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++) {
                    listeners[i].listener(eventValue);
                }
                return eventValue.defaultPrevented || false;
            }
            return false;
        },
        removeEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="PluginUtilities.Utilities.eventMixin.removeEventListener">
            /// <summary locid="PluginUtilities.Utilities.eventMixin.removeEventListener">
            /// Removes an event listener from the control.
            /// </summary>
            /// <param name="type" locid="PluginUtilities.Utilities.eventMixin.removeEventListener_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="listener" locid="PluginUtilities.Utilities.eventMixin.removeEventListener_p:listener">
            /// The listener to remove.
            /// </param>
            /// <param name="useCapture" locid="PluginUtilities.Utilities.eventMixin.removeEventListener_p:useCapture">
            /// Specifies whether to initiate capture.
            /// </param>
            /// </signature>
            useCapture = useCapture || false;
            var listeners = this._listeners && this._listeners[type];
            if (listeners) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var l = listeners[i];
                    if (l.listener === listener && l.useCapture === useCapture) {
                        listeners.splice(i, 1);
                        if (listeners.length === 0) {
                            delete this._listeners[type];
                        }
                        // Only want to remove one element for each call to removeEventListener
                        break;
                    }
                }
            }
        }
    };

    PluginUtilities.Namespace.define("PluginUtilities.Utilities", {
        _createEventProperty: createEventProperty,
        createEventProperties: createEventProperties,
        eventMixin: eventMixin
    });

})(PluginUtilities);

(function promiseInit(global, undefined) {
    "use strict";

    global.Debug && (global.Debug.setNonUserCodeExceptions = true);

    var ListenerType = PluginUtilities.Class.mix(PluginUtilities.Class.define(null, { /*empty*/ }, { supportedForProcessing: false }), PluginUtilities.Utilities.eventMixin);
    var promiseEventListeners = new ListenerType();
    // make sure there is a listeners collection so that we can do a more trivial check below
    promiseEventListeners._listeners = {};
    var errorET = "error";
    var canceledName = "Canceled";
    var tagWithStack = false;
    var tag = {
        promise: 0x01,
        thenPromise: 0x02,
        errorPromise: 0x04,
        exceptionPromise: 0x08,
        completePromise: 0x10,
    };
    tag.all = tag.promise | tag.thenPromise | tag.errorPromise | tag.exceptionPromise | tag.completePromise;

    //
    // Global error counter, for each error which enters the system we increment this once and then
    // the error number travels with the error as it traverses the tree of potential handlers.
    //
    // When someone has registered to be told about errors (PluginUtilities.Promise.callonerror) promises
    // which are in error will get tagged with a ._errorId field. This tagged field is the
    // contract by which nested promises with errors will be identified as chaining for the
    // purposes of the callonerror semantics. If a nested promise in error is encountered without
    // a ._errorId it will be assumed to be foreign and treated as an interop boundary and
    // a new error id will be minted.
    //
    var error_number = 1;

    //
    // The state machine has a interesting hiccup in it with regards to notification, in order
    // to flatten out notification and avoid recursion for synchronous completion we have an
    // explicit set of *_notify states which are responsible for notifying their entire tree
    // of children. They can do this because they know that immediate children are always
    // ThenPromise instances and we can therefore reach into their state to access the
    // _listeners collection.
    //
    // So, what happens is that a Promise will be fulfilled through the _completed or _error
    // messages at which point it will enter a *_notify state and be responsible for to move
    // its children into an (as appropriate) success or error state and also notify that child's
    // listeners of the state transition, until leaf notes are reached.
    //

    var state_created,              // -> working
        state_working,              // -> error | error_notify | success | success_notify | canceled | waiting
        state_waiting,              // -> error | error_notify | success | success_notify | waiting_canceled
        state_waiting_canceled,     // -> error | error_notify | success | success_notify | canceling
        state_canceled,             // -> error | error_notify | success | success_notify | canceling
        state_canceling,            // -> error_notify
        state_success_notify,       // -> success
        state_success,              // -> .
        state_error_notify,         // -> error
        state_error;                // -> .

    // Noop function, used in the various states to indicate that they don't support a given
    // message. Named with the somewhat cute name '_' because it reads really well in the states.

    function _() { }

    // Initial state
    //
    state_created = {
        name: "created",
        enter: function (promise) {
            promise._setState(state_working);
        },
        cancel: _,
        done: _,
        then: _,
        _completed: _,
        _error: _,
        _notify: _,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Ready state, waiting for a message (completed/error/progress), able to be canceled
    //
    state_working = {
        name: "working",
        enter: _,
        cancel: function (promise) {
            promise._setState(state_canceled);
        },
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Waiting state, if a promise is completed with a value which is itself a promise
    // (has a then() method) it signs up to be informed when that child promise is
    // fulfilled at which point it will be fulfilled with that value.
    //
    state_waiting = {
        name: "waiting",
        enter: function (promise) {
            var waitedUpon = promise._value;
            // We can special case our own intermediate promises which are not in a 
            //  terminal state by just pushing this promise as a listener without 
            //  having to create new indirection functions
            if (waitedUpon instanceof ThenPromise &&
                waitedUpon._state !== state_error &&
                waitedUpon._state !== state_success) {
                pushListener(waitedUpon, { promise: promise });
            } else {
                var error = function (value) {
                    if (waitedUpon._errorId) {
                        promise._chainedError(value, waitedUpon);
                    } else {
                        // Because this is an interop boundary we want to indicate that this 
                        //  error has been handled by the promise infrastructure before we
                        //  begin a new handling chain.
                        //
                        callonerror(promise, value, detailsForHandledError, waitedUpon, error);
                        promise._error(value);
                    }
                };
                error.handlesOnError = true;
                waitedUpon.then(
                    promise._completed.bind(promise),
                    error,
                    promise._progress.bind(promise)
                );
            }
        },
        cancel: function (promise) {
            promise._setState(state_waiting_canceled);
        },
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Waiting canceled state, when a promise has been in a waiting state and receives a
    // request to cancel its pending work it will forward that request to the child promise
    // and then waits to be informed of the result. This promise moves itself into the
    // canceling state but understands that the child promise may instead push it to a
    // different state.
    //
    state_waiting_canceled = {
        name: "waiting_canceled",
        enter: function (promise) {
            // Initiate a transition to canceling. Triggering a cancel on the promise
            // that we are waiting upon may result in a different state transition
            // before the state machine pump runs again.
            promise._setState(state_canceling);
            var waitedUpon = promise._value;
            if (waitedUpon.cancel) {
                waitedUpon.cancel();
            }
        },
        cancel: _,
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Canceled state, moves to the canceling state and then tells the promise to do
    // whatever it might need to do on cancelation.
    //
    state_canceled = {
        name: "canceled",
        enter: function (promise) {
            // Initiate a transition to canceling. The _cancelAction may change the state
            // before the state machine pump runs again.
            promise._setState(state_canceling);
            promise._cancelAction();
        },
        cancel: _,
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Canceling state, commits to the promise moving to an error state with an error
    // object whose 'name' and 'message' properties contain the string "Canceled"
    //
    state_canceling = {
        name: "canceling",
        enter: function (promise) {
            var error = new Error(canceledName);
            error.name = error.message;
            promise._value = error;
            promise._setState(state_error_notify);
        },
        cancel: _,
        done: _,
        then: _,
        _completed: _,
        _error: _,
        _notify: _,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Success notify state, moves a promise to the success state and notifies all children
    //
    state_success_notify = {
        name: "complete_notify",
        enter: function (promise) {
            promise.done = CompletePromise.prototype.done;
            promise.then = CompletePromise.prototype.then;
            if (promise._listeners) {
                var queue = [promise];
                var p;
                while (queue.length) {
                    p = queue.shift();
                    p._state._notify(p, queue);
                }
            }
            promise._setState(state_success);
        },
        cancel: _,
        done: null, /*error to get here */
        then: null, /*error to get here */
        _completed: _,
        _error: _,
        _notify: notifySuccess,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Success state, moves a promise to the success state and does NOT notify any children.
    // Some upstream promise is owning the notification pass.
    //
    state_success = {
        name: "success",
        enter: function (promise) {
            promise.done = CompletePromise.prototype.done;
            promise.then = CompletePromise.prototype.then;
            promise._cleanupAction();
        },
        cancel: _,
        done: null, /*error to get here */
        then: null, /*error to get here */
        _completed: _,
        _error: _,
        _notify: notifySuccess,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Error notify state, moves a promise to the error state and notifies all children
    //
    state_error_notify = {
        name: "error_notify",
        enter: function (promise) {
            promise.done = ErrorPromise.prototype.done;
            promise.then = ErrorPromise.prototype.then;
            if (promise._listeners) {
                var queue = [promise];
                var p;
                while (queue.length) {
                    p = queue.shift();
                    p._state._notify(p, queue);
                }
            }
            promise._setState(state_error);
        },
        cancel: _,
        done: null, /*error to get here*/
        then: null, /*error to get here*/
        _completed: _,
        _error: _,
        _notify: notifyError,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Error state, moves a promise to the error state and does NOT notify any children.
    // Some upstream promise is owning the notification pass.
    //
    state_error = {
        name: "error",
        enter: function (promise) {
            promise.done = ErrorPromise.prototype.done;
            promise.then = ErrorPromise.prototype.then;
            promise._cleanupAction();
        },
        cancel: _,
        done: null, /*error to get here*/
        then: null, /*error to get here*/
        _completed: _,
        _error: _,
        _notify: notifyError,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    //
    // The statemachine implementation follows a very particular pattern, the states are specified
    // as static stateless bags of functions which are then indirected through the state machine
    // instance (a Promise). As such all of the functions on each state have the promise instance
    // passed to them explicitly as a parameter and the Promise instance members do a little
    // dance where they indirect through the state and insert themselves in the argument list.
    //
    // We could instead call directly through the promise states however then every caller
    // would have to remember to do things like pumping the state machine to catch state transitions.
    //

    var PromiseStateMachine = PluginUtilities.Class.define(null, {
        _listeners: null,
        _nextState: null,
        _state: null,
        _value: null,

        cancel: function () {
            /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.cancel">
            /// <summary locid="PluginUtilities.PromiseStateMachine.cancel">
            /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
            /// already been fulfilled and cancellation is supported, the promise enters
            /// the error state with a value of Error("Canceled").
            /// </summary>
            /// </signature>
            this._state.cancel(this);
            this._run();
        },
        done: function Promise_done(onComplete, onError, onProgress) {
            /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.done">
            /// <summary locid="PluginUtilities.PromiseStateMachine.done">
            /// Allows you to specify the work to be done on the fulfillment of the promised value,
            /// the error handling to be performed if the promise fails to fulfill
            /// a value, and the handling of progress notifications along the way.
            /// 
            /// After the handlers have finished executing, this function throws any error that would have been returned
            /// from then() as a promise in the error state.
            /// </summary>
            /// <param name="onComplete" type="Function" locid="PluginUtilities.PromiseStateMachine.done_p:onComplete">
            /// The function to be called if the promise is fulfilled successfully with a value.
            /// The fulfilled value is passed as the single argument. If the value is null,
            /// the fulfilled value is returned. The value returned
            /// from the function becomes the fulfilled value of the promise returned by
            /// then(). If an exception is thrown while executing the function, the promise returned
            /// by then() moves into the error state.
            /// </param>
            /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.done_p:onError">
            /// The function to be called if the promise is fulfilled with an error. The error
            /// is passed as the single argument. If it is null, the error is forwarded.
            /// The value returned from the function is the fulfilled value of the promise returned by then().
            /// </param>
            /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.done_p:onProgress">
            /// the function to be called if the promise reports progress. Data about the progress
            /// is passed as the single argument. Promises are not required to support
            /// progress.
            /// </param>
            /// </signature>
            this._state.done(this, onComplete, onError, onProgress);
        },
        then: function Promise_then(onComplete, onError, onProgress) {
            /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.then">
            /// <summary locid="PluginUtilities.PromiseStateMachine.then">
            /// Allows you to specify the work to be done on the fulfillment of the promised value,
            /// the error handling to be performed if the promise fails to fulfill
            /// a value, and the handling of progress notifications along the way.
            /// </summary>
            /// <param name="onComplete" type="Function" locid="PluginUtilities.PromiseStateMachine.then_p:onComplete">
            /// The function to be called if the promise is fulfilled successfully with a value.
            /// The value is passed as the single argument. If the value is null, the value is returned.
            /// The value returned from the function becomes the fulfilled value of the promise returned by
            /// then(). If an exception is thrown while this function is being executed, the promise returned
            /// by then() moves into the error state.
            /// </param>
            /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.then_p:onError">
            /// The function to be called if the promise is fulfilled with an error. The error
            /// is passed as the single argument. If it is null, the error is forwarded.
            /// The value returned from the function becomes the fulfilled value of the promise returned by then().
            /// </param>
            /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.then_p:onProgress">
            /// The function to be called if the promise reports progress. Data about the progress
            /// is passed as the single argument. Promises are not required to support
            /// progress.
            /// </param>
            /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.PromiseStateMachine.then_returnValue">
            /// The promise whose value is the result of executing the complete or
            /// error function.
            /// </returns>
            /// </signature>
            return this._state.then(this, onComplete, onError, onProgress);
        },

        _chainedError: function (value, context) {
            var result = this._state._error(this, value, detailsForChainedError, context);
            this._run();
            return result;
        },
        _completed: function (value) {
            var result = this._state._completed(this, value);
            this._run();
            return result;
        },
        _error: function (value) {
            var result = this._state._error(this, value, detailsForError);
            this._run();
            return result;
        },
        _progress: function (value) {
            this._state._progress(this, value);
        },
        _setState: function (state) {
            this._nextState = state;
        },
        _setCompleteValue: function (value) {
            this._state._setCompleteValue(this, value);
            this._run();
        },
        _setChainedErrorValue: function (value, context) {
            var result = this._state._setErrorValue(this, value, detailsForChainedError, context);
            this._run();
            return result;
        },
        _setExceptionValue: function (value) {
            var result = this._state._setErrorValue(this, value, detailsForException);
            this._run();
            return result;
        },
        _run: function () {
            while (this._nextState) {
                this._state = this._nextState;
                this._nextState = null;
                this._state.enter(this);
            }
        }
    }, {
        supportedForProcessing: false
    });

    //
    // Implementations of shared state machine code.
    //

    function completed(promise, value) {
        var targetState;
        if (value && typeof value === "object" && typeof value.then === "function") {
            targetState = state_waiting;
        } else {
            targetState = state_success_notify;
        }
        promise._value = value;
        promise._setState(targetState);
    }
    function createErrorDetails(exception, error, promise, id, parent, handler) {
        return {
            exception: exception,
            error: error,
            promise: promise,
            handler: handler,
            id: id,
            parent: parent
        };
    }
    function detailsForHandledError(promise, errorValue, context, handler) {
        var exception = context._isException;
        var errorId = context._errorId;
        return createErrorDetails(
            exception ? errorValue : null,
            exception ? null : errorValue,
            promise,
            errorId,
            context,
            handler
        );
    }
    function detailsForChainedError(promise, errorValue, context) {
        var exception = context._isException;
        var errorId = context._errorId;
        setErrorInfo(promise, errorId, exception);
        return createErrorDetails(
            exception ? errorValue : null,
            exception ? null : errorValue,
            promise,
            errorId,
            context
        );
    }
    function detailsForError(promise, errorValue) {
        var errorId = ++error_number;
        setErrorInfo(promise, errorId);
        return createErrorDetails(
            null,
            errorValue,
            promise,
            errorId
        );
    }
    function detailsForException(promise, exceptionValue) {
        var errorId = ++error_number;
        setErrorInfo(promise, errorId, true);
        return createErrorDetails(
            exceptionValue,
            null,
            promise,
            errorId
        );
    }
    function done(promise, onComplete, onError, onProgress) {
        var asyncOpID = Debug.msTraceAsyncOperationStarting("PluginUtilities.Promise.done");
        pushListener(promise, { c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
    }
    function error(promise, value, onerrorDetails, context) {
        promise._value = value;
        callonerror(promise, value, onerrorDetails, context);
        promise._setState(state_error_notify);
    }
    function notifySuccess(promise, queue) {
        var value = promise._value;
        var listeners = promise._listeners;
        if (!listeners) {
            return;
        }
        promise._listeners = null;
        var i, len;
        for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
            var listener = len === 1 ? listeners : listeners[i];
            var onComplete = listener.c;
            var target = listener.promise;

            Debug.msTraceAsyncOperationCompleted(listener.asyncOpID, Debug.MS_ASYNC_OP_STATUS_SUCCESS);

            if (target) {
                Debug.msTraceAsyncCallbackStarting(listener.asyncOpID);
                try {
                    target._setCompleteValue(onComplete ? onComplete(value) : value);
                } catch (ex) {
                    target._setExceptionValue(ex);
                } finally {
                    Debug.msTraceAsyncCallbackCompleted();
                }
                if (target._state !== state_waiting && target._listeners) {
                    queue.push(target);
                }
            } else {
                CompletePromise.prototype.done.call(promise, onComplete);
            }
        }
    }
    function notifyError(promise, queue) {
        var value = promise._value;
        var listeners = promise._listeners;
        if (!listeners) {
            return;
        }
        promise._listeners = null;
        var i, len;
        for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
            var listener = len === 1 ? listeners : listeners[i];
            var onError = listener.e;
            var target = listener.promise;

            var errorID = (value && value.name === canceledName ? Debug.MS_ASYNC_OP_STATUS_CANCELED : Debug.MS_ASYNC_OP_STATUS_ERROR);
            Debug.msTraceAsyncOperationCompleted(listener.asyncOpID, errorID);

            if (target) {
                var asyncCallbackStarted = false;
                try {
                    if (onError) {
                        Debug.msTraceAsyncCallbackStarting(listener.asyncOpID);
                        asyncCallbackStarted = true;
                        if (!onError.handlesOnError) {
                            callonerror(target, value, detailsForHandledError, promise, onError);
                        }
                        target._setCompleteValue(onError(value))
                    } else {
                        target._setChainedErrorValue(value, promise);
                    }
                } catch (ex) {
                    target._setExceptionValue(ex);
                } finally {
                    if (asyncCallbackStarted) {
                        Debug.msTraceAsyncCallbackCompleted();
                    }
                }
                if (target._state !== state_waiting && target._listeners) {
                    queue.push(target);
                }
            } else {
                ErrorPromise.prototype.done.call(promise, null, onError);
            }
        }
    }
    function callonerror(promise, value, onerrorDetailsGenerator, context, handler) {
        if (promiseEventListeners._listeners[errorET]) {
            if (value instanceof Error && value.message === canceledName) {
                return;
            }
            promiseEventListeners.dispatchEvent(errorET, onerrorDetailsGenerator(promise, value, context, handler));
        }
    }
    function progress(promise, value) {
        var listeners = promise._listeners;
        if (listeners) {
            var i, len;
            for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
                var listener = len === 1 ? listeners : listeners[i];
                var onProgress = listener.p;
                if (onProgress) {
                    try { onProgress(value); } catch (ex) { }
                }
                if (!(listener.c || listener.e) && listener.promise) {
                    listener.promise._progress(value);
                }
            }
        }
    }
    function pushListener(promise, listener) {
        var listeners = promise._listeners;
        if (listeners) {
            // We may have either a single listener (which will never be wrapped in an array)
            // or 2+ listeners (which will be wrapped). Since we are now adding one more listener
            // we may have to wrap the single listener before adding the second.
            listeners = Array.isArray(listeners) ? listeners : [listeners];
            listeners.push(listener);
        } else {
            listeners = listener;
        }
        promise._listeners = listeners;
    }
    // The difference beween setCompleteValue()/setErrorValue() and complete()/error() is that setXXXValue() moves
    // a promise directly to the success/error state without starting another notification pass (because one
    // is already ongoing).
    function setErrorInfo(promise, errorId, isException) {
        promise._isException = isException || false;
        promise._errorId = errorId;
    }
    function setErrorValue(promise, value, onerrorDetails, context) {
        promise._value = value;
        callonerror(promise, value, onerrorDetails, context);
        promise._setState(state_error);
    }
    function setCompleteValue(promise, value) {
        var targetState;
        if (value && typeof value === "object" && typeof value.then === "function") {
            targetState = state_waiting;
        } else {
            targetState = state_success;
        }
        promise._value = value;
        promise._setState(targetState);
    }
    function then(promise, onComplete, onError, onProgress) {
        var result = new ThenPromise(promise);
        var asyncOpID = Debug.msTraceAsyncOperationStarting("PluginUtilities.Promise.then");
        pushListener(promise, { promise: result, c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
        return result;
    }

    //
    // Internal implementation detail promise, ThenPromise is created when a promise needs
    // to be returned from a then() method.
    //
    var ThenPromise = PluginUtilities.Class.derive(PromiseStateMachine,
        function (creator) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.thenPromise))) {
                this._stack = PluginUtilities.Promise._getStack();
            }

            this._creator = creator;
            this._setState(state_created);
            this._run();
        }, {
            _creator: null,

            _cancelAction: function () { if (this._creator) { this._creator.cancel(); } },
            _cleanupAction: function () { this._creator = null; }
        }, {
            supportedForProcessing: false
        }
    );

    //
    // Slim promise implementations for already completed promises, these are created
    // under the hood on synchronous completion paths as well as by PluginUtilities.Promise.wrap
    // and PluginUtilities.Promise.wrapError.
    //

    var ErrorPromise = PluginUtilities.Class.define(
        function ErrorPromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.errorPromise))) {
                this._stack = PluginUtilities.Promise._getStack();
            }

            this._value = value;
            callonerror(this, value, detailsForError);
        }, {
            cancel: function () {
                /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.cancel">
                /// <summary locid="PluginUtilities.PromiseStateMachine.cancel">
                /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
                /// already been fulfilled and cancellation is supported, the promise enters
                /// the error state with a value of Error("Canceled").
                /// </summary>
                /// </signature>
            },
            done: function ErrorPromise_done(unused, onError) {
                /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.done">
                /// <summary locid="PluginUtilities.PromiseStateMachine.done">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// 
                /// After the handlers have finished executing, this function throws any error that would have been returned
                /// from then() as a promise in the error state.
                /// </summary>
                /// <param name="onComplete" type="Function" locid="PluginUtilities.PromiseStateMachine.done_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The fulfilled value is passed as the single argument. If the value is null,
                /// the fulfilled value is returned. The value returned
                /// from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while executing the function, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.done_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function is the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.done_p:onProgress">
                /// the function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// </signature>
                var value = this._value;
                if (onError) {
                    try {
                        if (!onError.handlesOnError) {
                            callonerror(null, value, detailsForHandledError, this, onError);
                        }
                        var result = onError(value);
                        if (result && typeof result === "object" && typeof result.done === "function") {
                            // If a promise is returned we need to wait on it.
                            result.done();
                        }
                        return;
                    } catch (ex) {
                        value = ex;
                    }
                }
                if (value instanceof Error && value.message === canceledName) {
                    // suppress cancel
                    return;
                }
                // force the exception to be thrown asyncronously to avoid any try/catch blocks
                //
                PluginUtilities.Utilities.Scheduler.schedule(function () {
                    throw value;
                }, PluginUtilities.Utilities.Scheduler.Priority.normal, null, "PluginUtilities.Promise._throwException");
            },
            then: function ErrorPromise_then(unused, onError) {
                /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.then">
                /// <summary locid="PluginUtilities.PromiseStateMachine.then">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// </summary>
                /// <param name="onComplete" type="Function" locid="PluginUtilities.PromiseStateMachine.then_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The value is passed as the single argument. If the value is null, the value is returned.
                /// The value returned from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while this function is being executed, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.then_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function becomes the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.then_p:onProgress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.PromiseStateMachine.then_returnValue">
                /// The promise whose value is the result of executing the complete or
                /// error function.
                /// </returns>
                /// </signature>

                // If the promise is already in a error state and no error handler is provided
                // we optimize by simply returning the promise instead of creating a new one.
                //
                if (!onError) { return this; }
                var result;
                var value = this._value;
                try {
                    if (!onError.handlesOnError) {
                        callonerror(null, value, detailsForHandledError, this, onError);
                    }
                    result = new CompletePromise(onError(value));
                } catch (ex) {
                    // If the value throw from the error handler is the same as the value
                    // provided to the error handler then there is no need for a new promise.
                    //
                    if (ex === value) {
                        result = this;
                    } else {
                        result = new ExceptionPromise(ex);
                    }
                }
                return result;
            }
        }, {
            supportedForProcessing: false
        }
    );

    var ExceptionPromise = PluginUtilities.Class.derive(ErrorPromise,
        function ExceptionPromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.exceptionPromise))) {
                this._stack = PluginUtilities.Promise._getStack();
            }

            this._value = value;
            callonerror(this, value, detailsForException);
        }, {
            /* empty */
        }, {
            supportedForProcessing: false
        }
    );

    var CompletePromise = PluginUtilities.Class.define(
        function CompletePromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.completePromise))) {
                this._stack = PluginUtilities.Promise._getStack();
            }

            if (value && typeof value === "object" && typeof value.then === "function") {
                var result = new ThenPromise(null);
                result._setCompleteValue(value);
                return result;
            }
            this._value = value;
        }, {
            cancel: function () {
                /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.cancel">
                /// <summary locid="PluginUtilities.PromiseStateMachine.cancel">
                /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
                /// already been fulfilled and cancellation is supported, the promise enters
                /// the error state with a value of Error("Canceled").
                /// </summary>
                /// </signature>
            },
            done: function CompletePromise_done(onComplete) {
                /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.done">
                /// <summary locid="PluginUtilities.PromiseStateMachine.done">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// 
                /// After the handlers have finished executing, this function throws any error that would have been returned
                /// from then() as a promise in the error state.
                /// </summary>
                /// <param name="onComplete" type="Function" locid="PluginUtilities.PromiseStateMachine.done_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The fulfilled value is passed as the single argument. If the value is null,
                /// the fulfilled value is returned. The value returned
                /// from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while executing the function, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.done_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function is the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.done_p:onProgress">
                /// the function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// </signature>
                if (!onComplete) { return; }
                try {
                    var result = onComplete(this._value);
                    if (result && typeof result === "object" && typeof result.done === "function") {
                        result.done();
                    }
                } catch (ex) {
                    // force the exception to be thrown asynchronously to avoid any try/catch blocks
                    PluginUtilities.Utilities.Scheduler.schedule(function () {
                        throw ex;
                    }, PluginUtilities.Utilities.Scheduler.Priority.normal, null, "PluginUtilities.Promise._throwException");
                }
            },
            then: function CompletePromise_then(onComplete) {
                /// <signature helpKeyword="PluginUtilities.PromiseStateMachine.then">
                /// <summary locid="PluginUtilities.PromiseStateMachine.then">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// </summary>
                /// <param name="onComplete" type="Function" locid="PluginUtilities.PromiseStateMachine.then_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The value is passed as the single argument. If the value is null, the value is returned.
                /// The value returned from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while this function is being executed, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.then_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function becomes the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.PromiseStateMachine.then_p:onProgress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.PromiseStateMachine.then_returnValue">
                /// The promise whose value is the result of executing the complete or
                /// error function.
                /// </returns>
                /// </signature>
                try {
                    // If the value returned from the completion handler is the same as the value
                    // provided to the completion handler then there is no need for a new promise.
                    //
                    var newValue = onComplete ? onComplete(this._value) : this._value;
                    return newValue === this._value ? this : new CompletePromise(newValue);
                } catch (ex) {
                    return new ExceptionPromise(ex);
                }
            }
        }, {
            supportedForProcessing: false
        }
    );

    //
    // Promise is the user-creatable PluginUtilities.Promise object.
    //

    function timeout(timeoutMS) {
        var id;
        return new PluginUtilities.Promise(
            function (c) {
                if (timeoutMS) {
                    id = setTimeout(c, timeoutMS);
                } else {
                    setImmediate(c);
                }
            },
            function () {
                if (id) {
                    clearTimeout(id);
                }
            }
        );
    }

    function timeoutWithPromise(timeout, promise) {
        var cancelPromise = function () { promise.cancel(); }
        var cancelTimeout = function () { timeout.cancel(); }
        timeout.then(cancelPromise);
        promise.then(cancelTimeout, cancelTimeout);
        return promise;
    }

    var staticCanceledPromise;

    var Promise = PluginUtilities.Class.derive(PromiseStateMachine,
        function Promise_ctor(init, oncancel) {
            /// <signature helpKeyword="PluginUtilities.Promise">
            /// <summary locid="PluginUtilities.Promise">
            /// A promise provides a mechanism to schedule work to be done on a value that
            /// has not yet been computed. It is a convenient abstraction for managing
            /// interactions with asynchronous APIs.
            /// </summary>
            /// <param name="init" type="Function" locid="PluginUtilities.Promise_p:init">
            /// The function that is called during construction of the  promise. The function
            /// is given three arguments (complete, error, progress). Inside this function
            /// you should add event listeners for the notifications supported by this value.
            /// </param>
            /// <param name="oncancel" optional="true" locid="PluginUtilities.Promise_p:oncancel">
            /// The function to call if a consumer of this promise wants
            /// to cancel its undone work. Promises are not required to
            /// support cancellation.
            /// </param>
            /// </signature>

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.promise))) {
                this._stack = PluginUtilities.Promise._getStack();
            }

            this._oncancel = oncancel;
            this._setState(state_created);
            this._run();

            try {
                var complete = this._completed.bind(this);
                var error = this._error.bind(this);
                var progress = this._progress.bind(this);
                init(complete, error, progress);
            } catch (ex) {
                this._setExceptionValue(ex);
            }
        }, {
            _oncancel: null,

            _cancelAction: function () {
                if (this._oncancel) {
                    try { this._oncancel(); } catch (ex) { }
                }
            },
            _cleanupAction: function () { this._oncancel = null; }
        }, {

            addEventListener: function Promise_addEventListener(eventType, listener, capture) {
                /// <signature helpKeyword="PluginUtilities.Promise.addEventListener">
                /// <summary locid="PluginUtilities.Promise.addEventListener">
                /// Adds an event listener to the control.
                /// </summary>
                /// <param name="eventType" locid="PluginUtilities.Promise.addEventListener_p:eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="listener" locid="PluginUtilities.Promise.addEventListener_p:listener">
                /// The listener to invoke when the event is raised.
                /// </param>
                /// <param name="capture" locid="PluginUtilities.Promise.addEventListener_p:capture">
                /// Specifies whether or not to initiate capture.
                /// </param>
                /// </signature>
                promiseEventListeners.addEventListener(eventType, listener, capture);
            },
            any: function Promise_any(values) {
                /// <signature helpKeyword="PluginUtilities.Promise.any">
                /// <summary locid="PluginUtilities.Promise.any">
                /// Returns a promise that is fulfilled when one of the input promises
                /// has been fulfilled.
                /// </summary>
                /// <param name="values" type="Array" locid="PluginUtilities.Promise.any_p:values">
                /// An array that contains promise objects or objects whose property
                /// values include promise objects.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.any_returnValue">
                /// A promise that on fulfillment yields the value of the input (complete or error).
                /// </returns>
                /// </signature>
                return new Promise(
                    function (complete, error, progress) {
                        var keys = Object.keys(values);
                        var errors = Array.isArray(values) ? [] : {};
                        if (keys.length === 0) {
                            complete();
                        }
                        var canceled = 0;
                        keys.forEach(function (key) {
                            Promise.as(values[key]).then(
                                function () { complete({ key: key, value: values[key] }); },
                                function (e) {
                                    if (e instanceof Error && e.name === canceledName) {
                                        if ((++canceled) === keys.length) {
                                            complete(PluginUtilities.Promise.cancel);
                                        }
                                        return;
                                    }
                                    error({ key: key, value: values[key] });
                                }
                            );
                        });
                    },
                    function () {
                        var keys = Object.keys(values);
                        keys.forEach(function (key) {
                            var promise = Promise.as(values[key]);
                            if (typeof promise.cancel === "function") {
                                promise.cancel();
                            }
                        });
                    }
                );
            },
            as: function Promise_as(value) {
                /// <signature helpKeyword="PluginUtilities.Promise.as">
                /// <summary locid="PluginUtilities.Promise.as">
                /// Returns a promise. If the object is already a promise it is returned;
                /// otherwise the object is wrapped in a promise.
                /// </summary>
                /// <param name="value" locid="PluginUtilities.Promise.as_p:value">
                /// The value to be treated as a promise.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.as_returnValue">
                /// A promise.
                /// </returns>
                /// </signature>
                if (value && typeof value === "object" && typeof value.then === "function") {
                    return value;
                }
                return new CompletePromise(value);
            },
            /// <field type="PluginUtilities.Promise" helpKeyword="PluginUtilities.Promise.cancel" locid="PluginUtilities.Promise.cancel">
            /// Canceled promise value, can be returned from a promise completion handler
            /// to indicate cancelation of the promise chain.
            /// </field>
            cancel: {
                get: function () {
                    return (staticCanceledPromise = staticCanceledPromise || new ErrorPromise(new PluginUtilities.ErrorFromName(canceledName)));
                }
            },
            dispatchEvent: function Promise_dispatchEvent(eventType, details) {
                /// <signature helpKeyword="PluginUtilities.Promise.dispatchEvent">
                /// <summary locid="PluginUtilities.Promise.dispatchEvent">
                /// Raises an event of the specified type and properties.
                /// </summary>
                /// <param name="eventType" locid="PluginUtilities.Promise.dispatchEvent_p:eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="details" locid="PluginUtilities.Promise.dispatchEvent_p:details">
                /// The set of additional properties to be attached to the event object.
                /// </param>
                /// <returns type="Boolean" locid="PluginUtilities.Promise.dispatchEvent_returnValue">
                /// Specifies whether preventDefault was called on the event.
                /// </returns>
                /// </signature>
                return promiseEventListeners.dispatchEvent(eventType, details);
            },
            is: function Promise_is(value) {
                /// <signature helpKeyword="PluginUtilities.Promise.is">
                /// <summary locid="PluginUtilities.Promise.is">
                /// Determines whether a value fulfills the promise contract.
                /// </summary>
                /// <param name="value" locid="PluginUtilities.Promise.is_p:value">
                /// A value that may be a promise.
                /// </param>
                /// <returns type="Boolean" locid="PluginUtilities.Promise.is_returnValue">
                /// true if the specified value is a promise, otherwise false.
                /// </returns>
                /// </signature>
                return value && typeof value === "object" && typeof value.then === "function";
            },
            join: function Promise_join(values) {
                /// <signature helpKeyword="PluginUtilities.Promise.join">
                /// <summary locid="PluginUtilities.Promise.join">
                /// Creates a promise that is fulfilled when all the values are fulfilled.
                /// </summary>
                /// <param name="values" type="Object" locid="PluginUtilities.Promise.join_p:values">
                /// An object whose fields contain values, some of which may be promises.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.join_returnValue">
                /// A promise whose value is an object with the same field names as those of the object in the values parameter, where
                /// each field value is the fulfilled value of a promise.
                /// </returns>
                /// </signature>
                return new Promise(
                    function (complete, error, progress) {
                        var keys = Object.keys(values);
                        var errors = Array.isArray(values) ? [] : {};
                        var results = Array.isArray(values) ? [] : {};
                        var undefineds = 0;
                        var pending = keys.length;
                        var argDone = function (key) {
                            if ((--pending) === 0) {
                                var errorCount = Object.keys(errors).length;
                                if (errorCount === 0) {
                                    complete(results);
                                } else {
                                    var canceledCount = 0;
                                    keys.forEach(function (key) {
                                        var e = errors[key];
                                        if (e instanceof Error && e.name === canceledName) {
                                            canceledCount++;
                                        }
                                    });
                                    if (canceledCount === errorCount) {
                                        complete(PluginUtilities.Promise.cancel);
                                    } else {
                                        error(errors);
                                    }
                                }
                            } else {
                                progress({ Key: key, Done: true });
                            }
                        };
                        keys.forEach(function (key) {
                            var value = values[key];
                            if (value === undefined) {
                                undefineds++;
                            } else {
                                Promise.then(value,
                                    function (value) { results[key] = value; argDone(key); },
                                    function (value) { errors[key] = value; argDone(key); }
                                );
                            }
                        });
                        pending -= undefineds;
                        if (pending === 0) {
                            complete(results);
                            return;
                        }
                    },
                    function () {
                        Object.keys(values).forEach(function (key) {
                            var promise = Promise.as(values[key]);
                            if (typeof promise.cancel === "function") {
                                promise.cancel();
                            }
                        });
                    }
                );
            },
            removeEventListener: function Promise_removeEventListener(eventType, listener, capture) {
                /// <signature helpKeyword="PluginUtilities.Promise.removeEventListener">
                /// <summary locid="PluginUtilities.Promise.removeEventListener">
                /// Removes an event listener from the control.
                /// </summary>
                /// <param name="eventType" locid="PluginUtilities.Promise.removeEventListener_eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="listener" locid="PluginUtilities.Promise.removeEventListener_listener">
                /// The listener to remove.
                /// </param>
                /// <param name="capture" locid="PluginUtilities.Promise.removeEventListener_capture">
                /// Specifies whether or not to initiate capture.
                /// </param>
                /// </signature>
                promiseEventListeners.removeEventListener(eventType, listener, capture);
            },
            supportedForProcessing: false,
            then: function Promise_then(value, onComplete, onError, onProgress) {
                /// <signature helpKeyword="PluginUtilities.Promise.then">
                /// <summary locid="PluginUtilities.Promise.then">
                /// A static version of the promise instance method then().
                /// </summary>
                /// <param name="value" locid="PluginUtilities.Promise.then_p:value">
                /// the value to be treated as a promise.
                /// </param>
                /// <param name="onComplete" type="Function" locid="PluginUtilities.Promise.then_p:complete">
                /// The function to be called if the promise is fulfilled with a value.
                /// If it is null, the promise simply
                /// returns the value. The value is passed as the single argument.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.Promise.then_p:error">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument.
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.Promise.then_p:progress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.then_returnValue">
                /// A promise whose value is the result of executing the provided complete function.
                /// </returns>
                /// </signature>
                return Promise.as(value).then(onComplete, onError, onProgress);
            },
            thenEach: function Promise_thenEach(values, onComplete, onError, onProgress) {
                /// <signature helpKeyword="PluginUtilities.Promise.thenEach">
                /// <summary locid="PluginUtilities.Promise.thenEach">
                /// Performs an operation on all the input promises and returns a promise
                /// that has the shape of the input and contains the result of the operation
                /// that has been performed on each input.
                /// </summary>
                /// <param name="values" locid="PluginUtilities.Promise.thenEach_p:values">
                /// A set of values (which could be either an array or an object) of which some or all are promises.
                /// </param>
                /// <param name="onComplete" type="Function" locid="PluginUtilities.Promise.thenEach_p:complete">
                /// The function to be called if the promise is fulfilled with a value.
                /// If the value is null, the promise returns the value.
                /// The value is passed as the single argument.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="PluginUtilities.Promise.thenEach_p:error">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument.
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="PluginUtilities.Promise.thenEach_p:progress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.thenEach_returnValue">
                /// A promise that is the result of calling Promise.join on the values parameter.
                /// </returns>
                /// </signature>
                var result = Array.isArray(values) ? [] : {};
                Object.keys(values).forEach(function (key) {
                    result[key] = Promise.as(values[key]).then(onComplete, onError, onProgress);
                });
                return Promise.join(result);
            },
            timeout: function Promise_timeout(time, promise) {
                /// <signature helpKeyword="PluginUtilities.Promise.timeout">
                /// <summary locid="PluginUtilities.Promise.timeout">
                /// Creates a promise that is fulfilled after a timeout.
                /// </summary>
                /// <param name="timeout" type="Number" optional="true" locid="PluginUtilities.Promise.timeout_p:timeout">
                /// The timeout period in milliseconds. If this value is zero or not specified
                /// setImmediate is called, otherwise setTimeout is called.
                /// </param>
                /// <param name="promise" type="Promise" optional="true" locid="PluginUtilities.Promise.timeout_p:promise">
                /// A promise that will be canceled if it doesn't complete before the
                /// timeout has expired.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.timeout_returnValue">
                /// A promise that is completed asynchronously after the specified timeout.
                /// </returns>
                /// </signature>
                var to = timeout(time);
                return promise ? timeoutWithPromise(to, promise) : to;
            },
            wrap: function Promise_wrap(value) {
                /// <signature helpKeyword="PluginUtilities.Promise.wrap">
                /// <summary locid="PluginUtilities.Promise.wrap">
                /// Wraps a non-promise value in a promise. You can use this function if you need
                /// to pass a value to a function that requires a promise.
                /// </summary>
                /// <param name="value" locid="PluginUtilities.Promise.wrap_p:value">
                /// Some non-promise value to be wrapped in a promise.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.wrap_returnValue">
                /// A promise that is successfully fulfilled with the specified value
                /// </returns>
                /// </signature>
                return new CompletePromise(value);
            },
            wrapError: function Promise_wrapError(error) {
                /// <signature helpKeyword="PluginUtilities.Promise.wrapError">
                /// <summary locid="PluginUtilities.Promise.wrapError">
                /// Wraps a non-promise error value in a promise. You can use this function if you need
                /// to pass an error to a function that requires a promise.
                /// </summary>
                /// <param name="error" locid="PluginUtilities.Promise.wrapError_p:error">
                /// A non-promise error value to be wrapped in a promise.
                /// </param>
                /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Promise.wrapError_returnValue">
                /// A promise that is in an error state with the specified value.
                /// </returns>
                /// </signature>
                return new ErrorPromise(error);
            },

            _veryExpensiveTagWithStack: {
                get: function () { return tagWithStack; },
                set: function (value) { tagWithStack = value; }
            },
            _veryExpensiveTagWithStack_tag: tag,
            _getStack: function () {
                if (Debug.debuggerEnabled) {
                    try { throw new Error(); } catch (e) { return e.stack; }
                }
            },

            _cancelBlocker: function Promise__cancelBlocker(input) {
                //
                // Returns a promise which on cancelation will still result in downstream cancelation while
                //  protecting the promise 'input' from being  canceled which has the effect of allowing 
                //  'input' to be shared amoung various consumers.
                //
                if (!Promise.is(input)) {
                    return Promise.wrap(input);
                }
                var complete;
                var error;
                var output = new PluginUtilities.Promise(
                    function (c, e) {
                        complete = c;
                        error = e;
                    },
                    function () {
                        complete = null;
                        error = null;
                    }
                );
                input.then(
                    function (v) { complete && complete(v); },
                    function (e) { error && error(e); }
                );
                return output;
            },

        }
    );
    Object.defineProperties(Promise, PluginUtilities.Utilities.createEventProperties(errorET));

    var SignalPromise = PluginUtilities.Class.derive(PromiseStateMachine,
        function (cancel) {
            this._oncancel = cancel;
            this._setState(state_created);
            this._run();
        }, {
            _cancelAction: function () { this._oncancel && this._oncancel(); },
            _cleanupAction: function () { this._oncancel = null; }
        }, {
            supportedForProcessing: false
        }
    );

    var Signal = PluginUtilities.Class.define(
        function Signal_ctor(oncancel) {
            this._promise = new SignalPromise(oncancel);
        }, {
            promise: {
                get: function () { return this._promise; }
            },

            cancel: function Signal_cancel() {
                this._promise.cancel();
            },
            complete: function Signal_complete(value) {
                this._promise._completed(value);
            },
            error: function Signal_error(value) {
                this._promise._error(value);
            },
            progress: function Signal_progress(value) {
                this._promise._progress(value);
            }
        }, {
            supportedForProcessing: false,
        }
    );

    // Publish PluginUtilities.Promise
    //
    PluginUtilities.Namespace.define("PluginUtilities", {
        Promise: Promise,
        _Signal: Signal
    });

    Microsoft.Plugin.Promise = Promise;   
}(this));

(function errorsInit(global, PluginUtilities) {
    "use strict";


    PluginUtilities.Namespace.define("PluginUtilities", {
        // ErrorFromName establishes a simple pattern for returning error codes.
        //
        ErrorFromName: PluginUtilities.Class.derive(Error, function (name, message) {
            /// <signature helpKeyword="PluginUtilities.ErrorFromName">
            /// <summary locid="PluginUtilities.ErrorFromName">
            /// Creates an Error object with the specified name and message properties.
            /// </summary>
            /// <param name="name" type="String" locid="PluginUtilities.ErrorFromName_p:name">The name of this error. The name is meant to be consumed programmatically and should not be localized.</param>
            /// <param name="message" type="String" optional="true" locid="PluginUtilities.ErrorFromName_p:message">The message for this error. The message is meant to be consumed by humans and should be localized.</param>
            /// <returns type="Error" locid="PluginUtilities.ErrorFromName_returnValue">Error instance with .name and .message properties populated</returns>
            /// </signature>
            this.name = name;
            this.message = message || name;
        }, {
            /* empty */
        }, {
            supportedForProcessing: false,
        })
    });

})(this, PluginUtilities);

(function linkedListMixinInit(global, undefined) {
    "use strict";

    function linkedListMixin(name) {
        var mixin = {};
        var PREV = "_prev" + name;
        var NEXT = "_next" + name;
        mixin["_remove" + name] = function () {
            // Assumes we always have a static head and tail.
            //
            var prev = this[PREV];
            var next = this[NEXT];
            // PREV <-> NEXT
            //
            next && (next[PREV] = prev);
            prev && (prev[NEXT] = next);
            // null <- this -> null
            //
            this[PREV] = null;
            this[NEXT] = null;
        };
        mixin["_insert" + name + "Before"] = function (node) {
            var prev = this[PREV];
            // PREV -> node -> this
            //
            prev && (prev[NEXT] = node);
            node[NEXT] = this;
            // PREV <- node <- this
            //
            node[PREV] = prev;
            this[PREV] = node;

            return node;
        };
        mixin["_insert" + name + "After"] = function (node) {
            var next = this[NEXT];
            // this -> node -> NEXT
            //
            this[NEXT] = node;
            node[NEXT] = next;
            // this <- node <- NEXT
            //
            node[PREV] = this;
            next && (next[PREV] = node);

            return node;
        };
        return mixin;
    }

    PluginUtilities.Namespace.define("PluginUtilities.Utilities", {

        _linkedListMixin: linkedListMixin

    });

}(this));

(function schedulerInit(global, undefined) {
    "use strict";

    var Promise = PluginUtilities.Promise;
    var linkedListMixin = PluginUtilities.Utilities._linkedListMixin;

    var strings = {
        get jobInfoIsNoLongerValid() { return PluginUtilities.Resources._getPluginUtilitiesString("base/jobInfoIsNoLongerValid").value; }
    };

    //
    // Profiler mark helpers
    //
    // markerType must be one of the following: info, StartTM, StopTM
    //

    function profilerMarkArgs(arg0, arg1, arg2) {
        if (arg2 !== undefined) {
            return "(" + arg0 + ";" + arg1 + ";" + arg2 + ")";
        } else if (arg1 !== undefined) {
            return "(" + arg0 + ";" + arg1 + ")";
        } else if (arg0 !== undefined) {
            return "(" + arg0 + ")";
        } else {
            return "";
        }
    }

    function schedulerProfilerMark(operation, markerType, arg0, arg1) {
        msWriteProfilerMark(
            "PluginUtilities.Scheduler:" + operation +
            profilerMarkArgs(arg0, arg1) +
            "," + markerType
        );
    }

    function jobProfilerMark(job, operation, markerType, arg0, arg1) {
        var argProvided = job.name || arg0 !== undefined || arg1 !== undefined;

        msWriteProfilerMark(
            "PluginUtilities.Scheduler:" + operation + ":" + job.id +
            (argProvided ? profilerMarkArgs(job.name, arg0, arg1) : "") +
            "," + markerType
        );
    }

    //
    // Job type. This cannot be instantiated by developers and is instead handed back by the scheduler
    //  schedule method. Its public interface is what is used when interacting with a job.
    //

    var JobNode = PluginUtilities.Class.define(function (id, work, priority, context, name, asyncOpID) {
        this._id = id;
        this._work = work;
        this._context = context;
        this._name = name;
        this._asyncOpID = asyncOpID;
        this._setPriority(priority);
        this._setState(state_created);
        jobProfilerMark(this, "job-scheduled", "info");
    }, {

        /// <field type="Boolean" locid="PluginUtilities.Utilities.Scheduler._JobNode.completed" helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.completed">
        /// Gets a value that indicates whether the job has completed. This value is true if job has run to completion
        /// and false if it hasn't yet run or was canceled.
        /// </field>
        completed: {
            get: function () { return !!this._state.completed; }
        },

        /// <field type="Number" locid="PluginUtilities.Utilities.Scheduler._JobNode.id" helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.id">
        /// Gets the unique identifier for this job.
        /// </field>
        id: {
            get: function () { return this._id; }
        },

        /// <field type="String" locid="PluginUtilities.Utilities.Scheduler._JobNode.name" helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.name">
        /// Gets or sets a string that specifies the diagnostic name for this job.
        /// </field>
        name: {
            get: function () { return this._name; },
            set: function (value) { this._name = value; }
        },

        /// <field type="PluginUtilities.Utilities.Scheduler._OwnerToken" locid="PluginUtilities.Utilities.Scheduler._JobNode.owner" helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.owner">
        /// Gets an owner token for the job. You can use this owner token's cancelAll method to cancel related jobs.
        /// </field>
        owner: {
            get: function () { return this._owner; },
            set: function (value) {
                this._owner && this._owner._remove(this);
                this._owner = value;
                this._owner && this._owner._add(this);
            }
        },

        /// <field type="PluginUtilities.Utilities.Scheduler.Priority" locid="PluginUtilities.Utilities.Scheduler._JobNode.priority" helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.priority">
        /// Gets or sets the priority at which this job is executed by the scheduler.
        /// </field>
        priority: {
            get: function () { return this._priority; },
            set: function (value) {
                value = clampPriority(value);
                this._state.setPriority(this, value);
            }
        },

        cancel: function () {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.cancel">
            /// <summary locid="PluginUtilities.Utilities.Scheduler._JobNode.cancel">Cancels the job.</summary>
            /// </signature>
            this._state.cancel(this);
        },

        pause: function () {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.pause">
            /// <summary locid="PluginUtilities.Utilities.Scheduler._JobNode.pause">Pauses the job.</summary>
            /// </signature>
            this._state.pause(this);
        },

        resume: function () {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler._JobNode.resume">
            /// <summary locid="PluginUtilities.Utilities.Scheduler._JobNode.resume">Resumes the job if it's been paused.</summary>
            /// </signature>
            this._state.resume(this);
        },

        _execute: function (shouldYield) {
            this._state.execute(this, shouldYield);
        },

        _executeDone: function (result) {
            return this._state.executeDone(this, result);
        },

        _blockedDone: function (result) {
            return this._state.blockedDone(this, result);
        },

        _setPriority: function (value) {
            if (+this._priority === this._priority && this._priority !== value) {
                jobProfilerMark(this, "job-priority-changed", "info",
                    markerFromPriority(this._priority).name,
                    markerFromPriority(value).name);
            }
            this._priority = value;
        },

        _setState: function (state, arg0, arg1) {
            if (this._state) {
                PluginUtilities.log && PluginUtilities.log("Transitioning job (" + this.id + ") from: " + this._state.name + " to: " + state.name, "PluginUtilities scheduler", "log");
            }
            this._state = state;
            this._state.enter(this, arg0, arg1);
        },

    });
    PluginUtilities.Class.mix(JobNode, linkedListMixin("Job"));

    var YieldPolicy = {
        complete: 1,
        continue: 2,
        block: 3,
    };

    //
    // JobInfo object is passed to a work item when it is executed and allows the work to ask whether it
    //  should cooperatively yield and in that event provide a continuation work function to run the
    //  next time this job is scheduled. The JobInfo object additionally allows access to the job itself
    //  and the ability to provide a Promise for a future continuation work function in order to have
    //  jobs easily block on async work.
    //

    var JobInfo = PluginUtilities.Class.define(function (shouldYield, job) {
        this._job = job;
        this._result = null;
        this._yieldPolicy = YieldPolicy.complete;
        this._shouldYield = shouldYield;
    }, {

        /// <field type="PluginUtilities.Utilities.Scheduler._JobNode" locid="PluginUtilities.Utilities.Scheduler._JobInfo.job" helpKeyword="PluginUtilities.Utilities.Scheduler._JobInfo.job">
        /// The job instance for which the work is currently being executed.
        /// </field>
        job: {
            get: function () {
                this._throwIfDisabled();
                return this._job;
            }
        },

        /// <field type="Boolean" locid="PluginUtilities.Utilities.Scheduler._JobInfo.shouldYield" helpKeyword="PluginUtilities.Utilities.Scheduler._JobInfo.shouldYield">
        /// A boolean which will become true when the work item is requested to cooperatively yield by the scheduler.
        /// </field>
        shouldYield: {
            get: function () {
                this._throwIfDisabled();
                return this._shouldYield();
            }
        },

        setPromise: function (promise) {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler._JobInfo.setPromise">
            /// <summary locid="PluginUtilities.Utilities.Scheduler._JobInfo.setPromise">
            /// Called when the  work item is blocked on asynchronous work.
            /// The scheduler waits for the specified Promise to complete before rescheduling the job.
            /// </summary>
            /// <param name="promise" type="PluginUtilities.Promise" locid="PluginUtilities.Utilities.Scheduler._JobInfo.setPromise_p:promise">
            /// A Promise value which, when completed, provides a work item function to be re-scheduled.
            /// </param>
            /// </signature>
            this._throwIfDisabled();
            this._result = promise;
            this._yieldPolicy = YieldPolicy.block;
        },

        setWork: function (work) {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler._JobInfo.setWork">
            /// <summary locid="PluginUtilities.Utilities.Scheduler._JobInfo.setWork">
            /// Called  when the work item is cooperatively yielding to the scheduler and has more work to complete in the future.
            /// Use this method to schedule additonal work for when the work item is about to yield.
            /// </summary>
            /// <param name="work" type="Function" locid="PluginUtilities.Utilities.Scheduler._JobInfo.setWork_p:work">
            /// The work function which will be re-scheduled.
            /// </param>
            /// </signature>
            this._throwIfDisabled();
            this._result = work;
            this._yieldPolicy = YieldPolicy.continue;
        },

        _disablePublicApi: function () {
            // _disablePublicApi should be called as soon as the job yields. This
            //  says that the job info object should no longer be used by the
            //  job and if the job tries to use it, job info will throw.
            //
            this._publicApiDisabled = true;
        },

        _throwIfDisabled: function () {
            if (this._publicApiDisabled) {
                throw new PluginUtilities.ErrorFromName("PluginUtilities.Utilities.Scheduler.JobInfoIsNoLongerValid", strings.jobInfoIsNoLongerValid);
            }
        }

    });

    //
    // Owner type. Made available to developers through the createOwnerToken method.
    //  Allows cancelation of jobs in bulk.
    //

    var OwnerToken = PluginUtilities.Class.define(function OwnerToken_ctor() {
        this._jobs = {};
    }, {
        cancelAll: function OwnerToken_cancelAll() {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler._OwnerToken.cancelAll">
            /// <summary locid="PluginUtilities.Utilities.Scheduler._OwnerToken.cancelAll">
            /// Cancels all jobs that are associated with this owner token.
            /// </summary>
            /// </signature>
            var jobs = this._jobs,
                jobIds = Object.keys(jobs);
            this._jobs = {};

            for (var i = 0, len = jobIds.length; i < len; i++) {
                jobs[jobIds[i]].cancel();
            }
        },

        _add: function OwnerToken_add(job) {
            this._jobs[job.id] = job;
        },

        _remove: function OwnerToken_remove(job) {
            delete this._jobs[job.id];
        }
    });

    function _() {
        // Noop function, used in the various states to indicate that they don't support a given
        // message. Named with the somewhat cute name '_' because it reads really well in the states.
        //
        return false;
    }
    function illegal(job) {
        throw "Illegal call by job(" + job.id + ") in state: " + this.name;
    }

    //
    // Scheduler job state machine.
    //
    // A job normally goes through a lifecycle which is created -> scheduled -> running -> complete. The
    //  Scheduler decides when to transition a job from scheduled to running based on its policies and
    //  the other work which is scheduled.
    //
    // Additionally there are various operations which can be performed on a job which will change its
    //  state like: cancel, pause, resume and setting the job's priority.
    //
    // Additionally when in the running state a job may either cooperatively yield, or block.
    //
    // The job state machine accounts for these various states and interactions.
    //

    var State = PluginUtilities.Class.define(function (name) {
        this.name = name;
        this.enter = illegal;
        this.execute = illegal;
        this.executeDone = illegal;
        this.blockedDone = illegal;
        this.cancel = illegal;
        this.pause = illegal;
        this.resume = illegal;
        this.setPriority = illegal;
    });

    var state_created = new State("created"),                                   // -> scheduled
        state_scheduled = new State("scheduled"),                               // -> running | canceled | paused
        state_paused = new State("paused"),                                     // -> canceled | scheduled
        state_canceled = new State("canceled"),                                 // -> .
        state_running = new State("running"),                                   // -> cooperative_yield | blocked | complete | running_canceled | running_paused
        state_running_paused = new State("running_paused"),                     // -> cooperative_yield_paused | blocked_paused | complete | running_canceled | running_resumed
        state_running_resumed = new State("running_resumed"),                   // -> cooperative_yield | blocked | complete | running_canceled | running_paused
        state_running_canceled = new State("running_canceled"),                 // -> canceled | running_canceled_blocked
        state_running_canceled_blocked = new State("running_canceled_blocked"), // -> canceled
        state_cooperative_yield = new State("cooperative_yield"),               // -> scheduled
        state_cooperative_yield_paused = new State("cooperative_yield_paused"), // -> paused
        state_blocked = new State("blocked"),                                   // -> blocked_waiting
        state_blocked_waiting = new State("blocked_waiting"),                   // -> cooperative_yield | complete | blocked_canceled | blocked_paused_waiting
        state_blocked_paused = new State("blocked_paused"),                     // -> blocked_paused_waiting
        state_blocked_paused_waiting = new State("blocked_paused_waiting"),     // -> cooperative_yield_paused | complete | blocked_canceled | blocked_waiting
        state_blocked_canceled = new State("blocked_canceled"),                 // -> canceled
        state_complete = new State("complete");                                 // -> .

    // A given state may include implementations for the following operations:
    //
    //  - enter(job, arg0, arg1)
    //  - execute(job, shouldYield)
    //  - executeDone(job, result) --> next state
    //  - blockedDone(job, result, initialPriority)
    //  - cancel(job)
    //  - pause(job)
    //  - resume(job)
    //  - setPriority(job, priority)
    //
    // Any functions which are not implemented are illegal in that state.
    // Any functions which have an implementation of _ are a nop in that state.
    //

    // Helper which yields a function that transitions to the specified state
    //
    function setState(state) {
        return function (job, arg0, arg1) {
            job._setState(state, arg0, arg1);
        };
    }

    // Helper which sets the priority of a job.
    //
    function changePriority(job, priority) {
        job._setPriority(priority);
    }

    // Created
    //
    state_created.enter = function (job) {
        addJobAtTailOfPriority(job, job.priority);
        job._setState(state_scheduled);
    };

    // Scheduled
    //
    state_scheduled.enter = function (job) {
        startRunning();
    };
    state_scheduled.execute = setState(state_running);
    state_scheduled.cancel = setState(state_canceled);
    state_scheduled.pause = setState(state_paused);
    state_scheduled.resume = _;
    state_scheduled.setPriority = function (job, priority) {
        if (job.priority !== priority) {
            job._setPriority(priority);
            job.pause();
            job.resume();
        }
    };

    // Paused
    //
    state_paused.enter = function (job) {
        jobProfilerMark(job, "job-paused", "info");
        job._removeJob();
    };
    state_paused.cancel = setState(state_canceled);
    state_paused.pause = _;
    state_paused.resume = function (job) {
        jobProfilerMark(job, "job-resumed", "info");
        addJobAtTailOfPriority(job, job.priority);
        job._setState(state_scheduled);
    };
    state_paused.setPriority = changePriority;

    // Canceled
    //
    state_canceled.enter = function (job) {
        jobProfilerMark(job, "job-canceled", "info");
        Debug.msTraceAsyncOperationCompleted(job._asyncOpID, Debug.MS_ASYNC_OP_STATUS_CANCELED)
        job._removeJob();
        job._work = null;
        job._context = null;
        job.owner = null;
    };
    state_canceled.cancel = _;
    state_canceled.pause = _;
    state_canceled.resume = _;
    state_canceled.setPriority = _;

    // Running
    //
    state_running.enter = function (job, shouldYield) {
        // Remove the job from the list in case it throws an exception, this means in the 
        //  yield case we have to add it back.
        //
        job._removeJob();

        var priority = job.priority;
        var work = job._work;
        var context = job._context;

        // Null out the work and context so they aren't leaked if the job throws an exception.
        //
        job._work = null;
        job._context = null;

        var jobInfo = new JobInfo(shouldYield, job);

        Debug.msTraceAsyncCallbackStarting(job._asyncOpID);
        try {
            MSApp.execAtPriority(function () {
                work.call(context, jobInfo);
            }, toWwaPriority(priority));
        } finally {
            Debug.msTraceAsyncCallbackCompleted();
            jobInfo._disablePublicApi();
        }

        // Restore the context in case it is needed due to yielding or blocking.
        //
        job._context = context;

        var targetState = job._executeDone(jobInfo._yieldPolicy);

        job._setState(targetState, jobInfo._result, priority);
    };
    state_running.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield;
            case YieldPolicy.block:
                return state_blocked;
        }
    };
    state_running.cancel = function (job) {
        // Interaction with the singleton scheduler. The act of canceling a job pokes the scheduler
        //  and tells it to start asking the job to yield.
        //
        immediateYield = true;
        job._setState(state_running_canceled);
    };
    state_running.pause = function (job) {
        // Interaction with the singleton scheduler. The act of pausing a job pokes the scheduler
        //  and tells it to start asking the job to yield.
        //
        immediateYield = true;
        job._setState(state_running_paused);
    };
    state_running.resume = _;
    state_running.setPriority = changePriority;

    // Running paused
    //
    state_running_paused.enter = _;
    state_running_paused.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield_paused;
            case YieldPolicy.block:
                return state_blocked_paused;
        }
    };
    state_running_paused.cancel = setState(state_running_canceled);
    state_running_paused.pause = _;
    state_running_paused.resume = setState(state_running_resumed);
    state_running_paused.setPriority = changePriority;

    // Running resumed
    //
    state_running_resumed.enter = _;
    state_running_resumed.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield;
            case YieldPolicy.block:
                return state_blocked;
        }
    };
    state_running_resumed.cancel = setState(state_running_canceled);
    state_running_resumed.pause = setState(state_running_paused);
    state_running_resumed.resume = _;
    state_running_resumed.setPriority = changePriority;

    // Running canceled
    //
    state_running_canceled.enter = _;
    state_running_canceled.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
            case YieldPolicy.continue:
                return state_canceled;
            case YieldPolicy.block:
                return state_running_canceled_blocked;
        }
    };
    state_running_canceled.cancel = _;
    state_running_canceled.pause = _;
    state_running_canceled.resume = _;
    state_running_canceled.setPriority = _;

    // Running canceled -> blocked
    //
    state_running_canceled_blocked.enter = function (job, work) {
        work.cancel();
        job._setState(state_canceled);
    };

    // Cooperative yield
    //
    state_cooperative_yield.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-yielded", "info");
        if (initialPriority === job.priority) {
            addJobAtHeadOfPriority(job, job.priority);
        } else {
            addJobAtTailOfPriority(job, job.priority);
        }
        job._work = work;
        job._setState(state_scheduled);
    };

    // Cooperative yield paused
    //
    state_cooperative_yield_paused.enter = function (job, work) {
        jobProfilerMark(job, "job-yielded", "info");
        job._work = work;
        job._setState(state_paused);
    };

    // Blocked
    //
    state_blocked.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-blocked", "StartTM");
        job._work = work;
        job._setState(state_blocked_waiting);

        // Sign up for a completion from the provided promise, after the completion occurs
        //  transition from the current state at the completion time to the target state
        //  depending on the completion value.
        //
        work.done(
            function (newWork) {
                jobProfilerMark(job, "job-blocked", "StopTM");
                var targetState = job._blockedDone(newWork);
                job._setState(targetState, newWork, initialPriority);
            },
            function (error) {
                if (!(error && error.name === "Canceled")) {
                    jobProfilerMark(job, "job-error", "info");
                }
                jobProfilerMark(job, "job-blocked", "StopTM");
                job._setState(state_canceled);
                return Promise.wrapError(error);
            }
        );
    };

    // Blocked waiting
    //
    state_blocked_waiting.enter = _;
    state_blocked_waiting.blockedDone = function (job, result) {
        if (typeof result === "function") {
            return state_cooperative_yield;
        } else {
            return state_complete;
        }
    };
    state_blocked_waiting.cancel = setState(state_blocked_canceled);
    state_blocked_waiting.pause = setState(state_blocked_paused_waiting);
    state_blocked_waiting.resume = _;
    state_blocked_waiting.setPriority = changePriority;

    // Blocked paused
    //
    state_blocked_paused.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-blocked", "StartTM");
        job._work = work;
        job._setState(state_blocked_paused_waiting);

        // Sign up for a completion from the provided promise, after the completion occurs
        //  transition from the current state at the completion time to the target state
        //  depending on the completion value.
        //
        work.done(
            function (newWork) {
                jobProfilerMark(job, "job-blocked", "StopTM");
                var targetState = job._blockedDone(newWork);
                job._setState(targetState, newWork, initialPriority);
            },
            function (error) {
                if (!(error && error.name === "Canceled")) {
                    jobProfilerMark(job, "job-error", "info");
                }
                jobProfilerMark(job, "job-blocked", "StopTM");
                job._setState(state_canceled);
                return Promise.wrapError(error);
            }
        );
    };

    // Blocked paused waiting
    //
    state_blocked_paused_waiting.enter = _;
    state_blocked_paused_waiting.blockedDone = function (job, result) {
        if (typeof result === "function") {
            return state_cooperative_yield_paused;
        } else {
            return state_complete;
        }
    };
    state_blocked_paused_waiting.cancel = setState(state_blocked_canceled);
    state_blocked_paused_waiting.pause = _;
    state_blocked_paused_waiting.resume = setState(state_blocked_waiting);
    state_blocked_paused_waiting.setPriority = changePriority;

    // Blocked canceled
    //
    state_blocked_canceled.enter = function (job) {
        // Cancel the outstanding promise and then eventually it will complete, presumably with a 'canceled'
        //  error at which point we will transition to the canceled state.
        //
        job._work.cancel();
        job._work = null;
    };
    state_blocked_canceled.blockedDone = function (job, result) {
        return state_canceled;
    };
    state_blocked_canceled.cancel = _;
    state_blocked_canceled.pause = _;
    state_blocked_canceled.resume = _;
    state_blocked_canceled.setPriority = _;

    // Complete
    //
    state_complete.completed = true;
    state_complete.enter = function (job) {
        Debug.msTraceAsyncOperationCompleted(job._asyncOpID, Debug.MS_ASYNC_OP_STATUS_SUCCESS);
        job._work = null;
        job._context = null;
        job.owner = null;
        jobProfilerMark(job, "job-completed", "info");
    };
    state_complete.cancel = _;
    state_complete.pause = _;
    state_complete.resume = _;
    state_complete.setPriority = _;

    // Private Priority marker node in the Job list. The marker nodes are linked both into the job
    //  list and a separate marker list. This is used so that jobs can be easily added into a given
    //  priority level by simply traversing to the next marker in the list and inserting before it.
    //
    // Markers may either be "static" or "dynamic". Static markers are the set of things which are 
    //  named and are always in the list, they may exist with or without jobs at their priority 
    //  level. Dynamic markers are added as needed.
    //
    // @NOTE: Dynamic markers are NYI
    //
    var MarkerNode = PluginUtilities.Class.define(function (priority, name) {
        this.priority = priority;
        this.name = name;
    }, {

        // NYI
        //
        //dynamic: {
        //    get: function () { return !this.name; }
        //},

    });
    PluginUtilities.Class.mix(MarkerNode, linkedListMixin("Job"), linkedListMixin("Marker"));

    //
    // Scheduler state
    //

    // Unique ID per job.
    //
    var globalJobId = 0;

    // Unique ID per drain request.
    var globalDrainId = 0;

    // Priority is: -15 ... 0 ... 15 where that maps to: 'min' ... 'normal' ... 'max'
    //
    var MIN_PRIORITY = -15;
    var MAX_PRIORITY = 15;

    // Named priorities
    //
    var Priority = {
        max: 15,
        high: 13,
        aboveNormal: 9,
        normal: 0,
        belowNormal: -9,
        idle: -13,
        min: -15,
    };

    // Definition of the priorities, named have static markers.
    //
    var priorities = [
        new MarkerNode(15, "max"),          // Priority.max
        new MarkerNode(14, "14"),
        new MarkerNode(13, "high"),         // Priority.high
        new MarkerNode(12, "12"),
        new MarkerNode(11, "11"),
        new MarkerNode(10, "10"),
        new MarkerNode(9, "aboveNormal"),   // Priority.aboveNormal
        new MarkerNode(8, "8"),
        new MarkerNode(7, "7"),
        new MarkerNode(6, "6"),
        new MarkerNode(5, "5"),
        new MarkerNode(4, "4"),
        new MarkerNode(3, "3"),
        new MarkerNode(2, "2"),
        new MarkerNode(1, "1"),
        new MarkerNode(0, "normal"),        // Priority.normal
        new MarkerNode(-1, "-1"),
        new MarkerNode(-2, "-2"),
        new MarkerNode(-3, "-3"),
        new MarkerNode(-4, "-4"),
        new MarkerNode(-5, "-5"),
        new MarkerNode(-6, "-6"),
        new MarkerNode(-7, "-7"),
        new MarkerNode(-8, "-8"),
        new MarkerNode(-9, "belowNormal"),  // Priority.belowNormal
        new MarkerNode(-10, "-10"),
        new MarkerNode(-11, "-11"),
        new MarkerNode(-12, "-12"),
        new MarkerNode(-13, "idle"),        // Priority.idle
        new MarkerNode(-14, "-14"),
        new MarkerNode(-15, "min"),         // Priority.min
        new MarkerNode(-16, "<TAIL>")
    ];

    function dumpList(type, reverse) {
        function dumpMarker(marker, pos) {
            PluginUtilities.log && PluginUtilities.log(pos + ": MARKER: " + marker.name, "PluginUtilities scheduler", "log");
        }
        function dumpJob(job, pos) {
            PluginUtilities.log && PluginUtilities.log(pos + ": JOB(" + job.id + "): state: " + (job._state ? job._state.name : "") + (job.name ? ", name: " + job.name : ""), "PluginUtilities scheduler", "log");
        }
        PluginUtilities.log && PluginUtilities.log("highWaterMark: " + highWaterMark, "PluginUtilities scheduler", "log");
        var pos = 0;
        var head = reverse ? priorities[priorities.length - 1] : priorities[0];
        var current = head;
        do {
            if (current instanceof MarkerNode) {
                dumpMarker(current, pos);
            }
            if (current instanceof JobNode) {
                dumpJob(current, pos);
            }
            pos++;
            current = reverse ? current["_prev" + type] : current["_next" + type];
        } while (current);
    }

    function retrieveState() {
        /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler.retrieveState">
        /// <summary locid="PluginUtilities.Utilities.Scheduler.retrieveState">
        /// Returns a string representation of the scheduler's state for diagnostic
        /// purposes. The jobs and drain requests are displayed in the order in which
        /// they are currently expected to be processed. The current job and drain
        /// request are marked by an asterisk.
        /// </summary>
        /// </signature>
        var output = "";

        function logJob(job, isRunning) {
            output +=
                "    " + (isRunning ? "*" : " ") +
                "id: " + job.id +
                ", priority: " + markerFromPriority(job.priority).name +
                (job.name ? ", name: " + job.name : "") +
                "\n";
        }

        output += "Jobs:\n";
        var current = markerFromPriority(highWaterMark);
        var jobCount = 0;
        if (runningJob) {
            logJob(runningJob, true);
            jobCount++;
        }
        while (current.priority >= Priority.min) {
            if (current instanceof JobNode) {
                logJob(current, false);
                jobCount++;
            }
            current = current._nextJob;
        }
        if (jobCount === 0) {
            output += "     None\n";
        }

        output += "Drain requests:\n";
        for (var i = 0, len = drainQueue.length; i < len; i++) {
            output +=
                "    " + (i === 0 ? "*" : " ") +
                "priority: " + markerFromPriority(drainQueue[i].priority).name +
                ", name: " + drainQueue[i].name +
                "\n";
        }
        if (drainQueue.length === 0) {
            output += "     None\n";
        }

        return output;
    }

    function isEmpty() {
        var current = priorities[0];
        do {
            if (current instanceof JobNode) {
                return false;
            }
            current = current._nextJob;
        } while (current);

        return true;
    }

    // The WWA priority at which the pump is currently scheduled on the WWA scheduler.
    //  null when the pump is not scheduled.
    //
    var scheduledWwaPriority = null;

    // Whether the scheduler pump is currently on the stack
    //
    var pumping;
    // What priority is currently being pumped
    //
    var pumpingPriority;

    // A reference to the job object that is currently running.
    //  null when no job is running.
    //
    var runningJob = null;

    // Whether we are using the WWA scheduler.
    //
    var usingWwaScheduler = !!(global.MSApp && global.MSApp.execAtPriority);

    // Queue of drain listeners
    //
    var drainQueue = [];

    // Bit indicating that we should yield immediately
    //
    var immediateYield;

    // time slice for scheduler
    //
    var TIME_SLICE = 30;

    // high-water-mark is maintained any time priorities are adjusted, new jobs are 
    //  added or the scheduler pumps itself down through a priority marker. The goal
    //  of the high-water-mark is to be a fast check as to whether a job may exist
    //  at a higher priority level than we are currently at. It may be wrong but it
    //  may only be wrong by being higher than the current highest priority job, not
    //  lower as that would cause the system to pump things out of order.
    //
    var highWaterMark = Priority.min;

    //
    // Initialize the scheduler
    //

    // Wire up the markers
    //
    priorities.reduce(function (prev, current) {
        if (prev) {
            prev._insertJobAfter(current);
            prev._insertMarkerAfter(current);
        }
        return current;
    })

    //
    // Draining mechanism
    //
    // For each active drain request, there is a unique drain listener in the
    //  drainQueue. Requests are processed in FIFO order. The scheduler is in
    //  drain mode precisely when the drainQueue is non-empty.
    //

    // Returns priority of the current drain request
    //
    function currentDrainPriority() {
        return drainQueue.length === 0 ? null : drainQueue[0].priority;
    }

    function drainStarting(listener) {
        schedulerProfilerMark("drain", "StartTM", listener.name, markerFromPriority(listener.priority).name);
    }
    function drainStopping(listener, canceled) {
        if (canceled) {
            schedulerProfilerMark("drain-canceled", "info", listener.name, markerFromPriority(listener.priority).name);
        }
        schedulerProfilerMark("drain", "StopTM", listener.name, markerFromPriority(listener.priority).name);
    }

    function addDrainListener(priority, complete, name) {
        drainQueue.push({ priority: priority, complete: complete, name: name });
        if (drainQueue.length === 1) {
            drainStarting(drainQueue[0]);
            if (priority > highWaterMark) {
                highWaterMark = priority;
                immediateYield = true;
            }
        }
    }

    function removeDrainListener(complete, canceled) {
        var i,
            len = drainQueue.length;

        for (i = 0; i < len; i++) {
            if (drainQueue[i].complete === complete) {
                if (i === 0) {
                    drainStopping(drainQueue[0], canceled);
                    drainQueue[1] && drainStarting(drainQueue[1]);
                }
                drainQueue.splice(i, 1);
                break;
            }
        }
    }

    // Notifies and removes the current drain listener
    //
    function notifyCurrentDrainListener() {
        var listener = drainQueue.shift();

        if (listener) {
            drainStopping(listener);
            drainQueue[0] && drainStarting(drainQueue[0]);
            listener.complete();
        }
    }

    // Notifies all drain listeners which are at a priority > highWaterMark.
    //  Returns whether or not any drain listeners were notified. This
    //  function sets pumpingPriority and reads highWaterMark. Note that
    //  it may call into user code which may call back into the scheduler.
    //
    function notifyDrainListeners() {
        var notifiedSomebody = false;
        if (!!drainQueue.length) {
            // As we exhaust priority levels, notify the appropriate drain listeners.
            //
            var drainPriority = currentDrainPriority();
            while (+drainPriority === drainPriority && drainPriority > highWaterMark) {
                pumpingPriority = drainPriority;
                notifyCurrentDrainListener();
                notifiedSomebody = true;
                drainPriority = currentDrainPriority();
            }
        }
        return notifiedSomebody;
    }

    //
    // Interfacing with the WWA Scheduler
    //

    // Stubs for the parts of the WWA scheduler APIs that we use. These stubs are
    //  used in contexts where the WWA scheduler is not available.
    //
    var MSAppStubs = {
        execAsyncAtPriority: function (callback, priority) {
            // If it's a high priority callback then we additionally schedule using setTimeout(0)
            //
            if (priority === MSApp.HIGH) {
                setTimeout(callback, 0);
            }
            // We always schedule using setImmediate
            //
            setImmediate(callback);
        },

        execAtPriority: function (callback, priority) {
            return callback();
        },

        getCurrentPriority: function () {
            return MSAppStubs.NORMAL;
        },

        isTaskScheduledAtPriorityOrHigher: function (priority) {
            return false;
        },

        HIGH: "high",
        NORMAL: "normal",
        IDLE: "idle"
    };

    var MSApp = (usingWwaScheduler ? global.MSApp : MSAppStubs);

    function toWwaPriority(PluginUtilitiesPriority) {
        if (PluginUtilitiesPriority >= Priority.aboveNormal + 1) { return MSApp.HIGH; }
        if (PluginUtilitiesPriority >= Priority.belowNormal) { return MSApp.NORMAL; }
        return MSApp.IDLE;
    }

    var wwaPriorityToInt = {};
    wwaPriorityToInt[MSApp.IDLE] = 1;
    wwaPriorityToInt[MSApp.NORMAL] = 2;
    wwaPriorityToInt[MSApp.HIGH] = 3;

    function isEqualOrHigherWwaPriority(priority1, priority2) {
        return wwaPriorityToInt[priority1] >= wwaPriorityToInt[priority2];
    }

    function isHigherWwaPriority(priority1, priority2) {
        return wwaPriorityToInt[priority1] > wwaPriorityToInt[priority2];
    }

    function wwaTaskScheduledAtPriorityHigherThan(wwaPriority) {
        switch (wwaPriority) {
            case MSApp.HIGH:
                return false;
            case MSApp.NORMAL:
                return MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.HIGH);
            case MSApp.IDLE:
                return MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.NORMAL);
        }
    }

    //
    // Mechanism for the scheduler
    //

    function addJobAtHeadOfPriority(node, priority) {
        var marker = markerFromPriority(priority);
        if (marker.priority > highWaterMark) {
            highWaterMark = marker.priority;
            immediateYield = true;
        }
        marker._insertJobAfter(node);
    }

    function addJobAtTailOfPriority(node, priority) {
        var marker = markerFromPriority(priority);
        if (marker.priority > highWaterMark) {
            highWaterMark = marker.priority;
            immediateYield = true;
        }
        marker._nextMarker._insertJobBefore(node);
    }

    function clampPriority(priority) {
        priority = priority | 0;
        priority = Math.max(priority, MIN_PRIORITY);
        priority = Math.min(priority, MAX_PRIORITY);
        return priority;
    }

    function markerFromPriority(priority) {
        priority = clampPriority(priority);

        // The priority skip list is from high -> idle, add the offset and then make it positive.
        //
        return priorities[-1 * (priority - MAX_PRIORITY)];
    }

    // Performance.now is not defined in web workers.
    //
    var now = (global.performance && performance.now && performance.now.bind(performance)) || Date.now.bind(Date);

    // Main scheduler pump.
    //
    function run(scheduled) {
        pumping = true;
        schedulerProfilerMark("timeslice", "StartTM");
        var didWork;
        var ranJobSuccessfully = true;
        var current;

        // Reset per-run state
        //
        immediateYield = false;

        try {
            var start = now();
            var end = start + TIME_SLICE;
            var lastLoggedPriority;
            var yieldForPriorityBoundary = false;

            // Yielding policy
            //
            // @TODO, should we have a different scheduler policy when the debugger is attached. Today if you
            //  break in user code we will generally yield immediately after that job due to the fact that any
            //  breakpoint will take longer than TIME_SLICE to process.
            //
            var timesliceExhausted = false;
            var shouldYield = function () {
                timesliceExhausted = false;
                if (immediateYield) { return true; }
                if (wwaTaskScheduledAtPriorityHigherThan(toWwaPriority(highWaterMark))) { return true; }
                if (!!drainQueue.length) { return false; }
                if (now() > end) {
                    timesliceExhausted = true;
                    return true;
                }
                return false;
            };

            // Run until we run out of jobs or decide it is time to yield
            //
            while (highWaterMark >= Priority.min && !shouldYield() && !yieldForPriorityBoundary) {

                didWork = false;
                current = markerFromPriority(highWaterMark)._nextJob;
                do {
                    // Record the priority currently being pumped
                    //
                    pumpingPriority = current.priority;

                    if (current instanceof JobNode) {
                        if (lastLoggedPriority !== current.priority) {
                            if (+lastLoggedPriority === lastLoggedPriority) {
                                schedulerProfilerMark("priority", "StopTM", markerFromPriority(lastLoggedPriority).name);
                            }
                            schedulerProfilerMark("priority", "StartTM", markerFromPriority(current.priority).name);
                            lastLoggedPriority = current.priority;
                        }

                        // Important that we update this state before calling execute because the
                        //  job may throw an exception and we don't want to stall the queue.
                        //
                        didWork = true;
                        ranJobSuccessfully = false;
                        runningJob = current;
                        jobProfilerMark(runningJob, "job-running", "StartTM", markerFromPriority(pumpingPriority).name);
                        current._execute(shouldYield);
                        jobProfilerMark(runningJob, "job-running", "StopTM", markerFromPriority(pumpingPriority).name);
                        runningJob = null;
                        ranJobSuccessfully = true;
                    } else {
                        // As we pass marker nodes update our high water mark. It's important to do
                        //  this before notifying drain listeners because they may schedule new jobs
                        //  which will affect the highWaterMark.
                        //
                        var wwaPrevHighWaterMark = toWwaPriority(highWaterMark);
                        highWaterMark = current.priority;

                        didWork = notifyDrainListeners();

                        var wwaHighWaterMark = toWwaPriority(highWaterMark);
                        if (isHigherWwaPriority(wwaPrevHighWaterMark, wwaHighWaterMark) &&
                                (!usingWwaScheduler || MSApp.isTaskScheduledAtPriorityOrHigher(wwaHighWaterMark))) {
                            // Timeslice is moving to a lower WWA priority and the host
                            //  has equally or more important work to do. Time to yield.
                            //
                            yieldForPriorityBoundary = true;
                        }
                    }

                    current = current._nextJob;

                    // When didWork is true we exit the loop because:
                    //  - We've called into user code which may have modified the
                    //    scheduler's queue. We need to restart at the high water mark.
                    //  - We need to check if it's time for the scheduler to yield.
                    //
                } while (current && !didWork && !yieldForPriorityBoundary && !wwaTaskScheduledAtPriorityHigherThan(toWwaPriority(highWaterMark)));

                // Reset per-item state
                //
                immediateYield = false;

            }

        } finally {
            runningJob = null;

            // If a job was started and did not run to completion due to an exception
            //  we should transition it to a terminal state.
            //
            if (!ranJobSuccessfully) {
                jobProfilerMark(current, "job-error", "info");
                jobProfilerMark(current, "job-running", "StopTM", markerFromPriority(pumpingPriority).name);
                current.cancel();
            }

            if (+lastLoggedPriority === lastLoggedPriority) {
                schedulerProfilerMark("priority", "StopTM", markerFromPriority(lastLoggedPriority).name);
            }
            // Update high water mark to be the priority of the highest priority job.
            //
            var foundAJob = false;
            while (highWaterMark >= Priority.min && !foundAJob) {

                didWork = false;
                current = markerFromPriority(highWaterMark)._nextJob;
                do {

                    if (current instanceof JobNode) {
                        // We found a job. High water mark is now set to the priority
                        //  of this job.
                        //
                        foundAJob = true;
                    } else {
                        // As we pass marker nodes update our high water mark. It's important to do
                        //  this before notifying drain listeners because they may schedule new jobs
                        //  which will affect the highWaterMark.
                        //
                        highWaterMark = current.priority;

                        didWork = notifyDrainListeners();
                    }

                    current = current._nextJob;

                    // When didWork is true we exit the loop because:
                    //  - We've called into user code which may have modified the
                    //    scheduler's queue. We need to restart at the high water mark.
                    //
                } while (current && !didWork && !foundAJob);
            }

            var reasonForYielding;
            if (!ranJobSuccessfully) {
                reasonForYielding = "job error";
            } else if (timesliceExhausted) {
                reasonForYielding = "timeslice exhausted";
            } else if (highWaterMark < Priority.min) {
                reasonForYielding = "jobs exhausted";
            } else if (yieldForPriorityBoundary) {
                reasonForYielding = "reached WWA priority boundary";
            } else {
                reasonForYielding = "WWA host work";
            }

            // If this was a scheduled call to the pump, then the pump is no longer
            //  scheduled to be called and we should clear its scheduled priority.
            //
            if (scheduled) {
                scheduledWwaPriority = null;
            }

            // If the high water mark has not reached the end of the queue then
            //  we re-queue in order to see if there are more jobs to run.
            //
            pumping = false;
            if (highWaterMark >= Priority.min) {
                startRunning();
            }
            schedulerProfilerMark("yielding", "info", reasonForYielding);
            schedulerProfilerMark("timeslice", "StopTM");
        }
    }

    // When we schedule the pump we assign it a version. When we start executing one we check
    //  to see what the max executed version is. If we have superseded it then we skip the call.
    //
    var scheduledVersion = 0;
    var executedVersion = 0;

    function startRunning(priority) {
        if (+priority !== priority) {
            priority = highWaterMark;
        }
        var priorityWwa = toWwaPriority(priority);

        // Don't schedule the pump while pumping. The pump will be scheduled
        //  immediately before yielding if necessary.
        //
        if (pumping) {
            return;
        }

        // If the pump is already scheduled at priority or higher, then there
        //  is no need to schedule the pump again.
        // However, when we're not using the WWA scheduler, we fallback to immediate/timeout
        //  which do not have a notion of priority. In this case, if the pump is scheduled,
        //  there is no need to schedule another pump.
        //
        if (scheduledWwaPriority && (!usingWwaScheduler || isEqualOrHigherWwaPriority(scheduledWwaPriority, priorityWwa))) {
            return;
        }
        var current = ++scheduledVersion;
        var runner = function () {
            if (executedVersion < current) {
                executedVersion = scheduledVersion;
                run(true);
            }
        };

        MSApp.execAsyncAtPriority(runner, priorityWwa);
        scheduledWwaPriority = priorityWwa;
    }

    function requestDrain(priority, name) {
        /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler.requestDrain">
        /// <summary locid="PluginUtilities.Utilities.Scheduler.requestDrain">
        /// Runs jobs in the scheduler without timeslicing until all jobs at the
        /// specified priority and higher have executed.
        /// </summary>
        /// <param name="priority" isOptional="true" type="PluginUtilities.Utilities.Scheduler.Priority" locid="PluginUtilities.Utilities.Scheduler.requestDrain_p:priority">
        /// The priority to which the scheduler should drain. The default is Priority.min, which drains all jobs in the queue.
        /// </param>
        /// <param name="name" isOptional="true" type="String" locid="PluginUtilities.Utilities.Scheduler.requestDrain_p:name">
        /// An optional description of the drain request for diagnostics.
        /// </param>
        /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Utilities.Scheduler.requestDrain_returnValue">
        /// A promise which completes when the drain has finished. Canceling this
        /// promise cancels the drain request. This promise will never enter an error state.
        /// </returns>
        /// </signature>

        var id = globalDrainId++;
        if (name === undefined) {
            name = "Drain Request " + id;
        }
        priority = (+priority === priority) ? priority : Priority.min;
        priority = clampPriority(priority);

        var complete;
        var promise = new Promise(function (c) {
            complete = c;
            addDrainListener(priority, complete, name);
        }, function () {
            removeDrainListener(complete, true);
        });

        if (!pumping) {
            startRunning();
        }

        return promise;
    }

    function execHigh(callback) {
        /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler.execHigh">
        /// <summary locid="PluginUtilities.Utilities.Scheduler.execHigh">
        /// Runs the specified callback in a high priority context.
        /// </summary>
        /// <param name="callback" type="Function" locid="PluginUtilities.Utilities.Scheduler.execHigh_p:callback">
        /// The callback to run in a high priority context.
        /// </param>
        /// <returns type="Object" locid="PluginUtilities.Utilities.Scheduler.execHigh_returnValue">
        /// The return value of the callback.
        /// </returns>
        /// </signature>

        return MSApp.execAtPriority(callback, MSApp.HIGH);
    }

    function createOwnerToken() {
        /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler.createOwnerToken">
        /// <summary locid="PluginUtilities.Utilities.Scheduler.createOwnerToken">
        /// Creates and returns a new owner token which can be set to the owner property of one or more jobs.
        /// It can then be used to cancel all jobs it "owns".
        /// </summary>
        /// <returns type="PluginUtilities.Utilities.Scheduler._OwnerToken" locid="PluginUtilities.Utilities.Scheduler.createOwnerToken_returnValue">
        /// The new owner token. You can use this token to control jobs that it owns.
        /// </returns>
        /// </signature>

        return new OwnerToken();
    }

    function schedule(work, priority, thisArg, name) {
        /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler.schedule">
        /// <summary locid="PluginUtilities.Utilities.Scheduler.schedule">
        /// Schedules the specified function to execute asynchronously.
        /// </summary>
        /// <param name="work" type="Function" locid="PluginUtilities.Utilities.Scheduler.schedule_p:work">
        /// A function that represents the work item to be scheduled. When called the work item will receive as its first argument
        /// a JobInfo object which allows the work item to ask the scheduler if it should yield cooperatively and if so allows the
        /// work item to either provide a function to be run as a continuation or a PluginUtilities.Promise which will when complete
        /// provide a function to run as a continuation.
        /// </param>
        /// <param name="priority" isOptional="true" type="PluginUtilities.Utilities.Scheduler.Priority" locid="PluginUtilities.Utilities.Scheduler.schedule_p:priority">
        /// The priority at which to schedule the work item. The default value is Priority.normal.
        /// </param>
        /// <param name="thisArg" isOptional="true" type="Object" locid="PluginUtilities.Utilities.Scheduler.schedule_p:thisArg">
        /// A 'this' instance to be bound into the work item. The default value is null.
        /// </param>
        /// <param name="name" isOptional="true" type="String" locid="PluginUtilities.Utilities.Scheduler.schedule_p:name">
        /// A description of the work item for diagnostics. The default value is an empty string.
        /// </param>
        /// <returns type="PluginUtilities.Utilities.Scheduler._JobNode" locid="PluginUtilities.Utilities.Scheduler.schedule_returnValue">
        /// The Job instance which represents this work item.
        /// </returns>
        /// </signature>

        priority = priority || Priority.normal;
        thisArg = thisArg || null;
        var jobId = ++globalJobId;
        var asyncOpID = Debug.msTraceAsyncOperationStarting("PluginUtilities.Utilities.Scheduler.schedule: " + jobId + profilerMarkArgs(name));
        name = name || "";
        return new JobNode(jobId, work, priority, thisArg, name, asyncOpID);
    }

    function getCurrentPriority() {
        if (pumping) {
            return pumpingPriority;
        } else {
            switch (MSApp.getCurrentPriority()) {
                case MSApp.HIGH: return Priority.high;
                case MSApp.NORMAL: return Priority.normal;
                case MSApp.IDLE: return Priority.idle;
            }
        }
    }

    function makeSchedulePromise(priority) {
        return function (promiseValue, jobName) {
            /// <signature helpKeyword="PluginUtilities.Utilities.Scheduler.schedulePromise">
            /// <summary locid="PluginUtilities.Utilities.Scheduler.schedulePromise">
            /// Schedules a job to complete a returned Promise.
            /// There are four versions of this method for different commonly used priorities: schedulePromiseHigh,
            /// schedulePromiseAboveNormal, schedulePromiseNormal, schedulePromiseBelowNormal,
            /// and schedulePromiseIdle.
            /// Example usage which shows how to
            /// ensure that the last link in a promise chain is run on the scheduler at high priority:
            /// asyncOp().then(Scheduler.schedulePromiseHigh).then(function (valueOfAsyncOp) { });
            /// </summary>
            /// <param name="promiseValue" isOptional="true" type="Object" locid="PluginUtilities.Utilities.Scheduler.schedulePromise_p:promiseValue">
            /// The value with which the returned promise will complete.
            /// </param>
            /// <param name="jobName" isOptional="true" type="String" locid="PluginUtilities.Utilities.Scheduler.schedulePromise_p:jobName">
            /// A string that describes the job for diagnostic purposes.
            /// </param>
            /// <returns type="PluginUtilities.Promise" locid="PluginUtilities.Utilities.Scheduler.schedulePromise_returnValue">
            /// A promise which completes within a job of the desired priority.
            /// </returns>
            /// </signature>
            var job;
            return new PluginUtilities.Promise(
                function (c) {
                    job = schedule(function schedulePromise() {
                        c(promiseValue);
                    }, priority, null, jobName);
                },
                function () {
                    job.cancel();
                }
            );
        };
    }

    PluginUtilities.Namespace.define("PluginUtilities.Utilities.Scheduler", {

        Priority: Priority,

        schedule: schedule,

        createOwnerToken: createOwnerToken,

        execHigh: execHigh,

        requestDrain: requestDrain,

        /// <field type="PluginUtilities.Utilities.Scheduler.Priority" locid="PluginUtilities.Utilities.Scheduler.currentPriority" helpKeyword="PluginUtilities.Utilities.Scheduler.currentPriority">
        /// Gets the current priority at which the caller is executing.
        /// </field>
        currentPriority: {
            get: getCurrentPriority
        },

        // Promise helpers
        //
        schedulePromiseHigh: makeSchedulePromise(Priority.high),
        schedulePromiseAboveNormal: makeSchedulePromise(Priority.aboveNormal),
        schedulePromiseNormal: makeSchedulePromise(Priority.normal),
        schedulePromiseBelowNormal: makeSchedulePromise(Priority.belowNormal),
        schedulePromiseIdle: makeSchedulePromise(Priority.idle),

        retrieveState: retrieveState,

        _JobNode: JobNode,

        _JobInfo: JobInfo,

        _OwnerToken: OwnerToken,

        _dumpList: dumpList,

        _isEmpty: {
            get: isEmpty
        },

        // The properties below are used for testing.
        //

        _usingWwaScheduler: {
            get: function () {
                return usingWwaScheduler;
            },
            set: function (value) {
                usingWwaScheduler = value;
                MSApp = (usingWwaScheduler ? global.MSApp : MSAppStubs);
            }
        },

        _MSApp: {
            get: function () {
                return MSApp;
            },
            set: function (value) {
                MSApp = value;
            }
        },

        _TIME_SLICE: TIME_SLICE

    });

}(this));

(function xhrInit(global, undefined) {
    var Scheduler = PluginUtilities.Utilities.Scheduler;

    function schedule(f, arg, priority) {
        Scheduler.schedule(function () {
            f(arg);
        }, priority, null, "Microsoft.Plugin.Utilities.xhr");
    }

    function noop() {
    }

    Microsoft.Plugin.Utilities.xhr = function (options) {
        var req;
        return new Microsoft.Plugin.Promise(
            function (c, e, p) {
                var priority = Scheduler.currentPriority;
                req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (req._canceled) {
                        req.onreadystatechange = noop;
                        return;
                    }

                    if (req.readyState === 4) {
                        if (req.status >= 200 && req.status < 300) {
                            schedule(c, req, priority);
                        } else {
                            schedule(e, req, priority);
                        }
                        req.onreadystatechange = noop;
                    } else {
                        schedule(p, req, priority);
                    }
                };

                req.open(
                    options.type || "GET",
                    options.url,
                    // Promise based XHR does not support sync.
                    //
                    true,
                    options.user,
                    options.password
                );
                req.responseType = options.responseType || "";

                Object.keys(options.headers || {}).forEach(function (k) {
                    req.setRequestHeader(k, options.headers[k]);
                });

                if (options.customRequestInitializer) {
                    options.customRequestInitializer(req);
                }

                if (options.data === undefined) {
                    req.send();
                } else {
                    req.send(options.data);
                }
            },
            function () {
                req.onreadystatechange = noop;
                req._canceled = true;

                req.abort();
            }
        );
    }
}(this));
// SIG // Begin signature block
// SIG // MIIjnAYJKoZIhvcNAQcCoIIjjTCCI4kCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // YDVGNRE6Dc+P7TDFgvo/L5niJHZFkgrHdqV4FVS7Vbmg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCFXMw
// SIG // ghVvAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAHfa/AukqdKtNAAAAAAAd8wDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIIyAU4/gYJOaFRLhFMfo
// SIG // 6nG8DeCg/FxQc6TW+j/WsIxNMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEApZ9fhJfljP4lUM2EfebRMBLTOzYUayXtuykd
// SIG // DYEM6BWwuTQYNuKeDBH+hhPes0OyE1fjS8amIafy821d
// SIG // KAuMlZr9A714o8F3zaLkcDwKPK8mKk4EOMFwvXjd6vFr
// SIG // JEd3YXS/4Pl+Iv/26ELIhQMQBt2h+wxqBT0+Qft3gtVi
// SIG // vVKHfgWRuo2rQ5b3LJfAZz84PUcxUHf0XdGVhPfoK+rv
// SIG // L36Cfq75LB+tOv4RRbqb8oC+gLeEfDb9ivk5Ob8h7GjX
// SIG // EwcHy1l/H4Y4FAWaKiVXkygtcT66IBELgmzyAn1NqPzx
// SIG // VsGWUqieNzCfcNEY62MVSExt9y2pxVnweJ+hni7KLaGC
// SIG // Ev0wghL5BgorBgEEAYI3AwMBMYIS6TCCEuUGCSqGSIb3
// SIG // DQEHAqCCEtYwghLSAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFYBgsqhkiG9w0BCRABBKCCAUcEggFDMIIBPwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBCAVj8
// SIG // ZFZD28aLHXfRT+m7SUJ6H6rSGfUdbENkFS/PMwIGYRUO
// SIG // tt3pGBIyMDIxMDgxMzE3MDcxOC41N1owBIACAfSggdik
// SIG // gdUwgdIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
// SIG // JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGlt
// SIG // aXRlZDEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RDA4
// SIG // Mi00QkZELUVFQkExJTAjBgNVBAMTHE1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFNlcnZpY2Wggg5NMIIE+TCCA+GgAwIB
// SIG // AgITMwAAAUGvf1KXXPLcRQAAAAABQTANBgkqhkiG9w0B
// SIG // AQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAe
// SIG // Fw0yMDEwMTUxNzI4MjdaFw0yMjAxMTIxNzI4MjdaMIHS
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // JjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkQwODItNEJG
// SIG // RC1FRUJBMSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBTZXJ2aWNlMIIBIjANBgkqhkiG9w0BAQEFAAOC
// SIG // AQ8AMIIBCgKCAQEA8irLqL28dal+PJUmUJOwvYn/sOCE
// SIG // zQzZyj94XbFPtRhDhPjagvvKOv1GgMoOuXvkpM3uM5E6
// SIG // 7vyOCPxqhTAzq7Ak3zkEXXBv7JoM8Xm0x5UcnAkpUiEo
// SIG // 0eycRl6bnYIB3KlZW3uz4Jc2v2FV0KCGkLrvqfKP8V/i
// SIG // 2hVyN854OejWpx8wGUazM4CYUVowcgEDc76OY+Xa4W27
// SIG // DCZJm2f9ol4BjSL+b2L/T8n/LEGknaUxwSQTN1LQCt+u
// SIG // BDCASd6VQR5CLLJVt6MBL0W1NlaWxEAJwlIdyBnS1ihL
// SIG // vRg1jc/KUZe0sRFdD3fhKrjPac3hoy007Fvr6Go0WJ4p
// SIG // r2rJdQIDAQABo4IBGzCCARcwHQYDVR0OBBYEFC0oPyxu
// SIG // LpD9RXBr9c8NO0EFEsbEMB8GA1UdIwQYMBaAFNVjOlyK
// SIG // MZDzQ3t8RhvFM2hahW1VMFYGA1UdHwRPME0wS6BJoEeG
// SIG // RWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3Js
// SIG // L3Byb2R1Y3RzL01pY1RpbVN0YVBDQV8yMDEwLTA3LTAx
// SIG // LmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKG
// SIG // Pmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2Vy
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3J0MAwG
// SIG // A1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // DQYJKoZIhvcNAQELBQADggEBAFJ63yJ92ChqCgpexD48
// SIG // okviGuC4ikNsvmwlCSet1sFpvJEzLJB8cTF4z4qQTz8A
// SIG // sQtcew6mAVmQCYDu9f5ee11xXj1LwHYsZGnSs/OfRul1
// SIG // VKmY51OQpqvK5O/Ct4fs0Iblzo8eyOLJygTk97aXVA4U
// SIG // zq8GblL7LQ5XiwAY446MOALnNXFo/Kq9tvzipwY1YcRn
// SIG // /nlMQ+b92OiLLmHVMi2wAUORiKFvaAfYWjhQd+2qHLMs
// SIG // dpNluwBbWe7FF5ABsDo0HROMWyCgxdLQ3vqr3DMSH3ZW
// SIG // KiirFsvWJmchfZPGRObwqszvSXPFmPBZ9o+er+4UoLV+
// SIG // 50GWnnQky7HVgLkwggZxMIIEWaADAgECAgphCYEqAAAA
// SIG // AAACMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBD
// SIG // ZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0xMDA3
// SIG // MDEyMTM2NTVaFw0yNTA3MDEyMTQ2NTVaMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwMIIBIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAQ8AMIIBCgKCAQEAqR0NvHcRijog7PwTl/X6
// SIG // f2mUa3RUENWlCgCChfvtfGhLLF/Fw+Vhwna3PmYrW/AV
// SIG // UycEMR9BGxqVHc4JE458YTBZsTBED/FgiIRUQwzXTbg4
// SIG // CLNC3ZOs1nMwVyaCo0UN0Or1R4HNvyRgMlhgRvJYR4Yy
// SIG // hB50YWeRX4FUsc+TTJLBxKZd0WETbijGGvmGgLvfYfxG
// SIG // wScdJGcSchohiq9LZIlQYrFd/XcfPfBXday9ikJNQFHR
// SIG // D5wGPmd/9WbAA5ZEfu/QS/1u5ZrKsajyeioKMfDaTgaR
// SIG // togINeh4HLDpmc085y9Euqf03GS9pAHBIAmTeM38vMDJ
// SIG // RF1eFpwBBU8iTQIDAQABo4IB5jCCAeIwEAYJKwYBBAGC
// SIG // NxUBBAMCAQAwHQYDVR0OBBYEFNVjOlyKMZDzQ3t8RhvF
// SIG // M2hahW1VMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBB
// SIG // MAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8G
// SIG // A1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYG
// SIG // A1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0Nl
// SIG // ckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQRO
// SIG // MEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3J0MIGgBgNVHSABAf8EgZUwgZIwgY8G
// SIG // CSsGAQQBgjcuAzCBgTA9BggrBgEFBQcCARYxaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL1BLSS9kb2NzL0NQUy9k
// SIG // ZWZhdWx0Lmh0bTBABggrBgEFBQcCAjA0HjIgHQBMAGUA
// SIG // ZwBhAGwAXwBQAG8AbABpAGMAeQBfAFMAdABhAHQAZQBt
// SIG // AGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEAB+aI
// SIG // UQ3ixuCYP4FxAz2do6Ehb7Prpsz1Mb7PBeKp/vpXbRkw
// SIG // s8LFZslq3/Xn8Hi9x6ieJeP5vO1rVFcIK1GCRBL7uVOM
// SIG // zPRgEop2zEBAQZvcXBf/XPleFzWYJFZLdO9CEMivv3/G
// SIG // f/I3fVo/HPKZeUqRUgCvOA8X9S95gWXZqbVr5MfO9sp6
// SIG // AG9LMEQkIjzP7QOllo9ZKby2/QThcJ8ySif9Va8v/rbl
// SIG // jjO7Yl+a21dA6fHOmWaQjP9qYn/dxUoLkSbiOewZSnFj
// SIG // nXshbcOco6I8+n99lmqQeKZt0uGc+R38ONiU9MalCpaG
// SIG // pL2eGq4EQoO4tYCbIjggtSXlZOz39L9+Y1klD3ouOVd2
// SIG // onGqBooPiRa6YacRy5rYDkeagMXQzafQ732D8OE7cQnf
// SIG // XXSYIghh2rBQHm+98eEA3+cxB6STOvdlR3jo+KhIq/fe
// SIG // cn5ha293qYHLpwmsObvsxsvYgrRyzR30uIUBHoD7G4kq
// SIG // VDmyW9rIDVWZeodzOwjmmC3qjeAzLhIp9cAvVCch98is
// SIG // TtoouLGp25ayp0Kiyc8ZQU3ghvkqmqMRZjDTu3QyS99j
// SIG // e/WZii8bxyGvWbWu3EQ8l1Bx16HSxVXjad5XwdHeMMD9
// SIG // zOZN+w2/XU/pnR4ZOC+8z1gFLu8NoFA12u8JJxzVs341
// SIG // Hgi62jbb01+P3nSISRKhggLXMIICQAIBATCCAQChgdik
// SIG // gdUwgdIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
// SIG // JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGlt
// SIG // aXRlZDEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RDA4
// SIG // Mi00QkZELUVFQkExJTAjBgNVBAMTHE1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMV
// SIG // AKrlvym1CquIoQcrzncLvkD1WpUDoIGDMIGApH4wfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcN
// SIG // AQEFBQACBQDkwN6sMCIYDzIwMjEwODEzMjAwNjA0WhgP
// SIG // MjAyMTA4MTQyMDA2MDRaMHcwPQYKKwYBBAGEWQoEATEv
// SIG // MC0wCgIFAOTA3qwCAQAwCgIBAAICBQUCAf8wBwIBAAIC
// SIG // ETwwCgIFAOTCMCwCAQAwNgYKKwYBBAGEWQoEAjEoMCYw
// SIG // DAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQAC
// SIG // AwGGoDANBgkqhkiG9w0BAQUFAAOBgQBVsXDhHKQczvy7
// SIG // peimO0sSCC1XjcaBqEmk7GyIowtyL5GJzWhIWKlOrz7f
// SIG // ynpJS+r76xMFfFzZ335Mt0Ol8Wk5oUWcldsu8S9WWamj
// SIG // dhMwOo4kVh5W1erJuMbck/EnKZgKF3DH+isq3qY34tG8
// SIG // ZboiG5iqTsitI4RV6So+Y0yfhDGCAw0wggMJAgEBMIGT
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB
// SIG // Qa9/Updc8txFAAAAAAFBMA0GCWCGSAFlAwQCAQUAoIIB
// SIG // SjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJ
// SIG // KoZIhvcNAQkEMSIEIMgErfb4IBCAtIuBCBOzdS2Q1RNd
// SIG // jo7t5fouksqiFkyPMIH6BgsqhkiG9w0BCRACLzGB6jCB
// SIG // 5zCB5DCBvQQgUT8BPIzqc3SecHRPLKBtW0vOOnT+78ha
// SIG // Wo+XcxVerd4wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFt
// SIG // cCBQQ0EgMjAxMAITMwAAAUGvf1KXXPLcRQAAAAABQTAi
// SIG // BCB01ucO7TcOhC0JQsx2Auz+ITWQ6+Oqo7/YfphqcTcW
// SIG // WDANBgkqhkiG9w0BAQsFAASCAQBLt2n3iFmOQhkuHfyn
// SIG // PJdeBPIw500eJBErhpryeP6TmuoOr1NVZTS7NiavfWvx
// SIG // SZ683rozJOR7VOrapG0Q4DN/KYUOA7CRy7FN5XjuBlBr
// SIG // 88c4CDYg/liGeR5kc42QRm5NadyQXscKQ4+0hjL7B3PA
// SIG // eJ21Yohf8d1TMlv07ANtmRR9v5B0VVk48+Xudr6ucJyF
// SIG // /1uBpzj42uD0I0WTGtqdMoN8gxY8NYFG+eqmaJxv3VrD
// SIG // v5VLPWabsoM+LNrhOhXf92wygtu5mfaoVmccmLsKCXtc
// SIG // YzeLZvDwa6XHvl7nquMehaZdiyzAJEClAx38oKXmdODo
// SIG // udMo5sZDIbMxfGGF
// SIG // End signature block
