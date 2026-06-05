<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
  import {
    createCryptoFee,
    deleteCryptoFee,
    getBitcoinSnapshot,
    listCryptoFees,
    updateCryptoFee,
    type BitcoinSnapshot,
    type CryptoFee,
    type CryptoFeeCreate
  } from '$lib/api/cryptoFees';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import BitcoinSummaryCards from '$lib/features/bitcoin/BitcoinSummaryCards.svelte';
  import CryptoFeeForm from '$lib/features/bitcoin/CryptoFeeForm.svelte';
  import CryptoFeeList from '$lib/features/bitcoin/CryptoFeeList.svelte';

  let assets: Asset[] = [];
  let portfolios: Portfolio[] = [];
  let activePortfolioId: number | null = null;
  let fees: CryptoFee[] = [];
  let snapshot: BitcoinSnapshot | null = null;
  let editingFee: CryptoFee | null = null;
  let loading = false;
  let error = '';
  let message = '';

  async function refreshData() {
    if (activePortfolioId == null) {
      fees = [];
      snapshot = null;
      return;
    }
    const [feeList, snap] = await Promise.all([
      listCryptoFees({ portfolio_id: activePortfolioId }),
      getBitcoinSnapshot(activePortfolioId)
    ]);
    fees = feeList;
    snapshot = snap;
  }

  async function loadInitial() {
    error = '';
    try {
      const [assetsResult, portfoliosResult, activeResult] = await Promise.all([
        listAssets(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      assets = assetsResult;
      portfolios = portfoliosResult;
      activePortfolioId = activeResult;
      await refreshData();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar a página Bitcoin.');
    }
  }

  onMount(loadInitial);

  async function handlePortfolioChange(id: number | null) {
    activePortfolioId = id;
    editingFee = null;
    message = '';
    try {
      await refreshData();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar os dados.');
    }
  }

  async function handleSubmit(payload: CryptoFeeCreate) {
    loading = true;
    error = '';
    message = '';
    try {
      if (editingFee) {
        await updateCryptoFee(editingFee.id, payload);
        message = 'Taxa atualizada.';
        editingFee = null;
      } else {
        await createCryptoFee(payload);
        message = 'Taxa registrada.';
      }
      await refreshData();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a taxa.');
    } finally {
      loading = false;
    }
  }

  async function handleDelete(fee: CryptoFee) {
    if (!confirm('Excluir este lançamento de taxa?')) {
      return;
    }
    loading = true;
    error = '';
    message = '';
    try {
      await deleteCryptoFee(fee.id);
      if (editingFee?.id === fee.id) {
        editingFee = null;
      }
      message = 'Taxa excluída.';
      await refreshData();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a taxa.');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Bitcoin — Carteira de Investimentos</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 class="text-xl font-semibold">Bitcoin</h2>
      <p class="text-sm opacity-70">
        Posição em BTC e histórico de taxas de compra e transferência (aba «Bitcoin taxas» da planilha).
      </p>
    </div>
    <PortfolioSelect
      {portfolios}
      activeId={activePortfolioId}
      on:select={(event) => handlePortfolioChange(event.detail)}
    />
  </div>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}
  {#if message}
    <DismissibleAlert variant="success" text={message} on:dismiss={() => (message = '')} />
  {/if}

  <BitcoinSummaryCards {snapshot} />

  <CryptoFeeForm
    {assets}
    {portfolios}
    {activePortfolioId}
    editing={editingFee}
    {loading}
    onSubmit={handleSubmit}
    onCancel={() => (editingFee = null)}
  />

  <CryptoFeeList
    {fees}
    onEdit={(fee) => (editingFee = fee)}
    onDelete={handleDelete}
  />
</div>
