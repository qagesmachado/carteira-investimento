# Alocação por classe — Gráfico rosca

## Metadados

- **ID:** `UI-DASH-004`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** gráfico rosca de alocação com legenda em tabela e linha «Total»
- **Depende de:** seed consolidada com cotações atualizadas
- **Arquivo de teste:** `e2e/specs/dashboard/04-alocacao-barras-pizza.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** `yfinance`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Rosca com legenda

**Como** investidor  
**Quero** ver a alocação por classe em gráfico rosca  
**Para** visualizar a distribuição do patrimônio

### Passo a passo

1. Existe carteira ativa com posições e cotações (seed + refresh).
2. Abro `/dashboard`.
3. Na seção «Alocação por classe», o gráfico rosca (SVG) aparece com legenda em tabela.
4. A linha «Total» exibe a soma de percentuais e valores em BRL.
5. Os filtros «Ativos que não são investimento» e «Previdência» aparecem desmarcados e sincronizam patrimônio e rosca.
