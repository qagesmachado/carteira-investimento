<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { ANALYSIS_EXTERNAL_LINK_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  export let href: string;
</script>

<a
  class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-0 normal-case"
  {href}
  target="_blank"
  rel="noopener noreferrer"
  data-testid="analysis-external-link"
>
  <LucideIcon name={ANALYSIS_EXTERNAL_LINK_LUCIDE_ICON} size="sm" />
  Abrir link
</a>
