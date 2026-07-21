# UI-FIN-024 — Controle recebido/pago das recorrentes

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-024 |
| **Status** | aprovado |
| **Rota** | `/financeiro/controle/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/24-controle-recebido-pago.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.
2. Renda recorrente e despesa recorrente no mês.
3. Opcionalmente renda/despesa pontual no mesmo mês (não devem aparecer no Controle).

## Cenário — marcar recebido e pago

1. Cadastro renda recorrente e despesa recorrente no mês atual.
2. Cadastro também uma renda pontual e uma despesa pontual.
3. Abro a aba **Controle** do mês.
4. Vejo só as recorrentes nos painéis de renda e despesa; pontuais não aparecem.
5. Marco a renda como **Recebido** e a despesa como **Pago**.
6. Recarrego a página: os checkboxes permanecem marcados.
7. Desmarco ambos: voltam a pendentes.

## Resultado esperado

- Status é só visual (totais do Orçamento/Renda/Despesas não mudam por marcar).
- Navegação de mês funciona como nas outras abas mensais.
