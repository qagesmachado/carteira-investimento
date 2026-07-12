<script lang="ts">
  import { onMount } from 'svelte';

  import {
    createAsset,
    deleteAsset,
    listAssets,
    lookupAsset,
    updateAsset,
    type Asset,
    type AssetCreate,
    type AssetLookup,
    type AssetType,
    type AssetUpdate
  } from '$lib/api/assets';
  import { parseApiError } from '$lib/api/parseApiError';
  import AssetForm from '$lib/features/assets/AssetForm.svelte';
  import AssetList from '$lib/features/assets/AssetList.svelte';
  import AssetLookupForm from '$lib/features/assets/AssetLookupForm.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  /** Renda fixa tradicional e previdência são cadastradas na carteira, não aqui. */
  const MARKET_ASSET_TYPES: AssetType[] = ['stock', 'etf', 'fii', 'crypto', 'other'];

  let assets: Asset[] = [];
  let lookupResult: AssetLookup | null = null;
  let editingAsset: Asset | null = null;
  let message = '';
  let error = '';
  let loadingLookup = false;
  let loadingSave = false;

  $: formAsset = editingAsset ?? lookupResult;
  $: formMode = editingAsset ? 'edit' : 'create';
  /** Oculta renda fixa/previdência da base local (geridas na carteira). */
  $: marketAssets = assets.filter(
    (a) => a.asset_type !== 'fixed_income' && a.asset_type !== 'pension'
  );

  async function refreshAssets() {
    assets = await listAssets();
  }

  async function handleLookup(symbol: string) {
    loadingLookup = true;
    error = '';
    message = '';

    try {
      lookupResult = await lookupAsset(symbol);
      editingAsset = null;
      message = 'Ativo encontrado. Revise os dados antes de salvar.';
    } catch {
      error = 'Não foi possível buscar esse ativo. Você pode tentar outro ticker.';
    } finally {
      loadingLookup = false;
    }
  }

  async function handleSave(payload: AssetCreate) {
    loadingSave = true;
    error = '';
    message = '';

    try {
      await createAsset(payload);
      await refreshAssets();
      lookupResult = null;
      message = 'Ativo salvo na base local.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar o ativo. Revise os dados e tente novamente.');
    } finally {
      loadingSave = false;
    }
  }

  async function handleUpdate(payload: AssetUpdate) {
    if (!editingAsset) {
      return;
    }

    loadingSave = true;
    error = '';
    message = '';

    try {
      await updateAsset(editingAsset.id, payload);
      await refreshAssets();
      editingAsset = null;
      lookupResult = null;
      message = 'Ativo atualizado na base local.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o ativo. Revise os dados e tente novamente.');
    } finally {
      loadingSave = false;
    }
  }

  function handleEdit(asset: Asset) {
    editingAsset = asset;
    lookupResult = null;
    error = '';
    message = '';
  }

  function cancelEdit() {
    editingAsset = null;
  }

  async function handleDelete(asset: Asset) {
    const label = formatTickerForDisplay(asset.symbol);
    if (!confirm(`Excluir ${label} da base local?`)) {
      return;
    }

    error = '';
    message = '';

    try {
      await deleteAsset(asset.id);
      if (editingAsset?.id === asset.id) {
        editingAsset = null;
      }
      await refreshAssets();
      message = 'Ativo removido da base local.';
    } catch {
      error = 'Não foi possível excluir o ativo.';
    }
  }

  onMount(() => {
    refreshAssets().catch(() => {
      error = 'Não foi possível carregar os ativos cadastrados.';
    });
  });
</script>

<svelte:head>
  <title>Cadastro de ativos</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-4" class="flex w-full min-w-0 flex-col gap-3">
    <PageHero title="Cadastro de ativos no banco de dados" variant="primary" />

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />

    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    <div class="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div class="flex flex-col gap-4">
        <AssetLookupForm onLookup={handleLookup} loading={loadingLookup} />
        <div class="card bg-base-100 shadow">
          <div class="card-body gap-3">
            <h2 class="card-title text-base">Renda fixa e previdência</h2>
            <p class="text-sm text-base-content/70">
              CDB, LCI, LCA, Tesouro, previdência e similares são cadastrados direto na
              carteira, em <a class="link link-primary" href="/portfolios">Carteiras</a>, pelo
              botão «Adicionar ativo à carteira».
            </p>
          </div>
        </div>
      </div>
      <AssetForm
        asset={formAsset}
        mode={formMode}
        availableTypes={MARKET_ASSET_TYPES}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onCancel={formMode === 'edit' ? cancelEdit : undefined}
        loading={loadingSave}
      />
    </div>

    <AssetList assets={marketAssets} onEdit={handleEdit} onDelete={handleDelete} />
  </AppPageShell>
</main>
