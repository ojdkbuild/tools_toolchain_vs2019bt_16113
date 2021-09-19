// Copyright (c) Microsoft Corporation. All rights reserved.

var vsViewKindPrimary = "{00000000-0000-0000-0000-000000000000}";
var vsViewKindDebugging = "{7651A700-06E5-11D1-8EBD-00A0C90F26EA}";
var vsViewKindCode = "{7651A701-06E5-11D1-8EBD-00A0C90F26EA}";
var vsViewKindDesigner = "{7651A702-06E5-11D1-8EBD-00A0C90F26EA}";
var vsViewKindTextView = "{7651A703-06E5-11D1-8EBD-00A0C90F26EA}";

var GUID_ItemType_PhysicalFolder = "{6BB5F8EF-4483-11D3-8BCF-00C04F8EC28C}";
var GUID_ItemType_VirtualFolder = "{6BB5F8F0-4483-11D3-8BCF-00C04F8EC28C}";
var GUID_ItemType_PhysicalFile = "{6BB5F8EE-4483-11D3-8BCF-00C04F8EC28C}";
var vsProjectKindSolutionFolder = "{66A26720-8FB5-11D2-AA7E-00C04F688DDE}";

var GUID_Deployment_TemplatePath = "{54435603-DBB4-11D2-8724-00A0C9A8B90C}";

var vsCMLanguageIDL = "{B5E9BD35-6D3E-4B5D-925E-8A43B79820B4}";
var vsCMLanguageVC = "{B5E9BD32-6D3E-4B5D-925E-8A43B79820B4}";


var gbExceptionThrown = false;

var vsCMFunctionConstructor = 1;
var vsCMFunctionFunction = 128;
var vsCMAddPositionInvalid = -3;
var vsCMAddPositionDefault = -2;
var vsCMAddPositionEnd = -1;
var vsCMAddPositionStart = 0;
//
var vsCMAccessPublic = 1;
var vsCMAccessDefault = 32;
//
var vsCMWhereInvalid = -1;
var vsCMWhereDefault = 0;
var vsCMWhereDeclaration = 1;
var vsCMWhereDefinition = 2;
//
var vsCMPartName = 1;
var vsCMPartAttributes = 2;
var vsCMPartHeader = 4;
var vsCMPartWhole = 8;
var vsCMPartBody = 16;
var vsCMPartNavigate = 32;
//vsCMPartDelimiter = 64;
var vsCMPartAttributesWithDelimiter = 68;
var vsCMPartBodyWithDelimiter = 80;
var vsCMPartHeaderWithAttributes = 6;
var vsCMPartWholeWithAttributes = 10;
//
var vsCMValidateFileExtNone = -1;
var vsCMValidateFileExtCpp = 0;
var vsCMValidateFileExtCppSource = 1;
var vsCMValidateFileExtHtml = 2;
//
var vsCMElementClass = 1;
var vsCMElementFunction = 2;
var vsCMElementVariable = 3;
var vsCMElementProperty = 4;
var vsCMElementNamespace = 5;
var vsCMElementInterface = 8;
var vsCMElementStruct = 11;
var vsCMElementUnion = 12;
var vsCMElementMacro = 29;
var vsCMElementIDLCoClass = 33;
var vsCMElementVCBase = 37;
//
var einterfaceDual = 0;
var einterfaceCustom = 1;
var einterfaceDispinterface = 2;
//
var eparamIn = 0;
var eparamOut = 1;
var eparamInOut = 2;
var eparamOutRetval = 3;


// VS-specific HRESULT failure codes
//
var OLE_E_PROMPTSAVECANCELLED = -2147221492;
var VS_E_PROJECTALREADYEXISTS = -2147753952;
var VS_E_PACKAGENOTLOADED = -2147753953;
var VS_E_PROJECTNOTLOADED = -2147753954;
var VS_E_SOLUTIONNOTOPEN = -2147753955;
var VS_E_SOLUTIONALREADYOPEN = -2147753956;
var VS_E_INCOMPATIBLEDOCDATA = -2147753962;
var VS_E_UNSUPPORTEDFORMAT = -2147753963;
var VS_E_WIZARDBACKBUTTONPRESS = -2147213313;
var VS_E_WIZCANCEL = VS_E_WIZARDBACKBUTTONPRESS;

////////////////////////////////////////////////////////


/******************************************************************************
Description: Sets the error info
nErrNumber: Error code
strErrDesc: Error description
******************************************************************************/
function SetErrorInfo(oErrorObj)
{
    var oWizard;
    try
    {
        oWizard = wizard;
    }
    catch (e)
    {
        oWizard = window.external;
    }

    try
    {
        var strErrorText = "";

        if (oErrorObj.description.length != 0)
        {
            strErrorText = oErrorObj.description;
        }
        else
        {
            var strErrorDesc = GetRuntimeErrorDesc(oErrorObj.name);
            if (strErrorDesc.length != 0)
            {
                var L_strScriptRuntimeError_Text = " error occurred while running the script:\r\n\r\n";
                strErrorText = oErrorObj.name + L_strScriptRuntimeError_Text + strErrorDesc;
            }
        }

        oWizard.SetErrorInfo(strErrorText, oErrorObj.number & 0xFFFFFFFF);
    }
    catch (e)
    {
        var L_ErrSettingErrInfo_Text = "An error occurred while setting the error info.";
        oWizard.ReportError(L_ErrSettingErrInfo_Text);
    }
}


/******************************************************************************
Description: Returns a description for the exception type given
strRuntimeErrorName: The name of the type of exception occurred
*****************************************************************************/
function GetRuntimeErrorDesc(strRuntimeErrorName)
{
    var L_strDesc_Text = "";
    switch (strRuntimeErrorName)
    {
        case "ConversionError":
            var L_ConversionError1_Text = "This error occurs whenever there is an attempt to convert";
            var L_ConversionError2_Text = "an object into something to which it cannot be converted.";
            L_strDesc_Text = L_ConversionError1_Text + "\r\n" + L_ConversionError2_Text;
            break;
        case "RangeError":
            var L_RangeError1_Text = "This error occurs when a function is supplied with an argument";
            var L_RangeError2_Text = "that has exceeded its allowable range. For example, this error occurs";
            var L_RangeError3_Text = "if you attempt to construct an Array object with a length that is not";
            var L_RangeError4_Text = "a valid positive integer.";
            L_strDesc_Text = L_RangeError1_Text + "\r\n" + L_RangeError2_Text + "\r\n" + L_RangeError3_Text + "\r\n" + L_RangeError4_Text;
            break;
        case "ReferenceError":
            var L_ReferenceError1_Text = "This error occurs when an invalid reference has been detected.";
            var L_ReferenceError2_Text = "This error will occur, for example, if an expected reference is null.";
            L_strDesc_Text = L_ReferenceError1_Text + "\r\n" + L_ReferenceError2_Text;
            break;
        case "RegExpError":
            var L_RegExpError1_Text = "This error occurs when a compilation error occurs with a regular";
            var L_RegExpError2_Text = "expression. Once the regular expression is compiled, however, this error";
            var L_RegExpError3_Text = "cannot occur. This example will occur, for example, when a regular";
            var L_RegExpError4_Text = "expression is declared with a pattern that has an invalid syntax, or flags";
            var L_RegExpError5_Text = "other than i, g, or m, or if it contains the same flag more than once.";
            L_strDesc_Text = L_RegExpError1_Text + "\r\n" + L_RegExpError2_Text + "\r\n" + L_RegExpError3_Text + "\r\n" + L_RegExpError4_Text + "\r\n" + L_RegExpError5_Text;
            break;
        case "SyntaxError":
            var L_SyntaxError1_Text = "This error occurs when source text is parsed and that source text does not";
            var L_SyntaxError2_Text = "follow correct syntax. This error will occur, for example, if the eval";
            var L_SyntaxError3_Text = "function is called with an argument that is not valid program text.";
            L_strDesc_Text = L_SyntaxError1_Text + "\r\n" + L_SyntaxError2_Text + "\r\n" + L_SyntaxError3_Text;
            break;
        case "TypeError":
            var L_TypeError1_Text = "This error occurs whenever the actual type of an operand does not match the";
            var L_TypeError2_Text = "expected type. An example of when this error occurs is a function call made on";
            var L_TypeError3_Text = "something that is not an object or does not support the call.";
            L_strDesc_Text = L_TypeError1_Text + "\r\n" + L_TypeError2_Text + "\r\n" + L_TypeError3_Text;
            break;
        case "URIError":
            var L_URIError1_Text = "This error occurs when an illegal Uniform Resource Indicator (URI) is detected.";
            var L_URIError2_Text = "For example, this is error occurs when an illegal character is found in a string";
            var L_URIError3_Text = "being encoded or decoded.";
            L_strDesc_Text = L_URIError1_Text + "\r\n" + L_URIError2_Text + "\r\n" + L_URIError3_Text;
            break;
        default:
            break;
    }
    return L_strDesc_Text;
}

/******************************************************************************
Description: Creates a C++ project
strProjectName: Project Name
strProjectPath: The path that the project will be created in
******************************************************************************/
function CreateProject(strProjectName, strProjectPath)
{
    try
    {
        var strProjTemplatePath = wizard.FindSymbol("PROJECT_TEMPLATE_PATH");
        var strProjTemplate = strProjTemplatePath + "\\default.vcxproj";

        var Solution = dte.Solution;
        var strSolutionName = "";
        if (wizard.FindSymbol("CLOSE_SOLUTION"))
        {
            Solution.Close();
            strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
            if (strSolutionName.length)
            {
                var strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
                Solution.Create(strSolutionPath, strSolutionName);
            }
        }

        var strProjectNameWithExt = strProjectName + ".vcxproj";
        var oTarget = wizard.FindSymbol("TARGET");
        var oProj;
        if (wizard.FindSymbol("WIZARD_TYPE") == vsWizardAddSubProject)  // vsWizardAddSubProject
        {
            var prjItem = oTarget.AddFromTemplate(strProjTemplate, strProjectPath + "\\" + strProjectNameWithExt);
            oProj = prjItem.SubProject;
        }
        else
        {
            oProj = oTarget.AddFromTemplate(strProjTemplate, strProjectPath, strProjectNameWithExt);
        }
        return oProj;
    }
    catch (e)
    {
        throw e;
    }
}


function ConvertVersionToInteger(strVersion)
{
    var iTargetFrameworkVersion = 0;
    var rgVersion = strVersion.split('.', 3);

    if (rgVersion.length >= 2)
    {
        iTargetFrameworkVersion = parseInt(rgVersion[0]) * 0x10000 + parseInt(rgVersion[1]);
        if (rgVersion.length == 3)
            iTargetFrameworkVersion += parseInt(rgVersion[2]) * 0x100;
    }

    return iTargetFrameworkVersion;
}


function CreateManagedProject(strProjectName, strProjectPath)
{
    try
    {
        strIdentifierSafeName = CreateIdentifierSafeName(strProjectName);
        wizard.AddSymbol("SAFE_PROJECT_IDENTIFIER_NAME", strIdentifierSafeName);
        var strNamespaceName = CreateCPPName(strIdentifierSafeName);

        var strNamespaces = strNamespaceName.split("::");
        var strNamespaceBegin = "";
        var strNamespaceEnd = "";
        for (var i = 0; i < strNamespaces.length; i++)
        {
            strNamespaceBegin += "namespace " + strNamespaces[i] + " {\r\n";
            strNamespaceEnd += "}";
        }

        wizard.AddSymbol("SAFE_NAMESPACE_NAME", strNamespaceName);
        wizard.AddSymbol("SAFE_NAMESPACE_BEGIN", strNamespaceBegin);
        wizard.AddSymbol("SAFE_NAMESPACE_END", strNamespaceEnd);

        AddAssemblyInfoSymbols();

        var oProject = CreateProject(strProjectName, strProjectPath);
        var fxtarget = wizard.FindSymbol("TARGET_FRAMEWORK_VERSION");
        if (fxtarget != null && fxtarget != "")
        {
            var iTargetFrameworkVersion = ConvertVersionToInteger(fxtarget);
            if (iTargetFrameworkVersion)
                oProject.Object.TargetFrameworkVersion = iTargetFrameworkVersion;
        }

        SetupFilters(oProject);
        return oProject;
    }
    catch (e)
    {
        throw e;
    }
}

/*******************************************************************************
Description: Add symbols used to populate the example AssemblyInfo.cpp file.
*******************************************************************************/
function AddAssemblyInfoSymbols()
{
    try
    {
        // gather some info for AssemblyInfo.cpp
        var CurrentDate = new Date();
        var strYear = CurrentDate.getYear();
        wizard.AddSymbol("PROJECT_YEAR", strYear.toString());
        var strRegisteredOrganization = "";
        try
        {
            var oShl = new ActiveXObject("WScript.Shell");
            strRegisteredOrganization = oShl.RegRead("HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\RegisteredOrganization");
        }
        catch (e)
        {
            // reg entry not found -- leave blank
        }
        wizard.AddSymbol("REGISTERED_ORGANIZATION", strRegisteredOrganization);
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Adds source, include and resource filters for project folders.
The symbols contain the file extensions to be used for filtering.
oProj: Project object
******************************************************************************/
function SetupFilters(oProj)
{
    try
    {

        var L_strSource_Text = "Source Files";
        var group = oProj.Object.AddFilter(L_strSource_Text);
        group.Filter = "cpp;c;cc;cxx;c++;cppm;ixx;def;odl;idl;hpj;bat;asm;asmx";
        group.UniqueIdentifier = "{4FC737F1-C7A5-4376-A066-2A32D752A2FF}";

        var L_strHeader_Text = "Header Files";
        group = oProj.Object.AddFilter(L_strHeader_Text);
        group.Filter = "h;hh;hpp;hxx;h++;hm;inl;inc;ipp;xsd";
        group.UniqueIdentifier = "{93995380-89BD-4b04-88EB-625FBE52EBFB}";

        var L_strResources_Text = "Resource Files";
        group = oProj.Object.AddFilter(L_strResources_Text);
        group.Filter = "rc;ico;cur;bmp;dlg;rc2;rct;bin;rgs;gif;jpg;jpeg;jpe;resx;tiff;tif;png;wav;mfcribbon-ms";
        group.UniqueIdentifier = "{67DA6AB6-F800-4c08-8B7A-83BB121AAD01}";
    }
    catch (e)
    {
        throw e;
    }
}


/******************************************************************************
Description: Creates the Templates.inf file.
Templates.inf is created based on TemplatesInf.txt and contains
a list of file names to be created by the wizard.
******************************************************************************/
function CreateInfFile()
{
    try
    {
        var strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
        var strInfFile = strTemplatePath + "\\Templates.inf";
        var strWizTempFileContents = wizard.RenderTemplateToString(strInfFile);

        var oFSO, TemplatesFolder, TemplateFiles, strTemplate;
        oFSO = new ActiveXObject("Scripting.FileSystemObject");

        var TemporaryFolder = 2;
        var oFolder = oFSO.GetSpecialFolder(TemporaryFolder);
        var strWizTempFile = oFSO.GetAbsolutePathName(oFolder.Path) + "\\" + oFSO.GetTempName();
        var oStream = oFSO.CreateTextFile(strWizTempFile, true);
        oStream.Write(strWizTempFileContents);
        oStream.Close();
        return oFSO.GetFile(strWizTempFile);
    }
    catch (e)
    {
        throw e;
    }
}

function CreateNamedInfFile(strInfFileName)
{
    try {
        var strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
        var strInfFile = strTemplatePath + "\\" + strInfFileName;
        var strWizTempFileContents = wizard.RenderTemplateToString(strInfFile);

        var oFSO, TemplatesFolder, TemplateFiles, strTemplate;
        oFSO = new ActiveXObject("Scripting.FileSystemObject");

        var TemporaryFolder = 2;
        var oFolder = oFSO.GetSpecialFolder(TemporaryFolder);
        var strWizTempFile = oFSO.GetAbsolutePathName(oFolder.Path) + "\\" + oFSO.GetTempName();
        var oStream = oFSO.CreateTextFile(strWizTempFile, true);
        oStream.Write(strWizTempFileContents);
        oStream.Close();
        return oFSO.GetFile(strWizTempFile);
    }
    catch (e) {
        throw e;
    }
}


/******************************************************************************
Description: Returns a unique file name
strDirectory: Directory to look for file name in
strFileName: File name to check.  If unique, same file name is returned.  If
not unique, a number from 1-9999999 will be appended.  If not
passed in, a unique file name is returned via GetTempName.
******************************************************************************/
function GetUniqueFileName(strDirectory, strFileName)
{
    try
    {
        oFSO = new ActiveXObject("Scripting.FileSystemObject");
        if (!strFileName)
            return oFSO.GetTempName();

        if (strDirectory.length && strDirectory.charAt(strDirectory.length - 1) != "\\")
            strDirectory += "\\";

        var strFullPath = strDirectory + strFileName;
        var strName = strFileName.substring(0, strFileName.lastIndexOf("."));
        var strExt = strFileName.substr(strFileName.lastIndexOf("."));

        var nCntr = 0;
        while (oFSO.FileExists(strFullPath))
        {
            nCntr++;
            strFullPath = strDirectory + strName + nCntr + strExt;
        }
        if (nCntr)
            return strName + nCntr + strExt;
        else
            return strFileName;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Adds all the files to the project based on the
Templates.inf file.
oProj: Project object
oCollection: Folder object collection to add to
strProjectName: Project name
InfFile: Templates.inf file object
******************************************************************************/
function AddFilesToProjectWithInfFile(oProj, strProjectName, oCollection)
{
    try
    {
        var InfFile = CreateInfFile();
        AddFilesToProject(oProj, strProjectName, oCollection, InfFile);
        InfFile.Delete();
    }
    catch (e)
    {
        throw e;
    }
}

function AddFilesToProjectWithNamedInfFile(oProj, strProjectName, strInfFileName, oCollection)
{
    try {
        var InfFile = CreateNamedInfFile(strInfFileName);
        AddFilesToProject(oProj, strProjectName, oCollection, InfFile);
        InfFile.Delete();
    }
    catch (e) {
        throw e;
    }
}

function AddFilesToNewProjectWithInfFile(oProj, strProjectName)
{
    try
    {
        AddFilesToProjectWithInfFile(oProj, strProjectName);
        SetCommonPchSettings(oProj);
    }
    catch (e)
    {
        throw e;
    }
}


/******************************************************************************
Description: Adds all the files to the project based on the
Templates.inf file.
oProj: Project object
oCollection: Folder object collection to add to
strProjectName: Project name
InfFile: Templates.inf file object
******************************************************************************/
function AddFilesToProject(oProj, strProjectName, oCollection, InfFile)
{
    try
    {
        var strTemplatePath;
        var strResPath;
        var strHelpPath;
        var strItemPath;
        try
        {
            strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
            strResPath = wizard.FindSymbol("RES_PATH");
            strHelpPath = wizard.FindSymbol("HELP_PATH");
            strItemPath = wizard.FindSymbol("ITEM_PATH");
        }
        catch (e)
        {
            // OK if some of the symbols aren't there.
        }

        var strName;

        var strTextStream = InfFile.OpenAsTextStream(1, -2);
        var rgstrNames = new Array();
        var rgoFiles = new Array();
        var rgbOpenFiles = new Array();

        var rgstrParent = new Array();
        var rgstrTarget = new Array();
        var nFiles = 0;
        // Process the InfFile rendering each template and collecting
        // the info how the resulting files be added to the project
        while (!strTextStream.AtEndOfStream)
        {
            var bCopyOnly = false;  //"true" will only copy the file from strTemplate to strTarget without rendering/adding to the project
            rgoFiles[nFiles] = null;
            rgbOpenFiles[nFiles] = false;  //"true" will open the file when it's rendered
            rgstrParent[nFiles] = null;
            var strName = strTextStream.ReadLine();

            var nSep = strName.indexOf("|")
            while (nSep >= 0)
            {
                var strAttrib = TrimStr(strName.substr(0, nSep - 1));
                strName = strName.substr(nSep + 1);
                nSep = strName.indexOf("|");
                if ("CopyOnly" == strAttrib)
                    bCopyOnly = true;
                else if ("OpenFile" == strAttrib)
                    rgbOpenFiles[nFiles] = true;
                else if (strAttrib.substr(0, 7) == "ChildOf")
                {
                    var posBegin = strAttrib.indexOf('(') + 1;
                    var posEnd = strAttrib.lastIndexOf(')');
                    var strParentFile = TrimStr(strAttrib.substr(posBegin, posEnd - posBegin));
                    if (strParentFile)
                        rgstrParent[nFiles] = strParentFile;
                }
            }
            strName = TrimStr(strName);
            if (strName == "")
            {
                continue;
            }
            //this code is for compatibility only with old 7.0 customized user wizards
            try
            {
                var bOpenFile = DoOpenFile(strName);
                if (bOpenFile)
                    rgbOpenFiles[nFiles] = bOpenFile;
            }
            catch (e)
            {
            }
            //end of compatibility only code
            rgstrNames[nFiles] = strName;
            var strTarget = GetTargetName(strName, strProjectName, strResPath, strHelpPath);
            var strTemplate = strTemplatePath + "\\" + strName;
            var bHelpImages = false;
            if (strTarget == "")  // help images
            {
                bHelpImages = true;
                strTarget = strHelpPath + "\\Images\\" + strName;
            }
            else if (strItemPath != null && strItemPath != "")
            {
                var oFSO = new ActiveXObject("Scripting.FileSystemObject");
                if (oFSO.GetDriveName(strTarget) == "")
                {
                    // If the target drive can not be determined, it must be a relative path, so
                    // add on the item path.
                    strTarget = strItemPath + "\\" + strTarget;
                }
            }

            wizard.RenderTemplate(strTemplate, strTarget, bCopyOnly, true);

            if (bHelpImages)
            {
                continue; //skip adding the help image file to the project
            }
            rgstrTarget[nFiles] = strTarget;
            nFiles++; //info about this file gathered successfully
        }
        strTextStream.Close();
        // Add each file to the project under the correct parent
        // Parent files in the first iteration, children in the second iteration
        for (var iLoop = 0; iLoop < 2; iLoop++)
            for (var iFile = 0; iFile < nFiles; iFile++)
        {
            if ((iLoop == 0) == (rgstrParent[iFile] != null))
            {
                continue;
            }
            var oToAddTo = oCollection; //by default, the file is added to the selected Folder Collection
            if (iLoop != 0)
            {
                for (var cnt = 0; cnt < nFiles; cnt++)
                    if (rgstrNames[cnt] == rgstrParent[iFile])
                {
                    oToAddTo = rgoFiles[cnt].ProjectItems; //this file will be added to the parent file
                    break;
                }
                if (!oToAddTo)
                {
                    var L_ErrMsg_Text = "Error in template.inf - on template specification: ";
                    L_ErrMsg_Text += rgstrNames[iFile];
                    L_ErrMsg_Text += "\n";
                    var L_ErrMsgParent_Text = "Parent file template not exists or not available: ";
                    L_ErrMsgParent_Text += rgstrParent[iFile];
                    wizard.ReportError(L_ErrMsg_Text + L_ErrMsgParent_Text);
                    oToAddTo = oCollection;
                }
            }
            var projfile = oProj.Object.Files(rgstrTarget[iFile]);
            if (projfile != null)
                projfile = projfile.Object;
            else
            {
                if (!oToAddTo)
                    oToAddTo = oProj.ProjectItems;
                projfile = oToAddTo.AddFromFile(rgstrTarget[iFile]);
            }
            rgoFiles[iFile] = projfile;

            if (projfile)
            {
                SetFileProperties(projfile, rgstrNames[iFile]);
            }
        }
        if (!wizard.FindSymbol("SUPPRESS_FILE_OPEN"))
        {
            // Only open files after all files have been added to the project.
            //
            for (var iFileToOpen = 0; iFileToOpen < nFiles; iFileToOpen++)
            {
                var oFileToOpen = rgoFiles[iFileToOpen];
                if (oFileToOpen == null || !rgbOpenFiles[iFileToOpen])
                    continue;
                var vsViewKind = vsViewKindPrimary;

                switch (oFileToOpen.Object.FileType)
                {
                    case eFileTypeCppForm:
                    case eFileTypeCppClass:
                    case eFileTypeCppControl:
                    case eFileTypeCppWebService:
                        vsViewKind = vsViewKindDesigner;
                }

                var window = oFileToOpen.Open(vsViewKind);

                if (window)
                {
                    window.visible = true;
                }
            }
        }

    }
    catch (e)
    {
        try
        {
            strTextStream.Close();
        }
        catch (ex)
        { // text stream already closed
        }
        throw e;
    }
}


/******************************************************************************
Description: Adds the default configurations to the project.
oProj: Project object
strProjectName: Project name
******************************************************************************/


function AddCommonConfig(oProj, strProjectName, bAddUnicode, bForEmptyProject)
{
    if (bAddUnicode == null) bAddUnicode = true; // default to unicode
    if (bForEmptyProject == null) bForEmptyProject = false; // default to non-empty project
    try {
        // Set default characterset based on the project name.
        // (Well, we have to guess what the user intended.)
        var fUnicode = IsUnicodeString(wizard.FindSymbol("PROJECT_NAME"));
        var oConfigs = oProj.Object.Configurations;
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++) {
            var config = oConfigs(nCntr);

            if (config.ConfigurationName === "Debug") {

                // these two lines are necessary to initialize the project system,
                // do not remove them!
                var outdir = config.OutputDirectory;
                var intdir = config.IntermediateDirectory;

                var CLTool = config.Tools("VCCLCompilerTool");
                if (!bForEmptyProject) CLTool.UsePrecompiledHeader = pchUseUsingSpecific;
                CLTool.WarningLevel = WarningLevel_3;
                CLTool.Optimization = optimizeDisabled;

                if (bAddUnicode) {
                    config.CharacterSet = charSetUNICODE;
                }

                var LinkTool = config.Tools("VCLinkerTool");
                if (!bForEmptyProject) LinkTool.SubSystem = subSystemWindows;
            } else if (config.ConfigurationName === "Release") {

                // these two lines are necessary to initialize the project system,
                // do not remove them!
                var outdir = config.OutputDirectory;
                var intdir = config.IntermediateDirectory;

                config.WholeProgramOptimization = WholeProgramOptimizationLinkTimeCodeGen;

                CLTool = config.Tools("VCCLCompilerTool");
                CLTool.WarningLevel = WarningLevel_3;
                if (!bForEmptyProject) CLTool.UsePrecompiledHeader = pchUseUsingSpecific;
                CLTool.Optimization = optimizeMaxSpeed;
                CLTool.EnableFunctionLevelLinking = true;
                CLTool.EnableIntrinsicFunctions = true;

                if (bAddUnicode) {
                    config.CharacterSet = charSetUNICODE;
                }

                LinkTool = config.Tools("VCLinkerTool");
                if (!bForEmptyProject) LinkTool.SubSystem = subSystemWindows;
                LinkTool.EnableCOMDATFolding = optFolding;
                LinkTool.OptimizeReferences = optReferences;
            }

            config.CharacterSet = (fUnicode) ? charSetUNICODE : charSetMBCS;

            if (bForEmptyProject) {
                var ClRule = config.Rules("CL");
                ClRule.SetPropertyValue("SDLCheck", "true");
            }
        }


        // make sure the rootnamespace property is set
        oProj.Object.RootNamespace = CreateIdentifierSafeName(strProjectName);

        StampWindowsTargetPlatformVersion(oProj);
    }
    catch (e) {
        throw e;
    }
}

function StampWindowsTargetPlatformVersion(oProj)
{
    var strLatestWindowsSDKVersion = GetLatestWindowsSDKVersion(oProj);
    if (strLatestWindowsSDKVersion)
    {
        //Stamp the latest Windows SDK version found in the disk - It is a global property, so enough to do it for any one config
        var commonConfigRule = oProj.Object.Configurations(1).Rules("ConfigurationGeneral");
        commonConfigRule.SetPropertyValue("WindowsTargetPlatformVersion", strLatestWindowsSDKVersion);
    }
}

function GetLatestWindowsSDKVersion(oProj)
{
    return oProj.Object.LatestTargetPlatformVersion;
}

function AddEntryPoint(oProj, strEntryPoint)
{
    try
    {
        for (var i = 1; i <= oProj.Object.Configurations.Count; i++)
        {
            var config = oProj.Object.Configurations.Item(i);
            var LinkTool = config.Tools("VCLinkerTool");
            LinkTool.EntryPointSymbol = strEntryPoint;
        }
    }
    catch (e)
    {
        throw e;
    }
}


/******************************************************************************
Description: Sets up the pre-compiled header for the project.
oProj: Project object
******************************************************************************/
function SetCommonPchSettings(oProj)
{
    try
    {
        var files = oProj.Object.Files;
        var strFile = wizard.FindSymbol("PCH_FILE");
        if (null != strFile)
            file = files(strFile);
        else
            file = files("StdAfx.cpp");
        if (!file)
            return;

        var configs = oProj.Object.Configurations;

        for (var i = 1; i <= configs.Count; i++)
        {
            // setup /Yu (using precompiled headers)
            config = configs.Item(i);
            var CLTool = config.Tools("VCCLCompilerTool");
            CLTool.UsePrecompiledHeader = pchUseUsingSpecific;
            // setup /Yc (create precompiled header)
            fileConfig = file.FileConfigurations(config.Name);
            fileConfig.Tool.UsePrecompiledHeader = pchCreateUsingSpecific;
        }
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Sets up the project config properties when no pre-compiled
header is used.
oProj: Project object
******************************************************************************/
function SetNoPchSettings(oProj)
{
    try
    {
        for (var i = 1; i <= oProj.Object.Configurations.Count; i++)
        {
            var config = oProj.Object.Configurations.Item(i);
            var CLTool = config.Tools("VCCLCompilerTool");
            CLTool.UsePrecompiledHeader = pchNone;
        }
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Enables opt-in to extra Security Development Lifecycle recommended checks.
oProj: Project object
******************************************************************************/
function EnableSDLCheckSettings(oProj)
{
    try
    {
        var configs = oProj.Object.Configurations;

        for (var i = 1; i <= configs.Count; i++)
        {
            config = configs.Item(i);
            var ClRule = config.Rules("CL");
            ClRule.SetPropertyValue("SDLCheck", "true");
        }
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Deletes the file given
oFSO: File System Object
strFile: Name of the file to be deleted
******************************************************************************/
function DeleteFile(oFSO, strFile)
{
    try
    {
        if (oFSO.FileExists(strFile))
        {
            var oFile = oFSO.GetFile(strFile);
            oFile.Delete();
        }
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Renders a template file and optionally adds it to the project
strTemplateFile: Template file name only (excluding path, relative to TEMPLATES_PATH)
strProjectFile: Name of new file created (may include path, but relative to PROJECT_PATH)
oParentToAddTo: Project or folder collection of files, where the created file needs to be added to it
(skip it or pass false if not adding the file to the project)
bOpen: If true, open the file in the fdefault editor, after adding
it to the project.
******************************************************************************/
function RenderAddTemplate(wizard, strTemplateFile, strProjectFile, oParentToAddTo, bOpen)
{
    try
    {
        var strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
        if ("\\" != strTemplatePath.charAt(strTemplatePath.length - 1))
            strTemplatePath += "\\";

        strTemplateFile = strTemplatePath + strTemplateFile;

        wizard.RenderTemplate(strTemplateFile, strProjectFile, false, false);
        if (oParentToAddTo)
        {
            AddFileToProject(strProjectFile, oParentToAddTo, bOpen)
        }
    }
    catch (e)
    {
        throw e
    }
}

/******************************************************************************
Description: Add file to the project
strProjectFile: Name of the file to be added
oParentToAddTo: Folder object collection
bOpen: If true, open the file in the fdefault editor, after adding
it to the project.
******************************************************************************/
function AddFileToProject(strProjectFile, oParentToAddTo, bOpen)
{
    try
    {
        var projfile;
        var oFiles = oParentToAddTo.ContainingProject.Object.Files;
        var oFile = oFiles(strProjectFile);
        if (oFile != null)
            projfile = oFile.Object;
        else
            projfile = oParentToAddTo.AddFromFile(strProjectFile);

        if (bOpen && projfile != null)
        {
            var window = projfile.Open(vsViewKindPrimary);
            if (window)
                window.visible = true;
        }
    }
    catch (e)
    {
        throw e
    }
}

/******************************************************************************
Description: Renders and inserts a template file that contains an interface
into the project's IDL file
oCM: Code Model object
strInterfaceFile: Template file name only (excluding path)
******************************************************************************/
function AddInterfaceFromFile(oCM, strInterfaceFile)
{
    try
    {
        var strTemplateFile = wizard.FindSymbol("TEMPLATES_PATH") + "\\" + strInterfaceFile;
        var strInsertText = wizard.RenderTemplateToString(strTemplateFile);
        oCM.IDLLibraries(1).StartPoint.CreateEditPoint().Insert(strInsertText);
        oCM.Synchronize();
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Renders and inserts a template file that contains a coclass
into the project's IDL file
oCM: Code Model object
strCoclassFile: Template file name only (excluding path)
******************************************************************************/
function AddCoclassFromFile(oCM, strCoclassFile)
{
    try
    {
        var strTemplateFile = wizard.FindSymbol("TEMPLATES_PATH") + "\\" + strCoclassFile;
        var strInsertText = wizard.RenderTemplateToString(strTemplateFile);
        oCM.IDLLibraries(1).EndPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strInsertText);
        oCM.Synchronize();
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Returns a boolean indicating whether a #include exists in a file
oProj: Project object
strHeaderFile: #include to search for
strInsertIntoFile: Source file that contains the #include (excluding the path)
******************************************************************************/
function DoesIncludeExist(oProj, strHeaderFile, strInsertIntoFile)
{
    try
    {
        var oFile = oProj.Object.Files(strInsertIntoFile);
        if (null == oFile) // header file doesn't exist in project
            return false;
        var oProjectItem = oFile.Object;
        var oIncludes = oProjectItem.FileCodeModel.Includes;
        if (oIncludes.Find(strHeaderFile) != null)
            return true;
        return false;
    }
    catch (e)
    {
        throw e;
    }
}


/******************************************************************************
Description: Returns the highest dispid from members of the given interface &
all its bases
oInterface: Interface object
******************************************************************************/
function GetMaxID(oInterface)
{
    var currentMax = 0;
    try
    {
        var funcs = oInterface.Functions;
        if (funcs != null)
        {
            var nTotal = funcs.Count;
            var nCntr;
            for (nCntr = 1; nCntr <= nTotal; nCntr++)
            {
                if (funcs(nCntr).Attributes)
                {
                    var id = funcs(nCntr).Attributes.Find("id");
                    if (id != null)
                    {
                        var idval = parseInt(id.Value);
                        if (idval > currentMax)
                            currentMax = idval;
                    }
                }
            }
        }
        //REMOVE remove this and use Children collection above, if it's implemented
        funcs = oInterface.Variables;
        if (funcs != null)
        {
            var nTotal = funcs.Count;
            var nCntr;
            for (nCntr = 1; nCntr <= nTotal; nCntr++)
            {
                if (funcs(nCntr).Attributes)
                {
                    var id = funcs(nCntr).Attributes.Find("id");
                    if (id != null)
                    {
                        var idval = parseInt(id.Value);
                        if (idval > currentMax)
                            currentMax = idval;
                    }
                }
            }
        }
        var nextBases = oInterface.Bases;
        var nTotal = nextBases.Count;
        var nCntr;
        for (nCntr = 1; nCntr <= nTotal; nCntr++)
        {
            var nextObject = nextBases(nCntr).Class;
            if (nextObject != null && nextObject.Name != "IDispatch")
            {
                var idval = GetMaxID(nextObject);
                if (idval > currentMax)
                    currentMax = idval;
            }
        }
        return currentMax;
    }
    catch (e)
    {
        throw e;
    }
}

function FindVariableOfClass(oVariables, oClasses)
{
    if (oClasses)
    {
        for (var nCntr = 1; nCntr <= oVariables.Count; nCntr++)
        {
            var oVariable = oVariables(nCntr);
            var strTypeString = oVariable.TypeString;
            if (strTypeString.indexOf(" ") == -1 && oClasses.Find(strTypeString))
                return oVariable;
        }
    }
    return false;
}

/******************************************************************************
Description: Checks if a project is MFC-based.
oProj: Project object
bCWinAppRequired: Flag indicating whether Extension DLLs are included in check
******************************************************************************/
function IsMFCProject(oProj, bCWinAppRequired)
{
    try
    {
        var oCM = oProj.CodeModel;
        oCM.Synchronize();

        // look for class derived from CWinApp
        var oVariables = oCM.Variables;
        if (FindVariableOfClass(oVariables, oCM.GetClassesDerivedFrom("CWinApp")))
            return true;

        if (!bCWinAppRequired)
        {
            // check if MFC Extension DLL
            if (2 == oProj.Object.Configurations(1).ConfigurationType)
            {
                for (var nCntr = 1; nCntr <= oVariables.Count; nCntr++)
                {
                    if (oVariables(nCntr).TypeString == "AFX_EXTENSION_MODULE")
                        return true;
                }
            }

            // check if Win32 app with MFC support
            for (var nCntr2 = 1; nCntr2 <= oVariables.Count; nCntr2++)
            {
                if (oVariables(nCntr2).TypeString == "CWinApp" || oVariables(nCntr2).TypeString == "CWinAppEx")
                {
                    return true;
                }
            }

            //check if we include afxwin.h
            var strHeader = "";
            strHeader = GetProjectFile(oProj, "STDAFX", true, false);
            if (DoesIncludeExist(oProj, "<afxwin.h>", strHeader))
            {
                return true;
            }
            if (DoesIncludeExist(oProj, "<afxctl.h>", strHeader))
            {
                return true;
            }
        }

        // not MFC project
        return false;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Checks if a project is Windows Store based.
oProj: Project object
******************************************************************************/
function IsWinStoreProject(oProj)
{
    try
    {
        // check if VCRT_WINRT is set
        return (oProj.Object.GetAllowedReferencesTypes & 8) != 0;
    }
    catch(e)
    {
        return false;
    }
}

/********************************************************************************
Description:    Returns a boolean indicating whether ATL support can be added
to the project.
selProj:    Selected project
********************************************************************************/
function CanAddATLSupport(selProj)
{
    try
    {
        var bIsDeviceProject = IsDeviceProject(selProj);
        wizard.AddSymbol("IS_DEVICE_PROJECT", bIsDeviceProject);

        if (IsATLProject(selProj))
        {
            var L_ErrMsg1_Text = "Current project already has ATL support.";
            wizard.ReportError(L_ErrMsg1_Text);
            return false;
        }
        // check if MFC app
        if (!IsMFCProject(selProj, true))
        {
            var L_ErrMsg2_Text = "ATL support can only be added to MFC Exes or MFC Regular DLLs.";
            wizard.ReportError(L_ErrMsg2_Text);
            return false;
        }

        return AddATLSupportToProject(selProj);
    }
    catch (e)
    {
        if (e.description.length != 0)
            SetErrorInfo(e);
        return e.number
    }
}

/******************************************************************************
Description: Returns a boolean indicating whether a project is attributed or not.
oWizard: Wizard object
******************************************************************************/
function IsAttributedProject(oWizard)
{
    try
    {
        var oCM = oWizard.ProjectObject.CodeModel;
        oCM.Synchronize();

        // check for a global module attribute
        if (oCM.Attributes.Find("module"))
            return true;

        // check for a module attribute applied to a class
        var oClasses = oCM.Classes;
        for (var nCntr = 1; nCntr <= oClasses.Count; nCntr++)
        {
            var oClass = oClasses(nCntr);
            if (oClass.Attributes.Find("module"))
                return true;
        }

        return false;
    }
    catch (e)
    {
        throw e;
    }
}


/******************************************************************************
Description: Add symbols used by MC++ Wizards
******************************************************************************/
function PrepareToAddManagedClass(oProject)
{
    try
    {
        // First get a safe class name from the item name
        var strItemName = wizard.FindSymbol("ITEM_NAME");

        // Since item name is a file name for us, strip off the extension
        var iDotPos = strItemName.lastIndexOf('.');
        if (iDotPos != -1)
        {
            strItemName = strItemName.substr(0, iDotPos);
        }

        wizard.AddSymbol("ITEM_NAME", GetFileNameUniqueCPPandH(strItemName));

        // First, generate a safe version of project and namespace name
        var strProjectName = wizard.FindSymbol("PROJECT_NAME");
        var strSafeProjectName = CreateIdentifierSafeName(strProjectName);
        wizard.AddSymbol("SAFE_PROJECT_IDENTIFIER_NAME", strSafeProjectName);
        var strNamespaceName = oProject.Object.RootNamespace;
        if (strNamespaceName == "")
            strNamespaceName = CreateCPPName(CreateIdentifierSafeName(strProjectName));

        var strNamespaces = strNamespaceName.split("::");
        var strNamespaceBegin = "";
        var strNamespaceEnd = "";
        for (var i = 0; i < strNamespaces.length; i++)
        {
            strNamespaceBegin += "namespace " + strNamespaces[i] + " {\r\n";
            strNamespaceEnd += "}";
        }

        wizard.AddSymbol("SAFE_NAMESPACE_NAME", strNamespaceName);
        wizard.AddSymbol("SAFE_NAMESPACE_BEGIN", strNamespaceBegin);
        wizard.AddSymbol("SAFE_NAMESPACE_END", strNamespaceEnd);

        //Then, generate the unique name for the class within the namespace based on strItemName
        var strClassName = CreateIdentifierSafeName(strItemName);

        if (!wizard.ValidateCLRIdentifier(strClassName))
        {
            wizard.ReportError();
            return false;
        }
        wizard.AddSymbol("SAFE_ITEM_NAME", GetClassNameUnique(oProject, strNamespaceName, strClassName));

        // Then, get the name of the precompiled header, if any.
        var strHeader = "";
        if (!IsNativeProject(oProject))
        {
            strHeader = GetProjectFile(oProject, "STDAFX", false, false);
        }

        wizard.AddSymbol("PCH_NAME", strHeader);
        wizard.AddSymbol("PCH", strHeader != "");

        return true;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Generates a valid resource file name
strName: The old, unfriendly name
******************************************************************************/
function CreateSafeRCFileName(strName)
{
    var nLen = strName.length;
    var strSafeName = "";

    for (nCntr = 0; nCntr < nLen; nCntr++)
    {
        var cChar = strName.charAt(nCntr);
        if (cChar >= "\u00c0" && cChar <= "\u00de")
        {
            cChar = "AAAAAAACEEEEIIIIDNOOOOOXOOUUUUYP".charAt(cChar.charCodeAt(0) - 0xc0);
        }
        strSafeName += cChar;
    }
    if (strSafeName == "")
    {
        // if it's empty, we add My
        strSafeName = "My";
    }
    return strSafeName;
}

/******************************************************************************
Description: Generates a C++ friendly name
strName: The old, unfriendly name
******************************************************************************/
function CreateSafeName(strName)
{
    try
    {
        var nLen = strName.length;
        var strSafeName = "";

        for (nCntr = 0; nCntr < nLen; nCntr++)
        {
            var cChar = strName.charAt(nCntr);
            if ((cChar >= 'A' && cChar <= 'Z') || (cChar >= 'a' && cChar <= 'z') ||
                (cChar == '_') || (cChar >= '0' && cChar <= '9'))
            // valid character, so add it
                strSafeName += cChar;
            // otherwize, we skip it
        }
        if (strSafeName == "")
        {
            // if it's empty, we add My
            strSafeName = "My";
        }
        else if (strSafeName.charAt(0) >= '0' && strSafeName.charAt(0) <= '9')
        {
            // if it starts with a digit, we prepend My
            strSafeName = "My" + strSafeName;
        }
        return strSafeName;
    }
    catch (e)
    {
        throw e;
    }
}
//
function CreateIdentifierSafeName(strName)
{
    try
    {
        var nLen = strName.length;
        var strSafeName = "";

        for (nCntr = 0; nCntr < nLen; nCntr++)
        {
            var cChar = strName.charAt(nCntr);
            if ((cChar >= 'A' && cChar <= 'Z') || (cChar >= 'a' && cChar <= 'z') ||
                (cChar == '_') || (cChar >= '0' && cChar <= '9') || (cChar > '\x7F' && cChar != '\xA7'))
            {
                // Filter surrogates
                if (cChar < '\uD800' || cChar > '\uDFFF') {
                    // check for unicode space (0x3000) and replace it with '_'
                    if (cChar == '\u3000')
                        cChar = '_';
                    // valid character, so add it
                    strSafeName += cChar;
                }
                // otherwize, we skip it
            }
        }
        if (strSafeName == "")
        {
            // if it's empty, we add My
            strSafeName = "My";
        }
        else if (strSafeName.charAt(0) >= '0' && strSafeName.charAt(0) <= '9')
        {
            // if it starts with a digit, we prepend My
            strSafeName = "My" + strSafeName;
        }
        return strSafeName;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Generates a valid C++ identifier name (by appending a number to
an identifier strSafeName, if it's disallowed (keyword or reserver word)
******************************************************************************/
function CreateCPPName(strSafeName)
{
    try
    {
        var nCnt = 0;
        var strCheck = strSafeName;
        var oLangSvc = wizard.dte.VCLanguageManager;
        while (!oLangSvc.ValidateIdentifier(strCheck)
        || oLangSvc.IsReservedName(strCheck, true))
        {
            nCnt++;
            strCheck = strSafeName + nCnt.toString();
        }

        return strCheck;

    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Creates the best possible ASCII identifier out of a Unicode string
; does not check for valid identifier syntax (except for checking if it starts
with a digit); this mainly works for European accented characters,
but not Japanese wide characters
******************************************************************************/
function CreateASCIIName(strIdent)
{
    var i;
    // Convert any possible accented vowels, n's & c's
    var replace = new Array('a', 'e', 'i', 'o', 'u', 'n', 'c', 'A', 'E', 'I', 'O', 'U', 'N', 'C');
    var regexp = new Array(14);
    regexp[0] = /[\u00aa\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00e6\u0101\u0103\u0105\u01ce]/g;
    regexp[1] = /[\u00e8\u00e9\u00ea\u00eb\u0113\u0115\u0117\u0119\u011b]/g;
    regexp[2] = /[\u00ec\u00ed\u00ee\u00ef\u0129\u012b\u012d\u012f\u0131\u01d0]/g;
    regexp[3] = /[\u00ba\u00f2\u00f3\u00f4\u00f5\u00f6\u00f8\u014d\u014f\u0151\u0153\u01a1\u01d2]/g;
    regexp[4] = /[\u00f9\u00fa\u00fb\u00fc\u0169\u016b\u016d\u016f\u0171\u0173\u01b0\u01d4\u01d6\u01d8\u01da\u01dc]/g;
    regexp[5] = /[\u00f1\u0144\u0146\u0148]/g;
    regexp[6] = /[\u00a2\u00e7\u0107\u0109\u010b\u010d]/g;
    regexp[7] = /[\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00c6\u0100\u0102\u0104\u01cd]/g;
    regexp[8] = /[\u00c8\u00c9\u00ca\u00cb\u0112\u0114\u0116\u0118\u011a]/g;
    regexp[9] = /[\u00cc\u00cd\u00ce\u00cf\u0128\u012a\u012c\u012e\u0130\u01cf]/g;
    regexp[10] = /[\u00d2\u00d3\u00d4\u00d5\u00d6\u00d8\u014c\u014e\u0150\u0152\u01a0\u01d1]/g;
    regexp[11] = /[\u00d9\u00da\u00db\u00dc\u0168\u016a\u016c\u016e\u0170\u0172\u01af\u01d3\u01d5\u01d7\u01d9\u01db]/g;
    regexp[12] = /[\u00d1\u0143\u0145\u0147]/g;
    regexp[13] = /[\u00a9\u00c7\u0106\u0108\u010a\u010c]/g;

    for (i = 0; i < 14; i++)
        strIdent = strIdent.replace(regexp[i], replace[i]);

    // Replace all non [a-zA-Z0-9] characters with empty string
    var re = /\W/g;
    strIdent = strIdent.replace(re, "");

    // Check for empty string or identifier starting with a digit
    if (strIdent == "")
        strIdent = "My";
    else if (strIdent.charAt(0) >= '0' && strIdent.charAt(0) <= '9')
        strIdent = "My" + strIdent;
    return strIdent;

}

/******************************************************************************
Description: Creates a name without whitespace and not starting with a digit
a valid identifier to some degree (as far as JScript can go)
******************************************************************************/
function CreateName(strIdent)
{

    // Replace all white space with an empty string
    var re = /\s/g;
    strIdent = strIdent.replace(re, "");

    // Replace high and low surrogates with empty string
    re = /[\uD800-\uDFFF]/g;
    strIdent = strIdent.replace(re, "");

    // Check for empty string or identifier starting with a digit
    if (strIdent == "")
        strIdent = "My";
    else if (strIdent.charAt(0) >= '0' && strIdent.charAt(0) <= '9')
        strIdent = "My" + strIdent;
    return strIdent;

}

/******************************************************************************
Description: Verifies if the string parameter is a valid identifier
- this is limited by the regular expression capability of JScript
******************************************************************************/
function IsValidIdentifier(strIdent)
{

    // check if string is continuous without whitespace
    var re = /^\S+$/;
    var arr = strIdent.match(re);
    if (arr == null)
        return false;
    if (arr.length != 1)
        return false;

    // check for surrogates
    re = /[\uD800-\uDFFF]/;
    arr = strIdent.match(re);
    if (arr != null)
        return false;

    // check for leading digit (Arabic digits only - JScript can't do more)
    if (strIdent.charAt(0) >= '0' && strIdent.charAt(0) <= '9')
        return false;

    return true;
}


/******************************************************************************
Description: Verifies if the string parameter contains any unicode characters.
******************************************************************************/
function IsUnicodeString(strName)
{
    var i;
    var fValid = true;
    for (i = 0; i < strName.length; ++i)
    {
        if (strName.charCodeAt(i) > 255)
        {
            return true;
        }
    }
    return false;
}

/******************************************************************************
Description: Returns a object that proves that this is an ATL Project or false.
oProj: Project object
******************************************************************************/
function IsATLProject(oProj)
{
    try
    {
        var oCM = oProj.CodeModel;
        oCM.Synchronize();
        // look for global variable derived from CAtlModuleT
        var oVariables = oCM.Variables;
        var oVariable = null;
        for (var nCntr = 1; nCntr <= oVariables.Count; nCntr++)
        {
            oVariable = oVariables(nCntr);
            var strTypeString = oVariable.TypeString;
            if (strTypeString == "ATL::CComModule" || strTypeString == "ATL::CAutoThreadModule")
                return oVariable;
        }
        
        oVariable = FindVariableOfClass(oVariables, oCM.GetClassesDerivedFrom("ATL::CAtlDllModuleT"));
        if (oVariable)
            return oVariable;

        oVariable = FindVariableOfClass(oVariables, oCM.GetClassesDerivedFrom("ATL::CAtlModuleT"));
        if (oVariable)
            return oVariable;

        // check for [module] attribute
        var oAttribute = oCM.Attributes.Find("module");
        if (oAttribute)
            return oAttribute;

        // check for a module attribute applied to a class
        var oClasses = oCM.Classes;
        for (var nCntr = 1; nCntr <= oClasses.Count; nCntr++)
        {
            var oClass = oClasses(nCntr);
            oAttribute = oClass.Attributes.Find("module");
            if (oAttribute)
                return oAttribute;
        }

        if (!oProj.Object.Files("resource.h"))
            return false;

        return false;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Returns the file name of per project type of files (RC, IDL, etc.)
oProj: selected project
strType: Type of file - STDAFX, RC, IDL, CPP, H, ODL, DEF
bFullPath: Flag indicating whether to return the full path name.
bMFC: if strtype == "CPP" or "H", indicates if the project is MFC-base,
otherwise we assume ATL
******************************************************************************/
function GetProjectFile(oProj, strType, bFullPath, bMFC)
{
    try
    {
        var oFiles = oProj.Object.Files;
        var strFileName = "";

        switch (strType)
        {
            case "RC":
            case "IDL":
            case "ODL":
            case "DEF":
                for (var nCntr = 1; nCntr <= oFiles.Count; nCntr++)
                {
                    var oFile = oFiles(nCntr);
                    if (-1 != oFile.Name.toUpperCase().indexOf("." + strType))
                    {
                        if (false == oFile.FileConfigurations(1).ExcludedFromBuild)
                        {
                            strFileName = oFile.Name;
                            break;
                        }
                    }
                }
                break;

            case "STDAFX":
                // look for name of precompiled header
                strFileName = "stdafx.h";
                var oCompilerTool = oProj.Object.Configurations(1).Tools("VCCLCompilerTool");
                if (oCompilerTool)
                {
                    var strPrecompiledHeader = oCompilerTool.PrecompiledHeaderThrough;
                    if (strPrecompiledHeader.length)
                        strFileName = strPrecompiledHeader;
                }
                break;

            case "CPP":
            case "H":
                var oCM = oProj.CodeModel;
                if (bMFC)
                {
                    var oClasses = oCM.GetClassesDerivedFrom("CWinApp");
                    if (oClasses && oClasses(1))
                    {
                        if (strType == "H")
                            strFileName = oClasses(1).Location(vsCMWhereDefault);
                        // strType == "CPP"
                        else
                        {
                            var oVariables = oCM.Variables;
                            var oVariable = FindVariableOfClass(oVariables, oClasses);
                            if (oVariable)
                                strFileName = oVariable.Location(vsCMWhereDefault);
                        }
                    }
                }
                else
                {
                    var oVarOrAttrib = IsATLProject(oProj);
                    if (oVarOrAttrib)
                    {
                        if (strType == "CPP")
                            strFileName = oVarOrAttrib.Location(vsCMWhereDefault);
                        // strType == "H"
                        else
                        {
                            var strTemp = oVarOrAttrib.Location(vsCMWhereDefault);
                            strFileName = strTemp.substring(0, strTemp.indexOf(".")) + ".h";
                        }
                    }
                }
                break;
        }

        // remove path
        if (-1 != strFileName.indexOf("\\"))
            strFileName = strFileName.substr(strFileName.lastIndexOf("\\") + 1);

        if (strFileName.length == 0 || !oFiles(strFileName))
        {
            if (strType == "STDAFX")
                return "";

            // try finding projectname.strType
            var strNewFileName = oProj.Name + "." + strType;
            if (strFileName != strNewFileName)
            {
                if (oFiles(strNewFileName))
                    strFileName = strNewFileName;
                else
                    return "";
            }
            else
                return "";
        }

        if (bFullPath)
            return oFiles(strFileName).FullPath;
        else
            return strFileName;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Called from the wizards html script when 'Finish' is clicked. This
function in turn calls the wizard control's Finish().
document: HTML document object
******************************************************************************/
function OnWizFinish(document)
{
    document.body.style.cursor = 'wait';
    try
    {
        window.external.Finish(document, "ok");
    }
    catch (e)
    {
        document.body.style.cursor = 'default';
        if (e.description.length != 0)
            SetErrorInfo(e);
        return e.number;
    }
}

/******************************************************************************
Recursive helper function for FindFileInSolution
******************************************************************************/
function FindFileInFolder(aFolder, aFileName)
{
    if ((aFolder.ProjectItems.Count == 0) && (aFolder.FileCount == 1))
    {
        if (aFolder.FileNames(1) == aFileName) return aFolder;
        return null;
    }
    else
    {
        var oSubItem;
        var i;
        var RetVal = null;
        for (i = 1; i <= aFolder.ProjectItems.Count; ++i)
        {
            RetVal = FindFileInFolder(aFolder.ProjectItems.Item(i), aFileName);
            if (RetVal != null) return RetVal;
        }
    }
    return null;
}

/******************************************************************************
Recursive helper function for FindFileInSolution
******************************************************************************/
function FindFileInProject(aProject, aFileName, aProjectRequested)
{
        if (aProject.Kind == vsProjectKindSolutionFolder)
        {
            for (var i = 1; i <= aProject.ProjectItems.Count; ++i)
            {
                var oItem = aProject.ProjectItems.Item(i);
                if (oItem.SubProject != null) // items can be files (SubProj==null) or Projects/Other folders - SubProject !=null)
                {
                    var RetVal = FindFileInProject(oItem.SubProject, aFileName, aProjectRequested);
                    if (RetVal != null) return RetVal;
                }
            }
        }
        else
        {
            // if an optional project was specifed, make sure we're looking in that project only
            if (aProjectRequested != null)
            {
                if (aProjectRequested.Kind != aProject.Kind) return null;
            }

            for (var j = 1; j <= aProject.ProjectItems.Count; ++j)
            {
                var RetVal = FindFileInFolder(aProject.ProjectItems.Item(j), aFileName);
                if (RetVal != null) return RetVal;
            }
        }
        return null;
}

/******************************************************************************
Finds a file, specified by its full path in the DTE solution hierarchy
******************************************************************************/
function FindFileInSolution(aFileName, aProjectRequested)
{
    var oWizard;
    try
    {
        oWizard = wizard;
    }
    catch (e)
    {
        oWizard = window.external;
}

    for (var i = 1; i <= oWizard.dte.Solution.Projects.Count; ++i)
    {
        var RetVal = FindFileInProject(oWizard.dte.Solution.Projects.Item(i), aFileName, aProjectRequested);
        if (RetVal != null) return RetVal;
    }
    return null;
}

/******************************************************************************
Finds a file, and renames it
******************************************************************************/
function RenameFileInSolution(aOldFileName, aNewFileName)
{
    var aFileObj = FindFileInSolution(aOldFileName);
    if (aFileObj != null) aFileObj.Name = aNewFileName;
}

/******************************************************************************
Finds a file, and removes it
******************************************************************************/
function RemoveFileFromProject(aFileName, aProject)
{
    var aFileObj = FindFileInSolution(aFileName, aProject);
    if (aFileObj != null) aFileObj.Remove();
}

/******************************************************************************
Description: Returns the type of interface (e.g. custom, dual, dispinterface,
oleautomation)
oInterface: VCCodeInterface object
******************************************************************************/
function GetInterfaceType(oInterface)
{
    try
    {
        oProject.CodeModel.Synchronize();
        if (-1 != oInterface.DeclarationText.search("dispinterface " + oInterface.Name))
            return "dispinterface";

        var oAttributes = oInterface.Attributes;
        for (var nCntr = 1; nCntr <= oAttributes.Count; nCntr++)
        {
            if (oAttributes(nCntr).Name == "dual")
                return "dual";
            else if (oAttributes(nCntr).Name == "oleautomation")
                return "oleautomation";
            else if (oAttributes(nCntr).Name == "dispinterface")
                return "dispinterface";
        }
        return "custom";
    }
    catch (e)
    {
        throw e;
    }
}

function HasClass(aryClasses, strFullName)
{
    for (var i = 0; i < aryClasses.length; ++i)
    {
        if (aryClasses[i].FullName == strFullName)
            return true;
    }
    
    return false;
}

// Used to filter out duplicates produced by parsing of both sides of #ifdef.
function AppendUniqueClass(aryClasses, oClass)
{
    if (!HasClass(aryClasses, oClass.FullName))
        aryClasses[aryClasses.length] = oClass;
}

function FindBase(oClass, strCompare)
{
    var oBases = oClass.Bases;
    for (var iBase = 1; iBase <= oBases.Count; iBase++)
    {
        var strBaseName = oBases(iBase).FullName;
        if (strCompare == strBaseName.substring(0, strCompare.length))
            return true;
    }

    return false
}

function IsClassOrStruct(oClass)
{
    return oClass.Kind == vsCMElementClass || oClass.Kind == vsCMElementStruct;
}

function IsInterfaceClass(strInterface, strInterfaceFullName, strBase, strIID, oClass)
{
    if (strBase == strInterfaceFullName)
        return true;
    else if (strBase == "ATL::CStockPropImpl")
    {
        var strCompare = "CStockPropImpl<" + oClass.Name + ", " + strInterface + ">";
        return FindBase(oClass, strCompare);
    }
    else if (strBase == "ATL::IDispatchImpl")
    {
        strCompare = "IDispatchImpl<" + strInterface + ",";
        return FindBase(oClass, strCompare);
    }
    else if (strBase == "COleControl")
    {
        // look for IID_Interface in InitializeIIDs call in constructor.
        oConstructor = oClass.Functions.Find(oClass.Name);
        if (oConstructor)
        {
            var strBody = oConstructor.BodyText;
            if (-1 != strBody.indexOf("&" + strIID + ",") ||
                -1 != strBody.indexOf("&" + strIID + ")"))
                return true;
        }
    }
    else if (strBase == "CCmdTarget")
    {
        // look for IID_Interface in INTERFACE MAP.
        var oMap = oClass.Maps.Find("INTERFACE");
        if (oMap)
        {
            var oMapItems = oMap.Entries;
            var bFound = false;
            for (var iMapItem = 1; iMapItem <= oMapItems.Count; iMapItem++)
            {
                var oMapItem = oMapItems(iMapItem);
                var oParams = oMapItem.Parameters;
                for (var iParam = 1; iParam <= oParams.Count; iParam++)
                {
                    if (-1 != oParams(iParam).Name.indexOf(strIID))
                        return true;
                }
            }
        }
    }

    return false;
}

function AddInterfaceClassesDerivedFrom(oCM, strInterface, strInterfaceFullName, strBase, strIID, aryClasses, bAll)
{
    var oClasses = oCM.GetClassesDerivedFrom(strBase);
    if (oClasses)
    {
        for (var iClass = 1; iClass <= oClasses.Count; ++iClass)
        {
            var oClass = oClasses(iClass);
            if (!IsClassOrStruct(oClass))
                continue;

            if (IsInterfaceClass(strInterface, strInterfaceFullName, strBase, strIID, oClass))
            {
                AppendUniqueClass(aryClasses, oClass);
                if (!bAll)
                    return true;
            }
        }
    }
    return false;
}

/******************************************************************************
Description: Returns the CodeModel class/struct objects associated with an interface
strInterface: Name of interface
strInterface: Full name of interface
oCM: project CodeModel
aryClasses: Array of class objects (in/out param)
bAll: if false, then the search stops at the first matching class found (length of aryClasses can grow by 1 only)
RETURNS: true if any associated class found (length of aryClasses grew), false otherwise
******************************************************************************/
function GetInterfaceClass(oCM, strInterface, strInterfaceFullName, aryClasses, bAll)
{
    try
    {
        var strIID;
        if (strInterface.charAt(0) == '_')
            strIID = "IID" + strInterface;
        else
            strIID = "IID_" + strInterface;
        var originalSize = aryClasses.length;

        var rgBases = new Array();
        rgBases.push(strInterfaceFullName);
        rgBases.push("ATL::IDispatchImpl");
        rgBases.push("ATL::CStockPropImpl");
        rgBases.push("COleControl");
        rgBases.push("CCmdTarget");

        for (var iBase = 0; iBase < rgBases.length; ++iBase)
        {
            if (AddInterfaceClassesDerivedFrom(oCM, strInterface, strInterfaceFullName, rgBases[iBase], strIID, aryClasses, bAll))
                return true;
        }

        return (aryClasses.length > originalSize);
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Adds ATL support to an MFC project
oProj: Selected project
******************************************************************************/
function AddATLSupportToProject(oProj)
{
    var oCM;
    try
    {

        if (IsATLProject(oProj))
            return true; //don't need to add ATL support if it's already there

        var L_ATLSupportQuestion_Text = "ATL support will be added to this project. Do you wish to continue? This feature is no longer supported and will be removed in the next version of Visual Studio.";
        if (!wizard.YesNoAlert(L_ATLSupportQuestion_Text))
            return false;

        var strProjectName = wizard.FindSymbol("PROJECT_NAME");
        var strSafeProjectName = CreateASCIIName(strProjectName);
        var strProjectPath = wizard.FindSymbol("PROJECT_PATH");
        var strAddATLTemplatePath = wizard.FindSymbol("PROJECT_TEMPLATE_PATH") + "\\CodeWiz\\ATL\\AddToMFC\\Templates\\" + wizard.GetHostLocale();
        wizard.AddSymbol("SAFE_PROJECT_IDENTIFIER_NAME", strSafeProjectName);
        wizard.AddSymbol("SAFE_PROJECT_APPID_NAME", strSafeProjectName);

        var bIsDeviceProject = IsDeviceProject(oProj);

        oCM = oProj.CodeModel;
        var L_ATLSupportTRANSACTION_Text = "Add ATL Support To Project";
        oCM.StartTransaction(L_ATLSupportTRANSACTION_Text);

        var strProjectCPP = GetProjectFile(oProj, "CPP", false, true);
        var strProjectH = GetProjectFile(oProj, "H", false, true);
        var strProjectODL = GetProjectFile(oProj, "ODL", false, true);
        var strProjectIDL = GetProjectFile(oProj, "IDL", false, true);
        var strSTDAFX = GetProjectFile(oProj, "STDAFX", false, true);

        var bDLL;

        if (typeDynamicLibrary == oProj.Object.Configurations(1).ConfigurationType)
            bDLL = true;
        else
            bDLL = false;

        wizard.AddSymbol("DLL_APP", bDLL);

        // Create necessary GUIDS
        // create LIBID GUID
        var strRawGUID = wizard.CreateGuid();
        var strFormattedGUID = wizard.FormatGuid(strRawGUID, 0);
        wizard.AddSymbol("LIBID_REGISTRY_FORMAT", strFormattedGUID);

        // create APPID GUID
        strRawGUID = wizard.CreateGuid();
        var strAppID = wizard.FormatGuid(strRawGUID, 0);
        wizard.AddSymbol("APPID_REGISTRY_FORMAT", strAppID);

        // check for IDL or ODL file
        var oFiles = oProj.Object.Files;
        // if ODL file found, convert to IDL
        if (strProjectODL.length)
        {
            var oFile = oFiles(strProjectODL);

            strProjectODL = oFile.FullPath;
            strProjectIDL = strProjectODL.substr(0, strProjectODL.length - 4) + ".idl";

            RenameFileInSolution(strProjectODL, strProjectIDL);

        }

        var bNewIDL = false;
        // if no IDL, render template
        if (0 == strProjectIDL.length)
        {
            strProjectIDL = strProjectPath + strSafeProjectName + ".idl";
            wizard.RenderTemplate(strAddATLTemplatePath + "\\addatl.idl", strProjectIDL);
            oProj.Object.AddFile(strProjectIDL);
            bNewIDL = true;
            oCM.Synchronize();
        }
        else
        {
            oCM.AddIDLImport('"oaidl.idl"', strProjectIDL, vsCMAddPositionStart);
            oCM.AddIDLImport('"ocidl.idl"', strProjectIDL, vsCMAddPositionStart);
        }

        // MIDL settings
        var strMidlHeader = "$(ProjectName)_i.h";
        var strMidlCFile = "$(ProjectName)_i.c";
        var oConfigs = oProj.Object.Configurations;
        var idlFileObj = oProj.Object.Files(strProjectIDL);
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
        {
            var config = oConfigs(nCntr);
            var bDebug = false;
            if (-1 != config.Name.toUpperCase().indexOf("DEBUG"))
                bDebug = true;
            //Midl settings for projectName.idl file level override take precedence over
            //project level config
            var oFileConfig = idlFileObj.FileConfigurations.Item(config.Name);
            var MidlTool;
            if (oFileConfig != null)
            {
                MidlTool = oFileConfig.Tool;
            } else
            {
                MidlTool = config.Tools("VCMidlTool");
            }
            MidlTool.MkTypLibCompatible = false;
            if (IsPlatformWin32(config))
                MidlTool.TargetEnvironment = midlTargetWin32;
            if (bDebug)
                MidlTool.PreprocessorDefinitions = "_DEBUG";
            else
                MidlTool.PreprocessorDefinitions = "NDEBUG";

            if (bNewIDL)
            {
                MidlTool.HeaderFileName = strMidlHeader;
                MidlTool.InterfaceIdentifierFileName = strMidlCFile;
            }
            else
            {
                if (MidlTool.HeaderFileName.length && MidlTool.HeaderFileName.charAt(0) != "$")
                    strMidlHeader = MidlTool.HeaderFileName;
                else
                    MidlTool.HeaderFileName = strMidlHeader;

                if (MidlTool.InterfaceIdentifierFileName.length && MidlTool.InterfaceIdentifierFileName.charAt(0) != "$")
                    strMidlCFile = MidlTool.InterfaceIdentifierFileName
                else
                    MidlTool.InterfaceIdentifierFileName = strMidlCFile;
            }
            strMidlHeader = config.Evaluate(strMidlHeader);
            strMidlCFile = config.Evaluate(strMidlCFile);

            MidlTool.GenerateStublessProxies = true;
            MidlTool.TypeLibraryName = "$(IntDir)" + "$(ProjectName).tlb";


            // Resource settings
            var RCTool = config.Tools("VCResourceCompilerTool");
            RCTool.AdditionalIncludeDirectories = "$(IntDir)";

            var LinkTool = config.Tools("VCLinkerTool");
            if (bDLL)
            {
                // remove .DEF file from linker settings
                LinkTool.ModuleDefinitionFile = "";
            }
            if (!bIsDeviceProject)
            {
                LinkTool.RegisterOutput = true;
            }
        }

        oCM.Synchronize();

        // Add #include <initguid.h> to strProjectName.cpp
        if (!DoesIncludeExist(oProj, "<initguid.h>", strProjectCPP))
            oCM.AddInclude("<initguid.h>", strProjectCPP, vsCMAddPositionEnd);

        // Add #include "projectname_i.h" to strProjectName.h
        if (!DoesIncludeExist(oProj, '"' + strMidlHeader + '"', strProjectH))
            oCM.AddInclude('"' + strMidlHeader + '"', strProjectH, vsCMAddPositionEnd);

        // Add #include "projectname_i.c" to strProjectName.cpp
        if (!DoesIncludeExist(oProj, '"' + strMidlCFile + '"', strProjectCPP))
            oCM.AddInclude('"' + strMidlCFile + '"', strProjectCPP, vsCMAddPositionEnd);

        // add RGS file resource
        var strRGSFile = strProjectName + ".rgs";
        var strRGSID = "IDR_" + strSafeProjectName.toUpperCase();
        wizard.RenderTemplate(strAddATLTemplatePath + "\\addatl.rgs", strProjectPath + strRGSFile);

        var strProjectRCs = new Array();

        if (!bIsDeviceProject)
        {
            strProjectRCs[0] = GetProjectFile(oProj, "RC", true);
        }
        else
        {
            var oFiles = oProj.Object.Files;
            for (var nCntr = 1, nIdx = 0; nCntr <= oFiles.Count; nCntr++)
            {
                var strProjectRC = GetDeviceProjectResourceFiles(oProj, oFiles, nCntr, true);
                if (strProjectRC != "")
                {
                    strProjectRCs[nIdx++] = strProjectRC;
                }
            }
        }

        for (var nIdx = 0; nIdx < strProjectRCs.length; nIdx++)
        {
            var strProjectRC = strProjectRCs[nIdx];
            var oResHelper = wizard.ResourceHelper;

            oResHelper.OpenResourceFile(strProjectRC);
            var strSymbolValue = oResHelper.AddResource(strRGSID, strProjectPath + strRGSFile, "REGISTRY");
            if (strSymbolValue == null) return false;

            // add TYPELIB if necessary
            if (bNewIDL)
                oResHelper.CompileDirectives += '\r\n1 TYPELIB "' + strProjectName + '.tlb"';

            oResHelper.CloseResourceFile();
        }

        // this doesn't work for Windows CE MFC Application
        // This is the correct value for DCOM platforms,
        // but not for non-DCOM platforms (nothing if fine, or _ATL_FREE_THREADED).
        // Not calling this is a good work around until the code model is fixed.
        if (!bIsDeviceProject)
            oCM.AddMacro("_ATL_APARTMENT_THREADED", strSTDAFX, "", vsCMAddPositionStart);

        // add #includes to stdafx.h
        // Batch up the inserts to avoid perf hit on reparse
        var strSTDAFXIncludes = "";
        if (!DoesIncludeExist(oProj, "<atlbase.h>", strSTDAFX))
            strSTDAFXIncludes += "#include <atlbase.h>\r\n";
        //oCM.AddInclude("<atlbase.h>", strSTDAFX, vsCMAddPositionEnd);
        if (!DoesIncludeExist(oProj, "<atlcom.h>", strSTDAFX))
            strSTDAFXIncludes += "#include <atlcom.h>\r\n";
        //oCM.AddInclude("<atlcom.h>", strSTDAFX, vsCMAddPositionEnd);
        if (!DoesIncludeExist(oProj, "<atlctl.h>", strSTDAFX))
            strSTDAFXIncludes += "#include <atlctl.h>\r\n";

        if (strSTDAFXIncludes.length > 0)
        {
            var oSTDAFXFile = oProj.Object.Files(strSTDAFX).Object.FileCodeModel;
            oSTDAFXFile.EndPoint.CreateEditPoint().Insert("\r\n" + strSTDAFXIncludes);
            oCM.Synchronize();
        }

        // render addatlps.def
        wizard.RenderTemplate(strAddATLTemplatePath + "\\addatlps.def", strProjectPath + strProjectName + "ps.def");

        // render addatlps.mk
        wizard.RenderTemplate(strAddATLTemplatePath + "\\addatlps.mk", strProjectPath + strProjectName + "ps.mk");

        var oClasses = oCM.GetClassesDerivedFrom("CWinApp");
        var oInitInstance = false;
        var oCWinApp = false;
        if (oClasses)
        {
            for (var nCntr = 1; nCntr <= oClasses.Count; nCntr++)
            {
                oClass = oClasses(nCntr);
                // look for class derived from CWinApp
                if (oClass.Name != "COleControlModule")
                {
                    oInitInstance = oClass.Functions.Find("InitInstance");
                    if (!oInitInstance)
                    {
                        oInitInstance = oClass.AddFunction("InitInstance", vsCMFunctionFunction, "BOOL", vsCMAddPositionEnd, vsCMAccessPublic, strProjectCPP);
                        oInitInstance.BodyText = GetCodeForInitInstance(0, 1, false);
                        oInitInstance.Comment = oClass.Name + " initialization";
                    }
                    oCWinApp = oClass;
                    break;
                }
            }
        }

        if (bDLL)
        {
            var oDllCanUnloadNow = GetMemberFunction(false, "DllCanUnloadNow", oProj);

            strCodeForDllCanUnloadNow0 = "\t" + "AFX_MANAGE_STATE(AfxGetStaticModuleState());\r\n";
            strCodeForDllCanUnloadNow1 = "\t" + "if (_AtlModule.GetLockCount() > 0)\r\n" +
                                     "\t" + "\treturn S_FALSE;\r\n";
            strCodeForDllCanUnloadNow3 = "\t" + "return S_OK;\r\n";

            if (!oDllCanUnloadNow)
            {
                oDllCanUnloadNow = oCM.AddFunction("DllCanUnloadNow", strProjectCPP, vsCMFunctionFunction, "STDAPI", vsCMAddPositionEnd);
                oDllCanUnloadNow.BodyText = strCodeForDllCanUnloadNow0 + strCodeForDllCanUnloadNow1 + strCodeForDllCanUnloadNow3;
                oDllCanUnloadNow.Comment = "DllCanUnloadNow - Allows COM to unload DLL";
            }
            else
            {
                oDllCanUnloadNow.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strCodeForDllCanUnloadNow1);
                oCM.Synchronize();
            }

            strCodeForDllGetClassObject0 = "\t" + "AFX_MANAGE_STATE(AfxGetStaticModuleState());\r\n";
            strCodeForDllGetClassObject1 = "\t" + "if (S_OK == _AtlModule.GetClassObject(rclsid, riid, ppv))\r\n" +
                                       "\t" + "\treturn S_OK;\r\n";
            strCodeForDllGetClassObject3 = "\t" + "return AfxDllGetClassObject(rclsid, riid, ppv);\r\n";

            var oDllGetClassObject = GetMemberFunction(false, "DllGetClassObject", oProj);
            if (!oDllGetClassObject)
            {
                oDllGetClassObject = oCM.AddFunction("DllGetClassObject(REFCLSID rclsid, REFIID riid, LPVOID* ppv)", strProjectCPP, vsCMFunctionFunction, "STDAPI", vsCMAddPositionEnd, vsCMAccessPublic);
                oDllGetClassObject.BodyText = strCodeForDllGetClassObject0 + strCodeForDllGetClassObject1 + strCodeForDllGetClassObject3;
                oDllGetClassObject.Comment = "DllGetClassObject - Returns class factory";
            }
            else
            {
                oDllGetClassObject.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strCodeForDllGetClassObject1);
                oCM.Synchronize();
            }

            strCodeForDllRegisterServer0 = "\t" + "AFX_MANAGE_STATE(AfxGetStaticModuleState());\r\n";
            strCodeForDllRegisterServer1 = "\t" + "_AtlModule.UpdateRegistryAppId(TRUE);\r\n" +
                                       "\t" + "HRESULT hRes2 = _AtlModule.RegisterServer(TRUE);\r\n" +
                                       "\t" + "if (hRes2 != S_OK)\r\n" +
                                       "\t" + "\treturn hRes2;\r\n";
            strCodeForDllRegisterServer5 = "\t" + "if (!COleObjectFactory::UpdateRegistryAll(TRUE))\r\n" +
                                       "\t" + "\treturn ResultFromScode(SELFREG_E_CLASS);\r\n" +
                                       "\t" + "return S_OK;\r\n";

            var oDllRegisterServer = GetMemberFunction(false, "DllRegisterServer", oProj);
            if (!oDllRegisterServer)
            {
                oDllRegisterServer = oCM.AddFunction("DllRegisterServer", strProjectCPP, vsCMFunctionFunction, "STDAPI", vsCMAddPositionEnd, vsCMAccessPublic);
                oDllRegisterServer.BodyText = strCodeForDllRegisterServer0 + strCodeForDllRegisterServer1 + strCodeForDllRegisterServer5;
                oDllRegisterServer.Comment = "DllRegisterServer - Adds entries to the system registry";
            }
            else
            {
                oDllRegisterServer.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strCodeForDllRegisterServer1);
                oCM.Synchronize();
            }

            strCodeForDllUnregisterServer0 = "\t" + "AFX_MANAGE_STATE(AfxGetStaticModuleState());\r\n";
            strCodeForDllUnregisterServer1 = "\t" + "_AtlModule.UpdateRegistryAppId(FALSE);\r\n" +
                                         "\t" + "HRESULT hRes2 = _AtlModule.UnregisterServer(TRUE);\r\n" +
                                         "\t" + "if (hRes2 != S_OK)\r\n" +
                                         "\t" + "\treturn hRes2;\r\n";
            strCodeForDllUnregisterServer5 = "\t" + "if (!COleObjectFactory::UpdateRegistryAll(FALSE))\r\n" +
                                         "\t" + "\treturn ResultFromScode(SELFREG_E_CLASS);\r\n" +
                                         "\t" + "return S_OK;\r\n";

            var oDllUnregisterServer = GetMemberFunction(false, "DllUnregisterServer", oProj);
            if (!oDllUnregisterServer)
            {
                oDllUnregisterServer = oCM.AddFunction("DllUnregisterServer", strProjectCPP, vsCMFunctionFunction, "STDAPI", vsCMAddPositionEnd, vsCMAccessPublic);
                oDllUnregisterServer.BodyText = strCodeForDllUnregisterServer0 + strCodeForDllUnregisterServer1 + strCodeForDllUnregisterServer5;
                oDllUnregisterServer.Comment = "DllUnregisterServer - Removes entries from the system registry";
            }
            else
            {
                oDllUnregisterServer.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strCodeForDllUnregisterServer1);
                oCM.Synchronize();
            }

            // add #pragmas for exporting functions
            strCodeForExportPragmas = '#if !defined(_WIN32_WCE) && !defined(_AMD64_) && !defined(_IA64_)\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllCanUnloadNow=_DllCanUnloadNow@0,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllGetClassObject=_DllGetClassObject@12,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllRegisterServer=_DllRegisterServer@0,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllUnregisterServer=_DllUnregisterServer@0,PRIVATE")\r\n' +
                    '#else\r\n' +
                    '#if defined(_X86_) || defined(_SHX_)\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllCanUnloadNow=_DllCanUnloadNow,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllGetClassObject=_DllGetClassObject,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllRegisterServer=_DllRegisterServer,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllUnregisterServer=_DllUnregisterServer,PRIVATE")\r\n' +
                    '#else\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllCanUnloadNow,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllGetClassObject,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllRegisterServer,PRIVATE")\r\n' +
                    '#pragma comment(linker, "/EXPORT:DllUnregisterServer,PRIVATE")\r\n' +
                    '#endif // (_X86_)||(_SHX_)\r\n' +
                    '#endif // !_WIN32_WCE && !_AMD64_ && !_IA64_ \r\n';

            oDllCanUnloadNow.StartPoint.Insert(strCodeForExportPragmas + "\r\n");
            oCM.Synchronize();

            // delete DEF file
            var strDefFile = GetProjectFile(oProj, "DEF", true);
            if (strDefFile.length)
            {
                RemoveFileFromProject(strDefFile, oProj)
            }

            if (-1 == oInitInstance.BodyText.indexOf("COleControlModule::InitInstance") &&
                -1 == oInitInstance.BodyText.indexOf("COleObjectFactory::RegisterAll"))
            {
                oInitInstance.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert("\tCOleObjectFactory::RegisterAll();\r\n");
                oCM.Synchronize();
            }
        }
        // EXE case
        else
        {
            if (oCWinApp)
            {
                var strCodeForExitInstance0 = "#if !defined(_WIN32_WCE) || defined(_CE_DCOM)\r\n" +
                                    "\t" + "_AtlModule.RevokeClassObjects();\r\n" +
                                    "#endif\r\n";
                var strCodeForExitInstance1 = "\t" + "return CWinApp::ExitInstance();\r\n";
                if (oCWinApp.IsDerivedFrom("CWinAppEx"))
                    strCodeForExitInstance1 = "\t" + "return CWinAppEx::ExitInstance();\r\n";

                var oExitInstance = GetMemberFunction(oCWinApp, "ExitInstance", oProj);
                if (!oExitInstance)
                {
                    oExitInstance = oCWinApp.AddFunction("ExitInstance", vsCMFunctionFunction, "BOOL", vsCMAddPositionEnd, vsCMAccessPublic, strProjectCPP);

                    oExitInstance.BodyText = strCodeForExitInstance0 + strCodeForExitInstance1;
                }
                else
                {
                    oExitInstance.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strCodeForExitInstance0);
                    oCM.Synchronize();
                }

                var strBody = oInitInstance.BodyText;
                if (-1 == strBody.search("AfxOleInit") &&
                    -1 == strBody.search("OleInitialize") &&
                    -1 == strBody.search("CoInitialize") &&
                    -1 == strBody.search("CoInitializeEx"))
                {
                    var oEditPoint = oInitInstance.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(GetCodeForInitInstance(2, 2, false));
                    oCM.Synchronize();
                }
                // look for ParseCommandLine(cmdInfo)
                var nPos = strBody.indexOf("ParseCommandLine(cmdInfo)");
                if (-1 == nPos)
                {
                    if (!InsertIntoFunction(oInitInstance, "AfxEnableControlContainer", 3, 31, false))
                        if (!InsertIntoFunction(oInitInstance, "AfxOleInit", 3, 31, false))
                        if (!InsertIntoFunction(oInitInstance, "OleInitialize", 3, 31, false))
                        if (!InsertIntoFunction(oInitInstance, "CoInitialize", 3, 31, false))
                        if (!InsertIntoFunction(oInitInstance, "CoInitializeEx", 3, 31, false))
                        throw "Parsing error: COM initialization function not found.";
                }
                else
                {
                    // look for cmdInfo.m_bRunAutomated or RunAutomated
                    if (-1 == strBody.indexOf("cmdInfo.m_bRunAutomated") &&
                        -1 == strBody.indexOf("RunAutomated()"))
                    {
                        // no cmdInfo.m_bRunAutomated
                        InsertIntoFunction(oInitInstance, "ParseCommandLine(cmdInfo)", 6, 31, false);
                    }
                    else
                    {
                        // insert CoRegisterClassObject code
                        InsertIntoFunction(oInitInstance, "ParseCommandLine(cmdInfo)", 6, 10, false);

                        // look for "== CCommandLineInfo::AppUnregister"
                        if (!InsertIntoFunction(oInitInstance, "== CCommandLineInfo::AppUnregister", 21, 22, true))
                        {
                            if (!InsertIntoFunction(oInitInstance, "cmdInfo.m_bRunAutomated", 18, 31, false))
                                InsertIntoFunction(oInitInstance, "RunAutomated()", 18, 31, false);
                        }
                        else
                        {
                            if (!InsertIntoFunction(oInitInstance, "COleObjectFactory::UpdateRegistryAll()", 28, 29, false))
                                if (!InsertIntoFunction(oInitInstance, "UpdateRegistry(OAT_INPLACE_SERVER)", 28, 29, false))
                                InsertIntoFunction(oInitInstance, "UpdateRegistry(OAT_DOC_OBJECT_SERVER)", 28, 29, false);
                        }
                    }
                }
            }
        }

        var oAtlModule = oCM.AddClass("C" + strSafeProjectName + "Module", strProjectCPP, vsCMAddPositionStart, "ATL::CAtlMfcModule", "", vsCMAccessPublic);
        var strBody = "public:\r\n";
        strBody += "\tDECLARE_LIBID(LIBID_" + oCM.IDLLibraries(1).Name + ");\r\n";
        strBody += "\tDECLARE_REGISTRY_APPID_RESOURCEID(" + strRGSID + ', "{' + strAppID + '}");';
        oAtlModule.BodyText = strBody;
        // Add global _AtlModule to project.cpp
        oAtlModule.EndPoint.CreateEditPoint().Insert("\r\n\r\nC" + strSafeProjectName + "Module _AtlModule;\r\n");
        oCM.Synchronize();

        oCM.CommitTransaction();
        return true;
    }
    catch (e)
    {
        if (oCM)
            oCM.AbortTransaction();
        if (bNewIDL)
        {
            /*          var oFile = oProj.Object.Files(strProjectIDL);
            if(oFile != null)
            oProj.Object.RemoveFile(oFile);*/
            RemoveFileFromProject(strProjectIDL, oProj);
        }
        throw e;
    }
}

/******************************************************************************
Description: Returns a Function object based on the given name
oClass: Class object
strFuncName: Name of the function
oProj: Selected project
******************************************************************************/
function GetMemberFunction(oClass, strFuncName, oProj)
{
    try
    {
        var oFunctions;
        if (oClass)
            oFunctions = oClass.Functions;
        else
        {
            if (!oProj)
                return false;
            oFunctions = oProj.CodeModel.Functions;
        }

        for (var nCntr = 1; nCntr <= oFunctions.Count; nCntr++)
        {
            if (oFunctions(nCntr).Name == strFuncName)
                return oFunctions(nCntr);
        }
        return false;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Helper function to get the text for InitInstance()
nLineStart: Function's start line number
nLineEnd: Function's end line number
******************************************************************************/
function GetCodeForInitInstance(nLineStart, nLineEnd, bCWinAppEx)
{
    try
    {
        var L_CODE_Text = new Array();

        if (bCWinAppEx)
        {
            L_CODE_Text[0] = "CWinAppEx::InitInstance();";
        }
        else
        {
            L_CODE_Text[0] = "CWinApp::InitInstance();";
        }

        L_CODE_Text[1] = "return TRUE;";

        L_CODE_Text[2] = "AfxOleInit();";

        L_CODE_Text[3] = "// Parse command line for standard shell commands, DDE, file open";
        L_CODE_Text[4] = "CCommandLineInfo cmdInfo;";
        L_CODE_Text[5] = "ParseCommandLine(cmdInfo);";

        L_CODE_Text[6] = "#if !defined(_WIN32_WCE) || defined(_CE_DCOM)";
        L_CODE_Text[7] = "// Register class factories via CoRegisterClassObject().";
        L_CODE_Text[8] = "if (FAILED(_AtlModule.RegisterClassObjects(CLSCTX_LOCAL_SERVER, REGCLS_MULTIPLEUSE)))";
        L_CODE_Text[9] = "\treturn FALSE;";
        L_CODE_Text[10] = "#endif // !defined(_WIN32_WCE) || defined(_CE_DCOM)";
        L_CODE_Text[11] = "// App was launched with /Embedding or /Automation switch.";
        L_CODE_Text[12] = "// Run app as automation server.";
        L_CODE_Text[13] = "if (cmdInfo.m_bRunEmbedded || cmdInfo.m_bRunAutomated)";
        L_CODE_Text[14] = "{";
        L_CODE_Text[15] = "\t// Don't show the main window";
        L_CODE_Text[16] = "\treturn TRUE;";
        L_CODE_Text[17] = "}";

        L_CODE_Text[18] = "// App was launched with /Unregserver or /Unregister switch.";
        L_CODE_Text[19] = "if (cmdInfo.m_nShellCommand == CCommandLineInfo::AppUnregister)";
        L_CODE_Text[20] = "{";
        L_CODE_Text[21] = "\t_AtlModule.UpdateRegistryAppId(FALSE);";
        L_CODE_Text[22] = "\t_AtlModule.UnregisterServer(TRUE);";
        L_CODE_Text[23] = "\treturn FALSE;";
        L_CODE_Text[24] = "}";

        L_CODE_Text[25] = "// App was launched with /Register or /Regserver switch.";
        L_CODE_Text[26] = "if (cmdInfo.m_nShellCommand == CCommandLineInfo::AppRegister)";
        L_CODE_Text[27] = "{";
        L_CODE_Text[28] = "\t_AtlModule.UpdateRegistryAppId(TRUE);";
        L_CODE_Text[29] = "\t_AtlModule.RegisterServer(TRUE);";
        L_CODE_Text[30] = "\treturn FALSE;";
        L_CODE_Text[31] = "}";

        var strRet = "";
        for (var nCntr = nLineStart; nCntr <= nLineEnd; nCntr++)
            strRet += "\t" + L_CODE_Text[nCntr] + "\r\n";
        return strRet;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Helper function used by InsertIntoFunction to convert an index in
a function body to a line number.
strString: Function body
nPos: Position to convert
******************************************************************************/
function OffsetToLineNumber(strString, nPos)
{
    try
    {
        var nCurPos = strString.indexOf("\r\n");
        var nLine = 1;
        while (nCurPos != -1 && nCurPos < nPos)
        {
            nLine++;
            nCurPos = strString.indexOf("\r\n", nCurPos + 2);
        }
        return nLine;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Helper function used by InsertIntoFunction to determine if a
line begins with a particular string
strBody: Body of function
strSearchString: String to look for
nStartPos: Starting position for search
******************************************************************************/
function LineBeginsWith(strBody, strSearchString, nStartPos)
{
    try
    {
        // go to start of line
        var nPos = strBody.lastIndexOf("\n", nStartPos) + 1;
        if (nPos == -1)
            nPos = 0;
        // walk to first char
        while (strBody.charAt(nPos) == " " || strBody.charAt(nPos) == "\t")
            nPos++;
        if (strBody.substr(nPos, strSearchString.length) == strSearchString)
        {
            return true;
        }
        else
            return false;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Helper function used by AddATLSupportToProject to insert
code into InitInstance.
oFunction: Function object to insert into
strSearchString: String to look for to determine insertion point
nStartLine: Starting line to pass to GetCodeForInitInstance
nEndLine: Ending line to pass to GetCodeForInitInstance
bInsideIfBlock: Boolean indicating whether to insert inside if block
******************************************************************************/
function InsertIntoFunction(oFunction, strSearchString, nStartLine, nEndLine, bInsideIfBlock)
{
    try
    {
        var strBody = oFunction.BodyText;
        var nCurPos = strBody.indexOf(strSearchString);
        if (-1 == nCurPos)
            return false;

        if (LineBeginsWith(strBody, "if", nCurPos) || LineBeginsWith(strBody, "else", nCurPos))
        {
            var nEndOfNextLine = strBody.indexOf("\r\n", nCurPos) + 2;
            nEndOfNextLine = strBody.indexOf("\r\n", nEndOfNextLine);

            // look for "{" on current line and next line
            var nPos = strBody.indexOf("{", nCurPos);
            if (nPos != -1 && nPos < nEndOfNextLine)
            {
                if (bInsideIfBlock)
                    nCurPos = nPos;
                else
                    nCurPos = strBody.indexOf("}", nPos);
            }
            else
                nCurPos = strBody.indexOf("\r\n", nCurPos) + 2;
        }

        var oEditPoint = oFunction.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint();
        oEditPoint.LineDown(OffsetToLineNumber(strBody, nCurPos));
        oEditPoint.Insert(GetCodeForInitInstance(nStartLine, nEndLine, false));

        return true;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: This function is called by the wizard to verify if the project
is compatible with the Code Wizard that's about to be run.  The
wizard knows to call this function when it sees the param
PREPROCESS_FUNCTION in VC7\VCAddClass\XXX.VSZ
oProj: Selected project
oObject: Select object (in this case it will be the project)
******************************************************************************/
function CanAddMFCClass(oProj, oObject)
{
    try
    {
        var bIsDeviceProject = IsDeviceProject(oProj);
        wizard.AddSymbol("IS_DEVICE_PROJECT", bIsDeviceProject);

        if (!IsMFCProject(oProj, false))
        {
            var L_CanAddMFCClass_Text = "MFC classes can only be added to MFC projects.";
            wizard.ReportError(L_CanAddMFCClass_Text);
            return false;
        }
        return true;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: This function is called by the wizard to verify if the VC
Code Model is available.  The wizard knows to call this function
when it sees the param PREPROCESS_FUNCTION in VC7\VCAddClass\XXX.VSZ
oProj: Selected project
oObject: Select object (in this case it will be the project)
******************************************************************************/
function CanAddClass(oProj, oObject)
{
    try
    {
        var bIsDeviceProject = IsDeviceProject(oProj);
        wizard.AddSymbol("IS_DEVICE_PROJECT", bIsDeviceProject);

        var oCM = oProj.CodeModel;
        return true;
    }
    catch (e)
    {
        L_CanAddClass_Text = "Code Model not available, cannot add class.";
        wizard.ReportError(L_CanAddClass_Text);
        return false;
    }
}

/******************************************************************************
Description: This function is called by the wizard to verify if the VC
Code Model is available.  The wizard knows to call this function
when it sees the param PREPROCESS_FUNCTION in VC7\VCAddClass\XXX.VSZ
oProj: Selected project
oObject: Select object (in this case it will be the project)
******************************************************************************/
function CanAddATLConsumerClass(oProj, oObject)
{
    return CanAddClass(oProj, oObject);
}

/******************************************************************************
Description: This function is called by the wizard to verify if the project
is compatible with the Code Wizard that's about to be run.  The
wizard knows to call this function when it sees the param
PREPROCESS_FUNCTION in VC7\VCAddClass\XXX.VSZ
oProj: Selected project
oObject: Select object (in this case it will be the project)
******************************************************************************/
function CanAddATLClass(oProj, oObject)
{
    try
    {
        var bIsDeviceProject = IsDeviceProject(oProj);
        wizard.AddSymbol("IS_DEVICE_PROJECT", bIsDeviceProject);

        if (IsATLProject(oProj))
        {
            return true;
        }
        if (!IsMFCProject(oProj, true))
        {
            var L_CanAddATLClass_Text = "ATL classes can only be added to MFC EXE and MFC Regular DLL projects or projects with full ATL support.";
            wizard.ReportError(L_CanAddATLClass_Text);
            return false;
        }

        return AddATLSupportToProject(oProj);
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Checks if a file exists.  If it does, prompts the user if
they want to merge what's about to be added to the existing
file.
strFileName: File name to check.  If unique, function returns true.
bCheckIfMidlHeader: Displays an error if filename is used by MIDL
bSetMergeFlag: Whether to set the MERGE_FILE symbol
******************************************************************************/
function CanUseFileName(strFileName, bCheckIfMidlHeader, bCannotExist, bSetMergeFlag)
{
    try
    {
        if (bCheckIfMidlHeader)
        {
            var config = window.external.ProjectObject.Object.Configurations(1);
            var oMidlTool = config.Tools("VCMidlTool");
            if (oMidlTool)
            {
                var strHeadFile = config.Evaluate(oMidlTool.HeaderFileName);
                if (strHeadFile.toLowerCase() == strFileName.toLowerCase())
                {
                    var L_CanUseFileName_Text = " is generated by MIDL and cannot be used.";
                    window.external.ReportError(strFileName + L_CanUseFileName_Text);
                    return false;
                }
            }
        }
        if (window.external.DoesFileExist(strFileName))
        {
            if (bCannotExist)
            {
                var L_CanUseFileName2_Text = " is already in use.";
                window.external.ReportError(strFileName + L_CanUseFileName2_Text);
                return false;
            }
            else
            {
                var L_CanUseFileName3_Text = " already exists. Do you want to merge this class into the same file?";
                var bRet = window.external.YesNoAlert(strFileName + L_CanUseFileName3_Text);
                if (bRet && bSetMergeFlag)
                    window.external.AddSymbol("MERGE_FILE", true);
                return bRet;
            }
        }
        else
            return true;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: adds the "include" statement to strInFile, including the header
where strCodeElemName is implemented, if such a header found in the oProj
oProj: the context project
strCodeElemName: the name (full name) of the code element for which we're searching
the definition header
strInFile: the file that will include the definition header, if found
******************************************************************************/
function IncludeCodeElementDeclaration(oProj, strCodeElemName, strInFile)
{
    try
    {
        var CodeElement = oProj.CodeModel.CodeTypeFromFullName(strCodeElemName);
        if (CodeElement == null)
        {
            var L_IncludeCodeElementDeclaration1_Text = "Unable to find code element: ";
            throw new Error(1, L_IncludeCodeElementDeclaration1_Text + strCodeElemName);
        }
        var strCodeElemFile = CodeElement.Location(vsCMWhereDefault);
        if (strCodeElemFile == null)
        {
            var L_IncludeCodeElementDeclaration2_Text = "Unable to find code element file for code element: ";
            throw new Error(1, L_IncludeCodeElementDeclaration2_Text + strCodeElemName);
        }

        //convert CE file path to case sensitive
        var oFSO = new ActiveXObject("Scripting.FileSystemObject");
        try
        {
            var oFile = oFSO.GetFile(strCodeElemFile);
            if (oFile)
                strCodeElemFile = oFile.Path;
        }
        catch (e) {}

        var nIndex = strCodeElemFile.lastIndexOf("\\");
        var strCodeElemFilePath = strCodeElemFile.substr(0, nIndex);
        if (nIndex != 0)
            strCodeElemFile = strCodeElemFile.substr(nIndex + 1);

        var strInFileName = strInFile;
        nIndex = strInFileName.lastIndexOf("\\");
        var strInFilePath = strInFileName.substr(0, nIndex);
        if (nIndex != 0)
            strInFileName = strInFileName.substr(nIndex + 1);

        strInFileName = strInFileName.toUpperCase();
        var strUpperCEFile = strCodeElemFile.toUpperCase();

        //only if strCodeElemName defined in different header; do not include it recursively to the same file
        if (strInFileName != strUpperCEFile)
        {
            var dotIndex = strUpperCEFile.lastIndexOf('.');
            if (dotIndex >= 0 && strUpperCEFile.charAt(dotIndex + 1) == 'H') //only if strUpperCEFile is a valid C++ header file
            {
                var strIncludeText;
                if (strCodeElemFilePath.length == 0 || strCodeElemFilePath.toLowerCase() == strInFilePath.toLowerCase())
                {
                    //we don't know the path of strCodeElemFile (for example if it comes from ATLMFC headers)
                    //or it lies in the same directory as strInFileName
                    strIncludeText = '"' + strCodeElemFile + '"';
                }
                else
                {
                    var bIsInPath = false;
                    // check if CodeElemFile is in the project include paths
                    var oConfig = oProj.Object.Configurations(1);
                    var VCCLTool = oConfig.Tools("VCCLCompilerTool");
                    var strsIncludePaths = VCCLTool.FullIncludePath.split(";");
                    var strUpperCEFilePath = strCodeElemFilePath.toUpperCase();
                    for (var i = 0; !bIsInPath && (i < strsIncludePaths.length); i++)
                    {
                        bIsInPath = strsIncludePaths[i].toUpperCase() == strUpperCEFilePath;
                    }
                    if (bIsInPath)
                    {
                        // if it is, it doesn't need to have the full path
                        strIncludeText = '"' + strCodeElemFile + '"';
                    }
                    else
                    {
                        //if strInFileName and strCodeElemFile files live in different paths, we add the fullpath of strCodeElemFile to #include
                        strIncludeText = '"' + strCodeElemFilePath + '\\' + strCodeElemFile + '"';
                    }
                }
                if (!DoesIncludeExist(oProj, strIncludeText, strInFile))
                    oProj.CodeModel.AddInclude(strIncludeText, strInFile, vsCMAddPositionEnd); //include header where code element class is defined
            }
        }
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: This function is called by the wizard to add the _MERGE_PROXYSTUB
symbol if needed
oProj: Selected project object
******************************************************************************/
function SetMergeProxySymbol(oProj)
{
    try
    {
        // if merging proxy/stub, proj will have dlldatax.c
        if (!oProj.Object.Files("dlldatax.c"))
            return;

        // add _MERGE_PROXYSTUB if necessary
        var oConfigs = oProj.Object.Configurations;
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
        {
            var oConfig = oConfigs(nCntr);
            var oCLTool = oConfig.Tools("VCCLCompilerTool");
            if (-1 == oCLTool.PreprocessorDefinitions.indexOf("_MERGE_PROXYSTUB"))
                oCLTool.PreprocessorDefinitions += ";_MERGE_PROXYSTUB";
        }
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Strip spaces from a string
strin: The string (is in/out param)
******************************************************************************/
function TrimStr(str)
{
    var nLength = str.length;
    var nStartIndex = 0;
    var nEndIndex = nLength - 1;

    while (nStartIndex < nLength && (str.charAt(nStartIndex) == ' ' || str.charAt(nStartIndex) == '\t'))
        nStartIndex++;

    while (nEndIndex > nStartIndex && (str.charAt(nEndIndex) == ' ' || str.charAt(nEndIndex) == '\t'))
        nEndIndex--;

    return str.substring(nStartIndex, nEndIndex + 1);
}
/******************************************************************************
Description: Open the file that contains the TextPoint, then move the cursor to the
TextPoint.
oTP: The reference to TextPoint
******************************************************************************/
function ShowTextPoint(oTP)
{
    try
    {
        if (!oTP.Parent.Parent.ProjectItem.IsOpen)
        {
            var window = oTP.Parent.Parent.ProjectItem.Open();
            if (window != null)
                window.visible = true;
        }
        var oSel = null;
        oSel = oTP.Parent.Selection;
        oSel.MoveToPoint(oTP);
        oSel.ActivePoint.TryToShow(vsPaneShowHow.vsPaneShowAsIs);
    }
    catch (e)
    {
        throw (e);
    }
}

function ValidateFileNameAndEnsureInProject(strFileName, fileType)
{
    try
    {
        if (!window.external.dte.VCLanguageManager.ValidateFileName(strFileName, fileType))
        {
            // Not a valid file name.
            return false;
        }

        if (!window.external.DoesFileExist(strFileName))
        {
            // File doesn't already exist.
            return true;
        }

        if (window.external.ProjectObject.Object.Files.Item(strFileName))
        {
            // Already in the project.
            return true;
        }

        if (!window.external.ProjectObject.Object.CanAddFile(strFileName))
        {
            // Can not be added to the project.
            return false;
        }

        var L_ConfirmAddFileToProject_Text = "File '";
        L_ConfirmAddFileToProject_Text = L_ConfirmAddFileToProject_Text + strFileName;
        var L_ConfirmAddFileToProject1_Text = "' is not in the project.  Would you like to add this file to the project?";
        L_ConfirmAddFileToProject_Text = L_ConfirmAddFileToProject_Text + L_ConfirmAddFileToProject1_Text;

        if (!window.external.YesNoAlert(L_ConfirmAddFileToProject_Text))
        {
            // User chose not to add to project.
            return false;
        }

        if (window.external.ProjectObject.Object.AddFile(strFileName))
        {
            // Successfully added the file to the project.
            return true;
        }
    }
    catch (e)
    {
        throw (e);
    }

    return false;
}

/******************************************************************************
Description: Returns a boolean indicating whether this is a Win32 configuration or not
oConfig: VCConfiguration object
******************************************************************************/
function IsPlatformWin32(oConfig)
{
    return oConfig.Platform.Name == "Win32";
}


function GetPlatformDefine(oConfig)
{
    if (oConfig.Platform.Name == "Win32")
        return "WIN32;";
    else
        return "";
}

/******************************************************************************
Description: Finds the project item in the project that corresponds to the
file name specified.
oFilter: The Project or Filter to start searching from
strFile: The file to search for
******************************************************************************/

function FindProjectItem(oProject, strFile)
{
    try
    {
        var oFile = oProject.Object.Files.Item(strFile);

        if (oFile)
        {
            return oFile.Object;
        }
    }
    catch (e)
    {
        throw (e);
    }

    return null;
}

//addds the unsigned in front of strTypeName and returns the result
// if its type (or basic type) is "char" and bDefaultUnsigned==true (can be used to adjust the type of params
// in the method implementation when midl setting /char unsigned is in effect)
function AddUnsignedToChar(strTypeName, bDefaultUnsigned)
{
    if (!bEmbeddedIDL && bDefaultUnsigned)
    {
        if (strTypeName.length > 4)
        {
            var starSpace = strTypeName.charAt(4);
            if (starSpace != '*' && starSpace != ' ' && starSpace != '[')
                return strTypeName;
        }
        var type4chars = strTypeName.substr(0, 4);
        if (type4chars == "char")
            return "unsigned " + strTypeName; //add "unsigned "  in front of "char"
    }
    return strTypeName;
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForWinForm(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Data.dll");
    oProjObject.AddAssemblyReference("System.Drawing.dll");
    oProjObject.AddAssemblyReference("System.Windows.Forms.dll");
    oProjObject.AddAssemblyReference("System.XML.dll");
}


/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForApp(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Data.dll");
    oProjObject.AddAssemblyReference("System.XML.dll");
}


/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForClass(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Data.dll");
    oProjObject.AddAssemblyReference("System.XML.dll");
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForComponent(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForInstaller(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Management.dll");
    oProjObject.AddAssemblyReference("System.Configuration.Install.dll");
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForControl(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Data.dll");
    oProjObject.AddAssemblyReference("System.Drawing.dll");
    oProjObject.AddAssemblyReference("System.Windows.Forms.dll");
    oProjObject.AddAssemblyReference("System.XML.dll");
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForWebService(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Data.dll");
    oProjObject.AddAssemblyReference("System.Web.dll");
    oProjObject.AddAssemblyReference("System.Web.Services.dll");
    oProjObject.AddAssemblyReference("System.XML.dll");
    oProjObject.AddAssemblyReference("System.EnterpriseServices.dll");
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForWebForm(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Drawing.dll");
    oProjObject.AddAssemblyReference("System.Data.dll");
    oProjObject.AddAssemblyReference("System.Web.dll");
    oProjObject.AddAssemblyReference("System.XML.dll");
}

/******************************************************************************
Description:
oProj: Project object
******************************************************************************/
function AddReferencesForWebControl(oProj)
{
    var oProjObject = oProj.Object;
    oProjObject.AddAssemblyReference("System.dll");
    oProjObject.AddAssemblyReference("System.Drawing.dll");
    oProjObject.AddAssemblyReference("System.Web.dll");
}

//Checks to see if the file strItemName.strSuffix exists.  If it does, it appends a number onto strItemName to make it unique

function GetFileNameUnique(strItemName, strSuffix)
{
    try
    {
        var nCnt = 0;
        var strFileCheck = strItemName + strSuffix;
        while (wizard.DoesFileExist(strFileCheck))
        {
            nCnt++;
            strFileCheck = strItemName + nCnt.toString() + strSuffix;
        }

        return strFileCheck;
    }
    catch (e)
    {
        throw e;
    }
}


function GetClassNameUnique(oProject, strNamespaceName, strClassName)
{
    var counter = 1;

    var strUniqueName = strClassName;

    var Namespaces = oProject.CodeModel.Namespaces;
    for (nNamespaces = 1; nNamespaces <= Namespaces.Count; nNamespaces++)
    {
        var oNamespace = Namespaces.Item(nNamespaces)
        if (oNamespace.Name != strNamespaceName)
            continue;
        while (oNamespace.Classes.Find(strUniqueName))
        {
            strUniqueName = strClassName + counter.toString();
            counter++;
        }
    }
    return strUniqueName;
}

function GetFileNameUniqueCPPandH(strName)
{
    var strUniqueName = strName;
    var counter = 1;
    while (wizard.DoesFileExist(strUniqueName + ".cpp") || wizard.DoesFileExist(strUniqueName + ".h"))
    {
        strUniqueName = strName + counter.toString();
        counter++;
    }
    return strUniqueName;
}

function getParent(obj)
{
    var parent = obj.Collection.parent;
    //
    // is obj a project ?
    //
    if (parent == dte)
    {
        //
        // is obj a sub-project ?
        //
        if (obj.ParentProjectItem)
        {
            parent = obj.ParentProjectItem.Collection.parent;
        }
        else
        {
            //
            // obj is a top-level project
            //
            parent = null;
        }
    }

    return parent;
}


function AddDefaultManagedConfigs(proj)
{
    try
    {
        var oConfigs = proj.Object.Configurations;
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
        {
            var config = oConfigs(nCntr);
            var bDebug = false;
            if (-1 != config.Name.indexOf("Debug"))
                bDebug = true;

            // these two lines are necessary to initialize the project system,
            // do not remove them!
            var outdir = config.OutputDirectory;
            var intdir = config.IntermediateDirectory;

            config.ManagedExtensions = 1;
            config.CharacterSet = charSetUNICODE;

            var CLTool = config.Tools("VCCLCompilerTool");
            CLTool.WarningLevel = WarningLevel_3;
            if (bDebug)
            {
                CLTool.Optimization = optimizeDisabled;
            }
            CLTool.PreprocessorDefinitions = GetPlatformDefine(config) + (bDebug ? "_DEBUG" : "NDEBUG");

            var LinkTool = config.Tools("VCLinkerTool");
            LinkTool.AdditionalDependencies = "$(NoInherit)";

            if (bDebug)
            {
                LinkTool.LinkIncremental = linkIncrementalYes;
            }
            else
                LinkTool.LinkIncremental = linkIncrementalNo;
        } //for
        proj.Object.keyword = "ManagedCProj";

    }
    catch (e)
    {
        throw e;
    }
}

function AddManagedConfigsForDLL(proj, strProjectName)
{
    try
    {
        AddDefaultManagedConfigs(proj);
        proj.Object.RootNamespace = CreateIdentifierSafeName(strProjectName);
        var oConfigs = proj.Object.Configurations;
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
            AddManagedConfigForDLL(proj.Object.Configurations(nCntr), strProjectName);
        StampWindowsTargetPlatformVersion(proj);
    }
    catch (e)
    {
        throw e;
    }
}

function AddManagedConfigForDLL(config, strProjectName)
{
    try
    {
        config.ConfigurationType = typeDynamicLibrary;
        var bDebug = false;
        if (-1 != config.Name.indexOf("Debug"))
            bDebug = true;

        var CLTool = config.Tools("VCCLCompilerTool");
        if (bDebug)
        {
            CLTool.Optimization = optimizeDisabled;
        }
    }
    catch (e)
    {
        throw e;
    }

}

function AddManagedConfigsForEXE(proj, strProjectName, subSystem)
{
    try
    {
        AddDefaultManagedConfigs(proj);
        proj.Object.RootNamespace = CreateIdentifierSafeName(strProjectName);

        var oConfigs = proj.Object.Configurations;
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
        {
            var config = oConfigs(nCntr);
            AddManagedConfigForEXE(config, strProjectName, subSystem);
        }

        StampWindowsTargetPlatformVersion(proj);
    }
    catch (e)
    {
        throw e;
    }
}

function AddManagedConfigForEXE(config, strProjectName, subSystem)
{
    try
    {
        config.ConfigurationType = typeApplication;
        var LinkTool = config.Tools("VCLinkerTool");

        if (subSystem)
        {
            LinkTool.SubSystem = subSystem;
        }

        var bDebug = false;
        if (-1 != config.Name.indexOf("Debug"))
            bDebug = true;

        var CLTool = config.Tools("VCCLCompilerTool");
        if (bDebug)
        {
            CLTool.Optimization = optimizeDisabled;
        }
    }
    catch (e)
    {
        throw e;
    }
}

function AddManagedConfigsForWeb(proj, strProjectName, ext, strAddress)
{
    try
    {
        AddDefaultManagedConfigs(proj);
        proj.Object.RootNamespace = CreateIdentifierSafeName(strProjectName);
        
        var oConfigs = proj.Object.Configurations;
        for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
        {
            var config = oConfigs(nCntr);
            AddManagedConfigForWeb(config, strProjectName, ext, strAddress);
        }

        StampWindowsTargetPlatformVersion(proj);
    }
    catch (e)
    {
        throw e;
    }
}


function AddManagedConfigForWeb(config, strProjectName, ext, strAddress)
{
    try
    {
        var solutionName = config.Evaluate("$(SolutionName)");
        if (ext) config.DebugSettings.HttpUrl = strAddress + "\/" + solutionName + "\/" + strProjectName + ext;
        config.ConfigurationType = typeDynamicLibrary;
        var LinkTool = config.Tools("VCLinkerTool");
        config.Tools("VCWebDeploymentTool").ExcludedFromBuild = false;
        config.DebugSettings.DebuggerFlavor = eWebSvcDebugger;

        var bDebug = false;
        if (-1 != config.Name.indexOf("Debug"))
            bDebug = true;

        var CLTool = config.Tools("VCCLCompilerTool");
        if (bDebug)
        {
            CLTool.Optimization = optimizeDisabled;
        }
    }
    catch (e)
    {
        throw e;
    }
}

function CanUseDrive(strProjectPath)
{
    try
    {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var d = fso.GetDrive(fso.GetDriveName(strProjectPath));
        if (d.DriveType == 3)               // Network drive type
        {
            var L_CanUseDrive_Text = " The Project location is not fully trusted by the CLR runtime. ";
            var L_CanUseDrive1_Text = "This is usually because the location is a network ";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive1_Text;
            var L_CanUseDrive2_Text = "share or mapped to a network share on a remote ";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive2_Text;
            var L_CanUseDrive3_Text = "machine. If the output path is under the project ";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive3_Text;
            var L_CanUseDrive4_Text = "location, your code will not execute as fully trusted, ";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive4_Text;
            var L_CanUseDrive5_Text = "and you may receive unexpected security exceptions. ";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive5_Text;
            var L_CanUseDrive6_Text = "Click OK to ignore and continue. Click CANCEL to ";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive6_Text;
            var L_CanUseDrive7_Text = "choose a different project location";
            L_CanUseDrive_Text = L_CanUseDrive_Text + L_CanUseDrive7_Text;

            return (wizard.OkCancelAlert(L_CanUseDrive_Text)) ? true : false;

        }
        return true;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Given the LC string (example LCID "1033" for english US)
it transforms it into 4 digit hex representation with leading 0
if necessary (example "0409" for english US). Format used in RC files.
Note that prefix "0x" is not added
******************************************************************************/
function LocaleTo4HexDigit(strLocale)
{
    var nlc = new Number(strLocale);
    var strLoc = nlc.toString(16);
    if (strLoc.length == 3)
        return "0" + strLoc;
    return strLoc;
}

/******************************************************************************
Description: Given the LC string (example LCID "1033" for english US)
it sets all the required symbols to generate the RC file of given language
******************************************************************************/
function SetLocaleForResources(strLCID)
{
    //window.external.ReportError("Adding LCID: " + strLCID);
    var strLang = window.external.GetLangFromLCID(strLCID); 
    
    window.external.AddSymbol("LANGUAGE", strLang); 
    window.external.AddSymbol("LCID", strLCID);     
    window.external.AddSymbol("HEX_LCID", LocaleTo4HexDigit(strLCID));
    window.external.AddSymbol("PRIMARY_LANG_ID", window.external.GetPrimaryLangIdFromLCID(strLCID));
    window.external.AddSymbol("SUB_LANG_ID", window.external.GetSubLangIdFromLCID(strLCID));
    window.external.AddSymbol("LANG_SUFFIX", window.external.GetLangAbbrevFromLCID(strLCID));
    window.external.AddSymbol("CODE_PAGE", window.external.GetCodePageFromLCID(strLCID));   
    
    window.external.AddSymbol("MFC_RC_INCLUDE_PREFIX",
        (strLCID == "1033" ? ""
                    : "l." + window.external.GetLangAbbrevFromLCID(strLCID) + "\\\\"));
}

/******************************************************************************
Description: Sets the carset on all configurations in a project
******************************************************************************/
function SetAllConfigCharset(oProj, fUnicode)
{
    var oConfigs = oProj.Object.Configurations;
    for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++) {
        var config = oConfigs(nCntr);
        config.CharacterSet = (fUnicode) ? charSetUNICODE : charSetMBCS;
    }
}

function SetFileLevelClr(oFileItem)
{
    // Enable CLR and disable that's incompatible with it.
    var oConfigs = oFileItem.Object.FileConfigurations;
    for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
    {
        var config = oConfigs(nCntr);
        var CLTool = config.Tool;
        if (CLTool.ToolKind != "VCCLCompilerTool") return;
        CLTool.CompileAsManaged = 1;
        CLTool.UsePrecompiledHeader = 0;
        CLTool.MinimalRebuild = false;
        CLTool.BasicRuntimeChecks = 0;
        CLTool.DebugInformationFormat = 3;
        CLTool.ExceptionHandling = 2;
    }
}

function IsMCppProject(selProj)
{
    var i, j;
    try
    {
        if (selProj.Object.Configurations(1).ManagedExtensions != managedNotSet)
            return true;

        var files = selProj.Object.Files;
        for (i = 1; i <= selProj.Object.Files.Count; ++i) {
            var file = files(i);
            for (j = 1; j < file.FileConfigurations.Count; ++j) {
                var config = file.FileConfigurations(j);
                var CLTool = config.Tool;
                if ((CLTool == null) || (CLTool.ToolKind != "VCCLCompilerTool")) continue;
                if (CLTool.CompileAsManaged != managedNotSet)
                    return true;
            }
        }

        var L_No_MCPP_Projects_Text = "You are adding a CLR component to a native project. Your project will be converted to have Common Language Runtime support. Do you wish to continue?";
        if (wizard.YesNoAlert(L_No_MCPP_Projects_Text))
        {
            // We have to disable edit & continue on the project level.
            for (i = 1; i <= selProj.Object.Configurations.Count; ++i)
            {
                var config = selProj.Object.Configurations(i);
                var CLTool = config.Tools("VCCLCompilerTool");
                if (CLTool.DebugInformationFormat == 4)
                    CLTool.DebugInformationFormat = 3;
            }
            return true;
        }
        return false;
    }
    catch (e)
    {
        return false;
    }
}

function IsNativeProject(selProj)
{
    try
    {
        return selProj.Object.Configurations(1).ManagedExtensions == managedNotSet;
    }
    catch (e)
    {
        return false;
    }
}

function IsDllProject(selProj)
{
    try
    {
        var nTotal = selProj.Object.Configurations.Count;
        for (var nCntr = 1; nCntr <= nTotal; nCntr++)
        {
            if (typeDynamicLibrary != selProj.Object.Configurations(nCntr).ConfigurationType)
            {
                return false;
            }
        }
        return true;
    }
    catch (e)
    {
        return false;
    }
}

/******************************************************************************
Description: Given the LC string (example LCID "1033" for english US)
it transforms it into 4 digit hex representation with leading 0
if necessary (example "0409" for english US). Format used in RC files.
Note that prefix "0x" is not added
******************************************************************************/
function LocaleTo4HexDigit(strLocale)
{
    var nlc = new Number(strLocale);
    var strLoc = nlc.toString(16);
    if (strLoc.length == 3)
        return "0" + strLoc;
    return strLoc;
}
/******************************************************************************
Description: When constructing a class name based on project or other user input,
Warn user (MessageBox) if the generated class name is a reserved name, and
add one digit to the name to avoid the reserved name.
Ex: User names the project "Atl" --> C+Atl+Module is a reserved name -->
Warning MessageBox plus generated name is CAtl1Module.
strPrefix: The first part of class name (Ex: project name - Atl).
strPostfix: The second part of class name (Ex: Module).
******************************************************************************/
function ConstructClassName(strPrefix, strPostfix)
{
    var strCandidate;
    strCandidate = "C" + strPrefix + strPostfix;
    for (var i = 1; i <= 10; i++)
    {
        var bValid = (window.external.dte.VCLanguageManager.ValidateIdentifier(strCandidate) &&
            !window.external.dte.VCLanguageManager.IsReservedName(strCandidate));
        if (!bValid)
            window.external.ReportError();
        else
            break;
        strCandidate = "C" + strPrefix + i.toString() + strPostfix;
    }
    return strCandidate;
}

/******************************************************************************
Device specific functions
******************************************************************************/

/******************************************************************************
Description: Ensures that there are device platforms in the project, if
none are found, adds the standard platforms
******************************************************************************/
function EnsureDevicePlatforms()
{
    var checkedPlatforms = wizard.FindSymbol("CHECKED_PLATFORMS");
    wizard.AddSymbol("MULTIPLE_PLATFORM", false);
    if (checkedPlatforms)
    {
        if (checkedPlatforms.length > 1)
        {
            wizard.AddSymbol("MULTIPLE_PLATFORM", true);
        }
    }
    else
    {
        checkedPlatforms = new Array();
        checkedPlatforms.push("Pocket PC 2003");
        wizard.AddSymbol("CHECKED_PLATFORMS", checkedPlatforms);
    }

    var nativePlatforms = wizard.FindSymbol("NATIVE_PLATFORMS");
    if (nativePlatforms)
    {
        // nothing to do in this case
    }
    else
    {
        // must add at least one platform, PPC 2003
        nativePlatforms = new Array();
        nativePlatforms.push("Pocket PC 2003 (ARMV4)");
        wizard.AddSymbol("NATIVE_PLATFORMS", nativePlatforms);
    }
    return true;
}

/******************************************************************************
Description: Creates a Device C++ project file in a temp location  with
the platforms the project should target pre-populated
Returns: a string representing a generated project file with the device
platforms pre-populated.
******************************************************************************/
function CreateDeviceProjectFile()
{
    try
    {
        var oFSO;
        oFSO = new ActiveXObject("Scripting.FileSystemObject");
        var TemporaryFolder = 2;
        var oFolder = oFSO.GetSpecialFolder(TemporaryFolder);
        var strProjFile = oFSO.GetAbsolutePathName(oFolder.Path) + "\\" + "defaultVSD.vcxproj";
        var oStream = oFSO.CreateTextFile(strProjFile, true);

        EnsureDevicePlatforms();

        var nativePlatforms = wizard.FindSymbol("NATIVE_PLATFORMS");


        
        oStream.WriteLine("<Project DefaultTargets=\"Build\" ToolsVersion=\"4.0\" xmlns=\"http://schemas.microsoft.com/developer/msbuild/2003\">");
            oStream.WriteLine("  <ItemGroup>");
            for (var i = 0; i < nativePlatforms.length; i++)
        {
                var strBasePlatformName = GetBasePlatformName(nativePlatforms[i]);
                var strInstrSet = GetInstructionSet(nativePlatforms[i]);
                oStream.WriteLine("    <ProjectConfiguration Include=\"Debug(" + strInstrSet + ")|" + strBasePlatformName + "\">");
                oStream.WriteLine("      <Configuration>Debug(" + strInstrSet + ")</Configuration>");
                oStream.WriteLine("      <Platform>" + strBasePlatformName + "</Platform>");
                oStream.WriteLine("    </ProjectConfiguration>");
                oStream.WriteLine("    <ProjectConfiguration Include=\"Release(" + strInstrSet + ")|" + strBasePlatformName + "\">");
                oStream.WriteLine("      <Configuration>Release(" + strInstrSet + ")</Configuration>");
                oStream.WriteLine("      <Platform>" + strBasePlatformName + "</Platform>");
                oStream.WriteLine("    </ProjectConfiguration>");
            }
            oStream.WriteLine("  </ItemGroup>");
            oStream.WriteLine("  <PropertyGroup Label=\"Globals\" >");
            oStream.WriteLine("    <SmartDeviceProject>true</SmartDeviceProject>");
            oStream.WriteLine("    <ConfigurationType>Application</ConfigurationType>");
            oStream.WriteLine("    <TargetName>App</TargetName>");
            oStream.WriteLine("  </PropertyGroup>");
            oStream.WriteLine("  <Import Project=\"$(VCTargetsPath)\Microsoft.CPP.Default.settings\" />");
    
            for (var i = 0; i < nativePlatforms.length; i++)
        {
                var strBasePlatformName = GetBasePlatformName(nativePlatforms[i]);
                var strInstrSet = GetInstructionSet(nativePlatforms[i]);
                oStream.WriteLine("  <PropertyGroup Label=\"Configuration\" >");
                oStream.WriteLine("    <Configuration  Condition=\"'$(Configuration)' == ''\">Debug(" + strInstrSet + ")</Configuration>");
                oStream.WriteLine("    <Platform Condition=\"'$(Platform)' == ''\">" + strBasePlatformName + "</Platform>");
                oStream.WriteLine("    <Architecture Condition=\"'$(Configuration)' == 'Debug(" + strInstrSet + ")'\">" + strInstrSet + "</Architecture>");           
                oStream.WriteLine("  </PropertyGroup>");
                oStream.WriteLine("  <PropertyGroup Label=\"Configuration\" >");
                oStream.WriteLine("    <Configuration  Condition=\"'$(Configuration)' == ''\">Release(" + strInstrSet + ")</Configuration>");
                oStream.WriteLine("    <Platform Condition=\"'$(Platform)' == ''\">" + strBasePlatformName + "</Platform>");
                oStream.WriteLine("    <Architecture Condition=\"'$(Configuration)' == 'Release(" + strInstrSet + ")'\">" + strInstrSet + "</Architecture>");                      
                oStream.WriteLine("  </PropertyGroup>");
            }

            oStream.WriteLine("  <Import Project=\"$(VCTargetsPath)\Microsoft.Cpp.props\" />");
            oStream.WriteLine("  <ItemDefinitionGroup></ItemDefinitionGroup>");
            oStream.WriteLine("  <ItemGroup></ItemGroup>");
            oStream.WriteLine("  <Import Project=\"$(VCTargetsPath)\Microsoft.CPP.targets\" />");
            oStream.WriteLine("</Project>");
            oStream.Close();
        return strProjFile;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Creates a Device C++ project
strProjectName: Project Name
strProjectPath: The path that the project will be created in

Note: this is identical to CreateProject *except* that we call
CreateDeviceProjectFile rather than looking for a template path
******************************************************************************/
function CreateDeviceProject(strProjectName, strProjectPath)
{
    try
    {
        var strProjTemplate = CreateDeviceProjectFile();
        var Solution = dte.Solution;
        var strSolutionName = "";
        if (wizard.FindSymbol("CLOSE_SOLUTION"))
        {
            Solution.Close();
            strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
            if (strSolutionName.length)
            {
                var strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
                Solution.Create(strSolutionPath, strSolutionName);
            }
        }
        var strProjectNameWithExt = strProjectName + ".vcxproj";
        var oTarget = wizard.FindSymbol("TARGET");
        var oProj;
        if (wizard.FindSymbol("WIZARD_TYPE") == vsWizardAddSubProject)  // vsWizardAddSubProject
        {
            var prjItem = oTarget.AddFromTemplate(strProjTemplate, strProjectPath + "\\" + strProjectNameWithExt);
            oProj = prjItem.SubProject;
        }
        else
        {
            oProj = oTarget.AddFromTemplate(strProjTemplate, strProjectPath, strProjectNameWithExt);
        }
        var fxtarget = wizard.FindSymbol("TARGET_FRAMEWORK_VERSION");
        if (fxtarget != null && fxtarget != "")
        {
            var iTargetFrameworkVersion = ConvertVersionToInteger(fxtarget);
            if (iTargetFrameworkVersion)
                oProj.Object.TargetFrameworkVersion = iTargetFrameworkVersion;
        }

        return oProj;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Makes sure that the connection string does not contain any unicode characters
if the project is attributed
*******************************************************************************/
function IsValidConnectionString(isAttributed) {
    return true;
}

/******************************************************************************
Description: After a device project is created, we will want to disable .rc
files in configurations they are not valid for. Device projects may have
multiple resource files, each of which supports a different platform or
set of platforms
Magic resource file names:
<projectname>ppc.rc     = pocket pc, POCKETPC2003_UI_MODEL
<projectname>sp.rc      = smartphone, SMARTPHONE2003_UI_MODEL
<projectname>ayg.rc     = aygshell, AYGSHELL_UI_MODEL
<projectname>.rc        = standard ce shell, STANDARDSHELL_UI_MODEL <-- default
selProj: the project object
******************************************************************************/
function SetDeviceResourceConfigurations(selProj)
{
    var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
    var projectName = wizard.FindSymbol("PROJECT_NAME");
    projectName = projectName.toLowerCase();
    for (var fileIdx = 1; fileIdx <= selProj.Files.Count; fileIdx++)
    {
        var file = selProj.Files.Item(fileIdx);
        if (file.Extension.toLowerCase() == ".rc")
        {
            for (var fileCfgIdx = 1; fileCfgIdx <= file.FileConfigurations.Count; fileCfgIdx++)
            {
                var fileCfg = file.FileConfigurations.Item(fileCfgIdx);
                var cfgName = fileCfg.Name;
                var fileName = file.Name.toLowerCase();
                var cfg;

                for (var i = 1; i <= selProj.Configurations.Count; i++)
                {
                    if (selProj.Configurations.Item(i).Name == cfgName)
                    {
                        // this condition will ALWAYS be hit eventually, and
                        // cfg will always be assigned by the end of the loop
                        cfg = selProj.Configurations.Item(i);
                        break;
                    }
                }

                var platformName = cfg.Platform.Name;
                var symbol = ProjWiz.GetBaseNativePlatformProperty(platformName + " (ARMV4I)", "UISymbol");
                var CLTool = cfg.Tools("VCCLCompilerTool");
                CLTool.PreprocessorDefinitions += ";" + symbol;
                if (symbol == "POCKETPC2003_UI_MODEL")
                {
                    if (fileName == projectName + "ppc.rc")
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = false;
                    }
                    else
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = true;
                    }
                }
                else if (symbol == "SMARTPHONE2003_UI_MODEL")
                {
                    if (fileName == projectName + "sp.rc")
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = false;
                    }
                    else
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = true;
                    }
                }
                else if (symbol == "AYGSHELL_UI_MODEL")
                {
                    if (fileName == projectName + "ayg.rc")
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = false;
                    }
                    else
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = true;
                    }
                }
                else if (symbol == "STANDARDSHELL_UI_MODEL")
                {
                    if (fileName == projectName + ".rc")
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = false;
                    }
                    else
                    {
                        file.FileConfigurations.Item(fileCfgIdx).ExcludedFromBuild = true;
                    }
                }
                else
                {
                    //wizard.ReportError("Error: unknown UI model [" + symbol + "]");
                }
            }
        }
    }
    return true;
}


/******************************************************************************
Description: Sets the symbols used in processing the templates.inf file and
associated resource files.
******************************************************************************/
function SetDeviceSymbolsForPlatforms()
{
    var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
    var checkedPlatforms = wizard.FindSymbol("CHECKED_PLATFORMS");
    var nativePlatforms = wizard.FindSymbol("NATIVE_PLATFORMS");

    AddDeviceSymbols(false)

    for (var i = 0; i < nativePlatforms.length; i++)
    {
        var prop;
        try
        {
            prop = ProjWiz.GetBaseNativePlatformProperty(nativePlatforms[i], "UISymbol");
        }
        catch (e)
        {
            prop = "STANDARDSHELL_UI_MODEL";
        }
        wizard.AddSymbol(prop, true);
    }
    return true;
}

/******************************************************************************
Description: Sets linker options for device projects (e.g. /machine:<type>
option).
******************************************************************************/
function SetDeviceLinkLibSettings(config)
{
    var platform = config.Platform;
    var strInstSet = GetInstructionSet(config.ConfigurationName);
    var lTool = config.Tools("VCLinkerTool");
    if (!lTool)
    {
        lTool = config.Tools("VCLibrarianTool");
    }
    if (lTool)
    {
        lTool.GenerateManifest = false;
        lTool.AdditionalOptions += " /subsystem:windowsce," + ProjWiz.GetNativePlatformMajorVersion(config.Platform.Name) + "." + ProjWiz.GetNativePlatformMinorVersion(config.Platform.Name);
        lTool.TargetMachine = machineTHUMB;
        if (strInstSet == "ARMV4")
        {
            lTool.AdditionalOptions += " /machine:ARM";
        }
        else if (strInstSet == "MIPSII")
        {
            lTool.AdditionalOptions += " /machine:MIPS";
        }
        else if (strInstSet == "MIPSII_FP")
        {
            lTool.AdditionalOptions += " /machine:MIPS";
        }
        else if (strInstSet == "MIPSIV")
        {
            lTool.AdditionalOptions += " /machine:MIPSFPU";
        }
        else if (strInstSet == "MIPSIV_FP")
        {
            lTool.AdditionalOptions += " /machine:MIPSFPU";
        }
    }

}

/******************************************************************************
Description: Retrieves the resource file associated with the config passed in
config: VCConfiguration object
******************************************************************************/
function GetDeviceResourceFileForConfig(config)
{
    var cfgName = config.Name;
    var platform = config.Platform;
    var proj = config.Project;
    var bFound = false;
    var resourceFileName;

    for (var i = 1; i <= proj.Files.Count; i++)
    {
        var file = proj.Files.Item(i);

        var fileExt = file.Extension.toLowerCase();
        if (fileExt == ".rc")
        {
            for (var k = 1; k <= file.FileConfigurations.Count; k++)
            {
                fileCfg = file.FileConfigurations.Item(k);
                if (fileCfg.Name == cfgName)
                {
                    if (!fileCfg.ExcludedFromBuild)
                    {
                        resourceFileName = file.FullPath;
                        bFound = true;
                    }
                    break;
                }
            }
        }
        if (bFound)
        {
            break;
        }
    }
    return resourceFileName;
}

/******************************************************************************
Description: Returns the names of the RC files of a device project
oProj: selected device project
bFullPath: Flag indicating whether to return the full path name.
******************************************************************************/
function GetDeviceProjectResourceFiles(oProj, oFiles, nCntr, bFullPath)
{
    try
    {
        var strFileName = "";
        var oFile = oFiles(nCntr);
        if (-1 != oFile.Name.toUpperCase().indexOf("." + "RC"))
        {
            // we don't need have rc2 files involved.
            if (-1 == oFile.Name.toUpperCase().indexOf("." + "RC2"))
            {
                strFileName = oFile.Name;

                // remove path
                if (-1 != strFileName.indexOf("\\"))
                    strFileName = strFileName.substr(strFileName.lastIndexOf("\\") + 1);

                if (bFullPath)
                    strFileName = oFiles(strFileName).FullPath;
            }
        }

        return strFileName;
    }
    catch (e)
    {
        throw e;
    }
}

/******************************************************************************
Description: Retrieves the ui symbol associated with the config passed in
config: VCConfiguration object
******************************************************************************/
function GetDeviceSymbolForConfig(config)
{
    var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
    var platform = config.Platform;
    var platName = platform.Name;
    var symbol;
    try
    {
        symbol = ProjWiz.GetBaseNativePlatformProperty(platName + " (ARMV4I)", "UISymbol");
    }
    catch (e)
    {
        symbol = "STANDARDSHELL_UI_MODEL";
    }
    return symbol;
}

/******************************************************************************
Description: Adds the four UI model symbols associated with device projects, helper
******************************************************************************/
function AddDeviceSymbols(bValue)
{
    wizard.AddSymbol("POCKETPC2003_UI_MODEL", bValue);
    wizard.AddSymbol("SMARTPHONE2003_UI_MODEL", bValue);
    wizard.AddSymbol("AYGSHELL_UI_MODEL", bValue);
    wizard.AddSymbol("STANDARDSHELL_UI_MODEL", bValue);
}

/******************************************************************************
Description: method to determine if any device platforms are present in a VC
project
selProj: VC project
******************************************************************************/
function IsDeviceProject(selProj)
{
    var bDevice = false;
    var ProjWiz;
    try {
        ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
    }
    catch (e)
    {
        return false;
    }
    try
    {
        var configs = selProj.Object.Configurations;
        var devicePlatforms = new Array();
        var installedDeviceSDKCount = ProjWiz.GetBaseNativePlatforms();
        for (var i = 0; i < installedDeviceSDKCount; i++)
        {
            var deviceSDKName = ProjWiz.GetBaseNativePlatform(i);
            var installedDeviceSDKInstructionSetCount = ProjWiz.GetInstructionSetsForBaseNativePlatform(deviceSDKName);
            for (var k = 0; k < installedDeviceSDKInstructionSetCount; k++)
            {
                devicePlatforms.push(ProjWiz.GetNativePlatformName(deviceSDKName, ProjWiz.GetInstructionSetForBaseNativePlatform(deviceSDKName, k)));
            }
        }
        for (var i = 1; i <= configs.Count; i++)
        {
            var platName = configs.Item(i).Platform.Name;
            for (var k = 0; k < devicePlatforms.length; k++)
            {
                if (platName == devicePlatforms[k])
                {
                    bDevice = true;
                    break;
                }
            }
            if (bDevice)
            {
                break;
            }
        }
    }
    catch (e)
    {
        throw e;
    }
    return bDevice;
}

/******************************************************************************
Description: method to determine if EVERY platform in a project supports DCOM.
A side effect of this method is setting the SUPPORT_[NON_]DCOM symbols.
******************************************************************************/
function SetDCOMDeviceProjectSymbols()
{
    var bDCOM = true;
    var checkedPlatforms = wizard.FindSymbol("CHECKED_PLATFORMS");
    wizard.AddSymbol("SUPPORT_DCOM", false);
    wizard.AddSymbol("SUPPORT_NON_DCOM", false);
    for (var i = 0; i < checkedPlatforms.length; i++)
    {
        if (ProjWiz.GetBaseNativePlatformSupportsDCOM(checkedPlatforms[i]))
        {
            wizard.AddSymbol("SUPPORT_DCOM", true);
        }
        else
        {
            wizard.AddSymbol("SUPPORT_NON_DCOM", true);
        }
    }
    return bDCOM;
}

/******************************************************************************
Description: method that given a platform name of the format:
<Name> (<Instruction Set>)
will return <Instruction Set> as a string
strPlatformName: platform name
******************************************************************************/
function GetInstructionSet(strPlatformName)
{
    var strInstructionSet = "ARMV4I";
    var sIndex = strPlatformName.lastIndexOf("(");
    var eIndex = strPlatformName.lastIndexOf(")");

    if ((sIndex != -1) && (eIndex != -1))
    {
        strInstructionSet = strPlatformName.substr(sIndex + 1, eIndex - sIndex - 1);
    }

    return strInstructionSet;
}

/******************************************************************************
Description: method that given a platform name of the format:
<Name> (<Instruction Set>)
will return <Name> as a string
strPlatformName: platform name
******************************************************************************/
function GetBasePlatformName(strPlatformName)
{
    var strBasePlatform = strPlatformName;
    var sIndex = strPlatformName.lastIndexOf("(");
    if (sIndex != -1)
    {
        strBasePlatform = strPlatformName.substr(0, sIndex - 1);
    }
    return strBasePlatform;
}

/******************************************************************************
Description: method to determine if at least one platform in a project supports
DCOM
strSrcFile: selProj: VC project
******************************************************************************/
function ProjectContainsDCOMPlatform(selProj)
{
    var bDCOM = false;
    try
    {
        if (!IsDeviceProject(selProj))
        {
            // if this isn't a device project, DCOM will be supported.
            bDCOM = true;
        }
        else
        {
            var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
            for (var i = 1; i <= selProj.Object.Platforms.Count; i++)
            {
                var strBasePlatform = GetBasePlatformName(selProj.Object.Platforms(i).Name);
                if (ProjWiz.GetBaseNativePlatformSupportsDCOM(strBasePlatform))
                {
                    bDCOM = true;
                    break;
                }
            }
        }
    }
    catch (e) { }
    return bDCOM;
}

/******************************************************************************
Description: method to determine if at least one platform in a project doesn't
support DCOM
strSrcFile: selProj: VC project
******************************************************************************/
function ProjectContainsNonDCOMPlatform(selProj)
{
    var bNonDCOM = false;
    try
    {
        if (!IsDeviceProject(selProj))
        {
            // if this isn't a device project, DCOM will be supported.
            bNonDCOM = false;
        }
        else
        {
            var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
            for (var i = 1; i <= selProj.Object.Platforms.Count; i++)
            {
                var strBasePlatform = GetBasePlatformName(selProj.Object.Platforms(i).Name);
                if (!(ProjWiz.GetBaseNativePlatformSupportsDCOM(strBasePlatform)))
                {
                    bNonDCOM = true;
                    break;
                }
            }
        }
    }
    catch (e) { }
    return bNonDCOM;
}

/******************************************************************************
Description: method to create a temporary resource file from an original with [!if <BLAH>] directives
project. Used because code wizards generally dump the entire resource file into the project resource
file.
strSrcFile: source resource file to render to a temporary file
Returns: filename of temp file
******************************************************************************/
function RenderToTemporaryResourceFile(strSrcFile)
{
    var TemporaryFolder = 2;
    var oFSO = new ActiveXObject("Scripting.FileSystemObject");
    var oFolder = oFSO.GetSpecialFolder(TemporaryFolder);
    var strTempFile = oFSO.GetAbsolutePathName(oFolder.Path) + "\\" + oFSO.GetTempName() + ".rc";
    var strTempFileContents = wizard.RenderTemplateToString(strSrcFile);
    // We try ASCII first and retry in UNICODE if it fails
    var oStream;
    
    oStream = oFSO.CreateTextFile(strTempFile, true, true /*UNICODE*/);
    oStream.Write(strTempFileContents); 
    oStream.Close();
    
    return strTempFile;
}

/******************************************************************************
End of device specific functions
******************************************************************************/

/******************************************************************************
The next two functions (getNextPage, getPrevPage) are only run in the context of
the next/previous buttons, it is unknown if they will work in any other context.
******************************************************************************/

/******************************************************************************
Description: method to determine the page the "Next" button should link to, given current
settings (i.e. find the next non-disabled page).
Returns: name (including .htm) of next page
******************************************************************************/
function getNextPage()
{
    var count = 0;
    var tab_array = new Array();
    var hit, previousLink, nextLink;
    var findTableTags = window.document.all.tags('TABLE');
    var nextPage;

    //SET PREVIOUS/NEXT BUTTON LINKS********************************
    // *************************************************************
    for (var i = 0; i < findTableTags.length; i++)
    {
        if (findTableTags[i].className.toLowerCase() == 'three')
        {
            var findTheDiv = findTableTags[i].all.tags('DIV');
            for (var ii = 0; ii < findTheDiv.length; ii++)
            {
                if ((findTheDiv[ii].className.toLowerCase() == 'link') || (findTheDiv[ii].className.toLowerCase() == 'linkselected'))
                {
                    count++;
                    if (findTheDiv[ii].className.toLowerCase() == 'linkselected')
                    {
                        hit = ii;
                        previous = ii - 1;
                        next = ii + 1;
                    }
                    var findTheSpan = findTheDiv[ii].all.tags('SPAN');
                    for (var iii = 0; iii < findTheSpan.length; iii++)
                    {
                        if ((findTheSpan[iii].className.toLowerCase() != 'vertline1') && (findTheSpan[iii].className.toLowerCase() != 'horiline1'))
                        {
                            if (!findTheSpan[iii].disabled && findTheSpan[iii].className.toLowerCase() == "activelink")
                            {
                                tab_array[ii] = findTheSpan[iii].id;
                            }
                            else
                            {
                                tab_array[ii] = null;
                            }
                        }
                    }
                }
            }
        }
    }
    nextPage = hit + 1;
    while (nextPage < tab_array.length)
    {
        if (tab_array[nextPage])
        {
            break;
        }
        else
        {
            nextPage++;
        }
    }
    if (nextPage >= tab_array.length)
        nextPage = hit;
    return tab_array[nextPage] + ".htm";
}


/******************************************************************************
Description: method to determine the page the "Previous" button should link to, given current
settings (i.e. find the previous non-disabled page).
Returns: name (including .htm) of previous page
******************************************************************************/
function getPrevPage()
{
    var count = 0;
    var tab_array = new Array();
    var hit, previousLink, nextLink;
    var findTableTags = window.document.all.tags('TABLE');
    var prevPage;

    //SET PREVIOUS/NEXT BUTTON LINKS********************************
    // *************************************************************
    for (var i = 0; i < findTableTags.length; i++)
    {
        if (findTableTags[i].className.toLowerCase() == 'three')
        {
            var findTheDiv = findTableTags[i].all.tags('DIV');
            for (var ii = 0; ii < findTheDiv.length; ii++)
            {
                if ((findTheDiv[ii].className.toLowerCase() == 'link') || (findTheDiv[ii].className.toLowerCase() == 'linkselected'))
                {
                    count++;
                    if (findTheDiv[ii].className.toLowerCase() == 'linkselected')
                    {
                        hit = ii;
                        previous = ii - 1;
                        next = ii + 1;
                    }
                    var findTheSpan = findTheDiv[ii].all.tags('SPAN');
                    for (var iii = 0; iii < findTheSpan.length; iii++)
                    {
                        if ((findTheSpan[iii].className.toLowerCase() != 'vertline1') && (findTheSpan[iii].className.toLowerCase() != 'horiline1'))
                        {
                            if (!findTheSpan[iii].isDisabled && findTheSpan[iii].className.toLowerCase() == "activelink")
                            {
                                tab_array[ii] = findTheSpan[iii].id;
                            }
                            else
                            {
                                tab_array[ii] = null;
                            }
                        }
                    }
                }
            }
        }
    }
    prevPage = hit - 1;
    while (prevPage >= 0)
    {
        if (tab_array[prevPage])
        {
            break;
        }
        else
        {
            prevPage--;
        }
    }
    if (prevPage >= tab_array.length)
        prevPage = hit;
    return tab_array[prevPage] + ".htm";
}

function initItems()
{
    try
    {
        if (PreviousBtn != null) return;
    }
    catch (e)
    {
    }

    var findTableTags = window.document.all.tags('TABLE');

    // Look over all tables and see if any has the class 'three'.
    // That's the class that this behavior was originally attached to.
    // If we don't find such a table, don't add the buttons
    var FoundTable = false;
    var i;
    for (i = 0; i < findTableTags.length; i++)
    {
        if (findTableTags[i].className.toLowerCase() == 'three')
        {
            FoundTable = true;
            break;
        }
    }
    if (!FoundTable) return;


    var count = 0;
    var hit, previous, next;
    var tab_array = new Array();
    var previousLink, nextLink;



    //FIND THE SELECTED TAB AND DYNAMICALLY COLOR THE BACKGROUND****
    // *************************************************************
    for (var i = 0; i < findTableTags.length; i++)
    {
        if ((findTableTags[i].className.toLowerCase() == 'linktextselected') || (findTableTags[i].className.toLowerCase() == 'linktextselectedindent'))
        {
            var findTheSpan = findTableTags[i].all.tags('SPAN');

            for (var ii = 0; ii < findTheSpan.length; ii++)
            {
                findTheSpan[ii].style.padding = "4px";
                findTheSpan[ii].style.left = "-2px";
                findTheSpan[ii].style.backgroundColor = "InactiveBorder";
                findTheSpan[ii].style.lineHeight = "1.7em";
            }
        }
    }
    // *************************************************************


    //SET PREVIOUS/NEXT BUTTON LINKS********************************
    // *************************************************************
    for (var i = 0; i < findTableTags.length; i++)
    {
        if (findTableTags[i].className.toLowerCase() == 'three')
        {
            var findTheDiv = findTableTags[i].all.tags('DIV');
            for (var ii = 0; ii < findTheDiv.length; ii++)
            {
                if ((findTheDiv[ii].className.toLowerCase() == 'link') || (findTheDiv[ii].className.toLowerCase() == 'linkselected'))
                {
                    count++;
                    if (findTheDiv[ii].className.toLowerCase() == 'linkselected')
                    {
                        hit = ii;
                        previous = ii - 1;
                        next = ii + 1;
                    }
                }
            }
        }
    }
    if (previous > -1)
    {
        previousLink = "onClick=\"bValidating = true; try { if (!ValidateInput()) { bValidating = false; return; } } catch(e) { }; Next(document, getPrevPage());\"";
    }
    else
    {
        previousLink = "DISABLED";
    }

    if (next < count)
    {
        nextLink = "onClick=\"bValidating = true; try { if (!ValidateInput()) { bValidating = false; return; } } catch(e) { }; Next(document, getNextPage());\"";
    }
    else
    {
        nextLink = "DISABLED";
    }
    // *************************************************************



    //ADD PREVIOUS AND NEXT BUTTONS - 4 ROWS TO TABLE***************
    // *************************************************************
    var L_NextButtin_Text = "Next &gt;";
    var L_PrevButtin_Text = "&lt; Previous";

    var targetRow = findTableTags[findTableTags.length - 2].rows[2];
    targetRow.insertCell(2).innerHTML = "<BUTTON CLASS='BUTTONS' ID='PreviousBtn'" + previousLink + ">" + L_PrevButtin_Text + "</BUTTON>";
    targetRow.cells[2].vAlign = "MIDDLE";
    targetRow.cells[2].height = "23";
    targetRow.cells[2].width = "75";
    targetRow.insertCell(3).innerHTML = "&nbsp; ";
    targetRow.cells[3].vAlign = "MIDDLE";
    targetRow.cells[3].height = "23";
    targetRow.cells[3].width = "4";
    targetRow.insertCell(4).innerHTML = "<BUTTON CLASS='BUTTONS' ID='NextBtn' " + nextLink + ">" + L_NextButtin_Text + "</BUTTON>";
    targetRow.cells[4].vAlign = "MIDDLE";
    targetRow.cells[4].height = "23";
    targetRow.cells[4].width = "75";
    targetRow.insertCell(5).innerHTML = "&nbsp; ";
    targetRow.cells[5].vAlign = "MIDDLE";
    targetRow.cells[5].height = "23";
    targetRow.cells[5].width = "4";
    // *************************************************************



    //FIX BUTTON TABLE'S ROW SPANS**********************************
    // *************************************************************
    var targetRow1 = findTableTags[findTableTags.length - 2].rows[0];
    targetRow1.cells[0].colSpan = "12";

    var targetRow2 = findTableTags[findTableTags.length - 2].rows[1];
    targetRow2.cells[0].colSpan = "12";

    var targetRow3 = findTableTags[findTableTags.length - 2].rows[3];
    targetRow3.cells[0].colSpan = "12";
    // *************************************************************



    //FIND THE TABLES DRAWING HORIZONTAL RULES AND DELETE GRAY LINE*
    // *************************************************************
    var findTDTags = window.document.all.tags('TD');

    for (var i = 0; i < findTDTags.length; i++)
    {
        if (findTDTags[i].className.toLowerCase() == 'rule')
        {
            var findTheTD = findTDTags[i].all.tags('TD');

            for (var ii = 0; ii < findTheTD.length; ii++)
            {
                findTheTD[ii].style.backgroundColor = "Window";
            }
        }
    }
    // *************************************************************
}

/******************************************************************************
Description: Returns the MIDL tool configuration for the project IDL.
Tries to detect the file-level IDL setting and if none is found, returns
the project level MIDL configuration object.
Returns: name (including .htm) of previous page
******************************************************************************/
function GetIDLConfig(selProj, ReportIfNotFound)
{
    // Default to report if no IDL has been found
    if (ReportIfNotFound == null) ReportIfNotFound = true;

    var strProjectIDL = CreateASCIIName(wizard.FindSymbol("PROJECT_NAME")) + ".idl";
    strProjectIDL = strProjectIDL.toUpperCase();

    var oConfigs = selProj.Object.Configurations;
    var idlFileObj = selProj.Object.Files(strProjectIDL);
    if (idlFileObj == null)
    {
        var oFiles = selProj.Object.Files;
        for (var nCntr = 1; nCntr <= oFiles.Count; nCntr++)
        {
            var strName = oFiles(nCntr).Name.toUpperCase();
            if (strName.substr(strName.length - 4, strName.length) == ".IDL")
            {
                idlFileObj = oFiles(nCntr);
                break;
            }
        }
    }
    var config = oConfigs(1);
    var oFileConfig = null;
    if (idlFileObj == null)
    {
        var oWizard;
        try
        {
            oWizard = wizard;
        }
        catch (e)
        {
            oWizard = window.external;
        }

        if (ReportIfNotFound && !IsAttributedProject(oWizard))
        {
            var L_strIdlNotFoundError_Text = "No IDL file (" + strProjectIDL + ") has been found found in your project. The Wizard will be unable to make IDL updates.";
            wizard.ReportError(L_strIdlNotFoundError_Text);
        }
    }
    else
    {
        oFileConfig = idlFileObj.FileConfigurations.Item(config.Name);
    }
    var MidlTool;
    if (oFileConfig != null)
    {
        MidlTool = oFileConfig.Tool;
    }
    else
    {
        MidlTool = config.Tools("VCMidlTool");
    }
    return MidlTool;
}

function SetResDlgFont(IsSD)
{
    var oWizard;
    try
    {
        oWizard = wizard;
    }
    catch (e)
    {
        oWizard = window.external;
    }

    if (IsSD == null) IsSD = false; // default to non-SmartDev. apps
    var strCodePage = oWizard.FindSymbol("CODE_PAGE");
    var strFontName = null;
    var iFontSize = null;
    var strSDFontName = null;
    var iSDFontSize = null;
    switch (strCodePage) {
        case "932": // Japansese Shift-JIS
            strFontName = "MS UI Gothic";
            iFontSize = 9;
            strSDFontName = "MS UI Gothic";
            iSDFontSize = 9;
            break;
        case "950": // Traditional Chinese Big-5
            strFontName = "????";
            iFontSize = 9;
            strSDFontName = "MS Sans Serif";
            iSDFontSize = 9;
            break;
        case "936": // Simplified Chinese GBK
        case "949": // Korean
            strFontName = "MS Shell Dlg";
            iFontSize = 9;
            strSDFontName = "MS Sans Serif";
            iSDFontSize = 9;
            break;
        default:
            strFontName = "MS Shell Dlg";
            iFontSize = 8;
            strSDFontName = "MS Sans Serif";
            iSDFontSize = 8;
            break;
    }
    if (IsSD) {
        strFontName = strSDFontName;
        iFontSize = iSDFontSize;
    }

    wizard.AddSymbol("DLG_FONT_SIZE", iFontSize);
    wizard.AddSymbol("DLG_FONT_NAME", strFontName);
    wizard.AddSymbol("SD_DLG_FONT_SIZE", iSDFontSize);
    wizard.AddSymbol("SD_DLG_FONT_NAME", strSDFontName);
}

// Returns the location for the custom wizard files, and at the same time makes sure that the folder exists
function GetCustomWizardLocation() {
    var oWizard;
    try
    {
        oWizard = wizard;
    }
    catch (e)
    {
        oWizard = window.external;
    }

    var strCustomWizardFolder = oWizard.FindSymbol("__VISUAL_STUDIO_HOME_DIR") + "\\Wizards";
    var oFSO = new ActiveXObject("Scripting.FileSystemObject");
    if (!oFSO.FolderExists(strCustomWizardFolder))
    {
        oFSO.CreateFolder(strCustomWizardFolder);
    }
    return strCustomWizardFolder;
}

function PrepCodeWizard(oProj, title)
{
    var L_Caption_Text = "Microsoft Visual Studio";
    var L_Prep1_Text = "Please wait while \"";
    var L_Prep2_Text = "\" prepares to start. Click Cancel to end \"";
    var L_Prep3_Text = "\".";
    try
    {
        oProj.CodeModel.SynchronizeCancellable(L_Caption_Text,
            L_Prep1_Text + title + L_Prep2_Text + title + L_Prep3_Text);
        return true;
    }
    catch (e)
    {
        return false;
    }
}

// We might be invoked in a scenario (not inside IE) when this fails. Just ignore...
try
{
    initItems();
}
catch (e)
{
}

// SIG // Begin signature block
// SIG // MIIjnQYJKoZIhvcNAQcCoIIjjjCCI4oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // +5gcUWJ4pdo3WNed8sXFx8vIkjJqtxZyjfCSlll32OGg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHbVLWd28MKz4wLTlBFh
// SIG // TtbD8LyeLv1hH6IApfRwQfqvMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAYgSR9JWkT0GN+XUOSY17svCOcGIJS2V61Lgf
// SIG // P4SnJ0O8qd53SXhvDDARVjaXRQa5Qmt9xWys4qZUG2FS
// SIG // mfJ55oAXf/HcZz3KJ5XlZuf93zzvJfD5mxVZqaGjHUBf
// SIG // RNKNLXw4PZYnm8+9NRBydvXrryGLSdqvCQvcYU9cKGi5
// SIG // 1HYjuLze7w+IHj1jRpoC/lqKV+3PRLxkZKWIUTxpkR/R
// SIG // MR6XGFnIDkba6d+yUOssB0KjC7kQyYkqIRDi3zDsRrX8
// SIG // xB2AjTd61ZROhAml/j9usB1ax+/yvWt4xWgNkHixaVTv
// SIG // t8RcLEqSOWeN/wT54KblogVm99wTp4E/w+DBdEM5uqGC
// SIG // Ev4wghL6BgorBgEEAYI3AwMBMYIS6jCCEuYGCSqGSIb3
// SIG // DQEHAqCCEtcwghLTAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCAVlJWx
// SIG // DPJ/df4LbopDemgANxWMT58iNnnnm2WL0kFA6gIGYRUO
// SIG // tuAvGBMyMDIxMDgxMzE3MDczNi4zNDlaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkQw
// SIG // ODItNEJGRC1FRUJBMSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIOTTCCBPkwggPhoAMC
// SIG // AQICEzMAAAFBr39Sl1zy3EUAAAAAAUEwDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjAxMDE1MTcyODI3WhcNMjIwMTEyMTcyODI3WjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpEMDgyLTRC
// SIG // RkQtRUVCQTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCASIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggEPADCCAQoCggEBAPIqy6i9vHWpfjyVJlCTsL2J/7Dg
// SIG // hM0M2co/eF2xT7UYQ4T42oL7yjr9RoDKDrl75KTN7jOR
// SIG // Ou78jgj8aoUwM6uwJN85BF1wb+yaDPF5tMeVHJwJKVIh
// SIG // KNHsnEZem52CAdypWVt7s+CXNr9hVdCghpC676nyj/Ff
// SIG // 4toVcjfOeDno1qcfMBlGszOAmFFaMHIBA3O+jmPl2uFt
// SIG // uwwmSZtn/aJeAY0i/m9i/0/J/yxBpJ2lMcEkEzdS0Arf
// SIG // rgQwgEnelUEeQiyyVbejAS9FtTZWlsRACcJSHcgZ0tYo
// SIG // S70YNY3PylGXtLERXQ934Sq4z2nN4aMtNOxb6+hqNFie
// SIG // Ka9qyXUCAwEAAaOCARswggEXMB0GA1UdDgQWBBQtKD8s
// SIG // bi6Q/UVwa/XPDTtBBRLGxDAfBgNVHSMEGDAWgBTVYzpc
// SIG // ijGQ80N7fEYbxTNoWoVtVTBWBgNVHR8ETzBNMEugSaBH
// SIG // hkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9NaWNUaW1TdGFQQ0FfMjAxMC0wNy0w
// SIG // MS5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAC
// SIG // hj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2Nl
// SIG // cnRzL01pY1RpbVN0YVBDQV8yMDEwLTA3LTAxLmNydDAM
// SIG // BgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MA0GCSqGSIb3DQEBCwUAA4IBAQBSet8ifdgoagoKXsQ+
// SIG // PKJL4hrguIpDbL5sJQknrdbBabyRMyyQfHExeM+KkE8/
// SIG // ALELXHsOpgFZkAmA7vX+XntdcV49S8B2LGRp0rPzn0bp
// SIG // dVSpmOdTkKaryuTvwreH7NCG5c6PHsjiycoE5Pe2l1QO
// SIG // FM6vBm5S+y0OV4sAGOOOjDgC5zVxaPyqvbb84qcGNWHE
// SIG // Z/55TEPm/djoiy5h1TItsAFDkYihb2gH2Fo4UHftqhyz
// SIG // LHaTZbsAW1nuxReQAbA6NB0TjFsgoMXS0N76q9wzEh92
// SIG // ViooqxbL1iZnIX2TxkTm8KrM70lzxZjwWfaPnq/uFKC1
// SIG // fudBlp50JMux1YC5MIIGcTCCBFmgAwIBAgIKYQmBKgAA
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
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkQw
// SIG // ODItNEJGRC1FRUJBMSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoD
// SIG // FQCq5b8ptQqriKEHK853C75A9VqVA6CBgzCBgKR+MHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqGSIb3
// SIG // DQEBBQUAAgUA5MDerDAiGA8yMDIxMDgxMzIwMDYwNFoY
// SIG // DzIwMjEwODE0MjAwNjA0WjB3MD0GCisGAQQBhFkKBAEx
// SIG // LzAtMAoCBQDkwN6sAgEAMAoCAQACAgUFAgH/MAcCAQAC
// SIG // AhE8MAoCBQDkwjAsAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAVbFw4RykHM78
// SIG // u6XopjtLEggtV43GgahJpOxsiKMLci+Ric1oSFipTq8+
// SIG // 38p6SUvq++sTBXxc2d9+TLdDpfFpOaFFnJXbLvEvVlmp
// SIG // o3YTMDqOJFYeVtXqybjG3JPxJymYChdwx/orKt6mN+LR
// SIG // vGW6IhuYqk7IrSOEVekqPmNMn4QxggMNMIIDCQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AUGvf1KXXPLcRQAAAAABQTANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCA2ZWDi3QTEx8WooFcgdE8pOFHh
// SIG // vRz537UVFTvlWDay1DCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIFE/ATyM6nN0nnB0TyygbVtLzjp0/u/I
// SIG // WlqPl3MVXq3eMIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAFBr39Sl1zy3EUAAAAAAUEw
// SIG // IgQgdNbnDu03DoQtCULMdgLs/iE1kOvjqqO/2H6YanE3
// SIG // FlgwDQYJKoZIhvcNAQELBQAEggEAbRLGpIwTDn8cLIIA
// SIG // vpIODVpHDD1LK7vAqaZdxfFDYigeW3h5RZFhLv0vx8Yb
// SIG // mWb2VUfc/R148e0o34ET1aiKiHdSI4BDbtu54EqimLLg
// SIG // aJMY2A3SPr7xBc9BiOG6dwxgBdM2vUaRprtIi/l61WUX
// SIG // 3mOkrFHjOlDMh2hTuaW47veesQLo8/5XAQJ1lhFZvZ/Y
// SIG // N5RZCmweiNT+sePXaxS+SBx6Tgoe1qvy9ft94kMO2qR2
// SIG // rBOyhd+Mx0cobypejX/7oC+KyqJ97TiigmVZ1pF0iQQg
// SIG // c0cdYO+J/+QqgZGUF8JxlXoDmNL8eZdEle02PkspRLtp
// SIG // oFsIMup/LH+L24bnaw==
// SIG // End signature block
