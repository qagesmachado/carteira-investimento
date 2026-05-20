import { describe, expect, it, vi } from 'vitest';

import { getHealth } from './health';

describe('getHealth', () => {
  it('retorna o status da API', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' })
    });

    await expect(getHealth(fetcher as unknown as typeof fetch)).resolves.toEqual({ status: 'ok' });
  });
});
