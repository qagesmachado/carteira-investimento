<script lang="ts">
  import { onMount } from 'svelte';

  import { getAppInfo, type AppInfo } from '$lib/api/info';

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
      Estado do banco de dados para conferência e suporte.
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
            <th class="w-1/3">Banco (arquivo do usuário)</th>
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
            <th>Caminho do banco</th>
            <td class="break-all font-mono text-xs" data-testid="info-db-path">
              {info.database_path}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}
</main>
