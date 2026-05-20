<script lang="ts">
  import {
    formatBrDecimalDisplay,
    formatBrDecimalForEditing,
    parseBrDecimalInput,
    sanitizeBrDecimalTyping
  } from '$lib/brDecimal';

  export let value = 0;
  export let label = '';
  export let disabled = false;
  export let inputClass = 'input input-bordered w-28';

  let text = '';
  let editing = false;

  $: if (!editing) {
    text = value === 0 ? '' : formatBrDecimalDisplay(value);
  }

  export function flush(): boolean {
    // Não setar editing=false antes de parse/commit: senão `$: if (!editing)` sobrescreve
    // `text` com o `value` antigo antes de ler o que o usuário digitou (ex.: Salvar sem blur).
    const trimmed = text.trim();
    if (!trimmed) {
      value = 0;
      text = '';
      editing = false;
      return true;
    }
    const parsed = parseBrDecimalInput(trimmed);
    if (parsed === null) {
      return false;
    }
    value = parsed;
    text = formatBrDecimalDisplay(parsed);
    editing = false;
    return true;
  }

  function handleFocus() {
    editing = true;
    text = value === 0 ? '' : formatBrDecimalForEditing(value);
  }

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    text = sanitizeBrDecimalTyping(target.value);
    target.value = text;
  }

  function handleBlur() {
    flush();
  }
</script>

<label class="form-control">
  {#if label}
    <span class="label-text">{label}</span>
  {/if}
  <input
    class={inputClass}
    type="text"
    inputmode="decimal"
    autocomplete="off"
    {disabled}
    bind:value={text}
    on:focus={handleFocus}
    on:input={handleInput}
    on:blur={handleBlur}
  />
</label>
