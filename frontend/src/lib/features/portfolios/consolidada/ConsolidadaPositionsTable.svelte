<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { Asset } from '$lib/api/assets';
  import type { ObjectivesSnapshot } from '$lib/api/objetivos';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    formatAssetTypeForDisplay,
    formatCurrencyCodeForDisplay,
    formatDisplayClassForDisplay,
    formatMoneyAmount
  } from '$lib/assetLabels';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import type { CryptoFeeDetailSummary } from '$lib/features/bitcoin/cryptoFeePositionDetail';
  import BrlEquivalentHint from '$lib/features/portfolios/BrlEquivalentHint.svelte';
  import PositionDetailPanel from '$lib/features/portfolios/PositionDetailPanel.svelte';
  import { formatQuantityForDisplay, usesManualPositionValues } from '$lib/features/portfolios/positionMetrics';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  import { lucideIconForAssetType } from './consolidadaAssetTypeIcons';
  import type { ConsolidadaRow, ConsolidadaSortKey } from './consolidadaRowTypes';

  export let rows: ConsolidadaRow[] = [];
  export let sortKey: ConsolidadaSortKey = 'ticker';
  export let sortDir: 'asc' | 'desc' = 'asc';
  export let expandedPositionId: number | null = null;
  export let usdBrlRate: number | null = null;

  export let isUsdAsset: (asset: Asset) => boolean = () => false;
  export let displayInvestedBrl: (row: ConsolidadaRow) => number | null = () => null;
  export let displayCurrentBrl: (row: ConsolidadaRow) => number | null = () => null;
  export let displayInvestedNative: (row: ConsolidadaRow) => number | null = () => null;
  export let displayCurrentNative: (row: ConsolidadaRow) => number | null = () => null;
  export let formatOptionalMoney: (value: number | null, currency: string | undefined) => string = () => '—';
  export let formatConsolidatedProfitAmount: (row: ConsolidadaRow) => string = () => '—';
  export let consolidatedProfitAmount: (row: ConsolidadaRow) => number | null = () => null;
  export let consolidatedProfitBrl: (row: ConsolidadaRow) => number | null = () => null;
  export let consolidatedProfitPercent: (row: ConsolidadaRow) => number | null = () => null;
  export let profitColorClass: (amount: number | null) => string = () => '';
  export let profitBadgeClass: (amount: number | null) => string = () => '';
  export let assetPartitionFor: (assetId: number) => ObjectivesSnapshot['asset_partitions'][number] | null =
    () => null;
  export let dividendsSummaryForAsset: (asset: Asset) => string = () => '';
  export let cryptoFeeSummaryForAsset: (asset: Asset) => CryptoFeeDetailSummary | undefined = () => undefined;
  export let positionDetailPanelId: (positionId: number) => string = (id) => `position-detail-${id}`;

  const dispatch = createEventDispatcher<{
    sort: ConsolidadaSortKey;
    toggleDetails: number;
  }>();

  function headerSortClass(key: ConsolidadaSortKey): string {
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

  const columns: Array<{
    key: ConsolidadaSortKey;
    label: string;
    align?: 'right';
  }> = [
    { key: 'ticker', label: 'Ativo' },
    { key: 'name', label: 'Nome' },
    { key: 'asset_type', label: 'Tipo' },
    { key: 'display_class', label: 'Classe' },
    { key: 'currency', label: 'Moeda' },
    { key: 'quantity', label: 'Qtd' },
    { key: 'invested', label: 'Aplicado', align: 'right' },
    { key: 'current', label: 'Atual', align: 'right' },
    { key: 'profit', label: 'Lucro', align: 'right' }
  ];
</script>

<div class="w-full min-w-0 overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4">
  <table class="table table-sm w-full" data-testid="consolidada-positions-table">
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
        <th class="align-bottom w-24"><span class="sr-only">Ações</span></th>
      </tr>
    </thead>
    <tbody>
      {#if rows.length === 0}
        <tr>
          <td colspan="10" class="text-center text-sm text-base-content/60">
            Nenhuma posição com os filtros atuais.
          </td>
        </tr>
      {:else}
        {#each rows as row (row.position.id)}
          <tr data-testid="consolidada-position-row-{formatTickerForDisplay(row.asset.symbol)}">
            <td class="whitespace-nowrap pl-1 sm:pl-2">
              <span
                class="inline-flex rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold"
                data-testid="consolidada-ticker-pill-{formatTickerForDisplay(row.asset.symbol)}"
              >
                {formatTickerForDisplay(row.asset.symbol)}
              </span>
            </td>
            <td class="max-w-[10rem] truncate sm:max-w-[14rem] lg:max-w-[18rem]" title={row.asset.name}>
              {row.asset.name}
            </td>
            <td>
              <span class="inline-flex items-center gap-1.5">
                <LucideIcon
                  name={lucideIconForAssetType(row.asset.asset_type)}
                  size="sm"
                  class="text-base-content/70"
                />
                <span class="hidden sm:inline">{formatAssetTypeForDisplay(row.asset.asset_type)}</span>
              </span>
            </td>
            <td>
              <span class="inline-flex items-center gap-1.5">
                <LucideIcon
                  name={lucideIconForDisplayClass(row.asset.display_class)}
                  size="sm"
                  class={displayClassIconFgClass(row.asset.display_class)}
                />
                <span>{formatDisplayClassForDisplay(row.asset.display_class)}</span>
              </span>
            </td>
            <td>{formatCurrencyCodeForDisplay(row.asset.currency)}</td>
            <td class="w-16 max-w-[4.5rem] whitespace-nowrap px-1 text-sm tabular-nums">
              {#if usesManualPositionValues(row.asset)}
                <span class="text-xs" title={row.position.contracted_yield ?? ''}>—</span>
              {:else}
                {formatQuantityForDisplay(row.position.quantity)}
              {/if}
            </td>
            <td class="overflow-visible whitespace-nowrap pr-2 text-right align-middle sm:pr-3">
              {#if isUsdAsset(row.asset)}
                <span class="inline-flex items-center justify-end gap-1.5">
                  <span
                    class="tabular-nums"
                    title={row.investedBrl == null
                      ? 'Atualize o câmbio USD/BRL para ver o equivalente em reais no ícone $'
                      : undefined}
                  >
                    {formatOptionalMoney(displayInvestedNative(row), row.asset.currency)}
                  </span>
                  <BrlEquivalentHint asset={row.asset} brlValue={row.investedBrl} />
                </span>
              {:else if displayInvestedBrl(row) != null}
                <span class="tabular-nums">{formatMoneyAmount(displayInvestedBrl(row), 'BRL')}</span>
              {:else}
                <span class="tabular-nums">{formatOptionalMoney(row.invested, row.asset.currency)}</span>
              {/if}
            </td>
            <td class="overflow-visible whitespace-nowrap pr-2 text-right align-middle sm:pr-3">
              {#if isUsdAsset(row.asset)}
                <span class="inline-flex items-center justify-end gap-1.5">
                  <span
                    class="tabular-nums"
                    title={row.currentBrl == null
                      ? 'Atualize o câmbio USD/BRL para ver o equivalente em reais no ícone $'
                      : undefined}
                  >
                    {formatOptionalMoney(displayCurrentNative(row), row.asset.currency)}
                  </span>
                  <BrlEquivalentHint asset={row.asset} brlValue={row.currentBrl} />
                </span>
              {:else if displayCurrentBrl(row) != null}
                <span class="tabular-nums">{formatMoneyAmount(displayCurrentBrl(row), 'BRL')}</span>
              {:else}
                <span class="tabular-nums">{formatOptionalMoney(row.current, row.asset.currency)}</span>
              {/if}
            </td>
            <td class="overflow-visible whitespace-nowrap pr-4 text-right text-sm tabular-nums sm:pr-6">
              {#if isUsdAsset(row.asset)}
                <span class="inline-flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-1.5">
                  <span class="tabular-nums {profitColorClass(consolidatedProfitAmount(row))}">
                    {formatConsolidatedProfitAmount(row)}
                  </span>
                  {#if formatProfitPercentBadge(consolidatedProfitPercent(row))}
                    <span
                      class="inline-flex shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold leading-none {profitBadgeClass(
                        consolidatedProfitAmount(row)
                      )}"
                    >
                      {formatProfitPercentBadge(consolidatedProfitPercent(row))}
                    </span>
                  {/if}
                  <BrlEquivalentHint asset={row.asset} brlValue={consolidatedProfitBrl(row)} />
                </span>
              {:else}
                <span class="inline-flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-1.5">
                  <span class="tabular-nums {profitColorClass(consolidatedProfitAmount(row))}">
                    {formatConsolidatedProfitAmount(row)}
                  </span>
                  {#if formatProfitPercentBadge(consolidatedProfitPercent(row))}
                    <span
                      class="inline-flex shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold leading-none {profitBadgeClass(
                        consolidatedProfitAmount(row)
                      )}"
                    >
                      {formatProfitPercentBadge(consolidatedProfitPercent(row))}
                    </span>
                  {/if}
                </span>
              {/if}
            </td>
            <td class="whitespace-nowrap px-1">
              <button
                class="btn btn-outline btn-sm"
                type="button"
                aria-expanded={expandedPositionId === row.position.id}
                aria-controls={positionDetailPanelId(row.position.id)}
                data-testid="consolidada-details-{formatTickerForDisplay(row.asset.symbol)}"
                on:click={() => dispatch('toggleDetails', row.position.id)}
              >
                Detalhes
              </button>
            </td>
          </tr>
          {#if expandedPositionId === row.position.id}
            <tr class="bg-base-200/50">
              <td colspan="10">
                <PositionDetailPanel
                  position={row.position}
                  asset={row.asset}
                  variant="consolidated"
                  {usdBrlRate}
                  assetPartition={assetPartitionFor(row.asset.id)}
                  dividendsSummary={dividendsSummaryForAsset(row.asset)}
                  cryptoFeeSummary={cryptoFeeSummaryForAsset(row.asset)}
                  panelId={positionDetailPanelId(row.position.id)}
                />
              </td>
            </tr>
          {/if}
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<p class="text-xs text-base-content/60">
  Posições em USD: valor em US$ na tabela; passe o mouse no ícone $ para ver o equivalente em reais. Lucro na tabela:
  em US$ para posições internacionais (com equivalente em R$ no ícone); em R$ para ativos em reais.
</p>
