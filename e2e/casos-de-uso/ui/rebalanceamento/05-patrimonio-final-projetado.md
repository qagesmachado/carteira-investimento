# Projeção com valor a investir

## Metadados

- **ID:** `UI-REB-005`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/05-patrimonio-final-projetado.spec.ts`

## Cenário

**Como** investidor  
**Quero** informar quanto vou investir  
**Para** ver quanto deveria ter em cada classe, o aporte sugerido e o patrimônio final calculado

### Passo a passo

1. Carteira com posições em várias classes (seed mix).
2. Abro `/rebalanceamento`.
3. Preencho «Valor a investir» na linha TOTAL.
4. As colunas «Deveria ter» e «Aporte sugerido» exibem valores calculados (não «—») para classes abaixo da meta.
5. O resumo exibe «Patrimônio final» derivado do aporte.
