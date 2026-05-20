# Módulos Tier 4 — candidatos (fora do dashboard)

## Status

- **Status:** candidato / não implementado
- **Implementação:** cada módulo na ordem de priorização em [`funcionalidades.md`](../funcionalidades.md) §354–367 (itens 5–9)
- **Relação com dashboard:** telas dedicadas; o dashboard Tier 1+2 linka via drill-down, não substitui estes módulos

## Priorização (referência)

| Ordem | Módulo | Prioridade doc |
| ----- | ------ | -------------- |
| 5 | Rebalanceamento | Item 5 |
| 6 | Objetivos financeiros | Item 6 |
| 7 | Análise de ativos | Item 7 |
| 8 | Simulações | Item 8 |
| 9 | Relatórios / IR | Item 9 |

## 1. Rebalanceamento dedicado

**Origem planilha:** `BALANCEAMENTO`

**Objetivo:** comparar alocação desejada vs. atual e sugerir aportes por classe.

**Funcionalidades candidatas:**

- Metas % por classe (ações/ETF BR, FIIs, RF, internacional, crypto, previdência)
- Valor alvo, valor atual, diferença em R$
- Prioridade sugerida de aporte
- Relação ETF vs. ação dentro da carteira BR

**Dependências:** edição de `allocation_targets_json`, patrimônio por classe (já calculável no frontend).

**Integração dashboard Tier 3:** card e bloco de aderência; link «Ver rebalanceamento».

## 2. Análise de ações, FIIs e ETFs

**Origem planilha:** `Análise de açõesetf br`, `Análise etf`, `Análise de fundos`

**Objetivo:** checklists, scores, % desejado na carteira, preço teto, recomendação compra/manter/vender.

**Funcionalidades candidatas:**

- Ficha por ativo com critérios qualitativos
- Score ou checklist preenchível
- % desejado vs. % atual na carteira
- Preço teto e distância da cotação

**Dependências:** catálogo de ativos e posições; possivelmente dados externos (cotação, fundamentos).

**Integração dashboard:** link por ativo a partir do ranking de proventos ou consolidada — não painel completo no dashboard.

## 3. Simulações

**Origem planilha:** abas de planejamento e projeção (previdência, independência financeira)

**Objetivo:** simular dividendos, patrimônio futuro, cenários de aporte.

**Fora de escopo do dashboard inicial** ([`dashboard-inicial.md`](../dashboard-inicial.md) §188).

## 4. Relatórios e Imposto de Renda

**Origem planilha:** abas fiscais e consolidações anuais

**Objetivo:** relatórios para declaração e acompanhamento (proventos por fonte pagadora, ganhos de capital, etc.).

**Dependências:** proventos com CNPJ pagador, histórico de operações.

## Regras de documentação

- Ao iniciar um módulo, criar `docs/produto/desenvolvido/<modulo>.md` seguindo o padrão de [cadastro-proventos.md](../desenvolvido/cadastro-proventos.md).
- Atualizar este arquivo removendo ou marcando o item como em desenvolvimento.
- Casos E2E: prefixos dedicados (`UI-REB-`, `UI-ANL-`, etc.) conforme [`dependencias.md`](../../../e2e/casos-de-uso/dependencias.md).
