# Casos E2E — Dados (`/dados`)

**Rota:** `http://127.0.0.1:5174/dados` (E2E)  
**Prefixo de ID:** `UI-DAD-`

**Formato:** um cenário por arquivo — BDD (**Como / Quero / Para**) no início; **Passo a passo** numerado em seguida.

**Base de teste:** `backend/data/test/carteira.db` apenas (banco único; sem `portfolios.db`).

| ID | Arquivo | Status | Spec |
| -- | ------- | ------ | ---- |
| `UI-DAD-001` | [01-carregamento-secoes.md](01-carregamento-secoes.md) | implementado | [01-carregamento-secoes.spec.ts](../../../specs/dados/01-carregamento-secoes.spec.ts) |
| `UI-DAD-002` | [02-exportar-carteira-json-v2.md](02-exportar-carteira-json-v2.md) | implementado | [02-exportar-carteira-json-v2.spec.ts](../../../specs/dados/02-exportar-carteira-json-v2.spec.ts) |
| `UI-DAD-003` | [03-importar-carteira-wizard.md](03-importar-carteira-wizard.md) | implementado | [03-importar-carteira-wizard.spec.ts](../../../specs/dados/03-importar-carteira-wizard.spec.ts) |
| `UI-DAD-004` | [04-exportar-catalogo-ativos.md](04-exportar-catalogo-ativos.md) | implementado | [04-exportar-catalogo-ativos.spec.ts](../../../specs/dados/04-exportar-catalogo-ativos.spec.ts) |
| `UI-DAD-005` | [05-importar-ativos-lote.md](05-importar-ativos-lote.md) | implementado | [05-importar-ativos-lote.spec.ts](../../../specs/dados/05-importar-ativos-lote.spec.ts) |
| `UI-DAD-006` | [06-exportar-proventos-csv.md](06-exportar-proventos-csv.md) | implementado | [06-exportar-proventos-csv.spec.ts](../../../specs/dados/06-exportar-proventos-csv.spec.ts) |
| `UI-DAD-007` | [07-importar-proventos-lote.md](07-importar-proventos-lote.md) | implementado | [07-importar-proventos-lote.spec.ts](../../../specs/dados/07-importar-proventos-lote.spec.ts) |
| `UI-DAD-008` | [08-remover-posicao-proventos-persistem.md](08-remover-posicao-proventos-persistem.md) | implementado | [08-remover-posicao-proventos-persistem.spec.ts](../../../specs/dados/08-remover-posicao-proventos-persistem.spec.ts) |
| `UI-DAD-009` | [09-migracao-legado-smoke.md](09-migracao-legado-smoke.md) | aprovado | [09-migracao-legado-smoke.spec.ts](../../../specs/dados/09-migracao-legado-smoke.spec.ts) |

**Total:** 9 casos · **8 specs** implementados (`UI-DAD-001`–`008`); `UI-DAD-009` (migração legado) pendente

**Doc produto:** [`../../../../docs/produto/desenvolvido/pagina-dados.md`](../../../../docs/produto/desenvolvido/pagina-dados.md) · [`../../../../docs/produto/desenvolvido/persistencia-banco-unico.md`](../../../../docs/produto/desenvolvido/persistencia-banco-unico.md)

**Anterior:** [`../proventos/README.md`](../proventos/README.md)
