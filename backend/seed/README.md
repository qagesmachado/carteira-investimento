# Seed do catálogo de ativos

O catálogo compartilhado do repositório fica em **`assets.json`** (dados de exemplo, sem posições nem carteira pessoal).

Opcionalmente, use **`assets.local.json`** (ignorado pelo Git) para o seu catálogo real; o seed mescla os dois arquivos.

## Comandos (na raiz do repo)

| Comando | Efeito |
|---------|--------|
| `npm run db:seed` | **Upsert:** `assets.json` + `assets.local.json` (se existir). Não apaga ativos extras locais. |
| `npm run db:seed:fresh` | Apaga o catálogo e recria só a partir dos JSON carregados. |
| `npm run db:export` | Exporta o banco atual para **`assets.local.json`** (uso pessoal). |
| `npm run db:export:public` | Exporta para **`assets.json`** (atualizar o catálogo público do repo com cuidado). |

Equivalente em `backend/`:

```powershell
python -m app.seed
python -m app.seed --fresh
python -m app.seed --export
python -m app.seed --export --export-public
python -m app.seed --no-local
```

## Fluxo típico

1. **Clone / pull** → `npm run db:seed` (só o `assets.json` público).
2. **Sua máquina com carteira real** → copie o export antigo para `assets.local.json` ou `npm run db:export` → `npm run db:seed`.
3. **Compartilhar mudança no catálogo público** → edite `assets.json` no repo ou `npm run db:export:public` e revise o diff antes do commit.

## Testes E2E

Os testes UI usam `backend/data/test/carteira.db` (vazio no início de cada run) e populam ativos via API — **não** leem estes JSON de desenvolvimento.
