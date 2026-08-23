@echo off
cd /d "%~dp0"
title The Combatant - Dev Server
color 0B

echo ===================================================
echo   ⚔️  The Combatant - D^&D 3.5e Dev Server  ⚔️
echo ===================================================
echo.
echo Starte modernen Vite-Server (TypeScript, HMR, Cloud-Auth)...
echo.

call npm run dev
if %errorlevel% neq 0 (
  echo.
  echo [FEHLER] Server konnte nicht gestartet werden. Bitte stelle sicher, dass Node.js installiert ist.
  pause
)
