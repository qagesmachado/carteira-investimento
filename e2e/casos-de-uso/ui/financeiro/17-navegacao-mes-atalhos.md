# UI-FIN-017 — Navegação de mês: atalho "Mês atual" e seletor direto

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-017 |
| **Status** | aprovado |
| **Rota** | `/financeiro/despesas/[year-month]` (nav compartilhado do Financeiro) |
| **Arquivo de teste** | `e2e/specs/financeiro/17-navegacao-mes-atalhos.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.

## Cenário — atalhos de navegação de mês

1. Abro o Financeiro no mês atual; o botão **Mês atual** aparece desabilitado.
2. Clico em **‹** (mês anterior); o rótulo e a URL mudam e **Mês atual** habilita.
3. Clico em **Mês atual**; volto ao mês corrente e o botão desabilita de novo.
4. Uso o seletor de mês (input de mês) para escolher um mês distante em um passo; o rótulo e a URL saltam direto para ele.

## Resultado esperado

- Botão **Mês atual** volta ao mês corrente e fica desabilitado quando já estou nele.
- Seletor de mês permite ir a qualquer mês sem navegar um a um; atualiza rótulo e rota.
- Setas ‹ › continuam funcionando para mês anterior/próximo.
