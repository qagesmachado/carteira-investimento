import { describe, expect, it } from 'vitest';

import { formatTickerForDisplay } from './formatTickerForDisplay';

describe('formatTickerForDisplay', () => {
  it('remove sufixo .SA em qualquer capitalização', () => {
    expect(formatTickerForDisplay('EGIE3.SA')).toBe('EGIE3');
    expect(formatTickerForDisplay('petr4.sa')).toBe('PETR4');
  });

  it('não altera tickers sem sufixo B3', () => {
    expect(formatTickerForDisplay('VOO')).toBe('VOO');
    expect(formatTickerForDisplay('HGLG11')).toBe('HGLG11');
  });
});
