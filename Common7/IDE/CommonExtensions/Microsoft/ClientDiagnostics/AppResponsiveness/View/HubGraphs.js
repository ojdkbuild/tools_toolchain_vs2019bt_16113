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
//# sourceMappingURL=HubGraphs.js.map
// SIG // Begin signature block
// SIG // MIIjkAYJKoZIhvcNAQcCoIIjgTCCI30CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // +jQXEhF1HTLo+zqMMxENphocsSId2BahP/l0GUn0Af6g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCFWcw
// SIG // ghVjAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAHfa/AukqdKtNAAAAAAAd8wDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIGrQEKR9DTODb0kJ8F8h
// SIG // MPPx8uzbA7wnrKXdCUDGFEn4MEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAkZ/+9jWebvqEiBND/PEb7BnDohNN+i2Jc1Cs
// SIG // FzgslNBoFP8DI/xgW5nkRjsXLvmdC32MX4rsY0HkndNU
// SIG // pZ/EA0WM4rMvbOt67fCV+BRhWqGElwyDICkdc39uUwX8
// SIG // iPZYpO6WngVApXKIxqmoWIY3OzEo6z10S/egCDeYjQQM
// SIG // /lXiIZtud5ECNnNN0t4k4nKKwGsueHuJFCBNp9q63GFr
// SIG // fuiPQdnSSl1pbO6pb1iGrF14EaiHsW/tMygMuG3BxwTc
// SIG // EU2BmNfdFs8+eTOP0WUWlBoHMNdU9tFmedqSgTjnZbcp
// SIG // TkscLD1nZQo54dh5RtV2tslizp6fL0lGispZk8wvbaGC
// SIG // EvEwghLtBgorBgEEAYI3AwMBMYIS3TCCEtkGCSqGSIb3
// SIG // DQEHAqCCEsowghLGAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBlBebV
// SIG // vLVYTzfNLkZSbbstK/7iYf/DDuGjIAx9WVY3ZAIGYIn5
// SIG // XnzqGBMyMDIxMDUwMzIyMjQyNy4wMTVaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046NDYyRi1F
// SIG // MzE5LTNGMjAxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2Wggg5EMIIE9TCCA92gAwIBAgIT
// SIG // MwAAAVhwWiL3vpbmAwAAAAABWDANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MTAxMTQxOTAyMTRaFw0yMjA0MTExOTAyMTRaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046NDYyRi1FMzE5LTNGMjAx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
// SIG // AoIBAQChHwuXYPWrsNCgBRsL9e8jBRvEn6oFFBQvA88G
// SIG // vJq6bNHsoUUNjb/Su/7M/31RNaP9X2aeKuEhorXLIzxr
// SIG // Tp41seOVSBUyDUKXaDoZrD3Zxct4AV6TBrU316i551BO
// SIG // PlZigtrwITmdOlOr7eQnNHCaKhCbczlkcBGs/AaF9pwl
// SIG // 9UQV5B9z4gLu7Vib91fM4UUjyxZnoifgiMGstOAFIJq8
// SIG // FxEB7yR4G+j4iwsYBNlQAQgzU+QlconjWqXGYisdekGw
// SIG // 5XuyjsJIzBCCpHMUft9nQzLcwraSFA4KysZo8fhpveIx
// SIG // 4nqITh1LoZd7t4ZQGH79kgP/Ok9VDQIgUIN1rvcbAgMB
// SIG // AAGjggEbMIIBFzAdBgNVHQ4EFgQUS3DZG32dHBgf7ud+
// SIG // oHuTJ9Oi+VgwHwYDVR0jBBgwFoAU1WM6XIoxkPNDe3xG
// SIG // G8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNU
// SIG // aW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG
// SIG // 9w0BAQsFAAOCAQEAOd8oA1qL0K4fH7pYjV1tAlAU83wO
// SIG // EpeIfiDxIeZTXa4Qxcuk+DAPY7qdc85RZKWK1HNLE30A
// SIG // gDpwI5rpz4J5mkuW0n9lR/DIN+FNqoDyyJzAJBmgbPwc
// SIG // 2myeuWCntT+SCmTe1o9m0XwitNxEvJEu4OmEB+u4sTAk
// SIG // Aiw63lgyiWLDbNHITaSTgM8iXhn8kVHvk1FGxcI7Av9f
// SIG // CpmDg1YKUUmGcdFu46xqpSVRHobsKUiLBjmAgTJyQzXS
// SIG // pz/tdwoOvHFbQjV+pCXb1BR9GYrjzJQWA+xqwj6gEZUp
// SIG // /r8X3zIr7tgzCSS5HssMUnw+drA1fjQX+SJ4rihXBPct
// SIG // JvZtozCCBnEwggRZoAMCAQICCmEJgSoAAAAAAAIwDQYJ
// SIG // KoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // MjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRpZmlj
// SIG // YXRlIEF1dGhvcml0eSAyMDEwMB4XDTEwMDcwMTIxMzY1
// SIG // NVoXDTI1MDcwMTIxNDY1NVowfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwggEiMA0GCSqGSIb3DQEBAQUAA4IB
// SIG // DwAwggEKAoIBAQCpHQ28dxGKOiDs/BOX9fp/aZRrdFQQ
// SIG // 1aUKAIKF++18aEssX8XD5WHCdrc+Zitb8BVTJwQxH0Eb
// SIG // GpUdzgkTjnxhMFmxMEQP8WCIhFRDDNdNuDgIs0Ldk6zW
// SIG // czBXJoKjRQ3Q6vVHgc2/JGAyWGBG8lhHhjKEHnRhZ5Ff
// SIG // gVSxz5NMksHEpl3RYRNuKMYa+YaAu99h/EbBJx0kZxJy
// SIG // GiGKr0tkiVBisV39dx898Fd1rL2KQk1AUdEPnAY+Z3/1
// SIG // ZsADlkR+79BL/W7lmsqxqPJ6Kgox8NpOBpG2iAg16Hgc
// SIG // sOmZzTznL0S6p/TcZL2kAcEgCZN4zfy8wMlEXV4WnAEF
// SIG // TyJNAgMBAAGjggHmMIIB4jAQBgkrBgEEAYI3FQEEAwIB
// SIG // ADAdBgNVHQ4EFgQU1WM6XIoxkPNDe3xGG8UzaFqFbVUw
// SIG // GQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0P
// SIG // BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgw
// SIG // FoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8w
// SIG // TTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
// SIG // BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcnQwgaAGA1UdIAEB/wSBlTCBkjCBjwYJKwYBBAGC
// SIG // Ny4DMIGBMD0GCCsGAQUFBwIBFjFodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vUEtJL2RvY3MvQ1BTL2RlZmF1bHQu
// SIG // aHRtMEAGCCsGAQUFBwICMDQeMiAdAEwAZQBnAGEAbABf
// SIG // AFAAbwBsAGkAYwB5AF8AUwB0AGEAdABlAG0AZQBuAHQA
// SIG // LiAdMA0GCSqGSIb3DQEBCwUAA4ICAQAH5ohRDeLG4Jg/
// SIG // gXEDPZ2joSFvs+umzPUxvs8F4qn++ldtGTCzwsVmyWrf
// SIG // 9efweL3HqJ4l4/m87WtUVwgrUYJEEvu5U4zM9GASinbM
// SIG // QEBBm9xcF/9c+V4XNZgkVkt070IQyK+/f8Z/8jd9Wj8c
// SIG // 8pl5SpFSAK84Dxf1L3mBZdmptWvkx872ynoAb0swRCQi
// SIG // PM/tA6WWj1kpvLb9BOFwnzJKJ/1Vry/+tuWOM7tiX5rb
// SIG // V0Dp8c6ZZpCM/2pif93FSguRJuI57BlKcWOdeyFtw5yj
// SIG // ojz6f32WapB4pm3S4Zz5Hfw42JT0xqUKloakvZ4argRC
// SIG // g7i1gJsiOCC1JeVk7Pf0v35jWSUPei45V3aicaoGig+J
// SIG // FrphpxHLmtgOR5qAxdDNp9DvfYPw4TtxCd9ddJgiCGHa
// SIG // sFAeb73x4QDf5zEHpJM692VHeOj4qEir995yfmFrb3ep
// SIG // gcunCaw5u+zGy9iCtHLNHfS4hQEegPsbiSpUObJb2sgN
// SIG // VZl6h3M7COaYLeqN4DMuEin1wC9UJyH3yKxO2ii4sanb
// SIG // lrKnQqLJzxlBTeCG+SqaoxFmMNO7dDJL32N79ZmKLxvH
// SIG // Ia9Zta7cRDyXUHHXodLFVeNp3lfB0d4wwP3M5k37Db9d
// SIG // T+mdHhk4L7zPWAUu7w2gUDXa7wknHNWzfjUeCLraNtvT
// SIG // X4/edIhJEqGCAtIwggI7AgEBMIH8oYHUpIHRMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046NDYyRi1FMzE5LTNGMjAx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAKnJK3Ma59ELIabq
// SIG // M46fpfg0nzS/oIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDkOmZr
// SIG // MCIYDzIwMjEwNTAzMTYwOTE1WhgPMjAyMTA1MDQxNjA5
// SIG // MTVaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOQ6ZmsC
// SIG // AQAwCgIBAAICD8wCAf8wBwIBAAICES4wCgIFAOQ7t+sC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQAAgS4KDJYPg3hmFAq4Iq+bvB1bC0uT
// SIG // zeOTDzrLZOtZ9wi1+Rq1KWaKrrWPZRt624rctDNxIwF2
// SIG // fFlCCXrHsBET3sw3L7e2NPJ78RMRVZDp7WPAMjKRh6PI
// SIG // hEqbj9J4/NhayYWQLJa5ZUwCjtvOenzuGLrdvgYcW4oV
// SIG // VGf6X/kEOTGCAw0wggMJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABWHBaIve+luYDAAAA
// SIG // AAFYMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IEu1UHf7hNdmQ6daonInVqPcAAy5CLf8GCzG+IYa6xgW
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg8koz
// SIG // jWyGNZdsyk+G2uLAiOFpAQurCH0fbklTVcdw0wcwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAVhwWiL3vpbmAwAAAAABWDAiBCAdByMDgcMoFqkx
// SIG // /0RtedH3CRgRWrCKapCieDc+F12SFjANBgkqhkiG9w0B
// SIG // AQsFAASCAQAwBb/P4sYP+IwvQ8iS5APcqgsUvKwW0HV2
// SIG // tlC4aZsxdMtNSU1PUQxRdtSuyAcm04EpIOdPJw0bqp1a
// SIG // QL3KqvEcrQYF93mzj+ecxoD3fy7w9tN6X5m6Mi7iO4l7
// SIG // 7R2jtiR1PDApw9f+QnaDC1mVta0g95fj35bmcrCxRIBj
// SIG // CeOUfJjytEgCeqhUnRI5ZYSXNWeHQ8SJNAJgaiZjm5wJ
// SIG // dl5OPahq2dGNNd8HpSTbEBIp/TvM6Em+cM02iWd3BMBf
// SIG // fETHzoI2sQoajTQ2PvZsgR8ELzwQ5NKSt5LWoVxCE9+P
// SIG // 9MWgcVUvjNQkY5k7k8Rsywz++wiLsao9MUUga4nbYXax
// SIG // End signature block
