# Estratégia E2E — cenário real (UI)

A suíte Playwright de interface usa **um único nível**: integração real de ponta a ponta com rede.

## O que é real

| Camada | Comportamento |
| ------ | ------------- |
| Browser / Svelte | Real |
| API FastAPI | Real |
| SQLite `backend/data/test/*.db` | Real (isolado, reset no `pretest:ui`) |
| Lookup de ativos | **yfinance** (Yahoo Finance) |
| Cotações e FX (quando o caso exige) | **yfinance** / Yahoo |

Não há mock do backend nem do frontend. O clique em «Buscar ativo» chama `/assets/lookup` de verdade.

## Comando

```powershell
cd e2e
npm run test:ui
```

Antes de cada execução, `pretest:ui` apaga `backend/data/test/*.db`. Portas E2E: frontend **5174**, API **8001** (ver [`e2e/test-env.js`](../test-env.js)).

## Requisitos

- Node.js, Python do backend, Chromium Playwright
- **Conexão à internet** (lookup, refresh de cotações e câmbio)

## Pastas de specs

| Pasta | Rota | Casos |
| ----- | ---- | ----- |
| `e2e/specs/assets/` | `/assets` | UI-AST-001 … 018 |
| `e2e/specs/consolidada/` | `/portfolios/consolidada` | UI-CNS-001 … 015 |
| `e2e/specs/helpers/` | — | código compartilhado (não executável) |

## Metadados nos `.md` de casos de uso

- **Arquivo de teste:** `e2e/specs/{pagina}/….spec.ts`
- **Lookup:** `yfinance` ou «não se aplica»
- **URLs:** `5174` / `8001`

## Skips por rede

Se o Yahoo estiver indisponível ou com rate limit, specs que dependem de lookup podem fazer **skip** no `beforeEach` (`assertYfinanceLookupBackend`). Rode de novo ou verifique a rede.

## Helpers

`e2e/specs/helpers/` — seed, páginas, fluxos de lookup, fixtures de tickers estáveis.
