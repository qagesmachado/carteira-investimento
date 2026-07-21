# Casos E2E — Ferramentas (transversal)

Prefixo transversal: **UI-FERR-000**

| ID | Arquivo | Status | Spec |
| --- | ------- | ------ | ---- |
| UI-FERR-000 | [00-seletor-carteira-cabecalho.md](00-seletor-carteira-cabecalho.md) | implementado | `e2e/specs/ferramentas/00-seletor-carteira-cabecalho.spec.ts` |

Helper compartilhado: `e2e/specs/helpers/ferramentasPage.ts`

Rotas cobertas (seletor no cabeçalho):

- `/objetivos`
- `/taxas-cripto`
- `/financeiro/financiamento-imovel`
- `/calculo-preco-medio`
- `/conferencia-ir`
- `/controle-patrimonio`

Subpastas por ferramenta:

- [objetivos/](objetivos/README.md)
- [bitcoin/](bitcoin/README.md) (Taxas cripto → `/taxas-cripto`)
- [financiamento-imovel/](financiamento-imovel/README.md)
- [calculo-preco-medio/](calculo-preco-medio/README.md)
- [conferencia-ir/](conferencia-ir/README.md)
- [controle-patrimonio/](controle-patrimonio/README.md)
