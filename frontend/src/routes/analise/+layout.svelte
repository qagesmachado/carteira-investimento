<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import { PAGE_BACKGROUND_CLASS } from '$lib/layout/pageVisual';

  $: pathname = $page.url.pathname;
  $: isAcoesTab = pathname.startsWith('/analise/acoes-br');
  $: isFiisTab =
    pathname.startsWith('/analise/fiis') && !pathname.startsWith('/analise/fiis/internacional');
  $: isInternacionalTab = pathname.startsWith('/analise/internacional');
  $: isCriptoTab = pathname.startsWith('/analise/criptomoedas');
  $: isConfigTab = pathname.startsWith('/analise/configuracao');
  $: subtitle = isConfigTab
    ? 'Configuração da coluna Soma para ações/ETF BR e FIIs.'
    : isFiisTab
      ? 'Classificação de viabilidade e diagrama para fundos imobiliários.'
      : isCriptoTab
        ? 'Alocação percentual na estratégia Criptomoeda.'
        : isInternacionalTab
          ? 'Alocação percentual de ETFs internacionais.'
          : 'Classificação fundamental e diagrama para ações/ETF BR.';

  function goToConfig() {
    const perfil = isFiisTab ? '?perfil=fiis' : '';
    void goto(`/analise/configuracao${perfil}`);
  }
</script>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-2-px-4" class="flex flex-col gap-3">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Análise de ativos</h1>
        <p class="text-sm text-base-content/70">{subtitle}</p>
      </div>
      <div role="tablist" class="tabs tabs-boxed" aria-label="Tipo de ativo">
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={isAcoesTab}
          aria-selected={isAcoesTab}
          on:click={() => goto('/analise/acoes-br')}>Ações/ETF BR</button
        >
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={isFiisTab}
          aria-selected={isFiisTab}
          on:click={() => goto('/analise/fiis')}>FIIs</button
        >
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={isInternacionalTab}
          aria-selected={isInternacionalTab}
          on:click={() => goto('/analise/internacional')}>Internacional</button
        >
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={isCriptoTab}
          aria-selected={isCriptoTab}
          on:click={() => goto('/analise/criptomoedas')}>Criptomoedas</button
        >
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={isConfigTab}
          aria-selected={isConfigTab}
          on:click={goToConfig}>Configuração</button
        >
      </div>
    </div>

    <slot />
  </AppPageShell>
</main>
