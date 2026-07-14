<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import { allocationBarClassForDisplayClass, allocationFillStyleForDisplayClass } from '$lib/features/dashboard/allocationChartColors';
  import {
    CLASS_TARGET_FIELDS,
    type AllocationTargets
  } from '$lib/features/rebalance/allocationTargets';

  export let targets: AllocationTargets;

  $: classSum =
    targets.classes.stocks +
    targets.classes.funds +
    targets.classes.international +
    targets.classes.fixed_income +
    targets.classes.crypto;
  $: classSumValid = Math.abs(classSum - 100) <= 0.01;
  $: sumTextClass = classSumValid ? 'text-base-content/70' : 'text-error';

  function iconSurfaceClass(displayClass: string): string {
    return `${allocationBarClassForDisplayClass(displayClass)}/15`;
  }

  function handleSliderInput(key: keyof AllocationTargets['classes'], raw: string) {
    const parsed = Number.parseInt(raw, 10);
    targets.classes[key] = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  }

  function onSliderInput(key: keyof AllocationTargets['classes'], event: Event) {
    handleSliderInput(key, (event.currentTarget as HTMLInputElement).value);
  }
</script>

<section
  class="rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4"
  data-testid="portfolio-custom-allocation-editor"
>
  <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
    Metas por classe
  </p>
  <p class="mt-1 text-sm text-base-content/70">
    Ajuste os percentuais abaixo. A soma das cinco classes deve totalizar 100%.
  </p>

  <div class="mt-4 grid gap-3 sm:grid-cols-2">
    {#each CLASS_TARGET_FIELDS as field (field.key)}
      {@const iconName = lucideIconForDisplayClass(field.key)}
      {@const iconFg = displayClassIconFgClass(field.key)}
      {@const iconBg = iconSurfaceClass(field.key)}
      {@const barClass = allocationBarClassForDisplayClass(field.key)}
      {@const fillStyle = allocationFillStyleForDisplayClass(field.key)}
      {@const value = targets.classes[field.key]}
      <article
        class="rounded-lg border border-base-300/60 bg-base-100/70 p-3 shadow-sm"
        data-testid="custom-allocation-row-{field.key}"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {iconBg}"
            aria-hidden="true"
          >
            <LucideIcon name={iconName} size="sm" class={iconFg} />
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
                data-testid="custom-allocation-bar-{field.key}"
              >
                <div class="h-full rounded-full {barClass}" style="width: {value}%"></div>
              </div>
              <input
                class="custom-allocation-range absolute inset-0 w-full cursor-pointer"
                style="--allocation-fill: {fillStyle}"
                type="range"
                min="0"
                max="100"
                step="1"
                value={value}
                aria-label={field.label}
                data-testid="custom-allocation-slider-{field.key}"
                on:input={(event) => onSliderInput(field.key, event)}
              />
            </div>
          </div>
        </div>
      </article>
    {/each}
  </div>

  <p
    class="mt-3 text-sm tabular-nums {sumTextClass}"
    data-testid="custom-allocation-sum"
  >
    Soma das classes:
    {classSum.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
    {#if !classSumValid}
      — ajuste para 100%
    {/if}
  </p>
</section>

<style>
  .custom-allocation-range {
    -webkit-appearance: none;
    appearance: none;
    height: 1.5rem;
    background: transparent;
  }

  .custom-allocation-range:focus {
    outline: none;
  }

  .custom-allocation-range:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 2px oklch(var(--b1)),
      0 0 0 4px oklch(var(--bc) / 0.35);
  }

  .custom-allocation-range:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 2px oklch(var(--b1)),
      0 0 0 4px oklch(var(--bc) / 0.35);
  }

  .custom-allocation-range::-webkit-slider-runnable-track {
    height: 0.375rem;
    background: transparent;
  }

  .custom-allocation-range::-moz-range-track {
    height: 0.375rem;
    background: transparent;
    border: none;
  }

  .custom-allocation-range::-webkit-slider-thumb {
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

  .custom-allocation-range::-moz-range-thumb {
    height: 1rem;
    width: 1rem;
    border-radius: 9999px;
    background: var(--allocation-fill);
    border: 2px solid oklch(var(--b1));
    box-shadow: 0 0 0 1px oklch(var(--bc) / 0.2);
    cursor: pointer;
  }
</style>
