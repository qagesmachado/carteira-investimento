# Metas — personalizadas por perfil (criar)

## Metadados

- **ID:** `UI-FIN-003`
- **Status:** aprovado
- **Página:** `/financeiro/metas`
- **Arquivo de teste:** `e2e/specs/financeiro/03-metas-personalizadas-crud.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo, com renda cadastrada.

## Cenário — criar meta personalizada

1. Abro **Metas** do mês.
2. Clico em **Adicionar meta** — abre o modal com checkbox **Aplicar também aos meses seguintes**.
3. Crio uma nova meta personalizada («Viagens») com cor.
4. A meta aparece como um novo card do mês (0%).
5. Salvo as metas.

## Resultado esperado

- A meta personalizada passa a integrar o conjunto do mês (7 metas).
- As metas são específicas do perfil ativo (não afetam outros perfis).
