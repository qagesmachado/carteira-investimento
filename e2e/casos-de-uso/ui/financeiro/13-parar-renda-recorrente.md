# UI-FIN-013 — Parar renda recorrente a partir do mês

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-013 |
| **Status** | aprovado |
| **Rota** | `/financeiro/renda/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/13-parar-renda-recorrente.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.
2. Renda recorrente cadastrada em um mês anterior.

## Cenário — parar a partir do mês corrente

1. Cadastro renda recorrente dois meses atrás.
2. Navego para o mês atual na aba Renda.
3. Clico **Excluir** na linha recorrente.
4. Confirmo **Parar a partir de [mês atual]**.
5. Meses anteriores mantêm o lançamento; o mês atual fica sem a renda.

## Resultado esperado

- Modal oferece **Parar a partir de…** (padrão) e **Excluir regra inteira**.
- Histórico anterior preservado.
