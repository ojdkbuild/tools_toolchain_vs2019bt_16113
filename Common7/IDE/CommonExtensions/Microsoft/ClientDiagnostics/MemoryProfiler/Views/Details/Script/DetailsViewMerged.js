var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../common/controls/tabControl.ts" />
// <reference path="../../Common/util/enumHelper.ts" />
//--------
/// <reference path="DetailsView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        var DetailsViewTabItem = (function (_super) {
            __extends(DetailsViewTabItem, _super);
            function DetailsViewTabItem(viewType, content) {
                _super.call(this);
                this._viewType = viewType;
                this.title = Microsoft.Plugin.Resources.getString(MemoryProfiler.Common.Enum.GetName(Details.DetailsViewType, this._viewType));
                this.tooltipString = Microsoft.Plugin.Resources.getString(MemoryProfiler.Common.Enum.GetName(Details.DetailsViewType, this._viewType) + "Tooltip");
                this.content = content;
            }
            Object.defineProperty(DetailsViewTabItem.prototype, "viewType", {
                get: function () { return this._viewType; },
                set: function (v) {
                    if (this._viewType !== v) {
                        this._viewType = v;
                    }
                },
                enumerable: true,
                configurable: true
            });
            return DetailsViewTabItem;
        }(MemoryProfiler.Common.Controls.TabItem));
        Details.DetailsViewTabItem = DetailsViewTabItem;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        var MultiRowsCopyHelper = (function () {
            function MultiRowsCopyHelper(grid) {
                this._grid = grid;
            }
            MultiRowsCopyHelper.prototype.initialize = function () {
                Details.HeapGridViewer.dataForClipboard = null;
                this._unloadedDataIndices = [];
                this._data = "";
                this._shallowestSelectedDepth = Number.MAX_VALUE;
                this._selectedDataIndicies = this._grid.getSelectedDataIndices();
                this._copiedRowsIterator = 0;
                this._prevRowIndex = null;
                var dataIndex;
                for (var p = 0; p < this._selectedDataIndicies.length; p++) {
                    dataIndex = this._selectedDataIndicies[p];
                    this._shallowestSelectedDepth = Math.min(dataIndex.length(), this._shallowestSelectedDepth);
                    if (!this._grid._dataArray.isCached(dataIndex.path)) {
                        this._unloadedDataIndices.push(p);
                    }
                }
            };
            MultiRowsCopyHelper.prototype.cacheSelectedRows = function () {
                var _this = this;
                this.initialize();
                return new Microsoft.Plugin.Promise(function (completed) {
                    if (_this._unloadedDataIndices.length > 0) {
                        _this.blockViewer();
                        _this._grid._dataArray.toggleManualGarbageCollection(true);
                    }
                    var finalizer = function () {
                        // Copy the rest of the selected indices data
                        while (this._copiedRowsIterator < this._selectedDataIndicies.length) {
                            this.addRowDataToGlobalSelection(this._selectedDataIndicies[this._copiedRowsIterator++]);
                        }
                        // Copy the data to the global clipboard
                        Details.HeapGridViewer.dataForClipboard = this.getColumnHeaderString(this._grid.options()) + this._data;
                        // unlock garbage collection on the cache
                        this._grid._dataArray.toggleManualGarbageCollection(false);
                        // delete local data
                        delete this._data;
                        delete this._unloadedDataIndices;
                        // unblock viewer and notify completion
                        this.unblockViewer();
                        completed();
                    }.bind(_this);
                    _this.getSelectedRowsContents(finalizer);
                });
            };
            // Recursively, picks a portion of the unloaded data indicies, puts them into the tree cache, then adds the rows info of both
            // already cached and recently cached rows data.
            MultiRowsCopyHelper.prototype.getSelectedRowsContents = function (finalizer, index) {
                if (index === undefined) {
                    index = 0;
                }
                var subArray = [];
                var end = Math.min(index + MultiRowsCopyHelper.MaxOneTimeCachableDataLength, this._unloadedDataIndices.length);
                // no unloaded row is selected, break early
                if (end === 0) {
                    return finalizer();
                }
                // Copy a portion of the unloaded data indices to query the model for
                for (var k = index; k < end; k++) {
                    subArray.push(this._selectedDataIndicies[this._unloadedDataIndices[k]].path);
                }
                this._grid._dataArray.cache(subArray, function (needUpdate) {
                    var dataIndex;
                    while (dataIndex !== this._selectedDataIndicies[this._unloadedDataIndices[end - 1]]) {
                        dataIndex = this._selectedDataIndicies[this._copiedRowsIterator++];
                        this.addRowDataToGlobalSelection(dataIndex);
                    }
                    if (this._unloadedDataIndices.length === 0 || index + MultiRowsCopyHelper.MaxOneTimeCachableDataLength > this._unloadedDataIndices.length) {
                        finalizer();
                    }
                    else {
                        return this.getSelectedRowsContents(finalizer, index + MultiRowsCopyHelper.MaxOneTimeCachableDataLength);
                    }
                }.bind(this));
            };
            MultiRowsCopyHelper.prototype.addRowDataToGlobalSelection = function (dataIndex) {
                var rowText = this._grid.getRowTextString(dataIndex);
                // Check the expansion state, prepending " + " (collapsed), " - " (expanded), or "   " (not expandable)
                // It's important for a space to be before the + or - because in Excel the + or - in the first character position
                // is interpreted as an Excel formula resulting in a #NAME error.
                // It's important for a space to be after the + or - for readability
                var expandState = this._grid._getExpandState(dataIndex);
                if (expandState < 0) {
                    // collapsed
                    rowText = " + " + rowText;
                }
                else if (expandState > 0) {
                    // expanded
                    rowText = " - " + rowText;
                }
                else {
                    // neither expandable, nor collapsible
                    rowText = "   " + rowText;
                }
                var leftShift = "";
                for (var j = 0; j <= dataIndex.length(); j++) {
                    if (j > this._shallowestSelectedDepth) {
                        leftShift += "  ";
                    }
                }
                var currentRowIndex = this._grid.findRowIndexByTreePath(dataIndex);
                if (this._prevRowIndex !== null && Math.abs(this._prevRowIndex - currentRowIndex) !== 1) {
                    rowText = "[...]\r\n" + rowText;
                }
                this._data += "\r\n" + leftShift + rowText;
                this._prevRowIndex = currentRowIndex;
            };
            // Get the column header text (localized) for the clipboard
            MultiRowsCopyHelper.prototype.getColumnHeaderString = function (options) {
                var columnHeaderString = "";
                options.columns.forEach(function (column) {
                    columnHeaderString += column.text + "\t";
                });
                return columnHeaderString;
            };
            MultiRowsCopyHelper.prototype.blockViewer = function () {
                if (this._grid.viewer) {
                    this._grid.viewer.enableInProgressState();
                }
            };
            MultiRowsCopyHelper.prototype.unblockViewer = function () {
                if (this._grid.viewer && this._grid.viewer.isViewDisabled()) {
                    this._grid.viewer.disableInProgressState();
                }
            };
            // Managed published object API has a hardcoded limit on the size of the json message to be sent .. 
            // this is about 7000 rows of data for managed instances, we will use half of that to remain safe.
            MultiRowsCopyHelper.MaxOneTimeCachableDataLength = 3500;
            return MultiRowsCopyHelper;
        }());
        Details.MultiRowsCopyHelper = MultiRowsCopyHelper;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../Common/controls/control.ts" />
// <reference path="../../Common/controls/TemplateControl.ts" />
// <reference path="../../Common/Util/FormattingHelpers.ts" />
//--------
/// <reference path="Helpers/MultiRowsCopyHelper.ts" />
/// <reference path="../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="../../../../../common/script/DiagShared/JSTreeDynamicGridControl.redirect.d.ts" />
/// <reference path="../../../../../common/script/Hub/DiagnosticsHub.redirect.d.ts" />
var TreeGridCommon = Common;
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        var HeapGridViewer = (function (_super) {
            __extends(HeapGridViewer, _super);
            function HeapGridViewer(dataArray, root, options, onlayout) {
                _super.call(this, dataArray, root, options);
                this._onLayout = onlayout;
                this._multiSelectHelper = new Details.MultiRowsCopyHelper(this);
            }
            HeapGridViewer.copySelectedRowsToClipboard = function (menuId, menuItem, targetId) {
                if (HeapGridViewer.dataForClipboard) {
                    var w = window;
                    w.clipboardData.setData('Text', HeapGridViewer.dataForClipboard);
                }
            };
            // Derived grid classes populate ISourceDescription from different view models
            /* protected virtual */ HeapGridViewer.prototype.getSourceDescription = function (rowIndex) {
                return null;
            };
            // Displays the Context Menu
            HeapGridViewer.prototype._onContextMenu = function (e) {
                var _this = this;
                if (this._contextMenu) {
                    // Try to get the closest row
                    var rowInfo;
                    var xPos = 0;
                    var yPos = 0;
                    if (e.type === "contextmenu") {
                        var mouseEvent = e;
                        // dobule keydown of menu key produces contextmenu event again with zero clientX and clientY - skip such events
                        if (mouseEvent.clientX && mouseEvent.clientY) {
                            rowInfo = this.getRowInfoFromEvent(e, ".grid-row");
                            xPos = mouseEvent.clientX;
                            yPos = mouseEvent.clientY;
                        }
                    }
                    else if (e.type === "keydown" && this.isActive()) {
                        var selectedIndex = this.getSelectedDataIndex();
                        // open context menu near the current row
                        if (e.target) {
                            var target = e.target;
                            var rect = target.getBoundingClientRect();
                            xPos = Math.round(rect.left);
                            yPos = Math.round(rect.bottom);
                        }
                        rowInfo = this.getRowInfo(selectedIndex);
                    }
                    if (!rowInfo)
                        return;
                    // Only the show the context menu if the selected rows were cached
                    this._multiSelectHelper.cacheSelectedRows().done(function () {
                        _this._contextMenu.show(xPos, yPos);
                    });
                }
            };
            HeapGridViewer.prototype.onCtrlC = function () {
                this._multiSelectHelper.cacheSelectedRows().done(function () {
                    HeapGridViewer.copySelectedRowsToClipboard(null, null, null);
                });
            };
            HeapGridViewer.prototype.navigateToSelectedRowSource = function () {
                var sourceDescription = this.getSourceDescription(this.getSelectedRowIndex());
                if (sourceDescription && sourceDescription.fullTypeName) {
                    MemoryProfiler.Common.MemoryProfilerViewHost.session.navigateToType(sourceDescription.fullTypeName);
                }
                else {
                    alert(Microsoft.Plugin.Resources.getString("ContextMenuViewSourceError"));
                }
            };
            HeapGridViewer.prototype.layout = function () {
                _super.prototype.layout.call(this);
                if (this._onLayout) {
                    this._onLayout();
                }
            };
            Object.defineProperty(HeapGridViewer.prototype, "viewer", {
                // Should be overriden by any child to expose a reference to the viewer
                /*protected*/ get: function () {
                    return null;
                },
                enumerable: true,
                configurable: true
            });
            // [Bug 902094] Workaround for GridViewer stealing focus
            /*protected*/ HeapGridViewer.prototype.checkUpdateActive = function (rowInfo) {
                if (this.isActive()) {
                    _super.prototype.checkUpdateActive.call(this, rowInfo);
                }
            };
            HeapGridViewer.prototype.expandNode = function (treePath) {
                var _this = this;
                this._dataArray.get(treePath.path, function (row, needUpdate) {
                    _this.getExpandedPaths().expand(treePath, row.SubItemsCount);
                    _this.updateCounts(row.SubItemsCount);
                    _this.markRowDirty(treePath.path);
                    if (row.SubItemsCount === 1) {
                        var childPath = new TreeGridCommon.Controls.DynamicGrid.TreePath([]);
                        for (var j = 0; j < treePath.path.length; j++) {
                            childPath.path.push(treePath.path[j]);
                        }
                        childPath.path.push(0);
                        _this.expandNode(childPath);
                    }
                    else if (needUpdate) {
                        _this.scheduleUpdate();
                    }
                });
            };
            return HeapGridViewer;
        }(TreeGridCommon.Controls.DynamicGrid.DynamicGridViewer));
        Details.HeapGridViewer = HeapGridViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/control.ts" />
// <reference path="../../../Common/controls/TemplateControl.ts" />
// <reference path="../../../Common/Util/FormattingHelpers.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="../../../../../../common/script/DiagShared/JSTreeDynamicGridControl.redirect.d.ts" />
/// <reference path="../../../../../../common/script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="../HeapGridViewer.ts" />
/// <reference path="ManagedHeapViewer.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        var ManagedHeapGridViewerBase = (function (_super) {
            __extends(ManagedHeapGridViewerBase, _super);
            function ManagedHeapGridViewerBase(dataArray, root, options, columns) {
                var _this = this;
                // This lambda is undesirable but apparently necessary - possibly a compiler issue. Prefer to simply assign _drawViewSourceCell to
                // columns[0].getCellContents. Check in future whether this issue is resolved.
                columns[0].getCellContents = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                    return _this._drawViewSourceCell(rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder);
                };
                _super.call(this, dataArray, root, options);
            }
            Object.defineProperty(ManagedHeapGridViewerBase.prototype, "currentSelectedIndex", {
                /* protected */ get: function () {
                    return this._currentSelectedIndex;
                },
                /* protected */ set: function (value) {
                    this._currentSelectedIndex = value;
                },
                enumerable: true,
                configurable: true
            });
            ManagedHeapGridViewerBase.getSelectedGrid = function () {
                return ManagedHeapGridViewerBase.selectedGrid;
            };
            /* protected */ ManagedHeapGridViewerBase.setSelectedGrid = function (selectedGrid) {
                ManagedHeapGridViewerBase.selectedGrid = selectedGrid;
            };
            ManagedHeapGridViewerBase.prototype._drawViewSourceCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                Details.ManagedHeapViewer.viewSourceAvailable = false;
                var sourceDescription = this.getSourceDescription(rowInfo.rowIndex);
                if (sourceDescription && sourceDescription.fullTypeName && sourceDescription.file && sourceDescription.line && sourceDescription.col) {
                    Details.ManagedHeapViewer.viewSourceAvailable = true;
                    Details.ManagedHeapViewer.viewSourceSelected = (this.getSelectedRows() && this.getSelectedRows().hasOwnProperty(rowInfo.rowIndex));
                }
                var cellElement = this._drawHeapGridCell(rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder);
                if (Details.ManagedHeapViewer.viewSourceAvailable) {
                    // Replace GridControl._setTooltip with our own code, to avoid having our HTML '<' and '>' chars translated to entities.
                    var tooltip = ManagedHeapGridViewerBase.buildSourceDescriptionTooltip(sourceDescription);
                    ManagedHeapGridViewerBase.setTooltip(cellElement, tooltip);
                    this.addAnchorToCellText(cellElement);
                }
                else if (sourceDescription && sourceDescription.fullTypeName) {
                    var tooltip = ManagedHeapGridViewerBase.chunkTooltipString(sourceDescription.fullTypeName);
                    ManagedHeapGridViewerBase.setTooltip(cellElement, tooltip);
                }
                return cellElement;
            };
            /*protected*/ ManagedHeapGridViewerBase.prototype._clearSelection = function () {
                var selectedRows = this.getSelectedRows();
                _super.prototype._clearSelection.call(this);
                for (var index in selectedRows) {
                    this.updateRow(selectedRows[index], -1);
                }
            };
            // Intent: virtual - overridden by some grids to customize cell draw beahavior.
            /* protected */ ManagedHeapGridViewerBase.prototype._drawHeapGridCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                return this._drawCell(rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder);
            };
            ManagedHeapGridViewerBase.prototype.addAnchorToCellText = function (cellElement) {
                var _this = this;
                // Find text leaf node - we'll replace this with an anchor element
                var leafNode = cellElement.firstChild;
                while (leafNode && leafNode instanceof HTMLElement) {
                    leafNode = leafNode.nextSibling;
                }
                if (leafNode) {
                    var anchorTag = document.createElement("a");
                    anchorTag.innerHTML = leafNode.textContent;
                    cellElement.removeChild(leafNode);
                    cellElement.appendChild(anchorTag);
                    anchorTag.addEventListener("mousedown", (function (e) {
                        if (e.button === 0 && !e.altKey && !e.shiftKey && !e.ctrlKey) {
                            _this._onRowMouseDown(e); // select current row before navigating
                            _this.onF12();
                        }
                    }).bind(anchorTag));
                }
            };
            ManagedHeapGridViewerBase.prototype.replaceClassOnce = function (oldClass, newClass) {
                var selectedElements = this.getElement().getElementsByClassName(oldClass);
                if (selectedElements && selectedElements.length > 0 && selectedElements[0] &&
                    selectedElements[0] instanceof HTMLElement) {
                    var selectedElement = selectedElements[0];
                    selectedElement.classList.remove(oldClass);
                    selectedElement.classList.add(newClass);
                }
            };
            /* protected */ ManagedHeapGridViewerBase.prototype.redrawSelectionChangeRows = function (rowIndex) {
                this.updateRow(rowIndex, -1);
            };
            /* protected */ ManagedHeapGridViewerBase.prototype._getAriaLabelForRow = function (rowInfo) {
                if (!this._dataArray.isCached(this.findPathByRow(rowInfo.rowIndex).path)) {
                    return;
                }
                var ariaLabel = _super.prototype._getAriaLabelForRow.call(this, rowInfo);
                if (ManagedHeapGridViewerBase.rowHasViewSourceAvailable(rowInfo)) {
                    if (!ariaLabel) {
                        ariaLabel = "";
                    }
                    ariaLabel += Microsoft.Plugin.Resources.getString("RowViewSourceAriaLabelExtension");
                }
                return ariaLabel;
            };
            /* protected */ ManagedHeapGridViewerBase.prototype._onBlur = function (e) {
                // Replace selected view source cell style with selected cell blurred style
                this.replaceClassOnce("grid-cell-source-selected", "grid-cell-source-selected-blurred");
                _super.prototype._onBlur.call(this, e);
            };
            /* protected */ ManagedHeapGridViewerBase.prototype._onFocus = function (e) {
                // Replace selected view source cell blurred style with selected cell style
                this.replaceClassOnce("grid-cell-source-selected-blurred", "grid-cell-source-selected");
                _super.prototype._onFocus.call(this, e);
            };
            ManagedHeapGridViewerBase.prototype.onF12 = function () {
                if (!ManagedHeapGridViewerBase.selectedGrid ||
                    !ManagedHeapGridViewerBase.selectedGrid.selectedRowHasSource()) {
                    alert(Microsoft.Plugin.Resources.getString("ContextMenuViewSourceError"));
                    return;
                }
                this.navigateToSelectedRowSource();
            };
            /* protected override */ ManagedHeapGridViewerBase.prototype.getSourceDescription = function (rowIndex) {
                var _this = this;
                var path = this.findPathByRow(rowIndex);
                var sourceDescription = null;
                // all entries in reference grids may be navigated; only type entries in main grid may be navigated
                if ((this instanceof Details.ManagedHeapRefGraphViewerBase) ||
                    (this instanceof ManagedHeapGridViewer) && path.length() === 1) {
                    this._dataArray.get(path.path, function (value, needUpdate) {
                        var sourceDescriptionJSON = value["SourceDescription"];
                        if (sourceDescriptionJSON) {
                            // view souce information exists. Extract it from JSON string and add fullTypeName if successful
                            sourceDescription = JSON.parse(sourceDescriptionJSON);
                            if (sourceDescription) {
                                sourceDescription.fullTypeName = _this.formatTypeName(value["FullTypeName"]);
                            }
                        }
                        else {
                            // No view source information available - populate fullTypeName only
                            sourceDescription = {
                                fullTypeName: _this.formatTypeName(value["FullTypeName"])
                            };
                        }
                    });
                }
                return sourceDescription;
            };
            // intent: virtual - formatting tags can change from grid to grid
            ManagedHeapGridViewerBase.prototype.formatTypeName = function (typeName) {
                return typeName;
            };
            ManagedHeapGridViewerBase.prototype.selectedRowHasSource = function () {
                var dataIndex = this.getSelectedDataIndex();
                if (dataIndex < 0) {
                    return false;
                }
                var rowInfo = this.getRowInfo(dataIndex);
                if (!rowInfo) {
                    return false;
                }
                return ManagedHeapGridViewerBase.rowHasViewSourceAvailable(rowInfo);
            };
            // Use style decorations to determine whether selected row has view source capabilities 
            // (perf is better than calling view model each time we draw)
            ManagedHeapGridViewerBase.rowHasViewSourceAvailable = function (rowInfo) {
                // Fetch row's leftmost cell and determine from its style if it has viewsource capabilities
                var row = rowInfo.row;
                if (!row || row.childNodes == null || row.childNodes.length < 1) {
                    return false;
                }
                var childNode = row.childNodes[0];
                if (!childNode || !(childNode instanceof HTMLElement)) {
                    return false;
                }
                var viewSourceCell = childNode;
                // We check for all of these because aria label checks need this for selected/non-selected rows on a focused/blurred grid.
                return viewSourceCell.classList.contains("grid-cell-source") ||
                    viewSourceCell.classList.contains("grid-cell-source-selected") ||
                    viewSourceCell.classList.contains("grid-cell-source-selected-blurred");
            };
            /* protected */ ManagedHeapGridViewerBase.setTooltip = function (element, tooltip) {
                var jsonTooltip = {
                    content: tooltip,
                    height: ManagedHeapGridViewerBase.RefCellTooltipHeight,
                    contentContainsHTML: true
                };
                element.setAttribute("data-plugin-vs-tooltip", JSON.stringify(jsonTooltip));
            };
            ManagedHeapGridViewerBase.buildSourceDescriptionTooltip = function (sourceDescription) {
                if (!sourceDescription || !sourceDescription.fullTypeName || !sourceDescription.file || !sourceDescription.line || !sourceDescription.col) {
                    return "";
                }
                // Format tag (simple filename), in case it's too long for our tooltip box
                var typeName = ManagedHeapGridViewerBase.chunkTooltipString(sourceDescription.fullTypeName);
                var splitTypeName = typeName.split("@"); // if there's an instance reference present, strip it out
                typeName = splitTypeName[0].trim();
                var column = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(sourceDescription.col, /*includeGroupSeparators*/ true);
                var line = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(sourceDescription.line, /*includeGroupSeparators*/ true);
                var filename = sourceDescription.file;
                filename = ManagedHeapGridViewerBase.chunkTooltipString(filename);
                var tooltip = MemoryProfiler.Common.FormattingHelpers.stringFormat(ManagedHeapGridViewerBase.TypeTooltipFormat, new Array(Microsoft.Plugin.Resources.getString("ViewSourceTooltipIdentifier"), typeName, Microsoft.Plugin.Resources.getString("ViewSourceTooltipFilename"), filename, Microsoft.Plugin.Resources.getString("ViewSourceTooltipLine"), line, Microsoft.Plugin.Resources.getString("ViewSourceTooltipCol"), column));
                return tooltip;
            };
            ManagedHeapGridViewerBase.chunkTooltipString = function (stringToChunk) {
                if (!stringToChunk) {
                    return stringToChunk;
                }
                var sourceString = stringToChunk.replace(/[<>]/g, function ($0, $1, $2) {
                    return ($0 === "<") ? "&lt;" : "&gt;";
                });
                var chunkedString = "";
                while (sourceString.length > ManagedHeapGridViewerBase.TypeTooltipChunkSize) {
                    chunkedString += sourceString.substr(0, ManagedHeapGridViewerBase.TypeTooltipChunkSize) + "<br/>";
                    sourceString = sourceString.substr(ManagedHeapGridViewerBase.TypeTooltipChunkSize, sourceString.length - ManagedHeapGridViewerBase.TypeTooltipChunkSize);
                }
                chunkedString += sourceString;
                return chunkedString;
            };
            ManagedHeapGridViewerBase.TypeTooltipChunkSize = 128;
            ManagedHeapGridViewerBase.RefCellTooltipHeight = 65;
            ManagedHeapGridViewerBase.TypeTooltipFormat = "<table border='0'>\
<tr style='vertical-align:top'><td>{0}:</td><td>{1}</td></tr>\
<tr style='vertical-align:top'><td>{2}:</td><td>{3}</td></tr>\
<tr><td>{4}:</td><td>{5}</td></tr>\
<tr><td>{6}:</td><td>{7}</td></tr>\
</table>";
            return ManagedHeapGridViewerBase;
        }(Details.HeapGridViewer));
        Details.ManagedHeapGridViewerBase = ManagedHeapGridViewerBase;
        var ManagedHeapGridViewer = (function (_super) {
            __extends(ManagedHeapGridViewer, _super);
            function ManagedHeapGridViewer(root, managedHeapViewer, dataArray, gridContextMenu, columns, refGraphCallback) {
                var options = new TreeGridCommon.Controls.DynamicGrid.DynamicGridViewerOptions(gridContextMenu, null, columns, null, null, true);
                options.gridName = Microsoft.Plugin.Resources.getString("ManagedHeapGridViewer_Name");
                options.overflowColumn = true;
                _super.call(this, dataArray, root, options, columns);
                this._managedHeapViewer = managedHeapViewer;
                this.refGraphShow = refGraphCallback;
                this._setFilterAndSortOrderHandler = "TypeSummariesSetFilterAndSortOrder";
                this._refGraphNoDataElement = this._managedHeapViewer.getElementById("ManagedHeapViewerRefGraphNoData");
                this._refGraphNoDataElement.innerHTML = Microsoft.Plugin.Resources.getString("RefGraphNoData");
                this.updateSort();
            }
            Object.defineProperty(ManagedHeapGridViewer.prototype, "waitingForUpdate", {
                get: function () {
                    return this.IsWaitingForUpdate();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapGridViewer.prototype, "viewer", {
                /*protected*/ get: function () {
                    return Details.ManagedHeapViewer.instance;
                },
                enumerable: true,
                configurable: true
            });
            ManagedHeapGridViewer.prototype.layout = function () {
                _super.prototype.layout.call(this);
                if (!this.waitingForUpdate) {
                    Details.ManagedHeapViewer.instance.onGridReady();
                    MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarkers(MemoryProfiler.Common.CodeMarkerValues.perfMP_ToggleManagedNativeSelectionStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ManagedDetailsViewLoadStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_NativeDetailsViewLoadStart);
                }
            };
            ManagedHeapGridViewer.prototype.resetView = function () {
                //  hide ref graph because currently we are not able to preserve the currently selected row
                this.hideRefGraph();
                this._clearSelection();
                this.setSelectedRowIndex(-1);
                this.refresh();
            };
            /* Protected*/ ManagedHeapGridViewer.prototype.setSelectedRowIndex = function (selectedRowIndex) {
                this.currentSelectedIndex = -1;
                _super.prototype.setSelectedRowIndex.call(this, selectedRowIndex);
            };
            ManagedHeapGridViewer.prototype.setFilterAsync = function (filterString) {
                var _this = this;
                if (filterString !== this._filter) {
                    MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetSearchFilterStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetSearchFilterEnd);
                    this._filter = filterString;
                    this.adaptor().
                        _call(this._setFilterAndSortOrderHandler, this._filter, this._sortOrderIndex, this._sortOrderOrder).
                        done(function (refresh) {
                        if (refresh) {
                            _this.resetView();
                        }
                        MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetSearchFilterStart);
                    });
                }
            };
            ManagedHeapGridViewer.prototype.updateSort = function () {
                var sortProperty;
                this.getColumns().forEach(function (column) {
                    if (column.index.indexOf(Details.ManagedHeapViewer.instance.detailsViewModel.sortPropertyManaged) == 0) {
                        sortProperty = column.index;
                    }
                });
                if (!sortProperty) {
                    sortProperty = "RetainedSize";
                }
                else if (sortProperty == this._sortOrderIndex) {
                    return;
                }
                this.onSort([new TreeGridCommon.Controls.Grid.SortOrderInfo(sortProperty, "desc")], []);
            };
            ManagedHeapGridViewer.prototype._trySorting = function (sortOrder, sortColumns) {
                var _this = this;
                this._sortOrderIndex = sortOrder[0].index;
                this._sortOrderOrder = sortOrder[0].order;
                this.adaptor()._call(this._setFilterAndSortOrderHandler, this._filter, this._sortOrderIndex, this._sortOrderOrder).done(function () {
                    _this.resetView();
                });
            };
            ManagedHeapGridViewer.prototype.translateColumn = function (row, index) {
                var retval = _super.prototype.translateColumn.call(this, row, index);
                if (!row) {
                    // data not ready
                    if (index === "TagName") {
                        retval = Microsoft.Plugin.Resources.getString("LoadRowDataText");
                    }
                }
                else {
                    // For Expanded Objects, Total Size != 0
                    if (index === "Count") {
                        if (row.Count === -1) {
                            retval = "";
                        }
                        else {
                            if (!retval)
                                retval = "1"; // count of an instance can never be 0
                            retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, false);
                        }
                    }
                    else if (index === "TotalSize" || index === "RetainedSize") {
                        // In Diff. View, Count and TotalSize of types of (B-A) is 0.
                        // In Diff. View, Count and TotalSize of objects of types of (B-A) is -1.
                        if (row.Count === -1) {
                            retval = "";
                        }
                        else {
                            if (!retval) {
                                retval = "0";
                            }
                            retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, false);
                        }
                    }
                    else if (index === "TagName" || index === "Module") {
                        retval = MemoryProfiler.Common.FormattingHelpers.getNativeDigitLocaleString(retval);
                    }
                    else {
                        // If Diff Columns - we hide the Diff values on expanding genuine and "ghost" types
                        if (row.Count === 0 && row.TotalSize !== 0 || row.Count === -1) {
                            retval = "";
                        }
                        else {
                            if (!retval) {
                                retval = "0";
                            }
                            if (parseInt(retval)) {
                                retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, true);
                            }
                        }
                    }
                }
                return retval;
            };
            ManagedHeapGridViewer.prototype.translateExternalPathColumn = function (treePath, index) {
                return index === "TagName" ?
                    Microsoft.Plugin.Resources.getString("GridTrimLimit").replace("{0}", this.MaxRows.toString()) : "";
            };
            ManagedHeapGridViewer.prototype.onSelectRow = function (rowIndex) {
                ManagedHeapGridViewerBase.selectedGrid = this;
                // Cache this grid instance for context menu drawing
                if (!this._dataArray.isCached(this.findPathByRow(rowIndex).path)) {
                    return;
                }
                this.redrawSelectionChangeRows(rowIndex);
                // Prevent reloading other windows on re-selecting the same row.
                if (this.currentSelectedIndex === this.getSelectedRowIndex()) {
                    return;
                }
                // In MultiSelect enabled mode, onSelectRow is being called on both selection and deselection of rows ..
                // we shouldn't activate a row on deselection .. 
                if (this.getSelectionCount() > 1 || !this.getSelectedRows().hasOwnProperty(rowIndex)) {
                    this.hideRefGraph();
                    return;
                }
                this.activateRow(rowIndex);
            };
            // handle clicking on a row. This method can be used programmatically
            ManagedHeapGridViewer.prototype.activateRow = function (rowIndex) {
                var _this = this;
                var asyncEnd = false;
                MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_MasterNodeSelectionChangeStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_MasterNodeSelectionChangeEnd);
                this.currentSelectedIndex = this.getSelectedRowIndex();
                var path = this.findPathByRow(rowIndex);
                if (rowIndex === this.MaxRows - 1) {
                    // hide the refGraph for the trim message
                    this.hideRefGraph();
                }
                else if (path.length() === 1) {
                    this._dataArray.get(path.path, function (value, needUpdate) {
                        _this.adaptor()._call("OnSelectType", value["Tag"]).done(function (isOk) {
                            if (isOk) {
                                Details.ManagedHeapViewer.instance.refGraphTarget = Details.RefGraphTarget.Types;
                                _this._currentSelectedItemTagName = value["TagName"];
                                _this._refGraphNoDataElement.style.display = "none";
                                Details.ManagedHeapViewer.instance.getTypeRefViewer().done(function () {
                                    Details.ManagedHeapViewer.instance.typeRefsViewer.refreshSortingOrder(function () {
                                        _this.refGraphShow(true);
                                    });
                                });
                                asyncEnd = true;
                                MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_MasterNodeSelectionChangeStart);
                            }
                        });
                    });
                }
                else if (path.length() === 2) {
                    this._dataArray.get(path.path, function (value, needUpdate) {
                        if (value["TagName"] === "<noobject>") {
                            _this.hideRefGraph();
                        }
                        else {
                            var objectTag = value["Tag"];
                            _this.adaptor()._call("OnSelectObject", objectTag).done(function (isOk) {
                                if (isOk) {
                                    Details.ManagedHeapViewer.instance.refGraphTarget = Details.RefGraphTarget.Objects;
                                    Details.ManagedHeapViewer.instance.getObjectRefViewer().done(function () {
                                        _this._currentSelectedItemTagName = value["TagName"];
                                        _this._refGraphNoDataElement.style.display = "none";
                                        _this.refGraphShow(true);
                                    });
                                    asyncEnd = true;
                                    MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_MasterNodeSelectionChangeStart);
                                }
                            });
                        }
                    });
                }
                else {
                    this.hideRefGraph();
                }
                if (!asyncEnd) {
                    MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_MasterNodeSelectionChangeStart);
                }
            };
            ManagedHeapGridViewer.prototype.selectedTagName = function () {
                return this._currentSelectedItemTagName;
            };
            ManagedHeapGridViewer.prototype.hideRefGraph = function () {
                Details.ManagedHeapViewer.instance.resetCurrentSelectedIndex();
                this.refGraphShow(false);
                this._refGraphNoDataElement.style.display = "block";
            };
            return ManagedHeapGridViewer;
        }(ManagedHeapGridViewerBase));
        Details.ManagedHeapGridViewer = ManagedHeapGridViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/control.ts" />
// <reference path="../../../Common/controls/TemplateControl.ts" />
// <reference path="../../../Common/Util/FormattingHelpers.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="../../../../../../common/script/DiagShared/JSTreeDynamicGridControl.redirect.d.ts" />
/// <reference path="../../../../../../common/script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="ManagedHeapViewer.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        var ManagedHeapRefGraphViewerBase = (function (_super) {
            __extends(ManagedHeapRefGraphViewerBase, _super);
            function ManagedHeapRefGraphViewerBase(root, dataArray, gridContextMenu, columns) {
                var options = new TreeGridCommon.Controls.DynamicGrid.DynamicGridViewerOptions(gridContextMenu, null, columns, null, null, true);
                options.gridName = Microsoft.Plugin.Resources.getString("ManagedRefHeapGridViewer_Name");
                options.overflowColumn = true;
                options.header = true;
                _super.call(this, dataArray, root, options, columns);
                this._initialized = false;
                // setup strings
                this._graphDomElement = root;
                this.showGraph(false);
                // Default sort on the last column that is not the "Module" column (so, second to last column)
                this.onSort([new TreeGridCommon.Controls.Grid.SortOrderInfo(columns[columns.length - 2].index, "desc")], []);
                this.currentSelectedIndex = -1;
            }
            Object.defineProperty(ManagedHeapRefGraphViewerBase.prototype, "waitingForUpdate", {
                get: function () {
                    return ((false === this._initialized) || this.IsWaitingForUpdate());
                },
                enumerable: true,
                configurable: true
            });
            ManagedHeapRefGraphViewerBase.prototype.layout = function () {
                _super.prototype.layout.call(this);
                if (!this.waitingForUpdate) {
                    Details.ManagedHeapViewer.instance.onGridReady();
                }
            };
            Object.defineProperty(ManagedHeapRefGraphViewerBase.prototype, "viewer", {
                /*protected*/ get: function () {
                    return Details.ManagedHeapViewer.instance;
                },
                enumerable: true,
                configurable: true
            });
            ManagedHeapRefGraphViewerBase.prototype.translateColumn = function (row, index) {
                var retval;
                if (!row) {
                    // data not ready
                    if (index === "Tag") {
                        retval = Microsoft.Plugin.Resources.getString("LoadRowDataText");
                    }
                }
                else {
                    retval = row && row[index] !== undefined ? row[index] : "";
                    if ((index === "RetainedCount" || index === "RefCount" || index === "RetainedSize" || index === "Count" || index === "TotalSize")
                        && retval !== "") {
                        retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, false);
                    }
                    if (index.search("Diff") !== -1) {
                        if (row["RetainedCount"] !== undefined || row["RefCount"] !== undefined) {
                            retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, true);
                        }
                        else
                            retval = "";
                    }
                }
                return retval;
            };
            ManagedHeapRefGraphViewerBase.prototype.translateExternalPathColumn = function (treePath, index) {
                return index === "Tag" ?
                    Microsoft.Plugin.Resources.getString("GridTrimLimit").replace("{0}", (this.getFirstLevelCount() - treePath.path[0]).toString()) :
                    "";
            };
            ManagedHeapRefGraphViewerBase.prototype.showGraph = function (show) {
                if (show) {
                    this._graphDomElement.style.display = "block";
                    Details.ManagedHeapViewer.instance.detailsViewModel.isManagedHeapViewerRefGraphVisible = true;
                    this.initializeDataSource(); // refresh grid selection and scroll position 
                    this.scheduleUpdate();
                    this._initialized = true;
                }
                else {
                    this._graphDomElement.style.display = "none";
                    Details.ManagedHeapViewer.instance.detailsViewModel.isManagedHeapViewerRefGraphVisible = false;
                }
            };
            ManagedHeapRefGraphViewerBase.prototype.expandRoot = function () {
                this.expandNode(new TreeGridCommon.Controls.DynamicGrid.TreePath([0]));
            };
            ManagedHeapRefGraphViewerBase.prototype._trySorting = function (sortOrder, sortColumns) {
                var _this = this;
                this._sortOrderIndex = sortOrder[0].index;
                this._sortOrderOrder = sortOrder[0].order;
                this.refreshSortingOrder(function () {
                    _this.refresh();
                    _this.expandRoot();
                });
            };
            // inform backend with the current sorting order
            ManagedHeapRefGraphViewerBase.prototype.refreshSortingOrder = function (next) {
                if (next === void 0) { next = function () { }; }
            };
            /* protected */ ManagedHeapRefGraphViewerBase.prototype.onSelectRow = function (rowIndex) {
                this.redrawSelectionChangeRows(rowIndex);
                this.currentSelectedIndex = rowIndex;
                // Cache this grid instance for context menu drawing
                Details.ManagedHeapGridViewerBase.selectedGrid = this;
            };
            return ManagedHeapRefGraphViewerBase;
        }(Details.ManagedHeapGridViewerBase));
        Details.ManagedHeapRefGraphViewerBase = ManagedHeapRefGraphViewerBase;
        var ManagedHeapTypeRefGraphViewer = (function (_super) {
            __extends(ManagedHeapTypeRefGraphViewer, _super);
            function ManagedHeapTypeRefGraphViewer(root, dataArray, gridContextMenu, columns) {
                _super.call(this, root, dataArray, gridContextMenu, columns);
            }
            // inform backend with the current sorting order
            ManagedHeapTypeRefGraphViewer.prototype.refreshSortingOrder = function (next) {
                if (next === void 0) { next = function () { }; }
                this.adaptor()._call("TypeRefGraphSetSortOrder", this._sortOrderIndex, this._sortOrderOrder).done(function () {
                    next();
                });
            };
            return ManagedHeapTypeRefGraphViewer;
        }(ManagedHeapRefGraphViewerBase));
        Details.ManagedHeapTypeRefGraphViewer = ManagedHeapTypeRefGraphViewer;
        var ManagedHeapObjectRefGraphViewer = (function (_super) {
            __extends(ManagedHeapObjectRefGraphViewer, _super);
            function ManagedHeapObjectRefGraphViewer(root, dataArray, gridContextMenu, columns, direction) {
                _super.call(this, root, dataArray, gridContextMenu, columns);
                this._graphDirection = direction;
                this._refCellColumnRightMargin = 4;
                this._refCellIndentLevelWidth = 16;
                this._refCellIndentLeftMargin = -13;
            }
            // Override
            /* protected */ ManagedHeapObjectRefGraphViewer.prototype._drawHeapGridCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                if (this._graphDirection === Details.RefGraphDirection.Backward) {
                    return this._drawRefCell(rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder);
                }
                return _super.prototype._drawHeapGridCell.call(this, rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder);
            };
            // --- Modified _drawCell method from gridControl.ts
            // This is to create the cell with the new CSS class grid-cell-ref which shows the cell overflow.
            ManagedHeapObjectRefGraphViewer.prototype._drawRefCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                // New CSS class to allow overflow
                var cellElement = this.createElementWithClass("div", "grid-cell-ref");
                cellElement.style.width = (column.width) + "px";
                var value = this.getColumnText(dataIndex, column, columnOrder);
                // Set the tooltip. No tooltip in case it is HTML as it can be set from the HTML itself
                TreeGridCommon.Controls.Grid.GridControl._setTooltip(cellElement, column.hasHTMLContent ? "" : value, Details.ManagedHeapGridViewerBase.RefCellTooltipHeight);
                if (value) {
                    cellElement.innerText = value;
                }
                else {
                    // add non-breaking whitespace to ensure the cell has the same height as non-empty cells
                    cellElement.innerHTML = "&nbsp;";
                }
                if (columnOrder === indentIndex && level > 0) {
                    var indent = ((level * this._refCellIndentLevelWidth) + this._refCellIndentLeftMargin);
                    column.indentOffset = indent;
                    if (expandedState !== 0) {
                        var treeSign = this.createElementWithClass("div", "icon grid-tree-icon");
                        treeSign.style.left = indent + "px";
                        cellElement.appendChild(treeSign);
                        if (expandedState > 0) {
                            treeSign.classList.add("icon-tree-expanded");
                        }
                        else {
                            treeSign.classList.add("icon-tree-collapsed");
                        }
                    }
                    cellElement.style.textIndent = (level * this._refCellIndentLevelWidth) + "px";
                }
                // Using cloned code from ManagedHeapViewer.gridCellCssClass as this method doesn't call super._drawCell()
                if (Details.ManagedHeapViewer.viewSourceAvailable) {
                    if (Details.ManagedHeapViewer.viewSourceSelected) {
                        cellElement.classList.add("grid-cell-source-selected-blurred");
                    }
                    else {
                        cellElement.classList.add("grid-cell-source");
                    }
                }
                return cellElement;
            };
            ManagedHeapObjectRefGraphViewer.prototype.formatTypeName = function (typeName) {
                if (!typeName) {
                    return "";
                }
                // In case tag is an object ref, remove instance information
                var splitName = typeName.split('@');
                return splitName[0].trim();
            };
            // inform backend with the current sorting order
            ManagedHeapObjectRefGraphViewer.prototype.refreshSortingOrder = function (next) {
                if (next === void 0) { next = function () { }; }
                this.adaptor()._call("ForwardRefGraphSetSortOrder", this._sortOrderIndex, this._sortOrderOrder).done(function () {
                    next();
                });
            };
            return ManagedHeapObjectRefGraphViewer;
        }(ManagedHeapRefGraphViewerBase));
        Details.ManagedHeapObjectRefGraphViewer = ManagedHeapObjectRefGraphViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/control.ts" />
// <reference path="../../../Common/controls/ComponentModel.ts" />
// <reference path="../../../Common/controls/TemplateControl.ts" />
// <reference path="../../../Common/Util/FormattingHelpers.ts" />
// <reference path="../../../common/Profiler/MemoryProfilerViewHost.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="../../../../../../common/script/DiagShared/JSTreeDynamicGridControl.redirect.d.ts" />
/// <reference path="../../../../../../common/script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="../DetailsView.ts" />
/// <reference path="ManagedHeapGridViewer.ts" />
/// <reference path="ManagedHeapRefGridViewer.ts"/>
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        (function (RefGraphDirection) {
            RefGraphDirection[RefGraphDirection["Forward"] = 0] = "Forward";
            RefGraphDirection[RefGraphDirection["Backward"] = 1] = "Backward"; // types/objects "references to"
        })(Details.RefGraphDirection || (Details.RefGraphDirection = {}));
        var RefGraphDirection = Details.RefGraphDirection;
        ;
        (function (RefGraphTarget) {
            RefGraphTarget[RefGraphTarget["Types"] = 0] = "Types";
            RefGraphTarget[RefGraphTarget["Objects"] = 1] = "Objects";
        })(Details.RefGraphTarget || (Details.RefGraphTarget = {}));
        var RefGraphTarget = Details.RefGraphTarget;
        ;
        var ManagedHeapViewer = (function (_super) {
            __extends(ManagedHeapViewer, _super);
            function ManagedHeapViewer(viewModel) {
                var _this = this;
                _super.call(this, "ManagedHeapTemplate");
                // fields for switch graph direction support
                this._typeRefsViewerCache = [null, null]; // two directions of the type references graph viewer
                this._objectRefsViewerCache = [null, null]; // two directions of the object references graph viewer
                this.rightAlignedColumnHeaderCss = "rightAlignedColumnHeader";
                this._columnInfoSortLabels = new TreeGridCommon.Controls.Grid.ColumnInfoSortLabels(Microsoft.Plugin.Resources.getString("SortedAscending"), Microsoft.Plugin.Resources.getString("SortedDescending"));
                this._logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
                this._isFirstJmc = true;
                this._openedInDetailsTab = false;
                ManagedHeapViewer.instance = this;
                this._detailsViewModel = viewModel;
                this._detailsViewModel.registerPropertyChanged(this);
                // Initialize the adaptor
                this._adaptor = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("MemoryProfiler.ManagedHeapAnalyzer", {}, true);
                this._refGraphDirection = RefGraphDirection.Backward;
                this._refGraphTarget = RefGraphTarget.Types;
                this._adaptor._call("ChangeGraphDirection", this._refGraphDirection);
                this.updateRefGraphDirectionUIElements(false);
                this._justMyCode = this._detailsViewModel.justMyCodeManaged;
                this._collapseSmallObjects = this._detailsViewModel.collapseSmallObjects;
                var NUMERIC_COLUMN_WIDTH = 150;
                var TAG_COLUMN_WIDTH = 500;
                var MODULE_COLUMN_WIDTH = 200;
                // Default columns
                this._typeColumns = [
                    new TreeGridCommon.Controls.Grid.ColumnInfo("TagName", Microsoft.Plugin.Resources.getString("Type"), Microsoft.Plugin.Resources.getString("TypeTooltip"), TAG_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, ManagedHeapViewer.gridCellCssClass),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Count", Microsoft.Plugin.Resources.getString("Count"), Microsoft.Plugin.Resources.getString("CountTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSize", Microsoft.Plugin.Resources.getString("Size"), Microsoft.Plugin.Resources.getString("SizeTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedSize", Microsoft.Plugin.Resources.getString("RetainedSize"), Microsoft.Plugin.Resources.getString("RetainedSizeTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc")
                ];
                this._typeColumns[1].headerCss = this.rightAlignedColumnHeaderCss;
                this._typeColumns[2].headerCss = this.rightAlignedColumnHeaderCss;
                this._typeColumns[3].headerCss = this.rightAlignedColumnHeaderCss;
                this._typeBackwardRefGraphColumns = [
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Tag", Microsoft.Plugin.Resources.getString("Type"), Microsoft.Plugin.Resources.getString("TypeTooltip"), TAG_COLUMN_WIDTH, /*canSortBy*/ false, null, null, ManagedHeapViewer.gridCellCssClass),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedCount", Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountColumn"), Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountColumnTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc")
                ];
                this._typeBackwardRefGraphColumns[1].headerCss = this.rightAlignedColumnHeaderCss;
                this._objectBackwardGraphColumns = [
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Tag", Microsoft.Plugin.Resources.getString("Instance"), Microsoft.Plugin.Resources.getString("InstanceTooltip"), 3 * TAG_COLUMN_WIDTH, /*canSortBy*/ false, null),
                ];
                var typeTagColumnInfo = new TreeGridCommon.Controls.Grid.ColumnInfo("Tag", Microsoft.Plugin.Resources.getString("Type"), Microsoft.Plugin.Resources.getString("TypeTooltip"), TAG_COLUMN_WIDTH, /*canSortBy*/ false, null, null, ManagedHeapViewer.gridCellCssClass);
                typeTagColumnInfo.getHeaderCellContents = function () { return _this.drawForwardReferenceGraphHeaderCell("Type"); };
                this._typeForwardRefGraphColumns = [
                    typeTagColumnInfo,
                    new TreeGridCommon.Controls.Grid.ColumnInfo("RefCount", Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountColumn"), Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountColumnTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSize", Microsoft.Plugin.Resources.getString("Size"), Microsoft.Plugin.Resources.getString("SizeTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedSize", Microsoft.Plugin.Resources.getString("RetainedSize"), Microsoft.Plugin.Resources.getString("RetainedSizeTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc")
                ];
                this._typeForwardRefGraphColumns[1].headerCss = this.rightAlignedColumnHeaderCss;
                this._typeForwardRefGraphColumns[2].headerCss = this.rightAlignedColumnHeaderCss;
                this._typeForwardRefGraphColumns[3].headerCss = this.rightAlignedColumnHeaderCss;
                var objectTagColumnInfo = new TreeGridCommon.Controls.Grid.ColumnInfo("Tag", Microsoft.Plugin.Resources.getString("Instance"), Microsoft.Plugin.Resources.getString("InstanceTooltip"), TAG_COLUMN_WIDTH, /*canSortBy*/ false, null, null, ManagedHeapViewer.gridCellCssClass);
                objectTagColumnInfo.getHeaderCellContents = function () { return _this.drawForwardReferenceGraphHeaderCell("Instance"); };
                this._objectForwardGraphColumns = [
                    objectTagColumnInfo,
                    new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSize", Microsoft.Plugin.Resources.getString("Size"), Microsoft.Plugin.Resources.getString("SizeTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedSize", Microsoft.Plugin.Resources.getString("RetainedSize"), Microsoft.Plugin.Resources.getString("RetainedSizeTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc")
                ];
                this._objectForwardGraphColumns[1].headerCss = this.rightAlignedColumnHeaderCss;
                this._objectForwardGraphColumns[2].headerCss = this.rightAlignedColumnHeaderCss;
                // Modify leftmost cell tooltip behavior - show them always. This is necessary for viewsource tooltips.
                this._typeColumns[0].alwaysEnableTooltip = true;
                this._typeBackwardRefGraphColumns[0].alwaysEnableTooltip = true;
                this._objectBackwardGraphColumns[0].alwaysEnableTooltip = true;
                this._typeForwardRefGraphColumns[0].alwaysEnableTooltip = true;
                this._objectForwardGraphColumns[0].alwaysEnableTooltip = true;
                this._adaptor._call("IsDiffView").done(function (result) {
                    if (result) {
                        var COUNT_DIFF_COLUMN_INDEX = 2;
                        var TOTALSIZE_DIFF_COLUMN_INDEX = 4;
                        var RETAINEDSIZE_DIFF_COLUMN_INDEX = 6;
                        _this._typeColumns.splice(COUNT_DIFF_COLUMN_INDEX, 0, new TreeGridCommon.Controls.Grid.ColumnInfo("CountDiff", Microsoft.Plugin.Resources.getString("CountDiff"), Microsoft.Plugin.Resources.getString("CountDiffTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeColumns.splice(TOTALSIZE_DIFF_COLUMN_INDEX, 0, new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSizeDiff", Microsoft.Plugin.Resources.getString("TotalSizeDiff"), Microsoft.Plugin.Resources.getString("TotalSizeDiffTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeColumns.splice(RETAINEDSIZE_DIFF_COLUMN_INDEX, 0, new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedSizeDiff", Microsoft.Plugin.Resources.getString("RetainedSizeDiff"), Microsoft.Plugin.Resources.getString("RetainedSizeDiffTooltip"), /*wider to fit header text*/ NUMERIC_COLUMN_WIDTH + 11, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeColumns[COUNT_DIFF_COLUMN_INDEX].headerCss = _this.rightAlignedColumnHeaderCss;
                        _this._typeColumns[TOTALSIZE_DIFF_COLUMN_INDEX].headerCss = _this.rightAlignedColumnHeaderCss;
                        _this._typeColumns[RETAINEDSIZE_DIFF_COLUMN_INDEX].headerCss = _this.rightAlignedColumnHeaderCss;
                        // backward types reference graph 
                        _this._typeBackwardRefGraphColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedCountDiff", Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountDiffColumn"), Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountDiffColumnTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeBackwardRefGraphColumns[_this._typeBackwardRefGraphColumns.length - 1].headerCss = _this.rightAlignedColumnHeaderCss;
                        // forward types reference graph 
                        _this._typeForwardRefGraphColumns.splice(COUNT_DIFF_COLUMN_INDEX, 0, new TreeGridCommon.Controls.Grid.ColumnInfo("RefCountDiff", Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountDiffColumn"), Microsoft.Plugin.Resources.getString("TypeRefGraphRetainedCountDiffColumnTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeForwardRefGraphColumns.splice(TOTALSIZE_DIFF_COLUMN_INDEX, 0, new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSizeDiff", Microsoft.Plugin.Resources.getString("TotalSizeDiff"), Microsoft.Plugin.Resources.getString("TotalSizeDiffTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeForwardRefGraphColumns.splice(RETAINEDSIZE_DIFF_COLUMN_INDEX, 0, new TreeGridCommon.Controls.Grid.ColumnInfo("RetainedSizeDiff", Microsoft.Plugin.Resources.getString("RetainedSizeDiff"), Microsoft.Plugin.Resources.getString("RetainedSizeDiffTooltip"), NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, _this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        _this._typeForwardRefGraphColumns[COUNT_DIFF_COLUMN_INDEX].headerCss = _this.rightAlignedColumnHeaderCss;
                        _this._typeForwardRefGraphColumns[TOTALSIZE_DIFF_COLUMN_INDEX].headerCss = _this.rightAlignedColumnHeaderCss;
                        _this._typeForwardRefGraphColumns[RETAINEDSIZE_DIFF_COLUMN_INDEX].headerCss = _this.rightAlignedColumnHeaderCss;
                    }
                    var allColumns = [_this._typeBackwardRefGraphColumns, _this._typeForwardRefGraphColumns, _this._objectBackwardGraphColumns, _this._objectForwardGraphColumns, _this._typeColumns];
                    allColumns.forEach(function (columns) {
                        var canSortBy = columns === _this._typeColumns;
                        columns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("Module", Microsoft.Plugin.Resources.getString("Module"), Microsoft.Plugin.Resources.getString("ModuleTooltip"), MODULE_COLUMN_WIDTH, /*canSortBy*/ canSortBy, null, ManagedHeapViewer.gridCellCssClass));
                    });
                });
                this.initializeContextMenus();
                this.initializeUIElementsAsync();
            }
            ManagedHeapViewer.prototype.onGridReady = function () {
                if (this._typesViewer) {
                    this._logger.debug("ManagedHeapViewer.onGridReady: _typesViewer.waitingForUpdate: " + this._typesViewer.waitingForUpdate);
                }
                if (this.refsViewer) {
                    this._logger.debug("ManagedHeapViewer.onGridReady: refsViewer.waitingForUpdate: " + this.refsViewer.waitingForUpdate);
                }
                if (this._typesViewer && !this._typesViewer.waitingForUpdate) {
                    if (this.refsViewer && this.refsViewer.waitingForUpdate === false) {
                        this._logger.debug("ManagedHeapViewer.onGridReady: _detailsViewModel.detailsViewReady = true");
                        this._detailsViewModel.detailsViewReady = true;
                    }
                }
            };
            Object.defineProperty(ManagedHeapViewer.prototype, "typeRefsViewer", {
                get: function () {
                    return this._typeRefsViewer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapViewer.prototype, "refsViewer", {
                get: function () {
                    if (this._refGraphTarget == RefGraphTarget.Types) {
                        return this._typeRefsViewer;
                    }
                    else if (this._refGraphTarget == RefGraphTarget.Objects) {
                        return this._objectRefsViewer;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapViewer.prototype, "detailsViewModel", {
                get: function () {
                    return this._detailsViewModel;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapViewer.prototype, "masterGridViewer", {
                get: function () {
                    return this._typesViewer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapViewer.prototype, "refGraphTarget", {
                get: function () {
                    return this._refGraphTarget;
                },
                set: function (v) {
                    this._refGraphTarget = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapViewer.prototype, "refGraphDirection", {
                get: function () {
                    return this._refGraphDirection;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ManagedHeapViewer.prototype, "refGraphViewersCache", {
                get: function () {
                    if (this._refGraphTarget == RefGraphTarget.Types) {
                        return this._typeRefsViewerCache;
                    }
                    else if (this._refGraphTarget == RefGraphTarget.Objects) {
                        return this._objectRefsViewerCache;
                    }
                },
                enumerable: true,
                configurable: true
            });
            ManagedHeapViewer.navigateToSource = function (menuId, menuItem, targetId) {
                var selectedGrid = Details.ManagedHeapGridViewerBase.getSelectedGrid();
                if (!selectedGrid) {
                    alert(Microsoft.Plugin.Resources.getString("ContextMenuViewSourceError"));
                    return;
                }
                selectedGrid.navigateToSelectedRowSource();
            };
            ManagedHeapViewer.gridCellCssClass = function (dataIndex, columnIndex, columnOrder, dataSource) {
                if (ManagedHeapViewer.viewSourceAvailable) {
                    if (ManagedHeapViewer.viewSourceSelected) {
                        return "grid-cell-source-selected-blurred";
                    }
                    else {
                        return "grid-cell-source";
                    }
                }
                else {
                    return ""; // No additional style to add for cell without source
                }
            };
            ManagedHeapViewer.prototype.toggleJustMyCodeAsync = function () {
                var _this = this;
                if (this._isFirstJmc) {
                    this._isFirstJmc = false;
                    MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueColdEnd);
                }
                else {
                    MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueWarmEnd);
                }
                this._justMyCode = !this._justMyCode;
                this.updateNotificationBar();
                this._adaptor._call("ApplyViewFilter", this._justMyCode, this._collapseSmallObjects).then(function () {
                    return MemoryProfiler.Common.MemoryProfilerViewHost.session.updateDetailsViewSetting("justMyCodeManaged", _this._justMyCode);
                }).done(function () {
                    _this._typesViewer.resetView();
                    MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarkers(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueWarmStart);
                });
            };
            ManagedHeapViewer.prototype.toggleCollapseSmallObjectsAsync = function () {
                var _this = this;
                this._collapseSmallObjects = !this._collapseSmallObjects;
                this.updateNotificationBar();
                this._adaptor._call("ApplyViewFilter", this._justMyCode, this._collapseSmallObjects).then(function () {
                    return MemoryProfiler.Common.MemoryProfilerViewHost.session.updateDetailsViewSetting("collapseSmallObjects", _this._collapseSmallObjects);
                }).done(function () {
                    _this._typesViewer.resetView();
                });
            };
            ManagedHeapViewer.prototype.updateNotificationBar = function () {
                if (this._justMyCode || this._collapseSmallObjects) {
                    this._notificationBar.style.display = "block";
                    var activeSettingName = "";
                    if (this._justMyCode) {
                        activeSettingName = Microsoft.Plugin.Resources.getString("NotificationBarJMCEnabled");
                    }
                    if (this._collapseSmallObjects) {
                        if (this._justMyCode) {
                            activeSettingName = activeSettingName.concat(", ");
                        }
                        activeSettingName = activeSettingName.concat(Microsoft.Plugin.Resources.getString("NotificationBarCollapseSmallObjectsEnabled"));
                    }
                    this._notificationBarMessage.innerText = Microsoft.Plugin.Resources.getString("NotificationBarMessage").replace("{0}", activeSettingName);
                }
                else {
                    this._notificationBar.style.display = "none";
                }
            };
            ManagedHeapViewer.prototype.initializeContextMenus = function () {
                this._gridContextMenuOptions = new Array();
                // We need 3 context menus for each of the grids - Types View, Instance ref graph and type ref graph.
                for (var i = 0; i < 3; i++) {
                    // Initialize Context Menu fields
                    var menuItems = new Array();
                    menuItems[0] = {
                        id: "managedHeapCopyMenuItem" + i,
                        callback: Details.HeapGridViewer.copySelectedRowsToClipboard,
                        label: Microsoft.Plugin.Resources.getString("ContextMenuCopy"),
                        type: Microsoft.Plugin.ContextMenu.MenuItemType.command,
                        iconEnabled: null,
                        iconDisabled: null,
                        accessKey: "Ctrl+C",
                        hidden: function () { return false; },
                        disabled: function () { return false; },
                        checked: function () { return false; },
                        cssClass: null,
                        submenu: null
                    };
                    menuItems[1] = {
                        id: "managedHeapGoToSourceMenuItem" + i,
                        callback: ManagedHeapViewer.navigateToSource,
                        label: Microsoft.Plugin.Resources.getString("ContextMenuViewSource"),
                        type: Microsoft.Plugin.ContextMenu.MenuItemType.command,
                        iconEnabled: null,
                        iconDisabled: null,
                        accessKey: "F12",
                        hidden: function () { return false; },
                        disabled: ManagedHeapViewer.viewSourceMenuItemDisabled,
                        checked: function () { return false; },
                        cssClass: null,
                        submenu: null
                    };
                    this._gridContextMenuOptions[i] = menuItems;
                }
            };
            ManagedHeapViewer.viewSourceMenuItemDisabled = function () {
                var selectedGrid = Details.ManagedHeapGridViewerBase.getSelectedGrid();
                if (!selectedGrid || !selectedGrid.selectedRowHasSource()) {
                    return true;
                }
            };
            ManagedHeapViewer.prototype.initializeUIElementsAsync = function () {
                var _this = this;
                this._notificationBar = this.findElement("notificationBar");
                this._notificationBarMessage = this.findElement("notificationBarMessage");
                this._viewOverlay = this.findElement("heapViewOverlay");
                this._progressBar = this.findElement("progressBar");
                this._adaptor._call("GetSnapshotId").done(function (result) {
                    _this._snapshotId = result;
                });
            };
            ManagedHeapViewer.prototype.updateSortProperty = function () {
                if (this.masterGridViewer) {
                    this.masterGridViewer.updateSort();
                }
            };
            ManagedHeapViewer.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case "managedFilterString":
                        this._typesViewer.setFilterAsync(this._detailsViewModel.managedFilterString);
                        break;
                    case "justMyCodeManaged":
                        this.toggleJustMyCodeAsync();
                        break;
                    case "collapseSmallObjects":
                        this.toggleCollapseSmallObjectsAsync();
                        break;
                    case "targetView":
                        if (this.detailsViewModel.targetView === Details.DetailsViewType.managedHeap) {
                            if (!this._openedInDetailsTab) {
                                this._openedInDetailsTab = true;
                                this.refreshUIAsync();
                            }
                            else {
                                this.masterGridViewer.layout();
                            }
                        }
                        break;
                    case "sortPropertyManaged":
                        this.updateSortProperty();
                        break;
                }
            };
            ManagedHeapViewer.prototype.drawForwardReferenceGraphHeaderCell = function (columnTitleResourceName) {
                var cellElement = document.createElement("div");
                cellElement.classList.add("title");
                if (this._justMyCode || this._collapseSmallObjects) {
                    var infoIconHtml = "<span title='{0}' class='icon-information'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>"; // image is background, needs foreground to render
                    infoIconHtml = infoIconHtml.replace("{0}", Microsoft.Plugin.Resources.getString("ReferencesViewNoViewMessage"));
                    cellElement.innerHTML = Microsoft.Plugin.Resources.getString(columnTitleResourceName) + infoIconHtml;
                }
                else {
                    cellElement.innerText = Microsoft.Plugin.Resources.getString(columnTitleResourceName);
                }
                return cellElement;
            };
            ManagedHeapViewer.prototype.refreshUIAsync = function () {
                var _this = this;
                if (this._typesViewer) {
                    this._typesViewer = null;
                }
                if (this._splitter) {
                    this._splitter = null;
                }
                var div = this.findElement("ManagedHeapTypesViewerContainer");
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
                if (this._typesDataSource) {
                    this._typesDataSource.flushCache();
                    this._typesDataSource = null;
                }
                this._typesDataSource = new TreeGridCommon.Controls.DynamicGrid.ProxyArray(this._adaptor, "TypeSummaries", ManagedHeapViewer.ProxyArrayCacheSize);
                this._adaptor._call("ApplyViewFilter", this._justMyCode, this._collapseSmallObjects).done(function (result) {
                    _this.setRefGraphDirectionAsync(_this._refGraphDirection, _this._refGraphTarget).done(function () {
                        _this._typesDataSource.init(function () {
                            // types viewer grid
                            _this._typesViewer = new Details.ManagedHeapGridViewer(_this.findElement("ManagedHeapTypesViewerContainer"), _this, _this._typesDataSource, _this._gridContextMenuOptions[2], _this._typeColumns, function (showTypeRefGraph) {
                                if (showTypeRefGraph) {
                                    _this.refsViewer.refresh();
                                    _this.refsViewer.expandRoot();
                                    _this.updateRefGraphDirectionUIElements(true);
                                }
                                _this.refsViewer.showGraph(showTypeRefGraph);
                            });
                            _this.updateNotificationBar();
                            _this._splitter = new TreeGridCommon.Controls.GridSplitterControl(_this.findElement("snapshotViewGridSplitter"), null, function () {
                                _this._typesViewer.scheduleUpdate();
                                _this.refsViewer.scheduleUpdate();
                            });
                        });
                    });
                });
            };
            ManagedHeapViewer.prototype.setRefGraphDirectionAsync = function (direction, target) {
                var _this = this;
                return new Microsoft.Plugin.Promise(function (completed) {
                    var directionChange = false;
                    var targetChange = false;
                    var refViewerGetter;
                    _this._refGraphDirection = direction;
                    _this._refGraphTarget = target;
                    _this._adaptor._call("ChangeGraphDirection", _this._refGraphDirection).done(function () {
                        if (_this._refGraphTarget === RefGraphTarget.Types) {
                            refViewerGetter = _this.getTypeRefViewer.bind(_this);
                        }
                        else {
                            refViewerGetter = _this.getObjectRefViewer.bind(_this);
                        }
                        // clear NoData dom element
                        var div = _this.findElement("ManagedHeapViewerRefGraphNoData");
                        div.style.display = "none";
                        refViewerGetter().done(function (cachedGraphDirectionSwitch) {
                            if (cachedGraphDirectionSwitch) {
                                // update UI
                                _this.updateRefGraphDirectionUIElements(true);
                                _this.refsViewer.refreshSortingOrder(function () {
                                    if (_this._typesViewer && _this._currentSelectedIndexBeforeSwitchingGraphDirection !== _this._typesViewer.getSelectedRowIndex()) {
                                        // the current row has changed - activate the new one
                                        _this._typesViewer.activateRow(_this._typesViewer.getSelectedRowIndex());
                                    }
                                    else {
                                        // the row hasn't changed - just refresh
                                        _this.refsViewer.scheduleUpdate();
                                    }
                                    if (_this._typesViewer) {
                                        _this._currentSelectedIndexBeforeSwitchingGraphDirection = _this._typesViewer.getSelectedRowIndex();
                                    }
                                });
                            }
                            else {
                                _this._currentSelectedIndexBeforeSwitchingGraphDirection = _this._typesViewer ? _this._typesViewer.getSelectedRowIndex() : -1;
                            }
                        });
                        completed();
                    });
                });
            };
            ManagedHeapViewer.prototype.getTypeRefViewer = function () {
                var _this = this;
                return new Microsoft.Plugin.Promise(function (completed) {
                    // look for the dom elements
                    var refGraphDom = _this.findElement(_this._refGraphDirection === RefGraphDirection.Forward ?
                        "ManagedHeapViewerForwardTypeRefGraphContainer" : "ManagedHeapViewerBackwardTypeRefGraphContainer");
                    var oppositeRefGraphDom = _this.findElement(_this._refGraphDirection === RefGraphDirection.Backward ?
                        "ManagedHeapViewerForwardTypeRefGraphContainer" : "ManagedHeapViewerBackwardTypeRefGraphContainer");
                    // make the current dom elements visible
                    refGraphDom.style.display = "block";
                    // hide the opposite dom elements
                    oppositeRefGraphDom.style.display = "none";
                    if (_this._objectRefsViewer) {
                        _this._objectRefsViewer.showGraph(false);
                    }
                    if (_this._typeRefsViewerCache[_this._refGraphDirection]) {
                        _this._typeRefsViewer = _this._typeRefsViewerCache[_this._refGraphDirection];
                        completed(Microsoft.Plugin.Promise.wrap(true));
                    }
                    else {
                        var typeRefGraphDataArray = new TreeGridCommon.Controls.DynamicGrid.ProxyArray(_this._adaptor, _this.getTypeRefGraphDataSource(), ManagedHeapViewer.ProxyArrayCacheSize);
                        typeRefGraphDataArray.init(function () {
                            _this._typeRefsViewerCache[_this._refGraphDirection] = _this._typeRefsViewer = new Details.ManagedHeapTypeRefGraphViewer(refGraphDom, typeRefGraphDataArray, _this._gridContextMenuOptions[1], _this.getTypeRefGraphColumns());
                            // update reference view
                            _this._typeRefsViewer.showGraph(true);
                            if (_this._typesViewer) {
                                var selectedIndex = _this._typesViewer.getSelectedRowIndex();
                                if (selectedIndex >= 0) {
                                    _this._typesViewer.activateRow(selectedIndex);
                                }
                            }
                            completed(Microsoft.Plugin.Promise.wrap(false));
                        });
                    }
                });
            };
            ManagedHeapViewer.prototype.getObjectRefViewer = function () {
                var _this = this;
                return new Microsoft.Plugin.Promise(function (completed) {
                    var refGraphDom = _this.findElement(_this._refGraphDirection === RefGraphDirection.Forward ?
                        "ManagedHeapViewerForwardObjectRefGraphContainer" : "ManagedHeapViewerBackwardObjectRefGraphContainer");
                    var oppositeRefGraphDom = _this.findElement(_this._refGraphDirection === RefGraphDirection.Backward ?
                        "ManagedHeapViewerForwardObjectRefGraphContainer" : "ManagedHeapViewerBackwardObjectRefGraphContainer");
                    // make the current dom elements visible
                    refGraphDom.style.display = "block";
                    // hide the opposite dom elemens
                    oppositeRefGraphDom.style.display = "none";
                    _this._typeRefsViewer.showGraph(false);
                    if (_this._objectRefsViewerCache[_this.refGraphDirection]) {
                        _this._objectRefsViewer = _this._objectRefsViewerCache[_this.refGraphDirection];
                        completed(Microsoft.Plugin.Promise.wrap(true));
                    }
                    else {
                        var objectRefGraphDataArray = new TreeGridCommon.Controls.DynamicGrid.ProxyArray(_this._adaptor, _this.getObjectRefGraphDataSource(), ManagedHeapViewer.ProxyArrayCacheSize);
                        objectRefGraphDataArray.init(function () {
                            _this._objectRefsViewerCache[_this._refGraphDirection] = _this._objectRefsViewer = new Details.ManagedHeapObjectRefGraphViewer(refGraphDom, objectRefGraphDataArray, _this._gridContextMenuOptions[0], _this.getObjectRefGraphColumns(), _this._refGraphDirection);
                            if (_this._typesViewer) {
                                var selectedIndex = _this._typesViewer.getSelectedRowIndex();
                                // check if the master grid selected row is an instance. Instances fall Tree second level 
                                // therefore their TreePaths are of the form [X,Y]
                                if (_this._typesViewer.findPathByRow(selectedIndex).length() === 2) {
                                    _this._typesViewer.activateRow(selectedIndex);
                                }
                            }
                            completed(Microsoft.Plugin.Promise.wrap(false));
                        });
                    }
                });
            };
            ManagedHeapViewer.prototype.resetCurrentSelectedIndex = function () {
                this._currentSelectedIndexBeforeSwitchingGraphDirection = -1;
                this.updateRefGraphDirectionUIElements(false);
            };
            ManagedHeapViewer.prototype.updateRefGraphDirectionUIElements = function (showTabs) {
                var _this = this;
                var refGraphHeader = this.findElement("RefGraphHeader");
                var referencingGraph = this.findElement("ReferencingGraph");
                var referencedGraph = this.findElement("ReferencedGraph");
                if (!showTabs) {
                    // hide the tabs
                    refGraphHeader.style.display = referencedGraph.style.display = "none";
                }
                else {
                    refGraphHeader.style.display = referencedGraph.style.display = "block";
                    referencingGraph.text = Microsoft.Plugin.Resources.getString("ReferencingGraph");
                    if (this._refGraphTarget === RefGraphTarget.Types) {
                        referencedGraph.text = Microsoft.Plugin.Resources.getString("ReferencedGraphLabelTypesView");
                        referencedGraph.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("ReferencedGraphLabelTypesViewTooltip"));
                        referencingGraph.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("PathsToRootLabelTypesViewTooltip"));
                    }
                    else {
                        referencedGraph.text = Microsoft.Plugin.Resources.getString("ReferencedGraphLabelObjectView");
                        referencedGraph.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("ReferencedGraphLabelObjectViewTooltip"));
                        referencingGraph.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("PathsToRootLabelObjectViewTooltip"));
                    }
                    // setup tabs onclick handlers and styles
                    var isBackward = this._refGraphDirection === RefGraphDirection.Backward;
                    if (isBackward) {
                        referencingGraph.className = "disabled";
                        referencedGraph.className = "enabled";
                        referencingGraph.onclick = undefined;
                        referencedGraph.onclick = function (e) {
                            _this.setRefGraphDirectionAsync(RefGraphDirection.Forward, _this._refGraphTarget);
                            if (_this._refGraphTarget === RefGraphTarget.Types) {
                                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.ViewReferencedTypes, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, MemoryProfiler.Common.FeedbackCommandSourceNames.ManagedHeapView);
                            }
                            else {
                                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.ViewReferencedObjects, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, MemoryProfiler.Common.FeedbackCommandSourceNames.ManagedHeapView);
                            }
                        };
                    }
                    else {
                        referencingGraph.className = "enabled";
                        referencedGraph.className = "disabled";
                        referencedGraph.onclick = undefined;
                        referencingGraph.onclick = function (e) {
                            _this.setRefGraphDirectionAsync(RefGraphDirection.Backward, _this._refGraphTarget);
                            MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.ViewPathsToRoot, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, MemoryProfiler.Common.FeedbackCommandSourceNames.ManagedHeapView);
                        };
                    }
                    referencingGraph.setAttribute("aria-selected", isBackward ? "true" : "false");
                    referencedGraph.setAttribute("aria-selected", isBackward ? "false" : "true");
                }
            };
            ManagedHeapViewer.prototype.getTypeRefGraphColumns = function () {
                return this._refGraphDirection === RefGraphDirection.Forward ?
                    this._typeForwardRefGraphColumns :
                    this._typeBackwardRefGraphColumns;
            };
            ManagedHeapViewer.prototype.getObjectRefGraphColumns = function () {
                return this._refGraphDirection === RefGraphDirection.Forward ?
                    this._objectForwardGraphColumns :
                    this._objectBackwardGraphColumns;
            };
            ManagedHeapViewer.prototype.getTypeRefGraphDataSource = function () {
                return this._refGraphDirection === RefGraphDirection.Forward ? "TypeForwardRefGraph" : "TypeRefGraph";
            };
            ManagedHeapViewer.prototype.getObjectRefGraphDataSource = function () {
                return this._refGraphDirection === RefGraphDirection.Forward ? "ForwardRefGraph" : "RefGraph";
            };
            ManagedHeapViewer.prototype.getElementById = function (elementId) {
                return this.findElement(elementId);
            };
            ManagedHeapViewer.prototype.getActiveGrid = function () {
                if (this.masterGridViewer.isActive)
                    return this.masterGridViewer;
                if (this.refsViewer.isActive)
                    return this.refsViewer;
                return null;
            };
            ManagedHeapViewer.prototype.enableInProgressState = function () {
                this._viewOverlay.classList.add("heapContainerDisable");
                this._progressBar.style.display = "inline";
            };
            ManagedHeapViewer.prototype.disableInProgressState = function () {
                this._viewOverlay.classList.remove("heapContainerDisable");
                this._progressBar.style.display = "none";
            };
            ManagedHeapViewer.prototype.isViewDisabled = function () {
                return this._viewOverlay.classList.contains("heapContainerDisable");
            };
            // Cache size for the proxy adaptor to the backend. Consider reducing this constant when JS memory consumption becomes too high. Increasing this constant 
            // can improve performance.
            ManagedHeapViewer.ProxyArrayCacheSize = 1000;
            ManagedHeapViewer.TooltipChunkingLength = 128;
            return ManagedHeapViewer;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Details.ManagedHeapViewer = ManagedHeapViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/ComponentModel.ts" />
// <reference path="../../../Common/controls/TemplateControl.ts" />
// <reference path="../../../Common/Types/MemoryProfilerDataModel.d.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        (function (NativeHeapAllocationsAggregationType) {
            NativeHeapAllocationsAggregationType[NativeHeapAllocationsAggregationType["top"] = 0] = "top";
            NativeHeapAllocationsAggregationType[NativeHeapAllocationsAggregationType["bottom"] = 1] = "bottom";
        })(Details.NativeHeapAllocationsAggregationType || (Details.NativeHeapAllocationsAggregationType = {}));
        var NativeHeapAllocationsAggregationType = Details.NativeHeapAllocationsAggregationType;
        var AggregationDirectionToggle = (function (_super) {
            __extends(AggregationDirectionToggle, _super);
            function AggregationDirectionToggle(detailsViewModel, viewModelPropertyGetter, viewModelPropertySetter, viewModelPropertyName) {
                _super.call(this, "ToggleTabTemplate");
                this._detailsViewModel = detailsViewModel;
                this._viewModelPropertyGetter = viewModelPropertyGetter;
                this._viewModelPropertySetter = viewModelPropertySetter;
                this._viewModelPropertyName = viewModelPropertyName;
                this._detailsViewModel.registerPropertyChanged(this);
                this._aggregateTopButton = this.findElement("aggregationToggleTabTopButton");
                this._aggregateBottomButton = this.findElement("aggregationToggleTabBottomButton");
                this.findElement("aggregationToggleTabLabel").innerText = Microsoft.Plugin.Resources.getString("AggregationToggleTabLabel");
                this._aggregateTopButton.innerText = Microsoft.Plugin.Resources.getString("AggregationToggleTop");
                var callerAriaLabelText = Microsoft.Plugin.Resources.getString("CallersToggleButtonTooltip");
                this._aggregateTopButton.setAttribute("data-plugin-vs-tooltip", callerAriaLabelText);
                this._aggregateTopButton.setAttribute("aria-label", callerAriaLabelText);
                this._aggregateBottomButton.innerText = Microsoft.Plugin.Resources.getString("AggregationToggleBottom");
                var calleeAriaLabelText = Microsoft.Plugin.Resources.getString("CalleesToggleButtonTooltip");
                this._aggregateBottomButton.setAttribute("data-plugin-vs-tooltip", calleeAriaLabelText);
                this._aggregateBottomButton.setAttribute("aria-label", calleeAriaLabelText);
                this.rootElement.style.cssFloat = "right";
                this._aggregateBottomButton.onclick = this.setAggregateBottomToggleButtonSelected.bind(this);
                this._aggregateTopButton.onclick = this.setAggregateTopToggleButtonSelected.bind(this);
                var toggleButtons = this.findElementsByClassName("toggleTabButtonContainer");
                for (var buttomIndex = 0; buttomIndex < toggleButtons.length; buttomIndex++) {
                    var buttonElement = toggleButtons[buttomIndex];
                    buttonElement.onkeydown = this.onButtonElementKeyDown.bind(buttonElement);
                }
                this.updateUI();
            }
            AggregationDirectionToggle.prototype.onButtonElementKeyDown = function (e) {
                if ((e.keyCode === MemoryProfiler.Common.KeyCodes.ENTER || e.keyCode === MemoryProfiler.Common.KeyCodes.SPACE) && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.srcElement.click();
                }
            };
            AggregationDirectionToggle.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case this._viewModelPropertyName:
                        this.updateUI();
                        break;
                }
            };
            AggregationDirectionToggle.prototype.updateUI = function () {
                var isTopSelected = this._viewModelPropertyGetter() === NativeHeapAllocationsAggregationType.top;
                if (isTopSelected) {
                    this._aggregateTopButton.classList.remove("toggleTabButtonContainer");
                    this._aggregateTopButton.classList.add("toggleTabButtonContainerSelected");
                    this._aggregateTopButton.classList.add("toggleTabSelectedButtonOutline");
                    this._aggregateBottomButton.classList.remove("toggleTabSelectedButtonOutline");
                    this._aggregateBottomButton.classList.remove("toggleTabButtonContainerSelected");
                    this._aggregateBottomButton.classList.add("toggleTabButtonContainer");
                }
                else if (this._viewModelPropertyGetter() === NativeHeapAllocationsAggregationType.bottom) {
                    this._aggregateBottomButton.classList.remove("toggleTabButtonContainer");
                    this._aggregateBottomButton.classList.add("toggleTabButtonContainerSelected");
                    this._aggregateBottomButton.classList.add("toggleTabSelectedButtonOutline");
                    this._aggregateTopButton.classList.remove("toggleTabSelectedButtonOutline");
                    this._aggregateTopButton.classList.remove("toggleTabButtonContainerSelected");
                    this._aggregateTopButton.classList.add("toggleTabButtonContainer");
                }
                this._aggregateTopButton.setAttribute("aria-checked", isTopSelected ? "true" : "false");
                this._aggregateBottomButton.setAttribute("aria-checked", isTopSelected ? "false" : "true");
            };
            AggregationDirectionToggle.prototype.setAggregateTopToggleButtonSelected = function () {
                this._viewModelPropertySetter(NativeHeapAllocationsAggregationType.top);
            };
            AggregationDirectionToggle.prototype.setAggregateBottomToggleButtonSelected = function () {
                this._viewModelPropertySetter(NativeHeapAllocationsAggregationType.bottom);
            };
            return AggregationDirectionToggle;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Details.AggregationDirectionToggle = AggregationDirectionToggle;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/ComponentModel.ts" />
// <reference path="../../../Common/controls/TemplateControl.ts" />
// <reference path="../../../Common/Types/MemoryProfilerDataModel.d.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="NativeHeapViewer.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        var NativeHeapGridViewer = (function (_super) {
            __extends(NativeHeapGridViewer, _super);
            function NativeHeapGridViewer(root, nativeHeapViewer, dataArray, gridContextMenu, columns) {
                var _this = this;
                var options = new TreeGridCommon.Controls.DynamicGrid.DynamicGridViewerOptions(gridContextMenu, null, columns, null, null, true);
                options.gridName = Microsoft.Plugin.Resources.getString("NativeHeapGridViewer_Name");
                options.overflowColumn = true;
                columns[0].getCellContents = function (rowInfo, treePath, expandedState, level, column, indentIndex, columnOrder) {
                    var ret = _this._drawCell(rowInfo, treePath, expandedState, level, column, indentIndex, columnOrder);
                    // see DynamicGridViewer.getColumnValue. We don't schedule an update here if it is needed, because
                    // the call to this._drawCell should have already done that. Also we don't need to support
                    // external paths.
                    var row = null;
                    _this._dataArray.get(treePath.path, function (value, needUpdate) {
                        row = value;
                    });
                    var tooltip = _super.prototype.translateColumn.call(_this, row, "LongId");
                    tooltip = Details.ManagedHeapGridViewerBase.chunkTooltipString(tooltip);
                    Details.ManagedHeapGridViewerBase.setTooltip(ret, tooltip);
                    return ret;
                };
                columns[0].alwaysEnableTooltip = true;
                _super.call(this, dataArray, root, options);
                this._nativeHeapViewer = nativeHeapViewer;
                this._selectedRowIndex = -1;
                this._dataArray = dataArray;
            }
            Object.defineProperty(NativeHeapGridViewer.prototype, "waitingForUpdate", {
                get: function () {
                    return this.IsWaitingForUpdate();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapGridViewer.prototype, "selectedRowTreePath", {
                get: function () {
                    return this.findPathByRow(this._selectedRowIndex);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapGridViewer.prototype, "viewer", {
                /*protected*/ get: function () {
                    return this._nativeHeapViewer;
                },
                enumerable: true,
                configurable: true
            });
            NativeHeapGridViewer.prototype.getSelectedRowAllocationCount = function () {
                var _this = this;
                return new Microsoft.Plugin.Promise(function (completed) {
                    if (_this._selectedRowIndex === -1) {
                        completed(Microsoft.Plugin.Promise.wrap(0));
                    }
                    else {
                        _this.getValue(_this.selectedRowTreePath, function (value, needUpdate) {
                            if (_this._nativeHeapViewer.shouldShowTransientBytes) {
                                completed(Microsoft.Plugin.Promise.wrap(value.TotalCount));
                            }
                            else {
                                completed(Microsoft.Plugin.Promise.wrap(value.OutstandingCount));
                            }
                        });
                    }
                });
            };
            NativeHeapGridViewer.prototype.layout = function () {
                _super.prototype.layout.call(this);
                if (!this.waitingForUpdate) {
                    if (this.getExpandedCount() > 0) {
                        this._nativeHeapViewer.onGridReady();
                    }
                }
            };
            NativeHeapGridViewer.prototype.moveToRow = function (path) {
                if (this.getExpandedPaths()) {
                    path.externalPath = true;
                    var index = this.findRowIndexByTreePath(path);
                    this.setSelectedRowIndex(index);
                    this.getSelectedRowIntoViewCenter();
                    this.getElement().focus();
                    this._nativeHeapViewer.disableInProgressState();
                }
            };
            NativeHeapGridViewer.prototype.goToFindResult = function (treePath, localTreePath) {
                var _this = this;
                if (!localTreePath) {
                    var localTreePath = new TreeGridCommon.Controls.DynamicGrid.TreePath([]);
                    // Paths always starts with [0] node representing the heap.
                    localTreePath.path.push(treePath.path[0]);
                }
                this._dataArray.get(localTreePath, function (row, needUpdate) {
                    if (localTreePath.length() === treePath.length()) {
                        // if expanded all nodes, jump to this node and schedule update.
                        _this.moveToRow(treePath);
                        _this.scheduleUpdate();
                        return;
                    }
                    // if the node is not expanded force it to expand
                    var expandedPaths = _this.getExpandedPaths();
                    if (expandedPaths.expansionStatus(localTreePath) === -1) {
                        expandedPaths.expand(localTreePath, row.SubItemsCount);
                        _this.updateCounts(row.SubItemsCount);
                        _this.markRowDirty(localTreePath.path);
                    }
                    // step forward, and recurse ..
                    localTreePath.path.push(treePath.path[localTreePath.length()]);
                    _this.goToFindResult(treePath, localTreePath);
                });
            };
            NativeHeapGridViewer.prototype._onKeyDown = function (e) {
                if (e.keyCode === MemoryProfiler.Common.KeyCodes.F3) {
                    this._nativeHeapViewer.lookupString();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
                else {
                    return _super.prototype._onKeyDown.call(this, e);
                }
            };
            NativeHeapGridViewer.prototype.updateSort = function (sortProperty, sortOrder) {
                if (!sortProperty || !this.hasColumnIndex(sortProperty)) {
                    // Try to fall back to default sort column.
                    sortProperty = this._nativeHeapViewer.detailsViewModel.sortPropertyNative;
                    if (!sortProperty) {
                        // Fall back to outstanding size.
                        sortProperty = "OutstandingSize";
                    }
                    sortOrder = "desc";
                }
                if (sortProperty === this._sortOrderIndex) {
                    return;
                }
                this.onSort([new TreeGridCommon.Controls.Grid.SortOrderInfo(sortProperty, sortOrder)], []);
            };
            NativeHeapGridViewer.prototype.hasColumnIndex = function (columnIndex) {
                var result = false;
                this.getColumns().forEach(function (info) {
                    if (info.index === columnIndex) {
                        result = true;
                        return;
                    }
                });
                return result;
            };
            NativeHeapGridViewer.prototype.onSelectRow = function (rowIndex) {
                if (this._selectedRowIndex === rowIndex) {
                    return;
                }
                this._selectedRowIndex = rowIndex;
                // In MultiSelect enabled mode, onSelectRow is being called on both selection and deselection of rows ..
                // we shouldn't activate a row on deselection .. 
                if (rowIndex === this.MaxRows - 1 || this.getSelectionCount() > 1 || !this.getSelectedRows().hasOwnProperty(rowIndex)) {
                    this._nativeHeapViewer.allocationListViewer.showGraph(false);
                }
                else {
                    this._nativeHeapViewer.updateAllocationList(this.findPathByRow(rowIndex));
                }
            };
            NativeHeapGridViewer.prototype.refreshAllocationListView = function () {
                this._nativeHeapViewer.refreshAllocationListView();
            };
            NativeHeapGridViewer.prototype.translateColumn = function (row, index) {
                var retval = _super.prototype.translateColumn.call(this, row, index);
                if (!row) {
                    // data not ready
                    if (index === "Id") {
                        retval = Microsoft.Plugin.Resources.getString("LoadRowDataText");
                    }
                }
                else {
                    // For Expanded Objects, Total Size != 0
                    if (index === "OutstandingCount" || index === "OutstandingSize" || index === "TotalCount" || index === "TotalSize") {
                        // don't show empty counts
                        if (row.Count === -1) {
                            retval = "";
                        }
                        else {
                            if (!retval) {
                                retval = "0";
                            }
                            retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, false);
                        }
                    }
                    else if (index === "Id" || index === "Module") {
                        retval = MemoryProfiler.Common.FormattingHelpers.getNativeDigitLocaleString(retval);
                    }
                    else {
                        // If Diff Columns - we hide the Diff values on expanding genuine and "ghost" types
                        if (row.Count === 0 && row.TotalSize !== 0 || row.Count === -1) {
                            retval = "";
                        }
                        else {
                            if (!retval) {
                                retval = "0";
                            }
                            if (parseInt(retval)) {
                                retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(parseInt(retval), true, true);
                            }
                        }
                    }
                }
                return retval;
            };
            NativeHeapGridViewer.prototype._trySorting = function (sortOrder, sortColumns) {
                this._nativeHeapViewer.enableInProgressState();
                this._nativeHeapViewer.masterGridSortColumnIndex = this._sortOrderIndex = sortOrder[0].index;
                this._nativeHeapViewer.masterGridSortColumnOrder = this._sortOrderOrder = sortOrder[0].order;
                this.refresh();
                this._nativeHeapViewer.findResultsCache = null;
                this._clearSelection();
                this.expandNode(new TreeGridCommon.Controls.DynamicGrid.TreePath([0]));
            };
            return NativeHeapGridViewer;
        }(Details.HeapGridViewer));
        Details.NativeHeapGridViewer = NativeHeapGridViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/control.ts" />
// <reference path="../../../Common/controls/ComponentModel.ts" />
// <reference path="../../../Common/Util/FormattingHelpers.ts" />
// <reference path="../../../Common/Types/MemoryProfilerDataModel.d.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="../../../../../../common/script/DiagShared/JSTreeDynamicGridControl.redirect.d.ts" />
/// <reference path="../DetailsView.ts" />
/// <reference path="NativeHeapGridViewer.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        var NativeHeapAllocationListViewer = (function (_super) {
            __extends(NativeHeapAllocationListViewer, _super);
            function NativeHeapAllocationListViewer(root, dataArray, gridContextMenu, columns, viewer) {
                var options = new TreeGridCommon.Controls.DynamicGrid.DynamicGridViewerOptions(gridContextMenu, null, columns, null, null, true);
                options.gridName = Microsoft.Plugin.Resources.getString("NativeHeapAllocationListViewer_Name");
                options.overflowColumn = true;
                options.header = true;
                _super.call(this, dataArray, root, options);
                this._initialized = false;
                this._viewer = viewer;
                this._sortOrderIndex = "Size";
                this._sortOrderOrder = "desc";
                // setup strings
                this._graphDomElement = root;
                this._idGraphNoDataElement = this._viewer.getElementById("NativeHeapViewerAllocationListNoData");
                this._idGraphNoDataElement.innerHTML = Microsoft.Plugin.Resources.getString("AllocationListNoData");
                this._allocationListHeader = this._viewer.getElementById("nativeHeapAllocationListHeader");
                this._allocationListTitle = this._viewer.getElementById("allocationsTree");
                this._allocationListTitle.innerHTML = Microsoft.Plugin.Resources.getString("AllocationListHeader");
                this._allocationListHeader.style.display = "none";
                this._allocationListTitle.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("AllocationListHeaderTooltip"));
                this._allocationListTitle.className = "disabled";
                this.onSort([new TreeGridCommon.Controls.Grid.SortOrderInfo(this._sortOrderIndex, this._sortOrderOrder)], []);
                this._initialized = true;
            }
            Object.defineProperty(NativeHeapAllocationListViewer.prototype, "waitingForUpdate", {
                get: function () {
                    return this.IsWaitingForUpdate();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapAllocationListViewer.prototype, "allocationListCount", {
                get: function () {
                    return this._allocationListCount;
                },
                set: function (v) {
                    this._allocationListCount = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapAllocationListViewer.prototype, "viewer", {
                /*protected*/ get: function () {
                    return this._viewer;
                },
                enumerable: true,
                configurable: true
            });
            NativeHeapAllocationListViewer.prototype.layout = function () {
                _super.prototype.layout.call(this);
                if (!this.waitingForUpdate) {
                    this._viewer.onGridReady();
                }
            };
            Object.defineProperty(NativeHeapAllocationListViewer.prototype, "sortOrderIndex", {
                get: function () {
                    return this._sortOrderIndex;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapAllocationListViewer.prototype, "sortOrderOrder", {
                get: function () {
                    if (this._sortOrderOrder === undefined) {
                        return "desc";
                    }
                    return this._sortOrderOrder;
                },
                enumerable: true,
                configurable: true
            });
            NativeHeapAllocationListViewer.prototype.translateColumn = function (row, index) {
                var retval;
                if (!row) {
                    // data not ready
                    if (index === "Identifier")
                        retval = Microsoft.Plugin.Resources.getString("LoadRowDataText");
                }
                else {
                    retval = row && row[index] !== undefined ? row[index] : "";
                    if (index === "Size") {
                        if (retval == null) {
                            return "";
                        }
                        var numericalValue = parseInt(retval);
                        retval = MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(numericalValue, true, false);
                    }
                    if (index === "Address") {
                        if (retval == null) {
                            return "";
                        }
                        var numericalValue = parseInt(retval);
                        retval = "0x" + numericalValue.toString(16);
                    }
                }
                return retval;
            };
            NativeHeapAllocationListViewer.prototype.translateExternalPathColumn = function (treePath, index) {
                return index === "Tag" ?
                    Microsoft.Plugin.Resources.getString("GridTrimLimit").replace("{0}", (this.getFirstLevelCount() - treePath.path[0]).toString()) :
                    "";
            };
            NativeHeapAllocationListViewer.prototype.showGraph = function (show) {
                if (show) {
                    this._idGraphNoDataElement.style.display = "none";
                    this._graphDomElement.style.display = "block";
                    this._allocationListHeader.style.display = this._allocationListTitle.style.display = "block";
                    this._viewer.detailsViewModel.isNativeHeapViewerAllocationListVisible = true;
                }
                else {
                    this._idGraphNoDataElement.style.display = "block";
                    this._graphDomElement.style.display = "none";
                    this._allocationListHeader.style.display = this._allocationListTitle.style.display = "none";
                    this._viewer.detailsViewModel.isNativeHeapViewerAllocationListVisible = false;
                }
            };
            NativeHeapAllocationListViewer.prototype._trySorting = function (sortOrder, sortColumns) {
                if (!this._initialized) {
                    return;
                }
                this._sortOrderIndex = sortOrder[0].index;
                this._sortOrderOrder = sortOrder[0].order;
                this._viewer.updateAllocationList(this._viewer.masterGridViewer.selectedRowTreePath);
            };
            return NativeHeapAllocationListViewer;
        }(Details.HeapGridViewer));
        Details.NativeHeapAllocationListViewer = NativeHeapAllocationListViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/ComponentModel.ts" />
// <reference path="../../../Common/profiler/SymbolProcessor.ts" />
// <reference path="../../../Common/Types/MemoryProfilerDataModel.d.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        var NativeHeapPublishedObjectAdaptor = (function () {
            function NativeHeapPublishedObjectAdaptor(viewer) {
                this._aggregateByTop = "caller";
                this._aggregateByBottom = "callee";
                this._viewer = viewer;
                this.initializePublishedObjectAdaptor();
            }
            NativeHeapPublishedObjectAdaptor.prototype.initializePublishedObjectAdaptor = function () {
                if (this._dwiPromise === undefined) {
                    this._dwiPromise = Microsoft.VisualStudio.DiagnosticsHub.DataWarehouse.loadDataWarehouse();
                }
            };
            NativeHeapPublishedObjectAdaptor.prototype.createSummaryRowFromData = function (realRow) {
                return new SummaryRow(realRow.identifier, realRow.outstandingCount, realRow.outstandingSize, realRow.totalSize, realRow.totalCount, realRow.outstandingSizeDiff, realRow.totalSizeDiff, realRow.outstandingCountDiff, realRow.totalCountDiff, realRow.childCount, realRow.key);
            };
            NativeHeapPublishedObjectAdaptor.prototype.createAllocationRowFromData = function (realRow) {
                if (realRow.identifier === undefined) {
                    return new AllocationInfo(realRow, null, null, 0, null, null);
                }
                return new AllocationInfo(realRow.identifier, realRow.address, realRow.size, realRow.childCount, realRow.typeName, realRow.imageName);
            };
            NativeHeapPublishedObjectAdaptor.prototype.getFilterStringList = function (params) {
                var request = {
                    "fn": "find",
                    "jmc": this._viewer.justMyCode ? "true" : "false",
                    "aggDirection": this._viewer.isAggregateByTop ? this._aggregateByTop : this._aggregateByBottom,
                    "transient": this._viewer.shouldShowTransientBytes ? "true" : "false",
                    "findString": this._viewer.findString,
                    "sort": this._viewer.masterGridSortColumnIndex,
                    "sortDirection": this._viewer.masterGridSortColumnOrder
                };
                var ctxData = {
                    timeDomain: this._viewer.detailsViewModel.targetTimespan,
                    customDomain: request
                };
                return this._dwiPromise.then(function (dwi) {
                    return dwi.getFilteredData(ctxData, MemoryProfiler.Constants.MEMORY_ANALYZER_CLASS_ID);
                }).then(function (result) {
                    return result;
                });
            };
            NativeHeapPublishedObjectAdaptor.prototype.getNativeHeapTopView = function (params) {
                var _this = this;
                var stack = this.getCallStack(params, false);
                var timespan = this._viewer.detailsViewModel.targetTimespan;
                var request = {
                    "fn": this._viewer.isAggregateByTop ? this._aggregateByTop : this._aggregateByBottom,
                    "jmc": this._viewer.justMyCode ? "true" : "false",
                    "transient": this._viewer.shouldShowTransientBytes ? "true" : "false",
                    "sort": this._viewer.masterGridSortColumnIndex,
                    "sortDirection": this._viewer.masterGridSortColumnOrder,
                    "path": JSON.stringify(stack)
                };
                var ctxData = {
                    timeDomain: timespan,
                    customDomain: request
                };
                var summaryRows = [];
                var result;
                return this._dwiPromise.then(function (dwi) {
                    return dwi.getFilteredData(ctxData, MemoryProfiler.Constants.MEMORY_ANALYZER_CLASS_ID);
                }).then(function (theResult) {
                    result = theResult;
                    var _startIndex = _this.getStartIndex(params);
                    if (_startIndex.path) {
                        // a TreePath is passed as start index, use the last element
                        _startIndex = _startIndex.last();
                    }
                    var newRequest = {
                        "startIndex": _startIndex,
                        "cacheLength": Math.max(params.length, 1)
                    };
                    return result.getResult(newRequest);
                }, function (value) { }, MemoryProfiler.Common.SymbolProcessor.Create(this._dwiPromise)).then(function (realResult) {
                    result.dispose();
                    if (realResult) {
                        for (var i = 0; i < realResult.length; i++) {
                            summaryRows.push(_this.createSummaryRowFromData(realResult[i]));
                        }
                        return summaryRows;
                    }
                });
            };
            NativeHeapPublishedObjectAdaptor.prototype.getStartIndex = function (params) {
                if (params && params[0]) {
                    var i = 0;
                    while (params[0][i] !== undefined) {
                        i++;
                    }
                    if (i > 0) {
                        return params[0][i - 1];
                    }
                    return params[0];
                }
                return 0;
            };
            NativeHeapPublishedObjectAdaptor.prototype.getCallStack = function (params, includeTopId) {
                var x = [];
                if (params && this._viewer.masterGridViewer) {
                    if (params.length > 0 && params[0].length > 0 && params[0][0] == 0 && params[0].length == 2) {
                        // Represents the "Root" frame. The actual value doesn't matter as it is ignored.
                        x.push("0");
                        return x;
                    }
                    if (params.length > 0) {
                        var targetStack = [];
                        var targetParams = null;
                        if (params[0].path) {
                            // the paramter is the actual treePath
                            targetParams = params[0].path;
                        }
                        else if (params[0].length > 1) {
                            targetParams = params[0];
                        }
                        else {
                            targetParams = params;
                        }
                        var end = includeTopId ? targetParams.length : targetParams.length - 1;
                        for (var i = 0; i < end; i++) {
                            targetStack[i] = targetParams[i];
                            var path = new TreeGridCommon.Controls.DynamicGrid.TreePath(targetStack);
                            this._viewer.masterGridViewer.getValue(path, function (value, needupdate) {
                                if (value) {
                                    x.push(value.Key);
                                }
                            });
                        }
                    }
                }
                return x;
            };
            NativeHeapPublishedObjectAdaptor.prototype.getAllocationInfoResult = function (currentCallStack) {
                if (currentCallStack === undefined || currentCallStack == null || currentCallStack.length == 0) {
                    return Microsoft.Plugin.Promise.wrap(null);
                }
                var timespan = this._viewer.detailsViewModel.targetTimespan;
                var request = {
                    timeDomain: timespan,
                    customDomain: {
                        "fn": "allocations",
                        "aggDirection": this._viewer.isAggregateByTop ? this._aggregateByTop : this._aggregateByBottom,
                        "sort": this._viewer.allocationListViewer.sortOrderIndex,
                        "sortDirection": this._viewer.allocationListViewer.sortOrderOrder,
                        "jmc": this._viewer.detailsViewModel.justMyCodeNative ? "true" : "false",
                        "transient": this._viewer.shouldShowTransientBytes ? "true" : "false",
                        "path": JSON.stringify(currentCallStack)
                    }
                };
                return this._dwiPromise.then(function (dwi) {
                    return dwi.getFilteredData(request, MemoryProfiler.Constants.MEMORY_ANALYZER_CLASS_ID);
                });
            };
            NativeHeapPublishedObjectAdaptor.prototype.getAllocationList = function (params) {
                var _this = this;
                var allocationInfoRows = [];
                if (this._allocationInfoResultPromise === undefined) {
                    return new Microsoft.Plugin.Promise(function (completed) {
                        completed(Microsoft.Plugin.Promise.wrap(allocationInfoRows));
                    });
                }
                return this._allocationInfoResultPromise.
                    then(function (result) {
                    var _startIndex = _this.getStartIndex(params);
                    if (params && params[0] && params[0].length > 1) {
                        return result.getResult({
                            "fn": "stack",
                            "startIndex": _startIndex,
                            "cacheLength": Math.max(params.length, 1),
                            "index": params[0][0]
                        });
                    }
                    return result.getResult({
                        "fn": "top",
                        "startIndex": _startIndex,
                        "cacheLength": Math.max(params.length, 1)
                    });
                }).then(function (realResult) {
                    if (realResult) {
                        for (var i = 0; i < realResult.length; i++) {
                            allocationInfoRows.push(_this.createAllocationRowFromData(realResult[i]));
                        }
                    }
                    return allocationInfoRows;
                });
            };
            NativeHeapPublishedObjectAdaptor.prototype.getAllocationListCount = function () {
                var _this = this;
                return this._viewer.masterGridViewer.getSelectedRowAllocationCount().then(function (result) {
                    if (_this._viewer.allocationListViewer) {
                        _this._viewer.allocationListViewer.allocationListCount = +result;
                    }
                    return +result;
                });
            };
            NativeHeapPublishedObjectAdaptor.prototype._call = function (func, params) {
                switch (func) {
                    case "NativeHeapTopViewDataSourceCount":
                        return new Microsoft.Plugin.Promise(function (completed) { completed(Microsoft.Plugin.Promise.wrap(1)); });
                    case "NativeHeapTopViewDataSource":
                        return this.getNativeHeapTopView(params);
                    case "AllocationList":
                        return this.getAllocationList(params);
                    case "AllocationListCount":
                        return this.getAllocationListCount();
                    case "FindString":
                        return this.getFilterStringList(params);
                    default:
                        return Microsoft.Plugin.Promise.as(null);
                }
            };
            NativeHeapPublishedObjectAdaptor.prototype.updateAllocationListDataSource = function (selectedRowPath) {
                var allocationListCurrentCallStack = this.getCallStack(selectedRowPath.path, true);
                if (this._allocationInfoResultPromise) {
                    this._allocationInfoResultPromise.then(function (result) {
                        result.dispose();
                    });
                }
                this._allocationInfoResultPromise = this.getAllocationInfoResult(allocationListCurrentCallStack);
            };
            return NativeHeapPublishedObjectAdaptor;
        }());
        Details.NativeHeapPublishedObjectAdaptor = NativeHeapPublishedObjectAdaptor;
        var Navigable = (function () {
            function Navigable(id) {
                this.FileName = id.sourceFileName;
                this.LineNumber = id.sourceLineNumber;
            }
            return Navigable;
        }());
        Details.Navigable = Navigable;
        var AllocationInfo = (function (_super) {
            __extends(AllocationInfo, _super);
            function AllocationInfo(identifier, allocationString, size, childCount, typeName, imageName) {
                _super.call(this, identifier);
                this.Address = allocationString;
                this.Size = size;
                this.Identifier = identifier.functionName;
                this.Module = identifier.imageName;
                this.SubItemsCount = +childCount;
                this.TypeName = typeName;
                this.ImageName = imageName;
            }
            return AllocationInfo;
        }(Navigable));
        Details.AllocationInfo = AllocationInfo;
        var SummaryRow = (function (_super) {
            __extends(SummaryRow, _super);
            function SummaryRow(id, oc, os, ts, tc, osd, tsd, ocd, tcd, sic, key) {
                _super.call(this, id);
                this.Module = id.imageName;
                this.Id = id.functionName;
                this.LongId = id.functionName;
                this.OutstandingCount = oc;
                this.OutstandingSize = os;
                this.TotalSize = ts;
                this.TotalCount = tc;
                this.OutstandingSizeDiff = osd;
                this.TotalSizeDiff = tsd;
                this.OutstandingCountDiff = ocd;
                this.TotalCountDiff = tcd;
                this.SubItemsCount = +sic;
                this.Key = key;
            }
            return SummaryRow;
        }(Navigable));
        Details.SummaryRow = SummaryRow;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../../Common/controls/control.ts" />
// <reference path="../../../Common/controls/ComponentModel.ts" />
// <reference path="../../../Common/controls/TemplateControl.ts" />
// <reference path="../../../Common/Util/FormattingHelpers.ts" />
// <reference path="../../../Common/Types/MemoryProfilerDataModel.d.ts" />
//--------
/// <reference path="../../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="../../../../../../common/script/DiagShared/JSTreeDynamicGridControl.redirect.d.ts" />
/// <reference path="../DetailsView.ts" />
/// <reference path="AggregationDirectionToggle.ts" />
/// <reference path="NativeHeapAllocationListViewer.ts" />
/// <reference path="NativeHeapGridViewer.ts" />
/// <reference path="NativeHeapPublishedObjectAdaptor.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        var NativeHeapViewer = (function (_super) {
            __extends(NativeHeapViewer, _super);
            function NativeHeapViewer(detailsViewModel) {
                _super.call(this, "NativeHeapTemplate");
                this._nativeHeapAllocationListViewer = null;
                this.rightAlignedColumnHeaderCss = "rightAlignedColumnHeader";
                this._columnInfoSortLabels = new TreeGridCommon.Controls.Grid.ColumnInfoSortLabels(Microsoft.Plugin.Resources.getString("SortedAscending"), Microsoft.Plugin.Resources.getString("SortedDescending"));
                this._logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
                this._isFirstJmc = true;
                this._isFirstViewCallers = true;
                this._isFirstViewCallees = true;
                this._detailsViewModel = detailsViewModel;
                this._detailsViewModel.registerPropertyChanged(this);
                this._justMyCode = this._detailsViewModel.justMyCodeNative;
                this._showTransientBytes = this._detailsViewModel.showTransientBytes;
                this._isAggregateByTop = this._detailsViewModel.nativeHeapAllocationsAggregationType === Details.NativeHeapAllocationsAggregationType.top;
                this._openedInDetailsTab = false;
                this._nativeAllocationsCommandLogged = false;
                this._adaptor = new Details.NativeHeapPublishedObjectAdaptor(this);
                this.initializeContextMenus();
                this.initializeUIElementsAsync();
            }
            NativeHeapViewer.prototype.ViewHeapContents = function () {
                MemoryProfiler.Common.MemoryProfilerViewHost.session.viewHeapContents(this._detailsViewModel.SnapshotId1, this._detailsViewModel.SnapshotId2);
            };
            NativeHeapViewer.prototype.toggleJustMyCodeAsync = function () {
                var _this = this;
                if (this._isFirstJmc) {
                    this._isFirstJmc = false;
                    MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueColdEnd);
                }
                else {
                    MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueWarmEnd);
                }
                this.enableInProgressState();
                this._justMyCode = !this._justMyCode;
                MemoryProfiler.Common.MemoryProfilerViewHost.session.updateDetailsViewSetting("justMyCodeNative", this._justMyCode).done(function () {
                    _this.updateNotificationBar();
                    _this.refreshUIAsync();
                });
            };
            NativeHeapViewer.prototype.toggleShowTransientBytesAsync = function () {
                var _this = this;
                this._showTransientBytes = !this._showTransientBytes;
                this.enableInProgressState();
                MemoryProfiler.Common.MemoryProfilerViewHost.session.updateDetailsViewSetting("includeFreedAllocations", this._showTransientBytes).done(function () {
                    _this.updateNotificationBar();
                    _this.refreshUIAsync();
                });
            };
            NativeHeapViewer.prototype.updateNotificationBar = function () {
                if (this._justMyCode || this._showTransientBytes) {
                    this._notificationBar.style.display = "inline";
                    var activeSettingName = "";
                    if (this._justMyCode) {
                        activeSettingName = Microsoft.Plugin.Resources.getString("NotificationBarJMCEnabled");
                    }
                    if (this._showTransientBytes) {
                        if (this._justMyCode) {
                            activeSettingName = activeSettingName.concat(", ");
                        }
                        activeSettingName = activeSettingName.concat(Microsoft.Plugin.Resources.getString("NotificationBarShowTransientBytesEnabled"));
                    }
                    this._notificationBarMessage.innerText = Microsoft.Plugin.Resources.getString("NotificationBarMessage").replace("{0}", activeSettingName);
                }
                else {
                    this._notificationBar.style.display = "none";
                }
            };
            NativeHeapViewer.prototype.initializeContextMenus = function () {
                this._gridContextMenuOptions = new Array();
                // We need 2 context menus for each of the grids - Main view and allocation list view
                for (var i = 0; i < 2; i++) {
                    // Initialize Context Menu fields
                    var menuItems = new Array();
                    menuItems[0] = {
                        id: "nativeHeapCopyMenuItem" + i,
                        callback: Details.HeapGridViewer.copySelectedRowsToClipboard,
                        label: Microsoft.Plugin.Resources.getString("ContextMenuCopy"),
                        type: Microsoft.Plugin.ContextMenu.MenuItemType.command,
                        iconEnabled: null,
                        iconDisabled: null,
                        accessKey: "Ctrl+C",
                        hidden: function () { return false; },
                        disabled: function () { return false; },
                        checked: function () { return false; },
                        cssClass: null,
                        submenu: null
                    };
                    this._gridContextMenuOptions[i] = menuItems;
                }
            };
            NativeHeapViewer.prototype.toggleAllocationsAggregationType = function () {
                this._isAggregateByTop = this._detailsViewModel.nativeHeapAllocationsAggregationType === Details.NativeHeapAllocationsAggregationType.top;
                this.enableInProgressState();
                this.refreshUIAsync();
            };
            NativeHeapViewer.prototype.initializeUIElementsAsync = function () {
                var _this = this;
                this._notificationBar = this.findElement("notificationBar");
                this._notificationBarMessage = this.findElement("notificationBarMessage");
                this._aggregationToggle = this.createAggregationDirectionToggle();
                this._viewOverlay = this.findElement("heapViewOverlay");
                this._progressBar = this.findElement("progressBar");
                this._viewHeapContentLink = document.createElement("a");
                this._viewHeapContentLink.href = "javascript:void(null);";
                this._viewHeapContentLink.innerText = Microsoft.Plugin.Resources.getString("ViewHeapContents");
                this._viewHeapContentLink.className = "notificationBarMessage";
                this._viewHeapContentLink.style.cssFloat = "left";
                this._viewHeapContentLink.style.marginRight = "50px";
                this._viewHeapContentLink.style.paddingTop = "3px";
                this._viewHeapContentLink.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("ViewHeapContentToolTip"));
                this._viewHeapContentLink.addEventListener("click", function (e) {
                    _this.ViewHeapContents();
                });
                // Wrap View Heap and AggToggle in span so we can push it to right
                // while keeping them together.
                var container = document.createElement("span");
                container.style.cssFloat = "right";
                container.appendChild(this._viewHeapContentLink);
                container.appendChild(this._aggregationToggle.rootElement);
                this.findElement("notificationArea").appendChild(container);
            };
            NativeHeapViewer.prototype.createAggregationDirectionToggle = function () {
                var _this = this;
                return new Details.AggregationDirectionToggle(this._detailsViewModel, function () {
                    return _this._detailsViewModel.nativeHeapAllocationsAggregationType;
                }, function (v) {
                    _this._detailsViewModel.nativeHeapAllocationsAggregationType = v;
                }, "nativeHeapAllocationsAggregationType");
            };
            NativeHeapViewer.prototype.onGridReady = function () {
                if (this._nativeHeapMasterGridViewer) {
                    this._logger.debug("NativeHeapViewer.onGridReady: _nativeHeapMasterGridViewer.waitingForUpdate: " + this._nativeHeapMasterGridViewer.waitingForUpdate);
                }
                if (this._nativeHeapAllocationListViewer) {
                    this._logger.debug("NativeHeapViewer.onGridReady: _nativeHeapAllocationListViewer.waitingForUpdate: " + this._nativeHeapAllocationListViewer.waitingForUpdate);
                }
                if (this._nativeHeapMasterGridViewer && !this._nativeHeapMasterGridViewer.waitingForUpdate) {
                    if (this._nativeHeapAllocationListViewer && (!this._nativeHeapAllocationListViewer.waitingForUpdate || !this.detailsViewModel.isNativeHeapViewerAllocationListVisible)) {
                        this.disableInProgressState();
                        this._logger.debug("NativeHeapViewer.onGridReady: _detailsViewModel.detailsViewReady = true");
                        this._detailsViewModel.detailsViewReady = true;
                        MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarkers(MemoryProfiler.Common.CodeMarkerValues.perfMP_ToggleManagedNativeSelectionStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_NativeDetailsViewLoadStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCallersColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCallersWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCalleesColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCalleesWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_SetJMCValueWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ManagedDetailsViewLoadStart);
                    }
                }
            };
            Object.defineProperty(NativeHeapViewer.prototype, "detailsViewModel", {
                get: function () { return this._detailsViewModel; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "masterGridViewer", {
                get: function () { return this._nativeHeapMasterGridViewer; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "findResultsCache", {
                get: function () { return this._findResultsCache; },
                set: function (v) {
                    if (this._findResultsCache && this._findResultsCache.result) {
                        this._findResultsCache.result.dispose();
                    }
                    this._findResultsCache = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "allocationListViewer", {
                get: function () { return this._nativeHeapAllocationListViewer; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "isAggregateByTop", {
                get: function () { return this._isAggregateByTop; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "justMyCode", {
                get: function () { return this._justMyCode; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "findString", {
                get: function () { return this._detailsViewModel.nativeFilterString; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "shouldShowTransientBytes", {
                get: function () { return this._showTransientBytes; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "masterGridSortColumnIndex", {
                get: function () {
                    return this._masterGridSortColumnIndex === undefined ? "OutstandingSize" : this._masterGridSortColumnIndex;
                },
                set: function (v) {
                    if (this._masterGridSortColumnIndex !== v) {
                        this._masterGridSortColumnIndex = v;
                        if (this._nativeHeapAllocationListViewer) {
                            this._nativeHeapAllocationListViewer.showGraph(false);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "masterGridSortColumnOrder", {
                get: function () {
                    if (this._masterGridSortColumnOrder === undefined) {
                        return "desc";
                    }
                    return this._masterGridSortColumnOrder;
                },
                set: function (v) {
                    if (this._masterGridSortColumnOrder !== v) {
                        this._masterGridSortColumnOrder = v;
                        if (this._nativeHeapAllocationListViewer) {
                            this._nativeHeapAllocationListViewer.showGraph(false);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeHeapViewer.prototype, "feedbackSourceName", {
                // Override in derived classes to log a different feedback source
                get: function () {
                    return MemoryProfiler.Common.FeedbackCommandSourceNames.NativeHeapView;
                },
                enumerable: true,
                configurable: true
            });
            NativeHeapViewer.prototype.updateSortProperty = function (sortProperty, sortOrder) {
                if (this.masterGridViewer) {
                    this.masterGridViewer.updateSort(sortProperty, sortOrder);
                }
            };
            NativeHeapViewer.prototype.updateColumnConfiguration = function () {
                var isDiffView = this._detailsViewModel.isDiffView;
                this._nativeHeapViewColumns = [
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Id", Microsoft.Plugin.Resources.getString("Identifier"), Microsoft.Plugin.Resources.getString("IdentifierTooltip"), NativeHeapViewer.IDENTIFIER_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("OutstandingCount", Microsoft.Plugin.Resources.getString("Count"), Microsoft.Plugin.Resources.getString("OutstandingAllocationsCountTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("OutstandingSize", Microsoft.Plugin.Resources.getString("Size"), Microsoft.Plugin.Resources.getString("OutstandingAllocationsSizeTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                ];
                this._nativeHeapViewColumns[1].headerCss = this.rightAlignedColumnHeaderCss;
                this._nativeHeapViewColumns[2].headerCss = this.rightAlignedColumnHeaderCss;
                if (this._showTransientBytes) {
                    this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("TotalCount", Microsoft.Plugin.Resources.getString("TotalCount"), Microsoft.Plugin.Resources.getString("TotalAllocationCountTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                    this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSize", Microsoft.Plugin.Resources.getString("TotalSize"), Microsoft.Plugin.Resources.getString("TotalAllocationSizeTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                    this._nativeHeapViewColumns[this._nativeHeapViewColumns.length - 2].headerCss = this.rightAlignedColumnHeaderCss;
                    this._nativeHeapViewColumns[this._nativeHeapViewColumns.length - 1].headerCss = this.rightAlignedColumnHeaderCss;
                }
                if (isDiffView) {
                    this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("OutstandingCountDiff", Microsoft.Plugin.Resources.getString("CountDiff"), Microsoft.Plugin.Resources.getString("OutstandingCountDiffTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                    this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("OutstandingSizeDiff", Microsoft.Plugin.Resources.getString("SizeDiff"), Microsoft.Plugin.Resources.getString("OutstandingSizeDiffTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                    this._nativeHeapViewColumns[this._nativeHeapViewColumns.length - 2].headerCss = this.rightAlignedColumnHeaderCss;
                    this._nativeHeapViewColumns[this._nativeHeapViewColumns.length - 1].headerCss = this.rightAlignedColumnHeaderCss;
                    if (this._showTransientBytes) {
                        this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("TotalCountDiff", Microsoft.Plugin.Resources.getString("TotalCountDiff"), Microsoft.Plugin.Resources.getString("TotalAllocationCountDiffTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("TotalSizeDiff", Microsoft.Plugin.Resources.getString("TotalSizeDiff"), Microsoft.Plugin.Resources.getString("TotalAllocationSizeDiffTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"));
                        this._nativeHeapViewColumns[this._nativeHeapViewColumns.length - 2].headerCss = this.rightAlignedColumnHeaderCss;
                        this._nativeHeapViewColumns[this._nativeHeapViewColumns.length - 1].headerCss = this.rightAlignedColumnHeaderCss;
                    }
                }
                this._nativeHeapViewColumns.push(new TreeGridCommon.Controls.Grid.ColumnInfo("Module", Microsoft.Plugin.Resources.getString("Module"), Microsoft.Plugin.Resources.getString("ModuleTooltip"), NativeHeapViewer.MODULE_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels));
            };
            NativeHeapViewer.prototype.refreshUIAsync = function () {
                var _this = this;
                // Clear the results cache and text box
                this.findResultsCache = null;
                if (this._splitter)
                    this._splitter = null;
                var div = this.findElement("NativeHeapMasterDetailContainer");
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
                if (this._nativeHeapViewDataSource) {
                    this._nativeHeapViewDataSource.flushCache();
                    this._nativeHeapViewDataSource = null;
                }
                if (this._isAggregateByTop) {
                    if (this._isFirstViewCallers) {
                        this._isFirstViewCallers = false;
                        MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCallersColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCallersColdEnd);
                    }
                    else {
                        MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCallersWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCallersWarmEnd);
                    }
                }
                else {
                    if (this._isFirstViewCallees) {
                        this._isFirstViewCallees = false;
                        MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCalleesColdStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCalleesColdEnd);
                    }
                    else {
                        MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCalleesWarmStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ViewIdentifierCalleesWarmEnd);
                    }
                }
                var dataSource = this.getMasterGridDataSourceName();
                this._nativeHeapViewDataSource = new TreeGridCommon.Controls.DynamicGrid.ProxyArray(this._adaptor, dataSource, NativeHeapViewer.ProxyArrayCacheSize);
                this.updateColumnConfiguration();
                this._nativeHeapViewDataSource.init(function () {
                    _this._nativeHeapMasterGridViewer = new Details.NativeHeapGridViewer(_this.findElement("NativeHeapMasterDetailContainer"), _this, _this._nativeHeapViewDataSource, _this._gridContextMenuOptions[0], _this._nativeHeapViewColumns);
                    _this._splitter = new TreeGridCommon.Controls.GridSplitterControl(_this.findElement("snapshotViewGridSplitter"), null, function () {
                        _this.masterGridViewer.scheduleUpdate();
                        _this.allocationListViewer.scheduleUpdate();
                    });
                    _this.updateSortProperty(_this._masterGridSortColumnIndex, _this._masterGridSortColumnOrder);
                });
                this.refreshAllocationListView();
                this.updateNotificationBar();
            };
            NativeHeapViewer.prototype.getMasterGridDataSourceName = function () {
                return "NativeHeapTopViewDataSource";
            };
            NativeHeapViewer.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case "justMyCodeNative":
                        this.toggleJustMyCodeAsync();
                        break;
                    case "showTransientBytes":
                        this.toggleShowTransientBytesAsync();
                        break;
                    case "nativeHeapAllocationsAggregationType":
                        this.toggleAllocationsAggregationType();
                        break;
                    case "targetView":
                        if (this.detailsViewModel.targetView === Details.DetailsViewType.nativeHeap) {
                            if (!this._openedInDetailsTab) {
                                this.enableInProgressState();
                                this.refreshUIAsync();
                                this._openedInDetailsTab = true;
                            }
                            else {
                                this.masterGridViewer.layout();
                                this.allocationListViewer.layout();
                            }
                        }
                        break;
                    case "sortPropertyNative":
                        this.updateSortProperty(this._detailsViewModel.sortPropertyNative, /*sortOrder*/ "desc");
                        break;
                    case "nativeFilterString":
                        this.lookupString();
                        break;
                }
            };
            NativeHeapViewer.prototype.lookupString = function () {
                var _this = this;
                if (this.isViewDisabled()) {
                    return;
                }
                if (this.findString === "") {
                    this.findResultsCache = null;
                    return;
                }
                if (this.findResultsCache && this.findString !== this.findResultsCache.findString) {
                    this.findResultsCache = null;
                }
                if (!this.findResultsCache) {
                    this.enableInProgressState();
                    this._adaptor._call("FindString").then(function (results) {
                        _this.findResultsCache = {
                            "results": results,
                            "findString": _this.findString
                        };
                        _this.displayFindResult();
                    });
                }
                else {
                    this.enableInProgressState();
                    this.displayFindResult();
                }
            };
            NativeHeapViewer.prototype.displayFindResult = function () {
                var _this = this;
                if (this.findResultsCache && this.findResultsCache.results) {
                    this.findResultsCache.results.getResult(null).then(function (stackIndices) {
                        var dvm = _this.detailsViewModel;
                        dvm.LogSearchHeapViewCommand(MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, Details.DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(dvm.targetView));
                        if (stackIndices && stackIndices.length > 0) {
                            var correctedArray = [];
                            for (var i = 0; i < stackIndices.length; i++) {
                                correctedArray.push(+stackIndices[i]);
                            }
                            _this.masterGridViewer.goToFindResult(new TreeGridCommon.Controls.DynamicGrid.TreePath(correctedArray));
                        }
                        else {
                            _this.findResultsCache = null;
                            _this.disableInProgressState();
                            alert(Microsoft.Plugin.Resources.getString("NativeFindNoResultsString"));
                        }
                    });
                }
            };
            NativeHeapViewer.prototype.getElementById = function (elementId) {
                return this.findElement(elementId);
            };
            NativeHeapViewer.prototype.updateAllocationList = function (selectedRowPath) {
                this.LogViewNativeAllocationsCommand();
                this._adaptor.updateAllocationListDataSource(selectedRowPath);
                this._nativeHeapAllocationListViewer.setSelectedRowIndex(-1);
                this._nativeHeapAllocationListViewer.refresh();
                this._nativeHeapAllocationListViewer.showGraph(true);
            };
            NativeHeapViewer.prototype.LogViewNativeAllocationsCommand = function () {
                if (this._nativeAllocationsCommandLogged) {
                    return;
                }
                this._nativeAllocationsCommandLogged = true;
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.ViewNativeAllocations, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, this.feedbackSourceName);
            };
            NativeHeapViewer.prototype.refreshAllocationListView = function () {
                var _this = this;
                this._nativeHeapAllocationListDataSource = new TreeGridCommon.Controls.DynamicGrid.ProxyArray(this._adaptor, "AllocationList", NativeHeapViewer.ProxyArrayCacheSize);
                var _allocationListColumns = [
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Identifier", Microsoft.Plugin.Resources.getString("Identifier"), Microsoft.Plugin.Resources.getString("IdentifierTooltip"), NativeHeapViewer.IDENTIFIER_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Address", Microsoft.Plugin.Resources.getString("Address"), Microsoft.Plugin.Resources.getString("AddressTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("TypeName", Microsoft.Plugin.Resources.getString("Type"), Microsoft.Plugin.Resources.getString("TypeTooltip"), NativeHeapViewer.IDENTIFIER_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Size", Microsoft.Plugin.Resources.getString("Size"), Microsoft.Plugin.Resources.getString("SizeTooltip"), NativeHeapViewer.NUMERIC_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels, null, function () { return "rightAlignedColumn"; }, null, /*defaultSorder*/ "desc"),
                    new TreeGridCommon.Controls.Grid.ColumnInfo("Module", Microsoft.Plugin.Resources.getString("Module"), Microsoft.Plugin.Resources.getString("ModuleTooltip"), NativeHeapViewer.MODULE_COLUMN_WIDTH, /*canSortBy*/ true, this._columnInfoSortLabels),
                ];
                // Numeric header to be aligned to right
                _allocationListColumns[3].headerCss = this.rightAlignedColumnHeaderCss;
                this._nativeHeapAllocationListDataSource.init(function () {
                    if (_this._nativeHeapAllocationListViewer === null) {
                        _this._nativeHeapAllocationListViewer = new Details.NativeHeapAllocationListViewer(_this.findElement("NativeHeapViewerAllocationListContainer"), _this._nativeHeapAllocationListDataSource, _this._gridContextMenuOptions[1], _allocationListColumns, _this);
                    }
                    _this._nativeHeapAllocationListViewer.showGraph(false);
                });
            };
            NativeHeapViewer.prototype.getActiveGrid = function () {
                if (this.masterGridViewer.isActive)
                    return this.masterGridViewer;
                if (this.allocationListViewer.isActive)
                    return this.allocationListViewer;
                return null;
            };
            NativeHeapViewer.prototype.enableInProgressState = function () {
                this._viewOverlay.classList.add("heapContainerDisable");
                this._progressBar.style.display = "inline";
            };
            NativeHeapViewer.prototype.disableInProgressState = function () {
                this._viewOverlay.classList.remove("heapContainerDisable");
                this._progressBar.style.display = "none";
            };
            NativeHeapViewer.prototype.isViewDisabled = function () {
                return this._viewOverlay.classList.contains("heapContainerDisable");
            };
            // Cache size for the proxy adaptor to the backend. Consider reducing this constant when JS memory consumption becomes too high. Increasing this constant 
            // can improve performance.
            NativeHeapViewer.ProxyArrayCacheSize = 1000;
            NativeHeapViewer.MODULE_COLUMN_WIDTH = 200;
            NativeHeapViewer.IDENTIFIER_COLUMN_WIDTH = 500;
            NativeHeapViewer.NUMERIC_COLUMN_WIDTH = 150;
            return NativeHeapViewer;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Details.NativeHeapViewer = NativeHeapViewer;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../Common/Profiler/FeedbackConstants.ts" />
// <reference path="../../Common/Util/keyCodes.ts" />
// <reference path="../../Common/Controls/control.ts" />
// <reference path="../../Common/Controls/componentModel.ts" />
// <reference path="../../Common/Controls/menuControl.ts" />
// <reference path="../../Common/Controls/templateControl.ts" />
// <reference path="../../Common/Controls/tabControl.ts" />
// <reference path="../../Common/Util/enumHelper.ts" />
// <reference path="../../Common/Util/errorFormatter.ts" />
// <reference path="../../Common/extensions/userSettings.ts" />
// <reference path="../../Common/extensions/session.ts" />
//--------
/// <reference path="DetailsViewTabItem.ts" />
/// <reference path="ManagedHeapViewer/ManagedHeapViewer.ts" />
/// <reference path="NativeHeapViewer/NativeHeapViewer.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        // !!! DetailsViewType is tied to DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType() and DetailsViewModel.LogDefaultUserSettingsForTargetView()
        // when one changes, the other must as well.
        (function (DetailsViewType) {
            DetailsViewType[DetailsViewType["managedHeap"] = 0] = "managedHeap";
            DetailsViewType[DetailsViewType["nativeHeap"] = 1] = "nativeHeap";
        })(Details.DetailsViewType || (Details.DetailsViewType = {}));
        var DetailsViewType = Details.DetailsViewType;
        var DetailsViewController = (function () {
            function DetailsViewController(initializeView) {
                var _this = this;
                if (initializeView === void 0) { initializeView = true; }
                this._logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
                this._logger.debug("CDiag::DetailsViewController.constructor()");
                this.model = new DetailsViewModel();
                this.model.progressText = Microsoft.Plugin.Resources.getString("ProcessingSnapshot");
                if (initializeView) {
                    this.view = new DetailsView(this, this.model);
                }
                MemoryProfiler.Common.MemoryProfilerViewHost.session.addViewTypeEventListener(function (args) {
                    _this.setTargetView(MemoryProfiler.Common.Enum.Parse(DetailsViewType, args.viewType), args.sortProperty);
                });
                this._logger.debug("CDiag::DetailsViewController.constructor(): Completed");
            }
            DetailsViewController.prototype.loadSnapshot = function () {
                var _this = this;
                MemoryProfiler.Common.MemoryProfilerViewHost.session.addSnapshotProcessingEventListener(this.onSnapshotProcessingResult.bind(this));
                MemoryProfiler.Common.MemoryProfilerViewHost.session.getSessionInfo().done(function (sessionInfo) {
                    if (sessionInfo.targetRuntime === MemoryProfiler.Common.Extensions.TargetRuntime.mixed || sessionInfo.targetRuntime === MemoryProfiler.Common.Extensions.TargetRuntime.managed) {
                        MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_ManagedDetailsViewLoadStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ManagedDetailsViewLoadEnd);
                    }
                    if (sessionInfo.targetRuntime === MemoryProfiler.Common.Extensions.TargetRuntime.mixed || sessionInfo.targetRuntime === MemoryProfiler.Common.Extensions.TargetRuntime.native) {
                        MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_NativeDetailsViewLoadStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_NativeDetailsViewLoadEnd);
                    }
                });
                MemoryProfiler.Common.MemoryProfilerViewHost.session.getSnapshotProcessingResults().then(function (result) {
                    // If already complete, we can switch views now.  Otherwise we wait until we're notified through the event handler.
                    if (result) {
                        _this.onSnapshotProcessingResult(result);
                    }
                });
            };
            DetailsViewController.prototype.onSnapshotProcessingResult = function (result) {
                if (result.succeeded) {
                    this.model.SnapshotId1 = result.snapshotIndex;
                    this.model.SnapshotId2 = result.snapshotIndex2;
                    this.onSnapshotProcessingCompleted();
                }
                else {
                    var errorMessage = Microsoft.Plugin.Resources.getString("ManagedSnapshotError") + result.errorMessage;
                    this.onSnapshotProcessingFailed(new Error(errorMessage));
                }
            };
            DetailsViewController.prototype.setTargetView = function (targetView, sortProperty) {
                if (targetView === DetailsViewType.managedHeap) {
                    this.model.sortPropertyManaged = sortProperty;
                }
                else if (targetView === DetailsViewType.nativeHeap) {
                    this.model.sortPropertyNative = sortProperty;
                }
                this.model.targetView = targetView;
            };
            DetailsViewController.prototype.onSnapshotProcessingCompleted = function () {
                this.model.processingComplete = true;
            };
            DetailsViewController.prototype.onSnapshotProcessingFailed = function (error) {
                if (!error) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("JSPerf.1013"));
                }
                this.model.latestSnapshotError = error;
            };
            DetailsViewController.prototype.onSnapshotProgress = function (progressMessage) {
                this.model.progressText = progressMessage;
            };
            Object.defineProperty(DetailsViewController.prototype, "activeViewer", {
                get: function () {
                    return this.view.currentTabItem.content;
                },
                enumerable: true,
                configurable: true
            });
            return DetailsViewController;
        }());
        Details.DetailsViewController = DetailsViewController;
        var DetailsViewModel = (function (_super) {
            __extends(DetailsViewModel, _super);
            function DetailsViewModel() {
                _super.call(this);
                this._managedFilterString = "";
                this._nativeFilterString = "";
                this._latestSnapshotError = null;
                this._nativeHeapAggregationType = Details.NativeHeapAllocationsAggregationType.bottom;
                this._logger = Microsoft.VisualStudio.DiagnosticsHub.getLogger();
                this._logger.debug("CDiag::DetailsViewModel.constructor(): Completed");
            }
            Object.defineProperty(DetailsViewModel.prototype, "isNativeHeapViewerAllocationListVisible", {
                get: function () { return this._isNativeHeapViewerAllocationListVisible; },
                set: function (v) {
                    this._isNativeHeapViewerAllocationListVisible = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "isManagedHeapViewerRefGraphVisible", {
                get: function () { return this._isManagedHeapViewerRefGraphVisible; },
                set: function (v) {
                    this._isManagedHeapViewerRefGraphVisible = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "isDiffView", {
                get: function () {
                    return !(this.targetTimespan.begin.equals(Microsoft.VisualStudio.DiagnosticsHub.BigNumber.zero));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "targetTimespan", {
                get: function () { return this._targetTimespan; },
                set: function (value) {
                    this._targetTimespan = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "targetRuntime", {
                get: function () { return this._targetRuntime; },
                set: function (value) {
                    this._targetRuntime = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "collapseSmallObjects", {
                get: function () { return this._collapseSmallObjects; },
                set: function (v) {
                    if (this._collapseSmallObjects !== v) {
                        this._collapseSmallObjects = v;
                        this.LogCollapseSmallObjectsCommand(v, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(this._targetView));
                        this.raisePropertyChanged("collapseSmallObjects");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "justMyCodeManaged", {
                get: function () { return this._justMyCodeManaged; },
                set: function (v) {
                    if (this._justMyCodeManaged !== v) {
                        this._justMyCodeManaged = v;
                        this.LogJustMyCodeCommand(v, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(this._targetView));
                        this.raisePropertyChanged("justMyCodeManaged");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "justMyCodeNative", {
                get: function () { return this._justMyCodeNative; },
                set: function (v) {
                    if (this._justMyCodeNative !== v) {
                        this._justMyCodeNative = v;
                        this.LogJustMyCodeCommand(v, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(this._targetView));
                        this.raisePropertyChanged("justMyCodeNative");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "showTransientBytes", {
                get: function () { return this._showTransientBytes; },
                set: function (v) {
                    if (this._showTransientBytes !== v) {
                        this.LogShowTransientBytes(v, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(this._targetView));
                        this._showTransientBytes = v;
                        this.raisePropertyChanged("showTransientBytes");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "nativeHeapAllocationsAggregationType", {
                get: function () { return this._nativeHeapAggregationType; },
                set: function (v) {
                    if (this._nativeHeapAggregationType !== v) {
                        this._nativeHeapAggregationType = v;
                        this.LogNativeHeapAllocationsAggregationType(v, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(this._targetView));
                        this.raisePropertyChanged("nativeHeapAllocationsAggregationType");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "managedFilterString", {
                get: function () { return this._managedFilterString; },
                set: function (v) {
                    if (this._managedFilterString !== v) {
                        this._managedFilterString = v;
                        this.LogSearchHeapViewCommand(MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType(this._targetView));
                        this.raisePropertyChanged("managedFilterString");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "nativeFilterString", {
                get: function () { return this._nativeFilterString; },
                set: function (v) {
                    // For native, we handle logging the SQM point later on, because the user may press F3 to continue the search without changing the filter string.
                    this._nativeFilterString = v;
                    this.raisePropertyChanged("nativeFilterString");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "latestSnapshotError", {
                get: function () { return this._latestSnapshotError; },
                set: function (v) {
                    if (this._latestSnapshotError !== v) {
                        this._latestSnapshotError = v;
                        this.raisePropertyChanged("latestSnapshotError");
                        // Create the WER
                        MemoryProfiler.Common.MemoryProfilerViewHost.reportError(v, "SnapshotProcessingFailure");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "progressText", {
                get: function () { return this._progressText; },
                set: function (v) {
                    if (this._progressText !== v) {
                        this._progressText = v;
                        this.raisePropertyChanged("progressText");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "progressValue", {
                get: function () { return this._progressValue; },
                set: function (v) {
                    if (this._progressValue !== v) {
                        this._progressValue = v;
                        this.raisePropertyChanged("progressValue");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "sortPropertyManaged", {
                get: function () { return this._sortPropertyManaged; },
                set: function (v) {
                    this._sortPropertyManaged = v;
                    // It is much simpler to always raise this event and ensure the sort is applied than to track the sort being used currently within the selected tab
                    this.raisePropertyChanged("sortPropertyManaged");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "sortPropertyNative", {
                get: function () { return this._sortPropertyNative; },
                set: function (v) {
                    this._sortPropertyNative = v;
                    // It is much simpler to always raise this event and ensure the sort is applied than to track the sort being used currently within the selected tab
                    this.raisePropertyChanged("sortPropertyNative");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "processingComplete", {
                get: function () { return this._processingComplete; },
                set: function (v) {
                    this._processingComplete = v;
                    // It is much simpler to always raise this event and ensure the sort is applied than to track the sort being used currently within the selected tab
                    this.raisePropertyChanged("processingComplete");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "targetView", {
                get: function () { return this._targetView; },
                set: function (v) {
                    if (this._targetView !== v) {
                        this._targetView = v;
                        this.LogDefaultUserSettingsForTargetView();
                        this.raisePropertyChanged("targetView");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "detailsViewReady", {
                get: function () { return this._detailsViewReady; },
                set: function (v) {
                    this._logger.debug("DetailsViewModel.detailsViewReady: " + v);
                    this._detailsViewReady = v;
                    // Since the event should fire on every user interaction that requires updating the view
                    // changing a setting / filter, sorting tree, expanding a node, switch details grids ..etc
                    // we are going to raise the event without checking for the current value the view is on.
                    this.raisePropertyChanged("detailsViewReady");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "viewSettingsInitialized", {
                get: function () { return this._viewSettingsInitialized; },
                set: function (v) { this._viewSettingsInitialized = v; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "SnapshotId1", {
                get: function () { return this._snapshotId1; },
                set: function (id) { this._snapshotId1 = id; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailsViewModel.prototype, "SnapshotId2", {
                get: function () { return this._snapshotId2; },
                set: function (id) { this._snapshotId2 = id; },
                enumerable: true,
                configurable: true
            });
            DetailsViewModel.prototype.LogDefaultUserSettingsForTargetView = function () {
                // Note: In the future, we may have per-view default settings. For now, log the defaults as coming from the corresponding views.
                // !!! This switch is tied to MemoryProfiler.DetailsViewType
                // when one changes, the other must as well.
                switch (this._targetView) {
                    case DetailsViewType.managedHeap:
                        if (this._defaultUserSettingsForManagedHeapViewLogged)
                            break;
                        this._defaultUserSettingsForManagedHeapViewLogged = true;
                        this.LogJustMyCodeCommand(this.justMyCodeManaged, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Default, MemoryProfiler.Common.FeedbackCommandSourceNames.ManagedHeapView);
                        this.LogCollapseSmallObjectsCommand(this.collapseSmallObjects, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Default, MemoryProfiler.Common.FeedbackCommandSourceNames.ManagedHeapView);
                        break;
                    case DetailsViewType.nativeHeap:
                        if (this._defaultUserSettingsForNativeHeapViewLogged)
                            break;
                        this._defaultUserSettingsForNativeHeapViewLogged = true;
                        this.LogJustMyCodeCommand(this.justMyCodeNative, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Default, MemoryProfiler.Common.FeedbackCommandSourceNames.NativeHeapView);
                        this.LogNativeHeapAllocationsAggregationType(this.nativeHeapAllocationsAggregationType, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Default, MemoryProfiler.Common.FeedbackCommandSourceNames.NativeHeapView);
                        this.LogShowTransientBytes(this.showTransientBytes, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Default, MemoryProfiler.Common.FeedbackCommandSourceNames.NativeHeapView);
                        break;
                    default:
                        // Unknown view
                        break;
                }
            };
            DetailsViewModel.prototype.LogSearchHeapViewCommand = function (invokeMethodName, commandSourceName) {
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.SearchHeapView, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, commandSourceName);
            };
            DetailsViewModel.prototype.LogCollapseSmallObjectsCommand = function (v, invokeMethodName, commandSourceName) {
                if (!this.viewSettingsInitialized)
                    return;
                var feedbackCommandName;
                if (v) {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.EnableCollapseSmallObjects;
                }
                else {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.DisableCollapseSmallObjects;
                }
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(feedbackCommandName, invokeMethodName, commandSourceName);
            };
            DetailsViewModel.prototype.LogJustMyCodeCommand = function (v, invokeMethodName, commandSourceName) {
                if (!this.viewSettingsInitialized)
                    return;
                var feedbackCommandName;
                if (v) {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.EnableJustMyCode;
                }
                else {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.DisableJustMyCode;
                }
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(feedbackCommandName, invokeMethodName, commandSourceName);
            };
            DetailsViewModel.prototype.LogShowTransientBytes = function (v, invokeMethodName, commandSourceName) {
                if (!this.viewSettingsInitialized)
                    return;
                var feedbackCommandName;
                if (v) {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.EnableTransientBytes;
                }
                else {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.DisableTransientBytes;
                }
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(feedbackCommandName, invokeMethodName, commandSourceName);
            };
            DetailsViewModel.prototype.LogNativeHeapAllocationsAggregationType = function (v, invokeMethodName, commandSourceName) {
                if (!this.viewSettingsInitialized)
                    return;
                var feedbackCommandName;
                if (v === Details.NativeHeapAllocationsAggregationType.top) {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.SelectTopAggregation;
                }
                else if (v === Details.NativeHeapAllocationsAggregationType.bottom) {
                    feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.SelectBottomAggregation;
                }
                else
                    (feedbackCommandName = MemoryProfiler.Common.FeedbackCommandNames.Unknown);
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(feedbackCommandName, invokeMethodName, commandSourceName);
            };
            DetailsViewModel.FeedbackCommandSourceNameFromDetailsViewType = function (detailsViewType) {
                // !!! This switch is tied to MemoryProfiler.DetailsViewType
                // when one changes, the other must as well.
                switch (detailsViewType) {
                    case DetailsViewType.managedHeap:
                        return MemoryProfiler.Common.FeedbackCommandSourceNames.ManagedHeapView;
                    case DetailsViewType.nativeHeap:
                        return MemoryProfiler.Common.FeedbackCommandSourceNames.NativeHeapView;
                    default:
                        return MemoryProfiler.Common.FeedbackCommandSourceNames.Unknown;
                }
            };
            return DetailsViewModel;
        }(MemoryProfiler.Common.Controls.ObservableViewModel));
        Details.DetailsViewModel = DetailsViewModel;
        var DetailsView = (function (_super) {
            __extends(DetailsView, _super);
            function DetailsView(controller, model) {
                _super.call(this, "DetailsViewTemplate");
                this._controller = controller;
                this._model = model;
                this._settingsView = new SettingsView(this._model);
                this._model.registerPropertyChanged(this);
                this._tabControlHost = new MemoryProfiler.Common.Controls.Control(this.findElement("snapshotTab"));
                this._snapshotProcessingProgressDiv = this.findElement("snapshotProcessingProgressDiv");
                this._snapshotProcessingDiv = this.findElement("snapshotProcessing");
                this._progressText = this.findElement("progressText");
                this._progressBar = this.findElement("progressBar");
                this._snapshotProcessingError = this.findElement("snapshotProcessingError");
                this._snapshotProcessingErrorMsg = this.findElement("snapshotProcessingErrorMsg");
                this.findElement("snapshotProcessingErrorLabel").innerText = Microsoft.Plugin.Resources.getString("ErrorWhileProcessing");
                this.uiUpdateViews();
                this.updateProgress();
            }
            Object.defineProperty(DetailsView.prototype, "currentTabItem", {
                get: function () {
                    if (this._tabControl && this._tabControl.selectedItem) {
                        return this._tabControl.selectedItem;
                    }
                    return null;
                },
                enumerable: true,
                configurable: true
            });
            DetailsView.prototype.switchToDataView = function (viewType) {
                // Change the tab to be the view requested
                this._tabControl.selectedItem = this._tabControl.getTab(viewType);
            };
            DetailsView.prototype.onPropertyChanged = function (propertyName) {
                var _this = this;
                switch (propertyName) {
                    case "latestSnapshotError":
                        this.updateSnapshotError();
                        break;
                    case "progressText":
                    case "progressValue":
                        this.updateProgress();
                        break;
                    case "processingComplete":
                        this._settingsView.initializeViewSettings().done(function () {
                            _this.uiUpdateViews();
                        });
                        break;
                    case "targetView":
                        this.updateTargetView();
                        break;
                }
            };
            DetailsView.prototype.forEachTab = function (action) {
                for (var i = 0; i < this._tabControl.length(); i++) {
                    var tab = this._tabControl.getTab(i);
                    action(tab);
                }
            };
            DetailsView.prototype.updateProgress = function () {
                if (this._model.progressText) {
                    this._progressText.innerText = this._model.progressText;
                }
                if (this._model.progressValue) {
                    this._progressBar.value = this._model.progressValue;
                }
            };
            DetailsView.prototype.updateTargetView = function () {
                if (this._tabControl) {
                    var viewType = this._model.targetView;
                    for (var i = 0; i < this._tabControl.length(); i++) {
                        var tabItem = this._tabControl.getTab(i);
                        if (tabItem.viewType === viewType) {
                            this._tabControl.selectedItem = tabItem;
                        }
                    }
                }
            };
            DetailsView.prototype.updateSnapshotError = function () {
                var error = this._model.latestSnapshotError;
                if (error) {
                    // Show the message
                    this._snapshotProcessingErrorMsg.innerText = MemoryProfiler.Common.ErrorFormatter.format(error);
                    this.toggleProcessingUI(/*showError*/ true, /*showProgress*/ false);
                }
                else {
                    // Hide the message
                    this._snapshotProcessingErrorMsg.innerText = "";
                    this.toggleProcessingUI(/*showError*/ false, /*showProgress*/ false);
                }
            };
            DetailsView.prototype.getNewTab = function (dataViewType) {
                var tabContent;
                if (dataViewType === DetailsViewType.managedHeap) {
                    tabContent = new Details.ManagedHeapViewer(this._model);
                }
                else if (dataViewType === DetailsViewType.nativeHeap) {
                    tabContent = new Details.NativeHeapViewer(this._model);
                }
                return new Details.DetailsViewTabItem(dataViewType, tabContent);
            };
            DetailsView.prototype.shouldCreateTabForViewType = function (viewType) {
                return (viewType === DetailsViewType.managedHeap && this._model.targetRuntime !== MemoryProfiler.Common.Extensions.TargetRuntime.native) ||
                    (viewType === DetailsViewType.nativeHeap && this._model.targetRuntime !== MemoryProfiler.Common.Extensions.TargetRuntime.managed);
            };
            DetailsView.prototype.populateTabs = function () {
                var dataViewTypes = MemoryProfiler.Common.Enum.GetValues(DetailsViewType);
                for (var i = 0; i < dataViewTypes.length; i++) {
                    var dataViewType = dataViewTypes[i];
                    if (this.shouldCreateTabForViewType(dataViewType)) {
                        var tabItem = this.getNewTab(dataViewType);
                        this._tabControl.addTab(tabItem);
                    }
                }
            };
            DetailsView.prototype.uiUpdateViews = function () {
                var _this = this;
                this.updateSnapshotError();
                if (this._tabControl) {
                    this._tabControlHost.removeChild(this._tabControl);
                }
                if (this._model.processingComplete) {
                    this._tabControlHost.rootElement.classList.remove("dataViewersHidden");
                    this.toggleProcessingUI(/*showError*/ false, /*showProgress*/ false);
                    this._tabControl = new MemoryProfiler.Common.Controls.TabControl();
                    this._tabControl.tabsLeftAligned = true;
                    this._tabControl.afterBarContainer.appendChild(this._settingsView);
                    MemoryProfiler.Common.MemoryProfilerViewHost.session.getSessionStartupTime().then(function (startTime) {
                        MemoryProfiler.Common.MemoryProfilerViewHost.session.getSessionInfo().done(function (sessionInfo) {
                            var beginTime = sessionInfo.targetTimespan.Item1 > 0 ? sessionInfo.targetTimespan.Item1 - startTime : sessionInfo.targetTimespan.Item1;
                            _this._controller.model.targetTimespan = new Microsoft.VisualStudio.DiagnosticsHub.JsonTimespan(Microsoft.VisualStudio.DiagnosticsHub.BigNumber.convertFromNumber(beginTime), Microsoft.VisualStudio.DiagnosticsHub.BigNumber.convertFromNumber(sessionInfo.targetTimespan.Item2 - startTime));
                            _this._controller.model.targetRuntime = sessionInfo.targetRuntime;
                            _this.populateTabs();
                            _this._controller.setTargetView(MemoryProfiler.Common.Enum.Parse(DetailsViewType, sessionInfo.targetView), sessionInfo.sortProperty);
                            _this.updateTargetView();
                            _this._settingsView.onTabChanged();
                            _this._tabControl.selectedItemChanged = function () {
                                MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_ToggleManagedNativeSelectionStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_ToggleManagedNativeSelectionEnd);
                                _this._model.targetView = _this._tabControl.selectedItem.viewType;
                                _this._settingsView.onTabChanged();
                            };
                        });
                    });
                    this._tabControlHost.appendChild(this._tabControl);
                }
                else {
                    this._tabControlHost.rootElement.classList.add("dataViewersHidden");
                    this.toggleProcessingUI(/*showError*/ false, /*showProgress*/ true);
                }
            };
            DetailsView.prototype.toggleProcessingUI = function (showError, showProgress) {
                if (showError || showProgress) {
                    this._snapshotProcessingDiv.style.display = "block";
                    this._snapshotProcessingError.style.display = showError === true ? "block" : "none";
                    this._snapshotProcessingProgressDiv.style.display = showProgress === true ? "block" : "none";
                }
                else {
                    this._snapshotProcessingDiv.style.display = "none";
                }
            };
            return DetailsView;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Details.DetailsView = DetailsView;
        var SettingsView = (function (_super) {
            __extends(SettingsView, _super);
            function SettingsView(model) {
                var _this = this;
                _super.call(this, "SettingsTemplate");
                this._model = model;
                //
                // Text filter input
                //
                this._filterInput = this.findElement("filterInput");
                // Hook up the text changed event
                this._filterInput.onkeydown = function (e) {
                    _this.handleFilterKeydownEvent(e);
                };
                this._filterInput.oninput = function (e) {
                    if (_this._filterInput.value === "") {
                        _this.clearCurrentFilterString();
                    }
                };
            }
            Object.defineProperty(SettingsView.prototype, "initialized", {
                get: function () { return this._initialized; },
                enumerable: true,
                configurable: true
            });
            SettingsView.prototype.clearCurrentFilterString = function () {
                if (this._model.targetView === DetailsViewType.managedHeap) {
                    this._model.managedFilterString = "";
                }
                else if (this._model.targetView === DetailsViewType.nativeHeap) {
                    this._model.nativeFilterString = "";
                }
            };
            SettingsView.prototype.initializeViewSettings = function () {
                var _this = this;
                // These come from the session so when a DetailsView is closed and another is 
                // started (in the same session), any view settings changed by the user are transfered
                return new Microsoft.Plugin.Promise(function (completed) {
                    MemoryProfiler.Common.MemoryProfilerViewHost.session.getSessionInfo().done(function (info) {
                        _this._model.collapseSmallObjects = info.detailsViewSettings["collapseSmallObjects"];
                        _this._model.justMyCodeManaged = info.detailsViewSettings["justMyCodeManaged"];
                        _this._model.justMyCodeNative = info.detailsViewSettings["justMyCodeNative"];
                        // ToDo: rename showTransientBytes to include FreedAllocations
                        _this._model.showTransientBytes = info.detailsViewSettings["includeFreedAllocations"];
                        // 
                        // Settings menu
                        //
                        var settingsMenuButton = _this.findElement("settingsMenuButton");
                        settingsMenuButton.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("SettingsMenuButtonTooltipText"));
                        settingsMenuButton.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("SettingsMenuButtonTooltipText"));
                        _this._settingsMenu = new MemoryProfiler.Common.Controls.MenuControl(settingsMenuButton);
                        _this._settingsMenu.addToggleItem(Microsoft.Plugin.Resources.getString("ViewSettingsCollapseSmallObjectsMenuItem"), _this.toggleCollapseSmallObjects.bind(_this), _this._model.collapseSmallObjects, 3);
                        _this._settingsMenu.addToggleItem(Microsoft.Plugin.Resources.getString("ViewSettingsJustMyCodeMenuItem"), _this.toggleJustMyCodeManaged.bind(_this), _this._model.justMyCodeManaged, 3);
                        _this._settingsMenu.addToggleItem(Microsoft.Plugin.Resources.getString("ViewSettingsShowTransientBytesMenuItem"), _this.toggleShowTransientBytes.bind(_this), _this._model.showTransientBytes, 3);
                        _this._settingsMenu.addToggleItem(Microsoft.Plugin.Resources.getString("ViewSettingsJustMyCodeMenuItem"), _this.toggleJustMyCodeNative.bind(_this), _this._model.justMyCodeNative, 3);
                        _this._model.viewSettingsInitialized = true;
                        completed();
                    });
                });
            };
            SettingsView.prototype.handleFilterKeydownEvent = function (e) {
                var keyCode = e.keyCode;
                if (keyCode === MemoryProfiler.Common.KeyCodes.ESCAPE) {
                    this._filterInput.value = "";
                    this.clearCurrentFilterString();
                }
                if (this._model.targetView === DetailsViewType.managedHeap && keyCode === MemoryProfiler.Common.KeyCodes.ENTER) {
                    this._model.managedFilterString = this._filterInput.value;
                }
                else if (this._model.targetView === DetailsViewType.nativeHeap && (keyCode === MemoryProfiler.Common.KeyCodes.ENTER || keyCode === MemoryProfiler.Common.KeyCodes.F3)) {
                    this._model.nativeFilterString = this._filterInput.value;
                    if (keyCode === MemoryProfiler.Common.KeyCodes.F3) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }
            };
            SettingsView.prototype.onTabChanged = function () {
                if (this._model.targetView === DetailsViewType.managedHeap) {
                    this._settingsMenu.getMenuItem(0).classList.remove("hidden");
                    this._settingsMenu.getMenuItem(1).classList.remove("hidden");
                    this._settingsMenu.getMenuItem(2).classList.add("hidden");
                    this._settingsMenu.getMenuItem(3).classList.add("hidden");
                    // restore the value of the filter textbox with the managed value
                    this._filterInput.value = this._model.managedFilterString;
                    this._filterInput.placeholder = Microsoft.Plugin.Resources.getString("Filter");
                    this._filterInput.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("Filter"));
                    this._filterInput.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("Filter"));
                }
                else if (this._model.targetView === DetailsViewType.nativeHeap) {
                    this._settingsMenu.getMenuItem(0).classList.add("hidden");
                    this._settingsMenu.getMenuItem(1).classList.add("hidden");
                    this._settingsMenu.getMenuItem(2).classList.remove("hidden");
                    this._settingsMenu.getMenuItem(3).classList.remove("hidden");
                    // restore the value of the filter textbox with the native value
                    this._filterInput.value = this._model.nativeFilterString;
                    this._filterInput.placeholder = Microsoft.Plugin.Resources.getString("Find");
                    this._filterInput.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("Find"));
                    this._filterInput.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("Find"));
                }
            };
            SettingsView.prototype.toggleCollapseSmallObjects = function () {
                this._model.collapseSmallObjects = !this._model.collapseSmallObjects;
                return this._model.collapseSmallObjects;
            };
            SettingsView.prototype.toggleJustMyCodeManaged = function () {
                this._model.justMyCodeManaged = !this._model.justMyCodeManaged;
                return this._model.justMyCodeManaged;
            };
            SettingsView.prototype.toggleJustMyCodeNative = function () {
                this._model.justMyCodeNative = !this._model.justMyCodeNative;
                return this._model.justMyCodeNative;
            };
            SettingsView.prototype.toggleShowTransientBytes = function () {
                this._model.showTransientBytes = !this._model.showTransientBytes;
                return this._model.showTransientBytes;
            };
            return SettingsView;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Details.SettingsView = SettingsView;
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
//
// Copyright (C) Microsoft. All rights reserved.
//
//--------
// External CommonMerged references.  These are included explicitly in the csproj
// as the CommonMerged.d.ts is generated at build-time.
// If we reference them here, TSC 1.8.10 includes the source in the merged JS file
// which is not what we want.
//--------
// <reference path="../../Common/Extensions/Session.ts" />
// <reference path="../../Common/controls/control.ts" />
// <reference path="../../Common/controls/componentModel.ts" />
// <reference path="../../Common/Profiler/MemoryProfilerViewHost.ts" />
//--------
/// <reference path="DetailsView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Details;
    (function (Details) {
        "use strict";
        var DetailsViewHost = (function (_super) {
            __extends(DetailsViewHost, _super);
            function DetailsViewHost() {
                _super.call(this);
            }
            DetailsViewHost.prototype.initializeView = function (sessionInfo) {
                var logger = this.getLogger();
                if (logger)
                    logger.debug("CDiag::DetailsViewHost.initializeView()");
                this.detailsViewController = new Details.DetailsViewController();
                document.getElementById('mainContainer').appendChild(this.detailsViewController.view.rootElement);
                this.detailsViewController.loadSnapshot();
                if (logger)
                    logger.debug("CDiag::DetailsViewHost.initializeView(): Completed");
            };
            DetailsViewHost.prototype.getLogger = function () {
                if (Microsoft.VisualStudio.DiagnosticsHub) {
                    return Microsoft.VisualStudio.DiagnosticsHub.getLogger();
                }
                else {
                    return null;
                }
            };
            return DetailsViewHost;
        }(MemoryProfiler.Common.MemoryProfilerViewHostBase));
        Details.DetailsViewHost = DetailsViewHost;
        Details.DetailsViewHostInstance = new DetailsViewHost();
    })(Details = MemoryProfiler.Details || (MemoryProfiler.Details = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
MemoryProfiler.Details.DetailsViewHostInstance.loadView();
/// <reference path="../../../../../common/script/Hub/plugin.redirect.d.ts" />
var Debugger;
(function (Debugger) {
    var ManagedMemoryAnalyzer;
    (function (ManagedMemoryAnalyzer) {
        var HeapViewer;
        (function (HeapViewer) {
            Microsoft.Plugin.addEventListener("pluginready", function () {
                /*
                    The code that follows allows us to dynamically inject our test loader code. We need this to be executed
                    always, so this is the best location.
               */
                try {
                    var apex = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Microsoft.Test.Apex.VisualStudio.JavaScriptInjection.ApexExtensionMarshaler", {}, true);
                    if (apex !== null) {
                        apex._call("getApexJavaScript").done(function (result) {
                            if (result) {
                                console.log("got apex javascript files");
                                var scriptObj = document.createElement("script");
                                scriptObj.setAttribute("type", "text/javascript");
                                scriptObj.setAttribute("src", result);
                                var head = document.getElementsByTagName("head");
                                if (!head) {
                                    console.log("Unable to add apex script to document");
                                }
                                else {
                                    head[0].appendChild(scriptObj);
                                    console.log("Added ApexJSExtension '" + result + "' to document");
                                }
                            }
                            else {
                                console.log("No file was returned by getApexJavaScript, cannot inject TestExtension.ts for ApexJS framework");
                            }
                        }, function (error) {
                            console.log("Error when calling getApexJavaScript function:" + String(error));
                        });
                    }
                    else {
                        console.log("Unable to connect to port marshaler 'Microsoft.Test.Apex.VisualStudio.JavaScriptInjection.ApexExtensionMarshaler'");
                    }
                }
                catch (e) {
                    console.log(e.toString());
                }
            });
        })(HeapViewer = ManagedMemoryAnalyzer.HeapViewer || (ManagedMemoryAnalyzer.HeapViewer = {}));
    })(ManagedMemoryAnalyzer = Debugger.ManagedMemoryAnalyzer || (Debugger.ManagedMemoryAnalyzer = {}));
})(Debugger || (Debugger = {}));
//# sourceMappingURL=DetailsViewMerged.js.map