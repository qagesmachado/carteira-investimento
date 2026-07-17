<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import { ANALYSIS_HUB_NAV_ITEMS } from './analysisSectionTabs';

  const DESCRIPTIONS: Record<string, string> = {
    acoes: 'Classificação fundamental e diagrama para ações e ETFs brasileiros.',
    fiis: 'Viabilidade, diagrama e coluna Soma para fundos imobiliários.',
    internacional: 'Alocação percentual de ETFs internacionais na carteira.',
    cripto: 'Alocação percentual na estratégia de criptomoedas.'
  };
</script>

<div class="grid gap-3 sm:grid-cols-2" data-testid="analysis-hub-nav-cards">
  {#each ANALYSIS_HUB_NAV_ITEMS as item (item.id)}
    <a
      class="group flex gap-3 rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
      href={item.href}
      data-testid="analysis-hub-nav-{item.id}"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <LucideIcon name={item.icon} size="md" />
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-base-content group-hover:text-primary">{item.label}</p>
        <p class="mt-1 text-sm text-base-content/70">{DESCRIPTIONS[item.id]}</p>
      </div>
    </a>
  {/each}
</div>
