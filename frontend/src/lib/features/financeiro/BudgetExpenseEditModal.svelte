<script lang="ts">
  import type { BudgetCategoryKpi, BudgetRecurringExpense, BudgetTag, BudgetTransaction } from '$lib/api/budget';

  import BudgetExpenseForm from './BudgetExpenseForm.svelte';

  export let open = false;
  export let categories: BudgetCategoryKpi[] = [];
  export let tags: BudgetTag[] = [];
  export let editing: BudgetTransaction | null = null;
  export let editingRecurring: BudgetRecurringExpense | null = null;
  export let saving = false;
  export let onSubmit: (payload: {
    description: string;
    event_date: string;
    amount_brl: number;
    category_id: number;
    tag_id: number | null;
    recurring?: boolean;
    indefinite?: boolean;
    end_year_month?: string | null;
  }) => void = () => undefined;
  export let onClose: () => void = () => undefined;
</script>

{#if open && (editing || editingRecurring)}
  <dialog class="modal modal-open" aria-modal="true" data-testid="budget-expense-edit-modal">
    <div class="modal-box max-h-[90vh] max-w-2xl overflow-y-auto">
      <h3 class="text-lg font-bold">
        {editingRecurring ? 'Editar despesa recorrente' : 'Editar despesa'}
      </h3>
      <div class="mt-4">
        <BudgetExpenseForm
          embedded={true}
          testIdPrefix="budget-expense-edit-"
          {categories}
          {tags}
          {editing}
          {editingRecurring}
          {saving}
          {onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={onClose}></button>
    </form>
  </dialog>
{/if}
