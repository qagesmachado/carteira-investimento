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
- Coluna **Deveria ter** e **Aporte sugerido** por classe e por ativo (quando há % desejada e valor a investir informado).

## Fora do escopo

- Sugestão por ativo em **crypto** via perfil `crypto` em `/analise/criptomoedas` (alocação manual, soma 100%).
- Card de aderência no dashboard (Tier 3).
- Preço teto e recomendação compra/venda.

## Metas default (seed)

| Classe UI | `display_class` | Meta % |
| --------- | --------------- | ------ |
| Ações/ETF BR | `stocks` | 30 |
| Fundos | `funds` | 5 |
| Internacional | `international` | 20 |
| Renda fixa | `fixed_income` | 40 |
| Criptomoeda | `crypto` | 5 |

Relação ETF/Ação dentro de `stocks`: **70% / 30%**.

## Fórmulas

### Por classe

- `valor_alvo = patrimônio × meta%`
- `faltando = max(0, valor_alvo − valor_atual)`

Patrimônio = soma dos valores atuais das posições **das cinco classes de balanceamento**, convertidos para BRL (USD × câmbio). **Previdência** e **Outros** ficam fora dessa soma (como na planilha).

Na UI, informe **Valor a investir** na linha TOTAL. O sistema calcula **Patrimônio final** = patrimônio atual + aporte e exibe:

- **Deveria ter** = `patrimônio_final × meta%` (valor ideal da classe/ativo após o aporte).
- **Aporte sugerido** = parcela do valor investido alocada à classe/ativo.

Checkboxes por classe (marcados por padrão) permitem excluir uma classe do aporte; o gap ideal da classe desmarcada é redistribuído proporcionalmente entre as classes marcadas. A soma dos aportes sugeridos nas classes marcadas equivale ao valor informado.

Na tabela **Por ativo**, as colunas projetadas herdam o aporte da classe da aba ativa e distribuem-no entre os tickers proporcionalmente ao gap ideal de cada um em `patrimônio_final`. Ativos sem % desejada exibem «—».

### Por ativo (Ações/ETF BR e FIIs)

As colunas **% atual** e **% desejada** na tabela **Por ativo** são relativas **ao conjunto de ativos da aba** (somam 100% entre os tickers listados). **Valor desejável**, **Faltando**, **Deveria ter** e **Aporte sugerido** continuam baseados no patrimônio total da carteira e no plano de aporte por classe.

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

### Por ativo (ETF internacional)

Dentro da classe **Internacional** (`international`):

```
pct_no_grupo = target_percent manual (soma 100% entre ETFs configurados)
pct_carteira = pct_no_grupo × meta_international / 100
valor_desejável = patrimônio × pct_carteira / 100
faltando = max(0, valor_desejável − valor_atual)
```

`target_percent` = alocação definida em `/analise/internacional` (perfil `etf_intl`).

## Integração com análise

| Classe rebalance | Perfil análise | Onde classificar |
| ---------------- | -------------- | ---------------- |
| Ações/ETF BR | `stock_br` | `/analise/acoes-br` |
| FIIs | `fii_br` | `/analise/fiis` |
| Internacional | `etf_intl` | `/analise/internacional` |

Campos no snapshot `GET /portfolios/{id}/rebalance`:

- `stock_assets`, `assets_without_score_count`
- `fund_assets`, `fund_assets_without_score_count`
- `international_assets` (% desejada via perfil `etf_intl`)

## API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/portfolios/{id}/rebalance` | Snapshot de rebalanceamento |
| PATCH | `/portfolios/{id}` | Atualizar `allocation_targets_json` |

## Referências

- [classificacao-ativos-acoes-br.md](classificacao-ativos-acoes-br.md)
- [classificacao-ativos-fiis.md](classificacao-ativos-fiis.md)
- [classificacao-ativos-etf-intl.md](classificacao-ativos-etf-intl.md)
- [abas.md — BALANCEAMENTO](../../planilha/abas.md)
- Casos E2E: [e2e/casos-de-uso/ui/rebalanceamento/](../../../e2e/casos-de-uso/ui/rebalanceamento/README.md)
