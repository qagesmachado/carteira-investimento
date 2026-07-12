<script lang="ts">
  import { onMount } from 'svelte';

  import {
    getFiiSegments,
    saveFiiSegments,
    type SegmentCatalogEntry
  } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { fiiSegmentCatalogValidationError } from '$lib/features/analise/validateFiiSegmentCatalog';

  let segments: SegmentCatalogEntry[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';

  const SCORE_OPTIONS = [
    { value: 5, label: '5 — Viável' },
    { value: 3, label: '3 — Requer atenção' },
    { value: 2, label: '2 — Bomba' },
    { value: 1, label: '1 — Sem dados' }
  ];

  async function loadSegments() {
    loading = true;
    error = '';
    try {
      segments = await getFiiSegments();
    } catch (err) {
      segments = [];
      error = parseApiError(err, 'Não foi possível carregar segmentos.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void loadSegments();
  });

  function slugify(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function addSegment() {
    const slug = `segmento-${segments.length + 1}`;
    segments = [
      ...segments,
      {
        slug,
        name: '',
        score: 3,
        help_text: '',
        color: 'atencao',
        sort_order: segments.length + 1
      }
    ];
  }

  function removeSegment(index: number) {
    segments = segments.filter((_, i) => i !== index);
  }

  async function handleSave() {
    const validationError = fiiSegmentCatalogValidationError(segments);
    if (validationError) {
      error = validationError;
      message = '';
      return;
    }

    saving = true;
    error = '';
    message = '';
    try {
      const payload = segments.map((segment, index) => ({
        ...segment,
        weight: segment.weight ?? 1,
        slug: segment.slug || slugify(segment.name) || `segmento-${index + 1}`,
        sort_order: index + 1,
        color:
          segment.score === 5
            ? 'viavel'
            : segment.score === 3
              ? 'atencao'
              : segment.score === 2
                ? 'bomba'
                : 'sem_dados'
      }));
      segments = await saveFiiSegments(payload);
      message = 'Segmentos salvos.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar segmentos.');
    } finally {
      saving = false;
    }
  }

</script>

<svelte:head>
  <title>Análise FIIs — Segmentos</title>
</svelte:head>

<PageSection>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="card-title">Catálogo de segmentos</h2>
        <a class="link link-primary text-sm" href="/analise/fiis">← Voltar à análise</a>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" on:click={addSegment}>Adicionar</button>
        <button type="button" class="btn btn-primary btn-sm" disabled={saving || loading} on:click={handleSave}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>

    {#if message}
      <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    {/if}
    {#if error}
      <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
    {/if}

    {#if loading}
      <p class="text-sm text-base-content/70">Carregando…</p>
    {:else}
      <div class="space-y-4">
        {#each segments as segment, index (segment.slug)}
          <div class="grid gap-3 rounded-lg border border-base-300 p-4 md:grid-cols-2">
            <label class="form-control">
              <span class="label-text">Nome</span>
              <input class="input input-bordered input-sm" bind:value={segment.name} required />
            </label>
            <label class="form-control">
              <span class="label-text">Classificação</span>
              <select class="select select-bordered select-sm" bind:value={segment.score}>
                {#each SCORE_OPTIONS as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </label>
            <label class="form-control md:col-span-2">
              <span class="label-text">Texto explicativo</span>
              <textarea
                class="textarea textarea-bordered textarea-sm"
                rows="2"
                bind:value={segment.help_text}
                required
              ></textarea>
            </label>
            <div class="md:col-span-2">
              <button
                type="button"
                class="btn btn-ghost btn-xs text-error"
                on:click={() => removeSegment(index)}>Remover</button
              >
            </div>
          </div>
        {/each}
      </div>
    {/if}
</PageSection>
