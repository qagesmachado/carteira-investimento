<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    addPensionYear,
    createObjective,
    deleteObjective,
    deletePensionYear,
    getObjectivesSnapshot,
    replaceObjectiveAllocations,
    updateObjective,
    updatePensionYear,
    type ObjectivesSnapshot,
    type Objective,
    type ObjectiveAllocationItem,
    type ObjectiveMode
  } from '$lib/api/objetivos';
  import {
    getActivePortfolioId,
    listPortfolios,
    listPositions,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { PORTFOLIO_SELECT_HEADER_TEST_ID } from '$lib/features/ferramentas/headerPortfolioSelect';
  import { resolveActivePortfolioId } from '$lib/features/portfolios/resolveActivePortfolioId';
  import AssetAllocationModal from '$lib/features/objetivos/AssetAllocationModal.svelte';
  import AssetPartitionDetail from '$lib/features/objetivos/AssetPartitionDetail.svelte';
  import DivergenceBanner from '$lib/features/objetivos/DivergenceBanner.svelte';
  import { OBJECTIVES_SUMMARY_TAB_ID } from '$lib/features/objetivos/constants';
  import { isUserVisibleObjective } from '$lib/features/objetivos/objectiveVisibility';
  import { sortPensionYears } from '$lib/features/objetivos/sortPensionYears';
  import ObjectiveDetail from '$lib/features/objetivos/ObjectiveDetail.svelte';
  import ObjectiveEditModal from '$lib/features/objetivos/ObjectiveEditModal.svelte';
  import PensionContributionDetail from '$lib/features/objetivos/PensionContributionDetail.svelte';
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
  let selectedPensionYear: number | null = null;
  let pensionDetail: PensionContributionDetail | undefined;

  let editModalOpen = false;
  let editMode: 'create' | 'rename' = 'create';
  let editError = '';

  let allocationModalOpen = false;
  let allocationEditingId: number | null = null;
  let allocationModalSession = 0;
  let allocationError = '';
  let pensionError = '';

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
  $: isPensionObjective = selectedObjective?.mode === 'pension_contribution';
  $: if (isPensionObjective && selectedObjective?.pension_contribution) {
    const years = sortPensionYears(selectedObjective.pension_contribution.years);
    if (
      years.length > 0 &&
      (selectedPensionYear == null ||
        !years.some((row) => row.plan_year === selectedPensionYear))
    ) {
      selectedPensionYear = years[0].plan_year;
    }
  }

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
      const storedActiveId = await getActivePortfolioId();
      activeId = resolveActivePortfolioId(storedActiveId, portfolios);
      if (activeId != null) {
        await loadSnapshot(activeId);
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
    if (id !== OBJECTIVES_SUMMARY_TAB_ID) {
      const objective = objectives.find((o) => o.id === id);
      if (objective?.mode === 'pension_contribution') {
        const years = sortPensionYears(objective.pension_contribution?.years ?? []);
        selectedPensionYear = years[0]?.plan_year ?? new Date().getFullYear();
      } else {
        selectedPensionYear = null;
      }
    }
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
      mode: ObjectiveMode;
      partitionAssetId: number | null;
      planYear: number;
      annualGrossIncomeBrl: number | null;
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
            event.detail.mode === 'single_asset' ? event.detail.partitionAssetId : null,
          plan_year:
            event.detail.mode === 'pension_contribution' ? event.detail.planYear : undefined,
          annual_gross_income_brl:
            event.detail.mode === 'pension_contribution'
              ? event.detail.annualGrossIncomeBrl
              : undefined
        });
        selectedObjectiveId = created.id;
        selectedPartitionAssetId = null;
        if (created.mode === 'pension_contribution') {
          const years = sortPensionYears(created.pension_contribution?.years ?? []);
          selectedPensionYear = years[0]?.plan_year ?? event.detail.planYear;
        }
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

  async function handlePensionSave(
    event: CustomEvent<{
      planYear: number;
      annualGrossIncomeBrl: number | null;
      contributedYtdBrl: number;
    }>
  ) {
    if (activeId == null || !selectedObjective || selectedObjective.mode !== 'pension_contribution') {
      return;
    }
    saving = true;
    pensionError = '';
    try {
      await updatePensionYear(activeId, selectedObjective.id, event.detail.planYear, {
        annual_gross_income_brl: event.detail.annualGrossIncomeBrl,
        contributed_ytd_brl: event.detail.contributedYtdBrl
      });
      selectedPensionYear = event.detail.planYear;
      pensionDetail?.closeEditModalAfterSave();
      await loadSnapshot(activeId);
    } catch (err) {
      pensionError = parseApiError(err, 'Não foi possível salvar dados previdenciários.');
    } finally {
      saving = false;
    }
  }

  async function handlePensionAddYear(
    event: CustomEvent<{ planYear: number; annualGrossIncomeBrl: number | null }>
  ) {
    if (activeId == null || !selectedObjective || selectedObjective.mode !== 'pension_contribution') {
      return;
    }
    saving = true;
    pensionError = '';
    try {
      await addPensionYear(activeId, selectedObjective.id, {
        plan_year: event.detail.planYear,
        annual_gross_income_brl: event.detail.annualGrossIncomeBrl
      });
      selectedPensionYear = event.detail.planYear;
      await loadSnapshot(activeId);
    } catch (err) {
      pensionError = parseApiError(err, 'Não foi possível adicionar ano previdenciário.');
    } finally {
      saving = false;
    }
  }

  async function handlePensionDeleteYear(planYear: number) {
    if (activeId == null || !selectedObjective || selectedObjective.mode !== 'pension_contribution') {
      return;
    }
    if (!confirm(`Excluir o ano ${planYear} deste objetivo previdência?`)) {
      return;
    }
    saving = true;
    pensionError = '';
    try {
      const updated = await deletePensionYear(activeId, selectedObjective.id, planYear);
      const years = sortPensionYears(updated.pension_contribution?.years ?? []);
      selectedPensionYear = years[0]?.plan_year ?? null;
      pensionDetail?.closeEditModalAfterSave();
      await loadSnapshot(activeId);
    } catch (err) {
      pensionError = parseApiError(err, 'Não foi possível excluir ano previdenciário.');
    } finally {
      saving = false;
    }
  }

  async function handleDeleteObjective() {
    if (activeId == null || !selectedObjective || selectedObjective.is_default) return;
    if (!confirm(`Excluir objetivo «${selectedObjective.name}»?${selectedObjective.mode === 'pension_contribution' ? '' : ' Alocações voltam ao Livre.'}`)) {
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
    const base = {
      slice_name: row.slice_name,
      asset_id: row.asset_id,
      exclude_from_rebalance: row.exclude_from_rebalance,
      is_emergency_reserve: row.is_emergency_reserve
    };
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

<div class="flex w-full flex-col gap-3">
  <PageHeader
    title="Objetivos financeiros"
    subtitle="Divida posições da carteira ativa entre finalidades diferentes."
  >
    <div slot="actions">
      <PortfolioSelect
        testId={PORTFOLIO_SELECT_HEADER_TEST_ID}
        {portfolios}
        activeId={activeId}
        disabled={loading || saving}
        on:select={(e) => void handlePortfolioSelect(e.detail)}
      />
    </div>
  </PageHeader>

  <DismissibleAlert message={error} />

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else if snapshot}
    <DivergenceBanner {divergences} />

    <PageSection>
      <p class="mb-3 text-sm">
        Patrimônio da carteira: <strong>{formatBrl(snapshot.patrimony_brl)}</strong>
      </p>
      <ObjectivesPanel
        {objectives}
        selectedId={selectedPartitionAssetId != null ? null : selectedObjectiveId}
        on:select={(e) => handlePanelSelect(e.detail)}
        on:create={openCreateModal}
      />
    </PageSection>

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
    {:else if isPensionObjective}
      <PensionContributionDetail
        bind:this={pensionDetail}
        objective={selectedObjective}
        selectedYear={selectedPensionYear}
        {saving}
        error={pensionError}
        on:edit={openRenameModal}
        on:deleteObjective={() => void handleDeleteObjective()}
        on:selectYear={(e) => (selectedPensionYear = e.detail)}
        on:addYear={(e) => void handlePensionAddYear(e)}
        on:deleteYear={(e) => void handlePensionDeleteYear(e.detail)}
        on:save={(e) => void handlePensionSave(e)}
      />
    {:else}
      <ObjectiveDetail
        objective={selectedObjective}
        {divergences}
        portfolioId={activeId}
        canEdit={true}
        on:addAsset={() => openAllocationModal(null)}
        on:editAllocation={(e) => openAllocationModal(e.detail)}
        on:removeAllocation={(e) => void handleRemoveAllocation(e.detail)}
        on:edit={openRenameModal}
        on:deleteObjective={() => void handleDeleteObjective()}
        on:purposeUpdated={() => activeId != null && void loadSnapshot(activeId)}
      />
    {/if}
  {:else}
    <p class="text-sm opacity-70">Crie uma carteira em Cadastro → Carteiras.</p>
  {/if}

  <ObjectiveEditModal
    open={editModalOpen}
    renameOnly={editMode === 'rename'}
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
</div>
