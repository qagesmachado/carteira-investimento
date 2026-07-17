<script lang="ts">
  import {
    getAnalysisPortfolioPending,
    type AnalysisPortfolioPending,
    type PendingAssetsGroup
  } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    ANALYSIS_PROFILE_TO_TAB,
    analysisAreaHrefForProfile,
    analysisAreaLabelForProfile
  } from '$lib/features/analise/analysisProfileAreas';
  import { ANALYSIS_SECTION_TABS } from '$lib/features/analise/analysisSectionTabs';

  export let open = false;
  export let portfolioId: number | null = null;
  export let onClose: () => void = () => undefined;

  let loading = false;
  let error = '';
  let pending: AnalysisPortfolioPending | null = null;

  function iconForProfile(profile: string) {
    const tabId = ANALYSIS_PROFILE_TO_TAB[profile];
    return ANALYSIS_SECTION_TABS.find((tab) => tab.id === tabId)?.icon ?? 'CircleEllipsis';
  }

  async function loadPending() {
    if (portfolioId == null) {
      pending = null;
      return;
    }
    loading = true;
    error = '';
    try {
      pending = await getAnalysisPortfolioPending(portfolioId);
    } catch (err) {
      pending = null;
      error = parseApiError(err, 'Não foi possível carregar os ativos pendentes.');
    } finally {
      loading = false;
    }
  }

  $: if (open && portfolioId != null) {
    void loadPending();
  }

  function handleClose() {
    onClose();
  }

  function totalPending(groups: PendingAssetsGroup[]): number {
    return groups.reduce((sum, group) => sum + group.assets.length, 0);
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-modal="true" data-testid="analysis-pending-assets-modal">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">Ativos pendentes</h3>
      <p class="mt-2 text-sm text-base-content/70">
        Estes ativos estão excluídos dos totais de alocação na carteira ativa. Abra a área
        correspondente para reativar ou classificar.
      </p>

      {#if error}
        <p class="mt-4 text-sm text-error" role="alert">{error}</p>
      {:else if loading}
        <p class="mt-4 text-sm text-base-content/70">Carregando…</p>
      {:else if pending == null || pending.groups.length === 0}
        <p class="mt-4 text-sm text-base-content/70" data-testid="analysis-pending-assets-empty">
          Nenhum ativo pendente nesta carteira.
        </p>
      {:else}
        <p class="mt-3 text-sm text-base-content/60" data-testid="analysis-pending-assets-count">
          {totalPending(pending.groups)}
          {totalPending(pending.groups) === 1 ? 'ativo pendente' : 'ativos pendentes'}
        </p>
        <div class="mt-4 space-y-4" data-testid="analysis-pending-assets-groups">
          {#each pending.groups as group (group.profile)}
            <section
              class="rounded-xl border border-base-300/80 bg-base-100/80 p-3"
              data-testid="analysis-pending-group-{group.profile}"
            >
              <div class="mb-2 flex items-center justify-between gap-2">
                <h4 class="flex items-center gap-2 text-sm font-semibold">
                  <LucideIcon name={iconForProfile(group.profile)} size="sm" />
                  {analysisAreaLabelForProfile(group.profile)}
                </h4>
                <a
                  class="btn btn-outline btn-xs shrink-0 gap-1 normal-case"
                  href={analysisAreaHrefForProfile(group.profile)}
                  data-testid="analysis-pending-group-link-{group.profile}"
                >
                  Abrir área
                  <LucideIcon name="ArrowRight" size="sm" />
                </a>
              </div>
              <ul class="divide-y divide-base-300/60">
                {#each group.assets as asset (asset.asset_id)}
                  <li
                    class="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                    data-testid="analysis-pending-asset-{asset.asset_id}"
                  >
                    <div class="min-w-0">
                      <p class="font-medium">{formatTickerForDisplay(asset.symbol)}</p>
                      <p class="text-xs text-base-content/70">
                        {asset.name} · {formatAssetTypeForDisplay(asset.asset_type)}
                      </p>
                    </div>
                    <span class="badge badge-warning badge-sm">Pendente</span>
                  </li>
                {/each}
              </ul>
            </section>
          {/each}
        </div>
      {/if}

      <div class="modal-action">
        <button
          type="button"
          class="btn btn-primary"
          data-testid="analysis-pending-assets-close"
          on:click={handleClose}
        >
          Fechar
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={handleClose}></button>
    </form>
  </dialog>
{/if}
