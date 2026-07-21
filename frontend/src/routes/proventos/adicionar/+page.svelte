<script lang="ts">
  import type { DividendPaymentCreate } from '$lib/api/dividendPayments';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import DividendBulkImport from '$lib/features/proventos/DividendBulkImport.svelte';
  import DividendPaymentForm from '$lib/features/proventos/DividendPaymentForm.svelte';
  import { proventosStore } from '$lib/features/proventos/proventosStore';
  import { PROVENTOS_NEW_PAYMENT_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  let formComponent: DividendPaymentForm;

  $: state = $proventosStore;

  async function handleCreate(payload: DividendPaymentCreate) {
    const ok = await proventosStore.create(payload);
    if (ok) {
      formComponent?.clearForm();
    }
  }

  async function handleBulkSaved() {
    await proventosStore.refreshPayments();
  }
</script>

<svelte:head>
  <title>Proventos — Adicionar</title>
</svelte:head>

<div class="flex flex-col gap-3" data-testid="proventos-adicionar">
  {#if !state.assetsLoading && state.assets.length === 0 && !state.assetsError}
    <div class="alert">
      <span>
        Não há ativos no catálogo. Cadastre em
        <a class="link link-primary" href="/assets">Ativos</a>
        ou execute <code class="text-xs">npm run db:seed</code> na raiz do projeto.
      </span>
    </div>
  {/if}

  <PageSection class="overflow-visible" testId="proventos-form-section">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={PROVENTOS_NEW_PAYMENT_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Novo provento</h2>
    </div>
    <DividendPaymentForm
      bind:this={formComponent}
      assets={state.assets}
      assetsLoading={state.assetsLoading}
      portfolios={state.portfolios}
      activePortfolioId={state.activePortfolioId}
      loading={state.loading}
      onSubmit={handleCreate}
    />
  </PageSection>

  <DividendBulkImport
    activePortfolioId={state.activePortfolioId}
    onSaved={handleBulkSaved}
  />
</div>
