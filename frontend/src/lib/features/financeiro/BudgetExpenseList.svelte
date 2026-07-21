<script lang="ts">
  import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';
  import BudgetCollapsibleSection from '$lib/features/financeiro/BudgetCollapsibleSection.svelte';
  import { splitRecurringAndPontual } from '$lib/features/financeiro/budgetExpenseRows';

  import BudgetExpenseTransactionsTable from './BudgetExpenseTransactionsTable.svelte';
  import BudgetRecurringExpensesTable from './BudgetRecurringExpensesTable.svelte';

  export let expenses: BudgetTransaction[] = [];
  export let recurringRules: BudgetRecurringExpense[] = [];
  export let onEditExpense: (expense: BudgetTransaction) => void = () => undefined;
  export let onDeleteExpense: (expense: BudgetTransaction) => void = () => undefined;
  export let onEditRecurring: (rule: BudgetRecurringExpense) => void = () => undefined;
  export let onDeleteRecurring: (rule: BudgetRecurringExpense) => void = () => undefined;

  $: ({ pontual } = splitRecurringAndPontual(expenses));
</script>

<section class="space-y-4">
  <BudgetCollapsibleSection
    title="Todas as despesas do mês"
    count={expenses.length}
    testId="budget-expense-list"
    open={false}
  >
    <BudgetExpenseTransactionsTable
      rows={expenses}
      showType={true}
      emptyLabel="Nenhuma despesa cadastrada neste mês."
      filterTestId="budget-expense-filters"
      rowTestIdPrefix="budget-expense-row"
      deleteTestIdPrefix="budget-expense-delete"
      {onEditExpense}
      {onDeleteExpense}
    />
  </BudgetCollapsibleSection>

  <BudgetCollapsibleSection
    title="Despesas recorrentes"
    count={recurringRules.length}
    testId="budget-expense-list-recurring"
    open={false}
  >
    <BudgetRecurringExpensesTable
      rules={recurringRules}
      emptyLabel="Nenhuma despesa recorrente cadastrada."
      filterTestId="budget-recurring-filters"
      rowTestIdPrefix="budget-recurring-expense-row"
      deleteTestIdPrefix="budget-recurring-expense-delete"
      {onEditRecurring}
      {onDeleteRecurring}
    />
  </BudgetCollapsibleSection>

  <BudgetCollapsibleSection
    title="Despesas pontuais do mês"
    count={pontual.length}
    testId="budget-expense-list-pontual"
    open={false}
  >
    <BudgetExpenseTransactionsTable
      rows={pontual}
      showType={false}
      emptyLabel="Nenhuma despesa pontual neste mês."
      filterTestId="budget-pontual-filters"
      rowTestIdPrefix="budget-pontual-expense-row"
      {onEditExpense}
      {onDeleteExpense}
    />
  </BudgetCollapsibleSection>
</section>
