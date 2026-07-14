<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { LAST_DIVIDEND_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';
  import { CONSOLIDADA_PATH } from '$lib/routes/appRoutes';

  import DashboardIcon from './DashboardIcon.svelte';
  import type { DashboardIconName } from './dashboardIcons';

  type Shortcut = {
    title: string;
    description: string;
    href: string;
    icon?: DashboardIconName;
    useLucideIcon?: boolean;
    bgClass: string;
    fgClass: string;
    testId: string;
  };

  const shortcuts: Shortcut[] = [
    {
      title: 'Visão consolidada',
      description: 'Veja o panorama completo da carteira',
      href: CONSOLIDADA_PATH,
      icon: 'pie-chart',
      bgClass: 'bg-primary/15',
      fgClass: 'text-primary',
      testId: 'dashboard-shortcut-consolidada'
    },
    {
      title: 'Rebalanceamento',
      description: 'Análise e sugestões de ajustes',
      href: '/rebalanceamento',
      icon: 'scales',
      bgClass: 'bg-secondary/15',
      fgClass: 'text-secondary',
      testId: 'dashboard-shortcut-rebalance'
    },
    {
      title: 'Proventos',
      description: 'Acompanhe seus rendimentos',
      href: '/proventos',
      useLucideIcon: true,
      bgClass: 'bg-success/15',
      fgClass: 'text-success',
      testId: 'dashboard-shortcut-proventos'
    },
    {
      title: 'Objetivos',
      description: 'Metas e acompanhamento',
      href: '/ferramentas/objetivos',
      icon: 'target',
      bgClass: 'bg-warning/15',
      fgClass: 'text-warning',
      testId: 'dashboard-shortcut-objetivos'
    }
  ];
</script>

<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-testid="dashboard-shortcut-bar">
  {#each shortcuts as shortcut (shortcut.href)}
    <a
      class="card bg-base-100 shadow transition hover:shadow-md"
      href={shortcut.href}
      data-testid={shortcut.testId}
    >
      <div class="card-body flex-row items-center gap-3 p-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl {shortcut.bgClass} {shortcut.fgClass}"
          aria-hidden="true"
        >
          {#if shortcut.useLucideIcon}
            <LucideIcon name={LAST_DIVIDEND_LUCIDE_ICON} size="md" />
          {:else if shortcut.icon}
            <DashboardIcon name={shortcut.icon} size="md" />
          {/if}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold">{shortcut.title}</p>
          <p class="text-xs text-base-content/60">{shortcut.description}</p>
        </div>
        <span class="text-base-content/40" aria-hidden="true">›</span>
      </div>
    </a>
  {/each}
</div>
