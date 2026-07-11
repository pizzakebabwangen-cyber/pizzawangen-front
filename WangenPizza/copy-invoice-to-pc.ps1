# Copy Just Eat invoice files into your local WangenPizza Admin project.
# Run: Right-click -> Run with PowerShell

$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$dest = "C:\Users\adnan\Desktop\PizzaWangen-alles\WangenPizza"

if (-not (Test-Path $dest)) {
    Write-Host "ERROR: WangenPizza not found at $dest" -ForegroundColor Red
    Read-Host "Press Enter"
    exit 1
}

$cssDest = Join-Path $dest "wwwroot\css"
if (-not (Test-Path $cssDest)) { New-Item -ItemType Directory -Path $cssDest -Force | Out-Null }
Copy-Item "$src\wwwroot\css\invoice-print-just-eat.css" $cssDest -Force
Write-Host "OK: css -> wwwroot\css\" -ForegroundColor Green

$viewsDest = Join-Path $dest "Views\Orders"
if (-not (Test-Path $viewsDest)) { New-Item -ItemType Directory -Path $viewsDest -Force | Out-Null }

$printPath = Join-Path $viewsDest "Print.cshtml"
if (Test-Path $printPath) {
    Copy-Item $printPath "$printPath.backup" -Force
    Write-Host "Backup: Print.cshtml.backup" -ForegroundColor Yellow
}
Copy-Item "$src\Views\Orders\Print.cshtml" $printPath -Force
Write-Host "OK: Views\Orders\Print.cshtml" -ForegroundColor Green

Write-Host ""
Write-Host "Done. Now upload WangenPizza folder via FileZilla to subsite3 (admin)." -ForegroundColor Cyan
Read-Host "Press Enter"
