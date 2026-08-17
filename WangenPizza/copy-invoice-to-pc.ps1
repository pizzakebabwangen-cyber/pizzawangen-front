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

# Find existing invoice view (Produkt/Anzahl table) or use default path
$candidates = @(
    "Views\Orders\Print.cshtml",
    "Views\Order\Print.cshtml",
    "Views\Orders\Invoice.cshtml",
    "Views\Shared\Print.cshtml",
    "Pages\Orders\Print.cshtml"
)

$printPath = $null
foreach ($rel in $candidates) {
    $full = Join-Path $dest $rel
    if (Test-Path $full) {
        $printPath = $full
        Write-Host "Found existing invoice: $rel" -ForegroundColor Cyan
        break
    }
}

if (-not $printPath) {
    $printPath = Join-Path $dest "Views\Orders\Print.cshtml"
    Write-Host "No existing invoice found — creating Views\Orders\Print.cshtml" -ForegroundColor Yellow
}

$printDir = Split-Path $printPath -Parent
if (-not (Test-Path $printDir)) {
    New-Item -ItemType Directory -Path $printDir -Force | Out-Null
    Write-Host "Created folder: $printDir" -ForegroundColor Green
}

if (Test-Path $printPath) {
    Copy-Item $printPath "$printPath.backup" -Force
    Write-Host "Backup: $($printPath).backup" -ForegroundColor Yellow
}

Copy-Item "$src\Views\Orders\Print.cshtml" $printPath -Force
Write-Host "OK: $printPath" -ForegroundColor Green

Write-Host ""
Write-Host "Done. Now upload WangenPizza folder via FileZilla to subsite3 (admin)." -ForegroundColor Cyan
Read-Host "Press Enter"
