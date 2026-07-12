# Controle orçamentário doméstico

## Objetivo

Módulo **Financeiro** (`/financeiro/*`) para orçamento doméstico por perfil (`BudgetProfile`), isolado de carteiras de investimento (`portfolio_id`).

## Escopo MVP

| Tela | Rota | Função |
| --- | --- | --- |
| Painel | `/financeiro` | KPIs do **mês selecionado**, histórico 3M/6M/1A (incl. meses futuros), barras receita×despesa, pizza tags/metas |
| Orçamento | `/financeiro/orcamento/[year-month]` | Conferência por meta, drill-down, transações |
| Despesas | `/financeiro/despesas/[year-month]` | Cadastro de despesas (formulário + tabela) |
| Metas | `/financeiro/metas` | % ou R$ sobre renda prevista; donut |
| Tags | `/financeiro/metas/tags` | CRUD tags (subclassificação); cores únicas por perfil |
| Renda | `/financeiro/renda/[year-month]` | Fontes + valores do mês |
| Perfis | `/financeiro/perfis` | CRUD perfis de orçamento |

## Metas (6 envelopes padrão)

Custos fixos · Conforto · Metas · Prazeres · Liberdade Financeira · Conhecimento

- **Renda prevista:** `BudgetMonth.planned_income_brl` ou botão «usar soma da renda».
- **Modo %:** persiste `BudgetMonthTarget.percent`; soma = 100%.
- **Modo R$:** deriva `% = valor / renda_prevista`.
- **Previsto meta:** `planned_income_brl × percent`.
- **Gasto meta:** soma de `BudgetTransaction` tipo `expense` na categoria.

## Tags

- CRUD em `/financeiro/metas/tags` (nome + cor).
- Cores devem ser **únicas por perfil**: ao abrir a tela, duplicatas existentes recebem nova cor aleatória (mantém a primeira ocorrência).
- A cor inicial do formulário e o botão **Cor aleatória** evitam cores já usadas pelas tags do perfil.

## Renda

- Formulário no topo (nome, valor, checkbox **Recorrente (12 meses)**) e tabela de rendas cadastradas abaixo.
- **Editar** abre modal; o formulário superior permanece só para **Nova renda**.
- Snapshots leves por rota (`view=targets|incomes|expenses`) reduzem payload e queries no carregamento.
- **Recorrente:** persiste a renda nos **12 meses** a partir do mês atual (fonte `BudgetIncomeSource` + `BudgetMonthIncome` em cada mês).
- **Pontual:** lançamento apenas no mês corrente.
- Excluir renda recorrente abre modal com **Parar a partir deste mês** (remove lançamentos deste mês em diante, preserva histórico) ou **Excluir regra inteira** (remove todos os meses e a fonte).
- Botão «Copiar mês anterior».

## Despesas

- Formulário no topo (descrição, data, valor, meta, tag, checkbox **Despesa recorrente**).
- **Recorrente:** regra `BudgetRecurringExpense` materializada em `BudgetTransaction` por mês; vigência **indeterminada** (horizonte 12 meses, estendido ao navegar) ou **até** um mês final.
- Três blocos colapsáveis: **todas do mês** (base principal), **recorrentes** (regras) e **pontuais do mês**.
- Excluir instância recorrente na tabela principal abre modal com **Parar a partir deste mês** (encerra vigência no mês anterior e remove lançamentos futuros) ou **Excluir regra inteira** (remove todo o histórico).
- Despesas cadastradas refletem no **Orçamento** (cards de meta e transações recentes).

## Painel

- Seletor de mês (mesmo controle do Orçamento) define o mês foco dos KPIs (Resultado, Receitas, Despesas, Saldo).
- Botões **3M / 6M** definem janela simétrica: **N meses atrás e N à frente** do mês foco.
- Botão **Personalizado** permite escolher mês de **início** e **fim** manualmente para o histórico.
- Gráficos de pizza (tags e metas): hover na fatia, botão **Ampliar** com modal; sem aba de receitas por tag (renda não usa tags).
- Timeline do dashboard usa agregação SQL por mês; recorrentes são sincronizadas uma vez no horizonte da timeline (ver benchmark em `test-reports/financeiro-benchmark-comparativo.md`).

## Isolamento

- API prefixo `/budget/profiles/{profile_id}/…` — **sem** `/portfolios`.
- Pacote `services/budget/` sem imports de portfolio/posições.
- Preferência ativa: `AppPreference.active_budget_profile_id`.

## API principal

Ver rotas em `backend/app/api/budget.py`.

## Fora do MVP

Parcelas automáticas, import planilha, simulador salário, empréstimos, ponte investimentos (Fase 2+).
