<script lang="ts">
  import { onMount } from 'svelte';

  import { parseApiError } from '$lib/api/parseApiError';
  import {
    createManualPatrimonyItem,
    deleteManualPatrimonyItem,
    getPatrimonyControlSnapshot,
    updateManualPatrimonyItem,
    type ManualPatrimonyCategory,
    type ManualPatrimonyItem,
    type PatrimonyControlSnapshot
  } from '$lib/api/patrimonyControl';
  import {
    getActivePortfolioId,
    listPortfolios,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { PORTFOLIO_SELECT_HEADER_TEST_ID } from '$lib/features/ferramentas/headerPortfolioSelect';
  import InvestedPortfolioBlock from '$lib/features/ferramentas/controle-patrimonio/InvestedPortfolioBlock.svelte';
  import ManualPatrimonyFormModal from '$lib/features/ferramentas/controle-patrimonio/ManualPatrimonyFormModal.svelte';
  import ManualPatrimonySection from '$lib/features/ferramentas/controle-patrimonio/ManualPatrimonySection.svelte';
  import PatrimonyControlSummary from '$lib/features/ferramentas/controle-patrimonio/PatrimonyControlSummary.svelte';
  import {
    parseAmountBrl,
    type ManualPatrimonyFormValues
  } from '$lib/features/ferramentas/controle-patrimonio/patrimonyControlForm';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { resolveActivePortfolioId } from '$lib/features/portfolios/resolveActivePortfolioId';

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let snapshot: PatrimonyControlSnapshot | null = null;
  let loading = true;
  let saving = false;
  let error = '';

  let formOpen = false;
  let formCategory: ManualPatrimonyCategory = 'emergency_reserve';
  let editingItem: ManualPatrimonyItem | null = null;
  let formError = '';

  $: emergencyItems =
    snapshot?.manual_items.filter((item) => item.category === 'emergency_reserve') ?? [];

  async function loadSnapshot(portfolioId: number) {
    loading = true;
    error = '';
    try {
      snapshot = await getPatrimonyControlSnapshot(portfolioId);
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar o controle de patrimônio.');
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
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
      loading = false;
    }
  }

  async function handlePortfolioChange(portfolioId: number) {
    activeId = portfolioId;
    await setActivePortfolioId(portfolioId);
    await loadSnapshot(portfolioId);
  }

  function openCreateForm(category: ManualPatrimonyCategory) {
    formCategory = category;
    editingItem = null;
    formError = '';
    formOpen = true;
  }

  function openEditForm(item: ManualPatrimonyItem) {
    formCategory = item.category;
    editingItem = item;
    formError = '';
    formOpen = true;
  }

  function closeForm() {
    formOpen = false;
    editingItem = null;
    formError = '';
  }

  async function handleSaveForm(event: CustomEvent<ManualPatrimonyFormValues>) {
    if (activeId == null) {
      return;
    }
    saving = true;
    formError = '';
    const values = event.detail;
    const payload = {
      category: values.category,
      name: values.name.trim(),
      amount_brl: parseAmountBrl(values.amount_brl),
      location: values.category === 'emergency_reserve' ? values.location : null,
      notes: values.notes.trim() || null
    };
    try {
      if (editingItem) {
        await updateManualPatrimonyItem(activeId, editingItem.id, payload);
      } else {
        await createManualPatrimonyItem(activeId, payload);
      }
      closeForm();
      await loadSnapshot(activeId);
    } catch (err) {
      formError = parseApiError(err, 'Não foi possível salvar o item.');
    } finally {
      saving = false;
    }
  }

  async function handleDeleteItem(item: ManualPatrimonyItem) {
    if (activeId == null) {
      return;
    }
    if (!confirm(`Excluir «${item.name}»?`)) {
      return;
    }
    saving = true;
    error = '';
    try {
      await deleteManualPatrimonyItem(activeId, item.id);
      await loadSnapshot(activeId);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir o item.');
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    void loadPage();
  });
</script>

<svelte:head>
  <title>Controle de patrimônio · Ferramentas</title>
</svelte:head>

<div class="space-y-6">
  <PageHeader
    title="Controle de patrimônio"
    subtitle="Patrimônio investido (automático) e reserva de emergência manual (banco, corretora ou dinheiro em espécie). Distinto dos objetivos financeiros, que particionam posições já investidas."
  >
    <div slot="actions">
      <PortfolioSelect
        testId={PORTFOLIO_SELECT_HEADER_TEST_ID}
        portfolios={portfolios}
        activeId={activeId}
        disabled={loading || saving}
        on:select={(event) => handlePortfolioChange(event.detail)}
      />
    </div>
  </PageHeader>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else if activeId == null}
    <p class="text-sm opacity-70">Crie uma carteira em Cadastro para começar.</p>
  {:else if snapshot}
    <PatrimonyControlSummary {snapshot} />
    <InvestedPortfolioBlock investedPortfolioBrl={snapshot.invested_portfolio_brl} />
    <ManualPatrimonySection
      category="emergency_reserve"
      items={emergencyItems}
      linkedItems={snapshot.linked_emergency_reserve_items ?? []}
      emergencyTotalBrl={snapshot.total_emergency_reserve_brl}
      on:add={(event) => openCreateForm(event.detail.category)}
      on:edit={(event) => openEditForm(event.detail)}
      on:delete={(event) => handleDeleteItem(event.detail)}
    />
  {/if}
</div>

<ManualPatrimonyFormModal
  open={formOpen}
  category={formCategory}
  initial={editingItem}
  saving={saving}
  error={formError}
  on:close={closeForm}
  on:save={handleSaveForm}
/>
