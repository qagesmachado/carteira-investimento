# Release em 1 comando: gera as notas (Cursor CLI), bumpa as versoes, builda e
# cria commit + tag -- tudo a partir da fonte unica (package.json da raiz).
#
# Fluxo:
#   1. Calcula a proxima versao (patch|minor|major|X.Y.Z).
#   2. Monta o contexto (.release/context.md) com commits + diff de codigo + diff de docs.
#   3. Chama o Cursor CLI (agent) para escrever as novidades em ## [Unreleased].
#   4. Mostra o diff e pede confirmacao (y/n) -- pule com -Yes.
#   5. Bumpa as 4 fontes de versao e carimba [X.Y.Z] - data no CHANGELOG.
#   6. Roda scripts/build-desktop.ps1 (PyInstaller + smoke).
#   7. Build verde -> git commit + git tag vX.Y.Z (SEM push).
#
# Pre-requisito (uma vez por maquina):
#   irm 'https://cursor.com/install?win32=true' | iex
#   agent login            # ou: $env:CURSOR_API_KEY = "<key do Dashboard>"
#
# Uso:
#   npm run release -- minor
#   pwsh ./scripts/release.ps1 patch
#   pwsh ./scripts/release.ps1 1.2.3 -Yes
#   pwsh ./scripts/release.ps1 minor -SkipBuild   # so gera/edita as notas (debug)

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Bump,
    [switch]$Yes,
    [switch]$SkipBuild,
    [switch]$SkipSmoke
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$RootPackage = Join-Path $Root "package.json"
$FrontendPackage = Join-Path $Root "frontend\package.json"
$Pyproject = Join-Path $Root "backend\pyproject.toml"
$VersionPy = Join-Path $Root "backend\app\core\version.py"
$Changelog = Join-Path $Root "CHANGELOG.md"
$ReleaseDir = Join-Path $Root ".release"
$ContextFile = Join-Path $ReleaseDir "context.md"
$ChangelogBackup = Join-Path $ReleaseDir "CHANGELOG.before"

function Get-CurrentVersion {
    $content = Get-Content -Raw $RootPackage
    if ($content -notmatch '"version"\s*:\s*"([^"]+)"') {
        throw "Nao foi possivel ler a versao atual em $RootPackage"
    }
    return $Matches[1]
}

function Resolve-NextVersion([string]$current, [string]$bump) {
    if ($bump -match '^\d+\.\d+\.\d+$') {
        return $bump
    }
    if ($current -notmatch '^(\d+)\.(\d+)\.(\d+)$') {
        throw "Versao atual '$current' nao e semver (MAJOR.MINOR.PATCH)."
    }
    $major = [int]$Matches[1]; $minor = [int]$Matches[2]; $patch = [int]$Matches[3]
    switch ($bump.ToLower()) {
        "major" { return "$($major + 1).0.0" }
        "minor" { return "$major.$($minor + 1).0" }
        "patch" { return "$major.$minor.$($patch + 1)" }
        default { throw "Bump invalido: '$bump'. Use major|minor|patch ou X.Y.Z." }
    }
}

function Update-File([string]$path, [string]$pattern, [string]$replacement) {
    $content = Get-Content -Raw $path
    $updated = [regex]::Replace($content, $pattern, $replacement)
    if ($updated -eq $content) {
        throw "Padrao de versao nao encontrado em $path"
    }
    Set-Content -Path $path -Value $updated -NoNewline
}

function Invoke-GitText {
    # Roda git suprimindo o stderr (avisos como LF/CRLF ou "No names found" nao
    # devem virar erro fatal sob $ErrorActionPreference = 'Stop'). Expoe o codigo
    # de saida em $script:GitExit.
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $out = & git -C $Root @GitArgs 2>$null
        $script:GitExit = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $prev
    }
    return $out
}

function Get-ReleaseBase {
    # Ultima tag de versao; se nao houver, o primeiro commit do repositorio.
    $tag = Invoke-GitText describe --tags --abbrev=0
    if ($script:GitExit -eq 0 -and $tag) {
        return ($tag | Select-Object -First 1).Trim()
    }
    return (Invoke-GitText rev-list --max-parents=0 HEAD | Select-Object -First 1).Trim()
}

function Assert-AgentAvailable {
    if (-not (Get-Command agent -ErrorAction SilentlyContinue)) {
        Write-Host "Cursor CLI (agent) nao encontrado." -ForegroundColor Red
        Write-Host "Instale uma vez com:" -ForegroundColor Yellow
        Write-Host "  irm 'https://cursor.com/install?win32=true' | iex" -ForegroundColor Yellow
        Write-Host "Depois autentique com 'agent login' ou defina a variavel CURSOR_API_KEY." -ForegroundColor Yellow
        throw "agent ausente"
    }
}

function Write-ReleaseContext([string]$base, [string]$next) {
    $log = (Invoke-GitText log "$base..HEAD" --pretty=format:"- %s%n%b") -join "`n"
    $codeStat = (Invoke-GitText diff "$base..HEAD" --stat -- . ":(exclude)docs") -join "`n"
    $docsDiff = (Invoke-GitText diff "$base..HEAD" -- docs) -join "`n"

    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# Contexto da release v$next")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("Base de comparacao: $base")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Mensagens de commit (desde a base)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine($(if ($log) { $log } else { "(sem commits no intervalo)" }))
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Resumo das mudancas de codigo (--stat, exceto docs)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine('```')
    [void]$sb.AppendLine($(if ($codeStat) { $codeStat } else { "(sem mudancas de codigo)" }))
    [void]$sb.AppendLine('```')
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Diff da documentacao (docs/)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine('```diff')
    [void]$sb.AppendLine($(if ($docsDiff) { $docsDiff } else { "(sem mudancas em docs/)" }))
    [void]$sb.AppendLine('```')

    Set-Content -Path $ContextFile -Value $sb.ToString() -Encoding utf8
}

# ---------------------------------------------------------------------------

$current = Get-CurrentVersion
$next = Resolve-NextVersion $current $Bump
if ($next -eq $current) {
    throw "A nova versao ($next) e igual a atual."
}

Assert-AgentAvailable

Write-Host "Release v$current -> v$next" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
Copy-Item $Changelog $ChangelogBackup -Force

$base = Get-ReleaseBase
Write-Host "==> Montando contexto desde '$base'" -ForegroundColor Cyan
Write-ReleaseContext -base $base -next $next

$prompt = @"
Gere as notas da versao $next deste projeto.
Leia o contexto em .release/context.md (mensagens de commit, resumo de mudancas de
codigo e diff da documentacao desde a ultima versao) e escreva as novidades na
secao '## [Unreleased]' do CHANGELOG.md, seguindo ESTRITAMENTE as regras em
.cursor/rules/release-notes.mdc (linguagem de negocio, foco no usuario, sem nomes
de arquivo nem de tecnologia). Substitua qualquer conteudo de exemplo ja presente
em [Unreleased]. NAO crie secao com numero de versao ou data e NAO altere outras
secoes do arquivo.
"@

Write-Host "==> Gerando release notes com o Cursor CLI" -ForegroundColor Cyan
& agent -p --force --output-format text --workspace $Root $prompt
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar o agent (verifique 'agent login' ou a variavel CURSOR_API_KEY)."
}

$before = Get-Content -Raw $ChangelogBackup
$after = Get-Content -Raw $Changelog
if ($before -eq $after) {
    Write-Host "O agente nao alterou o CHANGELOG.md." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===== Mudancas no CHANGELOG.md =====" -ForegroundColor Cyan
Invoke-GitText --no-pager diff --no-index -- $ChangelogBackup $Changelog | ForEach-Object { Write-Host $_ }
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if (-not $Yes) {
    $answer = Read-Host "Aplicar estas notas e seguir com o release v$next? (y/n)"
    if ($answer -notmatch '^(y|s|sim|yes)$') {
        Copy-Item $ChangelogBackup $Changelog -Force
        Remove-Item $ReleaseDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cancelado. CHANGELOG.md restaurado, nenhuma versao alterada." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "==> Atualizando versoes para $next" -ForegroundColor Cyan
Update-File $RootPackage '("version"\s*:\s*")[^"]+(")' "`${1}$next`${2}"
Update-File $FrontendPackage '("version"\s*:\s*")[^"]+(")' "`${1}$next`${2}"
Update-File $Pyproject '(?m)^(version\s*=\s*")[^"]+(")' "`${1}$next`${2}"
Update-File $VersionPy '(APP_VERSION\s*=\s*")[^"]+(")' "`${1}$next`${2}"

# CHANGELOG.md: insere a nova secao logo abaixo de [Unreleased].
$today = (Get-Date).ToString("yyyy-MM-dd")
$changelogText = Get-Content -Raw $Changelog
if ($changelogText -notmatch '(?m)^##\s+\[Unreleased\]') {
    throw "Secao '## [Unreleased]' nao encontrada em $Changelog"
}
$changelogText = [regex]::Replace(
    $changelogText,
    '(?m)^(##\s+\[Unreleased\].*?)(\r?\n)',
    "`${1}`${2}`${2}## [$next] - $today`${2}",
    [System.Text.RegularExpressions.RegexOptions]::Singleline,
    1
)

# Atualiza os links de comparacao no rodape (base passa a ser a nova versao).
$linkPattern = '(?m)^\[Unreleased\]:\s*(?<base>\S+?)compare/v[\d.]+\.\.\.HEAD\s*$'
$linkMatch = [regex]::Match($changelogText, $linkPattern)
if ($linkMatch.Success) {
    $linkBase = $linkMatch.Groups['base'].Value
    $newUnreleased = "[Unreleased]: ${linkBase}compare/v$next...HEAD"
    $newTag = "[$next]: ${linkBase}releases/tag/v$next"
    $changelogText = [regex]::Replace(
        $changelogText, $linkPattern, "$newUnreleased`r`n$newTag"
    )
}
Set-Content -Path $Changelog -Value $changelogText -NoNewline

if ($SkipBuild) {
    Write-Host "==> Build pulado (-SkipBuild). Versoes e CHANGELOG atualizados, sem commit/tag." -ForegroundColor Yellow
    Remove-Item $ReleaseDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 0
}

Write-Host "==> Build do executavel (PyInstaller + smoke)" -ForegroundColor Cyan
$buildArgs = @()
if ($SkipSmoke) { $buildArgs += "-SkipSmoke" }
$buildExit = 0
try {
    & (Join-Path $PSScriptRoot "build-desktop.ps1") @buildArgs
    $buildExit = $LASTEXITCODE
}
catch {
    $buildExit = 1
    Write-Warning $_.Exception.Message
}

if ($buildExit -ne 0) {
    Write-Host "Build falhou. Nenhum commit/tag criado." -ForegroundColor Red
    Write-Host "Os arquivos de versao e o CHANGELOG ja foram alterados; inspecione e," -ForegroundColor Yellow
    Write-Host "se quiser desfazer: git checkout -- . ; git clean -fd .release" -ForegroundColor Yellow
    exit 1
}

Write-Host "==> Commit e tag (sem push)" -ForegroundColor Cyan
Invoke-GitText add -A | Out-Null
if ($script:GitExit -ne 0) { throw "git add falhou" }
Invoke-GitText commit -m "chore(release): v$next" | ForEach-Object { Write-Host $_ }
if ($script:GitExit -ne 0) { throw "git commit falhou" }
Invoke-GitText tag "v$next" | Out-Null
if ($script:GitExit -ne 0) { throw "git tag falhou" }

Remove-Item $ReleaseDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Release v$next pronto (commit + tag locais)." -ForegroundColor Green
Write-Host "Para publicar: git push --follow-tags" -ForegroundColor Green
