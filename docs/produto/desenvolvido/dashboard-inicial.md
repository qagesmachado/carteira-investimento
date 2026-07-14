# Dashboard inicial (Tier 1 + 2 + melhorias visuais)

## Objetivo

Visão executiva da **carteira selecionada** em `/dashboard`: patrimônio, P&L, alocação por classe, proventos agregados, aderência ao rebalanceamento e atalhos para consolidada, rebalanceamento e proventos.

Equivalente parcial à aba `RESUMO` da planilha. Não substitui a tabela operacional em `/consolidada`.

## Escopo entregue

### Rota e navegação

- Página **`/dashboard`**
- Link **Dashboard** na navbar (antes de «Visão consolidada»)
- Home **`/`** permanece landing

### Hero e toolbar

- `PageHero` com título **Dashboard** (sem subtítulo)
- Toolbar com **Atualizar cotações**, **Atualizar câmbio** no canto direito do hero
- Painel de carteira: rótulo «Carteira», nome em negrito com dropdown; badges **USD/BRL** (bandeira EUA) e **Cotações** ([`CircleDollarSign`](https://lucide.dev/icons/circle-dollar-sign))
- Toolbar: [Atualizar cotações](https://lucide.dev/icons/refresh-cw) (legado SVG) · [Atualizar câmbio](https://lucide.dev/icons/banknote) (`Banknote` Lucide)

### Seletor de carteira

- Dropdown com carteiras disponíveis
- Sincroniza com carteira ativa (`GET/PUT /portfolios/active`)
- Badge USD/BRL quando há posições em dólar
- Ao trocar, recarrega indicadores

### Cards de resumo (KPIs com ícones Lucide)

Ícones via [Lucide](https://lucide.dev/icons/) — ver [icones-ui.md](icones-ui.md). Ex.: patrimônio [`Wallet`](https://lucide.dev/icons/wallet).

| Card | Fonte |
| ---- | ----- |
| Patrimônio total (BRL) | Soma posições convertidas via `valueInBrl` |
| Valor investido (BRL) | Idem |
| Lucro / prejuízo (BRL) | Diferença e % sobre investido |
| Proventos mês atual | `GET /dividend-payments?from_date&to_date` |
| Proventos ano atual | Idem |
| Posições ativas | Contagem de posições com ativo resolvido |

### Faixa de destaques (3 cards)

| Card | Dados | Link |
| ---- | ----- | ---- |
| Aderência ao rebalanceamento | `GET /portfolios/{id}/rebalance` — `100 - média(\|atual - meta\|)`; até 3 classes abaixo da meta | `/rebalanceamento` ou `/rebalanceamento/configuracao` |
| Classe em destaque | Top 3 por rendimento bruto `(atual − investido) / investido` | `/consolidada?display_class=` por linha |
| Proventos recentes | Até 3 últimos `payment_date` da carteira | — |

### Alocação por classe

- Agrupa por `Asset.display_class`
- Tabela com valor (BRL), % da carteira
- Gráfico rosca com legenda em tabela, linha «Total» e filtros de escopo (não-investimento / previdência)

### Proventos no dashboard

- Totais mês e ano nos cards KPI (período corrente)
- Gráfico de barras de **janeiro a dezembro** do ano corrente (total consolidado em BRL), com eixo Y linear, grade tracejada, tooltip e comparativo com o **mesmo período** (jan–mês atual) do ano anterior
- Ranking top ativos por valor recebido (histórico)

### Top ativos refinado

- Medalhas Lucide nos ranks 1–3 (máximo **3 ativos** por aba)
- Abas com ícone Lucide: `TrendingUp`, `Layers`, `HandCoins`, `BadgePercent`
- Ticker em pill (`font-mono`); coluna Tipo com ícone por `display_class` (ver [icones-ui.md](icones-ui.md))
- Barras horizontais proporcionais à métrica da aba
- Botão outline «Ver todos os ativos» com `ArrowRight` → `/consolidada`
- Checkboxes de escopo patrimonial (não-investimento / previdência) no canto direito do cabeçalho, sincronizados com KPI Patrimônio e Alocação
- Abas: Maior lucro (%), Maior posição, Proventos (total), Retorno bruto

### Atalhos inferiores

- Visão consolidada → `/consolidada`
- Rebalanceamento → `/rebalanceamento`
- Proventos → `/proventos`
- Objetivos → `/ferramentas/objetivos`

### Atalhos inferiores

- Classe de alocação → `/consolidada?display_class=...`
- Link proventos → `/proventos`
- Link consolidada → `/consolidada`
- Link carteiras → `/portfolios`

## Fora de escopo (Tier 3+)

Ver [dashboard-tier-3.md](../candidato/dashboard-tier-3.md) e [modulos-tier-4.md](../candidato/modulos-tier-4.md):

- Evolução patrimonial histórica (snapshots)
- Objetivos / AUPO11AREA11 no dashboard
- Análise de ações, simulações, IR

## Dados e API

Sem endpoints novos para KPIs e gráficos. Consumo paralelo:

| Recurso | Endpoint |
| ------- | -------- |
| Carteiras | `GET /portfolios`, `GET/PUT /portfolios/active` |
| Posições | `GET /portfolios/{id}/positions` |
| Ativos | `GET /assets` |
| Proventos | `GET /dividend-payments` (filtros opcionais) |
| Rebalanceamento | `GET /portfolios/{id}/rebalance` |
| Câmbio | `GET /fx/usd-brl`, `POST /fx/usd-brl/refresh` |
| Cotações | `POST /portfolios/{id}/quotes/refresh` |

## Lógica frontend

| Módulo | Responsabilidade |
| ------ | ---------------- |
| `portfolioDashboard.ts` | Patrimônio BRL, alocação por classe, classe em destaque |
| `dividendDashboard.ts` | Proventos por período, gráfico anual jan–dez, proventos recentes |
| `rebalanceAdherence.ts` | Percentual de aderência e até 3 classes abaixo da meta |
| `topAssetsDashboard.ts` | Ranking, barras, sparklines |
| `dashboardRelativeTime.ts` | Subtítulo «atualizado há X min» |
| `positionMetrics.ts` | Valores por posição (reutilizado) |

## Estados vazios

- Sem carteira → mensagem + link «Carteiras»
- Sem posições → orientação cadastrar ativos/posições
- Sem proventos → R$ 0,00 nos cards + link «Proventos»
- Sem metas de rebalanceamento → card de aderência com botão para configuração

## Critérios de aceite

- Usuário vê patrimônio, alocação, destaques e proventos mês/ano em uma tela
- Seletor de carteira atualiza todos os blocos
- Gráfico/tabela de alocação reflete `display_class`
- Aderência e classe em destaque refletem dados reais da carteira
- Drill-down para consolidada, rebalanceamento e proventos funciona

## Testes

- Unitários: `portfolioDashboard.test.ts`, `dividendDashboard.test.ts`, `rebalanceAdherence.test.ts`, `topAssetsDashboard.test.ts`, `dashboardRelativeTime.test.ts`, `DashboardKpiCard.test.ts`
- E2E: `e2e/casos-de-uso/ui/dashboard/`, specs `UI-DASH-001` … `UI-DASH-012`
