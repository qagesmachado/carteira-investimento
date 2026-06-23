# Análise — alocação por criptomoeda

## Objetivo

Definir o **percentual desejado de cada ativo** dentro da classe **Criptomoeda** (`display_class=crypto`), equivalente ao fluxo de ETFs internacionais.

## Escopo

- Página **`/analise/criptomoedas`**: tabela com ticker, % atual no grupo, % desejado, valor desejável (R$).
- API **`PUT /analysis/profiles/crypto/allocations`**: persiste `target_percent` por ativo (soma 100%).
- Perfil de análise **`crypto`** em `asset_analysis_score` (`criterion_code=target_percent`).
- Rebalanceamento: aba **Criptomoedas** com `crypto_assets` no snapshot.

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

## Casos de uso E2E

- `UI-CRP-001` — cadastro ABTC11 subtipo cripto
- `UI-CRP-002` — salvar alocação 70/30
- `UI-CRP-003` — rebalanceamento exibe aba Criptomoedas
