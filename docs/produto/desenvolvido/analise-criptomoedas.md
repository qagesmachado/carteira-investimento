# Análise — alocação por criptomoeda

## Objetivo

Definir o **percentual desejado de cada ativo** dentro da classe **Criptomoeda** (`display_class=crypto`), equivalente ao fluxo de ETFs internacionais.

## Escopo

- Página **`/analise/criptomoedas`**: tabela com ticker, % atual no grupo, % desejado, valor desejável (R$).
- Seletor **Carteira**: alocações são **exclusivas por carteira** (`portfolio_id`).
- API **`PUT /analysis/profiles/crypto/allocations`**: persiste `target_percent` por ativo e carteira (soma 100%).
- Persistência em **`portfolio_asset_allocation`** (`profile=crypto`), não mais global em `asset_analysis_score`.
- Rebalanceamento: aba **Criptomoedas** com `crypto_assets` no snapshot, usando alocação da carteira selecionada.

## Ativos elegíveis

Qualquer ativo com `display_class=crypto`:

- Criptoativos nativos (`asset_type=crypto`, ex.: `BTC-USD`)
- ETFs B3 de cripto (`asset_type=etf`, `etf_subtype=crypto`, ex.: `ABTC11`)

## Fórmula

```
pct_carteira = target_percent × meta_crypto / 100
valor_desejável = patrimônio × pct_carteira / 100
faltando = max(0, valor_desejável − valor_atual)
```

`target_percent` é relativo ao **grupo cripto** (soma 100% entre os ativos da estratégia).

## Posição sem cotação de mercado

Quando o ativo está na carteira mas `current_quote` ainda não está disponível (ex.: ETF recém-listado na B3, yfinance sem preço):

- **Análise → Criptomoedas** e **Rebalanceamento → Por ativo → Criptomoedas** listam o ativo normalmente.
- **Valor atual** e **% atual** exibem **—** (dado indisponível), não R$ 0 nem 0% fictício.
- **% desejada**, **valor desejável** e **faltando** continuam calculáveis a partir da alocação salva e do patrimônio com cotação conhecida.
- Após atualizar a cotação em **Ativos**, os valores atuais passam a ser preenchidos no próximo carregamento do snapshot.

## Casos de uso E2E

- `UI-CRP-001` — cadastro ABTC11 subtipo cripto
- `UI-CRP-002` — salvar alocação 70/30
- `UI-CRP-003` — rebalanceamento exibe aba Criptomoedas
- `UI-CRP-004` — alocação isolada por carteira
- `UI-PRT-007` — rebalanceamento lista cripto sem cotação com **—** em valor/% atual
