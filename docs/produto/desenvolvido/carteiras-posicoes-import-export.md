# Carteiras, posições e import/export

## Objetivo

Gerenciar carteiras e posições no banco **local unificado** (`carteira.db`), com exportação/importação via JSON e reconciliação da base global de ativos.

Export/import na UI: página [`/dados`](pagina-dados.md).

## API HTTP

Prefixo `/portfolios`:

| Método | Caminho | Uso |
|--------|---------|-----|
| `GET` | `/portfolios` | Lista carteiras |
| `POST` | `/portfolios` | Cria carteira |
| `GET` | `/portfolios/active` | ID da carteira ativa |
| `PUT` | `/portfolios/active` | Define carteira ativa (`{ "portfolio_id": n \| null }`) |
| `GET` | `/portfolios/{id}` | Detalhe |
| `PATCH` | `/portfolios/{id}` | Atualiza |
| `DELETE` | `/portfolios/{id}` | Remove carteira (409 se houver dados; `?cascade=all` via `/dados`) |
| `GET` | `/portfolios/{id}/positions` | Lista posições |
| `POST` | `/portfolios/{id}/positions` | Cria posição (`asset_id` deve existir em `/assets`) |
| `PATCH` | `/portfolios/{id}/positions/{pid}` | Atualiza posição |
| `DELETE` | `/portfolios/{id}/positions/{pid}` | Remove posição (**proventos permanecem**) |
| `GET` | `/portfolios/{id}/export` | Documento JSON v1 ou v2 |
| `POST` | `/portfolios/import/preview` | Pré-visualiza importação |
| `POST` | `/portfolios/import` | Confirma importação com resoluções |

## Formato `.carteira.json` (v2)

Inclui proventos da carteira:

```json
{
  "version": 2,
  "exported_at": "2026-05-15T12:00:00",
  "portfolio": { "name": "...", "base_currency": "BRL" },
  "assets": [{ "symbol": "PETR4", "name": "...", "asset_type": "stock", "market": "national", "currency": "BRL" }],
  "positions": [
    { "symbol": "PETR4", "quantity": 100, "average_price": 32.5 }
  ],
  "dividend_payments": [
    { "symbol": "PETR4", "payment_type": "dividend", "payment_date": "2025-03-10", "amount": 120.5, "currency": "BRL" }
  ]
}
```

v1 (sem `dividend_payments`) continua suportado na importação.

## Importação — status por ativo

- `exists_ok` — base compatível; usa `asset_id` existente.
- `missing` — criar na base (`action: create`) após revisão/lookup.
- `conflict` — campos divergentes; `fields[]` com `resolution`: `keep_base` | `use_file` | `custom`.

## Interface

- **`/portfolios`:** CRUD carteiras e posições.
- **`/dados`:** export/import (backup, carteira, ativos, proventos).

## Variáveis de ambiente

- `LOCAL_DATA_DIR` — pasta do usuário (padrão `%LOCALAPPDATA%/carteira-investimento`).
- `DATABASE_URL` — SQLite unificado (padrão `{LOCAL_DATA_DIR}/carteira.db`).

Ver [Persistência — banco único](persistencia-banco-unico.md).
