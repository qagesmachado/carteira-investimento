<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import {
    createPortfolio,
    deletePortfolio,
    listPortfolioSummaries,
    listPortfolios,
    setActivePortfolioId,
    updatePortfolio,
    type Portfolio,
    type PortfolioCreate,
    type PortfolioSummary,
    type PortfolioUpdate
  } from '$lib/api/portfolios';
  import { parseApiError } from '$lib/api/parseApiError';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import { PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS } from '$lib/layout/pageVisual';
  import CreatePortfolioModal from '$lib/features/portfolios/CreatePortfolioModal.svelte';
  import EditPortfolioModal from '$lib/features/portfolios/EditPortfolioModal.svelte';
  import PortfolioHubCard from '$lib/features/portfolios/PortfolioHubCard.svelte';
  import { confirmPortfolioDelete } from '$lib/features/portfolios/portfolioDelete';

  let portfolios: Portfolio[] = [];
  let summaries: PortfolioSummary[] = [];
  let loading = true;
  let creating = false;
  let savingEdit = false;
  let createModalOpen = false;
  let editModalOpen = false;
  let editingPortfolio: Portfolio | null = null;
  let message = '';
  let error = '';

  $: summaryByPortfolioId = Object.fromEntries(
    summaries.map((summary) => [summary.portfolio_id, summary])
  );

  async function loadHub() {
    loading = true;
    error = '';
    try {
      [portfolios, summaries] = await Promise.all([listPortfolios(), listPortfolioSummaries()]);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
    } finally {
      loading = false;
    }
  }

  function openCreateModal() {
    error = '';
    createModalOpen = true;
  }

  async function handleCreatePortfolio(payload: PortfolioCreate) {
    creating = true;
    error = '';
    try {
      const created = await createPortfolio(payload);
      await setActivePortfolioId(created.id);
      createModalOpen = false;
      await goto(`/portfolios/${created.id}`);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível criar a carteira.');
      throw err;
    } finally {
      creating = false;
    }
  }

  async function openPortfolio(portfolioId: number) {
    error = '';
    try {
      await setActivePortfolioId(portfolioId);
      await goto(`/portfolios/${portfolioId}`);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível abrir a carteira.');
    }
  }

  function openEditModal(portfolio: Portfolio) {
    error = '';
    editingPortfolio = portfolio;
    editModalOpen = true;
  }

  async function handleSavePortfolioEdit(payload: PortfolioUpdate) {
    if (!editingPortfolio) {
      return;
    }
    savingEdit = true;
    error = '';
    try {
      await updatePortfolio(editingPortfolio.id, payload);
      editModalOpen = false;
      editingPortfolio = null;
      message = 'Carteira atualizada.';
      await loadHub();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar a carteira.');
      throw err;
    } finally {
      savingEdit = false;
    }
  }

  async function handleDeletePortfolio(portfolio: Portfolio) {
    if (!confirmPortfolioDelete(portfolio.name)) {
      return;
    }
    error = '';
    try {
      const wasActive = summaryByPortfolioId[portfolio.id]?.is_active ?? false;
      await deletePortfolio(portfolio.id, { cascade: true });
      await loadHub();
      if (wasActive && portfolios.length > 0) {
        await setActivePortfolioId(portfolios[0].id);
        await loadHub();
      }
      message = 'Carteira excluída.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a carteira.');
    }
  }

  onMount(() => {
    void loadHub();
  });
</script>

<svelte:head>
  <title>Carteiras</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-4" class="flex w-full min-w-0 flex-col gap-3">
    <PageHero
      title="Carteiras"
      subtitle="Visão geral das suas carteiras e patrimônio aplicado."
      variant="dashboard"
    >
      <svelte:fragment slot="actions">
        <button
          class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
          type="button"
          disabled={loading || creating}
          data-testid="portfolio-hub-new"
          on:click={openCreateModal}
        >
          Nova carteira
        </button>
      </svelte:fragment>
    </PageHero>

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    {#if loading}
      <p class="text-sm text-base-content/60">Carregando carteiras…</p>
    {:else if portfolios.length === 0}
      <div class="card bg-base-100 shadow">
        <div class="card-body items-start gap-4">
          <h2 class="card-title">Nenhuma carteira ainda</h2>
          <p class="text-sm text-base-content/70">
            Crie sua primeira carteira escolhendo perfil de investidor e objetivo. Depois você
            adiciona os ativos na tela de posições.
          </p>
          <button class="btn btn-primary" type="button" on:click={openCreateModal}>
            Criar primeira carteira
          </button>
        </div>
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {#each portfolios as portfolio (portfolio.id)}
          <PortfolioHubCard
            {portfolio}
            summary={summaryByPortfolioId[portfolio.id]}
            onOpen={() => openPortfolio(portfolio.id)}
            onEdit={() => openEditModal(portfolio)}
            onDelete={() => handleDeletePortfolio(portfolio)}
          />
        {/each}
      </div>
    {/if}
  </AppPageShell>

  <CreatePortfolioModal
    bind:open={createModalOpen}
    loading={creating}
    onClose={() => (createModalOpen = false)}
    onCreate={handleCreatePortfolio}
  />

  <EditPortfolioModal
    bind:open={editModalOpen}
    portfolio={editingPortfolio}
    loading={savingEdit}
    onClose={() => {
      editingPortfolio = null;
    }}
    onSave={handleSavePortfolioEdit}
  />
</main>
