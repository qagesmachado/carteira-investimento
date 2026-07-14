import { describe, expect, it, vi } from 'vitest';

import {
  confirmPortfolioDelete,
  portfolioDeleteConfirmMessage
} from './portfolioDelete';

describe('portfolioDelete', () => {
  it('monta mensagem de confirmação com nome da carteira', () => {
    expect(portfolioDeleteConfirmMessage('Carteira Gabriel')).toBe(
      'Excluir carteira «Carteira Gabriel» e todas as posições?'
    );
  });

  it('confirmPortfolioDelete repassa mensagem ao confirm nativo', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    expect(confirmPortfolioDelete('Teste')).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith(
      'Excluir carteira «Teste» e todas as posições?'
    );
    confirmSpy.mockRestore();
  });
});
