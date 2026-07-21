# Metas — adicionar com escopo (mês atual ou meses seguintes)

## Metadados

- **ID:** `UI-FIN-020`
- **Status:** aprovado
- **Página:** `/financeiro/metas`
- **Arquivo de teste:** `e2e/specs/financeiro/20-metas-adicionar-meses-seguintes.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Pré-condições

1. Perfil de orçamento ativo, com renda cadastrada.
2. Mês anterior, mês atual e mês seguinte já possuem conjuntos próprios de metas (customizados).

## Cenário — adicionar meta também aos meses seguintes

1. Abro **Metas** do mês atual.
2. Clico em **Adicionar meta** — abre o modal.
3. Marco o checkbox **Aplicar também aos meses seguintes** (padrão).
4. Crio uma nova meta («Propagada»).
5. Ajusto percentuais se necessário e salvo as metas.

## Resultado esperado

- O mês atual inclui a nova meta.
- O mês seguinte (já customizado) passa a incluir a mesma meta com 0%.
- O mês anterior **não** é alterado.
