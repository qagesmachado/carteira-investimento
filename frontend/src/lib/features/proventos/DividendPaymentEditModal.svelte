<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type {
    DividendPayment,
    DividendPaymentCreate
  } from '$lib/api/dividendPayments';
  import type { Portfolio } from '$lib/api/portfolios';
  import { formatIsoDateToBr } from '$lib/brDate';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import { formatPaymentTypeForDisplay } from '$lib/proventoLabels';

  import DividendPaymentForm from './DividendPaymentForm.svelte';

  export let open = false;
  export let payment: DividendPayment | null = null;
  export let assets: Asset[] = [];
  export let assetsLoading = false;
  export let portfolios: Portfolio[] = [];
  export let activePortfolioId: number | null = null;
  export let loading = false;
  export let onSubmit: (payload: DividendPaymentCreate) => void = () => undefined;
  export let onClose: () => void = () => undefined;

  let dialog: HTMLDialogElement;

  $: if (dialog) {
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }

  function handleDialogClose() {
    onClose();
  }

  function handleCancel() {
    onClose();
  }
</script>

<dialog class="modal" bind:this={dialog} aria-modal="true" on:close={handleDialogClose}>
  <div class="modal-box max-h-[90vh] max-w-2xl overflow-y-auto">
    {#if payment && open}
      <h3 class="text-lg font-bold">
        Editar provento — {formatTickerForDisplay(payment.symbol)}
      </h3>
      <p class="mt-1 text-sm text-base-content/70">
        {payment.asset_name} · {formatPaymentTypeForDisplay(payment.payment_type)} ·
        {formatIsoDateToBr(payment.payment_date)}
      </p>

      <div class="mt-4">
        <DividendPaymentForm
          {assets}
          {assetsLoading}
          {portfolios}
          {activePortfolioId}
          editing={payment}
          {loading}
          onSubmit={onSubmit}
          onCancel={handleCancel}
        />
      </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit" aria-label="Fechar">fechar</button>
  </form>
</dialog>
