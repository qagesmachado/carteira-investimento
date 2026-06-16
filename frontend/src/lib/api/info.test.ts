import { describe, expect, it, vi } from 'vitest';

import { getAppInfo, type AppInfo } from './info';

const sample: AppInfo = {
  db_user_version: 1,
  db_up_to_date: true,
  database_path: 'C:/tmp/carteira.db'
};

describe('getAppInfo', () => {
  it('retorna o estado do banco do backend', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sample)
    });

    const info = await getAppInfo(fetcher as never);

    expect(info.db_user_version).toBe(1);
    expect(info.db_up_to_date).toBe(true);
    expect(info.database_path).toBe('C:/tmp/carteira.db');
  });

  it('propaga erro quando a resposta não é ok', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('falhou')
    });

    await expect(getAppInfo(fetcher as never)).rejects.toThrow('falhou');
  });
});
