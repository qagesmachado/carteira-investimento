<script lang="ts">
  import { onMount } from 'svelte';

  import {
    listCryptoAnalysis,
    saveCryptoAllocations,
    type AssetAnalysis
  } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    listPositions,
    setActivePortfolioId,
    type Portfolio,
    type Position
  } from '$lib/api/portfolios';
  import { getPortfolioRebalance, type RebalanceSnapshot } from '$lib/api/rebalance';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import {
    computeCurrentPercentInGroup,
    computeDesiredValueBrl,
    isAllocationSumValid,
    parseTargetPercentRef,
    sumTargetPercents,
    type EtfIntlAllocationDraft
  } from '$lib/features/analise/computeEtfIntlDesiredValues';
  import { filterAnalysisByPortfolio } from '$lib/features/analise/filterAnalysisByPortfolio';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  type DisplayRow = {
    asset_id: number;
    symbol: string;
    name: string;
    asset_type: string;
    current_value_brl: number;
    current_percent: number | null;
    target_percent: number;
    analysis_link: string;
    desired_brl: number | null;
  };

  let rows: AssetAnalysis[] = [];
  let portfolios: Portfolio[] = [];
  let positions: Position[] = [];
  let snapshot: RebalanceSnapshot | null = null;
  let drafts: EtfIntlAllocationDraft[] = [];
  let activeId: number | null = null;
  let filterText = '';
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';

  $: assetIdsInPortfolio = new Set(positions.map((p) => p.asset_id));
  $: portfolioRows = filterAnalysisByPortfolio(rows, assetIdsInPortfolio);
  $: cryptoClassTarget =
    snapshot?.classes.find((c) => c.display_class === 'crypto')?.target_percent ?? 5;
  $: patrimonyBrl = snapshot?.patrimony_brl ?? 0;
  $: groupCurrentTotal = (snapshot?.crypto_assets ?? [])
    .filter((a) => assetIdsInPortfolio.has(a.asset_id))
    .reduce((sum, a) => sum + a.current_value_brl, 0);

  $: rebalanceByAssetId = new Map(
    (snapshot?.crypto_assets ?? []).map((a) => [a.asset_id, a])
  );

  $: displayRows = buildDisplayRows(portfolioRows, drafts, rebalanceByAssetId);

  $: filteredDrafts = drafts.filter((draft) => {
    const meta = rowMeta(draft.asset_id);
    if (!meta) return false;
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return meta.symbol.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q);
  });

  $: totalTargetPercent = sumTargetPercents(drafts);
  $: allocationValid = isAllocationSumValid(drafts);

  function buildDisplayRows(
    analysisRows: AssetAnalysis[],
    draftRows: EtfIntlAllocationDraft[],
    rebalanceMap: Map<number, { current_value_brl: number; current_percent: number }>
  ): DisplayRow[] {
    const draftMap = new Map(draftRows.map((d) => [d.asset_id, d]));
    return analysisRows.map((row) => {
      const draft = draftMap.get(row.asset_id);
      const reb = rebalanceMap.get(row.asset_id);
      const currentValue = reb?.current_value_brl ?? 0;
      const currentPercent =
        reb != null
          ? reb.current_percent
          : computeCurrentPercentInGroup(currentValue, groupCurrentTotal);
      const targetPercent = draft?.target_percent ?? 0;
      const desiredBrl = computeDesiredValueBrl(patrimonyBrl, cryptoClassTarget, targetPercent);
      return {
        asset_id: row.asset_id,
        symbol: row.symbol,
        name: row.name,
        asset_type: row.asset_type,
        current_value_brl: currentValue,
        current_percent: currentPercent,
        target_percent: targetPercent,
        analysis_link: draft?.analysis_link ?? '',
        desired_brl: desiredBrl
      };
    });
  }

  function syncDraftsFromRows(analysisRows: AssetAnalysis[]) {
    drafts = analysisRows.map((row) => ({
      asset_id: row.asset_id,
      target_percent: parseTargetPercentRef(row.score_refs?.target_percent),
      analysis_link: row.score_refs?.analysis_link ?? ''
    }));
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

  async function loadSnapshot() {
    if (activeId == null) {
      snapshot = null;
      return;
    }
    snapshot = await getPortfolioRebalance(activeId);
  }

  async function loadPositionsForActive() {
    if (activeId == null) {
      positions = [];
      return;
    }
    positions = await listPositions(activeId);
  }

  async function loadData() {
    loading = true;
    error = '';
    try {
      const [analysisRows, portfolioList, active] = await Promise.all([
        listCryptoAnalysis(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      rows = analysisRows;
      portfolios = portfolioList;
      activeId = active ?? (portfolioList[0]?.id ?? null);
      await loadPositionsForActive();
      await loadSnapshot();
      const ids = new Set(positions.map((p) => p.asset_id));
      syncDraftsFromRows(analysisRows.filter((r) => ids.has(r.asset_id)));
    } catch (err) {
      rows = [];
      portfolios = [];
      positions = [];
      snapshot = null;
      drafts = [];
      activeId = null;
      error = parseApiError(
        err,
        'Não foi possível carregar a análise. Verifique se o backend está em execução.'
      );
    } finally {
      loading = false;
    }
  }

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    activeId = id;
    error = '';
    try {
      await setActivePortfolioId(id);
      await loadPositionsForActive();
      await loadSnapshot();
      const ids = new Set(positions.map((p) => p.asset_id));
      syncDraftsFromRows(rows.filter((r) => ids.has(r.asset_id)));
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
    }
  }

  async function handleSave() {
    bumpDrafts();
    if (!isAllocationSumValid(drafts)) return;
    saving = true;
    error = '';
    message = '';
    try {
      const updated = await saveCryptoAllocations(
        drafts.map((d) => ({
          asset_id: d.asset_id,
          target_percent: d.target_percent,
          analysis_link: d.analysis_link.trim() || null
        }))
      );
      for (const item of updated) {
        const idx = rows.findIndex((r) => r.asset_id === item.asset_id);
        if (idx >= 0) {
          rows[idx] = item;
        }
      }
      rows = [...rows];
      await loadSnapshot();
      message = 'Alocação salva com sucesso.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a alocação.');
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    void loadData();
  });
</script>

<div class="flex flex-col gap-3">
  {#if error}
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  {/if}
  {#if message}
    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
  {/if}

  <section class="card bg-base-100 shadow">
    <div class="card-body gap-4">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="card-title text-lg">Criptomoedas</h2>
          <p class="text-sm text-base-content/70">
            Defina o percentual desejado de cada ativo na estratégia cripto (soma 100%). Inclui
            criptoativos (ex.: BTC-USD) e ETFs de cripto (ex.: ABTC11).
          </p>
        </div>
        <div class="form-control min-w-[12rem] max-w-xs">
          <span class="label-text text-xs font-semibold">Carteira</span>
          <PortfolioSelect
            {portfolios}
            {activeId}
            disabled={loading || saving || portfolios.length === 0}
            on:select={(e) => void handlePortfolioSelect(e.detail)}
          />
        </div>
      </div>

      {#if loading}
        <p class="text-sm text-base-content/70">Carregando…</p>
      {:else if activeId == null}
        <p class="text-sm text-base-content/70">Crie ou selecione uma carteira para continuar.</p>
      {:else if portfolioRows.length === 0}
        <p class="text-sm text-base-content/70">
          Nenhum ativo cripto na carteira ativa. Cadastre BTC-USD ou ABTC11 em Ativos e adicione
          posições em Carteiras.
        </p>
      {:else}
        <label class="form-control w-full max-w-xs">
          <span class="label-text">Filtrar</span>
          <input
            type="search"
            class="input input-bordered input-sm"
            placeholder="Ticker ou nome"
            bind:value={filterText}
          />
        </label>

        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th class="text-right">% atual</th>
                <th class="text-right">% desejado</th>
                <th class="text-right">Valor desejável (R$)</th>
                <th>Link de análise</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredDrafts as draft (draft.asset_id)}
                {@const meta = rowMeta(draft.asset_id)}
                {@const display = displayRows.find((row) => row.asset_id === draft.asset_id)}
                {#if meta && display}
                  <tr>
                    <td>{formatTickerForDisplay(meta.symbol)}</td>
                    <td>{meta.name}</td>
                    <td>{formatAssetTypeForDisplay(meta.asset_type)}</td>
                    <td class="text-right">{formatPercent(display.current_percent)}</td>
                    <td class="text-right" on:focusout={bumpDrafts}>
                      <BrDecimalInput
                        label=""
                        inputClass="input input-bordered input-sm w-24 text-right"
                        bind:value={draft.target_percent}
                        disabled={saving}
                      />
                    </td>
                    <td class="text-right">{formatBrl(display.desired_brl)}</td>
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
                          <a
                            class="link link-primary text-xs"
                            href={draft.analysis_link.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir link
                          </a>
                        {/if}
                      </div>
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
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-primary"
            disabled={saving || !allocationValid}
            on:click={() => void handleSave()}
          >
            {saving ? 'Salvando…' : 'Salvar alocação'}
          </button>
        </div>
      {/if}
    </div>
  </section>
</div>
