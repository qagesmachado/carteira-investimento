# Seletor de carteira no dashboard

## Metadados

- **ID:** `UI-DASH-003`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** trocar carteira ativa
- **Depende de:** duas carteiras com posições distintas (seed)
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Cenário — Troca de carteira

**Como** investidor  
**Quero** trocar a carteira no dashboard  
**Para** ver indicadores da outra carteira

### Passo a passo

1. Seed: duas carteiras; primeira com BBSE3, segunda vazia ou com outro ativo.
2. Abro `/dashboard` com carteira A ativa.
3. Seleciono carteira B no dropdown.
4. Cards e alocação refletem a carteira B (ex.: posições ativas diferente).
