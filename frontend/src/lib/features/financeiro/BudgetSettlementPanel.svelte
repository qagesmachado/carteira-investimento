<script lang="ts">
  import { formatIsoDateToBr } from '$lib/brDate';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import {
    filterSettlementItems,
    summarizeSettlement,
    type SettlementFilter
  } from './budgetSettlement';

  export let title: string;
  export let testIdPrefix: string;
  export let emptyMessage: string;
  export let checkboxLabel: string;
  export let items: {
    id: number;
    label: string;
    amount_brl: number;
    event_date?: string | null;
    done: boolean;
  }[] = [];
  export let saving = false;
  export let onToggle: (id: number, done: boolean) => void = () => undefined;

  let filter: SettlementFilter = 'all';

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  $: summary = summarizeSettlement(items);
  $: visible = filterSettlementItems(items, filter);
</script>

<section class="rounded-box border border-base-300 bg-base-100 p-4" data-testid="{testIdPrefix}-panel">
  <div class="flex flex-wrap items-start justify-between gap-2">
    <div>
      <h3 class="font-semibold">{title}</h3>
      <p class="mt-1 text-sm opacity-70" data-testid="{testIdPrefix}-summary">
        {summary.doneCount} de {summary.totalCount} · Previsto {formatValue(summary.totalAmount)} ·
        Conferido {formatValue(summary.doneAmount)} · Pendente {formatValue(summary.pendingAmount)}
      </p>
    </div>
    <div class="join" data-testid="{testIdPrefix}-filter">
      <button
        type="button"
        class="btn btn-xs join-item"
        class:btn-primary={filter === 'all'}
        class:btn-ghost={filter !== 'all'}
        on:click={() => (filter = 'all')}
      >
        Todas
      </button>
      <button
        type="button"
        class="btn btn-xs join-item"
        class:btn-primary={filter === 'pending'}
        class:btn-ghost={filter !== 'pending'}
        on:click={() => (filter = 'pending')}
      >
        Pendentes
      </button>
      <button
        type="button"
        class="btn btn-xs join-item"
        class:btn-primary={filter === 'done'}
        class:btn-ghost={filter !== 'done'}
        on:click={() => (filter = 'done')}
      >
        Conferidas
      </button>
    </div>
  </div>

  {#if items.length === 0}
    <p class="mt-4 text-sm opacity-70" data-testid="{testIdPrefix}-empty">{emptyMessage}</p>
  {:else if visible.length === 0}
    <p class="mt-4 text-sm opacity-70">Nenhum item neste filtro.</p>
  {:else}
    <ul class="mt-4 divide-y divide-base-300" data-testid="{testIdPrefix}-list">
      {#each visible as item (item.id)}
        <li class="flex items-center justify-between gap-3 py-3">
          <label class="flex flex-1 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              class="checkbox checkbox-primary mt-0.5"
              checked={item.done}
              disabled={saving}
              data-testid="{testIdPrefix}-toggle-{item.id}"
              on:change={(event) => onToggle(item.id, event.currentTarget.checked)}
            />
            <span>
              <span class="font-medium">{item.label}</span>
              {#if item.event_date}
                <span class="mt-0.5 block text-xs opacity-60">
                  {formatIsoDateToBr(item.event_date)}
                </span>
              {/if}
              <span class="sr-only">{checkboxLabel}</span>
            </span>
          </label>
          <span class="tabular-nums font-medium" data-testid="{testIdPrefix}-amount-{item.id}">
            {formatValue(item.amount_brl)}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
