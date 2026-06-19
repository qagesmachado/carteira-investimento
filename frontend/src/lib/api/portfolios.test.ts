import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from './config';
import { createFixedIncomePosition, updateFixedIncomePosition } from './portfolios';

const fixedIncomeAsset = {
  symbol: 'CDB BTG IPCA+ 2028',
  name: 'CDB Banco BTG',
  asset_type: 'fixed_income' as const,
  market: 'national' as const,
  country: 'BR',
  currency: 'BRL',
  fixed_income_indexer: 'ipca_plus' as const,
  fixed_income_yield_description: 'IPCA + 8,40% a.a.'
};

describe('portfolios api client — renda fixa/previdência unificada', () => {
  it('POST cria produto + posição numa ação', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 10, asset_id: 5, invested_amount: 1000 })
    });

    await expect(
      createFixedIncomePosition(
        3,
        { asset: fixedIncomeAsset, invested_amount: 1000, current_value: 1069.02 },
        fetcher as unknown as typeof fetch
      )
    ).resolves.toMatchObject({ id: 10, asset_id: 5 });

    expect(fetcher).toHaveBeenCalledWith(
      `${API_BASE_URL}/portfolios/3/fixed-income-positions`,
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse((fetcher.mock.calls[0][1] as RequestInit).body as string);
    expect(body.asset.symbol).toBe('CDB BTG IPCA+ 2028');
    expect(body.invested_amount).toBe(1000);
    expect(body.current_value).toBe(1069.02);
  });

  it('PATCH atualiza produto + posição no endpoint fixed-income', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 10, current_value: 1150.75 })
    });

    await expect(
      updateFixedIncomePosition(
        3,
        10,
        { asset: { name: 'Revisado' }, invested_amount: 1000, current_value: 1150.75 },
        fetcher as unknown as typeof fetch
      )
    ).resolves.toMatchObject({ current_value: 1150.75 });

    expect(fetcher).toHaveBeenCalledWith(
      `${API_BASE_URL}/portfolios/3/positions/10/fixed-income`,
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('propaga erro do servidor', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'asset already exists'
    });

    await expect(
      createFixedIncomePosition(
        1,
        { asset: fixedIncomeAsset, invested_amount: 1000 },
        fetcher as unknown as typeof fetch
      )
    ).rejects.toThrow('asset already exists');
  });
});
