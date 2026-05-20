# Filtro por texto na consolidada

## Metadados

- **ID:** `UI-CNS-005`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** busca por texto na tabela
- **Depende de:** `UI-PRT-012` (carteira com várias posições)
- **Arquivo de teste:** `e2e/specs/consolidada/05-filtro-texto-busca.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Filtrar por BBSE

**Como** investidor  
**Quero** buscar um ativo na tabela consolidada  
**Para** focar em um ticker

### Passo a passo

1. Tabela consolidada exibe várias linhas (`BBSE3`, `VOO`, etc.).
2. Digito `BBSE` no filtro de busca.
3. Aguardo aplicação do filtro.
4. Apenas linhas compatíveis com `BBSE` permanecem visíveis.
5. Linhas como `VOO` ficam ocultas.

## Notas para automação (fase 2)

- Base para `UI-CNS-015` (limpar filtro).
