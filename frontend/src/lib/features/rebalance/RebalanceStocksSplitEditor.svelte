<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    allocationBarClassForDisplayClass,
    allocationFillStyleForDisplayClass
  } from '$lib/features/dashboard/allocationChartColors';
  import {
    STOCKS_SPLIT_MODE_OPTIONS,
    type AllocationTargets,
    type StocksSplitMode
  } from '$lib/features/rebalance/allocationTargets';
  import { MIN_REBALANCE_TARGET_PERCENT } from '$lib/features/rebalance/rebalanceVisibility';
  import { stocksSplitModeConfirmMessage } from '$lib/features/rebalance/stocksSplitMode';
  import {
    STOCKS_SPLIT_SIMPLES_METHODOLOGY_LOCK_REASON,
    STOCKS_SPLIT_SIMPLES_UNIFIED_NOTE
  } from '$lib/features/rebalance/stocksSplitSimplesLock';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

  export let targets: AllocationTargets;
  export let showSum = true;
  export let locked = false;
  export let lockedReason = STOCKS_SPLIT_SIMPLES_METHODOLOGY_LOCK_REASON;

  const SPLIT_FIELDS: {
    key: keyof AllocationTargets['stocks_split'];
    label: string;
    icon: LucideIconName;
    barClass: string;
  }[] = [
    { key: 'etf', label: 'ETF', icon: 'ChartPie', barClass: allocationBarClassForDisplayClass('stocks') },
    {
      key: 'stock',
      label: 'Ação',
      icon: 'CandlestickChart',
      barClass: allocationBarClassForDisplayClass('international')
    }
  ];

  $: stocksClassPercent = targets.classes.stocks;
  $: showSection = stocksClassPercent >= MIN_REBALANCE_TARGET_PERCENT;
  $: activeMode = targets.stocks_split_mode;
  $: splitSum = targets.stocks_split.etf + targets.stocks_split.stock;
  $: splitSumValid = Math.abs(splitSum - 100) <= 0.01;
  $: sumTextClass = splitSumValid ? 'text-base-content/70' : 'text-error';

  function handleSliderInput(key: keyof AllocationTargets['stocks_split'], raw: string) {
    const parsed = Number.parseInt(raw, 10);
    targets.stocks_split[key] = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  }

  function onSliderInput(key: keyof AllocationTargets['stocks_split'], event: Event) {
    handleSliderInput(key, (event.currentTarget as HTMLInputElement).value);
  }

  function requestModeChange(nextMode: StocksSplitMode) {
    if (locked || nextMode === activeMode) {
      return;
    }
    const message = stocksSplitModeConfirmMessage(activeMode, nextMode);
    if (!window.confirm(message)) {
      return;
    }
    targets.stocks_split_mode = nextMode;
  }
</script>

{#if showSection}
  <section
    class="rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4"
    data-testid="rebalance-stocks-split-editor"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
      Relação ETF / Ação
    </p>
    <p class="mt-1 text-sm text-base-content/70">
      Escolha como distribuir a meta de Ações/ETF BR ({stocksClassPercent}% do patrimônio) entre ETFs e
      ações.
    </p>

    <div class="mt-4 grid gap-3" data-testid="rebalance-stocks-split-mode-options">
      {#each STOCKS_SPLIT_MODE_OPTIONS as option (option.mode)}
        <label
          class="flex gap-3 rounded-lg border p-3 transition-colors
            {activeMode === option.mode
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-base-300/60 bg-base-100/70 hover:border-primary/40'}
            {locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
          data-testid="rebalance-stocks-split-mode-{option.mode}"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-primary checkbox-sm mt-0.5"
            checked={activeMode === option.mode}
            disabled={locked}
            aria-label={option.title}
            on:change={(event) => {
              const input = event.currentTarget;
              if (!(input instanceof HTMLInputElement)) {
                return;
              }
              if (!input.checked) {
                input.checked = true;
                return;
              }
              requestModeChange(option.mode);
            }}
          />
          <span class="min-w-0">
            <span class="block text-sm font-medium text-base-content">{option.title}</span>
            <span class="mt-1 block text-sm text-base-content/70">{option.description}</span>
          </span>
        </label>
      {/each}
    </div>

    {#if locked}
      <p
        class="mt-4 rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-base-content/80"
        data-testid="rebalance-stocks-split-locked-note"
        role="status"
      >
        {lockedReason}
      </p>
    {/if}

    {#if activeMode === 'by_subtype'}
      <div class="mt-4 grid gap-3 sm:grid-cols-2" data-testid="rebalance-stocks-split-sliders">
        {#each SPLIT_FIELDS as field (field.key)}
          {@const fillStyle = allocationFillStyleForDisplayClass(field.key === 'etf' ? 'stocks' : 'international')}
          {@const value = targets.stocks_split[field.key]}
          <article
            class="rounded-lg border border-base-300/60 bg-base-100/70 p-3 shadow-sm"
            data-testid="stocks-split-row-{field.key}"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {field.barClass}/15"
                aria-hidden="true"
              >
                <LucideIcon name={field.icon} size="sm" class={field.barClass.replace(/^bg-/, 'text-')} />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="text-sm text-base-content/80">{field.label}</span>
                  <span class="text-sm font-semibold tabular-nums text-base-content">{value}%</span>
                </div>
                <div class="relative mt-2 h-6 w-full">
                  <div
                    class="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-base-300/70"
                    aria-hidden="true"
                    data-testid="stocks-split-bar-{field.key}"
                  >
                    <div class="h-full rounded-full {field.barClass}" style="width: {value}%"></div>
                  </div>
                  <input
                    class="rebalance-allocation-range absolute inset-0 w-full cursor-pointer"
                    style="--allocation-fill: {fillStyle}"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={value}
                    aria-label={field.label}
                    disabled={locked}
                    data-testid="stocks-split-slider-{field.key}"
                    on:input={(event) => onSliderInput(field.key, event)}
                  />
                </div>
              </div>
            </div>
          </article>
        {/each}
      </div>

      {#if showSum}
        <p class="mt-3 text-sm tabular-nums {sumTextClass}" data-testid="stocks-split-sum">
          Soma ETF + Ação:
          {splitSum.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
          {#if !splitSumValid}
            — ajuste para 100%
          {/if}
        </p>
      {/if}
    {:else}
      <p class="mt-4 rounded-lg border border-base-300/60 bg-base-100/70 p-3 text-sm text-base-content/70" data-testid="rebalance-stocks-split-unified-note">
        {locked ? STOCKS_SPLIT_SIMPLES_UNIFIED_NOTE : 'ETF e ação competem pelo mesmo pool de 100% da meta Ações/ETF BR. A coluna Soma define a participação de cada ticker na aba de rebalanceamento.'}
      </p>
    {/if}
  </section>
{/if}

<style>
  .rebalance-allocation-range {
    -webkit-appearance: none;
    appearance: none;
    height: 1.5rem;
    background: transparent;
  }

  .rebalance-allocation-range:focus {
    outline: none;
  }

  .rebalance-allocation-range:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 2px oklch(var(--b1)),
      0 0 0 4px oklch(var(--bc) / 0.35);
  }

  .rebalance-allocation-range:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 2px oklch(var(--b1)),
      0 0 0 4px oklch(var(--bc) / 0.35);
  }

  .rebalance-allocation-range::-webkit-slider-runnable-track {
    height: 0.375rem;
    background: transparent;
  }

  .rebalance-allocation-range::-moz-range-track {
    height: 0.375rem;
    background: transparent;
    border: none;
  }

  .rebalance-allocation-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 1rem;
    width: 1rem;
    margin-top: -0.3125rem;
    border-radius: 9999px;
    background: var(--allocation-fill);
    border: 2px solid oklch(var(--b1));
    box-shadow: 0 0 0 1px oklch(var(--bc) / 0.2);
    cursor: pointer;
  }

  .rebalance-allocation-range::-moz-range-thumb {
    height: 1rem;
    width: 1rem;
    border-radius: 9999px;
    background: var(--allocation-fill);
    border: 2px solid oklch(var(--b1));
    box-shadow: 0 0 0 1px oklch(var(--bc) / 0.2);
    cursor: pointer;
  }
</style>
