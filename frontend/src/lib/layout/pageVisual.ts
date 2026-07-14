export const PAGE_BACKGROUND_CLASS = 'min-h-screen w-full bg-base-200';
export const PAGE_CONTENT_GAP_CLASS = 'flex flex-col gap-3';
export const PAGE_GRID_GAP_CLASS = 'gap-3';
export const PAGE_SECTION_CLASS = 'card bg-base-100 shadow';

export type PageHeroVariant = 'primary' | 'secondary' | 'neutral' | 'dashboard';

const HERO_VARIANT_CLASS: Record<PageHeroVariant, string> = {
  primary: 'bg-gradient-to-r from-primary to-secondary text-primary-content',
  secondary: 'bg-gradient-to-r from-secondary to-accent text-secondary-content',
  neutral: 'bg-gradient-to-r from-neutral to-base-300 text-neutral-content',
  dashboard: 'bg-gradient-to-r from-indigo-700 via-violet-600 to-teal-400 text-white'
};

const HERO_SUBTITLE_CLASS: Record<PageHeroVariant, string> = {
  primary: 'text-primary-content/90',
  secondary: 'text-secondary-content/90',
  neutral: 'text-neutral-content/80',
  dashboard: 'text-white/90'
};

export function pageHeroClass(variant: PageHeroVariant): string {
  return `w-full min-w-0 rounded-box px-6 py-10 ${HERO_VARIANT_CLASS[variant]}`;
}

export function pageHeroSubtitleClass(variant: PageHeroVariant): string {
  return `mt-2 ${HERO_SUBTITLE_CLASS[variant]}`;
}

/** Botões de ação no hero `variant="dashboard"` (Dashboard, consolidada, hub de carteiras). */
export const PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS =
  'btn btn-outline min-h-[2.75rem] gap-2.5 border-white/30 bg-white/10 px-5 text-[1.09375rem] text-white hover:border-white hover:bg-white/20';
