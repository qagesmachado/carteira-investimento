<script lang="ts">
  import type { AssetDivergence, Objective } from '$lib/api/objetivos';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import { createEventDispatcher } from 'svelte';

  import AllocationPurposeFlags from './AllocationPurposeFlags.svelte';
  import { canAddMoreSlices } from './allocationCapacity';
  import { formatProfitCell } from './formatAllocationProfit';
  import { formatSharesAllocation } from './formatSharesAllocation';

  export let objective: Objective | null = null;
  export let divergences: AssetDivergence[] = [];
  export let canEdit = true;
  export let portfolioId: number | null = null;

  const dispatch = createEventDispatcher<{
    addAsset: void;
    editAllocation: number;
    removeAllocation: number;
    edit: void;
    deleteObjective: void;
    purposeUpdated: void;
  }>();

  function formatAllocation(row: Objective['allocations'][number]): string {
    if (row.split_mode === 'amount') {
      return formatBrl(row.amount);
    }
    return formatSharesAllocation(row.quantity);
  }

  $: modeLabel =
    objective?.mode === 'single_asset'
      ? 'Partição de um ativo'
      : objective?.is_default
        ? 'Restante não alocado'
        : 'Multi-ativo';

  $: canAddAllocation =
    objective != null && !objective.is_default && canAddMoreSlices(objective, divergences);
</script>

{#if objective}
  <section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="objetivo-detail">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold">{objective.name}</h2>
        <p class="text-xs opacity-60">{modeLabel}</p>
        {#if objective.description}
          <p class="text-sm opacity-70">{objective.description}</p>
        {/if}
        <p class="text-sm">Total: {formatBrl(objective.total_value_brl)}</p>
      </div>
      {#if !objective.is_default}
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="btn btn-sm btn-ghost" on:click={() => dispatch('edit')}>
            Renomear
          </button>
          {#if canEdit && canAddAllocation}
            <button
              type="button"
              class="btn btn-sm btn-primary"
              data-testid="objetivo-add-asset-btn"
              on:click={() => dispatch('addAsset')}
            >
              Adicionar fatia
            </button>
          {/if}
          <button
            type="button"
            class="btn btn-sm btn-ghost text-error"
            data-testid="objetivo-delete-objective-btn"
            on:click={() => dispatch('deleteObjective')}
          >
            Excluir objetivo
          </button>
        </div>
      {/if}
    </div>

    {#if objective.allocations.length === 0}
      <p class="text-sm opacity-70">
        {#if objective.mode === 'single_asset'}
          Nenhuma fatia ainda. Use «Adicionar fatia» para dar um nome interno (ex.: Viagem,
          Reserva) e definir cotas ou valor. Você pode repetir o mesmo ativo com nomes diferentes.
        {:else}
          Nenhuma alocação neste objetivo. Use «Adicionar fatia» para incluir posições.
        {/if}
      </p>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Nome interno</th>
              <th>Ativo</th>
              <th>Alocação</th>
              <th>Custo (R$)</th>
              <th>Valor atual (R$)</th>
              <th>Lucro (R$)</th>
              {#if canEdit && !objective.is_default}
                <th class="min-w-[11rem]">Finalidade</th>
                <th class="w-32">Ações</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each objective.allocations as row (row.id)}
              <tr data-testid={`objetivo-allocation-${row.id}`}>
                <td class="font-medium">{row.slice_name}</td>
                <td>{formatTickerForDisplay(row.symbol)} — {row.name}</td>
                <td>{formatAllocation(row)}</td>
                <td data-testid={`allocation-invested-${row.id}`}>
                  {formatBrl(row.invested_value_brl)}
                </td>
                <td data-testid={`allocation-current-${row.id}`}>
                  {formatBrl(row.current_value_brl)}
                </td>
                <td data-testid={`allocation-profit-${row.id}`}>
                  {formatProfitCell(row.profit_brl, row.profit_percent)}
                </td>
                {#if canEdit && !objective.is_default && portfolioId != null && row.id > 0}
                  <td>
                    <AllocationPurposeFlags
                      portfolioId={portfolioId}
                      objectiveId={objective.id}
                      allocationId={row.id}
                      excludeFromRebalance={row.exclude_from_rebalance}
                      isEmergencyReserve={row.is_emergency_reserve}
                      compact
                      on:updated={() => dispatch('purposeUpdated')}
                    />
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        class="btn btn-xs btn-ghost"
                        data-testid={`allocation-edit-${row.id}`}
                        on:click={() => dispatch('editAllocation', row.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="btn btn-xs btn-error btn-outline"
                        data-testid={`allocation-remove-${row.id}`}
                        on:click={() => dispatch('removeAllocation', row.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                {:else if canEdit && !objective.is_default}
                  <td></td>
                  <td></td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
{/if}
