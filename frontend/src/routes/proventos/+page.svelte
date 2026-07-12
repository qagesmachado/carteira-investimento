<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
  import {
    createDividendPayment,
    deleteDividendPayment,
    listDividendPayments,
    updateDividendPayment,
    type DividendPayment,
    type DividendPaymentCreate,
    type DividendPaymentListParams
  } from '$lib/api/dividendPayments';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import DividendPaymentForm from '$lib/features/proventos/DividendPaymentForm.svelte';
  import DividendPaymentEditModal from '$lib/features/proventos/DividendPaymentEditModal.svelte';
  import DividendPaymentList from '$lib/features/proventos/DividendPaymentList.svelte';

  let assets: Asset[] = [];
  let assetsLoading = true;
  let assetsError = '';
  let payments: DividendPayment[] = [];
  let paymentsError = '';
  let portfolios: Portfolio[] = [];
  let activePortfolioId: number | null = null;
  let editingPayment: DividendPayment | null = null;
  let editModalOpen = false;
  let message = '';
  let error = '';
  let loading = false;
  let serverFilters: DividendPaymentListParams = {};
  let portfolioFilter: number | '' = '';

  let formComponent: DividendPaymentForm;

  async function refreshPayments() {
    paymentsError = '';
    payments = await listDividendPayments(serverFilters);
  }

  async function loadAssets() {
    assetsLoading = true;
    assetsError = '';
    try {
      assets = await listAssets();
    } catch (err) {
      assets = [];
      assetsError = parseApiError(
        err,
        'Não foi possível carregar a base de ativos. Verifique se o backend está em execução (porta 8000).'
      );
    } finally {
      assetsLoading = false;
    }
  }

  async function loadInitialData() {
    assetsLoading = true;
    assetsError = '';
    paymentsError = '';

    const [assetsResult, portfoliosResult, activeResult] = await Promise.allSettled([
      listAssets(),
      listPortfolios(),
      getActivePortfolioId()
    ]);

    if (assetsResult.status === 'fulfilled') {
      assets = assetsResult.value;
    } else {
      assets = [];
      assetsError = parseApiError(
        assetsResult.reason,
        'Não foi possível carregar a base de ativos. Verifique se o backend está em execução (porta 8000).'
      );
    }
    assetsLoading = false;

    if (portfoliosResult.status === 'fulfilled') {
      portfolios = portfoliosResult.value;
    } else {
      portfolios = [];
    }
    if (activeResult.status === 'fulfilled') {
      activePortfolioId = activeResult.value;
    } else {
      activePortfolioId = null;
    }

    if (activePortfolioId != null && portfolios.some((p) => p.id === activePortfolioId)) {
      portfolioFilter = activePortfolioId;
      serverFilters = { ...serverFilters, portfolio_id: activePortfolioId };
    }

    try {
      payments = await listDividendPayments(serverFilters);
    } catch (err) {
      payments = [];
      paymentsError = parseApiError(
        err,
        'Não foi possível carregar os proventos. Reinicie o backend se a tabela de proventos ainda não existir.'
      );
    }
  }

  onMount(() => {
    void loadInitialData();
  });

  async function handleServerFiltersChange(filters: DividendPaymentListParams) {
    serverFilters = filters;
    try {
      await refreshPayments();
    } catch {
      error = 'Não foi possível aplicar os filtros.';
    }
  }

  async function handleCreate(payload: DividendPaymentCreate) {
    loading = true;
    error = '';
    message = '';
    try {
      await createDividendPayment(payload);
      await refreshPayments();
      formComponent?.clearForm();
      message = 'Provento cadastrado.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível cadastrar o provento.');
    } finally {
      loading = false;
    }
  }

  async function handleUpdate(payload: DividendPaymentCreate) {
    if (!editingPayment) {
      return;
    }
    loading = true;
    error = '';
    message = '';
    try {
      await updateDividendPayment(editingPayment.id, payload);
      await refreshPayments();
      closeEditModal();
      message = 'Provento atualizado.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o provento.');
    } finally {
      loading = false;
    }
  }

  function handleEdit(payment: DividendPayment) {
    editingPayment = payment;
    editModalOpen = true;
    error = '';
    message = '';
  }

  function closeEditModal() {
    editModalOpen = false;
    editingPayment = null;
  }

  async function handleDelete(payment: DividendPayment) {
    if (!confirm(`Remover provento de ${payment.symbol} em ${payment.payment_date}?`)) {
      return;
    }
    loading = true;
    error = '';
    message = '';
    try {
      await deleteDividendPayment(payment.id);
      if (editingPayment?.id === payment.id) {
        closeEditModal();
      }
      await refreshPayments();
      message = 'Provento removido.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível remover o provento.');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Proventos — Carteira de Investimentos</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
<AppPageShell paddingY="py-4" class="flex flex-col gap-3">
  <PageHero
    title="Proventos"
    subtitle="Cadastre dividendos, JCP e outros proventos recebidos por ativo."
    variant="primary"
  />

  {#if !assetsLoading}
    <p class="text-sm text-base-content/60">
      {#if assetsError}
        Catálogo de ativos indisponível.
      {:else}
        {assets.length} ativo{assets.length === 1 ? '' : 's'} no catálogo ·
        {payments.length} provento{payments.length === 1 ? '' : 's'} cadastrado{payments.length === 1 ? '' : 's'}
      {/if}
    </p>
  {/if}

  {#if message}
    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
  {/if}
  {#if assetsError}
    <div class="flex flex-col gap-2">
      <DismissibleAlert text={assetsError} variant="error" on:dismiss={() => (assetsError = '')} />
      <button class="btn btn-outline btn-sm w-fit" type="button" on:click={() => void loadAssets()}>
        Tentar carregar ativos novamente
      </button>
    </div>
  {/if}
  {#if paymentsError}
    <DismissibleAlert
      text={paymentsError}
      variant="error"
      on:dismiss={() => (paymentsError = '')}
    />
  {/if}
  {#if error}
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  {/if}

  {#if !assetsLoading && assets.length === 0 && !assetsError}
    <div class="alert">
      <span>
        Não há ativos no catálogo. Cadastre em
        <a class="link link-primary" href="/assets">Ativos</a>
        ou execute <code class="text-xs">npm run db:seed</code> na raiz do projeto.
      </span>
    </div>
  {/if}

  <PageSection class="overflow-visible">
      <DividendPaymentForm
        bind:this={formComponent}
        {assets}
        {assetsLoading}
        {portfolios}
        {activePortfolioId}
        loading={loading}
        onSubmit={handleCreate}
      />
  </PageSection>

  <DividendPaymentList
    {payments}
    {portfolios}
    bind:portfolioFilter
    onEdit={handleEdit}
    onDelete={handleDelete}
    onServerFiltersChange={handleServerFiltersChange}
  />

  <DividendPaymentEditModal
    bind:open={editModalOpen}
    payment={editingPayment}
    {assets}
    {assetsLoading}
    {portfolios}
    {activePortfolioId}
    {loading}
    onSubmit={handleUpdate}
    onClose={closeEditModal}
  />
</AppPageShell>
</main>
