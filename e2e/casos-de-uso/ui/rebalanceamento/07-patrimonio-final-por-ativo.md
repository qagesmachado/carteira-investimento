# Projeção por ativo com valor a investir

## Metadados

- **ID:** `UI-REB-007`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/07-patrimonio-final-por-ativo.spec.ts`

## Cenário

**Como** investidor  
**Quero** ver quanto deveria ter e quanto aportar em cada ativo quando informo um valor a investir  
**Para** rebalancear dentro da classe Ações/ETF BR

### Passo a passo

1. Carteira com duas ações pontuadas (seed).
2. Preencho «Valor a investir» na tabela de balanceamento por classe.
3. A tabela «Por ativo» exibe as colunas «Deveria ter» e «Aporte sugerido» com valores calculados para ativos com % desejada.
