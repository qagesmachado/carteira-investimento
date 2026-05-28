<script lang="ts">
  import type { AssetDivergence } from '$lib/api/objetivos';
  import { formatDivergenceMessage } from './computeDivergence';

  export let divergences: AssetDivergence[] = [];

  $: overTotal = divergences.filter((d) => d.status === 'over_total');
</script>

{#if overTotal.length > 0}
  <div class="space-y-2" data-testid="objetivos-divergence-banner">
    {#each overTotal as divergence (divergence.asset_id)}
      <div class="alert alert-error shadow-sm">
        <div>
          <p class="font-medium">{divergence.symbol} — posição alterada externamente</p>
          <p class="text-sm">
            Ajuste necessário: {formatDivergenceMessage(divergence)}. Regularize as alocações
            deste ativo antes de editar outros objetivos.
          </p>
        </div>
      </div>
    {/each}
  </div>
{/if}
