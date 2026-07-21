<script lang="ts">
  import { onMount } from 'svelte';

  import {
    getAnalysisMethodology,
    getStockBrConfig,
    listStockBrAnalysis,
    saveAnalysisMethodology,
    saveAssetAnalysisScores,
    saveStockBrAllocations,
    setAssetPending,
    PROFILE_STOCK_BR,
    type AnalysisConfig,
    type AnalysisMethodology,
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
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_PORTFOLIO_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import AssetAnalysisPanel from '$lib/features/analise/AssetAnalysisPanel.svelte';
  import {
    computeCombinedTableScore,
    computeFundamentalTableScore
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
  import AnalysisMethodologySelector from '$lib/features/analise/AnalysisMethodologySelector.svelte';
  import AnalysisSimpleAllocationPanel from '$lib/features/analise/AnalysisSimpleAllocationPanel.svelte';
  import AnalysisSumColumnConfigModal from '$lib/features/analise/AnalysisSumColumnConfigModal.svelte';
  import AnalysisTableAssetTypeCell from '$lib/features/analise/AnalysisTableAssetTypeCell.svelte';
  import AnalysisTableRowActions from '$lib/features/analise/AnalysisTableRowActions.svelte';
  import AnalysisTableSortIcon from '$lib/features/analise/AnalysisTableSortIcon.svelte';
  import AnalysisTableTickerCell from '$lib/features/analise/AnalysisTableTickerCell.svelte';
  import PortfolioWorkspaceBarPanel from '$lib/features/portfolios/PortfolioWorkspaceBarPanel.svelte';
  import RebalanceTableFilter from '$lib/features/rebalance/RebalanceTableFilter.svelte';

  const FUNDAMENTAL_COLUMN_CODES = ['lucros', 'divida', 'tag_along', 'segmento'] as const;
  const FUNDAMENTAL_COLUMN_LABELS: Record<(typeof FUNDAMENTAL_COLUMN_CODES)[number], string> = {
    lucros: 'Lucros',
    divida: 'Dívida',
    tag_along: 'Tag along',
    segmento: 'Segmento'
  };

  let sortKey: AnalysisSortKey = 'symbol';
  let sortDir: SortDirection = 'asc';

  let rows: AssetAnalysis[] = [];
  let config: AnalysisConfig | null = null;
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
  let methodology: AnalysisMethodology = 'auvp';
  let sumModalOpen = false;
  let simpleAllocationPanel: AnalysisSimpleAllocationPanel;

  $: assetIdsInPortfolio = new Set(positions.map((p) => p.asset_id));
  $: portfolioRows = filterAnalysisByPortfolio(rows, assetIdsInPortfolio);
  $: sumColumn = tableDisplay?.sum_column;
  $: showFundamentalColumn = sumColumn?.use_fundamental ?? true;
  $: showDiagramColumn = sumColumn?.use_diagram ?? true;
  $: if (sumColumn && sortKey === 'fundamental' && !showFundamentalColumn) sortKey = 'symbol';
  $: if (sumColumn && sortKey === 'diagrama' && !showDiagramColumn) sortKey = 'symbol';
  $: filteredRows = portfolioRows.filter((row) => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return (
      row.symbol.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q)
    );
  });
  $: displayedRows = sortAnalysisRows(filteredRows, sortKey, sortDir, sumColumn);
  $: activePortfolioName = portfolios.find((portfolio) => portfolio.id === activeId)?.name ?? '';

  function scoreValue(row: AssetAnalysis, code: string): number | null {
    return row.scores[code] ?? null;
  }

  function tableFundamental(row: AssetAnalysis): string {
    if (!sumColumn) return '—';
    const total = computeFundamentalTableScore(row.scores, sumColumn, PROFILE_STOCK_BR);
    return formatTableSumForDisplay(total);
  }

  function tableCombined(row: AssetAnalysis): string {
    if (!sumColumn) return '—';
    const total = computeCombinedTableScore(row.scores, row.summary, sumColumn, PROFILE_STOCK_BR);
    return formatTableSumForDisplay(total);
  }

  function handleMethodologyConfigSaved(next: TableDisplaySettings) {
    tableDisplay = structuredClone(next);
    if (config) {
      config = { ...config, table_display: tableDisplay };
    }
  }

  function viabilityBadge(row: AssetAnalysis): { label: string; className: string } {
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

  async function loadMethodology() {
    if (activeId == null) {
      methodology = 'auvp';
      return;
    }
    const result = await getAnalysisMethodology('stock-br', activeId);
    methodology = result.methodology;
  }

  async function loadAnalysisRows() {
    rows = activeId != null ? await listStockBrAnalysis(activeId) : await listStockBrAnalysis();
  }

  async function reloadSimpleAllocation() {
    if (simpleAllocationPanel && activeId != null) {
      await simpleAllocationPanel.reload(activeId);
    }
  }

  async function loadData() {
    loading = true;
    error = '';
    try {
      const [analysisConfig, portfolioList, active] = await Promise.all([
        getStockBrConfig(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      config = analysisConfig;
      tableDisplay = analysisConfig.table_display;
      portfolios = portfolioList;
      activeId = active ?? (portfolioList[0]?.id ?? null);
      await loadPositionsForActive();
      await loadMethodology();
      if (methodology === 'auvp') {
        await loadAnalysisRows();
      } else {
        await reloadSimpleAllocation();
      }
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

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    error = '';
    try {
      await setActivePortfolioId(id);
      await loadPositionsForActive();
      await loadMethodology();
      if (methodology === 'auvp') {
        await loadAnalysisRows();
      } else {
        await reloadSimpleAllocation();
      }
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
    }
  }

  async function handleMethodologyChange(next: AnalysisMethodology) {
    if (activeId == null || next === methodology) {
      return;
    }
    error = '';
    try {
      const result = await saveAnalysisMethodology('stock-br', activeId, next);
      methodology = result.methodology;
      if (methodology === 'auvp') {
        await loadAnalysisRows();
      } else {
        await reloadSimpleAllocation();
      }
    } catch (err) {
      error = parseApiError(err, 'Não foi possível alterar a metodologia.');
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
    _scoreRefs: Record<string, string | null> = {},
    pending?: boolean
  ) {
    if (!selected || activeId == null) return;
    saving = true;
    error = '';
    message = '';
    const wasPending = selected.is_pending ?? false;
    try {
      let updated = await saveAssetAnalysisScores(selected.asset_id, scores);
      if (pending != null && pending !== wasPending) {
        updated = await setAssetPending(selected.asset_id, activeId, pending, PROFILE_STOCK_BR);
      }
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

<div class="flex flex-col gap-3">
  <PortfolioWorkspaceBarPanel
    {portfolios}
    {activeId}
    {activePortfolioName}
    disabled={portfolios.length === 0}
    portfolioSelectTestId="analysis-portfolio-select"
    testId="analysis-portfolio-bar"
    showQuoteStatus={false}
    on:select={(event) => void handlePortfolioSelect(event.detail)}
  />

  <AnalysisMethodologySelector
    profileSlug="stock-br"
    value={methodology}
    disabled={loading || saving || activeId == null}
    onChange={(next) => void handleMethodologyChange(next)}
  />

  {#if methodology === 'auvp'}
    <div class="flex justify-end">
      <button
        type="button"
        class="btn btn-outline btn-sm"
        data-testid="analysis-sum-config-open"
        on:click={() => (sumModalOpen = true)}
      >
        Configurar metodologia de análise
      </button>
    </div>

    <PageSection title="Ações e ETFs (Brasil)" testId="analysis-acoes-table-section">
    <svelte:fragment slot="actions">
      <RebalanceTableFilter bind:value={filterText} testId="analysis-acoes-table-filter" />
    </svelte:fragment>

    {#if message}
      <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    {/if}
    {#if error}
      <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
    {/if}

    {#if !activeId}
        <EmptyStateCallout {...NO_PORTFOLIO_EMPTY_STATE} testId="analise-acoes-br-sem-carteira" />
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
        <div class="w-full min-w-0 overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4">
          <table class="table table-sm w-full">
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
                    <AnalysisTableSortIcon active={sortKey === 'symbol'} direction={sortDir} />
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
                    <AnalysisTableSortIcon active={sortKey === 'name'} direction={sortDir} />
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
                    <AnalysisTableSortIcon active={sortKey === 'asset_type'} direction={sortDir} />
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
                      <AnalysisTableSortIcon active={sortKey === code} direction={sortDir} />
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
                    <AnalysisTableSortIcon active={sortKey === 'viabilidade'} direction={sortDir} />
                  </button>
                </th>
                {#if showFundamentalColumn}
                  <th class="text-center">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'fundamental'
                      )}"
                      on:click={() => toggleSort('fundamental')}
                    >
                      Fundamental
                      <AnalysisTableSortIcon active={sortKey === 'fundamental'} direction={sortDir} />
                    </button>
                  </th>
                {/if}
                {#if showDiagramColumn}
                  <th class="text-center">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'diagrama'
                      )}"
                      on:click={() => toggleSort('diagrama')}
                    >
                      Diagrama
                      <AnalysisTableSortIcon active={sortKey === 'diagrama'} direction={sortDir} />
                    </button>
                  </th>
                {/if}
                <th class="text-center">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                      'soma'
                    )}"
                    on:click={() => toggleSort('soma')}
                  >
                    Soma
                    <AnalysisTableSortIcon active={sortKey === 'soma'} direction={sortDir} />
                  </button>
                </th>
                <th class="align-bottom w-24"><span class="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {#each displayedRows as row (row.asset_id)}
                {@const badge = viabilityBadge(row)}
                <tr>
                  <td><AnalysisTableTickerCell symbol={row.symbol} /></td>
                  <td
                    class="max-w-[10rem] truncate sm:max-w-[14rem] lg:max-w-[18rem]"
                    title={row.name}>{row.name}</td
                  >
                  <td><AnalysisTableAssetTypeCell assetType={row.asset_type} /></td>
                  {#each FUNDAMENTAL_COLUMN_CODES as code}
                    <td class="text-center">
                      <FundamentalScoreCell value={scoreValue(row, code)} />
                    </td>
                  {/each}
                  <td class="min-w-[8.5rem] px-3">
                    <span class="badge badge-sm whitespace-nowrap border {badge.className}">{badge.label}</span>
                  </td>
                  {#if showFundamentalColumn}
                    <td class="text-center font-medium">{tableFundamental(row)}</td>
                  {/if}
                  {#if showDiagramColumn}
                    <td class="text-center">{formatDiagramScoreForDisplay(row.summary.diagrama.score)}</td>
                  {/if}
                  <td class="text-center font-semibold">{tableCombined(row)}</td>
                  <td class="whitespace-nowrap px-1">
                    <AnalysisTableRowActions
                      isPending={row.is_pending ?? false}
                      onClassify={() => openPanel(row)}
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </PageSection>
  {:else}
    <AnalysisSimpleAllocationPanel
      bind:this={simpleAllocationPanel}
      profile={PROFILE_STOCK_BR}
      sectionTitle="Ações e ETFs (Brasil)"
      sectionTestId="analysis-acoes-allocation-section"
      filterTestId="analysis-acoes-table-filter"
      description="Defina o percentual desejado de cada ativo (soma 100%) e opcionalmente um link externo de análise."
      emptyMessage="Nenhuma ação ou ETF BR nesta carteira. Adicione posições em Carteiras."
      classDisplayClass="stocks"
      rebalanceAssetsKey="stock_assets"
      {activeId}
      {positions}
      {loading}
      listAnalysis={listStockBrAnalysis}
      saveAllocations={saveStockBrAllocations}
    />
  {/if}
</div>

<AnalysisSumColumnConfigModal
  profile="stock_br"
  open={sumModalOpen}
  onClose={() => (sumModalOpen = false)}
  onSaved={handleMethodologyConfigSaved}
/>

<AssetAnalysisPanel
  open={panelOpen}
  assetId={selected?.asset_id ?? null}
  symbol={selected?.symbol ?? ''}
  name={selected?.name ?? ''}
  assetType={selected?.asset_type ?? ''}
  criteria={config?.criteria ?? []}
  scores={selected?.scores ?? {}}
  scoreRefs={selected?.score_refs ?? {}}
  loading={saving}
  isPending={selected?.is_pending ?? false}
  showPendingToggle={activeId != null}
  onSave={handleSaveScores}
  onClose={closePanel}
/>
