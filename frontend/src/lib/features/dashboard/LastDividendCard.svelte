<script lang="ts">
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatIsoDateToBr } from '$lib/brDate';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { LAST_DIVIDEND_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  import { KPI_ICON_ACCENTS } from './dashboardIcons';

  export let payments: DividendPayment[] = [];
  export let assetSymbolById: Record<number, string> = {};

  const iconAccent = KPI_ICON_ACCENTS['dividends-month'];

  function paymentSymbol(payment: DividendPayment): string {
    return formatTickerForDisplay(assetSymbolById[payment.asset_id] ?? payment.symbol);
  }
</script>

<div class="card bg-base-100 shadow" data-testid="dashboard-highlight-recent-dividends">
  <div class="card-body gap-3 p-5">
    <div>
      <p class="text-sm font-medium text-base-content/70">Proventos recentes</p>
      <p class="text-xs text-base-content/60">Últimos lançamentos</p>
    </div>
    {#if payments.length > 0}
      <table
        class="w-auto max-w-full border-collapse text-sm"
        data-testid="dashboard-recent-dividend-list"
      >
        <tbody>
          {#each payments as payment, index (payment.id)}
            <tr class="align-middle" data-testid="dashboard-recent-dividend-row-{index + 1}">
              <td class="w-0 py-1 pr-2 align-middle">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl {iconAccent.bgClass} {iconAccent.fgClass}"
                  aria-hidden="true"
                >
                  <LucideIcon name={LAST_DIVIDEND_LUCIDE_ICON} size="md" class={iconAccent.fgClass} />
                </div>
              </td>
              <td class="whitespace-nowrap py-1 pr-3 align-middle font-medium">
                {paymentSymbol(payment)}
              </td>
              <td class="whitespace-nowrap py-1 pr-3 align-middle text-right tabular-nums">
                {formatMoneyAmount(payment.amount, payment.currency)}
              </td>
              <td class="whitespace-nowrap py-1 align-middle text-right text-base-content/60 tabular-nums">
                {formatIsoDateToBr(payment.payment_date)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="text-sm text-base-content/60">Nenhum provento cadastrado.</p>
    {/if}
  </div>
</div>
