<script lang="ts">
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import {
    buildBudgetIncomeDeleteCopy,
    type BudgetIncomeDeleteAction,
    type BudgetIncomeDeleteTarget
  } from './budgetIncomeDelete';

  export let open = false;
  export let target: BudgetIncomeDeleteTarget | null = null;
  export let saving = false;
  export let onConfirm: (action: BudgetIncomeDeleteAction) => void = () => undefined;
  export let onClose: () => void = () => undefined;

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  $: copy = target ? buildBudgetIncomeDeleteCopy(target, formatValue) : null;
  $: isRecurring = target?.kind === 'recurring';
</script>

{#if open && target && copy}
  <dialog class="modal modal-open" aria-modal="true" data-testid="budget-income-delete-confirm-modal">
    <div class="modal-box max-w-lg">
      <h3 class="text-lg font-bold">{copy.title}</h3>
      <p class="mt-3 text-sm">{copy.message}</p>
      {#if copy.warning}
        <p class="mt-2 text-sm text-warning">{copy.warning}</p>
      {/if}
      <div class="mt-6 flex flex-col gap-2">
        {#if isRecurring}
          <button
            type="button"
            class="btn btn-primary w-full"
            disabled={saving}
            data-testid="budget-income-stop-from-month"
            on:click={() => onConfirm('stop-from-month')}
          >
            {saving ? 'Salvando…' : `Parar a partir de ${copy.stopFromMonthLabel}`}
          </button>
          <button
            type="button"
            class="btn btn-error btn-outline w-full"
            disabled={saving}
            data-testid="budget-income-delete-all"
            on:click={() => onConfirm('delete-all')}
          >
            Excluir regra inteira
          </button>
          <button
            type="button"
            class="btn btn-ghost w-full"
            disabled={saving}
            data-testid="budget-income-delete-cancel"
            on:click={onClose}
          >
            Cancelar
          </button>
        {:else}
          <div class="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              class="btn btn-ghost"
              disabled={saving}
              data-testid="budget-income-delete-cancel"
              on:click={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-error"
              disabled={saving}
              data-testid="budget-income-delete-confirm"
              on:click={() => onConfirm('delete-pontual')}
            >
              {saving ? 'Excluindo…' : 'Excluir'}
            </button>
          </div>
        {/if}
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={onClose}></button>
    </form>
  </dialog>
{/if}
