<script lang="ts">
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { computePensionContributionMetrics } from '$lib/features/objetivos/computePensionContributionMetrics';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let planYear = new Date().getFullYear();
  export let initialAnnualGrossIncomeBrl = 0;
  export let initialContributedYtdBrl = 0;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    save: {
      planYear: number;
      annualGrossIncomeBrl: number | null;
      contributedYtdBrl: number;
    };
  }>();

  let annualGrossIncomeValue = 0;
  let contributedValue = 0;
  let wasOpen = false;

  let incomeInput: BrDecimalInput;
  let contributedInput: BrDecimalInput;

  $: if (open && !wasOpen) {
    annualGrossIncomeValue = initialAnnualGrossIncomeBrl;
    contributedValue = initialContributedYtdBrl;
    wasOpen = true;
  } else if (!open) {
    wasOpen = false;
  }

  function incomeForSave(): number | null {
    return annualGrossIncomeValue === 0 ? null : annualGrossIncomeValue;
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!incomeInput.flush() || !contributedInput.flush()) return;
    dispatch('save', {
      planYear,
      annualGrossIncomeBrl: incomeForSave(),
      contributedYtdBrl: contributedValue
    });
  }

  $: draftMetrics = computePensionContributionMetrics(
    planYear,
    annualGrossIncomeValue === 0 ? null : annualGrossIncomeValue,
    contributedValue
  );
</script>

{#if open}
  <dialog class="modal modal-open" data-testid="pension-year-edit-modal">
    <div class="modal-box max-w-xl overflow-visible">
      <h3 class="text-lg font-bold">Editar {planYear}</h3>
      <p class="mt-1 text-sm opacity-70">Renda bruta anual e total aportado no ano.</p>
      <form class="mt-4 space-y-3" on:submit={handleSubmit}>
        <div class="grid gap-3 sm:grid-cols-2">
          <BrDecimalInput
            bind:this={incomeInput}
            bind:value={annualGrossIncomeValue}
            label="Renda bruta anual (R$)"
            inputClass="input input-bordered w-full"
            testId="pension-income-input"
            currency
            disabled={saving}
          />
          <BrDecimalInput
            bind:this={contributedInput}
            bind:value={contributedValue}
            label="Total aportado no ano (R$)"
            inputClass="input input-bordered w-full"
            testId="pension-contributed-input"
            currency
            disabled={saving}
          />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-base-300 bg-base-200/60 p-3">
            <p class="text-xs uppercase opacity-60">Faltante (preview)</p>
            <p class="text-lg font-semibold" data-testid="pension-modal-remaining-value">
              {formatBrl(draftMetrics.remainingBrl)}
            </p>
          </div>
          <div class="rounded-lg border border-base-300 bg-base-200/60 p-3">
            <p class="text-xs uppercase opacity-60">Aporte mensal necessário</p>
            <p class="text-lg font-semibold" data-testid="pension-modal-monthly-value">
              {draftMetrics.monthlyNeededBrl != null ? formatBrl(draftMetrics.monthlyNeededBrl) : '—'}
            </p>
            {#if draftMetrics.monthsRemaining > 0}
              <p class="text-xs opacity-60" data-testid="pension-modal-months-remaining">
                {draftMetrics.remainingBrl > 0
                  ? `${formatBrl(draftMetrics.remainingBrl)} ÷ ${draftMetrics.monthsRemaining} ${
                      draftMetrics.monthsRemaining === 1 ? 'mês' : 'meses'
                    } até dez/${planYear}`
                  : 'Meta atingida'}
              </p>
            {/if}
          </div>
        </div>

        {#if error}
          <p class="text-sm text-error">{error}</p>
        {/if}

        <div class="modal-action">
          <button
            type="button"
            class="btn"
            disabled={saving}
            data-testid="pension-cancel-btn"
            on:click={() => dispatch('close')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={saving}
            data-testid="pension-save-btn"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={() => dispatch('close')}> </button>
    </form>
  </dialog>
{/if}
