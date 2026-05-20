# Ordenação de colunas na tabela de posições

## Metadados

- **ID:** `UI-PRT-022`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** ordenação por coluna na grade de posições
- **Depende de:** mix de posições na carteira ativa
- **Arquivo de teste:** `e2e/specs/portfolios/22-ordenacao-colunas-posicoes.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ordenar coluna Ativo

**Como** investidor  
**Quero** ordenar a tabela de posições por coluna  
**Para** comparar ativos em ordem alfabética ou inversa

### Passo a passo

1. Carteira `E2E Principal` ativa com várias posições na tabela.
2. Clico no cabeçalho «Ativo» (primeira ordenação ascendente).
3. Anoto o ticker da primeira linha.
4. Clico novamente no cabeçalho «Ativo» (ordem descendente).
5. O ticker da primeira linha é diferente do passo 3.
