<script lang="ts">
  import { onMount } from 'svelte';

  import { getAppInfo, type AppInfo } from '$lib/api/info';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import PageSection from '$lib/components/PageSection.svelte';

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

<main class="min-h-screen w-full bg-base-200">
<AppPageShell paddingY="py-2-px-4" class="flex flex-col gap-3">
  <PageHeader
    title="Informações do sistema"
    subtitle="Estado do banco de dados para conferência e suporte."
  />

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
    <PageSection class="overflow-x-auto">
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
    </PageSection>
  {/if}
</AppPageShell>
</main>
