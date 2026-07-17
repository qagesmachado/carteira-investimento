import { describe, expect, it } from 'vitest';

import { defaultAllocationTargets } from './allocationTargets';
import { enforceStocksSplitUnifiedForSimples } from './stocksSplitSimplesLock';

describe('stocksSplitSimplesLock', () => {
  it('força modo conjunto único nos targets', () => {
    const targets = defaultAllocationTargets();
    targets.stocks_split_mode = 'by_subtype';

    enforceStocksSplitUnifiedForSimples(targets);

    expect(targets.stocks_split_mode).toBe('unified');
  });
});
