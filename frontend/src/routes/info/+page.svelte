<script lang="ts">
  import { onMount } from 'svelte';

  import { getAppInfo, type AppInfo } from '$lib/api/info';
  import { FRONTEND_VERSION } from '$lib/version';

  let info: AppInfo | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      info = await getAppInfo();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Falha ao carregar informações.';
    } finally {
      loading = false;
    }
  });
</script>

<main class="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
  <header>
    <h1 class="text-2xl font-bold">Informações do sistema</h1>
    <p class="text-sm text-base-content/60">
      Versões e detalhes técnicos para conferência e suporte.
    </p>
  </header>

  {#if loading}
    <div class="flex items-center gap-2 text-base-content/60">
      <span class="loading loading-spinner loading-sm"></span>
      Carregando…
    </div>
  {:else if error}
    <div class="alert alert-error" data-testid="info-error">
      <span>{error}</span>
    </div>
  {:else if info}
    <section class="overflow-x-auto rounded-box bg-base-100 shadow-sm">
      <table class="table" data-testid="info-table">
        <tbody>
          <tr>
            <th class="w-1/3">Aplicação (backend)</th>
            <td data-testid="info-app-version">v{info.app_version}</td>
          </tr>
          <tr>
            <th>Frontend</th>
            <td data-testid="info-frontend-version">v{FRONTEND_VERSION}</td>
          </tr>
          <tr>
            <th>Schema esperado (código)</th>
            <td data-testid="info-schema-version">v{info.schema_version}</td>
          </tr>
          <tr>
            <th>Banco (arquivo do usuário)</th>
            <td class="flex flex-wrap items-center gap-2">
              <span data-testid="info-db-version">v{info.db_user_version}</span>
              {#if info.db_up_to_date}
                <span class="badge badge-success badge-sm" data-testid="info-db-status">
                  atualizado
                </span>
              {:else}
                <span class="badge badge-warning badge-sm" data-testid="info-db-status">
                  desatualizado
                </span>
              {/if}
            </td>
          </tr>
          <tr>
            <th>Python</th>
            <td data-testid="info-python-version">{info.python_version}</td>
          </tr>
          <tr>
            <th>Modo de lookup</th>
            <td data-testid="info-lookup-mode">{info.lookup_mode}</td>
          </tr>
          <tr>
            <th>Caminho do banco</th>
            <td class="break-all font-mono text-xs" data-testid="info-db-path">
              {info.database_path}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    {#if info.release_notes.length > 0}
      <section
        class="rounded-box bg-base-100 p-4 shadow-sm"
        data-testid="info-release-notes"
      >
        <h2 class="flex flex-wrap items-center gap-2 text-lg font-semibold">
          Novidades da versão v{info.app_version}
          {#if info.released_at}
            <span class="text-sm font-normal text-base-content/60" data-testid="info-released-at">
              {info.released_at}
            </span>
          {/if}
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
          {#each info.release_notes as note}
            <li>{note}</li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}
</main>
