# UI-FIN-011 — Despesas recorrentes

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-011 |
| **Status** | aprovado |
| **Rota** | `/financeiro/despesas/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/11-despesas-recorrentes.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.

## Cenário — recorrente indeterminada

1. Abro **Despesas**.
2. Marco **Despesa recorrente** e seleciono **Indeterminado (12 meses)**.
3. Cadastro aluguel de R$ 1.500,00.
4. A despesa aparece na tabela principal, na tabela de recorrentes e no total do mês.
5. A regra materializa 12 meses a partir do início (estende ao navegar além).

## Cenário — recorrente com fim

1. Cadastro academia recorrente até dezembro do ano corrente.
2. A regra mostra o mês final na tabela de recorrentes.
3. Ao consultar o mês seguinte via API, a despesa já está materializada.

## Resultado esperado

- Três blocos colapsáveis: todas do mês, recorrentes (regras) e pontuais.
- Checkbox e vigência (indeterminado ou até mês) no formulário.
