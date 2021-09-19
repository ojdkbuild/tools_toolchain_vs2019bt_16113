[!if DLL_APP]
// $projectname$.cpp : $loctext_sourceheader1$
[!endif]
[!if WIN_APP]
// $projectname$.cpp : $loctext_sourceheader2$
[!endif]
[!if CONSOLE_APP]
// $projectname$.cpp : $loctext_sourceheader3$
[!endif]
[!if LIB_APP]
// $projectname$.cpp : $loctext_sourceheader4$
[!endif]
//

[!if PRE_COMPILED_HEADER]
#include "pch.h"
[!endif]
[!if !CONSOLE_APP || SUPPORT_MFC]
#include "framework.h"
[!endif]
[!if WIN_APP || SUPPORT_MFC]
#include "$projectname$.h"
[!else]
[!if DLL_APP && EXPORT_SYMBOLS]
#include "$projectname$.h"
[!else]
[!if CONSOLE_APP]
#include <iostream>
[!endif]
[!endif]
[!endif]

[!if WIN_APP]
#define MAX_LOADSTRING 100

// $loctext_sourcecomment1$
HINSTANCE hInst;                                // $loctext_sourcecomment2$
WCHAR szTitle[MAX_LOADSTRING];                  // $loctext_sourcecomment3$
WCHAR szWindowClass[MAX_LOADSTRING];            // $loctext_sourcecomment4$

// $loctext_sourcecomment5$
ATOM                MyRegisterClass(HINSTANCE hInstance);
BOOL                InitInstance(HINSTANCE, int);
LRESULT CALLBACK    WndProc(HWND, UINT, WPARAM, LPARAM);
INT_PTR CALLBACK    About(HWND, UINT, WPARAM, LPARAM);

int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
                     _In_opt_ HINSTANCE hPrevInstance,
                     _In_ LPWSTR    lpCmdLine,
                     _In_ int       nCmdShow)
{
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(lpCmdLine);

    // TODO: $loctext_sourcecomment6$

    // $loctext_sourcecomment7$
    LoadStringW(hInstance, IDS_APP_TITLE, szTitle, MAX_LOADSTRING);
    LoadStringW(hInstance, IDC_$safercprojectname$, szWindowClass, MAX_LOADSTRING);
    MyRegisterClass(hInstance);

    // $loctext_sourcecomment8$
    if (!InitInstance (hInstance, nCmdShow))
    {
        return FALSE;
    }

    HACCEL hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_$safercprojectname$));

    MSG msg;

    // $loctext_sourcecomment9$
    while (GetMessage(&msg, nullptr, 0, 0))
    {
        if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg))
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }

    return (int) msg.wParam;
}



//
//  $loctext_sourcecomment_function$ MyRegisterClass()
//
//  $loctext_sourcecomment_purpose$ $loctext_sourcecomment10$
//
ATOM MyRegisterClass(HINSTANCE hInstance)
{
    WNDCLASSEXW wcex;

    wcex.cbSize = sizeof(WNDCLASSEX);

    wcex.style          = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc    = WndProc;
    wcex.cbClsExtra     = 0;
    wcex.cbWndExtra     = 0;
    wcex.hInstance      = hInstance;
    wcex.hIcon          = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_$safercprojectname$));
    wcex.hCursor        = LoadCursor(nullptr, IDC_ARROW);
    wcex.hbrBackground  = (HBRUSH)(COLOR_WINDOW+1);
    wcex.lpszMenuName   = MAKEINTRESOURCEW(IDC_$safercprojectname$);
    wcex.lpszClassName  = szWindowClass;
    wcex.hIconSm        = LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_SMALL));

    return RegisterClassExW(&wcex);
}

//
//   $loctext_sourcecomment_function$ InitInstance(HINSTANCE, int)
//
//   $loctext_sourcecomment_purpose$ $loctext_sourcecomment12$
//
//   $loctext_sourcecomment_comments$
//
//        $loctext_sourcecomment13_line1$
//        $loctext_sourcecomment13_line2$
//
BOOL InitInstance(HINSTANCE hInstance, int nCmdShow)
{
   hInst = hInstance; // $loctext_sourcecomment14$

   HWND hWnd = CreateWindowW(szWindowClass, szTitle, WS_OVERLAPPEDWINDOW,
      CW_USEDEFAULT, 0, CW_USEDEFAULT, 0, nullptr, nullptr, hInstance, nullptr);

   if (!hWnd)
   {
      return FALSE;
   }

   ShowWindow(hWnd, nCmdShow);
   UpdateWindow(hWnd);

   return TRUE;
}

//
//  $loctext_sourcecomment_function$ WndProc(HWND, UINT, WPARAM, LPARAM)
//
//  $loctext_sourcecomment_purpose$ $loctext_sourcecomment15$
//
//  WM_COMMAND  - $loctext_sourcecomment16$
//  WM_PAINT    - $loctext_sourcecomment17$
//  WM_DESTROY  - $loctext_sourcecomment18$
//
//
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
    case WM_COMMAND:
        {
            int wmId = LOWORD(wParam);
            // $loctext_sourcecomment19$
            switch (wmId)
            {
            case IDM_ABOUT:
                DialogBox(hInst, MAKEINTRESOURCE(IDD_ABOUTBOX), hWnd, About);
                break;
            case IDM_EXIT:
                DestroyWindow(hWnd);
                break;
            default:
                return DefWindowProc(hWnd, message, wParam, lParam);
            }
        }
        break;
    case WM_PAINT:
        {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hWnd, &ps);
            // TODO: $loctext_sourcecomment20$
            EndPaint(hWnd, &ps);
        }
        break;
    case WM_DESTROY:
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProc(hWnd, message, wParam, lParam);
    }
    return 0;
}

// $loctext_sourcecomment21$
INT_PTR CALLBACK About(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam)
{
    UNREFERENCED_PARAMETER(lParam);
    switch (message)
    {
    case WM_INITDIALOG:
        return (INT_PTR)TRUE;

    case WM_COMMAND:
        if (LOWORD(wParam) == IDOK || LOWORD(wParam) == IDCANCEL)
        {
            EndDialog(hDlg, LOWORD(wParam));
            return (INT_PTR)TRUE;
        }
        break;
    }
    return (INT_PTR)FALSE;
}
[!endif]
[!if SUPPORT_MFC]
#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// $loctext_sourcecomment22$

CWinApp theApp;

using namespace std;

int main()
{
    int nRetCode = 0;

    HMODULE hModule = ::GetModuleHandle(nullptr);

    if (hModule != nullptr)
    {
        // $loctext_sourcecomment23$
        if (!AfxWinInit(hModule, nullptr, ::GetCommandLine(), 0))
        {
            // TODO: $loctext_sourcecomment24$
            wprintf(L"$loctext_sourcestring1$\n");
            nRetCode = 1;
        }
        else
        {
            // TODO: $loctext_sourcecomment24$
        }
    }
    else
    {
        // TODO: $loctext_sourcecomment25$
        wprintf(L"$loctext_sourcestring2$\n");
        nRetCode = 1;
    }

    return nRetCode;
}
[!else]
[!if DLL_APP]

[!if EXPORT_SYMBOLS]
// $loctext_sourcecomment26$
$safercprojectname$_API int n$safeprojectname$=0;

// $loctext_sourcecomment27$
$safercprojectname$_API int fn$safeprojectname$(void)
{
    return 0;
}

// $loctext_sourcecomment28$
C$safeprojectname$::C$safeprojectname$()
{
    return;
}
[!endif]
[!endif]
[!if CONSOLE_APP]
int main()
{
    std::cout << "Hello World!\n";
}

$loctext_comment_sourcecomment29$

$loctext_comment_sourcecomment30$
[!endif]
[!endif]
[!if LIB_APP]
// TODO: $loctext_sourcecomment31$
void fn$safeprojectname$()
{
}
[!endif]
