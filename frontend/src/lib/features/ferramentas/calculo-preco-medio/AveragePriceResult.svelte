<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatQuantityForDisplay } from '$lib/features/portfolios/positionMetrics';

  import type { WeightedAverageOutcome } from './computeWeightedAveragePrice';
  import { weightedAverageErrorMessage } from './computeWeightedAveragePrice';

  export let outcome: WeightedAverageOutcome | null = null;
  export let currency = 'BRL';
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="average-price-result">
  <h3 class="mb-3 text-lg font-semibold">Resultado</h3>

  {#if outcome == null}
    <p class="text-sm opacity-70">Preencha os dois lotes para ver o preço médio ponderado.</p>
  {:else if !outcome.success}
    <p class="text-sm text-error">{weightedAverageErrorMessage(outcome.error)}</p>
  {:else}
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-base-300 p-3">
        <p class="text-xs uppercase opacity-60">Quantidade total</p>
        <p class="text-xl font-semibold" data-testid="result-total-quantity">
          {formatQuantityForDisplay(outcome.result.totalQuantity)}
        </p>
      </div>
      <div class="rounded-lg border border-base-300 p-3">
        <p class="text-xs uppercase opacity-60">Preço médio</p>
        <p class="text-xl font-semibold" data-testid="result-average-price">
          {formatMoneyAmount(outcome.result.averagePrice, currency)}
        </p>
      </div>
      <div class="rounded-lg border border-base-300 p-3">
        <p class="text-xs uppercase opacity-60">Valor investido total</p>
        <p class="text-xl font-semibold" data-testid="result-total-invested">
          {formatMoneyAmount(outcome.result.totalInvested, currency)}
        </p>
      </div>
    </div>
  {/if}
</section>
