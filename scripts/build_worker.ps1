$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root "engine\build"
New-Item -ItemType Directory -Force -Path $build | Out-Null

$include = Join-Path $root "engine\include"
$sources = @(
    (Join-Path $root "engine\src\main.cpp"),
    (Join-Path $root "engine\src\runner.cpp"),
    (Join-Path $root "engine\src\fibonacci.cpp"),
    (Join-Path $root "engine\src\climbing_stairs.cpp"),
    (Join-Path $root "engine\src\knapsack.cpp")
)
$worker = Join-Path $build "dp_worker.exe"
Write-Host "Compiling worker..."
& g++ -std=c++14 -O2 -Wall -Wextra -pedantic -I $include @sources -o $worker
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$testWorker = Join-Path $build "test_worker.exe"
Copy-Item -Path $worker -Destination $testWorker -Force
Unblock-File -Path $worker, $testWorker -ErrorAction SilentlyContinue

$tests = @(
    (Join-Path $root "engine\tests\test_main.cpp"),
    (Join-Path $root "engine\src\runner.cpp"),
    (Join-Path $root "engine\src\fibonacci.cpp"),
    (Join-Path $root "engine\src\climbing_stairs.cpp"),
    (Join-Path $root "engine\src\knapsack.cpp")
)
$testBin = Join-Path $build "test_engine.exe"
Write-Host "Compiling engine tests..."
& g++ -std=c++14 -O2 -Wall -Wextra -pedantic -I $include @tests -o $testBin
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running engine tests..."
& $testBin
exit $LASTEXITCODE
