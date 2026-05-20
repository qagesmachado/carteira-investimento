$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$E2eDir = Join-Path $Root "e2e"

Write-Host "== Integração (Playwright: api + ui, esqueleto) ==" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $E2eDir "node_modules"))) {
    Push-Location $E2eDir
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npx playwright install chromium
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
}

Push-Location $E2eDir
try {
    npm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "Testes de integração concluídos." -ForegroundColor Green
