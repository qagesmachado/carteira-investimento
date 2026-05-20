<script lang="ts">
  import { onMount } from 'svelte';

  import {
    getStockBrConfig,
    listStockBrAnalysis,
    saveAssetAnalysisScores,
    type AnalysisConfig,
    type AssetAnalysis,
    type TableDisplaySettings
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
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AssetAnalysisPanel from '$lib/features/analise/AssetAnalysisPanel.svelte';
  import { computeTableSumScore } from '$lib/features/analise/computeAnalysis';
  import { filterAnalysisByPortfolio } from '$lib/features/analise/filterAnalysisByPortfolio';
  import FundamentalScoreCell from '$lib/features/analise/FundamentalScoreCell.svelte';
  import { formatDiagramScore, viabilityBadgeClass } from '$lib/features/analise/viabilityBadge';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  const FUNDAMENTAL_COLUMN_CODES = ['lucros', 'divida', 'tag_along', 'segmento'] as const;

  let rows: AssetAnalysis[] = [];
  let config: AnalysisConfig | null = null;
  let tableDisplay: TableDisplaySettings | null = null;
  let portfolios: Portfolio[] = [];
  let positions: Position[] = [];
  let activeId: number | null = null;
  let portfolioSelectValue = '';
  let filterText = '';
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';
  let panelOpen = false;
  let selected: AssetAnalysis | null = null;

  $: assetIdsInPortfolio = new Set(positions.map((p) => p.asset_id));
  $: portfolioRows = filterAnalysisByPortfolio(rows, assetIdsInPortfolio);
  $: filteredRows = portfolioRows.filter((row) => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return (
      row.symbol.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q)
    );
  });
  $: sumColumn = tableDisplay?.sum_column;
  $: showSumColumn = sumColumn?.enabled ?? true;
  $: sumColumnLabel = sumColumn?.label?.trim() || 'Soma';

  $: {
    if (portfolios.length === 0) {
      portfolioSelectValue = '';
    } else if (activeId != null && portfolios.some((p) => p.id === activeId)) {
      portfolioSelectValue = String(activeId);
    } else {
      portfolioSelectValue = String(portfolios[0].id);
    }
  }

  function scoreValue(row: AssetAnalysis, code: string): number | null {
    return row.scores[code] ?? null;
  }

  function tableSum(row: AssetAnalysis): string {
    if (!sumColumn) return '—';
    const total = computeTableSumScore(row.scores, row.summary, sumColumn);
    if (total == null) return '—';
    return Number.isInteger(total) ? String(total) : total.toFixed(2);
  }

  function viabilityBadge(row: AssetAnalysis): { label: string; className: string } {
    const viability = row.summary.viabilidade;
    return {
      label: viability?.label ?? '—',
      className: viabilityBadgeClass(viability?.color)
    };
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
      const [analysisRows, analysisConfig, portfolioList, active] = await Promise.all([
        listStockBrAnalysis(),
        getStockBrConfig(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      rows = analysisRows;
      config = analysisConfig;
      tableDisplay = analysisConfig.table_display;
      portfolios = portfolioList;
      activeId = active ?? (portfolioList[0]?.id ?? null);
      await loadPositionsForActive();
    } catch (err) {
      rows = [];
      config = null;
      tableDisplay = null;
      portfolios = [];
      positions = [];
      activeId = null;
      error = parseApiError(
        err,
        'Não foi possível carregar a análise. Verifique se o backend está em execução.'
      );
    } finally {
      loading = false;
    }
  }

  async function handlePortfolioChange() {
    const id = Number(portfolioSelectValue);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    loading = true;
    error = '';
    try {
      await setActivePortfolioId(id);
      activeId = id;
      await loadPositionsForActive();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void loadData();
  });

  function openPanel(row: AssetAnalysis) {
    selected = row;
    panelOpen = true;
  }

  function closePanel() {
    panelOpen = false;
    selected = null;
  }

  async function handleSaveScores(scores: Record<string, number | null>) {
    if (!selected) return;
    saving = true;
    error = '';
    message = '';
    try {
      const updated = await saveAssetAnalysisScores(selected.asset_id, scores);
      rows = rows.map((row) => (row.asset_id === updated.asset_id ? updated : row));
      selected = updated;
      panelOpen = false;
      message = 'Classificação salva.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a classificação.');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Análise — Ações/ETF BR</title>
</svelte:head>

<div class="flex flex-col gap-8">
  <div class="card bg-base-100 shadow">
    <div class="card-body flex flex-col gap-4">
      <div class="form-control min-w-[12rem] max-w-xs">
        <span class="label-text text-xs font-semibold">Carteira</span>
        <select
          class="select select-bordered select-sm w-full"
          disabled={loading || portfolios.length === 0}
          bind:value={portfolioSelectValue}
          on:change={handlePortfolioChange}
          aria-label="Selecionar carteira"
        >
          {#if portfolios.length === 0}
            <option value="">Nenhuma carteira</option>
          {:else}
            {#each portfolios as p}
              <option value={String(p.id)}>{p.name}</option>
            {/each}
          {/if}
        </select>
      </div>
    </div>
  </div>

  <section class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="card-title">Ações e ETFs (Brasil)</h2>
        <input
          class="input input-bordered input-sm w-full max-w-xs"
          placeholder="Ticker ou nome"
          bind:value={filterText}
        />
      </div>

      {#if message}
        <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
      {/if}
      {#if error}
        <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
      {/if}

      {#if !activeId}
        <p class="text-sm text-base-content/70">
          Crie ou selecione uma carteira em <a class="link link-primary" href="/portfolios">Carteiras</a>.
        </p>
      {:else if loading}
        <p class="text-sm text-base-content/70">Carregando…</p>
      {:else if filteredRows.length === 0}
        <p class="text-sm text-base-content/70">
          {#if portfolioRows.length === 0}
            {#if positions.length === 0}
              Nenhuma posição nesta carteira. Cadastre ativos em
              <a class="link link-primary" href="/portfolios">Carteiras</a>.
            {:else}
              Nenhuma ação ou ETF BR nesta carteira.
            {/if}
          {:else}
            Nenhum ativo corresponde ao filtro.
          {/if}
        </p>
      {:else}
        <div class="overflow-x-auto px-6 md:px-10">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th class="text-center">Lucros</th>
                <th class="text-center">Dívida</th>
                <th class="text-center">Tag along</th>
                <th class="text-center">Segmento</th>
                <th class="min-w-[8.5rem] px-3">Viabilidade</th>
                <th class="text-center">Diagrama</th>
                {#if showSumColumn}
                  <th class="text-center">{sumColumnLabel}</th>
                {/if}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredRows as row (row.asset_id)}
                {@const badge = viabilityBadge(row)}
                <tr>
                  <td>{formatTickerForDisplay(row.symbol)}</td>
                  <td>{row.name}</td>
                  <td>{formatAssetTypeForDisplay(row.asset_type)}</td>
                  {#each FUNDAMENTAL_COLUMN_CODES as code}
                    <td class="text-center">
                      <FundamentalScoreCell value={scoreValue(row, code)} />
                    </td>
                  {/each}
                  <td class="min-w-[8.5rem] px-3">
                    <span class="badge badge-sm whitespace-nowrap border {badge.className}">{badge.label}</span>
                  </td>
                  <td class="text-center">{formatDiagramScore(row.summary.diagrama.score)}</td>
                  {#if showSumColumn}
                    <td class="text-center font-semibold">{tableSum(row)}</td>
                  {/if}
                  <td>
                    <button type="button" class="btn btn-ghost btn-xs" on:click={() => openPanel(row)}>
                      Classificar
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </section>
</div>

<AssetAnalysisPanel
  open={panelOpen}
  symbol={selected?.symbol ?? ''}
  name={selected?.name ?? ''}
  assetType={selected?.asset_type ?? ''}
  criteria={config?.criteria ?? []}
  scores={selected?.scores ?? {}}
  loading={saving}
  onSave={handleSaveScores}
  onClose={closePanel}
/>
