<script lang="ts">

  import { onMount } from 'svelte';



  import { parseApiError } from '$lib/api/parseApiError';

  import {

    createFinancingEntry,

    createFinancingEntryTemplate,

    createPropertyFinancing,

    deleteFinancingEntry,

    deleteFinancingEntryTemplate,

    deletePropertyFinancing,

    getPropertyFinancingSnapshot,

    updateFinancingEntry,

    updateFinancingEntryTemplate,

    updatePropertyFinancing,

    type FinancingEntryCreate,

    type FinancingEntryTemplateCreate,

    type PropertyFinancingSnapshot

  } from '$lib/api/propertyFinancings';

  import {

    getActivePortfolioId,

    listPortfolios,

    setActivePortfolioId,

    type Portfolio

  } from '$lib/api/portfolios';

  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';

  import PageHeader from '$lib/components/PageHeader.svelte';
  import PageSection from '$lib/components/PageSection.svelte';

  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';

  import { PORTFOLIO_SELECT_HEADER_TEST_ID } from '$lib/features/ferramentas/headerPortfolioSelect';
  import { resolveActivePortfolioId } from '$lib/features/portfolios/resolveActivePortfolioId';

  import { FINANCING_SUMMARY_TAB_ID } from '$lib/features/ferramentas/financiamento-imovel/constants';

  import FinancingDetail from '$lib/features/ferramentas/financiamento-imovel/FinancingDetail.svelte';

  import FinancingEditModal from '$lib/features/ferramentas/financiamento-imovel/FinancingEditModal.svelte';

  import FinancingPanel from '$lib/features/ferramentas/financiamento-imovel/FinancingPanel.svelte';

  import FinancingSummary from '$lib/features/ferramentas/financiamento-imovel/FinancingSummary.svelte';



  let portfolios: Portfolio[] = [];

  let activeId: number | null = null;

  let snapshot: PropertyFinancingSnapshot | null = null;

  let loading = true;

  let saving = false;

  let error = '';

  let selectedFinancingId: number | null = FINANCING_SUMMARY_TAB_ID;



  let editModalOpen = false;

  let editMode: 'create' | 'edit' = 'create';

  let editError = '';

  let financingDetail: FinancingDetail;



  $: financings = snapshot?.financings ?? [];

  $: showSummary = selectedFinancingId === FINANCING_SUMMARY_TAB_ID;

  $: selectedFinancing =

    !showSummary && selectedFinancingId != null

      ? (financings.find((f) => f.id === selectedFinancingId) ?? null)

      : null;



  async function loadSnapshot(portfolioId: number) {

    loading = true;

    error = '';

    try {

      snapshot = await getPropertyFinancingSnapshot(portfolioId);

      if (

        selectedFinancingId != null &&

        selectedFinancingId !== FINANCING_SUMMARY_TAB_ID &&

        !snapshot.financings.some((f) => f.id === selectedFinancingId)

      ) {

        selectedFinancingId = FINANCING_SUMMARY_TAB_ID;

      }

    } catch (err) {

      snapshot = null;

      error = parseApiError(err, 'Não foi possível carregar financiamentos.');

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

    selectedFinancingId = FINANCING_SUMMARY_TAB_ID;

    await setActivePortfolioId(id);

    await loadSnapshot(id);

  }



  function handlePanelSelect(id: number) {
    selectedFinancingId = id;
  }



  function openCreateModal() {

    editMode = 'create';

    editError = '';

    editModalOpen = true;

  }



  function openEditModal() {

    editMode = 'edit';

    editError = '';

    editModalOpen = true;

  }



  async function handleFinancingSave(

    event: CustomEvent<{

      name: string;

      property_type: import('$lib/api/propertyFinancings').PropertyType;

      description: string;

    }>

  ) {

    if (activeId == null) return;

    saving = true;

    editError = '';

    try {

      if (editMode === 'create') {

        const created = await createPropertyFinancing(activeId, {

          name: event.detail.name,

          property_type: event.detail.property_type,

          description: event.detail.description || null

        });

        editModalOpen = false;

        await loadSnapshot(activeId);

        selectedFinancingId = created.id;

      } else if (selectedFinancing) {

        await updatePropertyFinancing(activeId, selectedFinancing.id, {

          name: event.detail.name,

          property_type: event.detail.property_type,

          description: event.detail.description || null

        });

        editModalOpen = false;

        await loadSnapshot(activeId);

      }

    } catch (err) {

      editError = parseApiError(err, 'Não foi possível salvar imóvel.');

    } finally {

      saving = false;

    }

  }



  async function handleDeleteFinancing() {

    if (activeId == null || !selectedFinancing) return;

    if (!confirm(`Excluir o financiamento «${selectedFinancing.name}»?`)) return;

    saving = true;

    error = '';

    try {

      await deletePropertyFinancing(activeId, selectedFinancing.id);

      selectedFinancingId = FINANCING_SUMMARY_TAB_ID;

      await loadSnapshot(activeId);

    } catch (err) {

      error = parseApiError(err, 'Não foi possível excluir imóvel.');

    } finally {

      saving = false;

    }

  }



  async function handleAddEntry(event: CustomEvent<FinancingEntryCreate>) {

    if (activeId == null || !selectedFinancing) return;

    saving = true;

    error = '';

    try {

      await createFinancingEntry(activeId, selectedFinancing.id, event.detail);

      await loadSnapshot(activeId);

    } catch (err) {

      error = parseApiError(err, 'Não foi possível registrar lançamento.');

    } finally {

      saving = false;

    }

  }



  async function handleUpdateEntry(
    event: CustomEvent<{ entryId: number; amount_brl: number }>
  ) {
    if (activeId == null) return;
    saving = true;
    error = '';
    try {
      await updateFinancingEntry(activeId, event.detail.entryId, {
        amount_brl: event.detail.amount_brl
      });
      await loadSnapshot(activeId);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o valor.');
    } finally {
      saving = false;
    }
  }

  async function handleDeleteEntry(event: CustomEvent<number>) {

    if (activeId == null) return;

    saving = true;

    error = '';

    try {

      await deleteFinancingEntry(activeId, event.detail);

      await loadSnapshot(activeId);

    } catch (err) {

      error = parseApiError(err, 'Não foi possível excluir lançamento.');

    } finally {

      saving = false;

    }

  }

  async function handleCreateTemplate(event: CustomEvent<FinancingEntryTemplateCreate>) {
    if (activeId == null || !selectedFinancing) return;
    saving = true;
    error = '';
    financingDetail?.setTemplateModalError('');
    try {
      await createFinancingEntryTemplate(activeId, selectedFinancing.id, event.detail);
      financingDetail?.closeTemplateModal();
      await loadSnapshot(activeId);
    } catch (err) {
      financingDetail?.setTemplateModalError(
        parseApiError(err, 'Não foi possível salvar o padrão.')
      );
    } finally {
      saving = false;
    }
  }

  async function handleUpdateTemplate(
    event: CustomEvent<{
      templateId: number;
      payload: Partial<FinancingEntryTemplateCreate>;
    }>
  ) {
    if (activeId == null) return;
    saving = true;
    error = '';
    financingDetail?.setTemplateModalError('');
    try {
      await updateFinancingEntryTemplate(
        activeId,
        event.detail.templateId,
        event.detail.payload
      );
      financingDetail?.closeTemplateModal();
      await loadSnapshot(activeId);
    } catch (err) {
      financingDetail?.setTemplateModalError(
        parseApiError(err, 'Não foi possível atualizar o padrão.')
      );
    } finally {
      saving = false;
    }
  }

  async function handleDeleteTemplate(event: CustomEvent<number>) {
    if (activeId == null) return;
    saving = true;
    error = '';
    try {
      await deleteFinancingEntryTemplate(activeId, event.detail);
      financingDetail?.closeTemplateDeleteConfirm();
      await loadSnapshot(activeId);
    } catch (err) {
      financingDetail?.setTemplateModalError(
        parseApiError(err, 'Não foi possível excluir o padrão.')
      );
    } finally {
      saving = false;
    }
  }

</script>



<div class="flex flex-col gap-3">
<PageHeader
  title="Financiamento imóvel"
  subtitle="Registre receitas e despesas por imóvel e acompanhe lucro e capital investido."
>
  <div slot="actions">
    <PortfolioSelect
      testId={PORTFOLIO_SELECT_HEADER_TEST_ID}
      {portfolios}
      {activeId}
      on:select={(e) => void handlePortfolioSelect(e.detail)}
    />
  </div>
</PageHeader>



  {#if error}

    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />

  {/if}



  {#if loading && !snapshot}

    <p class="text-sm opacity-70">Carregando…</p>

  {:else if activeId == null}

    <p class="text-sm opacity-70">Crie uma carteira para usar esta ferramenta.</p>

  {:else if snapshot}

    <PageSection>
      <FinancingPanel
        {financings}
        selectedId={selectedFinancingId}
        on:select={(e) => handlePanelSelect(e.detail)}
        on:create={openCreateModal}
      />
    </PageSection>

    {#if showSummary}
      <PageSection>
        <FinancingSummary
          {snapshot}
          on:selectFinancing={(e) => handlePanelSelect(e.detail)}
        />
      </PageSection>
    {:else if selectedFinancing}
      <PageSection>
        <FinancingDetail
          bind:this={financingDetail}
          financing={selectedFinancing}
          {saving}
          on:edit={openEditModal}
          on:delete={() => void handleDeleteFinancing()}
          on:addEntry={(e) => void handleAddEntry(e)}
          on:updateEntry={(e) => void handleUpdateEntry(e)}
          on:deleteEntry={(e) => void handleDeleteEntry(e)}
          on:createTemplate={(e) => void handleCreateTemplate(e)}
          on:updateTemplate={(e) => void handleUpdateTemplate(e)}
          on:deleteTemplate={(e) => void handleDeleteTemplate(e)}
        />
      </PageSection>
    {/if}

  {/if}

</div>

<FinancingEditModal

  open={editModalOpen}

  title={editMode === 'create' ? 'Novo imóvel' : 'Editar imóvel'}

  initial={editMode === 'edit' ? selectedFinancing : null}

  {saving}

  error={editError}

  on:close={() => (editModalOpen = false)}

  on:save={(e) => void handleFinancingSave(e)}

/>

