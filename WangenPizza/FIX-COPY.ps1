# FIX-COPY.ps1 — copy Just Eat invoice into WangenPizza (fast, no re-clone)
$ErrorActionPreference = "Stop"
$root = "C:\Users\adnan\Desktop\PizzaWangen-alles"
$dest = Join-Path $root "WangenPizza"

if (-not (Test-Path $dest)) {
    Write-Host "ERROR: WangenPizza not found: $dest" -ForegroundColor Red
    Read-Host "Press Enter"
    exit 1
}

$temp = @(
    Join-Path $root "temp-invoice2"
    Join-Path $root "temp-invoice"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $temp) {
    Write-Host "ERROR: Run git clone first (temp-invoice2 missing)" -ForegroundColor Red
    Read-Host "Press Enter"
    exit 1
}

Write-Host "Using: $temp" -ForegroundColor Cyan

# 1. CSS
$cssDir = Join-Path $dest "wwwroot\css"
if (-not (Test-Path $cssDir)) { New-Item -ItemType Directory -Path $cssDir -Force | Out-Null }
Copy-Item "$temp\WangenPizza\wwwroot\css\invoice-print-just-eat.css" $cssDir -Force
Write-Host "OK: wwwroot\css\invoice-print-just-eat.css" -ForegroundColor Green

# 2. Find old invoice — only Views/Pages (fast)
Write-Host "Searching invoice file..." -ForegroundColor Gray
$searchDirs = @("Views", "Pages") | ForEach-Object { Join-Path $dest $_ } | Where-Object { Test-Path $_ }
$found = $null
foreach ($dir in $searchDirs) {
    $found = Get-ChildItem -Path $dir -Recurse -Filter *.cshtml -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '\\bin\\|\\obj\\' } |
        Where-Object { (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -match 'Produkt|Anzahl|Total CHF' } |
        Select-Object -First 1
    if ($found) { break }
}

$srcPrint = Join-Path $temp "WangenPizza\Views\Orders\Print.cshtml"
if (-not (Test-Path $srcPrint)) {
    Write-Host "ERROR: Print.cshtml missing in repo" -ForegroundColor Red
    Read-Host "Press Enter"
    exit 1
}

$printPath = if ($found) { $found.FullName } else { Join-Path $dest "Views\Orders\Print.cshtml" }
$printDir = Split-Path $printPath -Parent
if (-not (Test-Path $printDir)) { New-Item -ItemType Directory -Path $printDir -Force | Out-Null }

if (Test-Path $printPath) {
    Copy-Item $printPath "$printPath.backup" -Force
    Write-Host "Backup: $printPath.backup" -ForegroundColor Yellow
}

Copy-Item $srcPrint $printPath -Force
Write-Host "OK: $printPath" -ForegroundColor Green

Write-Host ""
Write-Host "FERTIG. FileZilla: WangenPizza -> subsite3 (NOT site1)" -ForegroundColor Cyan
Read-Host "Press Enter"
