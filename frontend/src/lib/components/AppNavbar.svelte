<script lang="ts">
  import { page } from '$app/stores';
  import { hideMoneyValues, toggleHideMoneyValues } from '$lib/stores/hideMoneyValues';
  import { theme, toggleTheme } from '$lib/stores/theme';

  $: pathname = $page.url.pathname;
  $: dashboardOpen = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  $: analiseOpen = pathname.startsWith('/analise');
  $: rebalanceOpen = pathname.startsWith('/rebalanceamento');
  $: criptomoedasOpen = pathname.startsWith('/ferramentas/criptomoedas');
  $: objetivosOpen = pathname.startsWith('/ferramentas/objetivos');
  $: alocacaoOpen = analiseOpen || rebalanceOpen;
  $: cadastroOpen =
    pathname === '/assets' ||
    pathname.startsWith('/assets/') ||
    pathname === '/proventos' ||
    pathname.startsWith('/proventos/') ||
    pathname === '/portfolios' ||
    (pathname.startsWith('/portfolios/') && pathname !== '/portfolios/consolidada') ||
    pathname === '/dados' ||
    pathname.startsWith('/dados/');
  $: ferramentasOpen = pathname.startsWith('/ferramentas');
  $: financiamentoOpen = pathname.startsWith('/ferramentas/financiamento-imovel');
  $: calculoPrecoMedioOpen = pathname.startsWith('/ferramentas/calculo-preco-medio');
  $: conferenciaIrOpen = pathname.startsWith('/ferramentas/conferencia-ir');
  $: controlePatrimonioOpen = pathname.startsWith('/ferramentas/controle-patrimonio');
</script>

<header class="flex min-h-16 w-full items-center bg-base-100 shadow-sm">
  <div class="mx-auto flex min-h-16 w-full min-w-0 max-w-6xl items-center gap-2 px-4">
    <a class="btn btn-ghost text-xl" href="/">Carteira de Investimentos</a>

    <a class="btn btn-ghost" class:btn-active={dashboardOpen} href="/dashboard">
      Dashboard
    </a>

    <a
      class="btn btn-ghost"
      class:btn-active={pathname === '/portfolios/consolidada'}
      href="/portfolios/consolidada"
    >
      Visão consolidada
    </a>

    <div class="dropdown">
      <div
        tabindex="0"
        role="button"
        class="btn btn-ghost gap-1"
        class:btn-active={alocacaoOpen}
      >
        Alocação
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
          <a href="/rebalanceamento" class:active={rebalanceOpen}>Rebalanceamento</a>
        </li>
        <li>
          <a href="/analise/acoes-br" class:active={analiseOpen}>Análise de ativos</a>
        </li>
      </ul>
    </div>

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
        <li>
          <a href="/proventos" class:active={pathname === '/proventos'}>Proventos</a>
        </li>
        <li>
          <a href="/dados" class:active={pathname === '/dados'}>Dados</a>
        </li>
      </ul>
    </div>

    <div class="dropdown">
      <div
        tabindex="0"
        role="button"
        class="btn btn-ghost gap-1"
        class:btn-active={ferramentasOpen}
      >
        Ferramentas
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <ul class="dropdown-content menu z-50 mt-2 w-56 rounded-box bg-base-100 p-2 shadow">
        <li>
          <a href="/ferramentas/objetivos" class:active={objetivosOpen}>
            Gerenciamento de objetivos
          </a>
        </li>
        <li>
          <a href="/ferramentas/criptomoedas" class:active={criptomoedasOpen}>
            Taxas cripto
          </a>
        </li>
        <li>
          <a href="/ferramentas/financiamento-imovel" class:active={financiamentoOpen}>
            Financiamento imóvel
          </a>
        </li>
        <li>
          <a href="/ferramentas/calculo-preco-medio" class:active={calculoPrecoMedioOpen}>
            Cálculo de preço médio
          </a>
        </li>
        <li>
          <a href="/ferramentas/conferencia-ir" class:active={conferenciaIrOpen}>
            Conferência anual de IR
          </a>
        </li>
        <li>
          <a href="/ferramentas/controle-patrimonio" class:active={controlePatrimonioOpen}>
            Controle de patrimônio
          </a>
        </li>
      </ul>
    </div>

    <div class="ml-auto flex items-center gap-1">
      <button
        type="button"
        class="btn btn-ghost btn-circle"
        data-testid="toggle-theme-btn"
        aria-pressed={$theme === 'dim'}
        aria-label={$theme === 'dim' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        title={$theme === 'dim' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        on:click={toggleTheme}
      >
        {#if $theme === 'dim'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        {/if}
      </button>

      <button
        type="button"
        class="btn btn-ghost btn-circle"
        data-testid="toggle-hide-money-btn"
      aria-pressed={$hideMoneyValues}
      aria-label={$hideMoneyValues ? 'Mostrar valores' : 'Ocultar valores'}
      title={$hideMoneyValues ? 'Mostrar valores' : 'Ocultar valores'}
      on:click={toggleHideMoneyValues}
    >
      {#if $hideMoneyValues}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      {/if}
      </button>
    </div>
  </div>
</header>
