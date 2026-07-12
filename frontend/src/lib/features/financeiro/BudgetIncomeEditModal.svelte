<script lang="ts">
  import type { BudgetMonthIncomeItem } from '$lib/api/budget';

  import BudgetIncomeForm from './BudgetIncomeForm.svelte';

  export let open = false;
  export let editing: BudgetMonthIncomeItem | null = null;
  export let saving = false;
  export let onSubmit: (payload: {
    label: string;
    amount_brl: number;
    recurring_12_months: boolean;
  }) => void = () => undefined;
  export let onClose: () => void = () => undefined;
</script>

{#if open && editing}
  <dialog class="modal modal-open" aria-modal="true" data-testid="budget-income-edit-modal">
    <div class="modal-box max-h-[90vh] max-w-lg overflow-y-auto">
      <h3 class="text-lg font-bold">Editar renda</h3>
      <div class="mt-4">
        <BudgetIncomeForm
          embedded={true}
          testIdPrefix="budget-income-edit-"
          {editing}
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
