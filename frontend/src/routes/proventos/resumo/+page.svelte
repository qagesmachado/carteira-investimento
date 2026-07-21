<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import { topAssetsByDividendAmount } from '$lib/features/dashboard/dividendDashboard';
  import { NO_PORTFOLIO_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import ProventosKpiCards from '$lib/features/proventos/ProventosKpiCards.svelte';
  import ProventosTimelinePanel from '$lib/features/proventos/ProventosTimelinePanel.svelte';
  import { proventosStore, selectHasNoPortfolio } from '$lib/features/proventos/proventosStore';
  import {
    PROVENTOS_TIMELINE_ANNUAL_LUCIDE_ICON,
    PROVENTOS_TIMELINE_MONTHLY_LUCIDE_ICON,
    PROVENTOS_TOP_ASSETS_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  $: state = $proventosStore;
  $: payments = state.payments;
  $: hasNoPortfolio = selectHasNoPortfolio(state);

  $: assetById = Object.fromEntries(state.assets.map((asset) => [asset.id, asset])) as Record<
    number,
    Asset
  >;

  // Destaque/ranking consideram apenas ativos EM CARTEIRA (mesma regra do Dashboard).
  // Quando nenhuma carteira específica está selecionada, não há noção de "posição":
  // caímos para todos os pagadores do escopo atual.
  $: hasHoldingScope = state.portfolioFilter !== '';
  $: rankingAssetIds = hasHoldingScope
    ? new Set(state.positions.map((position) => position.asset_id))
    : new Set(payments.map((payment) => payment.asset_id));

  $: topAssets = topAssetsByDividendAmount(payments, rankingAssetIds, assetById, 5);
  $: topPayer = topAssets[0] ?? null;
  $: maxTotal = topAssets.reduce((max, asset) => Math.max(max, asset.amountBrl), 0);

  function barPercent(total: number): number {
    if (maxTotal <= 0) {
      return 0;
    }
    return Math.max(4, Math.round((total / maxTotal) * 100));
  }
</script>

<svelte:head>
  <title>Proventos — Resumo</title>
</svelte:head>

<div class="flex flex-col gap-3" data-testid="proventos-resumo">
  {#if hasNoPortfolio}
    <EmptyStateCallout {...NO_PORTFOLIO_EMPTY_STATE} testId="proventos-resumo-sem-carteira" />
  {:else}
  <ProventosKpiCards {payments} {topPayer} />

  {#if payments.length === 0}
    <PageSection>
      <p class="text-sm text-base-content/70">
        Nenhum provento cadastrado ainda.
        <a class="link link-primary" href="/proventos/adicionar">Adicionar o primeiro provento</a>.
      </p>
    </PageSection>
  {:else}
    <div class="grid gap-3 xl:grid-cols-3">
      <ProventosTimelinePanel
        mode="annual"
        title="Proventos por ano"
        icon={PROVENTOS_TIMELINE_ANNUAL_LUCIDE_ICON}
        testId="proventos-por-ano"
        {payments}
      />

      <ProventosTimelinePanel
        mode="monthly"
        title="Proventos por mês"
        icon={PROVENTOS_TIMELINE_MONTHLY_LUCIDE_ICON}
        testId="proventos-por-mes"
        {payments}
      />

      <PageSection testId="proventos-top-ativos">
        <div class="flex items-center gap-2">
          <span class="text-primary" aria-hidden="true">
            <LucideIcon name={PROVENTOS_TOP_ASSETS_LUCIDE_ICON} size="lg" />
          </span>
          <h2 class="card-title text-lg">Top ativos por proventos</h2>
        </div>

        {#if topAssets.length === 0}
          <p class="text-sm text-base-content/70">Nenhum ativo em carteira com proventos.</p>
        {:else}
          <ul class="flex flex-col gap-3">
            {#each topAssets as asset (asset.symbol)}
              <li class="flex flex-col gap-1">
                <div class="flex items-baseline justify-between gap-2 text-sm">
                  <span class="truncate font-mono font-medium">
                    {formatTickerForDisplay(asset.symbol)}
                  </span>
                  <span class="shrink-0 tabular-nums text-base-content/80">
                    {formatMoneyAmount(asset.amountBrl, asset.currency)}
                  </span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-base-200">
                  <div
                    class="h-full rounded-full bg-primary"
                    style="width: {barPercent(asset.amountBrl)}%"
                    role="presentation"
                  ></div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </PageSection>
    </div>
  {/if}
  {/if}
</div>
