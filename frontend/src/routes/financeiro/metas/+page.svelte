<script lang="ts">
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import {
    getMonthSnapshot,
    updateMonthTargets,
    type BudgetMonthSnapshot
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import BudgetDistributionChart from '$lib/features/financeiro/BudgetDistributionChart.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import {
    normalizeTargetPercent,
    percentFromTargetAmount,
    sumTargetPercents,
    targetAmountFromPercent
  } from '$lib/features/financeiro/budgetMonth';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  type EditMode = 'percent' | 'amount';
  type TargetDraft = { category_id: number; category_name: string; color: string; percent: number };

  let snapshot: BudgetMonthSnapshot | null = null;
  let savedSnapshot: BudgetMonthSnapshot | null = null;
  let targets: TargetDraft[] = [];
  let targetAmounts: Record<number, number> = {};
  let plannedIncome = 0;
  let editMode: EditMode = 'percent';
  let loading = true;
  let saving = false;
  let error = '';

  $: profileId = $activeProfileId;
  $: yearMonth = $yearMonthStore;
  $: allocatedPercent = sumTargetPercents(targets);
  $: allocationOk = allocatedPercent === 100;

  async function loadPage() {
    if (profileId == null) {
      snapshot = null;
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      snapshot = await getMonthSnapshot(profileId, yearMonth, 'targets');
      savedSnapshot = snapshot;
      plannedIncome = snapshot.income_total_brl;
      targets = snapshot.categories.map((category) => ({
        category_id: category.category_id,
        category_name: category.category_name,
        color: category.color,
        percent: normalizeTargetPercent(category.percent)
      }));
      targetAmounts = Object.fromEntries(
        targets.map((target) => [
          target.category_id,
          targetAmountFromPercent(plannedIncome, target.percent)
        ])
      );
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar as metas.');
    } finally {
      loading = false;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadPage();
  }

  function resetTargets() {
    if (!savedSnapshot) {
      return;
    }
    plannedIncome = savedSnapshot.income_total_brl;
    targets = savedSnapshot.categories.map((category) => ({
      category_id: category.category_id,
      category_name: category.category_name,
      color: category.color,
      percent: normalizeTargetPercent(category.percent)
    }));
    targetAmounts = Object.fromEntries(
      targets.map((target) => [
        target.category_id,
        targetAmountFromPercent(plannedIncome, target.percent)
      ])
    );
  }

  function syncAmountsFromPercents() {
    targetAmounts = Object.fromEntries(
      targets.map((target) => [
        target.category_id,
        targetAmountFromPercent(plannedIncome, target.percent)
      ])
    );
  }

  function updatePercent(categoryId: number, percent: number) {
    const normalized = normalizeTargetPercent(percent);
    targets = targets.map((target) =>
      target.category_id === categoryId ? { ...target, percent: normalized } : target
    );
    if (editMode === 'percent') {
      targetAmounts = {
        ...targetAmounts,
        [categoryId]: targetAmountFromPercent(plannedIncome, normalized)
      };
    }
  }

  function setTargetAmount(categoryId: number, amount: number) {
    targetAmounts = { ...targetAmounts, [categoryId]: amount };
    updatePercent(categoryId, percentFromTargetAmount(plannedIncome, amount));
  }

  async function saveTargets() {
    if (profileId == null) {
      return;
    }
    if (editMode === 'amount') {
      targets = targets.map((target) => ({
        ...target,
        percent: percentFromTargetAmount(plannedIncome, targetAmounts[target.category_id] ?? 0)
      }));
    }
    if (sumTargetPercents(targets) !== 100) {
      error = 'A soma das metas deve ser 100%.';
      return;
    }
    saving = true;
    error = '';
    try {
      snapshot = await updateMonthTargets(profileId, yearMonth, {
        planned_income_brl: plannedIncome,
        targets: targets.map((target) => ({
          category_id: target.category_id,
          percent: target.percent
        }))
      });
      savedSnapshot = snapshot;
      plannedIncome = snapshot.income_total_brl;
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar as metas.');
    } finally {
      saving = false;
    }
  }

  $: donutSlices = targets.map((target) => ({
    id: target.category_id,
    name: target.category_name,
    color: target.color,
    amount_brl: targetAmountFromPercent(plannedIncome, target.percent),
    percent: target.percent
  }));
</script>

<svelte:head>
  <title>Metas — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if profileId == null}
  <p class="text-base-content/70">Crie um perfil de orçamento em Perfis para começar.</p>
{:else if loading}
  <span class="loading loading-spinner loading-md"></span>
{:else if error}
  <div class="alert alert-error">{error}</div>
{:else}
  <PageSection title="Metas financeiras" testId="financeiro-metas-heading">
      <div class="flex flex-wrap items-end gap-3">
        <div class="form-control w-full max-w-xs">
          <span class="label-text">Renda prevista do mês</span>
          <p
            class="input input-bordered flex items-center bg-base-200 text-base"
            data-testid="budget-planned-income"
          >
            {formatBrl(plannedIncome)}
          </p>
          <span class="label-text-alt mt-1 text-base-content/60">
            Soma da renda cadastrada na aba Renda.
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="join">
          <button
            type="button"
            class="btn btn-xs join-item {editMode === 'percent' ? 'btn-active' : 'btn-outline'}"
            data-testid="budget-target-mode-percent"
            on:click={() => (editMode = 'percent')}
          >
            % Porcentagem
          </button>
          <button
            type="button"
            class="btn btn-xs join-item {editMode === 'amount' ? 'btn-active' : 'btn-outline'}"
            data-testid="budget-target-mode-amount"
            on:click={() => {
              editMode = 'amount';
              syncAmountsFromPercents();
            }}
          >
            $ Valor (R$)
          </button>
        </div>
        <span class="text-sm {allocationOk ? 'text-success' : 'text-error'}">
          Alocado {allocatedPercent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% / 100%
        </span>
      </div>

      <div class="space-y-4">
        {#each targets as target (target.category_id)}
          <div class="rounded border border-base-300 p-3">
            <div class="mb-2 flex items-center justify-between gap-2">
              <span class="font-medium" style:color={target.color}>{target.category_name}</span>
              <span class="text-sm text-base-content/70">
                {formatBrl(targetAmountFromPercent(plannedIncome, target.percent))}
              </span>
            </div>
            {#if editMode === 'percent'}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                class="range range-xs"
                value={target.percent}
                data-testid="budget-target-percent-{target.category_id}"
                on:input={(event) =>
                  updatePercent(target.category_id, Number(event.currentTarget.value))}
              />
              <input
                class="input input-bordered input-sm mt-2 w-24"
                value={target.percent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                on:change={(event) =>
                  updatePercent(
                    target.category_id,
                    Number(event.currentTarget.value.replace(',', '.'))
                  )}
              />
            {:else}
              <BrDecimalInput
                bind:value={targetAmounts[target.category_id]}
                currency={true}
                testId="budget-target-amount-{target.category_id}"
              />
            {/if}
          </div>
        {/each}
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-primary"
          data-testid="budget-save-targets-btn"
          disabled={saving || !allocationOk}
          on:click={saveTargets}
        >
          {saving ? 'Salvando…' : 'Salvar metas'}
        </button>
        <button type="button" class="btn btn-ghost" on:click={resetTargets}>Resetar valores</button>
      </div>
  </PageSection>

  <BudgetDistributionChart title="Visualização de uso" slices={donutSlices} testId="budget-targets-donut" />
{/if}
</div>
