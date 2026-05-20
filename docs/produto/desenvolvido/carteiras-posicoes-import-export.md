# Carteiras, posições e import/export

## Objetivo

Gerenciar carteiras e posições em banco **local** (fora do Git), com exportação/importação via JSON canônico e reconciliação da base global de ativos.

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
| `DELETE` | `/portfolios/{id}` | Remove carteira e posições |
| `GET` | `/portfolios/{id}/positions` | Lista posições |
| `POST` | `/portfolios/{id}/positions` | Cria posição (`asset_id` deve existir em `/assets`) |
| `PATCH` | `/portfolios/{id}/positions/{pid}` | Atualiza posição |
| `DELETE` | `/portfolios/{id}/positions/{pid}` | Remove posição |
| `GET` | `/portfolios/{id}/export` | Documento JSON v1 |
| `POST` | `/portfolios/import/preview` | Pré-visualiza importação |
| `POST` | `/portfolios/import` | Confirma importação com resoluções |

## Formato `.carteira.json` (v1)

```json
{
  "version": 1,
  "exported_at": "2026-05-15T12:00:00",
  "portfolio": { "name": "...", "base_currency": "BRL" },
  "assets": [{ "symbol": "PETR4", "name": "...", "asset_type": "stock", "market": "national", "currency": "BRL" }],
  "positions": [
    { "symbol": "PETR4", "quantity": 100, "average_price": 32.5 },
    {
      "symbol": "CDBBTG2028",
      "invested_amount": 1000,
      "current_value": 1069.02,
      "contracted_yield": "IPCA + 8,40% a.a."
    }
  ]
}
```

## Importação — status por ativo

- `exists_ok` — base compatível; usa `asset_id` existente.
- `missing` — criar na base (`action: create`) após revisão/lookup.
- `conflict` — campos divergentes; `fields[]` com `resolution`: `keep_base` | `use_file` | `custom`.

## Interface (`/portfolios`)

- CRUD básico de carteiras e posições.
- Posições de ações/ETFs/FIIs usam quantidade e preço médio.
- Posições de renda fixa tradicional e previdência usam valor aplicado, valor atual e rendimento contratado manual.
- Exportar JSON da carteira ativa.
- Wizard de importação com tabela de conflitos.

## Variáveis de ambiente

- `LOCAL_DATA_DIR` — pasta do usuário (padrão `%LOCALAPPDATA%/carteira-investimento`).
- `PORTFOLIOS_DATABASE_URL` — SQLite de carteiras (padrão `{LOCAL_DATA_DIR}/portfolios.db`).
- `DATABASE_URL` — base de ativos (inalterada).
