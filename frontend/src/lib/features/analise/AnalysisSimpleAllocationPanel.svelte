<script lang="ts">
  import { tick } from 'svelte';
  import type { AssetAnalysis, EtfIntlAllocationInput } from '$lib/api/analysis';
  import { setAssetPending } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import type { Position } from '$lib/api/portfolios';
  import { getPortfolioRebalance, type RebalanceSnapshot } from '$lib/api/rebalance';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_PORTFOLIO_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import {
    allocationTargetPercentFromRow,
    buildAllocationSavePayload,
    computeCurrentPercentInGroup,
    computeDesiredValueBrl,
    computeDesiredValueUsd,
    isAllocationSumValid,
    sumTargetPercents,
    type EtfIntlAllocationDraft
  } from '$lib/features/analise/computeEtfIntlDesiredValues';
  import { filterAnalysisByPortfolio } from '$lib/features/analise/filterAnalysisByPortfolio';
  import AnalysisPendingCheckbox from '$lib/features/analise/AnalysisPendingCheckbox.svelte';
  import AnalysisTableAssetTypeCell from '$lib/features/analise/AnalysisTableAssetTypeCell.svelte';
  import AnalysisTableExternalLink from '$lib/features/analise/AnalysisTableExternalLink.svelte';
  import AnalysisTableTickerCell from '$lib/features/analise/AnalysisTableTickerCell.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import RebalanceTableFilter from '$lib/features/rebalance/RebalanceTableFilter.svelte';
  import { hiddenMoneyForCurrency, isMoneyHidden } from '$lib/moneyDisplay';

  export let profile: string;
  export let sectionTitle: string;
  export let sectionTestId: string;
  export let filterTestId: string;
  export let description: string;
  export let emptyMessage: string;
  export let classDisplayClass: 'stocks' | 'funds' | 'international' | 'crypto';
  export let rebalanceAssetsKey:
    | 'stock_assets'
    | 'fund_assets'
    | 'international_assets'
    | 'crypto_assets' = 'international_assets';
  export let showUsdColumn = false;
  export let activeId: number | null = null;
  export let positions: Position[] = [];
  export let loading = false;
  export let listAnalysis: (portfolioId: number) => Promise<AssetAnalysis[]>;
  export let saveAllocations: (
    portfolioId: number,
    allocations: EtfIntlAllocationInput[]
  ) => Promise<unknown>;

  let rows: AssetAnalysis[] = [];
  let snapshot: RebalanceSnapshot | null = null;
  let drafts: EtfIntlAllocationDraft[] = [];
  let filterText = '';
  let saving = false;
  let error = '';
  let message = '';
  let syncToken = 0;

  $: positionKey = positions
    .map((p) => p.asset_id)
    .sort((a, b) => a - b)
    .join(',');
  $: syncKey = `${activeId ?? 'none'}:${positionKey}:${loading}`;

  $: if (!loading && activeId != null) {
    void syncFromPortfolio(activeId, syncKey);
  }

  async function syncFromPortfolio(portfolioId: number, _key: string) {
    const token = ++syncToken;
    await tick();
    if (token !== syncToken || loading || activeId !== portfolioId) {
      return;
    }
    await reload(portfolioId);
  }

  $: assetIdsInPortfolio = new Set(positions.map((p) => p.asset_id));
  $: portfolioRows = filterAnalysisByPortfolio(rows, assetIdsInPortfolio);
  $: pendingAssetIds = new Set(
    portfolioRows.filter((row) => row.is_pending).map((row) => row.asset_id)
  );
  $: classTarget =
    snapshot?.classes.find((c) => c.display_class === classDisplayClass)?.target_percent ?? 0;
  $: patrimonyBrl = snapshot?.patrimony_brl ?? 0;
  $: usdRate = snapshot?.usd_brl_rate ?? null;
  $: rebalanceAssets = snapshot?.[rebalanceAssetsKey] ?? [];
  $: groupCurrentTotal = rebalanceAssets
    .filter((a) => assetIdsInPortfolio.has(a.asset_id) && !pendingAssetIds.has(a.asset_id))
    .reduce((sum, a) => sum + (a.current_value_brl ?? 0), 0);
  $: rebalanceByAssetId = new Map(rebalanceAssets.map((a) => [a.asset_id, a]));
  $: displayRows = buildDisplayRows(portfolioRows, drafts, rebalanceByAssetId);
  $: filteredDrafts = drafts.filter((draft) => {
    const meta = rowMeta(draft.asset_id);
    if (!meta) return false;
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return meta.symbol.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q);
  });
  $: totalTargetPercent = sumTargetPercents(drafts, pendingAssetIds);
  $: allocationValid = isAllocationSumValid(drafts, 0.01, pendingAssetIds);

  type DisplayRow = {
    asset_id: number;
    current_percent: number | null;
    desired_brl: number | null;
    desired_usd: number | null;
  };

  function buildDisplayRows(
    analysisRows: AssetAnalysis[],
    draftRows: EtfIntlAllocationDraft[],
    rebalanceMap: Map<number, { current_value_brl: number | null; current_percent: number | null }>
  ): DisplayRow[] {
    const draftMap = new Map(draftRows.map((d) => [d.asset_id, d]));
    return analysisRows.map((row) => {
      const draft = draftMap.get(row.asset_id);
      const reb = rebalanceMap.get(row.asset_id);
      const currentValue = reb?.current_value_brl ?? 0;
      const currentPercent =
        reb != null
          ? reb.current_percent
          : computeCurrentPercentInGroup(currentValue ?? 0, groupCurrentTotal);
      const targetPercent = draft?.target_percent ?? 0;
      const desiredBrl = computeDesiredValueBrl(patrimonyBrl, classTarget, targetPercent);
      return {
        asset_id: row.asset_id,
        current_percent: currentPercent,
        desired_brl: desiredBrl,
        desired_usd: computeDesiredValueUsd(desiredBrl, usdRate)
      };
    });
  }

  function syncDraftsFromRows(analysisRows: AssetAnalysis[]) {
    drafts = analysisRows.map((row) => ({
      asset_id: row.asset_id,
      target_percent: allocationTargetPercentFromRow(row),
      analysis_link: row.score_refs?.analysis_link ?? ''
    }));
  }

  function zeroDraftPercent(assetId: number) {
    drafts = drafts.map((draft) =>
      draft.asset_id === assetId ? { ...draft, target_percent: 0 } : draft
    );
  }

  function rowMeta(assetId: number): AssetAnalysis | undefined {
    return portfolioRows.find((row) => row.asset_id === assetId);
  }

  function bumpDrafts() {
    drafts = drafts.map((d) => ({ ...d }));
  }

  function formatPercent(value: number | null): string {
    if (value == null) return '—';
    return `${value.toFixed(2).replace('.', ',')}%`;
  }

  function formatUsd(value: number | null): string {
    if (value == null) return '—';
    if (isMoneyHidden()) {
      return hiddenMoneyForCurrency('USD');
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  export async function reload(activePortfolioId: number | null) {
    if (activePortfolioId == null) {
      rows = [];
      drafts = [];
      snapshot = null;
      return;
    }
    snapshot = await getPortfolioRebalance(activePortfolioId);
    rows = await listAnalysis(activePortfolioId);
    const ids = new Set(positions.map((p) => p.asset_id));
    syncDraftsFromRows(rows.filter((r) => ids.has(r.asset_id)));
  }

  async function handlePendingChange(assetId: number, pending: boolean) {
    if (activeId == null) return;
    if (pending) {
      zeroDraftPercent(assetId);
    }
    saving = true;
    error = '';
    try {
      const updated = await setAssetPending(assetId, activeId, pending, profile);
      rows = rows.map((row) => (row.asset_id === updated.asset_id ? updated : row));
      if (pending) {
        zeroDraftPercent(assetId);
      }
      snapshot = await getPortfolioRebalance(activeId);
      message = pending ? 'Ativo marcado como pendente.' : 'Ativo reativado na análise.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o status pendente.');
    } finally {
      saving = false;
    }
  }

  async function handleSave() {
    bumpDrafts();
    if (!isAllocationSumValid(drafts, 0.01, pendingAssetIds)) return;
    saving = true;
    error = '';
    message = '';
    try {
      if (activeId == null) return;
      const payload = buildAllocationSavePayload(drafts, pendingAssetIds);
      await saveAllocations(
        activeId,
        payload.map((d) => ({
          asset_id: d.asset_id,
          target_percent: d.target_percent,
          analysis_link: d.analysis_link.trim() || null
        }))
      );
      await reload(activeId);
      message = 'Alocação salva com sucesso.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a alocação.');
    } finally {
      saving = false;
    }
  }
</script>

<PageSection title={sectionTitle} testId={sectionTestId}>
  <svelte:fragment slot="actions">
    <RebalanceTableFilter bind:value={filterText} testId={filterTestId} />
  </svelte:fragment>

  <p class="text-sm text-base-content/70">{description}</p>

  {#if error}
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  {/if}
  {#if message}
    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
  {/if}

  {#if loading}
    <p class="text-sm text-base-content/70">Carregando…</p>
  {:else if activeId == null}
    <EmptyStateCallout
      {...NO_PORTFOLIO_EMPTY_STATE}
      card={false}
      testId="analise-simples-sem-carteira"
    />
  {:else if portfolioRows.length === 0}
    <p class="text-sm text-base-content/70">{emptyMessage}</p>
  {:else}
    <div class="w-full min-w-0 overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4">
      <table class="table table-sm w-full" data-testid="analysis-allocation-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th class="text-right">% atual</th>
            <th class="text-right">% desejado</th>
            <th class="text-right">Valor desejável (R$)</th>
            {#if showUsdColumn}
              <th class="text-right">Valor desejável (US$)</th>
            {/if}
            <th>Link de análise</th>
            <th>Pendente</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredDrafts as draft (draft.asset_id)}
            {@const meta = rowMeta(draft.asset_id)}
            {@const display = displayRows.find((row) => row.asset_id === draft.asset_id)}
            {#if meta && display}
              <tr>
                <td><AnalysisTableTickerCell symbol={meta.symbol} /></td>
                <td
                  class="max-w-[10rem] truncate sm:max-w-[14rem] lg:max-w-[18rem]"
                  title={meta.name}>{meta.name}</td
                >
                <td><AnalysisTableAssetTypeCell assetType={meta.asset_type} /></td>
                <td class="text-right">{formatPercent(display.current_percent)}</td>
                <td class="text-right" on:focusout={bumpDrafts}>
                  <BrDecimalInput
                    label=""
                    inputClass="input input-bordered input-sm w-24 text-right"
                    bind:value={draft.target_percent}
                    disabled={saving || (meta.is_pending ?? false)}
                  />
                </td>
                <td class="text-right">{formatBrl(display.desired_brl)}</td>
                {#if showUsdColumn}
                  <td class="text-right">{formatUsd(display.desired_usd)}</td>
                {/if}
                <td class="min-w-[12rem]">
                  <div class="flex flex-col gap-1">
                    <input
                      type="url"
                      class="input input-bordered input-sm w-full"
                      placeholder="https://…"
                      bind:value={draft.analysis_link}
                      disabled={saving}
                    />
                    {#if draft.analysis_link.trim()}
                      <AnalysisTableExternalLink href={draft.analysis_link.trim()} />
                    {/if}
                  </div>
                </td>
                <td>
                  <AnalysisPendingCheckbox
                    checked={meta.is_pending ?? false}
                    disabled={saving}
                    onToggle={(pending) => void handlePendingChange(draft.asset_id, pending)}
                  />
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="text-right font-medium">Total % desejado</td>
            <td
              class="text-right font-semibold"
              class:text-success={allocationValid}
              class:text-error={!allocationValid && drafts.length > 0}
            >
              {formatPercent(totalTargetPercent)}
            </td>
            <td colspan={showUsdColumn ? 4 : 3}></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        class="btn btn-primary"
        disabled={saving || !allocationValid}
        data-testid="analysis-allocation-save"
        on:click={() => void handleSave()}
      >
        {saving ? 'Salvando…' : 'Salvar alocação'}
      </button>
    </div>
  {/if}
</PageSection>
