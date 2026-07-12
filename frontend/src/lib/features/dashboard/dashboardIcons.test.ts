import { describe, expect, it } from 'vitest';

import { dashboardIconPath, KPI_ICON_ACCENTS } from './dashboardIcons';

describe('dashboardIcons', () => {
  it('maps icon names to static paths', () => {
    expect(dashboardIconPath('wallet')).toBe('/icons/dashboard/wallet.svg');
    expect(dashboardIconPath('target')).toBe('/icons/dashboard/target.svg');
  });

  it('defines accent styles for each KPI', () => {
    expect(Object.keys(KPI_ICON_ACCENTS)).toHaveLength(6);
    expect(KPI_ICON_ACCENTS.patrimony.icon).toBe('wallet');
    expect(KPI_ICON_ACCENTS.profit.fgClass).toContain('success');
  });
});
