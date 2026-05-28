# Abas por grupo de ativo

## Metadados

- **ID:** `UI-REB-006`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/06-abas-grupo-ativo.spec.ts`

## Cenário

**Como** investidor  
**Quero** alternar abas por grupo (Ações/ETF BR, ETF internacional, FII)  
**Para** ver posições de cada classe separadamente

### Passo a passo

1. Carteira com posições (seed mix).
2. Abro `/rebalanceamento` → seção «Por ativo».
3. Três abas visíveis; ao clicar em «ETF internacional», a aba fica selecionada.
