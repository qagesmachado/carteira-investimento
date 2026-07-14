<script lang="ts">
  import { onMount } from 'svelte';

  import AppNavbar from '$lib/components/AppNavbar.svelte';
  import AppToastStack from '$lib/components/AppToastStack.svelte';
  import { PAGE_SHELL_PADDING_X_CLASS, PAGE_SHELL_WIDTH_CLASS } from '$lib/layout/pageShell';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';
  import { theme } from '$lib/stores/theme';
  import { applyThemeToDocument } from '$lib/theme/applyTheme';

  import '../app.css';

  $: applyThemeToDocument($theme);

  onMount(() => {
    applyThemeToDocument($theme);
  });
</script>

<div class="flex min-h-screen w-full flex-col">
  <AppNavbar />
  <div class="min-w-0 flex-1">
    {#key $hideMoneyValues}
      <slot />
    {/key}
  </div>
  <footer class="border-t border-base-300 py-2 text-center text-xs text-base-content/50" data-testid="app-footer">
    <div class="{PAGE_SHELL_WIDTH_CLASS} {PAGE_SHELL_PADDING_X_CLASS} mx-auto">
      <a href="/info" class="link link-hover" data-testid="footer-version-link">
        Carteira de Investimentos • Informações do sistema
      </a>
    </div>
  </footer>
  <AppToastStack />
</div>
