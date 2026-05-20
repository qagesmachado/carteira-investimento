<script lang="ts">
  import AppNavbar from '$lib/components/AppNavbar.svelte';

  import '../app.css';
</script>

<div class="flex min-h-screen w-full flex-col">
  <AppNavbar />
  <div class="min-w-0 flex-1">
    <slot />
  </div>
</div>
