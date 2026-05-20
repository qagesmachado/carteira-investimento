$ErrorActionPreference = "Stop"
& (Join-Path (Split-Path -Parent $PSScriptRoot) "scripts\test-report.ps1")
exit $LASTEXITCODE
