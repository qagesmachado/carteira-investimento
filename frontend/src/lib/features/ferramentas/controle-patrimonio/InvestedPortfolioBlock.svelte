<script lang="ts">
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  export let investedPortfolioBrl: number;
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="patrimony-invested-block">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 class="text-lg font-semibold">Patrimônio investido</h2>
      <p class="text-sm opacity-70">
        Valor total das posições na carteira (cotações e câmbio), incluindo fatias classificadas
        como reserva nos objetivos.
      </p>
    </div>
    <p class="text-2xl font-semibold" data-testid="invested-value">
      {formatBrl(investedPortfolioBrl)}
    </p>
  </div>
  <p class="mt-3 text-sm">
    <a class="link link-primary" href="/portfolios/consolidada">Ver posições na visão consolidada</a>
  </p>
</section>
