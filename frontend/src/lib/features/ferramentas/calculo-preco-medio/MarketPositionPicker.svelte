<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  import { portal } from '$lib/actions/portal';

  import { filterMarketPositionOptions } from './filterMarketPositionOptions';
  import type { MarketPositionOption } from './filterMarketPositions';

  export let options: MarketPositionOption[] = [];
  export let value: number | '' = '';
  export let disabled = false;
  export let testId = 'portfolio-position-select';

  const dispatch = createEventDispatcher<{ select: number }>();

  let open = false;
  let searchQuery = '';
  let rootEl: HTMLDivElement;
  let triggerEl: HTMLButtonElement;
  let panelEl: HTMLDivElement | undefined;
  let panelTop = 0;
  let panelLeft = 0;
  let panelWidth = 0;
  let portalTarget: HTMLElement | undefined;

  $: filteredOptions = filterMarketPositionOptions(options, searchQuery);
  $: selectedOption =
    value !== '' ? (options.find((option) => option.positionId === Number(value)) ?? null) : null;

  function updatePanelPosition() {
    if (!triggerEl) {
      return;
    }
    const rect = triggerEl.getBoundingClientRect();
    panelTop = rect.bottom + 4;
    panelLeft = rect.left;
    panelWidth = rect.width;
  }

  function bindPositionListeners() {
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
  }

  function unbindPositionListeners() {
    window.removeEventListener('resize', updatePanelPosition);
    window.removeEventListener('scroll', updatePanelPosition, true);
  }

  function resolvePortalTarget(): HTMLElement {
    return document.body;
  }

  async function openDropdown() {
    if (disabled) {
      return;
    }
    portalTarget = resolvePortalTarget();
    open = true;
    searchQuery = '';
    await tick();
    updatePanelPosition();
    bindPositionListeners();
  }

  function closeDropdown() {
    if (!open) {
      return;
    }
    open = false;
    searchQuery = '';
    unbindPositionListeners();
  }

  function toggleOpen() {
    if (disabled) {
      return;
    }
    if (open) {
      closeDropdown();
    } else {
      void openDropdown();
    }
  }

  function selectOption(option: MarketPositionOption) {
    value = option.positionId;
    dispatch('select', option.positionId);
    closeDropdown();
    triggerEl?.focus();
  }

  function handleWindowClick(event: MouseEvent) {
    if (!open) {
      return;
    }
    const target = event.target as Node;
    if (rootEl?.contains(target) || panelEl?.contains(target)) {
      return;
    }
    closeDropdown();
  }
</script>

<svelte:window on:click={handleWindowClick} />

<div bind:this={rootEl} class="market-position-picker w-full">
  <button
    bind:this={triggerEl}
    type="button"
    class="input input-bordered flex h-12 w-full cursor-pointer items-center justify-between gap-2 text-left"
    {disabled}
    data-testid={testId}
    aria-expanded={open}
    aria-haspopup="listbox"
    on:click|stopPropagation={toggleOpen}
  >
    <span class="min-w-0 flex-1 truncate leading-normal">
      {selectedOption ? selectedOption.label : 'Selecione uma posição…'}
    </span>
    <svg
      class="h-4 w-4 shrink-0 opacity-60 transition-transform {open ? 'rotate-180' : ''}"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</div>

{#if open && portalTarget}
  <div
    bind:this={panelEl}
    use:portal={portalTarget}
    class="market-position-picker-panel pointer-events-auto fixed z-[9999] flex max-h-72 flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
    style="top: {panelTop}px; left: {panelLeft}px; width: {panelWidth}px;"
    role="listbox"
  >
    <input
      type="search"
      class="input input-bordered input-sm mb-2 w-full shrink-0"
      placeholder="Ex.: ITSA4"
      bind:value={searchQuery}
      {disabled}
      on:click|stopPropagation
      on:keydown|stopPropagation
    />
    <ul class="flex max-h-52 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-0">
      {#if options.length === 0}
        <li class="px-3 py-2 text-sm text-base-content/60">Nenhuma posição disponível.</li>
      {:else if filteredOptions.length === 0}
        <li class="px-3 py-2 text-sm text-base-content/60">Nenhuma posição corresponde à busca.</li>
      {:else}
        {#each filteredOptions as option (option.positionId)}
          <li class="w-full shrink-0">
            <button
              type="button"
              class="w-full rounded-lg px-3 py-2 text-left text-sm leading-snug hover:bg-base-200"
              class:bg-base-200={value === option.positionId}
              role="option"
              aria-selected={value === option.positionId}
              on:click|stopPropagation={() => selectOption(option)}
            >
              {option.label}
            </button>
          </li>
        {/each}
      {/if}
    </ul>
  </div>
{/if}
