import { describe, expect, it } from 'vitest';

import { buildDashboardHeroSubtitle, formatRelativeMinutes } from './dashboardRelativeTime';

describe('dashboardRelativeTime', () => {
  const ref = new Date('2026-07-10T15:10:00');

  it('formats minutes ago', () => {
    expect(formatRelativeMinutes('2026-07-10T15:08:00', ref)).toBe('há 2 min');
  });

  it('formats now for sub-minute', () => {
    expect(formatRelativeMinutes('2026-07-10T15:09:50', ref)).toBe('agora');
  });

  it('builds hero subtitle with portfolio name', () => {
    expect(
      buildDashboardHeroSubtitle('Carteira Principal', '2026-07-10T15:08:00', ref)
    ).toBe('Carteira Principal · atualizado há 2 min');
  });

  it('falls back to portfolio name only', () => {
    expect(buildDashboardHeroSubtitle('Carteira Principal', null, ref)).toBe('Carteira Principal');
  });
});
