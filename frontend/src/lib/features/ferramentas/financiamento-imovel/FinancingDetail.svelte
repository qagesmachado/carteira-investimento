<script lang="ts">
  import type { FinancingEntry, PropertyFinancing } from '$lib/api/propertyFinancings';
  import { formatIsoDateToBr } from '$lib/brDate';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { createEventDispatcher } from 'svelte';

  import { buildFinancingTimelinesFromEntries } from './computeFinancingMetrics';
  import FinancingCashflowChart from './FinancingCashflowChart.svelte';
  import FinancingEventForm from './FinancingEventForm.svelte';
  import { formatEntryType, formatEventCategory } from './eventLabels';
  import { formatPropertyType } from './propertyTypeLabels';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';
  import {
    sortFinancingEntries,
    toggleSortDirection,
    type FinancingEntrySortKey,
    type SortDirection
  } from './sortFinancingEntries';

  export let financing: PropertyFinancing;
  export let saving = false;

  const dispatch = createEventDispatcher<{
    edit: void;
    delete: void;
    addEntry: import('$lib/api/propertyFinancings').FinancingEntryCreate;
    updateEntry: { entryId: number; amount_brl: number };
    deleteEntry: number;
  }>();

  let sortKey: FinancingEntrySortKey = 'event_date';
  let sortDir: SortDirection = 'desc';
  let currentPage = 1;
  let pageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;
  let editingEntryId: number | null = null;
  let editAmount = 0;
  let editAmountInput: BrDecimalInput;

  function resetPagination() {
    currentPage = 1;
  }

  $: metrics = financing.metrics;
  $: chartTimelines = buildFinancingTimelinesFromEntries(financing.entries);
  $: financing.id, resetPagination();
  $: displayedEntries = sortFinancingEntries(financing.entries, sortKey, sortDir);
  $: pagination = paginateList(displayedEntries, { page: currentPage, pageSize });

  function headerClass(key: FinancingEntrySortKey): string {
    return sortKey === key ? 'font-bold' : 'font-normal';
  }

  function handleSort(key: FinancingEntrySortKey) {
    if (sortKey === key) {
      sortDir = toggleSortDirection(sortDir);
    } else {
      sortKey = key;
      sortDir = key === 'event_date' ? 'desc' : 'asc';
    }
    resetPagination();
  }

  function startEdit(entry: FinancingEntry) {
    editingEntryId = entry.id;
    editAmount = entry.amount_brl;
  }

  function cancelEdit() {
    editingEntryId = null;
    editAmount = 0;
  }

  function saveEdit(entryId: number) {
    if (!editAmountInput?.flush() || editAmount <= 0) {
      return;
    }
    dispatch('updateEntry', { entryId, amount_brl: editAmount });
    editingEntryId = null;
    editAmount = 0;
  }
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="financing-detail">
  <div class="mb-4 flex flex-wrap items-start justify-between gap-2">
    <div>
      <h2 class="text-lg font-semibold">{financing.name}</h2>
      <span class="badge badge-outline">{formatPropertyType(financing.property_type)}</span>
      {#if financing.description}
        <p class="mt-1 text-sm opacity-70">{financing.description}</p>
      {/if}
    </div>
    <div class="flex gap-2">
      <button type="button" class="btn btn-sm btn-ghost" on:click={() => dispatch('edit')}>
        Editar
      </button>
      <button
        type="button"
        class="btn btn-sm btn-error btn-outline"
        data-testid="financing-delete-btn"
        on:click={() => dispatch('delete')}
      >
        Excluir
      </button>
    </div>
  </div>

  <div class="mb-6 grid gap-3 sm:grid-cols-3">
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Total recebido</p>
      <p class="text-xl font-semibold text-success" data-testid="detail-total-income">
        {formatBrl(metrics.total_income_brl)}
      </p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Capital investido total</p>
      <p class="text-xl font-semibold text-error" data-testid="detail-capital-invested">
        {formatBrl(metrics.capital_invested_brl)}
      </p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Lucro (receita − despesa)</p>
      <p
        class="text-xl font-semibold"
        data-testid="detail-profit"
        class:text-success={metrics.profit_brl >= 0}
        class:text-error={metrics.profit_brl < 0}
      >
        {formatBrl(metrics.profit_brl)}
      </p>
    </div>
  </div>

  <FinancingCashflowChart
    monthlyTimeline={chartTimelines.monthlyTimeline}
    annualTimeline={chartTimelines.annualTimeline}
    title="Este imóvel — receitas vs despesas"
  />

  <div class="mt-6">
    <FinancingEventForm loading={saving} on:submit={(e) => dispatch('addEntry', e.detail)} />
  </div>

  <div class="mt-6">
    <h3 class="mb-2 font-medium">Lançamentos</h3>
    {#if financing.entries.length === 0}
      <p class="text-sm opacity-60">Nenhum lançamento registrado.</p>
    {:else}
      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        ariaLabel="Paginação da tabela de lançamentos"
      />

      <div class="overflow-x-auto">
        <table class="table table-sm" data-testid="financing-entries-table">
          <thead>
            <tr>
              <th>
                <button type="button" class="btn btn-ghost btn-xs {headerClass('event_date')}" on:click={() => handleSort('event_date')}>
                  Data
                  {#if sortKey === 'event_date'}{sortDir === 'asc' ? ' ↑' : ' ↓'}{/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs {headerClass('entry_type')}" on:click={() => handleSort('entry_type')}>
                  Tipo
                  {#if sortKey === 'entry_type'}{sortDir === 'asc' ? ' ↑' : ' ↓'}{/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs {headerClass('event_category')}" on:click={() => handleSort('event_category')}>
                  Evento
                  {#if sortKey === 'event_category'}{sortDir === 'asc' ? ' ↑' : ' ↓'}{/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs {headerClass('description')}" on:click={() => handleSort('description')}>
                  Descrição
                  {#if sortKey === 'description'}{sortDir === 'asc' ? ' ↑' : ' ↓'}{/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs {headerClass('amount_brl')}" on:click={() => handleSort('amount_brl')}>
                  Valor
                  {#if sortKey === 'amount_brl'}{sortDir === 'asc' ? ' ↑' : ' ↓'}{/if}
                </button>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each pagination.items as entry (entry.id)}
              <tr data-testid={`financing-entry-${entry.id}`}>
                <td>{formatIsoDateToBr(entry.event_date)}</td>
                <td>{formatEntryType(entry.entry_type)}</td>
                <td>{formatEventCategory(entry.event_category)}</td>
                <td>{entry.description}</td>
                <td>
                  {#if editingEntryId === entry.id}
                    <div class="flex min-w-[10rem] items-center gap-2">
                      <BrDecimalInput
                        bind:this={editAmountInput}
                        bind:value={editAmount}
                        label="Valor"
                        inputClass="input input-bordered input-xs w-full"
                        testId={`financing-entry-amount-edit-${entry.id}`}
                      />
                      <button
                        type="button"
                        class="btn btn-xs btn-primary"
                        disabled={saving}
                        data-testid={`financing-entry-save-${entry.id}`}
                        on:click={() => saveEdit(entry.id)}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        class="btn btn-xs btn-ghost"
                        disabled={saving}
                        on:click={cancelEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  {:else}
                    {formatBrl(entry.amount_brl)}
                  {/if}
                </td>
                <td>
                  <div class="flex gap-1">
                    {#if editingEntryId !== entry.id}
                      <button
                        type="button"
                        class="btn btn-xs btn-ghost"
                        disabled={saving}
                        data-testid={`financing-entry-edit-${entry.id}`}
                        on:click={() => startEdit(entry)}
                      >
                        Editar
                      </button>
                    {/if}
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost"
                      disabled={saving}
                      on:click={() => dispatch('deleteEntry', entry.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <DividendTablePagination
        position="bottom"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        ariaLabel="Paginação da tabela de lançamentos"
      />
    {/if}
  </div>
</section>
