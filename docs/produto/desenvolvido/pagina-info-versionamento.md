# Página Info e versionamento

## Objetivo

Reunir, em uma única tela técnica (`/info`), as versões e detalhes do ambiente em execução — útil para conferência após atualizações e para suporte.

## Escopo

- Página **`/info`** com tabela de versões: aplicação (backend), frontend, schema esperado (código), versão do banco (arquivo do usuário) com selo **atualizado/desatualizado**, Python, modo de lookup e caminho do banco.
- Indicador discreto de versão no **rodapé** de todas as telas, com link para `/info` (sem poluir a navbar).
- Endpoint **`/info`** no backend (`/api/info` no app empacotado) com os dados de versão.

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

## Regras

- O selo do banco fica **atualizado** quando a versão gravada no arquivo é igual (ou maior) à esperada pelo código; senão, **desatualizado**.
- Como o `init_db()` migra e grava `user_version` na subida, em operação normal o selo aparece como **atualizado**.

## Implementação técnica

- Backend: `backend/app/api/info.py`, `backend/app/schemas/info.py`, `backend/app/core/version.py`.
- Frontend: `frontend/src/routes/info/+page.svelte`, `frontend/src/lib/api/info.ts`, `frontend/src/lib/version.ts`, rodapé em `frontend/src/routes/+layout.svelte`.
- Versão do frontend injetada via `define` em `frontend/vite.config.ts`.

## Casos de uso E2E

- `UI-INFO-001` — página `/info` exibe versões e selo de banco; link de versão no rodapé leva a `/info`.
