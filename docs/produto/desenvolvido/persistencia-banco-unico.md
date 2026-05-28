# Persistência — banco único

## Objetivo

Centralizar catálogo de ativos, carteiras, posições, proventos, análise e preferências locais em **um único SQLite** (`carteira.db`), com integridade referencial real e isolamento por `portfolio_id`.

## Localização

| Ambiente | Caminho padrão | Variável |
|----------|----------------|----------|
| Runtime (Windows) | `%LOCALAPPDATA%/carteira-investimento/carteira.db` | `LOCAL_DATA_DIR` + default |
| Dev (override) | `backend/carteira.db` ou path custom | `DATABASE_URL` |
| E2E | `backend/data/test/carteira.db` | `DATABASE_URL` no Playwright |

O catálogo público de exemplo continua em [`backend/seed/assets.json`](../../../backend/seed/assets.json); `npm run db:seed` popula **somente** a tabela `asset`.

## Modelo de dados

- **Catálogo global:** `asset` — um registro por ticker; compartilhado entre carteiras.
- **Carteiras:** `portfolio`, `position`, `apppreference`.
- **Proventos:** `dividendpayment` com `portfolio_id` **obrigatório** (FK → `portfolio.id`).
- **Análise:** tabelas `analysis_*` e `asset_analysis_score` — configuração **global** do app.
- **Posições:** `position.asset_id` → FK `asset.id`; `position.portfolio_id` → FK `portfolio.id`.

### Isolamento por carteira

| Dado | Escopo |
|------|--------|
| Posições | `portfolio_id` |
| Proventos | `portfolio_id` |
| Metas de rebalanceamento | `portfolio.allocation_targets_json` |
| Dashboard / consolidada | filtro pela carteira ativa |
| Ativos (cadastro) | global |
| Análise (critérios/scores) | global |

### Regras de exclusão

| Ação | Efeito |
|------|--------|
| Remover **posição** | Proventos da carteira + ativo **permanecem** |
| Excluir **carteira** | Bloqueado (409) se houver posições ou proventos; use export em `/dados` ou `DELETE ?cascade=all` |
| Excluir **ativo** do catálogo | Bloqueado se houver posições ou proventos referenciando |

## Migração legado (dois arquivos)

Na subida (`init_db`), se existir `portfolios.db` no `LOCAL_DATA_DIR` e a migração ainda não foi aplicada:

1. Backup: `*.bak`
2. Copia `portfolio`, `position`, `apppreference` para o banco unificado
3. Backfill de `dividendpayment.portfolio_id` para carteira **Controle investimento** (case-insensitive)
4. Marca `apppreference.migration_unified_db = done`
5. Renomeia `portfolios.db` → `portfolios.db.migrated`

Arquivos `.bak` e `.migrated` podem ser apagados manualmente após validar o app.

## Git

`carteira.db` **nunca** é versionado. Apenas schema/código e `backend/seed/assets.json`.
