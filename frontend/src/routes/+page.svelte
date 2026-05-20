<script lang="ts">
  import { getHealth } from '$lib/api/health';

  let apiStatus = 'não consultado';

  async function checkApi() {
    try {
      const health = await getHealth();
      apiStatus = health.status;
    } catch {
      apiStatus = 'indisponível';
    }
  }
</script>

<main class="min-h-screen w-full bg-base-200">
  <div class="hero min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-2xl">
        <h1 class="text-5xl font-bold">Carteira de Investimentos</h1>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a class="btn btn-primary" href="/assets">Cadastrar ativos</a>
          <a class="btn btn-secondary" href="/portfolios">Carteiras</a>
          <button class="btn btn-outline" type="button" on:click={checkApi}>Verificar API</button>
        </div>

        <p class="mt-8 text-sm text-base-content/70">
          Status da API: <span class="font-semibold">{apiStatus}</span>
        </p>
      </div>
    </div>
  </div>
</main>
