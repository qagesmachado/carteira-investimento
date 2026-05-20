$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$E2eDir = Join-Path $Root "e2e"
$ReportsRoot = Join-Path $Root "test-reports"

$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$ReportDir = Join-Path $ReportsRoot $Timestamp
New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null

$BackendJunit = Join-Path $ReportDir "backend-unit.junit.xml"
$FrontendJson = Join-Path $ReportDir "frontend-unit.json"
$E2eJson = Join-Path $ReportDir "e2e-ui.json"
$SummaryJson = Join-Path $ReportDir "summary.json"
$SummaryMd = Join-Path $ReportDir "summary.md"

function Get-JUnitSuiteSummary {
    param([string]$Path)

    $summary = @{
        id           = "backend-unit"
        label        = "Backend (pytest)"
        artifact     = "backend-unit.junit.xml"
        exitCode     = 0
        passed       = 0
        failed       = 0
        skipped      = 0
        errors       = 0
        total        = 0
        durationSec  = 0.0
        failures     = @()
    }

    if (-not (Test-Path $Path)) {
        $summary.failed = 1
        $summary.total = 1
        $summary.failures = @(@{ name = "(suite)"; message = "Artefato JUnit nao gerado." })
        return $summary
    }

    [xml]$xml = Get-Content -Path $Path -Encoding UTF8
    $suiteNode = $null
    if ($xml.testsuites -and $xml.testsuites.testsuite) {
        $suiteNode = $xml.testsuites.testsuite
    } elseif ($xml.testsuite) {
        $suiteNode = $xml.testsuite
    }

    if ($suiteNode) {
        if ($suiteNode.tests) { $summary.total = [int]$suiteNode.tests }
        if ($suiteNode.failures) { $summary.failed = [int]$suiteNode.failures }
        if ($suiteNode.errors) { $summary.errors = [int]$suiteNode.errors }
        if ($suiteNode.skipped) { $summary.skipped = [int]$suiteNode.skipped }
        if ($suiteNode.time) { $summary.durationSec = [double]$suiteNode.time }
        $summary.passed = [Math]::Max(0, $summary.total - $summary.failed - $summary.errors - $summary.skipped)
    }

    $cases = @()
    if ($xml.testsuites.testsuite.testcase) {
        $cases += @($xml.testsuites.testsuite.testcase)
    } elseif ($xml.testsuite.testcase) {
        $cases += @($xml.testsuite.testcase)
    }

    foreach ($case in $cases) {
        if (-not $case) { continue }
        $name = if ($case.classname) { "$($case.classname)::$($case.name)" } else { [string]$case.name }
        if ($case.failure) {
            $summary.failures += @{
                name    = $name
                message = [string]$case.failure.message
            }
        } elseif ($case.error) {
            $summary.failures += @{
                name    = $name
                message = [string]$case.error.message
            }
        }
    }

    return $summary
}

function Get-VitestSuiteSummary {
    param(
        [string]$Path,
        [int]$ExitCode
    )

    $summary = @{
        id           = "frontend-unit"
        label        = "Frontend (vitest)"
        artifact     = "frontend-unit.json"
        exitCode     = $ExitCode
        passed       = 0
        failed       = 0
        skipped      = 0
        errors       = 0
        total        = 0
        durationSec  = 0.0
        failures     = @()
    }

    if (-not (Test-Path $Path)) {
        if ($ExitCode -ne 0) {
            $summary.failed = 1
            $summary.total = 1
            $summary.failures = @(@{ name = "(suite)"; message = "Artefato JSON do Vitest nao gerado." })
        }
        return $summary
    }

    $raw = Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($raw.numTotalTests) { $summary.total = [int]$raw.numTotalTests }
    if ($raw.numPassedTests) { $summary.passed = [int]$raw.numPassedTests }
    if ($raw.numFailedTests) { $summary.failed = [int]$raw.numFailedTests }
    if ($raw.numPendingTests) { $summary.skipped += [int]$raw.numPendingTests }
    if ($raw.startTime -and $raw.endTime) {
        $summary.durationSec = ([double]$raw.endTime - [double]$raw.startTime) / 1000.0
    } elseif ($raw.testResults) {
        $summary.durationSec = (
            @($raw.testResults) | ForEach-Object { [double]$_.endTime - [double]$_.startTime } | Measure-Object -Sum
        ).Sum / 1000.0
    }

    foreach ($fileResult in @($raw.testResults)) {
        foreach ($assertion in @($fileResult.assertionResults)) {
            if ($assertion.status -eq "failed") {
                $summary.failures += @{
                    name    = [string]$assertion.fullName
                    message = ([string]$assertion.failureMessages) -join "`n"
                }
            }
        }
    }

    return $summary
}

function Get-PlaywrightSuiteSummary {
    param(
        [string]$Path,
        [int]$ExitCode
    )

    $summary = @{
        id           = "e2e-ui"
        label        = "E2E UI (Playwright)"
        artifact     = "e2e-ui.json"
        exitCode     = $ExitCode
        passed       = 0
        failed       = 0
        skipped      = 0
        errors       = 0
        total        = 0
        durationSec  = 0.0
        failures     = @()
    }

    if (-not (Test-Path $Path)) {
        if ($ExitCode -ne 0) {
            $summary.failed = 1
            $summary.total = 1
            $summary.failures = @(@{ name = "(suite)"; message = "Artefato JSON do Playwright nao gerado." })
        }
        return $summary
    }

    $raw = Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($raw.stats) {
        $summary.passed = [int]$raw.stats.expected
        $summary.failed = [int]$raw.stats.unexpected
        $summary.skipped = [int]$raw.stats.skipped
        $summary.total = $summary.passed + $summary.failed + $summary.skipped
        if ($raw.stats.duration) {
            $summary.durationSec = [double]$raw.stats.duration / 1000.0
        }
    }

    function Collect-PlaywrightFailures {
        param($Suites)

        foreach ($suite in @($Suites)) {
            foreach ($spec in @($suite.specs)) {
                foreach ($test in @($spec.tests)) {
                    foreach ($result in @($test.results)) {
                        if ($result.status -in @("failed", "timedOut", "interrupted")) {
                            $title = if ($spec.title) { $spec.title } else { $test.title }
                            $summary.failures += @{
                                name    = [string]$title
                                message = [string]$result.error.message
                            }
                        }
                    }
                }
            }
            if ($suite.suites) {
                Collect-PlaywrightFailures -Suites $suite.suites
            }
        }
    }

    if ($raw.suites) {
        Collect-PlaywrightFailures -Suites $raw.suites
    }

    return $summary
}

function Write-SummaryMarkdown {
    param(
        [hashtable]$Report,
        [string]$Path
    )

    $lines = @(
        "# Relatorio de testes - $($Report.timestamp)",
        "",
        "- **Inicio:** $($Report.startedAt)",
        "- **Fim:** $($Report.finishedAt)",
        "- **Duracao total:** $([math]::Round($Report.durationSec, 2))s",
        "- **Resultado geral:** $($Report.overall)",
        "",
        "## Suites",
        "",
        "| Suite | Passou | Falhou | Pulou | Total | Duracao | Artefato |",
        "| ----- | ------ | ------ | ----- | ----- | ------- | -------- |"
    )

    foreach ($suite in $Report.suites) {
        $status = if ($suite.exitCode -eq 0 -and $suite.failed -eq 0 -and $suite.errors -eq 0) { "OK" } else { "FALHOU" }
        $lines += "| $($suite.label) ($status) | $($suite.passed) | $($suite.failed) | $($suite.skipped) | $($suite.total) | $([math]::Round($suite.durationSec, 2))s | ``$($suite.artifact)`` |"
    }

    $failedSuites = @($Report.suites | Where-Object { $_.failures.Count -gt 0 })
    if ($failedSuites.Count -gt 0) {
        $lines += ""
        $lines += "## Falhas"
        foreach ($suite in $failedSuites) {
            $lines += ""
            $lines += "### $($suite.label)"
            foreach ($failure in $suite.failures) {
                $lines += "- **$($failure.name)**"
                if ($failure.message) {
                    $lines += "  - $($failure.message -replace "`r?`n", " ")"
                }
            }
        }
    }

    $lines += ""
    $lines += "---"
    $lines += "Gerado por ``scripts/test-report.ps1``."
    Set-Content -Path $Path -Value ($lines -join "`n") -Encoding UTF8
}

$startedAt = Get-Date
Write-Host "== Relatorio de testes: $ReportDir ==" -ForegroundColor Cyan

. (Join-Path $PSScriptRoot "lib\Resolve-BackendPython.ps1")
$PythonExe = Resolve-BackendPython -BackendDir $BackendDir
Assert-BackendPythonReady -PythonExe $PythonExe -BackendDir $BackendDir

# Backend
Write-Host "== Backend (pytest) ==" -ForegroundColor Cyan
$backendExit = 0
Push-Location $BackendDir
try {
    & $PythonExe -m pytest --junitxml=$BackendJunit
    if ($LASTEXITCODE -ne 0) { $backendExit = $LASTEXITCODE }
} finally {
    Pop-Location
}

# Frontend
Write-Host "== Frontend (vitest) ==" -ForegroundColor Cyan
$frontendExit = 0
Push-Location $FrontendDir
try {
    npm test -- --reporter=default --reporter=json --outputFile=$FrontendJson
    if ($LASTEXITCODE -ne 0) { $frontendExit = $LASTEXITCODE }
} finally {
    Pop-Location
}

# E2E
Write-Host "== E2E UI (Playwright) ==" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $E2eDir "node_modules"))) {
    Push-Location $E2eDir
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install em e2e/ falhou." }
        npx playwright install chromium
        if ($LASTEXITCODE -ne 0) { throw "playwright install chromium falhou." }
    } finally {
        Pop-Location
    }
}

$e2eExit = 0
$env:PLAYWRIGHT_JSON_OUTPUT = $E2eJson
Push-Location $E2eDir
try {
    npm run test:ui
    if ($LASTEXITCODE -ne 0) { $e2eExit = $LASTEXITCODE }
} finally {
    Remove-Item Env:PLAYWRIGHT_JSON_OUTPUT -ErrorAction SilentlyContinue
    Pop-Location
}

$finishedAt = Get-Date
$backendSummary = Get-JUnitSuiteSummary -Path $BackendJunit
$backendSummary.exitCode = $backendExit
$frontendSummary = Get-VitestSuiteSummary -Path $FrontendJson -ExitCode $frontendExit
$e2eSummary = Get-PlaywrightSuiteSummary -Path $E2eJson -ExitCode $e2eExit

$overallExit = 0
if ($backendExit -ne 0 -or $frontendExit -ne 0 -or $e2eExit -ne 0) {
    $overallExit = 1
}

$report = @{
    timestamp   = $Timestamp
    startedAt   = $startedAt.ToString("o")
    finishedAt  = $finishedAt.ToString("o")
    durationSec = ($finishedAt - $startedAt).TotalSeconds
    overall     = if ($overallExit -eq 0) { "passed" } else { "failed" }
    reportDir   = "test-reports/$Timestamp"
    suites      = @($backendSummary, $frontendSummary, $e2eSummary)
}

$report | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryJson -Encoding UTF8
Write-SummaryMarkdown -Report $report -Path $SummaryMd

Write-Host ""
Write-Host "Relatorio salvo em: $ReportDir" -ForegroundColor Green
Write-Host "  - summary.md / summary.json" -ForegroundColor DarkGray
Write-Host "  - backend-unit.junit.xml" -ForegroundColor DarkGray
Write-Host "  - frontend-unit.json" -ForegroundColor DarkGray
Write-Host "  - e2e-ui.json" -ForegroundColor DarkGray

if ($overallExit -ne 0) {
    Write-Host "Alguma suite falhou. Veja $SummaryMd" -ForegroundColor Red
    exit $overallExit
}

Write-Host "Todas as suites passaram." -ForegroundColor Green
