# Metas — histórico (limpar despesas e excluir definitiva)

## Metadados

- **ID:** `UI-FIN-022`
- **Status:** aprovado
- **Página:** `/financeiro/metas/historico`
- **Arquivo de teste:** `e2e/specs/financeiro/22-metas-historico.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo.
2. Meta personalizada com despesa (ou recorrência) vinculada.

## Cenário — bloqueio, limpeza e exclusão definitiva

1. Abro **Histórico** em Metas.
2. Vejo a meta com registros; **Excluir meta em definitivo** está desabilitado / bloqueado.
3. Abro os registros e clico em **Excluir todas as despesas**.
4. Confirmo; a meta fica sem vínculos.
5. Excluo a meta em definitivo.
6. Volto a **Metas** → **Adicionar meta**: a meta não aparece em «Incluir meta existente».

## Resultado esperado

- Meta com despesas não pode ser excluída do catálogo até limpar os vínculos.
- Após limpar e excluir, some do catálogo e do select de inclusão.
