# Controle orçamentário doméstico

## Objetivo

Módulo **Financeiro** (`/financeiro/*`) para orçamento doméstico por perfil (`BudgetProfile`), isolado de carteiras de investimento (`portfolio_id`).

## Escopo MVP

| Tela | Rota | Função |
| --- | --- | --- |
| Painel | `/financeiro` | KPIs do **mês selecionado**, histórico 3M/6M/1A (incl. meses futuros), barras receita×despesa, pizza tags/metas |
| Orçamento | `/financeiro/orcamento/[year-month]` | Conferência por meta, drill-down, transações |
| Despesas | `/financeiro/despesas/[year-month]` | Cadastro de despesas (formulário + tabela) |
| Controle | `/financeiro/controle/[year-month]` | Checklist visual de recebido/pago das recorrentes do mês |
| Metas | `/financeiro/metas` | % sobre renda prevista; CRUD por perfil; conjunto por mês com herança; donut; sub-abas Metas / Histórico / Tags |
| Tags | `/financeiro/metas/tags` | CRUD tags (subclassificação); cores únicas por perfil |
| Renda | `/financeiro/renda/[year-month]` | Fontes + valores do mês |
| Perfis | `/financeiro/perfis` | CRUD perfis de orçamento |

## Layout e navegação

Todas as telas seguem o padrão visual de hub do app (mesmo de `/proventos` e `/analise`):

- **Hero** no topo (`PageHero variant="dashboard"`, título «Financeiro» + subtítulo por aba).
- **Pills de navegação** com ícone Lucide (`FinanceiroSectionTabs`): Painel · Orçamento · Despesas · Controle · Metas · Renda · Perfis (testids `financeiro-section-tab-{id}`).
- **Painel de perfil** (`BudgetProfileBarPanel`, `data-testid="budget-profile-bar"`) logo abaixo das pills — mesmo estilo do painel de carteira do dashboard/proventos (ícone `Users`, rótulo «Perfil», nome do perfil ativo e `select` invisível sobreposto, testid `budget-profile-select`).
- **Painel de mês** (`BudgetMonthNav`, chevrons Lucide, `data-testid="budget-month-label"`) aparece logo abaixo das pills em todas as abas dependentes do mês (todas, exceto **Perfis**). Em Orçamento/Despesas/Controle/Renda a navegação troca a URL do mês; nas demais apenas atualiza o mês foco.
  - Setas **‹ ›** (ícones `ChevronLeft`/`ChevronRight`) navegam um mês por vez.
  - Botão **Mês atual** (ícone `CalendarCheck`, `data-testid="budget-month-today"`) volta ao mês corrente; fica **desabilitado** quando já se está nele.
  - **Seletor de mês** (input `type="month"`, ícone `CalendarDays`, `data-testid="budget-month-picker"`) permite saltar direto para qualquer mês sem navegar um a um.
- Em Metas há **sub-pills** Metas / Histórico / Tags (`/financeiro/metas`, `/financeiro/metas/historico` e `/financeiro/metas/tags`).
- Cada seção usa `PageSection` com **cabeçalho de ícone** e os botões de ação seguem o padrão da consolidada (`btn-outline btn-xs` com ícones `Pencil`/`Trash2`).

## Estados vazios (sem perfil)

- **Sem nenhum perfil cadastrado:** todas as abas (Painel, Orçamento, Despesas, Controle, Metas, Renda, Tags) exibem o **cabeçalho da seção** e, no lugar do conteúdo, o onboarding padronizado (`EmptyStateCallout` «Nenhum perfil financeiro ainda» + botão **Criar perfil** → `/financeiro/perfis`). A aba **Perfis** permanece totalmente funcional (é o ponto de criação).
- **Preferência ativa órfã:** ao excluir todos os perfis, o layout limpa a preferência `active_budget_profile_id` no backend (grava `null`), mantendo paridade com a carteira ativa.

## Feedback (toasts)

- Erros e confirmações usam o **sistema de toast** (`DismissibleAlert` → `AppToastStack`), substituindo os antigos `alert alert-error` inline.
- Toasts de **sucesso** são disparados após cada ação CRUD: salvar/editar/excluir despesa, renda (incl. «copiar mês anterior»), meta, perfil e tag.
- Validações de formulário (ex.: valor/nome obrigatórios na renda e na despesa) exibem mensagem contextual/`toast` sem bloquear a tela.

## Metas (personalizadas por perfil, por mês)

Novo perfil nasce com 6 envelopes padrão (Custos fixos · Conforto · Metas · Prazeres · Liberdade Financeira · Conhecimento), mas o conjunto é **totalmente editável por perfil**.

- **Só percentual:** cada meta guarda `BudgetMonthTarget.percent`; a soma do mês deve ser 100%. Não há mais modo «valor em R$».
- **Previsto meta:** `renda_prevista × percent` (apenas exibido; derivado, não editável).
- **Renda prevista:** `BudgetMonth.planned_income_brl` (quando definida) ou herança do mês anterior; sem nenhuma, usa a soma da renda do mês.
- **CRUD de metas (por perfil):** criar, renomear, trocar cor e excluir. Perfis são isolados — as metas de um não afetam o outro.
  - **Excluir** (catálogo) é bloqueado (409) quando a meta possui despesas ou recorrências vinculadas (em qualquer mês). **Remover** (do mês) é bloqueado quando há despesa naquele mês ou recorrência ativa que o cubra.
  - **Renomear/cor:** por padrão vale para todos os meses (`scope=all`); com «a partir deste mês» (`scope=from_month`) grava override por mês (`BudgetMonthTarget.name_override`/`color_override`), preservando os meses anteriores.
- **Conjunto por mês + herança:** cada mês tem seu próprio conjunto de metas. Um mês **sem metas próprias** herda do mês anterior mais recente que as tenha (badge «Herdado do mês anterior»); se nenhum, usa os padrões. Editar/salvar um mês materializa o conjunto dele e **não altera** meses anteriores — passa a valer daquele mês para frente nos meses ainda não customizados.
- **UI:** cards em grade de duas colunas; botão **Adicionar meta** abre modal (incluir existente do catálogo ou criar nova) com checkbox **Aplicar também aos meses seguintes** (padrão ligado). **Salvar metas** abre modal com o mesmo checkbox — quando ligado, copia o conjunto completo (categorias + %) para meses seguintes que já tiverem metas próprias. Ao adicionar sem salvar o conjunto inteiro, `propagate_category_ids` inclui só as novas com 0%. Indicador **Alocado X% / 100%** em destaque (com «Faltam Y%» / «Excedeu Y%»). **Remover** (do mês) e **Excluir** (do catálogo) são bloqueados quando a meta tem despesa no mês ou recorrência ativa vinculada. Remover abre confirmação com checkbox **Remover também dos meses seguintes** e não redistribui o %. Modal de edição com escopo (todos os meses / a partir deste mês) e ação de excluir do catálogo.
- **Gasto meta:** soma de `BudgetTransaction` tipo `expense` na categoria.
- **Histórico de metas** (`/financeiro/metas/historico`): lista **todas** as categorias do perfil (em uso no mês ou só no catálogo), com contagem de despesas e recorrências. Permite inspecionar registros e **excluir em definitivo** só quando não houver nenhum vínculo. Se houver despesas/recorrências, a tela oferece **Excluir todas as despesas desta meta** (passado e futuro) para liberar a exclusão definitiva — a meta some do select «Incluir meta existente».

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
- Botão «Copiar mês anterior»: abre modal de confirmação com o **diff** (o que **entra** do mês anterior e o que **sai** do mês atual). A cópia só ocorre após confirmar; substitui todas as rendas do mês pela lista do mês anterior.

## Despesas

- Formulário no topo (descrição, data, valor, meta, tag, checkbox **Despesa recorrente**).
- **Recorrente:** regra `BudgetRecurringExpense` materializada em `BudgetTransaction` por mês; vigência **indeterminada** (horizonte 12 meses, estendido ao navegar) ou **até** um mês final.
- Três blocos colapsáveis: **todas do mês** (base principal), **recorrentes** (regras) e **pontuais do mês**. Os três carregam **fechados** por padrão.
- Cada bloco tem **filtros** (busca por descrição, meta e tag), **ordenação** por coluna (cabeçalhos clicáveis) e **paginação** no padrão de `/proventos/lancamentos` (`DividendTablePagination` + `paginateList`: «Mostrando X–Y de Z», seletor **Por página**, **Anterior n/m Próxima**). Componentes reutilizáveis: `BudgetExpenseFilterBar`, `BudgetExpenseTransactionsTable`, `BudgetRecurringExpensesTable`.
- No topo direito do painel **Despesas do mês** há um **resumo** com **Receitas**, **Despesas** (total do mês) e **Sobrando** (saldo = receitas − despesas). Não há linha "Total de despesas" separada — o total vive apenas nesse resumo.
- Excluir instância recorrente na tabela principal abre modal com **Parar a partir deste mês** (encerra vigência no mês anterior e remove lançamentos futuros) ou **Excluir regra inteira** (remove todo o histórico).
- A aba **Despesas recorrentes** lista apenas regras **vigentes no mês visualizado** (indeterminadas ou com fim ≥ mês da página). Uma regra parada/encerrada deixa de aparecer na aba nos meses em que não gera mais cobrança — continua visível somente até seu último mês cobrado e nas transações já lançadas dos meses cobrados.
- Despesas cadastradas refletem no **Orçamento** (cards de meta e transações recentes).

## Controle (recebido / pago)

Aba mensal `/financeiro/controle/[year-month]` para conferir visualmente se as **recorrentes** do mês já entraram ou foram pagas. Não altera totais, KPIs do Orçamento nem cria/remove lançamentos.

- **Só recorrentes:** rendas com fonte recorrente (`BudgetMonthIncome` + `source_id` recorrente) e despesas com regra (`BudgetTransaction` + `recurring_expense_id`). Pontuais ficam de fora (já foram gastos/recebidos ao cadastrar).
- **Layout:** dois painéis — **Rendas recorrentes** (checkbox Recebido) e **Despesas recorrentes** (checkbox Pago); empilhados no mobile.
- **Resumo:** previsto / conferido / pendente por painel; cabeçalho «X de Y recebidos · A de B pagos».
- **Filtro** por painel: Todas | Pendentes | Conferidas.
- Flags: `BudgetMonthIncome.received` e `BudgetTransaction.settled` (default `false`). Snapshot leve `view=settlement`.
- Copiar renda do mês anterior **não** copia `received`. Rematerialização de despesa recorrente **preserva** `settled` do mês.
- Edição de valores continua em Renda / Despesas; esta tela só marca/desmarca conferência.

## Orçamento — transações recentes

- Abaixo dos cards de meta, a seção **Transações recentes** lista os lançamentos do mês em tabela alinhada (Data, Descrição, Tag, Meta, Valor).
- **Filtros:** busca por descrição, **Meta** e **Tag** (opções derivadas das transações do mês). Botão **Limpar** restaura o padrão. Não há filtro por tipo: a lista contém apenas despesas (receita vive em `BudgetMonthIncome`, fora de `transactions`).
- **Ordenação:** cabeçalhos clicáveis em todas as colunas (Data, Descrição, Tag, Meta, Valor) com ícone `ArrowUp`/`ArrowDown`; padrão por data decrescente.
- **Paginação:** mesmo padrão de `/proventos/lancamentos` (`DividendTablePagination` + `paginateList`): barras no topo e no rodapé com «Mostrando X–Y de Z», seletor **Por página** (10/20/50/100, padrão 20) e botões **Anterior n/m Próxima**. Alterar filtro ou ordenação volta para a página 1.

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
