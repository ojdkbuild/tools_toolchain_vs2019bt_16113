var MemoryAnalyzer = {};
(function (MemoryAnalyzer) {
    var FormattingHelpers = (function () {
        function FormattingHelpers() { }
        FormattingHelpers.zeroPad = function zeroPad(stringToPad, newLength, padLeft) {
            for (var i = stringToPad.length; i < newLength; i++) {
                stringToPad = (padLeft ? ("0" + stringToPad) : (stringToPad + "0"));
            }
            return stringToPad;
        };
        FormattingHelpers.forceNonBreakingSpaces = function forceNonBreakingSpaces(stringToConvert) {
            var substitutedString = stringToConvert.replace(/\s/g, function ($0, $1, $2) {
                return "\u00a0";
            });
            return substitutedString;
        };
        FormattingHelpers.forceHtmlRendering = function forceHtmlRendering(stringToConvert) {
            return stringToConvert.replace(/[<>]/g, function ($0, $1, $2) {
                return ($0 === "<") ? "&lt;" : "&gt;";
            });
        };
        FormattingHelpers.trimLongString = function trimLongString(stringToConvert) {
            var substitutedString = stringToConvert;
            var maxStringLength = 38;
            if (stringToConvert.length > maxStringLength) {
                var substrLength = (maxStringLength / 2) - 2;
                substitutedString = stringToConvert.substr(0, substrLength) + "\u2026" + stringToConvert.substr(-(substrLength));
            }
            return substitutedString;
        };
        FormattingHelpers.getNativeDigitLocaleString = function getNativeDigitLocaleString(stringToConvert) {
            var nf = Microsoft.Plugin.Culture.NumberFormat;
            if (!nf) {
                nf = {
                    nativeDigits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
                };
            }
            var substitutedString = stringToConvert.replace(/\d/g, function ($0, $1, $2) {
                return (nf.nativeDigits[parseInt($0)]);
            });
            return substitutedString;
        };
        FormattingHelpers.forceNumberSign = function forceNumberSign(numberToConvert, positive) {
            var nf = Microsoft.Plugin.Culture.NumberFormat;
            if (!nf) {
                nf = {
                    positiveSign: "+",
                    negativeSign: "-",
                };
            }
            if (positive === true) {
                return nf.positiveSign + numberToConvert;
            }
            return nf.negativeSign + numberToConvert;
        };
        FormattingHelpers.getDecimalLocaleString = function getDecimalLocaleString(numberToConvert, includeGroupSeparators, includeSign) {
            var positive = true;
            if (numberToConvert == 0)
                includeSign = false;
            if (numberToConvert < 0) {
                positive = false;
                numberToConvert = numberToConvert * -1;
            }
            var numberString = numberToConvert.toString();
            var nf = Microsoft.Plugin.Culture.NumberFormat;
            if (!nf) {
                nf = {
                    numberDecimalSeparator: ".",
                    numberGroupSizes: [
                        3
                    ],
                    numberGroupSeparator: ",",
                };
            }
            numberString = FormattingHelpers.getNativeDigitLocaleString(numberString);
            var split = numberString.split(/e/i);
            numberString = split[0];
            var exponent = (split.length > 1 ? parseInt(split[1], 10) : 0);
            split = numberString.split('.');
            numberString = split[0];
            var right = split.length > 1 ? split[1] : "";
            if (exponent > 0) {
                right = FormattingHelpers.zeroPad(right, exponent, false);
                numberString += right.slice(0, exponent);
                right = right.substr(exponent);
            }
            else {
                if (exponent < 0) {
                    exponent = -exponent;
                    numberString = FormattingHelpers.zeroPad(numberString, exponent + 1, true);
                    right = numberString.slice(-exponent, numberString.length) + right;
                    numberString = numberString.slice(0, -exponent);
                }
            }
            if (right.length > 0) {
                right = nf.numberDecimalSeparator + right;
            }
            if (includeGroupSeparators === true) {
                var groupSizes = nf.numberGroupSizes;
                var sep = nf.numberGroupSeparator;
                var curSize = groupSizes[0];
                var curGroupIndex = 1;
                var stringIndex = numberString.length - 1;
                var ret = "";
                while (stringIndex >= 0) {
                    if (curSize === 0 || curSize > stringIndex) {
                        if (ret.length > 0) {
                            numberString = numberString.slice(0, stringIndex + 1) + sep + ret + right;
                        }
                        else {
                            numberString = numberString.slice(0, stringIndex + 1) + right;
                        }
                        if (includeSign === true)
                            return FormattingHelpers.forceNumberSign(numberString, positive);
                        return numberString;
                    }
                    if (ret.length > 0) {
                        ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1) + sep + ret;
                    }
                    else {
                        ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1);
                    }
                    stringIndex -= curSize;
                    if (curGroupIndex < groupSizes.length) {
                        curSize = groupSizes[curGroupIndex];
                        curGroupIndex++;
                    }
                }
                if (includeSign === true)
                    return FormattingHelpers.forceNumberSign(numberString.slice(0, stringIndex + 1) + sep + ret + right, positive);
                return numberString.slice(0, stringIndex + 1) + sep + ret + right;
            }
            else {
                if (includeSign === true)
                    return FormattingHelpers.forceNumberSign(numberString + right, positive);
                return numberString + right;
            }
        };
        return FormattingHelpers;
    })();
    MemoryAnalyzer.FormattingHelpers = FormattingHelpers;
})(MemoryAnalyzer);

// SIG // Begin signature block
// SIG // MIIjgwYJKoZIhvcNAQcCoIIjdDCCI3ACAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 1WVk4j7Q4OXNyB5K8fn+hjWqTa4BHJduQz7pV6172rOg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCFVow
// SIG // ghVWAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAHfa/AukqdKtNAAAAAAAd8wDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIIfVBwmn4omz5uupXY+B
// SIG // CWl5tfYIfgObVvOvqZo/HwZMMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAawo0K5Lg8LBRa72xJ/SEj44ZRGyTff6LSNcG
// SIG // /pAJNPi9oIK2aVGvU/9mBX2uBYVu2t1M/OG9mmUIsMB+
// SIG // 66+mPJjl0iu91AnD0x2s8O/0/LpFjCv3z0l72k+OTqW+
// SIG // zoKfVDVhpIZ+dGNQs/Cxj57Myi+2k+0SLSkQYBOSOFoE
// SIG // zsEQStQpFB3QBMzjTK7Jk9sRfe0mrGz2u0/5FrQTfSKx
// SIG // JWXyvQKMv1wX+DgRIQ5VlGzzCcO1x3F6Ull51HalsYfC
// SIG // 7drKYrPulaSEyLnfQ1YJ26/eAeBUc8v57QMDqAjJnwUi
// SIG // yD2pGND1UZYExSRyv8TXM+PIo9EQ7Bs7/mm8f4ycxKGC
// SIG // EuQwghLgBgorBgEEAYI3AwMBMYIS0DCCEswGCSqGSIb3
// SIG // DQEHAqCCEr0wghK5AgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFQBgsqhkiG9w0BCRABBKCCAT8EggE7MIIBNwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCAiOUeP
// SIG // 0wwnk9pwtA/l05M6IALgla2Gg6z//Eqi/DK6dwIGYPmc
// SIG // ff5zGBIyMDIxMDgxMzE4MDk0Ny4xM1owBIACAfSggdCk
// SIG // gc0wgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsT
// SIG // HE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJjAk
// SIG // BgNVBAsTHVRoYWxlcyBUU1MgRVNOOjNCQkQtRTMzOC1F
// SIG // OUExMSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFt
// SIG // cCBTZXJ2aWNloIIOPDCCBPEwggPZoAMCAQICEzMAAAFP
// SIG // ZC519noDWoMAAAAAAU8wDQYJKoZIhvcNAQELBQAwfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcNMjAxMTEy
// SIG // MTgyNjAyWhcNMjIwMjExMTgyNjAyWjCByjELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0IEFt
// SIG // ZXJpY2EgT3BlcmF0aW9uczEmMCQGA1UECxMdVGhhbGVz
// SIG // IFRTUyBFU046M0JCRC1FMzM4LUU5QTExJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggEi
// SIG // MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCjFHe1
// SIG // ZPZoKOwb5P3E7/tIHSavithfMf8sJodyJbULIHlrUnax
// SIG // SeCxNyFKB3pLcWOdyQDyJCTRbqRqmC0bSeD1DfT1PIv6
// SIG // /A6HDsZ3Ng7z3QlDg/DElXlfQaSvp32dfT9U742O0fvJ
// SIG // C7sATEenBaz7fhTXQilwjuHVfU5WqbSxHnTciFWpmAbJ
// SIG // c9BPuP+7pYXMUpS3awGJZk9cBFfVc9C1rA5cqT4CuIEM
// SIG // Sw4HUQsIm4EFbDTMBSPR/hpLSVgoI3up1TTOp76o9gGt
// SIG // L+nQcVfVTNE2ffszpHxECA/Fs7XrwcbEFe002RHva0WB
// SIG // PbikZaZeHQEHDi2EZ9MlsjytP2r9AgMBAAGjggEbMIIB
// SIG // FzAdBgNVHQ4EFgQUjo3u1xYGEH5Vk781wmTxMV/yoKAw
// SIG // HwYDVR0jBBgwFoAU1WM6XIoxkPNDe3xGG8UzaFqFbVUw
// SIG // VgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljVGlt
// SIG // U3RhUENBXzIwMTAtMDctMDEuY3JsMFoGCCsGAQUFBwEB
// SIG // BE4wTDBKBggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraS9jZXJ0cy9NaWNUaW1TdGFQQ0Ff
// SIG // MjAxMC0wNy0wMS5jcnQwDAYDVR0TAQH/BAIwADATBgNV
// SIG // HSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsFAAOC
// SIG // AQEAPDHkqxxc5DIOesrRezybooFfl4QxGmNCa6Ru2+vg
// SIG // L27C6wZB0R58kBniWl5AmjLovJlKvJeJJPaeYhU7wVHe
// SIG // Xwxwf+kRkQYuGFF2nRkIP8dl2ob6Ad4yb0weD9o6X5hS
// SIG // b6SaQCyD/YjoSlD5AgA4KCnsm2Auva7zBm5EIh6fie5L
// SIG // OqM3rnm/OAl2UOnNbffF5sg6vaFy48PB1FMJUZ4gr3T2
// SIG // y8kEXmsE97+2ZjjJUbcE1r+vs+b1v6xZwef1dctBTUWk
// SIG // W1v/a/7WqMXtNIjrOHjCwssHhwAfulF7ms4FO1v/PYPO
// SIG // usHG4qbKvMRhxA4MnoYD7h1hyScKdxvUrN3luTCCBnEw
// SIG // ggRZoAMCAQICCmEJgSoAAAAAAAIwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDEwMB4XDTEwMDcwMTIxMzY1NVoXDTI1MDcw
// SIG // MTIxNDY1NVowfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
// SIG // AQCpHQ28dxGKOiDs/BOX9fp/aZRrdFQQ1aUKAIKF++18
// SIG // aEssX8XD5WHCdrc+Zitb8BVTJwQxH0EbGpUdzgkTjnxh
// SIG // MFmxMEQP8WCIhFRDDNdNuDgIs0Ldk6zWczBXJoKjRQ3Q
// SIG // 6vVHgc2/JGAyWGBG8lhHhjKEHnRhZ5FfgVSxz5NMksHE
// SIG // pl3RYRNuKMYa+YaAu99h/EbBJx0kZxJyGiGKr0tkiVBi
// SIG // sV39dx898Fd1rL2KQk1AUdEPnAY+Z3/1ZsADlkR+79BL
// SIG // /W7lmsqxqPJ6Kgox8NpOBpG2iAg16HgcsOmZzTznL0S6
// SIG // p/TcZL2kAcEgCZN4zfy8wMlEXV4WnAEFTyJNAgMBAAGj
// SIG // ggHmMIIB4jAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4E
// SIG // FgQU1WM6XIoxkPNDe3xGG8UzaFqFbVUwGQYJKwYBBAGC
// SIG // NxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8G
// SIG // A1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/o
// SIG // olxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZF
// SIG // aHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwv
// SIG // cHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMu
// SIG // Y3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0
// SIG // cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwgaAG
// SIG // A1UdIAEB/wSBlTCBkjCBjwYJKwYBBAGCNy4DMIGBMD0G
// SIG // CCsGAQUFBwIBFjFodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vUEtJL2RvY3MvQ1BTL2RlZmF1bHQuaHRtMEAGCCsG
// SIG // AQUFBwICMDQeMiAdAEwAZQBnAGEAbABfAFAAbwBsAGkA
// SIG // YwB5AF8AUwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQAH5ohRDeLG4Jg/gXEDPZ2joSFv
// SIG // s+umzPUxvs8F4qn++ldtGTCzwsVmyWrf9efweL3HqJ4l
// SIG // 4/m87WtUVwgrUYJEEvu5U4zM9GASinbMQEBBm9xcF/9c
// SIG // +V4XNZgkVkt070IQyK+/f8Z/8jd9Wj8c8pl5SpFSAK84
// SIG // Dxf1L3mBZdmptWvkx872ynoAb0swRCQiPM/tA6WWj1kp
// SIG // vLb9BOFwnzJKJ/1Vry/+tuWOM7tiX5rbV0Dp8c6ZZpCM
// SIG // /2pif93FSguRJuI57BlKcWOdeyFtw5yjojz6f32WapB4
// SIG // pm3S4Zz5Hfw42JT0xqUKloakvZ4argRCg7i1gJsiOCC1
// SIG // JeVk7Pf0v35jWSUPei45V3aicaoGig+JFrphpxHLmtgO
// SIG // R5qAxdDNp9DvfYPw4TtxCd9ddJgiCGHasFAeb73x4QDf
// SIG // 5zEHpJM692VHeOj4qEir995yfmFrb3epgcunCaw5u+zG
// SIG // y9iCtHLNHfS4hQEegPsbiSpUObJb2sgNVZl6h3M7COaY
// SIG // LeqN4DMuEin1wC9UJyH3yKxO2ii4sanblrKnQqLJzxlB
// SIG // TeCG+SqaoxFmMNO7dDJL32N79ZmKLxvHIa9Zta7cRDyX
// SIG // UHHXodLFVeNp3lfB0d4wwP3M5k37Db9dT+mdHhk4L7zP
// SIG // WAUu7w2gUDXa7wknHNWzfjUeCLraNtvTX4/edIhJEqGC
// SIG // As4wggI3AgEBMIH4oYHQpIHNMIHKMQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmlj
// SIG // YSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMgVFNT
// SIG // IEVTTjozQkJELUUzMzgtRTlBMTElMCMGA1UEAxMcTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcG
// SIG // BSsOAwIaAxUA6CIM4qrSBzqcjNeHUndeKXgqq+iggYMw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAN
// SIG // BgkqhkiG9w0BAQUFAAIFAOTBG1gwIhgPMjAyMTA4MTQw
// SIG // MDI0NTZaGA8yMDIxMDgxNTAwMjQ1NlowdzA9BgorBgEE
// SIG // AYRZCgQBMS8wLTAKAgUA5MEbWAIBADAKAgEAAgIfuAIB
// SIG // /zAHAgEAAgIRXTAKAgUA5MJs2AIBADA2BgorBgEEAYRZ
// SIG // CgQCMSgwJjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6Eg
// SIG // oQowCAIBAAIDAYagMA0GCSqGSIb3DQEBBQUAA4GBAACL
// SIG // 41HOQY2k0oxVQRwcZH9xh7MdaEjLcsu1JzTh6qcxTqBE
// SIG // W0wReO+4HVRs9b19SNCYBdkG+VMW/yGUAgkwDznYT6Li
// SIG // yV92Sve9sqaCh9LTQUSZ1r3tknD8dPB7fmrR4iVJTLMI
// SIG // 7p517STnwsOM0DE2pDZuGqVzza8wV5+Ug8WTMYIDDTCC
// SIG // AwkCAQEwgZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTACEzMAAAFPZC519noDWoMAAAAAAU8wDQYJYIZIAWUD
// SIG // BAIBBQCgggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0B
// SIG // CRABBDAvBgkqhkiG9w0BCQQxIgQg97Ny9FZNkaDIK1dy
// SIG // 5kNVUbWGWdoCmkyGWRsex1ci10gwgfoGCyqGSIb3DQEJ
// SIG // EAIvMYHqMIHnMIHkMIG9BCAAZyYQ9oJYpMDGciFtGHJ6
// SIG // Q8+q+HltMI0QxcbBALU3AjCBmDCBgKR+MHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABT2QudfZ6A1qD
// SIG // AAAAAAFPMCIEILLeJfz5bNj+vzgVXhJd4EzzVQybyW3b
// SIG // eD2XdQjsxApVMA0GCSqGSIb3DQEBCwUABIIBAFym8RWq
// SIG // TrWFRi/K2FTTZOfAkpC3ngIcVMU+icXiBKP1qvZqx1Qd
// SIG // sQUPK3U+3pBVK9ZXzTtll5+lvmSi+Mj777NStcR+z2fN
// SIG // WgvJ5MTlXOJBKNNLZe9wfj/LGTkDAPtzcGRNPzGDFdhV
// SIG // ho5k4e6/WXPEqzdtkamipqyWg3CPrFvdCWKod8H5K0Mh
// SIG // fTuh/SrXNqFVOk3Jto9tizMQMVZ4Q5Vv9oHGfXwtTjxD
// SIG // 3RZ5nisnX4r8SREK8CW14JXL4T6vdbLa1rHsGvSmOamQ
// SIG // JE11asjdR7ktQMOU7FIq5rkkLVP4YwyIYefodonqSgHa
// SIG // 1GGogFIsKk+Ewbisc++NqIH5h3c=
// SIG // End signature block
