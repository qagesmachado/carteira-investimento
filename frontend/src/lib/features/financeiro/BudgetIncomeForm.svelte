<script lang="ts">
  import type { BudgetMonthIncomeItem } from '$lib/api/budget';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';

  export let editing: BudgetMonthIncomeItem | null = null;
  export let saving = false;
  export let embedded = false;
  export let testIdPrefix = 'budget-income-';
  export let onSubmit: (payload: {
    label: string;
    amount_brl: number;
    recurring_12_months: boolean;
  }) => void = () => undefined;
  export let onCancel: () => void = () => undefined;

  let label = '';
  let amountBrl = 0;
  let recurring12Months = false;
  let amountInput: BrDecimalInput;
  let loadedEditingId: number | null = null;

  $: if (editing && editing.id !== loadedEditingId) {
    loadedEditingId = editing.id ?? null;
    label = editing.label;
    amountBrl = editing.amount_brl;
    recurring12Months = editing.recurring ?? false;
  }

  $: if (!editing) {
    loadedEditingId = null;
  }

  function resetForm() {
    label = '';
    amountBrl = 0;
    recurring12Months = false;
  }

  function handleSubmit() {
    if (!label.trim()) {
      return;
    }
    if (!amountInput?.flush() || amountBrl <= 0) {
      return;
    }
    onSubmit({
      label: label.trim(),
      amount_brl: amountBrl,
      recurring_12_months: recurring12Months
    });
    if (!editing) {
      resetForm();
    }
  }
</script>

<div class="{embedded ? 'space-y-3' : 'card bg-base-100 shadow'}" data-testid="{testIdPrefix}form">
  <div class="{embedded ? '' : 'card-body gap-3'}">
    {#if !embedded}
      <h3 class="card-title text-base">Nova renda</h3>
    {/if}
    {#if editing}
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="form-control w-full">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered"
            bind:value={label}
            placeholder="Salário CLT, Freelance…"
            data-testid="{testIdPrefix}name"
          />
        </label>
        <BrDecimalInput
          bind:this={amountInput}
          bind:value={amountBrl}
          currency={true}
          label="Valor (R$)"
          testId="{testIdPrefix}amount"
        />
      </div>
      <div class="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          class="btn btn-ghost"
          disabled={saving}
          data-testid="{testIdPrefix}cancel"
          on:click={() => {
            resetForm();
            onCancel();
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          data-testid="{testIdPrefix}save"
          disabled={saving || !label.trim()}
          on:click={handleSubmit}
        >
          {saving ? 'Salvando…' : 'Atualizar'}
        </button>
      </div>
    {:else}
      <div class="flex flex-wrap items-end gap-3">
        <label class="form-control min-w-[12rem] flex-1">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered"
            bind:value={label}
            placeholder="Salário CLT, Freelance…"
            data-testid="{testIdPrefix}name"
          />
        </label>
        <BrDecimalInput
          bind:this={amountInput}
          bind:value={amountBrl}
          currency={true}
          label="Valor (R$)"
          testId="{testIdPrefix}amount"
        />
        <label class="label cursor-pointer justify-start gap-2 pb-3">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            bind:checked={recurring12Months}
            data-testid="{testIdPrefix}recurring"
          />
          <span class="label-text">Recorrente (12 meses)</span>
        </label>
        <button
          type="button"
          class="btn btn-primary"
          data-testid="{testIdPrefix}save"
          disabled={saving || !label.trim()}
          on:click={handleSubmit}
        >
          {saving ? 'Salvando…' : 'Adicionar'}
        </button>
      </div>
    {/if}
    {#if editing?.recurring}
      <p class="text-sm text-base-content/60">
        Rendas recorrentes permanecem cadastradas por 12 meses a partir do mês em que foram criadas.
      </p>
    {/if}
  </div>
</div>
