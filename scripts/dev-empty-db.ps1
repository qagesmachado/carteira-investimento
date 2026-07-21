param(
    # Zera o banco descartável antes de subir (sempre começa vazio).
    [switch]$Fresh,
    # Não abre o frontend automaticamente (sobe só o backend).
    [switch]$NoFrontend
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$PythonExe = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $PythonExe -BackendDir $BackendDir

# Banco descartável, isolado do carteira.db real de desenvolvimento.
$DataDir = Join-Path $BackendDir "data\dev"
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
$DbPath = Join-Path $DataDir "carteira-vazia.db"

if ($Fresh -and (Test-Path $DbPath)) {
    Remove-Item $DbPath -Force
    Write-Host "Banco descartável zerado." -ForegroundColor Yellow
}

$DbUri = "sqlite:///" + ($DbPath -replace '\\', '/')
$env:DATABASE_URL = $DbUri

Write-Host "Ambiente de estado vazio (dados reais intactos)." -ForegroundColor Cyan
Write-Host "  Banco: $DbPath" -ForegroundColor Cyan
Write-Host "  API:   http://127.0.0.1:8000" -ForegroundColor Cyan

if (-not $NoFrontend) {
    Write-Host "  Frontend: abrindo em nova janela (http://127.0.0.1:5173)" -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location `"$FrontendDir`"; npm run dev"
    )
}

Push-Location $BackendDir
try {
    & $PythonExe -m uvicorn app.main:app --reload
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
