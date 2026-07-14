# Filtro por classe Nacional

## Metadados

- **ID:** `UI-CNS-014`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** filtro de classe Nacional
- **Depende de:** mix nacional e internacional na carteira
- **Arquivo de teste:** `e2e/specs/consolidada/14-filtro-classe-nacional.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Filtrar ativos nacionais

**Como** investidor  
**Quero** filtrar por classe  
**Para** separar ativos nacionais

### Passo a passo

1. Existem ativos com classe «Nacional» e internacionais na carteira ativa.
2. Aplico filtro de classe «Nacional».
3. Apenas ativos classificados como nacionais na base de teste permanecem visíveis.

## Notas para automação (fase 2)

- Depende de classificação correta no cadastro de ativos.
