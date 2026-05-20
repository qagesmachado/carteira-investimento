# Dashboard — extensões Tier 3 (candidato)

## Status

- **Status:** candidato / não implementado
- **Implementação:** junto com módulos de rebalanceamento, snapshots patrimoniais e objetivos financeiros
- **Referência entregue:** [Dashboard inicial (Tier 1+2)](../desenvolvido/dashboard-inicial.md)

## Objetivo

Estender o dashboard com indicadores que dependem de **metas de alocação**, **histórico patrimonial** ou **agregação multi-carteira**, sem duplicar a visão operacional da consolidada.

## Origem na planilha

| Aba | Uso no dashboard Tier 3 |
| --- | ------------------------- |
| `BALANCEAMENTO` | Aderência atual vs. desejado |
| `PATRIMÔNIO TOTAL` | Evolução anual do patrimônio |
| `Proventos Cálculos` | Gráfico mensal (12 meses) |
| `AUPO11AREA11` | ETFs RF por objetivo somados em renda fixa |

Ver também [`docs/planilha/abas.md`](../../planilha/abas.md).

## Itens candidatos

### 11 — Aderência ao rebalanceamento

**Pergunta:** minha carteira está aderente ao balanceamento desejado?

**Dependências:**

- UI para editar metas % por classe (`Portfolio.allocation_targets_json`)
- Parser e validação de metas no backend ou frontend
- Módulo [Rebalanceamento](../funcionalidades.md) §5

**Entrega esperada no dashboard:**

- Card «classe mais abaixo do alvo»
- Bloco comparando % atual vs. % desejado por `display_class`
- Link para tela dedicada de rebalanceamento

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

### 13 — Gráfico mensal de proventos (12 meses)

**Pergunta:** como evoluíram meus proventos mês a mês?

**Dependências:**

- Proventos cadastrados (`/dividend-payments`) — **já existe**
- Agregação por mês no frontend ou endpoint de sumário

**Entrega esperada no dashboard:**

- Barras dos últimos 12 meses
- Separação nacional / internacional (opcional)

### 14 — Visão multi-carteira consolidada

**Pergunta:** qual meu patrimônio total em todas as carteiras?

**Dependências:**

- Agregação cross-portfolio (posições de N carteiras)
- Regras de deduplicação de ativos (mesmo ticker em carteiras diferentes)

**Entrega esperada:**

- Modo «Todas as carteiras» no seletor do dashboard

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
