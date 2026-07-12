<script lang="ts">
  import type { BudgetMonthIncomeItem } from '$lib/api/budget';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  import { formatBudgetIncomeType } from './budgetIncomeRows';

  export let incomes: BudgetMonthIncomeItem[] = [];
  export let onEdit: (income: BudgetMonthIncomeItem) => void = () => undefined;
  export let onDelete: (income: BudgetMonthIncomeItem) => void = () => undefined;
</script>

<section class="rounded-box bg-base-100 p-4 shadow" data-testid="budget-income-list">
  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h3 class="text-lg font-semibold">Rendas cadastradas</h3>
    {#if incomes.length > 0}
      <span class="badge badge-neutral">{incomes.length} {incomes.length === 1 ? 'item' : 'itens'}</span>
    {/if}
  </div>

  {#if incomes.length === 0}
    <p class="text-sm text-base-content/60">Nenhuma renda cadastrada neste mês.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th class="text-end">Valor</th>
            <th>Tipo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each incomes as income (income.id ?? `${income.label}-${income.amount_brl}`)}
            <tr data-testid="budget-income-row-{income.id}">
              <td>{income.label}</td>
              <td class="text-end tabular-nums">{formatBrl(income.amount_brl)}</td>
              <td>{formatBudgetIncomeType(income.recurring ?? false)}</td>
              <td class="space-x-2 text-right">
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => onEdit(income)}>
                  Editar
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error"
                  data-testid="budget-income-delete-{income.id}"
                  on:click={() => onDelete(income)}
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
</section>
