# Testes E2E (Playwright)

Suíte de testes de ponta a ponta da **carteira-investimento**: browser real, frontend Svelte, API FastAPI, SQLite de teste isolado e **lookup yfinance** (cenário real com rede).

Documentação dos cenários (BDD): [`casos-de-uso/`](casos-de-uso/README.md)  
Estratégia E2E UI: [`casos-de-uso/estrategia-e2e-ui.md`](casos-de-uso/estrategia-e2e-ui.md)

## Pré-requisitos

- Node.js (para `e2e/`)
- Python do backend (venv em `backend/.venv` ou `python` no PATH) — ver [`resolve-backend-python.js`](resolve-backend-python.js)
- **Conexão à internet** (lookup de ativos, cotações e câmbio USD/BRL)
- Browsers Playwright (primeira vez):

```powershell
cd e2e
npm install
npx playwright install chromium
```

## Ambiente que o Playwright sobe sozinho

| Serviço   | URL                         | Notas                          |
| --------- | --------------------------- | ------------------------------ |
| API       | http://127.0.0.1:8001       | Não use a porta 8000 do dev    |
| Frontend  | http://127.0.0.1:5174       | Não use a porta 5173 do dev    |
| DB ativos | `backend/data/test/carteira.db` | Recriado no `pretest:ui`   |
| DB carteiras | `backend/data/test/portfolios.db` | Idem                    |

Não é preciso rodar `npm run dev` nem uvicorn manualmente para os testes UI.

## Executar testes UI

| Comando | Projeto | Lookup | Requisitos |
| ------- | ------- | ------ | ---------- |
| `npm run test:ui` | `ui` | `yfinance` (rede) | Internet |

Antes de cada `npm run test:ui`, o npm executa `pretest:ui` → [`scripts/reset-test-db.js`](scripts/reset-test-db.js) (apaga os `.db` de teste **antes** do servidor subir).

### Suíte por página

| Pasta | Rota | Casos | Comando |
| ----- | ---- | ----- | ------- |
| `specs/assets/` | `/assets` | UI-AST 001–018 | `npm run test:ui -- specs/assets` |
| `specs/portfolios/` | `/portfolios` | UI-PRT 001–023 | `npm run test:ui -- specs/portfolios` |
| `specs/consolidada/` | `/portfolios/consolidada` | UI-CNS 001–016 | `npm run test:ui -- specs/consolidada` |

Helpers compartilhados: `specs/helpers/` (não são specs executáveis).

## Rodar um spec ou pasta específica

Use `--` para passar argumentos ao Playwright:

```powershell
cd e2e

# Suíte UI completa (57 specs: assets + portfolios + consolidada)
npm run test:ui

# Por página
npm run test:ui -- specs/assets
npm run test:ui -- specs/portfolios
npm run test:ui -- specs/consolidada

# Um arquivo
npm run test:ui -- specs/assets/02-busca-lookup-individual.spec.ts
```

## Browser visível (`--headed`)

```powershell
npm run test:ui -- --headed
npm run test:ui -- specs/assets/02-busca-lookup-individual.spec.ts --headed
```

## Modo debug (Playwright Inspector)

```powershell
npm run test:ui -- --debug
npm run test:ui -- specs/assets/02-busca-lookup-individual.spec.ts --debug
```

Atalhos úteis no Inspector: **F8** continuar, **F10** próximo passo.

## UI Mode (painel gráfico)

```powershell
npm run test:ui -- --ui
```

No UI Mode escolha o projeto **`ui`** e os testes na interface.

## Pausar em um ponto do código

```typescript
await page.pause();
```

```powershell
$env:PWDEBUG=1
npm run test:ui -- specs/assets/02-busca-lookup-individual.spec.ts
```

## Relatório HTML após falha

```powershell
npx playwright show-report
```

## Resumo rápido

| Objetivo | Comando |
| -------- | ------- |
| Suíte UI completa | `npm run test:ui` |
| Só `/assets` | `npm run test:ui -- specs/assets` |
| Só `/portfolios` | `npm run test:ui -- specs/portfolios` |
| Só consolidada | `npm run test:ui -- specs/consolidada` |
| Ver o browser | `npm run test:ui -- --headed` |
| Depurar passo a passo | `npm run test:ui -- --debug` |
| Painel interativo | `npm run test:ui -- --ui` |
| Um spec | `npm run test:ui -- caminho/do.spec.ts` |

## Problemas comuns

### `reset-test-db: arquivo em uso`

Outro processo está com os `.db` ou a porta **8001** aberta.

1. Feche terminais com uvicorn/playwright presos  
2. Rode de novo `npm run test:ui`  
3. Se persistir: apague `backend/data/test/*.db` com tudo parado  

### Teste falha ou dá skip (rede)

A suíte usa yfinance. Sem internet ou com rate limit, o `beforeEach` pode fazer **skip**. Rode de novo quando a rede estiver estável.

### Frontend/API do dev (5173 / 8000) em vez do E2E

Os testes usam **5174** e **8001**. Dados e provider no dev podem diferir do ambiente E2E.

### Rodar Playwright sem `npm run`

`npx playwright test ...` **não** executa o `pretest` (reset do DB). Prefira `npm run test:ui`.

## Estrutura de pastas

```
e2e/
  casos-de-uso/     # especificação Markdown
  specs/
    assets/         # UI-AST-001 … 018 (18 specs)
    consolidada/    # UI-CNS-001 … 015 (15 specs)
    helpers/        # seedAssets, consolidadaPage, lookupFlows, …
  scripts/
    reset-test-db.js
  playwright.config.js
  test-env.js
```

- Ativos: [`casos-de-uso/ui/assets/README.md`](casos-de-uso/ui/assets/README.md)  
- Consolidada: [`casos-de-uso/ui/consolidada/README.md`](casos-de-uso/ui/consolidada/README.md)
