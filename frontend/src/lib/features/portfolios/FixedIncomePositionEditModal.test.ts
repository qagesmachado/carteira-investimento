import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

const updateFixedIncomePosition = vi.fn();

vi.mock('$lib/api/portfolios', () => ({
  updateFixedIncomePosition: (...args: unknown[]) => updateFixedIncomePosition(...args)
}));

import FixedIncomePositionEditModal from './FixedIncomePositionEditModal.svelte';

const asset: Asset = {
  id: 5,
  symbol: 'CDB BTG IPCA+ 2028',
  name: 'CDB Banco BTG',
  asset_type: 'fixed_income',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'fixed_income',
  fixed_income_yield_description: 'IPCA + 8,40% a.a.'
};

const position: Position = {
  id: 10,
  portfolio_id: 3,
  asset_id: 5,
  quantity: 0,
  average_price: 0,
  invested_amount: 1000,
  current_value: 1000,
  contracted_yield: 'IPCA + 8,40% a.a.',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

function inputForLabel(label: string): HTMLInputElement {
  const span = screen.getByText(label);
  const input = span.closest('label')?.querySelector('input');
  if (!input) {
    throw new Error(`input não encontrado para o rótulo ${label}`);
  }
  return input as HTMLInputElement;
}

describe('FixedIncomePositionEditModal', () => {
  beforeEach(() => {
    updateFixedIncomePosition.mockReset().mockResolvedValue({ id: 10 });
  });

  it('pré-preenche os valores da posição e mantém o identificador somente leitura', () => {
    render(FixedIncomePositionEditModal, {
      open: true,
      position,
      asset,
      portfolioId: 3
    });

    expect(inputForLabel('Valor aplicado').value).toBe('1.000,00');
    const symbolInput = screen.getByDisplayValue('CDB BTG IPCA+ 2028') as HTMLInputElement;
    expect(symbolInput.readOnly).toBe(true);
  });

  it('salva chamando updateFixedIncomePosition com produto + valores', async () => {
    render(FixedIncomePositionEditModal, {
      open: true,
      position,
      asset,
      portfolioId: 3
    });

    const current = inputForLabel('Valor atual');
    await fireEvent.focus(current);
    await fireEvent.input(current, { target: { value: '1150,75' } });
    await fireEvent.blur(current);

    await fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(updateFixedIncomePosition).toHaveBeenCalledTimes(1);
    const [portfolioId, positionId, payload] = updateFixedIncomePosition.mock.calls[0];
    expect(portfolioId).toBe(3);
    expect(positionId).toBe(10);
    expect(payload.invested_amount).toBe(1000);
    expect(payload.current_value).toBe(1150.75);
    expect(payload.asset.symbol).toBe('CDB BTG IPCA+ 2028');
  });
});
