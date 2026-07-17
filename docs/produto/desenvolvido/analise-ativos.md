# Análise de ativos — hub e navegação

## Objetivo

Centralizar a entrada da área **Análise de ativos** em um **Sumário** com KPIs da carteira ativa e alinhar a UI ao padrão Hub (PageHero, pills, PageSection).

## Rotas

| Rota | Papel |
| ---- | ----- |
| `/analise` | Redirect para `/analise/sumario` |
| `/analise/sumario` | **Entrada padrão** — KPIs, visão geral + atalhos |
| `/analise/configuracao` | Redirect legado → `/analise/sumario` |
| `/analise/acoes-br` | Metodologia **Simples** (% desejado) ou **AUVP** (classificação + coluna Soma) |
| `/analise/fiis` | Idem para FIIs |
| `/analise/internacional` | Alocação % (Simples); AUVP em breve |
| `/analise/criptomoedas` | Alocação % (Simples); AUVP em breve |

Menu **Carteira → Análise de ativos** aponta para `/analise/sumario`.

## Sumário

- Barra de carteira ativa (mesmo padrão das demais telas de análise).
- KPIs: **ativos classificados** e **pendentes** na carteira.
- Botão **Conferir** no card Pendentes (quando contagem > 0) abre modal listando ativos pendentes **agrupados por área** (Ações, FIIs, Internacional, Cripto), com atalho para cada tela.
- Atalhos para Ações, FIIs, Internacional e Cripto.

## Ativos pendentes

Por carteira, qualquer ativo pode ser marcado como **pendente**. Pendentes:

- não entram nos totais de alocação (% desejado, coluna Soma, rebalanceamento);
- contam no KPI **Pendentes** do Sumário;
- podem ser reativados a qualquer momento.

Toggle disponível no modal **Classificar** (Ações/FIIs) e na tabela (Internacional/Cripto).

API: `PUT /analysis/assets/{id}/pending`, `GET /analysis/portfolio-summary?portfolio_id=`, `GET /analysis/portfolio-pending?portfolio_id=`.

## Navegação

Abas pill (ordem): **Sumário** · Ações/ETF BR · FIIs · Internacional · Criptomoedas.

## Metodologia por carteira

Cada área de análise (`stock_br`, `fii_br`, `etf_intl`, `crypto`) guarda a metodologia **por carteira**:

| Metodologia | Comportamento |
| ----------- | ------------- |
| **Simples** | Percentual desejado por ativo no grupo (soma 100% entre não pendentes); usado no rebalanceamento e no sumário como “classificado” quando `target_percent > 0`. |
| **AUVP** | Classificação fundamental + diagrama + coluna **Soma** (ações/FIIs); rebalanceamento e sumário usam Soma > 0. |

**Defaults:**

- Carteira **nova** (criada após a feature): **Simples** nos quatro perfis (registros explícitos no banco).
- Carteira **existente** sem registro: fallback legado — ações/FIIs **AUVP**; internacional/cripto **Simples** (sem migração/backfill).

Troca na UI pede confirmação; scores e alocações da metodologia anterior **permanecem** no banco.

API: `GET/PUT /analysis/profiles/{slug}/methodology?portfolio_id=`.

Internacional e cripto exibem AUVP no seletor, porém **desabilitado** (“Em breve”).

## Coluna Soma (AUVP)

Configuração global de pesos da coluna Soma fica em **modal** nas telas de ações/FIIs quando metodologia = AUVP (botão “Configurar coluna Soma”).

## Referências

- **Mockup (candidato):** [analise-sumario-hub.png](../candidato/mockups/analise-sumario-hub.png) — ideias de KPIs, mapa de configuração e fluxo recomendado
- Casos E2E: [e2e/casos-de-uso/ui/analise/](../../../e2e/casos-de-uso/ui/analise/README.md)
- [classificacao-ativos-acoes-br.md](classificacao-ativos-acoes-br.md)
