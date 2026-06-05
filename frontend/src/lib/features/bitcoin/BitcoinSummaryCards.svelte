<script lang="ts">
  import type { BitcoinSnapshot } from '$lib/api/cryptoFees';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { formatBtcQuantity } from './cryptoFeeLabels';

  export let snapshot: BitcoinSnapshot | null = null;

  function formatPercent(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) {
      return '—';
    }
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  }

  function transferLedgerCountLabel(count: number): string {
    if (count === 1) {
      return '1 transferência';
    }
    return `${count} transferências`;
  }
</script>

{#if snapshot}
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Quantidade BTC</div>
      <div class="stat-value text-2xl">{formatBtcQuantity(snapshot.position.quantity ?? 0)}</div>
      <div class="stat-desc">{snapshot.position.symbol ?? 'Sem posição'}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Valor investido</div>
      <div class="stat-value text-2xl">{formatBrl(snapshot.position.total_invested_brl)}</div>
      <div class="stat-desc">Preço médio {formatBrl(snapshot.position.average_price_brl)}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Valor atual</div>
      <div class="stat-value text-2xl">{formatBrl(snapshot.position.current_value_brl)}</div>
      <div class="stat-desc">Cotação {formatBrl(snapshot.position.quote_brl)}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Total taxas pagas</div>
      <div class="stat-value text-2xl">{formatBrl(snapshot.total_fees_brl)}</div>
      <div class="stat-desc">
        {formatMoneyAmount(snapshot.total_fees_usd, 'USD')}
      </div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Lucro / prejuízo</div>
      <div
        class="stat-value text-2xl"
        class:text-success={(snapshot.position.profit_brl ?? 0) >= 0}
        class:text-error={(snapshot.position.profit_brl ?? 0) < 0}
      >
        {formatBrl(snapshot.position.profit_brl)}
      </div>
      <div class="stat-desc">{formatPercent(snapshot.position.profit_percent)}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Lucro − taxas</div>
      <div
        class="stat-value text-2xl"
        class:text-success={(snapshot.profit_after_fees_brl ?? 0) >= 0}
        class:text-error={(snapshot.profit_after_fees_brl ?? 0) < 0}
      >
        {formatBrl(snapshot.profit_after_fees_brl)}
      </div>
      <div class="stat-desc">{formatPercent(snapshot.appreciation_after_fees_percent)}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Meta rebalanceamento</div>
      <div class="stat-value text-2xl">{formatBrl(snapshot.rebalance.target_value_brl)}</div>
      <div class="stat-desc">{snapshot.rebalance.rebalance_action ?? '—'}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Valor faltante</div>
      <div class="stat-value text-2xl">{formatBrl(snapshot.rebalance.missing_value_brl)}</div>
      <div class="stat-desc">Acima: {formatBrl(snapshot.rebalance.above_target_brl)}</div>
    </div>

    <div class="stat rounded-box bg-base-100 shadow" data-testid="bitcoin-transfer-ledger-total">
      <div class="stat-title">Conferência Ledger</div>
      <div class="stat-value text-2xl">
        {formatBtcQuantity(snapshot.transfer_ledger_final_btc)}
      </div>
      <div class="stat-desc">
        Soma Final (BTC) · {transferLedgerCountLabel(snapshot.transfer_ledger_count)}
      </div>
    </div>
  </div>
{/if}
