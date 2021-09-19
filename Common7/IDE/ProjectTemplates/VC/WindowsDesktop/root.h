[!if DLL_APP]
// $loctext_dllexportcomment_line1$
// $loctext_dllexportcomment_line2$
// $loctext_dllexportcomment_line3$
// $loctext_dllexportcomment_line4$
// $loctext_dllexportcomment_line5$
// $loctext_dllexportcomment_line6$
#ifdef $safercprojectname$_EXPORTS
#define $safercprojectname$_API __declspec(dllexport)
#else
#define $safercprojectname$_API __declspec(dllimport)
#endif

// $loctext_dllclasscomment$
class $safercprojectname$_API C$safeprojectname$ {
public:
	C$safeprojectname$(void);
	// TODO: $loctext_dllclasstodocomment$
};

extern $safercprojectname$_API int n$safeprojectname$;

$safercprojectname$_API int fn$safeprojectname$(void);
[!else]
#pragma once

#include "resource.h"
[!endif]
