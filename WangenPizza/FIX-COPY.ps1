# Run in PowerShell — fixes "Der Verzeichnisname ist ungültig"
# Right-click -> Run with PowerShell  OR paste in PowerShell

$ErrorActionPreference = "Stop"
$dest = "C:\Users\adnan\Desktop\PizzaWangen-alles\WangenPizza"
$temp = "C:\Users\adnan\Desktop\PizzaWangen-alles\temp-invoice"

if (-not (Test-Path $dest)) {
    Write-Host "ERROR: WangenPizza not found: $dest" -ForegroundColor Red
    Read-Host "Press Enter"
    exit 1
}

if (-not (Test-Path $temp)) {
    Set-Location "C:\Users\adnan\Desktop\PizzaWangen-alles"
    git clone -b cursor/invoice-just-eat-9284 https://github.com/pizzakebabwangen-cyber/pizzawangen-front.git temp-invoice
}

# 1. CSS — create folder if missing
$cssDir = Join-Path $dest "wwwroot\css"
if (-not (Test-Path $cssDir)) { New-Item -ItemType Directory -Path $cssDir -Force | Out-Null }
Copy-Item "$temp\WangenPizza\wwwroot\css\invoice-print-just-eat.css" $cssDir -Force
Write-Host "OK: css" -ForegroundColor Green

# 2. Find old invoice file (table with Produkt / Anzahl)
$found = Get-ChildItem -Path $dest -Recurse -Include *.cshtml,*.html -ErrorAction SilentlyContinue |
    Where-Object { (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -match 'Produkt|Anzahl|Total CHF' } |
    Select-Object -First 1

$printPath = if ($found) { $found.FullName } else { Join-Path $dest "Views\Orders\Print.cshtml" }

$printDir = Split-Path $printPath -Parent
if (-not (Test-Path $printDir)) { New-Item -ItemType Directory -Path $printDir -Force | Out-Null }

if (Test-Path $printPath) {
    Copy-Item $printPath "$printPath.backup" -Force
    Write-Host "Backup: $printPath.backup" -ForegroundColor Yellow
}

Copy-Item "$temp\WangenPizza\Views\Orders\Print.cshtml" $printPath -Force
Write-Host "OK: $printPath" -ForegroundColor Green

Write-Host ""
Write-Host "Done. Upload WangenPizza via FileZilla -> subsite3" -ForegroundColor Cyan
Read-Host "Press Enter"
