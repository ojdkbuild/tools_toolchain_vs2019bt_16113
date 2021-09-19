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
// <reference path="../../Common/Controls/templateControl.ts" />
// <reference path="../../Common/Util/formattingHelpers.ts" />
// <reference path="../../Common/controls/componentModel.ts" />
// <reference path="../../Common/Profiler/Snapshot.ts" />
//--------
/// <reference path="../../../../../common/script/Hub/plugin.redirect.d.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Collection;
    (function (Collection) {
        "use strict";
        var SnapshotTileViewModel = (function () {
            function SnapshotTileViewModel(summary) {
                this._summary = summary;
            }
            Object.defineProperty(SnapshotTileViewModel.prototype, "summaryData", {
                get: function () {
                    return this._summary;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SnapshotTileViewModel.prototype, "timeTaken", {
                get: function () {
                    var date = new Date(this._summary.timestamp);
                    return "(" + date.toLocaleTimeString() + ")";
                },
                enumerable: true,
                configurable: true
            });
            return SnapshotTileViewModel;
        }());
        Collection.SnapshotTileViewModel = SnapshotTileViewModel;
        var SnapshotTileView = (function (_super) {
            __extends(SnapshotTileView, _super);
            function SnapshotTileView(model) {
                _super.call(this, "SnapshotTileTemplate");
                this._model = model;
                this._snapshotTile = this.findElement("snapshotTile");
                this._tileHeader = this.findElement("snapshotTileHeader");
                this._screenshotNotAvailableMessage = this.findElement("screenshotNotAvailableMessage");
                this.findElement("snapshotTileTitle").innerText = Microsoft.Plugin.Resources.getString("SnapshotNumber", this._model.summaryData.id);
                if (this._model.summaryData.screenshotFile) {
                    var imgHolder = this.findElement("snapshotTileImage");
                    imgHolder.src = this._model.summaryData.screenshotFile;
                    this._screenshotNotAvailableMessage.style.display = "none";
                }
                this.findElement("snapshotTakenDate").innerText = this._model.timeTaken;
                this.findElement("stopToSeeSnapshotDetails").innerText = Microsoft.Plugin.Resources.getString("StopToSeeSnapshotMessage");
                this._screenshotNotAvailableMessage.innerText = Microsoft.Plugin.Resources.getString("ScreenshotNotAvailable");
            }
            return SnapshotTileView;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Collection.SnapshotTileView = SnapshotTileView;
    })(Collection = MemoryProfiler.Collection || (MemoryProfiler.Collection = {}));
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
// <reference path="../../../../../common/script/util/notifications.ts" />
// <reference path="../../common/controls/componentModel.ts" />
// <reference path="../../common/controls/templateControl.ts" />
// <reference path="../../common/util/EnumHelper.ts" />
// <reference path="../../common/Profiler/MemoryNotifications.ts" />
// <reference path="../../common/util/errorFormatter.ts" />
// <reference path="../../common/Profiler/MemoryProfilerViewHost.ts" />
// <reference path="../../common/Profiler/SnapshotEngine.ts" />
// <reference path="../../common/Profiler/ClrSnapshotAgent.ts" />
// <reference path="../../common/Profiler/ScreenshotSnapshotAgent.ts" />
// <reference path="../../common/Profiler/FeedbackConstants.ts" />
//--------
/// <reference path="../../../../../common/script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../../../../../common/script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="CollectionAgentTask.ts" />
/// <reference path="snapshotTileView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Collection;
    (function (Collection) {
        "use strict";
        var CollectionViewController = (function () {
            function CollectionViewController(initializeView) {
                var _this = this;
                if (initializeView === void 0) { initializeView = true; }
                this._screenshotHeight = 150;
                this._screenshotKeepAspectRatio = true;
                this._screenshotWidth = 200;
                this._agentGuid = "2E8E6F4B-6107-4F46-8BEA-A920EA880452"; // This is the guid of MemoryProfilerCollectionAgent
                this._activeCollectionAgentTasks = [];
                this.model = new CollectionViewModel();
                if (initializeView) {
                    this.view = new CollectionView(this, this.model);
                }
                this._takeSnapshotTask = new Collection.TakeSnapshotTask(this);
                this._forceGcTask = new Collection.ForceGcCollectionAgentTask(this);
                MemoryProfiler.Common.MemoryProfilerViewHost.session.getSessionInfo().then(function (info) {
                    _this._agentGuid = info.agentGuid;
                    _this._standardCollector = Microsoft.VisualStudio.DiagnosticsHub.Collectors.getStandardTransportService();
                    if (_this._standardCollector) {
                        _this._standardCollector.addMessageListener(new Microsoft.VisualStudio.DiagnosticsHub.Guid(_this._agentGuid), _this.onMessageReceived.bind(_this));
                    }
                });
            }
            Object.defineProperty(CollectionViewController.prototype, "isCollectionAgentTaskActive", {
                get: function () {
                    return this._activeCollectionAgentTasks.length > 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CollectionViewController.prototype, "managedDataSeen", {
                get: function () {
                    return this._managedDataSeen;
                },
                set: function (v) {
                    this._managedDataSeen = v;
                },
                enumerable: true,
                configurable: true
            });
            CollectionViewController.prototype.takeSnapshot = function () {
                this._activeCollectionAgentTasks.push(this._takeSnapshotTask);
                return this._takeSnapshotTask.start();
            };
            CollectionViewController.prototype.forceGarbageCollection = function () {
                this._activeCollectionAgentTasks.push(this._forceGcTask);
                return this._forceGcTask.start();
            };
            CollectionViewController.prototype.setScreenshotSize = function (targetWidth, targetHeight, keepAspectRatio) {
                // Set the size of all future screenshots that are taken of the application
                this._screenshotWidth = targetWidth;
                this._screenshotHeight = targetHeight;
                this._screenshotKeepAspectRatio = keepAspectRatio;
            };
            CollectionViewController.prototype.reset = function () {
                CollectionViewController._nextIdentifier = 1;
                this.model.snapshotSummaryCollection.clear();
                MemoryProfiler.Common.MemoryProfilerViewHost.onIdle();
            };
            CollectionViewController.prototype.sendStringToCollectionAgent = function (request) {
                return this._standardCollector.sendStringToCollectionAgent(this._agentGuid, request);
            };
            CollectionViewController.prototype.downloadFile = function (targetFilePath, localFilePath) {
                var transportService = Microsoft.VisualStudio.DiagnosticsHub.Collectors.getStandardTransportService();
                return transportService.downloadFile(targetFilePath, localFilePath);
            };
            CollectionViewController.prototype.getSnapshotSummary = function (snapshotId) {
                var foundSnapshotSummary = null;
                for (var i = 0; i < this.model.snapshotSummaryCollection.length; i++) {
                    var snapshotSummary = this.model.snapshotSummaryCollection.getItem(i);
                    if (snapshotSummary.id === snapshotId) {
                        foundSnapshotSummary = snapshotSummary;
                        break;
                    }
                }
                return foundSnapshotSummary;
            };
            CollectionViewController.prototype.onMessageReceived = function (message) {
                if (message) {
                    var obj = JSON.parse(message);
                    if (obj) {
                        if (obj.eventName) {
                            switch (obj.eventName) {
                                case "notifyManagedPresent":
                                    this.managedDataSeen = true;
                                    MemoryProfiler.Common.MemoryProfilerViewHost.session.getSessionInfo().then(function (info) {
                                        if (info.targetRuntime === MemoryProfiler.Common.Extensions.TargetRuntime.managed || info.targetRuntime === MemoryProfiler.Common.Extensions.TargetRuntime.mixed) {
                                            Collection.CollectionViewHost.CommandChain.onTargetIsManaged();
                                        }
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                        else if (obj.cmd) {
                            switch (obj.cmd) {
                                case "log":
                                    MemoryProfiler.Common.MemoryProfilerViewHost.logMessage(obj.msg);
                                    break;
                                default:
                                    MemoryProfiler.Common.MemoryProfilerViewHost.logMessage("Unexpected Command from agent: " + message);
                                    break;
                            }
                            return; // Commands are not passed on to active tasks - eventName messages (and everything else) are.
                        }
                    }
                }
                for (var i = this._activeCollectionAgentTasks.length - 1; i >= 0; i--) {
                    if (this._activeCollectionAgentTasks[i].isCompleted(message)) {
                        this._activeCollectionAgentTasks.splice(i, 1);
                    }
                }
            };
            CollectionViewController.prototype.sendMessage = function (message) {
                this._standardCollector.sendStringToCollectionAgent(this._agentGuid, message).done(function (response) {
                    if (response && response.length > 0) {
                        var obj = JSON.parse(response);
                        if (!obj.succeeded) {
                            throw new Error(obj.errorMessage);
                        }
                    }
                });
            };
            CollectionViewController._snapshotChunkSize = 32768;
            CollectionViewController._nextIdentifier = 1;
            return CollectionViewController;
        }());
        Collection.CollectionViewController = CollectionViewController;
        var CollectionViewModel = (function (_super) {
            __extends(CollectionViewModel, _super);
            function CollectionViewModel() {
                _super.call(this);
                this._warningMessage = "";
                this._latestSnapshotError = null;
                this._isTakingSnapshot = false;
                this._isForcingGarbageCollection = false;
                this._snapshotSummaryCollection = new MemoryProfiler.Common.Controls.ObservableCollection();
            }
            Object.defineProperty(CollectionViewModel.prototype, "snapshotSummaryCollection", {
                get: function () { return this._snapshotSummaryCollection; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CollectionViewModel.prototype, "warningMessage", {
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
            Object.defineProperty(CollectionViewModel.prototype, "latestSnapshotError", {
                get: function () { return this._latestSnapshotError; },
                set: function (v) {
                    if (this._latestSnapshotError !== v) {
                        this._latestSnapshotError = v;
                        this.raisePropertyChanged("latestSnapshotError");
                        // Create the WER
                        MemoryProfiler.Common.MemoryProfilerViewHost.reportError(v, "SnapshotCapturingFailure");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CollectionViewModel.prototype, "isTakingSnapshot", {
                get: function () { return this._isTakingSnapshot; },
                set: function (v) {
                    if (this._isTakingSnapshot !== v) {
                        this._isTakingSnapshot = v;
                        this.raisePropertyChanged("isTakingSnapshot");
                        this.raisePropertyChanged("isViewBusy");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CollectionViewModel.prototype, "isForcingGarbageCollection", {
                get: function () { return this._isForcingGarbageCollection; },
                set: function (v) {
                    if (this._isForcingGarbageCollection !== v) {
                        this._isForcingGarbageCollection = v;
                        this.raisePropertyChanged("isForcingGarbageCollection");
                        this.raisePropertyChanged("isViewBusy");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CollectionViewModel.prototype, "isViewBusy", {
                get: function () { return this._isForcingGarbageCollection || this._isTakingSnapshot; },
                enumerable: true,
                configurable: true
            });
            return CollectionViewModel;
        }(MemoryProfiler.Common.Controls.ObservableViewModel));
        Collection.CollectionViewModel = CollectionViewModel;
        var CollectionView = (function (_super) {
            __extends(CollectionView, _super);
            function CollectionView(controller, model) {
                _super.call(this, "CollectionViewTemplate");
                this._screenshotWidth = 280;
                this._screenshotHeight = 160;
                this._screenshotKeepAspectRatio = true;
                this._controller = controller;
                this._model = model;
                this.rootElement.classList.add("collectionViewRoot");
                this._model.registerPropertyChanged(this);
                this._model.snapshotSummaryCollection.registerCollectionChanged(this);
                this._snapshotTileViewModelCollection = [];
                this._tilesContainer = this.findElement("tilesContainer");
                this._warningSection = this.findElement("warningSection");
                this._onSnapshotClickHandler = this.onSnapshotClick.bind(this);
                this._takeSnapshotTile = this.findElement("takeSnapshotTile");
                this._snapshotError = this.findElement("snapshotError");
                this._snapshotErrorMsg = this.findElement("snapshotErrorMsg");
                this._snapshotProgress = this.findElement("takeSnapshotProgress");
                this._snapshotButton = this.findElement("takeSnapshotButton");
                this._snapshotLabel = this.findElement("takeSnapshotLabel");
                this._snapshotIcon = this.findElement("takeSnapshotIcon");
                this._snapshotLabel.innerText = Microsoft.Plugin.Resources.getString("TakeSnapshot");
                this._snapshotProgress.innerText = Microsoft.Plugin.Resources.getString("Loading");
                this.toggleProgress(this._model.isViewBusy);
                this.updateTakeSnapshotButton();
                this._snapshotButton.addEventListener("click", this._onSnapshotClickHandler);
                this._controller.setScreenshotSize(this._screenshotWidth, this._screenshotHeight, this._screenshotKeepAspectRatio);
                Microsoft.Plugin.Theme.processInjectedSvg(this.rootElement);
            }
            Object.defineProperty(CollectionView.prototype, "snapshotTileViewModelCollection", {
                get: function () {
                    return this._snapshotTileViewModelCollection;
                },
                enumerable: true,
                configurable: true
            });
            CollectionView.prototype.onPropertyChanged = function (propertyName) {
                switch (propertyName) {
                    case "warningMessage":
                        this.showWarningMessage(this._model.warningMessage);
                        break;
                    case "latestSnapshotError":
                        this.showSnapshotError(this._model.latestSnapshotError);
                        break;
                    case "isTakingSnapshot":
                        this.toggleProgress(this._model.isViewBusy);
                        this.updateTakeSnapshotButton();
                        break;
                    case "isForcingGarbageCollection":
                        this.updateTakeSnapshotButton();
                        break;
                }
            };
            CollectionView.prototype.onCollectionChanged = function (eventArgs) {
                switch (eventArgs.action) {
                    case MemoryProfiler.Common.Controls.NotifyCollectionChangedAction.Add:
                        this.createTile(eventArgs.newItems[0]);
                        break;
                    case MemoryProfiler.Common.Controls.NotifyCollectionChangedAction.Reset:
                        this.removeSnapshotTiles();
                        break;
                }
            };
            CollectionView.prototype.createTile = function (snapshotSummary) {
                // Create the model and the view
                var model = new Collection.SnapshotTileViewModel(snapshotSummary);
                var newTile = new Collection.SnapshotTileView(model);
                this._snapshotTileViewModelCollection.push(model);
                this._tilesContainer.insertBefore(newTile.rootElement, this._takeSnapshotTile);
                newTile.rootElement.focus();
            };
            CollectionView.prototype.removeSnapshotTiles = function () {
                while (this._tilesContainer.hasChildNodes()) {
                    this._tilesContainer.removeChild(this._tilesContainer.firstChild);
                }
                this._tilesContainer.appendChild(this._takeSnapshotTile);
                this._snapshotTileViewModelCollection = [];
            };
            CollectionView.prototype.toggleProgress = function (show) {
                if (this._snapshotProgress && this._snapshotError) {
                    if (show) {
                        this._snapshotLabel.style.display = "none";
                        this._snapshotIcon.style.display = "none";
                        this._snapshotProgress.style.display = "block";
                        this._snapshotError.style.display = "none";
                        this._snapshotButton.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("Loading"));
                    }
                    else {
                        this._snapshotLabel.style.display = "";
                        this._snapshotIcon.style.display = "";
                        this._snapshotProgress.style.display = "none";
                        this._snapshotButton.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("TakeSnapshot"));
                    }
                }
            };
            CollectionView.prototype.showSnapshotError = function (error) {
                if (this._snapshotErrorMsg && this._snapshotError) {
                    if (error) {
                        // Show the message
                        this._snapshotErrorMsg.innerText = MemoryProfiler.Common.ErrorFormatter.format(error);
                        this._snapshotError.style.display = "block";
                    }
                    else {
                        // Hide the message
                        this._snapshotErrorMsg.innerText = "";
                        this._snapshotError.style.display = "none";
                    }
                }
            };
            CollectionView.prototype.showWarningMessage = function (warning) {
                if (!this._warningSection) {
                    return;
                }
                if (warning) {
                    this._warningSection.innerHTML = warning;
                    this._warningSection.style.display = "inline";
                }
                else {
                    this._warningSection.innerHTML = "";
                    this._warningSection.style.display = "none";
                }
            };
            CollectionView.prototype.onSnapshotClick = function (e) {
                this._controller.takeSnapshot();
            };
            CollectionView.prototype.updateTakeSnapshotButton = function () {
                if (this._snapshotButton) {
                    if (!this._model.isViewBusy) {
                        this._snapshotButton.classList.remove("disabled");
                        this._snapshotButton.disabled = false;
                    }
                    else {
                        if (this._model.isForcingGarbageCollection)
                            this._snapshotButton.classList.add("disabled");
                        this._snapshotButton.disabled = true;
                    }
                }
            };
            return CollectionView;
        }(MemoryProfiler.Common.Controls.TemplateControl));
        Collection.CollectionView = CollectionView;
    })(Collection = MemoryProfiler.Collection || (MemoryProfiler.Collection = {}));
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
//--------
/// <reference path="CollectionView.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Collection;
    (function (Collection) {
        "use strict";
        var TakeSnapshotTask = (function () {
            function TakeSnapshotTask(controller) {
                this._snapshotAgents = [];
                this._controller = controller;
                this._snapshotAgents.push(new MemoryProfiler.Common.ClrSnapshotAgent());
                this._snapshotAgents.push(new MemoryProfiler.Common.ScreenshotSnapshotAgent());
                this._snapshotAgents.push(new MemoryProfiler.Common.NativeSnapshotAgent());
            }
            TakeSnapshotTask.prototype.start = function () {
                var _this = this;
                return new Microsoft.Plugin.Promise(function (completed, error) {
                    if (!_this.takeSnapshotInternal()) {
                        if (error) {
                            error(new Error("Snapshot Not Currently Enabled"));
                        }
                    }
                    else {
                        _this._snapshotCompleted = completed;
                        _this._snapshotError = error;
                    }
                });
            };
            TakeSnapshotTask.prototype.isCompleted = function (message) {
                if (message) {
                    var obj = JSON.parse(message);
                    if (obj.eventName) {
                        if (obj.eventName === "snapshotData") {
                            if (this._controller.model.isViewBusy) {
                                var snapshotData = obj;
                                if (this._activeSnapshot && snapshotData.id == this._activeSnapshot.id) {
                                    this._activeSnapshot.processAgentData(snapshotData.data.agent, snapshotData.data.data);
                                }
                            }
                        }
                    }
                    else {
                        if (this._controller.model.isViewBusy) {
                            if (obj.snapshotResults) {
                                this.onSnapshotResult(obj);
                            }
                            else {
                                var response = obj;
                                this.onSnapshotFailed(new Error(response.errorMessage));
                            }
                            return true;
                        }
                    }
                }
                return false;
            };
            TakeSnapshotTask.prototype.takeSnapshotInternal = function () {
                if (this._controller.model.isViewBusy) {
                    return false;
                }
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.TakeSnapshot, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, MemoryProfiler.Common.FeedbackCommandSourceNames.CollectionView);
                MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_TakeSnapshotStart, MemoryProfiler.Common.CodeMarkerValues.perfMP_TakeSnapshotEnd);
                this._controller.model.isTakingSnapshot = true;
                this._activeSnapshot = new MemoryProfiler.Common.SnapshotEngine(Collection.CollectionViewController._nextIdentifier, this._snapshotAgents, this._controller);
                var message = "{ \"commandName\": \"takeSnapshot\", \"snapshotId\": \"" + Collection.CollectionViewController._nextIdentifier + "\", \"agentMask\": \"65535\" }";
                this._controller.sendMessage(message);
                return true;
            };
            TakeSnapshotTask.prototype.onSnapshotResult = function (snapshotResult) {
                var _this = this;
                if (!snapshotResult) {
                    throw new Error("<move to resources>: snapshotAsync ended with no response");
                }
                if (!this._activeSnapshot) {
                    this._controller.model.isTakingSnapshot = false;
                }
                else {
                    this._activeSnapshot.processSnapshotResults(snapshotResult.snapshotResults, function (snapshot) {
                        MemoryProfiler.Common.MemoryProfilerViewHost.session.addSnapshot(snapshot).then(function () {
                            _this.onSnapshotCompleted(_this._activeSnapshot.snapshot);
                        });
                    }, this.onSnapshotFailed);
                }
            };
            TakeSnapshotTask.prototype.onSnapshotCompleted = function (snapshot) {
                if (this._snapshotCompleted) {
                    this._snapshotCompleted(Microsoft.Plugin.Promise.wrap(snapshot));
                }
                this._snapshotCompleted = null;
                this._snapshotError = null;
                if (!snapshot) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("MemProf.1014"));
                }
                Collection.CollectionViewController._nextIdentifier++;
                this._controller.model.snapshotSummaryCollection.add(snapshot);
                this._controller.model.isTakingSnapshot = false;
                this._activeSnapshot = null;
                MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_TakeSnapshotStart);
            };
            TakeSnapshotTask.prototype.onSnapshotFailed = function (error) {
                if (!error) {
                    throw new Error(Microsoft.Plugin.Resources.getErrorString("MemProf.1015"));
                }
                error.message = Microsoft.Plugin.Resources.getString("SnapshotCreationFailed", error.message);
                this._controller.model.latestSnapshotError = error;
                this._controller.model.isTakingSnapshot = false;
                this._activeSnapshot = null;
                if (this._snapshotError) {
                    this._snapshotError(error);
                }
                this._snapshotCompleted = null;
                this._snapshotError = null;
                MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.perfMP_TakeSnapshotStart);
                MemoryProfiler.Common.MemoryProfilerViewHost.onIdle();
            };
            return TakeSnapshotTask;
        }());
        Collection.TakeSnapshotTask = TakeSnapshotTask;
        var ForceGcCollectionAgentTask = (function () {
            function ForceGcCollectionAgentTask(controller) {
                this._controller = controller;
            }
            ForceGcCollectionAgentTask.prototype.start = function () {
                var _this = this;
                MemoryProfiler.Common.MemoryProfilerViewHost.session.logCommandUsage(MemoryProfiler.Common.FeedbackCommandNames.ForceGarbageCollection, MemoryProfiler.Common.FeedbackCommandInvokeMethodNames.Control, MemoryProfiler.Common.FeedbackCommandSourceNames.CollectionView);
                MemoryProfiler.Common.MemoryProfilerViewHost.startCodeMarker(MemoryProfiler.Common.CodeMarkerValues.prefMP_ForceGarbageCollectionStart, MemoryProfiler.Common.CodeMarkerValues.prefMP_ForceGarbageCollectionEnd);
                return new Microsoft.Plugin.Promise(function (completed) {
                    _this._controller.model.isForcingGarbageCollection = true;
                    var message = "{ \"commandName\": \"forceGarbageCollection\"}";
                    _this._controller.sendMessage(message);
                    _this._forceGcCompleted = completed;
                });
            };
            ForceGcCollectionAgentTask.prototype.isCompleted = function (message) {
                var result = false;
                if (message) {
                    var obj = JSON.parse(message);
                    if (obj.eventName && obj.eventName === "forcedGarbageCollectionComplete") {
                        this._controller.model.isForcingGarbageCollection = false;
                        MemoryProfiler.Common.MemoryProfilerViewHost.endCodeMarker(MemoryProfiler.Common.CodeMarkerValues.prefMP_ForceGarbageCollectionStart);
                        result = true;
                    }
                }
                if (this._forceGcCompleted) {
                    this._forceGcCompleted();
                }
                this._forceGcCompleted = null;
                return result;
            };
            return ForceGcCollectionAgentTask;
        }());
        Collection.ForceGcCollectionAgentTask = ForceGcCollectionAgentTask;
    })(Collection = MemoryProfiler.Collection || (MemoryProfiler.Collection = {}));
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
// <reference path="../../Common/controls/componentModel.ts" />
//--------
/// <reference path="../../../../../Common/Script/Hub/plugin.redirect.d.ts" />
/// <reference path="CollectionViewHost.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Collection;
    (function (Collection) {
        "use strict";
        var CommandBase = (function (_super) {
            __extends(CommandBase, _super);
            function CommandBase(host, commandBinding) {
                _super.call(this, commandBinding);
                this._host = host;
            }
            CommandBase.prototype.setNext = function (nextCommand) {
                this._nextCommand = nextCommand;
            };
            CommandBase.prototype.onCollectionFinishing = function () {
                this.setEnabled(false);
                if (this._nextCommand) {
                    this._nextCommand.onCollectionFinishing();
                }
            };
            CommandBase.prototype.onTargetIsManaged = function () {
                if (this._nextCommand) {
                    this._nextCommand.onTargetIsManaged();
                }
            };
            CommandBase.prototype.onPropertyChanged = function (propertyName) {
                if (propertyName === "isViewBusy") {
                    this.setEnabled(this.shouldEnable());
                }
                if (this._nextCommand) {
                    this._nextCommand.onPropertyChanged(propertyName);
                }
            };
            CommandBase.prototype.onClose = function () {
                this.setEnabled(false);
                if (this._nextCommand) {
                    this._nextCommand.onClose();
                }
            };
            CommandBase.prototype.shouldEnable = function () {
                return !this._host.collectionViewController.model.isViewBusy;
            };
            return CommandBase;
        }(Microsoft.VisualStudio.DiagnosticsHub.ToolbarButton));
        Collection.CommandBase = CommandBase;
        var TakeSnapshotCommand = (function (_super) {
            __extends(TakeSnapshotCommand, _super);
            function TakeSnapshotCommand(host) {
                _super.call(this, host, {
                    callback: function () { return host.collectionViewController.takeSnapshot(); },
                    label: Microsoft.Plugin.Resources.getString("TakeSnapshot"),
                    iconEnabled: "image-snapshot",
                    iconDisabled: "image-snapshot-disabled",
                    disabled: function () { return host.collectionViewController.model.isViewBusy; },
                    displayOnToolbar: true
                });
            }
            return TakeSnapshotCommand;
        }(CommandBase));
        Collection.TakeSnapshotCommand = TakeSnapshotCommand;
        var ForceGcCommand = (function (_super) {
            __extends(ForceGcCommand, _super);
            function ForceGcCommand(host) {
                _super.call(this, host, {
                    callback: function () { return host.collectionViewController.forceGarbageCollection(); },
                    label: Microsoft.Plugin.Resources.getString("ForceGc"),
                    iconEnabled: "image-forceGc",
                    iconDisabled: "image-forceGc-disabled",
                    displayOnToolbar: true
                });
                this.isManaged = false;
                this.setEnabled(false);
                this.container.hidden = true;
            }
            ForceGcCommand.prototype.onTargetIsManaged = function () {
                this.isManaged = true;
                this.setEnabled(this.shouldEnable());
                _super.prototype.onTargetIsManaged.call(this);
            };
            ForceGcCommand.prototype.shouldEnable = function () {
                return this.isManaged && _super.prototype.shouldEnable.call(this);
            };
            return ForceGcCommand;
        }(CommandBase));
        Collection.ForceGcCommand = ForceGcCommand;
    })(Collection = MemoryProfiler.Collection || (MemoryProfiler.Collection = {}));
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
/// <reference path="../../../../../common/script/Hub/Plugin.redirect.d.ts" />
/// <reference path="../../../../../common/script/Hub/DiagnosticsHub.redirect.d.ts" />
/// <reference path="CollectionView.ts" />
/// <reference path="VsPluginCommandHelper.ts" />
var MemoryProfiler;
(function (MemoryProfiler) {
    var Collection;
    (function (Collection) {
        "use strict";
        var CollectionViewHost = (function (_super) {
            __extends(CollectionViewHost, _super);
            function CollectionViewHost() {
                _super.call(this);
            }
            CollectionViewHost.prototype.sessionStateChanged = function (eventArgs) {
                var currentState = eventArgs.currentState;
                switch (currentState) {
                    case 400 /* CollectionFinishing */:
                        CollectionViewHost.CommandChain.onCollectionFinishing();
                        break;
                    case 500 /* CollectionFinished */:
                        Microsoft.VisualStudio.DiagnosticsHub.getCurrentSession().removeStateChangedEventListener(this.sessionStateChanged);
                        // Have session persist our session metadata now
                        var eventCompleteDeferral = eventArgs.getDeferral();
                        var onSaveCompleted = function (success) {
                            eventCompleteDeferral.complete();
                        };
                        this.session.save(this.collectionViewController.managedDataSeen === true).done(onSaveCompleted);
                        break;
                }
            };
            CollectionViewHost.prototype.onPropertyChanged = function (propertyName) {
                CollectionViewHost.CommandChain.onPropertyChanged(propertyName);
            };
            CollectionViewHost.prototype.initializeView = function (sessionInfo) {
                this.collectionViewController = new Collection.CollectionViewController();
                document.getElementById('mainContainer').appendChild(this.collectionViewController.view.rootElement);
                this.collectionViewController.model.registerPropertyChanged(this);
                Microsoft.VisualStudio.DiagnosticsHub.getCurrentSession().addStateChangedEventListener(this.sessionStateChanged.bind(this));
                Microsoft.Plugin.addEventListener("close", function () {
                    CollectionViewHost.CommandChain.onClose();
                });
                this.initCommands();
            };
            CollectionViewHost.prototype.initCommands = function () {
                if (Microsoft.Plugin.VS && Microsoft.Plugin.VS.Commands) {
                    var takeSnapshotCommand = new Collection.TakeSnapshotCommand(this);
                    var forceGcCommand = new Collection.ForceGcCommand(this);
                    takeSnapshotCommand.setNext(forceGcCommand);
                    CollectionViewHost.CommandChain = takeSnapshotCommand;
                    var toolbarSection = document.getElementsByClassName('toolbarSection')[0];
                    var toolbar = new Microsoft.VisualStudio.DiagnosticsHub.Toolbar();
                    toolbar.addToolbarItem(takeSnapshotCommand);
                    toolbar.addToolbarItem(forceGcCommand);
                    toolbarSection.appendChild(toolbar.container);
                }
            };
            return CollectionViewHost;
        }(MemoryProfiler.Common.MemoryProfilerViewHostBase));
        Collection.CollectionViewHost = CollectionViewHost;
        Collection.CollectionViewHostInstance = new CollectionViewHost();
    })(Collection = MemoryProfiler.Collection || (MemoryProfiler.Collection = {}));
})(MemoryProfiler || (MemoryProfiler = {}));
MemoryProfiler.Collection.CollectionViewHostInstance.loadView();
//# sourceMappingURL=CollectionViewMerged.js.map
// SIG // Begin signature block
// SIG // MIIjkAYJKoZIhvcNAQcCoIIjgTCCI30CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // r1JqyCsZvF1S1NAQ3FeDFIhiaGOaUNnrZh1//wLqu4yg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFs3b0DHYhLgEgL1Vu9A
// SIG // YgUYIXaXw6WGr7/gJhhpNpiCMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAfjHPSePrURxV5gTMyAobCBN7I9PUkOo4K0Xq
// SIG // X6Uy8XYiM5hHXTo8tT6S7JHrBF3//nk3iCUmwXCa9Xui
// SIG // xq5sZiBo2MIC6qRtslXcoDXMBhNWghY/9rYElEE+RenJ
// SIG // od7vBZ6BKg+dwFrzq/9rDsQbW87elpc7m3Z7NAa0Kbrg
// SIG // Su6dU0mS7sGXCS2Zgxxh++MS7gIwws1yUI/49WOw1Aez
// SIG // xzCKEtTi8KgBym1hQrpHzfatIPXp1ZSkAQOFiEEtyka0
// SIG // C0vIkhEJGJusbLifCN4Oi8cGPOkoHtYCdxMlA+3JH//y
// SIG // DB/9SWFIXynvyiKL3I4XT4fehjv9bRpaqeeki8vDsqGC
// SIG // EvEwghLtBgorBgEEAYI3AwMBMYIS3TCCEtkGCSqGSIb3
// SIG // DQEHAqCCEsowghLGAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCDmzTKB
// SIG // KP/NeV98EMMiIakD+f3+Gt/sv5xObzuC2HbJVQIGYPsK
// SIG // QJaqGBMyMDIxMDgwMzIxMDE0Ni4xNThaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046QzRCRC1F
// SIG // MzdGLTVGRkMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2Wggg5EMIIE9TCCA92gAwIBAgIT
// SIG // MwAAAVdEB2Lcb+i+KgAAAAABVzANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MTAxMTQxOTAyMTNaFw0yMjA0MTExOTAyMTNaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046QzRCRC1FMzdGLTVGRkMx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
// SIG // AoIBAQDebQOnVGb558C/akLV3MDwDYQeHs/uQkK3j6f2
// SIG // fEx+DQa+bwHxjKNJVf5YnQWrSk4BxKzrih9dcVQHwXoR
// SIG // ybx/U/zoTnPNwibPW8w4a5XdCXct3icgtMgXcVXrnEvt
// SIG // mtmQXedMAYP+f9mI0NspXw9HcSiurUC8XTg07mnUDG3W
// SIG // tOZTxp1hsGd54koCClUYKqglZYR88DbUYdQB/mcW30nu
// SIG // 7fM96BCgHUwMu0rD/MpIbd7K43YdAcpDxXaWgIKsFgiS
// SIG // SZhpNIAK0rxwvPr17RqNzCYVkEXuSbc3Q+ZHWih/bnPY
// SIG // J0obF8gxIRmY8d/m/HLqhDvGx79Fj1/TERH638b5AgMB
// SIG // AAGjggEbMIIBFzAdBgNVHQ4EFgQUXTF7u+g4IZ1P5D0z
// SIG // CnRZEfaAqdkwHwYDVR0jBBgwFoAU1WM6XIoxkPNDe3xG
// SIG // G8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNU
// SIG // aW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG
// SIG // 9w0BAQsFAAOCAQEAJXd5AIBul1omcr3Ymy0Zlq+8m+kU
// SIG // snI1Q4PLXAorUtNbE1aeE/AHdkHmHyVnyugzBJO0EQXy
// SIG // oHTe6BPHV7ZkFS/iXMS49KVLsuDQeUXIXLXg+XUZ03yp
// SIG // UYvL4ClGsQ3KBSMzRFM9RB6aKXmoA2+P7iPVI+bSLsJY
// SIG // pP6q7/7BwMO5DOIBCyzToHXr/Wf+8aNSSMH3tHqEDN8M
// SIG // XAhS7n/EvTp3LbWhQFh7RBEfCL4EQICyf1p5bhc+vPoa
// SIG // w30cl/6qlkjyBNL6BOqhcdc/FLy8CqZuuUDcjQ0TKf1Z
// SIG // gqakWa8QdaNEWOz/p+I0jRr25Nm0e9JCrf3aIBRUQR1V
// SIG // blMX/jCCBnEwggRZoAMCAQICCmEJgSoAAAAAAAIwDQYJ
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
// SIG // CxMdVGhhbGVzIFRTUyBFU046QzRCRC1FMzdGLTVGRkMx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVABEt+Eliew320hv4
// SIG // GyEME684GfDyoIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDktAkI
// SIG // MCIYDzIwMjEwODAzMjIyNzIwWhgPMjAyMTA4MDQyMjI3
// SIG // MjBaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOS0CQgC
// SIG // AQAwCgIBAAICJgACAf8wBwIBAAICEUwwCgIFAOS1WogC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQBHCLlzzx/OO6Je7YZtUyxOm87TKya6
// SIG // bCwCvqxPymRY58o6arPQhsZUz9ViKJllRpUPLbegjOc8
// SIG // px0k9dMy4Xrt+LpAeuSq8Oa+yRdMsYmhRvo+yaHmoYeu
// SIG // gt8IAkE5LkUu6Q9oY8/8e1/eoX4gtcRMKBwHooWHFyrq
// SIG // mp+H6FFmXTGCAw0wggMJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABV0QHYtxv6L4qAAAA
// SIG // AAFXMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IO/rAIYKoSDpRD2ww7OWFPvXDpHuVUxDgAX04yFJWcS+
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgLFqN
// SIG // DUOr87rrqVLGRDEieFLEY7UMNnRcWVpB7akcoBMwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAVdEB2Lcb+i+KgAAAAABVzAiBCBMY2ip3gDiuKTy
// SIG // SaB546z00eSVXVd6Jw7qz0bkNMBVlzANBgkqhkiG9w0B
// SIG // AQsFAASCAQA8+oVCRVnQeGWPb3Au54VC9mRBY+BEuXn2
// SIG // Py/fnqYhxfU7OhSFJEqQ9l1hNyF8nKJjZfwqYwok2nS9
// SIG // PWOq6/t+CEVJreEU47ASG54VlQYR5/kMFd2LQOBExlbR
// SIG // 4GsHKwvZnYx+aIWm6Zt7CJ23tVk+8h/xHhahcmLZRQMk
// SIG // 8oUsyuis9miRBwiTJYltLKwN+yaD3l3C9sbeO8val5uC
// SIG // KFSgYAKgYOf0wUq4Yn39pW2RqKkF/zYkFhFL88b/ccOt
// SIG // Xxy3lzG5jvbZM79e40xAD7wHNcop4TxQc9ADh+2EGf9E
// SIG // +tACgZ1SswA6WDPWSrdXXoLdMik+EDXAQ1PMxxHidMsA
// SIG // End signature block
