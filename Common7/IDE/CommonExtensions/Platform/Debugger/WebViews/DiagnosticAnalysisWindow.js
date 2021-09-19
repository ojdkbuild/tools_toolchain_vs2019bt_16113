var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("IndeterminateCheckbox", ["require", "exports"], function (require, exports) {
    "use strict";
    var CheckedState = (function () {
        function CheckedState() {
        }
        CheckedState.Unchecked = false;
        CheckedState.Checked = true;
        CheckedState.Indeterminate = null;
        return CheckedState;
    }());
    exports.CheckedState = CheckedState;
    ko.bindingHandlers["checkedState"] = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            if (element.type !== "checkbox") {
                return;
            }
            element.indeterminate = false;
            var onCheckBoxClicked = function () {
                var modelValue = valueAccessor();
                modelValue(element.checked);
                return false;
            };
            var updateCheckboxView = function () {
                var modelValue = valueAccessor();
                var value = modelValue();
                if (value !== element.checked) {
                    element.checked = modelValue();
                }
                element.indeterminate = (value === CheckedState.Indeterminate);
            };
            ko.utils.registerEventHandler(element, "click", onCheckBoxClicked);
            ko.computed(updateCheckboxView, null, { disposeWhenNodeIsRemoved: element });
        }
    };
    ko.bindingHandlers["ariaCheckedState"] = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var ariaChecked = "false";
            if (value) {
                ariaChecked = "true";
            }
            else if (value === CheckedState.Indeterminate) {
                ariaChecked = "mixed";
            }
            element.setAttribute("aria-checked", ariaChecked);
        }
    };
});
define("Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    var Constants = (function () {
        function Constants() {
        }
        Constants.EnterKeyCode = 13;
        Constants.SpaceKeyCode = 32;
        Constants.LeftClickCode = 1;
        Constants.RightClickCode = 3;
        Constants.CtrlKeyCode = 17;
        Constants.CKeyCode = 67;
        Constants.RoslynAnalyzerId = "2F9CD6E6-C93F-4020-ACFD-C85AE0C551B9";
        return Constants;
    }());
    exports.Constants = Constants;
});
define("AnalysisResults", ["require", "exports"], function (require, exports) {
    "use strict";
    var AnalysisDescriptor = (function () {
        function AnalysisDescriptor() {
        }
        return AnalysisDescriptor;
    }());
    exports.AnalysisDescriptor = AnalysisDescriptor;
    var AnalysisResult = (function () {
        function AnalysisResult(errorCode, summary, potentialFix, analyzerId, analyzerName, window, debugContext) {
            this.ErrorCode = errorCode;
            this.ErrorName = Microsoft.Plugin.Resources.getString("UnnamedError");
            this.DebugContext = debugContext;
            this.Summary = summary.replace(/\\"/g, '"');
            this.PotentialFix = potentialFix;
            this.AnalyzerId = analyzerId;
            this.AnalyzerName = analyzerName;
            this.DiagnosticAnalysisWindow = window;
            this.initializeName();
        }
        AnalysisResult.prototype.initializeName = function () {
            var errorInfo = AnalysisResult.errorCodeResources[this.ErrorCode];
            var resourceName = errorInfo[0];
            this.IsWarning = errorInfo[1];
            if (!resourceName) {
                resourceName = "UnnamedError";
                this.IsWarning = false;
            }
            this.ErrorName = Microsoft.Plugin.Resources.getString(resourceName);
        };
        AnalysisResult.errorCodeResources = {
            "AA0000": ["UnnamedError", false],
            "AA0001": ["SyncOverAsyncError", true],
            "AA0002": ["AsyncVoidError", true],
            "AA0003": ["FinalizerQueueErrorCode", true],
            "AA0004": ["SyncAsyncMainError", false],
            "AA0005": ["SyncAsyncStarvedError", false],
            "AA0006": ["SyncAsyncStressError", true],
            "AA0007": ["SyncAsyncThreadQueueError", true],
            "AA0008": ["ThreadPoolStarvedError", false],
            "AA0009": ["ThreadPoolStressedError", true],
            "AA0010": ["ThreadPoolQueueStressedError", true],
            "AA0011": ["FinalizableObjectsErrorCode", true],
            "AA0012": ["DeadlockedThreadsError", false]
        };
        return AnalysisResult;
    }());
    exports.AnalysisResult = AnalysisResult;
    function findAnalysisResultType(resultJson, DiagnosticAnalysisWindow) {
        var errorCode = resultJson.ErrorCode;
        var summary = resultJson.Description;
        var potentialFix = resultJson.PotentialFix;
        var analyzerId = resultJson.AnalyzerId;
        var analyzerName = resultJson.AnalyzerName;
        var debugContext = resultJson.DebugContext;
        return new AnalysisResult(errorCode, summary, potentialFix, analyzerId, analyzerName, DiagnosticAnalysisWindow, debugContext);
    }
    exports.findAnalysisResultType = findAnalysisResultType;
});
define("ResultListViewModel", ["require", "exports", "Shared/Interfaces", "Shared/DataGrid/DataGridViewModel", "Shared/DataGrid/DataGridHeaderViewModel", "Shared/SortFunctions"], function (require, exports, Interfaces_1, DataGridViewModel_1, DataGridHeaderViewModel_1, SortFunctions_1) {
    "use strict";
    var ResultListRow = (function () {
        function ResultListRow(analysisResult, id) {
            this._id = id;
            this._analysisResult = analysisResult;
            this._selected = ko.observable(false);
        }
        ResultListRow.prototype.invoke = function () {
        };
        Object.defineProperty(ResultListRow.prototype, "resultCode", {
            get: function () {
                return this._analysisResult.ErrorCode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListRow.prototype, "resultName", {
            get: function () {
                return this._analysisResult.ErrorName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListRow.prototype, "iconStatusClassName", {
            get: function () {
                if (this._analysisResult.IsWarning) {
                    return "icon-warning";
                }
                return "icon-error";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListRow.prototype, "templateName", {
            get: function () {
                return "ResultListRowTemplate";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListRow.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListRow.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        return ResultListRow;
    }());
    exports.ResultListRow = ResultListRow;
    var ResultListDAO = (function () {
        function ResultListDAO() {
            this._rows = [];
        }
        ResultListDAO.prototype.getCount = function (resultId) {
            return Microsoft.Plugin.Promise.as(this._rows.length);
        };
        ResultListDAO.prototype.getRows = function (resultId, sortInfo) {
            return Microsoft.Plugin.Promise.as(this._rows);
        };
        ResultListDAO.prototype.search = function (query, isCaseSensitive, isRegex, startingRow, sortInfo) {
            return null;
        };
        ResultListDAO.prototype.sort = function (rows, sortInfo) {
            var sortFunc = SortFunctions_1.SortFunctions.stringSort(sortInfo.columnId, sortInfo.direction);
            rows.sort(sortFunc);
            return Microsoft.Plugin.Promise.as(rows);
        };
        ResultListDAO.prototype.setResults = function (results) {
            this._rows = results.map(function (result, i) { return new ResultListRow(result, i); });
        };
        return ResultListDAO;
    }());
    exports.ResultListDAO = ResultListDAO;
    var ResultListColumnSettingsProvider = (function () {
        function ResultListColumnSettingsProvider() {
        }
        ResultListColumnSettingsProvider.prototype.getColumnSettings = function () {
            return Microsoft.Plugin.Promise.as([
                { columnId: "resultCode", isHidden: false, width: 50 },
                { columnId: "resultName", isHidden: false, width: 650 }
            ]);
        };
        ResultListColumnSettingsProvider.prototype.onColumnChanged = function (column) {
        };
        return ResultListColumnSettingsProvider;
    }());
    exports.ResultListColumnSettingsProvider = ResultListColumnSettingsProvider;
    var ResultListViewModel = (function () {
        function ResultListViewModel() {
            var headerColumns = [
                { id: "resultCode", text: Microsoft.Plugin.Resources.getString("ResultHeaderCodeLabel"), hideable: false, sortable: Interfaces_1.SortDirection.Desc },
                { id: "resultName", text: Microsoft.Plugin.Resources.getString("ResultHeaderResultLabel"), hideable: false, sortable: null }
            ];
            var headerViewModel = new DataGridHeaderViewModel_1.DataGridHeaderViewModel(headerColumns, new ResultListColumnSettingsProvider(), "code");
            this._resultListAccess = new ResultListDAO();
            this._selectedResult = ko.observable(null);
            this._resultList = new DataGridViewModel_1.DataGridViewModel(this._resultListAccess, headerViewModel, "");
            this._resultList.selectedRows.subscribe(this.selectionChanged.bind(this));
        }
        Object.defineProperty(ResultListViewModel.prototype, "results", {
            set: function (value) {
                this._resultListAccess.setResults(value);
                this._resultList.onResultChanged(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListViewModel.prototype, "dataGrid", {
            get: function () {
                return this._resultList;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultListViewModel.prototype, "selectedResult", {
            get: function () {
                return this._selectedResult;
            },
            enumerable: true,
            configurable: true
        });
        ResultListViewModel.prototype.selectionChanged = function (selection) {
            if (selection.length != 1) {
                return;
            }
            var row = this._resultList.rows()[selection[selection.length - 1]];
            this._selectedResult(row._analysisResult);
        };
        return ResultListViewModel;
    }());
    exports.ResultListViewModel = ResultListViewModel;
});
define("ResultsAreaViewModel", ["require", "exports", "ResultListViewModel"], function (require, exports, rlvm) {
    "use strict";
    var ResultsAreaViewModel = (function () {
        function ResultsAreaViewModel(adaptor) {
            this._isErrorVisible = ko.observable(false);
            this._errorString = ko.observable(null);
            this._isResultsVisible = ko.observable(false);
            this._rlvm = new rlvm.ResultListViewModel();
            this._isResultDetailsVisible = ko.observable(false);
            this._details = ko.observable(null);
            this._showStackLink = ko.observable(false);
            this._fix = ko.observable(null);
            this._showStackListener = [];
            this._rlvm.selectedResult.subscribe(this.onResultSelected.bind(this));
            this._adaptor = adaptor;
            this._isInitialized = false;
        }
        Object.defineProperty(ResultsAreaViewModel.prototype, "isErrorVisible", {
            get: function () { return this._isErrorVisible; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "errorString", {
            get: function () { return this._errorString; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "isResultsVisible", {
            get: function () { return this._isResultsVisible; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "resultListViewModel", {
            get: function () { return this._rlvm; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "isDetailsVisible", {
            get: function () { return this._isResultDetailsVisible; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "summary", {
            get: function () { return this._details; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "showStackLink", {
            get: function () { return this._showStackLink; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "stackLinkText", {
            get: function () { return Microsoft.Plugin.Resources.getString("showCallStackMessage"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "fix", {
            get: function () { return this._fix; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "resultHeader", {
            get: function () { return Microsoft.Plugin.Resources.getString("AnalysisResultsHeader"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "summaryHeader", {
            get: function () { return Microsoft.Plugin.Resources.getString("AnalysisSummaryHeader"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "fixHeader", {
            get: function () { return Microsoft.Plugin.Resources.getString("PotentialFixHeader"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "selectedResult", {
            get: function () { return this._rlvm.selectedResult(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResultsAreaViewModel.prototype, "results", {
            set: function (results) {
                if (!results || results.length <= 0) {
                    this.isResultsVisible(false);
                    return;
                }
                this.isErrorVisible(false);
                this.isResultsVisible(true);
                this._rlvm.results = results;
                if (!this._isInitialized) {
                    this._isInitialized = true;
                    this._rlvm.dataGrid.onAfterDomInsert([document.getElementById("resultList")], this._rlvm.dataGrid);
                }
                else {
                    var e = document.createEvent('Event');
                    e.initEvent("scroll", true, true);
                    document.getElementById("resultList").dispatchEvent(e);
                }
            },
            enumerable: true,
            configurable: true
        });
        ResultsAreaViewModel.prototype.stackLinkClicked = function () {
            if (this._rlvm.selectedResult) {
                var result_1 = this._rlvm.selectedResult();
                this._showStackListener.forEach(function (func) {
                    func(result_1);
                });
            }
        };
        ResultsAreaViewModel.prototype.subscribeStackLinkClicked = function (func) {
            this._showStackListener.push(func);
        };
        ResultsAreaViewModel.prototype.unsubscribeStackLinkClicked = function (func) {
            var index = -1;
            for (var i = 0; i < this._showStackListener.length; ++i) {
                if (this._showStackListener[i] === func) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                this._showStackListener.splice(index, 1);
            }
        };
        ResultsAreaViewModel.prototype.setError = function (error) {
            this.isResultsVisible(false);
            this.isDetailsVisible(false);
            if (error) {
                this.errorString(error);
                this.isErrorVisible(true);
            }
            else {
                this.isErrorVisible(false);
            }
        };
        ResultsAreaViewModel.prototype.onResultSelected = function (result) {
            this.summary(result.Summary);
            this.fix(result.PotentialFix);
            this.isDetailsVisible(true);
            this.showStackLink(result.DebugContext !== null);
            this._adaptor._call("OnSelectResultTelemetry", result.AnalyzerId, result.ErrorCode);
        };
        return ResultsAreaViewModel;
    }());
    exports.ResultsAreaViewModel = ResultsAreaViewModel;
});
define("AnalyzerRowViewModel", ["require", "exports", "IndeterminateCheckbox", "Constants"], function (require, exports, IndeterminateCheckBox_1, Constants_1) {
    "use strict";
    var AnalyzerRowViewModel = (function () {
        function AnalyzerRowViewModel(parentVM, rowId, name, expandable, uniqueId, showDecompilationWarning) {
            this._selected = ko.observable(false);
            this._expanded = ko.observable(false);
            this._children = ko.observableArray([]);
            this._arrowVisibility = ko.observable("visible");
            this._checkedState = ko.observable(IndeterminateCheckBox_1.CheckedState.Checked);
            this._rowId = rowId;
            this._name = name;
            this._showDecompilationWarning = showDecompilationWarning;
            this._expandable = expandable;
            this._uniqueId = uniqueId;
            this._parentVM = parentVM;
            if (!expandable) {
                this._arrowVisibility("hidden");
            }
        }
        Object.defineProperty(AnalyzerRowViewModel.prototype, "expandable", {
            get: function () { return this._expandable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "checkedState", {
            get: function () { return this._checkedState; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "arrowVisibility", {
            get: function () { return this._arrowVisibility; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "uniqueId", {
            get: function () { return this._uniqueId; },
            enumerable: true,
            configurable: true
        });
        AnalyzerRowViewModel.prototype.onCheckboxClick = function (viewModel, event) {
            if (event.which !== Constants_1.Constants.LeftClickCode) {
                return true;
            }
            var checkbox = event.currentTarget;
            event.stopPropagation();
            this._parentVM.onClick(this._parentVM, event);
            if (this._showDecompilationWarning && checkbox.checked) {
                this._adaptor._call("ShowDecompilationWarningAsync").done(function (result) {
                    if (!result) {
                        checkbox.checked = false;
                    }
                });
            }
            return true;
        };
        Object.defineProperty(AnalyzerRowViewModel.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        AnalyzerRowViewModel.prototype.expand = function () {
            var _this = this;
            var dataLoadPromise = Microsoft.Plugin.Promise.as(null).then(function () {
                _this._expanded(!_this._expanded());
                var e = document.createEvent('Event');
                e.initEvent("resize", true, true);
                document.getElementById("analyzerList").dispatchEvent(e);
            });
            return dataLoadPromise;
        };
        AnalyzerRowViewModel.prototype.toggleCheckedState = function () {
            if (this.checkedState() === IndeterminateCheckBox_1.CheckedState.Unchecked) {
                this.checkedState(IndeterminateCheckBox_1.CheckedState.Checked);
            }
            else {
                this.checkedState(IndeterminateCheckBox_1.CheckedState.Unchecked);
            }
        };
        Object.defineProperty(AnalyzerRowViewModel.prototype, "depth", {
            get: function () {
                if (this.expandable) {
                    return 0;
                }
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "expanded", {
            get: function () {
                return this._expanded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "templateName", {
            get: function () {
                return "AnalyzerListRowTemplate";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "id", {
            get: function () {
                return this._rowId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerRowViewModel.prototype, "children", {
            get: function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        AnalyzerRowViewModel.prototype.invoke = function () {
        };
        return AnalyzerRowViewModel;
    }());
    exports.AnalyzerRowViewModel = AnalyzerRowViewModel;
});
define("AnalyzerTreeGridDAO", ["require", "exports", "IndeterminateCheckbox", "Constants", "AnalyzerRowViewModel"], function (require, exports, IndeterminateCheckBox_2, Constants_2, arvm) {
    "use strict";
    var AnalyzerTreeGridDAO = (function () {
        function AnalyzerTreeGridDAO(analyzerListVM) {
            this._analyses = null;
            this._updating = false;
            this._analyzerListVM = analyzerListVM;
        }
        AnalyzerTreeGridDAO.prototype.updateTreeRows = function (analysisList) {
            this._analyses = analysisList;
        };
        Object.defineProperty(AnalyzerTreeGridDAO.prototype, "defaultSortColumnId", {
            get: function () {
                return "name";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerTreeGridDAO.prototype, "analyses", {
            get: function () {
                return this._analyses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerTreeGridDAO.prototype, "analyzerListVM", {
            get: function () { return this._analyzerListVM; },
            enumerable: true,
            configurable: true
        });
        AnalyzerTreeGridDAO.prototype.getRoots = function (resultId, sortInfo) {
            var _this = this;
            var continuation = function (analysisList) {
                var rows = [];
                var analysisSet = {};
                var rowId = 0;
                var _loop_1 = function(analysis) {
                    if (!analysis.AnalyzerId) {
                        return "continue";
                    }
                    var id = analysis.AnalyzerId.toUpperCase();
                    if (!analysisSet[id]) {
                        analysisSet[id] = true;
                        var showDecompilationWarning = (id === Constants_2.Constants.RoslynAnalyzerId);
                        var vm_1 = new arvm.AnalyzerRowViewModel(_this._analyzerListVM.analyzerList, rowId++, analysis.AnalyzerName, true, id, showDecompilationWarning);
                        vm_1.checkedState.subscribe(function (newValue) { _this.updateCheckedState(newValue, vm_1, null); });
                        rows.push(vm_1);
                    }
                };
                for (var _i = 0, analysisList_1 = analysisList; _i < analysisList_1.length; _i++) {
                    var analysis = analysisList_1[_i];
                    var state_1 = _loop_1(analysis);
                    if (state_1 === "continue") continue;
                }
                return rows;
            };
            return Microsoft.Plugin.Promise.wrap(this._analyses).then(continuation);
        };
        AnalyzerTreeGridDAO.prototype.expand = function (row, sortInfo) {
            var _this = this;
            var vmr = row;
            return vmr.expand().then(function () { return _this.loadChildren(vmr); });
        };
        AnalyzerTreeGridDAO.prototype.search = function (query, isCaseSensitive, isRegex, startingRow, sortInfo) {
            throw new Error("Method not implemented.");
        };
        AnalyzerTreeGridDAO.prototype.sort = function (roots, sortInfo) {
            return Microsoft.Plugin.Promise.as(roots);
        };
        AnalyzerTreeGridDAO.prototype.loadChildren = function (vmr) {
            var _this = this;
            if (vmr.children().length == 0) {
                var rows = [];
                var rowId = 0;
                var _loop_2 = function(analysis) {
                    if (!analysis.AnalyzerId) {
                        return "continue";
                    }
                    var id = analysis.AnalyzerId.toUpperCase();
                    if (id === vmr.uniqueId) {
                        var showDecompilationWarning = (id === Constants_2.Constants.RoslynAnalyzerId);
                        var vm_2 = new arvm.AnalyzerRowViewModel(this_1._analyzerListVM.analyzerList, rowId++, analysis.AnalysisName, false, analysis.AnalysisId, showDecompilationWarning);
                        vm_2.checkedState.subscribe(function (newValue) { _this.updateCheckedState(newValue, vm_2, vmr); });
                        rows.push(vm_2);
                    }
                };
                var this_1 = this;
                for (var _i = 0, _a = this._analyses; _i < _a.length; _i++) {
                    var analysis = _a[_i];
                    var state_2 = _loop_2(analysis);
                    if (state_2 === "continue") continue;
                }
                vmr.children(rows);
            }
        };
        AnalyzerTreeGridDAO.prototype.updateCheckedState = function (newValue, viewModel, parentViewModel) {
            if (this._updating) {
                return;
            }
            this._updating = true;
            if (!parentViewModel) {
                this.loadChildren(viewModel);
                if (newValue !== IndeterminateCheckBox_2.CheckedState.Indeterminate) {
                    for (var _i = 0, _a = viewModel.children(); _i < _a.length; _i++) {
                        var child = _a[_i];
                        var childVm = child;
                        childVm.checkedState(newValue);
                    }
                }
            }
            else {
                var children = parentViewModel.children();
                if (children.length > 0) {
                    var child = children[0];
                    var state = child.checkedState();
                    for (var i = 1; i < children.length; ++i) {
                        child = children[i];
                        if (child.checkedState() !== state) {
                            state = IndeterminateCheckBox_2.CheckedState.Indeterminate;
                            break;
                        }
                    }
                    parentViewModel.checkedState(state);
                }
            }
            this._updating = false;
        };
        return AnalyzerTreeGridDAO;
    }());
    exports.AnalyzerTreeGridDAO = AnalyzerTreeGridDAO;
});
define("AnalyzerListColumnSettingsProvider", ["require", "exports"], function (require, exports) {
    "use strict";
    var AnalyzerListColumnSettingsProvider = (function () {
        function AnalyzerListColumnSettingsProvider() {
        }
        AnalyzerListColumnSettingsProvider.prototype.getColumnSettings = function () {
            return Microsoft.Plugin.Promise.as([
                { columnId: "name", isHidden: false, width: 250 }
            ]);
        };
        AnalyzerListColumnSettingsProvider.prototype.onColumnChanged = function (column) {
        };
        return AnalyzerListColumnSettingsProvider;
    }());
    exports.AnalyzerListColumnSettingsProvider = AnalyzerListColumnSettingsProvider;
});
define("AnalyzerListViewModel", ["require", "exports", "Shared/Grid/TreeGridViewModel", "AnalyzerTreeGridDAO", "AnalyzerListColumnSettingsProvider", "Shared/Grid/TreeGridHeaderViewModel", "Constants", "IndeterminateCheckbox"], function (require, exports, TreeGridViewModel_1, AnalyzerTreeGridDAO_1, AnalyzerListColumnSettingsProvider_1, TreeGridHeaderViewModel_1, Constants_3, IndeterminateCheckBox_3) {
    "use strict";
    var CheckBoxTreeGridViewModel = (function (_super) {
        __extends(CheckBoxTreeGridViewModel, _super);
        function CheckBoxTreeGridViewModel(dao, header, ariaLabel) {
            _super.call(this, dao, header, ariaLabel);
            this._atgDao = dao;
        }
        CheckBoxTreeGridViewModel.prototype.onKeyDown = function (viewModel, event) {
            if (event.keyCode == Constants_3.Constants.SpaceKeyCode) {
                var row = this.focusedRow();
                row.toggleCheckedState();
                return false;
            }
            return _super.prototype.onKeyDown.call(this, viewModel, event);
        };
        CheckBoxTreeGridViewModel.prototype.onClick = function (viewModel, event) {
            return _super.prototype.onClick.call(this, viewModel, event);
        };
        Object.defineProperty(CheckBoxTreeGridViewModel.prototype, "dataAccessObject", {
            get: function () { return this._atgDao; },
            enumerable: true,
            configurable: true
        });
        return CheckBoxTreeGridViewModel;
    }(TreeGridViewModel_1.TreeGridViewModel));
    exports.CheckBoxTreeGridViewModel = CheckBoxTreeGridViewModel;
    var AnalyzerListViewModel = (function () {
        function AnalyzerListViewModel() {
            var _this = this;
            this._processName = ko.observable("");
            this._canRunAnalysis = ko.observable(true);
            this._processHeader = ko.pureComputed(function () { return _this.processHeaderString(); });
            this._areAnalysesVisible = ko.observable(false);
            this.processId = null;
            this._analyzerListDAO = new AnalyzerTreeGridDAO_1.AnalyzerTreeGridDAO(this);
            this._header = new TreeGridHeaderViewModel_1.TreeGridHeaderViewModel([{ id: "name", text: Microsoft.Plugin.Resources.getString("AvailableAnalyses"), hideable: false }], new AnalyzerListColumnSettingsProvider_1.AnalyzerListColumnSettingsProvider(), this._analyzerListDAO.defaultSortColumnId);
            this._analyzerList = new CheckBoxTreeGridViewModel(this._analyzerListDAO, this._header, "");
        }
        Object.defineProperty(AnalyzerListViewModel.prototype, "analyzeButtonLabel", {
            get: function () { return Microsoft.Plugin.Resources.getString("AnalyzeButtonLabel"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerListViewModel.prototype, "canRunAnalysis", {
            get: function () { return this._canRunAnalysis; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerListViewModel.prototype, "processName", {
            get: function () { return this._processName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerListViewModel.prototype, "processHeader", {
            get: function () { return this._processHeader; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerListViewModel.prototype, "areAnalysesVisible", {
            get: function () { return this._areAnalysesVisible; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnalyzerListViewModel.prototype, "analyzerList", {
            get: function () { return this._analyzerList; },
            enumerable: true,
            configurable: true
        });
        AnalyzerListViewModel.prototype.getSelectedAnalyses = function () {
            var selected = {};
            this._analyzerListDAO.analyses.forEach(function (a) { selected[a.AnalysisId] = a; });
            for (var _i = 0, _a = this._analyzerList.roots(); _i < _a.length; _i++) {
                var root = _a[_i];
                for (var _b = 0, _c = root.children(); _b < _c.length; _b++) {
                    var child = _c[_b];
                    var vmr = child;
                    if (vmr.checkedState() === IndeterminateCheckBox_3.CheckedState.Unchecked) {
                        if (selected[vmr.uniqueId]) {
                            delete selected[vmr.uniqueId];
                        }
                    }
                }
            }
            return Object.keys(selected).map(function (k) { return selected[k]; });
        };
        AnalyzerListViewModel.prototype.onAfterRender = function (elements, viewModel) {
            var this_ = viewModel.dataAccessObject.analyzerListVM;
            if (this_.areAnalysesVisible()) {
                viewModel.onAfterDomInsert(elements, viewModel);
            }
            else {
                var subscribed_1 = this_.areAnalysesVisible.subscribe(function (visible) {
                    if (visible) {
                        viewModel.onAfterDomInsert(elements, viewModel);
                        subscribed_1.dispose();
                    }
                });
            }
        };
        AnalyzerListViewModel.prototype.updateTreeGrid = function (analysisList) {
            this._analyzerListDAO.updateTreeRows(analysisList);
            this._analyzerList.onResultChanged(0);
        };
        AnalyzerListViewModel.prototype.processHeaderString = function () {
            if (this.processName) {
                return Microsoft.Plugin.Resources.getString("DiagnosticAnalysisHeader", this.processName());
            }
            return Microsoft.Plugin.Resources.getString("NoProcessSelected");
        };
        return AnalyzerListViewModel;
    }());
    exports.AnalyzerListViewModel = AnalyzerListViewModel;
});
define("ViewModelCache", ["require", "exports"], function (require, exports) {
    "use strict";
    var CachedViewModel = (function () {
        function CachedViewModel() {
            this.analysisArea = null;
            this.resultsArea = null;
        }
        return CachedViewModel;
    }());
    exports.CachedViewModel = CachedViewModel;
    var ViewModelCache = (function () {
        function ViewModelCache() {
            this._cache = {};
        }
        ViewModelCache.prototype.cacheView = function (analysisArea, resultsArea) {
            if (resultsArea && analysisArea && analysisArea.processId) {
                this._cache[analysisArea.processId] = {
                    analysisArea: analysisArea,
                    resultsArea: resultsArea
                };
            }
        };
        ViewModelCache.prototype.getcache = function (processGuid) {
            if (processGuid) {
                return this._cache[processGuid];
            }
            return null;
        };
        return ViewModelCache;
    }());
    exports.ViewModelCache = ViewModelCache;
});
define("DiagnosticAnalysisWindow", ["require", "exports", "Constants", "AnalysisResults", "ResultsAreaViewModel", "AnalyzerListViewModel", "ViewModelCache", "Shared/CustomBindings/AriaExpanded"], function (require, exports, Constants_4, ar, rv, al, vmc) {
    "use strict";
    var AnalysesUpdatedEventArgs = (function () {
        function AnalysesUpdatedEventArgs() {
        }
        return AnalysesUpdatedEventArgs;
    }());
    var OverallViewModel = (function () {
        function OverallViewModel() {
            this.AnalyzerListViewModel = ko.observable(null);
            this.ResultsAreaViewModel = ko.observable(null);
        }
        return OverallViewModel;
    }());
    var DiagnosticAnalysisViewer = (function () {
        function DiagnosticAnalysisViewer(adaptor) {
            this._stackLinkClickedListener = null;
            this._adaptor = adaptor;
            this._stackLinkClickedListener = this.showStackLinkClicked.bind(this);
            this._isInitialized = false;
            this._cache = null;
            this._overallViewModel = new OverallViewModel();
            this._adaptor.addEventListener("AnalysesUpdated", this.onAnalysesUpdated.bind(this));
        }
        Object.defineProperty(DiagnosticAnalysisViewer.prototype, "adaptor", {
            get: function () { return this._adaptor; },
            enumerable: true,
            configurable: true
        });
        DiagnosticAnalysisViewer.prototype.removeHighlighting = function () {
            var highlightedSections = document.getElementsByClassName("highlightedText");
            for (var i = 0; i < highlightedSections.length; i++) {
                var section = highlightedSections[i];
                section.classList.remove("highlightedText");
            }
        };
        DiagnosticAnalysisViewer.prototype.analyzeButtonClicked = function () {
            var _this = this;
            this._overallViewModel.AnalyzerListViewModel().canRunAnalysis(false);
            var selected = this._overallViewModel.AnalyzerListViewModel().getSelectedAnalyses();
            if (selected.length === 0) {
                this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("NoAnalyzerSelectedError"));
                return;
            }
            var analysisCompleted = function (completedResults, exception) {
                var results = [];
                if (completedResults) {
                    for (var _i = 0, completedResults_1 = completedResults; _i < completedResults_1.length; _i++) {
                        var analysisResult = completedResults_1[_i];
                        var resultObject = ar.findAnalysisResultType(analysisResult, _this);
                        results.push(resultObject);
                    }
                }
                if (completedResults) {
                    if (results.length === 0) {
                        _this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("NoAnalysisResultsAvailable"));
                    }
                    else {
                        _this._overallViewModel.ResultsAreaViewModel().results = results;
                    }
                }
                else {
                    _this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("AnalysisCanceled"));
                }
                _this._overallViewModel.AnalyzerListViewModel().canRunAnalysis(true);
            };
            this._adaptor._call("RunAnalysesAsync", selected).done(analysisCompleted);
        };
        DiagnosticAnalysisViewer.prototype.applyBindings = function () {
            if (!this._isInitialized) {
                ko.applyBindings(this._overallViewModel);
                this._isInitialized = true;
            }
        };
        DiagnosticAnalysisViewer.prototype.clearView = function () {
            if (this._overallViewModel.ResultsAreaViewModel()) {
                this._overallViewModel.ResultsAreaViewModel().unsubscribeStackLinkClicked(this._stackLinkClickedListener);
            }
            if (this._overallViewModel.AnalyzerListViewModel()) {
            }
        };
        DiagnosticAnalysisViewer.prototype.createView = function () {
            this.clearView();
            this._overallViewModel.AnalyzerListViewModel(new al.AnalyzerListViewModel());
            this._overallViewModel.ResultsAreaViewModel(new rv.ResultsAreaViewModel(this._adaptor));
            this._overallViewModel.ResultsAreaViewModel().subscribeStackLinkClicked(this._stackLinkClickedListener);
        };
        DiagnosticAnalysisViewer.prototype.resetView = function (processGuid) {
            this.cacheView();
            var cachedView = this._cache.getcache(processGuid);
            if (cachedView) {
                this.clearView();
                this._overallViewModel.AnalyzerListViewModel(cachedView.analysisArea);
                this._overallViewModel.ResultsAreaViewModel(cachedView.resultsArea);
                this._overallViewModel.ResultsAreaViewModel().subscribeStackLinkClicked(this._stackLinkClickedListener);
                return true;
            }
            return false;
        };
        DiagnosticAnalysisViewer.prototype.cacheView = function () {
            if (!this._cache) {
                this._cache = new vmc.ViewModelCache();
            }
            this._cache.cacheView(this._overallViewModel.AnalyzerListViewModel(), this._overallViewModel.ResultsAreaViewModel());
        };
        DiagnosticAnalysisViewer.prototype.onAnalysesUpdated = function (args) {
            if (args.Reason === "DEBUGGERSTOPPED") {
                this._cache = null;
            }
            else if (this.resetView(args.ProcessGuid)) {
                return;
            }
            this.refreshAnalysisModel();
        };
        DiagnosticAnalysisViewer.prototype.refreshAnalysisModel = function () {
            var _this = this;
            var refreshAnalysisModelCompleted = function (result) {
                var status = result.Status;
                var canRunAnalysis = Boolean(result.CanRunAnalysis);
                if (_this._overallViewModel.AnalyzerListViewModel() && _this._overallViewModel.AnalyzerListViewModel().processId) {
                    return;
                }
                _this._overallViewModel.AnalyzerListViewModel().canRunAnalysis(canRunAnalysis);
                _this._overallViewModel.AnalyzerListViewModel().areAnalysesVisible(false);
                _this._overallViewModel.AnalyzerListViewModel().processName(result.ProcessName);
                if (status === "RUNNING") {
                    _this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("NotInBreakModeError"));
                    return;
                }
                else if (!result.ProcessName || (status === "NOPROCESS")) {
                    _this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("NoProcessError"));
                    return;
                }
                else if (!canRunAnalysis) {
                    _this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("UnableToRunAnalysis"));
                    return;
                }
                _this._overallViewModel.ResultsAreaViewModel().setError(null);
                _this._overallViewModel.AnalyzerListViewModel().areAnalysesVisible(true);
                if (result.length === 0) {
                    _this._overallViewModel.ResultsAreaViewModel().setError(Microsoft.Plugin.Resources.getString("NoAnalyzerDetectedError"));
                    return;
                }
                _this._overallViewModel.AnalyzerListViewModel().processId = result.ProcessGuid;
                _this._overallViewModel.AnalyzerListViewModel().updateTreeGrid(result.Analyses);
                _this.applyBindings();
            };
            this.cacheView();
            this.createView();
            this._adaptor._call("RefreshAnalysisModelAsync").done(refreshAnalysisModelCompleted);
        };
        DiagnosticAnalysisViewer.prototype.showStackLinkClicked = function (result) {
            this._adaptor._call("ShowCallStack", result.DebugContext, result.AnalyzerId, result.ErrorCode);
        };
        DiagnosticAnalysisViewer.prototype.onKeydownTextBox = function (data, event) {
            if (event.ctrlKey && (event.keyCode === Constants_4.Constants.CKeyCode)) {
                var currentTarget = event.currentTarget;
                this.CopyText(currentTarget);
                return false;
            }
            return true;
        };
        DiagnosticAnalysisViewer.prototype.onContextMenuTextBox = function (data, event) {
            var _this = this;
            var targetDivSection = event.currentTarget;
            var xPos = event.clientX;
            var yPos = event.clientY;
            this.removeHighlighting();
            targetDivSection.classList.add("highlightedText");
            event.cancelBubble = true;
            window.event.returnValue = false;
            var config = [
                {
                    label: Microsoft.Plugin.Resources.getString("CopyLabel"),
                    iconEnabled: "vs-image-menu-copy-enabled",
                    callback: function () { return _this.CopyText(targetDivSection); },
                    disabled: function () { return false; },
                    type: Microsoft.Plugin.ContextMenu.MenuItemType.command
                }];
            var contextMenu = Microsoft.Plugin.ContextMenu.create(config);
            contextMenu.addEventListener("dismiss", function () { return _this.removeHighlighting(); });
            contextMenu.show(xPos, yPos);
            return false;
        };
        DiagnosticAnalysisViewer.prototype.CopyText = function (textDiv) {
            var textarea = document.createElement("textarea");
            if (textDiv.childNodes.length === 0) {
                return;
            }
            textarea.textContent = textDiv.innerText;
            document.body.appendChild(textarea);
            var selection = document.getSelection();
            var range = document.createRange();
            range.selectNode(textarea);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
            document.body.removeChild(textarea);
            textDiv.classList.remove("highlightedText");
        };
        return DiagnosticAnalysisViewer;
    }());
    exports.DiagnosticAnalysisViewer = DiagnosticAnalysisViewer;
});

// SIG // Begin signature block
// SIG // MIIjhAYJKoZIhvcNAQcCoIIjdTCCI3ECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // oNvP/EKnNhnSv34Hc2K6C3uUdUkGdYC6KINQvLoDEBWg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIEgSUWf+LnnmDk2GPhot
// SIG // fyYKmUdbTWQ72rIM9n8KPuNDMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAkB4kaY7smpG1SHVaov1Z6gpgZXI/hExPZ9hb
// SIG // tg/obKZu7hwpXz3SLBODtCT9yTtE2y6iTPxRFgaGugke
// SIG // YOlEKIvXLeUUYcV5tidPo4KF+9j69LymTp3M2yuf2bIx
// SIG // afCCT6As9qpXLwNiODrgfpielUd2eizwjamI87Ue8AT4
// SIG // yF4Pn30fc1ZUpMUtS4pYiGuKTOyaE0qjOunvwFOnH4wj
// SIG // tiiBbqArYRjAYEis99FFVLPRnla7B4FUfn3BbvFJ00K4
// SIG // ZsXgDyAm5A74j5y1xmgCIdaQtdESNswMbE4qZVo8kFll
// SIG // JbsHVEfiSjyYhuoDF/38lIl6hXmJo9r/mjiyKvMsjaGC
// SIG // EuUwghLhBgorBgEEAYI3AwMBMYIS0TCCEs0GCSqGSIb3
// SIG // DQEHAqCCEr4wghK6AgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFRBgsqhkiG9w0BCRABBKCCAUAEggE8MIIBOAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCDWfH/a
// SIG // s0DGViHGLPw+ruk9Wr9bLBSZsWM+qX9v+hVA0AIGYPmc
// SIG // Y+coGBMyMDIxMDgxMzE4MDk0Ny45NDVaMASAAgH0oIHQ
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
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIG/yiuP5ImmhhJKV
// SIG // FFsqLhumxMnZ0DFiOjqeurMLuSqZMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgLs1cmYj41sFZBwCmFvv9
// SIG // ScP5tuuUhxsv/t0B9XF65UEwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAVHDUOdZbKrG
// SIG // pwAAAAABUTAiBCDp7UJ49//dmHSerRqn6QDVG0xipiEz
// SIG // Tm+ihjTQ0Y1oWjANBgkqhkiG9w0BAQsFAASCAQB0AToW
// SIG // T2MtqL0eIxGpgNpihwnZ5Z0XJ6efapaOnel2RbtiH+v+
// SIG // JBML8zMsLBYwMt/smPa7q0Nr5ORNxVg+Iv4R+vOT1YrX
// SIG // /HtrZasOZQA+izRooFVtw+Y4v18x+6wM0Dihe5+otLA3
// SIG // 3ARHnd5lum4wfgp2MPTIEhvcugsZieG3rBbbDyk+cLbT
// SIG // hJThNkpqulZvRnUfTGGdX/Icm+m7/xrfLxc4IYl/r1HE
// SIG // QcH6U3sv8xbJgsfIA+FO219PfkEG5Br800ba8vGiKeTG
// SIG // YOhHtmR+gCG4ru4rVCo/kR3KyRWTjLheMiUrxJrZrdTO
// SIG // xPbqtrnWRCJYGRsmSpNPPo05OYPq
// SIG // End signature block
