@echo off
setlocal enabledelayedexpansion

REM Create .env.local if it doesn't exist and populate it from the sample template
if not exist "%~dp0.env.local" (
    copy /Y "%~dp0app\src\Setup\Files\SampleENV.txt" "%~dp0.env.local" >nul
)

REM Copy Custom.js from Setup/Files to Backend/Themes if Backend/Themes does not exist
if not exist "%~dp0app\src\Backend\Themes\" (
    mkdir "%~dp0app\src\Backend\Themes\"
    copy /Y "%~dp0app\src\Setup\Files\Custom.js" "%~dp0app\src\Backend\Themes\" >nul
)

REM Create Themes\Presets in Styles\Themes if Themes\Presets does not exist
if not exist "%~dp0app\src\Styles\Themes\Presets\" (
    mkdir "%~dp0app\src\Styles\Themes\Presets\"
    xcopy "%~dp0app\src\Styles\Themes\Default\Template\*" "%~dp0app\src\Styles\Themes\Presets\Template\" /E /I /Y >nul
)

REM Create Custom folder in Themes\Custom if it does not exist
if not exist "%~dp0public\Themes\Custom\" (
    mkdir "%~dp0public\Themes\Custom\" >nul
)

endlocal
