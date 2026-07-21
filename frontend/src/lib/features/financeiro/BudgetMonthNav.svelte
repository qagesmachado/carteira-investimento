<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';
  import {
    FINANCEIRO_MONTH_NEXT_LUCIDE_ICON,
    FINANCEIRO_MONTH_PICKER_LUCIDE_ICON,
    FINANCEIRO_MONTH_PREV_LUCIDE_ICON,
    FINANCEIRO_MONTH_TODAY_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  import { getBudgetLayoutContext } from './budgetLayoutContext';
  import { currentYearMonth, formatYearMonthLabel, shiftYearMonth } from './budgetMonth';

  const { yearMonth } = getBudgetLayoutContext();

  $: pathname = $page.url.pathname;
  $: thisMonth = currentYearMonth();
  $: isCurrentMonth = $yearMonth === thisMonth;

  function goToMonth(next: string) {
    yearMonth.set(next);
    if (pathname.startsWith('/financeiro/orcamento')) {
      void goto(`/financeiro/orcamento/${next}`);
    } else if (pathname.startsWith('/financeiro/despesas')) {
      void goto(`/financeiro/despesas/${next}`);
    } else if (pathname.startsWith('/financeiro/controle')) {
      void goto(`/financeiro/controle/${next}`);
    } else if (pathname.startsWith('/financeiro/renda')) {
      void goto(`/financeiro/renda/${next}`);
    }
  }

  function shiftMonth(delta: number) {
    goToMonth(shiftYearMonth($yearMonth, delta));
  }

  function onPickMonth(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).value;
    if (value) {
      goToMonth(value);
    }
  }
</script>

<div class="{PAGE_SECTION_CLASS}" data-testid="budget-month-nav">
  <div class="card-body flex flex-col items-center gap-3 py-3 sm:flex-row sm:justify-center">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="btn btn-sm btn-ghost btn-circle"
        on:click={() => shiftMonth(-1)}
        aria-label="Mês anterior"
      >
        <LucideIcon name={FINANCEIRO_MONTH_PREV_LUCIDE_ICON} size="sm" aria-hidden="true" />
      </button>
      <span
        class="min-w-[9rem] text-center text-base font-semibold capitalize"
        data-testid="budget-month-label"
      >
        {formatYearMonthLabel($yearMonth)}
      </span>
      <button
        type="button"
        class="btn btn-sm btn-ghost btn-circle"
        on:click={() => shiftMonth(1)}
        aria-label="Próximo mês"
      >
        <LucideIcon name={FINANCEIRO_MONTH_NEXT_LUCIDE_ICON} size="sm" aria-hidden="true" />
      </button>
    </div>

    <div class="flex items-center gap-2 sm:ml-4 sm:border-l sm:border-base-300 sm:pl-4">
      <button
        type="button"
        class="btn btn-sm btn-outline gap-1"
        on:click={() => goToMonth(thisMonth)}
        disabled={isCurrentMonth}
        data-testid="budget-month-today"
      >
        <LucideIcon name={FINANCEIRO_MONTH_TODAY_LUCIDE_ICON} size="sm" aria-hidden="true" />
        Mês atual
      </button>
      <label
        class="flex cursor-pointer items-center gap-1 text-base-content/70"
        for="budget-month-picker"
      >
        <LucideIcon name={FINANCEIRO_MONTH_PICKER_LUCIDE_ICON} size="sm" aria-hidden="true" />
        <span class="sr-only sm:not-sr-only text-sm">Ir para</span>
      </label>
      <input
        id="budget-month-picker"
        type="month"
        lang="pt-BR"
        class="input input-bordered input-sm w-[10rem]"
        value={$yearMonth}
        on:change={onPickMonth}
        aria-label="Escolher mês"
        data-testid="budget-month-picker"
      />
    </div>
  </div>
</div>
