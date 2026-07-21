# UI-FIN-016 — Despesas: filtros, ordenação, paginação e resumo

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-016 |
| **Status** | aprovado |
| **Rota** | `/financeiro/despesas/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/16-despesas-filtro-ordenacao-paginacao.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo, com renda cadastrada.
2. Mais de 20 despesas no mês (para acionar a paginação).

## Cenário — filtrar, ordenar e paginar as despesas do mês

1. Abro **Despesas** do mês.
2. No topo direito do painel **Despesas do mês** vejo o resumo: **Receitas**, **Despesas** e **Sobrando**.
3. Os três painéis inferiores (todas, recorrentes, pontuais) carregam **fechados**; abro o painel **Todas as despesas do mês**.
4. O painel exibe a primeira página (20 itens) com «Mostrando X–Y de Z».
5. Clico em **Próxima** e vejo a última página; o botão desabilita no fim.
6. Busco por um texto de descrição e a lista mostra apenas as despesas correspondentes.
7. Clico no cabeçalho **Descrição** para ordenar alfabeticamente.

## Resultado esperado

- Resumo mostra receitas, total de despesas e saldo (sobrando) do mês (não há mais linha "Total de despesas" separada).
- Os três painéis inferiores carregam recolhidos por padrão.
- Os três painéis (todas, recorrentes, pontuais) têm filtros (busca, meta, tag), ordenação por coluna e paginação no padrão de Proventos.
- Filtros e ordenação reiniciam para a página 1.
