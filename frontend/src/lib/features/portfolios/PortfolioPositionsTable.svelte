<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { ObjectivesSnapshot } from '$lib/api/objetivos';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatAssetTypeForDisplay, formatMoneyAmount } from '$lib/assetLabels';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import PositionDetailPanel from '$lib/features/portfolios/PositionDetailPanel.svelte';
  import {
    computePositionProfit,
    formatQuantityForDisplay,
    positionCurrentValue,
    positionInvestedValue,
    positionProfitBadgeClass,
    positionProfitColorClass,
    usesManualPositionValues
  } from '$lib/features/portfolios/positionMetrics';
  import type { PositionRow, SortKey } from '$lib/features/portfolios/positionTableView';
  import {
    PORTFOLIO_POSITIONS_CLASSIFY_LUCIDE_ICON,
    PORTFOLIO_POSITIONS_DETAILS_LUCIDE_ICON,
    PORTFOLIO_POSITIONS_REMOVE_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  import { lucideIconForAssetType } from './consolidada/consolidadaAssetTypeIcons';
  import {
    canClassifyPortfolioAsset,
    type PortfolioMethodologies
  } from './portfolioClassifyEligibility';

  export let rows: PositionRow[] = [];
  export let sortKey: SortKey = 'ticker';
  export let sortDir: 'asc' | 'desc' = 'asc';
  export let expandedPositionId: number | null = null;
  export let portfolioMethodologies: PortfolioMethodologies = {};

  export let formatOptionalMoney: (value: number | null, currency: string | undefined) => string = () =>
    '—';
  export let assetPartitionFor: (assetId: number) => ObjectivesSnapshot['asset_partitions'][number] | null =
    () => null;
  export let positionDetailPanelId: (positionId: number) => string = (id) => `position-detail-${id}`;

  const dispatch = createEventDispatcher<{
    sort: SortKey;
    toggleDetails: number;
    edit: number;
    classify: number;
    remove: number;
  }>();

  const columns: Array<{ key: SortKey; label: string; align?: 'right' }> = [
    { key: 'ticker', label: 'Ativo' },
    { key: 'asset_type', label: 'Tipo' },
    { key: 'currency', label: 'Moeda' },
    { key: 'quantity', label: 'Qtd' },
    { key: 'invested', label: 'Valor aplicado', align: 'right' },
    { key: 'current', label: 'Valor atual', align: 'right' },
    { key: 'yield', label: 'Rendimento' },
    { key: 'profit', label: 'Lucro', align: 'right' }
  ];

  function headerSortClass(key: SortKey): string {
    return sortKey === key ? 'font-bold' : 'font-normal';
  }

  function formatProfitPercentBadge(percent: number | null): string | null {
    if (percent == null) {
      return null;
    }
    const prefix = percent >= 0 ? '+' : '';
    return `${prefix}${percent.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}%`;
  }

  function profitAmount(row: PositionRow): number | null {
    const result = computePositionProfit(row.position, row.asset);
    return result?.profit ?? null;
  }

  function profitPercent(row: PositionRow): number | null {
    const result = computePositionProfit(row.position, row.asset);
    return result?.percent ?? null;
  }

  function canClassify(row: PositionRow): boolean {
    return canClassifyPortfolioAsset(row.asset, portfolioMethodologies);
  }
</script>

<div
  class="w-full min-w-0 overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4"
  data-testid="portfolio-positions-table"
>
  <table class="table table-sm w-full min-w-[58rem]">
    <thead>
      <tr>
        {#each columns as column (column.key)}
          <th
            class="align-bottom {column.align === 'right' ? 'text-right' : ''} {column.key === 'ticker'
              ? 'pl-1 sm:pl-2'
              : ''} {column.key === 'quantity' ? 'w-16 max-w-[4.5rem] px-1' : ''}"
          >
            <button
              type="button"
              class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                column.key
              )}"
              on:click={() => dispatch('sort', column.key)}
            >
              {column.label}
              {#if sortKey === column.key}
                <LucideIcon
                  name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                  size="sm"
                  class="opacity-90"
                />
              {/if}
            </button>
          </th>
        {/each}
        <th class="align-bottom min-w-[14.5rem] whitespace-nowrap"><span class="sr-only">Ações</span></th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.position.id)}
        {@const position = row.position}
        {@const asset = row.asset}
        {@const ticker = formatTickerForDisplay(asset.symbol)}
        <tr data-testid="portfolio-position-row-{ticker}">
          <td class="whitespace-nowrap pl-1 sm:pl-2">
            <span class="inline-flex items-center gap-1.5">
              <LucideIcon
                name={lucideIconForDisplayClass(asset.display_class)}
                size="sm"
                class={displayClassIconFgClass(asset.display_class)}
              />
              <span
                class="inline-flex rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold"
                data-testid="portfolio-ticker-pill-{ticker}"
              >
                {ticker}
              </span>
            </span>
          </td>
          <td>
            <span class="inline-flex items-center gap-1.5">
              <LucideIcon
                name={lucideIconForAssetType(asset.asset_type)}
                size="sm"
                class="text-base-content/70"
              />
              <span>{formatAssetTypeForDisplay(asset.asset_type)}</span>
            </span>
          </td>
          <td>{asset.currency}</td>
          <td class="w-16 max-w-[4.5rem] whitespace-nowrap px-1 text-sm tabular-nums">
            {usesManualPositionValues(asset) ? '—' : formatQuantityForDisplay(position.quantity)}
          </td>
          <td class="whitespace-nowrap text-right tabular-nums">
            {formatOptionalMoney(positionInvestedValue(position, asset), asset.currency)}
          </td>
          <td class="whitespace-nowrap text-right tabular-nums">
            {formatOptionalMoney(positionCurrentValue(position, asset), asset.currency)}
          </td>
          <td>{usesManualPositionValues(asset) ? position.contracted_yield || '—' : '—'}</td>
          <td class="overflow-visible whitespace-nowrap pr-4 text-right text-sm tabular-nums sm:pr-6">
            {#if profitAmount(row) != null}
              <span class="inline-flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-1.5">
                <span class="tabular-nums {positionProfitColorClass(profitAmount(row))}">
                  {formatMoneyAmount(profitAmount(row), asset.currency)}
                </span>
                {#if formatProfitPercentBadge(profitPercent(row))}
                  <span
                    class="inline-flex shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold leading-none {positionProfitBadgeClass(
                      profitAmount(row)
                    )}"
                  >
                    {formatProfitPercentBadge(profitPercent(row))}
                  </span>
                {/if}
              </span>
            {:else}
              —
            {/if}
          </td>
          <td class="whitespace-nowrap px-1">
            <div
              class="grid min-w-[14.5rem] grid-cols-4 gap-1"
              data-testid="portfolio-row-actions-{ticker}"
            >
              <button
                class="btn btn-outline btn-xs gap-1"
                type="button"
                aria-label="Detalhes"
                aria-expanded={expandedPositionId === position.id}
                aria-controls={positionDetailPanelId(position.id)}
                data-testid="portfolio-details-{ticker}"
                on:click={() => dispatch('toggleDetails', position.id)}
              >
                <LucideIcon name={PORTFOLIO_POSITIONS_DETAILS_LUCIDE_ICON} size="sm" />
                <span class="hidden sm:inline">Detalhes</span>
              </button>
              <button
                class="btn btn-outline btn-xs gap-1"
                type="button"
                aria-label="Editar"
                on:click={() => dispatch('edit', position.id)}
              >
                <LucideIcon name="Pencil" size="sm" />
                <span class="hidden sm:inline">Editar</span>
              </button>
              {#if canClassify(row)}
                <button
                  class="btn btn-outline btn-xs gap-1"
                  type="button"
                  aria-label="Classificar"
                  data-testid="portfolio-classify-{ticker}"
                  on:click={() => dispatch('classify', asset.id)}
                >
                  <LucideIcon name={PORTFOLIO_POSITIONS_CLASSIFY_LUCIDE_ICON} size="sm" />
                  <span class="hidden sm:inline">Classificar</span>
                </button>
              {:else}
                <button
                  class="btn btn-outline btn-xs btn-disabled pointer-events-none gap-1 opacity-40"
                  type="button"
                  disabled
                  aria-label="Classificar"
                  aria-disabled="true"
                  data-testid="portfolio-classify-disabled-{ticker}"
                  tabindex="-1"
                >
                  <LucideIcon name={PORTFOLIO_POSITIONS_CLASSIFY_LUCIDE_ICON} size="sm" />
                  <span class="hidden sm:inline">Classificar</span>
                </button>
              {/if}
              <button
                class="btn btn-outline btn-xs gap-1 text-error"
                type="button"
                aria-label="Remover"
                data-testid="portfolio-remove-{ticker}"
                on:click={() => dispatch('remove', position.id)}
              >
                <LucideIcon name={PORTFOLIO_POSITIONS_REMOVE_LUCIDE_ICON} size="sm" />
                <span class="hidden sm:inline">Remover</span>
              </button>
            </div>
          </td>
        </tr>
        {#if expandedPositionId === position.id}
          <tr class="bg-base-200/50">
            <td colspan="9">
              <PositionDetailPanel
                {position}
                {asset}
                assetPartition={assetPartitionFor(asset.id)}
                panelId={positionDetailPanelId(position.id)}
              />
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>
