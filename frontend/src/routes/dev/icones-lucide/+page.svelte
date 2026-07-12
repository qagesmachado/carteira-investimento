<script lang="ts">
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import {
    LAST_DIVIDEND_LUCIDE_ICON,
    LUCIDE_ICON_GALLERY
  } from '$lib/icons/lucideIconCatalog';

  function lucideDocSlug(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
</script>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-2-px-4" class="flex flex-col gap-3">
    <PageHeader
      title="Ícones Lucide"
      subtitle="Padrão do projeto para ícones de UI. Registre escolhas em lucideIconCatalog.ts."
    />

    <p class="text-sm text-base-content/70">
      Catálogo oficial:
      <a class="link link-primary" href="https://lucide.dev/icons/" target="_blank" rel="noreferrer">
        lucide.dev/icons
      </a>
      · Regra de ícones:
      <code class="text-xs">.cursor/rules/app/lucide-icons.mdc</code>
      · Índice:
      <code class="text-xs">.cursor/rules/README.md</code>
      · Último provento (exemplo):
      <strong>{LAST_DIVIDEND_LUCIDE_ICON}</strong>
    </p>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="lucide-icon-gallery">
      {#each LUCIDE_ICON_GALLERY as entry (entry.name)}
        <article
          class="card bg-base-100 shadow {entry.name === LAST_DIVIDEND_LUCIDE_ICON
            ? 'ring-2 ring-success'
            : ''}"
          data-testid="lucide-icon-option-{entry.name}"
        >
          <div class="card-body flex-row items-center gap-4 p-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
              aria-hidden="true"
            >
              <LucideIcon name={entry.name} size="lg" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold">{entry.label}</p>
              <p class="font-mono text-sm text-base-content/70">{entry.name}</p>
              <a
                class="link link-primary text-xs"
                href="https://lucide.dev/icons/{lucideDocSlug(entry.name)}"
                target="_blank"
                rel="noreferrer"
              >
                Ver no Lucide
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </AppPageShell>
</main>
