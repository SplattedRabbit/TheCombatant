@echo off
cd /d "%~dp0.."
title D^&D 3.5e Combat App Dev Launcher (Build ^& Server)
color 0B

echo ===================================================
echo   🏰 D^&D 3.5e Combat App Dev Launcher 🏰
echo ===================================================
echo.
echo [1/2] Baue die React-Anwendung neu (npm run build)...
echo.

call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ [FEHLER] Der Build-Prozess ist fehlgeschlagen!
    echo Der Server wird nicht gestartet, um keine fehlerhafte Version auszuliefern.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Starte den lokalen Webserver (Start_Server.bat)...
echo.
call "%~dp0Start_Server.bat"
