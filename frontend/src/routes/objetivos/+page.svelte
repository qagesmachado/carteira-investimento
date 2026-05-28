<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    createObjective,
    deleteObjective,
    getObjectivesSnapshot,
    replaceObjectiveAllocations,
    updateObjective,
    type ObjectivesSnapshot,
    type Objective,
    type ObjectiveAllocationItem
  } from '$lib/api/objetivos';
  import {
    getActivePortfolioId,
    listPortfolios,
    listPositions,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import AssetAllocationModal from '$lib/features/objetivos/AssetAllocationModal.svelte';
  import AssetPartitionDetail from '$lib/features/objetivos/AssetPartitionDetail.svelte';
  import DivergenceBanner from '$lib/features/objetivos/DivergenceBanner.svelte';
  import { OBJECTIVES_SUMMARY_TAB_ID } from '$lib/features/objetivos/constants';
  import { isUserVisibleObjective } from '$lib/features/objetivos/objectiveVisibility';
  import ObjectiveDetail from '$lib/features/objetivos/ObjectiveDetail.svelte';
  import ObjectiveEditModal from '$lib/features/objetivos/ObjectiveEditModal.svelte';
  import ObjectivesPanel from '$lib/features/objetivos/ObjectivesPanel.svelte';
  import ObjectivesSummary from '$lib/features/objetivos/ObjectivesSummary.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let snapshot: ObjectivesSnapshot | null = null;
  let portfolioAssets: Asset[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let selectedObjectiveId: number | null = OBJECTIVES_SUMMARY_TAB_ID;
  let selectedPartitionAssetId: number | null = null;

  let editModalOpen = false;
  let editMode: 'create' | 'rename' = 'create';
  let editError = '';

  let allocationModalOpen = false;
  let allocationEditingId: number | null = null;
  let allocationModalSession = 0;
  let allocationError = '';

  $: objectives = snapshot?.objectives ?? [];
  $: divergences = snapshot?.divergences ?? [];
  $: assetPartitions = snapshot?.asset_partitions ?? [];
  $: showSummary = selectedObjectiveId === OBJECTIVES_SUMMARY_TAB_ID;
  $: selectedPartition =
    selectedPartitionAssetId != null
      ? assetPartitions.find((p) => p.asset_id === selectedPartitionAssetId) ?? null
      : null;
  $: selectedObjective =
    !showSummary && selectedPartitionAssetId == null
      ? (objectives.find((o) => o.id === selectedObjectiveId) ?? null)
      : null;

  async function loadPortfolioAssets(portfolioId: number) {
    const [assets, positions] = await Promise.all([listAssets(), listPositions(portfolioId)]);
    const ids = new Set(positions.map((p) => p.asset_id));
    portfolioAssets = assets.filter((a) => ids.has(a.id));
  }

  async function loadSnapshot(portfolioId: number) {
    loading = true;
    error = '';
    try {
      await loadPortfolioAssets(portfolioId);
      snapshot = await getObjectivesSnapshot(portfolioId);
      if (
        selectedObjectiveId != null &&
        selectedObjectiveId !== OBJECTIVES_SUMMARY_TAB_ID
      ) {
        const selected = snapshot.objectives.find((o) => o.id === selectedObjectiveId);
        if (!selected || !isUserVisibleObjective(selected)) {
          selectedObjectiveId = OBJECTIVES_SUMMARY_TAB_ID;
        }
      }
      if (
        selectedPartitionAssetId != null &&
        !snapshot.asset_partitions.some((p) => p.asset_id === selectedPartitionAssetId)
      ) {
        selectedPartitionAssetId = null;
      }
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar objetivos.');
    } finally {
      loading = false;
    }
  }

  async function loadPage() {
    loading = true;
    error = '';
    try {
      portfolios = await listPortfolios();
      activeId = await getActivePortfolioId();
      const id = activeId ?? portfolios[0]?.id ?? null;
      if (id != null) {
        activeId = id;
        await loadSnapshot(id);
      } else {
        snapshot = null;
        loading = false;
      }
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
      loading = false;
    }
  }

  onMount(() => {
    void loadPage();
  });

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    activeId = id;
    selectedObjectiveId = OBJECTIVES_SUMMARY_TAB_ID;
    selectedPartitionAssetId = null;
    await setActivePortfolioId(id);
    await loadSnapshot(id);
  }

  function handlePanelSelect(id: number) {
    if (id !== OBJECTIVES_SUMMARY_TAB_ID) {
      const objective = objectives.find((o) => o.id === id);
      if (objective && !isUserVisibleObjective(objective)) {
        selectedObjectiveId = OBJECTIVES_SUMMARY_TAB_ID;
        selectedPartitionAssetId = null;
        return;
      }
    }
    selectedObjectiveId = id;
    selectedPartitionAssetId = null;
  }

  function openCreateModal() {
    editMode = 'create';
    editError = '';
    editModalOpen = true;
  }

  function openRenameModal() {
    editMode = 'rename';
    editError = '';
    editModalOpen = true;
  }

  async function handleObjectiveSave(
    event: CustomEvent<{
      name: string;
      description: string;
      mode: 'multi_asset' | 'single_asset';
      partitionAssetId: number | null;
    }>
  ) {
    if (activeId == null) return;
    saving = true;
    editError = '';
    try {
      if (editMode === 'create') {
        const created = await createObjective(activeId, {
          name: event.detail.name,
          description: event.detail.description || null,
          mode: event.detail.mode,
          partition_asset_id:
            event.detail.mode === 'single_asset' ? event.detail.partitionAssetId : null
        });
        selectedObjectiveId = created.id;
        selectedPartitionAssetId = null;
      } else if (selectedObjective && !selectedObjective.is_default) {
        await updateObjective(activeId, selectedObjective.id, {
          name: event.detail.name,
          description: event.detail.description || null
        });
      }
      editModalOpen = false;
      await loadSnapshot(activeId);
    } catch (err) {
      editError = parseApiError(err, 'Não foi possível salvar objetivo.');
    } finally {
      saving = false;
    }
  }

  async function handleDeleteObjective() {
    if (activeId == null || !selectedObjective || selectedObjective.is_default) return;
    if (!confirm(`Excluir objetivo «${selectedObjective.name}»? Alocações voltam ao Livre.`)) {
      return;
    }
    saving = true;
    error = '';
    try {
      await deleteObjective(activeId, selectedObjective.id);
      selectedObjectiveId = OBJECTIVES_SUMMARY_TAB_ID;
      selectedPartitionAssetId = null;
      await loadSnapshot(activeId);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir objetivo.');
    } finally {
      saving = false;
    }
  }

  function toAllocationItem(row: Objective['allocations'][number]) {
    const base = { slice_name: row.slice_name, asset_id: row.asset_id };
    if (row.split_mode === 'amount') {
      return { ...base, amount: row.amount };
    }
    return { ...base, quantity: row.quantity };
  }

  function openAllocationModal(editingAllocationId: number | null = null) {
    allocationModalSession += 1;
    allocationEditingId = editingAllocationId;
    allocationError = '';
    allocationModalOpen = true;
  }

  function closeAllocationModal() {
    allocationModalOpen = false;
    allocationEditingId = null;
  }

  async function handleRemoveAllocation(allocationId: number) {
    if (activeId == null || !selectedObjective || selectedObjective.is_default) return;
    const row = selectedObjective.allocations.find((a) => a.id === allocationId);
    const label = row?.slice_name ?? row?.symbol ?? 'esta fatia';
    if (!confirm(`Remover fatia «${label}»? As cotas voltam ao Livre.`)) {
      return;
    }
    saving = true;
    error = '';
    try {
      const remaining = selectedObjective.allocations
        .filter((a) => a.id !== allocationId)
        .map(toAllocationItem);
      await replaceObjectiveAllocations(activeId, selectedObjective.id, remaining);
      await loadSnapshot(activeId);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível remover alocação.');
    } finally {
      saving = false;
    }
  }

  async function handleAllocationSave(
    event: CustomEvent<{ payload: ObjectiveAllocationItem }>
  ) {
    if (activeId == null || !selectedObjective || selectedObjective.is_default) return;
    saving = true;
    allocationError = '';
    try {
      const others = selectedObjective.allocations
        .filter((a) => a.id !== allocationEditingId)
        .map(toAllocationItem);
      await replaceObjectiveAllocations(activeId, selectedObjective.id, [
        ...others,
        event.detail.payload
      ]);
      closeAllocationModal();
      await loadSnapshot(activeId);
    } catch (err) {
      allocationError = parseApiError(err, 'Não foi possível salvar alocação.');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Objetivos — Carteira</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
  <header class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold">Objetivos financeiros</h1>
      <p class="text-sm opacity-70">
        Divida posições da carteira ativa entre finalidades diferentes.
      </p>
    </div>
    {#if portfolios.length > 0}
      <PortfolioSelect
        {portfolios}
        activeId={activeId}
        disabled={loading || saving}
        on:select={(e) => void handlePortfolioSelect(e.detail)}
      />
    {/if}
  </header>

  <DismissibleAlert message={error} />

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else if snapshot}
    <DivergenceBanner {divergences} />

    <section class="rounded-box bg-base-100 p-4 shadow-sm">
      <p class="mb-3 text-sm">
        Patrimônio da carteira: <strong>{formatBrl(snapshot.patrimony_brl)}</strong>
      </p>
      <ObjectivesPanel
        {objectives}
        selectedId={selectedPartitionAssetId != null ? null : selectedObjectiveId}
        on:select={(e) => handlePanelSelect(e.detail)}
        on:create={openCreateModal}
      />
    </section>

    {#if showSummary && selectedPartitionAssetId == null}
      <ObjectivesSummary
        {snapshot}
        on:selectObjective={(e) => {
          selectedObjectiveId = e.detail;
          selectedPartitionAssetId = null;
        }}
        on:selectPartition={(e) => {
          selectedPartitionAssetId = e.detail;
          selectedObjectiveId = null;
        }}
      />
    {:else if selectedPartition}
      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="btn btn-sm btn-ghost w-fit"
          data-testid="partition-back-resumo"
          on:click={() => {
            selectedPartitionAssetId = null;
            selectedObjectiveId = OBJECTIVES_SUMMARY_TAB_ID;
          }}
        >
          ← Voltar ao resumo
        </button>
        <AssetPartitionDetail partition={selectedPartition} />
      </div>
    {:else}
      <ObjectiveDetail
        objective={selectedObjective}
        {divergences}
        canEdit={true}
        on:addAsset={() => openAllocationModal(null)}
        on:editAllocation={(e) => openAllocationModal(e.detail)}
        on:removeAllocation={(e) => void handleRemoveAllocation(e.detail)}
        on:edit={openRenameModal}
        on:deleteObjective={() => void handleDeleteObjective()}
      />
    {/if}
  {:else}
    <p class="text-sm opacity-70">Crie uma carteira em Cadastro → Carteiras.</p>
  {/if}

  <ObjectiveEditModal
    open={editModalOpen}
    title={editMode === 'create' ? 'Novo objetivo' : 'Renomear objetivo'}
    initialName={editMode === 'rename' ? (selectedObjective?.name ?? '') : ''}
    initialDescription={editMode === 'rename' ? (selectedObjective?.description ?? '') : ''}
    portfolioAssets={portfolioAssets}
    {saving}
    error={editError}
    on:close={() => (editModalOpen = false)}
    on:save={(e) => void handleObjectiveSave(e)}
  />

  <AssetAllocationModal
    open={allocationModalOpen}
    sessionKey={allocationModalSession}
    assets={portfolioAssets}
    objective={selectedObjective?.is_default ? null : selectedObjective}
    editingAllocationId={allocationEditingId}
    {divergences}
    saving={saving}
    error={allocationError}
    on:close={closeAllocationModal}
    on:save={(e) => void handleAllocationSave(e)}
  />
</main>
