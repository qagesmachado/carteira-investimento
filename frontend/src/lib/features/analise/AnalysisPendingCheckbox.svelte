<script lang="ts">
  export let checked = false;
  export let disabled = false;
  export let onToggle: (value: boolean) => void | Promise<void> = () => undefined;
</script>

{#key checked}
  <label class="label cursor-pointer justify-start gap-2 py-0" data-testid="analysis-pending-toggle">
    <input
      type="checkbox"
      class="checkbox checkbox-warning checkbox-sm"
      {checked}
      {disabled}
      on:change={(event) => void onToggle(event.currentTarget.checked)}
    />
    <span class="label-text text-xs">Pendente</span>
  </label>
{/key}
