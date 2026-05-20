# Casos E2E — Visão consolidada (`/portfolios/consolidada`)

**Rota:** `http://127.0.0.1:5174/portfolios/consolidada` (E2E)  
**Prefixo de ID:** `UI-CNS-`

**Estratégia:** [`../../estrategia-e2e-ui.md`](../../estrategia-e2e-ui.md) — cenário real (yfinance + rede). Comando: `npm run test:ui -- specs/consolidada`.

Seed via API no `beforeEach` de cada spec (não depende da suíte UI de portfolios).

| ID | Arquivo | Status | Spec |
| -- | ------- | ------ | ---- |
| `UI-CNS-001` | [01-carregamento-sem-carteira.md](01-carregamento-sem-carteira.md) | implementado | `e2e/specs/consolidada/01-carregamento-sem-carteira.spec.ts` |
| `UI-CNS-002` | [02-seletor-carteira-ativa.md](02-seletor-carteira-ativa.md) | implementado | `02-seletor-carteira-ativa.spec.ts` |
| `UI-CNS-003` | [03-atualizar-cambio-usd-brl.md](03-atualizar-cambio-usd-brl.md) | implementado | `03-atualizar-cambio-usd-brl.spec.ts` |
| `UI-CNS-004` | [04-atualizar-cotacoes.md](04-atualizar-cotacoes.md) | implementado | `04-atualizar-cotacoes.spec.ts` |
| `UI-CNS-005` | [05-filtro-texto-busca.md](05-filtro-texto-busca.md) | implementado | `05-filtro-texto-busca.spec.ts` |
| `UI-CNS-006` | [06-filtro-renda-fixa-inclui-etf-rf.md](06-filtro-renda-fixa-inclui-etf-rf.md) | implementado | `06-filtro-renda-fixa-inclui-etf-rf.spec.ts` |
| `UI-CNS-007` | [07-cartoes-resumo-brl-usd-consolidado.md](07-cartoes-resumo-brl-usd-consolidado.md) | implementado | `07-cartoes-resumo-brl-usd-consolidado.spec.ts` |
| `UI-CNS-008` | [08-tabela-ordenacao-colunas.md](08-tabela-ordenacao-colunas.md) | implementado | `08-tabela-ordenacao-colunas.spec.ts` |
| `UI-CNS-009` | [09-colunas-valores-usd-tooltip.md](09-colunas-valores-usd-tooltip.md) | implementado | `09-colunas-valores-usd-tooltip.spec.ts` |
| `UI-CNS-010` | [10-tabela-layout-colunas.md](10-tabela-layout-colunas.md) | implementado | `10-tabela-layout-colunas.spec.ts` |
| `UI-CNS-011` | [11-estados-sem-linhas-filtro.md](11-estados-sem-linhas-filtro.md) | implementado | `11-estados-sem-linhas-filtro.spec.ts` |
| `UI-CNS-012` | [12-trocar-carteira-seletor.md](12-trocar-carteira-seletor.md) | implementado | `12-trocar-carteira-seletor.spec.ts` |
| `UI-CNS-013` | [13-filtro-tipo-moeda.md](13-filtro-tipo-moeda.md) | implementado | `13-filtro-tipo-moeda.spec.ts` |
| `UI-CNS-014` | [14-filtro-classe-nacional.md](14-filtro-classe-nacional.md) | implementado | `14-filtro-classe-nacional.spec.ts` |
| `UI-CNS-015` | [15-limpar-filtro-restaura-linhas.md](15-limpar-filtro-restaura-linhas.md) | implementado | `15-limpar-filtro-restaura-linhas.spec.ts` |
| `UI-CNS-016` | [16-detalhes-posicao-precos.md](16-detalhes-posicao-precos.md) | implementado | `16-detalhes-posicao-precos.spec.ts` |
| `UI-CNS-017` | [17-proventos-no-detalhe.md](17-proventos-no-detalhe.md) | rascunho | — |

Caminho completo: `e2e/specs/consolidada/`.

**Total:** 17 casos · **16 specs** · ETF RF no caso 006: **`AUVP11`**
