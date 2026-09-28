@echo off
if /i not "%~1"=="min" (
    start "" /min "%~f0" min
    exit
)

cd /d "%~dp0"
set "APP_PORT="

for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "foreach ($port in 3000..3000) { try { $response = Invoke-RestMethod -Uri ('http://127.0.0.1:{0}/api/health' -f $port) -TimeoutSec 1; if ($response.app -eq 'homecenterBackendIsActive24680') { Write-Output $port; exit 0 } } catch {} }; exit 1"`) do set "APP_PORT=%%P"

if defined APP_PORT (
    start "" chrome "http://localhost:%APP_PORT%/"
    exit
)

start "" chrome "http://localhost:3000/"
npm run dev