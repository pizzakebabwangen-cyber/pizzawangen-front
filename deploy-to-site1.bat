@echo off
cd /d "%~dp0"
echo Building...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
rem Sicherheitsnetz: dist\web.config muss die Live-Regeln enthalten (Tracking-Weiterleitung + .webp), sonst ueberschreibt der Upload die Live-Datei.
findstr /C:"bestellung-verfolgen" "dist\web.config" >nul
if %errorlevel% neq 0 (
    echo ABBRUCH: dist\web.config enthaelt die Tracking-Weiterleitung nicht. NICHT hochladen!
    pause
    exit /b 2
)
findstr /C:".webp" "dist\web.config" >nul
if %errorlevel% neq 0 (
    echo ABBRUCH: dist\web.config enthaelt den .webp-MIME-Typ nicht. NICHT hochladen!
    pause
    exit /b 2
)
echo Copying to server...
xcopy "dist\*" "h:\root\home\wangen2024-001\www\site1\" /E /Y /I
if %errorlevel% equ 0 (
    echo Done! Build + Deploy complete.
) else (
    echo Copy failed - make sure H: drive is connected.
)
pause
