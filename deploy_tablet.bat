@echo off
echo ================================================
echo  D^&D 3.5e Combat App -- Tablet Deploy Builder
echo ================================================
echo.

echo [1/3] Baue die App...
call npm run build
if errorlevel 1 (
    echo FEHLER: Build fehlgeschlagen. Abbruch.
    pause
    exit /b 1
)

echo.
echo [2/3] Paketiere dist/ fuer Tablet-Transfer...
if exist tablet_package rmdir /s /q tablet_package
xcopy /E /I /Y dist tablet_package >nul
echo      Paket erstellt: .\tablet_package\

echo.
echo [3/3] Fertig!
echo.
echo  Kopiere den Ordner "tablet_package\" auf dein Tablet.
echo  Starte dort mit:  python -m http.server 8080
echo  Oeffne dann:      http://localhost:8080/index-react.html
echo.
echo  Beim ersten Laden cached der Service Worker alle Dateien.
echo  Danach laeuft die App vollstaendig offline.
echo.
pause
