# Casos de uso — interface (E2E)

Documentação organizada pela hierarquia de menus do app:

| Menu | Pasta | Rota |
| ---- | ----- | ---- |
| Dashboard | [`dashboard/`](dashboard/README.md) | `/dashboard` |
| Visão consolidada | [`consolidada/`](consolidada/README.md) | `/consolidada` |
| Carteira → Carteiras | [`portfolios/`](portfolios/README.md) | `/portfolios` |
| Carteira → Rebalanceamento | [`rebalanceamento/`](rebalanceamento/README.md) | `/rebalanceamento` |
| Carteira → Análise de ativos | [`analise/`](analise/README.md) | `/analise` |
| Carteira → Proventos | [`proventos/`](proventos/README.md) | `/proventos` |
| Banco de dados → Ativos | [`assets/`](assets/README.md) | `/assets` |
| Banco de dados → Dados | [`dados/`](dados/README.md) | `/dados` |
| Ferramentas → Gerenciamento de objetivos | [`ferramentas/objetivos/`](ferramentas/objetivos/README.md) | `/objetivos` |
| Ferramentas → Taxas bitcoin | [`ferramentas/bitcoin/`](ferramentas/bitcoin/README.md) | `/taxas-cripto` |
| Ferramentas → Financiamento imóvel | [`ferramentas/financiamento-imovel/`](ferramentas/financiamento-imovel/README.md) | `/financeiro/financiamento-imovel` |
| Ferramentas → Cálculo de preço médio | [`ferramentas/calculo-preco-medio/`](ferramentas/calculo-preco-medio/README.md) | `/calculo-preco-medio` |
| Navbar (transversal) | [`nav/`](nav/README.md) | navbar global |

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
