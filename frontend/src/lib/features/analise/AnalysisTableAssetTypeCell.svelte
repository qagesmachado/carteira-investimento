<script lang="ts">
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { lucideIconForAssetType } from '$lib/features/portfolios/consolidada/consolidadaAssetTypeIcons';

  export let assetType: string;
</script>

<span class="inline-flex items-center gap-1.5">
  <LucideIcon
    name={lucideIconForAssetType(assetType)}
    size="sm"
    class="text-base-content/70"
  />
  <span class="hidden sm:inline">{formatAssetTypeForDisplay(assetType)}</span>
</span>
