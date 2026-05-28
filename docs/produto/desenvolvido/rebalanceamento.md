# Rebalanceamento de carteira

## Objetivo

Comparar alocação **atual** vs. **desejada** da carteira ativa, calcular **FALTANDO** por classe (aba `BALANCEAMENTO` da planilha) e distribuir metas por ativo em **Ações/ETF BR** e **FIIs** usando a coluna **Soma** da análise correspondente.

## Escopo MVP

- Página **`/rebalanceamento`**: tabela por classe, bloco ETF/Ação (70/30), tabela por ativo com abas Ações/ETF BR, ETF internacional e FII. Cabeçalhos da tabela **Por ativo** são clicáveis para ordenar (asc/desc) por qualquer coluna.
- Página **`/rebalanceamento/configuracao`**: editar metas % por classe e split ETF/Ação.
- API **`GET /portfolios/{id}/rebalance`**: snapshot calculado.
- Metas persistidas em **`Portfolio.allocation_targets_json`** (validação soma 100%).
- **Ações/ETF BR:** % desejada por ativo via perfil `stock_br` (Soma + split ETF 70% / Ação 30%).
- **FIIs:** % desejada por ativo via perfil `fii_br` (Soma distribuída na meta da classe `funds`).
- Coluna **Faltando (patrimônio final)** por classe e por ativo (quando há % desejada).

## Fora do escopo

- Sugestão por ativo em **internacional** e **crypto** (sem módulo de análise).
- Card de aderência no dashboard (Tier 3).
- Preço teto e recomendação compra/venda.

## Metas default (seed)

| Classe UI | `display_class` | Meta % |
| --------- | --------------- | ------ |
| Ações/ETF BR | `stocks` | 30 |
| Fundos | `funds` | 5 |
| Internacional | `international` | 20 |
| Renda fixa | `fixed_income` | 40 |
| Bitcoin | `crypto` | 5 |

Relação ETF/Ação dentro de `stocks`: **70% / 30%**.

## Fórmulas

### Por classe

- `valor_alvo = patrimônio × meta%`
- `faltando = max(0, valor_alvo − valor_atual)`

Patrimônio = soma dos valores atuais das posições **das cinco classes de balanceamento**, convertidos para BRL (USD × câmbio). **Previdência** e **Outros** ficam fora dessa soma (como na planilha).

Na UI, a coluna **Faltando (patrimônio final)** recalcula o gap por classe usando um patrimônio total informado após aporte (`max(0, patrimônio_final × meta% − valor_atual)`). A mesma coluna na tabela **Por ativo** aplica a fórmula com a **% desejada** de cada ticker (`max(0, patrimônio_final × % desejada − valor_atual)`); ativos sem % desejada exibem «—».

### Por ativo (Ações/ETF BR e FIIs)

As colunas **% atual** e **% desejada** na tabela **Por ativo** são relativas **ao conjunto de ativos da aba** (somam 100% entre os tickers listados). **Valor desejável**, **Faltando** e **Faltando (patrimônio final)** continuam baseados no patrimônio total da carteira.

#### Ações/ETF BR

Separadamente para **ETF** e **Ação**:

```
peso = soma_empresa / soma_empresas_do_mesmo_tipo
pct_no_grupo = peso × meta_subtipo   (70 ou 30, soma 100% na aba)
pct_carteira = pct_no_grupo × meta_stocks / 100   (usado em valor desejável)
```

`soma_empresa` = coluna **Soma** do perfil `stock_br`. Ativos sem score aparecem na lista mas não entram no denominador.

### Por ativo (FIIs)

Dentro da classe **Fundos** (`funds`), sem sub-divisão:

```
peso = soma_fii / soma_todos_fiis_com_score
pct_no_grupo = peso × 100   (exibido em % desejada)
pct_carteira = peso × meta_funds   (usado em valor desejável)
valor_desejável = patrimônio × pct_carteira / 100
faltando = max(0, valor_desejável − valor_atual)
```

`soma_fii` = coluna **Soma** do perfil `fii_br` (`compute_table_sum_score`). FIIs com flag P/VP > 1,5 (descartados) ou sem classificação não entram no denominador.

## Integração com análise

| Classe rebalance | Perfil análise | Onde classificar |
| ---------------- | -------------- | ---------------- |
| Ações/ETF BR | `stock_br` | `/analise/acoes-br` |
| FIIs | `fii_br` | `/analise/fiis` |
| Internacional | — | pendente |

Campos no snapshot `GET /portfolios/{id}/rebalance`:

- `stock_assets`, `assets_without_score_count`
- `fund_assets`, `fund_assets_without_score_count`
- `international_assets` (sem % desejada)

## API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/portfolios/{id}/rebalance` | Snapshot de rebalanceamento |
| PATCH | `/portfolios/{id}` | Atualizar `allocation_targets_json` |

## Referências

- [classificacao-ativos-acoes-br.md](classificacao-ativos-acoes-br.md)
- [classificacao-ativos-fiis.md](classificacao-ativos-fiis.md)
- [abas.md — BALANCEAMENTO](../../planilha/abas.md)
- Casos E2E: [e2e/casos-de-uso/ui/rebalanceamento/](../../../e2e/casos-de-uso/ui/rebalanceamento/README.md)
