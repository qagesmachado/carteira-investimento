import { describe, expect, it } from 'vitest';

import { formatIsoDateToBr, parseBrDateToIso, sanitizeBrDateTyping } from './brDate';

describe('brDate', () => {
  it('formatIsoDateToBr', () => {
    expect(formatIsoDateToBr('2028-06-15')).toBe('15/06/2028');
    expect(formatIsoDateToBr(null)).toBe('');
  });

  it('parseBrDateToIso aceita DD/MM/AAAA', () => {
    expect(parseBrDateToIso('15/06/2028')).toBe('2028-06-15');
    expect(parseBrDateToIso('5/6/2028')).toBe('2028-06-05');
    expect(parseBrDateToIso('31/01/2030')).toBe('2030-01-31');
  });

  it('parseBrDateToIso aceita ISO colado', () => {
    expect(parseBrDateToIso('2028-06-15')).toBe('2028-06-15');
  });

  it('parseBrDateToIso rejeita inválidos', () => {
    expect(parseBrDateToIso('')).toBeNull();
    expect(parseBrDateToIso('32/01/2028')).toBeNull();
    expect(parseBrDateToIso('15-06-2028')).toBeNull();
  });

  it('sanitizeBrDateTyping converte ISO colado em BR', () => {
    expect(sanitizeBrDateTyping('2028-06-15')).toBe('15/06/2028');
  });
});
