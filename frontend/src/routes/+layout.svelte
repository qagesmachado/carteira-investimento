<script lang="ts">
  import AppNavbar from '$lib/components/AppNavbar.svelte';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';
  import { FRONTEND_VERSION } from '$lib/version';

  import '../app.css';
</script>

<div class="flex min-h-screen w-full flex-col">
  <AppNavbar />
  <div class="min-w-0 flex-1">
    {#key $hideMoneyValues}
      <slot />
    {/key}
  </div>
  <footer
    class="border-t border-base-300 px-4 py-2 text-center text-xs text-base-content/50"
    data-testid="app-footer"
  >
    <a href="/info" class="link link-hover" data-testid="footer-version-link">
      Carteira de Investimentos • v{FRONTEND_VERSION}
    </a>
  </footer>
</div>
