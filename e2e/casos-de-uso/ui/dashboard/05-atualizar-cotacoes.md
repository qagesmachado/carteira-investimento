# Atualizar cotações no dashboard

## Metadados

- **ID:** `UI-DASH-005`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** refresh de cotações da carteira ativa
- **Depende de:** seed consolidada mínima
- **Arquivo de teste:** `e2e/specs/dashboard/05-atualizar-cotacoes.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Lookup:** `yfinance`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Refresh de cotações

**Como** investidor  
**Quero** atualizar cotações a partir do dashboard  
**Para** ver patrimônio e alocação com preços recentes

### Passo a passo

1. Existe carteira ativa com posições (seed API).
2. Abro `/dashboard`.
3. Clico «Atualizar cotações».
4. Alerta de sucesso com «Cotações atualizadas» fica visível.
