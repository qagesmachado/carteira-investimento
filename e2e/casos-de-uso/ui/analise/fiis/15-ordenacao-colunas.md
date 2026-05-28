# Ordenação de colunas na tabela de FIIs

## Metadados

- **ID:** `UI-ANL-015`
- **Status:** aprovado
- **Página:** `/analise/fiis`
- **Funcionalidade:** ordenação por coluna na grade de análise de FIIs
- **Depende de:** carteira ativa com pelo menos dois FIIs
- **Arquivo de teste:** `e2e/specs/analise/fiis/15-ordenacao-colunas.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ordenar coluna Ticker

**Como** investidor  
**Quero** ordenar a tabela de FIIs por coluna  
**Para** comparar fundos em ordem alfabética ou inversa

### Passo a passo

1. Carteira `E2E Principal` ativa com `BTLG11` e `HGLG11` na tabela.
2. Clico no cabeçalho «Ticker» (primeira ordenação ascendente).
3. Anoto o ticker da primeira linha.
4. Clico novamente no cabeçalho «Ticker» (ordem descendente).
5. O ticker da primeira linha é diferente do passo 3.
