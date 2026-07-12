<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $: pathname = $page.url.pathname;
  $: isTags = pathname.startsWith('/financeiro/metas/tags');
</script>

<div class="flex gap-2 border-b border-base-300 pb-2">
  <button
    type="button"
    class="tab tab-bordered {isTags ? '' : 'tab-active'}"
    on:click={() => goto('/financeiro/metas')}
  >
    Metas
  </button>
  <button
    type="button"
    class="tab tab-bordered {isTags ? 'tab-active' : ''}"
    data-testid="budget-metas-tags-tab"
    on:click={() => goto('/financeiro/metas/tags')}
  >
    Tags
  </button>
</div>

<slot />
