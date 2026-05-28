# Projeção por ativo com patrimônio final

## Metadados

- **ID:** `UI-REB-007`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/07-patrimonio-final-por-ativo.spec.ts`

## Cenário

**Como** investidor  
**Quero** ver quanto falta em cada ativo quando informo um patrimônio final  
**Para** distribuir o aporte previsto por ticker

### Passo a passo

1. Carteira com ações classificadas (Soma) na aba Ações/ETF BR.
2. Preencho «Patrimônio final» na tabela de balanceamento por classe.
3. A tabela «Por ativo» exibe a coluna «Faltando (patrimônio final)» com valores calculados para ativos com % desejada.
