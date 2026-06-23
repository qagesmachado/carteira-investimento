import { describe, expect, it } from 'vitest';

import {
  formatEmergencyReserveLocation,
  formatLinkedEmergencyReserveObservation,
  parseAmountBrl,
  pctOfEmergencyReserve,
  pctOfPatrimony,
  validateManualPatrimonyForm
} from './patrimonyControlForm';

describe('patrimonyControlForm', () => {
  it('exige localização para reserva de emergência', () => {
    expect(
      validateManualPatrimonyForm({
        category: 'emergency_reserve',
        name: 'Conta',
        amount_brl: '1000',
        location: '',
        notes: ''
      })
    ).toBe('Selecione a localização.');
  });

  it('formata rótulo de localização', () => {
    expect(formatEmergencyReserveLocation('banco')).toBe('Banco');
    expect(formatEmergencyReserveLocation('corretora')).toBe('Corretora');
  });

  it('aceita reserva com localização dinheiro em espécie', () => {
    expect(
      validateManualPatrimonyForm({
        category: 'emergency_reserve',
        name: 'Cofre',
        amount_brl: '500',
        location: 'dinheiro_especie',
        notes: ''
      })
    ).toBeNull();
  });

  it('calcula percentual do total', () => {
    expect(pctOfPatrimony(250, 1000)).toBe('25,0%');
    expect(pctOfPatrimony(0, 0)).toBe('—');
  });

  it('calcula percentual da reserva de emergência', () => {
    expect(pctOfEmergencyReserve(200, 500)).toBe('40,0%');
    expect(pctOfEmergencyReserve(0, 0)).toBe('—');
  });

  it('parseia valor decimal', () => {
    expect(parseAmountBrl('5000')).toBe(5000);
    expect(parseAmountBrl('1234,56')).toBe(1234.56);
  });

  it('descreve observação de reserva vinculada aos objetivos', () => {
    expect(formatLinkedEmergencyReserveObservation('Reserva')).toContain('objetivos financeiros');
    expect(formatLinkedEmergencyReserveObservation('Reserva')).toContain('Fatia: Reserva');
  });
});
