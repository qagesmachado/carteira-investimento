<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
</script>

<div class="flex flex-col gap-4" data-testid="analysis-overview-section">
  <h2 class="card-title mb-0 flex items-center gap-2 text-lg text-primary">
    <span aria-hidden="true">
      <LucideIcon name="BookOpen" size="md" />
    </span>
    Orientações
  </h2>

  <div class="grid gap-4 lg:grid-cols-2">
    <article
      class="flex gap-3 rounded-xl border border-info/30 bg-info/5 p-4"
      data-testid="analysis-overview-vision"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/10 text-info"
        aria-hidden="true"
      >
        <LucideIcon name="Info" size="md" />
      </div>
      <div class="min-w-0">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-info">Visão geral</h3>
        <p class="mt-2 text-sm text-base-content/80">
          Estas páginas formam o <strong>centro de análise</strong> da sua carteira de investimentos.
          Aqui você acompanha o status geral — quantos ativos já foram classificados e quantos ainda
          estão pendentes — e acessa cada classe para avaliar qualitativamente suas posições. O
          objetivo é manter uma visão clara e atualizada da composição, antes de rebalancear ou definir
          aportes.
        </p>
      </div>
    </article>

    <article
      class="flex gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4"
      data-testid="analysis-overview-config"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary"
        aria-hidden="true"
      >
        <LucideIcon name="Settings" size="md" />
      </div>
      <div class="min-w-0">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-secondary">Como configurar</h3>
        <p class="mt-2 text-sm text-base-content/80">
          Acesse <strong>cada classe de ativos</strong> pelas abas ou atalhos e use os critérios de
          análise disponíveis para classificar e avaliar qualitativamente suas posições. Os métodos
          podem variar conforme o tipo de ativo. Ao revisar as áreas relevantes para sua carteira,
          você obtém as informações para um <strong>balanceamento adequado</strong> entre as classes.
        </p>
      </div>
    </article>
  </div>
</div>
