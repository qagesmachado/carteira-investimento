$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$E2eDir = Join-Path $Root "e2e"

$PlaywrightArgs = $args
if ($PlaywrightArgs.Count -eq 0) {
  Write-Host "Uso: npm run test:e2e:scope -- specs/pasta/ [ou arquivo.spec.ts]" -ForegroundColor Yellow
  exit 1
}

Push-Location $E2eDir
try {
  npm run test:ui -- @PlaywrightArgs
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
