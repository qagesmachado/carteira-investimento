$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$PythonExe = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $PythonExe -BackendDir $BackendDir

Push-Location $BackendDir
try {
    & $PythonExe -m app.seed --export
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}
