<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: pathname = $page.url.pathname;
  $: isAcoesTab = pathname.startsWith('/analise/acoes-br');
  $: isFiisTab =
    pathname.startsWith('/analise/fiis') && !pathname.startsWith('/analise/fiis/internacional');
  $: isConfigTab = pathname.startsWith('/analise/configuracao');
  $: subtitle = isConfigTab
    ? 'Configuração da coluna Soma para ações/ETF BR e FIIs.'
    : isFiisTab
      ? 'Classificação de viabilidade e diagrama para fundos imobiliários.'
      : 'Classificação fundamental e diagrama para ações/ETF BR.';

  function goToConfig() {
    const perfil = isFiisTab ? '?perfil=fiis' : '';
    void goto(`/analise/configuracao${perfil}`);
  }
</script>

<div class="mx-auto max-w-6xl px-4 pb-8">
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
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
      <button type="button" role="tab" class="tab tab-disabled" disabled aria-selected={false}>
        Internacional (em breve)
      </button>
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
</div>
