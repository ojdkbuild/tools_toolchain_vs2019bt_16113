
//
// AddSubdivisions.js
//
function addSubdivisions(geom, polyCollection, polyIndex, splitEdgesMap, polysToSelect) {

    var polygonPointCount = geom.getPolygonPointCount(polyIndex);
    if (polygonPointCount < 3) {
        return;
    }
    // services.debug.trace("splitting poly : " + polyIndex);

    var containingMesh = polyCollection.getContainingMesh();

    // determine if we need to add new texture coordinates
    var IndexingModeUndefined = 0;
    var IndexingModePerPoint = 1;
    var IndexingModePerPointOnPolygon = 3;

    // determine the material index on the pre division polygon
    var materialIndex = geom.getPolygonMaterialIndex(polyIndex);

    // this is our starting index for new points
    var newPointStart = geom.pointCount;

    // we'll compute the center of the triangle
    var avgPos = [0, 0, 0];
    var avgTex = [0, 0];

    // iterate over polypoints and total
    for (var i = 0; i < polygonPointCount; i++) {
        var point = geom.getPointOnPolygon(polyIndex, i);
        avgPos[0] += point[0];
        avgPos[1] += point[1];
        avgPos[2] += point[2];
    }

    // total tex coords if needed
    if (geom.textureCoordinateIndexingMode != IndexingModeUndefined) {
        for (var i = 0; i < polygonPointCount; i++) {
            
            var texCoord = geom.getTextureCoordinateOnPolygon(polyIndex, i);
            avgTex[0] += texCoord[0];
            avgTex[1] += texCoord[1];
        }
    }

    // get the center 
    var div = 1.0 / polygonPointCount;
    avgPos[0] *= div;
    avgPos[1] *= div;
    avgPos[2] *= div;

    avgTex[0] *= div;
    avgTex[1] *= div;

    // add the avg point
    geom.addPoints(avgPos, 1);

    // store tex coords if (if we need to)
    // we'll put these into the geom later
    var texcoords = new Array();
    if (geom.textureCoordinateIndexingMode == IndexingModePerPoint) {
        geom.addTextureCoordinates(avgTex, 1);
    }
    else if (geom.textureCoordinateIndexingMode == IndexingModePerPointOnPolygon) {
        texcoords.push(avgTex);
    }

    // split points for this polygon
    var splitPointIndices = new Array();
    
    // compute the split points
    for (var i = 0; i < polygonPointCount; i++) {
        var i0 = i;
        var i1 = i + 1;
        if (i1 >= polygonPointCount) {
            i1 = 0;
        }
        var p0 = geom.getPointOnPolygon(polyIndex, i0);
        var p1 = geom.getPointOnPolygon(polyIndex, i1);

        // get object level indices
        var oi0 = geom.getPolygonPoint(polyIndex, i0);
        var oi1 = geom.getPolygonPoint(polyIndex, i1);

        // index of the point that splits this edge
        var splitPointIndex = 0;

        // we're splitting the edge between object level points
        // p0 and p1, so see if this is edge has been previously split

        var tmp0 = Math.min(oi0, oi1);
        var tmp1 = Math.max(oi0, oi1);

        // services.debug.trace("splitting edge: " + tmp0 + " " + tmp1);

        var wasNewPointCreated = false;
        if (splitEdgesMap.hasOwnProperty("" + tmp0) && (splitEdgesMap[tmp0].hasOwnProperty("" + tmp1)))
        {
            splitPointIndex = splitEdgesMap[tmp0][tmp1];
            // services.debug.trace("using split point: " + splitPointIndex);
        }
        else
        {
            wasNewPointCreated = true;

            var split = [0, 0, 0];
            split[0] = p0[0] + 0.5 * (p1[0] - p0[0]);
            split[1] = p0[1] + 0.5 * (p1[1] - p0[1]);
            split[2] = p0[2] + 0.5 * (p1[2] - p0[2]);

            if (splitEdgesMap.hasOwnProperty("" + tmp0) == false) {
                splitEdgesMap[tmp0] = new Object();
            }

            splitPointIndex = geom.pointCount;
            geom.addPoints(split, 1);

            // services.debug.trace("created split point: " + splitPointIndex);

            splitEdgesMap[tmp0][tmp1] = splitPointIndex;
        }
        splitPointIndices.push(splitPointIndex);

        if (geom.textureCoordinateIndexingMode != IndexingModeUndefined) {

            var texCoord0 = geom.getTextureCoordinateOnPolygon(polyIndex, i0);
            var texCoord1 = geom.getTextureCoordinateOnPolygon(polyIndex, i1);
            var texCoord = [0, 0];
            texCoord[0] = texCoord0[0] + 0.5 * (texCoord1[0] - texCoord0[0]);
            texCoord[1] = texCoord0[1] + 0.5 * (texCoord1[1] - texCoord0[1]);

            if (geom.textureCoordinateIndexingMode == IndexingModePerPoint) {
                if (wasNewPointCreated) {
                    geom.addTextureCoordinates(texCoord, 1);
                }   
            }
            else if (geom.textureCoordinateIndexingMode == IndexingModePerPointOnPolygon) {
                texcoords.push(texCoord);
            }
        }

        //
        // we need to split edges on polys if the edge is shared
        //
        var polygonsSharingEdge = geom.getPolygonsFromEdge(tmp0, tmp1);
        var sharedPolyCount = polygonsSharingEdge.getPolygonCount();
        for (var j = 0; j < sharedPolyCount; j++) {
            var sharedPolygonIndex = polygonsSharingEdge.getPolygon(j);
            if (polyCollection.hasPolygon(sharedPolygonIndex) == false) {
                // this is a shared poly, and not part of the set we're going to subdivide explicitly
                // so we need to break the edge tmp0, tmp1
                geom.insertPolygonPoint(sharedPolygonIndex, tmp0, tmp1, splitPointIndex);
            }
        }
    }

    // we now create a new polygon (quad) for each point in the old poly
    // i.e oldpoly point count == old poly edge count == number of new polys created after split
    for (var i = 0; i < polygonPointCount; i++) {

        // wrap around
        var prevIndex;
        if (i > 0) {
            prevIndex = i - 1;
        }
        else {
            prevIndex = polygonPointCount - 1;
        }

        // add a polygon
        var thisPolyIndex = geom.polygonCount;
        geom.addPolygon(materialIndex);

        polysToSelect.push(thisPolyIndex);

        // add points
        var i0 = geom.getPolygonPoint(polyIndex, i);
        var i1 = splitPointIndices[i];
        var i2 = newPointStart;
        var i3 = splitPointIndices[prevIndex];

        geom.addPolygonPoint(thisPolyIndex, i0);
        geom.addPolygonPoint(thisPolyIndex, i1);
        geom.addPolygonPoint(thisPolyIndex, i2);
        geom.addPolygonPoint(thisPolyIndex, i3);

        if (geom.textureCoordinateIndexingMode == IndexingModePerPointOnPolygon) {
            geom.addTextureCoordinates(geom.getTextureCoordinateOnPolygon(polyIndex, i), 1);
            geom.addTextureCoordinates(texcoords[i + 1], 1);
            geom.addTextureCoordinates(texcoords[0], 1);
            geom.addTextureCoordinates(texcoords[prevIndex + 1], 1);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// helper to get a designer property as a bool
//
///////////////////////////////////////////////////////////////////////////////
function getDesignerPropAsBool(tname) {
    if (document.designerProps.hasTrait(tname))
        return document.designerProps.getTrait(tname).value;

    return false;
}

function getSelectionMode() {
    if (getDesignerPropAsBool("usePivot"))
        return 0; // default to object mode when using pivot
    if (document.designerProps.hasTrait("SelectionMode"))
        return document.designerProps.getTrait("SelectionMode").value;
    return 0;
}


// find the mesh child
function findFirstChildMeshElement(parent)
{
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


function UndoableItem(collElem, meshElem) {

    this._clonedColl = collElem.clone();
    this._polyCollection = this._clonedColl.behavior;
    this._meshElem = meshElem;
    this._mesh = meshElem.behavior;

    var geom = this._meshElem.getTrait("Geometry").value;
    this._restoreGeom = geom.clone();

    this.getName = function () {
        var IDS_MreUndoSubdivide = 147;
        return services.strings.getStringFromId(IDS_MreUndoSubdivide);
    }

    this.onDo = function () {

        var newCollection = this._clonedColl.clone();
        var newPolyBeh = newCollection.behavior;
        newPolyBeh.clear();

        // maps split edges to indices of points used to split them
        var splitEdgesMap = new Object();

        var geom = this._meshElem.getTrait("Geometry").value;

        var polysToSelect = new Array();

        // subdivide
        var polysToDelete = new Array();
        var polyCount = this._polyCollection.getPolygonCount();
        for (var i = 0; i < polyCount; i++) {
            var polyIndex = this._polyCollection.getPolygon(i);
            addSubdivisions(geom, this._polyCollection, polyIndex, splitEdgesMap, polysToSelect);

            polysToDelete.push(polyIndex);
        }

        function sortNumberDescending(a, b) {
            return b - a;
        }
 
        // delete the old selection
        polysToDelete.sort(sortNumberDescending);

        var numDeletedPolys = polysToDelete.length;

        for (var p = 0; p < polysToDelete.length; p++) {
            geom.removePolygon(polysToDelete[p]);
        }

        // shift polygon indices
        for (var p = 0; p < polysToSelect.length; p++) {
            var indexToSelect = polysToSelect[p] - numDeletedPolys;

            newPolyBeh.addPolygon(indexToSelect);
        }

        this._mesh.selectedObjects = newCollection;

        this._mesh.recomputeCachedGeometry();
    }

    this.onUndo = function () {
        var geom = this._meshElem.getTrait("Geometry").value;
        geom.copyFrom(this._restoreGeom);

        this._mesh.selectedObjects = this._clonedColl;

        this._mesh.recomputeCachedGeometry();
    }
}

var selectedElement = document.selectedElement;
var selectionMode = getSelectionMode();

// get the poly collection
var polyCollection = null;
var mesh = null;
var meshElem = null;
var collElem = null;
if (selectedElement != null) {
    if (selectionMode == 1) {
        meshElem = findFirstChildMeshElement(selectedElement);
        if (meshElem != null) {
            mesh = meshElem.behavior;

            // polygon selection mode
            collElem = mesh.selectedObjects;
            if (collElem != null) {
                polyCollection = collElem.behavior;
            }
        }
    }
}

if (polyCollection != null && collElem.typeId == "PolygonCollection") {
    var undoableItem = new UndoableItem(collElem, meshElem);
    undoableItem.onDo();
    services.undoService.addUndoableItem(undoableItem);
}
// SIG // Begin signature block
// SIG // MIIjnAYJKoZIhvcNAQcCoIIjjTCCI4kCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // vVb+u/YO+8d4nxqG8U1pDSpZo+x+WxGf5RzP6XhH35eg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIIAGLOI8qMuSAI9Msp8J
// SIG // MbWb90tOHn+Qm9EmhZujX6nHMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAbemRy34pleRs5xRkirJcXFjSWJnKflIxreR3
// SIG // aF944skjt26FXF4bpMRQbIJOqZMVfbzSJl+ytOnvhQnG
// SIG // v0EdU9cQ90/jJoOpOH6pzPBOtl4PitdCp9+3Orz0hJ7k
// SIG // +hehF6YbYQp5aXm6DRRhfpys0zHjV81tOH0rLrNuCxW9
// SIG // 1bNMDdJb7FzW7jggqRQl2tpyA+R8JdVujwmPLshwxgF7
// SIG // wzOuaRpxuSdyRWKzzcwIXKPECjDgKAHmq9MomY8ivDFa
// SIG // wt9Nu9rHnmZ00QC5EakDyTYSEUDRp8lxkxIuRfrObkK2
// SIG // h/cqbc0bwk601Oi++dMvVKo3NROz/+USr/YBRoyL86GC
// SIG // Ev0wghL5BgorBgEEAYI3AwMBMYIS6TCCEuUGCSqGSIb3
// SIG // DQEHAqCCEtYwghLSAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFYBgsqhkiG9w0BCRABBKCCAUcEggFDMIIBPwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBrksv9
// SIG // YN2nkmxYXYFPeL9A7orDzw6wRd1U/ZDulLmG9gIGYNSh
// SIG // rQEPGBIyMDIxMDgxMzE3MTYwMy4wMlowBIACAfSggdik
// SIG // gdUwgdIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
// SIG // JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGlt
// SIG // aXRlZDEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046OEQ0
// SIG // MS00QkY3LUIzQjcxJTAjBgNVBAMTHE1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFNlcnZpY2Wggg5NMIIE+TCCA+GgAwIB
// SIG // AgITMwAAATqNjTH3d0lJwgAAAAABOjANBgkqhkiG9w0B
// SIG // AQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAe
// SIG // Fw0yMDEwMTUxNzI4MjJaFw0yMjAxMTIxNzI4MjJaMIHS
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // JjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjhENDEtNEJG
// SIG // Ny1CM0I3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBTZXJ2aWNlMIIBIjANBgkqhkiG9w0BAQEFAAOC
// SIG // AQ8AMIIBCgKCAQEAzl8k518Plz8JTIXYn/O9OakqcWqd
// SIG // J8ZXJhAks9hyLB8+ANW7Zngb1t7iw7TmgeooOwMnbhCQ
// SIG // QH14UwWd8hQFWexKqVpcIFnY3b15+PYmgVeQ4XKfWJ3P
// SIG // PMjTiXu73epXHj9XX7mhS2IVqwEvDOudOI3yQL8D8OOG
// SIG // 24b+10zDDEyN5wvZ5A1Wcvl2eQhCG61GeHNaXvXOloTQ
// SIG // blVFbMWOmGviHvgRlRhRjgNmuv1J2y6fQFtiEw0pdXKC
// SIG // QG68xQlBhcu4Ln+bYL4HoeT2mrtkpHEyDZ+frr+Ka/zU
// SIG // DP3BscHkKdkNGOODfvJdWHaV0Wzr1wnPuUgtObfnBO0o
// SIG // SjIpBQIDAQABo4IBGzCCARcwHQYDVR0OBBYEFBRWoJ8W
// SIG // XxJrpslvHHWsrQmFRfPLMB8GA1UdIwQYMBaAFNVjOlyK
// SIG // MZDzQ3t8RhvFM2hahW1VMFYGA1UdHwRPME0wS6BJoEeG
// SIG // RWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3Js
// SIG // L3Byb2R1Y3RzL01pY1RpbVN0YVBDQV8yMDEwLTA3LTAx
// SIG // LmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKG
// SIG // Pmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2Vy
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3J0MAwG
// SIG // A1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // DQYJKoZIhvcNAQELBQADggEBAF435D6kAS2jeAJ8BG1K
// SIG // Tm5Az0jpbdjpqSvMLt7fOVraAEHldgk04BKcTmhzjbTX
// SIG // sjwgCMMCS+jX4Toqi0cnzcSoD2LphZA98DXeH6lRH7qQ
// SIG // dXbHgx0/vbq0YyVkltSTMv1jzzI75Z5dhpvc4Uwn4Fb6
// SIG // CCaF2/+r7Rr0j+2DGCwl8aWqvQqzhCJ/o7cNoYUfJ4WS
// SIG // CHs1OsjgMmWTmgluPIxt3kV8iLZl2IZgyr5cNOiNiTra
// SIG // FDq7hxI16oDsoW0EQKCV84nV1wWSWe1SiAKIwr5BtqYw
// SIG // J+hlocPw5qehWbBiTLntcLrwKdAbwthFr1DHf3RYwFoD
// SIG // zyNtKSB/TJsB2bMwggZxMIIEWaADAgECAgphCYEqAAAA
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
// SIG // aXRlZDEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046OEQ0
// SIG // MS00QkY3LUIzQjcxJTAjBgNVBAMTHE1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMV
// SIG // AAclkdn1j1gXgdyvYj41B8rkNZ4IoIGDMIGApH4wfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcN
// SIG // AQEFBQACBQDkwQlIMCIYDzIwMjEwODEzMjMwNzUyWhgP
// SIG // MjAyMTA4MTQyMzA3NTJaMHcwPQYKKwYBBAGEWQoEATEv
// SIG // MC0wCgIFAOTBCUgCAQAwCgIBAAICFNECAf8wBwIBAAIC
// SIG // EOAwCgIFAOTCWsgCAQAwNgYKKwYBBAGEWQoEAjEoMCYw
// SIG // DAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQAC
// SIG // AwGGoDANBgkqhkiG9w0BAQUFAAOBgQBg3hre6m0UeEde
// SIG // 2mE0pKgQHcLlgHmgvtiHzRX2B1BMnizgEUmj4gA/dYqp
// SIG // QN/M6XcbH7ILo89L9pgiK+CJQSYyYhdb1MiujJmwXIrI
// SIG // 3UYNJEDFF9LF6AoH9CyeQyZC2zTa9H50v+9aEZyZ8CtG
// SIG // gRlzGVNNU6hNVImGLdL6ciCMpjGCAw0wggMJAgEBMIGT
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB
// SIG // Oo2NMfd3SUnCAAAAAAE6MA0GCWCGSAFlAwQCAQUAoIIB
// SIG // SjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJ
// SIG // KoZIhvcNAQkEMSIEIHlPqOCdGPmdXOQdNFpTDjNJutQ8
// SIG // 6NwzyFkBAKwIM7h5MIH6BgsqhkiG9w0BCRACLzGB6jCB
// SIG // 5zCB5DCBvQQgn6/QhAepLF/7Bdsvfu8GOT+ihL9c4cgo
// SIG // 5Nf1aUN8tG0wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFt
// SIG // cCBQQ0EgMjAxMAITMwAAATqNjTH3d0lJwgAAAAABOjAi
// SIG // BCD9N+/7/KRQWoDBsUuzxM3454VCkqXQ+6H042vvcrKS
// SIG // 7zANBgkqhkiG9w0BAQsFAASCAQDA4EpJ4UBfOhUbLVRv
// SIG // tdFGS7ZGK6KXFQqrxk6mzfT+iqEdnlVnQBIY43wQr7PD
// SIG // Ea+Do2E0kfKFKS7gpYW9RjI+MJowZ/BFEcVB1MPOlj9T
// SIG // EBivpLSKRoS1CZszu7+I94MVmqey+TyqAkVEXam3pYG5
// SIG // uXjN0xVok8dlAWrNkXOR4nmf2VSbbpeob/6yIOKeXa44
// SIG // 8ScB0SXqn6m0sjFLL2lYSIVe1nfIWMJuQ5Na7RKUz7RC
// SIG // GyXxirswU3GAgcvmuBGi1Dsop/MlWgH9PSISxu9Y6aww
// SIG // syDBqiCZJtMmETZ3CseYjJfi+Px2VZNIVhcbb8MQ9xla
// SIG // 6sQ22dp65ckHeIgP
// SIG // End signature block
