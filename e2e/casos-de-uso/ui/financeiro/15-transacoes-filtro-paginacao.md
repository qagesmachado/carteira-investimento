# UI-FIN-015 — Transações recentes: filtros, ordenação e paginação

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-015 |
| **Status** | aprovado |
| **Rota** | `/financeiro/orcamento/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/15-transacoes-filtro-paginacao.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.
2. Mais de 20 transações no mês (para acionar a paginação com o tamanho padrão).

## Cenário — filtrar, ordenar e paginar transações recentes

1. Abro **Orçamento** do mês.
2. A seção **Transações recentes** exibe a primeira página (20 itens), «Mostrando X–Y de Z» e o contador total.
3. Clico em **Próxima** e vejo a última página com os itens restantes; o botão desabilita no fim.
4. Busco por um texto de descrição e a lista mostra apenas as transações correspondentes.
5. Clico em **Limpar** e a lista volta ao padrão (página 1, todas as transações).
6. Clico no cabeçalho **Data** para inverter a ordenação.

## Resultado esperado

- Paginação no padrão de Proventos: «Mostrando X–Y de Z», seletor **Por página** e botões **Anterior n/m Próxima** (desabilitam nos extremos).
- Filtros (busca, meta, tag) reduzem a lista e reiniciam para a página 1 (sem filtro por tipo, pois só há despesas).
- Cabeçalhos ordenáveis reordenam a lista e voltam para a página 1.
- Contador reflete o total filtrado.
