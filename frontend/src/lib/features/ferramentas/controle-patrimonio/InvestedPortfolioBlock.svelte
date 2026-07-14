<script lang="ts">
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';
  import { CONSOLIDADA_PATH } from '$lib/routes/appRoutes';

  export let investedPortfolioBrl: number;
</script>

<section class={PAGE_SECTION_CLASS} data-testid="patrimony-invested-block">
  <div class="card-body gap-4">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 class="card-title text-lg">Patrimônio investido</h2>
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
    <a class="link link-primary" href={CONSOLIDADA_PATH}>Ver posições na visão consolidada</a>
  </p>
  </div>
</section>
