# Página Info e versionamento

## Objetivo

Reunir, em uma única tela técnica (`/info`), as versões e detalhes do ambiente em execução — útil para conferência após atualizações e para suporte.

## Escopo

- Página **`/info`** com tabela de versões: aplicação (backend), frontend, schema esperado (código), versão do banco (arquivo do usuário) com selo **atualizado/desatualizado**, Python, modo de lookup e caminho do banco.
- Seção **Novidades** na `/info` com as release notes da versão atual, lidas do `CHANGELOG.md`.
- Indicador discreto de versão no **rodapé** de todas as telas, com link para `/info` (sem poluir a navbar).
- Endpoint **`/info`** no backend (`/api/info` no app empacotado) com os dados de versão e as novidades.
- **Fonte única de versão** (`package.json` da raiz) com script de release que sincroniza os demais arquivos e o changelog.

## Fontes de versão

| Dado | Origem |
| --- | --- |
| `app_version` | `backend/app/core/version.py` (`APP_VERSION`) |
| `schema_version` | `backend/app/db/session.py` (`SCHEMA_VERSION`) |
| `db_user_version` | `PRAGMA user_version` do banco do usuário (lido por request) |
| `db_up_to_date` | `db_user_version >= schema_version` |
| `frontend` | `frontend/package.json`, injetada no build (vite `define` → `__FRONTEND_VERSION__`) |
| `python_version` | `platform.python_version()` |
| `database_path` | caminho do `carteira.db` (engine atual) |
| `lookup_mode` | `settings.asset_lookup_mode` |
| `released_at` / `release_notes` | seção da versão atual no `CHANGELOG.md` (raiz) |

## Fonte única de versão e release (1 comando)

- A versão da aplicação tem **fonte única** no `package.json` da **raiz**.
- `SCHEMA_VERSION` é **independente** da versão da aplicação: só sobe quando há migração de banco.

### Setup único (por máquina)

O `release.ps1` usa o **Cursor CLI** (`agent`) para escrever as notas. Instale uma vez:

```powershell
irm 'https://cursor.com/install?win32=true' | iex
agent login            # ou: $env:CURSOR_API_KEY = "<key do Dashboard>"
```

### Fluxo de release

`npm run release -- <patch|minor|major|X.Y.Z>` faz tudo em um comando:

1. Calcula a próxima versão a partir da fonte única.
2. Monta o contexto em `.release/context.md` (commits + diff de código `--stat` + diff de `docs/`, desde a última tag ou o primeiro commit).
3. Chama `agent -p --force`, que escreve as novidades em `## [Unreleased]` do `CHANGELOG.md` seguindo `.cursor/rules/release-notes.mdc` (linguagem de negócio, sem nomes técnicos). As permissões do agente são restritas em `.cursor/cli.json` (só escreve no `CHANGELOG.md`).
4. Mostra o diff das notas e pede confirmação `y/n` (pule com `-Yes`).
5. Bumpa as 4 fontes (`package.json` raiz e frontend, `backend/pyproject.toml`, `backend/app/core/version.py`) e carimba `## [X.Y.Z] - data` no changelog (atualizando os links).
6. Roda `scripts/build-desktop.ps1` (PyInstaller + smoke). Se a build falhar, **aborta sem commit/tag**.
7. Build verde: cria o commit `chore(release): vX.Y.Z` e a tag `vX.Y.Z` **localmente, sem push**.

Flags: `-Yes` (sem confirmação), `-SkipBuild` (só gera/edita as notas, sem buildar nem taggear).

## Release notes (novidades)

- O `CHANGELOG.md` segue *Keep a Changelog* + SemVer; o estilo das notas está em `.cursor/rules/release-notes.mdc`.
- O backend lê o changelog (`app/core/release_notes.py`) e retorna as notas da versão atual em `/info`.
- No app empacotado, o `CHANGELOG.md` é incluído via `--add-data` (`scripts/build-desktop.ps1`) e resolvido por `sys._MEIPASS`.
- Se a versão atual não tiver seção no changelog, cai na última versão lançada (com data).

## Regras

- O selo do banco fica **atualizado** quando a versão gravada no arquivo é igual (ou maior) à esperada pelo código; senão, **desatualizado**.
- Como o `init_db()` migra e grava `user_version` na subida, em operação normal o selo aparece como **atualizado**.

## Implementação técnica

- Backend: `backend/app/api/info.py`, `backend/app/schemas/info.py`, `backend/app/core/version.py`, `backend/app/core/release_notes.py`.
- Frontend: `frontend/src/routes/info/+page.svelte`, `frontend/src/lib/api/info.ts`, `frontend/src/lib/version.ts`, rodapé em `frontend/src/routes/+layout.svelte`.
- Versão do frontend injetada via `define` em `frontend/vite.config.ts`.
- Release em 1 comando: `scripts/release.ps1` (`npm run release`), apoiado por `.cursor/rules/release-notes.mdc` e `.cursor/cli.json`; empacotamento do changelog em `scripts/build-desktop.ps1`.

## Casos de uso E2E

- `UI-INFO-001` — página `/info` exibe versões e selo de banco; link de versão no rodapé leva a `/info`.
- `UI-INFO-002` — página `/info` exibe a seção de novidades (release notes) da versão atual.
