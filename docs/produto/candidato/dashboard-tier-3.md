# Dashboard — extensões Tier 3 (candidato)

## Status

- **Status:** candidato / parcialmente implementado
- **Implementação:** itens 11 e 13 entregues no dashboard; evolução patrimonial e objetivos permanecem candidatos
- **Referência entregue:** [Dashboard inicial (Tier 1+2)](../desenvolvido/dashboard-inicial.md)

## Objetivo

Estender o dashboard com indicadores que dependem de **histórico patrimonial** ou **módulos ainda não integrados**, sem duplicar a visão operacional da consolidada.

## Origem na planilha

| Aba | Uso no dashboard Tier 3 |
| --- | ------------------------- |
| `BALANCEAMENTO` | Aderência atual vs. desejado — **entregue** |
| `PATRIMÔNIO TOTAL` | Evolução anual do patrimônio |
| `Proventos Cálculos` | Gráfico mensal (ano corrente) — **entregue** |
| `AUPO11AREA11` | ETFs RF por objetivo somados em renda fixa |

Ver também [`docs/planilha/abas.md`](../../planilha/abas.md).

## Itens candidatos

### 11 — Aderência ao rebalanceamento ✅ entregue

**Pergunta:** minha carteira está aderente ao balanceamento desejado?

**Entrega no dashboard:**

- Card com anel de aderência (%)
- Mensagem com até 3 classes abaixo da meta (maior gap primeiro), gap em `%`
- Link para `/rebalanceamento` ou configuração de metas

Documentado em [dashboard-inicial.md](../desenvolvido/dashboard-inicial.md). E2E: `UI-DASH-009`.

### 12 — Evolução patrimonial anual

**Pergunta:** como meu patrimônio evoluiu por ano?

**Dependências:**

- Nova entidade/API de snapshots (ex.: `GET /portfolios/{id}/snapshots`)
- Job ou registro manual de patrimônio em datas de fechamento
- Campo `allocation_targets_json` não resolve — precisa série temporal

**Entrega esperada no dashboard:**

- Gráfico linha/barra por ano
- Alternância valor absoluto vs. % valorização
- Filtro por classe (opcional)

### 13 — Gráfico mensal de proventos (ano corrente) ✅ entregue

**Pergunta:** como evoluíram meus proventos mês a mês no ano?

**Entrega no dashboard:**

- Barras de janeiro a dezembro do ano corrente (total consolidado em BRL)
- Eixo Y linear, grade tracejada e tooltip no hover
- Total do ano até o mês corrente, total do mesmo período no ano anterior e variação percentual

Documentado em [dashboard-inicial.md](../desenvolvido/dashboard-inicial.md). E2E: `UI-DASH-008`.

### 15 — Objetivos / AUPO11AREA11

**Pergunta:** quanto tenho alocado por objetivo financeiro?

**Dependências:**

- Módulo de objetivos financeiros (prioridade 6 em `funcionalidades.md`)
- Posições com `linked_objective` ou ETFs RF vinculados a objetivo

**Entrega esperada:**

- Widget secundário no dashboard ou link para módulo de objetivos
- ETFs RF por objetivo somados em `fixed_income` no gráfico principal

## Critérios para promover a `desenvolvido/`

- Módulo dependente implementado (ou API de snapshots/metas disponível)
- Casos de uso E2E `UI-DASH-*` aprovados e automatizados
- Item removido ou marcado como entregue neste documento
