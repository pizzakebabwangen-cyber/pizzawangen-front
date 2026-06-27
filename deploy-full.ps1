# Deploy Wangen Pizza Frontend
# Ausführung: Rechtsklick auf die Datei -> Run with PowerShell

# Stop on cmdlet errors; npm/vite schreiben Warnungen nach stderr — nicht als Abbruch werten.
$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host "=== Wangen Pizza Deploy ===" -ForegroundColor Cyan
Write-Host ""

# 1. Build React (stderr z. B. Vite chunk warning würde mit Stop + 2>&1 den Deploy abbrechen)
Write-Host "[1/3] Building React..." -ForegroundColor Yellow
Set-Location $projectRoot
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
npm run build
$buildExit = $LASTEXITCODE
$ErrorActionPreference = $prevEap
if ($buildExit -ne 0) {
    Write-Host "BUILD FAILED (exit $buildExit)!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit $buildExit
}
Write-Host "Build OK" -ForegroundColor Green
Write-Host ""

# 2. Copy to server (H: drive)
$serverPath = "h:\root\home\wangen2024-001\www\site1"
Write-Host "[2/3] Copying to server $serverPath ..." -ForegroundColor Yellow
if (Test-Path $serverPath) {
    Copy-Item "$projectRoot\dist\*" -Destination $serverPath -Recurse -Force
    Write-Host "Copy OK" -ForegroundColor Green
} else {
    Write-Host "WARNING: Server path not found (H: drive not connected?)" -ForegroundColor Red
    Write-Host "Copy manually: dist\* -> $serverPath" -ForegroundColor Yellow
}
Write-Host ""

# 3. Copy to ASP.NET wwwroot (optional)
$wwwrootPath = "$projectRoot\..\..\Admin\Admin\WangenPizza\wwwroot"
if (Test-Path $wwwrootPath) {
    Write-Host "[3/3] Copying to ASP.NET wwwroot..." -ForegroundColor Yellow
    # Copy index.html and assets (don't overwrite Dashboard)
    Copy-Item "$projectRoot\dist\index.html" -Destination $wwwrootPath -Force
    if (Test-Path "$projectRoot\dist\assets") {
        if (Test-Path "$wwwrootPath\assets") { Remove-Item "$wwwrootPath\assets" -Recurse -Force }
        Copy-Item "$projectRoot\dist\assets" -Destination $wwwrootPath -Recurse -Force
    }
    Write-Host "wwwroot OK" -ForegroundColor Green
} else {
    Write-Host "[3/3] wwwroot not found, skipping" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Test: https://www.pizzawangen.ch"
Write-Host "Mobile: Clear browser cache or use Incognito"
Write-Host ""
Read-Host "Press Enter to exit"
