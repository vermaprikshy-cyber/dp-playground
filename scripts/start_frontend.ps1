$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "frontend")
Write-Host "Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Cyan
& npm run dev
