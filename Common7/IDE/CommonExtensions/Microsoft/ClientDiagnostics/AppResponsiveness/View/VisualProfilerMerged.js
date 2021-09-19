var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    (function (CodeMarkerValues) {
        CodeMarkerValues[CodeMarkerValues["perfBrowserTools_VisualProfilerResultsLoaded"] = 23573] = "perfBrowserTools_VisualProfilerResultsLoaded";
    })(VisualProfiler.CodeMarkerValues || (VisualProfiler.CodeMarkerValues = {}));
    var CodeMarkerValues = VisualProfiler.CodeMarkerValues;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    var Extensions;
    (function (Extensions) {
        "use strict";
        var UserSettingsProxy = (function () {
            function UserSettingsProxy() {
            }
            UserSettingsProxy.prototype.getUserSettings = function () {
                return new Microsoft.Plugin.Promise(function (completed) {
                    Microsoft.Plugin.Settings.get("JavaScriptPerfTools").done(function (result) {
                        completed(result);
                    }, function (error) {
                        // In case the collection doesn't exist, return the default settings.
                        completed(Microsoft.Plugin.Promise.as({}));
                    });
                }, null);
            };
            return UserSettingsProxy;
        }());
        Extensions.UserSettingsHelper = new UserSettingsProxy();
    })(Extensions = VisualProfiler.Extensions || (VisualProfiler.Extensions = {}));
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <webunit-reference path="$(OutputPath)/Common/DiagnosticsHub.js" />
/// <webunit-reference path="$(OutputPath)/Common/Controls/hubControls.js" />
var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var TimeStamp = (function () {
        function TimeStamp(nsec) {
            if (nsec === void 0) { nsec = 0; }
            this._nsec = nsec;
        }
        Object.defineProperty(TimeStamp.prototype, "nsec", {
            get: function () {
                return this._nsec;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeStamp.prototype, "msec", {
            get: function () {
                return this._nsec / TimeStamp.nanoSecInMillSec;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeStamp.prototype, "sec", {
            get: function () {
                return this._nsec / TimeStamp.nanoSecInSec;
            },
            enumerable: true,
            configurable: true
        });
        TimeStamp.fromBigNumber = function (bigNumber) {
            var l = bigNumber.jsonValue.l;
            var h = bigNumber.jsonValue.h;
            if (l < 0) {
                l = l >>> 0;
            }
            if (h < 0) {
                h = h >>> 0;
            }
            var nsec = h * 0x100000000 + l;
            return TimeStamp.fromNanoseconds(nsec);
        };
        TimeStamp.fromNanoseconds = function (nsec) {
            return new TimeStamp(nsec);
        };
        TimeStamp.fromMilliseconds = function (msec) {
            return new TimeStamp(msec * TimeStamp.nanoSecInMillSec);
        };
        TimeStamp.fromSeconds = function (sec) {
            return new TimeStamp(sec * TimeStamp.nanoSecInSec);
        };
        TimeStamp.prototype.equals = function (other) {
            return this._nsec === other.nsec;
        };
        TimeStamp.prototype.toBigNumber = function () {
            return DiagnosticsHub.BigNumber.convertFromNumber(this._nsec);
        };
        TimeStamp.nanoSecInMillSec = 1000 * 1000;
        TimeStamp.nanoSecInSec = 1000 * 1000 * 1000;
        return TimeStamp;
    }());
    VisualProfiler.TimeStamp = TimeStamp;
    var TimeSpan = (function () {
        function TimeSpan(begin, end) {
            if (begin === void 0) { begin = new TimeStamp(); }
            if (end === void 0) { end = new TimeStamp(); }
            this._begin = begin;
            this._end = end;
            if (this._begin.nsec > this._end.nsec) {
                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1042"));
            }
        }
        Object.defineProperty(TimeSpan.prototype, "begin", {
            get: function () {
                return this._begin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "end", {
            get: function () {
                return this._end;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "elapsed", {
            get: function () {
                return new TimeStamp(this._end.nsec - this.begin.nsec);
            },
            enumerable: true,
            configurable: true
        });
        TimeSpan.fromJsonTimespan = function (jsonTimespan) {
            var begin = TimeStamp.fromBigNumber(jsonTimespan.begin);
            var end = TimeStamp.fromBigNumber(jsonTimespan.end);
            return new TimeSpan(begin, end);
        };
        TimeSpan.prototype.equals = function (other) {
            return this.begin.equals(other.begin) &&
                this.end.equals(other.end);
        };
        TimeSpan.prototype.toJsonTimespan = function () {
            return new DiagnosticsHub.JsonTimespan(this._begin.toBigNumber(), this._end.toBigNumber());
        };
        return TimeSpan;
    }());
    VisualProfiler.TimeSpan = TimeSpan;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var ResponsivenessNotifications = (function () {
        function ResponsivenessNotifications() {
        }
        ResponsivenessNotifications.DetailsPaneLoaded = "ResponsivenessNotifications.DetailsPaneLoaded";
        ResponsivenessNotifications.GraphCollapsed = "ResponsivenessNotifications.GraphCollapsed";
        ResponsivenessNotifications.GraphExpanded = "ResponsivenessNotifications.GraphExpanded";
        ResponsivenessNotifications.GridRowSelected = "ResponsivenessNotifications.GridRowSelected";
        ResponsivenessNotifications.GridScrolled = "ResponsivenessNotifications.GridScrolled";
        ResponsivenessNotifications.GridUpdatedForTimeSelection = "ResponsivenessNotifications.GridUpdatedForTimeSelection";
        ResponsivenessNotifications.ResetZoomFinished = "ResponsivenessNotifications.ResetZoomFinished";
        ResponsivenessNotifications.ResultsLoaded = "ResponsivenessNotifications.ResultsLoaded";
        ResponsivenessNotifications.SaveSessionFinished = "ResponsivenessNotifications.SaveSessionFinished";
        ResponsivenessNotifications.SortFinishedOnGrid = "ResponsivenessNotifications.SortFinishedOnGrid";
        ResponsivenessNotifications.UserSelectedTimeslice = "ResponsivenessNotifications.UserSelectedTimeslice";
        ResponsivenessNotifications.ZoomInFinished = "ResponsivenessNotifications.ZoomInFinished";
        return ResponsivenessNotifications;
    }());
    VisualProfiler.ResponsivenessNotifications = ResponsivenessNotifications;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../Program.ts" />
/// <reference path="TimeSpan.ts" />
/// <reference path="../responsivenessNotifications.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    var GlobalRuler = (function () {
        function GlobalRuler(totalRange) {
            this._totalRange = totalRange;
            this._activeRange = this._selection = this._totalRange;
            this._selectionWasFinal = false;
            this._onViewSelectionChangedHandler = this.onViewSelectionChanged.bind(this);
            this._publisher = new Microsoft.Plugin.Utilities.EventManager();
            this._viewEventManager = DiagnosticsHub.getViewEventManager();
            this._viewEventManager.selectionChanged.addEventListener(this._onViewSelectionChangedHandler);
        }
        Object.defineProperty(GlobalRuler.prototype, "totalRange", {
            get: function () {
                return this._totalRange;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GlobalRuler.prototype, "selection", {
            get: function () {
                return this._selection;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GlobalRuler.prototype, "activeRange", {
            get: function () {
                return this._activeRange;
            },
            enumerable: true,
            configurable: true
        });
        GlobalRuler.prototype.deinitialize = function () {
            this._viewEventManager.selectionChanged.removeEventListener(this._onViewSelectionChangedHandler);
        };
        GlobalRuler.prototype.setSelection = function (newSelection, isIntermittent) {
            if (isIntermittent === void 0) { isIntermittent = false; }
            this.setSelectionInternal(newSelection, isIntermittent, /* viaHubSelection= */ false);
        };
        GlobalRuler.prototype.setActiveRange = function (newRange) {
            if (!this._activeRange.equals(newRange)) {
                this._activeRange = newRange;
                this._publisher.dispatchEvent(GlobalRuler.ActiveRangeChangedEventType);
            }
        };
        GlobalRuler.prototype.addEventListener = function (eventType, func) {
            this._publisher.addEventListener(eventType, func);
        };
        GlobalRuler.prototype.removeEventListener = function (eventType, func) {
            this._publisher.removeEventListener(eventType, func);
        };
        GlobalRuler.prototype.setSelectionInternal = function (newSelection, isIntermittent, viaHubSelection) {
            if (isIntermittent === void 0) { isIntermittent = false; }
            if (viaHubSelection === void 0) { viaHubSelection = false; }
            var selectionChanged = !this._selection.equals(newSelection);
            var selectionFinalChanged = this._selectionWasFinal !== !isIntermittent;
            this._selectionWasFinal = !isIntermittent;
            if (selectionChanged || (selectionFinalChanged && !isIntermittent)) {
                VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_UserSelectedTimeSlice_Start);
                var begin = VisualProfiler.TimeStamp.fromNanoseconds(Math.max(newSelection.begin.nsec, this._activeRange.begin.nsec));
                var end = VisualProfiler.TimeStamp.fromNanoseconds(Math.min(newSelection.end.nsec, this._activeRange.end.nsec));
                this._selection = new VisualProfiler.TimeSpan(begin, end);
                if (!viaHubSelection) {
                    this._viewEventManager.selectionChanged.raiseEvent({
                        position: this._selection.toJsonTimespan(),
                        isIntermittent: isIntermittent
                    });
                }
                this._publisher.dispatchEvent(GlobalRuler.SelectionChangedEventType, {
                    data: {
                        isIntermittent: isIntermittent,
                        newSelection: newSelection
                    }
                });
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.UserSelectedTimeslice);
                VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_UserSelectedTimeSlice_Stop);
            }
        };
        GlobalRuler.prototype.onViewSelectionChanged = function (args) {
            var newSelection = VisualProfiler.TimeSpan.fromJsonTimespan(args.position);
            this.setSelectionInternal(newSelection, args.isIntermittent, true);
        };
        GlobalRuler.SelectionChangedEventType = "selectionChanged";
        GlobalRuler.ActiveRangeChangedEventType = "activeRangeChanged";
        return GlobalRuler;
    }());
    VisualProfiler.GlobalRuler = GlobalRuler;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../Bpt.Diagnostics.PerfTools.Common/formattingHelpers.ts" />
//--------
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="TimeSpan.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var FormattingHelpers = (function () {
        function FormattingHelpers() {
        }
        /**
         * Converts a Daytona-style format string to a printf-style format string.
         */
        FormattingHelpers.convertFormatString = function (originalFormat) {
            var newFormat = originalFormat;
            var i = 0;
            while (true) {
                var placeholder = "{" + i + "}";
                if (newFormat.indexOf(placeholder) === -1) {
                    break;
                }
                while (newFormat.indexOf(placeholder) >= 0) {
                    newFormat = newFormat.replace(placeholder, "%s");
                }
                i++;
            }
            return newFormat;
        };
        FormattingHelpers.getPrettyPrintTime = function (time) {
            var value;
            var unitAbbreviation;
            if (time.nsec === 0) {
                value = 0;
                unitAbbreviation = Microsoft.Plugin.Resources.getString("SecondsAbbreviation");
            }
            else if (time.nsec < (1000 * 1000)) {
                value = parseFloat(time.msec.toPrecision(2));
                unitAbbreviation = Microsoft.Plugin.Resources.getString("MillisecondsAbbreviation");
            }
            else if (time.nsec < (1000 * 1000 * 1000)) {
                value = time.msec;
                value = Math.floor(value * 100) / 100; // Take 2 decimals without rounding
                unitAbbreviation = Microsoft.Plugin.Resources.getString("MillisecondsAbbreviation");
            }
            else {
                value = time.sec;
                value = Math.floor(value * 100) / 100; // Take 2 decimals without rounding
                unitAbbreviation = Microsoft.Plugin.Resources.getString("SecondsAbbreviation");
            }
            return Common.FormattingHelpers.getDecimalLocaleString(value, /*includeGroupSeparators=*/ true) + " " + unitAbbreviation;
        };
        FormattingHelpers.getPronounceableTime = function (time) {
            var value;
            var unitAbbreviation;
            if (time.nsec === 0) {
                value = 0;
                unitAbbreviation = Microsoft.Plugin.Resources.getString("Seconds");
            }
            else if (time.nsec < (1000 * 1000)) {
                value = parseFloat(time.msec.toPrecision(2));
                unitAbbreviation = Microsoft.Plugin.Resources.getString("Milliseconds");
            }
            else if (time.nsec < (1000 * 1000 * 1000)) {
                value = time.msec;
                value = Math.floor(value * 100) / 100; // Take 2 decimals without rounding
                unitAbbreviation = Microsoft.Plugin.Resources.getString("Milliseconds");
            }
            else {
                value = time.sec;
                value = Math.floor(value * 100) / 100; // Take 2 decimals without rounding
                unitAbbreviation = Microsoft.Plugin.Resources.getString("Seconds");
            }
            return Common.FormattingHelpers.getDecimalLocaleString(value, /*includeGroupSeparators=*/ true) + " " + unitAbbreviation;
        };
        FormattingHelpers.getPrettyPrintBytes = function (bytes) {
            var size = 0;
            var unitAbbreviation;
            if (Math.abs(bytes) >= (1024 * 1024 * 1024)) {
                size = bytes / (1024 * 1024 * 1024);
                unitAbbreviation = Microsoft.Plugin.Resources.getString("GigabyteUnits");
            }
            else if (Math.abs(bytes) >= (1024 * 1024)) {
                size = bytes / (1024 * 1024);
                unitAbbreviation = Microsoft.Plugin.Resources.getString("MegabyteUnits");
            }
            else if (Math.abs(bytes) >= 1024) {
                size = bytes / 1024;
                unitAbbreviation = Microsoft.Plugin.Resources.getString("KilobyteUnits");
            }
            else {
                size = bytes;
                unitAbbreviation = Microsoft.Plugin.Resources.getString("ByteUnits");
            }
            return Common.FormattingHelpers.getDecimalLocaleString(parseFloat(size.toFixed(2)), true) + " " + unitAbbreviation;
        };
        return FormattingHelpers;
    }());
    VisualProfiler.FormattingHelpers = FormattingHelpers;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="../VisualProfilerData.d.ts" />
/// <reference path="TimeSpan.ts" />
/// <reference path="FormattingHelpers.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var MarkEventModel = (function () {
        function MarkEventModel(session) {
            this._session = session;
        }
        MarkEventModel.prototype.getMarkEvents = function (timeRange, category) {
            return this._session.queryMarkEvents(timeRange.begin.nsec, timeRange.end.nsec, category);
        };
        MarkEventModel.prototype.getMarkTooltip = function (mark) {
            var tooltip = mark.toolTip;
            var time = parseInt(mark.timestamp.value);
            tooltip += Microsoft.Plugin.Resources.getString("RulerMarkTooltipLabel", VisualProfiler.FormattingHelpers.getPrettyPrintTime(VisualProfiler.TimeStamp.fromNanoseconds(time)));
            return tooltip;
        };
        return MarkEventModel;
    }());
    VisualProfiler.MarkEventModel = MarkEventModel;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../../Common/Script/Hub/Plugin.redirect.d.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var DonutChart = (function () {
        function DonutChart(container, tooltipCallback, addSectorAriaLabelCallback, donutViewConfig) {
            this._totalValue = 0;
            this._container = container;
            this._sectBaseData = [];
            // Label Offset is the distance between the donut arc and its label
            this._labelOffset = 8;
            this._pathOpacity = 1;
            this._renderTooltipCallback = tooltipCallback;
            this._addSectorAriaLabelCallback = addSectorAriaLabelCallback;
            var svgTextFontSize = Microsoft.Plugin.Theme.getValue("plugin-font-size");
            if (svgTextFontSize.indexOf("px") !== -1) {
                this._textFontPx = parseInt(svgTextFontSize.substring(0, svgTextFontSize.indexOf("px")));
            }
            else if (svgTextFontSize.indexOf("pt") !== -1) {
                // 0.75 is the approximate factor for converting font from 'pt' to 'px'
                this._textFontPx = Math.round(parseInt(svgTextFontSize.substring(0, svgTextFontSize.indexOf("pt"))) / 0.75);
            }
            else {
                this._textFontPx = 0;
            }
            this._config = donutViewConfig || { explosionFactor: 2, radius: 55, strokeWidth: 25, minDonutArcAngle: 10, containerWidth: 200, containerHeight: 200, clockwiseRotation: true };
            if (typeof this._config.containerWidth === "undefined" || typeof this._config.containerHeight === "undefined") {
                if ((container.style.width !== "" || container.getAttribute("width") !== null) && (container.style.height !== "" || container.getAttribute("height") !== null)) {
                    this._containerWidth = parseInt(container.getAttribute("width") !== null ? container.getAttribute("width") : container.style.width);
                    this._containerHeight = parseInt(container.getAttribute("height") !== null ? container.getAttribute("height") : container.style.height);
                }
                else {
                    this._containerWidth = 200;
                    this._containerHeight = 200;
                }
            }
            else {
                this._containerWidth = this._config.containerWidth;
                this._containerHeight = this._config.containerHeight;
            }
            this._centerX = this._config.containerWidth / 2;
            this._centerY = this._config.containerHeight / 2;
            this._div = this.createDivContainer();
            this._container.appendChild(this._div);
        }
        Object.defineProperty(DonutChart.prototype, "centerX", {
            get: function () {
                return this._centerX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "centerY", {
            get: function () {
                return this._centerY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "containerHeight", {
            get: function () {
                return this._config.containerHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "containerWidth", {
            get: function () {
                return this._config.containerWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "clockwiseRotation", {
            get: function () {
                return this._config.clockwiseRotation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "explosionFactor", {
            get: function () {
                return this._config.explosionFactor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "radius", {
            get: function () {
                return this._config.radius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "strokeWidth", {
            get: function () {
                return this._config.strokeWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChart.prototype, "sectors", {
            get: function () {
                return this._sectBaseData;
            },
            enumerable: true,
            configurable: true
        });
        DonutChart.prototype.addSector = function (sectorInfo) {
            this.addSectorToBaseSeries(sectorInfo);
        };
        DonutChart.prototype.addSectors = function (sectors) {
            for (var i = 0; i < sectors.length; i++) {
                this.addSector(sectors[i]);
            }
        };
        DonutChart.prototype.removeSector = function (sectorInfo) {
            var index = this.getSectorIndex(sectorInfo);
            if (index === -1) {
                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1061"));
            }
            else {
                this._totalValue -= sectorInfo.value;
                this._sectBaseData.splice(index, 1);
            }
        };
        DonutChart.prototype.removeSectors = function (sectors) {
            for (var i = 0; i < sectors.length; i++) {
                this.removeSector(sectors[i]);
            }
        };
        DonutChart.prototype.render = function () {
            var donutSectorInfo = this.buildChartData(this._sectBaseData);
            var donutSectorPoints = this.calculatePoints(donutSectorInfo);
            this.draw(donutSectorPoints);
        };
        DonutChart.prototype.resetDonutChart = function () {
            this._totalValue = 0;
            this._sectBaseData = [];
            this._container.removeChild(this._svg);
            this._svg = this.createSVG();
            this._container.appendChild(this._svg);
        };
        DonutChart.prototype.addSectorToBaseSeries = function (sector) {
            this._totalValue += sector.value;
            this._sectBaseData.push(sector);
        };
        DonutChart.prototype.buildChartData = function (sectBaseData) {
            var sectDonutData = [];
            if (sectBaseData.length === 1) {
                sectDonutData.push({
                    startAngle: 0, endAngle: 360, percentValue: 100,
                    info: { name: sectBaseData[0].name, cssClass: sectBaseData[0].cssClass, value: sectBaseData[0].value }
                });
            }
            else {
                var currAngle = 0;
                var currValue = 0;
                var i = 0;
                var angleReductionFactor = this.getReductionFactor(sectBaseData);
                for (i = 0; i < sectBaseData.length - 1; i++) {
                    currValue = sectBaseData[i].value;
                    var arcAngle = Math.round(360 * currValue / this._totalValue);
                    var percentValue = parseFloat((100 * currValue / this._totalValue).toFixed(2));
                    arcAngle = (arcAngle < this._config.minDonutArcAngle) ? this._config.minDonutArcAngle : Math.round(angleReductionFactor * arcAngle);
                    sectDonutData.push({
                        startAngle: currAngle, endAngle: currAngle + arcAngle - this._config.explosionFactor, percentValue: percentValue,
                        info: { name: sectBaseData[i].name, cssClass: sectBaseData[i].cssClass, value: sectBaseData[i].value }
                    });
                    currAngle += arcAngle;
                    if (currAngle >= 360) {
                        break;
                    }
                }
                if (i === sectBaseData.length - 1 && currAngle < 360) {
                    currValue = sectBaseData[i].value;
                    var arcAngle = 360 - currAngle;
                    var percentValue = parseFloat((100 * currValue / this._totalValue).toFixed(2));
                    sectDonutData.push({
                        startAngle: currAngle, endAngle: currAngle + arcAngle - this._config.explosionFactor, percentValue: percentValue,
                        info: { name: sectBaseData[i].name, cssClass: sectBaseData[i].cssClass, value: sectBaseData[i].value }
                    });
                    currAngle += arcAngle;
                }
            }
            return sectDonutData;
        };
        DonutChart.prototype.calculatePoints = function (sectDonutData) {
            var radius = this._config.radius;
            var labelRadius = this._config.radius + (this._config.strokeWidth / 2) + this._labelOffset;
            var sectDonutPoints = [];
            var anchor;
            for (var i = 0; i < sectDonutData.length; i++) {
                var sAngle = sectDonutData[i].startAngle;
                var eAngle = sectDonutData[i].endAngle;
                var midAngle = (sectDonutData.length === 1) ? 0 : (sAngle + eAngle) / 2;
                var sx = radius * Math.sin(sAngle * Math.PI / 180);
                var sy = radius * Math.cos(sAngle * Math.PI / 180) * -1;
                var ex = radius * Math.sin(eAngle * Math.PI / 180);
                var ey = radius * Math.cos(eAngle * Math.PI / 180) * -1;
                if (midAngle < 180 && midAngle > 0) {
                    labelRadius = (sectDonutData[i].percentValue > 9) ? labelRadius + (this._textFontPx / 2) : labelRadius;
                    anchor = "start";
                }
                else if (midAngle > 180) {
                    anchor = "end";
                }
                else {
                    anchor = "middle";
                }
                var tx = labelRadius * Math.sin(midAngle * Math.PI / 180);
                var ty = labelRadius * Math.cos(midAngle * Math.PI / 180) * -1;
                var largeArcFlag = (eAngle - sAngle) > 180 ? 1 : 0;
                var sweepFlag = (this._config.clockwiseRotation) ? 1 : 0;
                sectDonutPoints.push({ startPoint: { x: sx, y: sy }, endPoint: { x: ex, y: ey }, label: { point: { x: tx, y: ty }, anchor: anchor }, percentValue: sectDonutData[i].percentValue, largeArc: largeArcFlag, sweepFlag: sweepFlag, info: sectDonutData[i].info });
            }
            return sectDonutPoints;
        };
        DonutChart.prototype.createDivContainer = function () {
            var div = document.createElement("div");
            div.style.width = "100%";
            div.style.height = "100%";
            return div;
        };
        DonutChart.prototype.createSVG = function () {
            var svg = document.createElementNS(DonutChart.SvgNS, "svg");
            svg.setAttribute("version", "1.1");
            svg.setAttribute("width", this._config.containerWidth + "px");
            svg.setAttribute("height", this._config.containerHeight + "px");
            svg.setAttribute("focusable", "false");
            return svg;
        };
        DonutChart.prototype.createSVGPath = function (cssClass, dAttribute, strokeWidth, sectorDonutPoint) {
            var _this = this;
            var path = document.createElementNS(DonutChart.SvgNS, "path");
            path.setAttribute("class", cssClass);
            path.setAttribute("d", dAttribute);
            path.setAttribute("stroke-width", strokeWidth.toString());
            if (this._renderTooltipCallback) {
                path.onmouseover = function () { return _this.showToolTip(sectorDonutPoint.info, sectorDonutPoint.percentValue); };
                path.onmouseout = function (mouseEvent) { return Microsoft.Plugin.Tooltip.dismiss(); };
            }
            if (this._addSectorAriaLabelCallback) {
                this._addSectorAriaLabelCallback(sectorDonutPoint.info, sectorDonutPoint.percentValue);
            }
            return path;
        };
        DonutChart.prototype.createSVGText = function (xPosition, yPosition, anchor, percentValue) {
            var text = document.createElementNS(DonutChart.SvgNS, "text");
            text.setAttribute("x", xPosition.toString());
            text.setAttribute("y", yPosition.toString());
            text.setAttribute("text-anchor", anchor);
            text.setAttribute("class", "BPT-donutChartText");
            text.textContent = Microsoft.Plugin.Resources.getString("InclusiveTimeSVGLabelString", Math.floor(percentValue));
            return text;
        };
        DonutChart.prototype.draw = function (sectDonutPoints) {
            // If needed store the previous svg element as buffer for increasing performance.
            if (typeof this._svg !== "undefined") {
                this._div.removeChild(this._svg);
            }
            this._svg = this.createSVG();
            if (sectDonutPoints.length === 1) {
                var i = 0;
                var dPath = "M " + this._centerX + "," + this._centerY +
                    " M " + (this._centerX + sectDonutPoints[i].startPoint.x) + ", " + (this._centerY + sectDonutPoints[i].startPoint.y) +
                    " A " + this._config.radius + "," + this._config.radius + " 1 " + sectDonutPoints[i].largeArc + ", " + sectDonutPoints[i].sweepFlag +
                    " " + (this._centerX + sectDonutPoints[i].startPoint.x) + "," + (this._centerY + sectDonutPoints[i].startPoint.y + this._config.radius * 2) +
                    " A " + this._config.radius + "," + this._config.radius + " 1 " + sectDonutPoints[i].largeArc + ", " + sectDonutPoints[i].sweepFlag +
                    " " + (this._centerX + sectDonutPoints[i].endPoint.x) + "," + (this._centerY + sectDonutPoints[i].endPoint.y);
                var arc = this.createSVGPath(sectDonutPoints[i].info.cssClass, dPath, this._config.strokeWidth, sectDonutPoints[i]);
                this._svg.appendChild(arc);
                var text = this.createSVGText(this._centerX + sectDonutPoints[i].label.point.x, this._centerY + sectDonutPoints[i].label.point.y, sectDonutPoints[i].label.anchor, sectDonutPoints[i].percentValue);
                this._svg.appendChild(text);
            }
            else if (sectDonutPoints.length > 1) {
                for (var i = 0; i < sectDonutPoints.length; i++) {
                    var dPath = "M " + this._centerX + "," + this._centerY +
                        " M " + (this._centerX + sectDonutPoints[i].startPoint.x) + ", " + (this._centerY + sectDonutPoints[i].startPoint.y) +
                        " A " + this._config.radius + "," + this._config.radius + " 1 " + sectDonutPoints[i].largeArc + ", " + sectDonutPoints[i].sweepFlag +
                        " " + (this._centerX + sectDonutPoints[i].endPoint.x) + "," + (this._centerY + sectDonutPoints[i].endPoint.y);
                    var arc = this.createSVGPath(sectDonutPoints[i].info.cssClass, dPath, this._config.strokeWidth, sectDonutPoints[i]);
                    this._svg.appendChild(arc);
                    if (sectDonutPoints[i].percentValue > Math.round(this._config.minDonutArcAngle * 100 / 360)) {
                        var text = this.createSVGText(this._centerX + sectDonutPoints[i].label.point.x, this._centerY + sectDonutPoints[i].label.point.y, sectDonutPoints[i].label.anchor, sectDonutPoints[i].percentValue);
                        this._svg.appendChild(text);
                    }
                }
            }
            this._div.appendChild(this._svg);
        };
        /*
         *  The getReductionFactor calculates the factor by which to reduce the size
         *  of all other arc angles to compensate for setting the minimum angle for
         *  the arc with the sector angle lesser than that of the minDonutArcAngle.
         *  Subsequently we set the minimum angle for the arc to be atleast minDonutArcAngle.
         *  and reduce the arc angle of all other arcs by this factor.
         */
        DonutChart.prototype.getReductionFactor = function (sectBaseData) {
            var currAngle = 0;
            var i = 0;
            var angleDifference = 0;
            for (i = 0; i < sectBaseData.length; i++) {
                currAngle = Math.round(360 * sectBaseData[i].value / this._totalValue);
                angleDifference += (currAngle < this._config.minDonutArcAngle) ? this._config.minDonutArcAngle - currAngle : 0;
            }
            return (1 - angleDifference / 360);
        };
        DonutChart.prototype.getResizedRadius = function (dimension) {
            return dimension / DonutChart.RadiusResizeFactor;
        };
        DonutChart.prototype.getResizedWidth = function (dimension) {
            return dimension / DonutChart.WidthResizeFactor;
        };
        DonutChart.prototype.getSectorIndex = function (sector) {
            for (var i = 0; i < this._sectBaseData.length; i++) {
                if (this._sectBaseData[i] === sector || (this._sectBaseData[i].name === sector.name && this._sectBaseData[i].cssClass === sector.cssClass && this._sectBaseData[i].value === sector.value)) {
                    return i;
                }
            }
            return -1;
        };
        DonutChart.prototype.resizeDimensions = function () {
            var smallDimension = (this._config.containerHeight > this._config.containerWidth) ? this._config.containerWidth : this._config.containerHeight;
            this._config.radius = this.getResizedRadius(smallDimension);
            this._config.strokeWidth = this.getResizedWidth(this._config.radius);
        };
        DonutChart.prototype.showToolTip = function (sector, percentValue) {
            var toolTipContent = this._renderTooltipCallback(sector, percentValue);
            if (toolTipContent !== "" && toolTipContent !== null && typeof toolTipContent !== "undefined") {
                var config = {
                    content: toolTipContent,
                };
                Microsoft.Plugin.Tooltip.show(config);
            }
        };
        DonutChart.SvgNS = "http://www.w3.org/2000/svg";
        DonutChart.RadiusResizeFactor = 4;
        DonutChart.WidthResizeFactor = 2.5;
        return DonutChart;
    }());
    VisualProfiler.DonutChart = DonutChart;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../Bpt.Diagnostics.Common/control.ts" />
// <reference path="../Bpt.Diagnostics.Common/templateControl.ts" />
//--------
/// <reference path="../VisualProfilerData.d.ts" />
/// <reference path="controls/DonutChart.ts" />
/// <reference path="EventsTimelineView.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var DonutChartModel = (function () {
        function DonutChartModel() {
            this._sectors = [];
        }
        Object.defineProperty(DonutChartModel.prototype, "headerText", {
            get: function () {
                return this._headerText;
            },
            set: function (value) {
                this._headerText = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChartModel.prototype, "sectors", {
            get: function () {
                return this._sectors;
            },
            enumerable: true,
            configurable: true
        });
        DonutChartModel.prototype.addSector = function (sector) {
            this._sectors.push(sector);
        };
        return DonutChartModel;
    }());
    VisualProfiler.DonutChartModel = DonutChartModel;
    var DonutChartViewModel = (function () {
        function DonutChartViewModel(container) {
            this._model = new DonutChartModel();
            this._view = new DonutChartView(container, this);
        }
        Object.defineProperty(DonutChartViewModel.prototype, "model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DonutChartViewModel.prototype, "view", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        return DonutChartViewModel;
    }());
    VisualProfiler.DonutChartViewModel = DonutChartViewModel;
    var DonutChartView = (function (_super) {
        __extends(DonutChartView, _super);
        function DonutChartView(container, controller) {
            _super.call(this, container);
            this._controller = controller;
            this.rootElement.tabIndex = 0;
            var config = {
                explosionFactor: 2, radius: 55, strokeWidth: 25, minDonutArcAngle: 10, containerWidth: 230, containerHeight: 200, clockwiseRotation: true
            };
            this._donutChart = new VisualProfiler.DonutChart(this.rootElement, this.onRenderSectorTooltip.bind(this), this.onAddSectorAriaLabel.bind(this), config);
            this.rootElement.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("InclusiveTimeAriaLabel"));
        }
        DonutChartView.prototype.render = function () {
            this.addHeaderElement();
            DonutChartView.sortEventsByValue(this._controller.model.sectors);
            this._donutChart.addSectors(this._controller.model.sectors);
            this._donutChart.render();
        };
        DonutChartView.sortEventsByValue = function (sectors) {
            sectors.sort(function (sector1, sector2) {
                return sector2.value - sector1.value;
            });
        };
        DonutChartView.prototype.addHeaderElement = function () {
            var div = document.createElement("div");
            var span = document.createElement("span");
            span.style.marginLeft = "10px";
            span.innerText = this._controller.model.headerText;
            div.appendChild(span);
            this.rootElement.insertBefore(div, this.rootElement.firstChild);
        };
        DonutChartView.prototype.onAddSectorAriaLabel = function (sector, percent) {
            if (this.addSectorAriaLabel) {
                var label = this.addSectorAriaLabel(sector, percent);
                if (label) {
                    var onAddSectorAriaLabel = this.rootElement.getAttribute("aria-label") + " " + label;
                    this.rootElement.setAttribute("aria-label", onAddSectorAriaLabel);
                }
            }
        };
        DonutChartView.prototype.onRenderSectorTooltip = function (sectorInfo, percent) {
            var timeStamp = VisualProfiler.FormattingHelpers.getPrettyPrintTime(new VisualProfiler.TimeStamp(sectorInfo.value));
            return Microsoft.Plugin.Resources.getString("SectorTooltipFormat", sectorInfo.name, Common.FormattingHelpers.getDecimalLocaleString(percent, /*includeGroupSeparators=*/ false), timeStamp);
        };
        return DonutChartView;
    }(Common.Controls.Legacy.Control));
    VisualProfiler.DonutChartView = DonutChartView;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var Divider = (function (_super) {
        __extends(Divider, _super);
        function Divider(container, initialOffsetX) {
            _super.call(this, "dividerTemplate");
            this._callbacks = [];
            this._container = container;
            // This DIV intercepts mouseovers that might otherwise trigger tooltips or CSS hover rules on nearby elements.
            this._backdrop = this.findElement("dividerBackdrop");
            this._divider = this.findElement("divider");
            this._divider.addEventListener("mousedown", this.onMouseDown.bind(this), true /*useCapture*/);
            this._container.appendChild(this._backdrop);
            this._container.appendChild(this._divider);
            this._minX = 0;
            this.offsetX = initialOffsetX;
            this._onMouseMoveHandler = this.onMouseMove.bind(this);
            this._onMouseUpHandler = this.onMouseUp.bind(this);
        }
        Object.defineProperty(Divider.prototype, "height", {
            set: function (value) {
                this._divider.style.height = value + "px";
                this._backdrop.style.height = value + "px";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Divider.prototype, "dividerDivElement", {
            get: function () {
                return this._divider;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Divider.prototype, "offsetX", {
            get: function () {
                // First try to get the offset from the style, otherwise get offsetLeft
                if (this._divider.style.left) {
                    var leftValue = parseInt(this._divider.style.left);
                    if (!isNaN(leftValue)) {
                        return leftValue;
                    }
                }
                return this._divider.offsetLeft;
            },
            set: function (value) {
                var xPos = value;
                if (xPos < this._minX) {
                    xPos = this._minX;
                }
                else if (xPos > this._maxX) {
                    xPos = this._maxX;
                }
                this._divider.style.left = xPos + "px";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Divider.prototype, "minX", {
            get: function () {
                return this._minX;
            },
            set: function (value) {
                this._minX = value;
                if (this.offsetX < this._minX) {
                    this.offsetX = this._minX;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Divider.prototype, "maxX", {
            get: function () {
                return this._maxX;
            },
            set: function (value) {
                this._maxX = value;
                if (this.offsetX > this._maxX) {
                    this.offsetX = this._maxX;
                }
            },
            enumerable: true,
            configurable: true
        });
        Divider.prototype.moveToOffset = function (offset, forceMove) {
            if (this.updateOffsetX(offset, forceMove)) {
                if (this.onMoved) {
                    this.onMoved(this._divider.offsetLeft);
                }
            }
        };
        Divider.prototype.onMouseDown = function (e) {
            this._backdrop.style.zIndex = "1000";
            this._backdrop.appendChild(this._divider);
            this._backdrop.setCapture();
            this._backdrop.addEventListener("mousemove", this._onMouseMoveHandler, true /*useCapture*/);
            this._backdrop.addEventListener("mouseup", this._onMouseUpHandler, true /*useCapture*/);
        };
        Divider.prototype.onMouseMove = function (e) {
            if (this.updateOffsetX(e.offsetX)) {
                if (this.onMoved) {
                    this.onMoved(this._divider.offsetLeft);
                }
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        };
        Divider.prototype.onMouseUp = function (e) {
            if (this._container.firstChild) {
                this._container.insertBefore(this._divider, this._container.firstChild);
            }
            else {
                this._container.appendChild(this._divider);
            }
            this._backdrop.releaseCapture();
            this._backdrop.style.zIndex = "-1";
            this._backdrop.removeEventListener("mousemove", this._onMouseMoveHandler, true /*useCapture*/);
            this._backdrop.removeEventListener("mouseup", this._onMouseUpHandler, true /*useCapture*/);
            if (this.updateOffsetX(e.offsetX)) {
                if (this.onMoved) {
                    this.onMoved(this._divider.offsetLeft);
                }
            }
        };
        Divider.prototype.updateOffsetX = function (x, forceUpdate) {
            var isOutsideDivider = x < this._divider.offsetLeft || x > (this._divider.offsetLeft + this._divider.offsetWidth);
            if (isOutsideDivider || forceUpdate) {
                this.offsetX = x;
                return true;
            }
            return false;
        };
        return Divider;
    }(Common.Controls.Legacy.TemplateControl));
    VisualProfiler.Divider = Divider;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../Bpt.Diagnostics.PerfTools.Common/Controls/SourceInfoTooltip.ts" />
// <reference path="../Bpt.Diagnostics.PerfTools.Common/TokenExtractor.ts" />
// <reference path="../Bpt.Diagnostics.Common/ListControl/TreeListControl.ts" />
// <reference path="../Bpt.Diagnostics.Common/ElementRecyclerFactory.ts" />
//--------
/// <reference path="../Program.ts" />
/// <reference path="../VisualProfilerData.d.ts" />
/// <reference path="FormattingHelpers.ts" />
/// <reference path="TimeSpan.ts" />
/// <reference path="controls/Divider.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    (function (EventCategory) {
        EventCategory[EventCategory["GC"] = 0] = "GC";
        EventCategory[EventCategory["Network"] = 1] = "Network";
        EventCategory[EventCategory["DiskIo"] = 2] = "DiskIo";
        EventCategory[EventCategory["Idle"] = 3] = "Idle";
        EventCategory[EventCategory["WindowResized"] = 4] = "WindowResized";
        EventCategory[EventCategory["AppStartup"] = 5] = "AppStartup";
        EventCategory[EventCategory["VisualStateChanged"] = 6] = "VisualStateChanged";
        EventCategory[EventCategory["XamlFrameNavigation"] = 7] = "XamlFrameNavigation";
        EventCategory[EventCategory["XamlParsing"] = 8] = "XamlParsing";
        EventCategory[EventCategory["XamlLayout"] = 9] = "XamlLayout";
        EventCategory[EventCategory["XamlRender"] = 10] = "XamlRender";
        EventCategory[EventCategory["XamlUIElementCost"] = 11] = "XamlUIElementCost";
        EventCategory[EventCategory["XamlUIThreadFrame"] = 12] = "XamlUIThreadFrame";
        EventCategory[EventCategory["XamlOther"] = 13] = "XamlOther";
        EventCategory[EventCategory["AppCode"] = 14] = "AppCode";
    })(VisualProfiler.EventCategory || (VisualProfiler.EventCategory = {}));
    var EventCategory = VisualProfiler.EventCategory;
    (function (TextFormat) {
        TextFormat[TextFormat["Html"] = 0] = "Html";
        TextFormat[TextFormat["String"] = 1] = "String";
    })(VisualProfiler.TextFormat || (VisualProfiler.TextFormat = {}));
    var TextFormat = VisualProfiler.TextFormat;
    var EventDataTooltip = (function (_super) {
        __extends(EventDataTooltip, _super);
        function EventDataTooltip(event) {
            _super.call(this, "eventDataTooltip");
            var durationExclusive = this.findElement("durationExc");
            var durationInclusive = this.findElement("durationInc");
            var startTime = this.findElement("startTime");
            durationExclusive.textContent = Microsoft.Plugin.Resources.getString("DurationLabelExclusive", VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.exclusiveDuration));
            durationInclusive.textContent = Microsoft.Plugin.Resources.getString("DurationLabelInclusive", VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.timeSpan.elapsed));
            startTime.textContent = Microsoft.Plugin.Resources.getString("StartTimeLabel", VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.timeSpan.begin));
        }
        return EventDataTooltip;
    }(Common.Controls.Legacy.TemplateControl));
    VisualProfiler.EventDataTooltip = EventDataTooltip;
    var EventDataTemplate = (function (_super) {
        __extends(EventDataTemplate, _super);
        function EventDataTemplate() {
            var _this = this;
            _super.call(this, "eventDataTemplate");
            this._bar = this.findElement("bar");
            this._durationText = this.findElement("durationText");
            this._hintText = this.findElement("hintText");
            this._eventDataTemplateNameCell = this.findElement("eventDataTemplateNameCell");
            this._eventData = this.findElement("eventData");
            this._eventName = this.findElement("eventName");
            this._threadIndicator = this.findElement("threadIndicator");
            this._bar.addEventListener("mouseover", function (e) { return _this.showBarTooltip(); });
            this._bar.addEventListener("mouseout", function (e) { return Microsoft.Plugin.Tooltip.dismiss(); });
            this._threadIndicator.addEventListener("mouseover", function (e) { return _this.showThreadIndicatorTooltip(e); });
            this._threadIndicator.addEventListener("mouseout", function (e) { return Microsoft.Plugin.Tooltip.dismiss(); });
            this._eventName.addEventListener("mouseover", function (e) { return _this.showEventNameTooltip(e); });
            this._eventName.addEventListener("mouseout", function (e) { return Microsoft.Plugin.Tooltip.dismiss(); });
            this._hintText.addEventListener("mouseover", function (e) { return _this.showEventDetailsHintTooltip(e); });
            this._hintText.addEventListener("mouseout", function (e) { return Microsoft.Plugin.Tooltip.dismiss(); });
        }
        Object.defineProperty(EventDataTemplate.prototype, "eventNameDiv", {
            get: function () {
                return this._eventName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventDataTemplate.prototype, "canViewSource", {
            get: function () {
                var sourceInfo = this._event.context ? this._event.context.sourceInfo : null;
                return EventDataTemplate.hasViewSourceInfo(sourceInfo);
            },
            enumerable: true,
            configurable: true
        });
        EventDataTemplate.addTokens = function (text, div, textFormat) {
            var tokens;
            switch (textFormat) {
                case TextFormat.Html:
                    tokens = Common.TokenExtractor.getHtmlTokens(text);
                    break;
                case TextFormat.String:
                    tokens = Common.TokenExtractor.getStringTokens(text);
                    break;
            }
            if (tokens && tokens.length > 0) {
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i];
                    var tokenSpan = document.createElement("span");
                    tokenSpan.className = Common.TokenExtractor.getCssClass(token.type);
                    tokenSpan.textContent = token.value;
                    div.appendChild(tokenSpan);
                }
            }
            else {
                div.textContent = text;
            }
        };
        EventDataTemplate.hasViewSourceInfo = function (sourceInfo) {
            // <DOM> is a default source script that the Datawarehouse returns whenever it cannot resolve the document. In this case we don't want to add a source link
            // as it won't navigate anywhere. This string needs to be kept in sync w/ edev\DiagnosticsHub\sources\Core\DiagnosticsHub.DataWarehouse\ActiveScriptSymbols.cpp.
            return sourceInfo && sourceInfo.source !== "<DOM>";
        };
        EventDataTemplate.setViewSourceHandler = function (element, sourceInfo, keyboardNavigable, event) {
            element.addEventListener("mouseover", function (e) { return EventDataTemplate.showSourceInfoTooltip(e, sourceInfo, event); });
            element.addEventListener("mouseout", function (e) { return Microsoft.Plugin.Tooltip.dismiss(); });
            element.onclick = EventDataTemplate.contextMouseHandler.bind(this, sourceInfo);
            if (keyboardNavigable) {
                element.tabIndex = 0;
                element.onkeydown = EventDataTemplate.contextKeyHandler.bind(this, sourceInfo);
            }
        };
        EventDataTemplate.showSourceInfoTooltip = function (mouseEvent, sourceInfo, event) {
            if (sourceInfo) {
                var tooltip = new Common.Controls.Legacy.SourceInfoTooltip(sourceInfo, event, "SourceInfoEventLabel");
                var config = {
                    content: tooltip.html,
                    contentContainsHTML: true
                };
                Microsoft.Plugin.Tooltip.show(config);
                mouseEvent.stopImmediatePropagation();
            }
        };
        EventDataTemplate.prototype.tryViewSource = function () {
            if (this.canViewSource) {
                var sourceInfo = this._event.context.sourceInfo;
                EventDataTemplate.viewSource(sourceInfo.source, sourceInfo.line, sourceInfo.column);
            }
        };
        EventDataTemplate.prototype.updateEvent = function (event, parentTimeSpan, viewSettings) {
            if (this._event !== event || !this._parentTimeSpan || !this._parentTimeSpan.equals(parentTimeSpan) || this._viewSettings !== viewSettings) {
                this._event = event;
                this._parentTimeSpan = parentTimeSpan;
                this._viewSettings = viewSettings;
                this.updateData(event);
            }
        };
        EventDataTemplate.prototype.updateUiOverride = function (event) {
            _super.prototype.updateUiOverride.call(this, event);
            if (event.isEventOnUIThread && this._viewSettings.showThreadIndicator) {
                this._threadIndicator.classList.remove("hidden");
            }
            else {
                this._threadIndicator.classList.add("hidden");
            }
            if (event.context) {
                this._eventName.textContent = "";
                var appendSpan = function (text, parent) {
                    if (text) {
                        var span = document.createElement("span");
                        span.textContent = text;
                        parent.appendChild(span);
                    }
                };
                appendSpan(event.fullName.substring(0, event.context.span.startIndex), this._eventName);
                var text = event.fullName.substring(event.context.span.startIndex, event.context.span.endIndex);
                var span = this.getContextSpan(event.name, text, event.context.sourceInfo);
                this._eventName.appendChild(span);
                appendSpan(event.fullName.substring(event.context.span.endIndex), this._eventName);
            }
            else if (event instanceof VisualProfiler.ProfilerEvent && Common.TokenExtractor.isHtmlExpression(event.fullName)) {
                this._eventName.textContent = "";
                EventDataTemplate.addTokens(event.fullName, this._eventName, TextFormat.Html);
            }
            else if (event instanceof VisualProfiler.ProfilerEvent && Common.TokenExtractor.isStringExpression(event.fullName)) {
                this._eventName.textContent = "";
                EventDataTemplate.addTokens(event.fullName, this._eventName, TextFormat.String);
            }
            else {
                if (this._viewSettings.showQualifiersInEventNames) {
                    this._eventName.textContent = event.fullName;
                }
                else {
                    this._eventName.textContent = event.name;
                }
            }
            var left = (event.timeSpan.begin.nsec - this._parentTimeSpan.begin.nsec) / this._parentTimeSpan.elapsed.nsec * 100;
            var width = event.timeSpan.elapsed.nsec / this._parentTimeSpan.elapsed.nsec * 100;
            this._bar.style.marginLeft = left + "%";
            this._bar.style.width = width + "%";
            EventDataTemplate.setBarCss(this._bar, event);
            var durationText = VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.timeSpan.elapsed);
            if (!event.exclusiveDuration.equals(event.timeSpan.elapsed) && (this._viewSettings.showDurationSelfInTimeline)) {
                durationText += " (" + VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.exclusiveDuration) + ")";
            }
            this._durationText.textContent = durationText;
            var hintData = event.getDetailsHintData();
            if (hintData && this._viewSettings.showHintTextInTimeline) {
                this._hintText.textContent = hintData.text;
            }
            else {
                this._hintText.textContent = "";
            }
        };
        EventDataTemplate.contextKeyHandler = function (sourceInfo, evt) {
            if ((evt.keyCode === Common.KeyCodes.Enter || evt.keyCode === Common.KeyCodes.Space) && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
                EventDataTemplate.viewSource(sourceInfo.source, sourceInfo.line, sourceInfo.column);
            }
        };
        EventDataTemplate.contextMouseHandler = function (sourceInfo) {
            // When the mouse click occurs on a source hyperlink in the timeline grid,
            // the click event will bubble up through link's onclick event handler to
            // the parent ItemContainer's element, which will select the row.
            // We need the view source navigation below to occur after row selection
            // so that the row selection doesn't resteal focus from the debugger
            // after view source navigation.
            window.setImmediate(function () {
                EventDataTemplate.viewSource(sourceInfo.source, sourceInfo.line, sourceInfo.column);
            });
        };
        EventDataTemplate.setBarCss = function (bar, event) {
            bar.className = "eventBar " + event.getCssClass();
            var barCssClass = event.getBarCssClass();
            if (barCssClass) {
                bar.classList.add(barCssClass);
            }
        };
        EventDataTemplate.viewSource = function (unshortenedUrl, line, column) {
            Microsoft.Plugin.Host.showDocument(unshortenedUrl, line, column).done(function () { }, function (err) {
                VisualProfiler.Program.hostShell.setStatusBarText(Microsoft.Plugin.Resources.getString("UnableToNavigateToSource"), true /*highlight*/);
            });
        };
        EventDataTemplate.prototype.getContextSpan = function (eventName, linkText, sourceInfo) {
            var contextLink = document.createElement("span");
            contextLink.textContent = linkText;
            var sourceInfo = this._event.context ? this._event.context.sourceInfo : null;
            if (EventDataTemplate.hasViewSourceInfo(sourceInfo)) {
                contextLink.className = "BPT-FileLink";
                EventDataTemplate.setViewSourceHandler(contextLink, sourceInfo, false /*keyboardNavigable*/, eventName);
            }
            return contextLink;
        };
        EventDataTemplate.prototype.showBarTooltip = function () {
            if (this._event) {
                var toolTipControl = new EventDataTooltip(this._event);
                var config = {
                    content: toolTipControl.rootElement.innerHTML,
                    contentContainsHTML: true
                };
                Microsoft.Plugin.Tooltip.show(config);
            }
        };
        EventDataTemplate.prototype.showEventNameTooltip = function (mouseEvent) {
            if (this._event) {
                var eventDiv = mouseEvent.currentTarget;
                var tooltip = this._event.getTitleTooltipText();
                var config = {
                    content: tooltip
                };
                Microsoft.Plugin.Tooltip.show(config);
            }
        };
        EventDataTemplate.prototype.showThreadIndicatorTooltip = function (mouseEvent) {
            if (this._event) {
                var tooltip = Microsoft.Plugin.Resources.getString("UIThreadIndicatorTooltip");
                var config = {
                    content: tooltip
                };
                Microsoft.Plugin.Tooltip.show(config);
            }
        };
        EventDataTemplate.prototype.showEventDetailsHintTooltip = function (mouseEvent) {
            if (this._event) {
                var eventDiv = mouseEvent.currentTarget;
                var tooltip = this._event.getDetailsHintData().tooltip;
                var config = {
                    content: tooltip
                };
                Microsoft.Plugin.Tooltip.show(config);
            }
        };
        return EventDataTemplate;
    }(Common.Controls.Legacy.TreeItemDataTemplate));
    VisualProfiler.EventDataTemplate = EventDataTemplate;
    var EventsTimelineListControl = (function (_super) {
        __extends(EventsTimelineListControl, _super);
        function EventsTimelineListControl(rootElement) {
            var _this = this;
            _super.call(this, rootElement);
            this._columnsCssRule = this.getColumnsCssRule();
            this.ariaLabel = Microsoft.Plugin.Resources.getString("EventsTimelineAriaLabel");
            this.dataItemTemplateType = VisualProfiler.EventDataTemplate;
            this.onGetItemContainerAriaLabel = function (ic) { return _this.getItemContainerAriaLabel(ic); };
            this.onScrolled = function (e) {
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.GridScrolled);
                VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_GridScrolled);
            };
            this.onItemContextMenuTriggered = function (itemContainer) {
                _this._contextMenuSourceEvent = itemContainer.item;
            };
            // Changing to/from a high contrast theme invalidates the reference to the css rule
            // The theme change also fires the resize event.  This will update the css rule reference in that scenario
            VisualProfiler.Program.addEventListener(VisualProfiler.ProgramEvents.Resize, function () {
                _this._columnsCssRule = _this.getColumnsCssRule();
                _this.invalidateSizeCache();
                if (_this._viewModel) {
                    _this.setDividerBounds();
                    _this.resizeColumns(_this._divider.offsetX);
                }
                _this.onWindowResize();
            });
            Microsoft.Plugin.Theme.addEventListener("themechanged", function () {
                // When the theme changes the styles are reset back to the values in the CSS file, but this event fires before that 
                // happens. We use a setTimeout callback so we reset the divider location after the styles have been reset. 
                setTimeout(function () {
                    _this._columnsCssRule = _this.getColumnsCssRule();
                    // Moving the left divider (event name divider) will trigger a reset of the gantt chart as well as the right divider (details pane)
                    _this._divider.moveToOffset(_this.eventNameColumnWidth, true);
                }, 100);
            });
            this._divider = new VisualProfiler.Divider(this.panel.rootElement, this.eventNameColumnWidth);
            this._divider.minX = 90;
            this._divider.onMoved = function (offsetX) {
                _this.resizeColumns(offsetX);
                VisualProfiler.Program.triggerResize();
            };
            this._divider.dividerDivElement.ondblclick = function () {
                // Figure out the minimun width that will make all the event names visible and move the divider by that ammount
                var eventNameCellRequiredWidth = 0;
                for (var i = _this.panel.firstVisibleItemIndex; i <= _this.panel.lastVisibleItemIndex; i++) {
                    var itemContainer = _this.itemContainerGenerator.getItemContainerFromIndex(i);
                    if (itemContainer) {
                        var eventNameDiv = itemContainer.template.eventNameDiv;
                        if (eventNameDiv) {
                            eventNameCellRequiredWidth = Math.max(eventNameDiv.offsetLeft + eventNameDiv.scrollWidth + 10, eventNameCellRequiredWidth);
                        }
                    }
                }
                _this._divider.moveToOffset(eventNameCellRequiredWidth);
            };
            this.setDividerBounds();
            this._verticalRulerLineElementsFactory = Common.ElementRecyclerFactory.forDivWithClass(this.rootElement, "verticalRulerLine");
            this.invalidateSizeCache();
        }
        Object.defineProperty(EventsTimelineListControl.prototype, "dataColumnLeft", {
            get: function () {
                var columns = this._columnsCssRule.style.msGridColumns.split(" ");
                return parseInt(columns[0]) + parseInt(columns[1]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineListControl.prototype, "dataColumnWidth", {
            get: function () {
                if (this._dataColumnWidth === null) {
                    var panelScrollBarWidth = this.panel.rootElement.offsetWidth - this.panel.rootElement.clientWidth;
                    this._dataColumnWidth = this.rootElement.offsetWidth - this.dataColumnLeft - panelScrollBarWidth;
                }
                return this._dataColumnWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineListControl.prototype, "eventNameColumnWidth", {
            get: function () {
                var columns = this._columnsCssRule.style.msGridColumns.split(" ");
                return parseInt(columns[0]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineListControl.prototype, "rulerScale", {
            get: function () {
                return this._rulerScale;
            },
            set: function (rulerScale) {
                if (this._rulerScale !== rulerScale) {
                    this._rulerScale = rulerScale;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineListControl.prototype, "timeSpan", {
            set: function (value) {
                this._timeSpan = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineListControl.prototype, "viewModel", {
            set: function (value) {
                this._viewModel = value;
            },
            enumerable: true,
            configurable: true
        });
        EventsTimelineListControl.prototype.invalidateSizeCache = function () {
            this._dataColumnWidth = null;
            _super.prototype.invalidateSizeCache.call(this);
        };
        /**
         * Called when the list control gets invalidated
         */
        EventsTimelineListControl.prototype.onInvalidated = function () {
            this.updateDividerHeight();
        };
        /**
         * Overridable. Gives the derived a class a chance to intercept key events.
         * @params event the keyboard event
         * @returns true if handled
         */
        EventsTimelineListControl.prototype.onKeyDownOverride = function (event) {
            var handled = false;
            switch (event.keyCode) {
                case Common.KeyCodes.Enter:
                    this.onViewSource();
                    return Microsoft.Plugin.Promise.wrap(true);
            }
            return _super.prototype.onKeyDownOverride.call(this, event);
        };
        EventsTimelineListControl.prototype.onShowContextMenu = function () {
            var _this = this;
            this.getSelectedItemContainer()
                .done(function (selectedItemContainer) {
                if (selectedItemContainer && _this._contextMenu) {
                    var rect = selectedItemContainer.template.rootElement.getBoundingClientRect();
                    _this._contextMenu.show(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width);
                }
            });
        };
        EventsTimelineListControl.prototype.renderVerticalRulerLines = function () {
            var positions = this._viewModel.getVerticalRulerLinePositions(this._timeSpan, this.dataColumnWidth);
            this._verticalRulerLineElementsFactory.start();
            for (var i = 0; i < positions.length; ++i) {
                var line = this._verticalRulerLineElementsFactory.getNext();
                var x = this.dataColumnWidth * positions[i] / 100 + this.dataColumnLeft;
                this.positionVerticalRulerLine(line, x, this.panel.viewportHeight);
            }
            this._verticalRulerLineElementsFactory.stop();
        };
        /**
         * Updates the data inside the template
         */
        EventsTimelineListControl.prototype.updateTemplateData = function (template, data) {
            template.updateEvent(data, this._timeSpan, this._viewModel.viewSettings);
            // Setup the context menu
            if (!template.rootElement.getAttributeNode("data-plugin-contextmenu")) {
                this.setupEventContextMenu(template.rootElement);
            }
        };
        EventsTimelineListControl.prototype.positionVerticalRulerLine = function (line, x, height) {
            line.style.left = x + "px";
            line.style.height = height + "px";
            line.style.top = "0px";
        };
        EventsTimelineListControl.prototype.getColumnsCssRule = function () {
            return VisualProfiler.EventsTimelineView.getCssRule("VisualProfiler.css", ".eventDataTemplate");
        };
        EventsTimelineListControl.prototype.resizeColumns = function (offsetX) {
            this._dataColumnWidth = null;
            this.updateColumnWidth(offsetX);
            if (this.dataColumnWidthChanged) {
                this.dataColumnWidthChanged();
            }
            this.renderVerticalRulerLines();
        };
        /**
         * @param elements The elements to attach the selection context menu to
         */
        EventsTimelineListControl.prototype.setupEventContextMenu = function () {
            var _this = this;
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i - 0] = arguments[_i];
            }
            if (!this._contextMenu) {
                var iconNames = this.getSelectionContextMenuIconNames();
                var filterToEventItem = {
                    callback: function () { _this.filterToEvent(); },
                    label: Microsoft.Plugin.Resources.getString("FilterToEventContextMenu"),
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.command,
                    disabled: function () { return false; }
                };
                var filterToEventTypeItem = {
                    callback: function () { _this.filterToEventType(); },
                    label: Microsoft.Plugin.Resources.getString("FilterToEventTypeContextMenu"),
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.command,
                    disabled: function () { return _this.isFilterToEventTypeDisabled(); }
                };
                var clearFilterItem = {
                    callback: function () { _this.clearFilter(); },
                    label: Microsoft.Plugin.Resources.getString("ClearFilterContextMenu"),
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.command,
                    disabled: function () { return _this.isClearFilterDisabled(); }
                };
                //"View Source" functionality is not planned for Dev14 RTM
                //Add separatorMenuItem with viewSourceMenuItem
                /*var separatorMenuItem = <Microsoft.Plugin.ContextMenu.ContextMenuItem>{
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.separator
                };

                var viewSourceMenuItem = <Microsoft.Plugin.ContextMenu.ContextMenuItem>{
                    accessKey: Microsoft.Plugin.Resources.getString("EnterKey"),
                    callback: () => window.setImmediate(this.onViewSource.bind(this)),
                    disabled: this.isViewSourceCommandDisabled.bind(this),
                    label: Microsoft.Plugin.Resources.getString("ViewSourceLabel"),
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.command
                };*/
                this._contextMenu = Microsoft.Plugin.ContextMenu.create([filterToEventItem, filterToEventTypeItem, clearFilterItem]);
            }
            for (var index = 0; index < elements.length; index++) {
                this._contextMenu.attach(elements[index]);
            }
        };
        EventsTimelineListControl.prototype.getSelectionContextMenuIconNames = function () {
            if (VisualProfiler.Program.hostType === VisualProfiler.HostType.VS) {
                return {
                    zoomin: {
                        enabled: "vs-image-contextmenu-chartzoom-in",
                        disabled: "vs-image-contextmenu-chartzoom-in-disabled"
                    },
                    resetZoom: {
                        enabled: "vs-image-contextmenu-chartzoom-reset",
                        disabled: "vs-image-contextmenu-chartzoom-reset-disabled"
                    },
                    clearSelection: {
                        enabled: "vs-image-contextmenu-chartselection-clear",
                        disabled: "vs-image-contextmenu-chartselection-clear-disabled"
                    }
                };
            }
        };
        EventsTimelineListControl.prototype.isClearFilterDisabled = function () {
            return this._viewModel.hasDefaultFilter === true;
        };
        EventsTimelineListControl.prototype.isViewSourceCommandDisabled = function () {
            // TODO: Implement a way to access this data synchronously
            return true;
            //var itemContainer: Common.Controls.Legacy.IItemContainer = this.getSelectedItemContainer();
            //if (!itemContainer) {
            //    return false;
            //}
            //var dataTemplate = <EventDataTemplate>itemContainer.template;
            //return dataTemplate && !dataTemplate.canViewSource;
        };
        EventsTimelineListControl.prototype.getFilterTimeSpan = function (event) {
            // Time padding calculated based on an event's timespan
            // Pad 10% to the left and 90% to the right of an event in gantt chart.
            var paddingPixels = 50;
            var eventTimeSpan = event.timeSpan;
            var sessionTimeSpan = this._viewModel.globalRuler.totalRange;
            var begin = Math.max(eventTimeSpan.begin.nsec, sessionTimeSpan.begin.nsec);
            var end = Math.min(eventTimeSpan.end.nsec, sessionTimeSpan.end.nsec);
            return new VisualProfiler.TimeSpan(new VisualProfiler.TimeStamp(begin), new VisualProfiler.TimeStamp(end));
        };
        EventsTimelineListControl.prototype.clearFilter = function () {
            // Reset all filters
            this._viewModel.resetFilter();
            // And reset view to entire session time range (even if zoomed in)
            this._viewModel.globalRuler.setSelection(this._viewModel.globalRuler.totalRange);
            VisualProfiler.Program.reportTelemetry("TimelineFilter/ClearFilter", null);
        };
        EventsTimelineListControl.prototype.filterToEvent = function () {
            var _this = this;
            this.getSelectedItemContainer()
                .done(function (selectedItemContainer) {
                if (selectedItemContainer) {
                    selectedItemContainer.template.expand()
                        .done(function () {
                        var event = _this.selectedItem;
                        var filterTimeSpan = _this.getFilterTimeSpan(event);
                        var activeRange = _this._viewModel.globalRuler.activeRange;
                        if (!activeRange.equals(_this._viewModel.globalRuler.totalRange)) {
                            var begin = (filterTimeSpan.begin.nsec < activeRange.begin.nsec) ? filterTimeSpan.begin : activeRange.begin;
                            var end = (filterTimeSpan.end.nsec > activeRange.end.nsec) ? filterTimeSpan.end : activeRange.end;
                            _this._viewModel.globalRuler.setActiveRange(new VisualProfiler.TimeSpan(begin, end));
                        }
                        _this._viewModel.timeSpan = filterTimeSpan;
                        _this._viewModel.globalRuler.setSelection(filterTimeSpan);
                        VisualProfiler.Program.reportTelemetry("TimelineFilter/FilterToEvent", { "EventName": event.name });
                    });
                }
            });
        };
        EventsTimelineListControl.prototype.isFilterToEventTypeDisabled = function () {
            var enabled = this.contextMenuSourceEvent && this.contextMenuSourceEvent.level == 0;
            return !enabled;
        };
        EventsTimelineListControl.prototype.filterToEventType = function () {
            var _this = this;
            this.getSelectedItemContainer()
                .done(function (selectedItemContainer) {
                if (selectedItemContainer) {
                    selectedItemContainer.template.expand()
                        .done(function () {
                        var event = _this.selectedItem;
                        _this._viewModel.eventTypeFilter = event.intervalName;
                        VisualProfiler.Program.reportTelemetry("TimelineFilter/FilterToEventType", { "EventName": event.name });
                    });
                }
            });
        };
        EventsTimelineListControl.prototype.onViewSource = function () {
            this.getSelectedItemContainer()
                .done(function (selectedItemContainer) {
                if (selectedItemContainer) {
                    var dataTemplate = selectedItemContainer.template;
                    if (dataTemplate) {
                        dataTemplate.tryViewSource();
                    }
                }
            });
        };
        EventsTimelineListControl.prototype.setDividerBounds = function () {
            var containerWidth = this.panel.rootElement.offsetWidth;
            if (containerWidth > 0) {
                this._divider.maxX = containerWidth / 2;
            }
        };
        EventsTimelineListControl.prototype.getItemContainerAriaLabel = function (itemContainer) {
            var ariaLabel;
            var event = itemContainer.item;
            if (event) {
                ariaLabel = event.name;
                ariaLabel += " , " + Microsoft.Plugin.Resources.getString("StartTimeLabel", VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.timeSpan.begin));
                ariaLabel += " , " + Microsoft.Plugin.Resources.getString("DurationLabelInclusive", VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.timeSpan.elapsed));
                if (!event.timeSpan.elapsed.equals(event.exclusiveDuration)) {
                    ariaLabel += " , " + Microsoft.Plugin.Resources.getString("DurationLabelExclusive", VisualProfiler.FormattingHelpers.getPrettyPrintTime(event.exclusiveDuration));
                }
                ariaLabel += " , " + Microsoft.Plugin.Resources.getString("ThreadContextLabel", event.contextThreadId || Microsoft.Plugin.Resources.getString("UIThreadContext"));
                var additionalInfo = this._viewModel.getEventDetails(event);
                for (var i = 0; i < additionalInfo.length; i++) {
                    ariaLabel += " , " + additionalInfo[i].localizedName + ": " + additionalInfo[i].localizedValue;
                }
                ariaLabel += " , " + event.getDescription();
                itemContainer.rootElement.setAttribute("aria-label", ariaLabel);
            }
            else {
                itemContainer.rootElement.removeAttribute("aria-label");
            }
            return ariaLabel;
        };
        EventsTimelineListControl.prototype.updateColumnWidth = function (offsetX) {
            if (offsetX === null || typeof offsetX === "undefined") {
                offsetX = this._divider.offsetX;
            }
            var columns = this._columnsCssRule.style.msGridColumns.split(" ");
            columns[0] = offsetX + "px";
            this._columnsCssRule.style.msGridColumns = columns.join(" ");
        };
        EventsTimelineListControl.prototype.updateDividerHeight = function () {
            var height = Math.max(this.panel.virtualHeight, this.panel.actualHeight);
            this._divider.height = height;
        };
        Object.defineProperty(EventsTimelineListControl.prototype, "contextMenuSourceEvent", {
            get: function () {
                return this._contextMenuSourceEvent;
            },
            enumerable: true,
            configurable: true
        });
        return EventsTimelineListControl;
    }(Common.Controls.Legacy.TreeListControl));
    VisualProfiler.EventsTimelineListControl = EventsTimelineListControl;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var ImageUrlValidationHelpers = (function () {
        function ImageUrlValidationHelpers() {
        }
        ImageUrlValidationHelpers.isValidImageUrl = function (url) {
            return ImageUrlValidationHelpers.IMG_DATA_URI_REGEX.test(url) ||
                ImageUrlValidationHelpers.MS_APP_IMG_REGEX.test(url) ||
                ImageUrlValidationHelpers.IMG_DISK_REGEX.test(url);
        };
        ImageUrlValidationHelpers.IMG_URL_REGEX = /^(http|https).*([.jpg]|[.jpeg]|[.gif]|[.png])$/i;
        ImageUrlValidationHelpers.HTTP_URL_REGEX = /^(http|https).*$/i;
        ImageUrlValidationHelpers.IMG_URL_CONTENTTYPE_REGEX = /^(image)/i;
        ImageUrlValidationHelpers.IMG_DATA_URI_REGEX = /^(data:image\/).*$/i;
        ImageUrlValidationHelpers.MS_APP_IMG_REGEX = /^(ms-appx(-web)?:\/\/).*$/i;
        ImageUrlValidationHelpers.IMG_DISK_REGEX = /\.(gif|jpg|jpeg|tiff|png|bmp|tile)$/i;
        return ImageUrlValidationHelpers;
    }());
    VisualProfiler.ImageUrlValidationHelpers = ImageUrlValidationHelpers;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../Bpt.Diagnostics.PerfTools.Common/TokenExtractor.ts" />
// <reference path="../Bpt.Diagnostics.PerfTools.Common/enumHelper.ts" />
// <reference path="../Bpt.Diagnostics.Common/Controls/MenuControl.ts" />
// <reference path="../Bpt.Diagnostics.Common/Controls/ComboBox.ts" />
// <reference path="../Bpt.Diagnostics.Common/KeyCodes.ts" />
// <reference path="../Bpt.Diagnostics.Common/control.ts" />
// <reference path="../Bpt.Diagnostics.Common/templateControl.ts" />
// <reference path="../Bpt.Diagnostics.Common/trace.ts" />
// <reference path="../Bpt.Diagnostics.Common/toolwindow.ts" />
// <reference path="../Bpt.Diagnostics.PerfTools.Common/formattingHelpers.ts" />
// <reference path="../Bpt.Diagnostics.PerfTools.Common/Notifications.ts" />
// <reference path="../Bpt.Diagnostics.PerfTools.Common/Controls/SourceInfoTooltip.ts" />
// <reference path="../Bpt.Diagnostics.Common/TabControl.ts" />
// <reference path="../Bpt.Diagnostics.Common/TabItem.ts" />
//--------
/// <reference path="../../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../Program.ts" />
/// <reference path="../responsivenessNotifications.ts" />
/// <reference path="../VisualProfilerData.d.ts" />
/// <reference path="TimeSpan.ts" />
/// <reference path="GlobalRuler.ts" />
/// <reference path="MarkEventModel.ts" />
/// <reference path="DonutChartView.ts" />
/// <reference path="FormattingHelpers.ts" />
/// <reference path="EventsTimelineListControl.ts" />
/// <reference path="ImageUrlValidationHelpers.ts" />
/// <webunit-reference path="$(OutputPath)/Common/DiagnosticsHub.js" />
/// <webunit-reference path="$(OutputPath)/Common/Controls/hubControls.js" />
var VisualProfiler;
(function (VisualProfiler) {
    var Data;
    (function (Data) {
        // This enum needs to match the values assigned to the SortOptions combobox items
        (function (EventIntervalsSort) {
            EventIntervalsSort[EventIntervalsSort["ChronographicalSort"] = 0] = "ChronographicalSort";
            EventIntervalsSort[EventIntervalsSort["DurationSort"] = 1] = "DurationSort";
        })(Data.EventIntervalsSort || (Data.EventIntervalsSort = {}));
        var EventIntervalsSort = Data.EventIntervalsSort;
    })(Data = VisualProfiler.Data || (VisualProfiler.Data = {}));
})(VisualProfiler || (VisualProfiler = {}));
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    var ProfilerEvent = (function () {
        function ProfilerEvent(interval, category, uiThreadId) {
            this.details = [];
            this._interval = interval;
            this._category = category;
            this._contextThreadId = ProfilerEvent.getContextThreadId(interval, uiThreadId);
            this._timeSpan = new VisualProfiler.TimeSpan(VisualProfiler.TimestampConvertor.jsonToTimeStamp(interval.begin), VisualProfiler.TimestampConvertor.jsonToTimeStamp(interval.end));
            this._exclusiveTimeSpan = VisualProfiler.TimeStamp.fromNanoseconds(interval.exclusiveDuration);
            this.supportsImagePreview = false;
        }
        Object.defineProperty(ProfilerEvent.prototype, "category", {
            get: function () {
                return this._category;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "childrenCount", {
            get: function () {
                return this._interval.childrenCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "context", {
            get: function () {
                return this._interval.context;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "contextThreadId", {
            get: function () {
                return this._contextThreadId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "exclusiveDuration", {
            get: function () {
                return this._exclusiveTimeSpan;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "fullName", {
            get: function () {
                return this._interval.fullName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "intervalName", {
            get: function () {
                return this._interval.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "hasChildren", {
            get: function () {
                return this.interval.hasChildren;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "id", {
            get: function () {
                return this._interval.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "interval", {
            get: function () {
                return this._interval;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "isExpanded", {
            get: function () {
                return this._interval.isExpanded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "level", {
            get: function () {
                return this._interval.level;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "name", {
            get: function () {
                if (typeof this._name === "undefined") {
                    this._name = this.createName();
                }
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "timeSpan", {
            get: function () {
                return this._timeSpan;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "title", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfilerEvent.prototype, "isEventOnUIThread", {
            get: function () {
                return this.contextThreadId === null;
            },
            enumerable: true,
            configurable: true
        });
        ProfilerEvent.convertBooleanToYesNoLabel = function (value) {
            return value ? "YesLabel" : "NoLabel";
        };
        ProfilerEvent.convertPropagationStatus = function (propagationStatus) {
            // Propagation status is a bitmap indicating whether preventDefault, stopPropagation or stopImmediatePropagation has been called
            var result = {
                preventDefaultCalled: (propagationStatus & 1) != 0,
                stopImmediatePropagationCalled: (propagationStatus & 2) != 0,
                stopPropagationCalled: (propagationStatus & 4) != 0,
            };
            return result;
        };
        ProfilerEvent.createElementString = function (tag, id, cssClass) {
            var elementValue = "";
            var hasAnyElementInfo = false;
            if (tag !== "") {
                hasAnyElementInfo = true;
                elementValue += "<" + tag;
            }
            else {
                elementValue += "<" + Microsoft.Plugin.Resources.getString("UnknownElement");
            }
            if (id !== "") {
                hasAnyElementInfo = true;
                elementValue += " id=\"" + id + "\"";
            }
            if (cssClass !== "") {
                hasAnyElementInfo = true;
                elementValue += " class=\"" + cssClass + "\"";
            }
            elementValue += ">";
            if (hasAnyElementInfo === false) {
                elementValue = "";
            }
            return elementValue;
        };
        ProfilerEvent.createShortenedUrlTextWithQueryString = function (url) {
            if (!url || url.indexOf("data:image") === 0) {
                return url;
            }
            var urlParts = url.split("/");
            // for a file returning the last element is correct
            // no query string is expected
            if (ProfilerEvent.isFile(url)) {
                return urlParts[urlParts.length - 1];
            }
            // for a resource in the format: http://www.domain.com/dir/resource?id=5
            // the path begins at the 4th element in the array split by "/"
            if (ProfilerEvent.isUrl(url) && urlParts.length > 3) {
                return "/" + urlParts.slice(3, urlParts.length).join("/");
            }
            return url;
        };
        ProfilerEvent.prototype.createDetailInfo = function (name, value, nameLocalizationKey, valueLocalizationKey, sourceInfo) {
            var localizedValue;
            if (valueLocalizationKey) {
                localizedValue = Microsoft.Plugin.Resources.getString(valueLocalizationKey);
            }
            else {
                localizedValue = value;
            }
            var localizedName;
            if (nameLocalizationKey) {
                localizedName = Microsoft.Plugin.Resources.getString(nameLocalizationKey);
            }
            else {
                localizedName = name;
            }
            var additionalInfo = {
                propertyName: name,
                propertyValue: value,
                localizedName: localizedName,
                localizedValue: localizedValue
            };
            if (sourceInfo) {
                additionalInfo.sourceInfo = sourceInfo;
            }
            return additionalInfo;
        };
        ProfilerEvent.prototype.createName = function () {
            return Microsoft.Plugin.Resources.getString(this._interval.name);
        };
        ProfilerEvent.prototype.getBarCssClass = function () {
            switch (this._category) {
                case VisualProfiler.EventCategory.XamlFrameNavigation:
                case VisualProfiler.EventCategory.AppStartup:
                case VisualProfiler.EventCategory.WindowResized:
                    return "bracket";
                default:
                    return null;
            }
        };
        ProfilerEvent.prototype.getCssClass = function () {
            switch (this._category) {
                case VisualProfiler.EventCategory.GC:
                    return "dataGC";
                case VisualProfiler.EventCategory.Network:
                    return "dataNetwork";
                case VisualProfiler.EventCategory.DiskIo:
                    return "dataDiskIO";
                case VisualProfiler.EventCategory.XamlFrameNavigation:
                    return "dataFrameNavigation";
                case VisualProfiler.EventCategory.XamlParsing:
                    return "dataParsing";
                case VisualProfiler.EventCategory.XamlLayout:
                    return "dataLayout";
                case VisualProfiler.EventCategory.XamlUIElementCost:
                    return "dataUIElementCost";
                case VisualProfiler.EventCategory.XamlUIThreadFrame:
                    return "dataUIThreadFrame";
                case VisualProfiler.EventCategory.XamlRender:
                    return "dataRendering";
                case VisualProfiler.EventCategory.WindowResized:
                    return "dataWindowResized";
                case VisualProfiler.EventCategory.AppStartup:
                    return "dataAppStartup";
                case VisualProfiler.EventCategory.VisualStateChanged:
                    return "dataVisualStateChanged";
                case VisualProfiler.EventCategory.XamlOther:
                    return "dataXamlOther";
                case VisualProfiler.EventCategory.AppCode:
                    return "dataAppCode";
                case VisualProfiler.EventCategory.Idle:
                    return "dataIdle";
                default:
                    return "dataPlaceholder";
            }
        };
        ProfilerEvent.prototype.getDescription = function () {
            return "";
        };
        ProfilerEvent.prototype.getDetailsHintData = function () {
            return null;
        };
        ProfilerEvent.prototype.getTitleTooltipText = function () {
            return this.fullName;
        };
        ProfilerEvent.prototype.getPreviewImagePath = function () {
            return "";
        };
        ProfilerEvent.prototype.getDetails = function (sourceInfo) {
            return [];
        };
        ProfilerEvent.prototype.getEventDetailsRequestInformation = function () {
            return [];
        };
        ProfilerEvent.prototype.getThreadContext = function () {
            return this.isEventOnUIThread ? "" : " [" + this._contextThreadId + "]";
        };
        ProfilerEvent.prototype.setSourceDetails = function (sourceInfo, additionalInfos) {
            var shortenedUrl = ProfilerEvent.createShortenedUrlText(sourceInfo.source);
            var additionalInfo = {
                propertyName: "CallbackFunction",
                propertyValue: sourceInfo.name,
                localizedName: Microsoft.Plugin.Resources.getString("CallbackFunction"),
                localizedValue: sourceInfo.name,
                sourceInfo: sourceInfo
            };
            additionalInfos.push(additionalInfo);
        };
        ProfilerEvent.getContextThreadId = function (interval, uiThreadId) {
            if (interval.beginThreadId !== uiThreadId) {
                return interval.beginThreadId;
            }
            if (interval.endThreadId !== uiThreadId) {
                return interval.endThreadId;
            }
            return null;
        };
        // From the console/domexplorer shared toolwindow.ts
        /**
         * Returns a short form of the URL for use in displaying file links to the user.  Adapted
         * from F12 toolbar code, this method removes any trailing query string or anchor location
         * and attempts to get the last file or directory following a '/'.
         * Assumes the url is normalized.
         * If the string does not begin with "http:" or "https:", returns it unchanged.
         * @param url The url to shorten.
         * @returns A shortened version of the string
         */
        ProfilerEvent.createShortenedUrlText = function (url) {
            if (!ProfilerEvent.isUrl(url)) {
                return url;
            }
            return Common.ToolWindowHelpers.createShortenedUrlText(url);
        };
        ProfilerEvent.isFile = function (url) {
            return url.match(/^(file|res|ms-appx):/i) ? true : false;
        };
        ProfilerEvent.isUrl = function (url) {
            return url.match(/^(https?|file|res|ms-appx):/i) ? true : false;
        };
        return ProfilerEvent;
    }());
    VisualProfiler.ProfilerEvent = ProfilerEvent;
    var GarbageCollectionEvent = (function (_super) {
        __extends(GarbageCollectionEvent, _super);
        function GarbageCollectionEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var gcInterval = this.interval;
            this._tooltipText = Microsoft.Plugin.Resources.getString("GCEventTooltip", this.getGCReasonString(gcInterval.reason));
        }
        GarbageCollectionEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("GarbageCollectionEventDescription");
        };
        GarbageCollectionEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var gcInterval = this.interval;
            result.push(this.createDetailInfo("Reason", this.getGCReasonString(gcInterval.reason), "GarbageCollectionIntervalReason", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("Count", gcInterval.count, "GarbageCollectionIntervalCount", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("Type", this.getGCTypeString(gcInterval.type), "GarbageCollectionIntervalType", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("Generation", gcInterval.generation, "GarbageCollectionIntervalGeneration", null /*valueLocalizationKey*/));
            return result;
        };
        GarbageCollectionEvent.prototype.getGCReasonString = function (reason) {
            try {
                return Microsoft.Plugin.Resources.getString("GarbageCollectionReason" + reason);
            }
            catch (e) {
                // Reason string not found. Default to unknown reason.
                return Microsoft.Plugin.Resources.getString("GarbageCollectionReasonUnknown");
            }
        };
        GarbageCollectionEvent.prototype.getGCTypeString = function (type) {
            try {
                return Microsoft.Plugin.Resources.getString("GarbageCollectionType" + type);
            }
            catch (e) {
                // Type string not found. Default to unknown type.
                return Microsoft.Plugin.Resources.getString("GarbageCollectionTypeUnknown");
            }
        };
        GarbageCollectionEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        return GarbageCollectionEvent;
    }(ProfilerEvent));
    VisualProfiler.GarbageCollectionEvent = GarbageCollectionEvent;
    // Not a real event.  This exists purely for donut chart categorization.
    var IdleEvent = (function (_super) {
        __extends(IdleEvent, _super);
        function IdleEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        return IdleEvent;
    }(ProfilerEvent));
    VisualProfiler.IdleEvent = IdleEvent;
    var LayoutEvent = (function (_super) {
        __extends(LayoutEvent, _super);
        function LayoutEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var layoutInterval = this.interval;
            this._tooltipText = Microsoft.Plugin.Resources.getString("LayoutEventTooltip", layoutInterval.elementCount);
        }
        LayoutEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("LayoutEventDescription");
        };
        LayoutEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var layoutInterval = this.interval;
            result.push(this.createDetailInfo("ElementCount", layoutInterval.elementCount, "LayoutIntervalElementCount", null /*valueLocalizationKey*/));
            return result;
        };
        LayoutEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        return LayoutEvent;
    }(ProfilerEvent));
    VisualProfiler.LayoutEvent = LayoutEvent;
    var NetworkEvent = (function (_super) {
        __extends(NetworkEvent, _super);
        function NetworkEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var networkInterval = this.interval;
            var totalBytes = networkInterval.sentBytes + networkInterval.receivedBytes;
            if (totalBytes > 0) {
                var formattedTotalBytes = VisualProfiler.FormattingHelpers.getPrettyPrintBytes(totalBytes);
                this._hintData = {
                    text: Microsoft.Plugin.Resources.getString("IntervalDetailsHintText", formattedTotalBytes),
                    tooltip: Microsoft.Plugin.Resources.getString("NetworkIntervalDetailsHintTooltip", formattedTotalBytes)
                };
            }
            this._tooltipText = Microsoft.Plugin.Resources.getString("NetworkEventTooltip", networkInterval.url);
            var url = this.getPreviewImagePath();
            this.supportsImagePreview = this.isValidImageUrl(url) || VisualProfiler.ImageUrlValidationHelpers.isValidImageUrl(url);
        }
        NetworkEvent.prototype.isValidImageUrl = function (url) {
            if (!navigator.onLine) {
                return false;
            }
            var networkInterval = this.interval;
            return VisualProfiler.ImageUrlValidationHelpers.IMG_URL_REGEX.test(url) ||
                (VisualProfiler.ImageUrlValidationHelpers.HTTP_URL_REGEX.test(url) &&
                    (networkInterval.mimeType === "" || VisualProfiler.ImageUrlValidationHelpers.IMG_URL_CONTENTTYPE_REGEX.test(networkInterval.mimeType)));
        };
        NetworkEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("NetworkEventDescription");
        };
        NetworkEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var networkInterval = this.interval;
            result.push(this.createDetailInfo("Url", networkInterval.url, "NetworkIntervalUrl", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("Method", networkInterval.method, "NetworkIntervalMethod", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("StatusCode", Microsoft.Plugin.Resources.getString("NetworkIntervalStatusCodeValue", networkInterval.statusCode, networkInterval.statusText), "NetworkIntervalStatusCode", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("SentBytes", VisualProfiler.FormattingHelpers.getPrettyPrintBytes(networkInterval.sentBytes), "NetworkIntervalSentBytes", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("ReceivedBytes", VisualProfiler.FormattingHelpers.getPrettyPrintBytes(networkInterval.receivedBytes), "NetworkIntervalReceivedBytes", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("ContentType", networkInterval.mimeType, "NetworkIntervalContentType", null /*valueLocalizationKey*/));
            return result;
        };
        NetworkEvent.prototype.getDetailsHintData = function () {
            return this._hintData;
        };
        NetworkEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        NetworkEvent.prototype.getPreviewImagePath = function () {
            var networkInterval = this.interval;
            return networkInterval.url;
        };
        return NetworkEvent;
    }(ProfilerEvent));
    VisualProfiler.NetworkEvent = NetworkEvent;
    var DiskIOEvent = (function (_super) {
        __extends(DiskIOEvent, _super);
        function DiskIOEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var diskIoInterval = this.interval;
            if (diskIoInterval.size > 0) {
                this._formattedTotalBytes = VisualProfiler.FormattingHelpers.getPrettyPrintBytes(diskIoInterval.size);
                this._hintData = {
                    text: Microsoft.Plugin.Resources.getString("IntervalDetailsHintText", this._formattedTotalBytes),
                    tooltip: Microsoft.Plugin.Resources.getString("DiskIOIntervalDetailsHintTooltip", this._formattedTotalBytes)
                };
            }
            this._operation = this.getDiskIOTypeString(diskIoInterval.ioType);
            this._tooltipText = Microsoft.Plugin.Resources.getString("DiskIOTooltip", this._operation, diskIoInterval.path);
            this.supportsImagePreview = VisualProfiler.ImageUrlValidationHelpers.isValidImageUrl(this.getPreviewImagePath());
        }
        DiskIOEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("DiskIODescription");
        };
        DiskIOEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var diskIoInterval = this.interval;
            result.push(this.createDetailInfo("Operation", this._operation, "DiskIOIntervalOperation", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("FileName", diskIoInterval.fileName, "DiskIOIntervalFileName", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("Path", diskIoInterval.path, "DiskIOIntervalPath", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("Size", this._formattedTotalBytes, "DiskIOIntervalSize", null /*valueLocalizationKey*/));
            return result;
        };
        DiskIOEvent.prototype.getDetailsHintData = function () {
            return this._hintData;
        };
        DiskIOEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        DiskIOEvent.prototype.getDiskIOTypeString = function (operation) {
            try {
                return Microsoft.Plugin.Resources.getString("DiskIOType" + operation);
            }
            catch (e) {
                // Mode string not found. Default to unknown mode.
                return Microsoft.Plugin.Resources.getString("DiskIOTypeUnknown");
            }
        };
        DiskIOEvent.prototype.getPreviewImagePath = function () {
            var diskIoInterval = this.interval;
            return diskIoInterval.path;
        };
        return DiskIOEvent;
    }(ProfilerEvent));
    VisualProfiler.DiskIOEvent = DiskIOEvent;
    var UIElementCostEvent = (function (_super) {
        __extends(UIElementCostEvent, _super);
        function UIElementCostEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var elementInterval = this.interval;
            this._tooltipText = Microsoft.Plugin.Resources.getString("UIElementCostEventTooltip", elementInterval.fullName, elementInterval.elementsInclusive);
        }
        UIElementCostEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("UIElementCostEventDescription");
        };
        UIElementCostEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var elementInterval = this.interval;
            result.push(this.createDetailInfo("Class", elementInterval.className, "UIElementCostClass", null /*valueLocalizationKey*/));
            if (elementInterval.elementName) {
                result.push(this.createDetailInfo("Name", elementInterval.elementName, "UIElementCostName", null /*valueLocalizationKey*/));
            }
            if (elementInterval.templateName || elementInterval.templateType) {
                result.push(this.createDetailInfo("TemplateName", this.getTemplateName(elementInterval), "UIElementCostTemplateName", null /*valueLocalizationKey*/));
            }
            result.push(this.createDetailInfo("Count", elementInterval.childrenCount, "UIElementCostCount", null /*valueLocalizationKey*/));
            return result;
        };
        UIElementCostEvent.prototype.getTemplateName = function (elementCostEvent) {
            if (elementCostEvent.templateType === "Key" && elementCostEvent.templateName) {
                return elementCostEvent.templateName;
            }
            else if (elementCostEvent.templateType === "Style" && elementCostEvent.templateName) {
                return elementCostEvent.templateName;
            }
            else if (elementCostEvent.templateType === "Inline") {
                return Microsoft.Plugin.Resources.getString("UIElementCostTemplateName_Inline");
            }
            else if (elementCostEvent.templateType === "Implicit") {
                return Microsoft.Plugin.Resources.getString("UIElementCostTemplateName_Implicit");
            }
            else if (!elementCostEvent.templateType || elementCostEvent.templateType === "Unknown") {
                return Microsoft.Plugin.Resources.getString("UIElementCostTemplateName_Unknown");
            }
            else {
                return Microsoft.Plugin.Resources.getString("UIElementCostTemplateName_Unknown");
            }
        };
        UIElementCostEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        return UIElementCostEvent;
    }(ProfilerEvent));
    VisualProfiler.UIElementCostEvent = UIElementCostEvent;
    var RenderEvent = (function (_super) {
        __extends(RenderEvent, _super);
        function RenderEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var renderInterval = this.interval;
        }
        RenderEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("XamlRenderDescription");
        };
        RenderEvent.prototype.getTitleTooltipText = function () {
            return Microsoft.Plugin.Resources.getString("XamlRenderTooltip");
        };
        return RenderEvent;
    }(ProfilerEvent));
    VisualProfiler.RenderEvent = RenderEvent;
    var WindowResizedEvent = (function (_super) {
        __extends(WindowResizedEvent, _super);
        function WindowResizedEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        WindowResizedEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("WindowResizedDescription");
        };
        WindowResizedEvent.prototype.getTitleTooltipText = function () {
            return Microsoft.Plugin.Resources.getString("WindowResizedTooltip");
            ;
        };
        return WindowResizedEvent;
    }(ProfilerEvent));
    VisualProfiler.WindowResizedEvent = WindowResizedEvent;
    var AppStartupEvent = (function (_super) {
        __extends(AppStartupEvent, _super);
        function AppStartupEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        AppStartupEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("AppStartupDescription");
        };
        AppStartupEvent.prototype.getTitleTooltipText = function () {
            return Microsoft.Plugin.Resources.getString("AppStartupTooltip");
        };
        return AppStartupEvent;
    }(ProfilerEvent));
    VisualProfiler.AppStartupEvent = AppStartupEvent;
    var VisualStateChangedEvent = (function (_super) {
        __extends(VisualStateChangedEvent, _super);
        function VisualStateChangedEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var visualStateChangedInterval = this.interval;
            this._tooltipText = Microsoft.Plugin.Resources.getString("VisualStateChangedTooltip", visualStateChangedInterval.state);
        }
        VisualStateChangedEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("VisualStateChangedDescription");
        };
        VisualStateChangedEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var visualStateChangedInterval = this.interval;
            if (visualStateChangedInterval.elementName) {
                result.push(this.createDetailInfo("Element", visualStateChangedInterval.elementName, "VisualStateChangedElementLabel", null /*valueLocalizationKey*/));
            }
            result.push(this.createDetailInfo("Type", visualStateChangedInterval.className, "VisualStateChangedTypeLabel", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("State", visualStateChangedInterval.state, "VisualStateChangedStateLabel", null /*valueLocalizationKey*/));
            return result;
        };
        VisualStateChangedEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        return VisualStateChangedEvent;
    }(ProfilerEvent));
    VisualProfiler.VisualStateChangedEvent = VisualStateChangedEvent;
    var FrameNavigationEvent = (function (_super) {
        __extends(FrameNavigationEvent, _super);
        function FrameNavigationEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var frameNavigationInterval = this.interval;
            this._tooltipText = Microsoft.Plugin.Resources.getString("FrameNavigationEventTooltip", frameNavigationInterval.className);
        }
        FrameNavigationEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("FrameNavigationEventDescription");
        };
        FrameNavigationEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var frameNavigationInterval = this.interval;
            result.push(this.createDetailInfo("Class", frameNavigationInterval.className, "FrameNavigationEventClass", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("NavigationMode", this.getNavigationModeString(frameNavigationInterval.navigationMode), "FrameNavigationEventNavigationModeLabel", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("FromCache", frameNavigationInterval.fromCache, "FrameNavigationEventFromCache", frameNavigationInterval.fromCache ? "YesLabel" : "NoLabel"));
            return result;
        };
        FrameNavigationEvent.prototype.getNavigationModeString = function (navigationMode) {
            try {
                return Microsoft.Plugin.Resources.getString("FrameNavigationEventNavigationMode" + navigationMode);
            }
            catch (e) {
                // Mode string not found. Default to unknown mode.
                return Microsoft.Plugin.Resources.getString("FrameNavigationEventNavigationModeUnknown");
            }
        };
        FrameNavigationEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        return FrameNavigationEvent;
    }(ProfilerEvent));
    VisualProfiler.FrameNavigationEvent = FrameNavigationEvent;
    var AppCodeEvent = (function (_super) {
        __extends(AppCodeEvent, _super);
        function AppCodeEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        AppCodeEvent.prototype.getDescription = function () {
            return "TODO: AppCode desc string";
        };
        return AppCodeEvent;
    }(ProfilerEvent));
    VisualProfiler.AppCodeEvent = AppCodeEvent;
    var XamlOtherEvent = (function (_super) {
        __extends(XamlOtherEvent, _super);
        function XamlOtherEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        XamlOtherEvent.prototype.getDescription = function () {
            return "TODO: XamlOther desc string";
        };
        return XamlOtherEvent;
    }(ProfilerEvent));
    VisualProfiler.XamlOtherEvent = XamlOtherEvent;
    var ParsingEvent = (function (_super) {
        __extends(ParsingEvent, _super);
        function ParsingEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
            var parsingInterval = this.interval;
            if (parsingInterval.inclusiveElements > 0) {
                var formattedElementCount = Common.FormattingHelpers.getDecimalLocaleString(parsingInterval.inclusiveElements, true);
                this._hintData = {
                    text: Microsoft.Plugin.Resources.getString("IntervalDetailsHintText", formattedElementCount),
                    tooltip: Microsoft.Plugin.Resources.getString("ParsingIntervalDetailsHintTooltip", formattedElementCount)
                };
            }
            if (parsingInterval.parsingFromString) {
                this._tooltipText = Microsoft.Plugin.Resources.getString("ParsingFromStringEventTooltip");
            }
            else {
                this._tooltipText = Microsoft.Plugin.Resources.getString("ParsingEventTooltip", parsingInterval.path);
            }
        }
        ParsingEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("ParsingEventDescription");
        };
        ParsingEvent.prototype.getDetails = function () {
            var result = _super.prototype.getDetails.call(this);
            var parsingInterval = this.interval;
            if (parsingInterval.parsingFromString) {
                result.push(this.createDetailInfo("FileName", "FromString", "ParsingIntervalFileName", "ParsingFromStringValue"));
            }
            else {
                result.push(this.createDetailInfo("FileName", parsingInterval.fileName, "ParsingIntervalFileName", null /*valueLocalizationKey*/));
                result.push(this.createDetailInfo("Path", parsingInterval.path, "ParsingIntervalPath", null /*valueLocalizationKey*/));
            }
            result.push(this.createDetailInfo("InclusiveCount", parsingInterval.inclusiveElements, "ParsingIntervalInclusiveCount", null /*valueLocalizationKey*/));
            result.push(this.createDetailInfo("ExclusiveCount", parsingInterval.exclusiveElements, "ParsingIntervalExclusiveCount", null /*valueLocalizationKey*/));
            return result;
        };
        ParsingEvent.prototype.getDetailsHintData = function () {
            return this._hintData;
        };
        ParsingEvent.prototype.getTitleTooltipText = function () {
            return this._tooltipText;
        };
        return ParsingEvent;
    }(ProfilerEvent));
    VisualProfiler.ParsingEvent = ParsingEvent;
    var UIThreadFrameEvent = (function (_super) {
        __extends(UIThreadFrameEvent, _super);
        function UIThreadFrameEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        UIThreadFrameEvent.prototype.getDescription = function () {
            return Microsoft.Plugin.Resources.getString("UIThreadFrameDescription");
        };
        UIThreadFrameEvent.prototype.getTitleTooltipText = function () {
            return Microsoft.Plugin.Resources.getString("UIThreadFrameTooltip");
        };
        return UIThreadFrameEvent;
    }(ProfilerEvent));
    VisualProfiler.UIThreadFrameEvent = UIThreadFrameEvent;
    var PlaceholderEvent = (function (_super) {
        __extends(PlaceholderEvent, _super);
        function PlaceholderEvent(interval, category, uiThreadId) {
            _super.call(this, interval, category, uiThreadId);
        }
        PlaceholderEvent.prototype.getDescription = function () {
            return "Placeholder event description";
        };
        PlaceholderEvent.prototype.createName = function () {
            return this.interval.name;
        };
        return PlaceholderEvent;
    }(ProfilerEvent));
    VisualProfiler.PlaceholderEvent = PlaceholderEvent;
    var EventFactory = (function () {
        function EventFactory() {
            this._nameToEventMap = {};
            this._nameToEventMap["GC"] = GarbageCollectionEvent;
            this._nameToEventMap["Idle"] = IdleEvent;
            this._nameToEventMap["Network"] = NetworkEvent;
            this._nameToEventMap["DiskIo"] = DiskIOEvent;
            this._nameToEventMap["XamlParsing"] = ParsingEvent;
            this._nameToEventMap["XamlLayout"] = LayoutEvent;
            this._nameToEventMap["XamlUIElementCost"] = UIElementCostEvent;
            this._nameToEventMap["XamlUIThreadFrame"] = UIThreadFrameEvent;
            this._nameToEventMap["XamlRender"] = RenderEvent;
            this._nameToEventMap["XamlFrameNavigation"] = FrameNavigationEvent;
            this._nameToEventMap["XamlOther"] = XamlOtherEvent;
            this._nameToEventMap["AppCode"] = AppCodeEvent;
            this._nameToEventMap["WindowResized"] = WindowResizedEvent;
            this._nameToEventMap["AppStartup"] = AppStartupEvent;
            this._nameToEventMap["VisualStateChanged"] = VisualStateChangedEvent;
        }
        EventFactory.prototype.createEvent = function (interval, uiThreadId) {
            var category = (VisualProfiler.EventCategory[interval.category]);
            if (category === undefined) {
                return new PlaceholderEvent(interval, category, uiThreadId);
            }
            var eventType = this._nameToEventMap[interval.name];
            if (eventType) {
                return new eventType(interval, category, uiThreadId);
            }
            else {
                return new PlaceholderEvent(interval, category, uiThreadId);
            }
        };
        return EventFactory;
    }());
    VisualProfiler.EventFactory = EventFactory;
    var EventsTimelineDataSource = (function () {
        function EventsTimelineDataSource(uiThreadId, timeSpan, eventsFactory) {
            this._uiThreadId = uiThreadId;
            this._data = [];
            this._dataPrevious = [];
            this._eventsFactory = eventsFactory;
            this._currentIndex = null;
            this._timeSpan = timeSpan;
        }
        EventsTimelineDataSource.prototype.initialize = function (queryResult) {
            var _this = this;
            if (this._initializePromise) {
                this._initializePromise.cancel();
            }
            if (this._queryResult) {
                this._queryResult.dispose();
            }
            this._queryResult = queryResult;
            this._initializePromise = this._queryResult.getIntervalsCount()
                .then(function (eventsCount) {
                _this._count = eventsCount;
                _this._initializePromise = null;
            });
            return this._initializePromise;
        };
        Object.defineProperty(EventsTimelineDataSource.prototype, "count", {
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineDataSource.prototype, "timeSpan", {
            get: function () {
                return this._timeSpan;
            },
            enumerable: true,
            configurable: true
        });
        EventsTimelineDataSource.prototype.collapseBranch = function (index) {
            var _this = this;
            return this._queryResult.collapseIntervalBranch(index)
                .then(function () {
                return _this.resetData();
            });
        };
        EventsTimelineDataSource.prototype.expandBranch = function (index) {
            var _this = this;
            return this._queryResult.expandIntervalBranch(index)
                .then(function () {
                return _this.resetData();
            });
        };
        EventsTimelineDataSource.prototype.ensureDataAvailable = function (startIndex, endIndex) {
            if (!(this._data[startIndex] && this._data[endIndex])) {
                this.fetchFromPrevious(startIndex, (endIndex - startIndex) + 1);
                if (!(this._data[startIndex] && this._data[endIndex])) {
                    //Data is to be fetched from native
                    return this.fetchData(startIndex, Math.max((endIndex - startIndex) + 1, EventsTimelineDataSource.PrefetchSize));
                }
            }
            //If reached here, then data is availabble. We dont have to fetch from native.
            return Common.PromiseHelper.getPromiseSuccess();
        };
        EventsTimelineDataSource.prototype.expandFrameForEvent = function (eventId) {
            var _this = this;
            return this._queryResult.expandFrameForEvent(eventId)
                .then(function () {
                return _this.resetData();
            });
        };
        EventsTimelineDataSource.prototype.getNext = function (skip) {
            if (this._currentIndex === null) {
                return null;
            }
            if (this._currentIndex >= this.count) {
                return null;
            }
            var event = this._data[this._currentIndex];
            this._currentIndex++;
            if (!isNaN(skip)) {
                this._currentIndex += skip;
            }
            return event;
        };
        EventsTimelineDataSource.prototype.indexOfItem = function (eventId) {
            return this._queryResult.indexOfInterval(eventId);
        };
        EventsTimelineDataSource.prototype.indexOfParent = function (id) {
            return this._queryResult.indexOfParentInterval(id);
        };
        EventsTimelineDataSource.prototype.getAggregatedDescendantsForEvent = function (eventId) {
            return this._queryResult.getAggregatedDescendantsForEvent(eventId);
        };
        EventsTimelineDataSource.prototype.getSelectionSummary = function () {
            return this._queryResult.getSelectionSummary();
        };
        EventsTimelineDataSource.prototype.startAt = function (index) {
            if (this._currentIndex !== null) {
            }
            if (isNaN(index) || index < 0 || index >= this.count) {
                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1036"));
            }
            this._currentIndex = index;
            this._data = [];
        };
        EventsTimelineDataSource.prototype.stop = function () {
            this._currentIndex = null;
            this._dataPrevious = this._data;
            this._data = [];
        };
        EventsTimelineDataSource.prototype.fetchData = function (index, max) {
            var _this = this;
            var fromIndex = Math.max(0, index - max);
            var toIndex = Math.min(this._count, index + max) - 1;
            return this._queryResult.getIntervals(fromIndex, toIndex)
                .then(function (intervals) {
                var dataIndex = fromIndex;
                for (var i = 0; i < intervals.length; i++, dataIndex++) {
                    if (!_this._data[dataIndex]) {
                        var interval = intervals[i];
                        _this._data[dataIndex] = _this._eventsFactory.createEvent(interval, _this._uiThreadId);
                    }
                }
            });
        };
        EventsTimelineDataSource.prototype.fetchFromPrevious = function (index, max) {
            if (this._dataPrevious[index]) {
                var fromIndex = Math.max(0, index - max);
                var toIndex = Math.min(this._dataPrevious.length, index + max) - 1;
                for (var i = fromIndex; i <= toIndex; i++) {
                    var item = this._dataPrevious[i];
                    if (item) {
                        this._data[i] = item;
                    }
                }
                return true;
            }
            return false;
        };
        EventsTimelineDataSource.prototype.resetData = function () {
            var _this = this;
            this._dataPrevious = [];
            this._data = [];
            return this._queryResult.getIntervalsCount()
                .then(function (count) {
                _this._count = count;
            });
        };
        EventsTimelineDataSource.PrefetchSize = 30;
        return EventsTimelineDataSource;
    }());
    VisualProfiler.EventsTimelineDataSource = EventsTimelineDataSource;
    var EventsTimelineModel = (function () {
        function EventsTimelineModel(session) {
            this._eventFactory = new EventFactory();
            this._session = session;
        }
        EventsTimelineModel.prototype.getEvents = function (timeSpan, filter) {
            var _this = this;
            return this._session.queryAppIntervals(timeSpan, filter)
                .then(function (intervalsQuery) {
                var uiThreadId = _this._session.getUIThreadId();
                if (_this._currentQueryResult) {
                    _this._currentQueryResult.dispose();
                }
                _this._currentQueryResult = intervalsQuery;
                var dataSource = new EventsTimelineDataSource(uiThreadId, timeSpan, _this._eventFactory);
                return dataSource.initialize(intervalsQuery)
                    .then(function () {
                    return dataSource;
                });
            });
        };
        EventsTimelineModel.prototype.getTelemetryStatsAndFormatForReporting = function () {
            return this._session.getTelemetryStats()
                .then(function (telemetryStats) {
                var durations = {};
                for (var i = 0; i < telemetryStats.scenarios.length; i++) {
                    var scenario = telemetryStats.scenarios[i];
                    if (scenario.type === "AppStartup") {
                        durations[EventsTimelineModel.TelemetryApplicationStartUp] = scenario.duration;
                    }
                    else if (scenario.type === "XamlFrameNavigation") {
                        durations[EventsTimelineModel.TelemetryPageLoadDuration + EventsTimelineModel.TelemetryHashedPageName + i] = scenario.name;
                        durations[EventsTimelineModel.TelemetryPageLoadDuration + ".LoadTime." + i] = scenario.duration;
                    }
                }
                return durations;
            });
        };
        EventsTimelineModel.prototype.getUIThreadSummary = function (timeRange) {
            return this._session.getUIThreadSummary(timeRange);
        };
        // Should match with AppResponsiveness.Constants.TelemetryHashedPageName in edev\ClientDiagnostics\Source\AppResponsiveness\AppRespTool\Package\Constants.cs
        EventsTimelineModel.TelemetryHashedPageName = ".HashedPageName.";
        EventsTimelineModel.TelemetryApplicationStartUp = "ApplicationStartUpDuration";
        EventsTimelineModel.TelemetryPageLoadDuration = "PageLoadDuration";
        return EventsTimelineModel;
    }());
    VisualProfiler.EventsTimelineModel = EventsTimelineModel;
    var EventsTimelineViewModel = (function (_super) {
        __extends(EventsTimelineViewModel, _super);
        function EventsTimelineViewModel(model, globalRuler, markEventModel) {
            var _this = this;
            _super.call(this);
            this._model = model;
            this._globalRuler = globalRuler;
            this._markEventModel = markEventModel;
            this._globalRuler.addEventListener(VisualProfiler.GlobalRuler.SelectionChangedEventType, function (e) { return _this.onRulerSelectionChanged(e); });
            this.timeSpan = this._globalRuler.totalRange;
            this.sort = VisualProfiler.Data.EventIntervalsSort.ChronographicalSort;
            var msAbbreviation = Microsoft.Plugin.Resources.getString("MillisecondsAbbreviation");
            this.durationFilterOptions = [
                { value: "0", text: Microsoft.Plugin.Resources.getString("DurationFilterAll"), tooltip: Microsoft.Plugin.Resources.getString("DurationFilterTooltip") },
                { value: EventsTimelineViewModel.ONE_MS_IN_NS.toString(), text: Microsoft.Plugin.Resources.getString("DurationFilterTimed", EventsTimelineViewModel.ONE_MS_IN_NS / 1000 / 1000 + msAbbreviation), tooltip: Microsoft.Plugin.Resources.getString("DurationFilterTooltip") }
            ];
            this.sortOptions = [
                { value: "0", text: Microsoft.Plugin.Resources.getString("TimelineSortStartTime"), tooltip: Microsoft.Plugin.Resources.getString("TimelineSortTooltip") },
                { value: "1", text: Microsoft.Plugin.Resources.getString("TimelineSortDuration"), tooltip: Microsoft.Plugin.Resources.getString("TimelineSortTooltip") }
            ];
        }
        Object.defineProperty(EventsTimelineViewModel.prototype, "globalRuler", {
            get: function () {
                return this._globalRuler;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineViewModel.prototype, "selectedEvent", {
            get: function () {
                return this._selectedEvent;
            },
            enumerable: true,
            configurable: true
        });
        EventsTimelineViewModel.prototype.setSelectedEvent = function (event) {
            var _this = this;
            //Ignoring future requests if still processing
            if (this._setSelectionEventProcessing) {
                return Common.PromiseHelper.getPromiseSuccess();
            }
            if (this._selectedEvent !== event) {
                this._selectedEvent = event;
                if (this.selectedEventChanged) {
                    this._setSelectionEventProcessing = true;
                    return this.selectedEventChanged(this._selectedEvent)
                        .then(function () {
                        _this._setSelectionEventProcessing = false;
                    }, function () {
                        _this._setSelectionEventProcessing = false;
                    });
                }
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.GridRowSelected);
            }
            return Common.PromiseHelper.getPromiseSuccess();
        };
        Object.defineProperty(EventsTimelineViewModel.prototype, "viewSettings", {
            get: function () {
                var viewSettings = {
                    showDurationSelfInTimeline: this.showDurationSelfInTimeline,
                    showHintTextInTimeline: this.showHintTextInTimeline,
                    showQualifiersInEventNames: this.showQualifiersInEventNames,
                    showThreadIndicator: this.showThreadIndicator
                };
                return viewSettings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineViewModel.prototype, "timeSpan", {
            get: function () {
                return this._timeSpan;
            },
            set: function (value) {
                if ((value === undefined && this._timeSpan !== undefined) ||
                    (value !== undefined && this._timeSpan === undefined) ||
                    (value !== undefined && this._timeSpan !== undefined && !value.equals(this._timeSpan))) {
                    this._timeSpan = value;
                    this._isDataSourceInvalid = true;
                    if (this.timeSpanChanged) {
                        this.timeSpanChanged();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        EventsTimelineViewModel.initialize = function () {
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.DisplayBackgroundActivitiesPropertyName, /*defaultValue=*/ false, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.DisplayFramesPropertyName, /*defaultValue=*/ false, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.DisplayScenariosPropertyName, /*defaultValue=*/ true, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.DisplayIOActivitiesPropertyName, /*defaultValue=*/ true, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.DisplayUIActivitiesPropertyName, /*defaultValue=*/ true, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.DurationFilterPropertyName, /*defaultValue=*/ 0, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.EventNameFilterPropertyName, /*defaultValue=*/ "", function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.EventTypeFilterPropertyName, /*defaultValue=*/ "", function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.HasFilterSettingsChangedPropertyName, /*defaultValue=*/ true, /*onChanged=*/ null, /*onChanging=*/ null);
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.HasViewSettingsChangedPropertyName, /*defaultValue=*/ true, /*onChanged=*/ null, /*onChanging=*/ null);
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.ShowDurationSelfInTimelinePropertyName, /*defaultValue=*/ true, function (obj) { return obj.onViewSettingsChange(); }, /*onChanging=*/ null);
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.ShowHintTextInTimelinePropertyName, /*defaultValue=*/ true, function (obj) { return obj.onViewSettingsChange(); }, /*onChanging=*/ null);
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.ShowQualifiersInEventNamesPropertyName, /*defaultValue=*/ true, function (obj) { return obj.onViewSettingsChange(); }, /*onChanging=*/ null);
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.ShowThreadIndicatorPropertyName, /*defaultValue=*/ true, function (obj) { return obj.onViewSettingsChange(); }, /*onChanging=*/ null);
            Common.ObservableHelpers.defineProperty(EventsTimelineViewModel, EventsTimelineViewModel.SortPropertyName, /*defaultValue=*/ 0, function (obj) { return obj.onFilterChange(); }, function (obj) { return obj.onFilterChanging(); });
        };
        EventsTimelineViewModel.prototype.getEventDetails = function (event) {
            var detailsRequests = event.getEventDetailsRequestInformation();
            if (!detailsRequests || detailsRequests.length === 0) {
                return event.getDetails();
            }
            var result = [];
            for (var i = 0; i < detailsRequests.length; i++) {
                var detailRequest = detailsRequests[i];
                if (detailRequest.isSourceRequest) {
                    var sourceRequest = detailRequest;
                    try {
                        var sourceDetails = sourceRequest.sourceInfo;
                        result = result.concat(event.getDetails(sourceDetails));
                    }
                    catch (e) {
                    }
                }
                else {
                    result = result.concat(event.getDetails());
                }
            }
            return result;
        };
        EventsTimelineViewModel.prototype.getEvents = function () {
            var _this = this;
            if (this._gettingEventsPromise) {
                this._gettingEventsPromise.cancel();
                this._gettingEventsPromise = null;
            }
            if (this._isDataSourceInvalid) {
                var filter = {
                    eventNameFilter: this.eventNameFilter,
                    eventTypeFilter: this.eventTypeFilter,
                    filterKeepBackgroundActivities: this.displayBackgroundActivities,
                    filterKeepFrames: this.displayFrames,
                    filterKeepScenarios: this.displayScenarios,
                    filterDurationThreshold: this.durationFilter,
                    filterKeepIOActivities: this.displayIOActivities,
                    filterKeepUIActivities: this.displayUIActivities,
                    sortByTime: this.sort === VisualProfiler.Data.EventIntervalsSort.ChronographicalSort,
                };
                this._gettingEventsPromise = this._model.getEvents(this._timeSpan, filter).
                    then(function (dataSource) {
                    _this._dataSource = dataSource;
                    _this._isDataSourceInvalid = false;
                    _this._gettingEventsPromise = null;
                    if (_this.displayFrames && _this._selectedEvent) {
                        _this._dataSource.expandFrameForEvent(_this._selectedEvent.id)
                            .done(function () {
                            return _this._dataSource;
                        });
                    }
                    return _this._dataSource;
                });
                return this._gettingEventsPromise;
            }
            return Microsoft.Plugin.Promise.as(this._dataSource);
        };
        EventsTimelineViewModel.prototype.getUIThreadSummary = function (timeRange) {
            return this._model.getUIThreadSummary(timeRange);
        };
        EventsTimelineViewModel.prototype.getMarks = function (category) {
            return this._markEventModel.getMarkEvents(this._globalRuler.totalRange, category);
        };
        EventsTimelineViewModel.prototype.getTelemetryStatsAndFormatForReporting = function () {
            return this._model.getTelemetryStatsAndFormatForReporting();
        };
        EventsTimelineViewModel.prototype.getMarkTooltip = function (mark) {
            return this._markEventModel.getMarkTooltip(mark);
        };
        EventsTimelineViewModel.prototype.getVerticalRulerLinePositions = function (timeSpan, viewWidth) {
            return DiagnosticsHub.RulerUtilities.getVerticalLinePositions(timeSpan.toJsonTimespan(), viewWidth);
        };
        // Resets filter/display settings to defaults ('unfiltered')
        EventsTimelineViewModel.prototype.resetFilter = function () {
            this.displayBackgroundActivities = true;
            this.displayScenarios = true;
            this.displayIOActivities = true;
            this.displayUIActivities = true;
            this.durationFilter = undefined;
            this.eventNameFilter = undefined;
            this.eventTypeFilter = undefined;
            this.hasFilterSettingsChanged = false;
            this.hasDefaultFilter = true;
        };
        EventsTimelineViewModel.prototype.resetViewSettings = function () {
            this.hasViewSettingsChanged = false;
            this.showDurationSelfInTimeline = undefined;
            this.showHintTextInTimeline = undefined;
            this.showQualifiersInEventNames = undefined;
            this.showThreadIndicator = undefined;
        };
        EventsTimelineViewModel.prototype.onFilterChange = function () {
            this.hasDefaultFilter = this.displayBackgroundActivities === true &&
                this.displayScenarios === true &&
                this.displayIOActivities === true &&
                this.displayUIActivities === true &&
                (!this.durationFilter || this.durationFilter === 0) &&
                (!this.eventNameFilter || this.eventNameFilter.length === 0) &&
                (!this.eventTypeFilter || this.eventTypeFilter.length === 0);
            this.hasFilterSettingsChanged = !this.hasDefaultFilter;
        };
        EventsTimelineViewModel.prototype.onFilterChanging = function () {
            this._isDataSourceInvalid = true;
        };
        EventsTimelineViewModel.prototype.onViewSettingsChange = function () {
            this.hasViewSettingsChanged = !this.showDurationSelfInTimeline ||
                !this.showHintTextInTimeline ||
                !this.showQualifiersInEventNames ||
                !this.showThreadIndicator;
        };
        EventsTimelineViewModel.prototype.onRulerSelectionChanged = function (args) {
            if (!args.data.isIntermittent) {
                /*update only on selection complete*/
                this.timeSpan = new VisualProfiler.TimeSpan(this._globalRuler.selection.begin, this._globalRuler.selection.end);
            }
        };
        EventsTimelineViewModel.ONE_MS_IN_NS = 1 * 1000 * 1000; /* 1ms */
        EventsTimelineViewModel.DisplayBackgroundActivitiesPropertyName = "displayBackgroundActivities";
        EventsTimelineViewModel.DisplayFramesPropertyName = "displayFrames";
        EventsTimelineViewModel.DisplayScenariosPropertyName = "displayScenarios";
        EventsTimelineViewModel.DisplayIOActivitiesPropertyName = "displayIOActivities";
        EventsTimelineViewModel.DisplayUIActivitiesPropertyName = "displayUIActivities";
        EventsTimelineViewModel.DurationFilterPropertyName = "durationFilter";
        EventsTimelineViewModel.EventNameFilterPropertyName = "eventNameFilter";
        EventsTimelineViewModel.EventTypeFilterPropertyName = "eventTypeFilter";
        EventsTimelineViewModel.HasFilterSettingsChangedPropertyName = "hasFilterSettingsChanged";
        EventsTimelineViewModel.SortPropertyName = "sort";
        EventsTimelineViewModel.HasViewSettingsChangedPropertyName = "hasViewSettingsChanged";
        EventsTimelineViewModel.ShowDurationSelfInTimelinePropertyName = "showDurationSelfInTimeline";
        EventsTimelineViewModel.ShowQualifiersInEventNamesPropertyName = "showQualifiersInEventNames";
        EventsTimelineViewModel.ShowHintTextInTimelinePropertyName = "showHintTextInTimeline";
        EventsTimelineViewModel.ShowThreadIndicatorPropertyName = "showThreadIndicator";
        return EventsTimelineViewModel;
    }(Common.Observable));
    VisualProfiler.EventsTimelineViewModel = EventsTimelineViewModel;
    EventsTimelineViewModel.initialize();
    var EventDetailsView = (function (_super) {
        __extends(EventDetailsView, _super);
        function EventDetailsView(event, details, descendants, timeSpan) {
            var _this = this;
            _super.call(this, "eventDetailsTemplate");
            this.initializeEventGroup();
            this._imagePreviewSeparator = this.findElement("imagePreviewSeparator");
            this._imagePreviewContainer = this.findElement("imagePreviewContainer");
            if (event === null) {
                this._aggregatedDescendants = descendants;
                if (this._aggregatedDescendants) {
                    this.displaySelectionSummaryFields(timeSpan.elapsed, timeSpan.begin);
                    this.displayInclusiveTimeSummary(/*isEventSelected=*/ false);
                }
            }
            else {
                this._details = details;
                this._event = event;
                this._aggregatedDescendants = descendants;
                this.displayCommonFields();
                this.displayEventSpecificFields();
                this.displayInclusiveTimeSummary(/*isEventSelected=*/ true);
                this.displayImagePreview();
                var cells = this.findElementsByClassName("eventCell");
                for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                    var cell = cells[cellIndex];
                    (function (value) {
                        if (cell.classList.contains("BPT-FileLink")) {
                            cell.addEventListener("mouseover", function (e) { return VisualProfiler.EventDataTemplate.showSourceInfoTooltip(e, _this._event.context.sourceInfo); });
                        }
                        else {
                            cell.addEventListener("mouseover", function (e) { return EventDetailsView.showCellTooltip(e, value); });
                        }
                        cell.addEventListener("mouseout", function (e) { return Microsoft.Plugin.Tooltip.dismiss(); });
                    })(cell.textContent);
                }
            }
        }
        EventDetailsView.getCssClass = function (category) {
            switch (category) {
                case "Idle":
                    return "dataIdle";
                case "XamlParsing":
                    return "dataParsing";
                case "XamlLayout":
                    return "dataLayout";
                case "XamlOther":
                    return "dataXamlOther";
                case "AppCode":
                    return "dataAppCode";
                case "XamlRender":
                    return "dataRendering";
                case "IO":
                    return "dataIO";
                default:
                    //throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1033"));
                    return "dataPlaceholder";
            }
        };
        EventDetailsView.showCellTooltip = function (mouseEvent, text) {
            var div = mouseEvent.currentTarget;
            // Only show the tooltip if the text exceeds the width of the container (and therefore contains an ellipsis)
            if (div.offsetWidth < div.scrollWidth) {
                var config = {
                    content: text
                };
                Microsoft.Plugin.Tooltip.show(config);
            }
        };
        EventDetailsView.prototype.createDiv = function (value) {
            var classNames = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                classNames[_i - 1] = arguments[_i];
            }
            var div = document.createElement("div");
            if (Common.TokenExtractor.isHtmlExpression(value)) {
                VisualProfiler.EventDataTemplate.addTokens(value, div, VisualProfiler.TextFormat.Html);
            }
            else if (Common.TokenExtractor.isStringExpression(value)) {
                VisualProfiler.EventDataTemplate.addTokens(value, div, VisualProfiler.TextFormat.String);
            }
            else {
                div.textContent = value;
            }
            if (classNames) {
                for (var index = 0; index < classNames.length; index++) {
                    div.classList.add(classNames[index]);
                }
            }
            return div;
        };
        EventDetailsView.prototype.displayCommonFields = function () {
            var durationLabelExc = this.findElement("durationLabelExc");
            var durationValueExc = this.findElement("durationValueExc");
            var durationIncRow = this.findElement("durationIncRow");
            var durationLabelInc = this.findElement("durationLabelInc");
            var durationValueInc = this.findElement("durationValueInc");
            var startTimeLabel = this.findElement("startTimeLabel");
            var startTimeValue = this.findElement("startTimeValue");
            var threadContextRow = this.findElement("threadContextRow");
            var threadContextLabel = this.findElement("threadContextLabel");
            var threadContextValue = this.findElement("threadContextValue");
            var description = this.findElement("eventDetailsDescription");
            durationIncRow.classList.remove("BPT-hidden");
            durationLabelExc.textContent = Microsoft.Plugin.Resources.getString("DurationLabelExclusive", "");
            durationValueExc.textContent = VisualProfiler.FormattingHelpers.getPrettyPrintTime(this._event.exclusiveDuration);
            durationLabelInc.textContent = Microsoft.Plugin.Resources.getString("DurationLabelInclusive", "");
            durationValueInc.textContent = VisualProfiler.FormattingHelpers.getPrettyPrintTime(this._event.timeSpan.elapsed);
            startTimeLabel.textContent = Microsoft.Plugin.Resources.getString("StartTimeLabel", "");
            startTimeValue.textContent = VisualProfiler.FormattingHelpers.getPrettyPrintTime(this._event.timeSpan.begin);
            var threadContext = this.getThreadContext();
            if (threadContext !== "0") {
                threadContextRow.classList.remove("BPT-hidden");
                threadContextLabel.textContent = Microsoft.Plugin.Resources.getString("ThreadContextLabel", "");
                threadContextValue.textContent = threadContext;
            }
            description.classList.remove("BPT-hidden");
            description.textContent = this._event.getDescription();
        };
        EventDetailsView.prototype.displayImagePreview = function () {
            var _this = this;
            if (!this._event.supportsImagePreview) {
                return;
            }
            var url = this._event.getPreviewImagePath();
            if (url) {
                var img = this.findElement("imagePreview");
                img.onload = function (e) {
                    if (img.width > 1 && img.height > 1) {
                        var div = _this.findElement("imagePreviewHeader");
                        div.textContent = Microsoft.Plugin.Resources.getString("ImagePreviewHeader", img.width, img.height);
                        _this._imagePreviewSeparator.classList.remove("BPT-hidden");
                        _this._imagePreviewContainer.classList.remove("BPT-hidden");
                    }
                };
                if (VisualProfiler.ImageUrlValidationHelpers.MS_APP_IMG_REGEX.test(url)) {
                    Microsoft.Plugin.Host.getDocumentLocation(url).done(function (imgPath) {
                        img.src = imgPath;
                    });
                }
                else {
                    img.src = url;
                }
            }
        };
        EventDetailsView.prototype.displayInclusiveTimeSummary = function (isEventSelected) {
            var _this = this;
            var donutContainer = this.findElement("inclusiveTimeBreakDownDetails");
            if ((isEventSelected && this._aggregatedDescendants.length <= 1) ||
                (!isEventSelected && this._aggregatedDescendants.length === 0)) {
                return;
            }
            if (typeof this._donutChartViewModel === "undefined") {
                this._donutChartViewModel = new VisualProfiler.DonutChartViewModel(donutContainer);
                this._donutChartViewModel.view.addSectorAriaLabel = function (sector, percent) {
                    var timeStamp = VisualProfiler.FormattingHelpers.getPronounceableTime(new VisualProfiler.TimeStamp(sector.value));
                    return Microsoft.Plugin.Resources.getString("DonutSectorAriaLabel", sector.name, percent, timeStamp);
                };
            }
            if (this._event) {
                this._donutChartViewModel.model.headerText = Microsoft.Plugin.Resources.getString("InclusiveTimeDetailsHeader");
            }
            else {
                this._donutChartViewModel.model.headerText = Microsoft.Plugin.Resources.getString("UIThreadSummaryHeader");
            }
            var sectors = this.createSectors(this._aggregatedDescendants);
            sectors.forEach(function (sector) {
                _this._donutChartViewModel.model.addSector(sector);
            });
            var sectorCount = this._donutChartViewModel.model.sectors.length;
            if ((isEventSelected && sectorCount > 1) || (!isEventSelected && sectorCount > 0)) {
                donutContainer.classList.remove("BPT-hidden");
                // If no event is selected, don't show the separator (there is no event description so the separator above it is already doing the job)
                if (isEventSelected) {
                    var inclusiveSeparator = this.findElement("inclusiveTimeDetailSeparator");
                    inclusiveSeparator.classList.remove("BPT-hidden");
                }
                this._donutChartViewModel.view.render();
            }
        };
        EventDetailsView.prototype.createSectors = function (eventDatas) {
            var eventFactory = new EventFactory();
            var sectors = [];
            for (var i = 0; i < eventDatas.length; i++) {
                var eventData = eventDatas[i];
                var interval = {
                    begin: { h: 0, l: 0 },
                    beginThreadId: 0,
                    category: eventData.category,
                    childrenCount: 0,
                    end: { h: 0, l: 0 },
                    endThreadId: 0,
                    exclusiveDuration: 0,
                    fullName: undefined,
                    id: -1,
                    isExpanded: false,
                    hasChildren: false,
                    level: -1,
                    name: eventData.name
                };
                var event = eventFactory.createEvent(interval, 0);
                sectors.push({ name: event.name, cssClass: EventDetailsView.getCssClass(eventData.category), value: eventData.value });
            }
            return this.groupEventTypes(sectors);
        };
        EventDetailsView.prototype.initializeEventGroup = function () {
            this._eventGroupsMap = {};
        };
        EventDetailsView.prototype.groupEventTypes = function (sectors) {
            var group;
            // groupMap is mapping of the groupEventName to the value i.e. sector information.
            var groupMap = {};
            // Iterate over the sectors and find the group name from the eventGroupsMap
            for (var i = 0; i < sectors.length; i++) {
                var sector = sectors[i];
                var groupEventName = this._eventGroupsMap[sector.name];
                if (typeof groupEventName !== "undefined") {
                    group = groupMap[groupEventName];
                    if (typeof group === "undefined") {
                        // Add the map entry to groupMap if one not already present in the groupMap
                        groupMap[groupEventName] = sector;
                        groupMap[groupEventName].name = groupEventName;
                    }
                    else {
                        if (sector.name === groupEventName) {
                            // If groupMap contains an entry check if the new entry is same as the groupEventName
                            // If yes replace the entry with the new sector and add the value to merge the two sectors
                            groupMap[groupEventName] = sector;
                            sector.value += group.value;
                        }
                        else {
                            // If the new entry is not same as the group event name just add value to merge the two sectors.
                            group.value += sector.value;
                        }
                    }
                }
                else {
                    groupMap[sector.name] = sector;
                }
            }
            // Get the values from the groupMap. These will be the new merged sectors array.
            var groupedSectors = [];
            for (var key in groupMap) {
                groupedSectors.push(groupMap[key]);
            }
            return groupedSectors;
        };
        EventDetailsView.prototype.displayEventSpecificFields = function () {
            if (!this._details) {
                return;
            }
            var additionalDetailsContainer = this.findElement("additionalDetails");
            for (var i = 0; i < this._details.length; i++) {
                var detail = this._details[i];
                // <DOM> is a default source script that the Datawarehouse returns whenever it cannot resolve the document. In this case we don't want to add a source link
                // as it won't navigate anywhere. This string needs to be kept in sync w/ edev\DiagnosticsHub\sources\Core\DiagnosticsHub.DataWarehouse\ActiveScriptSymbols.cpp.
                if (detail.sourceInfo && detail.sourceInfo.source === "<DOM>") {
                    continue;
                }
                var nameDiv = this.createDiv(detail.localizedName + ":", "eventCell", "name");
                var valueDiv = this.createDiv(detail.localizedValue, "eventCell", "value");
                if (detail.sourceInfo) {
                    valueDiv.className += " BPT-FileLink";
                    valueDiv.setAttribute("role", "link");
                    VisualProfiler.EventDataTemplate.setViewSourceHandler(valueDiv, detail.sourceInfo, true /*keyboardNavigable*/);
                }
                var additionalDetailsLabelValuePair = this.createDiv("", "eventRow");
                additionalDetailsLabelValuePair.appendChild(nameDiv);
                additionalDetailsLabelValuePair.appendChild(valueDiv);
                additionalDetailsContainer.appendChild(additionalDetailsLabelValuePair);
            }
        };
        EventDetailsView.prototype.displaySelectionSummaryFields = function (duration, start) {
            var durationLabelExc = this.findElement("durationLabelExc");
            var durationValueExc = this.findElement("durationValueExc");
            var startTimeLabel = this.findElement("startTimeLabel");
            var startTimeValue = this.findElement("startTimeValue");
            durationLabelExc.textContent = Microsoft.Plugin.Resources.getString("SelectionDurationLabel", "");
            durationValueExc.textContent = VisualProfiler.FormattingHelpers.getPrettyPrintTime(duration);
            startTimeLabel.textContent = Microsoft.Plugin.Resources.getString("StartTimeLabel", "");
            startTimeValue.textContent = VisualProfiler.FormattingHelpers.getPrettyPrintTime(start);
        };
        EventDetailsView.prototype.getThreadContext = function () {
            var threadId = this._event.contextThreadId;
            if (threadId !== null) {
                return threadId.toString();
            }
            return Microsoft.Plugin.Resources.getString("UIThreadContext");
        };
        return EventDetailsView;
    }(Common.Controls.Legacy.TemplateControl));
    VisualProfiler.EventDetailsView = EventDetailsView;
    var EventsTimelineView = (function (_super) {
        __extends(EventsTimelineView, _super);
        function EventsTimelineView(parentContainerId) {
            var _this = this;
            _super.call(this, "timelineViewTemplate");
            this._timeSpanPadding = 0.2;
            this._parentContainer = document.getElementById(parentContainerId);
            if (!this._parentContainer) {
                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1034"));
            }
            this._eventDetailsHeaderClass = "emptyHeader";
            this._eventDetailsTitle = this.findElement("eventDetailsTitle");
            this._timelineDetailsHeaderIndicator = this.findElement("eventDetailsIndicator");
            this._timelineDetailsPaneContainer = this.findElement("timelineDetailsPaneContainer");
            this._timelineViewAndDetailsContainer = this.findElement("timelineViewAndDetails");
            this._timelineLabel = this.findElement("timelineLabel");
            this._timelineView = this.findElement("timelineView");
            this._progressDiv = this.findElement("dataProcessingProgressDiv");
            this._timelineLabel.textContent = Microsoft.Plugin.Resources.getString("TimelineLabel");
            var sortFilterSection = this.findElement("sortFilterSection");
            this._filteringBar = new Common.TemplateControl("VisualProfiler.filteringBarTemplate");
            sortFilterSection.appendChild(this._filteringBar.rootElement);
            this._listControl = new VisualProfiler.EventsTimelineListControl(this._timelineView);
            this._listControl.dataColumnWidthChanged = this.onListControlDataColumnWidthChanged.bind(this);
            this._parentContainer.appendChild(this.rootElement);
            this._onResizeHandler = function () {
                _this._columnsCssRule = _this.getColumnsCssRule();
                _this._listControl.invalidateSizeCache();
                _this.updateDetailsDivider();
                _this.render();
            };
            this.registerResizeEvent();
            this._eventHeaderDivider = this.findElement("timelineEventHeaderDivider");
            this._eventHeaderDivider.style.left = this._listControl.eventNameColumnWidth + "px";
            this._eventHeaderLabel = this.findElement("timelineEventHeaderLabel");
            this._eventHeaderLabel.textContent = Microsoft.Plugin.Resources.getString("EventHeaderLabel");
            this._eventHeaderLabel.style.width = this._listControl.eventNameColumnWidth + "px";
            // Add the ruler
            this._rulerContainer = this.findElement("timelineRuler");
            this._columnsCssRule = this.getColumnsCssRule();
            this._eventDetailsDivider = new VisualProfiler.Divider(this._timelineViewAndDetailsContainer, 0);
            this._eventDetailsDivider.onMoved = this.onResizeDetails.bind(this);
            this.createFilteringMenu();
            this.createViewSettingsMenu();
            this.updateTabIndex();
        }
        Object.defineProperty(EventsTimelineView.prototype, "detailsView", {
            get: function () {
                return this._detailsView;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineView.prototype, "listControl", {
            get: function () {
                return this._listControl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventsTimelineView.prototype, "viewModel", {
            get: function () {
                return this._viewModel;
            },
            set: function (value) {
                this.unregisterViewModelEvents();
                this._listControl.setDataSource(null);
                this._viewModel = value;
                this._filteringBar.model = this._viewModel;
                this._filteringMenu.model = this._viewModel;
                this._viewSettingsMenu.model = this._viewModel;
                this.createRuler();
                // Show an empty details pane if there is no selection
                this.updateDetailsPane(/*event=*/ null);
                this.updateDetailsDivider();
                this.registerViewModelEvents();
            },
            enumerable: true,
            configurable: true
        });
        EventsTimelineView.getCssRule = function (styleSheetName, selectorName) {
            var styleSheet = document.styleSheets[styleSheetName];
            if (styleSheet) {
                for (var i = 0; i < styleSheet.rules.length; ++i) {
                    var rule = styleSheet.rules[i];
                    if (rule && rule.selectorText === selectorName) {
                        return rule;
                    }
                }
            }
            return null;
        };
        EventsTimelineView.prototype.render = function () {
            var _this = this;
            //Cancelling past render request
            if (this._renderPromise) {
                this._renderPromise.cancel();
                this._renderPromise = null;
                this.toggleProcessingUI(false);
            }
            if (this._viewModel) {
                this.toggleProcessingUI(true);
                this.unregisterResizeEvent();
                this._renderPromise = this._viewModel.getEvents()
                    .then(function (dataSource) {
                    return _this._listControl.setDataSource(dataSource);
                }, function (err) {
                    _this._renderPromise = null;
                    _this.registerResizeEvent();
                    _this.raiseRenderFinished();
                    _this.toggleProcessingUI(false);
                    throw err;
                })
                    .then(function () {
                    // Extend the timeSpan to act as padding so the text to the right of the event bars are always visible.
                    var timeSpan = new VisualProfiler.TimeSpan(_this._viewModel.timeSpan.begin, new VisualProfiler.TimeStamp(_this._viewModel.timeSpan.end.nsec + _this._viewModel.timeSpan.elapsed.nsec * _this._timeSpanPadding));
                    // Render list control
                    _this._listControl.timeSpan = timeSpan;
                    _this._listControl.viewModel = _this._viewModel;
                    _this._listControl.rulerScale = _this._rulerScale;
                    // Render ruler
                    _this.setRulerRect();
                    _this._rulerScale.onViewportChanged({
                        currentTimespan: timeSpan.toJsonTimespan(),
                        selectionTimespan: null,
                        isIntermittent: false
                    });
                    // This must be called after this.setRulerRect() because the ruler's width is affected by this.listControl.render(...).
                    // Also, the ruler height, which affects vertical ruler line placement, is set by this.setRulerRect().
                    _this._listControl.renderVerticalRulerLines();
                    if (!_this._listControl.selectedItem) {
                        _this.updateDetailsPane(/*event=*/ null);
                    }
                    _this._listControl.selectedItemChanged = _this.onSelectedEventChanged.bind(_this);
                    return _this._listControl.render();
                })
                    .then(function () {
                    _this._renderPromise = null;
                    _this.registerResizeEvent();
                    _this.raiseRenderFinished();
                    _this.toggleProcessingUI(false);
                }, function (err) {
                    _this._renderPromise = null;
                    _this.registerResizeEvent();
                    _this.raiseRenderFinished();
                    _this.toggleProcessingUI(false);
                    throw err;
                });
                return this._renderPromise;
            }
            else {
                return Common.PromiseHelper.getPromiseSuccess();
            }
        };
        EventsTimelineView.prototype.raiseRenderFinished = function () {
            if (this.onRenderFinished) {
                this.onRenderFinished();
            }
        };
        EventsTimelineView.prototype.toggleProcessingUI = function (showProgress) {
            var _this = this;
            clearTimeout(this._progressUIDelayHandler);
            if (showProgress) {
                // Delay the display of the progress UI in case the operation finishes quickly.
                this._progressUIDelayHandler = setTimeout(function () {
                    _this._progressDiv.style.display = "block";
                }, 350);
            }
            else {
                this._progressDiv.style.display = "none";
            }
        };
        EventsTimelineView.showTooltip = function (resourceId) {
            var config = {
                content: Microsoft.Plugin.Resources.getString(resourceId)
            };
            Microsoft.Plugin.Tooltip.show(config);
        };
        EventsTimelineView.prototype.createFilteringMenu = function () {
            var filteringMenuButton = this._filteringBar.getNamedControl("filteringMenuButton");
            filteringMenuButton.rootElement.setAttribute("tabindex", "0");
            this._filteringMenu = new Common.Controls.MenuControl();
            this._filteringMenu.rootElement.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("FilteringMenuButtonTooltipText"));
            this._filteringMenu.menuItemsTemplateId = "VisualProfiler.filteringMenuDropDown";
            this._filteringMenu.targetButtonElement = filteringMenuButton.rootElement;
            this._filteringMenu.dismissOnMenuItemClick = true;
            this._filteringMenu.dismissOnTargetButtonClick = true;
            this.rootElement.appendChild(this._filteringMenu.rootElement);
        };
        EventsTimelineView.prototype.createViewSettingsMenu = function () {
            var viewSettingsMenuButton = this._filteringBar.getNamedControl("viewSettingsMenuButton");
            viewSettingsMenuButton.rootElement.setAttribute("tabindex", "0");
            this._viewSettingsMenu = new Common.Controls.MenuControl();
            this._viewSettingsMenu.rootElement.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("ViewSettingsMenuButtonTooltipText"));
            this._viewSettingsMenu.menuItemsTemplateId = "VisualProfiler.viewSettingsMenuDropDown";
            this._viewSettingsMenu.targetButtonElement = viewSettingsMenuButton.rootElement;
            this._viewSettingsMenu.dismissOnMenuItemClick = true;
            this._viewSettingsMenu.dismissOnTargetButtonClick = true;
            this.rootElement.appendChild(this._viewSettingsMenu.rootElement);
        };
        EventsTimelineView.prototype.updateTabIndex = function () {
            var sortByComboBox = this._filteringBar.getNamedControl("timelineSortSelector");
            sortByComboBox.rootElement.setAttribute("tabindex", "0");
            var frameGroupingButton = this._filteringBar.getNamedControl("frameGroupingButton");
            frameGroupingButton.rootElement.setAttribute("tabindex", "0");
        };
        EventsTimelineView.prototype.createRuler = function () {
            var _this = this;
            if (this._gettingMarksPromise) {
                this._gettingMarksPromise.cancel();
                this._gettingMarksPromise = null;
            }
            var lifecycleData = [];
            var userMarkData = [];
            if (this._rulerScale) {
                this._rulerContainer.removeChild(this._rulerScale.container);
                this._rulerScale.dispose();
            }
            // Setup a ruler without data as a starting point
            this._rulerScale = new DiagnosticsHub.RulerScale(
            /*timeRange*/ this._viewModel.timeSpan.toJsonTimespan());
            var lifecycleMarksPromise = this._viewModel.getMarks(0).then(function (lifecycleMarks) {
                lifecycleData = lifecycleMarks;
            });
            var userMarksPromise = this._viewModel.getMarks(1).then(function (userMarks) {
                userMarkData = userMarks;
            });
            this._gettingMarksPromise = Microsoft.Plugin.Promise.join([lifecycleMarksPromise, userMarksPromise]).then(function () {
                _this._rulerScale.dispose();
                // Extend the timeSpan to act as padding so the text to the right of the event bars are always visible.
                var timeSpan = new VisualProfiler.TimeSpan(_this._viewModel.timeSpan.begin, new VisualProfiler.TimeStamp(_this._viewModel.timeSpan.end.nsec + _this._viewModel.timeSpan.elapsed.nsec * _this._timeSpanPadding));
                _this._rulerScale = new DiagnosticsHub.RulerScale(
                /*timeRange*/ timeSpan.toJsonTimespan(), 
                /*markSeries*/ [
                    { index: 0, id: DiagnosticsHub.MarkType.UserMark, label: Microsoft.Plugin.Resources.getString("RulerUserMarkLabel"), data: userMarkData },
                    { index: 1, id: DiagnosticsHub.MarkType.LifeCycleEvent, label: Microsoft.Plugin.Resources.getString("RulerLifecycleMarkLabel"), data: lifecycleData }
                ], 
                /*imageTokenList*/ ["vs-image-graph-app-event", "vs-image-graph-user-mark"], 
                /*aggregatedMarkImageToken*/ "vs-image-graph-aggregated-event");
                _this._rulerContainer.appendChild(_this._rulerScale.container);
            });
            this._gettingMarksPromise.done(function () {
                _this._gettingMarksPromise = null;
            });
        };
        EventsTimelineView.prototype.getColumnsCssRule = function () {
            return EventsTimelineView.getCssRule("VisualProfiler.css", ".mainView .dataViewContainer .detailedViewsContainer .timelineViewContainer .timelineViewGroup .timelineViewAndDetails");
        };
        EventsTimelineView.prototype.onResizeDetails = function (offsetX) {
            this.updateColumnWidth(offsetX);
            VisualProfiler.Program.triggerResize();
        };
        EventsTimelineView.prototype.onSelectedEventChanged = function (event) {
            return this._viewModel.setSelectedEvent(event);
        };
        EventsTimelineView.prototype.onListControlDataColumnWidthChanged = function () {
            this._eventHeaderDivider.style.left = this._listControl.eventNameColumnWidth + "px";
            this._eventHeaderLabel.style.width = this._listControl.eventNameColumnWidth + "px";
            this.setRulerRect();
        };
        EventsTimelineView.prototype.onSortChanged = function () {
            VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_GridSort_Start);
            this.render().done(function () {
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.SortFinishedOnGrid);
                VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_GridSort_Stop);
            });
        };
        EventsTimelineView.prototype.onTimeSpanChanged = function () {
            this.render().done(function () {
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.GridUpdatedForTimeSelection);
            });
        };
        EventsTimelineView.prototype.onToggleFilter = function (traceEventStart, traceEventStop) {
            if (traceEventStart !== undefined) {
                VisualProfiler.Program.traceWriter.raiseEvent(traceEventStart);
            }
            this.render().done(function () {
                if (traceEventStop !== undefined) {
                    VisualProfiler.Program.traceWriter.raiseEvent(traceEventStop);
                }
            });
        };
        EventsTimelineView.prototype.onEventNameFilterChange = function () {
            var _this = this;
            clearTimeout(this._eventNameFilterResponseTimeoutHandle);
            this._eventNameFilterResponseTimeoutHandle = setTimeout(function () {
                VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_GridUpdatedForFilterName_Start);
                _this.render().done(function () {
                    VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_GridUpdatedForFilterName_Stop);
                });
            }, 200); // 60 WPM @ 5 letters per word
        };
        EventsTimelineView.prototype.onViewSettingsChange = function (traceEventStart, traceEventStop) {
            var _this = this;
            if (traceEventStart !== undefined) {
                VisualProfiler.Program.traceWriter.raiseEvent(traceEventStart);
            }
            this._listControl.keepCurrentScrollPositionWhenDataSourceChanges = true;
            this.render()
                .then(function () {
                _this._listControl.keepCurrentScrollPositionWhenDataSourceChanges = false;
            }, function (err) {
                _this._listControl.keepCurrentScrollPositionWhenDataSourceChanges = false;
                throw err;
            })
                .done(function () {
                if (traceEventStop !== undefined) {
                    VisualProfiler.Program.traceWriter.raiseEvent(traceEventStop);
                }
            });
        };
        EventsTimelineView.prototype.onViewModelPropertyChanged = function (propName) {
            switch (propName) {
                case EventsTimelineViewModel.ShowDurationSelfInTimelinePropertyName:
                    {
                        this.onViewSettingsChange(Common.TraceEvents.Timeline_GridUpdatedForShowDuration_Start, Common.TraceEvents.Timeline_GridUpdatedForShowDuration_Stop);
                        VisualProfiler.Program.reportTelemetry("ViewModelPropertyChange", { "Property.Name": "ShowDurationSelfInTimeline", "Property.Value": this._viewModel.showDurationSelfInTimeline });
                        break;
                    }
                case EventsTimelineViewModel.ShowHintTextInTimelinePropertyName:
                    {
                        this.onViewSettingsChange(Common.TraceEvents.Timeline_GridUpdatedForShowHintText_Start, Common.TraceEvents.Timeline_GridUpdatedForShowHintText_Stop);
                        VisualProfiler.Program.reportTelemetry("ViewModelPropertyChange", { "Property.Name": "ShowHintTextInTimeline", "Property.Value": this._viewModel.showHintTextInTimeline });
                        break;
                    }
                case EventsTimelineViewModel.ShowQualifiersInEventNamesPropertyName:
                    {
                        this.onViewSettingsChange(Common.TraceEvents.Timeline_GridUpdatedForShowQualifiers_Start, Common.TraceEvents.Timeline_GridUpdatedForShowQualifiers_Stop);
                        VisualProfiler.Program.reportTelemetry("ViewModelPropertyChange", { "Property.Name": "ShowQualifiersInEventNames", "Property.Value": this._viewModel.showQualifiersInEventNames });
                        break;
                    }
                case EventsTimelineViewModel.ShowThreadIndicatorPropertyName:
                    {
                        this.onViewSettingsChange(Common.TraceEvents.Timeline_GridUpdatedForShowThreadIndicator_Start, Common.TraceEvents.Timeline_GridUpdatedForShowThreadIndicator_Stop);
                        VisualProfiler.Program.reportTelemetry("ViewModelPropertyChange", { "Property.Name": "ShowThreadIndicator", "Property.Value": this._viewModel.showThreadIndicator });
                        break;
                    }
                case EventsTimelineViewModel.DisplayBackgroundActivitiesPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterBackground_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterBackground_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "DisplayBackgroundActivities", "Filter.Value": this._viewModel.displayBackgroundActivities });
                        break;
                    }
                case EventsTimelineViewModel.DisplayFramesPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterFrames_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterFrames_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "DisplayFrames", "Filter.Value": this._viewModel.displayFrames });
                        break;
                    }
                case EventsTimelineViewModel.DisplayScenariosPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterScenarios_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterScenarios_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "DisplayScenarios", "Filter.Value": this._viewModel.displayScenarios });
                        break;
                    }
                case EventsTimelineViewModel.DisplayIOActivitiesPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterIO_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterIO_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "DisplayIOActivities", "Filter.Value": this._viewModel.displayIOActivities });
                        break;
                    }
                case EventsTimelineViewModel.DisplayUIActivitiesPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterUI_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterUI_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "DisplayUIActivities", "Filter.Value": this._viewModel.displayUIActivities });
                        break;
                    }
                case EventsTimelineViewModel.DurationFilterPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterDuration_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterDuration_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "DurationFilter", "Filter.Value": this._viewModel.durationFilter });
                        break;
                    }
                case EventsTimelineViewModel.EventNameFilterPropertyName:
                    {
                        this.onEventNameFilterChange();
                        var filterUsed = false;
                        if (this._viewModel.eventNameFilter) {
                            filterUsed = true;
                        }
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "EventNameFilter", "Filter.Value": filterUsed });
                        break;
                    }
                case EventsTimelineViewModel.EventTypeFilterPropertyName:
                    {
                        this.onToggleFilter(Common.TraceEvents.Timeline_GridUpdatedForFilterType_Start, Common.TraceEvents.Timeline_GridUpdatedForFilterType_Stop);
                        VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "EventTypeFilter", "Filter.Value": this._viewModel.eventTypeFilter });
                        break;
                    }
                case EventsTimelineViewModel.SortPropertyName:
                    {
                        this.onSortChanged();
                        if (this._viewModel.sort === 0) {
                            VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "Sort", "Filter.Value": "Start time" });
                        }
                        else if (this._viewModel.sort === 1) {
                            VisualProfiler.Program.reportTelemetry("FilterChange", { "Filter.Name": "Sort", "Filter.Value": "Duration (Total)" });
                        }
                        break;
                    }
                default:
                    // Consider adding a telemetry for the current filter
                    break;
            }
        };
        EventsTimelineView.prototype.onViewModelSelectionChanged = function (event) {
            var _this = this;
            if (this._viewModelSelectionChangedPromise) {
                this._viewModelSelectionChangedPromise.cancel();
            }
            this._viewModelSelectionChangedPromise = this._listControl.setSelectedItem(event)
                .then(function () {
                _this.updateDetailsPane(event);
                _this._viewModelSelectionChangedPromise = null;
            });
            return this._viewModelSelectionChangedPromise;
        };
        EventsTimelineView.prototype.registerResizeEvent = function () {
            VisualProfiler.Program.addEventListener(VisualProfiler.ProgramEvents.Resize, this._onResizeHandler);
        };
        EventsTimelineView.prototype.registerViewModelEvents = function () {
            if (this._viewModel) {
                this._viewModelPropertyChangeEvtReg = this._viewModel.propertyChanged.addHandler(this.onViewModelPropertyChanged.bind(this));
                this._viewModel.timeSpanChanged = this.onTimeSpanChanged.bind(this);
                this._viewModel.selectedEventChanged = this.onViewModelSelectionChanged.bind(this);
            }
        };
        EventsTimelineView.prototype.setDetailsDividerBounds = function () {
            var containerWidth = this._timelineViewAndDetailsContainer.offsetWidth;
            this._eventDetailsDivider.minX = containerWidth / 2;
            this._eventDetailsDivider.maxX = containerWidth;
        };
        EventsTimelineView.prototype.setRulerRect = function () {
            var rulerMarginLeft = this._listControl.dataColumnLeft + "px";
            var rulerWidth = this._listControl.dataColumnWidth + "px";
            if (this._rulerContainer.style.marginLeft !== rulerMarginLeft ||
                this._rulerContainer.style.width !== rulerWidth) {
                this._rulerContainer.style.marginLeft = rulerMarginLeft;
                this._rulerContainer.style.width = rulerWidth;
                if (this._rulerScale) {
                    this._rulerScale.resize(null);
                }
            }
        };
        EventsTimelineView.prototype.updateDetailsPane = function (event) {
            var _this = this;
            var currentDataSource = this._listControl.dataSource;
            if (!currentDataSource) {
                return;
            }
            this._timelineDetailsHeaderIndicator.classList.remove(this._eventDetailsHeaderClass);
            var sectorDataPromise;
            var timeSpan;
            var details; // This will be a promise
            if (event === null) {
                if (currentDataSource) {
                    this._eventDetailsTitle.textContent = "";
                    this._eventDetailsHeaderClass = "emptyHeader";
                    sectorDataPromise = this._viewModel.getUIThreadSummary(this._viewModel.timeSpan);
                    details = null;
                    timeSpan = currentDataSource.timeSpan;
                }
            }
            else {
                this._eventDetailsTitle.textContent = event.title;
                this._eventDetailsHeaderClass = event.getCssClass();
                details = this._viewModel.getEventDetails(event);
                sectorDataPromise = currentDataSource.getAggregatedDescendantsForEvent(event.id);
            }
            sectorDataPromise
                .done(function (sectorData) {
                _this._detailsView = new EventDetailsView(event, details, sectorData, timeSpan);
                _this._timelineDetailsHeaderIndicator.classList.add(_this._eventDetailsHeaderClass);
                _this._timelineDetailsPaneContainer.innerHTML = "";
                _this._timelineDetailsPaneContainer.appendChild(_this._detailsView.rootElement);
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.DetailsPaneLoaded);
            });
        };
        EventsTimelineView.prototype.updateColumnWidth = function (offsetX) {
            if (offsetX === null || typeof offsetX === "undefined") {
                offsetX = this._eventDetailsDivider.offsetX;
            }
            var columns = this._columnsCssRule.style.msGridColumns.split(" ");
            columns[2] = (this._timelineViewAndDetailsContainer.clientWidth - offsetX) + "px";
            this._columnsCssRule.style.msGridColumns = columns.join(" ");
        };
        EventsTimelineView.prototype.updateDetailsDivider = function () {
            this.setDetailsDividerBounds();
            this._eventDetailsDivider.offsetX = this._timelineView.offsetWidth;
            // The +3 is the width of the divider
            this.updateColumnWidth(this._eventDetailsDivider.offsetX + 3);
        };
        EventsTimelineView.prototype.unregisterResizeEvent = function () {
            VisualProfiler.Program.removeEventListener(VisualProfiler.ProgramEvents.Resize, this._onResizeHandler);
        };
        EventsTimelineView.prototype.unregisterViewModelEvents = function () {
            if (this._viewModel) {
                this._viewModel.timeSpanChanged = null;
                this._viewModel.selectedEventChanged = null;
            }
            if (this._viewModelPropertyChangeEvtReg) {
                this._viewModelPropertyChangeEvtReg.unregister();
            }
        };
        return EventsTimelineView;
    }(Common.Controls.Legacy.TemplateControl));
    VisualProfiler.EventsTimelineView = EventsTimelineView;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    var Graphs;
    (function (Graphs) {
        "use strict";
        /* A helper class to get graph data from the analyzer.
         */
        var DataUtilities = (function () {
            function DataUtilities() {
            }
            DataUtilities.getFilteredResult = function (dataWarehouse, analyzerId, counterId, timespan, customData) {
                var contextData = {
                    timeDomain: timespan,
                    customDomain: {
                        CounterId: counterId
                    }
                };
                if (customData) {
                    for (var key in customData) {
                        if (customData.hasOwnProperty(key)) {
                            contextData.customDomain[key] = customData[key];
                        }
                    }
                }
                return dataWarehouse.getFilteredData(contextData, analyzerId);
            };
            return DataUtilities;
        }());
        Graphs.DataUtilities = DataUtilities;
    })(Graphs = VisualProfiler.Graphs || (VisualProfiler.Graphs = {}));
})(VisualProfiler || (VisualProfiler = {}));
/// <reference path="TimeSpan.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    // Diagnostics Hub supports using BigNumber from now on. We still use our timestamp type for now.
    // Javascript supports 53 bits of precision & not 64 bits.(max value: 9007199254740992) Though we can never cross this duration.
    // ref: http://ecma262-5.com/ELS5_HTML.htm#Section_8.5
    var TimestampConvertor = (function () {
        function TimestampConvertor() {
        }
        TimestampConvertor.jsonToTimeStamp = function (bigNumber) {
            var l = bigNumber.l;
            var h = bigNumber.h;
            if (l < 0) {
                l = l >>> 0;
            }
            if (h < 0) {
                h = h >>> 0;
            }
            var nsec = h * 0x100000000 + l;
            return VisualProfiler.TimeStamp.fromNanoseconds(nsec);
        };
        TimestampConvertor.timestampToJson = function (timeStamp) {
            return DiagnosticsHub.BigNumber.convertFromNumber(timeStamp.nsec);
        };
        return TimestampConvertor;
    }());
    VisualProfiler.TimestampConvertor = TimestampConvertor;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../Bpt.Diagnostics.Common/PromiseHelper.ts" />
//--------
/// <reference path="../../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="../VisualProfilerData.d.ts" />
/// <reference path="../VisualProfilerData.d.ts" />
/// <reference path="hubGraphs/DataTypes.d.ts" />
/// <reference path="hubGraphs/DataUtilities.ts" />
/// <reference path="TimestampConvertor.ts" />
/// <webunit-reference path="$(OutputPath)/Common/DiagnosticsHub.js" />
/// <webunit-reference path="$(OutputPath)/Common/Controls/hubControls.js" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    (function (AppResponsivenessAnalyzerTasks) {
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetUIThreadActivityData"] = 1] = "GetUIThreadActivityData";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetFrameRateData"] = 2] = "GetFrameRateData";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetXAMLParsingDataProvider"] = 3] = "GetXAMLParsingDataProvider";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetHotElementsDataProvider"] = 4] = "GetHotElementsDataProvider";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetSessionDuration"] = 5] = "GetSessionDuration";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetAppIntervals"] = 6] = "GetAppIntervals";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetThreadInfo"] = 7] = "GetThreadInfo";
        AppResponsivenessAnalyzerTasks[AppResponsivenessAnalyzerTasks["GetTelemetryStats"] = 8] = "GetTelemetryStats";
    })(VisualProfiler.AppResponsivenessAnalyzerTasks || (VisualProfiler.AppResponsivenessAnalyzerTasks = {}));
    var AppResponsivenessAnalyzerTasks = VisualProfiler.AppResponsivenessAnalyzerTasks;
    var AnalyzerDataSession = (function () {
        function AnalyzerDataSession(dataWarehouse) {
            this._dataWarehouse = dataWarehouse;
            this._threadId = 0;
        }
        AnalyzerDataSession.prototype.initialize = function () {
            var _this = this;
            return this._dataWarehouse.getContextService().getGlobalContext()
                .then(function (context) {
                // Get the duration
                return context.getTimeDomain();
            }).then(function (timespan) {
                _this._totalDuration = {
                    begin: parseInt(timespan.begin.value),
                    end: parseInt(timespan.end.value)
                };
                // Get the UIThread Id
                return _this.getThreadInfo()
                    .then(function (result) {
                    _this._threadId = result.uiThreadId;
                });
            });
        };
        AnalyzerDataSession.prototype.closeAsync = function () {
            return this._dataWarehouse.close();
        };
        AnalyzerDataSession.prototype.getTotalDuration = function () {
            return this._totalDuration;
        };
        AnalyzerDataSession.prototype.queryAppIntervals = function (timeRange, filter) {
            if (this._dataWarehouse) {
                var jsonTimeRange = new DiagnosticsHub.JsonTimespan(VisualProfiler.TimestampConvertor.timestampToJson(timeRange.begin), VisualProfiler.TimestampConvertor.timestampToJson(timeRange.end));
                var customData = {
                    task: AppResponsivenessAnalyzerTasks.GetAppIntervals.toString(),
                    filters: JSON.stringify(filter)
                };
                var contextData = {
                    customDomain: customData,
                    timeDomain: jsonTimeRange
                };
                return this._dataWarehouse.getFilteredData(contextData, AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID)
                    .then(function (result) {
                    var queryResult = new EventIntevalsQueryResult(result);
                    return queryResult;
                }, function (error) {
                    throw error;
                });
            }
            return Common.PromiseHelper.getPromiseError(null);
        };
        // fromTime: The start time in nano-seconds
        // toTime: The end time in nano-seconds
        // granularity: The duration of each usage item
        // Returns cpu usage data that belong to the range [fromTime, toTime] inclusive.
        AnalyzerDataSession.prototype.queryCPUUsage = function (fromTime, toTime, granularity) {
            //var duration = new DiagnosticsHub.JsonTimespan(
            //    DiagnosticsHub.BigNumber.convertFromNumber(fromTime),
            //    DiagnosticsHub.BigNumber.convertFromNumber(toTime));
            //var customData = <Graphs.ICPUUsageCustomData>{
            //    granularity: granularity.toString()
            //};
            //return Graphs.DataUtilities.getFilteredResult(
            //    this._dataWarehouse,
            //    AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID,
            //    AnalyzerDataSession.CPU_USAGE_COUNTERID,
            //    duration,
            //    customData).then((data: Graphs.IJsonCPUData) => {
            //        var cpuUsage: Data.ICPUUsage[];
            //        if (data && data.p) {
            //            cpuUsage = data.p.map((cpuPoint: Graphs.IJsonCPUPoint) => {
            //                var time = new DiagnosticsHub.BigNumber(cpuPoint.t.h, cpuPoint.t.l);
            //                return <Data.ICPUUsage>{
            //                    category: cpuPoint.c,
            //                    time: parseInt(time.value),
            //                    utilization: cpuPoint.u,
            //                };
            //            });
            //        }
            //        return cpuUsage;
            //    });
            return Microsoft.Plugin.Promise.wrap(null);
        };
        // fromTime: The start time in nano-seconds
        // toTime: The end time in nano-seconds
        // Returns frame rate data that belong to the range [fromTime, toTime] inclusive.
        AnalyzerDataSession.prototype.queryFrameRate = function (fromTime, toTime) {
            var duration = new DiagnosticsHub.JsonTimespan(DiagnosticsHub.BigNumber.convertFromNumber(fromTime), DiagnosticsHub.BigNumber.convertFromNumber(toTime));
            return VisualProfiler.Graphs.DataUtilities.getFilteredResult(this._dataWarehouse, AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID, AnalyzerDataSession.FRAME_RATE_COUNTERID, duration).then(function (data) {
                var frameRate;
                if (data && data.p) {
                    frameRate = data.p.map(function (fpsPoint) {
                        var time = new DiagnosticsHub.BigNumber(fpsPoint.t.h, fpsPoint.t.l);
                        return {
                            fps: fpsPoint.v,
                            time: parseInt(time.value)
                        };
                    });
                }
                return frameRate;
            });
        };
        // fromTime: The start time in nano-seconds
        // toTime: The end time in nano-seconds
        // category: The category of the requested data (0: App life-cycle marks, 1: User marks)
        // Returns the app life-cycle or user provided marks that belong to the range [fromTime, toTime] inclusive.
        AnalyzerDataSession.prototype.queryMarkEvents = function (fromTime, toTime, category) {
            var duration = new DiagnosticsHub.JsonTimespan(DiagnosticsHub.BigNumber.convertFromNumber(fromTime), DiagnosticsHub.BigNumber.convertFromNumber(toTime));
            var counterId;
            if (category === 0) {
                counterId = AnalyzerDataSession.LIFE_CYCLE_MARKS_COUNTERID;
            }
            else {
                counterId = AnalyzerDataSession.USER_MARKS_COUNTERID;
            }
            return VisualProfiler.Graphs.DataUtilities.getFilteredResult(this._dataWarehouse, AnalyzerDataSession.MARKERS_ANALYZER_CLASSID, counterId, duration).then(function (graphResult) {
                var markResult;
                if (graphResult && graphResult.p) {
                    markResult = [];
                    for (var i = 0; i < graphResult.p.length; i++) {
                        var graphPoint = graphResult.p[i];
                        markResult.push({
                            time: new DiagnosticsHub.BigNumber(graphPoint.t.h, graphPoint.t.l),
                            tooltip: graphPoint.tt
                        });
                    }
                }
                return markResult;
            });
        };
        AnalyzerDataSession.prototype.getThreadInfo = function () {
            if (this._dataWarehouse) {
                var customData = {
                    task: AppResponsivenessAnalyzerTasks.GetThreadInfo.toString()
                };
                var contextData = {
                    customDomain: customData
                };
                return this._dataWarehouse.getFilteredData(contextData, AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID)
                    .then(function (threadInfo) {
                    return threadInfo;
                }, function (error) {
                    throw error;
                });
            }
            return Common.PromiseHelper.getPromiseError(null);
        };
        AnalyzerDataSession.prototype.getTelemetryStats = function () {
            if (this._dataWarehouse) {
                var customData = {
                    task: AppResponsivenessAnalyzerTasks.GetTelemetryStats.toString()
                };
                var contextData = {
                    customDomain: customData
                };
                return this._dataWarehouse.getFilteredData(contextData, AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID)
                    .then(function (telemetryStats) {
                    return telemetryStats;
                }, function (error) {
                    throw error;
                });
            }
            return Common.PromiseHelper.getPromiseError(null);
        };
        // Returns the UI thread ID
        AnalyzerDataSession.prototype.getUIThreadId = function () {
            return this._threadId;
        };
        AnalyzerDataSession.prototype.getUIThreadSummary = function (timeRange) {
            if (this._dataWarehouse) {
                var jsonTimeRange = new DiagnosticsHub.JsonTimespan(VisualProfiler.TimestampConvertor.timestampToJson(timeRange.begin), VisualProfiler.TimestampConvertor.timestampToJson(timeRange.end));
                var customData = {
                    task: AppResponsivenessAnalyzerTasks.GetUIThreadActivityData.toString(),
                    granularity: (timeRange.end.nsec - timeRange.begin.nsec).toString()
                };
                var contextData = {
                    customDomain: customData,
                    timeDomain: jsonTimeRange
                };
                return this._dataWarehouse.getFilteredData(contextData, AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID)
                    .then(function (result) {
                    var data = [];
                    if (result.length === 1) {
                        var parsingTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].ParsingTime).nsec;
                        if (parsingTime > 0) {
                            data.push({ category: "XamlParsing", name: "XamlParsing", value: parsingTime });
                        }
                        var xamlOtherTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].XamlOther).nsec;
                        if (xamlOtherTime > 0) {
                            data.push({ category: "XamlOther", name: "XamlOther", value: xamlOtherTime });
                        }
                        var xamlLayoutTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].LayoutTime).nsec;
                        if (xamlLayoutTime > 0) {
                            data.push({ category: "XamlLayout", name: "XamlLayout", value: xamlLayoutTime });
                        }
                        var appCodeTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].AppCodeTime).nsec;
                        if (appCodeTime > 0) {
                            data.push({ category: "AppCode", name: "AppCode", value: appCodeTime });
                        }
                        var renderTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].RenderTime).nsec;
                        if (renderTime > 0) {
                            data.push({ category: "XamlRender", name: "XamlRender", value: renderTime });
                        }
                        var ioTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].IOTime).nsec;
                        if (ioTime > 0) {
                            data.push({ category: "IO", name: Microsoft.Plugin.Resources.getString("IO"), value: ioTime });
                        }
                        var unknownTime = VisualProfiler.TimestampConvertor.jsonToTimeStamp(result[0].Unknown).nsec;
                        if (unknownTime > 0) {
                            data.push({ category: "Idle", name: "Idle", value: unknownTime });
                        }
                    }
                    return data;
                }, function (error) {
                    throw error;
                });
            }
            return Common.PromiseHelper.getPromiseError(null);
        };
        AnalyzerDataSession.prototype.getFilteredResult = function (operation, timespan, customData) {
            var contextData = {
                timeDomain: timespan,
                customDomain: {
                    operation: operation
                }
            };
            if (customData) {
                for (var key in customData) {
                    if (customData.hasOwnProperty(key)) {
                        contextData.customDomain[key] = customData[key];
                    }
                }
            }
            return this._dataWarehouse.getFilteredData(contextData, AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID);
        };
        AnalyzerDataSession.QUERY_EVENT_INTERVALS = "queryEventIntervals";
        /*
         * Analyzer CLSID
         */
        AnalyzerDataSession.TIMELINE_ANALYZER_CLASSID = "161C8B44-77BF-49AA-A60C-44603940034B";
        AnalyzerDataSession.MARKERS_ANALYZER_CLASSID = "B821D548-5BA4-4C0E-8D23-CD46CE0C8E23";
        /*
         * Graph CounterIds
         */
        AnalyzerDataSession.CPU_USAGE_COUNTERID = "CPUUsage";
        AnalyzerDataSession.FRAME_RATE_COUNTERID = "frameRate";
        AnalyzerDataSession.LIFE_CYCLE_MARKS_COUNTERID = "LifeCycleEventMarks";
        AnalyzerDataSession.USER_MARKS_COUNTERID = "UserMarks";
        return AnalyzerDataSession;
    }());
    VisualProfiler.AnalyzerDataSession = AnalyzerDataSession;
    //This must match native enum defined in TreeQueryViewProcessor.h
    (function (TreeViewQueryResultTaskType) {
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["GET_EVENTS_COUNT"] = 1] = "GET_EVENTS_COUNT";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["GET_EVENTS"] = 2] = "GET_EVENTS";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["INDEX_OF_EVENT"] = 3] = "INDEX_OF_EVENT";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["COLLAPSE_EVENT_BRANCH"] = 4] = "COLLAPSE_EVENT_BRANCH";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["EXPAND_EVENT_BRANCH"] = 5] = "EXPAND_EVENT_BRANCH";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["GET_EXPANDED_EVENT_IDS"] = 6] = "GET_EXPANDED_EVENT_IDS";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["INDEX_OF_PARENT_EVENT"] = 7] = "INDEX_OF_PARENT_EVENT";
        TreeViewQueryResultTaskType[TreeViewQueryResultTaskType["MAX"] = 8] = "MAX";
    })(VisualProfiler.TreeViewQueryResultTaskType || (VisualProfiler.TreeViewQueryResultTaskType = {}));
    var TreeViewQueryResultTaskType = VisualProfiler.TreeViewQueryResultTaskType;
    var EventIntevalsQueryResult = (function () {
        function EventIntevalsQueryResult(resultObject) {
            this._resultObj = resultObject;
            this._requests = [];
        }
        EventIntevalsQueryResult.prototype.collapseIntervalBranch = function (index) {
            var requestObject = {
                task: TreeViewQueryResultTaskType.COLLAPSE_EVENT_BRANCH,
                index: index
            };
            return this.submitRequest(requestObject);
        };
        EventIntevalsQueryResult.prototype.expandIntervalBranch = function (index) {
            var requestObject = {
                task: TreeViewQueryResultTaskType.EXPAND_EVENT_BRANCH,
                index: index
            };
            return this.submitRequest(requestObject);
        };
        //Returns events count
        EventIntevalsQueryResult.prototype.getIntervalsCount = function () {
            var requestObject = {
                task: TreeViewQueryResultTaskType.GET_EVENTS_COUNT,
            };
            return this.submitRequest(requestObject)
                .then(function (response) {
                return response;
            });
        };
        //Returns IEventInterval[]
        EventIntevalsQueryResult.prototype.getIntervals = function (startIndex, endIndex) {
            var requestObject = {
                task: TreeViewQueryResultTaskType.GET_EVENTS,
                startIndex: startIndex,
                endIndex: endIndex
            };
            return this.submitRequest(requestObject);
        };
        // Returns -1 if the interval's id is not part of the current result
        EventIntevalsQueryResult.prototype.indexOfInterval = function (id) {
            var requestObject = {
                task: TreeViewQueryResultTaskType.INDEX_OF_EVENT,
                id: id
            };
            return this.submitRequest(requestObject)
                .then(function (response) {
                return response;
            });
        };
        EventIntevalsQueryResult.prototype.indexOfParentInterval = function (id) {
            var requestObject = {
                task: TreeViewQueryResultTaskType.INDEX_OF_PARENT_EVENT,
                id: id
            };
            return this.submitRequest(requestObject)
                .then(function (response) {
                return response;
            });
        };
        EventIntevalsQueryResult.prototype.expandFrameForEvent = function (eventId) {
            return Microsoft.Plugin.Promise.wrap(null);
        };
        EventIntevalsQueryResult.prototype.getAggregatedDescendantsForEvent = function (id) {
            return Microsoft.Plugin.Promise.wrap([]);
        };
        EventIntevalsQueryResult.prototype.getSelectionSummary = function () {
            return Microsoft.Plugin.Promise.wrap([]);
        };
        EventIntevalsQueryResult.prototype.dispose = function () {
            return this.submitRequest(null, true);
        };
        EventIntevalsQueryResult.prototype.submitRequest = function (request, isDisposeRequest) {
            var queryRequest = {
                requestData: request,
                promise: Common.PromiseHelper.promiseWrapper,
                isDispose: isDisposeRequest
            };
            if (!this._disposed) {
                this._requests.push(queryRequest);
                if (this._requests.length === 1) {
                    this.processRequest();
                }
            }
            return queryRequest.promise.promise; //Promise won't be triggered if already disposed
        };
        EventIntevalsQueryResult.prototype.processRequest = function () {
            var _this = this;
            if (this._requests.length > 0) {
                var request = this._requests[0];
                if (request.isDispose) {
                    this._requests = []; //Not triggering error handler
                    this._disposed = true;
                    this._resultObj.dispose()
                        .then(function () {
                        Common.PromiseHelper.safeInvokePromise(request.promise.completeHandler, null);
                    }, function (error) {
                        Common.PromiseHelper.safeInvokePromise(request.promise.errorHandler, error);
                    });
                }
                else {
                    this._resultObj.getResult(request.requestData)
                        .then(function (data) {
                        Common.PromiseHelper.safeInvokePromise(request.promise.completeHandler, data);
                        _this._requests.shift();
                        _this.processRequest();
                    }, function (error) {
                        Common.PromiseHelper.safeInvokePromise(request.promise.errorHandler, error);
                        _this._requests.shift();
                        _this.processRequest();
                    });
                }
            }
        };
        return EventIntevalsQueryResult;
    }());
    VisualProfiler.EventIntevalsQueryResult = EventIntevalsQueryResult;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <webunit-reference path="$(OutputPath)/Common/DiagnosticsHub.js" />
/// <webunit-reference path="$(OutputPath)/Common/Controls/hubControls.js" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    /* A data warehouse profiling source
     */
    var DataWarehouseProfilerSource = (function () {
        function DataWarehouseProfilerSource(dataWarehouse) {
            this._dataWarehouse = dataWarehouse;
        }
        DataWarehouseProfilerSource.prototype.clean = function () {
        };
        DataWarehouseProfilerSource.prototype.getDataSession = function () {
            var analyzerDataSession = new VisualProfiler.AnalyzerDataSession(this._dataWarehouse);
            return analyzerDataSession.initialize().then(function () {
                return analyzerDataSession;
            });
        };
        return DataWarehouseProfilerSource;
    }());
    VisualProfiler.DataWarehouseProfilerSource = DataWarehouseProfilerSource;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../Bpt.Diagnostics.Common/trace.ts" />
//--------
/// <reference path="../../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../Program.ts" />
/// <reference path="GlobalRuler.ts" />
/// <reference path="TimeSpan.ts" />
/// <reference path="../responsivenessNotifications.ts" />
/// <reference path="../VisualProfiler.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var ToolbarViewModel = (function (_super) {
        __extends(ToolbarViewModel, _super);
        function ToolbarViewModel(controller) {
            _super.call(this);
        }
        ToolbarViewModel.initialize = function () {
            Common.ObservableHelpers.defineProperty(ToolbarViewModel, ToolbarViewModel.ClearSelectionEnabledPropertyName, /*defaultValue=*/ false);
            Common.ObservableHelpers.defineProperty(ToolbarViewModel, ToolbarViewModel.ResetZoomEnabledPropertyName, /*defaultValue=*/ false);
            Common.ObservableHelpers.defineProperty(ToolbarViewModel, ToolbarViewModel.ZoomInEnabledPropertyName, /*defaultValue=*/ false);
        };
        ToolbarViewModel.prototype.clearSelection = function () {
            if (this._globalRuler) {
                this._globalRuler.setSelection(this._globalRuler.activeRange);
            }
        };
        ToolbarViewModel.prototype.resetZoom = function () {
            if (this._globalRuler) {
                this._globalRuler.setActiveRange(this._globalRuler.totalRange);
                this._globalRuler.setSelection(this._lastZoomSelection);
                this.zoomInEnabled = true;
                this.clearSelectionEnabled = true;
            }
            Notifications.notify(VisualProfiler.ResponsivenessNotifications.ResetZoomFinished);
        };
        ToolbarViewModel.prototype.setGlobalRuler = function (globalRuler) {
            if (this._globalRuler) {
                this._globalRuler.removeEventListener(VisualProfiler.GlobalRuler.ActiveRangeChangedEventType, this.onActiveRangeChanged.bind(this));
                this._globalRuler.removeEventListener(VisualProfiler.GlobalRuler.SelectionChangedEventType, this.onSelectionChanged.bind(this));
            }
            this._globalRuler = globalRuler;
            if (this._globalRuler) {
                this._globalRuler.addEventListener(VisualProfiler.GlobalRuler.ActiveRangeChangedEventType, this.onActiveRangeChanged.bind(this));
                this._globalRuler.addEventListener(VisualProfiler.GlobalRuler.SelectionChangedEventType, this.onSelectionChanged.bind(this));
            }
        };
        ToolbarViewModel.prototype.zoomIn = function () {
            VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_Zoom_Start);
            if (this._globalRuler) {
                this._lastZoomSelection = this._globalRuler.selection;
                this._globalRuler.setActiveRange(this._globalRuler.selection);
                this.clearSelection();
                this.zoomInEnabled = false;
                this.clearSelectionEnabled = false;
            }
            Notifications.notify(VisualProfiler.ResponsivenessNotifications.ZoomInFinished);
            VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_Zoom_Stop);
        };
        ToolbarViewModel.prototype.onActiveRangeChanged = function (args) {
            this.resetZoomEnabled = !this._globalRuler.activeRange.equals(this._globalRuler.totalRange);
        };
        ToolbarViewModel.prototype.onSelectionChanged = function (args) {
            var clearSelectionAllowed = !args.data.newSelection.equals(this._globalRuler.activeRange);
            this.clearSelectionEnabled = clearSelectionAllowed;
            this.zoomInEnabled = clearSelectionAllowed && (args.data.newSelection.elapsed.nsec > ToolbarViewModel.MinimumZoomLevelInNs);
        };
        ToolbarViewModel.MinimumZoomLevelInNs = 100000;
        ToolbarViewModel.ClearSelectionEnabledPropertyName = "clearSelectionEnabled";
        ToolbarViewModel.ResetZoomEnabledPropertyName = "resetZoomEnabled";
        ToolbarViewModel.ZoomInEnabledPropertyName = "zoomInEnabled";
        return ToolbarViewModel;
    }(Common.Observable));
    VisualProfiler.ToolbarViewModel = ToolbarViewModel;
    ToolbarViewModel.initialize();
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <webunit-reference path="$(OutputPath)/Common/DiagnosticsHub.js" />
/// <webunit-reference path="$(OutputPath)/Common/Controls/hubControls.js" />
/// <reference path="./Program.ts" />
/// <reference path="js/ProfilingSource.ts" />
/// <reference path="VisualProfiler.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var VisualProfilerView = (function () {
        function VisualProfilerView(mainViewTemplate, controller) {
            this.controller = controller;
            var container = document.getElementById("mainContainer");
            var mainContainer = new Common.Controls.Legacy.Control(container);
            this.mainView = new Common.Controls.Legacy.TemplateControl(mainViewTemplate);
            mainContainer.appendChild(this.mainView);
            this.dataViewContainer = this.mainView.findElement("dataViewContainer");
            this.detailedViewsContainer = this.mainView.findElement("detailedViewsContainer");
            this.eventsTimelineView = new VisualProfiler.EventsTimelineView(this.mainView.findElement("timelineViewContainer").id);
            this._warningView = this.mainView.findElement("warningView");
            this._warningView.style.display = "none";
            this._warningMessage = this.mainView.findElement("warningMessage");
        }
        VisualProfilerView.prototype.onProcessingStarting = function () {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProcessingCompleted = function () {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProcessingFailed = function (error) {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProcessingProgress = function (progress) {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProfilingStarted = function () {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProfilingStartFailed = function (err) {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProfilingStopping = function () {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.onProfilingStopFailed = function (err) {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.setSource = function (source) {
            var _this = this;
            VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_LoadGraphs_Start);
            this.onProcessingStarting();
            this._warningView.style.display = "none";
            this.eventsTimelineView.toggleProcessingUI(true);
            return this.controller.initializeSession(source).then(function (result) {
                _this.onProcessingCompleted();
                // Show detailedViewsContainer
                _this.detailedViewsContainer.style.display = "";
                _this.setupAnalysisView(result);
                _this.eventsTimelineView.toggleProcessingUI(false);
            }, function (error) {
                _this.eventsTimelineView.toggleProcessingUI(false);
                _this.onProcessingFailed(error);
                _this.showError(new Error(Microsoft.Plugin.Resources.getString("GenericDataProcessingError", error.message)));
                VisualProfiler.Program.reportError(error, Microsoft.Plugin.Resources.getString("GenericDataProcessingError"));
            }, function (progress) {
                _this.onProcessingProgress(progress);
            });
        };
        VisualProfilerView.prototype.setupAnalysisView = function (result) {
            this.setupAnalysisViewOverride(result);
            this.eventsTimelineView.viewModel = result.eventsTimelineViewModel;
            this.eventsTimelineView.viewModel.resetFilter();
            this.eventsTimelineView.viewModel.resetViewSettings();
            this.renderTimeLineView();
            this.eventsTimelineView.viewModel.getTelemetryStatsAndFormatForReporting().then(function (values) { VisualProfiler.Program.reportTelemetry("AnalysisTarget", values); });
        };
        VisualProfilerView.prototype.renderTimeLineView = function () {
            this.eventsTimelineView.render()
                .done(function () {
                VisualProfiler.Program.fireCodeMarker(VisualProfiler.CodeMarkerValues.perfBrowserTools_VisualProfilerResultsLoaded);
                Notifications.notify(VisualProfiler.ResponsivenessNotifications.ResultsLoaded);
                VisualProfiler.Program.traceWriter.raiseEvent(Common.TraceEvents.Timeline_LoadGraphs_Stop);
            });
        };
        VisualProfilerView.prototype.setupAnalysisViewOverride = function (result) {
            // Implemented by the derived class
        };
        VisualProfilerView.prototype.showError = function (error, helpUrl) {
            // Implemented by the derived class
        };
        return VisualProfilerView;
    }());
    VisualProfiler.VisualProfilerView = VisualProfilerView;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="VisualProfilerView.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    var VS;
    (function (VS) {
        "use strict";
        var VisualProfilerView = (function (_super) {
            __extends(VisualProfilerView, _super);
            function VisualProfilerView(controller) {
                _super.call(this, "mainViewTemplateVS", controller);
            }
            VisualProfilerView.prototype.setupAnalysisViewOverride = function (result) {
                VisualProfiler.Program.triggerResize();
            };
            VisualProfilerView.prototype.showError = function (error, helpUrl) {
                var errorView = new Common.Controls.Legacy.TemplateControl("errorViewTemplate");
                var errorMessageDiv = errorView.findElement("errorMessage");
                errorMessageDiv.innerText = error.message;
                this.mainView.rootElement.innerHTML = "";
                this.mainView.rootElement.appendChild(errorView.rootElement);
            };
            return VisualProfilerView;
        }(VisualProfiler.VisualProfilerView));
        VS.VisualProfilerView = VisualProfilerView;
    })(VS = VisualProfiler.VS || (VisualProfiler.VS = {}));
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../../Common/Script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <webunit-reference path="$(OutputPath)/Common/DiagnosticsHub.js" />
/// <webunit-reference path="$(OutputPath)/Common/Controls/hubControls.js" />
/// <reference path="./Program.ts" />
/// <reference path="js/GlobalRuler.ts" />
/// <reference path="js/EventsTimelineView.ts" />
/// <reference path="CodeMarkerValues.ts" />
/// <reference path="responsivenessNotifications.ts" />
/// <reference path="js/AnalyzerDataSession.ts" />
/// <reference path="js/ProfilingSource.ts" />
/// <reference path="js/ToolbarViewModel.ts" />
/// <reference path="VisualProfilerView.vs.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
    var VisualProfilerController = (function () {
        function VisualProfilerController() {
            var _this = this;
            this._toolbarViewModel = new VisualProfiler.ToolbarViewModel(this);
            this._view = new VisualProfiler.VS.VisualProfilerView(this);
            DiagnosticsHub.DataWarehouse.loadDataWarehouse().done(function (dataWarehouse) {
                _this._view.setSource(new VisualProfiler.DataWarehouseProfilerSource(dataWarehouse));
            });
        }
        Object.defineProperty(VisualProfilerController.prototype, "globalRuler", {
            get: function () {
                return this._globalRuler;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualProfilerController.prototype, "toolbarViewModel", {
            get: function () {
                return this._toolbarViewModel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VisualProfilerController.prototype, "view", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        VisualProfilerController.prototype.initializeSession = function (source) {
            var _this = this;
            this._profilingSource = source;
            var promise;
            return new Microsoft.Plugin.Promise(
            // init
            // init
            function (completed, error, progress) {
                promise = _this._profilingSource.getDataSession()
                    .then(function (session) {
                    _this._session = session;
                    return Common.PromiseHelper.getPromiseSuccess();
                }, error, function (prog) {
                    if (progress) {
                        progress({
                            totalStages: prog.stageCount,
                            currentStage: prog.currentStage,
                            errCode: prog.result,
                            isCompleted: prog.finished,
                            max: prog.maxValue,
                            value: prog.progressValue
                        });
                    }
                })
                    .then(function () {
                    if (_this._globalRuler) {
                        _this._globalRuler.deinitialize();
                    }
                    var totalDuration = _this._session.getTotalDuration();
                    _this._globalRuler = new VisualProfiler.GlobalRuler(new VisualProfiler.TimeSpan(VisualProfiler.TimeStamp.fromNanoseconds(totalDuration.begin), VisualProfiler.TimeStamp.fromNanoseconds(totalDuration.end)));
                    _this._toolbarViewModel.setGlobalRuler(_this._globalRuler);
                    var markEventModel = new VisualProfiler.MarkEventModel(_this._session);
                    var eventTimelineModel = new VisualProfiler.EventsTimelineModel(_this._session);
                    var eventTimelineViewModel = new VisualProfiler.EventsTimelineViewModel(eventTimelineModel, _this._globalRuler, markEventModel);
                    if (completed) {
                        completed(Microsoft.Plugin.Promise.as({
                            eventsTimelineViewModel: eventTimelineViewModel,
                            globalRuler: _this._globalRuler
                        }));
                    }
                }, error);
            }, 
            // oncancel
            // oncancel
            function () {
                promise.cancel();
            });
        };
        VisualProfilerController.LEFT_RIGHT_PADDING = 34;
        VisualProfilerController.ETL_RESOURCE_TYPE = "DiagnosticsHub.Resource.EtlFile";
        VisualProfilerController.ETL_SAVE_NAME = "Trace";
        return VisualProfilerController;
    }());
    VisualProfiler.VisualProfilerController = VisualProfilerController;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="codeMarkerValues.ts" />
/// <reference path="../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="./js/extensions/userSettings.ts" />
/// <reference path="VisualProfilerData.d.ts" />
/// <reference path="VisualProfiler.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    (function (HostType) {
        HostType[HostType["VS"] = 0] = "VS";
        HostType[HostType["Test"] = 1] = "Test";
    })(VisualProfiler.HostType || (VisualProfiler.HostType = {}));
    var HostType = VisualProfiler.HostType;
    var ProgramEvents = (function () {
        function ProgramEvents() {
        }
        ProgramEvents.Resize = "resize";
        ProgramEvents.Initialized = "initialized";
        return ProgramEvents;
    }());
    VisualProfiler.ProgramEvents = ProgramEvents;
})(VisualProfiler || (VisualProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External Bpt.Diagnostics.* references.  These are included explicitly in the csproj
// as the Bpt.Diagnostics.*.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="Bpt.Diagnostics.Common/trace.ts" />
// <reference path="Bpt.Diagnostics.PerfTools.Common/hostShell.ts" />
//--------
/// <reference path="../../Common/Script/Hub/Plugin.redirect.d.ts" />
/// <reference path="codeMarkerValues.ts" />
/// <reference path="VisualProfilerData.d.ts" />
/// <reference path="Program.ts" />
/// <reference path="VisualProfiler.ts" />
/// <reference path="js/extensions/userSettings.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    var ProgramMain = (function () {
        function ProgramMain() {
            this._eventManager = new Microsoft.Plugin.Utilities.EventManager();
            this._traceWriter = new Common.DefaultTraceWriter();
        }
        Object.defineProperty(ProgramMain.prototype, "controller", {
            get: function () { return this._visualProfilerController; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramMain.prototype, "hostType", {
            get: function () { return this._hostType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramMain.prototype, "hostShell", {
            get: function () { return this._hostShell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramMain.prototype, "traceWriter", {
            get: function () { return this._traceWriter; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramMain.prototype, "userSettings", {
            get: function () { return this._userSettings; },
            enumerable: true,
            configurable: true
        });
        ProgramMain.prototype.addEventListener = function (eventType, func) {
            if (eventType === VisualProfiler.ProgramEvents.Initialized && this._visualProfilerController) {
                var event = new Event(eventType);
                event.controller = this._visualProfilerController;
                func(event);
            }
            else {
                this._eventManager.addEventListener(eventType, func);
            }
        };
        ProgramMain.prototype.fireCodeMarker = function (codeMarker) {
            if (Microsoft.Plugin.VS && Microsoft.Plugin.VS.Internal && Microsoft.Plugin.VS.Internal.CodeMarkers) {
                Microsoft.Plugin.VS.Internal.CodeMarkers.fire(codeMarker);
            }
        };
        ProgramMain.prototype.getHostSpecificString = function (resourceId) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _resourceId = resourceId + Common.Enum.GetName(VisualProfiler.HostType, this._hostType);
            return Microsoft.Plugin.Resources.getString(_resourceId, args);
        };
        ProgramMain.prototype.main = function () {
            var _this = this;
            if (window.parent && window.parent.getExternalObj) {
                // Hosted in IFrame
                this._externalObj = window.parent.getExternalObj();
            }
            else if (window.external) {
                this._externalObj = window.external;
            }
            this._hostType = VisualProfiler.HostType.VS;
            Microsoft.Plugin.addEventListener("pluginready", function () {
                _this._telemetryProxy = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Timeline.Telemetry", {}, true);
                Microsoft.Plugin.Tooltip.defaultTooltipContentToHTML = false;
                if (Microsoft.Plugin.VS && Microsoft.Plugin.VS.Keyboard) {
                    Microsoft.Plugin.VS.Keyboard.setZoomState(false);
                }
                var perfTrace;
                switch (_this.hostType) {
                    case VisualProfiler.HostType.VS:
                        _this._hostShell = new Common.Extensions.HostShellProxy();
                        //perfTrace = <Common.ITraceWriter>Plugin.VS.Utilities.createExternalObject("PerformanceTraceExtension", "{8C0C6315-37F1-11E3-8259-6C3BE516EAD0}");
                        break;
                    default:
                        throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1056"));
                }
                if (perfTrace) {
                    _this._traceWriter = new Common.TraceWriter(perfTrace);
                }
                VisualProfiler.Extensions.UserSettingsHelper.getUserSettings().then(function (userSettings) {
                    _this._userSettings = userSettings;
                    _this.initializeErrorReporting();
                    window.addEventListener("resize", _this.triggerResize.bind(_this));
                    // Start the main controller
                    _this._visualProfilerController = new VisualProfiler.VisualProfilerController();
                    _this._eventManager.dispatchEvent(VisualProfiler.ProgramEvents.Initialized);
                });
            });
        };
        ProgramMain.prototype.initializeErrorReporting = function () {
            var _this = this;
            // Stop reporting errors to the WER service
            window.onerror = function (e, url, line, column, error) {
                // There is actually a 4th argument, for column - but the Typescript stubs aren't updated
                var additionalInfo;
                if (error && error instanceof Error) {
                    additionalInfo = "Error number: " + error.number;
                    additionalInfo += "\r\nStack: " + error.stack;
                }
                else {
                    additionalInfo = "Unhandled Error";
                }
                _this.reportError(new Error(e), additionalInfo, url, line, column);
                return true;
            };
        };
        ProgramMain.prototype.removeEventListener = function (eventType, func) {
            this._eventManager.removeEventListener(eventType, func);
        };
        ProgramMain.prototype.reportError = function (error, additionalInfo, source, line, column) {
            if (!this.userSettings.disableWER) {
                // Depending on the source, the error object will be different
                var message = (error.message || error.description);
                var url = source || "XAML Timeline";
                var lineNumber = line || 0;
                var columnNumber = column || 0;
                var errorInfo = "Error description:  " + message;
                if (error.number) {
                    errorInfo += "\r\nError number:  " + error.number;
                }
                if (source) {
                    errorInfo += "\r\nSource:  " + source;
                }
                if (error.stack) {
                    var stack = error.stack;
                    errorInfo += "\r\nError stack:  " + stack;
                    // Find message if we dont have one already
                    if (!message) {
                        var index = stack.indexOf("\n");
                        if (index > 0) {
                            index = Math.min(index, 50);
                            message = stack.substring(0, index);
                        }
                    }
                    // Find url
                    if (typeof source === "undefined") {
                        var matchInfo = stack.match(/(file|res):?([^)]+)\)/);
                        if (matchInfo && matchInfo.length > 2) {
                            url = matchInfo[2];
                        }
                    }
                    // Find line number
                    if (typeof line === "undefined") {
                        matchInfo = stack.match(/line ?(\d+)/);
                        if (!matchInfo || matchInfo.length <= 1) {
                            matchInfo = stack.match(/js:?(\d+):/);
                        }
                        if (matchInfo && matchInfo.length > 1) {
                            lineNumber = parseInt(matchInfo[1]);
                        }
                    }
                }
                if (additionalInfo) {
                    errorInfo += "\r\nAdditional Info:  " + additionalInfo;
                }
                Microsoft.Plugin.Diagnostics.reportError(message, url, lineNumber, errorInfo, columnNumber);
            }
        };
        ProgramMain.prototype.triggerResize = function () {
            this._eventManager.dispatchEvent(VisualProfiler.ProgramEvents.Resize);
        };
        ProgramMain.prototype.reportTelemetry = function (eventName, data) {
            this._telemetryProxy._call("reportTelemetryEvent", eventName, data);
        };
        return ProgramMain;
    }());
    VisualProfiler.ProgramMain = ProgramMain;
    VisualProfiler.Program = new ProgramMain();
})(VisualProfiler || (VisualProfiler = {}));
VisualProfiler.Program.main();
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    "use strict";
    (function (DragDirection) {
        DragDirection[DragDirection["none"] = 0] = "none";
        DragDirection[DragDirection["left"] = 1] = "left";
        DragDirection[DragDirection["right"] = 2] = "right";
    })(VisualProfiler.DragDirection || (VisualProfiler.DragDirection = {}));
    var DragDirection = VisualProfiler.DragDirection;
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    var Graphs;
    (function (Graphs) {
        "use strict";
        /* A helper class to get the resource string either from the hub resource dictionary or from Microsoft.Plugin.
         */
        var GraphResources = (function () {
            function GraphResources(resources) {
                this._graphResources = resources;
            }
            GraphResources.prototype.getString = function (resourceId) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                // First try to get the resource from the dictionary
                if (this._graphResources) {
                    var resourceString = this._graphResources[resourceId];
                    if (resourceString !== undefined) {
                        resourceString = GraphResources.format(resourceId, resourceString, args);
                        return resourceString;
                    }
                }
                // Fallback to the Microsoft.Plugin resources
                try {
                    return Microsoft.Plugin.Resources.getString.apply(Microsoft.Plugin.Resources, arguments);
                }
                catch (e) { }
                return resourceId;
            };
            GraphResources.format = function (resourceId, format, args) {
                return format.replace(GraphResources.FORMAT_REG_EXP, function (match, index) {
                    var replacer;
                    switch (match) {
                        case "{{":
                            replacer = "{";
                            break;
                        case "}}":
                            replacer = "}";
                            break;
                        case "{":
                        case "}":
                            throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.3002"));
                        default:
                            var argsIndex = parseInt(index);
                            if (args && argsIndex < args.length) {
                                replacer = args[argsIndex];
                            }
                            else {
                                throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPlugin.3003") + " (resourceId = " + resourceId + ")");
                            }
                            break;
                    }
                    if (replacer === undefined || replacer === null) {
                        replacer = "";
                    }
                    if (typeof replacer !== "string") {
                        replacer = replacer.toString();
                    }
                    return replacer;
                });
            };
            GraphResources.FORMAT_REG_EXP = /\{{2}|\{(\d+)\}|\}{2}|\{|\}/g;
            return GraphResources;
        }());
        Graphs.GraphResources = GraphResources;
    })(Graphs = VisualProfiler.Graphs || (VisualProfiler.Graphs = {}));
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var VisualProfiler;
(function (VisualProfiler) {
    var Graphs;
    (function (Graphs) {
        "use strict";
        var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
        var DataSeriesInfo = (function () {
            function DataSeriesInfo(name, cssClass, sortOrder) {
                if (!name || sortOrder === undefined || sortOrder === null) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1044"));
                }
                this._name = name;
                this._cssClass = cssClass;
                this._sortOrder = sortOrder;
            }
            Object.defineProperty(DataSeriesInfo.prototype, "cssClass", {
                get: function () {
                    return this._cssClass;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataSeriesInfo.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataSeriesInfo.prototype, "sortOrder", {
                get: function () {
                    return this._sortOrder;
                },
                enumerable: true,
                configurable: true
            });
            return DataSeriesInfo;
        }());
        Graphs.DataSeriesInfo = DataSeriesInfo;
        var StackedBarChartPresenter = (function () {
            function StackedBarChartPresenter(options) {
                this._data = [];
                this._dataSeriesInfo = {};
                this._maximumYValue = Number.NEGATIVE_INFINITY;
                this.viewModel = [];
                this._options = options;
                this.validateOptions();
                this._pixelHorizontalValue = this.xWidth / this._options.width;
            }
            Object.defineProperty(StackedBarChartPresenter.prototype, "maximumYValue", {
                get: function () {
                    return this._maximumYValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StackedBarChartPresenter.prototype, "xWidth", {
                get: function () {
                    return this._options.maxX - this._options.minX;
                },
                enumerable: true,
                configurable: true
            });
            StackedBarChartPresenter.prototype.addData = function (chartData) {
                var _this = this;
                chartData.forEach(function (dataItem) {
                    if (_this._dataSeriesInfo.hasOwnProperty(dataItem.series)) {
                        _this._data.push(dataItem);
                    }
                    else {
                        throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1043"));
                    }
                });
                this.generateViewModel();
            };
            StackedBarChartPresenter.prototype.addSeries = function (seriesInfo) {
                for (var i = 0; i < seriesInfo.length; i++) {
                    var info = seriesInfo[i];
                    if (this._dataSeriesInfo.hasOwnProperty(info.name)) {
                        throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1045"));
                    }
                    this._dataSeriesInfo[info.name] = info;
                }
            };
            StackedBarChartPresenter.prototype.getViewOptions = function () {
                var viewOptions = {
                    ariaDescription: this._options.ariaDescription,
                    ariaLabelCallback: this._options.ariaLabelCallback,
                    height: this._options.height,
                    width: this._options.width,
                    tooltipCallback: this._options.tooltipCallback,
                    legendData: this._dataSeriesInfo
                };
                return viewOptions;
            };
            StackedBarChartPresenter.prototype.convertChartAreaPercentToDataValue = function (percent) {
                return Math.round(percent * this.xWidth / 100) + this._options.minX;
            };
            StackedBarChartPresenter.prototype.determineYAxisScale = function (allBars) {
                for (var i = 0; i < allBars.length; i++) {
                    var totalStackHeight = 0;
                    var currentBar = allBars[i];
                    for (var j = 0; j < currentBar.length; j++) {
                        var stackComponent = currentBar[j];
                        if (stackComponent.height > 0) {
                            totalStackHeight += stackComponent.height;
                        }
                    }
                    this._maximumYValue = Math.max(this._maximumYValue, totalStackHeight);
                }
                this._maximumYValue = Math.max(this._options.minYHeight, this._maximumYValue);
                // Round the max value to the next 100, taking into account real precision (to avoid scaling up by 100 to cater
                // for the 100.0000000001 case)
                this._maximumYValue = Math.ceil(Math.floor(this._maximumYValue) / 100) * 100;
                var availableAxisHight = this._options.height - StackedBarChartPresenter.YAXIS_PIXEL_PADDING;
                if (availableAxisHight <= 0) {
                    availableAxisHight = this._options.height;
                }
                this._pixelVerticalValue = this._maximumYValue / availableAxisHight;
                this._maximumYValue = this._options.height * this._pixelVerticalValue;
            };
            StackedBarChartPresenter.prototype.generateViewModel = function () {
                var allBars = [[]];
                var singleBar = [];
                var barWidthAndMargin = this._options.barWidth + this._options.barGap;
                var currentXValue = this._options.minX;
                var prevValue = Number.NEGATIVE_INFINITY;
                var x = 0;
                var i = 0;
                while (i < this._data.length) {
                    var dataItem = this._data[i];
                    if (dataItem.x < prevValue) {
                        throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1046"));
                    }
                    if (dataItem.x > this._options.maxX) {
                        break;
                    }
                    prevValue = dataItem.x;
                    var currentXValue = Math.floor(x * this._pixelHorizontalValue + this._options.minX);
                    var currentBarMinValue = currentXValue;
                    var currentBarMaxValue = currentXValue + Math.floor((this._options.barWidth + this._options.barGap) * this._pixelHorizontalValue);
                    if (dataItem.x < currentBarMinValue) {
                        i++;
                        continue;
                    }
                    if (dataItem.x < currentBarMaxValue) {
                        dataItem.x = x;
                        singleBar.push(dataItem);
                        i++;
                    }
                    else {
                        allBars.push(singleBar);
                        singleBar = [];
                        x += barWidthAndMargin;
                    }
                }
                allBars.push(singleBar);
                this.determineYAxisScale(allBars);
                for (var i = 0; i < allBars.length; i++) {
                    this.generateViewModelForSingleStack(allBars[i]);
                }
            };
            StackedBarChartPresenter.prototype.generateViewModelForSingleStack = function (dataItems) {
                if (!dataItems || dataItems.length === 0) {
                    return;
                }
                dataItems.sort(this.sortBySeries.bind(this));
                var accumulatedHeight = 0;
                var maxHeightExceeded = false;
                var singleBarViewModel = [];
                for (var i = dataItems.length - 1; i >= 0; i--) {
                    var dataItem = dataItems[i];
                    if (dataItem.height <= 0) {
                        continue;
                    }
                    // We want to display the small amounts as 1-pixel bars, but need to round the rest
                    // to reduce the liklihood of exceeding 100% for the stack on the graph.
                    var barHeight = Math.round(dataItem.height / this._pixelVerticalValue);
                    if (dataItem.height > 0 && barHeight < 1) {
                        barHeight = 1;
                    }
                    var startY = this._options.height - (barHeight + accumulatedHeight) - 1;
                    if (startY < 0) {
                        barHeight = this._options.height - accumulatedHeight;
                        startY = 0;
                        maxHeightExceeded = true;
                    }
                    accumulatedHeight += barHeight;
                    if (this._options.showStackGap && barHeight > 1) {
                        barHeight -= 1;
                        startY += 1;
                    }
                    var rectangle = {
                        x: dataItem.x,
                        y: startY,
                        height: barHeight,
                        width: this._options.barWidth,
                        className: this._dataSeriesInfo[dataItem.series].cssClass,
                        chartItem: dataItem
                    };
                    this.viewModel.push(rectangle);
                    if (maxHeightExceeded) {
                        break;
                    }
                }
            };
            StackedBarChartPresenter.prototype.sortBySeries = function (chartItem1, chartItem2) {
                return this._dataSeriesInfo[chartItem2.series].sortOrder - this._dataSeriesInfo[chartItem1.series].sortOrder;
            };
            StackedBarChartPresenter.prototype.validateOptions = function () {
                if (!this._options) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1047"));
                }
                if ((this._options.minX === undefined || this._options.minX === null) ||
                    (this._options.maxX === undefined || this._options.maxX === null) ||
                    (this._options.minY === undefined || this._options.minY === null) ||
                    (this._options.minX > this._options.maxX) ||
                    (!this._options.height || !this._options.width || this._options.height < 0 || this._options.width < 0) ||
                    (!this._options.barWidth || this._options.barWidth < 0)) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1048"));
                }
                this._options.barGap = this._options.barGap || 0;
                this._options.showStackGap = this._options.showStackGap || false;
                this._options.minYHeight = this._options.minYHeight || this._options.minY;
            };
            StackedBarChartPresenter.YAXIS_PIXEL_PADDING = 10;
            return StackedBarChartPresenter;
        }());
        Graphs.StackedBarChartPresenter = StackedBarChartPresenter;
        var StackedBarChartView = (function () {
            function StackedBarChartView() {
                this._idCount = 0;
                this._selectedId = -1;
                this.rootElement = document.createElement("div");
                this.rootElement.style.width = this.rootElement.style.height = "100%";
            }
            Object.defineProperty(StackedBarChartView.prototype, "presenter", {
                set: function (value) {
                    this._presenter = value;
                    this._viewData = this._presenter.viewModel;
                    this._options = value.getViewOptions();
                    this._barGraphWidth = this._options.width;
                    this.drawChart();
                },
                enumerable: true,
                configurable: true
            });
            StackedBarChartView.prototype.convertPageXToChartAreaPercent = function (pageX) {
                var rect = this._chartAreaContainer.getBoundingClientRect();
                return (pageX - rect.left) / this._barGraphWidth * 100;
            };
            StackedBarChartView.prototype.createContainer = function () {
                if (!this._chartAreaContainer) {
                    this._chartAreaContainer = document.createElement("div");
                    this.rootElement.appendChild(this._chartAreaContainer);
                }
                else {
                    this._chartAreaContainer.innerHTML = "";
                }
                this._chartAreaContainer.style.width = this._options.width + "px";
                this._chartAreaContainer.style.height = this._options.height + "px";
                this._chartAreaContainer.classList.add("stackedBarChart");
                this._chartAreaContainer.style.display = "-ms-grid";
            };
            StackedBarChartView.prototype.createRect = function (x, y, height, width, className) {
                var rect = document.createElement("div");
                rect.id = StackedBarChartView._barIdPrefix + this._idCount;
                rect.tabIndex = -1;
                this._idCount++;
                rect.classList.add("bar");
                rect.classList.add(className);
                rect.style.left = x + "px";
                rect.style.bottom = (this._options.height - y - height) + "px";
                rect.style.height = height + "px";
                rect.style.width = width + "px";
                return rect;
            };
            StackedBarChartView.prototype.drawChart = function () {
                if (!this._viewData) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1049"));
                }
                this.createContainer();
                this.initializeBarGraph();
                this.renderViewData(this._barGraph, this._viewData);
                this._chartAreaContainer.appendChild(this._barGraph);
            };
            StackedBarChartView.prototype.initializeBarGraph = function () {
                var _this = this;
                this._selectedId = -1;
                this._idCount = 0;
                this._barGraph = document.createElement("div");
                this._barGraph.classList.add("barGraph");
                this._barGraph.tabIndex = 0;
                this._barGraph.style.height = this._options.height + "px";
                this._barGraph.style.width = this._barGraphWidth + "px";
                this._barGraph.addEventListener("keydown", this.onBarGraphKeydown.bind(this));
                this._barGraph.addEventListener("focus", function () { _this._selectedId = -1; });
                if (this._options.ariaDescription) {
                    this._barGraph.setAttribute("aria-label", this._options.ariaDescription);
                }
            };
            StackedBarChartView.prototype.onBarBlur = function (event) {
                var bar = event.currentTarget;
                bar.classList.remove("focused");
                Microsoft.Plugin.Tooltip.dismiss();
            };
            StackedBarChartView.prototype.onBarFocus = function (chartItem, event) {
                var bar = event.currentTarget;
                bar.classList.add("focused");
                if (this._options.ariaLabelCallback) {
                    var ariaLabel = this._options.ariaLabelCallback(chartItem);
                    bar.setAttribute("aria-label", ariaLabel);
                }
            };
            StackedBarChartView.prototype.onBarGraphKeydown = function (event) {
                if (event.keyCode === DiagnosticsHub.Common.KeyCodes.ArrowLeft || event.keyCode === DiagnosticsHub.Common.KeyCodes.ArrowRight) {
                    if (event.keyCode === DiagnosticsHub.Common.KeyCodes.ArrowLeft) {
                        if ((this._selectedId === 0) || (this._selectedId === -1)) {
                            this._selectedId = this._idCount;
                        }
                        this._selectedId--;
                    }
                    else if (event.keyCode === DiagnosticsHub.Common.KeyCodes.ArrowRight) {
                        this._selectedId++;
                        if (this._selectedId === this._idCount) {
                            this._selectedId = 0;
                        }
                    }
                    var bar = document.getElementById(StackedBarChartView._barIdPrefix + this._selectedId);
                    bar.focus();
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                return true;
            };
            StackedBarChartView.prototype.onBarKeydown = function (objectForTooltip, event) {
                if (event.keyCode === DiagnosticsHub.Common.KeyCodes.Enter) {
                    var element = event.currentTarget;
                    var offsetX = window.screenLeft + element.offsetLeft + element.clientWidth;
                    var offsetY = window.screenTop + element.offsetTop;
                    element = element.offsetParent;
                    while (element) {
                        offsetX += element.offsetLeft;
                        offsetY += element.offsetTop;
                        element = element.offsetParent;
                    }
                    this.showTooltip(objectForTooltip, offsetX, offsetY);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                return true;
            };
            StackedBarChartView.prototype.renderViewData = function (container, viewData) {
                for (var i = 0; i < viewData.length; i++) {
                    var barInfo = viewData[i];
                    var rectangle = this.createRect(barInfo.x, barInfo.y, barInfo.height, barInfo.width, barInfo.className);
                    rectangle.addEventListener("mouseover", this.showTooltip.bind(this, barInfo.chartItem));
                    rectangle.addEventListener("mouseout", function () { return Microsoft.Plugin.Tooltip.dismiss(); });
                    rectangle.addEventListener("keydown", this.onBarKeydown.bind(this, barInfo.chartItem));
                    rectangle.addEventListener("focus", this.onBarFocus.bind(this, barInfo.chartItem));
                    rectangle.addEventListener("blur", this.onBarBlur.bind(this));
                    container.appendChild(rectangle);
                }
            };
            StackedBarChartView.prototype.showTooltip = function (chartItem, x, y) {
                if (this._options.tooltipCallback) {
                    var toolTipContent = this._options.tooltipCallback(chartItem);
                    var config = { content: toolTipContent, delay: 0, x: x, y: y, contentContainsHTML: true };
                    Microsoft.Plugin.Tooltip.show(config);
                }
            };
            StackedBarChartView._barIdPrefix = "bar";
            return StackedBarChartView;
        }());
        Graphs.StackedBarChartView = StackedBarChartView;
    })(Graphs = VisualProfiler.Graphs || (VisualProfiler.Graphs = {}));
})(VisualProfiler || (VisualProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="StackedBarChart.ts" />
/// <reference path="DataTypes.d.ts" />
/// <reference path="DataUtilities.ts" />
/// <reference path="GraphResources.ts" />
var VisualProfiler;
(function (VisualProfiler) {
    var Graphs;
    (function (Graphs) {
        "use strict";
        var DiagnosticsHub = Microsoft.VisualStudio.DiagnosticsHub;
        var Category = (function () {
            function Category() {
            }
            Category.parsingCategory = "Parsing_Category";
            Category.layoutCategory = "Layout_Category";
            Category.appCodeCategory = "AppCode_Category";
            Category.xamlOtherCategory = "XamlOther_Category";
            Category.renderCategory = "Render_Category";
            Category.ioCategory = "IO_Category";
            return Category;
        }());
        Graphs.Category = Category;
        var StackedBarGraph = (function () {
            function StackedBarGraph(config) {
                this._scaleChangedEvent = new DiagnosticsHub.AggregatedEvent();
                this._config = config;
                this._graphResources = new Graphs.GraphResources(this._config.resources);
                this._timeRange = this._config.timeRange || new DiagnosticsHub.JsonTimespan(new DiagnosticsHub.BigNumber(0, 0), new DiagnosticsHub.BigNumber(0, 0));
                this._container = document.createElement("div");
                StackedBarGraph.validateConfiguration(this._config);
                this._dataSource = this._config.jsonConfig.Series[0].DataSource;
                if (config.pathToScriptFolder && config.loadCss) {
                    config.loadCss(config.pathToScriptFolder + "/CSS/hubGraphs/StackedBarChart.css");
                    config.loadCss(config.pathToScriptFolder + "/DataCategoryStyles.css");
                }
                // Setup scale
                this._config.scale = this._config.scale || {};
                this._config.scale.minimum = 0;
                this._config.scale.maximum = 120;
                this._config.scale.axes = [];
                this._config.scale.axes.push({
                    value: 100
                });
                // add series and legend to config
                this._config.legend = this._config.legend || [];
                var seriesCollection = this._config.jsonConfig.Series;
                for (var i = 0; i < seriesCollection.length; i++) {
                    var series = seriesCollection[i];
                    this._config.legend.push({
                        color: series.Color,
                        legendText: this._graphResources.getString(series.Legend),
                        legendTooltip: (series.LegendTooltip ? this._graphResources.getString(series.LegendTooltip) : null)
                    });
                }
            }
            Object.defineProperty(StackedBarGraph.prototype, "container", {
                get: function () {
                    return this._container;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StackedBarGraph.prototype, "scaleChangedEvent", {
                get: function () {
                    return this._scaleChangedEvent;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StackedBarGraph.prototype, "containerOffsetWidth", {
                get: function () {
                    if (this._containerOffsetWidth === undefined) {
                        this._containerOffsetWidth = this._container.offsetWidth;
                    }
                    return this._containerOffsetWidth;
                },
                enumerable: true,
                configurable: true
            });
            StackedBarGraph.prototype.onDataUpdate = function (timestampNs) {
                // Not implemented
            };
            StackedBarGraph.prototype.addSeriesData = function (counterId, points, fullRender, dropOldData) {
                // Not implemented
            };
            StackedBarGraph.prototype.getDataPresenter = function () {
                var presenterOptions = {
                    ariaDescription: this._graphResources.getString("UiThreadActivityAriaLabel"),
                    height: this._config.height,
                    width: this.containerOffsetWidth,
                    minX: parseInt(this._timeRange.begin.value),
                    maxX: parseInt(this._timeRange.end.value),
                    minY: 0,
                    minYHeight: 100,
                    barWidth: this._config.jsonConfig.BarWidth,
                    barGap: this._config.jsonConfig.BarGap,
                    showStackGap: this._config.jsonConfig.ShowStackGap,
                    tooltipCallback: this.createTooltip.bind(this),
                    ariaLabelCallback: this.createAriaLabel.bind(this)
                };
                var presenter = new Graphs.StackedBarChartPresenter(presenterOptions);
                //
                // Add series information to the presenter
                //
                var dataSeriesInfo = [];
                var stackedDataSeries = this._config.jsonConfig.Series;
                for (var i = 0; i < stackedDataSeries.length; i++) {
                    var seriesItem = stackedDataSeries[i];
                    dataSeriesInfo.push({
                        cssClass: seriesItem.CssClass,
                        name: seriesItem.Category,
                        sortOrder: i + 1
                    });
                }
                presenter.addSeries(dataSeriesInfo);
                return presenter;
            };
            StackedBarGraph.prototype.getGranularity = function () {
                var bucketWidth = this._config.jsonConfig.BarGap + this._config.jsonConfig.BarWidth;
                var graphDuration = parseInt(this._timeRange.elapsed.value);
                if (graphDuration <= 0 || this.containerOffsetWidth <= 0) {
                    return 0;
                }
                return Math.floor(bucketWidth / this.containerOffsetWidth * graphDuration);
            };
            StackedBarGraph.prototype.removeInvalidPoints = function (base) {
                // Not implemented
            };
            StackedBarGraph.prototype.render = function (fullRender) {
                if (this._config.jsonConfig.GraphBehaviour == DiagnosticsHub.GraphBehaviourType.PostMortem) {
                    this.setData(this._timeRange);
                }
            };
            StackedBarGraph.prototype.resize = function (evt) {
                this._containerOffsetWidth = undefined;
                this.render();
            };
            StackedBarGraph.prototype.onViewportChanged = function (viewportArgs) {
                if (this._timeRange.equals(viewportArgs.currentTimespan)) {
                    // Only selection changed, ignore this event
                    return;
                }
                this._timeRange = viewportArgs.currentTimespan;
                this.render();
            };
            StackedBarGraph.validateConfiguration = function (config) {
                if (!config) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1070"));
                }
                var jsonObject = config.jsonConfig;
                if (!jsonObject) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1071"));
                }
                if (!jsonObject.Series || jsonObject.Series.length === 0) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1072"));
                }
                jsonObject.BarWidth = jsonObject.BarWidth || 4;
                jsonObject.BarGap = jsonObject.BarGap || 0;
                jsonObject.ShowStackGap = jsonObject.ShowStackGap || false;
                if ((!config.height || config.height < 0) ||
                    jsonObject.BarWidth < 0) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1048"));
                }
            };
            StackedBarGraph.prototype.createTooltip = function (cpuUsage) {
                var tooltip = this._graphResources.getString(cpuUsage.series) + ": " + (Math.round(cpuUsage.height * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) + "%";
                return tooltip;
            };
            StackedBarGraph.prototype.createAriaLabel = function (cpuUsage) {
                var percentageUtilization = (Math.round(cpuUsage.height * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
                var formattedTime = DiagnosticsHub.RulerUtilities.formatTime(DiagnosticsHub.BigNumber.convertFromNumber(cpuUsage.x), DiagnosticsHub.UnitFormat.fullName);
                return this._graphResources.getString("UiThreadActivityBarAriaLabel", this._graphResources.getString(cpuUsage.series), percentageUtilization, formattedTime);
            };
            StackedBarGraph.jsonTimeToNanoseconds = function (bigNumber) {
                var l = bigNumber.l;
                var h = bigNumber.h;
                if (l < 0) {
                    l = l >>> 0;
                }
                if (h < 0) {
                    h = h >>> 0;
                }
                var nsec = h * 0x100000000 + l;
                return nsec;
            };
            StackedBarGraph.prototype.setData = function (timeRange) {
                var _this = this;
                if (this._settingDataPromise) {
                    this._settingDataPromise.cancel();
                    this._settingDataPromise = null;
                }
                if (!this._dataSource || !this._dataSource.CounterId || !this._dataSource.AnalyzerId) {
                    // No data to set if there is no data source
                    return;
                }
                this._settingDataPromise = this.getDataWarehouse().then(function (dataWarehouse) {
                    var granuality = _this.getGranularity();
                    if (granuality > 0) {
                        return Graphs.DataUtilities.getFilteredResult(dataWarehouse, _this._dataSource.AnalyzerId, _this._dataSource.CounterId, timeRange, {
                            granularity: granuality.toString(),
                            task: "1" // AnalysisTaskType::GetUIThreadActivityData in XamlProfiler\DataModel\XamlAnalyzer.h
                        });
                    }
                    else {
                        return Microsoft.Plugin.Promise.wrap([]);
                    }
                }).then(function (cpuUsageResult) {
                    if (_this._chart) {
                        _this._container.removeChild(_this._chart.rootElement);
                        _this._chart = null;
                    }
                    if (cpuUsageResult) {
                        var chartItems = [];
                        for (var i = 0; i < cpuUsageResult.length; i++) {
                            var cpuUsagePoint = cpuUsageResult[i];
                            var parsingTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.ParsingTime);
                            var layoutTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.LayoutTime);
                            var appCodeTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.AppCodeTime);
                            var xamlOtherTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.XamlOther);
                            var unknownTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.Unknown);
                            var renderTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.RenderTime);
                            var ioTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.IOTime);
                            var startTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.StartTime);
                            var endTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.EndTime);
                            var totalTime = endTime - startTime;
                            if (parsingTime > 0) {
                                chartItems.push({
                                    series: Category.parsingCategory,
                                    x: startTime,
                                    height: parsingTime * 100.0 / totalTime
                                });
                            }
                            if (layoutTime > 0) {
                                chartItems.push({
                                    series: Category.layoutCategory,
                                    x: startTime,
                                    height: layoutTime * 100.0 / totalTime
                                });
                            }
                            if (appCodeTime > 0) {
                                chartItems.push({
                                    series: Category.appCodeCategory,
                                    x: startTime,
                                    height: appCodeTime * 100.0 / totalTime
                                });
                            }
                            if (xamlOtherTime > 0) {
                                chartItems.push({
                                    series: Category.xamlOtherCategory,
                                    x: startTime,
                                    height: xamlOtherTime * 100.0 / totalTime
                                });
                            }
                            if (renderTime > 0) {
                                chartItems.push({
                                    series: Category.renderCategory,
                                    x: startTime,
                                    height: renderTime * 100.0 / totalTime
                                });
                            }
                            if (ioTime > 0) {
                                chartItems.push({
                                    series: Category.ioCategory,
                                    x: startTime,
                                    height: ioTime * 100.0 / totalTime
                                });
                            }
                        }
                        var dataPresenter = _this.getDataPresenter();
                        dataPresenter.addData(chartItems);
                        _this._chart = new Graphs.StackedBarChartView();
                        _this._chart.presenter = dataPresenter;
                        // Update the y-axis scale maximum
                        _this._scaleChangedEvent.invokeEvent({
                            minimum: 0,
                            maximum: dataPresenter.maximumYValue
                        });
                        _this._container.appendChild(_this._chart.rootElement);
                    }
                }).then(function () {
                    _this._settingDataPromise = null;
                });
            };
            StackedBarGraph.prototype.getDataWarehouse = function () {
                var _this = this;
                if (this._dataWarehouse) {
                    return Microsoft.Plugin.Promise.as(this._dataWarehouse);
                }
                else {
                    return DiagnosticsHub.DataWarehouse.loadDataWarehouse().then(function (dataWarehouse) {
                        _this._dataWarehouse = dataWarehouse;
                        return _this._dataWarehouse;
                    });
                }
            };
            return StackedBarGraph;
        }());
        Graphs.StackedBarGraph = StackedBarGraph;
    })(Graphs = VisualProfiler.Graphs || (VisualProfiler.Graphs = {}));
})(VisualProfiler || (VisualProfiler = {}));
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
    var VisualProfiler = (function () {
        function VisualProfiler() {
        }
        VisualProfiler.toolbarButtonsPanel = "\
<div>\
            <div data-name=\"startToolbarButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:startToolbarButton,                                tooltip:F12StartButtonTooltip; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:startProfilingEnabled\"></div>\
            <div data-name=\"stopToolbarButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:stopToolbarButton,                                tooltip:F12StopButtonTooltip; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:stopProfilingEnabled\"></div>\
            <div data-name=\"openSessionButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:openSessionButton,                                tooltip:F12OpenSessionButtonTooltip; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:openSessionEnabled\"></div>\
            <div data-name=\"saveSessionButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:saveSessionButton,                                tooltip:F12SaveSessionButtonTooltip; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:saveSessionEnabled\"></div>\
            <div data-name=\"zoomInButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:zoomInButton,                                tooltip:ToolbarButtonZoomIn; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:zoomInEnabled\"></div>\
            <div data-name=\"resetZoomButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:resetZoomButton,                                tooltip:ToolbarButtonResetZoom; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:resetZoomEnabled\"></div>\
            <div data-name=\"clearSelectionButton\" data-control=\"Common.Controls.Button\" data-control-templateid=\"Common.iconButton24x24\" data-options=\"className:clearSelectionButton,                                tooltip:ToolbarButtonClearSelection; converter=Common.CommonConverters.ResourceConverter\" data-binding=\"isEnabled:clearSelectionEnabled\"></div>\
        </div>\
";
        VisualProfiler.filteringBarTemplate = "\
<div class=\"filteringBar\">\
            <div id=\"timelineSort\" class=\"timelineSort\">\
                <label class=\"timelineSortLabel\" for=\"timelineSortSelector\" data-options=\"textContent:TimelineSortLabel; converter=Common.CommonConverters.ResourceConverter\">\
                </label>\
                <div id=\"timelineSortSelector\" data-name=\"timelineSortSelector\" data-control=\"Common.Controls.ComboBox\" data-binding=\"items:sortOptions,                                    selectedValue:sort; mode=twoway; converter=Common.CommonConverters.IntToStringConverter\" data-options=\"className:timelineSortSelector\"></div>\
            </div>\
            <div data-name=\"frameGroupingButton\" data-control=\"Common.Controls.ToggleButton\" data-control-templateid=\"Common.iconButton24x24\" data-binding=\"isChecked:displayFrames; mode=twoway\" data-options=\"className:frameGroupingButton,                                tooltip:FrameGroupingTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"filteringMenuButton\" role=\"menu\" data-control=\"Common.Controls.ToggleButton\" data-control-templateid=\"Common.menuButton33x24\" data-binding=\"isChecked:hasFilterSettingsChanged\" data-options=\"className:filteringMenuButton,                                toggleIsCheckedOnClick:false; converter=Common.CommonConverters.StringToBooleanConverter,                                tooltip:FilteringMenuButtonTooltipText; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"viewSettingsMenuButton\" role=\"menu\" data-control=\"Common.Controls.ToggleButton\" data-control-templateid=\"Common.menuButton33x24\" data-binding=\"isChecked:hasViewSettingsChanged\" data-options=\"className:viewSettingsMenuButton,                                toggleIsCheckedOnClick:false; converter=Common.CommonConverters.StringToBooleanConverter,                                tooltip:ViewSettingsMenuButtonTooltipText; converter=Common.CommonConverters.ResourceConverter\"></div>\
        </div>\
";
        VisualProfiler.filteringMenuDropDown = "\
<ul>\
            <div data-name=\"eventNameFilter\" data-control=\"Common.Controls.TextBoxMenuItem\" data-binding=\"content:eventNameFilter; mode=twoway\" data-options=\"className:eventNameFilter,                                placeholder:EventNameFilterPlaceholder; converter=Common.CommonConverters.ResourceConverter,                                tooltip:EventNameFilterTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <hr />\
            <div data-name=\"displayBackgroundActivities\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:displayBackgroundActivities; mode=twoway\" data-options=\"content:FilterBackgroundActivities; converter=Common.CommonConverters.ResourceConverter,                                tooltip:BackgroundActivityFilterTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"displayIOActivities\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:displayIOActivities; mode=twoway\" data-options=\"content:FilterIOActivities; converter=Common.CommonConverters.ResourceConverter,                                tooltip:IOFilterTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"displayUIActivities\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:displayUIActivities; mode=twoway\" data-options=\"content:FilterUIActivities; converter=Common.CommonConverters.ResourceConverter,                                tooltip:UIActivityFilterTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"displayScenarios\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:displayScenarios; mode=twoway\" data-options=\"content:FilterScenarios; converter=Common.CommonConverters.ResourceConverter,                                tooltip:ScenariosFilterTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <hr />\
            <div data-name=\"durationFilter\" data-control=\"Common.Controls.ComboBoxMenuItem\" data-binding=\"items:durationFilterOptions,                                selectedValue:durationFilter; mode=twoway; converter=Common.CommonConverters.IntToStringConverter\" data-options=\"tooltip:DurationFilterTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
        </ul>\
";
        VisualProfiler.viewSettingsMenuDropDown = "\
<ul>\
            <div data-name=\"showThreadIndicator\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:showThreadIndicator; mode=twoway\" data-options=\"content:ShowThreadIndicator; converter=Common.CommonConverters.ResourceConverter,                                tooltip:ShowThreadIndicatorTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"showQualifiersInEventNames\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:showQualifiersInEventNames; mode=twoway\" data-options=\"content:ShowQualifiersInEventNames; converter=Common.CommonConverters.ResourceConverter,                                tooltip:ShowQualifiersInEventNamesTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"showDurationSelfInTimeline\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:showDurationSelfInTimeline; mode=twoway\" data-options=\"content:ShowDurationSelfInTimeline; converter=Common.CommonConverters.ResourceConverter,                                tooltip:ShowDurationSelfInTimelineTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
            <div data-name=\"showHintTextInTimeline\" data-control=\"Common.Controls.CheckBoxMenuItem\" data-binding=\"isChecked:showHintTextInTimeline; mode=twoway\" data-options=\"content:ShowHintTextInTimeline; converter=Common.CommonConverters.ResourceConverter,                                tooltip:ShowHintTextInTimelineTooltip; converter=Common.CommonConverters.ResourceConverter\"></div>\
        </ul>\
";
        return VisualProfiler;
    }());
    ControlTemplates.VisualProfiler = VisualProfiler;
})(ControlTemplates || (ControlTemplates = {}));
//# sourceMappingURL=VisualProfilerMerged.js.map
// SIG // Begin signature block
// SIG // MIIjnQYJKoZIhvcNAQcCoIIjjjCCI4oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // +fl7PP9lTfHH/Dsd8UbzyG4+4QZxkFWfCzEZh6eViQag
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIDAUfsoTf3zW9RAadzX2
// SIG // vKCb6GP3uJgSSEs8PDWFqa1JMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAMEYlLevwta1M+inXevCbYZeUwfheBvJqUe6a
// SIG // w9ygTTKhoMPC2sn0SH6fG+WwGQx3tbTKVpkiOtOA383h
// SIG // ehjjjzB1TpZrJVTEgET69d2ar+95+msHt2ucuNJIrkFh
// SIG // 94g6Q7TYGg+KL/JoWmaS67Z6jtZaL0DPAT31MHQEcXXc
// SIG // ubOWKipvfHWdxjfv0pwdo7MqsEU/uN0bj18YErzFjXXv
// SIG // lvWYQ1DeYdV9TNOdqrsOF1FpkOtYZkQkgFpM6H6fKwiR
// SIG // DHglmfTlpLI7ON8XOClbuTqgQIOe4y44JVPZmGQnyFHO
// SIG // cAkHuV+0hZD7SBhmhzD5LpJOsM2QWBd+WsjSH2flEaGC
// SIG // Ev4wghL6BgorBgEEAYI3AwMBMYIS6jCCEuYGCSqGSIb3
// SIG // DQEHAqCCEtcwghLTAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCA1pKN8
// SIG // RpH8/xO/WbP5ckPWv67R6f8SfIKWuFn/mnTX/QIGYIrN
// SIG // mTOSGBMyMDIxMDUwMzIyMjc0NS4yMjFaMASAAgH0oIHY
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
// SIG // CSqGSIb3DQEJBDEiBCBXk5Xg65d4Irquwb/eLM/aRrV2
// SIG // Kjk4jrf8SCIhFKDIGjCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIJ+v0IQHqSxf+wXbL37vBjk/ooS/XOHI
// SIG // KOTX9WlDfLRtMIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAE6jY0x93dJScIAAAAAATow
// SIG // IgQg6j8oWjkFYTZBOAQtliW6T4616B7XvMQwUs4w24oU
// SIG // uaYwDQYJKoZIhvcNAQELBQAEggEAN3iFrqReavfPZsCv
// SIG // JTk5Gsb7c2cOx/Gz7rp6sOfUo4eqhaGUajO73lNQ6DCe
// SIG // b747nT6z2HdruPtVWxmb66RWMJakPArapZZWfmec3qMD
// SIG // hZBoH8dKcqwFCLCiiQg9vxzYGDlXNHTrp+oFBQYuN4oX
// SIG // 4+WWA4EQo8eZUCXRtaGM2UYlsCh13aRfOu99xQnmCdmy
// SIG // CXMYe+F7VCFlduVVpRyJOtRRl8Gx87vne13eXy6z3tUk
// SIG // couScbueKFcxb4T3vid/1ArjdTaJ1m3CTngQgRtgUqv8
// SIG // cbDhltfj+yKhTKmbuu6SD7VYgUaLVPxqUYlL8+kUM3cY
// SIG // nRusQpjsAI9jbo+UYQ==
// SIG // End signature block
