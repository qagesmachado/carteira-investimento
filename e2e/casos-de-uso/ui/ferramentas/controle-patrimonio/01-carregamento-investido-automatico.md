# Carregamento — patrimônio investido automático

## Metadados

- **ID:** `UI-PAT-001`
- **Status:** aprovado
- **Página:** `/ferramentas/controle-patrimonio`
- **Funcionalidade:** exibir patrimônio investido calculado das posições
- **Depende de:** seed com posição em ação (`seedPatrimonyControlWithStock`)
- **Arquivo de teste:** `e2e/specs/ferramentas/controle-patrimonio/01-carregamento-investido-automatico.spec.ts`
- **Referência:** [controle-patrimonio.md](../../../../../docs/produto/desenvolvido/controle-patrimonio.md)

## Cenário — carregamento inicial

**Como** investidor  
**Quero** ver o patrimônio investido da carteira  
**Para** saber quanto tenho alocado em ativos

### Passo a passo

1. Abro `/ferramentas/controle-patrimonio` com carteira seed (100 × R$ 10 = R$ 1.000).
2. Vejo o card «Patrimônio investido» com R$ 1.000,00.
3. Vejo o total geral igual ao investido (sem itens manuais).
