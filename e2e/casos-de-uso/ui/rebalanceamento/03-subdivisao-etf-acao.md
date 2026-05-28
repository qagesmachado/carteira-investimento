# Sub-divisão ETF / Ação

## Metadados

- **ID:** `UI-REB-003`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/03-subdivisao-etf-acao.spec.ts`

## Cenário

**Como** investidor  
**Quero** ver a relação ETF/Ação dentro de Ações/ETF BR  
**Para** acompanhar a sub-meta 70/30 da planilha

### Passo a passo

1. Carteira com posições em ações, ETF e renda fixa (seed mix).
2. Abro `/rebalanceamento`.
3. Bloco «Relação ETF / Ação» exibe linhas ETF (70%) e Ação (30%).
