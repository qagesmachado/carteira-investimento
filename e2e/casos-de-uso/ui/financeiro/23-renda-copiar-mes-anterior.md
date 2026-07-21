# UI-FIN-023 — Copiar renda do mês anterior com confirmação e diff

| Campo | Valor |
| --- | --- |
| **ID** | UI-FIN-023 |
| **Status** | aprovado |
| **Rota** | `/financeiro/renda/[year-month]` |
| **Arquivo de teste** | `e2e/specs/financeiro/23-renda-copiar-mes-anterior.spec.ts` |

## Referência

- [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.
2. Mês anterior com ao menos uma renda.
3. Mês atual com renda diferente (ou vazia).

## Cenário — confirmar cópia com diff

1. Cadastro renda no mês anterior (ex.: «Salário» R$ 5.000,00).
2. No mês atual, cadastro outra renda (ex.: «Bônus» R$ 800,00).
3. Clico **Copiar mês anterior**.
4. Vejo modal de confirmação listando **Entra** (Salário) e **Sai** (Bônus).
5. Cancelo: as rendas do mês atual permanecem.
6. Abro de novo, confirmo a cópia.
7. O mês atual passa a ter só as rendas do mês anterior.

## Resultado esperado

- A cópia não ocorre sem confirmação no modal.
- O diff mostra o que entra e o que sai antes de aplicar.
