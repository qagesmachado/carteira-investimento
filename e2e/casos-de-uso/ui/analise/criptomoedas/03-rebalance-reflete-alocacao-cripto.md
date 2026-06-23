# Rebalanceamento reflete alocação cripto

## Metadados

- **ID:** `UI-CRP-003`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/analise/criptomoedas/03-rebalance-reflete-alocacao.spec.ts`

## Referência

- [analise-criptomoedas.md](../../../../docs/produto/desenvolvido/analise-criptomoedas.md)

## Cenário

**Como** investidor  
**Quero** ver a aba Criptomoedas no rebalanceamento  
**Para** comparar % atual vs. desejada por ativo

### Pré-condições

- Alocação salva em `/analise/criptomoedas` (UI-CRP-002).

### Passo a passo

1. Abro `/rebalanceamento`.
2. Seleciono a aba **Criptomoedas**.
3. Vejo BTC-USD e ABTC11 com % desejada conforme alocação salva.
