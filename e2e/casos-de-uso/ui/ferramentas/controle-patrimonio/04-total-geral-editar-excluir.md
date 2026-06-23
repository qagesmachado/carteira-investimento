# Total geral — editar e excluir item

## Metadados

- **ID:** `UI-PAT-004`
- **Status:** aprovado
- **Página:** `/ferramentas/controle-patrimonio`
- **Funcionalidade:** total geral reflete manuais; editar e excluir
- **Depende de:** `UI-PAT-002`, `UI-PAT-003`
- **Arquivo de teste:** `e2e/specs/ferramentas/controle-patrimonio/04-total-geral-editar-excluir.spec.ts`
- **Referência:** [controle-patrimonio.md](../../../../../docs/produto/desenvolvido/controle-patrimonio.md)

## Cenário — total e manutenção

**Como** investidor  
**Quero** ver o total geral somando investido e manual, e poder editar ou excluir itens  
**Para** manter o controle atualizado

### Passo a passo

1. Abro a página com investido R$ 1.000, reserva R$ 5.000 e espécie R$ 500 (via seed ou passos anteriores).
2. Vejo «Total geral» = R$ 6.500,00.
3. Edito a reserva para R$ 4.000 — total geral passa a R$ 5.500,00.
4. Excluo o item de espécie — total geral passa a R$ 5.000,00 (investido + reserva).
