# Dashboard inicial (Tier 1 + 2)

## Objetivo

Visão executiva da **carteira selecionada** em `/dashboard`: patrimônio, P&L, alocação por classe, proventos agregados e atalhos para consolidada e proventos.

Equivalente parcial à aba `RESUMO` da planilha. Não substitui a tabela operacional em `/portfolios/consolidada`.

## Escopo entregue (Tier 1 + 2)

### Rota e navegação

- Página **`/dashboard`**
- Link **Dashboard** na navbar (antes de «Visão consolidada»)
- Home **`/`** permanece landing

### Seletor de carteira

- Dropdown com carteiras disponíveis
- Sincroniza com carteira ativa (`GET/PUT /portfolios/active`)
- Ao trocar, recarrega indicadores

### Cards de resumo

| Card | Fonte |
| ---- | ----- |
| Patrimônio total (BRL) | Soma posições convertidas via `valueInBrl` |
| Valor investido (BRL) | Idem |
| Lucro / prejuízo (BRL) | Diferença e % sobre investido |
| Proventos mês atual | `GET /dividend-payments?from_date&to_date` |
| Proventos ano atual | Idem |
| Posições ativas | Contagem de posições com ativo resolvido |

### Alocação por classe

- Agrupa por `Asset.display_class`
- Tabela com valor (BRL), % da carteira
- Gráfico de barras horizontais (CSS, sem lib externa)

### Proventos no dashboard

- Totais mês e ano nos cards (período corrente)
- Painel: totais **por ano registrado** (visão anual) ou **por mês** (Jan–Dez do ano escolhido no seletor)
- Alternância **Tabela / Barras** no painel
- Ranking top ativos por valor recebido (ano corrente, ativos da carteira)

### Breakdown BRL vs USD

- Linha ou card com totais patrimoniais por moeda (antes da conversão consolidada em BRL)

### Ações

- **Atualizar cotações** — `POST /portfolios/{id}/quotes/refresh`
- **Atualizar câmbio USD/BRL** — `POST /fx/usd-brl/refresh`

### Drill-down

- Classe de alocação → `/portfolios/consolidada?display_class=...`
- Link proventos → `/proventos`
- Link consolidada → `/portfolios/consolidada`
- Link carteiras → `/portfolios`

## Fora de escopo (Tier 3+)

Ver [dashboard-tier-3.md](../candidato/dashboard-tier-3.md) e [modulos-tier-4.md](../candidato/modulos-tier-4.md):

- Aderência ao rebalanceamento / metas %
- Evolução patrimonial histórica
- Gráfico proventos 12 meses
- Visão multi-carteira
- Objetivos / AUPO11AREA11
- Análise de ações, simulações, IR

## Dados e API

Sem endpoints novos. Consumo paralelo:

| Recurso | Endpoint |
| ------- | -------- |
| Carteiras | `GET /portfolios`, `GET/PUT /portfolios/active` |
| Posições | `GET /portfolios/{id}/positions` |
| Ativos | `GET /assets` |
| Proventos | `GET /dividend-payments` (filtros opcionais) |
| Câmbio | `GET /fx/usd-brl`, `POST /fx/usd-brl/refresh` |
| Cotações | `POST /portfolios/{id}/quotes/refresh` |

## Lógica frontend

| Módulo | Responsabilidade |
| ------ | ---------------- |
| `portfolioDashboard.ts` | Patrimônio BRL, alocação por classe, totais por moeda |
| `dividendDashboard.ts` | Proventos por período, classe, top ativos |
| `positionMetrics.ts` | Valores por posição (reutilizado) |

## Estados vazios

- Sem carteira → mensagem + link «Carteiras»
- Sem posições → orientação cadastrar ativos/posições
- Sem proventos → R$ 0,00 nos cards + link «Proventos»

## Critérios de aceite

- Usuário vê patrimônio, alocação e proventos mês/ano em uma tela
- Seletor de carteira atualiza todos os blocos
- Gráfico/tabela de alocação reflete `display_class`
- Drill-down para consolidada e proventos funciona
- Tier 3 documentado em `candidato/` sem implementação

## Testes

- Unitários: `portfolioDashboard.test.ts`, `dividendDashboard.test.ts`
- E2E: `e2e/casos-de-uso/ui/dashboard/`, specs `UI-DASH-*`
