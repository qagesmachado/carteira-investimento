# Módulos Tier 4 — candidatos (fora do dashboard)

## Status

- **Status:** candidato / não implementado
- **Implementação:** cada módulo na ordem de priorização em [`funcionalidades.md`](../funcionalidades.md) §354–367 (itens 5–9)
- **Relação com dashboard:** telas dedicadas; o dashboard Tier 1+2 linka via drill-down, não substitui estes módulos

## Priorização (referência)

| Ordem | Módulo | Prioridade doc |
| ----- | ------ | -------------- |
| 5 | Rebalanceamento | Item 5 |
| 6 | Objetivos financeiros | Item 6 — **implementado** |
| 7 | Análise de ativos | Item 7 |
| 8 | Simulações | Item 8 |
| 9 | Relatórios / IR | Item 9 |

## 1. Rebalanceamento dedicado

**Status:** implementado (MVP) — ver [rebalanceamento.md](../desenvolvido/rebalanceamento.md).

**Origem planilha:** `BALANCEAMENTO`

**Entregue:**

- Metas % por classe (ações/ETF BR, FIIs, RF, internacional, crypto)
- Valor alvo, valor atual, diferença em R$
- Relação ETF vs. ação dentro da carteira BR
- % desejada por ativo Ações/ETF BR (coluna Soma)

**Pendente:** card de aderência no dashboard Tier 3; sugestões por ativo em internacional.

## 2. Objetivos financeiros

**Status:** implementado (MVP) — ver [objetivos-financeiros.md](../desenvolvido/objetivos-financeiros.md).

**Entregue:**

- Página `/ferramentas/objetivos` com objetivo «Livre» automático
- Divisão por cotas (ações, ETF, FII) ou valor (RF, previdência)
- Flag de divergência após mudança externa de posição
- API `/portfolios/{id}/objectives`

**Pendente:** meta de valor alvo por objetivo; patrimônio por objetivo no dashboard.

## 3. Análise de ações, FIIs e ETFs

**Status:** parcial — Ações/ETF BR implementado ([classificacao-ativos-acoes-br.md](../desenvolvido/classificacao-ativos-acoes-br.md)).

## 4. Simulações

**Origem planilha:** abas de planejamento e projeção (previdência, independência financeira)

**Objetivo:** simular dividendos, patrimônio futuro, cenários de aporte.

**Fora de escopo do dashboard inicial** ([`dashboard-inicial.md`](../dashboard-inicial.md) §188).

## 5. Relatórios e Imposto de Renda

**Origem planilha:** abas fiscais e consolidações anuais

**Objetivo:** relatórios para declaração e acompanhamento (proventos por fonte pagadora, ganhos de capital, etc.).

**Dependências:** proventos com CNPJ pagador, histórico de operações.

## Regras de documentação

- Ao iniciar um módulo, criar `docs/produto/desenvolvido/<modulo>.md` seguindo o padrão de [cadastro-proventos.md](../desenvolvido/cadastro-proventos.md).
- Atualizar este arquivo removendo ou marcando o item como em desenvolvimento.
- Casos E2E: prefixos dedicados (`UI-REB-`, `UI-ANL-`, etc.) conforme [`dependencias.md`](../../../e2e/casos-de-uso/dependencias.md).
