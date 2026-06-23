# Criptomoedas — estratégia, taxas e classificação

## Objetivo

Gerenciar a **estratégia Criptomoeda** da carteira: classificação de ativos (BTC, ETFs de cripto como ABTC11), alocação percentual por ativo e taxas de movimentação para cripto nativo.

Substitui a nomenclatura legada «Bitcoin» da planilha.

## Classificação

| Tipo | Exemplo | Como cadastrar |
| --- | --- | --- |
| Criptoativo | `BTC-USD` | Lookup yfinance → `asset_type=crypto` |
| ETF cripto B3 | `ABTC11` | ETF nacional, subtipo **Criptomoeda** (`etf_subtype=crypto`) |

Ambos recebem `display_class=crypto` e entram na meta **Criptomoeda** (default 5%).

## Páginas

| Rota | Função |
| --- | --- |
| `/analise/criptomoedas` | % desejada por ativo (soma 100%) |
| `/ferramentas/criptomoedas` | Taxas de compra/transferência (somente `asset_type=crypto`) |
| `/rebalanceamento` | Aba Criptomoedas — atual vs. desejado |

Redirect legado: `/ferramentas/bitcoin` → `/ferramentas/criptomoedas`.

## API

- `GET /portfolios/{id}/crypto-snapshot?asset_id=` — resumo por ativo cripto nativo
- Alias: `GET .../bitcoin-snapshot` (retrocompatível)
- `GET/POST/PATCH/DELETE /crypto-fees` — CRUD taxas

## ABTC11 antes do yfinance

Cadastro **manual** em `/assets`: ETF nacional, subtipo Criptomoeda, cotação opcional até o ticker existir no Yahoo.

## Casos de uso E2E

- `UI-CRP-001` a `UI-CRP-003` — alocação e rebalanceamento
- `UI-BTC-001` / `UI-BTC-002` — taxas (atualizados para nomenclatura Criptomoeda)
