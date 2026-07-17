import type { DisplayClass } from '$lib/api/assets';
import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

import { allocationBarClassForDisplayClass } from './allocationChartColors';

export const DISPLAY_CLASS_LUCIDE_ICON: Record<DisplayClass, LucideIconName> = {
  stocks: 'CandlestickChart',
  funds: 'Building2',
  fixed_income: 'Landmark',
  international: 'Globe',
  crypto: 'Bitcoin',
  pension: 'Umbrella',
  other: 'CircleEllipsis'
};

export function lucideIconForDisplayClass(displayClass: DisplayClass | string): LucideIconName {
  return DISPLAY_CLASS_LUCIDE_ICON[displayClass as DisplayClass] ?? 'CircleEllipsis';
}

export function displayClassIconFgClass(displayClass: DisplayClass | string): string {
  return allocationBarClassForDisplayClass(displayClass).replace(/^bg-/, 'text-');
}

export function displayClassIconSurfaceClass(displayClass: DisplayClass | string): string {
  return `${allocationBarClassForDisplayClass(displayClass)}/15`;
}
