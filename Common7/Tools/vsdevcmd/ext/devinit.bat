
set __VSCMD_script_err_count=0
if "%VSCMD_TEST%" NEQ "" goto :test
if "%VSCMD_ARG_CLEAN_ENV%" NEQ "" goto :clean_env

@REM ------------------------------------------------------------------------
:start

@REM Add devinit to PATH
set "__devinit_path=%VSINSTALLDIR%Common7\Tools\devinit\devinit.exe"

if NOT EXIST "%__devinit_path%" (
    @echo [ERROR:%~nx0] File not found : "%__devinit_path%"
    SET ERRORLEVEL=1
    exit /B 1
)

set "PATH=%VSINSTALLDIR%Common7\Tools\devinit;%PATH%"  

goto :end

@REM ------------------------------------------------------------------------
:test

setlocal

@REM -- Check for devinit.exe, which is installed to the installation specific path --
where devinit.exe
if "%ERRORLEVEL%" NEQ "0" (
    @echo [ERROR:%~nx0] 'where devinit.exe' failed
    set /A __VSCMD_script_err_count=__VSCMD_script_err_count+1
)

@REM exports the value of __VSCMD_script_err_count from the 'setlocal' region
endlocal & set __VSCMD_script_err_count=%__VSCMD_script_err_count%

goto :end

@REM ------------------------------------------------------------------------
:clean_env

@REM this script only modifies PATH, so additional clean-up is not required.

goto :end

@REM ------------------------------------------------------------------------
:end

@REM return value other than 0 if tests failed.
if "%__VSCMD_script_err_count%" NEQ "0" (
   set __VSCMD_script_err_count=
   exit /B 1
)

set __VSCMD_script_err_count=
exit /B 0
