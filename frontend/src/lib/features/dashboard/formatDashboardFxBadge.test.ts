import { describe, expect, it } from 'vitest';

import { formatDashboardFxBadge, formatDashboardFxTimestamp, formatDashboardQuotesBadge } from './formatDashboardFxBadge';

describe('formatDashboardFxBadge', () => {
  it('formata taxa e horário no padrão do painel', () => {
    expect(formatDashboardFxTimestamp('2026-07-10T14:32:00')).toBe('10/07 14:32');
    expect(formatDashboardFxBadge(5.42, '2026-07-10T14:32:00')).toBe('USD/BRL 5,42 · 10/07 14:32');
  });

  it('retorna null sem taxa', () => {
    expect(formatDashboardFxBadge(null, '2026-07-10T14:32:00')).toBeNull();
  });

  it('formata badge de cotações', () => {
    expect(formatDashboardQuotesBadge('2026-07-11T11:20:00')).toBe('Cotações · 11/07 11:20');
    expect(formatDashboardQuotesBadge(null)).toBeNull();
  });
});
