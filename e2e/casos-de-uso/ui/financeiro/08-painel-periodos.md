# Painel — períodos 3M/6M e intervalo personalizado

## Metadados

- **ID:** `UI-FIN-008`
- **Status:** aprovado
- **Página:** `/financeiro`
- **Arquivo de teste:** `e2e/specs/financeiro/08-painel-periodos.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Cenário

1. Com perfil seed e renda/despesa no mês atual, abro o painel.
2. KPIs do mês foco mostram receitas e resultado; **3M** já vem selecionado (7 barras).
3. Clico **6M**: o histórico amplia para 13 barras.
4. Clico **Personalizado** com rótulos **Mês inicial** / **Mês final**; escolho intervalo manual.
