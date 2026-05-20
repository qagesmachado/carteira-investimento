import { describe, expect, it } from 'vitest';

import { parseApiError } from './parseApiError';

describe('parseApiError', () => {
  it('traduz asset not found', () => {
    const err = new Error(JSON.stringify({ detail: 'asset not found' }));
    expect(parseApiError(err, 'fallback')).toContain('Cadastre-o em Ativos');
  });

  it('traduz conflito de posição', () => {
    const err = new Error(
      JSON.stringify({ detail: 'position for this asset already exists in portfolio' })
    );
    expect(parseApiError(err, 'fallback')).toContain('já está nesta carteira');
  });

  it('traduz nome de carteira duplicado', () => {
    const err = new Error(JSON.stringify({ detail: 'portfolio name already exists' }));
    expect(parseApiError(err, 'fallback')).toContain('Já existe uma carteira com este nome');
  });
});
