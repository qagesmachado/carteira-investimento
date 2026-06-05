import { describe, expect, it, vi } from 'vitest';

import { createCryptoFee, updateCryptoFee } from './cryptoFees';
import { API_BASE_URL } from './config';

describe('cryptoFees api client', () => {
  it('cria taxa com POST JSON e Content-Type', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, fee_type: 'purchase' })
    });

    const payload = {
      portfolio_id: 1,
      asset_id: 2,
      fee_type: 'purchase' as const,
      fee_date: '2025-06-26',
      quantity_moved: 0.00084,
      fee_quantity_btc: 8.4e-7,
      quote_brl: 590867,
      fx_rate: 5.54
    };

    await expect(createCryptoFee(payload, fetcher as unknown as typeof fetch)).resolves.toMatchObject({
      id: 1
    });

    expect(fetcher).toHaveBeenCalledWith(`${API_BASE_URL}/crypto-fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  });

  it('atualiza taxa com PATCH JSON e Content-Type', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, notes: 'ajuste' })
    });

    await expect(
      updateCryptoFee(3, { notes: 'ajuste' }, fetcher as unknown as typeof fetch)
    ).resolves.toMatchObject({ id: 3 });

    expect(fetcher).toHaveBeenCalledWith(`${API_BASE_URL}/crypto-fees/3`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'ajuste' })
    });
  });
});
