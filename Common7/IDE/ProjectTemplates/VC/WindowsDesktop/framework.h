[!if !PRE_COMPILED_HEADER]
// $loctext_nonpchdescription_line1$
// $loctext_nonpchdescription_line2$
//

[!endif]
#pragma once

[!if WIN_APP || SUPPORT_MFC]
#include "targetver.h"
[!endif]
[!if !CONSOLE_APP]
#define WIN32_LEAN_AND_MEAN             // $loctext_win32macrocomment$
[!else]
#include <stdio.h>
#include <tchar.h>
[!endif]
[!if SUPPORT_MFC]
#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS      // $loctext_atlcstringmacrocomment$
#define _AFX_NO_MFC_CONTROLS_IN_DIALOGS         // $loctext_nomfccontrolsmacrocomment$

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN            // $loctext_vcextraleanmacrocomment$
#endif

#include <afx.h>
#include <afxwin.h>         // $loctext_coremfcheadercomment$
[!if !LIB_APP]
#include <afxext.h>         // $loctext_mfcextensionsheadercomment$
#ifndef _AFX_NO_OLE_SUPPORT
#include <afxdtctl.h>           // $loctext_mfcieheadercomment$
#endif
#ifndef _AFX_NO_AFXCMN_SUPPORT
#include <afxcmn.h>                     // $loctext_mfcwindowscommonheadercomment$
#endif // _AFX_NO_AFXCMN_SUPPORT

#include <iostream>
[!endif]
[!endif]
[!if DLL_APP || WIN_APP]
// $loctext_windowsheaderscomment$
#include <windows.h>
[!endif]
[!if WIN_APP]
// $loctext_crtheaderscomment$
#include <stdlib.h>
#include <malloc.h>
#include <memory.h>
#include <tchar.h>
[!endif]
