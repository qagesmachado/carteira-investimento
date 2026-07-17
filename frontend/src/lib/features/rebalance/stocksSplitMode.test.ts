import { describe, expect, it, vi } from 'vitest';

import { defaultAllocationTargets } from './allocationTargets';
import { stocksSplitModeConfirmMessage, stocksSplitModeLabel } from './stocksSplitMode';

describe('stocksSplitMode', () => {
  it('rotula modos conhecidos', () => {
    expect(stocksSplitModeLabel('by_subtype')).toContain('subtipo');
    expect(stocksSplitModeLabel('unified')).toContain('Conjunto');
  });

  it('monta mensagem de confirmação ao trocar modo', () => {
    const message = stocksSplitModeConfirmMessage('by_subtype', 'unified');
    expect(message).toContain('Conjunto único');
  });
});

describe('allocationTargets stocks_split_mode', () => {
  it('não exige soma ETF/Ação no modo unified', async () => {
    const { validateAllocationTargets } = await import('./allocationTargets');
    const targets = defaultAllocationTargets();
    targets.stocks_split_mode = 'unified';
    targets.stocks_split.etf = 80;
    targets.stocks_split.stock = 30;
    expect(validateAllocationTargets(targets)).toBeNull();
  });
});
