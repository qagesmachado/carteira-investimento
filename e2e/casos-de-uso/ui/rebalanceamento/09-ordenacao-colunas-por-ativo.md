# Ordenação de colunas na tabela por ativo

## Metadados

- **ID:** `UI-REB-009`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/09-ordenacao-colunas-por-ativo.spec.ts`

## Cenário

**Como** investidor  
**Quero** ordenar a tabela Por ativo pelas colunas  
**Para** comparar posições por ticker, valor ou % desejada

### Passo a passo

1. Duas ações na carteira (seed API).
2. Abro `/rebalanceamento` e localizo a seção **Por ativo**.
3. Clico no cabeçalho **Ticker** — a ordem muda.
4. Clico novamente — a ordem inverte.
