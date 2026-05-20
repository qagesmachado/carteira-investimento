# Filtro por texto na tabela de posições

## Metadados

- **ID:** `UI-PRT-021`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** busca nas posições da carteira ativa
- **Depende de:** mix de posições (BBSE3 + VOO + RF)
- **Arquivo de teste:** `e2e/specs/portfolios/21-filtro-texto-posicoes.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Filtrar posições por ticker

**Como** investidor  
**Quero** buscar nas posições já adicionadas  
**Para** localizar um ativo rapidamente na tabela

### Passo a passo

1. Carteira `E2E Principal` ativa com posições `BBSE3`, `VOO` e RF manual.
2. No card Posições, preencho «Buscar» com `BBSE`.
3. A linha `BBSE3` permanece visível.
4. A linha `VOO` deixa de aparecer na tabela.
