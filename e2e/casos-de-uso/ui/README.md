# Casos de uso — interface (E2E)

Documentação organizada por página, na ordem **1 → 2 → 3**:

| # | Pasta | Rota |
| - | ----- | ---- |
| 1 | [`assets/`](assets/README.md) | `/assets` |
| 2 | [`portfolios/`](portfolios/README.md) | `/portfolios` |
| 3 | [`consolidada/`](consolidada/README.md) | `/portfolios/consolidada` |
| 4 | [`proventos/`](proventos/README.md) | `/proventos` |
| 5 | [`dashboard/`](dashboard/README.md) | `/dashboard` |

Ver também [`../dependencias.md`](../dependencias.md) (bases `data/test/*.db`).

## Arquivos migrados

| Antigo (raiz `ui/`) | Novo destino |
| ------------------- | ------------ |
| `cadastro-lookup.md` | [`assets/02-busca-lookup-individual.md`](assets/02-busca-lookup-individual.md) |
| `importacao-lote.md` | [`assets/09-importacao-lote.md`](assets/09-importacao-lote.md) |
| `edicao-exclusao-lista.md` | [`assets/07-editar-ativo-lista.md`](assets/07-editar-ativo-lista.md), [`assets/08-excluir-ativo-lista.md`](assets/08-excluir-ativo-lista.md) |
| `import-export-carteira.md` | [`portfolios/10-exportar-carteira-json.md`](portfolios/10-exportar-carteira-json.md), [`portfolios/11-importar-carteira-json.md`](portfolios/11-importar-carteira-json.md) |

## Outros

- [`health-home.md`](health-home.md) — smoke home/health (isolado da cadeia 1→2→3)
