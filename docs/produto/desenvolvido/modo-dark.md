# Modo dark (tema claro / escuro)

## Objetivo

Permitir alternar entre tema **claro** (`light`) e **escuro** (`dark`) em **todas as telas** da aplicação, com preferência persistida localmente.

## Escopo

- Toggle global no **canto superior direito** da navbar, **à esquerda** do botão de ocultar valores (ícone lua / sol).
- Preferência persistida em **`localStorage`** (`carteira.theme`) — mantida ao trocar de página e recarregar o navegador.
- Temas DaisyUI: `light` (padrão) e `dark` (escuro padrão DaisyUI).

## Regras

| Situação | Comportamento |
| -------- | ------------- |
| Primeira visita (sem preferência) | Tema `light` |
| Clique no ícone lua | Ativa tema `dark` |
| Clique no ícone sol | Volta ao tema `light` |
| Navegação entre rotas | Tema mantido |
| Reload do navegador | Preferência restaurada do `localStorage` |
| Sincronização entre dispositivos | Fora de escopo |

## Regras para novas telas

Toda tela nova (ou componente compartilhado) deve funcionar em **ambos** os temas:

1. Usar tokens DaisyUI: `bg-base-*`, `text-base-content`, `border-base-300`, `badge-*`, `btn-*`, `bg-success`, etc.
2. Evitar cores fixas de tema claro: `bg-white`, `text-gray-*`, `bg-*-100 text-*-900` sem variante tema-aware.
3. Gráficos e SVG: preferir `oklch(var(--p))` ou classes semânticas (ver `AllocationChart.svelte`).
4. Validar visualmente em `light` e `dark` antes do merge.

## Onde aparece

Navbar global — visível em todas as rotas com layout padrão.

## Implementação técnica

- Store: `frontend/src/lib/stores/theme.ts`
- Helper DOM: `frontend/src/lib/theme/applyTheme.ts`
- Script anti-FOUC: `frontend/src/app.html` (inline no `<head>`)
- Sincronização layout: `frontend/src/routes/+layout.svelte`
- Toggle: `frontend/src/lib/components/AppNavbar.svelte`
- Config DaisyUI: `frontend/tailwind.config.js` (`themes: ['light', 'dark']`)

## Casos de uso E2E

- `UI-NAV-003` — toggle, persistência entre rotas e reload

## Relacionado

- [Ocultar valores monetários](ocultar-valores.md) — toggle adjacente na navbar
