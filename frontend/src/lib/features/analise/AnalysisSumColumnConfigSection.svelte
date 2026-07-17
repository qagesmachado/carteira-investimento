<script lang="ts">
  import {
    getFiiBrConfig,
    getStockBrConfig,
    saveFiiBrConfig,
    saveStockBrConfig
  } from '$lib/api/analysis';
  import PageSection from '$lib/components/PageSection.svelte';
  import AnalysisSumColumnConfigPanel from '$lib/features/analise/AnalysisSumColumnConfigPanel.svelte';

  export let profile: 'stock_br' | 'fii_br' = 'stock_br';
  export let testId = 'analysis-sum-config-section';

  $: stockProps = {
    loadConfig: getStockBrConfig,
    saveConfig: saveStockBrConfig
  };

  $: fiiProps = {
    loadConfig: getFiiBrConfig,
    saveConfig: saveFiiBrConfig
  };

  $: props = profile === 'fii_br' ? fiiProps : stockProps;
</script>

<PageSection title="Metodologia de análise" {testId}>
  <AnalysisSumColumnConfigPanel {profile} {...props} />
</PageSection>
