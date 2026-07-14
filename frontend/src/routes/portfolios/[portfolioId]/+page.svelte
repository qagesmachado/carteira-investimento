<script lang="ts">
  import { onMount } from 'svelte';
  import { goto, afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import { listAssets, type Asset } from '$lib/api/assets';
  import {
    PROFILE_FII_BR,
    PROFILE_STOCK_BR,
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
    listPortfolios,
    listPositions,
    refreshPortfolioQuotes,
    setActivePortfolioId,
    updatePortfolio,
    type Portfolio,
    type Position
  } from '$lib/api/portfolios';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    formatAssetTypeForDisplay,
    formatCurrencyCodeForDisplay,
    formatMoneyAmount
  } from '$lib/assetLabels';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import {
    computePortfolioSummary,
    formatPositionProfit,
    formatQuantityForDisplay,
    positionCurrentValue,
    positionInvestedValue,
    usesManualPositionValues
  } from '$lib/features/portfolios/positionMetrics';
  import {
    buildPositionRows,
    filterPositionRows,
    sortPositionRows,
    type SortKey
  } from '$lib/features/portfolios/positionTableView';
  import AssetAnalysisPanel from '$lib/features/analise/AssetAnalysisPanel.svelte';
  import PositionDetailPanel from '$lib/features/portfolios/PositionDetailPanel.svelte';
  import { findAssetPartition } from '$lib/features/portfolios/positionPurpose';
  import { getObjectivesSnapshot, type ObjectivesSnapshot } from '$lib/api/objetivos';
  import PositionEditModal from '$lib/features/portfolios/PositionEditModal.svelte';
  import FixedIncomePositionEditModal from '$lib/features/portfolios/FixedIncomePositionEditModal.svelte';
  import PortfolioAddAssetModal from '$lib/features/portfolios/PortfolioAddAssetModal.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { confirmPortfolioDelete } from '$lib/features/portfolios/portfolioDelete';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  $: routePortfolioId = Number($page.params.portfolioId);
  $: routePortfolioIdValid = Number.isInteger(routePortfolioId) && routePortfolioId > 0;

  let portfolios: Portfolio[] = [];
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
  let editPortfolioName = '';
  let editingPortfolioName = false;
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

  $: activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  $: if (activePortfolio && !editingPortfolioName) {
    editPortfolioName = activePortfolio.name;
  } else if (!activePortfolio) {
    editPortfolioName = '';
    editingPortfolioName = false;
  }
  $: canSavePortfolioName =
    editingPortfolioName &&
    !!activePortfolio &&
    editPortfolioName.trim().length > 0 &&
    editPortfolioName.trim() !== activePortfolio.name;
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

  function headerSortClass(key: SortKey): string {
    return sortKey === key ? 'font-bold' : 'font-normal';
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }

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

  async function syncActiveAndPositions() {
    if (!routePortfolioIdValid) {
      activeId = null;
      positions = [];
      objectivesSnapshot = null;
      return;
    }

    const portfolio = portfolios.find((p) => p.id === routePortfolioId);
    if (!portfolio) {
      activeId = null;
      positions = [];
      objectivesSnapshot = null;
      return;
    }

    activeId = routePortfolioId;
    const serverActiveId = await getActivePortfolioId();
    if (serverActiveId !== routePortfolioId) {
      await setActivePortfolioId(routePortfolioId);
    }
    positions = await listPositions(routePortfolioId);
    await loadObjectivesSnapshot(routePortfolioId);
  }

  function assetPartitionFor(assetId: number) {
    return findAssetPartition(objectivesSnapshot?.asset_partitions ?? [], assetId) ?? null;
  }

  async function refresh() {
    loading = true;
    error = '';
    portfolios = await listPortfolios();
    try {
      assets = await listAssets();
    } catch {
      assets = [];
      error = 'Não foi possível carregar a base de ativos.';
    }
    try {
      await syncActiveAndPositions();
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

  function startEditPortfolioName() {
    if (!activePortfolio) {
      return;
    }
    editingPortfolioName = true;
    editPortfolioName = activePortfolio.name;
  }

  function cancelEditPortfolioName() {
    editingPortfolioName = false;
    if (activePortfolio) {
      editPortfolioName = activePortfolio.name;
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

  async function handleSavePortfolioName() {
    if (!activeId || !activePortfolio || !editingPortfolioName) {
      return;
    }
    const trimmed = editPortfolioName.trim();
    if (!trimmed || trimmed === activePortfolio.name) {
      return;
    }
    const confirmed = confirm(
      `Renomear a carteira «${activePortfolio.name}» para «${trimmed}»?`
    );
    if (!confirmed) {
      return;
    }
    loading = true;
    error = '';
    try {
      await updatePortfolio(activeId, { name: trimmed });
      editingPortfolioName = false;
      await refresh();
      message = 'Nome da carteira atualizado.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o nome da carteira.');
    } finally {
      loading = false;
    }
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
      title="Posições da carteira"
      subtitle={activePortfolio?.name ?? 'Carregando…'}
      variant="secondary"
    />

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    <div class="flex flex-wrap items-center gap-3">
      <a class="btn btn-ghost btn-sm" href="/portfolios">← Todas as carteiras</a>
      {#if portfolios.length > 0}
        <PortfolioSelect
          {portfolios}
          activeId={activeId}
          disabled={loading}
          testId="portfolio-positions-select"
          on:select={(event) => handleSelectActive(event.detail)}
        />
      {/if}
    </div>

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
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Carteira ativa</h2>
          <label class="form-control mt-2">
            <span class="label-text">Nome</span>
            <div class="flex flex-wrap items-center gap-2">
              <input
                class="input input-bordered min-w-[12rem] flex-1"
                bind:value={editPortfolioName}
                disabled={!editingPortfolioName || loading}
                aria-readonly={!editingPortfolioName}
                aria-label="Nome"
              />
              {#if editingPortfolioName}
                <button
                  class="btn btn-primary btn-sm"
                  type="button"
                  disabled={loading || !canSavePortfolioName}
                  on:click={handleSavePortfolioName}
                >
                  Salvar
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  type="button"
                  disabled={loading}
                  on:click={cancelEditPortfolioName}
                >
                  Cancelar
                </button>
              {:else}
                <button
                  class="btn btn-outline btn-sm"
                  type="button"
                  disabled={loading}
                  on:click={startEditPortfolioName}
                >
                  Editar
                </button>
              {/if}
            </div>
          </label>
          <button
            class="btn btn-error btn-outline btn-sm mt-2"
            type="button"
            on:click={() => handleDeletePortfolio(activePortfolio)}
          >
            Excluir carteira
          </button>
        </div>
      </div>
    {/if}

    {#if activeId}
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="card-title mb-0">Posições</h2>
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="btn btn-primary btn-sm"
                type="button"
                disabled={loading}
                on:click={openAddAssetModal}
              >
                Adicionar ativo à carteira
              </button>
              <button
                class="btn btn-outline btn-sm"
                type="button"
                disabled={loading || refreshingQuotes}
                on:click={handleRefreshQuotes}
              >
                {refreshingQuotes ? 'Atualizando…' : 'Atualizar cotações'}
              </button>
            </div>
          </div>

          {#if positions.length === 0}
            <p class="mt-4 text-sm text-base-content/60">Sem posições nesta carteira.</p>
          {:else}
            <label class="form-control mt-4 max-w-md">
              <span class="label-text">Buscar</span>
              <input
                class="input input-bordered input-sm"
                type="search"
                aria-label="Buscar"
                placeholder="Ticker ou nome do ativo"
                bind:value={filterText}
              />
            </label>
            {#if displayedRows.length === 0}
              <p class="mt-4 text-sm text-base-content/60">Nenhuma posição corresponde à busca.</p>
            {:else}
            <div class="mt-4 overflow-x-auto">
              <table class="table table-zebra w-full min-w-[58rem]">
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('ticker')}"
                        on:click={() => toggleSort('ticker')}
                      >
                        Ativo
                        {#if sortKey === 'ticker'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('asset_type')}"
                        on:click={() => toggleSort('asset_type')}
                      >
                        Tipo
                        {#if sortKey === 'asset_type'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('currency')}"
                        on:click={() => toggleSort('currency')}
                      >
                        Moeda
                        {#if sortKey === 'currency'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-0 font-normal normal-case {headerSortClass('quantity')}"
                        on:click={() => toggleSort('quantity')}
                      >
                        Qtd
                        {#if sortKey === 'quantity'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('invested')}"
                        on:click={() => toggleSort('invested')}
                      >
                        Valor aplicado
                        {#if sortKey === 'invested'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('current')}"
                        on:click={() => toggleSort('current')}
                      >
                        Valor atual
                        {#if sortKey === 'current'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('yield')}"
                        on:click={() => toggleSort('yield')}
                      >
                        Rendimento
                        {#if sortKey === 'yield'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass('profit')}"
                        on:click={() => toggleSort('profit')}
                      >
                        Lucro
                        {#if sortKey === 'profit'}
                          <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        {/if}
                      </button>
                    </th>
                    <th class="min-w-[18rem] whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {#each displayedRows as row (row.position.id)}
                    {@const position = row.position}
                    {@const asset = row.asset}
                    <tr>
                      <td>{formatTickerForDisplay(asset.symbol)}</td>
                      <td>{formatAssetTypeForDisplay(asset.asset_type)}</td>
                      <td>{asset.currency}</td>
                      <td>
                        {usesManualPositionValues(asset)
                          ? '—'
                          : formatQuantityForDisplay(position.quantity)}
                      </td>
                      <td>
                        {formatOptionalMoney(positionInvestedValue(position, asset), asset.currency)}
                      </td>
                      <td>
                        {formatOptionalMoney(positionCurrentValue(position, asset), asset.currency)}
                      </td>
                      <td>{usesManualPositionValues(asset) ? position.contracted_yield || '—' : '—'}</td>
                      <td>{formatPositionProfit(position, asset)}</td>
                      <td class="min-w-[18rem] space-x-1 whitespace-nowrap">
                        <button
                          class="btn btn-ghost btn-xs"
                          type="button"
                          aria-expanded={expandedPositionId === position.id}
                          aria-controls={positionDetailPanelId(position.id)}
                          on:click={() => togglePositionDetails(position.id)}>Detalhes</button
                        >
                        <button
                          class="btn btn-ghost btn-xs"
                          type="button"
                          on:click={() => handleEditPosition(position)}>Editar</button
                        >
                        {#if asset.display_class === 'stocks' || asset.display_class === 'funds'}
                          <button
                            class="btn btn-ghost btn-xs"
                            type="button"
                            on:click={() => handleClassifyAsset(asset)}>Classificar</button
                          >
                        {/if}
                        <button
                          class="btn btn-ghost btn-xs text-error"
                          type="button"
                          on:click={() => handleDeletePosition(position)}>Remover</button
                        >
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
            {#if portfolioSummary.countByType.length > 0}
              <div class="mt-4 space-y-3 border-t border-base-300 pt-4 text-sm">
                <p>
                  <span class="font-medium">Por tipo:</span>
                  {portfolioSummary.countByType
                    .map((item) => `${item.label}: ${item.count}`)
                    .join(' · ')}
                </p>
                {#each portfolioSummary.totalsByCurrency as totals}
                  <p>
                    <span class="font-medium">{formatCurrencyCodeForDisplay(totals.currency)}:</span>
                    aplicado {formatMoneyAmount(totals.invested, totals.currency)} · atual
                    {formatMoneyAmount(totals.current, totals.currency)} · lucro
                    {formatMoneyAmount(totals.profit, totals.currency)}
                  </p>
                {/each}
              </div>
            {/if}
            {/if}
          {/if}
        </div>
      </div>
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
