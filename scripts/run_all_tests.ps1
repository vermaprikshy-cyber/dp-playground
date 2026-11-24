$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== 1/3 Running C++ Engine Tests ===" -ForegroundColor Cyan
& (Join-Path $root "engine\build\test_engine.exe")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== 2/3 Running Backend Pytest ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "backend")
try {
    & python -m pytest
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "`n=== 3/3 Running Frontend Vitest ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "frontend")
try {
    & npm run test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "`nAll test suites passed successfully!" -ForegroundColor Green
