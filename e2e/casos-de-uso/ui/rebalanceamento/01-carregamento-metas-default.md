# Carregamento rebalanceamento com metas default

## Metadados

- **ID:** `UI-REB-001`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/01-carregamento-metas-default.spec.ts`

## Cenário

**Como** investidor  
**Quero** abrir o rebalanceamento da carteira  
**Para** ver a tabela de balanceamento com metas padrão

### Passo a passo

1. Carteira ativa sem posições (seed mínimo).
2. Abro `/rebalanceamento`.
3. Tabela «Balanceamento desejado» exibe as cinco classes com metas default (30/5/20/40/5).
