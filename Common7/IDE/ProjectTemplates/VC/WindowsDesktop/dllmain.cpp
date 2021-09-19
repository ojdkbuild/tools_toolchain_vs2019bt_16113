// dllmain.cpp : $loctext_dllmaincomment1$
[!if PRE_COMPILED_HEADER]
#include "pch.h"
[!else]
#include "framework.h"
[!endif]

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}

