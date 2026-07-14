import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import CreatePortfolioModal from './CreatePortfolioModal.svelte';

describe('CreatePortfolioModal', () => {
  it('exige nome antes de criar', async () => {
    const onCreate = vi.fn();
    render(CreatePortfolioModal, {
      props: { open: true, onCreate }
    });

    const nameInput = screen.getByLabelText('Nome da carteira');
    await fireEvent.input(nameInput, { target: { value: '' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Criar carteira' }));
    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Informe o nome da carteira.');
  });

  it('emite payload com perfil moderado e template pessoal', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(CreatePortfolioModal, {
      props: { open: true, onCreate }
    });

    const nameInput = screen.getByLabelText('Nome da carteira');
    await fireEvent.input(nameInput, { target: { value: 'E2E Principal' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Criar carteira' }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const payload = onCreate.mock.calls[0][0];
    expect(payload.name).toBe('E2E Principal');
    expect(payload.status).toBe('active');
    expect(payload.allocation_targets_json).toContain('"fixed_income":55');
  });

  it('personalizado envia allocation_targets_json customizado', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(CreatePortfolioModal, {
      props: { open: true, onCreate }
    });

    await fireEvent.click(screen.getByTestId('investor-profile-custom'));
    expect(screen.getByTestId('portfolio-custom-allocation-editor')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-hub-allocation')).toBeNull();

    const stocksSlider = screen.getByTestId('custom-allocation-slider-stocks');
    await fireEvent.input(stocksSlider, { target: { value: '15' } });
    const fixedIncomeSlider = screen.getByTestId('custom-allocation-slider-fixed_income');
    await fireEvent.input(fixedIncomeSlider, { target: { value: '60' } });

    const nameInput = screen.getByLabelText('Nome da carteira');
    await fireEvent.input(nameInput, { target: { value: 'Carteira custom' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Criar carteira' }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const payload = onCreate.mock.calls[0][0];
    expect(payload.allocation_targets_json).toContain('"fixed_income":60');
    expect(payload.allocation_targets_json).toContain('"stocks":15');
  });

  it('personalizado bloqueia criar quando soma das classes difere de 100%', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(CreatePortfolioModal, {
      props: { open: true, onCreate }
    });

    await fireEvent.click(screen.getByTestId('investor-profile-custom'));
    const fixedIncomeSlider = screen.getByTestId('custom-allocation-slider-fixed_income');
    await fireEvent.input(fixedIncomeSlider, { target: { value: '70' } });

    const nameInput = screen.getByLabelText('Nome da carteira');
    await fireEvent.input(nameInput, { target: { value: 'Carteira inválida' } });

    const createButton = screen.getByRole('button', { name: 'Criar carteira' }) as HTMLButtonElement;
    expect(createButton.disabled).toBe(true);
    await fireEvent.click(createButton);
    expect(onCreate).not.toHaveBeenCalled();
  });
});
