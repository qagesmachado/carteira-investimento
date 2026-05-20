# Carteira de Investimentos

Aplicação web local para controle de carteira de investimentos.

## Stack

- Frontend: SvelteKit + TypeScript
- Backend: FastAPI
- Banco: SQLite
- ORM: SQLModel
- Testes unitários backend: pytest
- Testes unitários frontend: Vitest
- Testes de integração: Playwright (API + UI) em `e2e/`

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --reload
```

Os scripts `npm run test:*` na raiz usam automaticamente `backend\.venv\Scripts\python.exe` quando o venv existe.

API local (ver esquemas e testes em `http://127.0.0.1:8000/docs`):

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/assets` — `GET` (listar), `POST` (criar)
- `http://127.0.0.1:8000/assets/lookup?symbol=PETR4` — `GET` (prévia yfinance)
- `PATCH http://127.0.0.1:8000/assets/{id}` — atualização parcial (corpo JSON com os campos a alterar)
- `DELETE http://127.0.0.1:8000/assets/{id}` — remover (`204`)
- `POST http://127.0.0.1:8000/assets/bulk/preview` — prévia em lote (yfinance)
- `POST http://127.0.0.1:8000/assets/bulk` — criar vários ativos
- `http://127.0.0.1:8000/dividend-payments` — CRUD de proventos (vinculados a ativos)
- `http://127.0.0.1:8000/portfolios` — CRUD de carteiras (SQLite local do usuário)
- `GET/PUT http://127.0.0.1:8000/portfolios/active` — carteira ativa
- `GET http://127.0.0.1:8000/portfolios/{id}/export` — exportar JSON
- `POST http://127.0.0.1:8000/portfolios/import/preview` e `/import` — importar com conferência de ativos
- `http://127.0.0.1:8000/docs`

### Persistência

| Dado | Arquivo / variável | No Git |
|------|-------------------|--------|
| Catálogo público (fonte) | [`backend/seed/assets.json`](backend/seed/assets.json) | **Sim** — exemplo para clone |
| Catálogo pessoal (opcional) | `backend/seed/assets.local.json` | **Não** — mesclado no seed local |
| Base de ativos (runtime) | `DATABASE_URL` (padrão `backend/carteira.db`) | **Não** — gerado localmente |
| Carteiras e posições | `PORTFOLIOS_DATABASE_URL` ou `%LOCALAPPDATA%/carteira-investimento/portfolios.db` | **Nunca** |
| Troca entre máquinas | arquivo `.carteira.json` (export manual) | só se o usuário versionar o arquivo |

Variáveis opcionais: `LOCAL_DATA_DIR`, `PORTFOLIOS_DATABASE_URL`, `DATABASE_URL`, `ASSET_LOOKUP_MODE`.

#### Catálogo após clone

```powershell
# Na raiz do repositório (cria ou atualiza backend/carteira.db a partir do JSON)
npm run db:seed

# Recriar o catálogo só com os JSON (apaga ativos locais extras)
npm run db:seed:fresh

# Exportar seu catálogo real para assets.local.json (não vai ao Git)
npm run db:export

# Atualizar o catálogo público do repositório (revisar diff antes do commit)
npm run db:export:public
```

Equivalente em `backend/`: `python -m app.seed` (upsert), `python -m app.seed --fresh`, `python -m app.seed --export`. Ver [`backend/seed/README.md`](backend/seed/README.md).

Testes:

```powershell
cd backend
python -m pytest
```

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Aplicação local:

- `http://127.0.0.1:5173`
- `http://127.0.0.1:5173/assets`
- `http://127.0.0.1:5173/proventos`
- `http://127.0.0.1:5173/portfolios`

Testes:

```powershell
cd frontend
npm test
```

## Testes de integração (Playwright)

Simula uso real: API (uvicorn) + frontend (Vite) + banco SQLite dedicado (`backend/data/test/carteira.db`), separado do `carteira.db` de desenvolvimento.

Variáveis no servidor de teste:

- `DATABASE_URL=sqlite:///./data/test/carteira.db`
- `ASSET_LOOKUP_MODE=fake` (lookup determinístico, sem rede)

Casos de uso (especificação antes dos testes): [`e2e/casos-de-uso/`](e2e/casos-de-uso/).

```powershell
# Na raiz do repositório
npm run test:unit          # pytest + vitest (rápido, sem relatório)
npm run test:integration   # Playwright UI (59+ specs)
npm run test:report        # 3 níveis + pasta datada em test-reports/
npm run test:all           # igual a test:report
```

Relatórios datados (backend, frontend e E2E individuais): [`test-reports/README.md`](test-reports/README.md).

Primeira vez em `e2e/`: `npm install` e `npx playwright install chromium` (o script `test-report` instala se faltar). Requer Node.js 18+ e Python com dependências do backend instaladas (`pip install -e ".[dev]"` no `backend/`).

Se a porta 8000 já estiver em uso (servidor de dev), o Playwright reutiliza o servidor existente (`reuseExistingServer` quando `CI` não está definido).

### Logs do backend

No diretório `backend/`, use a variável `LOG_LEVEL` (padrão `INFO`; `DEBUG` para mais detalhe):

```powershell
$env:LOG_LEVEL = "DEBUG"
uvicorn app.main:app --reload
```

Eventos de importação, renomeação de carteira e respostas HTTP com erro (≥ 400) são registrados no log da aplicação.

## Funcionalidades atuais

- Health check entre frontend e backend.
- Cadastro de ativos no banco de dados (criar, listar, **editar** e **excluir** via API).
- Formulário completo editável após lookup yfinance (classificação, fiscais, cotação, observações).
- Busca inicial de ativos via yfinance (`/assets/lookup`).
- Listagem com **filtro** por ticker ou nome; tickers B3 exibidos **sem** sufixo `.SA`.
- **Importação em lote** (CSV, TXT ou lista separada por vírgula) com pré-visualização e save selecionado.
- Visual inicial com Tailwind CSS e daisyUI.
