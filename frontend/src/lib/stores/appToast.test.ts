import { get } from 'svelte/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { appToast } from './appToast';

describe('appToast', () => {
  beforeEach(() => {
    appToast.clear();
  });

  it('insere e remove toast por id', () => {
    appToast.upsert({ id: 'a', text: 'Ok', variant: 'success' });
    expect(get(appToast)).toHaveLength(1);

    appToast.dismiss('a');
    expect(get(appToast)).toHaveLength(0);
  });

  it('atualiza toast existente com mesmo id', () => {
    appToast.upsert({ id: 'a', text: 'Primeira', variant: 'success' });
    appToast.upsert({ id: 'a', text: 'Segunda', variant: 'warning' });

    expect(get(appToast)).toEqual([{ id: 'a', text: 'Segunda', variant: 'warning' }]);
  });
});
