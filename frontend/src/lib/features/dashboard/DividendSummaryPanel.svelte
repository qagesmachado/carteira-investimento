<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import type { DividendClassRow } from './dividendDashboard';

  export let byClass: DividendClassRow[] = [];

  function formatTotals(row: DividendClassRow): string {
    return Object.keys(row.totalByCurrency)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((c) => formatMoneyAmount(row.totalByCurrency[c], c))
      .join(' · ');
  }
</script>

<section class="card bg-base-100 shadow" aria-label="Proventos no dashboard">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="card-title text-lg">Proventos (ano corrente)</h2>
      <a class="btn btn-ghost btn-sm" href="/proventos">Ver todos</a>
    </div>

    {#if byClass.length === 0}
      <p class="text-sm text-base-content/60">
        Nenhum provento no ano para os ativos desta carteira.
        <a class="link link-primary" href="/proventos">Cadastrar proventos</a>
      </p>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Classe</th>
              <th>Total</th>
              <th>Lançamentos</th>
            </tr>
          </thead>
          <tbody>
            {#each byClass as row}
              <tr>
                <td>{row.label}</td>
                <td>{formatTotals(row)}</td>
                <td>{row.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>
