$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $Root "frontend"

$VitestArgs = $args
if ($VitestArgs.Count -eq 0) {
  Write-Host "Uso: npm run test:frontend:scope -- src/path/to/file.test.ts" -ForegroundColor Yellow
  exit 1
}

Push-Location $FrontendDir
try {
  npm test -- @VitestArgs
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
