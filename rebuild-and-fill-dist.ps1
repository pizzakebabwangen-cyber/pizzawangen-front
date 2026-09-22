# Run on your PC in PowerShell:
#   cd D:\Front
#   OR from PizzaWangen-alles\Front
# Replaces D:\Front\dist with fresh build from this branch.

$ErrorActionPreference = "Stop"
$front = "D:\Front"
if (-not (Test-Path $front)) {
    $front = "C:\Users\adnan\Desktop\PizzaWangen-alles\Front"
}
if (-not (Test-Path $front)) {
    Write-Host "Front folder not found. Set path manually." -ForegroundColor Red
    exit 1
}

Set-Location $front
Write-Host "Front: $front" -ForegroundColor Cyan

git fetch origin
git checkout cursor/fix-menu-discount-9284
git pull origin cursor/fix-menu-discount-9284

npm install
npm run build

if (-not (Test-Path "$front\dist\index.html")) {
    Write-Host "BUILD FAILED — no dist\index.html" -ForegroundColor Red
    exit 1
}

Write-Host "OK: dist ready at $front\dist" -ForegroundColor Green
Write-Host "Upload CONTENTS of dist  ->  /site1  (FileZilla)" -ForegroundColor Yellow
Write-Host "Do NOT upload node_modules" -ForegroundColor Yellow
Get-ChildItem "$front\dist" | Select-Object Name, LastWriteTime
