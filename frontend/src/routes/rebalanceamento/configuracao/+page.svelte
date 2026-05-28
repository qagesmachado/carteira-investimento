<script lang="ts">
  import { onMount } from 'svelte';

  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    updatePortfolio,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import {
    CLASS_TARGET_FIELDS,
    defaultAllocationTargets,
    parseAllocationTargets,
    serializeAllocationTargets,
    validateAllocationTargets,
    type AllocationTargets
  } from '$lib/features/rebalance/allocationTargets';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let targets: AllocationTargets = defaultAllocationTargets();
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';

  $: classSum =
    targets.classes.stocks +
    targets.classes.funds +
    targets.classes.international +
    targets.classes.fixed_income +
    targets.classes.crypto;
  $: splitSum = targets.stocks_split.etf + targets.stocks_split.stock;

  async function loadPage() {
    loading = true;
    error = '';
    try {
      portfolios = await listPortfolios();
      activeId = (await getActivePortfolioId()) ?? portfolios[0]?.id ?? null;
      const portfolio = portfolios.find((p) => p.id === activeId) ?? null;
      if (portfolio) {
        targets = parseAllocationTargets(portfolio.allocation_targets_json);
      }
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void loadPage();
  });

  function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    const portfolio = portfolios.find((p) => p.id === id);
    if (!portfolio) return;
    activeId = id;
    targets = parseAllocationTargets(portfolio.allocation_targets_json);
  }

  async function handleSave() {
    if (activeId == null) return;
    const validationError = validateAllocationTargets(targets);
    if (validationError) {
      error = validationError;
      return;
    }
    saving = true;
    error = '';
    message = '';
    try {
      await updatePortfolio(activeId, {
        allocation_targets_json: serializeAllocationTargets(targets)
      });
      portfolios = await listPortfolios();
      message = 'Metas salvas.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar as metas.');
    } finally {
      saving = false;
    }
  }

  function handleReset() {
    targets = defaultAllocationTargets();
  }
</script>

<svelte:head>
  <title>Configuração — Rebalanceamento</title>
</svelte:head>

<main class="mx-auto max-w-3xl space-y-6 p-4">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold">Metas de rebalanceamento</h1>
      <p class="text-sm opacity-70">Percentuais alvo por classe e relação ETF/Ação.</p>
    </div>
    <a class="btn btn-sm btn-ghost" href="/rebalanceamento">Voltar</a>
  </div>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}
  {#if message}
    <DismissibleAlert variant="success" text={message} on:dismiss={() => (message = '')} />
  {/if}

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else if portfolios.length === 0}
    <p class="text-sm opacity-70">Cadastre uma carteira antes de definir metas.</p>
  {:else}
    <section class="rounded-box bg-base-100 p-4 shadow-sm space-y-4">
      <label class="form-control w-full max-w-md">
        <span class="label-text">Carteira</span>
        <PortfolioSelect
          {portfolios}
          {activeId}
          selectClass="select select-bordered"
          ariaLabel="Carteira"
          on:select={(event) => handlePortfolioSelect(event.detail)}
        />
      </label>

      <div>
        <h2 class="mb-2 font-semibold">Classes (% do patrimônio)</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          {#each CLASS_TARGET_FIELDS as field (field.key)}
            <label class="form-control" for="class-{field.key}">
              <span class="label-text">{field.label}</span>
              <input
                id="class-{field.key}"
                class="input input-bordered"
                type="number"
                min="0"
                max="100"
                step="1"
                bind:value={targets.classes[field.key]}
              />
            </label>
          {/each}
        </div>
        <p class="mt-2 text-sm" class:text-error={Math.abs(classSum - 100) > 0.01}>
          Soma das classes: {classSum.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}%
        </p>
      </div>

      <div>
        <h2 class="mb-2 font-semibold">Relação ETF / Ação (% dentro de Ações/ETF BR)</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="form-control">
            <span class="label-text">ETF</span>
            <input
              class="input input-bordered"
              type="number"
              min="0"
              max="100"
              step="1"
              bind:value={targets.stocks_split.etf}
            />
          </label>
          <label class="form-control">
            <span class="label-text">Ação</span>
            <input
              class="input input-bordered"
              type="number"
              min="0"
              max="100"
              step="1"
              bind:value={targets.stocks_split.stock}
            />
          </label>
        </div>
        <p class="mt-2 text-sm" class:text-error={Math.abs(splitSum - 100) > 0.01}>
          Soma ETF + Ação: {splitSum.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}%
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-primary" disabled={saving} on:click={handleSave}>
          {saving ? 'Salvando…' : 'Salvar metas'}
        </button>
        <button class="btn btn-ghost" type="button" disabled={saving} on:click={handleReset}>
          Restaurar padrão
        </button>
      </div>
    </section>
  {/if}
</main>
