<script lang="ts">
  import type { PatrimonyControlSnapshot } from '$lib/api/patrimonyControl';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  import { pctOfPatrimony } from './patrimonyControlForm';

  export let snapshot: PatrimonyControlSnapshot;

  $: total = snapshot.total_patrimony_brl;
  $: investedNet = snapshot.invested_excluding_emergency_brl;
  $: emergency = snapshot.total_emergency_reserve_brl;
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="patrimony-control-summary">
  <h2 class="text-lg font-semibold">Resumo do patrimônio</h2>
  <p class="mb-4 text-sm opacity-70">
    Total = posições na carteira + reserva manual (banco, espécie). Fatias da carteira marcadas
    como reserva nos objetivos entram só no card «Reserva de emergência», não somam duas vezes.
  </p>

  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Patrimônio investido</p>
      <p class="text-xl font-semibold" data-testid="summary-invested">
        {formatBrl(investedNet)}
      </p>
      <p class="text-xs opacity-60">{pctOfPatrimony(investedNet, total)} do total</p>
      <p class="mt-1 text-xs opacity-50">Carteira, exceto fatias classificadas como reserva</p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Reserva de emergência</p>
      <p class="text-xl font-semibold" data-testid="summary-emergency">
        {formatBrl(emergency)}
      </p>
      <p class="text-xs opacity-60">{pctOfPatrimony(emergency, total)} do total</p>
      <p class="mt-1 text-xs opacity-50">Manual + fatias vinculadas nos objetivos</p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Total geral</p>
      <p class="text-xl font-semibold" data-testid="summary-total">
        {formatBrl(total)}
      </p>
      <p class="text-xs opacity-60">Investido + reserva</p>
    </div>
  </div>
</section>
