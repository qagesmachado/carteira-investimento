<script lang="ts">
  import type {
    LinkedEmergencyReserveItem,
    ManualPatrimonyCategory,
    ManualPatrimonyItem
  } from '$lib/api/patrimonyControl';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import { createEventDispatcher } from 'svelte';

  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';
  import {
    formatEmergencyReserveLocation,
    formatLinkedEmergencyReserveObservation,
    MANUAL_PATRIMONY_CATEGORY_LABELS,
    pctOfEmergencyReserve
  } from './patrimonyControlForm';

  export let category: ManualPatrimonyCategory;
  export let items: ManualPatrimonyItem[] = [];
  export let linkedItems: LinkedEmergencyReserveItem[] = [];
  export let emergencyTotalBrl = 0;

  const dispatch = createEventDispatcher<{
    add: { category: ManualPatrimonyCategory };
    edit: ManualPatrimonyItem;
    delete: ManualPatrimonyItem;
  }>();

  $: title = MANUAL_PATRIMONY_CATEGORY_LABELS[category];
  $: showLocation = true;
  $: showObservation = true;
  $: sectionTestId = 'patrimony-emergency-section';
  $: hasRows = items.length > 0 || linkedItems.length > 0;
</script>

<section class={PAGE_SECTION_CLASS} data-testid={sectionTestId}>
  <div class="card-body gap-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="card-title text-lg">{title}</h2>
    <button
      type="button"
      class="btn btn-primary btn-sm"
      data-testid={`add-${category}`}
      on:click={() => dispatch('add', { category })}
    >
      Adicionar
    </button>
  </div>

  {#if !hasRows}
    <p class="text-sm opacity-70">Nenhum item cadastrado.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Nome</th>
            {#if showLocation}
              <th>Localização</th>
            {/if}
            <th>Valor (R$)</th>
            <th class="w-16 text-right">%</th>
            {#if showObservation}
              <th>Observação</th>
            {/if}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each items as item (item.id)}
            <tr data-testid={`manual-item-row-${item.id}`}>
              <td>{item.name}</td>
              {#if showLocation}
                <td>{formatEmergencyReserveLocation(item.location)}</td>
              {/if}
              <td>{formatBrl(item.amount_brl)}</td>
              <td class="text-right text-xs opacity-80">
                {pctOfEmergencyReserve(item.amount_brl, emergencyTotalBrl)}
              </td>
              {#if showObservation}
                <td class="text-xs opacity-80">{item.notes?.trim() || '—'}</td>
              {/if}
              <td class="text-right">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  data-testid={`edit-item-${item.id}`}
                  on:click={() => dispatch('edit', item)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error"
                  data-testid={`delete-item-${item.id}`}
                  on:click={() => dispatch('delete', item)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          {/each}
          {#each linkedItems as item (item.asset_id)}
            <tr data-testid={`linked-reserve-row-${item.asset_id}`}>
              <td>{formatTickerForDisplay(item.symbol)}</td>
              {#if showLocation}
                <td>{formatEmergencyReserveLocation(item.location)}</td>
              {/if}
              <td>{formatBrl(item.amount_brl)}</td>
              <td class="text-right text-xs opacity-80">
                {pctOfEmergencyReserve(item.amount_brl, emergencyTotalBrl)}
              </td>
              {#if showObservation}
                <td class="text-xs opacity-80">
                  {formatLinkedEmergencyReserveObservation(item.objective_name)}
                </td>
              {/if}
              <td class="text-right">
                <a
                  class="link link-primary text-xs"
                  href="/portfolios"
                  data-testid={`linked-reserve-link-${item.asset_id}`}
                >
                  Ver na carteira
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  </div>
</section>
