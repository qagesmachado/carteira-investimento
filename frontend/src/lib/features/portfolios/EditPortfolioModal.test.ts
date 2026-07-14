import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import type { Portfolio } from '$lib/api/portfolios';
import EditPortfolioModal from './EditPortfolioModal.svelte';

const portfolio: Portfolio = {
  id: 7,
  name: 'Carteira Gabriel',
  holder: null,
  objective: null,
  base_currency: 'BRL',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

describe('EditPortfolioModal', () => {
  it('exige nome antes de salvar', async () => {
    const onSave = vi.fn();
    render(EditPortfolioModal, {
      props: { open: true, portfolio, onSave }
    });

    await fireEvent.input(screen.getByLabelText('Nome da carteira'), { target: { value: '   ' } });
    await fireEvent.click(screen.getByTestId('edit-portfolio-save'));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Informe o nome da carteira.');
  });

  it('modo detailed exibe balanceamento por classe', async () => {
    const onSave = vi.fn();
    render(EditPortfolioModal, {
      props: {
        open: true,
        portfolio: {
          ...portfolio,
          allocation_targets_json:
            '{"classes":{"stocks":20,"funds":7,"international":15,"fixed_income":55,"crypto":3},"stocks_split":{"etf":70,"stock":30}}'
        },
        onSave
      }
    });

    expect(screen.getByTestId('portfolio-allocation-fixed_income')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-allocation-stocks-split')).toBeNull();
  });

  it('envia nome, titular e objetivo atualizados', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(EditPortfolioModal, {
      props: { open: true, portfolio, onSave }
    });

    await fireEvent.input(screen.getByLabelText('Nome da carteira'), {
      target: { value: 'Carteira Gabriel' }
    });
    await fireEvent.input(screen.getByLabelText('Titular'), { target: { value: 'Gabriel' } });
    await fireEvent.input(screen.getByLabelText('Objetivo'), {
      target: { value: 'Patrimônio de longo prazo.' }
    });
    await fireEvent.click(screen.getByTestId('edit-portfolio-save'));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Carteira Gabriel',
      holder: 'Gabriel',
      objective: 'Patrimônio de longo prazo.'
    });
  });
});
