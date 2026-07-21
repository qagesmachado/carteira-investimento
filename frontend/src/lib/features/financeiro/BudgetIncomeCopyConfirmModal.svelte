<script lang="ts">
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import type { BudgetIncomeCopyDiff } from './budgetIncomeCopyDiff';
  import { formatYearMonthLabel } from './budgetMonth';

  export let open = false;
  export let diff: BudgetIncomeCopyDiff | null = null;
  export let loadingPreview = false;
  export let saving = false;
  export let onConfirm: () => void = () => undefined;
  export let onClose: () => void = () => undefined;

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  $: previousLabel = diff ? formatYearMonthLabel(diff.previousYearMonth) : '';
</script>

{#if open}
  <dialog class="modal modal-open" aria-modal="true" data-testid="budget-income-copy-confirm-modal">
    <div class="modal-box max-w-lg">
      <h3 class="text-lg font-bold">Copiar renda do mês anterior?</h3>
      {#if loadingPreview || !diff}
        <p class="mt-3 text-sm opacity-70">Calculando diferenças…</p>
        <div class="mt-4 flex justify-center">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      {:else}
        <p class="mt-3 text-sm">
          A renda deste mês será substituída pela de <strong class="capitalize">{previousLabel}</strong>.
          Confira o que entra e o que sai:
        </p>

        {#if !diff.hasChanges}
          <p class="mt-3 text-sm opacity-70" data-testid="budget-income-copy-no-changes">
            Nenhuma alteração: as rendas já são iguais às do mês anterior.
          </p>
        {/if}

        {#if diff.entering.length > 0}
          <div class="mt-4" data-testid="budget-income-copy-entering">
            <h4 class="text-sm font-semibold text-success">Entra</h4>
            <ul class="mt-1 space-y-1 text-sm">
              {#each diff.entering as item}
                <li class="flex justify-between gap-3">
                  <span>
                    {item.label}
                    {#if item.recurring}
                      <span class="opacity-60">(recorrente)</span>
                    {/if}
                  </span>
                  <span class="tabular-nums">{formatValue(item.amount_brl)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if diff.leaving.length > 0}
          <div class="mt-4" data-testid="budget-income-copy-leaving">
            <h4 class="text-sm font-semibold text-error">Sai</h4>
            <ul class="mt-1 space-y-1 text-sm">
              {#each diff.leaving as item}
                <li class="flex justify-between gap-3">
                  <span>
                    {item.label}
                    {#if item.recurring}
                      <span class="opacity-60">(recorrente)</span>
                    {/if}
                  </span>
                  <span class="tabular-nums">{formatValue(item.amount_brl)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if diff.unchanged.length > 0 && diff.hasChanges}
          <div class="mt-4" data-testid="budget-income-copy-unchanged">
            <h4 class="text-sm font-semibold opacity-70">Permanece</h4>
            <ul class="mt-1 space-y-1 text-sm opacity-70">
              {#each diff.unchanged as item}
                <li class="flex justify-between gap-3">
                  <span>{item.label}</span>
                  <span class="tabular-nums">{formatValue(item.amount_brl)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/if}

      <div class="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          class="btn btn-ghost"
          disabled={saving}
          data-testid="budget-income-copy-cancel"
          on:click={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          disabled={saving || loadingPreview || !diff}
          data-testid="budget-income-copy-confirm"
          on:click={onConfirm}
        >
          {saving ? 'Copiando…' : 'Confirmar cópia'}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={onClose}></button>
    </form>
  </dialog>
{/if}
