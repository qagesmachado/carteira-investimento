import { describe, expect, it } from 'vitest';

import {
  formatPortfolioHubMetric,
  formatPortfolioHubProfit,
  profitValueClass
} from './portfolioHubMetrics';

describe('portfolioHubMetrics', () => {
  it('formata valores em BRL pt-BR', () => {
    expect(formatPortfolioHubMetric(1234.56)).toContain('1.234,56');
    expect(formatPortfolioHubMetric(1234.56)).toContain('R$');
  });

  it('formata lucro com percentual', () => {
    const text = formatPortfolioHubProfit({
      investedBrl: 1000,
      currentBrl: 1100,
      profitBrl: 100,
      profitPct: 10
    });
    expect(text).toContain('100,00');
    expect(text).toContain('10,00%');
  });

  it('aplica classe de cor conforme sinal do lucro', () => {
    expect(profitValueClass(1)).toBe('text-success');
    expect(profitValueClass(-1)).toBe('text-error');
    expect(profitValueClass(0)).toBe('text-base-content');
  });
});
