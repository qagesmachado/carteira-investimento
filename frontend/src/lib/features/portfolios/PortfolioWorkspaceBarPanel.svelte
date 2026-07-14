<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { Portfolio } from '$lib/api/portfolios';
  import PageSection from '$lib/components/PageSection.svelte';
  import DashboardPortfolioBar from '$lib/features/dashboard/DashboardPortfolioBar.svelte';

  export let portfolios: Portfolio[] = [];
  export let activeId: number | null = null;
  export let activePortfolioName = '';
  export let usdBrlRate: number | null = null;
  export let usdBrlRefreshedAt: string | null = null;
  export let quotesRefreshedAt: string | null = null;
  export let disabled = false;
  export let portfolioSelectTestId = 'dashboard-portfolio-select';
  export let testId = 'portfolio-workspace-bar';

  const dispatch = createEventDispatcher<{ select: number }>();
</script>

<PageSection {testId}>
  <DashboardPortfolioBar
    {portfolios}
    {activeId}
    {activePortfolioName}
    {usdBrlRate}
    {usdBrlRefreshedAt}
    {quotesRefreshedAt}
    {disabled}
    {portfolioSelectTestId}
    on:select={(event) => dispatch('select', event.detail)}
  />
</PageSection>
