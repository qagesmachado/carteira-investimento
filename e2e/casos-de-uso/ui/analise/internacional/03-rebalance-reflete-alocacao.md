# Rebalanceamento reflete alocação internacional

## Metadados

- **ID:** `UI-ANL-016`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/analise/internacional/03-rebalance-reflete-alocacao.spec.ts`

## Referência

- [classificacao-ativos-etf-intl.md](../../../../docs/produto/desenvolvido/classificacao-ativos-etf-intl.md)

## Cenário

**Como** investidor  
**Quero** ver % desejada no rebalanceamento após salvar alocação  
**Para** acompanhar gap por ETF internacional

### Pré-condições

- Alocação salva em `/analise/internacional` (VOO = 100%).

### Passo a passo

1. Abro `/rebalanceamento`.
2. Seleciono aba **ETF internacional**.
3. Linha VOO exibe % desejada preenchida (não «—»).
