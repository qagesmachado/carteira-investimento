$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$PythonExe = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $PythonExe -BackendDir $BackendDir

$PytestArgs = $args
if ($PytestArgs.Count -eq 0) {
  Write-Host "Uso: npm run test:backend:scope -- tests/test_foo.py [-k pattern]" -ForegroundColor Yellow
  exit 1
}

Push-Location $BackendDir
try {
  & $PythonExe -m pytest @PytestArgs
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
