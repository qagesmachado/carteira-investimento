import { describe, expect, it } from 'vitest';

import { CONSOLIDADA_PATH, consolidadaHref } from './appRoutes';

describe('appRoutes', () => {
  it('expõe caminho da visão consolidada no menu principal', () => {
    expect(CONSOLIDADA_PATH).toBe('/consolidada');
  });

  it('monta href com filtro de classe de alocação', () => {
    expect(consolidadaHref('acao_br')).toBe('/consolidada?display_class=acao_br');
  });
});
