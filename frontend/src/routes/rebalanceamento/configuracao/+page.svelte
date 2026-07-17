<script lang="ts">
  import { onMount } from 'svelte';

  import { parseApiError } from '$lib/api/parseApiError';
  import { getAnalysisMethodology, type AnalysisMethodology } from '$lib/api/analysis';
  import {
    getActivePortfolioId,
    listPortfolios,
    updatePortfolio,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import {
    cloneAllocationTargets,
    defaultAllocationTargets,
    parseAllocationTargets,
    serializeAllocationTargets,
    validateAllocationTargets,
    type AllocationTargets
  } from '$lib/features/rebalance/allocationTargets';
  import RebalanceClassTargetsEditor from '$lib/features/rebalance/RebalanceClassTargetsEditor.svelte';
  import RebalanceProfilePresetModal from '$lib/features/rebalance/RebalanceProfilePresetModal.svelte';
  import RebalanceStocksSplitEditor from '$lib/features/rebalance/RebalanceStocksSplitEditor.svelte';
  import RebalanceTargetsPreview from '$lib/features/rebalance/RebalanceTargetsPreview.svelte';
  import { enforceStocksSplitUnifiedForSimples } from '$lib/features/rebalance/stocksSplitSimplesLock';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { PORTFOLIO_POSITIONS_BACK_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';
  import { PAGE_HERO_DASHBOARD_BACK_BTN_CLASS } from '$lib/layout/pageVisual';

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let targets: AllocationTargets = defaultAllocationTargets();
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';
  let presetModalOpen = false;
  let stockBrMethodology: AnalysisMethodology = 'auvp';

  $: stocksSplitLocked = stockBrMethodology === 'simples';
  $: if (stocksSplitLocked && targets.stocks_split_mode !== 'unified') {
    enforceStocksSplitUnifiedForSimples(targets);
  }

  $: canSave = activeId != null && validateAllocationTargets(targets) == null && !saving;

  async function loadStockBrMethodology() {
    if (activeId == null) {
      stockBrMethodology = 'auvp';
      return;
    }
    const result = await getAnalysisMethodology('stock-br', activeId);
    stockBrMethodology = result.methodology;
    if (stockBrMethodology === 'simples') {
      enforceStocksSplitUnifiedForSimples(targets);
    }
  }

  async function loadPage() {
    loading = true;
    error = '';
    try {
      portfolios = await listPortfolios();
      activeId = (await getActivePortfolioId()) ?? portfolios[0]?.id ?? null;
      const portfolio = portfolios.find((p) => p.id === activeId) ?? null;
      if (portfolio) {
        targets = parseAllocationTargets(portfolio.allocation_targets_json);
      }
      await loadStockBrMethodology();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void loadPage();
  });

  function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    const portfolio = portfolios.find((p) => p.id === id);
    if (!portfolio) return;
    activeId = id;
    targets = parseAllocationTargets(portfolio.allocation_targets_json);
    void loadStockBrMethodology();
    message = '';
    error = '';
  }

  async function handleSave() {
    if (activeId == null) return;
    const validationError = validateAllocationTargets(targets);
    if (validationError) {
      error = validationError;
      return;
    }
    saving = true;
    error = '';
    message = '';
    try {
      await updatePortfolio(activeId, {
        allocation_targets_json: serializeAllocationTargets(targets)
      });
      portfolios = await listPortfolios();
      message = 'Metas salvas.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar as metas.');
    } finally {
      saving = false;
    }
  }

  function handleApplyPreset(appliedTargets: AllocationTargets) {
    targets = cloneAllocationTargets(appliedTargets);
    message = '';
    error = '';
  }

  function openPresetModal() {
    presetModalOpen = true;
  }

  function closePresetModal() {
    presetModalOpen = false;
  }
</script>

<svelte:head>
  <title>Configuração — Rebalanceamento</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-4" class="flex flex-col gap-3">
    <PageHero
      title="Metas de rebalanceamento"
      subtitle="Percentuais alvo por classe e relação ETF/Ação"
      variant="dashboard"
    >
      <a
        slot="actions"
        class={PAGE_HERO_DASHBOARD_BACK_BTN_CLASS}
        href="/rebalanceamento"
        data-testid="rebalance-config-back"
      >
        <LucideIcon name={PORTFOLIO_POSITIONS_BACK_LUCIDE_ICON} size="md" class="text-white" />
        Voltar
      </a>
    </PageHero>

    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
    <DismissibleAlert variant="success" text={message} on:dismiss={() => (message = '')} />

    {#if loading}
      <p class="text-sm opacity-70">Carregando…</p>
    {:else if portfolios.length === 0}
      <PageSection>
        <p class="text-sm opacity-70">Cadastre uma carteira antes de definir metas.</p>
      </PageSection>
    {:else}
      <PageSection title="Carteira" testId="rebalance-config-portfolio-section">
        <label class="form-control w-full max-w-md">
          <span class="label-text">Carteira ativa</span>
          <PortfolioSelect
            {portfolios}
            {activeId}
            selectClass="select select-bordered"
            ariaLabel="Carteira"
            on:select={(event) => handlePortfolioSelect(event.detail)}
          />
        </label>
      </PageSection>

      <div class="grid gap-3 lg:grid-cols-3" data-testid="rebalance-config-editor-grid">
        <div class="flex flex-col gap-3 lg:col-span-2">
          <RebalanceClassTargetsEditor bind:targets showSum={false} />
          <RebalanceStocksSplitEditor bind:targets showSum={false} locked={stocksSplitLocked} />
        </div>

        <div class="lg:col-span-1">
          <RebalanceTargetsPreview {targets} />
        </div>
      </div>

      <PageSection testId="rebalance-config-actions">
        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-primary"
            disabled={!canSave}
            data-testid="rebalance-config-save"
            on:click={handleSave}
          >
            {saving ? 'Salvando…' : 'Salvar metas'}
          </button>
          <button
            class="btn btn-outline"
            type="button"
            disabled={saving}
            data-testid="rebalance-config-apply-preset"
            on:click={openPresetModal}
          >
            Perfis predefinidos
          </button>
        </div>
      </PageSection>

      <RebalanceProfilePresetModal
        open={presetModalOpen}
        onClose={closePresetModal}
        onApply={handleApplyPreset}
      />
    {/if}
  </AppPageShell>
</main>
