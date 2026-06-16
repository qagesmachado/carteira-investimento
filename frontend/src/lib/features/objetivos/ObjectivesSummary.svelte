<script lang="ts">
  import type { AssetPartition, ObjectivesSnapshot } from '$lib/api/objetivos';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import { createEventDispatcher } from 'svelte';

  import { formatProfitBrl } from './formatAllocationProfit';
  import { formatSharesAllocation } from './formatSharesAllocation';
  import {
    filterUserVisibleObjectives,
    isUserVisiblePartitionSlice
  } from './objectiveVisibility';

  export let snapshot: ObjectivesSnapshot;

  const dispatch = createEventDispatcher<{ selectObjective: number; selectPartition: number }>();

  $: patrimony = snapshot.patrimony_brl;
  $: customObjectives = filterUserVisibleObjectives(snapshot.objectives);
  $: partitions = snapshot.asset_partitions ?? [];

  function pctOfPatrimony(value: number): string {
    if (!patrimony || patrimony <= 0) {
      return '—';
    }
    return `${((value / patrimony) * 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  }

  function formatSliceAllocation(partition: AssetPartition, slice: AssetPartition['slices'][number]): string {
    if (partition.split_mode === 'amount') {
      return formatBrl(slice.amount);
    }
    return formatSharesAllocation(slice.quantity);
  }
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="objetivos-summary">
  <h2 class="text-lg font-semibold">Resumo dos objetivos</h2>
  <p class="mb-4 text-sm opacity-70">
    Visão geral do patrimônio dividido entre finalidades e ativos particionados.
  </p>

  <div class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Patrimônio total</p>
      <p class="text-xl font-semibold">{formatBrl(patrimony)}</p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Objetivos custom</p>
      <p class="text-xl font-semibold">{customObjectives.length}</p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Ativos particionados</p>
      <p class="text-xl font-semibold">{partitions.length}</p>
    </div>
  </div>

  <h3 class="mb-2 font-medium">Por objetivo</h3>
  {#if customObjectives.length === 0}
    <p class="text-sm opacity-70">
      Nenhum objetivo customizado. Use «+ Novo objetivo» para começar a alocar.
    </p>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Objetivo</th>
            <th>Tipo</th>
            <th>Valor (R$)</th>
            <th>% carteira</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each customObjectives as obj (obj.id)}
            <tr data-testid={`summary-row-${obj.id}`}>
              <td>{obj.name}</td>
              <td>
                {#if obj.mode === 'single_asset'}
                  Um ativo
                {:else if obj.mode === 'pension_contribution'}
                  Previdência
                {:else}
                  Multi-ativo
                {/if}
              </td>
              <td>{formatBrl(obj.total_value_brl)}</td>
              <td>{pctOfPatrimony(obj.total_value_brl)}</td>
              <td>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost"
                  data-testid={`summary-open-${obj.id}`}
                  on:click={() => dispatch('selectObjective', obj.id)}
                >
                  Abrir
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <h3 class="mb-2 mt-6 font-medium">Partição por ativo</h3>
  {#if partitions.length === 0}
    <p class="text-sm opacity-70">
      Nenhum ativo com alocação explícita ainda. Crie objetivos e aloque cotas ou valores.
    </p>
  {:else}
    <div class="space-y-4">
      {#each partitions as partition (partition.asset_id)}
        <article
          class="rounded-lg border border-base-300 p-3"
          data-testid={`partition-card-${partition.asset_id}`}
        >
          <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h4 class="font-medium">
              {formatTickerForDisplay(partition.symbol)} — {partition.name}
            </h4>
            <button
              type="button"
              class="btn btn-xs btn-outline"
              data-testid={`partition-expand-${partition.asset_id}`}
              on:click={() => dispatch('selectPartition', partition.asset_id)}
            >
              Ver detalhe
            </button>
          </div>
          <p class="text-sm opacity-70">
            Posição: {partition.split_mode === 'amount'
              ? formatBrl(partition.position_total)
              : formatSharesAllocation(partition.position_total)}
            · Restante: {partition.split_mode === 'amount'
              ? formatBrl(partition.free)
              : formatSharesAllocation(partition.free)}
            · Valor: {formatBrl(partition.position_current_value_brl)}
            · Custo: {formatBrl(partition.position_invested_value_brl)}
            · Lucro: {formatProfitBrl(partition.position_profit_brl)}
          </p>
          <table class="table table-xs mt-2">
            <thead>
              <tr>
                <th>Objetivo</th>
                <th>Nome interno</th>
                <th>Fatia</th>
                <th>Valor (R$)</th>
                <th>Lucro (R$)</th>
              </tr>
            </thead>
            <tbody>
              {#each partition.slices.filter(isUserVisiblePartitionSlice) as slice (slice.objective_id + slice.slice_name)}
                <tr>
                  <td>{slice.objective_name}</td>
                  <td>{slice.is_default ? '—' : slice.slice_name}</td>
                  <td>{formatSliceAllocation(partition, slice)}</td>
                  <td>{formatBrl(slice.current_value_brl)}</td>
                  <td>{formatProfitBrl(slice.profit_brl)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </article>
      {/each}
    </div>
  {/if}
</section>
