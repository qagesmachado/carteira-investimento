# UI-CRP-004 — Alocação cripto isolada por carteira

| Campo | Valor |
| ----- | ----- |
| **ID** | UI-CRP-004 |
| **Rota** | `/analise/criptomoedas` |
| **Status** | aprovado |
| **Arquivo de teste** | `e2e/specs/analise/criptomoedas/04-isolamento-por-carteira.spec.ts` |
| **Referência** | `docs/produto/desenvolvido/analise-criptomoedas.md` |

## Cenário

**Dado** duas carteiras com posições cripto distintas  
**E** alocações salvas diferentes em cada carteira (70/30 na A, 100% ABTC11 na B)  
**Quando** o usuário abre a análise cripto e troca a carteira no seletor  
**Então** os campos **% desejado** refletem apenas a carteira selecionada  
**E** a carteira B não exibe ativos sem posição nela
