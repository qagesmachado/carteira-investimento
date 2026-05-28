# Classificação de ativos — FIIs (fundos imobiliários)

## Objetivo

Avaliar fundos imobiliários com indicadores de viabilidade, questionário DIAGRAMA FIIS, flag de descarte por P/VP e pontuação — equivalente às abas `Análise de fundos` e `DIAGRAMA FIIS` da planilha.

## Escopo MVP

- Perfil **`fii_br`**: ativos com `display_class = funds` (FIIs).
- Páginas **`/analise/fiis`** (listagem + classificação), **`/analise/configuracao?perfil=fiis`** (coluna Soma) e **`/analise/fiis/segmentos`** (catálogo de segmentos).
- API **`/analysis/profiles/fii-br/config`**, **`/analysis/profiles/fii-br/segments`**, **`/analysis/assets?profile=fii_br`**, scores por ativo.
- Atalho **Classificar** em `/portfolios` (somente `display_class = funds`).

## Fora do escopo (fases posteriores)

- Preço teto por FII (aba `Análise de fundos`).
- ETF internacional (análise + rebalance por ativo).
- Ranking global de ativos.

## Indicadores de viabilidade (scores 1–5)

| Critério | 5 | 3 | 2 | 1 |
|----------|---|---|---|---|
| **Vacância** | Viável — até 5% | Requer atenção — >5% e ≤10% | Bomba — >10% | Sem dados |
| **Qtd de Ativos** | Viável — 10 ou mais | Requer atenção — 5 a 9 | Bomba — menos de 5 | Sem dados |
| **Alavancagem Financeira** | Viável — até 15% | Requer atenção — >15% e ≤25% | Bomba — >25% | Sem dados |
| **Segmento** | Conforme catálogo editável | | | |

## Viabilidade geral (manual)

Classificação manual: AZULIM (1), VIÁVEL (2), ATENÇÃO (3), BOMBA (4) — igual ações.

## DIAGRAMA FIIS

Questionário yes/no (+1 / −1):

| Critério | Pergunta |
|----------|----------|
| Localização | Imóveis em regiões nobres? |
| Propriedades | Propriedades novas, sem manutenção excessiva? |
| P/VP | Negociado abaixo de P/VP 1? |
| Dividendos | Distribui dividendos há mais de 4 anos consistentemente? |
| Dependência | Não depende de um único inquilino ou imóvel? |
| Setor (yield) | Yield dentro ou acima da média para FIIs do mesmo tipo? |

## Flag P/VP > 1,5

Quando marcada, o investimento é **descartado**: badge DESCARTADO na tabela e coluna Soma exibe `—`.

## Coluna Soma

Fórmula (config independente de ações):

```
Soma = vacancia + qtd_ativos + alavancagem + segmento_fii
     + peso_viabilidade(viabilidade manual)
     + diagram_multiplier × pontuação diagrama
```

Ignorada quando flag P/VP > 1,5 está ativa.

## Integração com rebalanceamento

A coluna **Soma** alimenta a **% desejada** de cada FII na aba **FII** de `/rebalanceamento`:

```
peso = soma_fii / soma_fiis_classificados
pct_carteira = peso × meta_classe_funds
```

Detalhes: [rebalanceamento.md](rebalanceamento.md). FIIs sem Soma aparecem na tabela com «—» em % desejada; a UI alerta quantos FIIs precisam de classificação.

## Catálogo de segmentos

Segmentos editáveis em `/analise/fiis/segmentos`: nome, classificação (score) e texto explicativo.

Seed: Shoppings (Viável), Multicategoria (Requer atenção).

## API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/analysis/profiles/fii-br/config` | Critérios + regras + Soma |
| PUT | `/analysis/profiles/fii-br/config` | Salvar config |
| POST | `/analysis/profiles/fii-br/config/reset` | Restaurar seed |
| GET/PUT | `/analysis/profiles/fii-br/segments` | Catálogo de segmentos |
| POST | `/analysis/profiles/fii-br/segments/reset` | Restaurar segmentos seed |
| GET | `/analysis/assets?profile=fii_br` | Ativos elegíveis + scores |
| PUT | `/analysis/assets/{id}/scores?profile=fii_br` | Salvar scores |

## Referências

- [abas.md — DIAGRAMA FIIS](../../planilha/abas.md)
- [classificacao-ativos-acoes-br.md](classificacao-ativos-acoes-br.md)
- Casos E2E análise: [e2e/casos-de-uso/ui/analise/fiis/](../../../e2e/casos-de-uso/ui/analise/fiis/README.md)
- Casos E2E rebalanceamento FII: [UI-REB-008](../../../e2e/casos-de-uso/ui/rebalanceamento/08-percentual-desejado-fii.md)
