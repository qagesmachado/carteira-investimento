<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: pathname = $page.url.pathname;
  $: analiseOpen = pathname.startsWith('/analise');
</script>

<div class="mx-auto max-w-6xl px-4 pb-8">
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold">Análise</h1>
      <p class="text-sm text-base-content/70">Classificação fundamental e diagrama para ações/ETF BR.</p>
    </div>
    <div role="tablist" class="tabs tabs-boxed">
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={pathname.startsWith('/analise/acoes-br')}
        on:click={() => goto('/analise/acoes-br')}>Ações/ETF BR</button
      >
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={pathname.startsWith('/analise/configuracao')}
        on:click={() => goto('/analise/configuracao')}>Configuração</button
      >
      <button type="button" role="tab" class="tab tab-disabled" disabled>FIIs (em breve)</button>
      <button type="button" role="tab" class="tab tab-disabled" disabled>ETF intl (em breve)</button>
    </div>
  </div>

  <slot />
</div>
