@echo off
title D^&D 3.5e Combat App Web Server
color 0E

echo ===================================================
echo   🏰 D^&D 3.5e Combat App Launcher 🏰
echo ===================================================
echo.
echo Starte Webserver ueber Windows PowerShell (Keine Installation noetig)...
echo.

:: Versuche den native PowerShell HTTP Server zu starten
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start_Server.ps1"
if %errorlevel% equ 0 goto end

echo.
echo PowerShell-Server fehlgeschlagen. 
echo Versuche Webserver mit Node.js (npx) zu starten...
call npx http-server . -p 8080 --no-dotfiles --no-cache
if %errorlevel% equ 0 goto end

echo.
echo Node.js nicht verfuegbar. 
echo Versuche Webserver mit Python zu starten...
start http://localhost:8080
call python -m http.server 8080
if %errorlevel% equ 0 goto end

echo.
echo [FEHLER] Weder PowerShell, Node.js noch Python konnten den Server starten!
echo Bitte wende dich an deinen DM oder stelle sicher, dass du auf Windows bist.
echo.
pause

:end
