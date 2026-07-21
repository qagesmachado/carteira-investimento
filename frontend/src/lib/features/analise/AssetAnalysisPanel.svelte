<script lang="ts">
  import { tick } from 'svelte';

  import type { CriterionDefinition, SegmentCatalogEntry } from '$lib/api/analysis';
  import { PROFILE_FII_BR } from '$lib/api/analysis';
  import {
    allAnalysisCriterionCodes,
    buildEmptyAnalysisDraft,
    hasUnsavedAnalysisDraft,
    normalizeRefMap,
    normalizeScoreMap,
    segmentCriterionCodes
  } from '$lib/features/analise/analysisDraft';
  import FundamentalIndicatorsPreview from '$lib/features/analise/FundamentalIndicatorsPreview.svelte';
  import {
    PVP_DESCARTE_CODE,
    SEGMENTO_FII_CODE,
    VIABILIDADE_CODE,
    summarizeAnalysis
  } from '$lib/features/analise/computeAnalysis';
  import { scoreOptionDropdownLabel } from '$lib/features/analise/scoreLabels';
  import { formatDiagramScore } from '$lib/features/analise/viabilityBadge';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let open = false;
  export let assetId: number | null = null;
  export let symbol = '';
  export let name = '';
  export let assetType = '';
  export let profile: string = 'stock_br';
  export let criteria: CriterionDefinition[] = [];
  export let segments: SegmentCatalogEntry[] = [];
  export let scores: Record<string, number | null> = {};
  export let scoreRefs: Record<string, string | null> = {};
  export let loading = false;
  export let isPending = false;
  export let showPendingToggle = false;
  export let onSave: (
    scores: Record<string, number | null>,
    scoreRefs: Record<string, string | null>,
    pending?: boolean
  ) => void | Promise<void> = () => undefined;
  export let onClose: () => void = () => undefined;

  const STOCK_INDICATOR_CODES = ['lucros', 'divida', 'tag_along', 'segmento'] as const;
  const FII_INDICATOR_CODES = ['vacancia', 'qtd_ativos', 'alavancagem', SEGMENTO_FII_CODE] as const;

  let dialog: HTMLDialogElement;
  let activeTab: 'fundamental' | 'diagrama' = 'fundamental';
  let draftScores: Record<string, number | null> = {};
  let draftScoreRefs: Record<string, string | null> = {};
  let baselineScores: Record<string, number | null> = {};
  let baselineScoreRefs: Record<string, string | null> = {};
  let draftPending = false;
  let baselinePending = false;
  let wasOpen = false;
  let loadedAssetKey = '';
  let draftSyncGeneration = 0;
  let syncToken = 0;
  let resetConfirmOpen = false;

  $: isFii = profile === PROFILE_FII_BR;
  $: fundamentalTabLabel = isFii ? 'Viabilidade' : 'Fundamental';
  $: diagramTabLabel = isFii ? 'Diagrama FIIs' : 'Diagrama do Cerrado';
  $: previewIndicatorCodes = isFii ? FII_INDICATOR_CODES : STOCK_INDICATOR_CODES;
  $: indicatorCriteria = criteria.filter(
    (c) =>
      c.block === 'fundamental' &&
      c.code !== VIABILIDADE_CODE &&
      c.input_type !== 'segment'
  );
  $: segmentCriterion = criteria.find((c) => c.input_type === 'segment');
  $: viabilidadeCriterion = criteria.find((c) => c.code === VIABILIDADE_CODE);
  $: diagramaCriteria = criteria.filter(
    (c) => c.block === 'diagrama' && c.input_type !== 'flag'
  );
  $: flagCriterion = criteria.find((c) => c.input_type === 'flag');
  $: preview = summarizeAnalysis(
    draftScores,
    criteria.map((c) => ({
      code: c.code,
      block: c.block as 'fundamental' | 'diagrama',
      label: c.label,
      help_text: c.help_text,
      weight: c.weight,
      sort_order: c.sort_order,
      input_type: c.input_type,
      score_options: c.score_options
    })),
    []
  );
  $: hasUnsavedChanges =
    open &&
    hasUnsavedAnalysisDraft(
      draftScores,
      baselineScores,
      draftScoreRefs,
      baselineScoreRefs,
      showPendingToggle ? draftPending : undefined,
      showPendingToggle ? baselinePending : undefined
    );
  $: currentAssetKey =
    assetId != null ? `id:${assetId}` : symbol ? `${profile}:${symbol}` : '';
  $: draftContentKey = `${loadedAssetKey}:${draftSyncGeneration}`;

  $: if (dialog) {
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }

  let draftDirty = false;

  function clearDraftState() {
    draftScores = {};
    draftScoreRefs = {};
    baselineScores = {};
    baselineScoreRefs = {};
    draftPending = false;
    baselinePending = false;
    loadedAssetKey = '';
    draftDirty = false;
    draftSyncGeneration += 1;
  }

  function captureBaselineAndDraft() {
    baselineScores = normalizeScoreMap(scores);
    baselineScoreRefs = normalizeRefMap(scoreRefs);
    draftScores = { ...baselineScores };
    draftScoreRefs = { ...baselineScoreRefs };
    baselinePending = isPending;
    draftPending = isPending;
    loadedAssetKey = currentAssetKey;
    draftDirty = false;
    draftSyncGeneration += 1;
  }

  function markDraftDirty() {
    draftDirty = true;
  }

  async function syncDraftFromProps() {
    const token = ++syncToken;
    const assetKey = currentAssetKey;
    if (assetKey !== loadedAssetKey) {
      draftScores = {};
      draftScoreRefs = {};
      loadedAssetKey = '';
      draftDirty = false;
      draftSyncGeneration += 1;
    }
    await tick();
    if (!open || token !== syncToken || currentAssetKey !== assetKey) return;
    // Não sobrescrever rascunho se o usuário já interagiu durante o tick.
    if (draftDirty) return;
    captureBaselineAndDraft();
  }

  $: if (open && currentAssetKey) {
    if (!wasOpen || currentAssetKey !== loadedAssetKey) {
      wasOpen = true;
      // Captura síncrona imediata (props já vêm do pai ao abrir) + sync pós-tick.
      captureBaselineAndDraft();
      void syncDraftFromProps();
    }
  } else if (!open) {
    if (wasOpen) {
      syncToken += 1;
      clearDraftState();
    }
    wasOpen = false;
    resetConfirmOpen = false;
  }

  function scoreSelectValue(code: string): string {
    const value = draftScores[code];
    return value == null ? '' : String(value);
  }

  function handleDialogClose() {
    onClose();
  }

  function handleCancel() {
    onClose();
  }

  function setScore(code: string, raw: string) {
    markDraftDirty();
    draftScores = {
      ...draftScores,
      [code]: raw === '' ? null : Number(raw)
    };
  }

  function setSegment(slug: string) {
    markDraftDirty();
    const segment = segments.find((s) => s.slug === slug);
    draftScoreRefs = { ...draftScoreRefs, [SEGMENTO_FII_CODE]: slug || null };
    draftScores = {
      ...draftScores,
      [SEGMENTO_FII_CODE]: segment ? segment.score : null
    };
  }

  function togglePvpDescarte(checked: boolean) {
    markDraftDirty();
    draftScores = {
      ...draftScores,
      [PVP_DESCARTE_CODE]: checked ? 1 : 0
    };
  }

  function requestReset() {
    resetConfirmOpen = true;
  }

  function cancelReset() {
    resetConfirmOpen = false;
  }

  function confirmReset() {
    markDraftDirty();
    const empty = buildEmptyAnalysisDraft(
      allAnalysisCriterionCodes(criteria),
      segmentCriterionCodes(criteria)
    );
    draftScores = { ...empty.scores, [PVP_DESCARTE_CODE]: 0 };
    draftScoreRefs = { ...empty.scoreRefs };
    draftSyncGeneration += 1;
    resetConfirmOpen = false;
  }

  function setPending(checked: boolean) {
    markDraftDirty();
    draftPending = checked;
  }

  async function handleSubmit() {
    await onSave(
      draftScores,
      draftScoreRefs,
      showPendingToggle ? draftPending : undefined
    );
  }
</script>

<dialog class="modal" bind:this={dialog} aria-modal="true" on:close={handleDialogClose}>
  <div class="modal-box relative max-h-[90vh] max-w-3xl overflow-y-auto">
    {#if open}
      <h3 class="text-lg font-bold">Classificar — {formatTickerForDisplay(symbol)}</h3>
      <p class="mt-1 text-sm text-base-content/70">
        {name} · {formatAssetTypeForDisplay(assetType)}
      </p>

      <div role="tablist" class="tabs tabs-boxed mt-4">
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={activeTab === 'fundamental'}
          on:click={() => (activeTab = 'fundamental')}>{fundamentalTabLabel}</button
        >
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={activeTab === 'diagrama'}
          on:click={() => (activeTab = 'diagrama')}>{diagramTabLabel}</button
        >
      </div>

      {#key draftContentKey}
        {#if activeTab === 'fundamental'}
          <FundamentalIndicatorsPreview
            indicatorCodes={previewIndicatorCodes}
            {criteria}
            scores={draftScores}
            {segments}
            scoreRefs={draftScoreRefs}
          />

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            {#each indicatorCriteria as criterion (criterion.code)}
              <label class="form-control">
                <div class="label py-0">
                  <span class="label-text font-medium" title={criterion.help_text}>{criterion.label}</span>
                </div>
                <select
                  class="select select-bordered select-sm"
                  value={scoreSelectValue(criterion.code)}
                  on:change={(event) => setScore(criterion.code, event.currentTarget.value)}
                >
                  <option value="">Sem classificação</option>
                  {#each criterion.score_options as option (option.value)}
                    <option value={String(option.value)}>{scoreOptionDropdownLabel(option)}</option>
                  {/each}
                </select>
              </label>
            {/each}

            {#if segmentCriterion}
              <label class="form-control">
                <div class="label py-0">
                  <span class="label-text font-medium" title={segmentCriterion.help_text}
                    >{segmentCriterion.label}</span
                  >
                </div>
                <select
                  class="select select-bordered select-sm"
                  value={draftScoreRefs[SEGMENTO_FII_CODE] ?? ''}
                  on:change={(event) => setSegment(event.currentTarget.value)}
                >
                  <option value="">Sem segmento</option>
                  {#each segments as segment (segment.slug)}
                    <option value={segment.slug}>{segment.name}</option>
                  {/each}
                </select>
              </label>
            {/if}
          </div>

          {#if viabilidadeCriterion}
            <div class="mt-6">
              <label class="form-control max-w-md">
                <div class="label py-0">
                  <span class="label-text font-medium">Viabilidade</span>
                </div>
                <select
                  class="select select-bordered select-sm"
                  value={scoreSelectValue(VIABILIDADE_CODE)}
                  on:change={(event) => setScore(VIABILIDADE_CODE, event.currentTarget.value)}
                >
                  <option value="">Sem classificação</option>
                  {#each viabilidadeCriterion.score_options as option (option.value)}
                    <option value={String(option.value)}>{option.value} - {option.seal ?? option.label}</option>
                  {/each}
                </select>
              </label>
            </div>
          {/if}
        {:else}
          <div class="mt-4 space-y-4">
            {#each diagramaCriteria as criterion (criterion.code)}
              <fieldset class="rounded-lg border border-base-300 p-3">
                <legend class="px-1 text-sm font-medium">{criterion.label}</legend>
                <p class="mb-2 text-sm text-base-content/80">{criterion.help_text}</p>
                <div class="flex flex-wrap gap-4">
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      class="radio radio-sm"
                      name={`diagrama-${criterion.code}`}
                      aria-label="{criterion.label} — Sim (+1)"
                      checked={draftScores[criterion.code] === 1}
                      on:change={() => setScore(criterion.code, '1')}
                    />
                    <span class="label-text">Sim (+1)</span>
                  </label>
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      class="radio radio-sm"
                      name={`diagrama-${criterion.code}`}
                      aria-label="{criterion.label} — Não (-1)"
                      checked={draftScores[criterion.code] === -1}
                      on:change={() => setScore(criterion.code, '-1')}
                    />
                    <span class="label-text">Não (-1)</span>
                  </label>
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      class="radio radio-sm"
                      name={`diagrama-${criterion.code}`}
                      checked={draftScores[criterion.code] == null}
                      on:change={() => setScore(criterion.code, '')}
                    />
                    <span class="label-text">Sem resposta</span>
                  </label>
                </div>
              </fieldset>
            {/each}

            {#if flagCriterion}
              <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-error/40 bg-error/5 p-3">
                <input
                  type="checkbox"
                  class="checkbox checkbox-error checkbox-sm mt-0.5"
                  aria-label="P/VP acima de 1,5 — descartar investimento"
                  checked={draftScores[PVP_DESCARTE_CODE] === 1}
                  on:change={(event) => togglePvpDescarte(event.currentTarget.checked)}
                />
                <span>
                  <span class="font-medium">{flagCriterion.label}</span>
                  <span class="mt-1 block text-sm text-base-content/80">{flagCriterion.help_text}</span>
                </span>
              </label>
            {/if}
          </div>

          <div class="mt-4 rounded-lg bg-base-200 p-4 text-sm">
            <p class="font-medium">Pontuação do diagrama</p>
            <p class="mt-1 text-base-content/80">
              Soma das respostas: {formatDiagramScore(preview.diagrama.score)}
            </p>
          </div>
        {/if}
      {/key}

      {#if hasUnsavedChanges}
        <div
          class="alert alert-warning mt-4 justify-start py-2 text-left text-sm"
          role="alert"
          data-testid="analysis-unsaved-changes-alert"
        >
          <span>
            Há alterações não salvas. Clique em <strong>Salvar classificação</strong> para aplicar.
          </span>
        </div>
      {/if}

      {#if showPendingToggle}
        <label
          class="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-3"
          data-testid="analysis-pending-toggle"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-warning checkbox-sm mt-0.5"
            checked={draftPending}
            on:change={(event) => setPending(event.currentTarget.checked)}
          />
          <span>
            <span class="font-medium">Marcar como pendente</span>
            <span class="mt-1 block text-sm text-base-content/80">
              O ativo deixa de entrar nos totais de alocação e percentuais desta carteira até ser
              desmarcado.
            </span>
          </span>
        </label>
      {/if}

      <div class="modal-action flex-wrap items-center">
        <button type="button" class="btn btn-outline btn-sm" on:click={requestReset}>Resetar</button>
        <div class="flex flex-1 justify-end gap-2">
          <button type="button" class="btn btn-ghost" on:click={handleCancel}>Cancelar</button>
          <button type="button" class="btn btn-primary" disabled={loading} on:click={handleSubmit}>
            {loading ? 'Salvando…' : 'Salvar classificação'}
          </button>
        </div>
      </div>

      {#if resetConfirmOpen}
        <div
          class="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-base-300/80 p-4"
          role="presentation"
        >
          <div
            class="modal-box max-w-md shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-confirm-title"
          >
            <h4 id="reset-confirm-title" class="text-lg font-bold">Resetar classificação?</h4>
            <p class="mt-2 text-sm text-base-content/80">
              Todas as respostas da aba {fundamentalTabLabel} e do {diagramTabLabel} serão limpas
              (sem classificação / sem resposta). A janela permanecerá aberta — use
              <strong>Cancelar</strong> para descartar tudo ou <strong>Salvar classificação</strong> para
              persistir o reset.
            </p>
            <div class="modal-action">
              <button type="button" class="btn btn-ghost" on:click={cancelReset}>Voltar</button>
              <button type="button" class="btn btn-error" on:click={confirmReset}>Limpar tudo</button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit" aria-label="Fechar">fechar</button>
  </form>
</dialog>
