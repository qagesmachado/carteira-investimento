# Build do executável desktop (onedir, PyInstaller).
# Gera dist/CarteiraInvestimentos/ com o .exe + arquivos. Para distribuir: compactar e enviar o .zip.
#
# Uso:
#   pwsh ./scripts/build-desktop.ps1            # build + smoke (somente leitura) do executavel
#   pwsh ./scripts/build-desktop.ps1 -SkipSmoke # pula o smoke
#
# Pré-requisitos: Node/npm (frontend) e venv do backend com extra [dev] (inclui pyinstaller).

param(
    [switch]$SkipSmoke
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RepoRoot "frontend"
$BackendDir = Join-Path $RepoRoot "backend"
$E2eDir = Join-Path $RepoRoot "e2e"
$DistDir = Join-Path $RepoRoot "dist"
$WorkDir = Join-Path $BackendDir "build"

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$Python = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $Python -BackendDir $BackendDir

Write-Host "==> 1/4 Build do frontend (SPA, API em /api)" -ForegroundColor Cyan
Push-Location $FrontendDir
try {
    if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install falhou" }
    }
    $env:VITE_API_BASE_URL = "/api"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build falhou" }
}
finally {
    Remove-Item Env:\VITE_API_BASE_URL -ErrorAction SilentlyContinue
    Pop-Location
}

$FrontendBuild = Join-Path $FrontendDir "build"
if (-not (Test-Path $FrontendBuild)) {
    throw "Build do frontend não encontrado em $FrontendBuild"
}

Write-Host "==> 2/4 Verificando PyInstaller" -ForegroundColor Cyan
& $Python -m PyInstaller --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "PyInstaller não encontrado. Instale com:" -ForegroundColor Yellow
    Write-Host "  cd backend; .\.venv\Scripts\python -m pip install -e `".[dev]`"" -ForegroundColor Yellow
    throw "PyInstaller ausente"
}

Write-Host "==> 3/4 Empacotando (PyInstaller onedir)" -ForegroundColor Cyan
$AddData = "$FrontendBuild;frontend_build"
& $Python -m PyInstaller `
    --name CarteiraInvestimentos `
    --noconfirm `
    --clean `
    --distpath $DistDir `
    --workpath $WorkDir `
    --specpath $BackendDir `
    --paths $BackendDir `
    --add-data $AddData `
    --collect-all yfinance `
    --collect-submodules uvicorn `
    (Join-Path $BackendDir "run_desktop.py")
if ($LASTEXITCODE -ne 0) { throw "PyInstaller falhou" }

$ExePath = Join-Path $DistDir "CarteiraInvestimentos\CarteiraInvestimentos.exe"

if ($SkipSmoke) {
    Write-Host "==> 4/4 Smoke pulado (-SkipSmoke)" -ForegroundColor Yellow
}
else {
    Write-Host "==> 4/4 Smoke (somente leitura) contra o executável" -ForegroundColor Cyan
    if (-not (Test-Path $ExePath)) { throw "Executável não encontrado: $ExePath" }

    $SmokePort = if ($env:SMOKE_PORT) { $env:SMOKE_PORT } else { "8099" }
    $SmokeDbDir = Join-Path $env:TEMP ("carteira-smoke-" + [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $SmokeDbDir -Force | Out-Null
    $SmokeDb = (Join-Path $SmokeDbDir "carteira-smoke.db") -replace '\\', '/'

    Push-Location $E2eDir
    try {
        if (-not (Test-Path (Join-Path $E2eDir "node_modules"))) {
            npm install
            if ($LASTEXITCODE -ne 0) { throw "npm install em e2e/ falhou" }
        }
        npx playwright install chromium | Out-Null

        $env:SMOKE_EXE = $ExePath
        $env:SMOKE_PORT = $SmokePort
        $env:SMOKE_BASE_URL = "http://127.0.0.1:$SmokePort"
        $env:DATABASE_URL = "sqlite:///$SmokeDb"

        npm run test:smoke
        if ($LASTEXITCODE -ne 0) { throw "Smoke do executável falhou" }
    }
    finally {
        Remove-Item Env:\SMOKE_EXE -ErrorAction SilentlyContinue
        Remove-Item Env:\SMOKE_PORT -ErrorAction SilentlyContinue
        Remove-Item Env:\SMOKE_BASE_URL -ErrorAction SilentlyContinue
        Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
        Remove-Item $SmokeDbDir -Recurse -Force -ErrorAction SilentlyContinue
        Pop-Location
    }
    Write-Host "Smoke OK (executável íntegro)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pronto! Saída em: $(Join-Path $DistDir 'CarteiraInvestimentos')" -ForegroundColor Green
Write-Host "Para distribuir: compacte a pasta CarteiraInvestimentos em .zip e envie." -ForegroundColor Green
