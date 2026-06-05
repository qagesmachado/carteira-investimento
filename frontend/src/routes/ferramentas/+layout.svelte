<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: pathname = $page.url.pathname;
  $: isObjetivosTab = pathname.startsWith('/ferramentas/objetivos');
  $: isBitcoinTab = pathname.startsWith('/ferramentas/bitcoin');
  $: isFinanciamentoTab = pathname.startsWith('/ferramentas/financiamento-imovel');
  $: isCalculoPrecoMedioTab = pathname.startsWith('/ferramentas/calculo-preco-medio');
</script>

<div class="mx-auto max-w-6xl px-4 pb-8">
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-4">
    <div>
      <h1 class="text-2xl font-bold">Ferramentas</h1>
      <p class="text-sm text-base-content/70">Utilitários complementares à carteira de investimentos.</p>
    </div>
    <div role="tablist" class="tabs tabs-boxed" aria-label="Ferramentas">
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isObjetivosTab}
        aria-selected={isObjetivosTab}
        on:click={() => goto('/ferramentas/objetivos')}>Gerenciamento de objetivos</button
      >
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isBitcoinTab}
        aria-selected={isBitcoinTab}
        on:click={() => goto('/ferramentas/bitcoin')}>Taxas bitcoin</button
      >
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isFinanciamentoTab}
        aria-selected={isFinanciamentoTab}
        on:click={() => goto('/ferramentas/financiamento-imovel')}>Financiamento imóvel</button
      >
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isCalculoPrecoMedioTab}
        aria-selected={isCalculoPrecoMedioTab}
        on:click={() => goto('/ferramentas/calculo-preco-medio')}>Cálculo de preço médio</button
      >
    </div>
  </div>

  <slot />
</div>
