# Metas — percentual e previsto em R$

## Metadados

- **ID:** `UI-FIN-002`
- **Status:** aprovado
- **Página:** `/financeiro/metas`
- **Arquivo de teste:** `e2e/specs/financeiro/02-metas-percentual.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo, com renda cadastrada (R$ 10.000,00).

## Cenário — salvar metas em % e ver o previsto em R$

1. Abro **Metas** do mês.
2. Vejo a **renda prevista do mês** (R$ 10.000,00).
3. As metas são exibidas em cards (duas por linha), somando 100%.
4. Salvo as metas.

## Resultado esperado

- O indicador mostra «Alocado 100% / 100%».
- Cada card exibe o **previsto em R$** derivado de renda prevista × percentual (ex.: 21% → R$ 2.100,00).
- Não há opção de definir a meta por valor em R$ (apenas percentual).
