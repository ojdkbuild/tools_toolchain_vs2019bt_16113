define("Shared/AsyncComputed", ["require", "exports"], function (require, exports) {
    "use strict";
    function AsyncComputed(asyncFunc, hasChanged) {
        var observedResult = ko.observable();
        var dataLoadPromise;
        var asyncComputed = observedResult;
        var reevaluateTrigger = ko.observable().extend({ notify: "always" });
        asyncComputed.reevaluate = function () { return reevaluateTrigger.valueHasMutated(); };
        AsyncComputed["_asyncRunner"] = ko.computed(function () {
            reevaluateTrigger();
            if (dataLoadPromise) {
                dataLoadPromise.cancel();
            }
            dataLoadPromise = Microsoft.Plugin.Promise.as(asyncFunc());
            dataLoadPromise.done(function (result) {
                dataLoadPromise = null;
                observedResult(result);
            }, function () {
                dataLoadPromise = null;
            });
        });
        if (hasChanged) {
            hasChanged.addEventListener(function () { return asyncComputed.reevaluate(); });
        }
        return asyncComputed;
    }
    exports.AsyncComputed = AsyncComputed;
});
define("Shared/AutoComplete/AutoCompleteViewModel", ["require", "exports", "Shared/AutoComplete/AutoCompleteItemViewModel", "template!AutoCompleteView"], function (require, exports, AutoCompleteItemViewModel_1) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var AutoCompleteViewModel = (function () {
        function AutoCompleteViewModel(filterText, callback) {
            this._autoCompleteLists = ko.observableArray([]);
            this._currentFocus = ko.observable(-1);
            this._selectedIndex = ko.observable(-1);
            this._itemSelected = ko.observable(false);
            this._logger = DiagHub.getLogger();
            this._dismissInput = false;
            this._callback = callback;
            if (!filterText) {
                this._dismissInput = true;
            }
            this.filterText = filterText;
        }
        AutoCompleteViewModel.prototype.getAutoCompleteLists = function () {
            var _this = this;
            this.closeAutoCompleteLists();
            if (this._callbackPromise) {
                this._callbackPromise.cancel();
            }
            this._callbackPromise = this._callback(this._filterText());
            this._callbackPromise.then(function (suggestionsList) {
                for (var i = 0; i < suggestionsList.length; i++) {
                    var autoCompleteItem = new AutoCompleteItemViewModel_1.AutoCompleteItemViewModel(suggestionsList[i], i);
                    _this._autoCompleteLists.push(autoCompleteItem);
                    autoCompleteItem.focusIndex.subscribe(function (focusIndex) {
                        if (focusIndex > -1) {
                            _this.updateFocusedItem(false);
                            _this._currentFocus(focusIndex);
                            _this.updateFocusedItem(true);
                        }
                    });
                    autoCompleteItem.selectedIndex.subscribe(function (selectedIndex) {
                        if (selectedIndex > -1) {
                            _this._currentFocus(selectedIndex);
                            _this.setSelectedItem();
                            _this.closeAutoCompleteLists();
                        }
                    });
                }
            }).done(function () {
                _this._callbackPromise = null;
            }, function (error) {
                if (error.name !== "Canceled") {
                    _this._logger.error("Error occurred while calling auto complete API: " + JSON.stringify(error));
                }
            });
        };
        Object.defineProperty(AutoCompleteViewModel.prototype, "dismissInput", {
            get: function () {
                return this._dismissInput;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteViewModel.prototype, "filterText", {
            get: function () {
                return this._filterText;
            },
            set: function (val) {
                var _this = this;
                if (val !== null) {
                    this._filterText = val;
                    this._filterText.subscribe(function (filterText) {
                        if (_this._itemSelected()) {
                            _this._itemSelected(false);
                            return;
                        }
                        _this.getAutoCompleteLists();
                    });
                }
                else {
                    this._filterText = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteViewModel.prototype, "autoCompleteLists", {
            get: function () {
                return this._autoCompleteLists;
            },
            enumerable: true,
            configurable: true
        });
        AutoCompleteViewModel.prototype.closeAutoCompleteLists = function () {
            this._selectedIndex(-1);
            this._currentFocus(-1);
            this._autoCompleteLists.removeAll();
        };
        AutoCompleteViewModel.prototype.onKeyDown = function (viewModel, e) {
            if (e.keyCode === DiagHub.Common.KeyCodes.ArrowDown) {
                this.updateFocusedItem(false);
                this._currentFocus(this._currentFocus() + 1);
                this.updateFocusedItem(true);
                return false;
            }
            else if (e.keyCode === DiagHub.Common.KeyCodes.ArrowUp) {
                this.updateFocusedItem(false);
                this._currentFocus(this._currentFocus() - 1);
                this.updateFocusedItem(true);
                return false;
            }
            else if (e.keyCode === DiagHub.Common.KeyCodes.Enter) {
                this.setSelectedItem();
                this.closeAutoCompleteLists();
                return false;
            }
            else if (e.keyCode === DiagHub.Common.KeyCodes.Escape) {
                this.filterText("");
                return false;
            }
            else if (e.keyCode === DiagHub.Common.KeyCodes.Space && e.ctrlKey && !e.altKey && !e.shiftKey) {
                this.getAutoCompleteLists();
                return false;
            }
            else if (e.keyCode === DiagHub.Common.KeyCodes.Tab) {
                if (this.autoCompleteLists().length > 0) {
                    this.updateFocusedItem(false);
                    this._currentFocus(this._currentFocus() + 1);
                    this.updateFocusedItem(true);
                }
                this.setSelectedItem();
                return false;
            }
            return true;
        };
        AutoCompleteViewModel.prototype.onAfterDomInsert = function (elements, viewModel) {
            var autoCompleteContainer = elements[0].parentNode;
            var autoCompleteList = autoCompleteContainer.querySelector(".autocomplete-list");
            var updateControlHeight = function () {
                var autoCompleteHeight = autoCompleteList.offsetHeight - autoCompleteList.clientHeight;
                var availableHeight = window.innerHeight - autoCompleteContainer.offsetHeight - autoCompleteContainer.offsetTop - autoCompleteHeight;
                autoCompleteList.style.maxHeight = availableHeight - 20 + "px";
            };
            var onAutoCompleteUpdated = viewModel.autoCompleteLists.subscribe(updateControlHeight);
            var updateControlHeightBoundFunction = DiagHub.eventThrottler(updateControlHeight, DiagHub.Constants.WindowResizeThrottle);
            window.addEventListener("resize", updateControlHeightBoundFunction);
            ko.utils.domNodeDisposal.addDisposeCallback(autoCompleteContainer, function () {
                window.removeEventListener("resize", updateControlHeightBoundFunction);
                onAutoCompleteUpdated.dispose();
            });
        };
        AutoCompleteViewModel.prototype.setSelectedItem = function () {
            if (this._currentFocus() > -1) {
                this._itemSelected(true);
                this._selectedIndex(this._currentFocus());
                var text = this.autoCompleteLists()[this._selectedIndex()].autoCompleteItem;
                text = text.replace("<b>", "").replace("</b>", "");
                this._filterText(text);
            }
        };
        AutoCompleteViewModel.prototype.updateFocusedItem = function (focus) {
            var childrenCount = this._autoCompleteLists().length;
            if (childrenCount === 0) {
                return;
            }
            if (focus) {
                if (this._currentFocus() >= childrenCount) {
                    this._currentFocus(0);
                }
                if (this._currentFocus() < 0) {
                    this._currentFocus(childrenCount - 1);
                }
            }
            else if (this._currentFocus() >= childrenCount || this._currentFocus() < 0) {
                return;
            }
            this._autoCompleteLists()[this._currentFocus()].hasFocus(focus);
        };
        return AutoCompleteViewModel;
    }());
    exports.AutoCompleteViewModel = AutoCompleteViewModel;
});
define("Shared/AutoComplete/AutoCompleteItemViewModel", ["require", "exports"], function (require, exports) {
    "use strict";
    var AutoCompleteItemViewModel = (function () {
        function AutoCompleteItemViewModel(autoCompleteItem, index) {
            this._hasFocus = ko.observable(false);
            this._focusIndex = ko.observable(-1);
            this._selectedIndex = ko.observable(-1);
            this._autoCompleteItem = autoCompleteItem;
            this._index = index;
        }
        Object.defineProperty(AutoCompleteItemViewModel.prototype, "autoCompleteItem", {
            get: function () {
                return this._autoCompleteItem;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteItemViewModel.prototype, "autoCompleteItemTooltip", {
            get: function () {
                return this._autoCompleteItem.replace("<b>", "").replace("</b>", "");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteItemViewModel.prototype, "focusIndex", {
            get: function () {
                return this._focusIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteItemViewModel.prototype, "hasFocus", {
            get: function () {
                if (this._hasFocus()) {
                    this.focusIndex(this._index);
                }
                return this._hasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteItemViewModel.prototype, "selectedIndex", {
            get: function () {
                return this._selectedIndex;
            },
            enumerable: true,
            configurable: true
        });
        AutoCompleteItemViewModel.prototype.selectItem = function () {
            this.selectedIndex(this._index);
        };
        return AutoCompleteItemViewModel;
    }());
    exports.AutoCompleteItemViewModel = AutoCompleteItemViewModel;
});
define("Shared/CustomBindings/LocalizedNumberUnitSpan", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["localizedNumberUnitSpan"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueWithFormat = valueAccessor();
            var value = ko.unwrap(valueWithFormat.value);
            var converter = ko.unwrap(valueWithFormat.converter);
            var formatTemplate = ko.unwrap(valueWithFormat.formatTemplate);
            var localizedText = converter.formatNumber(value, formatTemplate, null, true);
            ko.utils.setTextContent(element, localizedText);
        }
    };
    ko.virtualElements.allowedBindings["localizedNumberUnitSpan"] = true;
});
define("Shared/CustomBindings/AriaExpanded", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["ariaExpanded"] = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor());
            if (typeof value === "boolean") {
                element.setAttribute("aria-expanded", value);
                return;
            }
            if (ko.unwrap(value.expandable)) {
                element.setAttribute("aria-expanded", ko.unwrap(value.expanded));
            }
            else {
                element.removeAttribute("aria-expanded");
            }
        }
    };
});
define("Shared/CustomBindings/CircularFocus", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["circularFocus"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var bindingValue = valueAccessor();
            var selector = bindingValue.selector;
            var arrowKeyNext = bindingValue.vertical ?
                Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowDown :
                Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowRight;
            var arrowKeyPrevious = bindingValue.vertical ?
                Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowUp :
                Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowLeft;
            var logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
            element.addEventListener("keydown", function (e) {
                if (e.keyCode !== arrowKeyPrevious && e.keyCode !== arrowKeyNext) {
                    return;
                }
                var elements = element.querySelectorAll(selector);
                if (elements.length === 0) {
                    logger.error("There are no elements to focus on");
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                var isDisabled = function (element) { return element.disabled; };
                var isHidden = function (element) { return element.offsetHeight === 0; };
                var start = e.keyCode === arrowKeyNext ? 0 : elements.length - 1;
                var end = e.keyCode === arrowKeyNext ? elements.length - 1 : 0;
                var increment = e.keyCode === arrowKeyNext ? 1 : -1;
                for (var i = 0; i < elements.length; ++i) {
                    if (elements[i] !== document.activeElement) {
                        continue;
                    }
                    for (var next = 1; next < elements.length; ++next) {
                        var nextIndex = (i + (next * increment) + elements.length) % elements.length;
                        var maybeFocusable = elements[nextIndex];
                        if (!isHidden(maybeFocusable) && !isDisabled(maybeFocusable)) {
                            maybeFocusable.focus();
                            return;
                        }
                    }
                    logger.warning("There was only a single element to focus on");
                    return;
                }
                for (var i = 0; i < elements.length; ++i) {
                    var index = (i * increment) + start;
                    var maybeFocusable = elements[index];
                    if (!isHidden(maybeFocusable) && !isDisabled(maybeFocusable)) {
                        maybeFocusable.focus();
                        return;
                    }
                }
                logger.error("Unable to focus on any element");
            });
        }
    };
});
define("Shared/CustomBindings/DynamicContextMenu", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var _dynamicContextMenu;
    ko.bindingHandlers["dynamicContextMenu"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var factoryFunction = valueAccessor();
            var domElement = element;
            domElement.addEventListener("contextmenu", function (event) {
                var context = ko.contextFor(event.target);
                if (!context && context.$data) {
                    return;
                }
                if (_dynamicContextMenu) {
                    _dynamicContextMenu.dispose();
                    _dynamicContextMenu = null;
                }
                var showMenu = function (menu) {
                    _dynamicContextMenu = menu;
                    if (event.pointerType === "mouse") {
                        _dynamicContextMenu.show(event.clientX, event.clientY);
                    }
                    else {
                        var target = event.target;
                        var rect = target.getBoundingClientRect();
                        _dynamicContextMenu.show(rect.left, rect.top + rect.height);
                    }
                };
                var menuOrPromise = factoryFunction.call(viewModel, context.$data, event);
                if (menuOrPromise) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!Microsoft.Plugin.Promise.is(menuOrPromise)) {
                        showMenu(menuOrPromise);
                    }
                    else {
                        menuOrPromise.then(function (result) {
                            showMenu(result);
                        });
                    }
                }
            });
        }
    };
});
define("Shared/CustomBindings/IeFocus", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var focusBindingHandler = {
        previousElement: HTMLElement = null,
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var onFocus = function () {
                if (focusBindingHandler.previousElement && focusBindingHandler.previousElement !== element) {
                    var e = document.createEvent("Event");
                    e.initEvent("blur", false, false);
                    focusBindingHandler.previousElement.dispatchEvent(e);
                }
                var hasFocusObservable = valueAccessor();
                if (ko.isWriteableObservable(hasFocusObservable) && !hasFocusObservable()) {
                    hasFocusObservable(true);
                }
                focusBindingHandler.previousElement = element;
            };
            var onBlur = function () {
                var hasFocusObservable = valueAccessor();
                if (ko.isWriteableObservable(hasFocusObservable) && !!hasFocusObservable()) {
                    hasFocusObservable(false);
                }
            };
            element.addEventListener("focus", onFocus);
            element.addEventListener("blur", onBlur);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (!ko.unwrap(valueAccessor())) {
                element.blur();
            }
            else {
                element.focus();
            }
        }
    };
    ko.bindingHandlers["focus"] = focusBindingHandler;
});
define("Shared/CustomBindings/LocalizedAriaLabel", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["localizedAriaLabel"] = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var keyWithArgs = valueAccessor();
            if (!Array.isArray(keyWithArgs)) {
                keyWithArgs = [keyWithArgs];
            }
            var unwrappedArgs = keyWithArgs.map(function (value) { return ko.unwrap(value); });
            var localizedText = Microsoft.Plugin.Resources.getString.apply(null, unwrappedArgs);
            element.setAttribute("aria-label", localizedText);
        }
    };
});
define("Shared/CustomBindings/LocalizedNumber", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["localizedNumber"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueWithFormat = valueAccessor();
            var value = ko.unwrap(valueWithFormat.value);
            var localizedText = value.toLocaleString(Microsoft.Plugin.Culture.formatRegion, valueWithFormat.options);
            ko.utils.setTextContent(element, localizedText);
        }
    };
    ko.virtualElements.allowedBindings["localizedNumber"] = true;
});
define("Shared/CustomBindings/LocalizedPlaceholderText", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["localizedPlaceholderText"] = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var keyWithArgs = valueAccessor();
            if (!Array.isArray(keyWithArgs)) {
                keyWithArgs = [keyWithArgs];
            }
            var unwrappedArgs = keyWithArgs.map(function (value) { return ko.unwrap(value); });
            var localizedText = Microsoft.Plugin.Resources.getString.apply(null, unwrappedArgs);
            element.setAttribute("placeholder", localizedText);
        }
    };
});
define("Shared/CustomBindings/LocalizedText", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["localizedText"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var keyWithArgs = valueAccessor();
            if (!Array.isArray(keyWithArgs)) {
                keyWithArgs = [keyWithArgs];
            }
            var unwrappedArgs = keyWithArgs.map(function (value) { return ko.unwrap(value); });
            var localizedText = Microsoft.Plugin.Resources.getString.apply(null, unwrappedArgs);
            ko.utils.setHtml(element, localizedText);
        }
    };
});
define("Shared/CustomBindings/LocalizedTooltip", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["localizedTooltip"] = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var keyWithArgs = valueAccessor();
            if (!Array.isArray(keyWithArgs)) {
                keyWithArgs = [keyWithArgs];
            }
            var unwrappedArgs = keyWithArgs.map(function (value) { return ko.unwrap(value); });
            if (unwrappedArgs.length > 0 && unwrappedArgs[0] !== null) {
                element.setAttribute("data-plugin-vs-tooltip", JSON.stringify({
                    content: Microsoft.Plugin.Resources.getString.apply(null, unwrappedArgs),
                    delay: Microsoft.VisualStudio.DiagnosticsHub.Constants.TooltipTimeoutMs
                }));
            }
        }
    };
});
define("Shared/CustomBindings/OnEnter", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["onEnter"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.addEventListener("keydown", function (e) {
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.Enter !== e.keyCode) {
                    return;
                }
                var eventHandler = valueAccessor();
                var allowPropagation = eventHandler.apply(viewModel, [viewModel, e]);
                if (!allowPropagation) {
                    e.preventDefault();
                }
            });
        }
    };
});
define("Shared/CustomBindings/SvgImage", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["svgImage"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var svgKey = ko.unwrap(valueAccessor());
            if (!svgKey) {
                return;
            }
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            element.appendChild(Microsoft.VisualStudio.DiagnosticsHub.Utilities.getSVGPlaceHolder(svgKey));
            Microsoft.Plugin.Theme.processInjectedSvg(element);
            element.setAttribute("role", "img");
        }
    };
});
define("Shared/CustomBindings/TableRowIndent", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["tableRowIndent"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.style.display = "inline-block";
            element.style.textOverflow = "ellipsis";
            element.setAttribute('aria-hidden', 'true');
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var indent = ko.unwrap(valueAccessor());
            element.style.width = indent + "em";
        }
    };
});
define("Shared/CustomBindings/VerticalSplit", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["verticalSplit"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var config = valueAccessor();
            var leftElement = document.querySelector(config.leftSelector);
            var rightElement = document.querySelector(config.rightSelector);
            leftElement.style.msFlex = "1 1 auto";
            leftElement.style.flex = "1 1 auto";
            rightElement.style.msFlex = "0 0 auto";
            rightElement.style.flex = "0 0 auto";
            element.style.position = "absolute";
            element.style.width = "8px";
            element.style.height = "100%";
            element.style.cursor = "col-resize";
            element.style.marginRight = "-4px";
            var initialX = null;
            var initialWidth = parseInt(rightElement.style.width.slice(0, -2));
            element.style.right = initialWidth + "px";
            element.onmousemove = moveVerticalSplit;
            var mouseUp = function (evt) {
                moveVerticalSplit(evt);
                Microsoft.VisualStudio.DiagnosticsHub.Utilities.releaseCapture(element);
                initialX = null;
            };
            element.onmouseup = mouseUp;
            element.onmousedown = function (evt) {
                if (initialX !== null) {
                    mouseUp(evt);
                    return;
                }
                initialX = evt.clientX;
                initialWidth = parseInt(rightElement.style.width.slice(0, -2));
                Microsoft.VisualStudio.DiagnosticsHub.Utilities.setCapture(element);
            };
            function moveVerticalSplit(evt) {
                if (initialX === null || initialX == evt.clientX) {
                    return;
                }
                var newWidth = initialWidth + initialX - evt.clientX;
                var minWidth = 10;
                newWidth = Math.max(newWidth, minWidth);
                newWidth = Math.min(newWidth, element.parentElement.clientWidth - minWidth);
                rightElement.style.width = newWidth + "px";
                element.style.right = newWidth + "px";
            }
        }
    };
});
define("Shared/DataGrid/ColumnResizer", ["require", "exports"], function (require, exports) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var ColumnResizer = (function () {
        function ColumnResizer(headerColumn, header, tableColumn, table, columnConfig, columnProvider) {
            this._resizedEvent = new DiagHub.AggregatedEvent();
            this._leftOffset = null;
            this._columnWidth = null;
            this._initialX = null;
            this._initialHeaderWidth = null;
            this._minWidth = null;
            this._hidden = false;
            this._headerColumn = headerColumn;
            this._header = header;
            this._tableColumn = tableColumn;
            this._table = table;
            this._minWidth = 40;
            this._columnWidth = columnConfig.width;
            this._id = columnConfig.columnId;
            this._hidden = false;
            this._columnProvider = columnProvider;
            this._resizer = document.createElement("div");
            this._resizer.classList.add("columnResizer");
            this._resizer.style.width = this.width + "px";
            this._resizer.onmousedown = this.onMouseDown.bind(this);
            this._resizer.onmousemove = this.onMouseMove.bind(this);
            this._resizer.onmouseup = this.onMouseUp.bind(this);
            this._resizer.ondblclick = this.autoSize.bind(this);
            this._headerColumn.style.width = this._columnWidth + "px";
            this._tableColumn.style.width = this._columnWidth + "px";
            this._header.parentElement.insertAdjacentElement("afterBegin", this._resizer);
        }
        Object.defineProperty(ColumnResizer.prototype, "width", {
            get: function () {
                return 8;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnResizer.prototype, "columnConfig", {
            get: function () {
                return {
                    columnId: this._id,
                    isHidden: this._hidden,
                    width: this._columnWidth,
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnResizer.prototype, "resizedEvent", {
            get: function () {
                return this._resizedEvent;
            },
            enumerable: true,
            configurable: true
        });
        ColumnResizer.prototype.dispose = function () {
            this._resizedEvent.dispose();
        };
        ColumnResizer.prototype.onColumnVisiblityChanged = function (visible) {
            DiagHub.Debug.Assert.isFalse(this._hidden !== visible, "We should not be getting column visiblity changed for the same state");
            if (this._hidden !== visible) {
                return;
            }
            this._hidden = !visible;
            var delta = this._hidden ? -this._columnWidth : this._columnWidth;
            var headerWidth = parseInt(this._header.style.width.slice(0, -2));
            this._header.style.width = (headerWidth + delta) + "px";
            this._table.style.width = (headerWidth + delta) + "px";
            this._resizer.style.display = this._hidden ? "none" : "";
            if (this._hidden && document.activeElement === this._headerColumn) {
                this._headerColumn.parentElement.focus();
            }
            this._resizedEvent.invokeEvent(this);
        };
        ColumnResizer.prototype.resetLocation = function () {
            this._leftOffset = this._headerColumn.offsetLeft + this._headerColumn.offsetWidth - Math.floor(this.width / 2);
            this._resizer.style.left = this._leftOffset + "px";
        };
        ColumnResizer.prototype.changeWidth = function (delta, isIntermittent) {
            var width = Math.max(this._columnWidth + delta, this._minWidth);
            var clampedDelta = width - this._columnWidth;
            this._header.style.width = (this._initialHeaderWidth + clampedDelta) + "px";
            this._headerColumn.style.width = (this._columnWidth + clampedDelta) + "px";
            this._resizer.style.left = (this._leftOffset + clampedDelta) + "px";
            this._resizedEvent.invokeEvent(this);
            if (!isIntermittent) {
                this._table.style.width = (this._initialHeaderWidth + clampedDelta) + "px";
                this._tableColumn.style.width = (this._columnWidth + clampedDelta) + "px";
                this._columnWidth += clampedDelta;
                this._leftOffset += clampedDelta;
                this._columnProvider.onColumnChanged(this.columnConfig);
            }
        };
        ColumnResizer.prototype.autoSize = function (event) {
            var columnRows = this._table.querySelectorAll("td[data-columnid=\"" + this._id + "\"]");
            if (columnRows.length === 0) {
                return;
            }
            this._initialHeaderWidth = parseInt(this._header.style.width.slice(0, -2));
            var delta = -(this._initialHeaderWidth - this._minWidth);
            this.changeWidth(delta, false);
            for (var iterations = 0; iterations < 10; ++iterations) {
                this._initialHeaderWidth = parseInt(this._header.style.width.slice(0, -2));
                delta = -Number.MAX_VALUE;
                for (var column = 0; column < columnRows.length; ++column) {
                    delta = Math.max(delta, columnRows[column].scrollWidth - columnRows[column].clientWidth);
                }
                if (delta === 0) {
                    break;
                }
                delta += (this._columnWidth - columnRows[0].clientWidth);
                delta += 20;
                this.changeWidth(delta, false);
                columnRows = this._table.querySelectorAll("td[data-columnid=\"" + this._id + "\"]");
            }
            this._initialHeaderWidth = null;
        };
        ColumnResizer.prototype.onMouseDown = function (event) {
            if (this._initialX !== null) {
                this.onMouseUp(event);
                return;
            }
            this._initialX = event.clientX;
            this._initialHeaderWidth = parseInt(this._header.style.width.slice(0, -2));
            DiagHub.Utilities.setCapture(this._resizer);
        };
        ColumnResizer.prototype.onMouseMove = function (event) {
            if (this._initialX === null) {
                return;
            }
            this.changeWidth(event.clientX - this._initialX, true);
        };
        ColumnResizer.prototype.onMouseUp = function (event) {
            if (this._initialX === null) {
                return;
            }
            DiagHub.Utilities.releaseCapture(this._resizer);
            this.changeWidth(event.clientX - this._initialX, false);
            this._initialX = null;
            this._initialHeaderWidth = null;
        };
        return ColumnResizer;
    }());
    exports.ColumnResizer = ColumnResizer;
});
define("Shared/CustomBindings/ArrangeableColumns", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var ArrangeMovementDelta = 10;
    ko.bindingHandlers["arrangeableColumns"] = {
        after: ['foreach'],
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var addEventListeners = function (cell) {
                var hoverElement;
                var dropLocation;
                var cursorOffset;
                var initialX;
                var dropCol;
                var updateDropPosition = function (x, y) {
                    var cells = element.querySelectorAll("th");
                    for (var i = 0; i < cells.length; ++i) {
                        var rect = cells[i].getBoundingClientRect();
                        if (rect.left <= x && x <= rect.right) {
                            dropCol = cells[i];
                            var boundingLeftOffset = Math.round((x - rect.left) / rect.width) * rect.width;
                            dropLocation.style.left = (rect.left + boundingLeftOffset - 4) + "px";
                            return;
                        }
                    }
                };
                var mouseUp = function (event) {
                    cell.onmousemove = null;
                    cell.onmouseup = null;
                    DiagHub.Utilities.releaseCapture(cell);
                    if (hoverElement) {
                        updateDropPosition(event.clientX, event.clientY);
                        document.body.removeChild(hoverElement);
                        document.body.removeChild(dropLocation);
                        hoverElement = null;
                        dropLocation = null;
                        var colIdToMove = cell.getAttribute("data-columnid");
                        var colIdToDropOnto = dropCol.getAttribute("data-columnid");
                        if (colIdToMove === colIdToDropOnto) {
                            return;
                        }
                        var observableCols = valueAccessor();
                        var cols = observableCols();
                        cols = cols.filter(function (value) { return value !== colIdToMove; });
                        var rect = dropCol.getBoundingClientRect();
                        var boundingLeftOffset = Math.round((event.clientX - rect.left) / rect.width) * rect.width;
                        var index = cols.indexOf(dropCol.getAttribute("data-columnid"));
                        if (boundingLeftOffset !== 0) {
                            index++;
                        }
                        cols.splice(index, 0, colIdToMove);
                        observableCols(cols);
                    }
                };
                var mouseMove = function (event) {
                    if (event.which !== DiagHub.Common.MouseCodes.Left) {
                        mouseUp(event);
                        return;
                    }
                    var x = event.clientX;
                    var y = event.clientY;
                    if (!hoverElement && Math.abs(x - initialX) < ArrangeMovementDelta) {
                        return;
                    }
                    else if (!hoverElement) {
                        hoverElement = document.createElement("div");
                        hoverElement.id = "arrangeColumn";
                        var rect = cell.getBoundingClientRect();
                        dropCol = cell;
                        cursorOffset = Math.min(rect.width, rect.height) / 2;
                        hoverElement.style.width = rect.width + "px";
                        hoverElement.style.height = rect.height + "px";
                        hoverElement.style.padding = "4px";
                        hoverElement.style.borderWidth = "1px";
                        hoverElement.innerText = cell.innerText;
                        dropLocation = document.createElement("div");
                        dropLocation.id = "arrangeDropLocation";
                        dropLocation.style.top = (rect.top - 4) + "px";
                        dropLocation.style.height = (Math.round(rect.height) * 2 + 4) + "px";
                        document.body.appendChild(hoverElement);
                        document.body.appendChild(dropLocation);
                    }
                    hoverElement.style.left = (x - cursorOffset) + "px";
                    hoverElement.style.top = (y - cursorOffset) + "px";
                    updateDropPosition(x, y);
                };
                cell.onmousedown = function (event) {
                    if (hoverElement) {
                        mouseUp(event);
                        return;
                    }
                    if (event.which === DiagHub.Common.MouseCodes.Left) {
                        cell.onmousemove = mouseMove;
                        cell.onmouseup = mouseUp;
                        DiagHub.Utilities.setCapture(cell);
                        initialX = event.clientX;
                    }
                };
                cell.onkeydown = function (event) {
                    if (!event.ctrlKey || !event.shiftKey) {
                        return;
                    }
                    var isColumnHidden = function (element) { return element.offsetHeight === 0; };
                    if (event.keyCode === DiagHub.Common.KeyCodes.ArrowLeft) {
                        var moveTo = cell.previousElementSibling;
                        while (moveTo !== null && isColumnHidden(moveTo))
                            ;
                        if (!moveTo) {
                            return;
                        }
                        var observableCols = valueAccessor();
                        var cols = observableCols();
                        var colIdToMove = cell.getAttribute("data-columnid");
                        var moveToId = moveTo.getAttribute("data-columnid");
                        cols = cols.filter(function (columnId) { return columnId !== colIdToMove; });
                        cols.splice(cols.indexOf(moveToId), 0, colIdToMove);
                        observableCols(cols);
                    }
                    else if (event.keyCode === DiagHub.Common.KeyCodes.ArrowRight) {
                        var moveTo = cell.nextElementSibling;
                        while (moveTo !== null && isColumnHidden(moveTo))
                            ;
                        if (!moveTo) {
                            return;
                        }
                        var observableCols = valueAccessor();
                        var cols = observableCols();
                        var colIdToMove = cell.getAttribute("data-columnid");
                        var moveToId = moveTo.getAttribute("data-columnid");
                        cols = cols.filter(function (columnId) { return columnId !== colIdToMove; });
                        cols.splice(cols.indexOf(moveToId) + 1, 0, colIdToMove);
                        observableCols(cols);
                    }
                };
            };
            var headerCells = element.querySelectorAll("th");
            for (var i = 0; i < headerCells.length; i++) {
                addEventListeners(headerCells[i]);
            }
        }
    };
});
define("Shared/DataGrid/DataGridCustomBindings/FocusedRow", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["focusedRow"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
            var multiSelectStart = -1;
            element.addEventListener("keydown", function (event) {
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.Shift === event.keyCode) {
                    var bindingConfig = valueAccessor();
                    multiSelectStart = ko.unwrap(bindingConfig.focused);
                    return;
                }
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowUp !== event.keyCode &&
                    Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowDown !== event.keyCode) {
                    return;
                }
                var bindingConfig = valueAccessor();
                var rows = ko.unwrap(bindingConfig.rows);
                if (rows.length === 0) {
                    return;
                }
                var focusedIndex = ko.unwrap(bindingConfig.focused);
                var selectedIndex = 0;
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowUp === event.keyCode && focusedIndex !== -1) {
                    selectedIndex = Math.max(focusedIndex - 1, 0);
                }
                else if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowDown === event.keyCode && focusedIndex !== -1) {
                    selectedIndex = Math.min(focusedIndex + 1, rows.length - 1);
                }
                if (!event.shiftKey) {
                    bindingConfig.selected([selectedIndex]);
                }
                else {
                    var start = Math.max(Math.min(selectedIndex, multiSelectStart), 0);
                    var end = Math.max(selectedIndex, multiSelectStart);
                    var selection = [];
                    for (var indexToSelect = start; indexToSelect <= end; ++indexToSelect) {
                        selection.push(indexToSelect);
                    }
                    if (multiSelectStart > selectedIndex) {
                        selection.reverse();
                    }
                    bindingConfig.selected(selection);
                }
                event.preventDefault();
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var bindingConfig = valueAccessor();
            var focusedIndex = ko.unwrap(bindingConfig.focused);
            if (focusedIndex === -1) {
                return;
            }
            var rows = ko.unwrap(bindingConfig.rows);
            var scrollTop = element.scrollTop;
            var totalHeight = element.scrollHeight;
            var rowHeight = totalHeight / (rows.length + 1);
            var visibleHeight = element.clientHeight - rowHeight;
            var topPosition = focusedIndex * rowHeight;
            if (topPosition < (scrollTop + rowHeight)) {
                element.scrollTop = Math.max(topPosition - rowHeight, 0);
            }
            else if (topPosition + rowHeight > (scrollTop + (visibleHeight))) {
                element.scrollTop = topPosition + rowHeight - visibleHeight;
            }
        }
    };
});
define("Shared/CustomBindings/MultiClick", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    exports.DoubleClickTimeMs = 500;
    function SetDoubleClickTime(timeMs) {
        exports.DoubleClickTimeMs = timeMs;
    }
    exports.SetDoubleClickTime = SetDoubleClickTime;
    ko.bindingHandlers["multiClick"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var events = valueAccessor();
            var doubleClickTimer = null;
            var clickHandler = function (event) {
                if (doubleClickTimer !== null) {
                    clearTimeout(doubleClickTimer);
                    doubleClickTimer = null;
                    events.dblclick.apply(viewModel, [viewModel, event]);
                }
                else {
                    events.click.apply(viewModel, [viewModel, event]);
                    doubleClickTimer = setTimeout(function () {
                        doubleClickTimer = null;
                    }, exports.DoubleClickTimeMs);
                }
                if (events.stopPropagation) {
                    event.stopPropagation();
                }
                else {
                    event.preventDefault();
                }
            };
            element.addEventListener("click", clickHandler, false);
        }
    };
});
define("Shared/CustomBindings/ReorderHeaderColumns", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["reorderHeaderColumns"] = {
        after: ['foreach'],
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var columnOrder = ko.unwrap(valueAccessor());
            var row = element;
            var columns = element.querySelectorAll("th");
            for (var i = 0; i < columns.length; ++i) {
                if (columns[i].getAttribute("data-columnid") !== columnOrder[i]) {
                    var col = row.querySelector("th[data-columnid='" + columnOrder[i] + "']");
                    var isFocused = col === document.activeElement;
                    row.insertBefore(col, columns[i]);
                    if (isFocused) {
                        col.focus();
                    }
                }
                columns = row.querySelectorAll("th");
            }
        }
    };
});
define("Shared/CustomBindings/RowIndent", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["rowIndent"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.style.display = "inline-block";
            element.style.textOverflow = "ellipsis";
            element.style.width = "calc(100% - 1em)";
            element.setAttribute('aria-hidden', 'true');
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var indent = ko.unwrap(valueAccessor());
            element.style.maxWidth = indent + "em";
        }
    };
});
define("Shared/CustomBindings/Sortable", ["require", "exports", "knockout", "Shared/Interfaces"], function (require, exports, ko, Interfaces_1) {
    "use strict";
    ko.bindingHandlers["sortable"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            if (!value) {
                return;
            }
            var eventHandler = function () {
                var value = valueAccessor();
                var elementColumnId = value.sortColumnId;
                var currentColumnId = value.currentColumn;
                var currentSortDirection = value.currentDirection;
                if (currentColumnId() === elementColumnId) {
                    currentSortDirection(currentSortDirection() === Interfaces_1.SortDirection.Asc ?
                        Interfaces_1.SortDirection.Desc :
                        Interfaces_1.SortDirection.Asc);
                }
                else {
                    var defaultDirection = value.defaultDirection || Interfaces_1.SortDirection.Desc;
                    currentColumnId(elementColumnId);
                    currentSortDirection(defaultDirection);
                }
            };
            element.addEventListener("click", eventHandler);
            element.addEventListener("keydown", function (e) {
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.Enter === e.keyCode) {
                    eventHandler();
                }
            });
            element.setAttribute("aria-sort", "none");
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            if (!value) {
                return;
            }
            var elementColumnId = value.sortColumnId;
            element.setAttribute("aria-sort", "none");
            if (elementColumnId === value.currentColumn()) {
                var sortedAria = value.currentDirection() === Interfaces_1.SortDirection.Asc ?
                    "ascending" : "descending";
                element.setAttribute("aria-sort", sortedAria);
            }
        }
    };
});
define("Shared/DataGrid/DataGridCustomBindings/DataGridRowFocus", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    ko.bindingHandlers["dataGridRowFocus"] = {
        previousElement: HTMLElement = null,
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var onFocus = function () {
                if (ko.bindingHandlers["dataGridRowFocus"].previousElement && ko.bindingHandlers["dataGridRowFocus"].previousElement !== element) {
                    var e = document.createEvent("Event");
                    e.initEvent("blur", false, false);
                    ko.bindingHandlers["dataGridRowFocus"].previousElement.dispatchEvent(e);
                }
                var hasFocusObservable = valueAccessor();
                if (ko.isWriteableObservable(hasFocusObservable) && !hasFocusObservable()) {
                    hasFocusObservable(true);
                }
                ko.bindingHandlers["dataGridRowFocus"].previousElement = element;
            };
            var onBlur = function () {
                var hasFocusObservable = valueAccessor();
                if (ko.isWriteableObservable(hasFocusObservable) && !!hasFocusObservable()) {
                    hasFocusObservable(false);
                }
            };
            element.addEventListener("focus", onFocus);
            element.addEventListener("blur", onBlur);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                element.removeEventListener("focus", onFocus);
                element.removeEventListener("blur", onBlur);
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (!ko.unwrap(valueAccessor())) {
                element.blur();
            }
            else {
                var body = element.parentElement;
                while (body && !body.classList.contains("dataGridBody")) {
                    body = body.parentElement;
                }
                if (body) {
                    var x = body.scrollLeft;
                    element.focus();
                    body.scrollLeft = x;
                }
                else {
                    ko.tasks.schedule(function () {
                        var body = element.parentElement;
                        while (body && !body.classList.contains("dataGridBody")) {
                            body = body.parentElement;
                        }
                        if (body) {
                            var x = body.scrollLeft;
                            element.focus();
                            body.scrollLeft = x;
                        }
                        else {
                            DiagHub.Debug.Assert.fail("Unable to find dataGridBody. Is this element a DataGrid row?");
                            element.focus();
                        }
                    });
                }
            }
        }
    };
});
define("Shared/DataGrid/DataGridCustomBindings/VirtualizedForEach", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    function calculateNeededChanges(newArray, oldArray) {
        var intermediateArray = oldArray.slice(0);
        var arrayChanges = {
            removedElements: [],
            addedElements: [],
            movedElements: []
        };
        for (var i = oldArray.length - 1; i >= 0; --i) {
            if (newArray.indexOf(oldArray[i]) === -1) {
                arrayChanges.removedElements.push({ value: oldArray[i], index: i });
                intermediateArray.splice(i, 1);
            }
        }
        for (var i = 0; i < newArray.length; i++) {
            if (oldArray.indexOf(newArray[i]) === -1) {
                arrayChanges.addedElements.push({ value: newArray[i], index: i });
                intermediateArray.splice(i, 0, newArray[i]);
            }
        }
        for (var i = 0; i < intermediateArray.length; i++) {
            if (intermediateArray[i] === newArray[i]) {
                continue;
            }
            var fromIndex = intermediateArray.indexOf(newArray[i]);
            arrayChanges.movedElements.push({ fromIndex: fromIndex, toIndex: i });
            var movedElement = intermediateArray.splice(fromIndex, 1)[0];
            intermediateArray.splice(i, 0, movedElement);
        }
        return arrayChanges;
    }
    exports.calculateNeededChanges = calculateNeededChanges;
    function measureRowHeight(element, viewModel, dataOrBindingContext) {
        var renderedTemplate = document.createDocumentFragment();
        ko.renderTemplate(viewModel.templateName, dataOrBindingContext, {}, renderedTemplate, "replaceChildren");
        var measuringRow = renderedTemplate.firstChild;
        element.appendChild(measuringRow);
        var dimensions = measuringRow.getBoundingClientRect();
        element.removeChild(measuringRow);
        ko.cleanNode(measuringRow);
        return dimensions.height;
    }
    ko.bindingHandlers["virtualizedForEach"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var hiddenTop = document.createElement("div");
            var hiddenBottom = document.createElement("div");
            hiddenTop.innerHTML = "&nbsp;";
            hiddenTop.style.height = "0px";
            hiddenTop.setAttribute('aria-hidden', 'true');
            hiddenBottom.innerHTML = "&nbsp;";
            hiddenBottom.style.height = "0px";
            hiddenBottom.setAttribute('aria-hidden', 'true');
            element.parentElement.insertAdjacentElement("beforeBegin", hiddenTop);
            element.parentElement.insertAdjacentElement("afterEnd", hiddenBottom);
            ko.utils.domData.set(element, "previousRows", []);
            ko.utils.domData.set(element, "rowHeight", 0);
            ko.utils.domData.set(element, "hiddenTop", hiddenTop);
            ko.utils.domData.set(element, "hiddenBottom", hiddenBottom);
            ko.utils.domData.set(element, "previousOrder", ko.unwrap(valueAccessor().columnOrder).slice(0));
            Microsoft.Plugin.Theme.addEventListener("themechanged", function () {
                ko.utils.domData.set(element, "rowHeight", 0);
            });
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var config = valueAccessor();
            var allRows = ko.unwrap(config.rows);
            var scrollTop = ko.unwrap(config.scrollTop);
            var clientHeight = ko.unwrap(config.clientHeight);
            var columnOrder = ko.unwrap(config.columnOrder);
            var hiddenTop = ko.utils.domData.get(element, "hiddenTop");
            var hiddenBottom = ko.utils.domData.get(element, "hiddenBottom");
            var previousRows = ko.utils.domData.get(element, "previousRows");
            var rowHeight = ko.utils.domData.get(element, "rowHeight");
            var previousOrder = ko.utils.domData.get(element, "previousOrder");
            if (rowHeight === 0) {
                if (allRows.length === 0) {
                    return;
                }
                var rowBindingContext = bindingContext.createChildContext(allRows[0]);
                rowHeight = measureRowHeight(element, allRows[0], rowBindingContext);
                ko.utils.domData.set(element, "rowHeight", rowHeight);
            }
            var rowsToRemoveAtTop = Math.floor(scrollTop / rowHeight);
            var maxVisibleRows = Math.floor(clientHeight / rowHeight) + 2;
            var bufferSize = Math.floor(maxVisibleRows / 2);
            var endSlice = Math.min(allRows.length, rowsToRemoveAtTop + maxVisibleRows + bufferSize);
            rowsToRemoveAtTop = Math.max(rowsToRemoveAtTop - bufferSize, 0);
            hiddenTop.style.height = (rowsToRemoveAtTop * rowHeight) + "px";
            var visibleRows = allRows.slice(rowsToRemoveAtTop, endSlice);
            hiddenBottom.style.height = ((allRows.length - endSlice) * rowHeight) + "px";
            var rowDifferences = calculateNeededChanges(visibleRows, previousRows);
            rowDifferences.removedElements.forEach(function (change) {
                var rowElement = element.children[change.index];
                ko.removeNode(rowElement);
            });
            var columnDifferences = calculateNeededChanges(columnOrder, previousOrder);
            var rows = element.querySelectorAll("tr");
            columnDifferences.movedElements.forEach(function (change) {
                for (var i = 0; i < rows.length; ++i) {
                    var row = rows[i];
                    var columns = row.querySelectorAll("td");
                    if (columns.length !== columnOrder.length) {
                        continue;
                    }
                    row.insertBefore(columns[change.fromIndex], columns[change.toIndex]);
                }
            });
            rowDifferences.addedElements.forEach(function (change) {
                var renderedRow = document.createDocumentFragment();
                var rowBindingContext = bindingContext.createChildContext(change.value);
                ko.renderTemplate(change.value.templateName, rowBindingContext, {}, renderedRow, "replaceChildren");
                var rowElement = renderedRow.querySelector("tr");
                var columns = rowElement.querySelectorAll("td");
                for (var i = 0; i < columns.length && columns.length === columnOrder.length; ++i) {
                    if (columns[i].getAttribute("data-columnid") !== columnOrder[i]) {
                        rowElement.insertBefore(rowElement.querySelector("td[data-columnid='" + columnOrder[i] + "']"), columns[i]);
                    }
                    columns = rowElement.querySelectorAll("td");
                }
                element.insertBefore(renderedRow, element.children[change.index] || null);
            });
            rowDifferences.movedElements.forEach(function (change) {
                element.insertBefore(element.children[change.fromIndex], element.children[change.toIndex]);
            });
            ko.utils.domData.set(element, "previousRows", visibleRows);
            ko.utils.domData.set(element, "previousOrder", columnOrder.slice());
        }
    };
});
define("Shared/CustomBindings/VisibilityContextMenu", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["visibilityContextMenu"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            if (value.columns.length == 0) {
                return;
            }
            var hiddenColumnArray = value.hiddenColumns;
            var contextConfig = value.columns.map(function (binding) {
                var isChecked = function () {
                    return hiddenColumnArray.indexOf(binding.id) === -1;
                };
                var callback = function () {
                    if (isChecked()) {
                        hiddenColumnArray.push(binding.id);
                    }
                    else {
                        hiddenColumnArray.remove(binding.id);
                    }
                };
                return {
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.checkbox,
                    label: binding.text,
                    callback: callback,
                    checked: isChecked
                };
            });
            var contextMenu = Microsoft.Plugin.ContextMenu.create(contextConfig);
            contextMenu.attach(element);
            var styleSheet = document.createElement("style");
            document.body.appendChild(styleSheet);
            ko.utils.domData.set(element, "visibilitySheet", styleSheet);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () { return document.body.removeChild(styleSheet); });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            if (value.columns.length == 0) {
                return;
            }
            var style = ko.utils.domData.get(element, "visibilitySheet");
            var styleSheet = style.sheet;
            var hiddenColumnArray = ko.unwrap(valueAccessor().hiddenColumns);
            for (var i = 0; i < styleSheet.cssRules.length; ++i) {
                styleSheet.deleteRule(0);
            }
            if (hiddenColumnArray.length === 0) {
                return;
            }
            var selector = hiddenColumnArray.map(function (id) { return "td[data-columnid='" + id + "'],th[data-columnid='" + id + "']"; });
            var rule = selector.join(",") + "{ display: none; }";
            styleSheet.insertRule(rule, 0);
        }
    };
});
define("Shared/DataGrid/DataGridHeaderViewModel", ["require", "exports", "Shared/Interfaces", "Shared/DataGrid/ColumnResizer"], function (require, exports, Interfaces_2, ColumnResizer_1) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var KeyCodes = Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes;
    var DataGridHeaderViewModel = (function () {
        function DataGridHeaderViewModel(columns, columnSettingsProvider, initialSortColumnId) {
            var _this = this;
            this._hiddenColumns = ko.observableArray([]);
            this._resizers = {};
            this._syncScrollBoundFunction = this.syncScroll.bind(this);
            this._sortDirection = ko.observable(Interfaces_2.SortDirection.Desc);
            this._columnOrder = ko.observableArray([]);
            this._isResizing = false;
            this._delta = 0;
            this._sortInfo = ko.pureComputed(function () {
                return {
                    columnId: _this._sortColumnId(),
                    direction: _this._sortDirection()
                };
            });
            this._columns = columns;
            this._templateName = "";
            this._columnSettingsProvider = columnSettingsProvider;
            this._sortColumnId = ko.observable(initialSortColumnId);
            this._columnOrder(columns.map(function (column) { return column.id; }));
        }
        Object.defineProperty(DataGridHeaderViewModel.prototype, "visibilityContextMenuBinding", {
            get: function () {
                return {
                    hiddenColumns: this._hiddenColumns,
                    columns: this._columns
                        .filter(function (column) { return column.hideable; })
                        .map(function (column) { return {
                        id: column.id,
                        text: column.text
                    }; })
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridHeaderViewModel.prototype, "columns", {
            get: function () {
                return this._columns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridHeaderViewModel.prototype, "hiddenColumns", {
            get: function () {
                return this._hiddenColumns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridHeaderViewModel.prototype, "columnOrder", {
            get: function () {
                return this._columnOrder;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridHeaderViewModel.prototype, "sortInfo", {
            get: function () {
                return this._sortInfo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridHeaderViewModel.prototype, "sortColumnId", {
            get: function () {
                return this._sortColumnId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridHeaderViewModel.prototype, "sortDirection", {
            get: function () {
                return this._sortDirection;
            },
            enumerable: true,
            configurable: true
        });
        DataGridHeaderViewModel.prototype.onAfterDomInsert = function (headerContainer, bodyContainer) {
            var _this = this;
            this._headerContainer = headerContainer;
            this._bodyContainer = bodyContainer;
            this._header = this._headerContainer.querySelector("table");
            this._body = this._bodyContainer.querySelector("table");
            var headerRow = this._headerContainer.querySelector("tr");
            headerRow.tabIndex = 0;
            headerRow.onkeydown = this.onKeyDownHeader.bind(this, headerRow);
            headerRow.onkeyup = this.onKeyUpHeader.bind(this, headerRow);
            var tableWidth = 0;
            this._resizers = {};
            var columnsToHide = [];
            return this._columnSettingsProvider.getColumnSettings()
                .done(function (columnSettings) {
                DiagHub.Debug.Assert.isTrue(_this._columns.length === columnSettings.length, "Header config is invalid");
                columnSettings.forEach(function (column) {
                    var headerColumn = _this._header.querySelector("th[data-columnid='" + column.columnId + "']");
                    headerColumn.tabIndex = -1;
                    var tableColumn = _this._body.querySelector("th[data-columnid='" + column.columnId + "']");
                    var resizer = new ColumnResizer_1.ColumnResizer(headerColumn, _this._header, tableColumn, _this._body, column, _this._columnSettingsProvider);
                    _this._resizers[column.columnId] = resizer;
                    tableWidth += column.width;
                    if (column.isHidden) {
                        columnsToHide.push(column.columnId);
                    }
                    resizer.resizedEvent.addEventListener(function () { return _this.adjustResizerLocation(); });
                });
                _this._header.style.width = tableWidth + "px";
                _this._body.style.width = tableWidth + "px";
                _this.adjustResizerLocation();
                window.addEventListener("resize", _this._syncScrollBoundFunction);
                _this._bodyContainer.addEventListener("scroll", _this._syncScrollBoundFunction);
                var headerOnScroll = function () {
                    _this._bodyContainer.scrollLeft = _this._headerContainer.scrollLeft;
                };
                _this._headerContainer.addEventListener("scroll", headerOnScroll);
                var subscription = _this._hiddenColumns.subscribe(_this.onHiddenColumnsChanged.bind(_this), null, "arrayChange");
                ko.utils.domNodeDisposal.addDisposeCallback(_this._bodyContainer, function () {
                    window.removeEventListener("resize", _this._syncScrollBoundFunction);
                    _this._bodyContainer.removeEventListener("scroll", _this._syncScrollBoundFunction);
                    _this._headerContainer.removeEventListener("scroll", headerOnScroll);
                    subscription.dispose();
                    _this._hiddenColumns.removeAll();
                    for (var id in _this._resizers) {
                        _this._resizers[id].dispose();
                    }
                });
                _this._columnOrder.subscribe(function () { return _this.adjustResizerLocation(); });
                _this._hiddenColumns(columnsToHide);
            });
        };
        DataGridHeaderViewModel.prototype.syncScroll = function () {
            var width = this._bodyContainer.clientWidth;
            var scroll = this._bodyContainer.scrollLeft;
            this._headerContainer.style.width = width + "px";
            this._headerContainer.scrollLeft = scroll;
        };
        DataGridHeaderViewModel.prototype.onHiddenColumnsChanged = function (changes) {
            var _this = this;
            changes.forEach(function (change) {
                if (change.status === "added") {
                    var resizer = _this._resizers[change.value];
                    resizer.onColumnVisiblityChanged(false);
                    _this._columnSettingsProvider.onColumnChanged(resizer.columnConfig);
                }
                else if (change.status === "deleted") {
                    var resizer = _this._resizers[change.value];
                    resizer.onColumnVisiblityChanged(true);
                    _this._columnSettingsProvider.onColumnChanged(resizer.columnConfig);
                }
            });
        };
        DataGridHeaderViewModel.prototype.onKeyDownHeader = function (header, event) {
            if (event.ctrlKey && !event.shiftKey && event.keyCode === KeyCodes.Ctrl) {
                this._isResizing = true;
                return;
            }
            if (event.keyCode !== KeyCodes.ArrowLeft && event.keyCode !== KeyCodes.ArrowRight) {
                return;
            }
            else if (event.shiftKey) {
                return;
            }
            else if (document.activeElement !== header && !header.contains(document.activeElement)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (this._isResizing) {
                if (document.activeElement !== header) {
                    this._delta += event.keyCode === KeyCodes.ArrowRight ? 4 : -4;
                    this.resizeActiveColumnHeader(true);
                }
                return;
            }
            var isColumnHidden = function (element) { return element.offsetHeight === 0; };
            var nextElement;
            if (event.keyCode === KeyCodes.ArrowRight) {
                nextElement = document.activeElement === header || document.activeElement.nextElementSibling === null ?
                    header.firstElementChild :
                    document.activeElement.nextElementSibling;
                for (var i = 0; isColumnHidden(nextElement) && i < this._columns.length; ++i) {
                    nextElement = nextElement.nextElementSibling !== null ?
                        nextElement.nextElementSibling :
                        header.firstElementChild;
                }
            }
            else {
                nextElement = document.activeElement === header || document.activeElement.previousElementSibling === null ?
                    header.lastElementChild :
                    document.activeElement.previousElementSibling;
                for (var i = 0; isColumnHidden(nextElement) && i < this._columns.length; ++i) {
                    nextElement = nextElement.previousElementSibling !== null ?
                        nextElement.previousElementSibling :
                        header.lastElementChild;
                }
            }
            nextElement.focus();
        };
        DataGridHeaderViewModel.prototype.onKeyUpHeader = function (header, event) {
            if (!this._isResizing) {
                return;
            }
            this._isResizing = event.ctrlKey;
            event.preventDefault();
            event.stopPropagation();
            this.resizeActiveColumnHeader(false);
            this._delta = 0;
        };
        DataGridHeaderViewModel.prototype.resizeActiveColumnHeader = function (isIntermittent) {
            var colId = document.activeElement.getAttribute("data-columnid");
            if (!colId) {
                return;
            }
            this._resizers[colId].changeWidth(this._delta, isIntermittent);
        };
        DataGridHeaderViewModel.prototype.adjustResizerLocation = function () {
            var _this = this;
            ko.tasks.runEarly();
            ko.tasks.schedule(function () {
                for (var id in _this._resizers) {
                    _this._resizers[id].resetLocation();
                }
            });
        };
        return DataGridHeaderViewModel;
    }());
    exports.DataGridHeaderViewModel = DataGridHeaderViewModel;
});
define("Shared/DataGrid/DataGridUtils", ["require", "exports", "Shared/SortFunctions"], function (require, exports, SortFunctions_1) {
    "use strict";
    var DataGridUtils = (function () {
        function DataGridUtils() {
        }
        DataGridUtils.selectRow = function (dataGrid, row) {
            var rowIndex = dataGrid.rows().indexOf(row);
            dataGrid.selectedRows([rowIndex]);
        };
        DataGridUtils.formatDataGridSelectedToText = function (dataGrid, showDiscontiguousBreaks) {
            if (showDiscontiguousBreaks === void 0) { showDiscontiguousBreaks = true; }
            var selectedIndexes = dataGrid.selectedRows().sort(SortFunctions_1.SortFunctions.numberComparator);
            var isColumnHidden = {};
            dataGrid.header.hiddenColumns().forEach(function (columnId) { return isColumnHidden[columnId] = true; });
            var formattedSelection = "";
            var renderedDataGridCopy = document.createDocumentFragment();
            ko.renderTemplate("CopyDataGridView", dataGrid, {}, renderedDataGridCopy, "replaceChildren");
            var columnHeaders = {};
            dataGrid.header.columns.forEach(function (columnHeader) { return columnHeaders[columnHeader.id] = columnHeader.text; });
            var visibleOrderedColumns = dataGrid.header.columnOrder().filter(function (column) { return !isColumnHidden[column]; });
            var delimiter = "";
            for (var columnIndex = 0; columnIndex < visibleOrderedColumns.length; ++columnIndex) {
                var columnId = visibleOrderedColumns[columnIndex];
                formattedSelection += delimiter;
                formattedSelection += columnHeaders[columnId];
                delimiter = "\t";
            }
            var previousIndex = -1;
            var rows = renderedDataGridCopy.querySelectorAll("tbody > tr");
            for (var rowIndex = 0; rowIndex < rows.length; ++rowIndex) {
                var row = rows[rowIndex];
                formattedSelection += DataGridUtils.NewLine;
                var index = dataGrid.selectedRows()[rowIndex];
                if (showDiscontiguousBreaks && previousIndex !== -1 && previousIndex + 1 !== index) {
                    formattedSelection += "[...]" + DataGridUtils.NewLine;
                }
                var cells = row.querySelectorAll("td");
                var cellMapping = {};
                for (var cellIndex = 0; cellIndex < cells.length; ++cellIndex) {
                    var cell = cells[cellIndex];
                    var columnId = cell.getAttribute("data-columnid");
                    if (isColumnHidden[columnId]) {
                        continue;
                    }
                    cellMapping[columnId] = cell.innerText.replace(/^\s+|\s+$/g, '');
                }
                var cellDelimiter = "";
                for (var columnIndex = 0; columnIndex < visibleOrderedColumns.length; ++columnIndex) {
                    var columnId = visibleOrderedColumns[columnIndex];
                    formattedSelection += cellDelimiter;
                    formattedSelection += cellMapping[columnId];
                    cellDelimiter = "\t";
                }
                previousIndex = index;
            }
            return formattedSelection;
        };
        DataGridUtils.NewLine = "\r\n";
        return DataGridUtils;
    }());
    exports.DataGridUtils = DataGridUtils;
});
define("Shared/DataGrid/DataGridViewModel", ["require", "exports", "Shared/Interfaces", "template!DataGridView", "template!CopyDataGridView", "Shared/CustomBindings/ArrangeableColumns", "Shared/CustomBindings/MultiClick", "Shared/CustomBindings/ReorderHeaderColumns", "Shared/CustomBindings/RowIndent", "Shared/CustomBindings/Sortable", "Shared/CustomBindings/VisibilityContextMenu", "Shared/DataGrid/DataGridCustomBindings/FocusedRow", "Shared/DataGrid/DataGridCustomBindings/DataGridRowFocus", "Shared/DataGrid/DataGridCustomBindings/VirtualizedForEach"], function (require, exports, Interfaces_3) {
    "use strict";
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    var KeyCodes = DiagnosticsHub.Common.KeyCodes;
    var MouseCodes = DiagnosticsHub.Common.MouseCodes;
    var ErrorCodes = DiagnosticsHub.ErrorCodes;
    var DataGridViewModel = (function () {
        function DataGridViewModel(dao, header, ariaLabelToken) {
            var _this = this;
            this._rows = ko.observableArray([]);
            this._selectedRows = ko.observableArray([]);
            this._focusedRowIndex = ko.pureComputed(function () { return _this.computedFocusedRowIndex(); });
            this._focusedRow = ko.pureComputed(function () { return _this.computeFocusedRow(); });
            this._scrollTop = ko.observable(0);
            this._clientHeight = ko.observable(0);
            this._logger = DiagnosticsHub.getLogger();
            this._automation = DiagnosticsHub.getAutomationManager(this._logger);
            this._dataLoadStatus = ko.observable(Interfaces_3.DataLoadEvent.DataLoadCompleted);
            this._dao = dao;
            this._header = header;
            this._ariaLabelToken = ariaLabelToken;
            this._header.sortInfo.subscribe(this.onSortChanged.bind(this));
            this._selectedRows.subscribe(this.onSelectionChanged.bind(this), null, "arrayChange");
        }
        Object.defineProperty(DataGridViewModel.prototype, "dataLoadPromise", {
            get: function () {
                return !this._dataLoadPromise ?
                    Microsoft.Plugin.Promise.as(void (0)) : this._dataLoadPromise;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "rows", {
            get: function () {
                return this._rows;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "selectedRows", {
            get: function () {
                return this._selectedRows;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "header", {
            get: function () {
                return this._header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "ariaLabelToken", {
            get: function () {
                return this._ariaLabelToken;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "scrollTop", {
            get: function () {
                return this._scrollTop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "clientHeight", {
            get: function () {
                return this._clientHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "dataLoadStatus", {
            get: function () {
                return this._dataLoadStatus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "focusedRowIndex", {
            get: function () {
                return this._focusedRowIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridViewModel.prototype, "focusedRow", {
            get: function () {
                return this._focusedRow;
            },
            enumerable: true,
            configurable: true
        });
        DataGridViewModel.prototype.onAfterDomInsert = function (elements, viewModel) {
            var element = elements[0];
            var header = element.querySelector(".dataGridHeader");
            var body = element.querySelector(".dataGridBody");
            viewModel._header.onAfterDomInsert(header, body);
            var updateCachedSizes = function () {
                viewModel._scrollTop(body.scrollTop);
                viewModel._clientHeight(body.clientHeight);
            };
            updateCachedSizes();
            var onResizeBoundFunction = DiagnosticsHub.eventThrottler(updateCachedSizes, DiagnosticsHub.Constants.WindowResizeThrottle);
            body.addEventListener("scroll", updateCachedSizes);
            window.addEventListener("resize", onResizeBoundFunction);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                body.removeEventListener("scroll", updateCachedSizes);
                window.removeEventListener("resize", onResizeBoundFunction);
            });
        };
        DataGridViewModel.prototype.onResultChanged = function (resultId) {
            var _this = this;
            this.loadDataOperation(function () { return _this._dao.getRows(resultId, _this._header.sortInfo()); });
        };
        DataGridViewModel.prototype.onSortChanged = function (sortInfo) {
            var _this = this;
            this.loadDataOperation(function () { return _this._dao.sort(_this._rows(), sortInfo); });
        };
        DataGridViewModel.prototype.search = function (query, isCaseSensitive, isRegex, isForward) {
            var _this = this;
            if (this._dataLoadPromise) {
                this._logger.error("Trying to search while loading data, this should not happen");
                return Microsoft.Plugin.Promise.as(false);
            }
            if (!query) {
                return Microsoft.Plugin.Promise.as(false);
            }
            var currentNode = null;
            var processSearchResult = function (result) {
                if (_this._selectedRows().length === 0) {
                    return _this._automation.getAlertPromise(DiagnosticsHub.AutomationConstants.SearchNoResultsAlertKey, Microsoft.Plugin.Resources.getString("Message_SearchNoMatches"))
                        .then(function () { return false; });
                }
                return _this._automation.getConfirmationPromise(DiagnosticsHub.AutomationConstants.SearchNoResultsConfirmationKey, Microsoft.Plugin.Resources.getString("Message_SearchStartFromTop"))
                    .then(function (startFromTop) {
                    if (!startFromTop) {
                        return Microsoft.Plugin.Promise.as(false);
                    }
                    _this._selectedRows([]);
                    return _this._dao.search(query, isCaseSensitive, isRegex, isForward, null, _this._header.sortInfo())
                        .then(processSearchResult);
                });
            };
            this._dataLoadPromise = this._dao.search(query, isCaseSensitive, isRegex, isForward, this.focusedRow(), this._header.sortInfo())
                .then(processSearchResult);
            this._dataLoadPromise.done(function () { return _this._dataLoadPromise = null; }, function (error) {
                _this._dataLoadPromise = null;
                _this._logger.error("Data grid search failed");
                if (parseInt(error.name, 16) === ErrorCodes.VSHUB_E_INVALID_REGEX) {
                    window.alert(Microsoft.Plugin.Resources.getString("ErrMsg_InvalidRegularExpression"));
                }
            });
            return this._dataLoadPromise;
        };
        DataGridViewModel.prototype.onClick = function (viewModel, event) {
            var _this = this;
            if (event.which !== MouseCodes.Left) {
                return;
            }
            var context = ko.contextFor(event.target);
            if (!context || context.$data === this) {
                return;
            }
            var row = context.$data;
            var rowIndex = this._rows().indexOf(row);
            if (event.ctrlKey) {
                var selectedIndex = this._selectedRows().indexOf(rowIndex);
                if (selectedIndex === -1) {
                    this._selectedRows.push(rowIndex);
                }
                else {
                    this._selectedRows.splice(selectedIndex, 1);
                }
            }
            else if (event.shiftKey) {
                var start = Math.max(Math.min(this.focusedRowIndex(), rowIndex), 0);
                var end = Math.max(this.focusedRowIndex(), rowIndex);
                var initialSelection = this._selectedRows();
                var selectionToAdd = [];
                for (var indexToSelect = start; indexToSelect <= end; ++indexToSelect) {
                    if (initialSelection.indexOf(indexToSelect) === -1) {
                        selectionToAdd.push(indexToSelect);
                    }
                }
                if (this.focusedRowIndex() > rowIndex) {
                    selectionToAdd.reverse();
                }
                selectionToAdd.forEach(function (selection) { return _this._selectedRows.push(selection); });
            }
            else {
                this._selectedRows([rowIndex]);
            }
        };
        DataGridViewModel.prototype.onDblClick = function (viewModel, event) {
            if (event.which !== MouseCodes.Left) {
                return;
            }
            var context = ko.contextFor(event.target);
            if (context && context.$data !== this && this._selectedRows().length > 0) {
                if (this.focusedRow() === context.$data) {
                    this.focusedRow().invoke();
                }
                else {
                    this.onClick(viewModel, event);
                }
            }
        };
        DataGridViewModel.prototype.onKeyDown = function (viewModel, event) {
            var focusedRow = this.focusedRow();
            if (!focusedRow) {
                return true;
            }
            if (KeyCodes.Enter === event.keyCode) {
                focusedRow.invoke();
                return false;
            }
            if (KeyCodes.Space !== event.keyCode && KeyCodes.ArrowRight !== event.keyCode && KeyCodes.ArrowLeft !== event.keyCode) {
                return true;
            }
            return false;
        };
        DataGridViewModel.prototype.onContextMenu = function (viewModel, event) {
            if (event.which !== MouseCodes.Right) {
                return;
            }
            var context = ko.contextFor(event.target);
            if (!context || context.$data === this) {
                return;
            }
            var row = context.$data;
            var rowIndex = this._rows().indexOf(row);
            if (this._selectedRows().indexOf(rowIndex) !== -1) {
                return;
            }
            this._selectedRows([rowIndex]);
        };
        DataGridViewModel.prototype.loadCountOperation = function (operation) {
            var _this = this;
            if (this._dataLoadPromise) {
                this._dataLoadPromise.cancel();
            }
            ko.tasks.runEarly();
            this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadStart);
            this._dataLoadPromise = operation().then(function (count) { return _this._count(count); });
            this._dataLoadPromise.done(function () {
                _this._dataLoadPromise = null;
                _this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadCompleted);
            }, function (error) {
                if (error.name === "Canceled") {
                    _this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadCanceled);
                }
                else {
                    _this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadFailed);
                }
                _this._dataLoadPromise = null;
            });
        };
        DataGridViewModel.prototype.loadDataOperation = function (operation) {
            var _this = this;
            if (this._dataLoadPromise) {
                this._dataLoadPromise.cancel();
            }
            this._selectedRows([]);
            ko.tasks.runEarly();
            this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadStart);
            this._dataLoadPromise = operation().then(function (roots) { return _this._rows(roots); });
            this._dataLoadPromise.done(function () {
                _this._dataLoadPromise = null;
                _this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadCompleted);
            }, function (error) {
                if (error.name === "Canceled") {
                    _this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadCanceled);
                }
                else {
                    _this._dataLoadStatus(Interfaces_3.DataLoadEvent.DataLoadFailed);
                }
                _this._dataLoadPromise = null;
            });
        };
        DataGridViewModel.prototype.computedFocusedRowIndex = function () {
            var selectedRows = this._selectedRows();
            return selectedRows.length > 0 ? selectedRows[selectedRows.length - 1] : -1;
        };
        DataGridViewModel.prototype.computeFocusedRow = function () {
            var focusedIndex = this.computedFocusedRowIndex();
            return focusedIndex !== -1 ? this._rows()[focusedIndex] : null;
        };
        DataGridViewModel.prototype.onSelectionChanged = function (changes) {
            var _this = this;
            changes.forEach(function (change) {
                if (typeof change.moved !== "undefined") {
                    return;
                }
                if (change.status === "added") {
                    _this._rows()[change.value].selected(true);
                }
                else if (change.status === "deleted") {
                    _this._rows()[change.value].selected(false);
                }
            });
        };
        return DataGridViewModel;
    }());
    exports.DataGridViewModel = DataGridViewModel;
});
define("Shared/Grid/TreeGridHeaderViewModel", ["require", "exports", "Shared/Interfaces", "Shared/Grid/ColumnResizer"], function (require, exports, Interfaces_4, ColumnResizer_2) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var KeyCodes = Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes;
    var TreeGridHeaderViewModel = (function () {
        function TreeGridHeaderViewModel(columns, columnSettingsProvider, initialSortColumnId) {
            var _this = this;
            this._hiddenColumns = ko.observableArray([]);
            this._resizers = {};
            this._syncScrollBoundFunction = this.syncScroll.bind(this);
            this._sortDirection = ko.observable(Interfaces_4.SortDirection.Desc);
            this._columnOrder = ko.observableArray([]);
            this._isResizing = false;
            this._delta = 0;
            this._sortInfo = ko.pureComputed(function () {
                return {
                    columnId: _this._sortColumnId(),
                    direction: _this._sortDirection()
                };
            });
            this._columns = columns;
            this._templateName = "";
            this._columnSettingsProvider = columnSettingsProvider;
            this._sortColumnId = ko.observable(initialSortColumnId);
            this._columnOrder(columns.map(function (column) { return column.id; }));
            var defaultSortCol = columns.filter(function (column) { return column.id === initialSortColumnId; })[0];
            if (defaultSortCol.sortable) {
                this._sortDirection(defaultSortCol.sortable);
            }
        }
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "visibilityContextMenuBinding", {
            get: function () {
                return {
                    hiddenColumns: this._hiddenColumns,
                    columns: this._columns
                        .filter(function (column) { return column.hideable; })
                        .map(function (column) { return {
                        id: column.id,
                        text: column.text
                    }; })
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "columns", {
            get: function () {
                return this._columns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "hiddenColumns", {
            get: function () {
                return this._hiddenColumns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "columnOrder", {
            get: function () {
                return this._columnOrder;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "sortInfo", {
            get: function () {
                return this._sortInfo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "sortColumnId", {
            get: function () {
                return this._sortColumnId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridHeaderViewModel.prototype, "sortDirection", {
            get: function () {
                return this._sortDirection;
            },
            enumerable: true,
            configurable: true
        });
        TreeGridHeaderViewModel.prototype.onAfterDomInsert = function (headerContainer, bodyContainer) {
            var _this = this;
            this._headerContainer = headerContainer;
            this._bodyContainer = bodyContainer;
            this._header = this._headerContainer.querySelector("table");
            this._body = this._bodyContainer.querySelector("table");
            var headerRow = this._headerContainer.querySelector("tr");
            headerRow.tabIndex = 0;
            headerRow.onkeydown = this.onKeyDownHeader.bind(this, headerRow);
            headerRow.onkeyup = this.onKeyUpHeader.bind(this, headerRow);
            var tableWidth = 0;
            this._resizers = {};
            var columnsToHide = [];
            return this._columnSettingsProvider.getColumnSettings()
                .done(function (columnSettings) {
                DiagHub.Debug.Assert.isTrue(_this._columns.length === columnSettings.length, "Header config is invalid");
                columnSettings.forEach(function (column) {
                    var headerColumn = _this._header.querySelector("th[data-columnid='" + column.columnId + "']");
                    headerColumn.tabIndex = -1;
                    var tableColumn = _this._body.querySelector("th[data-columnid='" + column.columnId + "']");
                    var resizer = new ColumnResizer_2.ColumnResizer(headerColumn, _this._header, tableColumn, _this._body, column, _this._columnSettingsProvider);
                    _this._resizers[column.columnId] = resizer;
                    tableWidth += column.width;
                    if (column.isHidden) {
                        columnsToHide.push(column.columnId);
                    }
                    resizer.resizedEvent.addEventListener(function () { return _this.adjustResizerLocation(); });
                });
                _this._header.style.width = tableWidth + "px";
                _this._body.style.width = tableWidth + "px";
                _this.adjustResizerLocation();
                window.addEventListener("resize", _this._syncScrollBoundFunction);
                _this._bodyContainer.addEventListener("scroll", _this._syncScrollBoundFunction);
                var headerOnScroll = function () {
                    _this._bodyContainer.scrollLeft = _this._headerContainer.scrollLeft;
                };
                _this._headerContainer.addEventListener("scroll", headerOnScroll);
                var subscription = _this._hiddenColumns.subscribe(_this.onHiddenColumnsChanged.bind(_this), null, "arrayChange");
                ko.utils.domNodeDisposal.addDisposeCallback(_this._bodyContainer, function () {
                    window.removeEventListener("resize", _this._syncScrollBoundFunction);
                    _this._bodyContainer.removeEventListener("scroll", _this._syncScrollBoundFunction);
                    _this._headerContainer.removeEventListener("scroll", headerOnScroll);
                    subscription.dispose();
                    _this._hiddenColumns.removeAll();
                    for (var id in _this._resizers) {
                        _this._resizers[id].dispose();
                    }
                });
                _this._columnOrder.subscribe(function () { return _this.adjustResizerLocation(); });
                _this._hiddenColumns(columnsToHide);
            });
        };
        TreeGridHeaderViewModel.prototype.syncScroll = function () {
            var width = this._bodyContainer.clientWidth;
            var scroll = this._bodyContainer.scrollLeft;
            this._headerContainer.style.width = width + "px";
            this._headerContainer.scrollLeft = scroll;
        };
        TreeGridHeaderViewModel.prototype.onHiddenColumnsChanged = function (changes) {
            var _this = this;
            changes.forEach(function (change) {
                if (change.status === "added") {
                    var resizer = _this._resizers[change.value];
                    resizer.onColumnVisiblityChanged(false);
                    _this._columnSettingsProvider.onColumnChanged(resizer.columnConfig);
                }
                else if (change.status === "deleted") {
                    var resizer = _this._resizers[change.value];
                    resizer.onColumnVisiblityChanged(true);
                    _this._columnSettingsProvider.onColumnChanged(resizer.columnConfig);
                }
            });
        };
        TreeGridHeaderViewModel.prototype.onKeyDownHeader = function (header, event) {
            if (event.ctrlKey && !event.shiftKey && event.keyCode === KeyCodes.Ctrl) {
                this._isResizing = true;
                return;
            }
            if (event.keyCode !== KeyCodes.ArrowLeft && event.keyCode !== KeyCodes.ArrowRight) {
                return;
            }
            else if (event.shiftKey) {
                return;
            }
            else if (document.activeElement !== header && !header.contains(document.activeElement)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (this._isResizing) {
                if (document.activeElement !== header) {
                    this._delta += event.keyCode === KeyCodes.ArrowRight ? 4 : -4;
                    this.resizeActiveColumnHeader(true);
                }
                return;
            }
            var isColumnHidden = function (element) { return element.offsetHeight === 0; };
            var nextElement;
            if (event.keyCode === KeyCodes.ArrowRight) {
                nextElement = document.activeElement === header || document.activeElement.nextElementSibling === null ?
                    header.firstElementChild :
                    document.activeElement.nextElementSibling;
                for (var i = 0; isColumnHidden(nextElement) && i < this._columns.length; ++i) {
                    nextElement = nextElement.nextElementSibling !== null ?
                        nextElement.nextElementSibling :
                        header.firstElementChild;
                }
            }
            else {
                nextElement = document.activeElement === header || document.activeElement.previousElementSibling === null ?
                    header.lastElementChild :
                    document.activeElement.previousElementSibling;
                for (var i = 0; isColumnHidden(nextElement) && i < this._columns.length; ++i) {
                    nextElement = nextElement.previousElementSibling !== null ?
                        nextElement.previousElementSibling :
                        header.lastElementChild;
                }
            }
            nextElement.focus();
        };
        TreeGridHeaderViewModel.prototype.onKeyUpHeader = function (header, event) {
            if (!this._isResizing) {
                return;
            }
            this._isResizing = event.ctrlKey;
            event.preventDefault();
            event.stopPropagation();
            this.resizeActiveColumnHeader(false);
            this._delta = 0;
        };
        TreeGridHeaderViewModel.prototype.resizeActiveColumnHeader = function (isIntermittent) {
            var colId = document.activeElement.getAttribute("data-columnid");
            if (!colId) {
                return;
            }
            this._resizers[colId].changeWidth(this._delta, isIntermittent);
        };
        TreeGridHeaderViewModel.prototype.adjustResizerLocation = function () {
            var _this = this;
            ko.tasks.runEarly();
            ko.tasks.schedule(function () {
                for (var id in _this._resizers) {
                    _this._resizers[id].resetLocation();
                }
            });
        };
        return TreeGridHeaderViewModel;
    }());
    exports.TreeGridHeaderViewModel = TreeGridHeaderViewModel;
});
define("Shared/Interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    (function (RowType) {
        RowType[RowType["Unknown"] = 0] = "Unknown";
        RowType[RowType["Process"] = 1] = "Process";
        RowType[RowType["Module"] = 2] = "Module";
        RowType[RowType["Function"] = 3] = "Function";
        RowType[RowType["CallTreeNode"] = 4] = "CallTreeNode";
        RowType[RowType["Allocation"] = 5] = "Allocation";
    })(exports.RowType || (exports.RowType = {}));
    var RowType = exports.RowType;
    (function (SortDirection) {
        SortDirection[SortDirection["Asc"] = 1] = "Asc";
        SortDirection[SortDirection["Desc"] = 2] = "Desc";
    })(exports.SortDirection || (exports.SortDirection = {}));
    var SortDirection = exports.SortDirection;
    (function (DataLoadEvent) {
        DataLoadEvent[DataLoadEvent["DataLoadStart"] = 0] = "DataLoadStart";
        DataLoadEvent[DataLoadEvent["DataLoadCompleted"] = 1] = "DataLoadCompleted";
        DataLoadEvent[DataLoadEvent["DataLoadFailed"] = 2] = "DataLoadFailed";
        DataLoadEvent[DataLoadEvent["DataLoadCanceled"] = 3] = "DataLoadCanceled";
    })(exports.DataLoadEvent || (exports.DataLoadEvent = {}));
    var DataLoadEvent = exports.DataLoadEvent;
    (function (AggregateType) {
        AggregateType[AggregateType["Unknown"] = 0] = "Unknown";
        AggregateType[AggregateType["SystemCode"] = 1] = "SystemCode";
        AggregateType[AggregateType["JmcRejected"] = 2] = "JmcRejected";
        AggregateType[AggregateType["AsyncMethod"] = 3] = "AsyncMethod";
        AggregateType[AggregateType["BrokenStack"] = 4] = "BrokenStack";
        AggregateType[AggregateType["Native"] = 5] = "Native";
    })(exports.AggregateType || (exports.AggregateType = {}));
    var AggregateType = exports.AggregateType;
    (function (JmcState) {
        JmcState[JmcState["UnknownCode"] = 0] = "UnknownCode";
        JmcState[JmcState["SystemCode"] = 1] = "SystemCode";
        JmcState[JmcState["LibraryCode"] = 2] = "LibraryCode";
        JmcState[JmcState["UserCode"] = 3] = "UserCode";
        JmcState[JmcState["MarkedHiddenCode"] = 4] = "MarkedHiddenCode";
    })(exports.JmcState || (exports.JmcState = {}));
    var JmcState = exports.JmcState;
});
define("Shared/PluginKnockoutBindings", ["require", "exports", "Shared/CustomBindings/MultiClick", "Shared/CustomBindings/LocalizedNumberUnitSpan", "Shared/CustomBindings/AriaExpanded", "Shared/CustomBindings/CircularFocus", "Shared/CustomBindings/DynamicContextMenu", "Shared/CustomBindings/IeFocus", "Shared/CustomBindings/LocalizedAriaLabel", "Shared/CustomBindings/LocalizedNumber", "Shared/CustomBindings/LocalizedPlaceholderText", "Shared/CustomBindings/LocalizedText", "Shared/CustomBindings/LocalizedTooltip", "Shared/CustomBindings/OnEnter", "Shared/CustomBindings/SvgImage", "Shared/CustomBindings/VerticalSplit"], function (require, exports, MultiClick_1) {
    "use strict";
    var knockoutDeferredTaskScheduler;
    function Init(doubleClickTimeMs) {
        MultiClick_1.SetDoubleClickTime(doubleClickTimeMs);
        if (!knockoutDeferredTaskScheduler) {
            knockoutDeferredTaskScheduler = ko.tasks.scheduler;
            var forceScheduleTask = null;
            ko.tasks.scheduler = function (callback) {
                knockoutDeferredTaskScheduler(callback);
                if (forceScheduleTask === null) {
                    forceScheduleTask = setTimeout(function () {
                        forceScheduleTask = null;
                        ko.tasks.runEarly();
                    }, 0);
                    ko.tasks.schedule(function () {
                        if (forceScheduleTask === null) {
                            return;
                        }
                        clearTimeout(forceScheduleTask);
                        forceScheduleTask = null;
                    });
                }
            };
        }
    }
    exports.Init = Init;
});
define("Shared/Grid/TreeGridViewModel", ["require", "exports", "Shared/Interfaces", "template!TreeGridView", "Shared/CustomBindings/ArrangeableColumns", "Shared/CustomBindings/MultiClick", "Shared/CustomBindings/ReorderHeaderColumns", "Shared/CustomBindings/RowIndent", "Shared/CustomBindings/Sortable", "Shared/CustomBindings/VisibilityContextMenu", "Shared/Grid/TreeGridCustomBindings/FocusedRow", "Shared/Grid/TreeGridCustomBindings/TreeGridExpander", "Shared/Grid/TreeGridCustomBindings/TreeGridRowFocus", "Shared/Grid/TreeGridCustomBindings/VirtualizedForEach"], function (require, exports, Interfaces_5) {
    "use strict";
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    var KeyCodes = DiagnosticsHub.Common.KeyCodes;
    var MouseCodes = DiagnosticsHub.Common.MouseCodes;
    var ErrorCodes = DiagnosticsHub.ErrorCodes;
    var TreeGridViewModel = (function () {
        function TreeGridViewModel(dao, header, ariaLabelToken) {
            var _this = this;
            this._roots = ko.observableArray([]);
            this._treeAsArrayProjection = ko.pureComputed(function () { return _this.computeTreeAsArrayProjection(); });
            this._selectedRows = ko.observableArray([]);
            this._focusedRowIndex = ko.pureComputed(function () { return _this.computedFocusedRowIndex(); });
            this._focusedRow = ko.pureComputed(function () { return _this.computeFocusedRow(); });
            this._scrollTop = ko.observable(0);
            this._clientHeight = ko.observable(0);
            this._logger = DiagnosticsHub.getLogger();
            this._automation = DiagnosticsHub.getAutomationManager(this._logger);
            this._dataLoadStatus = ko.observable(Interfaces_5.DataLoadEvent.DataLoadCompleted);
            this._dao = dao;
            this._header = header;
            this._ariaLabelToken = ariaLabelToken;
            this._header.sortInfo.subscribe(this.onSortChanged.bind(this));
            this._selectedRows.subscribe(this.onSelectionChanged.bind(this), null, "arrayChange");
        }
        Object.defineProperty(TreeGridViewModel.prototype, "dataLoadPromise", {
            get: function () {
                return !this._dataLoadPromise ?
                    Microsoft.Plugin.Promise.as(void (0)) : this._dataLoadPromise;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "roots", {
            get: function () {
                return this._roots;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "treeAsArray", {
            get: function () {
                return this._treeAsArrayProjection;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "selectedRows", {
            get: function () {
                return this._selectedRows;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "header", {
            get: function () {
                return this._header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "ariaLabelToken", {
            get: function () {
                return this._ariaLabelToken;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "scrollTop", {
            get: function () {
                return this._scrollTop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "clientHeight", {
            get: function () {
                return this._clientHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "dataLoadStatus", {
            get: function () {
                return this._dataLoadStatus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "focusedRowIndex", {
            get: function () {
                return this._focusedRowIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeGridViewModel.prototype, "focusedRow", {
            get: function () {
                return this._focusedRow;
            },
            enumerable: true,
            configurable: true
        });
        TreeGridViewModel.prototype.onAfterDomInsert = function (elements, viewModel) {
            var element = elements[0];
            var header = element.querySelector(".treeGridHeader");
            var body = element.querySelector(".treeGridBody");
            viewModel._header.onAfterDomInsert(header, body);
            var updateCachedSizes = function () {
                viewModel._scrollTop(body.scrollTop);
                viewModel._clientHeight(body.clientHeight);
            };
            updateCachedSizes();
            var onResizeBoundFunction = DiagnosticsHub.eventThrottler(updateCachedSizes, DiagnosticsHub.Constants.WindowResizeThrottle);
            body.addEventListener("scroll", updateCachedSizes);
            window.addEventListener("resize", onResizeBoundFunction);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                body.removeEventListener("scroll", updateCachedSizes);
                window.removeEventListener("resize", onResizeBoundFunction);
            });
        };
        TreeGridViewModel.prototype.onResultChanged = function (resultId) {
            var _this = this;
            this.loadDataOperation(function () { return _this._dao.getRoots(resultId, _this._header.sortInfo()); });
        };
        TreeGridViewModel.prototype.onSortChanged = function (sortInfo) {
            var _this = this;
            this.loadDataOperation(function () { return _this._dao.sort(_this._roots(), sortInfo); });
        };
        TreeGridViewModel.prototype.search = function (query, isCaseSensitive, isRegex, isForward) {
            var _this = this;
            if (this._dataLoadPromise) {
                this._logger.error("Trying to search while loading data, this should not happen");
                return Microsoft.Plugin.Promise.as(false);
            }
            if (!query) {
                return Microsoft.Plugin.Promise.as(false);
            }
            var currentNode = null;
            var currentChildren = this._roots();
            var expandSearch = function (result) {
                var nodeToExpand = result.shift();
                for (var nodeIndex = 0; nodeIndex < currentChildren.length; ++nodeIndex) {
                    currentNode = currentChildren[nodeIndex];
                    if (currentNode.id === nodeToExpand.nodeId) {
                        currentChildren = currentNode.children();
                        break;
                    }
                }
                if (result.length > 0) {
                    if (!currentNode.expanded()) {
                        return _this._dao.expand(currentNode, _this._header.sortInfo())
                            .then(function () { return currentChildren = currentNode.children(); })
                            .then(function () { return expandSearch(result); });
                    }
                    else {
                        return expandSearch(result);
                    }
                }
                else {
                    ko.tasks.schedule(function () {
                        var indexToSelect = _this._treeAsArrayProjection().indexOf(currentNode);
                        _this._selectedRows([indexToSelect]);
                    });
                    return Microsoft.Plugin.Promise.as(true);
                }
            };
            var processSearchResult = function (result) {
                if (result.length > 0) {
                    return expandSearch(result);
                }
                if (_this._selectedRows().length === 0) {
                    return _this._automation.getAlertPromise(DiagnosticsHub.AutomationConstants.SearchNoResultsAlertKey, Microsoft.Plugin.Resources.getString("Message_SearchNoMatches"))
                        .then(function () { return false; });
                }
                return _this._automation.getConfirmationPromise(DiagnosticsHub.AutomationConstants.SearchNoResultsConfirmationKey, Microsoft.Plugin.Resources.getString("Message_SearchStartFromTop"))
                    .then(function (startFromTop) {
                    if (!startFromTop) {
                        return Microsoft.Plugin.Promise.as(false);
                    }
                    _this._selectedRows([]);
                    return _this._dao.search(query, isCaseSensitive, isRegex, isForward, null, _this._header.sortInfo())
                        .then(processSearchResult);
                });
            };
            this._dataLoadPromise = this._dao.search(query, isCaseSensitive, isRegex, isForward, this.focusedRow(), this._header.sortInfo())
                .then(processSearchResult);
            this._dataLoadPromise.done(function () { return _this._dataLoadPromise = null; }, function (error) {
                _this._dataLoadPromise = null;
                _this._logger.error("Tree grid search failed");
                if (parseInt(error.name, 16) === ErrorCodes.VSHUB_E_INVALID_REGEX) {
                    window.alert(Microsoft.Plugin.Resources.getString("ErrMsg_InvalidRegularExpression"));
                }
            });
            return this._dataLoadPromise;
        };
        TreeGridViewModel.prototype.onClick = function (viewModel, event) {
            var _this = this;
            if (event.which !== MouseCodes.Left) {
                return;
            }
            var context = ko.contextFor(event.target);
            if (!context || context.$data === this) {
                return;
            }
            var row = context.$data;
            var rowIndex = this._treeAsArrayProjection().indexOf(row);
            if (event.target.classList && event.target.classList.contains("treeGridRow-expander")) {
                this._selectedRows([rowIndex]);
                ko.tasks.runEarly();
                this._dao.expand(row, this._header.sortInfo());
            }
            else if (event.ctrlKey) {
                var selectedIndex = this._selectedRows().indexOf(rowIndex);
                if (selectedIndex === -1) {
                    this._selectedRows.push(rowIndex);
                }
                else {
                    this._selectedRows.splice(selectedIndex, 1);
                }
            }
            else if (event.shiftKey) {
                var start = Math.max(Math.min(this.focusedRowIndex(), rowIndex), 0);
                var end = Math.max(this.focusedRowIndex(), rowIndex);
                var initialSelection = this._selectedRows();
                var selectionToAdd = [];
                for (var indexToSelect = start; indexToSelect <= end; ++indexToSelect) {
                    if (initialSelection.indexOf(indexToSelect) === -1) {
                        selectionToAdd.push(indexToSelect);
                    }
                }
                if (this.focusedRowIndex() > rowIndex) {
                    selectionToAdd.reverse();
                }
                selectionToAdd.forEach(function (selection) { return _this._selectedRows.push(selection); });
            }
            else {
                this._selectedRows([rowIndex]);
            }
        };
        TreeGridViewModel.prototype.onDblClick = function (viewModel, event) {
            if (event.which !== MouseCodes.Left) {
                return;
            }
            var context = ko.contextFor(event.target);
            if (event.target.classList && event.target.classList.contains("treeGridRow-expander")) {
                var rowIndex = this._treeAsArrayProjection().indexOf(context.$data);
                this._selectedRows([rowIndex]);
                ko.tasks.runEarly();
                this._dao.expand(context.$data, this._header.sortInfo());
            }
            else if (context && context.$data !== this && this._selectedRows().length > 0) {
                if (this.focusedRow() === context.$data) {
                    this.focusedRow().invoke();
                }
                else {
                    this.onClick(viewModel, event);
                }
            }
        };
        TreeGridViewModel.prototype.onKeyDown = function (viewModel, event) {
            var _this = this;
            var focusedRow = this.focusedRow();
            if (!focusedRow) {
                return true;
            }
            if (KeyCodes.Enter === event.keyCode) {
                focusedRow.invoke();
                return false;
            }
            if (KeyCodes.Space !== event.keyCode && KeyCodes.ArrowRight !== event.keyCode && KeyCodes.ArrowLeft !== event.keyCode) {
                return true;
            }
            if (KeyCodes.Space === event.keyCode) {
                this._selectedRows([this.focusedRowIndex()]);
                ko.tasks.runEarly();
                this._dao.expand(focusedRow, this._header.sortInfo());
            }
            else if (KeyCodes.ArrowLeft === event.keyCode && !focusedRow.expanded()) {
                var rows = this._treeAsArrayProjection();
                for (var i = this._focusedRowIndex() - 1; i >= 0; --i) {
                    if (rows[i].depth < focusedRow.depth) {
                        this._selectedRows([i]);
                        break;
                    }
                }
            }
            else if (KeyCodes.ArrowLeft === event.keyCode) {
                this._selectedRows([this.focusedRowIndex()]);
                ko.tasks.runEarly();
                focusedRow.expanded(false);
            }
            else if (KeyCodes.ArrowRight === event.keyCode && focusedRow.expanded()) {
                if (focusedRow.children() && focusedRow.children().length > 0) {
                    var focusedIndex = this._focusedRowIndex() + 1;
                    this._selectedRows([focusedIndex]);
                }
            }
            else if (KeyCodes.ArrowRight === event.keyCode && !focusedRow.expanded() && !this._dataLoadPromise) {
                var focusIndex = this.focusedRowIndex();
                this._selectedRows([focusIndex]);
                ko.tasks.runEarly();
                this._dataLoadPromise = this._dao.expand(focusedRow, this._header.sortInfo());
                this._dataLoadPromise.done(function () { return _this._dataLoadPromise = null; }, function (error) {
                    _this._logger.error("Tree grid keyboard expand failed");
                    _this._dataLoadPromise = null;
                });
            }
            return false;
        };
        TreeGridViewModel.prototype.onContextMenu = function (viewModel, event) {
            if (event.which !== MouseCodes.Right) {
                return;
            }
            var context = ko.contextFor(event.target);
            if (!context || context.$data === this) {
                return;
            }
            var row = context.$data;
            var rowIndex = this._treeAsArrayProjection().indexOf(row);
            if (this._selectedRows().indexOf(rowIndex) !== -1) {
                return;
            }
            this._selectedRows([rowIndex]);
        };
        TreeGridViewModel.prototype.loadDataOperation = function (operation) {
            var _this = this;
            if (this._dataLoadPromise) {
                this._dataLoadPromise.cancel();
            }
            this._selectedRows([]);
            ko.tasks.runEarly();
            this._dataLoadStatus(Interfaces_5.DataLoadEvent.DataLoadStart);
            this._dataLoadPromise = operation().then(function (roots) { return _this._roots(roots); });
            this._dataLoadPromise.done(function () {
                _this._dataLoadPromise = null;
                _this._dataLoadStatus(Interfaces_5.DataLoadEvent.DataLoadCompleted);
            }, function (error) {
                if (error.name === "Canceled") {
                    _this._dataLoadStatus(Interfaces_5.DataLoadEvent.DataLoadCanceled);
                }
                else {
                    _this._dataLoadStatus(Interfaces_5.DataLoadEvent.DataLoadFailed);
                }
                _this._dataLoadPromise = null;
            });
        };
        TreeGridViewModel.prototype.computeTreeAsArrayProjection = function () {
            var projection = [];
            var getProjection = function (element) {
                projection.push(element);
                if (element.expanded()) {
                    element.children().forEach(getProjection);
                }
            };
            this._roots().forEach(getProjection);
            return projection;
        };
        TreeGridViewModel.prototype.computedFocusedRowIndex = function () {
            var selectedRows = this._selectedRows();
            return selectedRows.length > 0 ? selectedRows[selectedRows.length - 1] : -1;
        };
        TreeGridViewModel.prototype.computeFocusedRow = function () {
            var focusedIndex = this.computedFocusedRowIndex();
            return focusedIndex !== -1 ? this._treeAsArrayProjection()[focusedIndex] : null;
        };
        TreeGridViewModel.prototype.onSelectionChanged = function (changes) {
            var _this = this;
            changes.forEach(function (change) {
                if (typeof change.moved !== "undefined") {
                    return;
                }
                if (change.status === "added") {
                    _this._treeAsArrayProjection()[change.value].selected(true);
                }
                else if (change.status === "deleted") {
                    _this._treeAsArrayProjection()[change.value].selected(false);
                }
            });
        };
        return TreeGridViewModel;
    }());
    exports.TreeGridViewModel = TreeGridViewModel;
});
define("Shared/Grid/ColumnResizer", ["require", "exports"], function (require, exports) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var ColumnResizer = (function () {
        function ColumnResizer(headerColumn, header, tableColumn, table, columnConfig, columnProvider) {
            this._resizedEvent = new DiagHub.AggregatedEvent();
            this._leftOffset = null;
            this._columnWidth = null;
            this._initialX = null;
            this._initialHeaderWidth = null;
            this._minWidth = null;
            this._hidden = false;
            this._headerColumn = headerColumn;
            this._header = header;
            this._tableColumn = tableColumn;
            this._table = table;
            this._minWidth = 40;
            this._columnWidth = columnConfig.width;
            this._id = columnConfig.columnId;
            this._hidden = false;
            this._columnProvider = columnProvider;
            this._resizer = document.createElement("div");
            this._resizer.classList.add("columnResizer");
            this._resizer.style.width = this.width + "px";
            this._resizer.onmousedown = this.onMouseDown.bind(this);
            this._resizer.onmousemove = this.onMouseMove.bind(this);
            this._resizer.onmouseup = this.onMouseUp.bind(this);
            this._resizer.ondblclick = this.autoSize.bind(this);
            this._headerColumn.style.width = this._columnWidth + "px";
            this._tableColumn.style.width = this._columnWidth + "px";
            this._header.parentElement.insertAdjacentElement("afterBegin", this._resizer);
        }
        Object.defineProperty(ColumnResizer.prototype, "width", {
            get: function () {
                return 8;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnResizer.prototype, "columnConfig", {
            get: function () {
                return {
                    columnId: this._id,
                    isHidden: this._hidden,
                    width: this._columnWidth,
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnResizer.prototype, "resizedEvent", {
            get: function () {
                return this._resizedEvent;
            },
            enumerable: true,
            configurable: true
        });
        ColumnResizer.prototype.dispose = function () {
            this._resizedEvent.dispose();
        };
        ColumnResizer.prototype.onColumnVisiblityChanged = function (visible) {
            DiagHub.Debug.Assert.isFalse(this._hidden !== visible, "We should not be getting column visiblity changed for the same state");
            if (this._hidden !== visible) {
                return;
            }
            this._hidden = !visible;
            var delta = this._hidden ? -this._columnWidth : this._columnWidth;
            var headerWidth = parseInt(this._header.style.width.slice(0, -2));
            this._header.style.width = (headerWidth + delta) + "px";
            this._table.style.width = (headerWidth + delta) + "px";
            this._resizer.style.display = this._hidden ? "none" : "";
            if (this._hidden && document.activeElement === this._headerColumn) {
                this._headerColumn.parentElement.focus();
            }
            this._resizedEvent.invokeEvent(this);
        };
        ColumnResizer.prototype.resetLocation = function () {
            this._leftOffset = this._headerColumn.offsetLeft + this._headerColumn.offsetWidth - Math.floor(this.width / 2);
            this._resizer.style.left = this._leftOffset + "px";
        };
        ColumnResizer.prototype.changeWidth = function (delta, isIntermittent) {
            var width = Math.max(this._columnWidth + delta, this._minWidth);
            var clampedDelta = width - this._columnWidth;
            this._header.style.width = (this._initialHeaderWidth + clampedDelta) + "px";
            this._headerColumn.style.width = (this._columnWidth + clampedDelta) + "px";
            this._resizer.style.left = (this._leftOffset + clampedDelta) + "px";
            this._resizedEvent.invokeEvent(this);
            if (!isIntermittent) {
                this._table.style.width = (this._initialHeaderWidth + clampedDelta) + "px";
                this._tableColumn.style.width = (this._columnWidth + clampedDelta) + "px";
                this._columnWidth += clampedDelta;
                this._leftOffset += clampedDelta;
                this._columnProvider.onColumnChanged(this.columnConfig);
            }
        };
        ColumnResizer.prototype.autoSize = function (event) {
            var columnRows = this._table.querySelectorAll("td[data-columnid=\"" + this._id + "\"]");
            if (columnRows.length === 0) {
                return;
            }
            this._initialHeaderWidth = parseInt(this._header.style.width.slice(0, -2));
            var delta = -(this._initialHeaderWidth - this._minWidth);
            this.changeWidth(delta, false);
            for (var iterations = 0; iterations < 10; ++iterations) {
                this._initialHeaderWidth = parseInt(this._header.style.width.slice(0, -2));
                delta = -Number.MAX_VALUE;
                for (var column = 0; column < columnRows.length; ++column) {
                    delta = Math.max(delta, columnRows[column].scrollWidth - columnRows[column].clientWidth);
                }
                if (delta === 0) {
                    break;
                }
                delta += (this._columnWidth - columnRows[0].clientWidth);
                delta += 20;
                this.changeWidth(delta, false);
                columnRows = this._table.querySelectorAll("td[data-columnid=\"" + this._id + "\"]");
            }
            this._initialHeaderWidth = null;
        };
        ColumnResizer.prototype.onMouseDown = function (event) {
            if (this._initialX !== null) {
                this.onMouseUp(event);
                return;
            }
            this._initialX = event.clientX;
            this._initialHeaderWidth = parseInt(this._header.style.width.slice(0, -2));
            DiagHub.Utilities.setCapture(this._resizer);
        };
        ColumnResizer.prototype.onMouseMove = function (event) {
            if (this._initialX === null) {
                return;
            }
            this.changeWidth(event.clientX - this._initialX, true);
        };
        ColumnResizer.prototype.onMouseUp = function (event) {
            if (this._initialX === null) {
                return;
            }
            DiagHub.Utilities.releaseCapture(this._resizer);
            this.changeWidth(event.clientX - this._initialX, false);
            this._initialX = null;
            this._initialHeaderWidth = null;
        };
        return ColumnResizer;
    }());
    exports.ColumnResizer = ColumnResizer;
});
define("Shared/Grid/TreeGridUtils", ["require", "exports", "template!CopyTreeGridView"], function (require, exports) {
    "use strict";
    var TreeGridUtils = (function () {
        function TreeGridUtils() {
        }
        TreeGridUtils.selectRow = function (treeGrid, row) {
            var rowIndex = treeGrid.treeAsArray().indexOf(row);
            treeGrid.selectedRows([rowIndex]);
        };
        TreeGridUtils.expandNodePath = function (treeGrid, dao, nodePath) {
            var currentNode;
            var currentChildren = treeGrid.roots();
            var expandPath = function (nodePath) {
                var nodeToFollow = nodePath.shift();
                for (var nodeIndex = 0; nodeIndex < currentChildren.length; ++nodeIndex) {
                    currentNode = currentChildren[nodeIndex];
                    if (currentNode.id === nodeToFollow) {
                        if (nodePath.length > 0) {
                            if (!currentNode.expanded()) {
                                return dao.expand(currentNode, treeGrid.header.sortInfo())
                                    .then(function () { return currentChildren = currentNode.children(); })
                                    .then(function () { return expandPath(nodePath); });
                            }
                            else {
                                currentChildren = currentNode.children();
                                return expandPath(nodePath);
                            }
                        }
                        else {
                            return Microsoft.Plugin.Promise.as(currentNode);
                        }
                    }
                }
                return Microsoft.Plugin.Promise.as(null);
            };
            return expandPath(nodePath);
        };
        TreeGridUtils.formatTreeGridSelectedToMarkdown = function (treeGrid, showDiscontiguousBreaks) {
            if (showDiscontiguousBreaks === void 0) { showDiscontiguousBreaks = true; }
            var enumeratedGrid = TreeGridUtils.enumerateTreeGrid(treeGrid);
            var formattedSelection = "|" + enumeratedGrid.header.map(this.escapeMarkdownCharacters).join("|") + "|";
            formattedSelection += TreeGridUtils.NewLine;
            formattedSelection += Array(enumeratedGrid.header.length + 1).join("|-") + "|";
            var row = enumeratedGrid.body;
            while (row !== null) {
                formattedSelection += TreeGridUtils.NewLine;
                if (showDiscontiguousBreaks && row.isDiscontiguous) {
                    formattedSelection += Array(row.cells.length + 1).join("|[...]") + "|" + TreeGridUtils.NewLine;
                }
                formattedSelection += "|";
                formattedSelection += row.metadata.map(this.escapeMarkdownCharacters).join("");
                formattedSelection += row.cells.map(this.escapeMarkdownCharacters).join("|");
                formattedSelection += "|";
                row = enumeratedGrid.body.getNext();
            }
            return formattedSelection;
        };
        TreeGridUtils.formatTreeGridSelectedToText = function (treeGrid, showDiscontiguousBreaks) {
            if (showDiscontiguousBreaks === void 0) { showDiscontiguousBreaks = true; }
            var enumeratedGrid = TreeGridUtils.enumerateTreeGrid(treeGrid);
            var formattedSelection = enumeratedGrid.header.join("\t");
            var row = enumeratedGrid.body;
            while (row !== null) {
                formattedSelection += TreeGridUtils.NewLine;
                if (showDiscontiguousBreaks && row.isDiscontiguous) {
                    formattedSelection += "[...]" + TreeGridUtils.NewLine;
                }
                formattedSelection += row.metadata.join("");
                formattedSelection += row.cells.join("\t");
                row = enumeratedGrid.body.getNext();
            }
            return formattedSelection;
        };
        TreeGridUtils.escapeMarkdownCharacters = function (text) {
            return text.replace(/(`|\*|_|\[|\]|<|>|\(|\)|\||#|@|\\)/g, "\\$1");
        };
        TreeGridUtils.enumerateTreeGrid = function (treeGrid) {
            var isColumnHidden = {};
            treeGrid.header.hiddenColumns().forEach(function (columnId) { return isColumnHidden[columnId] = true; });
            var renderedTreeGridCopy = document.createDocumentFragment();
            ko.renderTemplate("CopyTreeGridView", treeGrid, {}, renderedTreeGridCopy, "replaceChildren");
            var columnHeaders = {};
            treeGrid.header.columns.forEach(function (columnHeader) { return columnHeaders[columnHeader.id] = columnHeader.text; });
            var visibleOrderedColumns = treeGrid.header.columnOrder().filter(function (column) { return !isColumnHidden[column]; });
            var header = [];
            for (var columnIndex = 0; columnIndex < visibleOrderedColumns.length; ++columnIndex) {
                var columnId = visibleOrderedColumns[columnIndex];
                header.push(columnHeaders[columnId]);
            }
            var metadata = renderedTreeGridCopy.querySelectorAll("tbody > tr.copy-metadata");
            var rows = renderedTreeGridCopy.querySelectorAll("tbody > tr:not(.copy-metadata)");
            var index = -1;
            var previousRowPosition = -1;
            var getCells = function (index) {
                var row = rows[index];
                var cells = row.querySelectorAll("td");
                var cellMapping = {};
                for (var cellIndex = 0; cellIndex < cells.length; ++cellIndex) {
                    var cell = cells[cellIndex];
                    var columnId = cell.getAttribute("data-columnid");
                    if (isColumnHidden[columnId]) {
                        continue;
                    }
                    cellMapping[columnId] = cell.innerText.replace(/^\s+|\s+$/g, '');
                }
                var cellsAsStrings = new Array(visibleOrderedColumns.length);
                for (var columnIndex = 0; columnIndex < visibleOrderedColumns.length; ++columnIndex) {
                    var columnId = visibleOrderedColumns[columnIndex];
                    cellsAsStrings[columnIndex] = cellMapping[columnId];
                }
                return cellsAsStrings;
            };
            var getMetadata = function (index) {
                var metadataCells = metadata[index].querySelectorAll("td");
                var metadataAsStrings = new Array(metadataCells.length);
                for (var i = 0; i < metadataCells.length; ++i) {
                    metadataAsStrings[i] = metadataCells[i].innerText;
                }
                return metadataAsStrings;
            };
            var getNext = function () {
                index++;
                if (index === rows.length) {
                    return null;
                }
                var rowPosition = treeGrid.selectedRows()[index];
                var isDiscontiguous = index !== 0 && previousRowPosition + 1 !== rowPosition;
                previousRowPosition = rowPosition;
                return {
                    isDiscontiguous: isDiscontiguous,
                    metadata: getMetadata(index),
                    cells: getCells(index),
                    getNext: getNext
                };
            };
            return {
                header: header,
                body: getNext()
            };
        };
        TreeGridUtils.NewLine = "\r\n";
        return TreeGridUtils;
    }());
    exports.TreeGridUtils = TreeGridUtils;
});
define("Shared/Grid/TreeGridCustomBindings/VirtualizedForEach", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    function calculateNeededChanges(newArray, oldArray) {
        var intermediateArray = oldArray.slice(0);
        var arrayChanges = {
            removedElements: [],
            addedElements: [],
            movedElements: []
        };
        for (var i = oldArray.length - 1; i >= 0; --i) {
            if (newArray.indexOf(oldArray[i]) === -1) {
                arrayChanges.removedElements.push({ value: oldArray[i], index: i });
                intermediateArray.splice(i, 1);
            }
        }
        for (var i = 0; i < newArray.length; i++) {
            if (oldArray.indexOf(newArray[i]) === -1) {
                arrayChanges.addedElements.push({ value: newArray[i], index: i });
                intermediateArray.splice(i, 0, newArray[i]);
            }
        }
        for (var i = 0; i < intermediateArray.length; i++) {
            if (intermediateArray[i] === newArray[i]) {
                continue;
            }
            var fromIndex = intermediateArray.indexOf(newArray[i]);
            arrayChanges.movedElements.push({ fromIndex: fromIndex, toIndex: i });
            var movedElement = intermediateArray.splice(fromIndex, 1)[0];
            intermediateArray.splice(i, 0, movedElement);
        }
        return arrayChanges;
    }
    exports.calculateNeededChanges = calculateNeededChanges;
    function measureRowHeight(element, viewModel, dataOrBindingContext) {
        var renderedTemplate = document.createDocumentFragment();
        ko.renderTemplate(viewModel.templateName, dataOrBindingContext, {}, renderedTemplate, "replaceChildren");
        var measuringRow = renderedTemplate.firstChild;
        element.appendChild(measuringRow);
        var dimensions = measuringRow.getBoundingClientRect();
        element.removeChild(measuringRow);
        ko.cleanNode(measuringRow);
        return dimensions.height;
    }
    ko.bindingHandlers["virtualizedForEach"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var hiddenTop = document.createElement("div");
            var hiddenBottom = document.createElement("div");
            hiddenTop.innerHTML = "&nbsp;";
            hiddenTop.style.height = "0px";
            hiddenTop.setAttribute('aria-hidden', 'true');
            hiddenBottom.innerHTML = "&nbsp;";
            hiddenBottom.style.height = "0px";
            hiddenBottom.setAttribute('aria-hidden', 'true');
            element.parentElement.insertAdjacentElement("beforeBegin", hiddenTop);
            element.parentElement.insertAdjacentElement("afterEnd", hiddenBottom);
            ko.utils.domData.set(element, "previousRows", []);
            ko.utils.domData.set(element, "rowHeight", 0);
            ko.utils.domData.set(element, "hiddenTop", hiddenTop);
            ko.utils.domData.set(element, "hiddenBottom", hiddenBottom);
            ko.utils.domData.set(element, "previousOrder", ko.unwrap(valueAccessor().columnOrder).slice(0));
            Microsoft.Plugin.Theme.addEventListener("themechanged", function () {
                ko.utils.domData.set(element, "rowHeight", 0);
            });
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var config = valueAccessor();
            var allRows = ko.unwrap(config.rows);
            var scrollTop = ko.unwrap(config.scrollTop);
            var clientHeight = ko.unwrap(config.clientHeight);
            var columnOrder = ko.unwrap(config.columnOrder);
            var hiddenTop = ko.utils.domData.get(element, "hiddenTop");
            var hiddenBottom = ko.utils.domData.get(element, "hiddenBottom");
            var previousRows = ko.utils.domData.get(element, "previousRows");
            var rowHeight = ko.utils.domData.get(element, "rowHeight");
            var previousOrder = ko.utils.domData.get(element, "previousOrder");
            if (rowHeight === 0) {
                if (allRows.length === 0) {
                    return;
                }
                var rowBindingContext = bindingContext.createChildContext(allRows[0]);
                rowHeight = measureRowHeight(element, allRows[0], rowBindingContext);
                ko.utils.domData.set(element, "rowHeight", rowHeight);
            }
            var rowsToRemoveAtTop = Math.floor(scrollTop / rowHeight);
            var maxVisibleRows = Math.floor(clientHeight / rowHeight) + 2;
            var bufferSize = Math.floor(maxVisibleRows / 2);
            var endSlice = Math.min(allRows.length, rowsToRemoveAtTop + maxVisibleRows + bufferSize);
            rowsToRemoveAtTop = Math.max(rowsToRemoveAtTop - bufferSize, 0);
            hiddenTop.style.height = (rowsToRemoveAtTop * rowHeight) + "px";
            var visibleRows = allRows.slice(rowsToRemoveAtTop, endSlice);
            hiddenBottom.style.height = ((allRows.length - endSlice) * rowHeight) + "px";
            var rowDifferences = calculateNeededChanges(visibleRows, previousRows);
            rowDifferences.removedElements.forEach(function (change) {
                var rowElement = element.children[change.index];
                ko.removeNode(rowElement);
            });
            var columnDifferences = calculateNeededChanges(columnOrder, previousOrder);
            var rows = element.querySelectorAll("tr");
            columnDifferences.movedElements.forEach(function (change) {
                for (var i = 0; i < rows.length; ++i) {
                    var row = rows[i];
                    var columns = row.querySelectorAll("td");
                    if (columns.length !== columnOrder.length) {
                        continue;
                    }
                    row.insertBefore(columns[change.fromIndex], columns[change.toIndex]);
                }
            });
            rowDifferences.addedElements.forEach(function (change) {
                var renderedRow = document.createDocumentFragment();
                var rowBindingContext = bindingContext.createChildContext(change.value);
                ko.renderTemplate(change.value.templateName, rowBindingContext, {}, renderedRow, "replaceChildren");
                var rowElement = renderedRow.querySelector("tr");
                var columns = rowElement.querySelectorAll("td");
                for (var i = 0; i < columns.length && columns.length === columnOrder.length; ++i) {
                    if (columns[i].getAttribute("data-columnid") !== columnOrder[i]) {
                        rowElement.insertBefore(rowElement.querySelector("td[data-columnid='" + columnOrder[i] + "']"), columns[i]);
                    }
                    columns = rowElement.querySelectorAll("td");
                }
                element.insertBefore(renderedRow, element.children[change.index] || null);
            });
            rowDifferences.movedElements.forEach(function (change) {
                element.insertBefore(element.children[change.fromIndex], element.children[change.toIndex]);
            });
            ko.utils.domData.set(element, "previousRows", visibleRows);
            ko.utils.domData.set(element, "previousOrder", columnOrder.slice());
        }
    };
});
define("Shared/Grid/TreeGridCustomBindings/FocusedRow", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["focusedRow"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
            var multiSelectStart = -1;
            element.addEventListener("keydown", function (event) {
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.Shift === event.keyCode) {
                    var bindingConfig = valueAccessor();
                    multiSelectStart = ko.unwrap(bindingConfig.focused);
                    return;
                }
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowUp !== event.keyCode &&
                    Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowDown !== event.keyCode) {
                    return;
                }
                var bindingConfig = valueAccessor();
                var rows = ko.unwrap(bindingConfig.rows);
                if (rows.length === 0) {
                    return;
                }
                var focusedIndex = ko.unwrap(bindingConfig.focused);
                var selectedIndex = 0;
                if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowUp === event.keyCode && focusedIndex !== -1) {
                    selectedIndex = Math.max(focusedIndex - 1, 0);
                }
                else if (Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.ArrowDown === event.keyCode && focusedIndex !== -1) {
                    selectedIndex = Math.min(focusedIndex + 1, rows.length - 1);
                }
                if (!event.shiftKey) {
                    bindingConfig.selected([selectedIndex]);
                }
                else {
                    var start = Math.max(Math.min(selectedIndex, multiSelectStart), 0);
                    var end = Math.max(selectedIndex, multiSelectStart);
                    var selection = [];
                    for (var indexToSelect = start; indexToSelect <= end; ++indexToSelect) {
                        selection.push(indexToSelect);
                    }
                    if (multiSelectStart > selectedIndex) {
                        selection.reverse();
                    }
                    bindingConfig.selected(selection);
                }
                event.preventDefault();
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var bindingConfig = valueAccessor();
            var focusedIndex = ko.unwrap(bindingConfig.focused);
            if (focusedIndex === -1) {
                return;
            }
            var rows = ko.unwrap(bindingConfig.rows);
            var scrollTop = element.scrollTop;
            var totalHeight = element.scrollHeight;
            var rowHeight = totalHeight / (rows.length + 1);
            var visibleHeight = element.clientHeight - rowHeight;
            var topPosition = focusedIndex * rowHeight;
            if (topPosition < (scrollTop + rowHeight)) {
                element.scrollTop = Math.max(topPosition - rowHeight, 0);
            }
            else if (topPosition + rowHeight > (scrollTop + (visibleHeight))) {
                element.scrollTop = topPosition + rowHeight - visibleHeight;
            }
        }
    };
});
define("Shared/Grid/TreeGridCustomBindings/TreeGridRowFocus", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    ko.bindingHandlers["treeGridRowFocus"] = {
        previousElement: HTMLElement = null,
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var onFocus = function () {
                if (ko.bindingHandlers["treeGridRowFocus"].previousElement && ko.bindingHandlers["treeGridRowFocus"].previousElement !== element) {
                    var e = document.createEvent("Event");
                    e.initEvent("blur", false, false);
                    ko.bindingHandlers["treeGridRowFocus"].previousElement.dispatchEvent(e);
                }
                var hasFocusObservable = valueAccessor();
                if (ko.isWriteableObservable(hasFocusObservable) && !hasFocusObservable()) {
                    hasFocusObservable(true);
                }
                ko.bindingHandlers["treeGridRowFocus"].previousElement = element;
            };
            var onBlur = function () {
                var hasFocusObservable = valueAccessor();
                if (ko.isWriteableObservable(hasFocusObservable) && !!hasFocusObservable()) {
                    hasFocusObservable(false);
                }
            };
            element.addEventListener("focus", onFocus);
            element.addEventListener("blur", onBlur);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                element.removeEventListener("focus", onFocus);
                element.removeEventListener("blur", onBlur);
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (!ko.unwrap(valueAccessor())) {
                element.blur();
            }
            else {
                var body = element.parentElement;
                while (body && !body.classList.contains("treeGridBody")) {
                    body = body.parentElement;
                }
                if (body) {
                    var x = body.scrollLeft;
                    element.focus();
                    body.scrollLeft = x;
                }
                else {
                    ko.tasks.schedule(function () {
                        var body = element.parentElement;
                        while (body && !body.classList.contains("treeGridBody")) {
                            body = body.parentElement;
                        }
                        if (body) {
                            var x = body.scrollLeft;
                            element.focus();
                            body.scrollLeft = x;
                        }
                        else {
                            DiagHub.Debug.Assert.fail("Unable to find treeGridBody. Is this element a TreeGrid row?");
                            element.focus();
                        }
                    });
                }
            }
        }
    };
});
define("Shared/Grid/TreeGridCustomBindings/TreeGridExpander", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    ko.bindingHandlers["treeGridExpander"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.className = "treeGridRow-expander";
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var expanded = ko.unwrap(valueAccessor());
            if (expanded) {
                element.classList.add("expanded");
            }
            else {
                element.classList.remove("expanded");
            }
        }
    };
    ko.virtualElements.allowedBindings["treeGridExpander"] = false;
});
define("Shared/Search/SearchControlViewModel", ["require", "exports", "template!SearchControlView"], function (require, exports) {
    "use strict";
    var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
    var SearchControlViewModel = (function () {
        function SearchControlViewModel(model, isEnabled, ariaLabel, telemetry, autocomplete) {
            var _this = this;
            if (autocomplete === void 0) { autocomplete = null; }
            this._showSettings = ko.observable(false);
            this._searchInputHasFocus = ko.observable(false);
            this._searchSubmitHasFocus = ko.observable(false);
            this._isRegularExpression = ko.observable(false);
            this._isRegularExpressionHasFocus = ko.observable(false);
            this._isCaseSensitive = ko.observable(false);
            this._isCaseSensitiveHasFocus = ko.observable(false);
            this._searchTerm = ko.observable("");
            this._autoCollapseTimeout = null;
            this._isDisabled = ko.observable(false);
            this._autocomplete = null;
            this._model = model;
            this._ariaLabel = ariaLabel;
            this._telemetry = telemetry;
            this._isRegularExpression.subscribe(function (newValue) {
                window.clearTimeout(_this._autoCollapseTimeout);
                _this._autoCollapseTimeout = window.setTimeout(function () { return _this.showSettings(false); }, SearchControlViewModel.autoCollapseTime);
                if (_this._telemetry != null) {
                    _this._telemetry.searchOptionsChanged();
                }
            });
            this._isCaseSensitive.subscribe(function (newValue) {
                window.clearTimeout(_this._autoCollapseTimeout);
                _this._autoCollapseTimeout = window.setTimeout(function () { return _this.showSettings(false); }, SearchControlViewModel.autoCollapseTime);
                if (_this._telemetry != null) {
                    _this._telemetry.searchOptionsChanged();
                }
            });
            this._showSettings.subscribe(function (visible) {
                window.clearTimeout(_this._autoCollapseTimeout);
                _this._autoCollapseTimeout = null;
            });
            this._hasFocus = ko.pureComputed(function () {
                return !_this._isDisabled() && (_this._searchInputHasFocus() || _this._searchSubmitHasFocus());
            });
            this._isDisabled(!isEnabled);
            if (autocomplete !== null) {
                if (autocomplete.filterText === null) {
                    autocomplete.filterText = this._searchTerm;
                }
                this._autocomplete = autocomplete;
            }
        }
        Object.defineProperty(SearchControlViewModel.prototype, "autoCompleteViewModel", {
            get: function () {
                return this._autocomplete;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "ariaLabel", {
            get: function () {
                return this._ariaLabel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "showSettings", {
            get: function () {
                return this._showSettings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "isDisabled", {
            get: function () {
                return this._isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "isAutocompleteEnabled", {
            get: function () {
                return this._autocomplete !== null;
            },
            enumerable: true,
            configurable: true
        });
        SearchControlViewModel.prototype.closeAutoCompleteLists = function () {
            if (this.isAutocompleteEnabled)
                this._autocomplete.closeAutoCompleteLists();
        };
        Object.defineProperty(SearchControlViewModel.prototype, "hasFocus", {
            get: function () {
                return this._hasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "searchInputHasFocus", {
            get: function () {
                return this._searchInputHasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "searchSubmitHasFocus", {
            get: function () {
                return this._searchSubmitHasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "isCaseSensitive", {
            get: function () {
                return this._isCaseSensitive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "isCaseSensitiveHasFocus", {
            get: function () {
                return this._isCaseSensitiveHasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "isRegularExpression", {
            get: function () {
                return this._isRegularExpression;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "isRegularExpressionHasFocus", {
            get: function () {
                return this._isRegularExpressionHasFocus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel.prototype, "searchTerm", {
            get: function () {
                return this._searchTerm;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchControlViewModel, "autoCollapseTime", {
            get: function () {
                return 2000;
            },
            enumerable: true,
            configurable: true
        });
        SearchControlViewModel.prototype.onAfterDomInsert = function (elements, viewModel) {
            var element = elements[0].parentNode;
            var onMouseDown = function (event) {
                if (!viewModel.showSettings() || viewModel.isDisabled()) {
                    return;
                }
                if (!element.contains(event.target)) {
                    viewModel.showSettings(false);
                }
            };
            var onKeyDown = function (event) {
                if (event.keyCode === DiagHub.Common.KeyCodes.F3) {
                    var isForward = !event.shiftKey;
                    viewModel.search(isForward);
                    event.preventDefault();
                }
            };
            var onBlur = function (event) {
                if (viewModel.showSettings() && !element.contains(document.activeElement)) {
                    viewModel.showSettings(false);
                }
            };
            element.addEventListener("blur", onBlur, true);
            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("mousedown", onMouseDown);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                window.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("mousedown", onMouseDown);
                element.removeEventListener("blur", onBlur);
            });
        };
        SearchControlViewModel.prototype.search = function (isForward) {
            if (isForward === void 0) { isForward = true; }
            if (this.isDisabled()) {
                return;
            }
            this._telemetry.searchIsUsed();
            this._model.search(this._searchTerm(), this._isCaseSensitive(), this._isRegularExpression(), isForward);
        };
        SearchControlViewModel.prototype.onDropDownClick = function (viewModel, event) {
            if (this.isDisabled()) {
                return false;
            }
            this._showSettings(!this._showSettings());
            return false;
        };
        SearchControlViewModel.prototype.onSearchBoxKeyDown = function (viewModel, event) {
            if (this.isDisabled()) {
                return true;
            }
            if (this.isAutocompleteEnabled) {
                this._autocomplete.onKeyDown(this._autocomplete, event);
            }
            if (DiagHub.Common.KeyCodes.Enter === event.keyCode) {
                this.search(true);
                return false;
            }
            else if (DiagHub.Common.KeyCodes.Escape === event.keyCode) {
                this._searchTerm("");
                return false;
            }
            else if (DiagHub.Common.KeyCodes.ArrowDown === event.keyCode && !this.isAutocompleteEnabled) {
                this._showSettings(true);
                this.isRegularExpressionHasFocus(true);
                return false;
            }
            return true;
        };
        SearchControlViewModel.prototype.onFlyoutKeyDown = function (viewModel, event) {
            if (DiagHub.Common.KeyCodes.ArrowUp === event.keyCode || DiagHub.Common.KeyCodes.ArrowDown === event.keyCode) {
                var toggleFocus = this.isRegularExpressionHasFocus();
                this.isRegularExpressionHasFocus(!toggleFocus);
                this.isCaseSensitiveHasFocus(toggleFocus);
                return false;
            }
            else if (DiagHub.Common.KeyCodes.Escape === event.keyCode) {
                this._showSettings(false);
                return false;
            }
            return true;
        };
        return SearchControlViewModel;
    }());
    exports.SearchControlViewModel = SearchControlViewModel;
});
define("Shared/Toolbar/ToolbarButtonViewModel", ["require", "exports", "template!ToolbarButtonView"], function (require, exports) {
    "use strict";
    var ToolbarButtonViewModel = (function () {
        function ToolbarButtonViewModel(svgIcon, text, ariaLabel, callback) {
            this._enabled = ko.observable(true);
            this._svgIcon = svgIcon;
            this._buttonText = text;
            this._ariaLabel = ariaLabel;
            this._callback = callback;
        }
        Object.defineProperty(ToolbarButtonViewModel.prototype, "svgIcon", {
            get: function () {
                return this._svgIcon;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToolbarButtonViewModel.prototype, "buttonText", {
            get: function () {
                return this._buttonText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToolbarButtonViewModel.prototype, "ariaLabel", {
            get: function () {
                return this._ariaLabel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToolbarButtonViewModel.prototype, "callback", {
            get: function () {
                return this._callback;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToolbarButtonViewModel.prototype, "isEnabled", {
            get: function () {
                return this._enabled;
            },
            enumerable: true,
            configurable: true
        });
        return ToolbarButtonViewModel;
    }());
    exports.ToolbarButtonViewModel = ToolbarButtonViewModel;
});
define("Shared/Toolbar/ToggleButtonViewModel", ["require", "exports", "template!ToggleButtonView"], function (require, exports) {
    "use strict";
    var ToggleButtonViewModel = (function () {
        function ToggleButtonViewModel(svgIcon, svgDisabledIcon, text, ariaLabel) {
            var _this = this;
            this._isEnabled = ko.observable(true);
            this._isChecked = ko.observable(false);
            this._svgIcon = ko.pureComputed(function () { return _this._isEnabled() ? svgIcon : svgDisabledIcon; });
            this._ariaLabel = ariaLabel;
            this._buttonText = text;
        }
        Object.defineProperty(ToggleButtonViewModel.prototype, "svgIcon", {
            get: function () {
                return this._svgIcon;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToggleButtonViewModel.prototype, "buttonText", {
            get: function () {
                return this._buttonText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToggleButtonViewModel.prototype, "ariaLabel", {
            get: function () {
                return this._ariaLabel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToggleButtonViewModel.prototype, "isEnabled", {
            get: function () {
                return this._isEnabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToggleButtonViewModel.prototype, "isChecked", {
            get: function () {
                return this._isChecked;
            },
            enumerable: true,
            configurable: true
        });
        ToggleButtonViewModel.prototype.onClick = function (viewModel, event) {
            if (this._isEnabled()) {
                this.isChecked(!this.isChecked());
                return false;
            }
            return true;
        };
        return ToggleButtonViewModel;
    }());
    exports.ToggleButtonViewModel = ToggleButtonViewModel;
});
define("Shared/SortFunctions", ["require", "exports", "Shared/Interfaces"], function (require, exports, Interfaces_6) {
    "use strict";
    var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    var SortFunctions = (function () {
        function SortFunctions() {
        }
        SortFunctions.numericSort = function (propertyToSort, sortDirection) {
            var direction = sortDirection === Interfaces_6.SortDirection.Asc ? 1 : -1;
            return function (left, right) {
                var leftValue = ko.utils.unwrapObservable(left[propertyToSort]);
                var rightValue = ko.utils.unwrapObservable(right[propertyToSort]);
                if (leftValue === rightValue) {
                    return 0;
                }
                return leftValue < rightValue ? -direction : direction;
            };
        };
        SortFunctions.natSort = function (propertyToSort, sortDirection) {
            var direction = sortDirection === Interfaces_6.SortDirection.Asc ? 1 : -1;
            return function (left, right) {
                var a = ko.utils.unwrapObservable(left[propertyToSort]);
                var b = ko.utils.unwrapObservable(right[propertyToSort]);
                return direction * collator.compare(a, b);
            };
        };
        SortFunctions.stringSort = function (propertyToSort, sortDirection) {
            var direction = sortDirection === Interfaces_6.SortDirection.Asc ? 1 : -1;
            return function (left, right) {
                var leftValue = ko.utils.unwrapObservable(left[propertyToSort]);
                var rightValue = ko.utils.unwrapObservable(right[propertyToSort]);
                leftValue = leftValue.toUpperCase();
                rightValue = rightValue.toUpperCase();
                if (leftValue === rightValue) {
                    return 0;
                }
                return leftValue < rightValue ? -direction : direction;
            };
        };
        SortFunctions.hexSort = function (propertyToSort, sortDirection) {
            var direction = sortDirection === Interfaces_6.SortDirection.Asc ? 1 : -1;
            return function (left, right) {
                var leftValue = ko.utils.unwrapObservable(left[propertyToSort]);
                var rightValue = ko.utils.unwrapObservable(right[propertyToSort]);
                if (leftValue.length !== rightValue.length) {
                    return leftValue.length < rightValue.length ? -direction : direction;
                }
                leftValue = leftValue.toUpperCase();
                rightValue = rightValue.toUpperCase();
                if (leftValue === rightValue) {
                    return 0;
                }
                return leftValue < rightValue ? -direction : direction;
            };
        };
        SortFunctions.booleanSort = function (propertyToSort, sortDirection) {
            var direction = sortDirection === Interfaces_6.SortDirection.Asc ? 1 : -1;
            return function (left, right) {
                var leftValue = ko.utils.unwrapObservable(left[propertyToSort]());
                var rightValue = ko.utils.unwrapObservable(right[propertyToSort]());
                if (leftValue === rightValue) {
                    return 0;
                }
                return leftValue ? -direction : direction;
            };
        };
        SortFunctions.numberComparator = function (left, right) {
            return left - right;
        };
        return SortFunctions;
    }());
    exports.SortFunctions = SortFunctions;
});
define("Shared/Charts/PieChart", ["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    function generateArcTweenEnterUpdate(arc) {
        return function (value) {
            var interp = d3.interpolate(this._current, value);
            this._current = interp(0);
            return function (time) {
                return arc(interp(time));
            };
        };
    }
    function generateArcTweenExit(arc) {
        return function (value) {
            var interp = d3.interpolate(this._current, { startAngle: this._current.endAngle, endAngle: this._current.endAngle });
            this._current = interp(0);
            return function (time) {
                return arc(interp(time));
            };
        };
    }
    function onClick(d) {
        if (d.data.invoke) {
            d.data.invoke();
        }
    }
    function onKeyDown(d) {
        if (d.data.invoke && d3.event.keyCode === Microsoft.VisualStudio.DiagnosticsHub.Common.KeyCodes.Enter) {
            d3.event.preventDefault();
            d.data.invoke();
        }
    }
    function showFocusRing(focusRing, pathD) {
        focusRing.classed("show", true);
        focusRing.attr("d", pathD);
    }
    function onBlur(focusRing, svg) {
        if (!document.activeElement) {
            focusRing.classed("show", false);
            return;
        }
        else if (document.activeElement === svg.node()) {
            return;
        }
        var owner = document.activeElement.ownerSVGElement;
        if (!owner || owner !== svg.node()) {
            focusRing.classed("show", false);
        }
    }
    ko.bindingHandlers["pieChart"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var svg = d3.select(element).append("svg")
                .attr("viewBox", "0 0 100 100")
                .attr("preserveAspectRatio", "xMidYMid meet");
            svg.append("g")
                .attr("transform", "translate(50, 50)")
                .attr("class", "canvasBackground");
            svg.append("g")
                .attr("transform", "translate(50, 50)")
                .append("path")
                .attr("class", "focusRing");
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var binding = ko.unwrap(valueAccessor());
            var labelToken = ko.unwrap(binding.localizedLabel);
            var label = labelToken ? Microsoft.Plugin.Resources.getString(labelToken) : ko.unwrap(binding.label);
            var series = ko.unwrap(binding.data);
            var svg = d3.select(element)
                .select("svg")
                .attr("aria-label", label)
                .attr("focusable", series.length > 0);
            var focusRing = svg.select(".focusRing");
            var radius = 100 / 2;
            var arc = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);
            svg.on("focus", function () { return showFocusRing(focusRing, arc({ startAngle: 0, endAngle: 2 * Math.PI })); })
                .on("blur", function () { return onBlur(focusRing, svg); });
            var pie = d3.pie()
                .sort(null)
                .value(function (datum) { return datum.value; });
            var arcs = svg
                .select(".canvasBackground")
                .selectAll(".arc")
                .data(pie(series));
            arcs.enter()
                .append("path")
                .attr("class", "arc")
                .attr("focusable", "true")
                .attr("aria-label", function (d) { return Microsoft.Plugin.Resources.getString("PieChartItemAriaLabel", d.data.value, d.data.label); })
                .attr("data-plugin-vs-tooltip", function (d) { return Microsoft.Plugin.Resources.getString("PieChartItemAriaLabel", d.data.value, d.data.label); })
                .each(function (d) { this._current = { startAngle: d.endAngle, endAngle: d.endAngle }; })
                .on("click", onClick)
                .on("keydown", onKeyDown)
                .on("focus", function (d) { return showFocusRing(focusRing, arc(d)); })
                .on("blur", function () { return onBlur(focusRing, svg); })
                .merge(arcs)
                .transition()
                .duration(650)
                .attrTween("d", generateArcTweenEnterUpdate(arc));
            arcs.exit()
                .transition()
                .duration(650)
                .attrTween("d", generateArcTweenExit(arc))
                .remove();
        }
    };
});
define("template", [], function () {
    "use strict";
    return {
        load: function (name, req, onLoad, config) {
            var template = req(name);
            var decodedTemplate = atob(template);
            var templateElement = document.createElement("script");
            templateElement.id = name;
            templateElement.innerHTML = decodedTemplate;
            templateElement.type = "text/html";
            document.head.appendChild(templateElement);
            onLoad(decodedTemplate);
        }
    };
});
define("CopyDataGridView", [], function () { return "PGRpdiBjbGFzcz0iZGF0YUdyaWRDb250YWluZXIiPg0KICAgIDxkaXYgY2xhc3M9ImRhdGFHcmlkQm9keSI+DQogICAgICAgIDx0YWJsZT4NCiAgICAgICAgICAgIDx0aGVhZCBkYXRhLWJpbmQ9IndpdGg6IGhlYWRlciI+DQogICAgICAgICAgICAgICAgPHRyIHJvbGU9InJvdyIgZGF0YS1iaW5kPSJmb3JlYWNoOiBjb2x1bW5zIj4NCiAgICAgICAgICAgICAgICAgICAgPHRoIHJvbGU9ImNvbHVtbmhlYWRlciIgZGF0YS1iaW5kPSJ0ZXh0OiB0ZXh0Ij48L3RoPg0KICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICA8L3RoZWFkPg0KICAgICAgICAgICAgPHRib2R5IGRhdGEtYmluZD0iZm9yZWFjaDogc2VsZWN0ZWRSb3dzKCkuc29ydChmdW5jdGlvbihsLCByKSB7IHJldHVybiBsIC0gcjsgfSkubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHJvd3MoKVtyXTsgfSkiPg0KICAgICAgICAgICAgICAgIDwhLS0ga28gdGVtcGxhdGU6IHRlbXBsYXRlTmFtZSAtLT4NCiAgICAgICAgICAgICAgICA8IS0tIC9rbyAtLT4NCiAgICAgICAgICAgIDwvdGJvZHk+DQogICAgICAgIDwvdGFibGU+DQogICAgPC9kaXY+DQo8L2Rpdj4="; });
define("DataGridView", [], function () { return "PGRpdiBjbGFzcz0iZGF0YUdyaWRDb250YWluZXIiPg0KICAgIDxkaXYgY2xhc3M9ImRhdGFHcmlkSGVhZGVyIj4NCiAgICAgICAgPHRhYmxlIGRhdGEtYmluZD0id2l0aDogaGVhZGVyIj4NCiAgICAgICAgICAgIDx0aGVhZCBkYXRhLWJpbmQ9InZpc2liaWxpdHlDb250ZXh0TWVudTogdmlzaWJpbGl0eUNvbnRleHRNZW51QmluZGluZyI+DQogICAgICAgICAgICAgICAgPHRyIHJvbGU9InJvdyIgZGF0YS1iaW5kPSJhcnJhbmdlYWJsZUNvbHVtbnM6IGNvbHVtbk9yZGVyLCBmb3JlYWNoOiBjb2x1bW5zLCByZW9yZGVySGVhZGVyQ29sdW1uczogY29sdW1uT3JkZXIiPg0KICAgICAgICAgICAgICAgICAgICA8dGggcm9sZT0iY29sdW1uaGVhZGVyIiBkYXRhLWJpbmQ9Ig0KICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dCwNCiAgICAgICAgICAgICAgICAgICAgICAgIGNzczogaWQsDQogICAgICAgICAgICAgICAgICAgICAgICBhdHRyOiB7ICdkYXRhLWNvbHVtbmlkJzogaWQgfSwNCiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0eXBlb2Ygc29ydGFibGUgIT09ICd1bmRlZmluZWQnID8geyBzb3J0Q29sdW1uSWQ6IGlkLCBjdXJyZW50Q29sdW1uOiAkcGFyZW50LnNvcnRDb2x1bW5JZCwgY3VycmVudERpcmVjdGlvbjogJHBhcmVudC5zb3J0RGlyZWN0aW9uLCBkZWZhdWx0RGlyZWN0aW9uOiBzb3J0YWJsZSB9IDogbnVsbCI+PC90aD4NCiAgICAgICAgICAgICAgICA8L3RyPg0KICAgICAgICAgICAgPC90aGVhZD4NCiAgICAgICAgPC90YWJsZT4NCiAgICA8L2Rpdj4NCiAgICA8ZGl2IGNsYXNzPSJkYXRhR3JpZEJvZHkiIGRhdGEtYmluZD0iZm9jdXNlZFJvdzogeyByb3dzOiByb3dzLCBzZWxlY3RlZDogc2VsZWN0ZWRSb3dzLCBmb2N1c2VkOiBmb2N1c2VkUm93SW5kZXggfSI+DQogICAgICAgIDx0YWJsZSByb2xlPSJncmlkIiBkYXRhLWJpbmQ9ImxvY2FsaXplZEFyaWFMYWJlbDogYXJpYUxhYmVsVG9rZW4iPg0KICAgICAgICAgICAgPHRoZWFkIGRhdGEtYmluZD0id2l0aDogaGVhZGVyIj4NCiAgICAgICAgICAgICAgICA8dHIgcm9sZT0icm93IiBkYXRhLWJpbmQ9ImZvcmVhY2g6IGNvbHVtbnMsIHJlb3JkZXJIZWFkZXJDb2x1bW5zOiBjb2x1bW5PcmRlciI+DQogICAgICAgICAgICAgICAgICAgIDx0aCByb2xlPSJjb2x1bW5oZWFkZXIiIGRhdGEtYmluZD0iDQogICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LCANCiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHI6IHsgJ2RhdGEtY29sdW1uaWQnOiBpZCB9LA0KICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHR5cGVvZiBzb3J0YWJsZSAhPT0gJ3VuZGVmaW5lZCcgPyB7IHNvcnRDb2x1bW5JZDogaWQsIGN1cnJlbnRDb2x1bW46ICRwYXJlbnQuc29ydENvbHVtbklkLCBjdXJyZW50RGlyZWN0aW9uOiAkcGFyZW50LnNvcnREaXJlY3Rpb24sIGRlZmF1bHREaXJlY3Rpb246IHNvcnRhYmxlIH0gOiBudWxsIj48L3RoPg0KICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICA8L3RoZWFkPg0KICAgICAgICAgICAgPHRib2R5IHRhYmluZGV4PSIwIiBhcmlhLXJlYWRvbmx5PSJ0cnVlIiBhcmlhLW11bHRpc2VsZWN0YWJsZT0idHJ1ZSIgZGF0YS1iaW5kPSINCiAgICAgICAgICAgICAgICBsb2NhbGl6ZWRBcmlhTGFiZWw6IGFyaWFMYWJlbFRva2VuLA0KICAgICAgICAgICAgICAgIG11bHRpQ2xpY2s6IHsgY2xpY2s6IG9uQ2xpY2ssIGRibGNsaWNrOiBvbkRibENsaWNrIH0sDQogICAgICAgICAgICAgICAgZXZlbnQ6IHsga2V5ZG93bjogb25LZXlEb3duLCBjb250ZXh0bWVudTogb25Db250ZXh0TWVudSB9LA0KICAgICAgICAgICAgICAgIHZpcnR1YWxpemVkRm9yRWFjaDogeyByb3dzOiByb3dzLCBzY3JvbGxUb3A6IHNjcm9sbFRvcCwgY2xpZW50SGVpZ2h0OiBjbGllbnRIZWlnaHQsIGNvbHVtbk9yZGVyOiBoZWFkZXIuY29sdW1uT3JkZXIgfSI+DQogICAgICAgICAgICA8L3Rib2R5Pg0KICAgICAgICA8L3RhYmxlPg0KICAgIDwvZGl2Pg0KPC9kaXY+"; });
define("CopyTreeGridView", [], function () { return "PGRpdiBjbGFzcz0idHJlZUdyaWRDb250YWluZXIiPg0KICAgIDxkaXYgY2xhc3M9InRyZWVHcmlkQm9keSI+DQogICAgICAgIDx0YWJsZT4NCiAgICAgICAgICAgIDx0aGVhZCBkYXRhLWJpbmQ9IndpdGg6IGhlYWRlciI+DQogICAgICAgICAgICAgICAgPHRyIHJvbGU9InJvdyIgZGF0YS1iaW5kPSJmb3JlYWNoOiBjb2x1bW5zIj4NCiAgICAgICAgICAgICAgICAgICAgPHRoIHJvbGU9ImNvbHVtbmhlYWRlciIgZGF0YS1iaW5kPSJ0ZXh0OiB0ZXh0Ij48L3RoPg0KICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICA8L3RoZWFkPg0KICAgICAgICAgICAgPHRib2R5IGRhdGEtYmluZD0iZm9yZWFjaDogc2VsZWN0ZWRSb3dzKCkuc29ydChmdW5jdGlvbihsLCByKSB7IHJldHVybiBsIC0gcjsgfSkubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHRyZWVBc0FycmF5KClbcl07IH0pIj4NCiAgICAgICAgICAgICAgICA8dHIgY2xhc3M9ImNvcHktbWV0YWRhdGEiPg0KICAgICAgICAgICAgICAgICAgICA8dGQ+PCEtLSBrbyBmb3JlYWNoOiBuZXcgQXJyYXkoZGVwdGgpIC0tPnw8IS0tL2tvLS0+PC90ZD4NCiAgICAgICAgICAgICAgICAgICAgPCEtLSBrbyBpZjogZXhwYW5kZWQgPT09IG51bGwtLT48dGQ+Jm5ic3A7Jm5ic3A7Jm5ic3A7PC90ZD48IS0tIC9rbyAtLT4NCiAgICAgICAgICAgICAgICAgICAgPCEtLSBrbyBpZjogZXhwYW5kZWQgIT09IG51bGwtLT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0ga28gaWY6IGV4cGFuZGVkIC0tPjx0ZD4mbmJzcDsrJm5ic3A7PC90ZD48IS0tIC9rbyAtLT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0ga28gaWZub3Q6IGV4cGFuZGVkIC0tPjx0ZD4mbmJzcDstJm5ic3A7PC90ZD48IS0tIC9rbyAtLT4NCiAgICAgICAgICAgICAgICAgICAgPCEtLSAva28gLS0+DQogICAgICAgICAgICAgICAgPC90cj4NCiAgICAgICAgICAgICAgICA8IS0tIGtvIHRlbXBsYXRlOiB0ZW1wbGF0ZU5hbWUgLS0+DQogICAgICAgICAgICAgICAgPCEtLSAva28gLS0+DQogICAgICAgICAgICA8L3Rib2R5Pg0KICAgICAgICA8L3RhYmxlPg0KICAgIDwvZGl2Pg0KPC9kaXY+"; });
define("TreeGridView", [], function () { return "PGRpdiBjbGFzcz0idHJlZUdyaWRDb250YWluZXIiPg0KICAgIDxkaXYgY2xhc3M9InRyZWVHcmlkSGVhZGVyIj4NCiAgICAgICAgPHRhYmxlIGRhdGEtYmluZD0id2l0aDogaGVhZGVyIj4NCiAgICAgICAgICAgIDx0aGVhZCBkYXRhLWJpbmQ9InZpc2liaWxpdHlDb250ZXh0TWVudTogdmlzaWJpbGl0eUNvbnRleHRNZW51QmluZGluZyI+DQogICAgICAgICAgICAgICAgPHRyIHJvbGU9InJvdyIgZGF0YS1iaW5kPSJhcnJhbmdlYWJsZUNvbHVtbnM6IGNvbHVtbk9yZGVyLCBmb3JlYWNoOiBjb2x1bW5zLCByZW9yZGVySGVhZGVyQ29sdW1uczogY29sdW1uT3JkZXIiPg0KICAgICAgICAgICAgICAgICAgICA8dGggcm9sZT0iY29sdW1uaGVhZGVyIiBkYXRhLWJpbmQ9Ig0KICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dCwNCiAgICAgICAgICAgICAgICAgICAgICAgIGNzczogaWQsDQogICAgICAgICAgICAgICAgICAgICAgICBhdHRyOiB7ICdkYXRhLWNvbHVtbmlkJzogaWQsICdkYXRhLXBsdWdpbi12cy10b29sdGlwJzogdHlwZW9mIHRvb2x0aXAgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHRvb2x0aXAgfSwNCiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0eXBlb2Ygc29ydGFibGUgIT09ICd1bmRlZmluZWQnID8geyBzb3J0Q29sdW1uSWQ6IGlkLCBjdXJyZW50Q29sdW1uOiAkcGFyZW50LnNvcnRDb2x1bW5JZCwgY3VycmVudERpcmVjdGlvbjogJHBhcmVudC5zb3J0RGlyZWN0aW9uLCBkZWZhdWx0RGlyZWN0aW9uOiBzb3J0YWJsZSB9IDogbnVsbCIgPg0KICAgICAgICAgICAgICAgICAgICA8L3RoPg0KICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICA8L3RoZWFkPg0KICAgICAgICA8L3RhYmxlPg0KICAgIDwvZGl2Pg0KICAgIDxkaXYgY2xhc3M9InRyZWVHcmlkQm9keSIgZGF0YS1iaW5kPSJmb2N1c2VkUm93OiB7IHJvd3M6IHRyZWVBc0FycmF5LCBzZWxlY3RlZDogc2VsZWN0ZWRSb3dzLCBmb2N1c2VkOiBmb2N1c2VkUm93SW5kZXggfSI+DQogICAgICAgIDx0YWJsZSByb2xlPSJ0cmVlZ3JpZCIgZGF0YS1iaW5kPSJsb2NhbGl6ZWRBcmlhTGFiZWw6IGFyaWFMYWJlbFRva2VuIj4NCiAgICAgICAgICAgIDx0aGVhZCBkYXRhLWJpbmQ9IndpdGg6IGhlYWRlciI+DQogICAgICAgICAgICAgICAgPHRyIHJvbGU9InJvdyIgZGF0YS1iaW5kPSJmb3JlYWNoOiBjb2x1bW5zLCByZW9yZGVySGVhZGVyQ29sdW1uczogY29sdW1uT3JkZXIiPg0KICAgICAgICAgICAgICAgICAgICA8dGggcm9sZT0iY29sdW1uaGVhZGVyIiBkYXRhLWJpbmQ9Ig0KICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dCwgDQogICAgICAgICAgICAgICAgICAgICAgICBhdHRyOiB7ICdkYXRhLWNvbHVtbmlkJzogaWQgfSwNCiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0eXBlb2Ygc29ydGFibGUgIT09ICd1bmRlZmluZWQnID8geyBzb3J0Q29sdW1uSWQ6IGlkLCBjdXJyZW50Q29sdW1uOiAkcGFyZW50LnNvcnRDb2x1bW5JZCwgY3VycmVudERpcmVjdGlvbjogJHBhcmVudC5zb3J0RGlyZWN0aW9uLCBkZWZhdWx0RGlyZWN0aW9uOiBzb3J0YWJsZSB9IDogbnVsbCI+PC90aD4NCiAgICAgICAgICAgICAgICA8L3RyPg0KICAgICAgICAgICAgPC90aGVhZD4NCiAgICAgICAgICAgIDx0Ym9keSB0YWJpbmRleD0iMCIgYXJpYS1yZWFkb25seT0idHJ1ZSIgYXJpYS1tdWx0aXNlbGVjdGFibGU9InRydWUiIGRhdGEtYmluZD0iDQogICAgICAgICAgICAgICAgbG9jYWxpemVkQXJpYUxhYmVsOiBhcmlhTGFiZWxUb2tlbiwNCiAgICAgICAgICAgICAgICBtdWx0aUNsaWNrOiB7IGNsaWNrOiBvbkNsaWNrLCBkYmxjbGljazogb25EYmxDbGljayB9LA0KICAgICAgICAgICAgICAgIGV2ZW50OiB7IGtleWRvd246IG9uS2V5RG93biwgY29udGV4dG1lbnU6IG9uQ29udGV4dE1lbnUgfSwNCiAgICAgICAgICAgICAgICB2aXJ0dWFsaXplZEZvckVhY2g6IHsgcm93czogdHJlZUFzQXJyYXksIHNjcm9sbFRvcDogc2Nyb2xsVG9wLCBjbGllbnRIZWlnaHQ6IGNsaWVudEhlaWdodCwgY29sdW1uT3JkZXI6IGhlYWRlci5jb2x1bW5PcmRlciB9Ij4NCiAgICAgICAgICAgIDwvdGJvZHk+DQogICAgICAgIDwvdGFibGU+DQogICAgPC9kaXY+DQo8L2Rpdj4="; });
define("SearchControlView", [], function () { return "PGRpdiBjbGFzcz0iY29udGFpbmVyIHNlYXJjaC1jb250YWluZXIiIGRhdGEtYmluZD0iY3NzOiB7IGNvbnRyb2xEaXNhYmxlZDogaXNEaXNhYmxlZCgpLCBjb250cm9sRW5hYmxlZDogIWlzRGlzYWJsZWQoKSB9LCBhdHRyOiB7ICdhcmlhLWRpc2FibGVkJzogaXNEaXNhYmxlZCB9LCB0ZW1wbGF0ZTogeyBhZnRlclJlbmRlcjogb25BZnRlckRvbUluc2VydCB9Ij4NCiAgICA8ZGl2IGNsYXNzPSJzZWFyY2gtY29udHJvbCIgZGF0YS1iaW5kPSJjc3M6IHsgaGFzRm9jdXM6IGhhc0ZvY3VzKCkgfSI+DQogICAgICAgIDxpbnB1dCB0eXBlPSJzZWFyY2giIGRhdGEtYmluZD0iDQogICAgICAgICAgICAgICBkaXNhYmxlOiBpc0Rpc2FibGVkLA0KICAgICAgICAgICAgICAgdGV4dElucHV0OiBzZWFyY2hUZXJtLA0KICAgICAgICAgICAgICAgZm9jdXM6IHNlYXJjaElucHV0SGFzRm9jdXMsDQogICAgICAgICAgICAgICB2YWx1ZVVwZGF0ZTogJ2FmdGVya2V5ZG93bicsDQogICAgICAgICAgICAgICBsb2NhbGl6ZWRQbGFjZWhvbGRlclRleHQ6ICdTZWFyY2hXYXRlcm1hcmsnLA0KICAgICAgICAgICAgICAgZXZlbnQ6IHsga2V5ZG93bjogb25TZWFyY2hCb3hLZXlEb3duLCBjbGljazogY2xvc2VBdXRvQ29tcGxldGVMaXN0cyB9LA0KICAgICAgICAgICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6IGFyaWFMYWJlbCB9IiAvPg0KICAgICAgICA8ZGl2IGNsYXNzPSJzZWFyY2gtc3VibWl0LWJ1dHRvbiIgZGF0YS1iaW5kPSJjbGljazogc2VhcmNoLCBmb2N1czogc2VhcmNoU3VibWl0SGFzRm9jdXMsIGxvY2FsaXplZEFyaWFMYWJlbDogJ1NlYXJjaEljb25BcmlhTGFiZWwnLCBzdmdJbWFnZTogJ2RpYWdub3N0aWNzSHViLXNlYXJjaCciPjwvZGl2Pg0KICAgICAgICA8ZGl2IGlkPSJzZWFyY2gtb3B0aW9ucy1idXR0b24iIGNsYXNzPSJkcm9wZG93bi1idXR0b24iIGRhdGEtYmluZD0iY2xpY2s6IG9uRHJvcERvd25DbGljayI+PC9kaXY+DQogICAgPC9kaXY+DQogICAgPGRpdiBpZD0ic2VhcmNoT3B0aW9uc0ZseW91dCIgZGF0YS1iaW5kPSJjc3M6IHsgZmx5b3V0QWN0aXZlOiBzaG93U2V0dGluZ3MoKSB9LCBldmVudDogeyBrZXlkb3duOiBvbkZseW91dEtleURvd24gfSI+DQogICAgICAgIDxzcGFuIGNsYXNzPSJmbHlvdXRIZWFkZXIiIGRhdGEtYmluZD0ibG9jYWxpemVkVGV4dDogJ1NlYXJjaE9wdGlvbnNUaXRsZSciPjwvc3Bhbj4NCiAgICAgICAgPGxhYmVsIGNsYXNzPSJyZWdFeFNldHRpbmciIGRhdGEtYmluZD0iDQogICAgICAgICAgICBjc3M6IHsgaGFzRm9jdXM6IGlzUmVndWxhckV4cHJlc3Npb25IYXNGb2N1cygpIH0sDQogICAgICAgICAgICBldmVudDogeyBtb3VzZWVudGVyOiBmdW5jdGlvbih2aWV3TW9kZWwpIHsgdmlld01vZGVsLmlzUmVndWxhckV4cHJlc3Npb25IYXNGb2N1cyh0cnVlKTsgfSB9Ij4NCiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJjaGVja2JveCINCiAgICAgICAgICAgICAgICAgICBkYXRhLWJpbmQ9ImNoZWNrZWQ6IGlzUmVndWxhckV4cHJlc3Npb24sIGZvY3VzOiBpc1JlZ3VsYXJFeHByZXNzaW9uSGFzRm9jdXMsDQogICAgICAgICAgICAgICAgICAgIGxvY2FsaXplZEFyaWFMYWJlbDogJ1NlYXJjaFJlZ3VsYXJFeHByZXNzaW9uJywNCiAgICAgICAgICAgICAgICAgICAgYXR0cjogeyAnYXJpYS1jaGVja2VkJzogaXNSZWd1bGFyRXhwcmVzc2lvbigpIH0iIC8+DQogICAgICAgICAgICA8c3BhbiBjbGFzcz0iY2hlY2tib3hMYWJlbCIgZGF0YS1iaW5kPSJsb2NhbGl6ZWRUZXh0OiAnU2VhcmNoUmVndWxhckV4cHJlc3Npb24nIj48L3NwYW4+DQogICAgICAgIDwvbGFiZWw+DQogICAgICAgIDxsYWJlbCBjbGFzcz0iY2FzZVNlbnNpdGl2ZVNldHRpbmciIGRhdGEtYmluZD0iDQogICAgICAgICAgICBjc3M6IHsgaGFzRm9jdXM6IGlzQ2FzZVNlbnNpdGl2ZUhhc0ZvY3VzKCkgfSwNCiAgICAgICAgICAgIGV2ZW50OiB7IG1vdXNlZW50ZXI6IGZ1bmN0aW9uKHZpZXdNb2RlbCkgeyB2aWV3TW9kZWwuaXNDYXNlU2Vuc2l0aXZlSGFzRm9jdXModHJ1ZSk7IH0gfSI+DQogICAgICAgICAgICA8aW5wdXQgdHlwZT0iY2hlY2tib3giDQogICAgICAgICAgICAgICAgICAgZGF0YS1iaW5kPSJjaGVja2VkOiBpc0Nhc2VTZW5zaXRpdmUsIGZvY3VzOiBpc0Nhc2VTZW5zaXRpdmVIYXNGb2N1cywNCiAgICAgICAgICAgICAgICAgICAgbG9jYWxpemVkQXJpYUxhYmVsOiAnU2VhcmNoQ2FzZVNlbnNpdGl2ZScsDQogICAgICAgICAgICAgICAgICAgIGF0dHI6IHsgJ2FyaWEtY2hlY2tlZCc6IGlzQ2FzZVNlbnNpdGl2ZSgpIH0iIC8+DQogICAgICAgICAgICA8c3BhbiBjbGFzcz0iY2hlY2tib3hMYWJlbCIgZGF0YS1iaW5kPSJsb2NhbGl6ZWRUZXh0OiAnU2VhcmNoQ2FzZVNlbnNpdGl2ZSciPjwvc3Bhbj4NCiAgICAgICAgPC9sYWJlbD4NCiAgICA8L2Rpdj4NCiAgICA8IS0tIGtvIGlmOiBpc0F1dG9jb21wbGV0ZUVuYWJsZWQgLS0+DQogICAgPCEtLSBrbyB0ZW1wbGF0ZTogeyBuYW1lOiAnQXV0b0NvbXBsZXRlVmlldycsIGRhdGE6IGF1dG9Db21wbGV0ZVZpZXdNb2RlbCB9IC0tPjwhLS0gL2tvIC0tPg0KICAgIDwhLS0gL2tvIC0tPg0KPC9kaXY+"; });
define("AutoCompleteView", [], function () { return "PGRpdiBjbGFzcz0iY29udGFpbmVyIGF1dG9jb21wbGV0ZS1jb250YWluZXIiIGRhdGEtYmluZD0idGVtcGxhdGU6IHsgYWZ0ZXJSZW5kZXI6IG9uQWZ0ZXJEb21JbnNlcnQgfSI+DQogICAgPCEtLSBrbyBpZjogIWRpc21pc3NJbnB1dCAtLT4NCiAgICA8aW5wdXQgY2xhc3M9ImZpbHRlciIgdHlwZT0idGV4dCIgZGF0YS1iaW5kPSINCiAgICAgICAgICAgdGV4dElucHV0OiBmaWx0ZXJUZXh0LA0KICAgICAgICAgICB2YWx1ZVVwZGF0ZTogJ2FmdGVya2V5ZG93bicsDQogICAgICAgICAgIGxvY2FsaXplZFBsYWNlaG9sZGVyVGV4dDogJ0ZpbHRlcldhdGVybWFyaycsDQogICAgICAgICAgIGxvY2FsaXplZEFyaWFMYWJlbDogJ0ZpbHRlckFyaWFMYWJlbCcsDQogICAgICAgICAgIGV2ZW50OiB7a2V5ZG93bjogb25LZXlEb3duLCBjbGljazogY2xvc2VBdXRvQ29tcGxldGVMaXN0c30iIC8+DQogICAgPCEtLSAva28gLS0+DQogICAgPHVsIGNsYXNzPSJhdXRvY29tcGxldGUtbGlzdCIgdGFiaW5kZXg9IjAiIGRhdGEtYmluZD0iY3NzOiB7IGF1dG9Db21wbGV0ZVZpc2libGU6IGF1dG9Db21wbGV0ZUxpc3RzKCkubGVuZ3RoID4gMCB9LCBsb2NhbGl6ZWRBcmlhTGFiZWw6ICdBdXRvQ29tcGxldGVMaXN0cyciPg0KICAgICAgICA8IS0tIGtvIGZvcmVhY2g6IGF1dG9Db21wbGV0ZUxpc3RzIC0tPg0KICAgICAgICA8bGkgaWQ9ImF1dG9jb21wbGV0ZS1pdGVtIiB0YWJpbmRleD0iMCIgZGF0YS1iaW5kPSINCiAgICAgICAgICAgICAgaHRtbDogYXV0b0NvbXBsZXRlSXRlbSwNCiAgICAgICAgICAgICAgY3NzOiB7aGFzRm9jdXM6IGhhc0ZvY3VzKCl9LA0KICAgICAgICAgICAgICBmb2N1czogaGFzRm9jdXMsDQogICAgICAgICAgICAgIGF0dHI6IHsnYXJpYS1sYWJlbCc6IGF1dG9Db21wbGV0ZUl0ZW0sICdkYXRhLXBsdWdpbi12cy10b29sdGlwJzogYXV0b0NvbXBsZXRlSXRlbVRvb2x0aXAgfSwNCiAgICAgICAgICAgICAgZXZlbnQ6IHsNCiAgICAgICAgICAgICAgICBtb3VzZWVudGVyOiBmdW5jdGlvbih2aWV3TW9kZWwpIHsgdmlld01vZGVsLmhhc0ZvY3VzKHRydWUpOyB9LA0KICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBmdW5jdGlvbih2aWV3TW9kZWwpIHt2aWV3TW9kZWwuaGFzRm9jdXMoZmFsc2UpOyB9LA0KICAgICAgICAgICAgICAgIGNsaWNrOiBzZWxlY3RJdGVtLA0KICAgICAgICAgICAgICAgIGtleWRvd246ICRwYXJlbnQub25LZXlEb3duLmJpbmQoJHBhcmVudCkNCiAgICAgICAgICAgICAgfSI+DQogICAgICAgIDwvbGk+DQogICAgICAgIDwhLS0gL2tvIC0tPg0KICAgIDwvdWw+DQo8L2Rpdj4="; });
define("ToolbarButtonView", [], function () { return "PGJ1dHRvbiBjbGFzcz0idG9vbGJhci1idXR0b24iIGRhdGEtYmluZD0ibG9jYWxpemVkQXJpYUxhYmVsOiBhcmlhTGFiZWwsDQogICAgbG9jYWxpemVkVG9vbHRpcDogYXJpYUxhYmVsLA0KICAgIGNsaWNrOiBjYWxsYmFjaywNCiAgICBvbkVudGVyOiBjYWxsYmFjaywNCiAgICBjc3M6IHsgZW5hYmxlZDogaXNFbmFibGVkIH0iPg0KICAgIDwhLS0ga28gaWY6IHN2Z0ljb24gLS0+DQogICAgPGRpdiBjbGFzcz0iaWNvbiIgZGF0YS1iaW5kPSJzdmdJbWFnZTogc3ZnSWNvbiI+PC9kaXY+DQogICAgPCEtLSAva28gLS0+DQogICAgPGRpdiBkYXRhLWJpbmQ9ImxvY2FsaXplZFRleHQ6IGJ1dHRvblRleHQiPjwvZGl2Pg0KPC9idXR0b24+"; });
define("ToggleButtonView", [], function () { return "PGJ1dHRvbiBjbGFzcz0idG9nZ2xlQnV0dG9uIHRvb2xiYXItYnV0dG9uIiBkYXRhLWJpbmQ9ImxvY2FsaXplZEFyaWFMYWJlbDogYXJpYUxhYmVsLA0KICAgIGxvY2FsaXplZFRvb2x0aXA6IGFyaWFMYWJlbCwNCiAgICBjbGljazogb25DbGljaywNCiAgICBvbkVudGVyOiBvbkNsaWNrLA0KICAgIGNzczogeyBjaGVja2VkOiBpc0NoZWNrZWQsIGVuYWJsZWQ6IGlzRW5hYmxlZCB9LA0KICAgIGF0dHI6IHsgJ2FyaWEtcHJlc3NlZCc6IGlzQ2hlY2tlZCwgJ2FyaWEtZGlzYWJsZWQnOiAhaXNFbmFibGVkKCkgfSI+DQogICAgPCEtLSBrbyBpZjogc3ZnSWNvbiAtLT4NCiAgICA8ZGl2IGNsYXNzPSJidXR0b24taW1hZ2UgaWNvbiIgZGF0YS1iaW5kPSJzdmdJbWFnZTogc3ZnSWNvbiI+PC9kaXY+DQogICAgPCEtLSAva28gLS0+DQogICAgPGRpdiBjbGFzcz0iYnV0dG9uLXRleHQiIGRhdGEtYmluZD0ibG9jYWxpemVkVGV4dDogYnV0dG9uVGV4dCI+PC9kaXY+DQo8L2J1dHRvbj4="; });
//# sourceMappingURL=Shared.js.map
// SIG // Begin signature block
// SIG // MIIjhAYJKoZIhvcNAQcCoIIjdTCCI3ECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4mdmY6EfFEZPJ5Aqnw9ldT3H1ltGQOBtnoHDH+BCfJyg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCFVsw
// SIG // ghVXAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAHfa/AukqdKtNAAAAAAAd8wDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIAAEgDO7aRmS1w9UbxA7
// SIG // f0MMfWN39o42QMz2Pp7FWufVMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAZbcgXTVV+rpzKRSIm1s2gWh2ffM8UARXnTpx
// SIG // /FBWPJgPO8IY6khnZNgLqL+SM60bZlgXjZlBjvLfCzeM
// SIG // gGSg9RGAx4ZaWL38XYyvZ3EaNRFl/rlc9J4ItPHu98bR
// SIG // SyKOwQUwdOPAf9E1UDGOIvncSP4035uB83B8cJgxzfLI
// SIG // d19FCDPfy6LlVDKtCbSeOA1M1KQophnDi6IXdn+OiXzT
// SIG // umzvsilMNkdlQGbdB7jeifGfwvReQ9sI48YOrQr8e+Ea
// SIG // Jpi+XhmkX//YY9wvocxcSdMp8DxCPG+9hzCf/ySiB650
// SIG // T2nKBpPjYONA+/0ep4HqWcD080KkRm1sNvJd8mcFbaGC
// SIG // EuUwghLhBgorBgEEAYI3AwMBMYIS0TCCEs0GCSqGSIb3
// SIG // DQEHAqCCEr4wghK6AgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFRBgsqhkiG9w0BCRABBKCCAUAEggE8MIIBOAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCCK1bcv
// SIG // MiSnAXG86rMfgLDaZ5FdTPGjaaKqzd0qJOI8QgIGYK6W
// SIG // /CXmGBMyMDIxMDYwMjE3MzA0MC4wNDZaMASAAgH0oIHQ
// SIG // pIHNMIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQL
// SIG // ExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25zMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpENkJELUUzRTct
// SIG // MTY4NTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaCCDjwwggTxMIID2aADAgECAhMzAAAB
// SIG // UFii1KebCzDrAAAAAAFQMA0GCSqGSIb3DQEBCwUAMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIwMTEx
// SIG // MjE4MjYwM1oXDTIyMDIxMTE4MjYwM1owgcoxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBB
// SIG // bWVyaWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxl
// SIG // cyBUU1MgRVNOOkQ2QkQtRTNFNy0xNjg1MSUwIwYDVQQD
// SIG // ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIIB
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA53p/
// SIG // lHsqWcMnG1aaDfMzUgKp2ZeNPkY0U8de4LD71WDcbz3u
// SIG // j867kvyeV9pjjegUbfl2iQEySb5AoB71Yiaq1O0N/U9K
// SIG // k39Nnzk085AUdc4QdooS910mhKURPy9sEmu74C/I4TxY
// SIG // tHWfJ56nI/em1S2kbz7OwDV3gxd8aWTYFEii9hHoAXJk
// SIG // VLHvvdrlpPzWLI/GNxAr9qj50gjREqnUPeyUuCt0eT8x
// SIG // 0ghtsWL0US6fm/dBVSNiQkK9SAI/dlDZHtsCh20LOVXc
// SIG // iRPv74IOrcmXWsVuwFaIyKuSnHzN/kGoTSqbHTh5t+yM
// SIG // GJg9S307G9LVYVy424e6OE+nAiolmwIDAQABo4IBGzCC
// SIG // ARcwHQYDVR0OBBYEFIJVGR8ZRdutZC9DwQBDO7frn0V+
// SIG // MB8GA1UdIwQYMBaAFNVjOlyKMZDzQ3t8RhvFM2hahW1V
// SIG // MFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Rp
// SIG // bVN0YVBDQV8yMDEwLTA3LTAxLmNybDBaBggrBgEFBQcB
// SIG // AQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY2VydHMvTWljVGltU3RhUENB
// SIG // XzIwMTAtMDctMDEuY3J0MAwGA1UdEwEB/wQCMAAwEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQAD
// SIG // ggEBAFE/aHRyjv7j49PAHi+T9h4sTDqhyt6D5PSQHZpY
// SIG // H9l7fMRe2PQR4hUDVmDCnfxyNq8mDrt0gALN7cWWkaWp
// SIG // b2NEdelliEMwvRvaKkg+0DTdETMbIogjDOuf56vcUjyK
// SIG // 5mIemk1xYCDLoeBizZO4DEBcm1G4NmZS2bJ/a+Uc8V/8
// SIG // fGite4IBFipooo9ZYG/+gBPmwD1LhMsudLmulPWbNPm4
// SIG // vPx752bOj4jMBobV8/7Ea2WgGI2y72glzpPg20bxwaGB
// SIG // 0EJt+UKz1CH4jXMN9IIiDEcu8WB44ppfyMWpDBVCeepi
// SIG // xN0r520hsWisKaT5ZCLMOR4XpnUhh7OUpa0E214wggZx
// SIG // MIIEWaADAgECAgphCYEqAAAAAAACMA0GCSqGSIb3DQEB
// SIG // CwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQD
// SIG // EylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRo
// SIG // b3JpdHkgMjAxMDAeFw0xMDA3MDEyMTM2NTVaFw0yNTA3
// SIG // MDEyMTQ2NTVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
// SIG // AQEAqR0NvHcRijog7PwTl/X6f2mUa3RUENWlCgCChfvt
// SIG // fGhLLF/Fw+Vhwna3PmYrW/AVUycEMR9BGxqVHc4JE458
// SIG // YTBZsTBED/FgiIRUQwzXTbg4CLNC3ZOs1nMwVyaCo0UN
// SIG // 0Or1R4HNvyRgMlhgRvJYR4YyhB50YWeRX4FUsc+TTJLB
// SIG // xKZd0WETbijGGvmGgLvfYfxGwScdJGcSchohiq9LZIlQ
// SIG // YrFd/XcfPfBXday9ikJNQFHRD5wGPmd/9WbAA5ZEfu/Q
// SIG // S/1u5ZrKsajyeioKMfDaTgaRtogINeh4HLDpmc085y9E
// SIG // uqf03GS9pAHBIAmTeM38vMDJRF1eFpwBBU8iTQIDAQAB
// SIG // o4IB5jCCAeIwEAYJKwYBBAGCNxUBBAMCAQAwHQYDVR0O
// SIG // BBYEFNVjOlyKMZDzQ3t8RhvFM2hahW1VMBkGCSsGAQQB
// SIG // gjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAP
// SIG // BgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP
// SIG // 6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0wS6BJoEeG
// SIG // RWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3Js
// SIG // L3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIz
// SIG // LmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKG
// SIG // Pmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2Vy
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MIGg
// SIG // BgNVHSABAf8EgZUwgZIwgY8GCSsGAQQBgjcuAzCBgTA9
// SIG // BggrBgEFBQcCARYxaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL1BLSS9kb2NzL0NQUy9kZWZhdWx0Lmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBQAG8AbABp
// SIG // AGMAeQBfAFMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAB+aIUQ3ixuCYP4FxAz2do6Eh
// SIG // b7Prpsz1Mb7PBeKp/vpXbRkws8LFZslq3/Xn8Hi9x6ie
// SIG // JeP5vO1rVFcIK1GCRBL7uVOMzPRgEop2zEBAQZvcXBf/
// SIG // XPleFzWYJFZLdO9CEMivv3/Gf/I3fVo/HPKZeUqRUgCv
// SIG // OA8X9S95gWXZqbVr5MfO9sp6AG9LMEQkIjzP7QOllo9Z
// SIG // Kby2/QThcJ8ySif9Va8v/rbljjO7Yl+a21dA6fHOmWaQ
// SIG // jP9qYn/dxUoLkSbiOewZSnFjnXshbcOco6I8+n99lmqQ
// SIG // eKZt0uGc+R38ONiU9MalCpaGpL2eGq4EQoO4tYCbIjgg
// SIG // tSXlZOz39L9+Y1klD3ouOVd2onGqBooPiRa6YacRy5rY
// SIG // DkeagMXQzafQ732D8OE7cQnfXXSYIghh2rBQHm+98eEA
// SIG // 3+cxB6STOvdlR3jo+KhIq/fecn5ha293qYHLpwmsObvs
// SIG // xsvYgrRyzR30uIUBHoD7G4kqVDmyW9rIDVWZeodzOwjm
// SIG // mC3qjeAzLhIp9cAvVCch98isTtoouLGp25ayp0Kiyc8Z
// SIG // QU3ghvkqmqMRZjDTu3QyS99je/WZii8bxyGvWbWu3EQ8
// SIG // l1Bx16HSxVXjad5XwdHeMMD9zOZN+w2/XU/pnR4ZOC+8
// SIG // z1gFLu8NoFA12u8JJxzVs341Hgi62jbb01+P3nSISRKh
// SIG // ggLOMIICNwIBATCB+KGB0KSBzTCByjELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJp
// SIG // Y2EgT3BlcmF0aW9uczEmMCQGA1UECxMdVGhhbGVzIFRT
// SIG // UyBFU046RDZCRC1FM0U3LTE2ODUxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVACMNe59y8TVrRhGbWpZZpDGWHqASoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDkYacDMCIYDzIwMjEwNjAy
// SIG // MTQ0MzE1WhgPMjAyMTA2MDMxNDQzMTVaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAORhpwMCAQAwCgIBAAICJa8C
// SIG // Af8wBwIBAAICEgswCgIFAORi+IMCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQAI
// SIG // ZTBb9jseHy5UBXQI4Bn+Yyf2ZOWAG2u5fULUHybi+cyy
// SIG // EOuZa9HmboKML/qkDcn5p6p9eROXKmjTjrbPii1ycyx4
// SIG // pUxeCRzAtSypVX8aGdovCSTTsoUHl22xriwfV+9EGiQa
// SIG // BM/XGH0Fjcn0MS1MNFS4MqjXDc0s6S3YxaWhRzGCAw0w
// SIG // ggMJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABUFii1KebCzDrAAAAAAFQMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIDITENHFI4Resebp
// SIG // 52CutgeJ8rY0+WO8rMCZHzI2oaY7MIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgbPQ+ny+awk4YFyZhiIXV
// SIG // 0uiGNWYOqKeO3ZCifC/yo/YwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAVBYotSnmwsw
// SIG // 6wAAAAABUDAiBCCNTzKEf0GSZ3+mH+LP5NI1OvudNzAP
// SIG // ZtIhKYmEX8mUJDANBgkqhkiG9w0BAQsFAASCAQANdMmQ
// SIG // Bkj8EUE5PPlUBsEj+ameZK1Qlae6KE7YFiqsUMmFGmVJ
// SIG // huxeExMKfmqv3D1CbVTdTrNRW+va2lSrdhJf48peXPCE
// SIG // pco5E/iFjotnJSWgN2VlaOHniaOLNNMwsqgzW05/vsD8
// SIG // X2CATWOAXKabZPSu8bFWvAXSIZrqH+61Du8GaWMttDeg
// SIG // GkNX32yqET7WFVcx2/EzJwqtH4Kqul8SKGFCkmWVsuyV
// SIG // ulZZuXBlexSNqqVHWMvLW0FrNinArShX5mjEMipIXRWA
// SIG // losa2jskqO5fTId61xHRvkpxA0zLL98Y7cPA0rfC/J0J
// SIG // BwaxDB9SC2fQkh0foI1qrPs6oNx5
// SIG // End signature block
