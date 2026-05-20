import { describe, expect, it } from 'vitest';

import {
  buildFixedIncomeIdentifier,
  extractYearFromIsoDate,
  titleTypeCodeToIdentifierPart
} from './fixedIncomeIdentifier';

describe('fixedIncomeIdentifier', () => {
  it('extractYearFromIsoDate retorna ano em ISO', () => {
    expect(extractYearFromIsoDate('2028-06-15')).toBe('2028');
    expect(extractYearFromIsoDate(' 2028-06-15 ')).toBe('2028');
    expect(extractYearFromIsoDate('invalid')).toBeNull();
  });

  it('titleTypeCodeToIdentifierPart mapeia códigos conhecidos', () => {
    expect(titleTypeCodeToIdentifierPart('cdb')).toBe('CDB');
    expect(titleTypeCodeToIdentifierPart('tesouro_selic')).toBe('Selic');
  });

  it('buildFixedIncomeIdentifier monta padrão tipo + indexador + ano', () => {
    const r = buildFixedIncomeIdentifier({
      titleTypeCode: 'cdb',
      titleTypeOther: '',
      indexer: 'ipca_plus',
      maturityDateIso: '2028-01-15'
    });
    expect(r.ok && r.value).toBeTruthy();
    if (r.ok) {
      expect(r.value).toBe('CDB IPCA+ 2028');
    }
  });

  it('Outro usa texto digitado', () => {
    const r = buildFixedIncomeIdentifier({
      titleTypeCode: 'other',
      titleTypeOther: 'CRI XYZ',
      indexer: 'prefixed',
      maturityDateIso: '2030-12-31'
    });
    expect(r.ok && r.value).toBeTruthy();
    if (r.ok) {
      expect(r.value).toBe('CRI XYZ Pré-fixado 2030');
    }
  });

  it('falha sem vencimento', () => {
    const r = buildFixedIncomeIdentifier({
      titleTypeCode: 'cdb',
      titleTypeOther: '',
      indexer: 'ipca_plus',
      maturityDateIso: ''
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toContain('vencimento');
    }
  });

  it('falha sem indexador', () => {
    const r = buildFixedIncomeIdentifier({
      titleTypeCode: 'cdb',
      titleTypeOther: '',
      indexer: '',
      maturityDateIso: '2028-01-01'
    });
    expect(r.ok).toBe(false);
  });
});
