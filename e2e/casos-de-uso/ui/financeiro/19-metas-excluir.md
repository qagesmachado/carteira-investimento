# Metas — remover/excluir (bloqueio com despesa)

## Metadados

- **ID:** `UI-FIN-019`
- **Status:** aprovado
- **Página:** `/financeiro/metas`
- **Arquivo de teste:** `e2e/specs/financeiro/19-metas-excluir.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo, com renda cadastrada.
2. Uma despesa vinculada à primeira meta do mês.

## Cenário — remoção/exclusão bloqueada e exclusão permitida

1. Abro **Metas** do mês.
2. Tento **Remover** a meta com despesa — vejo aviso e a meta permanece.
3. Abro **Editar** nessa meta e clico em **Excluir meta** — também é bloqueado.
4. Crio uma meta personalizada nova (sem despesa) e a excluo pelo modal de edição.
5. Com uma meta que tem despesa recorrente, **Remover** também é bloqueado.

## Resultado esperado

- Remover do mês e Excluir do catálogo são bloqueados quando há despesa no mês ou recorrência ativa.
- Excluir meta sem uso remove o card imediatamente.
