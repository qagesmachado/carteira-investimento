function Resolve-BackendPython {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BackendDir
    )

    $venvWin = Join-Path $BackendDir ".venv\Scripts\python.exe"
    if (Test-Path $venvWin) {
        return $venvWin
    }

    $venvUnix = Join-Path $BackendDir ".venv/bin/python"
    if (Test-Path $venvUnix) {
        return $venvUnix
    }

    return "python"
}

function Assert-BackendPythonReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PythonExe,
        [Parameter(Mandatory = $true)]
        [string]$BackendDir
    )

    & $PythonExe -c "import fastapi" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FastAPI não encontrado no Python usado pelos testes." -ForegroundColor Red
        Write-Host "Crie o venv e instale as dependências:" -ForegroundColor Yellow
        Write-Host "  cd backend" -ForegroundColor Yellow
        Write-Host "  python -m venv .venv" -ForegroundColor Yellow
        Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
        Write-Host "  python -m pip install -e `".[dev]`"" -ForegroundColor Yellow
        Write-Host "Python tentado: $PythonExe" -ForegroundColor Yellow
        exit 1
    }
}
