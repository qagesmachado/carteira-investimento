<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import {
    getFiiBrConfig,
    getStockBrConfig,
    resetFiiBrConfig,
    resetStockBrConfig,
    saveFiiBrConfig,
    saveStockBrConfig
  } from '$lib/api/analysis';
  import AnalysisSumColumnConfigPanel from '$lib/features/analise/AnalysisSumColumnConfigPanel.svelte';

  type ConfigProfile = 'acoes' | 'fiis';

  $: activeProfile = ($page.url.searchParams.get('perfil') === 'fiis' ? 'fiis' : 'acoes') as ConfigProfile;

  function setProfile(profile: ConfigProfile) {
    const url = profile === 'fiis' ? '/analise/configuracao?perfil=fiis' : '/analise/configuracao';
    void goto(url, { keepFocus: true, noScroll: true, replaceState: true });
  }
</script>

<svelte:head>
  <title>Análise — Configuração</title>
</svelte:head>

<div role="tablist" class="tabs tabs-bordered mb-6" aria-label="Perfil da configuração">
  <button
    type="button"
    role="tab"
    class="tab"
    class:tab-active={activeProfile === 'acoes'}
    aria-selected={activeProfile === 'acoes'}
    on:click={() => setProfile('acoes')}>Ações/ETF BR</button
  >
  <button
    type="button"
    role="tab"
    class="tab"
    class:tab-active={activeProfile === 'fiis'}
    aria-selected={activeProfile === 'fiis'}
    on:click={() => setProfile('fiis')}>FIIs</button
  >
</div>

{#key activeProfile}
  {#if activeProfile === 'acoes'}
    <AnalysisSumColumnConfigPanel
      title="Coluna Soma — Ações/ETF BR"
      formulaDescription="Lucros + Dívida + Tag along + Segmento + peso de viabilidade + (multiplicador × diagrama)."
      resetConfirmMessage="Restaurar configuração padrão da coluna Soma (Ações/ETF BR)?"
      loadConfig={getStockBrConfig}
      saveConfig={saveStockBrConfig}
      resetConfig={resetStockBrConfig}
    />
  {:else}
    <AnalysisSumColumnConfigPanel
      title="Coluna Soma — FIIs"
      formulaDescription="Vacância + Qtd Ativos + Alavancagem + Segmento + peso de viabilidade + (multiplicador × diagrama). Configuração independente das ações."
      resetConfirmMessage="Restaurar configuração padrão da coluna Soma (FIIs)?"
      loadConfig={getFiiBrConfig}
      saveConfig={saveFiiBrConfig}
      resetConfig={resetFiiBrConfig}
    />
  {/if}
{/key}
