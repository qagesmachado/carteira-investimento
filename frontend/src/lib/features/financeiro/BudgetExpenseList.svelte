<script lang="ts">
  import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';
  import { formatIsoDateToBr } from '$lib/brDate';
  import BudgetCollapsibleSection from '$lib/features/financeiro/BudgetCollapsibleSection.svelte';
  import {
    formatRecurringEndLabel,
    splitRecurringAndPontual
  } from '$lib/features/financeiro/budgetExpenseRows';
  import { formatYearMonthLabel } from '$lib/features/financeiro/budgetMonth';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  export let expenses: BudgetTransaction[] = [];
  export let recurringRules: BudgetRecurringExpense[] = [];
  export let onEditExpense: (expense: BudgetTransaction) => void = () => undefined;
  export let onDeleteExpense: (expense: BudgetTransaction) => void = () => undefined;
  export let onEditRecurring: (rule: BudgetRecurringExpense) => void = () => undefined;
  export let onDeleteRecurring: (rule: BudgetRecurringExpense) => void = () => undefined;

  $: ({ pontual } = splitRecurringAndPontual(expenses));

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }
</script>

<section class="space-y-4">
  <BudgetCollapsibleSection
    title="Todas as despesas do mês"
    count={expenses.length}
    testId="budget-expense-list"
    open={true}
  >
    {#if expenses.length === 0}
      <p class="pt-2 text-sm text-base-content/60">Nenhuma despesa cadastrada neste mês.</p>
    {:else}
      <div class="overflow-x-auto pt-2">
        <table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Meta</th>
              <th>Tag</th>
              <th class="text-end">Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each expenses as expense (expense.id)}
              <tr data-testid="budget-expense-row-{expense.id}">
                <td class="whitespace-nowrap">{formatIsoDateToBr(expense.event_date)}</td>
                <td>{expense.description}</td>
                <td>{expense.recurring ? 'Recorrente' : 'Pontual'}</td>
                <td>{expense.category_name ?? '—'}</td>
                <td>{expense.tag_name ?? '—'}</td>
                <td class="text-end tabular-nums text-error">{formatValue(expense.amount_brl)}</td>
                <td class="space-x-2 text-right">
                  <button type="button" class="btn btn-ghost btn-xs" on:click={() => onEditExpense(expense)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-error"
                    data-testid="budget-expense-delete-{expense.id}"
                    on:click={() => onDeleteExpense(expense)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </BudgetCollapsibleSection>

  <BudgetCollapsibleSection
    title="Despesas recorrentes"
    count={recurringRules.length}
    testId="budget-expense-list-recurring"
    open={false}
  >
    {#if recurringRules.length === 0}
      <p class="pt-2 text-sm text-base-content/60">Nenhuma despesa recorrente cadastrada.</p>
    {:else}
      <div class="overflow-x-auto pt-2">
        <table class="table">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Descrição</th>
              <th>Meta</th>
              <th>Tag</th>
              <th>Início</th>
              <th>Término</th>
              <th class="text-end">Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each recurringRules as rule (rule.id)}
              <tr data-testid="budget-recurring-expense-row-{rule.id}">
                <td class="whitespace-nowrap">{rule.day_of_month}</td>
                <td>{rule.description}</td>
                <td>{rule.category_name ?? '—'}</td>
                <td>{rule.tag_name ?? '—'}</td>
                <td>{formatYearMonthLabel(rule.start_year_month)}</td>
                <td>{formatRecurringEndLabel(rule)}</td>
                <td class="text-end tabular-nums text-error">{formatValue(rule.amount_brl)}</td>
                <td class="space-x-2 text-right">
                  <button type="button" class="btn btn-ghost btn-xs" on:click={() => onEditRecurring(rule)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-error"
                    data-testid="budget-recurring-expense-delete-{rule.id}"
                    on:click={() => onDeleteRecurring(rule)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </BudgetCollapsibleSection>

  <BudgetCollapsibleSection
    title="Despesas pontuais do mês"
    count={pontual.length}
    testId="budget-expense-list-pontual"
    open={false}
  >
    {#if pontual.length === 0}
      <p class="pt-2 text-sm text-base-content/60">Nenhuma despesa pontual neste mês.</p>
    {:else}
      <div class="overflow-x-auto pt-2">
        <table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Meta</th>
              <th>Tag</th>
              <th class="text-end">Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each pontual as expense (expense.id)}
              <tr data-testid="budget-pontual-expense-row-{expense.id}">
                <td class="whitespace-nowrap">{formatIsoDateToBr(expense.event_date)}</td>
                <td>{expense.description}</td>
                <td>{expense.category_name ?? '—'}</td>
                <td>{expense.tag_name ?? '—'}</td>
                <td class="text-end tabular-nums text-error">{formatValue(expense.amount_brl)}</td>
                <td class="space-x-2 text-right">
                  <button type="button" class="btn btn-ghost btn-xs" on:click={() => onEditExpense(expense)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs text-error"
                    on:click={() => onDeleteExpense(expense)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </BudgetCollapsibleSection>
</section>
