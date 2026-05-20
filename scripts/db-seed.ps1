param(
    [switch]$Fresh
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$PythonExe = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $PythonExe -BackendDir $BackendDir

Push-Location $BackendDir
try {
    $args = @("-m", "app.seed")
    if ($Fresh) {
        $args += "--fresh"
    }
    & $PythonExe @args
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}
