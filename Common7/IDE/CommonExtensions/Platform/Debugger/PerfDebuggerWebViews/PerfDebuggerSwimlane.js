var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var PortMarshallerConstants = (function () {
            function PortMarshallerConstants() {
            }
            PortMarshallerConstants.PortMarshallerName = "PerformanceDebugger.DiagnosticEventsPortMarshaller";
            PortMarshallerConstants.SwimlaneDataChangedEvent = "SwimlaneDataChangedEvent";
            PortMarshallerConstants.TabularViewSelectionChangedEvent = "TabularViewSelectionChangedEvent";
            PortMarshallerConstants.DebugModeChangedEvent = "DebugModeChangedEvent";
            PortMarshallerConstants.ActivatedDataChangedEvent = "ActivatedDataChangedEvent";
            PortMarshallerConstants.FocusOnLastBreakEvent = "FocusOnLastBreakEvent";
            PortMarshallerConstants.NotifySelectionTimeRangeChanged = "NotifySelectionTimeRangeChanged";
            PortMarshallerConstants.NotifyViewPortChanged = "NotifyViewPortChanged";
            PortMarshallerConstants.NotifyClientSizeChanged = "NotifyClientSizeChanged";
            PortMarshallerConstants.NotifySwimlaneIsVisibleChanged = "NotifySwimlaneIsVisibleChanged";
            PortMarshallerConstants.NotifySwimlaneDataSelectionChanged = "NotifySwimlaneDataSelectionChanged";
            PortMarshallerConstants.NotifyReadyForData = "NotifyReadyForData";
            PortMarshallerConstants.NotifyQueryPreviousBreakEvent = "NotifyQueryPreviousBreakEvent";
            PortMarshallerConstants.NotifyQueryNextBreakEvent = "NotifyQueryNextBreakEvent";
            PortMarshallerConstants.NotifyViewableViewportBase = "NotifyViewableViewportBase";
            PortMarshallerConstants.SwimlaneAcknowledgeData = "SwimlaneAcknowledgeData";
            PortMarshallerConstants.TrackConfigurations = "TrackConfigurations";
            PortMarshallerConstants.EventKinds = "EventKinds";
            PortMarshallerConstants.BreakEventKindName = "Break";
            PortMarshallerConstants.IntelliTraceEventKindName = "IntelliTrace";
            PortMarshallerConstants.InvalidEventKindId = 0;
            PortMarshallerConstants.InvalidTimeValue = -1;
            PortMarshallerConstants.InvalidDiagnosticDataId = 0;
            return PortMarshallerConstants;
        }());
        DiagnosticsHub.PortMarshallerConstants = PortMarshallerConstants;
        (function (BreakEventType) {
            BreakEventType[BreakEventType["None"] = 0] = "None";
            BreakEventType[BreakEventType["AsyncBreak"] = 1] = "AsyncBreak";
            BreakEventType[BreakEventType["Breakpoint"] = 2] = "Breakpoint";
            BreakEventType[BreakEventType["Exception"] = 3] = "Exception";
            BreakEventType[BreakEventType["StepComplete"] = 4] = "StepComplete";
            BreakEventType[BreakEventType["ExceptionIntercepted"] = 5] = "ExceptionIntercepted";
            BreakEventType[BreakEventType["EntryPoint"] = 6] = "EntryPoint";
        })(DiagnosticsHub.BreakEventType || (DiagnosticsHub.BreakEventType = {}));
        var BreakEventType = DiagnosticsHub.BreakEventType;
        (function (EventColor) {
            EventColor[EventColor["None"] = 0] = "None";
            EventColor[EventColor["ExceptionColor"] = 1] = "ExceptionColor";
            EventColor[EventColor["UnimportantColor"] = 2] = "UnimportantColor";
            EventColor[EventColor["TracepointColor"] = 3] = "TracepointColor";
        })(DiagnosticsHub.EventColor || (DiagnosticsHub.EventColor = {}));
        var EventColor = DiagnosticsHub.EventColor;
        (function (SwimlaneDataChangedAction) {
            SwimlaneDataChangedAction[SwimlaneDataChangedAction["Clear"] = 0] = "Clear";
            SwimlaneDataChangedAction[SwimlaneDataChangedAction["Reset"] = 1] = "Reset";
            SwimlaneDataChangedAction[SwimlaneDataChangedAction["Add"] = 2] = "Add";
        })(DiagnosticsHub.SwimlaneDataChangedAction || (DiagnosticsHub.SwimlaneDataChangedAction = {}));
        var SwimlaneDataChangedAction = DiagnosticsHub.SwimlaneDataChangedAction;
        (function (DebugMode) {
            DebugMode[DebugMode["None"] = 0] = "None";
            DebugMode[DebugMode["Break"] = 1] = "Break";
            DebugMode[DebugMode["Design"] = 2] = "Design";
            DebugMode[DebugMode["Run"] = 3] = "Run";
        })(DiagnosticsHub.DebugMode || (DiagnosticsHub.DebugMode = {}));
        var DebugMode = DiagnosticsHub.DebugMode;
        (function (SnapshotStatus) {
            SnapshotStatus[SnapshotStatus["Unknown"] = 0] = "Unknown";
            SnapshotStatus[SnapshotStatus["None"] = 1] = "None";
            SnapshotStatus[SnapshotStatus["Removed"] = 2] = "Removed";
            SnapshotStatus[SnapshotStatus["Present"] = 3] = "Present";
        })(DiagnosticsHub.SnapshotStatus || (DiagnosticsHub.SnapshotStatus = {}));
        var SnapshotStatus = DiagnosticsHub.SnapshotStatus;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var IntelliTraceGraphConfiguration = (function () {
            function IntelliTraceGraphConfiguration(graphConfig) {
                this._allTrackConfigurations = null;
                this._eventKindNameToId = null;
                this._eventKindIdToName = null;
                if (!graphConfig) {
                    return;
                }
                this._allTrackConfigurations = graphConfig[DiagnosticsHub.PortMarshallerConstants.TrackConfigurations];
                var eventKindNameToId = {};
                var eventKindIdToName = {};
                graphConfig[DiagnosticsHub.PortMarshallerConstants.EventKinds].forEach(function (pair) {
                    eventKindNameToId[pair.Key] = pair.Value;
                    eventKindIdToName[pair.Value] = pair.Key;
                });
                this._eventKindNameToId = eventKindNameToId;
                this._eventKindIdToName = eventKindIdToName;
            }
            Object.defineProperty(IntelliTraceGraphConfiguration.prototype, "trackConfigurations", {
                get: function () {
                    return this._allTrackConfigurations;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IntelliTraceGraphConfiguration.prototype, "eventKindNameToId", {
                get: function () {
                    return this._eventKindNameToId;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IntelliTraceGraphConfiguration.prototype, "eventKindIdToName", {
                get: function () {
                    return this._eventKindIdToName;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IntelliTraceGraphConfiguration.prototype, "enabledTrackCount", {
                get: function () {
                    return this._allTrackConfigurations.length;
                },
                enumerable: true,
                configurable: true
            });
            return IntelliTraceGraphConfiguration;
        }());
        DiagnosticsHub.IntelliTraceGraphConfiguration = IntelliTraceGraphConfiguration;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var TelemetryServiceMarshallerConstants = (function () {
            function TelemetryServiceMarshallerConstants() {
            }
            TelemetryServiceMarshallerConstants.PortMarshallerName = "PerformanceDebugger.DebuggerEventsTelemetryPortMarshaller";
            TelemetryServiceMarshallerConstants.SelectDiagnosticEvent = "Telemetry.SelectDiagnosticEvent";
            TelemetryServiceMarshallerConstants.HoverDiagnosticEvent = "Telemetry.HoverDiagnosticEvent";
            TelemetryServiceMarshallerConstants.DefaultHoverEventDelay = 500;
            return TelemetryServiceMarshallerConstants;
        }());
        DiagnosticsHub.TelemetryServiceMarshallerConstants = TelemetryServiceMarshallerConstants;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var TelemetryService = (function () {
            function TelemetryService() {
            }
            TelemetryService.onSelectDiagnosticEvent = function (telemetryType, isSelected, snapshotStatus) {
                this._adapter._call(DiagnosticsHub.TelemetryServiceMarshallerConstants.SelectDiagnosticEvent, telemetryType, isSelected, snapshotStatus);
            };
            TelemetryService.onHoverDiagnosticEvent = function (telemetryType) {
                this._adapter._call(DiagnosticsHub.TelemetryServiceMarshallerConstants.HoverDiagnosticEvent, telemetryType);
            };
            TelemetryService._adapter = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject(DiagnosticsHub.TelemetryServiceMarshallerConstants.PortMarshallerName, {}, true);
            return TelemetryService;
        }());
        DiagnosticsHub.TelemetryService = TelemetryService;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        var Diagnostics;
        (function (Diagnostics) {
            "use strict";
            var Assert = (function () {
                function Assert() {
                }
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
                    var error = new Error((message || "Assert failed.") + "\n");
                    try {
                        throw error;
                    }
                    catch (ex) {
                        throw ex;
                    }
                };
                return Assert;
            }());
            Diagnostics.Assert = Assert;
        })(Diagnostics = Common.Diagnostics || (Common.Diagnostics = {}));
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var DiagHub = Microsoft.VisualStudio.DiagnosticsHub;
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var SwimlaneTimeRange = (function () {
            function SwimlaneTimeRange(viewportController) {
                this._viewportController = null;
                this._viewportController = viewportController;
            }
            Object.defineProperty(SwimlaneTimeRange.prototype, "beginInHubTime", {
                get: function () {
                    return this._viewportController.visible.begin;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneTimeRange.prototype, "endInHubTime", {
                get: function () {
                    return this._viewportController.visible.end;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneTimeRange.prototype, "durationInHubTime", {
                get: function () {
                    return this._viewportController.visible.elapsed;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneTimeRange.prototype, "begin", {
                get: function () {
                    return SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this.beginInHubTime);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneTimeRange.prototype, "end", {
                get: function () {
                    return SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this.endInHubTime);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneTimeRange.prototype, "duration", {
                get: function () {
                    return SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this.durationInHubTime);
                },
                enumerable: true,
                configurable: true
            });
            SwimlaneTimeRange.prototype.contains = function (time) {
                return (this.begin <= time) && (time <= this.end);
            };
            SwimlaneTimeRange.prototype.isOverlap = function (beginTime, endTime) {
                if (beginTime < endTime) {
                    return Math.min(this.end, endTime) - Math.max(this.begin, beginTime) > 0;
                }
                else if (beginTime === endTime) {
                    return this.contains(beginTime);
                }
                else {
                    return false;
                }
            };
            SwimlaneTimeRange.prototype.equals = function (other) {
                return (this.begin == other.begin) && (this.end == other.end);
            };
            SwimlaneTimeRange.prototype.isValid = function () {
                return (this.begin >= 0) && (this.end > this.begin);
            };
            SwimlaneTimeRange.unsafeConvertBigNumberToNumber = function (bigNumber) {
                return parseInt(bigNumber.value);
            };
            return SwimlaneTimeRange;
        }());
        DiagnosticsHub.SwimlaneTimeRange = SwimlaneTimeRange;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var SwimlaneViewport = (function () {
            function SwimlaneViewport(viewportController) {
                this.timeRange = null;
                this.clientWidth = 0;
                this._isVisible = true;
                this._oldViewableBase = DiagHub.BigNumber.zero;
                this._viewEventManager = null;
                this._viewportController = null;
                this._viewEventManager = DiagHub.getViewEventManager();
                this._viewportController = viewportController;
                this.timeRange = new DiagnosticsHub.SwimlaneTimeRange(this._viewportController);
            }
            Object.defineProperty(SwimlaneViewport.prototype, "viewableBase", {
                get: function () {
                    return this._viewportController.viewable.begin;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneViewport.prototype, "viewableEnd", {
                get: function () {
                    return this._viewportController.viewable.end;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneViewport.prototype, "isVisible", {
                get: function () {
                    return this._isVisible;
                },
                set: function (value) {
                    this._isVisible = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneViewport.prototype, "pixelsPerNanosecond", {
                get: function () {
                    if (!this.isVisible) {
                        return 0;
                    }
                    return this.clientWidth / (this.timeRange.duration);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneViewport.prototype, "nanosecondsPerPixel", {
                get: function () {
                    if (!this.isVisible) {
                        return 0;
                    }
                    return (this.timeRange.duration) / this.clientWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SwimlaneViewport.prototype, "viewEventManager", {
                get: function () {
                    return this._viewEventManager;
                },
                enumerable: true,
                configurable: true
            });
            SwimlaneViewport.prototype.isViewableBaseChanged = function () {
                if (this._oldViewableBase !== this.viewableBase) {
                    this._oldViewableBase = this.viewableBase;
                    return true;
                }
                return false;
            };
            SwimlaneViewport.prototype.getTimeOffset = function (time) {
                return time - this.timeRange.begin;
            };
            SwimlaneViewport.prototype.isInViewport = function (time) {
                return this.timeRange.contains(time);
            };
            SwimlaneViewport.prototype.isBeforeViewport = function (time) {
                return time < this.timeRange.begin;
            };
            SwimlaneViewport.prototype.isAfterViewport = function (time) {
                return time > this.timeRange.end;
            };
            SwimlaneViewport.prototype.isOverlapViewport = function (beginTime, endTime) {
                return this.timeRange.isOverlap(beginTime, endTime);
            };
            SwimlaneViewport.prototype.selectTimeRange = function (beginTimeNanoseconds, endTimeNanoseconds) {
                var beginTime = DiagHub.BigNumber.convertFromNumber(beginTimeNanoseconds);
                var endTime = DiagHub.BigNumber.convertFromNumber(endTimeNanoseconds);
                if (this.viewableBase.greater(beginTime)) {
                    beginTime = this.viewableBase;
                }
                var selectedTimespan = new DiagHub.JsonTimespan(beginTime, endTime);
                this.selectTimeSpan(selectedTimespan);
            };
            SwimlaneViewport.prototype.clearTimeSelection = function () {
                this.selectTimeSpan(null);
            };
            SwimlaneViewport.prototype.enableAutoScrolling = function () {
                var newViewport = new DiagHub.JsonTimespan(DiagHub.BigNumber.zero, DiagHub.BigNumber.zero);
                this.changeViewport(newViewport, this._viewportController.selection);
            };
            SwimlaneViewport.prototype.disableAutoScrolling = function () {
                var newViewport = new DiagHub.JsonTimespan(this.timeRange.beginInHubTime, this.timeRange.endInHubTime);
                this.changeViewport(newViewport, this._viewportController.selection);
            };
            SwimlaneViewport.prototype.changeViewport = function (newViewport, newSelectedTime) {
                var viewportChangedArgs = {
                    currentTimespan: newViewport,
                    selectionTimespan: newSelectedTime,
                    isIntermittent: false,
                };
                this._viewportController.requestViewportChange(viewportChangedArgs);
            };
            SwimlaneViewport.prototype.centerViewportTo = function (beginTimeNanoseconds) {
                this.centerViewportWithSelectedTime(beginTimeNanoseconds, this._viewportController.selection);
            };
            SwimlaneViewport.prototype.centerViewportWithSelectedTime = function (beginTimeNanoseconds, newSelectedTime) {
                var targetTime = DiagHub.BigNumber.convertFromNumber(Math.max(beginTimeNanoseconds, 0));
                var duration = this.timeRange.durationInHubTime;
                var halfDuration = DiagHub.BigNumber.divideNumber(duration, 2);
                var beginTime = DiagHub.BigNumber.subtract(targetTime, halfDuration);
                if (this.viewableBase.greater(beginTime)) {
                    beginTime = this.viewableBase;
                }
                var endTime = DiagHub.BigNumber.add(beginTime, duration);
                if (endTime.greater(this.viewableEnd)) {
                    endTime = this.viewableEnd;
                    beginTime = DiagHub.BigNumber.subtract(endTime, duration);
                }
                var newViewport = new DiagHub.JsonTimespan(beginTime, endTime);
                this.changeViewport(newViewport, newSelectedTime);
            };
            SwimlaneViewport.prototype.alignViewportWithSelectedTime = function (beginTimeNanoseconds, newSelectedTime) {
                var beginTime = DiagHub.BigNumber.convertFromNumber(Math.max(beginTimeNanoseconds, 0));
                if (this.viewableBase.greater(beginTime)) {
                    beginTime = this.viewableBase;
                }
                var endTime = DiagHub.BigNumber.add(beginTime, DiagHub.BigNumber.convertFromNumber(this.timeRange.duration));
                var newViewport = new DiagHub.JsonTimespan(beginTime, endTime);
                this.changeViewport(newViewport, newSelectedTime);
            };
            SwimlaneViewport.prototype.selectTimeSpan = function (timeSpan) {
                var selectedTimeChangedArgs = {
                    position: timeSpan,
                    isIntermittent: false
                };
                this._viewEventManager.selectionChanged.raiseEvent(selectedTimeChangedArgs);
            };
            SwimlaneViewport.prototype.ensureTimeInsideSelection = function (time) {
                var currentSelection = this._viewportController.selection;
                if (currentSelection == null) {
                    return;
                }
                var selectionTimeRangeBegin = DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(currentSelection.begin);
                var selectionTimeRangeEnd = DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(currentSelection.end);
                var newBeginTime = Math.min(time, selectionTimeRangeBegin);
                var newEndTime = Math.max(time, selectionTimeRangeEnd);
                if ((newBeginTime != selectionTimeRangeBegin) || (newEndTime != selectionTimeRangeEnd)) {
                    this.selectTimeRange(newBeginTime, newEndTime);
                }
            };
            return SwimlaneViewport;
        }());
        DiagnosticsHub.SwimlaneViewport = SwimlaneViewport;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Converters;
        (function (Converters) {
            "use strict";
            var ItemXOffsetConverter = (function () {
                function ItemXOffsetConverter() {
                    this._swimlaneViewport = null;
                }
                Object.defineProperty(ItemXOffsetConverter.prototype, "swimlaneViewport", {
                    set: function (value) {
                        this._swimlaneViewport = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                ItemXOffsetConverter.prototype.convertTo = function (eventTime) {
                    return this.calculateXOffset(eventTime) + "px";
                };
                ItemXOffsetConverter.prototype.calculateXOffset = function (eventTime) {
                    IntelliTrace.Common.Diagnostics.Assert.isTrue(this._swimlaneViewport.isVisible, "view port is not visible.");
                    IntelliTrace.Common.Diagnostics.Assert.isTrue(eventTime >= 0, "eventTime value is invalid");
                    var xoffset = Math.round(this._swimlaneViewport.getTimeOffset(eventTime) / this._swimlaneViewport.nanosecondsPerPixel);
                    return xoffset;
                };
                ItemXOffsetConverter.prototype.convertFrom = function (to) {
                    IntelliTrace.Common.Diagnostics.Assert.fail("convertFrom is not implemented.");
                };
                return ItemXOffsetConverter;
            }());
            Converters.ItemXOffsetConverter = ItemXOffsetConverter;
            Converters.itemXOffsetConverter = new ItemXOffsetConverter();
        })(Converters = DiagnosticsHub.Converters || (DiagnosticsHub.Converters = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var HtmlHelper = (function () {
            function HtmlHelper() {
            }
            HtmlHelper.createDiv = function (html) {
                var div = document.createElement("div");
                div.innerHTML = html;
                return div;
            };
            return HtmlHelper;
        }());
        DiagnosticsHub.HtmlHelper = HtmlHelper;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var TimeIndicator = (function () {
            function TimeIndicator(rootElement, viewport) {
                this._time = null;
                this._isLiveDebugging = true;
                this._activatedEventIndicator = null;
                this._rootElement = null;
                this._viewport = null;
                this._rootElement = rootElement;
                this._viewport = viewport;
                this._activatedEventIndicator = DiagnosticsHub.HtmlHelper.createDiv("");
                this._activatedEventIndicator.setAttribute("class", "activated-event");
            }
            Object.defineProperty(TimeIndicator.prototype, "time", {
                get: function () {
                    return this._time;
                },
                set: function (value) {
                    this._time = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimeIndicator.prototype, "isLiveDebugging", {
                get: function () {
                    return this._isLiveDebugging;
                },
                set: function (value) {
                    this._isLiveDebugging = value;
                },
                enumerable: true,
                configurable: true
            });
            TimeIndicator.prototype.render = function (fullRender) {
                if (fullRender) {
                    this._rootElement.appendChild(this._activatedEventIndicator);
                }
                if (this._viewport.isVisible) {
                    if (this._time != null) {
                        this._activatedEventIndicator.style.left = DiagnosticsHub.Converters.itemXOffsetConverter.convertTo(this._time);
                        this._activatedEventIndicator.style.display = "block";
                    }
                    else {
                        this._activatedEventIndicator.style.display = "none";
                    }
                }
            };
            return TimeIndicator;
        }());
        DiagnosticsHub.TimeIndicator = TimeIndicator;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var EventSource = (function () {
            function EventSource() {
                this._handlers = null;
                this._eventsRunning = 0;
            }
            EventSource.prototype.addHandler = function (handler) {
                var _this = this;
                Common.Diagnostics.Assert.isTrue(typeof handler === "function", "handler must be function");
                if (!this._handlers) {
                    this._handlers = [];
                }
                this._handlers.push(handler);
                return { unregister: function () { return _this.removeHandler(handler); } };
            };
            EventSource.prototype.addOne = function (handler) {
                var registration = this.addHandler(function (args) {
                    registration.unregister();
                    handler(args);
                });
                return registration;
            };
            EventSource.prototype.removeHandler = function (handler) {
                Common.Diagnostics.Assert.hasValue(this._handlers && this._handlers.length, "Shouldn't call remove before add");
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
                Common.Diagnostics.Assert.fail("Called remove on a handler which wasn't added");
            };
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
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        Common.targetAccessViaProperty = {
            getValue: function (target, prop) { return target[prop]; },
            isValueSupported: function (value, isConverter) {
                return value !== undefined && (isConverter || value !== null);
            },
            setValue: function (target, prop, value) { target[prop] = value; }
        };
        Common.targetAccessViaAttribute = {
            getValue: function (target, prop) { return target.getAttribute(prop); },
            isValueSupported: function (value, isConverter) {
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
        var Binding = (function () {
            function Binding(source, sourceExpression, destination, destinationProperty, converter, mode, targetAccess) {
                var _this = this;
                Common.Diagnostics.Assert.hasValue(sourceExpression, "sourceExpression");
                Common.Diagnostics.Assert.hasValue(destination, "destination");
                Common.Diagnostics.Assert.hasValue(destinationProperty, "destinationProperty");
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
            Binding.prototype.isForDestination = function (destination, destinationProperty) {
                return destination === this._destination && destinationProperty === this._destinationProperty;
            };
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
            Binding.prototype.setSource = function (source) {
                var _this = this;
                if (this._sourceChangedRegistration) {
                    this._sourceChangedRegistration.unregister();
                    this._sourceChangedRegistration = null;
                }
                this._source = source;
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
            Binding.prototype.getValue = function () {
                return this._source && this._source[this._sourceProperty];
            };
            Binding.ONE_WAY_MODE = "oneway";
            Binding.TWO_WAY_MODE = "twoway";
            return Binding;
        }());
        Common.Binding = Binding;
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var CommonConverters = (function () {
            function CommonConverters() {
            }
            CommonConverters.initialize = function () {
                CommonConverters.AriaConverterElement = document.createElement("span");
                CommonConverters.HtmlTooltipFromResourceConverter = CommonConverters.getHtmlTooltipFromResourceConverter();
                CommonConverters.IntToStringConverter = CommonConverters.getIntToStringConverter();
                CommonConverters.InvertBool = CommonConverters.invertBoolConverter();
                CommonConverters.JsonHtmlTooltipToInnerTextConverter = CommonConverters.getJsonHtmlTooltipToInnerTextConverter();
                CommonConverters.NullPermittedConverter = CommonConverters.getNullPermittedConverter();
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
            CommonConverters.getHtmlTooltipFromResourceConverter = function () {
                return {
                    convertTo: function (from) {
                        return JSON.stringify({ content: Microsoft.Plugin.Resources.getString(from), contentContainsHTML: true });
                    },
                    convertFrom: null
                };
            };
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
            CommonConverters.getNullPermittedConverter = function () {
                return {
                    convertTo: function (from) {
                        return from;
                    },
                    convertFrom: function (to) {
                        return to;
                    }
                };
            };
            CommonConverters.JSONRegex = /^\{.*\}$/;
            return CommonConverters;
        }());
        Common.CommonConverters = CommonConverters;
        CommonConverters.initialize();
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        (function (CollectionChangedAction) {
            CollectionChangedAction[CollectionChangedAction["Add"] = 0] = "Add";
            CollectionChangedAction[CollectionChangedAction["Remove"] = 1] = "Remove";
            CollectionChangedAction[CollectionChangedAction["Reset"] = 2] = "Reset";
            CollectionChangedAction[CollectionChangedAction["Clear"] = 3] = "Clear";
        })(Common.CollectionChangedAction || (Common.CollectionChangedAction = {}));
        var CollectionChangedAction = Common.CollectionChangedAction;
        ;
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var Observable = (function () {
            function Observable() {
                this.propertyChanged = new Common.EventSource();
            }
            Observable.fromObject = function (obj) {
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
        var ObservableHelpers = (function () {
            function ObservableHelpers() {
            }
            ObservableHelpers.defineProperty = function (classToExtend, propertyName, defaultValue, onChanged, onChanging) {
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
            ObservableHelpers.describePropertyForObjectShape = function (propertyName, objectShape, backingDataStore, invokableObserver) {
                var returnValue = {
                    get: function () { return backingDataStore[propertyName]; },
                    enumerable: true
                };
                var propertyValue = objectShape[propertyName];
                if (typeof propertyValue === "object") {
                    backingDataStore[propertyName] = Observable.fromObject(propertyValue);
                    returnValue.set = function (value) {
                        if (value !== backingDataStore[propertyName]) {
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
            ObservableHelpers.expandProperties = function (objectShape, backingDataStore, invokableObserver) {
                var properties = {};
                for (var propertyName in objectShape) {
                    properties[propertyName] = ObservableHelpers.describePropertyForObjectShape(propertyName, objectShape, backingDataStore, invokableObserver);
                }
                return properties;
            };
            return ObservableHelpers;
        }());
        Common.ObservableHelpers = ObservableHelpers;
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var ObservableCollection = (function () {
            function ObservableCollection(list) {
                if (list === void 0) { list = []; }
                this._list = list.slice(0);
                this.propertyChanged = new Common.EventSource();
                this.collectionChanged = new Common.EventSource();
            }
            Object.defineProperty(ObservableCollection.prototype, "length", {
                get: function () {
                    return this._list.length;
                },
                enumerable: true,
                configurable: true
            });
            ObservableCollection.prototype.push = function () {
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                var array = (items);
                return this.pushInternal(array);
            };
            ObservableCollection.prototype.pushAll = function (items) {
                return this.pushInternal(items);
            };
            ObservableCollection.prototype.pushInternal = function (items) {
                var list = this._list;
                var insertionIndex = list.length;
                this._list = list.concat(items);
                var newLength = this._list.length;
                this.propertyChanged.invoke(ObservableCollection.LengthProperty);
                this.invokeCollectionChanged(Common.CollectionChangedAction.Add, items, insertionIndex);
                return newLength;
            };
            ObservableCollection.prototype.pop = function () {
                var oldItem = this._list.pop();
                this.propertyChanged.invoke(ObservableCollection.LengthProperty);
                this.invokeCollectionChanged(Common.CollectionChangedAction.Remove, null, null, [oldItem], this._list.length);
                return oldItem;
            };
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
            ObservableCollection.prototype.indexOf = function (searchElement, fromIndex) {
                return this._list.indexOf(searchElement, fromIndex);
            };
            ObservableCollection.prototype.lastIndexOf = function (searchElement, fromIndex) {
                if (fromIndex === void 0) { fromIndex = -1; }
                return this._list.lastIndexOf(searchElement, fromIndex);
            };
            ObservableCollection.prototype.clear = function () {
                this._list = [];
                this.propertyChanged.invoke(ObservableCollection.LengthProperty);
                this.invokeCollectionChanged(Common.CollectionChangedAction.Clear);
            };
            ObservableCollection.prototype.filter = function (callbackfn, thisArg) {
                return this._list.filter(callbackfn, thisArg);
            };
            ObservableCollection.prototype.map = function (callbackfn, thisArg) {
                return this._list.map(callbackfn, thisArg);
            };
            ObservableCollection.prototype.getItem = function (index) {
                return this._list[index];
            };
            ObservableCollection.prototype.resetItems = function (items) {
                this._list = [];
                var newLength = Array.prototype.push.apply(this._list, items);
                this.propertyChanged.invoke(ObservableCollection.LengthProperty);
                this.invokeCollectionChanged(Common.CollectionChangedAction.Reset);
                return newLength;
            };
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
            ObservableCollection.LengthProperty = "length";
            return ObservableCollection;
        }());
        Common.ObservableCollection = ObservableCollection;
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        var SortedObservableCollection = (function (_super) {
            __extends(SortedObservableCollection, _super);
            function SortedObservableCollection(comparator) {
                _super.call(this, []);
                this._sorted = false;
                if (comparator == null) {
                    comparator = function (a, b) {
                        if (a < b) {
                            return -1;
                        }
                        else if (a > b) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    };
                }
                this._comparator = comparator;
            }
            SortedObservableCollection.prototype.push = function () {
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                return this.pushAllSorted(items, false);
            };
            SortedObservableCollection.prototype.pushAll = function (items) {
                return this.pushAllSorted(items, false);
            };
            SortedObservableCollection.prototype.pushAllSorted = function (items, sorted) {
                if (!items) {
                    return this.length;
                }
                var currentLength = this._list.length;
                if (this.length === 0) {
                    this._sorted = sorted;
                    return _super.prototype.pushAll.call(this, items);
                }
                var lastItem = this.getItem(currentLength - 1);
                var firstItem = items[0];
                var comparison = this._comparator(firstItem, lastItem);
                if (items.length === 1 && comparison >= 0) {
                    this.ensureSorted();
                    return _super.prototype.pushAll.call(this, items);
                }
                if (sorted) {
                    this.ensureSorted();
                    if (comparison >= 0) {
                        return _super.prototype.pushAll.call(this, items);
                    }
                    var thisIndex = 0;
                    var newIndex = 0;
                    var newLength = items.length;
                    var mergedIndex = 0;
                    var newItems = [];
                    newItems.length = currentLength + newLength;
                    while ((thisIndex < currentLength) || (newIndex < newLength)) {
                        if (thisIndex >= currentLength) {
                            newItems[mergedIndex] = items[newIndex];
                            newIndex++;
                        }
                        else if (newIndex >= newLength) {
                            newItems[mergedIndex] = this._list[thisIndex];
                            thisIndex++;
                        }
                        else {
                            var comparison = this._comparator(this._list[thisIndex], items[newIndex]);
                            if (comparison > 0) {
                                newItems[mergedIndex] = items[newIndex];
                                newIndex++;
                            }
                            else {
                                newItems[mergedIndex] = this._list[thisIndex];
                                thisIndex++;
                            }
                        }
                        mergedIndex++;
                    }
                    return _super.prototype.resetItems.call(this, newItems);
                }
                if (items.length === 1) {
                    this.ensureSorted();
                    var newItem = items[0];
                    var lastEqualItemIndex = -1;
                    var i = 0;
                    for (i = 0; i < this.length; ++i) {
                        if (this._comparator(this.getItem(i), newItem) <= 0) {
                            lastEqualItemIndex = i;
                        }
                        else {
                            break;
                        }
                    }
                    this.splice(lastEqualItemIndex + 1, 0, newItem);
                    return this.length;
                }
                this._sorted = false;
                this._list = this._list.concat(items);
                this.propertyChanged.invoke(Common.ObservableCollection.LengthProperty);
                this.invokeCollectionChanged(Common.CollectionChangedAction.Reset);
                return this._list.length;
            };
            SortedObservableCollection.prototype.pop = function () {
                this.ensureSorted();
                return _super.prototype.pop.call(this);
            };
            SortedObservableCollection.prototype.splice = function (index, removeCount) {
                var items = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    items[_i - 2] = arguments[_i];
                }
                this.ensureSorted();
                return _super.prototype.splice.apply(this, arguments);
            };
            SortedObservableCollection.prototype.indexOf = function (searchElement, fromIndex) {
                this.ensureSorted();
                return _super.prototype.indexOf.apply(this, arguments);
            };
            SortedObservableCollection.prototype.lastIndexOf = function (searcElement, fromIndex) {
                if (fromIndex === void 0) { fromIndex = -1; }
                this.ensureSorted();
                return _super.prototype.lastIndexOf.apply(this, arguments);
            };
            SortedObservableCollection.prototype.clear = function () {
                this._sorted = true;
                _super.prototype.clear.call(this);
            };
            SortedObservableCollection.prototype.filter = function (callbackfn, thisArg) {
                this.ensureSorted();
                return _super.prototype.filter.call(this, callbackfn);
            };
            SortedObservableCollection.prototype.map = function (callbackfn, thisArg) {
                this.ensureSorted();
                return _super.prototype.map.call(this, callbackfn);
            };
            SortedObservableCollection.prototype.getItem = function (index) {
                this.ensureSorted();
                return _super.prototype.getItem.call(this, index);
            };
            SortedObservableCollection.prototype.resetItems = function (items) {
                this._sorted = false;
                return _super.prototype.resetItems.call(this, items);
            };
            SortedObservableCollection.prototype.ensureSorted = function () {
                if (!this._sorted) {
                    this._list.sort(this._comparator);
                    this._sorted = true;
                }
            };
            return SortedObservableCollection;
        }(Common.ObservableCollection));
        Common.SortedObservableCollection = SortedObservableCollection;
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var HtmlTemplateRepository = (function () {
            function HtmlTemplateRepository() {
                this._registeredTemplates = {};
            }
            HtmlTemplateRepository.prototype.getTemplateString = function (templateId) {
                Common.Diagnostics.Assert.isTrue(!!templateId, "Invalid template ID.");
                var template;
                template = this._registeredTemplates[templateId];
                if (!template) {
                    var templateElement = document.getElementById(templateId);
                    template = templateElement.innerHTML;
                }
                Common.Diagnostics.Assert.areEqual(typeof template, "string", "The given template name doesn't point to a template.");
                return template;
            };
            HtmlTemplateRepository.prototype.registerTemplateString = function (templateId, html) {
                Common.Diagnostics.Assert.isTrue(!!templateId, "Invalid template ID.");
                Common.Diagnostics.Assert.isUndefined(this._registeredTemplates[templateId], "Template with id '" + templateId + "' already registered.");
                this._registeredTemplates[templateId] = html;
            };
            return HtmlTemplateRepository;
        }());
        Common.HtmlTemplateRepository = HtmlTemplateRepository;
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var ControlTemplates;
(function (ControlTemplates) {
    var PlaceHolder = (function () {
        function PlaceHolder() {
        }
        return PlaceHolder;
    }());
})(ControlTemplates || (ControlTemplates = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var ScriptTemplateRepository = (function () {
            function ScriptTemplateRepository(container) {
                Common.Diagnostics.Assert.hasValue(container, "Invalid template container.");
                this._container = container;
                this._registeredTemplates = {};
            }
            ScriptTemplateRepository.prototype.getTemplateString = function (templateId) {
                Common.Diagnostics.Assert.isTrue(!!templateId, "Invalid template ID.");
                var template;
                template = this._registeredTemplates[templateId];
                if (!template) {
                    var container = this._container;
                    var templateParts = templateId.split(".");
                    for (var i = 0; i < templateParts.length; i++) {
                        var part = templateParts[i];
                        container = container[part];
                        Common.Diagnostics.Assert.isTrue(!!container, "Couldn't find the template with the given ID '" + templateId + "'.");
                    }
                    template = container;
                }
                Common.Diagnostics.Assert.areEqual(typeof template, "string", "The given template name doesn't point to a template.");
                return template;
            };
            ScriptTemplateRepository.prototype.registerTemplateString = function (templateId, html) {
                Common.Diagnostics.Assert.isTrue(!!templateId, "Invalid template ID.");
                Common.Diagnostics.Assert.isUndefined(this._registeredTemplates[templateId], "Template with id '" + templateId + "' already registered.");
                this._registeredTemplates[templateId] = html;
            };
            return ScriptTemplateRepository;
        }());
        Common.ScriptTemplateRepository = ScriptTemplateRepository;
        Common.templateRepository = new ScriptTemplateRepository(ControlTemplates);
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
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
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var TemplateDataBinding = (function () {
            function TemplateDataBinding(control) {
                this._bindings = TemplateDataBinding.bind(control);
            }
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
            TemplateDataBinding.extractBindingCommandsForBinding = function (commands, target, element, allBindings, isControlBinding) {
                var bindings = allBindings.split(",");
                var bindingsCount = bindings.length;
                for (var i = 0; i < bindingsCount; i++) {
                    var binding = bindings[i];
                    var keyValue = binding.split(":", 2);
                    Common.Diagnostics.Assert.areEqual(keyValue.length, 2, "Invalid binding syntax, the keyvalue pair should have the syntax target:source '" + binding + "'.");
                    var targetName = keyValue[0].trim();
                    var sourceSyntax = keyValue[1].trim();
                    var bindingSource = TemplateDataBinding.parseSourceSyntax(sourceSyntax);
                    if (!isControlBinding) {
                        bindingSource.name = TemplateDataBinding.MODEL_PREFIX + bindingSource.name;
                    }
                    var bindingCommand = TemplateDataBinding.buildBindingCommand(target, element, targetName, bindingSource, null);
                    Common.Diagnostics.Assert.isTrue(!!bindingCommand.targetName, "Invalid binding syntax. Target name is missing '" + binding + "'.");
                    commands.push(bindingCommand);
                }
            };
            TemplateDataBinding.extractBindingCommandsForOptions = function (commands, target, element, allOptions) {
                var options = allOptions.split(",");
                var optionsCount = options.length;
                for (var i = 0; i < optionsCount; i++) {
                    var option = options[i];
                    var keyValue = option.split(":", 2);
                    Common.Diagnostics.Assert.areEqual(keyValue.length, 2, "Invalid options syntax, the keyvalue pair should have the syntax target:source '" + option + "'.");
                    var targetName = keyValue[0].trim();
                    var valueSyntax = keyValue[1].trim();
                    var valueSource = TemplateDataBinding.parseSourceSyntax(valueSyntax);
                    var value = valueSource.name;
                    if (valueSource.converter && valueSource.converter.convertTo) {
                        value = valueSource.converter.convertTo(value);
                    }
                    var bindingCommand = TemplateDataBinding.buildBindingCommand(target, element, targetName, null, value);
                    Common.Diagnostics.Assert.isTrue(!!bindingCommand.targetName, "Invalid option syntax. Target name is missing '" + option + "'.");
                    commands.push(bindingCommand);
                }
            };
            TemplateDataBinding.getBindingCommands = function (control) {
                var bindingCommands;
                var elements = [];
                elements.push(control.rootElement);
                while (elements.length > 0) {
                    var element = elements.pop();
                    var childControl = element.control;
                    var target = element;
                    if (childControl && childControl !== control) {
                        target = childControl;
                    }
                    if (target) {
                        var attr;
                        attr = element.getAttributeNode(Common.TemplateDataAttributes.BINDING);
                        if (attr) {
                            bindingCommands = bindingCommands || [];
                            TemplateDataBinding.extractBindingCommandsForBinding(bindingCommands, target, element, attr.value, false);
                            element.removeAttributeNode(attr);
                        }
                        attr = element.getAttributeNode(Common.TemplateDataAttributes.CONTROL_BINDING);
                        if (attr) {
                            bindingCommands = bindingCommands || [];
                            TemplateDataBinding.extractBindingCommandsForBinding(bindingCommands, target, element, attr.value, true);
                            element.removeAttributeNode(attr);
                        }
                        attr = element.getAttributeNode(Common.TemplateDataAttributes.OPTIONS);
                        if (attr) {
                            bindingCommands = bindingCommands || [];
                            var optionsTarget = childControl || element;
                            TemplateDataBinding.extractBindingCommandsForOptions(bindingCommands, optionsTarget, element, attr.value);
                            element.removeAttributeNode(attr);
                        }
                    }
                    if (element.children && (!element.hasAttribute(Common.TemplateDataAttributes.CONTROL) || element === control.rootElement)) {
                        var childrenCount = element.children.length;
                        for (var i = 0; i < childrenCount; i++) {
                            elements.push(element.children[i]);
                        }
                    }
                }
                return bindingCommands;
            };
            TemplateDataBinding.bind = function (control) {
                var bindings;
                var bindingCommands = TemplateDataBinding.getBindingCommands(control);
                if (bindingCommands) {
                    bindings = [];
                    var bindingCommandsCount = bindingCommands.length;
                    for (var i = 0; i < bindingCommandsCount; i++) {
                        var bindingCommand = bindingCommands[i];
                        if (bindingCommand.source) {
                            var binding = new Common.Binding(control, bindingCommand.source.name, bindingCommand.target, bindingCommand.targetName, bindingCommand.source.converter, bindingCommand.source.mode, bindingCommand.targetAccess);
                            bindings.push(binding);
                        }
                        else if (bindingCommand.value !== undefined) {
                            bindingCommand.targetAccess.setValue(bindingCommand.target, bindingCommand.targetName, bindingCommand.value);
                        }
                    }
                }
                return bindings && bindings.length > 0 ? bindings : null;
            };
            TemplateDataBinding.getConverterInstance = function (identifier) {
                var obj = window;
                var parts = identifier.split(".");
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    obj = obj[part];
                    Common.Diagnostics.Assert.hasValue(obj, "Couldn't find the converter instance with the given name '" + identifier + "'.");
                }
                Common.Diagnostics.Assert.hasValue(obj.convertFrom || obj.convertTo, "The converter instance with the given name '" + identifier + "' doesn't point to a valid converter instance.");
                return obj;
            };
            TemplateDataBinding.parseSourceSyntax = function (syntax) {
                Common.Diagnostics.Assert.isTrue(!!syntax, "Invalid binding syntax.");
                var parts = syntax.split(";");
                var bindingSource = {
                    name: parts[0].trim()
                };
                for (var i = 1; i < parts.length; i++) {
                    var keyValue = parts[i].split("=", 2);
                    Common.Diagnostics.Assert.areEqual(keyValue.length, 2, "Invalid binding syntax, the keyvalue pair should have the syntax key=value.");
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
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var TemplateControl = (function (_super) {
            __extends(TemplateControl, _super);
            function TemplateControl(templateId) {
                _super.call(this);
                this.onInitializeOverride();
                this._templateId = templateId;
                this.setRootElementFromTemplate();
            }
            Object.defineProperty(TemplateControl.prototype, "model", {
                get: function () {
                    return this._model;
                },
                set: function (value) {
                    if (this._model !== value) {
                        var oldModel = this._model;
                        this._model = value;
                        this.propertyChanged.invoke(TemplateControl.ModelPropertyName);
                        this.onModelChanged(oldModel, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TemplateControl.prototype, "tabIndex", {
                get: function () {
                    if (this._tabIndex) {
                        return this._tabIndex;
                    }
                    return 0;
                },
                set: function (value) {
                    if (this._tabIndex !== value) {
                        var oldValue = this._tabIndex;
                        this._tabIndex = value >> 0;
                        this.propertyChanged.invoke(TemplateControl.TabIndexPropertyName);
                        this.onTabIndexChanged(oldValue, this._tabIndex);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TemplateControl.prototype, "templateId", {
                get: function () {
                    return this._templateId;
                },
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
            TemplateControl.initialize = function () {
                Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.ClassNamePropertyName, null, function (obj, oldValue, newValue) { return obj.onClassNameChanged(oldValue, newValue); });
                Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.IsEnabledPropertyName, true, function (obj) { return obj.onIsEnabledChanged(); });
                Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.IsVisiblePropertyName, true, function (obj) { return obj.onIsVisibleChanged(); });
                Common.ObservableHelpers.defineProperty(TemplateControl, TemplateControl.TooltipPropertyName, null, function (obj) { return obj.onTooltipChanged(); });
            };
            TemplateControl.prototype.getBinding = function (destination, destinationProperty) {
                var binding;
                if (this._binding) {
                    binding = this._binding.findBinding(destination, destinationProperty);
                }
                return binding;
            };
            TemplateControl.prototype.onApplyTemplate = function () {
                this.onClassNameChanged(null, this.className);
                this.onIsVisibleChanged();
                this.onTabIndexChanged(null, this._tabIndex);
                this.onTooltipChanged();
            };
            TemplateControl.prototype.onInitializeOverride = function () {
            };
            TemplateControl.prototype.onModelChanged = function (oldModel, newModel) {
            };
            TemplateControl.prototype.onTemplateChanging = function () {
            };
            TemplateControl.prototype.getNamedControl = function (name) {
                var element = this.getNamedElement(name);
                if (!element) {
                    return null;
                }
                return element.control;
            };
            TemplateControl.prototype.getNamedElement = function (name) {
                var elements = [];
                elements.push(this.rootElement);
                while (elements.length > 0) {
                    var element = elements.pop();
                    if (element.getAttribute(Common.TemplateDataAttributes.NAME) === name) {
                        return element;
                    }
                    if (element.children && (!element.hasAttribute(Common.TemplateDataAttributes.CONTROL) || element === this.rootElement)) {
                        var childrenCount = element.children.length;
                        for (var i = 0; i < childrenCount; i++) {
                            elements.push(element.children[i]);
                        }
                    }
                }
                return null;
            };
            TemplateControl.prototype.onIsEnabledChangedOverride = function () {
            };
            TemplateControl.prototype.onIsVisibleChangedOverride = function () {
            };
            TemplateControl.prototype.onTabIndexChangedOverride = function () {
            };
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
            TemplateControl.prototype.onIsEnabledChanged = function () {
                if (this.rootElement) {
                    if (this.isEnabled) {
                        this.rootElement.classList.remove(TemplateControl.CLASS_DISABLED);
                        this.rootElement.removeAttribute("aria-disabled");
                        this.onTabIndexChanged(this._tabIndex, this._tabIndex);
                    }
                    else {
                        this.rootElement.classList.add(TemplateControl.CLASS_DISABLED);
                        this.rootElement.setAttribute("aria-disabled", true.toString());
                        this.rootElement.tabIndex = -1;
                    }
                    this.onIsEnabledChangedOverride();
                }
            };
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
            TemplateControl.prototype.onTabIndexChanged = function (oldValue, newValue) {
                if (this.rootElement) {
                    if (this.isEnabled && this.isVisible) {
                        if (oldValue || newValue || newValue === 0) {
                            this.rootElement.tabIndex = newValue;
                        }
                    }
                    if (oldValue !== newValue) {
                        this.onTabIndexChangedOverride();
                    }
                }
            };
            TemplateControl.prototype.onTooltipChanged = function () {
                if (this.rootElement) {
                    this.onTooltipChangedOverride();
                }
            };
            TemplateControl.prototype.setRootElementFromTemplate = function () {
                var previousRoot;
                this.onTemplateChanging();
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
                if (previousRoot) {
                    var attr = previousRoot.attributes.getNamedItem(Common.TemplateDataAttributes.NAME);
                    if (attr) {
                        this.rootElement.setAttribute(attr.name, attr.value);
                    }
                }
                this.rootElement.control = this;
                this._binding = new Common.TemplateDataBinding(this);
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
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Common;
    (function (Common) {
        "use strict";
        var TemplateLoader = (function () {
            function TemplateLoader(repository) {
                Common.Diagnostics.Assert.hasValue(repository, "Invalid template repository.");
                this._parsingNode = document.createElement("div");
                this._repository = repository;
                this._templateCache = {};
                this._visitedControls = {};
                this._visitedTemplates = {};
            }
            Object.defineProperty(TemplateLoader.prototype, "repository", {
                get: function () {
                    return this._repository;
                },
                enumerable: true,
                configurable: true
            });
            TemplateLoader.getControlType = function (controlName) {
                Common.Diagnostics.Assert.isTrue(!!controlName, "Invalid control name.");
                var controlType = window;
                var nameParts = controlName.split(".");
                for (var i = 0; i < nameParts.length; i++) {
                    var part = nameParts[i];
                    controlType = controlType[part];
                    Common.Diagnostics.Assert.hasValue(controlType, "Couldn't find the control with the given name '" + controlName + "'.");
                }
                Common.Diagnostics.Assert.areEqual(typeof controlType, "function", "The given control '" + controlName + "' doesn't represent a control type which implements IControl.");
                return controlType;
            };
            TemplateLoader.prototype.loadTemplate = function (templateId) {
                var cachedElement = this._templateCache[templateId];
                if (!cachedElement) {
                    var template = this._repository.getTemplateString(templateId);
                    Common.Diagnostics.Assert.isFalse(this._visitedTemplates[templateId], "Detected a recursive template. TemplateId '" + templateId + "' is part of the parents hierarchy.");
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
            TemplateLoader.prototype.loadTemplateUsingHtml = function (templateHtml) {
                this._parsingNode.innerHTML = templateHtml;
                Common.Diagnostics.Assert.areEqual(this._parsingNode.childElementCount, 1, "Template should have only one root element.");
                var rootElement = this._parsingNode.children[0];
                this._parsingNode.removeChild(rootElement);
                return rootElement;
            };
            TemplateLoader.prototype.getControlInstance = function (controlName, templateId) {
                Common.Diagnostics.Assert.isTrue(!!controlName, "Invalid control name.");
                var controlType = TemplateLoader.getControlType(controlName);
                var control;
                if (Common.TemplateControl.prototype.isPrototypeOf(controlType.prototype) ||
                    Common.TemplateControl.prototype === controlType.prototype) {
                    control = new controlType(templateId);
                }
                else {
                    control = new controlType();
                }
                Common.Diagnostics.Assert.hasValue(control.rootElement, "The given control '" + controlName + "' doesn't represent a control type which implements IControl.");
                if (control.rootElement.control !== control) {
                    control.rootElement.control = control;
                }
                return control;
            };
            TemplateLoader.prototype.resolvePlaceholders = function (root) {
                if (root.hasAttribute(Common.TemplateDataAttributes.CONTROL)) {
                    root = this.resolvePlaceholder(root);
                }
                else {
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
                Common.Diagnostics.Assert.isFalse(node.hasChildNodes(), "Control placeholders cannot have children.");
                var controlName = node.getAttribute(Common.TemplateDataAttributes.CONTROL);
                var templateId = node.getAttribute(Common.TemplateDataAttributes.CONTROL_TEMPLATE_ID);
                var controlVisistedKey = controlName + (templateId ? "," + templateId : "");
                Common.Diagnostics.Assert.isFalse(this._visitedControls[controlVisistedKey], "Detected a recursive control. Control '" + controlVisistedKey + "' is part of the parents hierarchy.");
                this._visitedControls[controlVisistedKey] = true;
                try {
                    var controlInstance = this.getControlInstance(controlName, templateId);
                }
                finally {
                    this._visitedControls[controlVisistedKey] = false;
                }
                var controlNode = controlInstance.rootElement;
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
        Common.templateLoader = new TemplateLoader(Common.templateRepository);
    })(Common = IntelliTrace.Common || (IntelliTrace.Common = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var StringFormatter;
        (function (StringFormatter) {
            "use strict";
            function format(format) {
                var replacements = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    replacements[_i - 1] = arguments[_i];
                }
                return format.replace(/{(\d+)}/g, function (match, n) {
                    return typeof replacements[n] != 'undefined'
                        ? replacements[n]
                        : match;
                });
            }
            StringFormatter.format = format;
            function textSplit(str, limit) {
                var NewLine = "\r\n";
                if (str.indexOf(NewLine) >= 0) {
                    return str;
                }
                if (str.length <= limit) {
                    return str;
                }
                var breakPositon = str.lastIndexOf(" ", limit);
                if (breakPositon !== -1) {
                    str = str.substring(0, breakPositon) + NewLine + str.substring(breakPositon + 1);
                }
                else {
                    breakPositon = limit;
                    str = str.substring(0, breakPositon) + NewLine + str.substring(breakPositon);
                }
                var next = breakPositon + NewLine.length;
                return str.substring(0, next) + textSplit(str.substring(next), limit);
            }
            function formatTooltip(value, height, maxTooltipLength) {
                maxTooltipLength = maxTooltipLength;
                if (maxTooltipLength !== -1) {
                    value = textSplit(value, maxTooltipLength);
                }
                if (Microsoft.Plugin.Tooltip.defaultTooltipContentToHTML) {
                    value = value.replace(/[<>]/g, function ($0, $1, $2) { return ($0 === "<") ? "&lt;" : "&gt;"; });
                    value = value.replace("\r\n", "<br/>");
                }
                var tooltip = { content: value, height: height, contentContainsHTML: Microsoft.Plugin.Tooltip.defaultTooltipContentToHTML };
                return JSON.stringify(tooltip);
            }
            StringFormatter.formatTooltip = formatTooltip;
        })(StringFormatter = DiagnosticsHub.StringFormatter || (DiagnosticsHub.StringFormatter = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var DebugEventViewModel = (function (_super) {
            __extends(DebugEventViewModel, _super);
            function DebugEventViewModel(swimlane, timeInNanoseconds, eventKind, color, breakType, categoryName, shortDescription, diagnosticDataId, duration) {
                if (duration === void 0) { duration = 0; }
                _super.call(this);
                this.swimlane = swimlane;
                this.timeInNanoseconds = timeInNanoseconds;
                this.eventColor = color;
                this.eventKind = eventKind;
                this.breakType = breakType;
                this.shortDescription = shortDescription;
                this.categoryName = categoryName;
                this.diagnosticDataId = diagnosticDataId;
                this.duration = duration;
                this.isActivatedEvent = false;
                this.updateAriaLabelAndTooltip();
            }
            DebugEventViewModel.EventOrderComparator = function (first, second) {
                return first.timeInNanoseconds - second.timeInNanoseconds;
            };
            DebugEventViewModel.init = function () {
                IntelliTrace.Common.ObservableHelpers.defineProperty(DebugEventViewModel, DebugEventViewModel.TimeInNanosecondsPropertyName, "");
                IntelliTrace.Common.ObservableHelpers.defineProperty(DebugEventViewModel, DebugEventViewModel.BreakTypePropertyName, DiagnosticsHub.BreakEventType.None);
                IntelliTrace.Common.ObservableHelpers.defineProperty(DebugEventViewModel, DebugEventViewModel.TooltipPropertyName, "");
                IntelliTrace.Common.ObservableHelpers.defineProperty(DebugEventViewModel, DebugEventViewModel.DurationPropertyName, 0);
                IntelliTrace.Common.ObservableHelpers.defineProperty(DebugEventViewModel, DebugEventViewModel.AriaLabelPropertyName, "");
                IntelliTrace.Common.ObservableHelpers.defineProperty(DebugEventViewModel, DebugEventViewModel.IsActivatedEventPropertyName, false, DebugEventViewModel.onActiveEventChanged);
            };
            DebugEventViewModel.onActiveEventChanged = function (obj, oldValue, newValue) {
                obj.updateAriaLabelAndTooltip();
            };
            DebugEventViewModel.prototype.updateAriaLabelAndTooltip = function () {
                var timeSeconds = DiagnosticsHub.EventsSwimlane.getTimeInSeconds(this.timeInNanoseconds);
                var tooltip = null;
                var activeEventString = "";
                if (this.isActivatedEvent) {
                    activeEventString = this.swimlane.getResource("ActivatedHistoricalEvent");
                }
                if (this.swimlane.isBreakEventKind(this.eventKind)) {
                    IntelliTrace.Common.Diagnostics.Assert.isTrue(this.duration >= 0, "Duration should not be negative.");
                    var durationMilliseconds = Math.max(1, Math.ceil(this.duration / 1000000));
                    tooltip = DiagnosticsHub.StringFormatter.format(this.swimlane.getResource("BreakEventTooltip"), this.categoryName, this.shortDescription, timeSeconds.toLocaleString(), durationMilliseconds.toLocaleString(), activeEventString);
                }
                else {
                    tooltip = DiagnosticsHub.StringFormatter.format(this.swimlane.getResource("DiscreteEventTooltip"), this.categoryName, this.shortDescription, timeSeconds.toLocaleString(), activeEventString);
                }
                this.tooltip = DiagnosticsHub.StringFormatter.formatTooltip(tooltip, 18, 60);
                this.ariaLabel = IntelliTrace.Common.CommonConverters.JsonHtmlTooltipToInnerTextConverter.convertTo(this.tooltip);
            };
            DebugEventViewModel.TimeInNanosecondsPropertyName = "timeInNanoseconds";
            DebugEventViewModel.BreakTypePropertyName = "breakType";
            DebugEventViewModel.TooltipPropertyName = "tooltip";
            DebugEventViewModel.DurationPropertyName = "duration";
            DebugEventViewModel.AriaLabelPropertyName = "ariaLabel";
            DebugEventViewModel.IsActivatedEventPropertyName = "isActivatedEvent";
            return DebugEventViewModel;
        }(IntelliTrace.Common.Observable));
        DiagnosticsHub.DebugEventViewModel = DebugEventViewModel;
        DebugEventViewModel.init();
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Controls;
    (function (Controls) {
        "use strict";
        var ContentControl = (function (_super) {
            __extends(ContentControl, _super);
            function ContentControl(templateId) {
                _super.call(this, templateId);
            }
            ContentControl.initialize = function () {
                IntelliTrace.Common.ObservableHelpers.defineProperty(ContentControl, "content", null);
            };
            return ContentControl;
        }(IntelliTrace.Common.TemplateControl));
        Controls.ContentControl = ContentControl;
        ContentControl.initialize();
    })(Controls = IntelliTrace.Controls || (IntelliTrace.Controls = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Controls;
    (function (Controls) {
        "use strict";
        var SelectableControl = (function (_super) {
            __extends(SelectableControl, _super);
            function SelectableControl(templateId) {
                _super.call(this, templateId || "Common.defaultButtonTemplate");
                this.selectedEvent = new IntelliTrace.Common.EventSource();
                this._viewEventManager = DiagHub.getViewEventManager();
                IntelliTrace.Common.Diagnostics.Assert.hasValue(this._viewEventManager, "Couldn't find DiagnosticsHub event manager.");
            }
            SelectableControl.prototype.onMouseClick = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                this.selectEventsTab();
                e.stopImmediatePropagation();
                e.preventDefault();
                this.onMouseClickOverride(e);
            };
            SelectableControl.prototype.onMouseDown = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                this.selectedEvent.invoke(e);
                e.stopImmediatePropagation();
                e.preventDefault();
                this.onMouseDownOverride(e);
            };
            SelectableControl.prototype.onMouseUp = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                e.stopImmediatePropagation();
                e.preventDefault();
                this.onMouseUpOverride(e);
            };
            SelectableControl.prototype.onMouseOut = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                this.onMouseOutOverride(e);
            };
            SelectableControl.prototype.onMouseOver = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                this.onMouseOverOverride(e);
            };
            SelectableControl.prototype.onKeyDown = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                if ((e.keyCode === DiagHub.Common.KeyCodes.Enter) || (e.keyCode === DiagHub.Common.KeyCodes.Space)) {
                    this.isPressed = true;
                }
                this.onKeyDownOverride(e);
            };
            SelectableControl.prototype.onKeyUp = function (e) {
                if (!this.isEnabled) {
                    return;
                }
                if (this.isPressed) {
                    this.isPressed = false;
                    if (e.keyCode === DiagHub.Common.KeyCodes.Enter) {
                        this.selectEventsTab();
                    }
                    else if (e.keyCode === DiagHub.Common.KeyCodes.Space) {
                        this.selectedEvent.invoke(e);
                    }
                }
                this.onKeyUpOverride(e);
            };
            SelectableControl.prototype.onTooltipChangedOverride = function () {
                _super.prototype.onTooltipChangedOverride.call(this);
                if (this.tooltip) {
                    this.rootElement.setAttribute("data-plugin-vs-tooltip", this.tooltip);
                }
                else {
                    this.rootElement.removeAttribute("data-plugin-vs-tooltip");
                }
            };
            SelectableControl.prototype.onMouseClickOverride = function (e) {
            };
            SelectableControl.prototype.onMouseDownOverride = function (e) {
            };
            SelectableControl.prototype.onMouseUpOverride = function (e) {
            };
            SelectableControl.prototype.onMouseOutOverride = function (e) {
            };
            SelectableControl.prototype.onMouseOverOverride = function (e) {
            };
            SelectableControl.prototype.onKeyDownOverride = function (e) {
            };
            SelectableControl.prototype.onKeyUpOverride = function (e) {
            };
            SelectableControl.prototype.selectEventsTab = function () {
                this._viewEventManager.selectDetailsView(SelectableControl.EventsTabGuid);
            };
            SelectableControl.EventsTabGuid = "{32F335ED-B292-4C8D-B704-E2361CEA03AE}";
            return SelectableControl;
        }(Controls.ContentControl));
        Controls.SelectableControl = SelectableControl;
    })(Controls = IntelliTrace.Controls || (IntelliTrace.Controls = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var Controls;
    (function (Controls) {
        "use strict";
        var ItemsControl = (function (_super) {
            __extends(ItemsControl, _super);
            function ItemsControl(templateId) {
                _super.call(this, templateId);
            }
            ItemsControl.initialize = function () {
                IntelliTrace.Common.ObservableHelpers.defineProperty(ItemsControl, "items", "", function (obj, oldValue, newValue) { return obj.onItemsChange(oldValue, newValue); });
                IntelliTrace.Common.ObservableHelpers.defineProperty(ItemsControl, "itemContainerControl", "", function (obj, oldValue, newValue) { return obj.onItemContainerControlChange(oldValue, newValue); });
            };
            ItemsControl.prototype.getIndex = function (item) {
                IntelliTrace.Common.Diagnostics.Assert.isTrue(!!this._collection, "Expecting a non-null collection in the ItemsControl");
                var index = this._collection.indexOf(item);
                if (index !== -1) {
                    return index;
                }
            };
            ItemsControl.prototype.getItem = function (index) {
                IntelliTrace.Common.Diagnostics.Assert.isTrue(!!this._collection, "Expecting a non-null collection in the ItemsControl");
                return this._collection.getItem(index);
            };
            ItemsControl.prototype.getItemCount = function () {
                if (!this._collection) {
                    return 0;
                }
                return this._collection.length;
            };
            ItemsControl.prototype.onTooltipChangedOverride = function () {
                _super.prototype.onTooltipChangedOverride.call(this);
                this.updateTooltip(this.tooltip);
            };
            ItemsControl.prototype.disposeItemContainerOverride = function (control) {
            };
            ItemsControl.prototype.prepareItemContainerOverride = function (control, item) {
            };
            ItemsControl.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                this.panelRootElement = this.getNamedElement(ItemsControl.PanelRootElementName) || this.rootElement;
                IntelliTrace.Common.Diagnostics.Assert.isTrue(!!this.panelRootElement, "Expecting a root element for the panel in ItemsControl.");
                this.updateTooltip(this.tooltip);
                this.regenerateItemControls();
            };
            ItemsControl.prototype.onTemplateChanging = function () {
                this.updateTooltip(null);
                this.removeAllItemControls();
                _super.prototype.onTemplateChanging.call(this);
            };
            ItemsControl.prototype.onItemsChangedOverride = function () {
            };
            ItemsControl.prototype.onItemContainerControlChangedOverride = function () {
            };
            ItemsControl.prototype.onCollectionChangedOverride = function (args) {
            };
            ItemsControl.prototype.getAllItemControls = function () {
                var result = new Array();
                var children = this.panelRootElement.children;
                var childrenLength = children.length;
                for (var i = 0; i < childrenLength; i++) {
                    var control = children[i].control;
                    result.push(control);
                }
                return result;
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
                        this._collection = new IntelliTrace.Common.ObservableCollection(this.items);
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
                        var className = parts[0];
                        if (className) {
                            className = className.trim();
                        }
                        IntelliTrace.Common.Diagnostics.Assert.isTrue(!!className, "Invalid itemContainerControl value. The control class name is required.");
                        var templateId = parts[1];
                        if (templateId) {
                            templateId = templateId.trim();
                        }
                        this._itemContainerClassType = IntelliTrace.Common.TemplateLoader.getControlType(className);
                        this._itemContainerTemplateId = templateId;
                        this._itemContainerIsTemplateControl = this._itemContainerClassType === IntelliTrace.Common.TemplateControl || this._itemContainerClassType.prototype instanceof IntelliTrace.Common.TemplateControl;
                    }
                }
                this.regenerateItemControls();
                this.onItemContainerControlChangedOverride();
            };
            ItemsControl.prototype.onCollectionChanged = function (args) {
                switch (args.action) {
                    case IntelliTrace.Common.CollectionChangedAction.Add:
                        this.insertItemControls(args.newStartingIndex, args.newItems.length);
                        break;
                    case IntelliTrace.Common.CollectionChangedAction.Clear:
                        this.removeAllItemControls();
                        break;
                    case IntelliTrace.Common.CollectionChangedAction.Remove:
                        this.removeItemControls(args.oldStartingIndex, args.oldItems.length);
                        break;
                    case IntelliTrace.Common.CollectionChangedAction.Reset:
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
                IntelliTrace.Common.Diagnostics.Assert.isTrue(end <= this._collection.length, "Unexpected range after inserting into items.");
                IntelliTrace.Common.Diagnostics.Assert.isTrue(itemIndex <= this.panelRootElement.childElementCount, "Collection and child elements mismatch.");
                if (itemIndex === this.panelRootElement.childElementCount) {
                    for (var i = itemIndex; i < end; i++) {
                        var item = this._collection.getItem(i);
                        var control = this.createItemControl(item);
                        this.panelRootElement.appendChild(control.rootElement);
                    }
                }
                else {
                    var endNode = this.panelRootElement.childNodes.item(itemIndex);
                    for (var i = itemIndex; i < end; i++) {
                        var item = this._collection.getItem(i);
                        var control = this.createItemControl(item);
                        this.panelRootElement.insertBefore(control.rootElement, endNode);
                    }
                }
            };
            ItemsControl.prototype.removeAllItemControls = function () {
                if (this.panelRootElement) {
                    var children = this.panelRootElement.children;
                    var childrenLength = children.length;
                    for (var i = 0; i < childrenLength; i++) {
                        var control = children[i].control;
                        this.disposeItemContainer(control);
                    }
                    this.panelRootElement.innerHTML = "";
                }
            };
            ItemsControl.prototype.removeItemControls = function (itemIndex, count) {
                for (var i = itemIndex + count - 1; i >= itemIndex; i--) {
                    var element = this.panelRootElement.children[i];
                    if (element) {
                        var control = element.control;
                        this.disposeItemContainer(control);
                        this.panelRootElement.removeChild(element);
                    }
                }
            };
            ItemsControl.prototype.updateTooltip = function (tooltip) {
                if (this.rootElement) {
                    if (tooltip) {
                        this.rootElement.setAttribute("data-plugin-vs-tooltip", tooltip);
                        this.rootElement.setAttribute("aria-label", tooltip);
                    }
                    else {
                        this.rootElement.removeAttribute("data-plugin-vs-tooltip");
                        this.rootElement.removeAttribute("aria-label");
                    }
                }
            };
            ItemsControl.PanelRootElementName = "_panel";
            return ItemsControl;
        }(IntelliTrace.Common.TemplateControl));
        Controls.ItemsControl = ItemsControl;
        ItemsControl.initialize();
    })(Controls = IntelliTrace.Controls || (IntelliTrace.Controls = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Controls;
        (function (Controls) {
            "use strict";
            var TrackItem = (function (_super) {
                __extends(TrackItem, _super);
                function TrackItem(templateId) {
                    var _this = this;
                    _super.call(this, templateId);
                    this._modelChangedHandlerRegistration = null;
                    this._hoverTimeoutId = null;
                    this._isFocused = false;
                    this._onModelPropertyChangedHandler = null;
                    this.rootElement.onfocus = function (ev) { return _this.onFocus(ev); };
                    this.rootElement.onblur = function (ev) { return _this.onBlur(ev); };
                    this._onModelPropertyChangedHandler = this.onModelPropertyChanged.bind(this);
                }
                TrackItem.prototype.onModelChanged = function (oldModel, newModel) {
                    _super.prototype.onModelChanged.call(this, oldModel, newModel);
                    if (oldModel) {
                        var oldViewModel = oldModel;
                        oldViewModel.propertyChanged.removeHandler(this._onModelPropertyChangedHandler);
                    }
                    if (this._modelChangedHandlerRegistration !== null) {
                        this._modelChangedHandlerRegistration.unregister();
                    }
                    if (this.model) {
                        var viewModel = this.model;
                        this.tooltip = viewModel.tooltip;
                        viewModel.propertyChanged.addHandler(this._onModelPropertyChangedHandler);
                    }
                };
                TrackItem.prototype.updateOnInteraction = function () {
                    this.updateOnInteractionOverride();
                };
                TrackItem.prototype.updateOnInteractionOverride = function () {
                };
                TrackItem.prototype.onMouseOverOverride = function (e) {
                    var _this = this;
                    this.isHovered = true;
                    this._hoverTimeoutId = setTimeout(function () {
                        var viewModel = _this.model;
                        if (viewModel != null) {
                            DiagnosticsHub.TelemetryService.onHoverDiagnosticEvent(viewModel.telemetryType);
                        }
                    }, DiagnosticsHub.TelemetryServiceMarshallerConstants.DefaultHoverEventDelay);
                };
                TrackItem.prototype.onMouseOutOverride = function (e) {
                    this.isHovered = false;
                    if (this._hoverTimeoutId != null) {
                        clearTimeout(this._hoverTimeoutId);
                        this._hoverTimeoutId = null;
                    }
                };
                TrackItem.prototype.isFocused = function () {
                    return this._isFocused;
                };
                TrackItem.prototype.focus = function () {
                    this.rootElement.focus();
                };
                TrackItem.prototype.blur = function () {
                    this.rootElement.blur();
                };
                TrackItem.initialize = function () {
                    IntelliTrace.Common.ObservableHelpers.defineProperty(TrackItem, TrackItem.IsHoveredPropertyName, false, function (obj, old, newValue) { return obj.updateOnInteraction(); });
                    IntelliTrace.Common.ObservableHelpers.defineProperty(TrackItem, TrackItem.IsSelectedPropertyName, false, function (obj, old, newValue) { return obj.updateOnInteraction(); });
                };
                TrackItem.prototype.onFocus = function (evt) {
                    this._isFocused = true;
                };
                TrackItem.prototype.onBlur = function (evt) {
                    this._isFocused = false;
                };
                TrackItem.prototype.onModelPropertyChanged = function (property) {
                    if (DiagnosticsHub.DebugEventViewModel.TooltipPropertyName === property) {
                        if (this.model) {
                            var viewModel = this.model;
                            this.tooltip = viewModel.tooltip;
                        }
                    }
                };
                TrackItem.IsHoveredPropertyName = "isHovered";
                TrackItem.IsSelectedPropertyName = "isSelected";
                TrackItem.IsActivePropertyName = "isActive";
                return TrackItem;
            }(IntelliTrace.Controls.SelectableControl));
            Controls.TrackItem = TrackItem;
            TrackItem.initialize();
        })(Controls = DiagnosticsHub.Controls || (DiagnosticsHub.Controls = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Controls;
        (function (Controls) {
            "use strict";
            var BreakEventItem = (function (_super) {
                __extends(BreakEventItem, _super);
                function BreakEventItem() {
                    _super.apply(this, arguments);
                }
                BreakEventItem.prototype.onModelChanged = function (oldModel, newModel) {
                    _super.prototype.onModelChanged.call(this, oldModel, newModel);
                    this.update();
                };
                BreakEventItem.prototype.updateOnInteractionOverride = function () {
                    this.update();
                };
                BreakEventItem.prototype.onMouseOverOverride = function (e) {
                    if (this.isMouseEventInsideControl(e)) {
                        return;
                    }
                    _super.prototype.onMouseOverOverride.call(this, e);
                };
                BreakEventItem.prototype.onMouseOutOverride = function (e) {
                    if (this.isMouseEventInsideControl(e)) {
                        return;
                    }
                    _super.prototype.onMouseOutOverride.call(this, e);
                };
                BreakEventItem.prototype.isMouseEventInsideControl = function (e) {
                    if (e == null) {
                        return false;
                    }
                    var target = e.relatedTarget;
                    while (target != null) {
                        if (target === this.rootElement) {
                            return true;
                        }
                        target = target.parentElement;
                    }
                    return false;
                };
                BreakEventItem.prototype.update = function () {
                    if (this.model != null) {
                        var debugEventViewModel = this.model;
                        var calculatedOffset = DiagnosticsHub.Converters.itemXOffsetConverter.calculateXOffset(debugEventViewModel.timeInNanoseconds);
                        var calculatedEndOffset = DiagnosticsHub.Converters.itemXOffsetConverter.calculateXOffset(debugEventViewModel.timeInNanoseconds + debugEventViewModel.duration);
                        var calculatedWidth = Math.max(calculatedEndOffset - calculatedOffset - 1, 1);
                        if (calculatedOffset < 0) {
                            calculatedWidth = calculatedWidth + calculatedOffset;
                            calculatedOffset = 0;
                        }
                        this.xOffset = calculatedOffset + "px";
                        this.width = calculatedWidth + "px";
                        var newBreakEventClass = "break-event ";
                        var breakEventType = DiagnosticsHub.BreakEventType[debugEventViewModel.breakType].toLowerCase();
                        newBreakEventClass += breakEventType;
                        if (this.isHovered || this.isSelected) {
                            newBreakEventClass += " activated";
                            if (this.isSelected) {
                                newBreakEventClass += " selected";
                            }
                        }
                        this.breakEventClass = newBreakEventClass;
                    }
                };
                BreakEventItem.initialize = function () {
                    IntelliTrace.Common.ObservableHelpers.defineProperty(BreakEventItem, BreakEventItem.BreakEventClassPropertyName, "");
                    IntelliTrace.Common.ObservableHelpers.defineProperty(BreakEventItem, BreakEventItem.XOffsetPropertyName, "0px");
                    IntelliTrace.Common.ObservableHelpers.defineProperty(BreakEventItem, BreakEventItem.WidthPropertyName, "0px");
                };
                BreakEventItem.BreakEventClassPropertyName = "breakEventClass";
                BreakEventItem.XOffsetPropertyName = "xOffset";
                BreakEventItem.WidthPropertyName = "width";
                return BreakEventItem;
            }(IntelliTrace.DiagnosticsHub.Controls.TrackItem));
            Controls.BreakEventItem = BreakEventItem;
            BreakEventItem.initialize();
        })(Controls = DiagnosticsHub.Controls || (DiagnosticsHub.Controls = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Controls;
        (function (Controls) {
            "use strict";
            var TrackControl = (function (_super) {
                __extends(TrackControl, _super);
                function TrackControl(name, templateId, viewport) {
                    var _this = this;
                    _super.call(this, templateId);
                    this.isSelectedByUserInput = false;
                    this._viewport = null;
                    this._name = name;
                    this._keyDownEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onKeyDown.bind(_this)); };
                    this._keyUpEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onKeyUp.bind(_this)); };
                    this._mouseOverEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onMouseOver.bind(_this)); };
                    this._mouseOutEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onMouseOut.bind(_this)); };
                    this._mouseClickEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onMouseClick.bind(_this)); };
                    this._mouseDownEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onMouseDown.bind(_this)); };
                    this._mouseUpEventHandler = function (evt) { return _this.userInputEventWrapper(evt, _this.onMouseUp.bind(_this)); };
                    this.rootElement.addEventListener("keydown", this._keyDownEventHandler, true);
                    this.rootElement.addEventListener("keyup", this._keyUpEventHandler, true);
                    this.rootElement.addEventListener("mouseover", this._mouseOverEventHandler);
                    this.rootElement.addEventListener("mouseout", this._mouseOutEventHandler);
                    this.rootElement.addEventListener("click", this._mouseClickEventHandler);
                    this.rootElement.addEventListener("mousedown", this._mouseDownEventHandler);
                    this.rootElement.addEventListener("mouseup", this._mouseUpEventHandler);
                    this.selectionChangedEvent = new IntelliTrace.Common.EventSource();
                    this._viewport = viewport;
                }
                TrackControl.initialize = function () {
                    IntelliTrace.Common.ObservableHelpers.defineProperty(TrackControl, TrackControl.SelectedItemPropertyName, null, function (obj, oldValue, newValue) { return obj.onSelectedItemChanged(oldValue, newValue); });
                    IntelliTrace.Common.ObservableHelpers.defineProperty(TrackControl, TrackControl.SelectedIndexPropertyName, TrackControl.ClearSelectionIndex, function (obj, oldValue, newValue) { return obj.onSelectedIndexChanged(oldValue, newValue); });
                    IntelliTrace.Common.ObservableHelpers.defineProperty(TrackControl, TrackControl.AriaLabelPropertyName, "");
                    IntelliTrace.Common.ObservableHelpers.defineProperty(TrackControl, TrackControl.PanelClassPropertyName, "display-block");
                };
                TrackControl.prototype.onItemsChangedOverride = function () {
                };
                TrackControl.prototype.onCollectionChangedOverride = function (args) {
                    switch (args.action) {
                        case IntelliTrace.Common.CollectionChangedAction.Add:
                        case IntelliTrace.Common.CollectionChangedAction.Remove:
                            var indexOfSelectedItem = this.getIndex(this.selectedItem);
                            if (indexOfSelectedItem != null) {
                                this.selectedIndex = indexOfSelectedItem;
                            }
                            break;
                    }
                };
                TrackControl.prototype.prepareItemContainerOverride = function (control, item) {
                    var _this = this;
                    _super.prototype.prepareItemContainerOverride.call(this, control, item);
                    var itemControl = control;
                    itemControl.selectedEvent.addHandler(function (e) {
                        _this.onSelectionChangedByUser();
                        if (_this.selectedItem === item) {
                            if (!itemControl.isFocused()) {
                                itemControl.focus();
                            }
                            else {
                                _this.selectedItem = null;
                            }
                        }
                        else {
                            _this.selectedItem = item;
                        }
                    });
                };
                TrackControl.prototype.findItem = function (predicate) {
                    var count = this.getItemCount();
                    for (var i = 0; i < count; ++i) {
                        var item = this.getItem(i);
                        if (predicate(item)) {
                            return item;
                        }
                    }
                    return null;
                };
                TrackControl.prototype.setVisible = function (isVisible) {
                    var className = null;
                    if (isVisible) {
                        className = "display-block";
                    }
                    else {
                        className = "display-none";
                    }
                    this.panelClassName = className;
                };
                TrackControl.prototype.restoreFocus = function () {
                    var selectedControl = this.getSelectedControl(this.selectedItem);
                    if (selectedControl !== null) {
                        selectedControl.focus();
                    }
                };
                TrackControl.prototype.queryNextDataEventOverride = function (currentItem, isUserInput) {
                };
                TrackControl.prototype.queryPreviousDataEventOverride = function (currentItem, isUserInput) {
                };
                TrackControl.prototype.onMouseOverOverride = function (evt) {
                };
                TrackControl.prototype.onMouseOutOverride = function (evt) {
                };
                TrackControl.prototype.getEventTargetControl = function (targetElement) {
                    if (targetElement == null) {
                        return null;
                    }
                    var control = targetElement.control;
                    if ((control === this) || (control instanceof Controls.TrackItem)) {
                        return control;
                    }
                    return this.getEventTargetControl(targetElement.parentElement);
                };
                TrackControl.prototype.onSelectedItemChanged = function (oldValue, newValue) {
                    if (this._lastSelectedControl) {
                        this._lastSelectedControl.isSelected = false;
                    }
                    if ((typeof (this.selectedItem) === "undefined") || (this.selectedItem === null)) {
                        this.selectedIndex = TrackControl.ClearSelectionIndex;
                        this._lastSelectedControl = null;
                    }
                    else {
                        var selectedControl = this.getSelectedControl(this.selectedItem);
                        if (selectedControl !== null) {
                            selectedControl.isSelected = true;
                            if (this._viewport.isVisible && this.isSelectedByUserInput) {
                                selectedControl.focus();
                            }
                        }
                        this.selectedIndex = this.getIndex(this.selectedItem);
                        this._lastSelectedControl = selectedControl;
                    }
                    if (this.selectedItem != null && this.isSelectedByUserInput && this._viewport.isVisible) {
                        this._viewport.disableAutoScrolling();
                    }
                    this.selectionChangedEvent.invoke({
                        selectedItem: this.selectedItem,
                        previousSelectedItem: oldValue,
                        isSelectedByUserInput: this.isSelectedByUserInput
                    });
                    this.isSelectedByUserInput = false;
                };
                TrackControl.prototype.getSelectedControl = function (item) {
                    var controls = this.getAllItemControls();
                    for (var i = 0; i < controls.length; ++i) {
                        var control = controls[i];
                        if (control.model === item) {
                            return control;
                        }
                    }
                    return null;
                };
                TrackControl.prototype.onSelectedIndexChanged = function (oldValue, newValue) {
                    if ((typeof (this.selectedIndex) === "undefined") || (this.selectedIndex === TrackControl.ClearSelectionIndex)) {
                        this.selectedItem = null;
                    }
                    else {
                        var item = this.getItem(this.selectedIndex);
                        this.selectedItem = item;
                    }
                };
                TrackControl.prototype.selectNextItem = function () {
                    if ((this.selectedIndex === TrackControl.ClearSelectionIndex) && this.getItemCount() > 0) {
                        this.onSelectionChangedByUser();
                        this.selectedIndex = 0;
                    }
                    else if (this.selectedIndex < this.getItemCount() - 1) {
                        this.onSelectionChangedByUser();
                        ++this.selectedIndex;
                    }
                    else {
                        this.queryNextDataEvent(this.selectedItem, true);
                    }
                };
                TrackControl.prototype.selectPreviousItem = function () {
                    if (this.selectedIndex === 0) {
                        this.queryPreviousDataEvent(this.selectedItem, true);
                    }
                    else if (this.selectedIndex > 0) {
                        this.onSelectionChangedByUser();
                        --this.selectedIndex;
                    }
                };
                TrackControl.prototype.queryNextDataEvent = function (currentItem, isUserInput) {
                    this.queryNextDataEventOverride(currentItem, isUserInput);
                };
                TrackControl.prototype.queryPreviousDataEvent = function (currentItem, isUserInput) {
                    this.queryPreviousDataEventOverride(currentItem, isUserInput);
                };
                TrackControl.prototype.onSelectionChangedByUser = function () {
                    this.isSelectedByUserInput = true;
                };
                TrackControl.prototype.userInputEventWrapper = function (evt, handler) {
                    if (evt == null || handler == null) {
                        return;
                    }
                    var control = this.getEventTargetControl(evt.target);
                    return handler(evt, control);
                };
                TrackControl.prototype.onKeyDown = function (evt, control) {
                    switch (evt.keyCode) {
                        case DiagHub.Common.KeyCodes.ArrowLeft:
                            this.selectPreviousItem();
                            break;
                        case DiagHub.Common.KeyCodes.ArrowRight:
                            this.selectNextItem();
                            break;
                    }
                    if ((control != null) && (control !== this)) {
                        var itemControl = control;
                        itemControl.onKeyDown(evt);
                    }
                };
                TrackControl.prototype.onKeyUp = function (evt, control) {
                    if ((control != null) && (control !== this)) {
                        var itemControl = control;
                        itemControl.onKeyUp(evt);
                    }
                };
                TrackControl.prototype.onMouseOver = function (evt, control) {
                    if ((control != null) && (control !== this)) {
                        var itemControl = control;
                        itemControl.onMouseOver(evt);
                    }
                    this.onMouseOverOverride(evt);
                };
                TrackControl.prototype.onMouseOut = function (evt, control) {
                    if ((control != null) && (control !== this)) {
                        var itemControl = control;
                        itemControl.onMouseOut(evt);
                    }
                    this.onMouseOutOverride(evt);
                };
                TrackControl.prototype.onMouseClick = function (evt, control) {
                    if ((control != null) && (control !== this)) {
                        var itemControl = control;
                        itemControl.onMouseClick(evt);
                    }
                };
                TrackControl.prototype.onMouseDown = function (evt, control) {
                    if (control === this) {
                    }
                    else if (control != null) {
                        var itemControl = control;
                        itemControl.onMouseDown(evt);
                    }
                };
                TrackControl.prototype.onMouseUp = function (evt, control) {
                    if (control === this) {
                    }
                    else if (control != null) {
                        var itemControl = control;
                        itemControl.onMouseUp(evt);
                    }
                };
                TrackControl.prototype.navigateNextItem = function () {
                    this.selectNextItem();
                };
                TrackControl.prototype.navigatePreviousItem = function () {
                    this.selectPreviousItem();
                };
                TrackControl.SelectedItemPropertyName = "selectedItem";
                TrackControl.SelectedIndexPropertyName = "selectedIndex";
                TrackControl.AriaLabelPropertyName = "ariaLabel";
                TrackControl.PanelClassPropertyName = "panelClassName";
                TrackControl.ClearSelectionIndex = -1;
                return TrackControl;
            }(IntelliTrace.Controls.ItemsControl));
            Controls.TrackControl = TrackControl;
            TrackControl.initialize();
        })(Controls = DiagnosticsHub.Controls || (DiagnosticsHub.Controls = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var EventSelectionManager = (function () {
            function EventSelectionManager(tracks) {
                var _this = this;
                this._selectedDiagnosticDataId = null;
                this._selectedTrack = null;
                this._isUserInput = false;
                this._logger = DiagHub.getLogger();
                this._tracks = tracks;
                this.selectionChangedEvent = new IntelliTrace.Common.EventSource();
                tracks.forEach(function (track) {
                    if (track) {
                        track.selectionChangedEvent.addHandler(function (eventArgs) {
                            if (eventArgs) {
                                _this.setSelectedByTrackAndItem(track, eventArgs.selectedItem, eventArgs.previousSelectedItem, eventArgs.isSelectedByUserInput);
                            }
                        });
                    }
                });
            }
            EventSelectionManager.prototype.isSelected = function (item) {
                return this._selectedDiagnosticDataId === item.diagnosticDataId;
            };
            EventSelectionManager.prototype.restoreSelectedTrackAndItem = function () {
                var _this = this;
                if (this._selectedTrack != null && this._selectedDiagnosticDataId !== null) {
                    var selectedItem = this._selectedTrack.findItem(function (item) {
                        return item.diagnosticDataId === _this._selectedDiagnosticDataId;
                    });
                    if (selectedItem !== null) {
                        if (this._selectedTrack.selectedItem !== selectedItem) {
                            if (this._isUserInput) {
                                this._selectedTrack.onSelectionChangedByUser();
                                this._isUserInput = false;
                            }
                            this._selectedTrack.selectedItem = selectedItem;
                        }
                    }
                    else {
                        this._logger.warning("Failed to find selected item.");
                    }
                }
            };
            EventSelectionManager.prototype.clearSelection = function () {
                this.setSelectedByTrackAndItem(null, null, null, false);
            };
            EventSelectionManager.prototype.storeSelectedTrackAndId = function (track, diagnosticDataId, isUserInput) {
                this._selectedTrack = track;
                this._selectedDiagnosticDataId = diagnosticDataId;
                this._isUserInput = isUserInput;
            };
            EventSelectionManager.prototype.selectByDiagnosticDataId = function (diagnosticDataId) {
                if (diagnosticDataId !== DiagnosticsHub.PortMarshallerConstants.InvalidDiagnosticDataId) {
                    for (var i = 0; i < this._tracks.length; ++i) {
                        var track = this._tracks[i];
                        if (track) {
                            var matchingItem = track.findItem(function (item) {
                                return item.diagnosticDataId === diagnosticDataId;
                            });
                            if (matchingItem != null) {
                                track.selectedItem = matchingItem;
                                return;
                            }
                        }
                    }
                }
                this.clearSelection();
            };
            EventSelectionManager.prototype.setSelectedByTrackAndItem = function (selectedTrack, selectedItem, previousSelectedItem, isSelectedByUserInput) {
                if (this._selectedTrack !== selectedTrack) {
                    if (this._selectedTrack != null) {
                        previousSelectedItem = this._selectedTrack.selectedItem;
                        this._selectedTrack.selectedItem = null;
                    }
                    this._selectedTrack = selectedTrack;
                }
                if (this._selectedTrack != null) {
                    this._selectedTrack.selectedItem = selectedItem;
                }
                if (selectedItem !== null) {
                    this._selectedDiagnosticDataId = selectedItem.diagnosticDataId;
                }
                else {
                    this._selectedDiagnosticDataId = null;
                }
                this.selectionChangedEvent.invoke({
                    selectedItem: selectedItem,
                    previousSelectedItem: previousSelectedItem,
                    isSelectedByUserInput: isSelectedByUserInput || this._isUserInput
                });
                this._isUserInput = false;
            };
            return EventSelectionManager;
        }());
        DiagnosticsHub.EventSelectionManager = EventSelectionManager;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var IntelliTracePortMarshaller = (function () {
            function IntelliTracePortMarshaller() {
                this._adapter = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject(DiagnosticsHub.PortMarshallerConstants.PortMarshallerName, {}, true);
            }
            IntelliTracePortMarshaller.prototype.addSwimlaneDataChangedEventListener = function (listener) {
                this._adapter.addEventListener(DiagnosticsHub.PortMarshallerConstants.SwimlaneDataChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.removeSwimlaneDataChangedEventListener = function (listener) {
                this._adapter.removeEventListener(DiagnosticsHub.PortMarshallerConstants.SwimlaneDataChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.addTabularViewSelectionChangedEventListener = function (listener) {
                this._adapter.addEventListener(DiagnosticsHub.PortMarshallerConstants.TabularViewSelectionChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.removeTabularViewSelectionChangedEventListener = function (listener) {
                this._adapter.removeEventListener(DiagnosticsHub.PortMarshallerConstants.TabularViewSelectionChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.addDebugModeChangedEventListener = function (listener) {
                this._adapter.addEventListener(DiagnosticsHub.PortMarshallerConstants.DebugModeChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.removeDebugModeChangedEventListener = function (listener) {
                this._adapter.removeEventListener(DiagnosticsHub.PortMarshallerConstants.DebugModeChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.addActivatedDataChangedEventListener = function (listener) {
                this._adapter.addEventListener(DiagnosticsHub.PortMarshallerConstants.ActivatedDataChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.removeActivatedDataChangedEventListener = function (listener) {
                this._adapter.removeEventListener(DiagnosticsHub.PortMarshallerConstants.ActivatedDataChangedEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.addFocusOnLastBreakEventListener = function (listener) {
                this._adapter.addEventListener(DiagnosticsHub.PortMarshallerConstants.FocusOnLastBreakEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.removeFocusOnLastBreakEventListener = function (listener) {
                this._adapter.removeEventListener(DiagnosticsHub.PortMarshallerConstants.FocusOnLastBreakEvent, listener);
            };
            IntelliTracePortMarshaller.prototype.notifySelectionTimeRangeChanged = function (timeRangeBeginNanoseconds, timeRangeEndNanoseconds) {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifySelectionTimeRangeChanged, timeRangeBeginNanoseconds, timeRangeEndNanoseconds);
            };
            IntelliTracePortMarshaller.prototype.notifyViewPortChanged = function (timeRangeBeginNanoseconds, timeRangeEndNanoseconds) {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifyViewPortChanged, timeRangeBeginNanoseconds, timeRangeEndNanoseconds);
            };
            IntelliTracePortMarshaller.prototype.notifyClientSizeChanged = function (clientWidth) {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifyClientSizeChanged, clientWidth);
            };
            IntelliTracePortMarshaller.prototype.notifySwimlaneIsVisibleChanged = function (isVisible) {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifySwimlaneIsVisibleChanged, isVisible);
            };
            IntelliTracePortMarshaller.prototype.notifySwimlaneDataSelectionChanged = function (diagnosticDataId) {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifySwimlaneDataSelectionChanged, diagnosticDataId);
            };
            IntelliTracePortMarshaller.prototype.notifyQueryPreviousBreakEvent = function (timeInNanoseconds) {
                return this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifyQueryPreviousBreakEvent, timeInNanoseconds);
            };
            IntelliTracePortMarshaller.prototype.notifyQueryNextBreakEvent = function (timeInNanoseconds) {
                return this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifyQueryNextBreakEvent, timeInNanoseconds);
            };
            IntelliTracePortMarshaller.prototype.notifyReadyForData = function () {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifyReadyForData);
            };
            IntelliTracePortMarshaller.prototype.notifyViewableViewportBase = function (base) {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.NotifyViewableViewportBase, base);
            };
            IntelliTracePortMarshaller.prototype.acknowledgeData = function () {
                this._adapter._call(DiagnosticsHub.PortMarshallerConstants.SwimlaneAcknowledgeData);
            };
            return IntelliTracePortMarshaller;
        }());
        DiagnosticsHub.IntelliTracePortMarshaller = IntelliTracePortMarshaller;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Controls;
        (function (Controls) {
            "use strict";
            var BreakEventTrackControl = (function (_super) {
                __extends(BreakEventTrackControl, _super);
                function BreakEventTrackControl(trackName, templateId, viewport, portMarshaller, breakEventKindId) {
                    _super.call(this, trackName, templateId, viewport);
                    this._logger = null;
                    this._selectionManager = null;
                    this._selectionChangedRegistration = null;
                    this._logger = DiagHub.getLogger();
                    this.itemContainerControl = "IntelliTrace.DiagnosticsHub.Controls.BreakEventItem(DiagnosticsHubControlTemplate.breakEventButtonTemplate)";
                    this.tabIndex = 0;
                    this._portMarshaller = portMarshaller;
                    this._lastNonStepBreakEventStartTime = 0;
                    this._breakEventKindId = breakEventKindId;
                }
                Object.defineProperty(BreakEventTrackControl.prototype, "selectionManager", {
                    set: function (value) {
                        this._selectionManager = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                BreakEventTrackControl.prototype.render = function (fullRender, refresh) {
                    if (fullRender) {
                        if (this._selectionChangedRegistration !== null) {
                            this._selectionChangedRegistration.unregister();
                        }
                        this._selectionChangedRegistration = this.selectionChangedEvent.addHandler(this.onSelectionChanged.bind(this));
                    }
                };
                BreakEventTrackControl.prototype.queryNextDataEventOverride = function (item, isUserInput) {
                    var _this = this;
                    if (!item) {
                        return;
                    }
                    this._portMarshaller.notifyQueryNextBreakEvent(item.timeInNanoseconds).done(function (diagnosticEventData) {
                        if (diagnosticEventData != null) {
                            _this.scrollToNextBreakEvent(diagnosticEventData.EventStartTimeNanoseconds, diagnosticEventData.EventEndTimeNanoseconds, diagnosticEventData.DiagnosticDataId, isUserInput);
                        }
                    });
                };
                BreakEventTrackControl.prototype.scrollToNextBreakEvent = function (beginTime, endTime, diagnosticDataId, isUserInput) {
                    if (this._selectionManager !== null) {
                        this._selectionManager.storeSelectedTrackAndId(this, diagnosticDataId, isUserInput);
                    }
                    if (endTime === beginTime) {
                        endTime = beginTime + 1;
                    }
                    var duration = endTime - beginTime;
                    var newViewportBegin = 0;
                    var accountForBorder = this._viewport.nanosecondsPerPixel;
                    if (duration < this._viewport.timeRange.duration) {
                        newViewportBegin = endTime - this._viewport.timeRange.duration;
                        newViewportBegin += accountForBorder;
                    }
                    else {
                        newViewportBegin = beginTime - accountForBorder;
                    }
                    var newSelectedTime = new DiagHub.JsonTimespan(DiagHub.BigNumber.convertFromNumber(beginTime), DiagHub.BigNumber.convertFromNumber(endTime));
                    this._viewport.alignViewportWithSelectedTime(newViewportBegin, newSelectedTime);
                };
                BreakEventTrackControl.prototype.queryPreviousDataEventOverride = function (item, isUserInput) {
                    var _this = this;
                    if (!item) {
                        return;
                    }
                    this._portMarshaller.notifyQueryPreviousBreakEvent(item.timeInNanoseconds).done(function (diagnosticEventData) {
                        if (diagnosticEventData != null) {
                            _this.scrollToPreviousBreakEvent(diagnosticEventData.EventStartTimeNanoseconds, diagnosticEventData.EventEndTimeNanoseconds, diagnosticEventData.DiagnosticDataId, isUserInput);
                        }
                    });
                };
                BreakEventTrackControl.prototype.scrollToPreviousBreakEvent = function (beginTime, endTime, diagnosticDataId, isUserInput) {
                    if (this._selectionManager !== null) {
                        this._selectionManager.storeSelectedTrackAndId(this, diagnosticDataId, isUserInput);
                    }
                    if (beginTime === endTime) {
                        endTime = beginTime + 1;
                    }
                    var duration = endTime - beginTime;
                    var accountForBorder = this._viewport.nanosecondsPerPixel;
                    var newViewportBegin = 0;
                    if (duration > this._viewport.timeRange.duration) {
                        newViewportBegin = endTime - this._viewport.timeRange.duration;
                        newViewportBegin += accountForBorder;
                    }
                    else {
                        newViewportBegin = beginTime - accountForBorder;
                    }
                    var newSelectedTime = new DiagHub.JsonTimespan(DiagHub.BigNumber.convertFromNumber(beginTime), DiagHub.BigNumber.convertFromNumber(endTime));
                    this._viewport.alignViewportWithSelectedTime(newViewportBegin, newSelectedTime);
                };
                BreakEventTrackControl.prototype.onSelectionChanged = function (eventArgs) {
                    var selectedItem = eventArgs.selectedItem;
                    var isSelectedByUserInput = eventArgs.isSelectedByUserInput;
                    if (!selectedItem) {
                        return;
                    }
                    if (isSelectedByUserInput && this._selectionManager !== null) {
                        var accountForBorder = this._viewport.nanosecondsPerPixel;
                        var newViewportBegin = null;
                        if (this._viewport.isBeforeViewport(selectedItem.timeInNanoseconds)) {
                            if (selectedItem.duration > this._viewport.timeRange.duration) {
                                newViewportBegin = (selectedItem.timeInNanoseconds + selectedItem.duration) - this._viewport.timeRange.duration;
                                newViewportBegin += accountForBorder;
                            }
                            else {
                                newViewportBegin = selectedItem.timeInNanoseconds - accountForBorder;
                            }
                        }
                        else if (this._viewport.isAfterViewport(selectedItem.timeInNanoseconds + selectedItem.duration)) {
                            if (selectedItem.duration < this._viewport.timeRange.duration) {
                                newViewportBegin = (selectedItem.timeInNanoseconds + selectedItem.duration) - this._viewport.timeRange.duration;
                                newViewportBegin += accountForBorder;
                            }
                            else {
                                newViewportBegin = selectedItem.timeInNanoseconds - accountForBorder;
                            }
                        }
                        var duration = Math.max(1, selectedItem.duration);
                        if (newViewportBegin !== null) {
                            var newSelectedTime = new DiagHub.JsonTimespan(DiagHub.BigNumber.convertFromNumber(selectedItem.timeInNanoseconds), DiagHub.BigNumber.convertFromNumber(selectedItem.timeInNanoseconds + duration));
                            var willViewportChanged = ((newViewportBegin < 0) ||
                                this._viewport.viewableBase.greaterOrEqual(DiagHub.BigNumber.convertFromNumber(newViewportBegin))) &&
                                this._viewport.viewableBase.equals(this._viewport.timeRange.beginInHubTime);
                            if (willViewportChanged) {
                                this._selectionManager.storeSelectedTrackAndId(this, selectedItem.diagnosticDataId, true);
                            }
                            this._viewport.alignViewportWithSelectedTime(newViewportBegin, newSelectedTime);
                        }
                        else {
                            this._viewport.selectTimeRange(selectedItem.timeInNanoseconds, selectedItem.timeInNanoseconds + duration);
                        }
                    }
                };
                BreakEventTrackControl.prototype.onMouseOverOverride = function (evt) {
                    var targetControl = this.getEventTargetControl(evt.target);
                    if (targetControl instanceof Controls.BreakEventItem) {
                        this.panelClassName = "display-block show-hat";
                    }
                };
                BreakEventTrackControl.prototype.onMouseOutOverride = function (evt) {
                    var targetControl = this.getEventTargetControl(evt.target);
                    if (targetControl instanceof Controls.BreakEventItem) {
                        this.panelClassName = "display-block";
                    }
                };
                return BreakEventTrackControl;
            }(Controls.TrackControl));
            Controls.BreakEventTrackControl = BreakEventTrackControl;
        })(Controls = DiagnosticsHub.Controls || (DiagnosticsHub.Controls = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Controls;
        (function (Controls) {
            "use strict";
            var DiscreteEventItem = (function (_super) {
                __extends(DiscreteEventItem, _super);
                function DiscreteEventItem() {
                    _super.apply(this, arguments);
                }
                DiscreteEventItem.prototype.onTooltipChangedOverride = function () {
                    _super.prototype.onTooltipChangedOverride.call(this);
                    var clickableArea = this.rootElement.children[0];
                    if (typeof (clickableArea) === "undefined" || clickableArea === null) {
                        IntelliTrace.Common.Diagnostics.Assert.fail("Malformed root element attached to IntelliTrace event track item control.");
                    }
                    if (this.tooltip) {
                        clickableArea.setAttribute("data-plugin-vs-tooltip", this.tooltip);
                    }
                    else {
                        clickableArea.removeAttribute("data-plugin-vs-tooltip");
                    }
                };
                DiscreteEventItem.prototype.onModelChanged = function (oldModel, newModel) {
                    _super.prototype.onModelChanged.call(this, oldModel, newModel);
                    this.update();
                };
                DiscreteEventItem.prototype.updateOnInteractionOverride = function () {
                    this.update();
                };
                DiscreteEventItem.prototype.update = function () {
                    if (this.model != null) {
                        var debugEventViewModel = this.model;
                        var calculatedOffset = DiagnosticsHub.Converters.itemXOffsetConverter.calculateXOffset(debugEventViewModel.timeInNanoseconds);
                        this.xOffset = calculatedOffset + "px";
                        this.iconClass = "discrete-event " + DiscreteEventItem.getEventIcon(debugEventViewModel.eventColor, this.isSelected, this.isHovered);
                        if (this.isHovered || this.isSelected) {
                            this.iconClass += " " + "discrete-event-size-activated";
                        }
                        else {
                            this.iconClass += " " + "discrete-event-size-normal";
                        }
                    }
                };
                DiscreteEventItem.getEventIcon = function (color, isSelected, isHovered) {
                    var prefix = null;
                    switch (color) {
                        case DiagnosticsHub.EventColor.TracepointColor:
                            prefix = "-tracepoint";
                            break;
                        case DiagnosticsHub.EventColor.UnimportantColor:
                            prefix = "-unimportant";
                            break;
                        case DiagnosticsHub.EventColor.ExceptionColor:
                            prefix = "-exception";
                            break;
                        default:
                            prefix = "-unimportant";
                            break;
                    }
                    if (typeof (prefix) === "undefined" || prefix === null) {
                        IntelliTrace.Common.Diagnostics.Assert.fail("Unrecognized event type in break event item control.");
                        return "";
                    }
                    var location = "timeline";
                    var theme = "-light";
                    return location + theme + ((isSelected || isHovered) ? "-selected" : "") + prefix;
                };
                DiscreteEventItem.initialize = function () {
                    IntelliTrace.Common.ObservableHelpers.defineProperty(DiscreteEventItem, DiscreteEventItem.IconClassPropertyName, "");
                    IntelliTrace.Common.ObservableHelpers.defineProperty(DiscreteEventItem, DiscreteEventItem.XOffsetPropertyName, "0px");
                };
                DiscreteEventItem.IconClassPropertyName = "iconClass";
                DiscreteEventItem.XOffsetPropertyName = "xOffset";
                return DiscreteEventItem;
            }(IntelliTrace.DiagnosticsHub.Controls.TrackItem));
            Controls.DiscreteEventItem = DiscreteEventItem;
            DiscreteEventItem.initialize();
        })(Controls = DiagnosticsHub.Controls || (DiagnosticsHub.Controls = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        var Controls;
        (function (Controls) {
            "use strict";
            var DiscreteEventTrackControl = (function (_super) {
                __extends(DiscreteEventTrackControl, _super);
                function DiscreteEventTrackControl(trackName, templateId, viewport) {
                    _super.call(this, trackName, templateId, viewport);
                    this._selectionChangedRegistration = null;
                }
                DiscreteEventTrackControl.prototype.render = function (fullRender, refresh) {
                    if (fullRender) {
                        if (this._selectionChangedRegistration !== null) {
                            this._selectionChangedRegistration.unregister();
                        }
                        this._selectionChangedRegistration = this.selectionChangedEvent.addHandler(this.onSelectionChanged.bind(this));
                    }
                };
                DiscreteEventTrackControl.prototype.onSelectionChanged = function (eventArgs) {
                    var selectedItem = eventArgs.selectedItem;
                    var isSelectedByUserInput = eventArgs.isSelectedByUserInput;
                    if ((selectedItem != null) && isSelectedByUserInput) {
                        this._viewport.ensureTimeInsideSelection(this.selectedItem.timeInNanoseconds);
                    }
                };
                return DiscreteEventTrackControl;
            }(Controls.TrackControl));
            Controls.DiscreteEventTrackControl = DiscreteEventTrackControl;
        })(Controls = DiagnosticsHub.Controls || (DiagnosticsHub.Controls = {}));
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var ResourceManager = (function () {
            function ResourceManager(resourceStrings) {
                IntelliTrace.Common.Diagnostics.Assert.hasValue(resourceStrings, "Invalid resourceStrings parameter");
                this._resourceStrings = resourceStrings;
            }
            ResourceManager.prototype.getResource = function (resourceName) {
                if (this._resourceStrings && this._resourceStrings.hasOwnProperty(resourceName)) {
                    return this._resourceStrings[resourceName];
                }
                else {
                    return "";
                }
            };
            return ResourceManager;
        }());
        DiagnosticsHub.ResourceManager = ResourceManager;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var TrackControlAndData = (function () {
            function TrackControlAndData(trackControl, localizedName) {
                this._trackControl = null;
                this._trackLocalizedName = null;
                this._visibleEventList = null;
                this._trackControl = trackControl;
                this._visibleEventList = new IntelliTrace.Common.SortedObservableCollection(DiagnosticsHub.DebugEventViewModel.EventOrderComparator);
                this._trackLocalizedName = localizedName;
            }
            Object.defineProperty(TrackControlAndData.prototype, "trackControl", {
                get: function () {
                    return this._trackControl;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TrackControlAndData.prototype, "visibleEventList", {
                get: function () {
                    return this._visibleEventList;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TrackControlAndData.prototype, "trackLocalizedName", {
                get: function () {
                    return this._trackLocalizedName;
                },
                enumerable: true,
                configurable: true
            });
            return TrackControlAndData;
        }());
        DiagnosticsHub.TrackControlAndData = TrackControlAndData;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var EventsSwimlane = (function () {
            function EventsSwimlane(graphConfig, resources, portMarshaller, isVisible, viewportController) {
                this._rootElement = null;
                this._hasFocus = false;
                this._activatedEventIndicator = null;
                this._liveEventViewModel = null;
                this._breakTrackControlCache = null;
                this._eventTrackControlAndData = [];
                this._eventKindIdToTrackMap = {};
                this._eventKindIdToName = {};
                this._breakEventKindId = DiagnosticsHub.PortMarshallerConstants.InvalidEventKindId;
                this._viewport = null;
                this._selectionManager = null;
                this._activatedEventViewModel = null;
                this._logger = DiagHub.getLogger();
                this._logger.debug("IntelliTraceSwimlane: constructor()");
                this._resourceManager = new DiagnosticsHub.ResourceManager(resources);
                this._portMarshaller = portMarshaller;
                this._graphConfig = graphConfig;
                this._viewport = new DiagnosticsHub.SwimlaneViewport(viewportController);
                this._viewport.isVisible = isVisible;
                this._breakEventKindId = this._graphConfig.eventKindNameToId[DiagnosticsHub.PortMarshallerConstants.BreakEventKindName];
                this._eventKindIdToName = this._graphConfig.eventKindIdToName;
                DiagnosticsHub.Converters.itemXOffsetConverter.swimlaneViewport = this._viewport;
                this.selectionChangedEvent = new IntelliTrace.Common.EventSource();
            }
            EventsSwimlane.prototype.initializeEventTracks = function (parentElement) {
                var _this = this;
                if (parentElement) {
                    var swimlaneControl = new IntelliTrace.Common.TemplateControl("DiagnosticsHubControlTemplate.swimlaneTemplate");
                    parentElement.appendChild(swimlaneControl.rootElement);
                    this._rootElement = (swimlaneControl.rootElement.getElementsByClassName("graph-canvas")[0]);
                    this._focusInEventHandler = this.onFocusIn.bind(this);
                    this._focusOutEventHandler = this.onFocusOut.bind(this);
                    this._rootElement.addEventListener("focusout", this._focusOutEventHandler);
                    this._rootElement.addEventListener("focusin", this._focusInEventHandler);
                    var tracks = new Array();
                    this._graphConfig.trackConfigurations.forEach(function (config) {
                        var trackControl = null;
                        if (config.Id === DiagnosticsHub.PortMarshallerConstants.BreakEventKindName) {
                            trackControl = new IntelliTrace.DiagnosticsHub.Controls.BreakEventTrackControl(config.Id, "DiagnosticsHubControlTemplate.eventTrackTemplate", this._viewport, this._portMarshaller, this._breakEventKindId);
                            this._breakTrackControlCache = trackControl;
                        }
                        else {
                            trackControl = new IntelliTrace.DiagnosticsHub.Controls.DiscreteEventTrackControl(config.Id, "DiagnosticsHubControlTemplate.eventTrackTemplate", this._viewport);
                            trackControl.itemContainerControl = "IntelliTrace.DiagnosticsHub.Controls.DiscreteEventItem(DiagnosticsHubControlTemplate.eventButtonTemplate)";
                        }
                        trackControl.tabIndex = 0;
                        tracks.push(trackControl);
                        var trackControlAndData = new DiagnosticsHub.TrackControlAndData(trackControl, config.LabelTooltip);
                        this.updateTrackAriaAndTooltip(trackControlAndData);
                        this._eventTrackControlAndData.push(trackControlAndData);
                        config.AcceptedEventKindIds.forEach(function (id) {
                            this._eventKindIdToTrackMap[id] = trackControlAndData;
                        }, this);
                    }, this);
                    this._selectionManager = new DiagnosticsHub.EventSelectionManager(tracks);
                    this._selectionManager.selectionChangedEvent.addHandler(function (eventArgs) {
                        _this.selectionChangedEvent.invoke(eventArgs);
                    });
                    if (this._breakTrackControlCache != null) {
                        this._breakTrackControlCache.selectionManager = this._selectionManager;
                    }
                    this._activatedEventIndicator = new DiagnosticsHub.TimeIndicator(this._rootElement, this._viewport);
                }
            };
            EventsSwimlane.prototype.getResource = function (key) {
                return this._resourceManager.getResource(key);
            };
            EventsSwimlane.prototype.isBreakEventKind = function (kind) {
                return this._breakEventKindId === kind;
            };
            EventsSwimlane.prototype.dispose = function () {
                if (this._rootElement !== null) {
                    this._rootElement.removeEventListener("focusout", this._focusOutEventHandler);
                    this._rootElement.removeEventListener("focusin", this._focusInEventHandler);
                }
            };
            EventsSwimlane.prototype.onViewportChanged = function (viewPort) {
                if (!viewPort || !viewPort.begin || !viewPort.end) {
                    this._logger.error("EventsSwimlane.onViewportChanged(): invalid viewPort parameter");
                    return;
                }
                if (this._activatedEventIndicator != null) {
                    this._activatedEventIndicator.render(false);
                }
                if (this._viewport.isViewableBaseChanged()) {
                    this._portMarshaller.notifyViewableViewportBase(DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._viewport.viewableBase));
                }
            };
            EventsSwimlane.prototype.notifyClientSizeChanged = function () {
                if (!this._rootElement) {
                    this._logger.error("EventsSwimlane.notifyClientSizeChanged(): invalid _rootElement");
                    return;
                }
                this._viewport.clientWidth = this._rootElement.clientWidth;
                if (this._activatedEventIndicator != null) {
                    this._activatedEventIndicator.render(false);
                }
                this._portMarshaller.notifyClientSizeChanged(this._viewport.clientWidth);
            };
            EventsSwimlane.prototype.renderTracks = function (fullRender, refresh) {
                if (!this._rootElement) {
                    this._logger.error("EventsSwimlane.renderTracks(): invalid _rootElement");
                    return;
                }
                if (fullRender) {
                    while (this._rootElement.childNodes.length > 0) {
                        this._rootElement.removeChild(this._rootElement.firstChild);
                    }
                    this._eventTrackControlAndData.forEach(function (track) {
                        track.trackControl.items = track.visibleEventList;
                        track.trackControl.render(fullRender, refresh);
                        this._rootElement.appendChild(track.trackControl.rootElement);
                    }, this);
                    this._activatedEventIndicator.render(true);
                }
            };
            EventsSwimlane.prototype.notifyActivatedDataChanged = function (activatedEventArgs) {
                this._activatedEventIndicator.isLiveDebugging = activatedEventArgs.IsLiveDebugging;
                if (activatedEventArgs.DiagnosticData == null) {
                    this._activatedEventIndicator.time = null;
                    this._viewport.enableAutoScrolling();
                }
                else {
                    this._activatedEventIndicator.time = activatedEventArgs.DiagnosticData.EventEndTimeNanoseconds;
                    if (!this._viewport.isInViewport(this._activatedEventIndicator.time)) {
                        this._viewport.centerViewportTo(this._activatedEventIndicator.time);
                    }
                }
                var oldActivatedEvent = this._activatedEventViewModel;
                var newActivatedEvent = null;
                if (activatedEventArgs.DiagnosticData !== null) {
                    var id = activatedEventArgs.DiagnosticData.DiagnosticDataId;
                    if (!this._activatedEventViewModel || id !== this._activatedEventViewModel.diagnosticDataId) {
                        for (var _i = 0, _a = this._eventTrackControlAndData; _i < _a.length; _i++) {
                            var trackControlAndData = _a[_i];
                            var found = trackControlAndData.trackControl.findItem(function (item) {
                                return item.diagnosticDataId === id;
                            });
                            if (found) {
                                newActivatedEvent = found;
                                break;
                            }
                        }
                    }
                }
                if (oldActivatedEvent !== newActivatedEvent) {
                    if (oldActivatedEvent) {
                        oldActivatedEvent.isActivatedEvent = false;
                    }
                    this._activatedEventViewModel = newActivatedEvent;
                    if (newActivatedEvent) {
                        this._activatedEventViewModel.isActivatedEvent = true;
                    }
                }
                this._eventTrackControlAndData.forEach(function (track) {
                    this.updateTrackAriaAndTooltip(track);
                }, this);
                this._activatedEventIndicator.render(false);
            };
            EventsSwimlane.prototype.onDebugModeChanged = function (eventArgs) {
                if (eventArgs != null) {
                    if (eventArgs.NewMode === DiagnosticsHub.DebugMode.Run) {
                        this.resetView();
                    }
                    else if (eventArgs.NewMode === DiagnosticsHub.DebugMode.Design) {
                        this.clearActivatedEventIndicator();
                        var newViewport = new DiagHub.JsonTimespan(this._viewport.viewableBase, this._viewport.viewableEnd);
                        this._viewport.changeViewport(newViewport, newViewport);
                    }
                }
            };
            EventsSwimlane.prototype.focusOnLastBreakEvent = function (eventArgs) {
                var viewableBase = DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._viewport.viewableBase);
                var newViewportEndTime = eventArgs.LastBreakEventEndTime;
                if (newViewportEndTime <= viewableBase) {
                    return;
                }
                var newViewportStartTime = eventArgs.LastBreakEventStartTime;
                if (newViewportStartTime < viewableBase) {
                    newViewportStartTime = viewableBase;
                }
                if (newViewportStartTime === newViewportEndTime) {
                    newViewportEndTime = newViewportStartTime + 1;
                }
                var newSelectedStartTime = eventArgs.LastNonStepBreakEventStartTime;
                var newSelectedEndTime = eventArgs.LastBreakEventEndTime;
                var newSelectedTime = null;
                if (newSelectedStartTime < viewableBase) {
                    newSelectedStartTime = viewableBase;
                }
                if (newSelectedStartTime === newSelectedEndTime) {
                    newSelectedEndTime = newSelectedStartTime + 1;
                }
                newSelectedTime = new DiagHub.JsonTimespan(DiagHub.BigNumber.convertFromNumber(newSelectedStartTime), DiagHub.BigNumber.convertFromNumber(newSelectedEndTime));
                this.updateViewportWithSelectedTimeRange(newViewportStartTime, newViewportEndTime, newSelectedTime);
            };
            EventsSwimlane.prototype.setSelectedEvent = function (eventSelectionArgs) {
                if (eventSelectionArgs.DiagnosticDataId == DiagnosticsHub.PortMarshallerConstants.InvalidDiagnosticDataId) {
                    if (this._viewport.isVisible) {
                        this._selectionManager.clearSelection();
                    }
                }
                else if (!this._viewport.isVisible) {
                    var track = this.getTrackFromEventKind(eventSelectionArgs.Kind);
                    this._selectionManager.storeSelectedTrackAndId(track, eventSelectionArgs.DiagnosticDataId, false);
                }
                else {
                    if (this._viewport.isInViewport(eventSelectionArgs.EventStartTimeNanoseconds) ||
                        ((this.isBreakEventKind(eventSelectionArgs.Kind)) &&
                            (this._viewport.isOverlapViewport(eventSelectionArgs.EventStartTimeNanoseconds, eventSelectionArgs.EventStartTimeNanoseconds + eventSelectionArgs.DurationNanoseconds)))) {
                        this._selectionManager.selectByDiagnosticDataId(eventSelectionArgs.DiagnosticDataId);
                        this._viewport.disableAutoScrolling();
                    }
                    else {
                        var track = this.getTrackFromEventKind(eventSelectionArgs.Kind);
                        this._selectionManager.storeSelectedTrackAndId(track, eventSelectionArgs.DiagnosticDataId, false);
                        if (!this._viewport.viewableBase.greater(DiagHub.BigNumber.convertFromNumber(eventSelectionArgs.EventStartTimeNanoseconds))) {
                            this._viewport.centerViewportTo(eventSelectionArgs.EventStartTimeNanoseconds);
                        }
                        else if ((this.isBreakEventKind(eventSelectionArgs.Kind)) &&
                            !this._viewport.viewableBase.greater(DiagHub.BigNumber.convertFromNumber(eventSelectionArgs.EventStartTimeNanoseconds + eventSelectionArgs.DurationNanoseconds))) {
                            this._viewport.centerViewportTo(eventSelectionArgs.EventStartTimeNanoseconds);
                        }
                    }
                }
            };
            EventsSwimlane.prototype.onSwimlaneVisibilityChanged = function (visible) {
                this._viewport.isVisible = visible;
                this._portMarshaller.notifySwimlaneIsVisibleChanged(visible);
                this._activatedEventIndicator.render(false);
            };
            EventsSwimlane.prototype.onSwimlaneDataChangedEvent = function (eventArgs) {
                this._logger.debug("EventsSwimlane.onSwimlaneDataChangedEvent Action = " + eventArgs.Action);
                if (!this._viewport.isVisible) {
                    return;
                }
                this.updateVisibleData(eventArgs.Action, eventArgs.Data);
                if (eventArgs.RestoreEventSelection) {
                    this.restoreSelection();
                }
                if (this._hasFocus) {
                    this._eventTrackControlAndData.forEach(function (track) {
                        track.trackControl.restoreFocus();
                    });
                }
            };
            EventsSwimlane.prototype.onFocusIn = function (eventArgs) {
                this._hasFocus = true;
            };
            EventsSwimlane.prototype.onFocusOut = function (eventArgs) {
                this._hasFocus = false;
            };
            EventsSwimlane.prototype.resetView = function () {
                this._viewport.enableAutoScrolling();
                this._viewport.clearTimeSelection();
            };
            EventsSwimlane.prototype.clearActivatedEventIndicator = function () {
                this._activatedEventIndicator.time = null;
                this._activatedEventIndicator.render(false);
            };
            EventsSwimlane.prototype.updateVisibleData = function (action, eventList) {
                if (!this._viewport.isVisible) {
                    return;
                }
                this._eventTrackControlAndData.forEach(function (track) {
                    track.trackControl.setVisible(false);
                });
                if (action === DiagnosticsHub.SwimlaneDataChangedAction.Reset || action === DiagnosticsHub.SwimlaneDataChangedAction.Clear) {
                    this._eventTrackControlAndData.forEach(function (track) {
                        track.visibleEventList.clear();
                    });
                }
                if (action === DiagnosticsHub.SwimlaneDataChangedAction.Reset || action === DiagnosticsHub.SwimlaneDataChangedAction.Add) {
                    this.addVisibleData(eventList);
                }
                this._eventTrackControlAndData.forEach(function (track) {
                    this.updateTrackAriaAndTooltip(track);
                    track.trackControl.setVisible(true);
                }, this);
            };
            EventsSwimlane.prototype.addVisibleData = function (eventList) {
                var trackEvents = {};
                var track = null;
                for (var i = 0; i < eventList.length; ++i) {
                    var data = eventList[i];
                    var eventKind = data.Kind;
                    track = this._eventKindIdToTrackMap[eventKind];
                    if (track == null) {
                        continue;
                    }
                    var eventViewModels = trackEvents[eventKind];
                    if (!eventViewModels) {
                        eventViewModels = [];
                        trackEvents[eventKind] = eventViewModels;
                    }
                    var eventViewModel = this.createEventViewModel(eventList[i]);
                    if (eventViewModel !== null) {
                        eventViewModels.push(eventViewModel);
                    }
                }
                for (var key in trackEvents) {
                    var eventViewModels = trackEvents[key];
                    track = this._eventKindIdToTrackMap[key];
                    if (track != null && eventViewModels.length > 0) {
                        track.visibleEventList.pushAllSorted(eventViewModels, true);
                    }
                }
            };
            EventsSwimlane.prototype.createEventViewModel = function (diagnosticEvent) {
                var diagnosticEventTimeNanoseconds = diagnosticEvent.EventEndTimeNanoseconds;
                var diagnosticEventStartTimeNanoseconds = diagnosticEvent.EventStartTimeNanoseconds;
                if (this.isBreakEventKind(diagnosticEvent.Kind)) {
                    if (this._viewport.isOverlapViewport(diagnosticEventStartTimeNanoseconds, diagnosticEventTimeNanoseconds)) {
                        var eventTimeNanoseconds = diagnosticEventStartTimeNanoseconds;
                        var durationNanoseconds = diagnosticEventTimeNanoseconds - diagnosticEventStartTimeNanoseconds;
                        IntelliTrace.Common.Diagnostics.Assert.isTrue(durationNanoseconds >= 0, "Duration should not be negative.");
                        return this.createEventViewModelHelper(diagnosticEvent, eventTimeNanoseconds, durationNanoseconds);
                    }
                    return null;
                }
                else if (this._viewport.isInViewport(diagnosticEventTimeNanoseconds)) {
                    var eventTimeNanoseconds = diagnosticEventTimeNanoseconds;
                    return this.createEventViewModelHelper(diagnosticEvent, eventTimeNanoseconds, durationNanoseconds);
                }
                return null;
            };
            EventsSwimlane.prototype.createEventViewModelHelper = function (diagnosticEvent, eventTimeNanoseconds, durationNanoseconds) {
                var viewModel = new DiagnosticsHub.DebugEventViewModel(this, eventTimeNanoseconds, diagnosticEvent.Kind, diagnosticEvent.Color, diagnosticEvent.BreakType, diagnosticEvent.CategoryName, diagnosticEvent.ShortDescription, diagnosticEvent.DiagnosticDataId, durationNanoseconds);
                if (this._activatedEventViewModel && this._activatedEventViewModel.diagnosticDataId === diagnosticEvent.DiagnosticDataId) {
                    viewModel.isActivatedEvent = true;
                }
                var telemetryType = diagnosticEvent.TelemetryType;
                if (telemetryType != null) {
                    viewModel.telemetryType = telemetryType;
                }
                else {
                    viewModel.telemetryType = this._eventKindIdToName[diagnosticEvent.Kind];
                }
                var snapshotStatus = diagnosticEvent.SnapshotStatus;
                if (snapshotStatus != null) {
                    viewModel.snapshotStatus = snapshotStatus;
                }
                else {
                    viewModel.snapshotStatus = DiagnosticsHub.SnapshotStatus.None;
                }
                return viewModel;
            };
            EventsSwimlane.prototype.getTrackFromEventKind = function (kind) {
                var track = this._eventKindIdToTrackMap[kind];
                return (track != null) ? track.trackControl : null;
            };
            EventsSwimlane.prototype.restoreSelection = function () {
                if (this._selectionManager !== null) {
                    this._selectionManager.restoreSelectedTrackAndItem();
                }
            };
            EventsSwimlane.prototype.updateViewportWithSelectedTimeRange = function (eventBeginTime, eventEndTime, newSelectedTime) {
                var lastBreakEventDuration = eventEndTime - eventBeginTime;
                var breakEventDurationRatio = 0.05;
                var rightMarginRatio = 0.02;
                var newViewportBeginTime = null;
                var newViewportEndTime = null;
                if (lastBreakEventDuration < this._viewport.timeRange.duration * breakEventDurationRatio) {
                    var newTimeRangeDurationInNanoseconds = lastBreakEventDuration / breakEventDurationRatio;
                    var rightMargin = rightMarginRatio * newTimeRangeDurationInNanoseconds;
                    var newViewportEndTimeInNanoseconds = eventEndTime + rightMargin;
                    var newViewportBeginTimeInNanoseconds = Math.max(newViewportEndTimeInNanoseconds - newTimeRangeDurationInNanoseconds, 0);
                    newViewportBeginTime = DiagHub.BigNumber.convertFromNumber(newViewportBeginTimeInNanoseconds);
                    if (this._viewport.viewableBase.greaterOrEqual(newViewportBeginTime)) {
                        newViewportBeginTime = this._viewport.viewableBase;
                        newViewportEndTime = DiagHub.BigNumber.add(this._viewport.viewableBase, DiagHub.BigNumber.convertFromNumber(newTimeRangeDurationInNanoseconds));
                    }
                    else {
                        newViewportEndTime = DiagHub.BigNumber.convertFromNumber(newViewportEndTimeInNanoseconds);
                    }
                    var newViewport = new DiagHub.JsonTimespan(newViewportBeginTime, newViewportEndTime);
                    this._viewport.changeViewport(newViewport, newSelectedTime);
                }
                else if (eventBeginTime < this._viewport.timeRange.begin || eventEndTime > this._viewport.timeRange.end) {
                    if (eventEndTime - eventBeginTime > this._viewport.timeRange.duration * (1 - rightMarginRatio) * 2 / 3) {
                        var leftMargin = lastBreakEventDuration / 2;
                        var newViewportBeginTimeInNanoseconds = eventBeginTime - leftMargin;
                        var viewableBaseInNanoseconds = DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._viewport.viewableBase);
                        if (newViewportBeginTimeInNanoseconds > viewableBaseInNanoseconds) {
                            newViewportBeginTime = DiagHub.BigNumber.convertFromNumber(newViewportBeginTimeInNanoseconds);
                            var newViewportEndTimeInNanoseconds = newViewportBeginTimeInNanoseconds + ((eventEndTime - newViewportBeginTimeInNanoseconds) / (1 - rightMarginRatio));
                            newViewportEndTime = DiagHub.BigNumber.convertFromNumber(newViewportEndTimeInNanoseconds);
                        }
                        else {
                            newViewportBeginTime = this._viewport.viewableBase;
                            var newViewportEndTimeInNanoseconds = viewableBaseInNanoseconds + ((eventEndTime - viewableBaseInNanoseconds) / (1 - rightMarginRatio));
                            newViewportEndTime = DiagHub.BigNumber.convertFromNumber(newViewportEndTimeInNanoseconds);
                        }
                        var newViewport = new DiagHub.JsonTimespan(newViewportBeginTime, newViewportEndTime);
                        this._viewport.changeViewport(newViewport, newSelectedTime);
                    }
                    else {
                        var newViewportEndTimeInNanoseconds = eventEndTime + (rightMarginRatio * this._viewport.timeRange.duration);
                        var newViewportBeginTimeInNanoseconds = newViewportEndTimeInNanoseconds - this._viewport.timeRange.duration;
                        this._viewport.centerViewportWithSelectedTime(newViewportBeginTimeInNanoseconds, newSelectedTime);
                    }
                }
                else {
                    this._viewport.selectTimeSpan(newSelectedTime);
                }
            };
            EventsSwimlane.prototype.updateTrackAriaAndTooltip = function (track) {
                var timeContextString = "";
                if (!this._activatedEventIndicator || this._activatedEventIndicator.isLiveDebugging) {
                    timeContextString = this._resourceManager.getResource("LiveDebuggingDescription");
                }
                else {
                    if (this._activatedEventIndicator.time === null) {
                        timeContextString = this._resourceManager.getResource("HistoricalDebuggingDescription");
                    }
                    else {
                        var timeSeconds = EventsSwimlane.getTimeInSeconds(this._activatedEventIndicator.time);
                        timeContextString = DiagnosticsHub.StringFormatter.format(this._resourceManager.getResource("HistoricalTimeDescription"), timeSeconds.toLocaleString());
                    }
                }
                var description = DiagnosticsHub.StringFormatter.format(this._resourceManager.getResource("TrackDescription"), track.trackLocalizedName, track.visibleEventList.length.toLocaleString(), timeContextString);
                track.trackControl.ariaLabel = description;
                track.trackControl.tooltip = description;
            };
            Object.defineProperty(EventsSwimlane.prototype, "breakEventTrackControl", {
                get: function () {
                    return this._breakTrackControlCache;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventsSwimlane.prototype, "VisibleBreakEventList", {
                get: function () {
                    var eventKindId = this._graphConfig.eventKindNameToId[DiagnosticsHub.PortMarshallerConstants.BreakEventKindName];
                    return this._eventKindIdToTrackMap[eventKindId].visibleEventList;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventsSwimlane.prototype, "VisibleIntelliTraceEventList", {
                get: function () {
                    var eventKindId = this._graphConfig.eventKindNameToId[DiagnosticsHub.PortMarshallerConstants.IntelliTraceEventKindName];
                    return this._eventKindIdToTrackMap[eventKindId].visibleEventList;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EventsSwimlane.prototype, "ClientWidth", {
                set: function (value) {
                    this._viewport.clientWidth = value;
                },
                enumerable: true,
                configurable: true
            });
            EventsSwimlane.prototype.getTimeRange = function () {
                return this._viewport.timeRange;
            };
            EventsSwimlane.getTimeInSeconds = function (timeInNs) {
                return Math.max(0, Math.floor(timeInNs / 10000000)) / 100;
            };
            EventsSwimlane.IntelliTraceEventTackName = "IntelliTrace Event Track";
            EventsSwimlane.BreakEventTrackName = "Break Event Track";
            EventsSwimlane.CustomEventTrackName = "Custom Event Track";
            return EventsSwimlane;
        }());
        DiagnosticsHub.EventsSwimlane = EventsSwimlane;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var IntelliTraceGraph = (function () {
            function IntelliTraceGraph(config, graphConfig, isVisible) {
                this._logger = DiagHub.getLogger();
                this._logger.debug("IntelliTraceGraph: constructor()");
                if (!config) {
                    this._logger.error("configuration to the graph is invalid.");
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSProfiler.1002"));
                }
                this._portMarshaller = new DiagnosticsHub.IntelliTracePortMarshaller();
                this._eventsSwimlane = new DiagnosticsHub.EventsSwimlane(graphConfig, config.resources, this._portMarshaller, isVisible, DiagHub.getViewportController());
                this.registerEventHandlers();
                this._currentTimeRange = config.timeRange;
                this._portMarshaller.notifyViewPortChanged(DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._currentTimeRange.begin), DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._currentTimeRange.end));
                DiagHub.Common.DependencyManager.loadCss(config.pathToScriptFolder + "\\css\\IntelliTraceGraph.css");
                this.appendEventIconStyles(config.pathToScriptFolder);
                this.render();
                this._portMarshaller.notifySwimlaneIsVisibleChanged(isVisible);
                this._portMarshaller.notifyReadyForData();
                this._logger.debug("IntelliTraceGraph: constructor() finished");
            }
            IntelliTraceGraph.prototype.dispose = function () {
                this._logger.debug("IntelliTraceGraph: dispose()");
                this._portMarshaller.removeSwimlaneDataChangedEventListener(this._swimlaneDataChangedEventHandler);
                this._portMarshaller.removeTabularViewSelectionChangedEventListener(this._tabularViewSelectionChangedEventHandler);
                this._portMarshaller.removeActivatedDataChangedEventListener(this._activatedDataChangedEventHandler);
                this._portMarshaller.removeDebugModeChangedEventListener(this._debugModeChangedEventHandler);
                this._portMarshaller.removeFocusOnLastBreakEventListener(this._focusOnLastBreakEventHandler);
                this._swimlaneSelectionChangedRegistration.unregister();
                this._eventsSwimlane.dispose();
                DiagHub.getViewEventManager().selectionChanged.removeEventListener(this._selectionTimeRangeChangedEventHandler);
            };
            Object.defineProperty(IntelliTraceGraph.prototype, "container", {
                get: function () {
                    this._logger.debug("IntelliTraceGraph: getContainer()");
                    return this._container;
                },
                enumerable: true,
                configurable: true
            });
            IntelliTraceGraph.prototype.getPortMarshaller = function () {
                return this._portMarshaller;
            };
            IntelliTraceGraph.prototype.appendEventIconStyles = function (webViewRootFolder) {
                webViewRootFolder = webViewRootFolder.replace(/\\/g, "/");
                var pathToNormalIcon = '/icons/timeline/light/normal/';
                var pathToSelectedIcon = '/icons/timeline/light/selected/';
                var tracepointIconName = 'TimelineMarkPurple.png';
                var exceptionIconName = 'TimelineMarkRed.png';
                var unimportantIconName = 'TimelineMarkGray.png';
                IntelliTraceGraph.appendIconStyleHtml('div.discrete-event.timeline-light-tracepoint', webViewRootFolder + pathToNormalIcon + tracepointIconName);
                IntelliTraceGraph.appendIconStyleHtml('div.discrete-event.timeline-light-exception', webViewRootFolder + pathToNormalIcon + exceptionIconName);
                IntelliTraceGraph.appendIconStyleHtml('div.discrete-event.timeline-light-unimportant', webViewRootFolder + pathToNormalIcon + unimportantIconName);
                IntelliTraceGraph.appendIconStyleHtml('div.discrete-event.timeline-light-selected-tracepoint', webViewRootFolder + pathToSelectedIcon + tracepointIconName);
                IntelliTraceGraph.appendIconStyleHtml('div.discrete-event.timeline-light-selected-exception', webViewRootFolder + pathToSelectedIcon + exceptionIconName);
                IntelliTraceGraph.appendIconStyleHtml('div.discrete-event.timeline-light-selected-unimportant', webViewRootFolder + pathToSelectedIcon + unimportantIconName);
            };
            IntelliTraceGraph.appendIconStyleHtml = function (styleName, iconPath) {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = styleName + '{ background: url(\"' + iconPath + '\") no-repeat 0px 0px !important }';
                document.getElementsByTagName('head')[0].appendChild(style);
            };
            IntelliTraceGraph.prototype.render = function (fullRender, refresh) {
                if (fullRender === void 0) { fullRender = true; }
                if (refresh === void 0) { refresh = false; }
                this._logger.debug("IntelliTraceGraph: render()");
                if (!this._container) {
                    this.initializeGraphStructure();
                }
                this._eventsSwimlane.renderTracks(fullRender, refresh);
            };
            IntelliTraceGraph.prototype.onViewportChanged = function (viewportArgs) {
                if (!this._currentTimeRange || !this._currentTimeRange.equals(viewportArgs.currentTimespan)) {
                    var logSelection = "";
                    if (viewportArgs.selectionTimespan) {
                        logSelection = " selectionTimespan: " + viewportArgs.selectionTimespan.begin.value + " - " + viewportArgs.selectionTimespan.end.value;
                    }
                    this._logger.debug("IntelliTraceGraph: onViewportChanged() currentTimespan:" + viewportArgs.currentTimespan.begin.value + " - " + viewportArgs.currentTimespan.end.value + logSelection + " isIntermittent: " + viewportArgs.isIntermittent);
                    this._currentTimeRange = viewportArgs.currentTimespan;
                    this._eventsSwimlane.onViewportChanged(this._currentTimeRange);
                    this._portMarshaller.notifyViewPortChanged(DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._currentTimeRange.begin), DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(this._currentTimeRange.end));
                }
            };
            IntelliTraceGraph.prototype.resize = function (evt) {
                this._logger.debug("IntelliTraceGraph: resize()");
                this._eventsSwimlane.notifyClientSizeChanged();
            };
            IntelliTraceGraph.prototype.onSwimlaneVisibilityChanged = function (visible) {
                this._eventsSwimlane.onSwimlaneVisibilityChanged(visible);
            };
            IntelliTraceGraph.prototype.registerEventHandlers = function () {
                this._swimlaneDataChangedEventHandler = this.swimlaneDataChangedEventHandler.bind(this);
                this._selectionTimeRangeChangedEventHandler = this.selectionTimeRangeChangedEventHandler.bind(this);
                this._tabularViewSelectionChangedEventHandler = this.tabularViewSelectionChangedEventHandler.bind(this);
                this._activatedDataChangedEventHandler = this.activatedDataChangedEventHandler.bind(this);
                this._debugModeChangedEventHandler = this.debugModeChangedEventHandler.bind(this);
                this._focusOnLastBreakEventHandler = this.focusOnLastBreakEventHandler.bind(this);
                this._portMarshaller.addSwimlaneDataChangedEventListener(this._swimlaneDataChangedEventHandler);
                this._portMarshaller.addTabularViewSelectionChangedEventListener(this._tabularViewSelectionChangedEventHandler);
                this._portMarshaller.addActivatedDataChangedEventListener(this._activatedDataChangedEventHandler);
                this._portMarshaller.addDebugModeChangedEventListener(this._debugModeChangedEventHandler);
                this._portMarshaller.addFocusOnLastBreakEventListener(this._focusOnLastBreakEventHandler);
                this._swimlaneSelectionChangedRegistration = this._eventsSwimlane.selectionChangedEvent.addHandler(this.swimlaneSelectionChangedEventHandler.bind(this));
                DiagHub.getViewEventManager().selectionChanged.addEventListener(this._selectionTimeRangeChangedEventHandler);
            };
            IntelliTraceGraph.prototype.swimlaneDataChangedEventHandler = function (eventArgs) {
                var dataChangedEventArgs = eventArgs;
                if (dataChangedEventArgs.Action === DiagnosticsHub.SwimlaneDataChangedAction.Add) {
                    this._portMarshaller.acknowledgeData();
                }
                this._eventsSwimlane.onSwimlaneDataChangedEvent(eventArgs);
            };
            IntelliTraceGraph.prototype.swimlaneSelectionChangedEventHandler = function (eventArgs) {
                if (eventArgs && eventArgs.isSelectedByUserInput) {
                    this._portMarshaller.notifySwimlaneDataSelectionChanged(eventArgs.selectedItem ? eventArgs.selectedItem.diagnosticDataId : DiagnosticsHub.PortMarshallerConstants.InvalidDiagnosticDataId);
                    if (eventArgs.selectedItem != null) {
                        DiagnosticsHub.TelemetryService.onSelectDiagnosticEvent(eventArgs.selectedItem.telemetryType, true, eventArgs.selectedItem.snapshotStatus);
                    }
                    else if (eventArgs.previousSelectedItem != null) {
                        DiagnosticsHub.TelemetryService.onSelectDiagnosticEvent(eventArgs.previousSelectedItem.telemetryType, false, eventArgs.previousSelectedItem.snapshotStatus);
                    }
                }
            };
            IntelliTraceGraph.prototype.tabularViewSelectionChangedEventHandler = function (eventArgs) {
                var eventSelectionChangedArgs = eventArgs;
                if (eventSelectionChangedArgs) {
                    this._eventsSwimlane.setSelectedEvent(eventSelectionChangedArgs);
                }
            };
            IntelliTraceGraph.prototype.debugModeChangedEventHandler = function (eventArgs) {
                var newDebugModeEventArgs = eventArgs;
                this._eventsSwimlane.onDebugModeChanged(newDebugModeEventArgs);
            };
            IntelliTraceGraph.prototype.activatedDataChangedEventHandler = function (eventArgs) {
                var activatedEventArgs = eventArgs;
                if (activatedEventArgs) {
                    this._eventsSwimlane.notifyActivatedDataChanged(activatedEventArgs);
                }
            };
            IntelliTraceGraph.prototype.focusOnLastBreakEventHandler = function (eventArgs) {
                var focusOnLastBreakEventArgs = eventArgs;
                if (focusOnLastBreakEventArgs) {
                    this._eventsSwimlane.focusOnLastBreakEvent(focusOnLastBreakEventArgs);
                }
            };
            IntelliTraceGraph.prototype.selectionTimeRangeChangedEventHandler = function (eventArgs) {
                if (this._portMarshaller && eventArgs && !eventArgs.isIntermittent) {
                    var beginTimeNanoseconds;
                    var endTimeNanoseconds;
                    if (eventArgs.position) {
                        beginTimeNanoseconds = DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(eventArgs.position.begin);
                        endTimeNanoseconds = DiagnosticsHub.SwimlaneTimeRange.unsafeConvertBigNumberToNumber(eventArgs.position.end);
                    }
                    else {
                        beginTimeNanoseconds = DiagnosticsHub.PortMarshallerConstants.InvalidTimeValue;
                        endTimeNanoseconds = DiagnosticsHub.PortMarshallerConstants.InvalidTimeValue;
                    }
                    this._portMarshaller.notifySelectionTimeRangeChanged(beginTimeNanoseconds, endTimeNanoseconds);
                }
            };
            IntelliTraceGraph.prototype.initializeGraphStructure = function () {
                this._container = document.createElement("div");
                this._container.classList.add("graphContainer");
                this._container.style.height = "100%";
                var runtimeStyle = this._container.runtimeStyle;
                if (!runtimeStyle.position || runtimeStyle.position === "static") {
                    this._container.style.position = "relative";
                }
                this._eventsSwimlane.initializeEventTracks(this._container);
            };
            return IntelliTraceGraph;
        }());
        DiagnosticsHub.IntelliTraceGraph = IntelliTraceGraph;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        var IntelliTraceGraphLabels = (function () {
            function IntelliTraceGraphLabels(graphConfig) {
                this._logger = DiagHub.getLogger();
                this._logger.debug("IntelliTraceLabel: constructor()");
                this._graphLabelsContainer = document.createElement("div");
                this._graphLabelsContainer.className = "graph-scale-left";
                this._graphLabelsContainer.style.width = "100%";
                this._graphLabelsContainer.style.height = "100%";
                this._graphLabelsContainer.style.borderRightWidth = "1px";
                graphConfig.trackConfigurations.forEach(function (config) {
                    var label = this.CreateLabel("track-icon-common", config.LabelTooltip, config.LabelName);
                    this._graphLabelsContainer.appendChild(label);
                }, this);
            }
            Object.defineProperty(IntelliTraceGraphLabels.prototype, "container", {
                get: function () {
                    return this._graphLabelsContainer;
                },
                enumerable: true,
                configurable: true
            });
            IntelliTraceGraphLabels.prototype.render = function () {
            };
            IntelliTraceGraphLabels.prototype.CreateLabel = function (className, tooltip, svgIconToken) {
                var label = document.createElement("div");
                label.className = className;
                label.setAttribute("data-plugin-vs-tooltip", tooltip);
                label.setAttribute("role", "img");
                label.setAttribute("aria-label", tooltip);
                var svgIconDiv = document.createElement("div");
                svgIconDiv.setAttribute("data-plugin-svg", svgIconToken);
                label.appendChild(svgIconDiv);
                Microsoft.Plugin.Theme.processInjectedSvg(label);
                return label;
            };
            return IntelliTraceGraphLabels;
        }());
        DiagnosticsHub.IntelliTraceGraphLabels = IntelliTraceGraphLabels;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var IntelliTrace;
(function (IntelliTrace) {
    var DiagnosticsHub;
    (function (DiagnosticsHub) {
        "use strict";
        function IntelliTraceSwimlaneFactory(componentConfig, isVisible, selectionEnabled, graphBehaviour, currentTimespan, selectionTimespan) {
            var customGraphConfig = new DiagnosticsHub.IntelliTraceGraphConfiguration(componentConfig.JsonObject);
            var graphConfig = new DiagHub.SwimlaneConfiguration(componentConfig, currentTimespan, graphBehaviour);
            graphConfig.header.isBodyExpanded = isVisible;
            var graphHeight = Math.max((customGraphConfig.enabledTrackCount * 24) - 1, 0);
            var swimlane = new DiagHub.SwimlaneBase(graphConfig.header, graphHeight, currentTimespan, selectionTimespan);
            var intelliTraceGraph = new IntelliTrace.DiagnosticsHub.IntelliTraceGraph(graphConfig.graph, customGraphConfig, isVisible);
            var graph = intelliTraceGraph;
            if (selectionEnabled) {
                graph = new DiagHub.SelectionOverlay(graph, currentTimespan, selectionTimespan, componentConfig.Id);
            }
            swimlane.swimlaneVisibilityChangedEvent.addEventListener(function (visible) { return intelliTraceGraph.onSwimlaneVisibilityChanged(visible); });
            swimlane.addMainRegionControl(graph);
            swimlane.addMainRegionControl(new DiagHub.GridLineRenderer(currentTimespan));
            swimlane.addLeftRegionControl(new DiagnosticsHub.IntelliTraceGraphLabels(customGraphConfig));
            return swimlane;
        }
        DiagnosticsHub.IntelliTraceSwimlaneFactory = IntelliTraceSwimlaneFactory;
    })(DiagnosticsHub = IntelliTrace.DiagnosticsHub || (IntelliTrace.DiagnosticsHub = {}));
})(IntelliTrace || (IntelliTrace = {}));
var ControlTemplates;
(function (ControlTemplates) {
    var DiagnosticsHubControlTemplate = (function () {
        function DiagnosticsHubControlTemplate() {
        }
        DiagnosticsHubControlTemplate.swimlaneTemplate = "\
<div class=\"graph-canvas-div\">\
  <div class=\"graph-canvas\"></div>\
</div>\
";
        DiagnosticsHubControlTemplate.eventTrackTemplate = "\
<div class=\"track-common\" data-controlbinding=\"attr-aria-label:ariaLabel;mode=oneway\">\
  <div data-name=\"_panel\" role=\"group\" data-controlbinding=\"attr-class:panelClassName;mode=oneway\"></div>\
</div>\
";
        DiagnosticsHubControlTemplate.eventButtonTemplate = "\
<div role=\"listitem\" data-binding=\"attr-aria-label:ariaLabel;mode=oneway\" data-controlbinding=\"attr-class:iconClass;mode=oneway,                                   style.left:xOffset;mode=oneway\">\
  <div class=\"discrete-event-clickable-area clickable-area-size\"></div>\
</div>\
";
        DiagnosticsHubControlTemplate.breakEventButtonTemplate = "\
<div role=\"listitem\" data-binding=\"attr-aria-label:ariaLabel;mode=oneway\" data-controlbinding=\"attr-class:breakEventClass;mode=oneway,                                   style.width:width;mode=oneway,                                   style.left:xOffset;mode=oneway\">\
  <div class=\"hat\"></div>\
</div>\
";
        return DiagnosticsHubControlTemplate;
    }());
    ControlTemplates.DiagnosticsHubControlTemplate = DiagnosticsHubControlTemplate;
})(ControlTemplates || (ControlTemplates = {}));

// SIG // Begin signature block
// SIG // MIIjhAYJKoZIhvcNAQcCoIIjdTCCI3ECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // XvDWD4HO8CSlqOXNNSltn3h1X2AaZ/l0orOv5m4RmyOg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIBSbb68IjHKPCog4yavr
// SIG // PxgSfbFQTs82QGA3qHec5YStMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAUTcBxZ0l02FEfSJEHbU0mfSYz3XmwygZQei2
// SIG // dwQE90zRHIf19qdDVdPt3XsnWlDZtB+BcxK2lUqM/68R
// SIG // JWBRnaXUFzGbhjHVp5/9Yu3f4jMlxxBMwWm+DgBVrQoy
// SIG // 7EU7BF0vIBcSl5ymwZy9G528lqQD9IYlsQfuy3eheZV2
// SIG // lVYZWQYi2lS4sz9uwZP7mdsVczvSHPRF9gn3ufAdZcQ/
// SIG // fEt+RZmHNghI7xU/HhngfxS5wD5InOnjnU/KUPsUaqmI
// SIG // P2U7EKCDFbhpkfs8/SKRPgRBF0Ogg597JSRoSpz4Tyqz
// SIG // JLxHMgS+vDHCkFEHaKPjyyJH4EJwzeocv+pMZHGb8qGC
// SIG // EuUwghLhBgorBgEEAYI3AwMBMYIS0TCCEs0GCSqGSIb3
// SIG // DQEHAqCCEr4wghK6AgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFRBgsqhkiG9w0BCRABBKCCAUAEggE8MIIBOAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCDRsTTc
// SIG // BVRwE+9Ie0oiYncegj29CSpUpbYYlMLQhvQZZwIGYPmc
// SIG // YxauGBMyMDIxMDgxMzE3MDkyOS42MDZaMASAAgH0oIHQ
// SIG // pIHNMIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQL
// SIG // ExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25zMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo3QkYxLUUzRUEt
// SIG // QjgwODElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaCCDjwwggTxMIID2aADAgECAhMzAAAB
// SIG // UcNQ51lsqsanAAAAAAFRMA0GCSqGSIb3DQEBCwUAMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIwMTEx
// SIG // MjE4MjYwNFoXDTIyMDIxMTE4MjYwNFowgcoxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBB
// SIG // bWVyaWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxl
// SIG // cyBUU1MgRVNOOjdCRjEtRTNFQS1CODA4MSUwIwYDVQQD
// SIG // ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIIB
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn9KH
// SIG // 76qErjvvOIkjWbHptMkYDjmG+JEmzguyr/VxjZgZ/ig8
// SIG // Mk47jqSJP5RxH/sDyqhYu7jPSO86siZh8u7DBX9L8I+A
// SIG // B+8fPPvD4uoLKD22BpoFl4B8Fw5K7SuibvbxGN7adL1/
// SIG // zW+sWXlVvpDhEPIKDICvEdNjGTLhktfftjefg9lumBMU
// SIG // BJ2G4/g4ad0dDvRNmKiMZXXe/Ll4Qg/oPSzXCUEYoSSq
// SIG // a5D+5MRimVe5/YTLj0jVr8iF45V0hT7VH8OJO4YImcnZ
// SIG // hq6Dw1G+w6ACRGePFmOWqW8tEZ13SMmOquJrTkwyy8zy
// SIG // NtVttJAX7diFLbR0SvMlbJZWK0KHdwIDAQABo4IBGzCC
// SIG // ARcwHQYDVR0OBBYEFMV3/+NoUGKTNGg6OMyE6fN1ROpt
// SIG // MB8GA1UdIwQYMBaAFNVjOlyKMZDzQ3t8RhvFM2hahW1V
// SIG // MFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Rp
// SIG // bVN0YVBDQV8yMDEwLTA3LTAxLmNybDBaBggrBgEFBQcB
// SIG // AQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY2VydHMvTWljVGltU3RhUENB
// SIG // XzIwMTAtMDctMDEuY3J0MAwGA1UdEwEB/wQCMAAwEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQAD
// SIG // ggEBACv99cAVg5nx0SqjvLfQzmugMj5cJ9NE60duSH1L
// SIG // pxHYim9Ls3UfiYd7t0JvyEw/rRTEKHbznV6LFLlX++lH
// SIG // JMGKzZnHtTe2OI6ZHFnNiFhtgyWuYDJrm7KQykNi1G1L
// SIG // buVie9MehmoK+hBiZnnrcfZSnBSokrvO2QEWHC1xnZ5w
// SIG // M82UEjprFYOkchU+6RcoCjjmIFGfgSzNj1MIbf4lcJ5F
// SIG // oV1Mg6FwF45CijOXHVXrzkisMZ9puDpFjjEV6TAY6INg
// SIG // MkhLev/AVow0sF8MfQztJIlFYdFEkZ5NF/IyzoC2Yb9i
// SIG // w4bCKdBrdD3As6mvoGSNjCC6lOdz6EerJK3NhFgwggZx
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
// SIG // UyBFU046N0JGMS1FM0VBLUI4MDgxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAKCir3PxP6RCCyVMJSAVoMV61yNeoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDkwRsrMCIYDzIwMjEwODE0
// SIG // MDAyNDExWhgPMjAyMTA4MTUwMDI0MTFaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOTBGysCAQAwCgIBAAICA1YC
// SIG // Af8wBwIBAAICEUcwCgIFAOTCbKsCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQCV
// SIG // 3NcBEz9Nlu9YCCLvP2hhDNfxvNbG5I/kwzykwVwQeTQG
// SIG // qhE9Rq+mHIVLv37oVVCqqCJxLG6NaPvEEpGN+xaz9ADS
// SIG // aehtlFLAeBOafiUSqyk2YE8MCD7vru+Qn/ngeKIr6rFB
// SIG // T22MEQTJ56jSVxeLmzzTqsR7+LmA5E9LjSyG4DGCAw0w
// SIG // ggMJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABUcNQ51lsqsanAAAAAAFRMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIOhMYGD61xS1a1bp
// SIG // HtkuD+Qh5UXaJWC9rhSGjgrQEjvoMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgLs1cmYj41sFZBwCmFvv9
// SIG // ScP5tuuUhxsv/t0B9XF65UEwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAVHDUOdZbKrG
// SIG // pwAAAAABUTAiBCDp7UJ49//dmHSerRqn6QDVG0xipiEz
// SIG // Tm+ihjTQ0Y1oWjANBgkqhkiG9w0BAQsFAASCAQBOw8+T
// SIG // MgbvFL/ocP69mu6ienqiOd2HL68tHFYY3Yz2uoPh6KMx
// SIG // +igyOsQyuIncZU0Y7Pa2KYcLx0XDmW7/bBVIDJ795PwA
// SIG // PBoQCHIP7aTp1mqzEILG2/ljvPmu9eidbX8SMNscGgGC
// SIG // v3aqXj0xgHT4mnog9uSjtcJkPw9X5obmKwxT+x4G3DoM
// SIG // Lon/EXdV9208p+21cimbM2b1Hzwhgjg6BAHPWXuqVVkr
// SIG // URba9CXHxuKAl0DY1vlHg/WQFAhctsP4niaDVFUYiSaU
// SIG // 3hyEtendrWpVJceSRAy02R6EDoA4OP/eKZX2anMLxsEq
// SIG // nuNGiBHgd3R+SobwUzH5TwlnRYBE
// SIG // End signature block
