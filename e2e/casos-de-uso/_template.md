# [Título do caso]

## Metadados

- **ID:** `UI-AST-000` ou `UI-PRT-000` ou `UI-CNS-000` ou `API-XXX-000`
- **Status:** rascunho
- **Página:** `/assets` ou `/portfolios` ou `/portfolios/consolidada` ou endpoint API
- **Funcionalidade:** descrição curta
- **Depende de:** `UI-AST-000` ou «nenhum» / «base de teste vazia após globalSetup»
- **Arquivo de teste:** `e2e/specs/{pagina}/….spec.ts`
- **Referência:** rota Svelte, endpoint ou doc de produto

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único)
- **Lookup:** `yfinance` ou «não se aplica»
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001` (ver `e2e/test-env.js`)

> Ver [`dependencias.md`](dependencias.md) e [`estrategia-e2e-ui.md`](estrategia-e2e-ui.md).

## Cenário — [nome curto]

**Como** investidor  
**Quero** [ação]  
**Para** [benefício]

### Passo a passo

1. …
2. …

## Notas para automação (fase 2)

- …
