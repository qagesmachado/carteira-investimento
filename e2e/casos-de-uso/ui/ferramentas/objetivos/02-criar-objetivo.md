# Criar objetivo financeiro

## Metadados

- **ID:** `UI-OBJ-002`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** criar novo objetivo
- **Depende de:** `UI-OBJ-001`
- **Arquivo de teste:** `e2e/specs/objetivos/02-criar-objetivo.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — criar objetivo

**Como** investidor  
**Quero** criar um objetivo «Reserva Emergência»  
**Para** alocar parte dos meus ativos nele

### Passo a passo

1. Abro `/objetivos` com carteira seed.
2. Clico em «Novo objetivo».
3. Informo nome «Reserva Emergência» e salvo.
4. Vejo o card do novo objetivo na lista (além do Livre).
