<script lang="ts">
  export let title: string;
  export let subtitle = '';
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
  <div>
    <h1 class="text-2xl font-bold">{title}</h1>
    {#if subtitle}
      <p class="text-sm opacity-70">{subtitle}</p>
    {/if}
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <slot name="actions" />
  </div>
</div>
