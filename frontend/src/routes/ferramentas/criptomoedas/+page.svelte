<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
  import {
    createCryptoFee,
    deleteCryptoFee,
    getCryptoSnapshot,
    listCryptoFees,
    updateCryptoFee,
    type CryptoFee,
    type CryptoFeeCreate,
    type CryptoSnapshot
  } from '$lib/api/cryptoFees';
  import { parseApiError } from '$lib/api/parseApiError';
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
  import BitcoinSummaryCards from '$lib/features/bitcoin/BitcoinSummaryCards.svelte';
  import CryptoFeeForm from '$lib/features/bitcoin/CryptoFeeForm.svelte';
  import CryptoFeeList from '$lib/features/bitcoin/CryptoFeeList.svelte';

  let assets: Asset[] = [];
  let portfolios: Portfolio[] = [];
  let activePortfolioId: number | null = null;
  let fees: CryptoFee[] = [];
  let snapshot: CryptoSnapshot | null = null;
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
      getCryptoSnapshot(activePortfolioId)
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
      activePortfolioId = resolveActivePortfolioId(activeResult, portfoliosResult);
      await refreshData();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar a página Criptomoedas.');
    }
  }

  onMount(loadInitial);

  async function handlePortfolioChange(id: number) {
    if (id === activePortfolioId) {
      return;
    }
    activePortfolioId = id;
    editingFee = null;
    message = '';
    try {
      await setActivePortfolioId(id);
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
  <title>Criptomoedas — Carteira de Investimentos</title>
</svelte:head>

<div class="flex flex-col gap-3">
  <PageHeader
    title="Criptomoedas"
    subtitle="Taxas de compra e transferência para criptoativos nativos (ex.: BTC-USD). ETFs de cripto usam a alocação em Análise → Criptomoedas."
  >
    <div slot="actions">
      <PortfolioSelect
        testId={PORTFOLIO_SELECT_HEADER_TEST_ID}
        {portfolios}
        activeId={activePortfolioId}
        on:select={(event) => handlePortfolioChange(event.detail)}
      />
    </div>
  </PageHeader>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}
  {#if message}
    <DismissibleAlert variant="success" text={message} on:dismiss={() => (message = '')} />
  {/if}

  <PageSection>
    <BitcoinSummaryCards {snapshot} />
  </PageSection>

  <PageSection>
    <CryptoFeeForm
      {assets}
      {portfolios}
      {activePortfolioId}
      editing={editingFee}
      {loading}
      onSubmit={handleSubmit}
      onCancel={() => (editingFee = null)}
    />
  </PageSection>

  <PageSection>
    <CryptoFeeList
      {fees}
      onEdit={(fee) => (editingFee = fee)}
      onDelete={handleDelete}
    />
  </PageSection>
</div>
