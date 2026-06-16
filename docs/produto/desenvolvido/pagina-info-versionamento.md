# Página Info

## Objetivo

Reunir, em uma tela técnica (`/info`), o estado do banco de dados em execução — útil para conferir se o banco está atualizado (migration) e localizar o arquivo, principalmente em suporte.

## Escopo

- Página **`/info`** com:
  - **Banco (arquivo do usuário):** versão do banco (`PRAGMA user_version`) com selo **atualizado/desatualizado**.
  - **Caminho do banco:** caminho do arquivo `carteira.db` em uso.
- Indicador discreto de versão no **rodapé** de todas as telas, com link para `/info`.
- Endpoint **`/info`** no backend (`/api/info` no app empacotado) com o estado do banco.

## Dados retornados pelo `/info`

| Dado | Origem |
| --- | --- |
| `db_user_version` | `PRAGMA user_version` do banco do usuário (lido por request) |
| `db_up_to_date` | `db_user_version >= SCHEMA_VERSION` (`backend/app/db/session.py`) |
| `database_path` | caminho do `carteira.db` (engine atual) |

## Regras

- O selo do banco fica **atualizado** quando a versão gravada no arquivo é igual (ou maior) à esperada pelo código; senão, **desatualizado**.
- Como o `init_db()` migra e grava `user_version` na subida, em operação normal o selo aparece como **atualizado**.

## Implementação técnica

- Backend: `backend/app/api/info.py`, `backend/app/schemas/info.py`.
- Frontend: `frontend/src/routes/info/+page.svelte`, `frontend/src/lib/api/info.ts`, rodapé em `frontend/src/routes/+layout.svelte`.

## Casos de uso E2E

- `UI-INFO-001` — página `/info` exibe a versão do banco com selo e o caminho do banco; link de versão no rodapé leva a `/info`.
