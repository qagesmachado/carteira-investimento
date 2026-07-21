# Metas — salvar/remover com escopo (mês atual ou meses seguintes)

## Metadados

- **ID:** `UI-FIN-021`
- **Status:** aprovado
- **Página:** `/financeiro/metas`
- **Arquivo de teste:** `e2e/specs/financeiro/21-metas-escopo-salvar-remover.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil ativo, com renda.
2. Mês atual e mês seguinte já têm conjuntos próprios de metas (três categorias).

## Cenário — salvar percentuais para meses seguintes

1. Abro **Metas** do mês atual e altero os percentuais (soma 100%).
2. Clico em **Salvar metas** — abre modal com checkbox **Aplicar também aos meses seguintes**.
3. Confirmo com o checkbox marcado.

## Resultado esperado

- O mês seguinte passa a ter os mesmos percentuais.
- O mês anterior permanece intacto.

## Cenário — remover meta dos meses seguintes

1. Removo uma meta do mês atual com o checkbox **Remover também dos meses seguintes** marcado.
2. Ajusto os percentuais e salvo (só neste mês).

## Resultado esperado

- A meta some do mês atual e do mês seguinte.
- O mês anterior ainda contém a meta.
