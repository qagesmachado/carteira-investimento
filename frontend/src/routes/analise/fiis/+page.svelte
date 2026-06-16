<script lang="ts">
  import { onMount } from 'svelte';

  import {
    PROFILE_FII_BR,
    getFiiBrConfig,
    getFiiSegments,
    listFiiBrAnalysis,
    saveAssetAnalysisScores,
    type AnalysisConfig,
    type AssetAnalysis,
    type SegmentCatalogEntry,
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
  import {
    computeTableSumScore,
    isPvpDiscarded
  } from '$lib/features/analise/computeAnalysis';
  import { filterAnalysisByPortfolio } from '$lib/features/analise/filterAnalysisByPortfolio';
  import FundamentalScoreCell from '$lib/features/analise/FundamentalScoreCell.svelte';
  import {
    sortAnalysisRows,
    type AnalysisSortKey,
    type SortDirection
  } from '$lib/features/analise/sortAnalysisRows';
  import {
    formatDiagramScoreForDisplay,
    formatTableSumForDisplay,
    formatViabilityLabelForDisplay,
    viabilityBadgeClass
  } from '$lib/features/analise/viabilityBadge';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  const FUNDAMENTAL_COLUMN_CODES = ['vacancia', 'qtd_ativos', 'alavancagem', 'segmento_fii'] as const;
  const FUNDAMENTAL_COLUMN_LABELS: Record<(typeof FUNDAMENTAL_COLUMN_CODES)[number], string> = {
    vacancia: 'Vacância',
    qtd_ativos: 'Qtd Ativos',
    alavancagem: 'Alavancagem',
    segmento_fii: 'Segmento'
  };

  let sortKey: AnalysisSortKey = 'symbol';
  let sortDir: SortDirection = 'asc';

  let rows: AssetAnalysis[] = [];
  let config: AnalysisConfig | null = null;
  let segments: SegmentCatalogEntry[] = [];
  let tableDisplay: TableDisplaySettings | null = null;
  let portfolios: Portfolio[] = [];
  let positions: Position[] = [];
  let activeId: number | null = null;
  let filterText = '';
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';
  let panelOpen = false;
  let selected: AssetAnalysis | null = null;

  $: assetIdsInPortfolio = new Set(positions.map((p) => p.asset_id));
  $: portfolioRows = filterAnalysisByPortfolio(rows, assetIdsInPortfolio);
  $: sumColumn = tableDisplay?.sum_column;
  $: showSumColumn = sumColumn?.enabled ?? true;
  $: sumColumnLabel = sumColumn?.label?.trim() || 'Soma';
  $: filteredRows = portfolioRows.filter((row) => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return row.symbol.toLowerCase().includes(q) || row.name.toLowerCase().includes(q);
  });
  $: displayedRows = sortAnalysisRows(filteredRows, sortKey, sortDir, sumColumn, PROFILE_FII_BR);

  function scoreValue(row: AssetAnalysis, code: string): number | null {
    return row.scores[code] ?? null;
  }

  function tableSum(row: AssetAnalysis): string {
    if (!sumColumn || isPvpDiscarded(row.scores)) return '—';
    const total = computeTableSumScore(row.scores, row.summary, sumColumn, PROFILE_FII_BR);
    return formatTableSumForDisplay(total);
  }

  function viabilityBadge(row: AssetAnalysis): { label: string; className: string } {
    if (isPvpDiscarded(row.scores)) {
      return {
        label: formatViabilityLabelForDisplay('DESCARTADO'),
        className: viabilityBadgeClass('error')
      };
    }
    const viability = row.summary.viabilidade;
    return {
      label: formatViabilityLabelForDisplay(viability?.label),
      className: viabilityBadgeClass(viability?.color)
    };
  }

  function headerSortClass(key: AnalysisSortKey): string {
    return sortKey === key ? 'font-bold' : 'font-normal';
  }

  function toggleSort(key: AnalysisSortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
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
      const [analysisRows, analysisConfig, segmentList, portfolioList, active] = await Promise.all([
        listFiiBrAnalysis(),
        getFiiBrConfig(),
        getFiiSegments(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      rows = analysisRows;
      config = analysisConfig;
      segments = segmentList;
      tableDisplay = analysisConfig.table_display;
      portfolios = portfolioList;
      activeId = active ?? (portfolioList[0]?.id ?? null);
      await loadPositionsForActive();
    } catch (err) {
      rows = [];
      config = null;
      segments = [];
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

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    activeId = id;
    error = '';
    try {
      await setActivePortfolioId(id);
      await loadPositionsForActive();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
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

  async function handleSaveScores(
    scores: Record<string, number | null>,
    scoreRefs: Record<string, string | null>
  ) {
    if (!selected) return;
    saving = true;
    error = '';
    message = '';
    try {
      const updated = await saveAssetAnalysisScores(
        selected.asset_id,
        scores,
        PROFILE_FII_BR,
        scoreRefs
      );
      rows = rows.map((row) => (row.asset_id === updated.asset_id ? updated : row));
      message = 'Classificação salva.';
      panelOpen = false;
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a classificação.');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Análise — FIIs</title>
</svelte:head>

<div class="flex flex-col gap-8">
  <div class="card bg-base-100 shadow">
    <div class="card-body flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="form-control min-w-[12rem] max-w-xs">
        <span class="label-text text-xs font-semibold">Carteira</span>
        <PortfolioSelect
          {portfolios}
          {activeId}
          disabled={portfolios.length === 0}
          on:select={(event) => void handlePortfolioSelect(event.detail)}
        />
      </div>
      <div class="flex gap-2">
        <a class="btn btn-outline btn-sm" href="/analise/configuracao?perfil=fiis">Configuração Soma</a>
        <a class="btn btn-outline btn-sm" href="/analise/fiis/segmentos">Segmentos</a>
      </div>
    </div>
  </div>

  <section class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="card-title">Fundos imobiliários (FIIs)</h2>
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
              Nenhum FII nesta carteira.
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
                <th>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                      'symbol'
                    )}"
                    on:click={() => toggleSort('symbol')}
                  >
                    Ticker
                    {#if sortKey === 'symbol'}
                      <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    {/if}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                      'name'
                    )}"
                    on:click={() => toggleSort('name')}
                  >
                    Nome
                    {#if sortKey === 'name'}
                      <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    {/if}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                      'asset_type'
                    )}"
                    on:click={() => toggleSort('asset_type')}
                  >
                    Tipo
                    {#if sortKey === 'asset_type'}
                      <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    {/if}
                  </button>
                </th>
                {#each FUNDAMENTAL_COLUMN_CODES as code}
                  <th class="text-center">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        code
                      )}"
                      on:click={() => toggleSort(code)}
                    >
                      {FUNDAMENTAL_COLUMN_LABELS[code]}
                      {#if sortKey === code}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                {/each}
                <th class="min-w-[8.5rem] px-3">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                      'viabilidade'
                    )}"
                    on:click={() => toggleSort('viabilidade')}
                  >
                    Viabilidade
                    {#if sortKey === 'viabilidade'}
                      <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    {/if}
                  </button>
                </th>
                <th class="text-center">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                      'diagrama'
                    )}"
                    on:click={() => toggleSort('diagrama')}
                  >
                    Diagrama
                    {#if sortKey === 'diagrama'}
                      <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    {/if}
                  </button>
                </th>
                {#if showSumColumn}
                  <th class="text-center">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'soma'
                      )}"
                      on:click={() => toggleSort('soma')}
                    >
                      {sumColumnLabel}
                      {#if sortKey === 'soma'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                {/if}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {#each displayedRows as row (row.asset_id)}
                {@const badge = viabilityBadge(row)}
                <tr class:opacity-60={isPvpDiscarded(row.scores)}>
                  <td>{formatTickerForDisplay(row.symbol)}</td>
                  <td>{row.name}</td>
                  <td>{formatAssetTypeForDisplay(row.asset_type)}</td>
                  {#each FUNDAMENTAL_COLUMN_CODES as code}
                    <td class="text-center">
                      <FundamentalScoreCell value={scoreValue(row, code)} />
                    </td>
                  {/each}
                  <td class="min-w-[8.5rem] px-3">
                    <span class="badge badge-sm whitespace-nowrap border {badge.className}"
                      >{badge.label}</span
                    >
                  </td>
                  <td class="text-center">{formatDiagramScoreForDisplay(row.summary.diagrama.score)}</td>
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
  assetId={selected?.asset_id ?? null}
  symbol={selected?.symbol ?? ''}
  name={selected?.name ?? ''}
  assetType={selected?.asset_type ?? ''}
  profile={PROFILE_FII_BR}
  criteria={config?.criteria ?? []}
  {segments}
  scores={selected?.scores ?? {}}
  scoreRefs={selected?.score_refs ?? {}}
  loading={saving}
  onSave={handleSaveScores}
  onClose={closePanel}
/>
