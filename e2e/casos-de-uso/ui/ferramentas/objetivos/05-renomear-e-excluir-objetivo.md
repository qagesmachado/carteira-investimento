# Renomear e excluir objetivo

## Metadados

- **ID:** `UI-OBJ-005`
- **Status:** aprovado
- **Página:** `/ferramentas/objetivos`
- **Funcionalidade:** CRUD objetivo (exceto Livre)
- **Depende de:** `UI-OBJ-003`
- **Arquivo de teste:** `e2e/specs/ferramentas/objetivos/05-renomear-e-excluir-objetivo.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — excluir devolve ao Livre

**Como** investidor  
**Quero** excluir um objetivo com alocações  
**Para** que as cotas voltem ao Livre

### Passo a passo

1. Objetivo «Reserva» com 60 cotas PETR4 alocadas.
2. Renomeio para «Reserva 2026» e confirmo.
3. Excluo o objetivo.
4. PETR4 inteiro (100 cotas) aparece no Livre.
