<svelte:options accessors={true} />

<script lang="ts">
  import type { Asset } from '$lib/api/assets';

  import AssetPicker from './AssetPicker.svelte';

  export let assets: Asset[] = [];
  export let value: number | '' = '';
</script>

<AssetPicker bind:value {assets} />
