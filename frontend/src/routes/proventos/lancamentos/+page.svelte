<script lang="ts">
  import type {
    DividendPayment,
    DividendPaymentCreate,
    DividendPaymentListParams
  } from '$lib/api/dividendPayments';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import { NO_PORTFOLIO_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import DividendPaymentEditModal from '$lib/features/proventos/DividendPaymentEditModal.svelte';
  import DividendPaymentList from '$lib/features/proventos/DividendPaymentList.svelte';
  import { proventosStore, selectHasNoPortfolio } from '$lib/features/proventos/proventosStore';

  let editingPayment: DividendPayment | null = null;
  let editModalOpen = false;

  $: state = $proventosStore;
  $: hasNoPortfolio = selectHasNoPortfolio(state);

  // A carteira é controlada pelo painel no topo da seção (store); a lista apenas reflete.
  $: portfolioFilter = typeof state.portfolioFilter === 'number' ? state.portfolioFilter : '';

  async function handleServerFiltersChange(filters: DividendPaymentListParams) {
    await proventosStore.setServerFilters(filters);
  }

  function handleEdit(payment: DividendPayment) {
    editingPayment = payment;
    editModalOpen = true;
    proventosStore.setError('');
    proventosStore.setMessage('');
  }

  function closeEditModal() {
    editModalOpen = false;
    editingPayment = null;
  }

  async function handleUpdate(payload: DividendPaymentCreate) {
    if (!editingPayment) {
      return;
    }
    const ok = await proventosStore.updatePayment(editingPayment.id, payload);
    if (ok) {
      closeEditModal();
    }
  }

  async function handleDelete(payment: DividendPayment) {
    if (!confirm(`Remover provento de ${payment.symbol} em ${payment.payment_date}?`)) {
      return;
    }
    if (editingPayment?.id === payment.id) {
      closeEditModal();
    }
    await proventosStore.remove(payment.id);
  }
</script>

<svelte:head>
  <title>Proventos — Lançamentos</title>
</svelte:head>

<div class="flex flex-col gap-3" data-testid="proventos-lancamentos">
  {#if hasNoPortfolio}
    <EmptyStateCallout {...NO_PORTFOLIO_EMPTY_STATE} testId="proventos-lancamentos-sem-carteira" />
  {:else}
    <DividendPaymentList
      payments={state.payments}
      portfolios={state.portfolios}
      {portfolioFilter}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onServerFiltersChange={handleServerFiltersChange}
    />

    <DividendPaymentEditModal
      bind:open={editModalOpen}
      payment={editingPayment}
      assets={state.assets}
      assetsLoading={state.assetsLoading}
      portfolios={state.portfolios}
      activePortfolioId={state.activePortfolioId}
      loading={state.loading}
      onSubmit={handleUpdate}
      onClose={closeEditModal}
    />
  {/if}
</div>
