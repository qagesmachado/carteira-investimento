import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import {
  CLASS_TARGET_FIELDS,
  defaultAllocationTargets,
  formatBrl,
  parseAllocationTargets,
  serializeAllocationTargets,
  validateAllocationTargets
} from './allocationTargets';

describe('allocationTargets', () => {
  beforeEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  afterEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  it('returns defaults when json is null', () => {
    const targets = parseAllocationTargets(null);
    expect(targets.classes.stocks).toBe(20);
    expect(targets.stocks_split.etf).toBe(50);
    expect(targets.stocks_split.stock).toBe(50);
    expect(targets.stocks_split_mode).toBe('unified');
  });

  it('preserva modo by_subtype legado quando json nao informa stocks_split_mode', () => {
    const raw = JSON.stringify({
      classes: defaultAllocationTargets().classes,
      stocks_split: { etf: 70, stock: 30 }
    });
    const parsed = parseAllocationTargets(raw);
    expect(parsed.stocks_split_mode).toBe('by_subtype');
    expect(parsed.stocks_split.etf).toBe(70);
  });

  it('parses stored json', () => {
    const raw = serializeAllocationTargets({
      classes: {
        stocks: 25,
        funds: 10,
        international: 15,
        fixed_income: 45,
        crypto: 5
      },
      stocks_split: { etf: 60, stock: 40 }
    });
    const parsed = parseAllocationTargets(raw);
    expect(parsed.classes.fixed_income).toBe(45);
    expect(parsed.stocks_split.stock).toBe(40);
  });

  it('uses Criptomoeda label for crypto class field', () => {
    const label = CLASS_TARGET_FIELDS.find((f) => f.key === 'crypto')?.label;
    expect(label).toBe('Criptomoeda');
  });

  it('validates class sum', () => {
    const targets = defaultAllocationTargets();
    targets.classes.crypto = 10;
    expect(validateAllocationTargets(targets)).toMatch(/somar 100%/);
  });

  it('validates stocks split sum', () => {
    const targets = defaultAllocationTargets();
    targets.stocks_split_mode = 'by_subtype';
    targets.stocks_split.etf = 80;
    expect(validateAllocationTargets(targets)).toMatch(/ETF\/Ação/);
  });

  it('parses stocks_split_mode from json', () => {
    const raw = serializeAllocationTargets({
      ...defaultAllocationTargets(),
      stocks_split_mode: 'unified'
    });
    expect(parseAllocationTargets(raw).stocks_split_mode).toBe('unified');
  });

  it('formatBrl mascara quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    expect(formatBrl(216_000)).toBe('R$ ••••••');
  });

  it('formatBrl retorna travessão quando valor é nulo', () => {
    expect(formatBrl(null)).toBe('—');
  });
});
