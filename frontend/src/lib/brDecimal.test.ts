import { describe, expect, it } from 'vitest';

import {
  formatBrDecimalDisplay,
  formatBrDecimalForEditing,
  formatBtcDecimalDisplay,
  formatBtcDecimalForEditing,
  parseBrDecimalInput,
  sanitizeBrDecimalTyping
} from './brDecimal';

describe('parseBrDecimalInput', () => {
  it('parseia vírgula decimal sem milhar', () => {
    expect(parseBrDecimalInput('1234,56')).toBe(1234.56);
    expect(parseBrDecimalInput('12,5')).toBe(12.5);
  });

  it('parseia valor colado com milhar BR', () => {
    expect(parseBrDecimalInput('1.234,56')).toBe(1234.56);
  });

  it('aceita inteiro sem vírgula', () => {
    expect(parseBrDecimalInput('1234')).toBe(1234);
  });

  it('rejeita ponto como decimal', () => {
    expect(parseBrDecimalInput('12.69')).toBeNull();
  });

  it('rejeita vazio e inválidos', () => {
    expect(parseBrDecimalInput('')).toBeNull();
    expect(parseBrDecimalInput('abc')).toBeNull();
    expect(parseBrDecimalInput('12,,34')).toBeNull();
  });
});

describe('formatBrDecimalDisplay', () => {
  it('formata com milhar e vírgula', () => {
    expect(formatBrDecimalDisplay(1234.56)).toBe('1.234,56');
  });
});

describe('formatBrDecimalForEditing', () => {
  it('formata sem milhar para edição', () => {
    expect(formatBrDecimalForEditing(1234.56)).toBe('1234,56');
  });
});

describe('formatBtcDecimalDisplay', () => {
  it('formata com 8 casas decimais fixas', () => {
    expect(formatBtcDecimalDisplay(0.00003)).toBe('0,00003000');
    expect(formatBtcDecimalDisplay(0.0037087)).toBe('0,00370870');
    expect(formatBtcDecimalDisplay(0.00083916)).toBe('0,00083916');
  });
});

describe('formatBtcDecimalForEditing', () => {
  it('formata com vírgula e 8 casas decimais', () => {
    expect(formatBtcDecimalForEditing(0.00003)).toBe('0,00003000');
    expect(formatBtcDecimalForEditing(0.00110391)).toBe('0,00110391');
  });
});

describe('sanitizeBrDecimalTyping', () => {
  it('mantém apenas dígitos e uma vírgula', () => {
    expect(sanitizeBrDecimalTyping('12a3,4.5,6')).toBe('123,456');
  });
});
