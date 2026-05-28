<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type {
    DividendPayment,
    DividendPaymentCreate
  } from '$lib/api/dividendPayments';
  import type { Portfolio } from '$lib/api/portfolios';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import {
    formatIsoDateToBr,
    parseBrDateToIso,
    sanitizeBrDateTyping
  } from '$lib/brDate';
  import AssetPicker from '$lib/features/portfolios/AssetPicker.svelte';
  import {
    formatPaymentTypeForDisplay,
    paymentTypeOptions,
    type DividendPaymentType
  } from '$lib/proventoLabels';

  export let assets: Asset[] = [];
  export let assetsLoading = false;
  export let portfolios: Portfolio[] = [];
  export let activePortfolioId: number | null = null;
  export let editing: DividendPayment | null = null;
  export let loading = false;
  export let onSubmit: (payload: DividendPaymentCreate) => void = () => undefined;
  export let onCancel: () => void = () => undefined;

  let assetId: number | '' = '';
  let portfolioId: number | '' = '';
  let paymentType: DividendPaymentType = 'dividend';
  let paymentDateBr = '';
  let amountValue = 0;
  let currency = 'BRL';
  let notes = '';
  let companyCnpj = '';
  let payerCnpj = '';
  let payerName = '';
  let formError = '';

  let loadedEditingId: number | null = null;
  let portfolioDefaultApplied = false;
  let amountInput: BrDecimalInput;

  $: if (assetId !== '' && formError === 'Selecione um ativo.') {
    formError = '';
  }

  $: if (portfolioId !== '' && formError === 'Selecione uma carteira.') {
    formError = '';
  }

  $: if (editing && editing.id !== loadedEditingId) {
    loadedEditingId = editing.id;
    assetId = editing.asset_id;
    portfolioId = editing.portfolio_id ?? '';
    paymentType = editing.payment_type;
    paymentDateBr = formatIsoDateToBr(editing.payment_date);
    amountValue = editing.amount;
    currency = editing.currency;
    notes = editing.notes ?? '';
    companyCnpj = editing.company_cnpj ?? '';
    payerCnpj = editing.payer_cnpj ?? '';
    payerName = editing.payer_name ?? '';
    formError = '';
    portfolioDefaultApplied = true;
  }

  $: if (!editing) {
    loadedEditingId = null;
  }

  $: if (
    !editing &&
    !portfolioDefaultApplied &&
    portfolioId === '' &&
    activePortfolioId != null &&
    portfolios.some((p) => p.id === activePortfolioId)
  ) {
    portfolioId = activePortfolioId;
    portfolioDefaultApplied = true;
  }

  $: selectedAsset =
    assetId !== '' ? (assets.find((a) => a.id === Number(assetId)) ?? null) : null;

  $: if (selectedAsset && !editing) {
    currency = selectedAsset.currency;
  }

  function handlePaymentDateInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    paymentDateBr = sanitizeBrDateTyping(target.value);
    target.value = paymentDateBr;
    formError = '';
  }

  function blurNormalizePaymentDate() {
    const iso = parseBrDateToIso(paymentDateBr);
    if (iso) {
      paymentDateBr = formatIsoDateToBr(iso);
    }
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    formError = '';

    if (assetId === '') {
      formError = 'Selecione um ativo.';
      return;
    }

    if (portfolioId === '') {
      formError = 'Selecione uma carteira.';
      return;
    }

    const paymentDateIso = parseBrDateToIso(paymentDateBr);
    if (!paymentDateIso) {
      formError = 'Data de recebimento inválida. Use DD/MM/AAAA (ex.: 15/05/2026).';
      return;
    }

    if (!amountInput?.flush()) {
      formError = 'Valor inválido. Use vírgula para decimais (ex.: 1,10 ou 1.234,56).';
      return;
    }

    if (amountValue <= 0) {
      formError = 'Informe um valor maior que zero.';
      return;
    }

    onSubmit({
      asset_id: Number(assetId),
      portfolio_id: Number(portfolioId),
      payment_type: paymentType,
      payment_date: paymentDateIso,
      amount: amountValue,
      currency: currency.trim() || 'BRL',
      notes: notes.trim() || null,
      company_cnpj: companyCnpj.trim() || null,
      payer_cnpj: payerCnpj.trim() || null,
      payer_name: payerName.trim() || null
    });
  }

  function resetForCreate() {
    assetId = '';
    portfolioId = activePortfolioId != null && portfolios.some((p) => p.id === activePortfolioId)
      ? activePortfolioId
      : '';
    portfolioDefaultApplied = portfolioId !== '';
    paymentType = 'dividend';
    paymentDateBr = '';
    amountValue = 0;
    currency = 'BRL';
    notes = '';
    companyCnpj = '';
    payerCnpj = '';
    payerName = '';
    formError = '';
  }

  export function clearForm() {
    resetForCreate();
  }
</script>

<form class="space-y-4" on:submit={handleSubmit}>
  {#if !editing}
    <p class="text-sm font-semibold uppercase tracking-wide text-primary">Novo provento</p>
  {/if}

  {#if formError}
    <p class="text-sm text-error" role="alert">{formError}</p>
  {/if}

  <label class="form-control">
    <span class="label">
      <span class="label-text">Carteira</span>
      {#if portfolios.length === 0}
        <span class="label-text-alt">Nenhuma carteira cadastrada</span>
      {/if}
    </span>
    <select
      class="select select-bordered"
      bind:value={portfolioId}
      disabled={loading || portfolios.length === 0}
      aria-label="Carteira"
    >
      <option value="" disabled>Selecione uma carteira</option>
      {#each portfolios as portfolio (portfolio.id)}
        <option value={portfolio.id}>{portfolio.name}</option>
      {/each}
    </select>
  </label>

  <label class="form-control">
    <span class="label">
      <span class="label-text">Ativo</span>
      {#if assetsLoading}
        <span class="label-text-alt">Carregando…</span>
      {:else if assets.length > 0}
        <span class="label-text-alt">{assets.length} no catálogo</span>
      {/if}
    </span>
    <AssetPicker
      bind:value={assetId}
      {assets}
      loading={assetsLoading}
      disabled={loading}
    />
  </label>

  <div class="grid gap-4 md:grid-cols-2">
    <label class="form-control">
      <span class="label"><span class="label-text">Tipo de provento</span></span>
      <select class="select select-bordered" bind:value={paymentType} disabled={loading}>
        {#each paymentTypeOptions() as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </label>

    <label class="form-control">
      <span class="label"><span class="label-text">Data de recebimento</span></span>
      <input
        class="input input-bordered font-mono"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="DD/MM/AAAA"
        value={paymentDateBr}
        maxlength="10"
        disabled={loading}
        on:input={handlePaymentDateInput}
        on:blur={blurNormalizePaymentDate}
      />
    </label>
  </div>

  <p class="text-xs text-base-content/60">
    Data em DD/MM/AAAA. Você pode digitar ou colar; também é aceito colar no formato ISO (AAAA-MM-DD).
  </p>

  <div class="grid gap-4 md:grid-cols-2">
    <BrDecimalInput
      bind:this={amountInput}
      bind:value={amountValue}
      label="Valor recebido"
      inputClass="input input-bordered w-full"
      disabled={loading}
    />

    <label class="form-control">
      <span class="label"><span class="label-text">Moeda</span></span>
      <input class="input input-bordered" bind:value={currency} maxlength="8" disabled={loading} />
    </label>
  </div>

  <p class="text-xs text-base-content/60">
    Valor com vírgula para decimais (ex.: 1,10 ou 1.234,56).
  </p>

  <label class="form-control">
    <span class="label"><span class="label-text">Observações</span></span>
    <textarea class="textarea textarea-bordered" rows="2" bind:value={notes} disabled={loading} />
  </label>

  <details class="collapse collapse-arrow bg-base-200">
    <summary class="collapse-title text-sm font-medium">Dados fiscais (opcional)</summary>
    <div class="collapse-content grid gap-4 md:grid-cols-2">
      <label class="form-control">
        <span class="label"><span class="label-text">CNPJ da empresa</span></span>
        <input class="input input-bordered" bind:value={companyCnpj} disabled={loading} />
      </label>
      <label class="form-control">
        <span class="label"><span class="label-text">CNPJ fonte pagadora</span></span>
        <input class="input input-bordered" bind:value={payerCnpj} disabled={loading} />
      </label>
      <label class="form-control md:col-span-2">
        <span class="label"><span class="label-text">Nome fonte pagadora</span></span>
        <input class="input input-bordered" bind:value={payerName} disabled={loading} />
      </label>
    </div>
  </details>

  {#if editing}
    <p class="text-sm text-base-content/70">
      Tipo atual: {formatPaymentTypeForDisplay(editing.payment_type)}
    </p>
  {/if}

  <div class="flex flex-wrap gap-2">
    <button class="btn btn-primary" type="submit" disabled={loading}>
      {editing ? 'Salvar alterações' : 'Cadastrar provento'}
    </button>
    {#if editing}
      <button class="btn btn-ghost" type="button" disabled={loading} on:click={onCancel}>
        Cancelar edição
      </button>
    {/if}
  </div>
</form>