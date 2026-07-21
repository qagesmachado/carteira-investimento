<script lang="ts">
  import { tick } from 'svelte';

  import type { Asset } from '$lib/api/assets';
  import { portal } from '$lib/actions/portal';
  import { filterAssets } from '$lib/features/assets/filterAssets';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let assets: Asset[] = [];
  export let value: number | '' = '';
  export let disabled = false;
  /** Enquanto a página carrega GET /assets */
  export let loading = false;

  let open = false;
  let searchQuery = '';
  let rootEl: HTMLDivElement;
  let triggerEl: HTMLButtonElement;
  let panelEl: HTMLDivElement | undefined;
  let panelTop = 0;
  let panelLeft = 0;
  let panelWidth = 0;
  let portalTarget: HTMLElement | undefined;

  $: filteredAssets = filterAssets(assets, searchQuery);
  $: selectedAsset =
    value !== '' ? (assets.find((asset) => asset.id === Number(value)) ?? null) : null;

  function formatAssetLabel(asset: Asset): string {
    return `${formatTickerForDisplay(asset.symbol)} — ${asset.name} (${asset.currency})`;
  }

  function updatePanelPosition() {
    if (!triggerEl) {
      return;
    }
    const rect = triggerEl.getBoundingClientRect();
    const gap = 4;
    // Abre para cima quando não há espaço abaixo do gatilho (ex.: campo perto do rodapé),
    // evitando que o painel fique fora da viewport e inclicável.
    const panelHeight = panelEl?.offsetHeight ?? 288;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < panelHeight + gap && rect.top > spaceBelow;
    panelTop = openUp ? Math.max(gap, rect.top - panelHeight - gap) : rect.bottom + gap;
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
    const dialog = rootEl?.closest('dialog');
    return dialog ?? document.body;
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

  function selectAsset(asset: Asset) {
    value = asset.id;
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

<div bind:this={rootEl} class="asset-picker w-full">
  <button
    bind:this={triggerEl}
    type="button"
    class="input input-bordered flex h-12 w-full cursor-pointer items-center justify-between gap-2 text-left"
    {disabled}
    aria-expanded={open}
    aria-haspopup="listbox"
    on:click|stopPropagation={toggleOpen}
  >
    <span class="min-w-0 flex-1 truncate leading-normal">
      {selectedAsset ? formatAssetLabel(selectedAsset) : '—'}
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
    class="asset-picker-panel pointer-events-auto fixed z-[9999] flex max-h-72 flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
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
      {#if loading}
        <li class="px-3 py-2 text-sm text-base-content/60">Carregando ativos…</li>
      {:else if assets.length === 0}
        <li class="px-3 py-2 text-sm text-base-content/60">
          Nenhum ativo na base.
          <a class="link link-primary" href="/assets">Cadastrar ativos</a>
        </li>
      {:else if filteredAssets.length === 0}
        <li class="px-3 py-2 text-sm text-base-content/60">Nenhum ativo corresponde à busca.</li>
      {:else}
        {#each filteredAssets as asset (asset.id)}
          <li class="w-full shrink-0">
            <button
              type="button"
              class="w-full rounded-lg px-3 py-2 text-left text-sm leading-snug hover:bg-base-200"
              class:bg-base-200={value === asset.id}
              role="option"
              aria-selected={value === asset.id}
              on:click|stopPropagation={() => selectAsset(asset)}
            >
              {formatAssetLabel(asset)}
            </button>
          </li>
        {/each}
      {/if}
    </ul>
  </div>
{/if}
