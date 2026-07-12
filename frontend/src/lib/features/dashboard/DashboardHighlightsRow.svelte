<script lang="ts">
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import type { RebalanceSnapshot } from '$lib/api/rebalance';

  import type { ClassGrossReturnRow } from './portfolioDashboard';
  import { computeRebalanceAdherence } from './rebalanceAdherence';
  import FeaturedClassCard from './FeaturedClassCard.svelte';
  import LastDividendCard from './LastDividendCard.svelte';
  import RebalanceAdherenceCard from './RebalanceAdherenceCard.svelte';
  import { pickRecentDividendPayments } from './dividendDashboard';

  export let rebalance: RebalanceSnapshot | null = null;
  export let rebalanceLoading = false;
  export let featuredClasses: ClassGrossReturnRow[] = [];
  export let payments: DividendPayment[] = [];
  export let assetSymbolById: Record<number, string> = {};

  $: adherence = computeRebalanceAdherence(rebalance?.classes ?? []);
  $: recentPayments = pickRecentDividendPayments(payments);
</script>

<div class="grid gap-2 lg:grid-cols-3" data-testid="dashboard-highlights-row">
  <RebalanceAdherenceCard insight={adherence} loading={rebalanceLoading} />
  <FeaturedClassCard rows={featuredClasses} />
  <LastDividendCard payments={recentPayments} {assetSymbolById} />
</div>
