@echo off
cd /d "%~dp0"
echo Building...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo Copying to server...
xcopy "dist\*" "h:\root\home\wangen2024-001\www\site1\" /E /Y /I
if %errorlevel% equ 0 (
    echo Done! Build + Deploy complete.
) else (
    echo Copy failed - make sure H: drive is connected.
)
pause
