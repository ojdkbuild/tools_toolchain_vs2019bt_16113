//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
//
// Use of this source code is subject to the terms of the Microsoft shared
// source or premium shared source license agreement under which you licensed
// this source code. If you did not accept the terms of the license agreement,
// you are not authorized to use this source code. For the terms of the license,
// please see the license agreement between you and Microsoft or, if applicable,
// see the SOURCE.RTF on your install media or the root of your tools installation.
// THE SOURCE CODE IS PROVIDED "AS IS", WITH NO WARRANTIES OR INDEMNITIES.
//

// services.debug.trace("Rotate");


///////////////////////////////////////////////////////////////////////////////
//
// Global data
//
///////////////////////////////////////////////////////////////////////////////

var useStep = false;
var state = command.getTrait("state");
var stepAmount = 5.0;
var enablePropertyWindow = 8;
var toolProps;

// establish tool options and deal with tool option changes
var manipulatorTraitXYZTraitChangedCookie;

// get manipulator
var manipulatorData = services.manipulators.getManipulatorData("RotationManipulator");
var manipulator = services.manipulators.getManipulator("RotationManipulator");
var undoableItem;

var mxyz = manipulatorData.getTrait("RotationManipulatorTraitXYZ");

var accumDx;
var accumDy;
var accumDz;

var tool = new Object();

var onBeginManipulationHandler;


///////////////////////////////////////////////////////////////////////////////
// designer props bool access
///////////////////////////////////////////////////////////////////////////////
function getDesignerPropAsBool(tname) {
    if (document.designerProps.hasTrait(tname))
        return document.designerProps.getTrait(tname).value;
    return false;
}

function getCommandState(commandName) {
    var commandData = services.commands.getCommandData(commandName);
    if (commandData != null) {
        var trait = commandData.getTrait("state");
        if (trait != null) {
            return trait.value;
        }
    }
    return -1;
}

function getShouldUsePivot() {
    return getDesignerPropAsBool("usePivot");
}

function getSelectionMode() {
    if (getShouldUsePivot())
        return 0; // default to object mode when using pivot
    if (document.designerProps.hasTrait("SelectionMode"))
        return document.designerProps.getTrait("SelectionMode").value;
    return 0;
}

// setup tool options
function UseStepChanged(sender, args) {
    useStep = document.toolProps.getTrait("UseStep").value;
}

function StepAmountChanged(sender, args) {
    stepAmount = document.toolProps.getTrait("StepAmount").value;
}

var snapCookie;
var toolPropCookie;
function createOptions() {
    toolProps = document.createElement("toolProps", "type", "toolProps");
    toolProps.getOrCreateTrait("StepAmount", "float", enablePropertyWindow);
    document.toolProps = toolProps;

    var snapTrait = document.designerProps.getOrCreateTrait("snap", "bool", 0);
    snapCookie = snapTrait.addHandler("OnDataChanged", OnSnapEnabledTraitChanged);

    toolProps.getTrait("StepAmount").value = stepAmount;

    // Set up the callback when the option traits are changed
    toolPropCookie = toolProps.getTrait("StepAmount").addHandler("OnDataChanged", StepAmountChanged);

    OnSnapEnabledTraitChanged(null, null);
}

function OnSnapEnabledTraitChanged(sender, args) {
    var snapTrait = document.designerProps.getOrCreateTrait("snap", "bool", 0);
    if (toolProps != null) {
        var stepAmountTrait = toolProps.getTrait("StepAmount");
        if (stepAmountTrait != null) {
            var newFlags = stepAmountTrait.flags;
            if (snapTrait.value) {
                newFlags |= enablePropertyWindow;
            }
            else {
                newFlags &= ~enablePropertyWindow;
            }
            stepAmountTrait.flags = newFlags;

            document.refreshPropertyWindow();
        }
    }
}
function getFirstSelectedWithoutAncestorInSelection() {
    var count = services.selection.count;
    for (var i = 0; i < count; i++) {
        var currSelected = services.selection.getElement(i);

        //
        // don't operate on items whose parents (in scene) are ancestors
        // since this will double the amount of translation applied to those
        //
        var hasAncestor = false;
        for (var otherIndex = 0; otherIndex < count; otherIndex++) {
            if (otherIndex != i) {
                var ancestor = services.selection.getElement(otherIndex);
                if (currSelected.behavior.isAncestor(ancestor)) {
                    hasAncestor = true;
                    break;
                }
            }
        }

        if (!hasAncestor) {
            return currSelected;
        }
    }
    return null;
}

///////////////////////////////////////////////////////////////////////////////
//
// Helper functions
//
///////////////////////////////////////////////////////////////////////////////

function getWorldMatrix(element) {
    return element.getTrait("WorldTransform").value;
}

function getCameraElement() {
    var camera = document.elements.findElementByTypeId("Microsoft.VisualStudio.3D.PerspectiveCamera");
    return camera;
}

// find the mesh child
function findFirstChildMesh(parent) {
    // find the mesh child
    for (var i = 0; i < parent.childCount; i++) {

        // get child and its materials
        var child = parent.getChild(i);
        if (child.typeId == "Microsoft.VisualStudio.3D.Mesh") {
            return child;
        }
    }
    return null;
}

function getRotationTraitId() {
    return "Rotation";
}

///////////////////////////////////////////////////////////////////////////////
//
// helper that given an angle/axis in world space, returns the matrix for
// the rotation in local space of a node
//
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
// rotate logic
//
///////////////////////////////////////////////////////////////////////////////
function coreRotate(axis) {

    var selectionMode = getSelectionMode();

    var selectedElement = getFirstSelectedWithoutAncestorInSelection();
    if (selectedElement == null) {
        return;
    }

    // get the angle and axis
    var angle = math.getLength(axis);
    axis = math.getNormalized(axis);

    if (selectionMode == 0) {

        //
        // object mode
        //

        // get the selected as node
        var selectedNode = selectedElement.behavior;

        // determine local to world transform
        var localToWorld = selectedElement.getTrait("WorldTransform").value;
        
        // remove scale
        var scale = selectedElement.getTrait("Scale").value;
        var scaleMatrix = math.createScale(scale);
        var scaleInverse = math.getInverse(scaleMatrix);
        localToWorld = math.multiplyMatrix(localToWorld, scaleInverse);

        // get world to local as inverse
        var worldToLocal = math.getInverse(localToWorld);

        // transform the axis into local space
        axis = math.transformNormal(worldToLocal, axis);
        axis = math.getNormalized(axis);

        // compute the rotation matrix in local space
        var rotationDeltaInLocal = math.createRotationAngleAxis(angle, axis);

        // determine the trait name to modify
        var rotationTraitId = getRotationTraitId();

        // get the current rotation value as euler xyz
        var currentRotation = selectedElement.getTrait(rotationTraitId).value;

        // convert to radians
        var factor = 3.14 / 180.0;
        currentRotation[0] *= factor;
        currentRotation[1] *= factor;
        currentRotation[2] *= factor;

        // get the current rotation matrix
        var currentRotationMatrixInLocal = math.createEulerXYZ(
            currentRotation[0],
            currentRotation[1],
            currentRotation[2]
            );

        // compute the new rotation matrix
        var newRotationInLocal = math.multiplyMatrix(currentRotationMatrixInLocal, rotationDeltaInLocal);

        // extract euler angles
        var newXYZ = math.getEulerXYZ(newRotationInLocal);

        // convert to degrees
        var invFactor = 1.0 / factor;
        newXYZ[0] *= invFactor;
        newXYZ[1] *= invFactor;
        newXYZ[2] *= invFactor;

        // check for grid snap
        var isSnapMode = getDesignerPropAsBool("snap");
        if (isSnapMode && stepAmount != 0) {

            //
            // snap to grid is ON
            //

            var targetX = newXYZ[0] + accumDx;
            var targetY = newXYZ[1] + accumDy;
            var targetZ = newXYZ[2] + accumDz;

            var roundedX = Math.round(targetX / stepAmount) * stepAmount;
            var roundedY = Math.round(targetY / stepAmount) * stepAmount;
            var roundedZ = Math.round(targetZ / stepAmount) * stepAmount;

            var halfStep = stepAmount * 0.5;
            var stepPct = halfStep * 0.9;

            var finalXYZ = selectedElement.getTrait(rotationTraitId).value;
            if (Math.abs(roundedX - targetX) < stepPct) {
                finalXYZ[0] = roundedX;
            }

            if (Math.abs(roundedY - targetY) < stepPct) {
                finalXYZ[1] = roundedY;
            }

            if (Math.abs(roundedZ - targetZ) < stepPct) {
                finalXYZ[2] = roundedZ;
            }

            accumDx = targetX - finalXYZ[0];
            accumDy = targetY - finalXYZ[1];
            accumDz = targetZ - finalXYZ[2];

            newXYZ = finalXYZ;
        }

        undoableItem._lastValue = newXYZ;
        undoableItem.onDo();
    }
    else if (selectionMode == 1 || selectionMode == 2 || selectionMode == 3) {
        //
        // polygon or edge selection mode
        //

        localToWorld = selectedElement.getTrait("WorldTransform").value;
        
        // normalize the local to world matrix to remove scale
        var scale = selectedElement.getTrait("Scale").value;
        var scaleMatrix = math.createScale(scale);
        var scaleInverse = math.getInverse(scaleMatrix);
        localToWorld = math.multiplyMatrix(localToWorld, scaleInverse);

        // get world to local as inverse
        var worldToLocal = math.getInverse(localToWorld);

        // transform the axis into local space
        axis = math.transformNormal(worldToLocal, axis);
        axis = math.getNormalized(axis);

        // compute the rotation matrix in local space
        var rotationDeltaInLocal = math.createRotationAngleAxis(angle, axis);
        
        undoableItem._currentDelta = rotationDeltaInLocal;

        undoableItem.onDo();
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// Listens to manipulator position changes
//
///////////////////////////////////////////////////////////////////////////////
function onManipulatorXYZChangedHandler(sender, args) {
    var axis = manipulatorData.getTrait("RotationManipulatorTraitXYZ").value;
    coreRotate(axis);
}

//
// create an object that can be used to do/undo subobject rotation
//
function UndoableSubobjectRotation(elem) {
    
    this._totalDelta = math.createIdentity();
    this._currentDelta = math.createIdentity();

    // find the mesh child
    this._meshElem = findFirstChildMesh(elem);
    if (this._meshElem == null) {
        return;
    }

    // get the manipulator position. we will use this as our rotation origin
    var rotationOrigin = manipulator.getWorldPosition();

    // get the transform into mesh local space
    var localToWorldMatrix = getWorldMatrix(this._meshElem);
    var worldToLocal = math.getInverse(localToWorldMatrix);

    // transform the manipulator position into mesh space
    this._rotationOrigin = math.transformPoint(worldToLocal, rotationOrigin);

    // get the mesh behavior to use later
    this._mesh = this._meshElem.behavior;

    // get the collection element
    var collElem = this._mesh.selectedObjects;
    if (collElem == null) {
        return;
    }

    // clone the collection element
    this._collectionElement = collElem.clone();

    // get the actual collection we can operate on
    this._collection = this._collectionElement.behavior;
    
    // get the geometry we will operate on
    this._geom = this._meshElem.getTrait("Geometry").value
}

//
// called whenever a manipulation is started
//
function onBeginManipulation() {
    
    undoableItem = null;

    //
    // Check the selection mode
    //
    var selectionMode = getSelectionMode();
    if (selectionMode == 0) {
        //
        // object selection
        //

        accumDx = 0;
        accumDy = 0;
        accumDz = 0;

        var traitId = getRotationTraitId();

        function UndoableRotation(trait, traitValues, initialValue, rotationOffset, urrGeom, restoreGeom, meshes, shouldUsePivot) {
            this._traitArray = traitArray;
            this._traitValues = traitValues;
            this._initialValues = initialValue;
            this._restoreGeom = restoreGeom;
            this._currGeom = currGeom;
            this._rotationOffset = rotationOffset;
            this._meshes = meshes;
            this._shouldUsePivot = shouldUsePivot;
        }

        var traitArray = new Array();
        var traitValues = new Array();
        var initialValues = new Array();
        var restoreGeom = new Array();
        var currGeom = new Array();
        var rotationOffset = new Array();
        var meshes = new Array();

        //
        // add the traits of selected items to the collections that we'll be operating on
        //

        var count = services.selection.count;
        for (i = 0; i < count; i++) {
            var currSelected = services.selection.getElement(i);

            //
            // don't operate on items whose parents (in scene) are ancestors
            // since this will double the amount of translation applied to those
            //
            var hasAncestor = false;
            for (var otherIndex = 0; otherIndex < count; otherIndex++) {
                if (otherIndex != i) {
                    var ancestor = services.selection.getElement(otherIndex);
                    if (currSelected.behavior.isAncestor(ancestor)) {
                        hasAncestor = true;
                        break;
                    }
                }
            }

            if (!hasAncestor) {

                var currTrait = currSelected.getTrait(traitId);

                // get the transform to object space
                var localToWorldMatrix = getWorldMatrix(currSelected);
                var worldToLocal = math.getInverse(localToWorldMatrix);

                // get the manipulators position
                var rotationOriginInWorld = manipulator.getWorldPosition(currSelected);

                // get the manip position in object space
                var rotationPivotInObject = math.transformPoint(worldToLocal, rotationOriginInWorld);

                var meshElem = findFirstChildMesh(currSelected);
                if (meshElem != null) {
                    // save the geometry pointer and a copy of the geometry to restore on undo
                    meshes.push(meshElem.behavior);

                    var geom;
                    geom = meshElem.getTrait("Geometry").value;
                    currGeom.push(geom);
                    restoreGeom.push(geom.clone());
                }
                else {
                    meshes.push(null);
                    currGeom.push(null);
                    restoreGeom.push(null);
                }

                traitArray.push(currTrait);
                traitValues.push(currTrait.value);
                initialValues.push(currTrait.value);
                rotationOffset.push(rotationPivotInObject);
            }
        }

        // create the undoable item
        undoableItem = new UndoableRotation(traitArray, traitValues, initialValues, rotationOffset, currGeom, restoreGeom, meshes, getShouldUsePivot());
        undoableItem.onDo = function () {

            var count = this._traitArray.length;

            // movement delta of all the selected is determined by delta of the first selected
            var delta = [0, 0, 0];
            if (count > 0) {
                delta[0] = this._lastValue[0] - this._initialValues[0][0];
                delta[1] = this._lastValue[1] - this._initialValues[0][1];
                delta[2] = this._lastValue[2] - this._initialValues[0][2];
            }

            var factor = 3.14 / 180.0;
            for (i = 0; i < count; i++) {
                var currTrait = this._traitArray[i];
                this._traitValues[i][0] = this._initialValues[i][0] + delta[0];
                this._traitValues[i][1] = this._initialValues[i][1] + delta[1];
                this._traitValues[i][2] = this._initialValues[i][2] + delta[2];

                var theVal = [0, 0, 0];
                theVal[0] = this._traitValues[i][0];
                theVal[1] = this._traitValues[i][1];
                theVal[2] = this._traitValues[i][2];

                // get the current rotation matrix
                if (this._shouldUsePivot) {
                    var theOldVal = this._traitArray[i].value;
                    var currentRotationMatrixInLocal = math.createEulerXYZ(factor * theOldVal[0], factor * theOldVal[1], factor * theOldVal[2]);

                    // get the new rotation matrix
                    var newRotationInLocal = math.createEulerXYZ(factor * theVal[0], factor * theVal[1], factor * theVal[2]);

                    // get the inverse rotation of the old rotation
                    var toOldRotation = math.getInverse(currentRotationMatrixInLocal);

                    // compute the rotation delta as matrix
                    var rotationDelta = math.multiplyMatrix(toOldRotation, newRotationInLocal);
                    rotationDelta = math.getInverse(rotationDelta);

                    // we want to rotate relative to the manipulator position
                    if (this._meshes[i] != null) {
                        var translationMatrix = math.createTranslation(this._rotationOffset[i][0], this._rotationOffset[i][1], this._rotationOffset[i][2]);
                        var invTranslationMatrix = math.getInverse(translationMatrix);
                        var transform = math.multiplyMatrix(rotationDelta, invTranslationMatrix);
                        transform = math.multiplyMatrix(translationMatrix, transform);

                        // apply inverse delta to geometry
                        this._currGeom[i].transform(transform);
                        this._meshes[i].recomputeCachedGeometry();
                    }
                }

                // set the rotation trait value
                this._traitArray[i].value = theVal;
            }
        }

        undoableItem.onUndo = function () {
            var count = this._traitArray.length;
            for (i = 0; i < count; i++) {
                this._traitArray[i].value = this._initialValues[i];
                if (this._shouldUsePivot) {
                    if (this._meshes[i] != null) {
                        this._currGeom[i].copyFrom(this._restoreGeom[i]);
                        this._meshes[i].recomputeCachedGeometry();
                    }
                }
            }
        }
    }
    else {

        // create the undoable item
        undoableItem = new UndoableSubobjectRotation(document.selectedElement);

        if (selectionMode == 1) {
            // polygon selection mode
            undoableItem.getPoints = function () {

                // use map/hash in object to eliminate dups in collection 
                var points = new Object();

                // loop over the point indices in the poly collection
                var polyCount = this._collection.getPolygonCount();
                for (var i = 0; i < polyCount; i++) {
                    var polyIndex = this._collection.getPolygon(i);

                    // get the point count and loop over polygon points
                    var polygonPointCount = this._geom.getPolygonPointCount(polyIndex);
                    for (var j = 0; j < polygonPointCount; j++) {

                        // get the point index
                        var pointIndex = this._geom.getPolygonPoint(polyIndex, j);
                        points[pointIndex] = pointIndex;
                    }
                }
                return points;
            }
        }
        else if (selectionMode == 2) {
            // edge selection mode
            undoableItem.getPoints = function () {

                // use map/hash in object to eliminate dups in collection 
                var points = new Object();

                // loop over the edges
                var edgeCount = this._collection.getEdgeCount();
                for (var i = 0; i < edgeCount; i++) {
                    var edge = this._collection.getEdge(i);

                    points[edge[0]] = edge[0];
                    points[edge[1]] = edge[1];
                }
                return points;
            }
        }
        else if (selectionMode == 3) {
            // edge selection mode
            undoableItem.getPoints = function () {

                // use map/hash in object to eliminate dups in collection
                var points = new Object();

                // loop over the points
                var ptCount = this._collection.getPointCount();
                for (var i = 0; i < ptCount; i++) {
                    var pt = this._collection.getPoint(i);

                    points[pt] = pt;
                }
                return points;
            }
        }

        // do
        undoableItem.onDo = function () {

            // we want to rotate relative to the manipulator position
            var polygonPoints = this.getPoints()

            var translationMatrix = math.createTranslation(this._rotationOrigin[0], this._rotationOrigin[1], this._rotationOrigin[2]);
            var invTranslationMatrix = math.getInverse(translationMatrix);
            var transform = math.multiplyMatrix(this._currentDelta, invTranslationMatrix);
            transform = math.multiplyMatrix(translationMatrix, transform);

            // loop over the unique set of indices and transform the associated point
            for (var key in polygonPoints) {
                var ptIdx = polygonPoints[key];
                var pt = this._geom.getPointAt(ptIdx);

                pt = math.transformPoint(transform, pt);

                this._geom.setPointAt(ptIdx, pt);
            }

            this._totalDelta = math.multiplyMatrix(this._currentDelta, this._totalDelta);

            // invalidate the mesh collision
            this._mesh.recomputeCachedGeometry();
        }

        //
        // undo
        //
        undoableItem.onUndo = function () {

            // we want to rotate relative to the manipulator position
            var polygonPoints = this.getPoints()

            var invTotal = math.getInverse(this._totalDelta);

            // we want to rotate relative to the manipulator position
            var translationMatrix = math.createTranslation(this._rotationOrigin[0], this._rotationOrigin[1], this._rotationOrigin[2]);
            var invTranslationMatrix = math.getInverse(translationMatrix);
            var transform = math.multiplyMatrix(invTotal, invTranslationMatrix);
            transform = math.multiplyMatrix(translationMatrix, transform);

            // loop over the unique set of indices and transform the associated point
            for (var key in polygonPoints) {
                var ptIdx = polygonPoints[key];
                var pt = this._geom.getPointAt(ptIdx);

                pt = math.transformPoint(transform, pt);

                this._geom.setPointAt(ptIdx, pt);
            }

            this._currentDelta = this._totalDelta;
            this._totalDelta = math.createIdentity();

            this._mesh.recomputeCachedGeometry();
        }
    }

    if (undoableItem != null) {
        //
        // getName()
        //
        undoableItem.getName = function () {
            var IDS_MreUndoRotate = 144;
            return services.strings.getStringFromId(IDS_MreUndoRotate);
        }

        services.undoService.addUndoableItem(undoableItem);
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// tool method implementations
//
///////////////////////////////////////////////////////////////////////////////

tool.activate = function () {
    state.value = 2;

    createOptions();

    services.manipulators.activate("RotationManipulator");

    onBeginManipulationHandler = manipulator.addHandler("OnBeginManipulation", onBeginManipulation);

    manipulatorTraitXYZTraitChangedCookie = mxyz.addHandler("OnDataChanged", onManipulatorXYZChangedHandler);
}

tool.deactivate = function () {
    state.value = 0;

    toolProps.getTrait("StepAmount").removeHandler("OnDataChanged", toolPropCookie);

    var snapTrait = document.designerProps.getOrCreateTrait("snap", "bool", 0);
    snapTrait.removeHandler("OnDataChanged", snapCookie);

    mxyz.removeHandler("OnDataChanged", manipulatorTraitXYZTraitChangedCookie);
    services.manipulators.deactivate("RotationManipulator");

    manipulator.removeHandler("OnBeginManipulation", onBeginManipulationHandler);
}

// If we're already running, do nothing
if (state.value != 2) {
    document.setTool(tool);
}

// SIG // Begin signature block
// SIG // MIIjhAYJKoZIhvcNAQcCoIIjdTCCI3ECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // ExknoqtH+sUrBFmA6SevC9vPXY7sKeLpyqrvkPzsOWCg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIL2leogBpbFTl1r5Nkoz
// SIG // c1HzFuhMK0uhCPhZHaS+C4IyMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEApYSaZYtPVCpFqLCDMVKjwnK/Uu1YebmBFnSg
// SIG // 4UwiMrc4RsPVNPaknQ9CDG0zdxNmyJaeLK8e4esX15W2
// SIG // Txiil0uCuObunUWHC6s4DkDaVGCPxdFMM+Ec4InBXdkD
// SIG // dB8VwHRs1F4cqiR62sdQkZ+N7tN7vtqg2xpcOEZvH3X3
// SIG // LW1lPgJ193Qdovm3XTNQf8FqXqwN/86Om0YtGXI0F4hW
// SIG // 8maYNnvaMyL1Z0sdACQqjkeNryqAZJQS/cgQ596+k9/b
// SIG // IUCa3sB365qnQnAjo1dJPx+baPh5tR96MwPjnkFbmGUD
// SIG // zjtWth+QKi4/AUHCOav0B7QKdYh9xTDNdPgMP6HPLqGC
// SIG // EuUwghLhBgorBgEEAYI3AwMBMYIS0TCCEs0GCSqGSIb3
// SIG // DQEHAqCCEr4wghK6AgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFRBgsqhkiG9w0BCRABBKCCAUAEggE8MIIBOAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCC9UrUU
// SIG // sGUvQLp550rU/Wc2BznPKjqgzdeGDwbBgdkEwAIGYPmc
// SIG // UaqEGBMyMDIxMDgxMzE3MTYwNi40NjRaMASAAgH0oIHQ
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
// SIG // DQYJKoZIhvcNAQEFBQACBQDkwRspMCIYDzIwMjEwODE0
// SIG // MDAyNDA5WhgPMjAyMTA4MTUwMDI0MDlaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOTBGykCAQAwCgIBAAICAaoC
// SIG // Af8wBwIBAAICEUowCgIFAOTCbKkCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQBI
// SIG // YvmUG15pRDxQqcJYHMH6S81BtahGWarZr4wRTCVJON5n
// SIG // sXA4v8yrT8afYeAfwc96Py/asJiPa/M+an9Yu45elRax
// SIG // 3qsXxyZ65nYY5+xHs5HXBNyoDM98ozaSLyl7MUZcaqZV
// SIG // q7L1kxAlI07VhhV69SbuvyIJxWqjC7lzwl9q7DGCAw0w
// SIG // ggMJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABUFii1KebCzDrAAAAAAFQMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIAzi0bjACe9kLRrq
// SIG // pHEsEIYHaqft/1J62pFdSF7SDe6RMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgbPQ+ny+awk4YFyZhiIXV
// SIG // 0uiGNWYOqKeO3ZCifC/yo/YwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAVBYotSnmwsw
// SIG // 6wAAAAABUDAiBCD9Vxok3B2cpv4g7/R7ChabQX/j5MUQ
// SIG // QHQZg5y+4K2R+DANBgkqhkiG9w0BAQsFAASCAQCabKOH
// SIG // X2aZmVk1tus/QDWRDlZgf8671InZVeyUMpMY/pRJGJB6
// SIG // lB7G5t6qxD1VtaLGtHowv/HprEOxFC2fItWg1+9uCVwi
// SIG // V/aCyAdxhkR2EWF0Nmjkfe0K+mbnVhDelKc3a4FYP+SW
// SIG // 6ZOMpvJPg22HGmEUKhrMSgm+72Hr300J3XSItHt210cd
// SIG // Vy7YUNDT3Cs7J/FaROT0X1MT5jAUrR0rPkLOjxjBBFXb
// SIG // ljjpY3epYi3/g7kceNR0ped08oBdFGnd/IefaIerMac6
// SIG // ndgAb+MoqO5NWiFAZK8hHISkxJGf3B5xMOvRFl71CFyw
// SIG // ojJxHw/xyzfrWOKP3P0CH9gGJARd
// SIG // End signature block
