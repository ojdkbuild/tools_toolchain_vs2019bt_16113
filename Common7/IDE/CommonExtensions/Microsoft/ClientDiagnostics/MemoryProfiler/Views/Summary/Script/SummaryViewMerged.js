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
// <reference path="../../Common/Util/keyCodes.ts" />
// <reference path="../../Common/Controls/templateControl.ts" />
// <reference path="../../Common/Util/formattingHelpers.ts" />
// <reference path="../../Common/controls/componentModel.ts" />
// <reference path="../../Common/Profiler/SnapshotSummary.ts" />
//--------
/// <reference path="../../../../../common/script/Hub/plugin.redirect.d.ts" />
/// <reference path="SummaryView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Summary;
    (function (Summary) {
        "use strict";
        var SnapshotTileViewModel = (function (_super) {
            __extends(SnapshotTileViewModel, _super);
            function SnapshotTileViewModel(summary, snapshotSummaryCollection) {
                _super.call(this);
                this._summary = summary;
                this._snapshotSummaryCollection = snapshotSummaryCollection;
            }
            Object.defineProperty(SnapshotTileViewModel.prototype, "summaryData", {
                get: function () { return this._summary; },
                set: function (v) {
                    this._summary = v;
                    this.raisePropertyChanged("summaryData");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "timeTaken", {
                get: function () {
                    var date = new Date(this._summary.snapshot.timestamp);
                    return "(" + date.toLocaleTimeString() + ")";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeSize", {
                get: function () {
                    return this.summaryData.nativeTotalSize;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeSizeDisplayString", {
                get: function () {
                    return MemoryProfiler.Common.FormattingHelpers.getPrettyPrintSize(this.nativeSize);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeCount", {
                get: function () {
                    return this.summaryData.nativeTotalCount;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeCountDisplayString", {
                get: function () {
                    return Microsoft.Plugin.Resources.getString("NativeCount", MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(this.nativeCount, true));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeSizeDiff", {
                get: function () {
                    var previousSnapshot = this.getPreviousSnapshot();
                    if (previousSnapshot) {
                        return this._summary.nativeTotalSize - previousSnapshot.nativeTotalSize;
                    }
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeSizeDiffDisplayString", {
                get: function () {
                    if (this.nativeSizeDiff === 0) {
                        return Microsoft.Plugin.Resources.getString("NoDiff");
                    }
                    else {
                        return MemoryProfiler.Common.FormattingHelpers.getPrettyPrintSize(this.nativeSizeDiff, true);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeCountDiff", {
                get: function () {
                    var previousSnapshot = this.getPreviousSnapshot();
                    if (previousSnapshot) {
                        return this._summary.nativeTotalCount - previousSnapshot.nativeTotalCount;
                    }
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "nativeCountDiffDisplayString", {
                get: function () {
                    if (this.nativeCountDiff === 0) {
                        return Microsoft.Plugin.Resources.getString("NoDiff");
                    }
                    else {
                        return MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(this.nativeCountDiff, true, true);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedSize", {
                get: function () {
                    return this.summaryData.managedTotalSize;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedSizeDisplayString", {
                get: function () {
                    return MemoryProfiler.Common.FormattingHelpers.getPrettyPrintSize(this.managedSize);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedCount", {
                get: function () {
                    return this.summaryData.managedTotalCount;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedCountDisplayString", {
                get: function () {
                    return Microsoft.Plugin.Resources.getString("ManagedCount", MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(this.managedCount, true));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedSizeDiff", {
                get: function () {
                    var previousSnapshot = this.getPreviousSnapshot();
                    if (previousSnapshot) {
                        return this._summary.managedTotalSize - previousSnapshot.managedTotalSize;
                    }
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedSizeDiffDisplayString", {
                get: function () {
                    if (this.managedSizeDiff === 0) {
                        return Microsoft.Plugin.Resources.getString("NoDiff");
                    }
                    else {
                        return MemoryProfiler.Common.FormattingHelpers.getPrettyPrintSize(this.managedSizeDiff, true);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedCountDiff", {
                get: function () {
                    var previousSnapshot = this.getPreviousSnapshot();
                    if (previousSnapshot) {
                        return this._summary.managedTotalCount - previousSnapshot.managedTotalCount;
                    }
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "managedCountDiffDisplayString", {
                get: function () {
                    if (this.managedCountDiff === 0) {
                        return Microsoft.Plugin.Resources.getString("NoDiff");
                    }
                    else {
                        return MemoryProfiler.Common.FormattingHelpers.getDecimalLocaleString(this.managedCountDiff, true, true);
                    }
                },
                enumerable: true,
                configurable: true
            });
            SnapshotTileViewModel.prototype.getComparableSnapshots = function () {
                var result = [];
                for (var i = 0; i < this._snapshotSummaryCollection.length; i++) {
                    var summary = this._snapshotSummaryCollection.getItem(i);
                    if (summary.id !== this._summary.id) {
                        result.push(summary);
                    }
                }
                return result;
            };
            Object.defineProperty(SnapshotTileViewModel.prototype, "isFirstSnapshot", {
                get: function () {
                    return this.getPreviousSnapshot() === null;
                },
                enumerable: true,
                configurable: true
            });
            // Note we assume id === array index
            SnapshotTileViewModel.prototype.getPreviousSnapshot = function () {
                var previousId = this._summary.id - 1;
                if (previousId >= 0 && previousId < this._snapshotSummaryCollection.length) {
                    return this._snapshotSummaryCollection.getItem(previousId);
                }
                return null;
            };
            return SnapshotTileViewModel;
        }(MemoryProfiler.Common.Controls.ObservableViewModel));
        Summary.SnapshotTileViewModel = SnapshotTileViewModel;
        var SnapshotTileView = (function (_super) {
            __extends(SnapshotTileView, _super);
            function SnapshotTileView(controller, model) {
                _super.call(this, "SnapshotTileTemplate");
                this._controller = controller;
                this._model = model;
                this._controller.model.registerPropertyChanged(this);
                this._model.registerPropertyChanged(this);
                this._tileContextMenuItems = [];
                this._snapshotTile = this.findElement("snapshotTile");
                this._tileHeader = this.findElement("snapshotTileHeader");
                this.findElement("snapshotTileTitle").innerText = Microsoft.Plugin.Resources.getString("SnapshotNumber", this._model.summaryData.id + 1);
                this._screenshotHolder = this.findElement("snapshotTileImage");
                this._screenshotNotAvailableMessage = this.findElement("screenshotNotAvailableMessage");
                if (this._model.summaryData.snapshot.screenshotFile) {
                    this._screenshotHolder.src = this._model.summaryData.snapshot.screenshotFile;
                    this._screenshotNotAvailableMessage.style.display = "none";
                }
                this.findElement("snapshotTakenDate").innerText = this._model.timeTaken;
                this._screenshotNotAvailableMessage.innerText = Microsoft.Plugin.Resources.getString("ScreenshotNotAvailable");
                this._snapshotLoadingProgress = this.findElement("loadingSnapshotProgress");
                this.populateContextMenu();
                this.updateUI();
            }
            SnapshotTileView.prototype.updateUI = function () {
                this.populateWarningsSection();
                this.populateSummaryLinks();
                this.updateSnapshotDisplayType();
                this.updateLoadingProgress();
            };
            SnapshotTileView.prototype.populateWarningsSection = function () {
                this.findElement("snapshotTileWarnings").style.visibility = "hidden";
            };
            SnapshotTileView.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case "snapshotDisplayType":
                        this.updateSnapshotDisplayType();
                        break;
                    case "summaryData":
                        this.updateUI();
                        break;
                }
            };
            SnapshotTileView.prototype.updateLoadingProgress = function () {
                if (this._model.summaryData.isProcessingCompleted) {
                    this._screenshotHolder.style.visibility = "";
                    this._screenshotNotAvailableMessage.style.visibility = "";
                    this._snapshotLoadingProgress.style.visibility = "hidden";
                    this.updateSnapshotDisplayType();
                }
                else {
                    this._managedSummaryDiv.style.visibility = "hidden";
                    this._nativeSummaryDiv.style.visibility = "hidden";
                    this._screenshotHolder.style.visibility = "hidden";
                    this._screenshotNotAvailableMessage.style.visibility = "hidden";
                    this._snapshotLoadingProgress.style.visibility = "";
                }
            };
            SnapshotTileView.prototype.updateSnapshotDisplayType = function () {
                if (this._controller.model.snapshotDisplayType === Summary.SnapshotDisplayType.managed) {
                    this._managedSummaryDiv.style.visibility = this._model.summaryData.isProcessingCompleted ? "" : "hidden";
                    this._nativeSummaryDiv.style.visibility = "hidden";
                }
                else if (this._controller.model.snapshotDisplayType === Summary.SnapshotDisplayType.native) {
                    this._managedSummaryDiv.style.visibility = "hidden";
                    this._nativeSummaryDiv.style.visibility = this._model.summaryData.isProcessingCompleted ? "" : "hidden";
                }
            };
            SnapshotTileView.prototype.onCollectionChanged = function (eventArgs) {
                if (eventArgs.action === MemoryProfiler.Common.Controls.NotifyCollectionChangedAction.Add) {
                    var newSummary = eventArgs.newItems[0];
                    if (this._model.summaryData.id !== newSummary.id) {
                        var contextMenuItem = {
                            callback: this.onDiffToSnapshot.bind(this, newSummary.id),
                            disabled: this.shouldDisableCompareMenu.bind(this),
                            label: Microsoft.Plugin.Resources.getString("SnapshotNumber", newSummary.id + 1),
                            type: Microsoft.Plugin.ContextMenu.MenuItemType.command
                        };
                        this._tileContextMenuItems.push(contextMenuItem);
                    }
                    this.createContextMenu();
                }
            };
            SnapshotTileView.prototype.createContextMenu = function () {
                if (this._tileContextMenu) {
                    this._tileContextMenu.detach(this._snapshotTile);
                }
                if (this._tileContextMenuItems.length > 0) {
                    var compareToMenuItem = {
                        callback: function () { },
                        label: Microsoft.Plugin.Resources.getString("CompareTo"),
                        disabled: this.shouldDisableCompareMenu.bind(this),
                        submenu: this._tileContextMenuItems,
                        type: Microsoft.Plugin.ContextMenu.MenuItemType.command
                    };
                    this._tileContextMenu = Microsoft.Plugin.ContextMenu.create([compareToMenuItem]);
                    this._tileContextMenu.attach(this._snapshotTile);
                }
            };
            SnapshotTileView.prototype.shouldDisableCompareMenu = function () {
                return this._controller.model.restoringSnapshots;
            };
            SnapshotTileView.prototype.populateContextMenu = function () {
                var comparableSnapshots = this._model.getComparableSnapshots();
                for (var i = 0; i < comparableSnapshots.length; i++) {
                    var comparable = comparableSnapshots[i];
                    var contextMenuItem = {
                        callback: this.onDiffToSnapshot.bind(this, comparable.id),
                        disabled: this.shouldDisableCompareMenu.bind(this),
                        label: Microsoft.Plugin.Resources.getString("SnapshotNumber", comparable.id + 1),
                        type: Microsoft.Plugin.ContextMenu.MenuItemType.command
                    };
                    this._tileContextMenuItems.push(contextMenuItem);
                }
                this.createContextMenu();
            };
            SnapshotTileView.prototype.populateSummaryLinks = function () {
                // Managed data
                this._managedSummaryDiv = this.findElement("managedSummaryData");
                var managedCountLink = this.findElement("managedCountLink");
                var managedSizeLink = this.findElement("managedSizeLink");
                var managedCountDiffLink = this.findElement("managedCountDiffLink");
                var managedCountDiffIndicatorIcon = this.findElement("managedCountDiffIndicatorIcon");
                var managedSizeDiffLink = this.findElement("managedSizeDiffLink");
                var managedSizeDiffIndicatorIcon = this.findElement("managedSizeDiffIndicatorIcon");
                managedCountLink.innerText = this._model.managedCountDisplayString;
                managedSizeLink.innerText = this._model.managedSizeDisplayString;
                managedSizeLink.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("ManagedSizeLinkTooltip"));
                managedCountLink.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("ManagedCountLinkTooltip"));
                managedSizeLink.onclick = this.onManagedSizeClick.bind(this);
                managedCountLink.onclick = this.onManagedCountClick.bind(this);
                if (!this._model.isFirstSnapshot) {
                    managedSizeDiffLink.onclick = this.onManagedSizeDiffClick.bind(this);
                    managedCountDiffLink.onclick = this.onManagedCountDiffClick.bind(this);
                }
                this.populateDiffLinks(managedSizeDiffLink, managedSizeDiffIndicatorIcon, this._model.managedSizeDiff, this._model.managedSizeDiffDisplayString, Microsoft.Plugin.Resources.getString("ManagedSizeDiffLinkTooltip"));
                this.populateDiffLinks(managedCountDiffLink, managedCountDiffIndicatorIcon, this._model.managedCountDiff, this._model.managedCountDiffDisplayString, Microsoft.Plugin.Resources.getString("ManagedCountDiffLinkTooltip"));
                // Native data
                this._nativeSummaryDiv = this.findElement("nativeSummaryData");
                var nativeCountLink = this.findElement("nativeCountLink");
                var nativeSizeLink = this.findElement("nativeSizeLink");
                var nativeCountDiffLink = this.findElement("nativeCountDiffLink");
                var nativeCountDiffIndicatorIcon = this.findElement("nativeCountDiffIndicatorIcon");
                var nativeSizeDiffLink = this.findElement("nativeSizeDiffLink");
                var nativeSizeDiffIndicatorIcon = this.findElement("nativeSizeDiffIndicatorIcon");
                nativeCountLink.innerText = this._model.nativeCountDisplayString;
                nativeSizeLink.innerText = this._model.nativeSizeDisplayString;
                nativeCountLink.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("NativeCountLinkTooltip"));
                nativeSizeLink.setAttribute("data-plugin-vs-tooltip", Microsoft.Plugin.Resources.getString("NativeSizeLinkTooltip"));
                nativeSizeLink.onclick = this.onNativeSizeClick.bind(this);
                nativeCountLink.onclick = this.onNativeCountClick.bind(this);
                if (!this._model.isFirstSnapshot) {
                    nativeSizeDiffLink.onclick = this.onNativeSizeDiffClick.bind(this);
                    nativeCountDiffLink.onclick = this.onNativeCountDiffClick.bind(this);
                }
                this.populateDiffLinks(nativeSizeDiffLink, nativeSizeDiffIndicatorIcon, this._model.nativeSizeDiff, this._model.nativeSizeDiffDisplayString, Microsoft.Plugin.Resources.getString("NativeSizeDiffLinkTooltip"));
                this.populateDiffLinks(nativeCountDiffLink, nativeCountDiffIndicatorIcon, this._model.nativeCountDiff, this._model.nativeCountDiffDisplayString, Microsoft.Plugin.Resources.getString("NativeCountDiffLinkTooltip"));
                var links = this.findElementsByClassName("BPT-FileLink");
                for (var linkIndex = 0; linkIndex < links.length; linkIndex++) {
                    var linkElement = links[linkIndex];
                    linkElement.onkeydown = this.onLinkElementKeyDown.bind(linkElement);
                }
            };
            SnapshotTileView.prototype.onLinkElementKeyDown = function (e) {
                if ((e.keyCode === MemoryProfiler.Common.KeyCodes.ENTER || e.keyCode === MemoryProfiler.Common.KeyCodes.SPACE) && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.srcElement.click();
                }
            };
            SnapshotTileView.prototype.populateDiffLinks = function (element, iconElement, delta, deltaDisplayString, deltaTooltip) {
                if (!this._model.isFirstSnapshot) {
                    element.innerText = deltaDisplayString;
                    element.setAttribute("data-plugin-vs-tooltip", deltaTooltip);
                    if (delta > 0) {
                        iconElement.classList.add("increaseIcon");
                    }
                    else if (delta < 0) {
                        iconElement.classList.add("decreaseIcon");
                    }
                }
                else {
                    element.classList.remove("BPT-FileLink");
                    element.classList.add("baselineText");
                    element.innerText = Microsoft.Plugin.Resources.getString("Baseline");
                    element.tabIndex = -1;
                }
            };
            SnapshotTileView.prototype.onManagedSizeClick = function (e) {
                this._controller.openManagedSizeDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onManagedCountClick = function (e) {
                this._controller.openManagedCountDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onManagedSizeDiffClick = function (e) {
                this._controller.openManagedSizeDiffDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onManagedCountDiffClick = function (e, target) {
                this._controller.openManagedCountDiffDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onNativeSizeClick = function (e) {
                this._controller.openNativeSizeDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onNativeCountClick = function (e) {
                this._controller.openNativeCountDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onNativeSizeDiffClick = function (e) {
                this._controller.openNativeSizeDiffDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onNativeCountDiffClick = function (e, target) {
                this._controller.openNativeCountDiffDetails(this._model.summaryData.id);
            };
            SnapshotTileView.prototype.onDiffToSnapshot = function (id) {
                if (this._controller.model.snapshotDisplayType == Summary.SnapshotDisplayType.managed) {
                    this._controller.openManagedSnapshotDiffDetails(this._model.summaryData.id, id);
                }
                else {
                    this._controller.openNativeSnapshotDiffDetails(this._model.summaryData.id, id);
                }
            };
            return SnapshotTileView;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Summary.SnapshotTileView = SnapshotTileView;
    })(Summary = MemoryProfiler.Summary || (MemoryProfiler.Summary = {}));
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
// <reference path="../../common/controls/componentModel.ts" />
// <reference path="../../common/controls/templateControl.ts" />
// <reference path="../../common/util/errorFormatter.ts" />
// <reference path="../../common/Profiler/MemoryProfilerViewHost.ts" />
// <reference path="../../common/Profiler/Snapshot.ts" />
// <reference path="../../common/Profiler/SnapshotSummary.ts" />
// <reference path="../../common/Profiler/SnapshotEngine.ts" />
// <reference path="../../common/Profiler/SummaryEngine.ts" />
// <reference path="../../common/Profiler/SummaryAgent.ts" />
// <reference path="../../common/Profiler/ClrSnapshotAgent.ts" />
// <reference path="../../common/Profiler/ScreenshotSnapshotAgent.ts" />
// <reference path="../../common/Profiler/NativeSummaryAgent.ts" />
// <reference path="../../common/Profiler/ManagedSummaryAgent.ts" />
// <reference path="../../common/Profiler/FeedbackConstants.ts" />
//--------
/// <reference path="snapshotTileView.ts" />
/// <reference path="snapshotHeapTypeToggle.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Summary;
    (function (Summary) {
        "use strict";
        var Common = MemoryProfiler.Common;
        var SummaryViewController = (function () {
            function SummaryViewController(sessionInfo) {
                this._pendingSnapshots = [];
                this._summaryAgents = [];
                Common.MemoryProfilerViewHost.startCodeMarker(Common.CodeMarkerValues.perfMP_ViewLoadStart, Common.CodeMarkerValues.perfMP_ViewLoadEnd);
                this.model = new SummaryViewModel();
                this.view = new SummaryView(this, this.model);
                // DiagHub uses the documentSessionId as the subdomain for ScriptedControls it creates. Since our tool creates details view
                // on its own it needs to know the documentSessionId of the active session so that Daytona would not create a new ScriptedBox
                // Process to run the new control on.
                this._loadDataWarehousePromise = Microsoft.VisualStudio.DiagnosticsHub.DataWarehouse.loadDataWarehouse();
                this._loadDataWarehousePromise.then(function (dataWareHouse) {
                    Common.MemoryProfilerViewHost.session.setScriptedContextId(dataWareHouse.getConfiguration().sessionId);
                });
                if (sessionInfo.snapshots.length === 0) {
                    this.model.warningMessage = Microsoft.Plugin.Resources.getString("NoSnapshotsTakenWarning");
                    ;
                    Common.MemoryProfilerViewHost.endCodeMarker(Common.CodeMarkerValues.perfMP_ViewLoadStart);
                    return;
                }
                this.loadExistingSnapshots(sessionInfo);
                // Determine what heaps we're supporting.  If supporting managed + native, we need a toggle-bar.
                // Until we hook up User Settings, we only know if target is managed(+native), or just native
                // Once we have User Settings, we'll have a 3rd option: managed-only
                if (sessionInfo.targetRuntime === Common.Extensions.TargetRuntime.mixed) {
                    this.view.initializeToggleBar();
                }
                else if (sessionInfo.targetRuntime === Common.Extensions.TargetRuntime.native) {
                    // We default to MANAGED unless we're only showing native.
                    this.model.snapshotDisplayType = Summary.SnapshotDisplayType.native;
                }
            }
            SummaryViewController.prototype.loadExistingSnapshots = function (sessioninfo) {
                var _this = this;
                var snapshots = sessioninfo.snapshots;
                var snapshotAgents = [];
                Common.MemoryProfilerViewHost.session.logBeginLoadSnapshots();
                snapshotAgents.push(new Common.ScreenshotSnapshotAgent());
                if (sessioninfo.targetRuntime !== Common.Extensions.TargetRuntime.native) {
                    snapshotAgents.push(new Common.ClrSnapshotAgent());
                    this._summaryAgents.push(new Common.ManagedSummaryAgent());
                }
                if (sessioninfo.targetRuntime !== Common.Extensions.TargetRuntime.managed) {
                    this._summaryAgents.push(new Common.NativeSummaryAgent(this._loadDataWarehousePromise));
                }
                this.model.restoringSnapshots = true;
                this._pendingSnapshots = [];
                for (var i = 0; i < snapshots.length; i++) {
                    var restoreEngine = new Common.SnapshotRestoreEngine(i, snapshotAgents, snapshots[i]);
                    restoreEngine.restore(function (snapshot) {
                        _this._pendingSnapshots.push(snapshot);
                        _this.model.snapshotSummaryCollection.add(new Common.SnapshotSummary(snapshot));
                    });
                }
                // OK, restoration complete.  That should have been the quick & easy part.
                // Initialize each summary agent in parallel
                Common.MemoryProfilerViewHost.session.getSessionStartupTime().then(function (sessionStartTime) {
                    var promises = [];
                    _this._summaryAgents.forEach(function (agent) {
                        promises.push(agent.initializeAnalyzerData(sessionStartTime, _this._pendingSnapshots));
                    });
                    return Microsoft.Plugin.Promise.join(promises);
                }).done(function () {
                    // Now, we kick off analysis by reversing the queue and popping of the first snapshot to tackle
                    _this._pendingSnapshots.reverse();
                    _this.processNextSnapshotSummary();
                });
            };
            SummaryViewController.prototype.openManagedSizeDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenManagedHeapViewBySize, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.viewSnapshot(snapshotId, "ManagedHeap", "RetainedSize");
            };
            SummaryViewController.prototype.openManagedCountDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenManagedHeapViewByCount, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.viewSnapshot(snapshotId, "ManagedHeap", "Count");
            };
            SummaryViewController.prototype.openManagedSizeDiffDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenDiffManagedHeapViewBySize, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.compareSnapshots(snapshotId, snapshotId - 1, "ManagedHeap", "RetainedSizeDiff");
            };
            SummaryViewController.prototype.openManagedCountDiffDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenDiffManagedHeapViewByCount, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.compareSnapshots(snapshotId, snapshotId - 1, "ManagedHeap", "CountDiff");
            };
            SummaryViewController.prototype.openManagedSnapshotDiffDetails = function (snapshotId1, snapshotId2) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenDiffManagedHeapView, Common.FeedbackCommandInvokeMethodNames.Menu, Common.FeedbackCommandSourceNames.SummaryView);
                this.compareSnapshots(Math.max(snapshotId1, snapshotId2), Math.min(snapshotId1, snapshotId2), "ManagedHeap", "RetainedSizeDiff");
            };
            SummaryViewController.prototype.openNativeSizeDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenNativeHeapViewBySize, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.viewSnapshot(snapshotId, "NativeHeap", "OutstandingSize");
            };
            SummaryViewController.prototype.openNativeCountDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenNativeHeapViewByCount, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.viewSnapshot(snapshotId, "NativeHeap", "OutstandingCount");
            };
            SummaryViewController.prototype.openNativeSizeDiffDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenDiffNativeHeapViewBySize, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.compareSnapshots(snapshotId, snapshotId - 1, "NativeHeap", "OutstandingSizeDiff");
            };
            SummaryViewController.prototype.openNativeCountDiffDetails = function (snapshotId) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenDiffNativeHeapViewByCount, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                this.compareSnapshots(snapshotId, snapshotId - 1, "NativeHeap", "OutstandingCountDiff");
            };
            SummaryViewController.prototype.openNativeSnapshotDiffDetails = function (snapshotId1, snapshotId2) {
                Common.MemoryProfilerViewHost.session.logCommandUsage(Common.FeedbackCommandNames.OpenDiffNativeHeapView, Common.FeedbackCommandInvokeMethodNames.Menu, Common.FeedbackCommandSourceNames.SummaryView);
                this.compareSnapshots(Math.max(snapshotId1, snapshotId2), Math.min(snapshotId1, snapshotId2), "NativeHeap", "OutstandingSizeDiff");
            };
            SummaryViewController.prototype.viewSnapshot = function (snapshotId, target, sortProperty) {
                Common.MemoryProfilerViewHost.session.openSnapshotDetails(snapshotId, target, sortProperty);
            };
            SummaryViewController.prototype.compareSnapshots = function (lastSnapshotId, firstSnapshotId, target, sortProperty) {
                Common.MemoryProfilerViewHost.session.openSnapshotDiff(firstSnapshotId, lastSnapshotId, target, sortProperty);
            };
            SummaryViewController.prototype.reset = function () {
                this.model.snapshotSummaryCollection.clear();
                Common.MemoryProfilerViewHost.onIdle();
            };
            SummaryViewController.prototype.processNextSnapshotSummary = function () {
                if (this._pendingSnapshots.length == 0) {
                    this.summaryProcessCleanup();
                }
                else {
                    var snapshot = this._pendingSnapshots.pop();
                    this._summaryEngine = new Common.SummaryEngine(snapshot, this._summaryAgents);
                    this._summaryEngine.processSummary().done(this.onSummaryProcessComplete.bind(this), this.onSummaryProcessError.bind(this), this.onSummaryProcessProgress.bind(this));
                }
            };
            SummaryViewController.prototype.cancelSummaryProcessing = function () {
                if (this._summaryEngine) {
                    this._summaryEngine.cancel();
                    this.summaryProcessCleanup();
                }
            };
            SummaryViewController.prototype.onSummaryProcessComplete = function (summary) {
                for (var i = 0; i < this.model.snapshotSummaryCollection.length; i++) {
                    if (this.model.snapshotSummaryCollection.getItem(i).id === summary.id) {
                        this.model.snapshotSummaryCollection.replace(i, summary);
                        break;
                    }
                }
                this.processNextSnapshotSummary();
            };
            SummaryViewController.prototype.onSummaryProcessError = function (error) {
                /// need to report the error!
                this.summaryProcessCleanup();
            };
            SummaryViewController.prototype.onSummaryProcessProgress = function (progress) {
                // UI during analysis would be nice :)
            };
            SummaryViewController.prototype.summaryProcessCleanup = function () {
                this._summaryEngine = null;
                this._summaryAgents = null;
                this._pendingSnapshots = [];
                this.model.restoringSnapshots = false;
                // If we had snapshots to restore, we're now done loading the view
                //
                // !! NOTE: The order of code markers is important for automation. !!
                // We need to make sure ViewLoad fires after RestoringSnapshots
                // (fired by setting restoringSnapshots above).
                //
                Common.MemoryProfilerViewHost.endCodeMarker(Common.CodeMarkerValues.perfMP_ViewLoadStart);
                Common.MemoryProfilerViewHost.session.logEndLoadSnapshots();
            };
            return SummaryViewController;
        }());
        Summary.SummaryViewController = SummaryViewController;
        var SummaryViewModel = (function (_super) {
            __extends(SummaryViewModel, _super);
            function SummaryViewModel() {
                _super.call(this);
                this._warningMessage = "";
                this._restoringSnapshots = false;
                this._snapshotDisplayType = Summary.SnapshotDisplayType.managed;
                this._snapshotSummaryCollection = new Common.Controls.ObservableCollection();
                // Note: In the future, we may have per-view default settings. For now, log the defaults as coming from the corresponding views.
                this.LogSelectSnapshotViewCommand(this.snapshotDisplayType, Common.FeedbackCommandInvokeMethodNames.Default, Common.FeedbackCommandSourceNames.SummaryView);
            }
            Object.defineProperty(SummaryViewModel.prototype, "snapshotSummaryCollection", {
                get: function () { return this._snapshotSummaryCollection; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SummaryViewModel.prototype, "warningMessage", {
                get: function () { return this._warningMessage; },
                set: function (v) {
                    if (this._warningMessage !== v) {
                        this._warningMessage = v;
                        this.raisePropertyChanged("warningMessage");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SummaryViewModel.prototype, "snapshotDisplayType", {
                get: function () { return this._snapshotDisplayType; },
                set: function (v) {
                    if (this._snapshotDisplayType !== v) {
                        this._snapshotDisplayType = v;
                        this.LogSelectSnapshotViewCommand(v, Common.FeedbackCommandInvokeMethodNames.Control, Common.FeedbackCommandSourceNames.SummaryView);
                        this.raisePropertyChanged("snapshotDisplayType");
                    }
                },
                enumerable: true,
                configurable: true
            });
            SummaryViewModel.prototype.LogSelectSnapshotViewCommand = function (v, invokeMethodName, commandSourceName) {
                var feedbackCommandName;
                if (v === Summary.SnapshotDisplayType.managed) {
                    feedbackCommandName = Common.FeedbackCommandNames.SelectManagedHeapSnapshotView;
                }
                else {
                    feedbackCommandName = Common.FeedbackCommandNames.SelectNativeHeapSnapshotView;
                }
                Common.MemoryProfilerViewHost.session.logCommandUsage(feedbackCommandName, invokeMethodName, commandSourceName);
            };
            Object.defineProperty(SummaryViewModel.prototype, "restoringSnapshots", {
                get: function () {
                    return this._restoringSnapshots;
                },
                set: function (v) {
                    if (this._restoringSnapshots !== v) {
                        this._restoringSnapshots = v;
                        this.raisePropertyChanged("restoringSnapshots");
                        if (this._restoringSnapshots) {
                            Common.MemoryProfilerViewHost.startCodeMarker(Common.CodeMarkerValues.perfMP_SnapshotRestoreStart, Common.CodeMarkerValues.perfMP_SnapshotRestoreEnd);
                        }
                        else {
                            Common.MemoryProfilerViewHost.endCodeMarker(Common.CodeMarkerValues.perfMP_SnapshotRestoreStart);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            return SummaryViewModel;
        }(Common.Controls.ObservableViewModel));
        Summary.SummaryViewModel = SummaryViewModel;
        var SummaryView = (function (_super) {
            __extends(SummaryView, _super);
            function SummaryView(controller, model) {
                _super.call(this, "SummaryViewTemplate");
                this._controller = controller;
                this._model = model;
                this._snapshotTileViewModelCollection = [];
                this._model.registerPropertyChanged(this);
                this._model.snapshotSummaryCollection.registerCollectionChanged(this);
                this._tilesContainer = this.findElement("tilesContainer");
                this._warningSection = this.findElement("warningSection");
            }
            Object.defineProperty(SummaryView.prototype, "snapshotTileViewModelCollection", {
                get: function () {
                    return this._snapshotTileViewModelCollection;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SummaryView.prototype, "tilesContainer", {
                get: function () {
                    return this._tilesContainer;
                },
                enumerable: true,
                configurable: true
            });
            SummaryView.prototype.initializeToggleBar = function () {
                this._snapshotToggleBar = this.findElement("toggleTabSection");
                var toggle = new Summary.SnapshotHeapTypeToggle(this._model);
                this._snapshotToggleBar.appendChild(toggle.rootElement);
            };
            SummaryView.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case "warningMessage":
                        this.showWarningMessage(this._model.warningMessage);
                        break;
                }
            };
            SummaryView.prototype.onCollectionChanged = function (eventArgs) {
                switch (eventArgs.action) {
                    case Common.Controls.NotifyCollectionChangedAction.Add:
                        this.createTile(eventArgs.newItems[0]);
                        break;
                    case Common.Controls.NotifyCollectionChangedAction.Reset:
                        this.removeSnapshotTiles();
                        break;
                    case Common.Controls.NotifyCollectionChangedAction.Replace:
                        this.updateTile(eventArgs.newItems[0]);
                        break;
                }
            };
            SummaryView.prototype.updateTile = function (snapshotSummary) {
                for (var i = 0; i < this._snapshotTileViewModelCollection.length; i++) {
                    if (this._snapshotTileViewModelCollection[i].summaryData.id === snapshotSummary.id) {
                        this._snapshotTileViewModelCollection[i].summaryData = snapshotSummary;
                        break;
                    }
                }
            };
            SummaryView.prototype.createTile = function (snapshotSummary) {
                // Create the model and the view
                var model = new Summary.SnapshotTileViewModel(snapshotSummary, this._model.snapshotSummaryCollection);
                var newTile = new Summary.SnapshotTileView(this._controller, model);
                this._model.snapshotSummaryCollection.registerCollectionChanged(newTile);
                this._snapshotTileViewModelCollection.push(model);
                this._tilesContainer.appendChild(newTile.rootElement);
                newTile.rootElement.focus();
            };
            SummaryView.prototype.removeSnapshotTiles = function () {
                while (this._tilesContainer.hasChildNodes()) {
                    this._tilesContainer.removeChild(this._tilesContainer.firstChild);
                }
                this._snapshotTileViewModelCollection = [];
            };
            SummaryView.prototype.toggleProgress = function (show) {
                if (this._snapshotProgress && this._snapshotError) {
                    if (show) {
                        this._snapshotLabel.style.display = "none";
                        this._snapshotIcon.style.display = "none";
                        this._snapshotProgress.style.display = "block";
                        this._snapshotError.style.display = "none";
                    }
                    else {
                        this._snapshotLabel.style.display = "";
                        this._snapshotIcon.style.display = "";
                        this._snapshotProgress.style.display = "none";
                    }
                }
            };
            SummaryView.prototype.showSnapshotError = function (error) {
                if (this._snapshotErrorMsg && this._snapshotError) {
                    if (error) {
                        // Show the message
                        this._snapshotErrorMsg.innerText = Common.ErrorFormatter.format(error);
                        this._snapshotError.style.display = "block";
                    }
                    else {
                        // Hide the message
                        this._snapshotErrorMsg.innerText = "";
                        this._snapshotError.style.display = "none";
                    }
                }
            };
            SummaryView.prototype.showWarningMessage = function (warning) {
                if (!this._warningSection) {
                    return;
                }
                if (warning) {
                    this._warningSection.innerHTML = warning;
                    this._warningSection.style.display = "-ms-grid";
                }
                else {
                    this._warningSection.innerHTML = "";
                    this._warningSection.style.display = "none";
                }
            };
            return SummaryView;
        }(Common.Controls.TemplateControl));
        Summary.SummaryView = SummaryView;
    })(Summary = MemoryProfiler.Summary || (MemoryProfiler.Summary = {}));
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
// <reference path="../../Common/Controls/templateControl.ts" />
//--------
/// <reference path="SummaryView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Summary;
    (function (Summary) {
        "use strict";
        (function (SnapshotDisplayType) {
            SnapshotDisplayType[SnapshotDisplayType["managed"] = 0] = "managed";
            SnapshotDisplayType[SnapshotDisplayType["native"] = 1] = "native";
        })(Summary.SnapshotDisplayType || (Summary.SnapshotDisplayType = {}));
        var SnapshotDisplayType = Summary.SnapshotDisplayType;
        var SnapshotHeapTypeToggle = (function (_super) {
            __extends(SnapshotHeapTypeToggle, _super);
            function SnapshotHeapTypeToggle(viewModel) {
                _super.call(this, "SnapshotHeapTypeToggleTemplate");
                this._summaryViewModel = viewModel;
                this._summaryViewModel.registerPropertyChanged(this);
                this._managedHeapButton = this.findElement("snapshotToggleTabManagedButton");
                this._nativeHeapButton = this.findElement("snapshotToggleTabdNativeButton");
                this.findElement("snapshotToggleTabLabel").innerText = Microsoft.Plugin.Resources.getString("SnapshotToggleTabLabel");
                ;
                this._managedHeapButton.innerHTML = Microsoft.Plugin.Resources.getString("SnapshotToggleTabManagedButton");
                this._nativeHeapButton.innerText = Microsoft.Plugin.Resources.getString("SnapshotToggleTabNativeButton");
                this._managedHeapButton.onclick = this.setManagedHeapToggleButtonSelected.bind(this);
                this._nativeHeapButton.onclick = this.setNativeHeapToggleButtonSelected.bind(this);
                var toggleButtons = this.findElementsByClassName("toggleTabButtonContainer");
                for (var buttomIndex = 0; buttomIndex < toggleButtons.length; buttomIndex++) {
                    var buttonElement = toggleButtons[buttomIndex];
                    buttonElement.onkeydown = this.onButtonElementKeyDown.bind(buttonElement);
                }
                this.updateUI();
            }
            SnapshotHeapTypeToggle.prototype.onButtonElementKeyDown = function (e) {
                if ((e.keyCode === MemoryProfiler.Common.KeyCodes.ENTER || e.keyCode === MemoryProfiler.Common.KeyCodes.SPACE) && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.srcElement.click();
                }
            };
            SnapshotHeapTypeToggle.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case "snapshotDisplayType":
                        this.updateUI();
                        break;
                }
            };
            SnapshotHeapTypeToggle.prototype.updateUI = function () {
                var isManagedSelected = this._summaryViewModel.snapshotDisplayType === SnapshotDisplayType.managed;
                if (isManagedSelected) {
                    this._managedHeapButton.classList.remove("toggleTabButtonContainer");
                    this._managedHeapButton.classList.add("toggleTabButtonContainerSelected");
                    this._managedHeapButton.classList.add("toggleTabSelectedButtonOutline");
                    this._nativeHeapButton.classList.remove("toggleTabSelectedButtonOutline");
                    this._nativeHeapButton.classList.remove("toggleTabButtonContainerSelected");
                    this._nativeHeapButton.classList.add("toggleTabButtonContainer");
                }
                else if (this._summaryViewModel.snapshotDisplayType === SnapshotDisplayType.native) {
                    this._nativeHeapButton.classList.remove("toggleTabButtonContainer");
                    this._nativeHeapButton.classList.add("toggleTabButtonContainerSelected");
                    this._nativeHeapButton.classList.add("toggleTabSelectedButtonOutline");
                    this._managedHeapButton.classList.remove("toggleTabSelectedButtonOutline");
                    this._managedHeapButton.classList.remove("toggleTabButtonContainerSelected");
                    this._managedHeapButton.classList.add("toggleTabButtonContainer");
                }
                this._nativeHeapButton.setAttribute("aria-checked", isManagedSelected ? "false" : "true");
                this._managedHeapButton.setAttribute("aria-checked", isManagedSelected ? "true" : "false");
            };
            SnapshotHeapTypeToggle.prototype.setManagedHeapToggleButtonSelected = function () {
                this._summaryViewModel.snapshotDisplayType = SnapshotDisplayType.managed;
            };
            SnapshotHeapTypeToggle.prototype.setNativeHeapToggleButtonSelected = function () {
                this._summaryViewModel.snapshotDisplayType = SnapshotDisplayType.native;
            };
            return SnapshotHeapTypeToggle;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Summary.SnapshotHeapTypeToggle = SnapshotHeapTypeToggle;
    })(Summary = MemoryProfiler.Summary || (MemoryProfiler.Summary = {}));
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
/// <reference path="SummaryView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Summary;
    (function (Summary) {
        "use strict";
        var SummaryViewHost = (function (_super) {
            __extends(SummaryViewHost, _super);
            function SummaryViewHost() {
                _super.call(this);
            }
            SummaryViewHost.prototype.initializeView = function (sessionInfo) {
                this.summaryViewController = new Summary.SummaryViewController(sessionInfo);
                document.getElementById('mainContainer').appendChild(this.summaryViewController.view.rootElement);
            };
            return SummaryViewHost;
        }(MemoryProfiler.Common.MemoryProfilerViewHostBase));
        Summary.SummaryViewHost = SummaryViewHost;
        Summary.SummaryViewHostInstance = new SummaryViewHost();
    })(Summary = MemoryProfiler.Summary || (MemoryProfiler.Summary = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
MemoryProfiler.Summary.SummaryViewHostInstance.loadView();
//# sourceMappingURL=SummaryViewMerged.js.map
// SIG // Begin signature block
// SIG // MIIjkAYJKoZIhvcNAQcCoIIjgTCCI30CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4oKNG1RgiPRZBQrOZokB7hz1+YBGHpWduUz+bSNXinig
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIH005WKit2X8virPHnJo
// SIG // n4AAaEncMJrOtc3H9m4jqTTqMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAoCSIsrafqu9GGIGalKMJbU6EDjuhEiRtA02b
// SIG // tL+vezYt7iz9K3KLnwQ4qZ9Tw5DGrr6wGYBdUaFRMcyb
// SIG // Kkj6PNWIHsCUeVIPRIFlDSOhys7Bg4eh6nd+Bbn9OowX
// SIG // 8i6D12/RfmG1Uniej3WvBV5k1KJaiaebt2DwaU+r0nsR
// SIG // M281T/MvetP28hva2CA4tbmmoza636Q59uIcpg0fb8Fw
// SIG // qkBgqNf8qtKz5rA4Pb+p8W5E8vPRFlOo3G4xgg35pIaP
// SIG // uGJNPGu2lJ6R0jDwDZ0MXwO/5y7qjgTqcBV+/AI3WH8K
// SIG // EyoM+dJszhpl44lHGD1PWnk2mYWY/TnjexSaqHZuTqGC
// SIG // EvEwghLtBgorBgEEAYI3AwMBMYIS3TCCEtkGCSqGSIb3
// SIG // DQEHAqCCEsowghLGAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBN4eoN
// SIG // 6tauy5nspcHhZbNCQ7ku+vL6KCVOAGsq2FKLEgIGYPsL
// SIG // I+JnGBMyMDIxMDgwMzIxMDE0NS4yNjZaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046MEE1Ni1F
// SIG // MzI5LTRENEQxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2Wggg5EMIIE9TCCA92gAwIBAgIT
// SIG // MwAAAVt8sLo0ZzfBpwAAAAABWzANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MTAxMTQxOTAyMTZaFw0yMjA0MTExOTAyMTZaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046MEE1Ni1FMzI5LTRENEQx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
// SIG // AoIBAQDIJH+l7PXaoXrLpi5bZ5epcI4g9Y4fiKc/+o+a
// SIG // uQkM0p22lbqOCogokqa+VraqlZQ+50/91l+ler3KTUFe
// SIG // XHbVVcGnzaS598hfn0TaFFodUPbvFxokl/GM1UvKuvCT
// SIG // xYkTuBzMzKSwmko3H0GSHegorpMi0K7ip0hcHRoTMROx
// SIG // gmsmkPGQ8hDx7PwtseAAGDBbFTrLEnUfI2/H8wHpN0jZ
// SIG // WbVSndCm/IqPt15EOeDL1F1fXFS9f3g3V1VQQajoR86C
// SIG // bMvnNsv7N1voBF/EG/Tv24wZEeoSGjsBAMOzbuNP0zFX
// SIG // 8Fye4OUfxzVwre3OCGozTeFvgroHsrC52G6kZlvpAgMB
// SIG // AAGjggEbMIIBFzAdBgNVHQ4EFgQUZectNYhtt1MgXUx/
// SIG // 9eU5yZi6qy4wHwYDVR0jBBgwFoAU1WM6XIoxkPNDe3xG
// SIG // G8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNU
// SIG // aW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG
// SIG // 9w0BAQsFAAOCAQEApzNrO6YTGpnOEHVaJaztWV0YgzFF
// SIG // XYLvf8qvIO5CFZfn5JVFdlZaLrevn6TqgBp3sDLcHpxb
// SIG // WoFYVSfB2rvDcJPiAIQdAdOA6GzQ8O7+ChEwEX/CjfIE
// SIG // x+ge0Yx4a3jA1oO4nFdA7KI/DCAPAIq1pcH+J6/KSh9J
// SIG // 9qxE7HgSQ1nN3W1NCEyRB9UcxYRpFuyMzT0AjteuU6ez
// SIG // S516eJmmc6FcfD8ojjTun8g2a9MqlbofTqlh/nz2WEP2
// SIG // GBcoccvoR1jrqmKXPNz4Z9bwNAHtflp+G53umRoz8USO
// SIG // rMbDCJHQVw9ByS8je2H0q2zlQGMI2Fjh63rBmbr6BGhI
// SIG // A0VlKzCCBnEwggRZoAMCAQICCmEJgSoAAAAAAAIwDQYJ
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
// SIG // CxMdVGhhbGVzIFRTUyBFU046MEE1Ni1FMzI5LTRENEQx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAAq7QW6mMtK/mBi7
// SIG // VGhVUVv2Ie6moIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDktAnR
// SIG // MCIYDzIwMjEwODAzMjIzMDQxWhgPMjAyMTA4MDQyMjMw
// SIG // NDFaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOS0CdEC
// SIG // AQAwCgIBAAICIpICAf8wBwIBAAICEb0wCgIFAOS1W1EC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQCbGroLER8ZEt8wTwJFn9wxAwE0X2g6
// SIG // WhsCUzkXjUzauG6gpzfG+DUszfpw2owxJxdicn2F3zkv
// SIG // OfVfaqGu/JPHZJVD9x73KmmXnXG7iLhPgS9KU2Bp7AqH
// SIG // OlQxMJONaqNZPSJQXtfnPGTwz+jhlqPbizoVLYifQBdE
// SIG // JuOlOGHF2jGCAw0wggMJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABW3ywujRnN8GnAAAA
// SIG // AAFbMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // ICNWsp2c+Zd7bZqofBGiWNWZyQtLaKIeQN6elIPO/s2e
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgySLg
// SIG // qShjEYeJQhrnBjxwjSe46vTE23t5kNhbUmSwhRkwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAVt8sLo0ZzfBpwAAAAABWzAiBCAOFGO8g5sV3u31
// SIG // dAjwN8AXv9pElOsKkob9ndgmngP+gTANBgkqhkiG9w0B
// SIG // AQsFAASCAQA6GILm7N7M4DK6n6ribzxtvsSyfd+xNrAy
// SIG // wSmq05K3T7mYvuL5zEt9lxoJivbJfBX3SMMpxkJYxWDq
// SIG // havWEyalq0uOynlvfAMuFgbiLXb6+4fEQtDwbqQbfiKT
// SIG // xICYLcZBlGre3rdq6E731pbCYmWlQqs2bP0UqwAoasN9
// SIG // 0isILCMD6ImwwxXevnyEHgopHwXZTrOX+5TlK8dxlL6e
// SIG // r6Mn5FUvHpoQlktM09eZ+YbZeVm37BZ0rHjc5nIFkOn3
// SIG // SFMi5Wct5ran9S6jOdcxf4B157ueRUexghyTEdm94oFU
// SIG // S8LhKFd1YQKHuXfVRwk/DhgLkD7I6vtgGyto2FEK2Jnz
// SIG // End signature block
