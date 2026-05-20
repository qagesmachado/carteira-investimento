# Exportar carteira JSON

## Metadados

- **ID:** `UI-PRT-010`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** download do arquivo `.carteira.json`
- **Depende de:** `UI-PRT-005` (carteira com posições)
- **Arquivo de teste:** `e2e/specs/portfolios/10-exportar-carteira-json.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Exportar carteira ativa

**Como** investidor  
**Quero** exportar minha carteira  
**Para** backup ou importação em outro ambiente de teste

### Passo a passo

1. Carteira `E2E Principal` está ativa com pelo menos uma posição de mercado.
2. Estou em `/portfolios`.
3. Clico em exportar carteira (formato JSON).
4. Aguardo o download.
5. Um arquivo `.carteira.json` é baixado.
6. O JSON referencia tickers da carteira (ex.: `BBSE3`).
7. O arquivo pode ser usado em `UI-PRT-011`.

## Notas para automação (fase 2)

- `page.waitForEvent('download')` e validar JSON parseável.
