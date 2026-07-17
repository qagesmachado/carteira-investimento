# Editar metas de rebalanceamento

## Metadados

- **ID:** `UI-REB-002`
- **Status:** aprovado
- **Página:** `/rebalanceamento/configuracao`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/02-editar-metas.spec.ts`

## Cenário

**Como** investidor  
**Quero** alterar os percentuais alvo por classe  
**Para** que o rebalanceamento use minhas metas

### Passo a passo

1. Carteira ativa (seed mínimo).
2. Abro `/rebalanceamento/configuracao` e ajusto os sliders de classe (ex.: Ações/ETF BR 25%, Renda fixa 45%).
3. Salvo e volto à página principal.
4. A tabela reflete os novos percentuais na coluna Meta %.
