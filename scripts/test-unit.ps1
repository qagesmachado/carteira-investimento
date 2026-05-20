$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$PythonExe = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $PythonExe -BackendDir $BackendDir

Write-Host "== Backend (pytest) ==" -ForegroundColor Cyan
Write-Host "Python: $PythonExe" -ForegroundColor DarkGray
Push-Location $BackendDir
try {
    & $PythonExe -m pytest
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "== Frontend (vitest) ==" -ForegroundColor Cyan
Push-Location (Join-Path $Root "frontend")
try {
    npm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "Testes unitários concluídos." -ForegroundColor Green
