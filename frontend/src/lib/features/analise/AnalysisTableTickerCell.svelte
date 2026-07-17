<script lang="ts">
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let symbol: string;
  export let testId: string | undefined = undefined;
</script>

<span
  class="inline-flex rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold"
  data-testid={testId}
>
  {formatTickerForDisplay(symbol)}
</span>
