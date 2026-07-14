<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

  type Shortcut = {
    title: string;
    description: string;
    href: string;
    icon: LucideIconName;
    bgClass: string;
    fgClass: string;
    testId: string;
  };

  const shortcuts: Shortcut[] = [
    {
      title: 'Dashboard',
      description: 'Visão executiva da carteira',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      bgClass: 'bg-primary/15',
      fgClass: 'text-primary',
      testId: 'consolidada-shortcut-dashboard'
    },
    {
      title: 'Editar posições',
      description: 'Cadastro e manutenção da carteira',
      href: '/portfolios',
      icon: 'Pencil',
      bgClass: 'bg-secondary/15',
      fgClass: 'text-secondary',
      testId: 'consolidada-shortcut-portfolios'
    },
    {
      title: 'Rebalanceamento',
      description: 'Metas e sugestões de ajuste',
      href: '/rebalanceamento',
      icon: 'Scale',
      bgClass: 'bg-info/15',
      fgClass: 'text-info',
      testId: 'consolidada-shortcut-rebalance'
    },
    {
      title: 'Proventos',
      description: 'Dividendos e rendimentos',
      href: '/proventos',
      icon: 'Receipt',
      bgClass: 'bg-success/15',
      fgClass: 'text-success',
      testId: 'consolidada-shortcut-proventos'
    }
  ];
</script>

<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-testid="consolidada-shortcut-bar">
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
          <LucideIcon name={shortcut.icon} size="md" />
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
