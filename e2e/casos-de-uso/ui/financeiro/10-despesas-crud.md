# UI-FIN-010 — Cadastro de despesas

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-010 |
| **Status** | aprovado |
| **Rota** | `/financeiro/despesas/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/10-despesas-crud.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.

## Cenário — CRUD de despesa

1. Abro **Despesas** no submenu Financeiro.
2. Preencho descrição, valor, meta e adiciono.
3. A despesa aparece na tabela.
4. Edito a descrição no **modal** e salvo.
5. Excluo a despesa após confirmar no modal.

## Resultado esperado

- Formulário no topo (nova despesa) e tabela abaixo; **editar** abre modal.
- Total de despesas do mês atualizado.
- Despesa refletida no Orçamento (cards de meta).
