import { describe, expect, it } from 'vitest';

import {
  applyFinancingEntryTemplate,
  buildTemplateFromFormFields
} from './financingEntryTemplateApply';

describe('applyFinancingEntryTemplate', () => {
  it('mapeia campos do padrão sem data', () => {
    expect(
      applyFinancingEntryTemplate({
        id: 1,
        name: 'Parcela',
        entry_type: 'expense',
        event_category: 'financiamento',
        description: 'Parcela mensal',
        amount_brl: 3000,
        sort_order: 0
      })
    ).toEqual({
      entry_type: 'expense',
      event_category: 'financiamento',
      description: 'Parcela mensal',
      amount_brl: 3000
    });
  });
});

describe('buildTemplateFromFormFields', () => {
  it('aceita campos válidos', () => {
    expect(
      buildTemplateFromFormFields({
        entryType: 'income',
        eventCategory: 'aluguel',
        description: ' Aluguel ',
        amountBrl: 2500
      })
    ).toEqual({
      ok: true,
      fields: {
        entry_type: 'income',
        event_category: 'aluguel',
        description: 'Aluguel',
        amount_brl: 2500
      }
    });
  });

  it('rejeita descrição vazia', () => {
    expect(
      buildTemplateFromFormFields({
        entryType: 'expense',
        eventCategory: 'financiamento',
        description: '   ',
        amountBrl: 100
      })
    ).toEqual({ ok: false, error: 'Informe a descrição.' });
  });

  it('rejeita valor inválido', () => {
    expect(
      buildTemplateFromFormFields({
        entryType: 'expense',
        eventCategory: 'financiamento',
        description: 'Parcela',
        amountBrl: 0
      })
    ).toEqual({ ok: false, error: 'Informe um valor maior que zero.' });
  });

  it('normaliza evento incompatível com o tipo', () => {
    expect(
      buildTemplateFromFormFields({
        entryType: 'expense',
        eventCategory: 'aluguel',
        description: 'Custo manutenção',
        amountBrl: 16
      })
    ).toEqual({
      ok: true,
      fields: {
        entry_type: 'expense',
        event_category: 'financiamento',
        description: 'Custo manutenção',
        amount_brl: 16
      }
    });
  });
});
