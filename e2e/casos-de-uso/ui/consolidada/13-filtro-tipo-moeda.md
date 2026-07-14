# Filtro por tipo e moeda

## Metadados

- **ID:** `UI-CNS-013`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** filtros de tipo ETF e moeda USD
- **Depende de:** carteira com linhas BRL e USD
- **Arquivo de teste:** `e2e/specs/consolidada/13-filtro-tipo-moeda.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ver só ETF em USD

**Como** investidor  
**Quero** filtrar por tipo ETF e moeda USD  
**Para** ver só exposição internacional

### Passo a passo

1. Existem linhas BRL e USD na tabela consolidada.
2. Seleciono tipo «ETF» (ou equivalente).
3. Seleciono moeda «USD».
4. Apenas ETFs em USD (ex.: `VOO`) aparecem.
5. Posições BRL somem da tabela filtrada.

## Notas para automação (fase 2)

- Limpar filtros antes/depois se a suíte continuar na mesma página.
