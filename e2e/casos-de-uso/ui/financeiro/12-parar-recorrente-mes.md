# UI-FIN-012 — Parar recorrência a partir do mês

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-012 |
| **Status** | aprovado |
| **Rota** | `/financeiro/despesas/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/12-parar-recorrente-mes.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.
2. Despesa recorrente cadastrada em um mês anterior.

## Cenário — parar a partir do mês corrente

1. Cadastro despesa recorrente indeterminada dois meses atrás.
2. Navego para o mês atual na aba Despesas.
3. Clico **Excluir** na linha da recorrente.
4. Confirmo **Parar a partir de [mês atual]**.
5. Meses anteriores mantêm o lançamento; o mês atual fica sem a despesa.

## Resultado esperado

- Modal oferece **Parar a partir de…** (padrão) e **Excluir regra inteira**.
- Histórico anterior preservado.
