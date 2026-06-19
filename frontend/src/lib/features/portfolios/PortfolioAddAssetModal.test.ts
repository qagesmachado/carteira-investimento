import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createPosition = vi.fn();
const createFixedIncomePosition = vi.fn();

vi.mock('$lib/api/portfolios', () => ({
  createPosition: (...args: unknown[]) => createPosition(...args),
  createFixedIncomePosition: (...args: unknown[]) => createFixedIncomePosition(...args)
}));

import PortfolioAddAssetModal from './PortfolioAddAssetModal.svelte';

function inputForLabel(label: string): HTMLInputElement {
  const span = screen.getByText(label);
  const input = span.closest('label')?.querySelector('input');
  if (!input) {
    throw new Error(`input não encontrado para o rótulo ${label}`);
  }
  return input as HTMLInputElement;
}

describe('PortfolioAddAssetModal', () => {
  beforeEach(() => {
    createPosition.mockReset().mockResolvedValue({ id: 1 });
    createFixedIncomePosition.mockReset().mockResolvedValue({ id: 2 });
  });

  it('exibe os três tipos: Bolsa, Renda fixa e Previdência', () => {
    render(PortfolioAddAssetModal, { open: true, portfolioId: 1, assets: [] });

    expect(screen.getByRole('tab', { name: 'Bolsa' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Renda fixa' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Previdência' })).toBeTruthy();
  });

  it('na aba Renda fixa mostra os campos do produto e os valores da carteira', async () => {
    render(PortfolioAddAssetModal, { open: true, portfolioId: 1, assets: [] });

    await fireEvent.click(screen.getByRole('tab', { name: 'Renda fixa' }));

    expect(screen.getByPlaceholderText('Ex.: CDB BTG IPCA+ 2028')).toBeTruthy();
    expect(screen.getByText('Valor aplicado')).toBeTruthy();
    expect(screen.getByText('Valor atual')).toBeTruthy();
  });

  it('cadastra renda fixa chamando createFixedIncomePosition (produto + valores)', async () => {
    render(PortfolioAddAssetModal, { open: true, portfolioId: 7, assets: [] });

    await fireEvent.click(screen.getByRole('tab', { name: 'Renda fixa' }));

    const symbol = screen.getByPlaceholderText('Ex.: CDB BTG IPCA+ 2028');
    await fireEvent.input(symbol, { target: { value: 'CDB BTG IPCA+ 2028' } });
    const name = screen.getByPlaceholderText('Ex.: CDB Banco BTG — IPCA + 8,40% a.a.');
    await fireEvent.input(name, { target: { value: 'CDB Banco BTG' } });

    const invested = inputForLabel('Valor aplicado');
    await fireEvent.input(invested, { target: { value: '1000' } });
    await fireEvent.blur(invested);
    const current = inputForLabel('Valor atual');
    await fireEvent.input(current, { target: { value: '1069,02' } });
    await fireEvent.blur(current);

    await fireEvent.click(screen.getByRole('button', { name: 'Salvar na carteira' }));

    expect(createFixedIncomePosition).toHaveBeenCalledTimes(1);
    const [portfolioId, payload] = createFixedIncomePosition.mock.calls[0];
    expect(portfolioId).toBe(7);
    expect(payload.asset.symbol).toBe('CDB BTG IPCA+ 2028');
    expect(payload.asset.asset_type).toBe('fixed_income');
    expect(payload.invested_amount).toBe(1000);
    expect(payload.current_value).toBe(1069.02);
  });

  it('bloqueia cadastro de renda fixa sem valor aplicado', async () => {
    render(PortfolioAddAssetModal, { open: true, portfolioId: 7, assets: [] });

    await fireEvent.click(screen.getByRole('tab', { name: 'Renda fixa' }));
    await fireEvent.input(screen.getByPlaceholderText('Ex.: CDB BTG IPCA+ 2028'), {
      target: { value: 'LCI XP' }
    });
    await fireEvent.input(
      screen.getByPlaceholderText('Ex.: CDB Banco BTG — IPCA + 8,40% a.a.'),
      { target: { value: 'LCI XP' } }
    );

    await fireEvent.click(screen.getByRole('button', { name: 'Salvar na carteira' }));

    expect(createFixedIncomePosition).not.toHaveBeenCalled();
    expect(screen.getByText(/valor aplicado maior que zero/i)).toBeTruthy();
  });
});
