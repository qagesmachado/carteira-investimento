<script lang="ts">
  import { page } from '$app/stores';

  $: pathname = $page.url.pathname;
  $: cadastroOpen =
    pathname === '/assets' ||
    pathname.startsWith('/assets/') ||
    pathname === '/portfolios' ||
    (pathname.startsWith('/portfolios/') && pathname !== '/portfolios/consolidada');
</script>

<header class="flex min-h-16 w-full items-center bg-base-100 shadow-sm">
  <div class="mx-auto flex min-h-16 w-full min-w-0 max-w-6xl items-center gap-2 px-4">
    <a class="btn btn-ghost text-xl" href="/">Carteira de Investimentos</a>

    <div class="dropdown">
      <div
        tabindex="0"
        role="button"
        class="btn btn-ghost gap-1"
        class:btn-active={cadastroOpen}
      >
        Cadastro
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <ul class="dropdown-content menu z-50 mt-2 w-52 rounded-box bg-base-100 p-2 shadow">
        <li>
          <a href="/assets" class:active={pathname === '/assets'}>Ativos</a>
        </li>
        <li>
          <a href="/portfolios" class:active={pathname === '/portfolios'}>Carteiras</a>
        </li>
      </ul>
    </div>

    <a
      class="btn btn-ghost"
      class:btn-active={pathname === '/portfolios/consolidada'}
      href="/portfolios/consolidada"
    >
      Visão consolidada
    </a>
  </div>
</header>
