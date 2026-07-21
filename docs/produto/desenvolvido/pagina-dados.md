# Página Dados (`/dados`)

## Objetivo

Centralizar exportação e importação de backup completo, carteiras e catálogo de ativos, além da **exportação** de proventos — removendo esses fluxos das páginas de cadastro. A **importação em lote de proventos** fica em **Proventos → Adicionar** (`/proventos/adicionar`).

## Rota

- **UI:** `/dados`
- **Navbar:** menu Banco de dados → Dados

## Seções

| Seção | Export | Import |
|-------|--------|--------|
| **Backup completo** | JSON (`GET /data/export/full`) | Preview + confirm (`POST /data/import/full/*`) |
| **Carteira** | JSON v2 com posições e proventos (`GET /portfolios/{id}/export`) | Wizard (`POST /portfolios/import/*`) |
| **Ativos** | JSON catálogo (`GET /data/export/assets`) | Bulk (`POST /data/import/assets/*`) |
| **Proventos** | CSV/JSON por carteira (`GET /data/export/dividends`) | Importação em lote movida para **Proventos → Adicionar** (`/proventos/adicionar`) |

## Formato export carteira v2

```json
{
  "version": 2,
  "exported_at": "...",
  "portfolio": { "name": "...", "allocation_targets_json": "..." },
  "assets": [{ "symbol": "PETR4", ... }],
  "positions": [{ "symbol": "PETR4", "quantity": 100, ... }],
  "dividend_payments": [
    { "symbol": "PETR4", "payment_type": "dividend", "payment_date": "2025-01-15", "amount": 50.0 }
  ]
}
```

Import v1 (sem proventos) continua suportado.

## Exclusão destrutiva de carteira

Disponível apenas em `/dados`: excluir carteira com todos os dados (`DELETE /portfolios/{id}?cascade=all`).

## Páginas que permanecem só com CRUD

- `/assets` — cadastro/edição individual
- `/portfolios` — CRUD carteira e posições
- `/proventos` — formulário e listagem filtrada por carteira
