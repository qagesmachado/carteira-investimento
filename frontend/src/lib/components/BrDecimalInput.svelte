<script lang="ts">
  import {
    formatBrDecimalDisplay,
    formatBrDecimalForEditing,
    formatBtcDecimalDisplay,
    formatBtcDecimalForEditing,
    parseBrDecimalInput,
    sanitizeBrDecimalTyping
  } from '$lib/brDecimal';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  export let value = 0;
  export let label = '';
  export let disabled = false;
  export let currency = false;
  export let btcQuantity = false;
  export let inputClass = 'input input-bordered w-28';
  export let testId: string | undefined = undefined;

  let text = '';
  let editing = false;

  $: if (!editing) {
    void $hideMoneyValues;
    if (value === 0) {
      text = '';
    } else if (currency && disabled) {
      text = formatBrl(value);
    } else if (btcQuantity) {
      text = formatBtcDecimalDisplay(value);
    } else {
      text = formatBrDecimalDisplay(value);
    }
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
    text =
      currency && disabled
        ? formatBrl(parsed)
        : btcQuantity
          ? formatBtcDecimalDisplay(parsed)
          : formatBrDecimalDisplay(parsed);
    editing = false;
    return true;
  }

  function handleFocus() {
    editing = true;
    if (value === 0) {
      text = '';
      return;
    }
    text = btcQuantity ? formatBtcDecimalForEditing(value) : formatBrDecimalForEditing(value);
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
    data-testid={testId}
    bind:value={text}
    on:focus={handleFocus}
    on:input={handleInput}
    on:blur={handleBlur}
  />
</label>
