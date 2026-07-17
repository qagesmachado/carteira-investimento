<script lang="ts">
  import { page } from '$app/stores';
  import NavbarDropdown from '$lib/components/NavbarDropdown.svelte';
  import { hideMoneyValues, toggleHideMoneyValues } from '$lib/stores/hideMoneyValues';
  import { PAGE_SHELL_PADDING_X_CLASS, PAGE_SHELL_WIDTH_CLASS } from '$lib/layout/pageShell';
  import { theme, toggleTheme } from '$lib/stores/theme';

  $: pathname = $page.url.pathname;
  $: dashboardOpen = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  $: consolidadaOpen = pathname === '/consolidada' || pathname.startsWith('/consolidada/');
  $: analiseOpen = pathname.startsWith('/analise');
  $: rebalanceOpen = pathname.startsWith('/rebalanceamento');
  $: criptomoedasOpen = pathname.startsWith('/ferramentas/criptomoedas');
  $: objetivosOpen = pathname.startsWith('/ferramentas/objetivos');
  $: carteiraOpen =
    pathname === '/portfolios' ||
    pathname.startsWith('/portfolios/') ||
    pathname.startsWith('/rebalanceamento') ||
    pathname.startsWith('/analise') ||
    pathname === '/proventos' ||
    pathname.startsWith('/proventos/');
  $: bancoDadosOpen =
    pathname === '/assets' ||
    pathname.startsWith('/assets/') ||
    pathname === '/dados' ||
    pathname.startsWith('/dados/');
  $: ferramentasOpen = pathname.startsWith('/ferramentas');
  $: financeiroOpen = pathname.startsWith('/financeiro');
  $: financiamentoOpen = pathname.startsWith('/ferramentas/financiamento-imovel');
  $: calculoPrecoMedioOpen = pathname.startsWith('/ferramentas/calculo-preco-medio');
  $: conferenciaIrOpen = pathname.startsWith('/ferramentas/conferencia-ir');
  $: controlePatrimonioOpen = pathname.startsWith('/ferramentas/controle-patrimonio');
</script>

<header
  class="sticky top-0 z-40 flex min-h-16 w-full items-center border-b border-base-300/60 bg-base-100/95 shadow-sm backdrop-blur-sm"
  data-testid="app-navbar"
>
  <div class="{PAGE_SHELL_WIDTH_CLASS} {PAGE_SHELL_PADDING_X_CLASS} flex min-h-16 w-full min-w-0 items-center gap-2">
    <a class="btn btn-ghost text-xl" href="/">Carteira de Investimentos</a>

    <a class="btn btn-ghost" class:btn-active={dashboardOpen} href="/dashboard">
      Dashboard
    </a>

    <a
      class="btn btn-ghost"
      class:btn-active={consolidadaOpen}
      href="/consolidada"
    >
      Visão consolidada
    </a>

    <NavbarDropdown label="Carteira" active={carteiraOpen} panelClass="w-56">
      <li>
        <a
          href="/portfolios"
          class:active={pathname === '/portfolios' || pathname.startsWith('/portfolios/')}
        >
          Carteiras
        </a>
      </li>
      <li>
        <a href="/rebalanceamento" class:active={rebalanceOpen}>Rebalanceamento</a>
      </li>
      <li>
        <a href="/analise/sumario" class:active={analiseOpen}>Análise de ativos</a>
      </li>
      <li>
        <a
          href="/proventos"
          class:active={pathname === '/proventos' || pathname.startsWith('/proventos/')}
        >
          Proventos
        </a>
      </li>
    </NavbarDropdown>

    <NavbarDropdown label="Banco de dados" active={bancoDadosOpen}>
      <li>
        <a
          href="/assets"
          class:active={pathname === '/assets' || pathname.startsWith('/assets/')}
        >
          Ativos
        </a>
      </li>
      <li>
        <a
          href="/dados"
          class:active={pathname === '/dados' || pathname.startsWith('/dados/')}
        >
          Dados
        </a>
      </li>
    </NavbarDropdown>

    <NavbarDropdown label="Ferramentas" active={ferramentasOpen} panelClass="w-56">
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
    </NavbarDropdown>

    <NavbarDropdown label="Financeiro" active={financeiroOpen}>
      <li>
        <a href="/financeiro" class:active={pathname === '/financeiro' || pathname === '/financeiro/'}>
          Painel
        </a>
      </li>
      <li>
        <a href="/financeiro/orcamento" class:active={pathname.startsWith('/financeiro/orcamento')}>
          Orçamento
        </a>
      </li>
      <li>
        <a href="/financeiro/despesas" class:active={pathname.startsWith('/financeiro/despesas')}>
          Despesas
        </a>
      </li>
      <li>
        <a href="/financeiro/metas" class:active={pathname.startsWith('/financeiro/metas')}>
          Metas
        </a>
      </li>
      <li>
        <a href="/financeiro/renda" class:active={pathname.startsWith('/financeiro/renda')}>
          Renda
        </a>
      </li>
      <li>
        <a href="/financeiro/perfis" class:active={pathname.startsWith('/financeiro/perfis')}>
          Perfis
        </a>
      </li>
    </NavbarDropdown>

    <div class="ml-auto flex items-center gap-1">
      <button
        type="button"
        class="btn btn-ghost btn-circle"
        data-testid="toggle-theme-btn"
        aria-pressed={$theme === 'dark'}
        aria-label={$theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        title={$theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        on:click={toggleTheme}
      >
        {#if $theme === 'dark'}
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
