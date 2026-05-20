import { describe, expect, it } from 'vitest';

import {
  formatAssetTypeForDisplay,
  formatCountryCodeForDisplay,
  formatCurrencyCodeForDisplay,
  formatDecimalBR,
  formatDisplayClassForDisplay,
  formatSectorForDisplay,
  parseDecimalBR
} from './assetLabels';

describe('assetLabels', () => {
  it('traduz tipo de ativo para português', () => {
    expect(formatAssetTypeForDisplay('stock')).toBe('Ação');
    expect(formatAssetTypeForDisplay('etf')).toBe('ETF');
    expect(formatAssetTypeForDisplay('fii')).toBe('Fundo imobiliário');
    expect(formatAssetTypeForDisplay('fixed_income')).toBe('Renda fixa');
  });

  it('traduz classe de exibição para português', () => {
    expect(formatDisplayClassForDisplay('stocks')).toBe('Ações e ETFs (Brasil)');
    expect(formatDisplayClassForDisplay('international')).toBe('Internacional');
    expect(formatDisplayClassForDisplay('fixed_income')).toBe('Renda fixa');
  });

  it('rotula moeda em português', () => {
    expect(formatCurrencyCodeForDisplay('BRL')).toBe('Real (BRL)');
    expect(formatCurrencyCodeForDisplay('usd')).toBe('Dólar (USD)');
  });

  it('rotula país em português com código ISO', () => {
    expect(formatCountryCodeForDisplay('BR')).toMatch(/Brasil/);
    expect(formatCountryCodeForDisplay('BR')).toContain('BR');
  });

  it('traduz setores comuns do inglês', () => {
    expect(formatSectorForDisplay('Healthcare')).toBe('Saúde');
    expect(formatSectorForDisplay('Unknown Sector XYZ')).toBe('Unknown Sector XYZ');
  });

  it('formata e interpreta decimais no padrão brasileiro', () => {
    expect(formatDecimalBR(19.64)).toBe('19,64');
    expect(parseDecimalBR('19,64')).toBe(19.64);
    expect(parseDecimalBR('1.234,56')).toBe(1234.56);
    expect(parseDecimalBR('')).toBeNull();
  });
});
