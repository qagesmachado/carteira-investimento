# Metas — herança entre meses

## Metadados

- **ID:** `UI-FIN-018`
- **Status:** aprovado
- **Página:** `/financeiro/metas`
- **Arquivo de teste:** `e2e/specs/financeiro/18-metas-heranca-mes.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo, com renda cadastrada.
2. Metas do mês atual definidas como um subconjunto (duas metas, 60% e 40%).

## Cenário — herdar do mês anterior e isolar edições

1. Abro **Metas** do mês atual e vejo apenas as duas metas do conjunto (sem badge de herança).
2. Navego para o **próximo mês**.
3. Vejo o badge **«Herdado do mês anterior»** e as mesmas duas metas.
4. Edito o mês seguinte: removo a segunda meta (confirma no modal) — o indicador mostra o % que falta; redistribuo manualmente para 100% e salvo.

## Resultado esperado

- O mês seguinte, sem metas próprias, herda o conjunto (metas + percentuais) do mês anterior.
- Ao editar o mês seguinte, ele passa a ter conjunto próprio (1 meta a 100%).
- O mês anterior permanece inalterado (60% / 40%).
