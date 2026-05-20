<svelte:options accessors={true} />

<script lang="ts">
  import BrDecimalInput from './BrDecimalInput.svelte';

  export let value = 0;
  let inputRef: BrDecimalInput;
  export { inputRef };
</script>

<BrDecimalInput bind:value bind:this={inputRef} />
