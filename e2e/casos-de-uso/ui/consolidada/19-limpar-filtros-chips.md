# Limpar filtros e chips ativos

## Metadados

- **ID:** `UI-CNS-019`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** chips removíveis e botão «Limpar filtros»
- **Depende de:** `UI-CNS-002`
- **Arquivo de teste:** `e2e/specs/consolidada/19-limpar-filtros-chips.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Limpar filtros após busca

**Como** investidor  
**Quero** remover filtros rapidamente  
**Para** voltar a ver todas as posições

### Passo a passo

1. Seed com `E2E Principal` e posições `BBSE3` + `VOO`.
2. Abro `/consolidada`.
3. Filtro por texto `BBSE` — só `BBSE3` permanece.
4. Clico em «Limpar filtros».
5. `BBSE3` e `VOO` voltam a aparecer na tabela.
