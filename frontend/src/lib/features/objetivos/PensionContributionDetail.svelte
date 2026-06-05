<script lang="ts">
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import type { Objective, PensionContribution } from '$lib/api/objetivos';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { sortPensionYears } from '$lib/features/objetivos/sortPensionYears';
  import { createEventDispatcher } from 'svelte';

  export let objective: Objective | null = null;
  export let selectedYear: number | null = null;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    edit: void;
    deleteObjective: void;
    selectYear: number;
    addYear: { planYear: number; annualGrossIncomeBrl: number | null };
    deleteYear: number;
    save: {
      planYear: number;
      annualGrossIncomeBrl: number | null;
      contributedYtdBrl: number;
    };
  }>();

  let annualGrossIncomeValue = 0;
  let contributedValue = 0;
  let newYear = '';
  let newYearIncomeValue = 0;
  let lastDraftSignature = '';
  let editing = false;
  let addingYear = false;

  let incomeInput: BrDecimalInput;
  let contributedInput: BrDecimalInput;
  let newYearIncomeInput: BrDecimalInput;

  $: summary = objective?.pension_contribution;
  $: years = sortPensionYears(summary?.years ?? []);
  $: consolidatedTotal = summary?.consolidated_total_brl ?? 0;
  $: activeYear =
    selectedYear != null
      ? years.find((row) => row.plan_year === selectedYear) ?? null
      : years[0] ?? null;

  $: if (activeYear) {
    const signature = `${activeYear.plan_year}:${activeYear.annual_gross_income_brl}:${activeYear.contributed_ytd_brl}`;
    if (signature !== lastDraftSignature && !editing) {
      annualGrossIncomeValue = activeYear.annual_gross_income_brl ?? 0;
      contributedValue = activeYear.contributed_ytd_brl;
      lastDraftSignature = signature;
    }
  }

  function incomeForSave(): number | null {
    return annualGrossIncomeValue === 0 ? null : annualGrossIncomeValue;
  }

  function startEditing() {
    if (!activeYear) return;
    annualGrossIncomeValue = activeYear.annual_gross_income_brl ?? 0;
    contributedValue = activeYear.contributed_ytd_brl;
    editing = true;
  }

  function cancelEditing() {
    if (!activeYear) return;
    annualGrossIncomeValue = activeYear.annual_gross_income_brl ?? 0;
    contributedValue = activeYear.contributed_ytd_brl;
    editing = false;
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!editing || !activeYear) return;
    if (!incomeInput.flush() || !contributedInput.flush()) return;
    dispatch('save', {
      planYear: activeYear.plan_year,
      annualGrossIncomeBrl: incomeForSave(),
      contributedYtdBrl: contributedValue
    });
  }

  function handleAddYear(event: Event) {
    event.preventDefault();
    const planYear = Number(newYear);
    if (!Number.isFinite(planYear) || planYear < 2000 || planYear > 2100) return;
    if (!newYearIncomeInput.flush()) return;
    dispatch('addYear', {
      planYear,
      annualGrossIncomeBrl: newYearIncomeValue === 0 ? null : newYearIncomeValue
    });
    newYear = '';
    newYearIncomeValue = 0;
    addingYear = false;
  }

  export function exitEditMode() {
    editing = false;
  }

  function formatProgress(row: PensionContribution): string {
    return `${row.progress_percent.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  }
</script>

{#if objective && summary}
  <section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="pension-contribution-detail">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold">{objective.name}</h2>
        <p class="text-xs opacity-60">Controle de aporte previdenciário (PGBL)</p>
        <p class="text-sm opacity-70">
          Total aportado (todos os anos): <strong>{formatBrl(consolidatedTotal)}</strong>
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="btn btn-sm btn-ghost" on:click={() => dispatch('edit')}>
          Renomear
        </button>
        <button
          type="button"
          class="btn btn-sm btn-ghost text-error"
          data-testid="objetivo-delete-objective-btn"
          on:click={() => dispatch('deleteObjective')}
        >
          Excluir objetivo
        </button>
      </div>
    </div>

    <h3 class="mb-2 font-medium">Consolidado por ano</h3>
    <div class="mb-4 overflow-x-auto">
      <table class="table table-sm" data-testid="pension-consolidated-table">
        <thead>
          <tr>
            <th>Ano</th>
            <th>Aportado</th>
            <th>Meta (12%)</th>
            <th>Progresso</th>
          </tr>
        </thead>
        <tbody>
          {#each years as row (row.plan_year)}
            <tr data-testid={`pension-consolidated-row-${row.plan_year}`}>
              <td>{row.plan_year}</td>
              <td>{formatBrl(row.contributed_ytd_brl)}</td>
              <td>{formatBrl(row.target_annual_brl)}</td>
              <td>{formatProgress(row)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      {#each years as row (row.plan_year)}
        <button
          type="button"
          class="btn btn-sm"
          class:btn-primary={selectedYear === row.plan_year}
          class:btn-outline={selectedYear !== row.plan_year}
          data-testid={`pension-year-tab-${row.plan_year}`}
          on:click={() => dispatch('selectYear', row.plan_year)}
        >
          {row.plan_year}
        </button>
      {/each}
      <button
        type="button"
        class="btn btn-sm btn-ghost"
        data-testid="pension-add-year-btn"
        disabled={saving || editing}
        on:click={() => (addingYear = !addingYear)}
      >
        + Ano
      </button>
    </div>

    {#if addingYear}
      <form class="mb-4 grid gap-3 sm:grid-cols-3" on:submit={handleAddYear}>
        <label class="form-control w-full">
          <span class="label-text">Novo ano</span>
          <input
            class="input input-bordered w-full"
            type="number"
            min="2000"
            max="2100"
            bind:value={newYear}
            required
            data-testid="pension-new-year-input"
          />
        </label>
        <BrDecimalInput
          bind:this={newYearIncomeInput}
          bind:value={newYearIncomeValue}
          label="Renda bruta anual (R$)"
          inputClass="input input-bordered w-full"
          testId="pension-new-year-income-input"
          disabled={saving}
        />
        <div class="flex items-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm" disabled={saving}>Adicionar</button>
          <button
            type="button"
            class="btn btn-sm"
            on:click={() => {
              addingYear = false;
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    {/if}

    {#if activeYear}
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-medium">Detalhe {activeYear.plan_year}</h3>
        {#if years.length > 1 && !editing}
          <button
            type="button"
            class="btn btn-sm btn-ghost text-error"
            data-testid="pension-delete-year-btn"
            disabled={saving}
            on:click={() => dispatch('deleteYear', activeYear.plan_year)}
          >
            Excluir ano
          </button>
        {/if}
      </div>
      <form class="space-y-4" on:submit={handleSubmit}>
        <div class="grid gap-3 sm:grid-cols-2">
          {#key activeYear.plan_year}
            <BrDecimalInput
              bind:this={incomeInput}
              bind:value={annualGrossIncomeValue}
              label="Renda bruta anual (R$)"
              inputClass="input input-bordered w-full"
              testId="pension-income-input"
              currency
              disabled={!editing || saving}
            />
            <BrDecimalInput
              bind:this={contributedInput}
              bind:value={contributedValue}
              label="Total aportado no ano (R$)"
              inputClass="input input-bordered w-full"
              testId="pension-contributed-input"
              currency
              disabled={!editing || saving}
            />
          {/key}
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-base-300 p-3">
            <p class="text-xs uppercase opacity-60">Meta anual (12%)</p>
            <p class="text-lg font-semibold" data-testid="pension-target-value">
              {formatBrl(activeYear.target_annual_brl)}
            </p>
          </div>
          <div class="rounded-lg border border-base-300 p-3">
            <p class="text-xs uppercase opacity-60">Faltante</p>
            <p class="text-lg font-semibold" data-testid="pension-remaining-value">
              {formatBrl(activeYear.remaining_brl)}
            </p>
          </div>
          <div class="rounded-lg border border-base-300 p-3">
            <p class="text-xs uppercase opacity-60">Aporte mensal necessário</p>
            <p class="text-lg font-semibold" data-testid="pension-monthly-value">
              {activeYear.monthly_needed_brl != null
                ? formatBrl(activeYear.monthly_needed_brl)
                : '—'}
            </p>
          </div>
          <div class="rounded-lg border border-base-300 p-3">
            <p class="text-xs uppercase opacity-60">Progresso</p>
            <p class="text-lg font-semibold" data-testid="pension-progress-value">
              {formatProgress(activeYear)}
            </p>
          </div>
        </div>

        <div>
          <progress
            class="progress progress-primary w-full"
            value={activeYear.progress_percent}
            max="100"
            data-testid="pension-progress-bar"
          ></progress>
        </div>

        {#if error}
          <p class="text-sm text-error">{error}</p>
        {/if}

        <div class="flex justify-end gap-2">
          {#if editing}
            <button
              type="button"
              class="btn btn-sm"
              disabled={saving}
              data-testid="pension-cancel-btn"
              on:click={cancelEditing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              disabled={saving}
              data-testid="pension-save-btn"
            >
              Salvar
            </button>
          {:else}
            <button
              type="button"
              class="btn btn-primary btn-sm"
              disabled={saving}
              data-testid="pension-edit-btn"
              on:click={startEditing}
            >
              Editar
            </button>
          {/if}
        </div>
      </form>
    {/if}
  </section>
{/if}
