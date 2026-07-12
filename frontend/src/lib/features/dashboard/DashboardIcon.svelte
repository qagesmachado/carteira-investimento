<script lang="ts">
  /**
   * @deprecated Legado — preferir `<LucideIcon />` e `lucideIconCatalog.ts`.
   * Ver `.cursor/rules/app/lucide-icons.mdc` e https://lucide.dev/icons/
   */
  import { dashboardIconPath, type DashboardIconName } from './dashboardIcons';

  export let name: DashboardIconName;
  export let size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  export let label = '';
  /** Ícones claros sobre fundos escuros (ex.: hero do dashboard). */
  export let tone: 'default' | 'on-dark' = 'default';

  const sizeClass: Record<typeof size, string> = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
    '2xl': 'h-10 w-10'
  };

  $: toneClass = tone === 'on-dark' ? 'brightness-0 invert' : '';
</script>

<img
  src={dashboardIconPath(name)}
  alt={label || name}
  class="{sizeClass[size]} shrink-0 {toneClass}"
  aria-hidden={label ? undefined : true}
/>
