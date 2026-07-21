<script lang="ts">
  export let title = '';
  export let count = 0;
  export let countLabel = 'itens';
  export let testId = '';
  export let open = true;

  // Estado interno para preservar a escolha do usuário entre re-renders
  // (o prop `open` define apenas o valor inicial).
  let isOpen = open;
</script>

<details class="rounded-box bg-base-100 shadow group" bind:open={isOpen} data-testid={testId}>
  <summary class="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-4 marker:content-none">
    <div class="flex items-center gap-2">
      <span class="text-lg font-semibold transition group-open:rotate-90">›</span>
      <h3 class="text-lg font-semibold">{title}</h3>
      {#if count > 0}
        <span class="badge badge-neutral">{count} {count === 1 ? 'item' : countLabel}</span>
      {/if}
    </div>
  </summary>
  <div class="border-t border-base-200 px-4 pb-4">
    <slot />
  </div>
</details>
