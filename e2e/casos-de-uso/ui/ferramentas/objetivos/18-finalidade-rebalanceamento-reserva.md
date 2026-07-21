# UI-OBJ-018 — Finalidade de objetivo no rebalanceamento e reserva

| Campo | Valor |
| ----- | ----- |
| **ID** | UI-OBJ-018 |
| **Status** | aprovado |
| **Rota UI** | `/rebalanceamento`, `/controle-patrimonio` |
| **Arquivo de teste** | `e2e/specs/objetivos/18-finalidade-rebalanceamento-reserva.spec.ts` |

## Cenário

Dado AUPO11 particionado entre objetivo de investimento (60 cotas) e reserva de emergência (40 cotas):

1. O rebalanceamento considera apenas R$ 6.000 em renda fixa (60 × R$ 100).
2. O controle de patrimônio lista R$ 4.000 vinculados ao ativo AUPO11 na reserva de emergência.

## Referência

- [objetivos-financeiros.md](../../../../docs/produto/desenvolvido/objetivos-financeiros.md)
- [controle-patrimonio.md](../../../../docs/produto/desenvolvido/controle-patrimonio.md)
