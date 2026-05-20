# Alocação por classe — Barras e Pizza

## Metadados

- **ID:** `UI-DASH-004`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** alternar visualização de alocação entre barras e pizza
- **Depende de:** seed consolidada com cotações atualizadas
- **Arquivo de teste:** `e2e/specs/dashboard/04-alocacao-barras-pizza.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** `yfinance`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Toggle Barras/Pizza

**Como** investidor  
**Quero** alternar a alocação por classe entre barras e pizza  
**Para** visualizar a distribuição de outra forma

### Passo a passo

1. Existe carteira ativa com posições e cotações (seed + refresh).
2. Abro `/dashboard`.
3. Na seção «Alocação por classe», clico «Pizza».
4. O gráfico pizza (SVG) fica visível.
5. Clico «Barras» e as barras de alocação voltam a aparecer.
