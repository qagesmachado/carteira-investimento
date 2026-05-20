import { describe, expect, it, vi } from 'vitest';

import { createAsset, deleteAsset, listAssets, lookupAsset, updateAsset } from './assets';
import { API_BASE_URL } from './config';

describe('assets api client', () => {
  it('busca ativo por símbolo', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ symbol: 'PETR4.SA', name: 'Petrobras PN' })
    });

    await expect(lookupAsset('petr4.sa', fetcher as unknown as typeof fetch)).resolves.toMatchObject({
      symbol: 'PETR4.SA'
    });
    expect(fetcher).toHaveBeenCalledWith(`${API_BASE_URL}/assets/lookup?symbol=petr4.sa`);
  });

  it('cria ativo na base', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, symbol: 'BBSE3' })
    });

    await expect(
      createAsset(
        {
          symbol: 'BBSE3',
          name: 'BB Seguridade',
          asset_type: 'stock',
          market: 'national',
          currency: 'BRL'
        },
        fetcher as unknown as typeof fetch
      )
    ).resolves.toMatchObject({ id: 1, symbol: 'BBSE3' });
  });

  it('lista ativos cadastrados', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, symbol: 'HGLG11' }]
    });

    await expect(listAssets(fetcher as unknown as typeof fetch)).resolves.toEqual([
      { id: 1, symbol: 'HGLG11' }
    ]);
  });

  it('atualiza ativo com PATCH', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 2, symbol: 'EGIE3', name: 'Novo' })
    });

    await expect(updateAsset(2, { name: 'Novo' }, fetcher as unknown as typeof fetch)).resolves.toMatchObject({
      id: 2,
      name: 'Novo'
    });

    expect(fetcher).toHaveBeenCalledWith(
      `${API_BASE_URL}/assets/2`,
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('remove ativo com DELETE', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 204
    });

    await expect(deleteAsset(5, fetcher as unknown as typeof fetch)).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledWith(`${API_BASE_URL}/assets/5`, { method: 'DELETE' });
  });
});
