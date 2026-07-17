<script lang="ts">
  import { onMount } from 'svelte';
  import { goto, afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import { listAssets, type Asset } from '$lib/api/assets';
  import {
    PROFILE_FII_BR,
    PROFILE_STOCK_BR,
    getAnalysisMethodology,
    getFiiBrConfig,
    getFiiSegments,
    getStockBrConfig,
    getAssetAnalysis,
    saveAssetAnalysisScores,
    type AnalysisConfig,
    type AssetAnalysis,
    type SegmentCatalogEntry
  } from '$lib/api/analysis';
  import {
    deletePortfolio,
    deletePosition,
    getActivePortfolioId,
    listPortfolioSummaries,
    listPortfolios,
    listPositions,
    refreshPortfolioQuotes,
    setActivePortfolioId,
    updatePortfolio,
    type Portfolio,
    type PortfolioSummary,
    type PortfolioUpdate,
    type Position
  } from '$lib/api/portfolios';
  import { parseApiError } from '$lib/api/parseApiError';
  import { getUsdBrl } from '$lib/api/fx';
  import {
    formatCurrencyCodeForDisplay,
    formatMoneyAmount
  } from '$lib/assetLabels';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import {
    DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON,
    PORTFOLIO_POSITIONS_ADD_LUCIDE_ICON,
    PORTFOLIO_POSITIONS_BACK_LUCIDE_ICON,
    PORTFOLIO_POSITIONS_SEARCH_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';
  import { PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS, PAGE_HERO_DASHBOARD_BACK_BTN_CLASS } from '$lib/layout/pageVisual';
  import {
    computePortfolioSummary,
    usesManualPositionValues
  } from '$lib/features/portfolios/positionMetrics';
  import {
    buildPositionRows,
    filterPositionRows,
    sortPositionRows,
    type SortKey
  } from '$lib/features/portfolios/positionTableView';
  import AssetAnalysisPanel from '$lib/features/analise/AssetAnalysisPanel.svelte';
  import { findAssetPartition } from '$lib/features/portfolios/positionPurpose';
  import { getObjectivesSnapshot, type ObjectivesSnapshot } from '$lib/api/objetivos';
  import PositionEditModal from '$lib/features/portfolios/PositionEditModal.svelte';
  import FixedIncomePositionEditModal from '$lib/features/portfolios/FixedIncomePositionEditModal.svelte';
  import PortfolioAddAssetModal from '$lib/features/portfolios/PortfolioAddAssetModal.svelte';
  import EditPortfolioModal from '$lib/features/portfolios/EditPortfolioModal.svelte';
  import PortfolioDetailSummaryPanel from '$lib/features/portfolios/PortfolioDetailSummaryPanel.svelte';
  import PortfolioPositionsTable from '$lib/features/portfolios/PortfolioPositionsTable.svelte';
  import type { PortfolioMethodologies } from '$lib/features/portfolios/portfolioClassifyEligibility';
  import { canClassifyPortfolioAsset } from '$lib/features/portfolios/portfolioClassifyEligibility';
  import PortfolioWorkspaceBarPanel from '$lib/features/portfolios/PortfolioWorkspaceBarPanel.svelte';
  import { confirmPortfolioDelete } from '$lib/features/portfolios/portfolioDelete';

  $: routePortfolioId = Number($page.params.portfolioId);
  $: routePortfolioIdValid = Number.isInteger(routePortfolioId) && routePortfolioId > 0;

  let portfolios: Portfolio[] = [];
  let summaries: PortfolioSummary[] = [];
  let assets: Asset[] = [];
  let positions: Position[] = [];
  let activeId: number | null = null;
  let message = '';
  let error = '';
  let loading = false;
  let refreshingQuotes = false;
  let editingPosition: Position | null = null;
  let editModalOpen = false;
  let addModalOpen = false;
  let editPortfolioModalOpen = false;
  let editingPortfolio: Portfolio | null = null;
  let savingPortfolioEdit = false;
  let filterText = '';
  let sortKey: SortKey = 'ticker';
  let sortDir: 'asc' | 'desc' = 'asc';
  let prevActiveIdForFilter: number | null = null;
  let expandedPositionId: number | null = null;
  let prevActiveIdForExpanded: number | null = null;
  let analysisConfig: AnalysisConfig | null = null;
  let analysisProfile: string = PROFILE_STOCK_BR;
  let analysisSegments: SegmentCatalogEntry[] = [];
  let analysisPanelOpen = false;
  let analysisSaving = false;
  let analysisAsset: AssetAnalysis | null = null;
  let objectivesSnapshot: ObjectivesSnapshot | null = null;
  let usdBrlRate: number | null = null;
  let usdBrlRefreshedAt: string | null = null;
  let quotesRefreshedAt: string | null = null;
  let dataLoadedAt: string | null = null;
  let portfolioMethodologies: PortfolioMethodologies = {};

  $: summaryByPortfolioId = Object.fromEntries(
    summaries.map((summary) => [summary.portfolio_id, summary])
  );
  $: activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  $: activeSummary = activeId != null ? summaryByPortfolioId[activeId] : undefined;
  $: heroSubtitle = buildPortfolioSubtitle(activePortfolio);
  $: assetById = Object.fromEntries(assets.map((a) => [a.id, a]));
  $: editingAsset = editingPosition ? (assetById[editingPosition.asset_id] ?? null) : null;
  $: editingPositionUsesManualValues = editingAsset
    ? usesManualPositionValues(editingAsset)
    : false;
  $: if (activeId !== prevActiveIdForFilter) {
    prevActiveIdForFilter = activeId;
    filterText = '';
  }
  $: if (activeId !== prevActiveIdForExpanded) {
    prevActiveIdForExpanded = activeId;
    expandedPositionId = null;
  }

  function buildPortfolioSubtitle(portfolio: Portfolio | null): string {
    if (!portfolio) {
      return 'Carregando…';
    }
    const parts: string[] = [];
    if (portfolio.holder?.trim()) {
      parts.push(`Titular: ${portfolio.holder.trim()}`);
    }
    if (portfolio.objective?.trim()) {
      parts.push(portfolio.objective.trim());
    }
    return parts.length > 0 ? parts.join(' · ') : 'Gerenciar posições desta carteira';
  }

  function togglePositionDetails(positionId: number) {
    expandedPositionId = expandedPositionId === positionId ? null : positionId;
  }

  function positionDetailPanelId(positionId: number): string {
    return `position-detail-${positionId}`;
  }

  $: positionRows = buildPositionRows(positions, assetById);
  $: filteredRows = filterPositionRows(positionRows, filterText);
  $: displayedRows = sortPositionRows(filteredRows, sortKey, sortDir);
  $: portfolioSummary = computePortfolioSummary(
    displayedRows.map((r) => r.position),
    assetById
  );

  function formatOptionalMoney(value: number | null, currency: string | undefined): string {
    if (value == null || !currency) {
      return '—';
    }
    return formatMoneyAmount(value, currency);
  }

  async function loadObjectivesSnapshot(portfolioId: number) {
    try {
      objectivesSnapshot = await getObjectivesSnapshot(portfolioId);
    } catch {
      objectivesSnapshot = null;
    }
  }

  async function loadPortfolioMethodologies(portfolioId: number) {
    try {
      const [stockBr, fiiBr] = await Promise.all([
        getAnalysisMethodology('stock-br', portfolioId),
        getAnalysisMethodology('fii-br', portfolioId)
      ]);
      portfolioMethodologies = {
        [PROFILE_STOCK_BR]: stockBr.methodology,
        [PROFILE_FII_BR]: fiiBr.methodology
      };
    } catch {
      portfolioMethodologies = {};
    }
  }

  async function syncActiveAndPositions() {
    if (!routePortfolioIdValid) {
      activeId = null;
      positions = [];
      objectivesSnapshot = null;
      portfolioMethodologies = {};
      return;
    }

    const portfolio = portfolios.find((p) => p.id === routePortfolioId);
    if (!portfolio) {
      activeId = null;
      positions = [];
      objectivesSnapshot = null;
      portfolioMethodologies = {};
      return;
    }

    activeId = routePortfolioId;
    const serverActiveId = await getActivePortfolioId();
    if (serverActiveId !== routePortfolioId) {
      await setActivePortfolioId(routePortfolioId);
    }
    positions = await listPositions(routePortfolioId);
    await Promise.all([
      loadObjectivesSnapshot(routePortfolioId),
      loadPortfolioMethodologies(routePortfolioId)
    ]);
  }

  function assetPartitionFor(assetId: number) {
    return findAssetPartition(objectivesSnapshot?.asset_partitions ?? [], assetId) ?? null;
  }

  async function loadFx() {
    try {
      const fx = await getUsdBrl();
      usdBrlRate = fx.rate;
      usdBrlRefreshedAt = fx.refreshed_at;
    } catch {
      usdBrlRate = null;
      usdBrlRefreshedAt = null;
    }
  }

  async function refresh() {
    loading = true;
    error = '';
    try {
      [portfolios, summaries] = await Promise.all([listPortfolios(), listPortfolioSummaries()]);
      try {
        assets = await listAssets();
      } catch {
        assets = [];
        error = 'Não foi possível carregar a base de ativos.';
      }
      await loadFx();
      await syncActiveAndPositions();
      dataLoadedAt = new Date().toISOString();
    } catch (err) {
      positions = [];
      if (!error) {
        error = parseApiError(err, 'Não foi possível carregar as posições da carteira.');
      }
    } finally {
      loading = false;
    }
  }

  async function handleSelectActive(id: number) {
    if (id === activeId) {
      return;
    }
    await goto(`/portfolios/${id}`);
  }

  function openEditPortfolioModal(portfolio: Portfolio) {
    error = '';
    editingPortfolio = portfolio;
    editPortfolioModalOpen = true;
  }

  async function handleSavePortfolioEdit(payload: PortfolioUpdate) {
    if (!editingPortfolio) {
      return;
    }
    savingPortfolioEdit = true;
    error = '';
    try {
      await updatePortfolio(editingPortfolio.id, payload);
      editPortfolioModalOpen = false;
      editingPortfolio = null;
      message = 'Carteira atualizada.';
      await refresh();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar a carteira.');
      throw err;
    } finally {
      savingPortfolioEdit = false;
    }
  }

  function openAddAssetModal() {
    if (!activeId) {
      error = 'Selecione ou crie uma carteira.';
      return;
    }
    error = '';
    addModalOpen = true;
  }

  function handleEditPosition(position: Position) {
    editingPosition = position;
    editModalOpen = true;
  }

  function handleCloseEditModal() {
    editModalOpen = false;
    editingPosition = null;
  }

  async function ensureAnalysisConfig(profile: string) {
    if (analysisConfig && analysisProfile === profile) return;
    if (profile === PROFILE_FII_BR) {
      analysisConfig = await getFiiBrConfig();
      analysisSegments = await getFiiSegments();
    } else {
      analysisConfig = await getStockBrConfig();
      analysisSegments = [];
    }
    analysisProfile = profile;
  }

  async function handleClassifyAsset(asset: Asset) {
    if (!canClassifyPortfolioAsset(asset, portfolioMethodologies)) {
      return;
    }
    error = '';
    message = '';
    try {
      const profile = asset.display_class === 'funds' ? PROFILE_FII_BR : PROFILE_STOCK_BR;
      await ensureAnalysisConfig(profile);
      analysisAsset = await getAssetAnalysis(asset.id, profile);
      analysisPanelOpen = true;
    } catch (err) {
      error = parseApiError(err, 'Não foi possível abrir a classificação.');
    }
  }

  function handleCloseAnalysisPanel() {
    analysisPanelOpen = false;
    analysisAsset = null;
  }

  async function handleSaveAnalysisScores(
    scores: Record<string, number | null>,
    scoreRefs: Record<string, string | null> = {}
  ) {
    if (!analysisAsset) return;
    analysisSaving = true;
    error = '';
    message = '';
    try {
      analysisAsset = await saveAssetAnalysisScores(
        analysisAsset.asset_id,
        scores,
        analysisProfile,
        scoreRefs
      );
      analysisPanelOpen = false;
      message = 'Classificação salva.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a classificação.');
    } finally {
      analysisSaving = false;
    }
  }

  async function handleRefreshQuotes() {
    if (!activeId) {
      return;
    }
    refreshingQuotes = true;
    error = '';
    try {
      const result = await refreshPortfolioQuotes(activeId);
      quotesRefreshedAt = result.refreshed_at;
      await refresh();
      const failedCount = result.failed.length;
      message = `Cotações atualizadas: ${result.updated}. Ignoradas (sem mercado): ${result.skipped}.${
        failedCount > 0 ? ` Falhas: ${failedCount}.` : ''
      }`;
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar as cotações.');
    } finally {
      refreshingQuotes = false;
    }
  }

  async function handleDeletePosition(position: Position) {
    if (!activeId || !confirm('Remover esta posição?')) {
      return;
    }
    await deletePosition(activeId, position.id);
    positions = await listPositions(activeId);
    message = 'Posição removida.';
  }

  async function handleDeletePortfolio(portfolio: Portfolio) {
    if (portfolio.delete_locked) {
      return;
    }
    if (!confirmPortfolioDelete(portfolio.name)) {
      return;
    }
    await deletePortfolio(portfolio.id, { cascade: true });
    portfolios = await listPortfolios();
    const next = portfolios[0];
    if (next) {
      await goto(`/portfolios/${next.id}`);
    } else {
      await goto('/portfolios');
    }
    message = 'Carteira excluída.';
  }

  function handleTableSort(event: CustomEvent<SortKey>) {
    const key = event.detail;
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }

  function positionById(positionId: number): Position | undefined {
    return positions.find((p) => p.id === positionId);
  }

  onMount(() => {
    refresh().catch((err) => {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
    });
  });

  afterNavigate(() => {
    if (routePortfolioIdValid) {
      refresh().catch((err) => {
        error = parseApiError(err, 'Não foi possível carregar as posições da carteira.');
      });
    }
  });
</script>

<svelte:head>
  <title>{activePortfolio ? `${activePortfolio.name} — Posições` : 'Posições da carteira'}</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-4" class="flex w-full min-w-0 flex-col gap-3">
    <PageHero
      title={activePortfolio?.name ?? 'Posições da carteira'}
      subtitle={heroSubtitle}
      variant="dashboard"
    >
      <svelte:fragment slot="actions">
        <a
          class={PAGE_HERO_DASHBOARD_BACK_BTN_CLASS}
          href="/portfolios"
          data-testid="portfolio-positions-back"
        >
          <LucideIcon name={PORTFOLIO_POSITIONS_BACK_LUCIDE_ICON} size="md" class="text-white" />
          Todas as carteiras
        </a>
        <button
          class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
          type="button"
          disabled={loading || refreshingQuotes || !activeId}
          data-testid="portfolio-positions-refresh-quotes"
          on:click={handleRefreshQuotes}
        >
          <LucideIcon name={DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON} size="md" />
          {refreshingQuotes ? 'Atualizando…' : 'Atualizar cotações'}
        </button>
      </svelte:fragment>
    </PageHero>

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    {#if portfolios.length > 0}
      <PortfolioWorkspaceBarPanel
        {portfolios}
        activeId={activeId}
        activePortfolioName={activePortfolio?.name ?? ''}
        {usdBrlRate}
        {usdBrlRefreshedAt}
        quotesRefreshedAt={quotesRefreshedAt ?? dataLoadedAt}
        disabled={loading}
        portfolioSelectTestId="portfolio-positions-select"
        on:select={(event) => handleSelectActive(event.detail)}
      />
    {/if}

    {#if !routePortfolioIdValid}
      <div class="alert alert-warning">
        <span>Identificador de carteira inválido.</span>
        <a class="link link-primary" href="/portfolios">Voltar ao hub de carteiras</a>
      </div>
    {:else if portfolios.length > 0 && !activePortfolio}
      <div class="alert alert-warning">
        <span>Carteira não encontrada.</span>
        <a class="link link-primary" href="/portfolios">Voltar ao hub de carteiras</a>
      </div>
    {:else if activePortfolio}
      <PortfolioDetailSummaryPanel
        portfolio={activePortfolio}
        summary={activeSummary}
        deleteLocked={activePortfolio.delete_locked ?? false}
        onEdit={() => openEditPortfolioModal(activePortfolio)}
        onDelete={() => handleDeletePortfolio(activePortfolio)}
      />
    {/if}

    {#if activeId}
      <PageSection
        title="Posições ({positions.length})"
        testId="portfolio-positions-section"
        actionsTestId="portfolio-positions-actions"
      >
        <svelte:fragment slot="actions">
          <button
            class="btn btn-primary btn-sm gap-2"
            type="button"
            disabled={loading || !activeId}
            data-testid="portfolio-positions-add"
            on:click={openAddAssetModal}
          >
            <LucideIcon name={PORTFOLIO_POSITIONS_ADD_LUCIDE_ICON} size="sm" />
            Adicionar ativo
          </button>
        </svelte:fragment>

        {#if positions.length === 0}
          <p class="text-sm text-base-content/60">Sem posições nesta carteira.</p>
        {:else}
          <label class="form-control max-w-md">
            <span class="label-text">Buscar</span>
            <label class="input input-bordered input-sm flex items-center gap-2">
              <LucideIcon name={PORTFOLIO_POSITIONS_SEARCH_LUCIDE_ICON} size="sm" class="text-base-content/50" />
              <input
                class="grow"
                type="search"
                aria-label="Buscar"
                placeholder="Ticker ou nome do ativo"
                bind:value={filterText}
              />
            </label>
          </label>

          {#if displayedRows.length === 0}
            <p class="text-sm text-base-content/60">Nenhuma posição corresponde à busca.</p>
          {:else}
            <PortfolioPositionsTable
              rows={displayedRows}
              {sortKey}
              {sortDir}
              {expandedPositionId}
              {portfolioMethodologies}
              {formatOptionalMoney}
              {assetPartitionFor}
              {positionDetailPanelId}
              on:sort={handleTableSort}
              on:toggleDetails={(event) => togglePositionDetails(event.detail)}
              on:edit={(event) => {
                const position = positionById(event.detail);
                if (position) handleEditPosition(position);
              }}
              on:classify={(event) => {
                const asset = assetById[event.detail];
                if (asset) handleClassifyAsset(asset);
              }}
              on:remove={(event) => {
                const position = positionById(event.detail);
                if (position) handleDeletePosition(position);
              }}
            />

            {#if portfolioSummary.countByType.length > 0}
              <div class="space-y-3 border-t border-base-300 pt-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-medium">Por tipo:</span>
                  {#each portfolioSummary.countByType as item}
                    <span class="badge badge-ghost badge-sm">
                      {item.label}: {item.count}
                    </span>
                  {/each}
                </div>
              <div class="space-y-2 text-sm text-base-content/80">
                {#each portfolioSummary.totalsByCurrency as totals}
                  <p>
                    <span class="font-medium">{formatCurrencyCodeForDisplay(totals.currency)}:</span>
                    aplicado {formatMoneyAmount(totals.invested, totals.currency)} · atual
                    {formatMoneyAmount(totals.current, totals.currency)} · lucro
                    {formatMoneyAmount(totals.profit, totals.currency)}
                  </p>
                {/each}
              </div>
              </div>
            {/if}
          {/if}
        {/if}
      </PageSection>
    {/if}
  </AppPageShell>

  <PortfolioAddAssetModal
    bind:open={addModalOpen}
    portfolioId={activeId}
    {assets}
    onClose={() => (addModalOpen = false)}
    onSaved={async () => {
      await refresh();
      message = 'Ativo adicionado à carteira.';
    }}
  />

  <EditPortfolioModal
    bind:open={editPortfolioModalOpen}
    portfolio={editingPortfolio}
    loading={savingPortfolioEdit}
    onClose={() => {
      editingPortfolio = null;
    }}
    onSave={handleSavePortfolioEdit}
  />

  {#if editingPositionUsesManualValues}
    <FixedIncomePositionEditModal
      bind:open={editModalOpen}
      position={editingPosition}
      asset={editingAsset}
      portfolioId={activeId}
      onClose={handleCloseEditModal}
      onSaved={async () => {
        await refresh();
        message = 'Ativo atualizado.';
      }}
    />
  {:else}
    <PositionEditModal
      bind:open={editModalOpen}
      position={editingPosition}
      asset={editingAsset}
      portfolioId={activeId}
      onClose={handleCloseEditModal}
      onSaved={async () => {
        if (activeId) {
          positions = await listPositions(activeId);
          message = 'Posição atualizada.';
        }
      }}
    />
  {/if}

  <AssetAnalysisPanel
    open={analysisPanelOpen}
    assetId={analysisAsset?.asset_id ?? null}
    symbol={analysisAsset?.symbol ?? ''}
    name={analysisAsset?.name ?? ''}
    assetType={analysisAsset?.asset_type ?? ''}
    profile={analysisProfile}
    criteria={analysisConfig?.criteria ?? []}
    segments={analysisSegments}
    scores={analysisAsset?.scores ?? {}}
    scoreRefs={analysisAsset?.score_refs ?? {}}
    loading={analysisSaving}
    onSave={handleSaveAnalysisScores}
    onClose={handleCloseAnalysisPanel}
  />
</main>
