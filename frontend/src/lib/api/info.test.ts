import { describe, expect, it, vi } from 'vitest';

import { getAppInfo, type AppInfo } from './info';

const sample: AppInfo = {
  app_version: '0.1.0',
  schema_version: 1,
  db_user_version: 1,
  db_up_to_date: true,
  python_version: '3.11.3',
  database_path: 'C:/tmp/carteira.db',
  lookup_mode: 'yfinance',
  released_at: '2026-06-16',
  release_notes: ['Primeira versão.', 'Página /info.']
};

describe('getAppInfo', () => {
  it('retorna as novidades (released_at e release_notes) do backend', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sample)
    });

    const info = await getAppInfo(fetcher as never);

    expect(info.released_at).toBe('2026-06-16');
    expect(info.release_notes).toEqual(['Primeira versão.', 'Página /info.']);
  });

  it('propaga erro quando a resposta não é ok', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('falhou')
    });

    await expect(getAppInfo(fetcher as never)).rejects.toThrow('falhou');
  });
});
