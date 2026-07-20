@echo off
setlocal EnableDelayedExpansion

REM Create a blank .env.local if it doesn't exist
if not exist "%~dp0.env.local" (
    type nul > "%~dp0.env.local"
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

REM Obtain database information
set /p "P_Host=Host (ex: localhost): "
set /p "P_Port=Port (ex: 3306): "
set /p "P_Data=Database: "
set /p "P_User=Username: "
set /p "P_Pass=Password: "

REM Write the env values into .env.local
(
    echo Home_HOST=!P_Host!
    echo Home_PORT=!P_Port!
    echo Home_DATA=!P_Data!
    echo Home_USER=!P_User!
    echo Home_PASS=!P_Pass!
) > "%~dp0.env.local"

node "%~dp0app\src\Setup\Tables.js" "!P_Host!" "!P_Port!" "!P_Data!" "!P_User!" "!P_Pass!"
endlocal