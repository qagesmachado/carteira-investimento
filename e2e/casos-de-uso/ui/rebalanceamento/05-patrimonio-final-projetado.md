# Projeção com patrimônio final

## Metadados

- **ID:** `UI-REB-005`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/05-patrimonio-final-projetado.spec.ts`

## Cenário

**Como** investidor  
**Quero** informar o patrimônio total após um aporte  
**Para** ver quanto falta em cada classe em relação a esse valor final

### Passo a passo

1. Carteira com posições em várias classes (seed mix).
2. Abro `/rebalanceamento`.
3. Preencho «Patrimônio final» na linha TOTAL com valor maior que o patrimônio atual.
4. A coluna «Faltando (patrimônio final)» exibe valores calculados (não «—») para classes abaixo da meta.
