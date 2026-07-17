import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import PortfolioPositionsTable from './PortfolioPositionsTable.svelte';
import type { PositionRow } from './positionTableView';

const asset: Asset = {
  id: 10,
  symbol: 'BOVA11',
  name: 'BOVA11',
  asset_type: 'etf',
  display_class: 'stocks',
  currency: 'BRL',
  country: 'BR',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

const position: Position = {
  id: 1,
  asset_id: 10,
  quantity: 10,
  average_price: 100,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

const rows: PositionRow[] = [{ position, asset }];

describe('PortfolioPositionsTable', () => {
  it('renderiza ticker pill e ações com aria-label', () => {
    render(PortfolioPositionsTable, {
      props: {
        rows,
        portfolioMethodologies: { stock_br: 'auvp' },
        formatOptionalMoney: (value, currency) =>
          value != null && currency ? `R$ ${value.toFixed(2)}` : '—'
      }
    });

    expect(screen.getByTestId('portfolio-positions-table')).toBeTruthy();
    expect(screen.getByTestId('portfolio-ticker-pill-BOVA11')).toBeTruthy();
    expect(screen.getByLabelText('Detalhes')).toBeTruthy();
    expect(screen.getByLabelText('Editar')).toBeTruthy();
    expect(screen.getByLabelText('Classificar')).toBeTruthy();
    expect(screen.getByLabelText('Remover')).toBeTruthy();
  });

  it('emite eventos de sort e ações', () => {
    const onSort = vi.fn();
    const onEdit = vi.fn();
    const component = render(PortfolioPositionsTable, {
      props: {
        rows,
        formatOptionalMoney: () => '—'
      }
    });

    component.component.$on('sort', (event) => onSort(event.detail));
    component.component.$on('edit', (event) => onEdit(event.detail));

    fireEvent.click(screen.getByRole('button', { name: 'Lucro' }));
    fireEvent.click(screen.getByLabelText('Editar'));

    expect(onSort).toHaveBeenCalledWith('profit');
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it('desabilita classificar quando metodologia da area e simples', () => {
    render(PortfolioPositionsTable, {
      props: {
        rows,
        portfolioMethodologies: { stock_br: 'simples' },
        formatOptionalMoney: () => '—'
      }
    });

    expect(screen.getByTestId('portfolio-classify-disabled-BOVA11')).toBeTruthy();
    expect(
      (screen.getByTestId('portfolio-classify-disabled-BOVA11') as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('mantem grade de acoes com classificar desabilitado quando nao aplicavel', () => {
    const cryptoAsset: Asset = {
      ...asset,
      symbol: 'BTC-USD',
      asset_type: 'crypto',
      display_class: 'crypto'
    };
    render(PortfolioPositionsTable, {
      props: {
        rows: [{ position, asset: cryptoAsset }],
        formatOptionalMoney: () => '—'
      }
    });

    const actions = screen.getByTestId('portfolio-row-actions-BTC-USD');
    const buttons = actions.querySelectorAll('button');
    expect(buttons.length).toBe(4);
    expect(screen.getByTestId('portfolio-classify-disabled-BTC-USD')).toBeTruthy();
    expect((screen.getByTestId('portfolio-classify-disabled-BTC-USD') as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(screen.getByTestId('portfolio-remove-BTC-USD')).toBeTruthy();
    expect(buttons[3].getAttribute('data-testid')).toBe('portfolio-remove-BTC-USD');
  });

  it('exibe lucro com badge percentual quando ha ganho', () => {
    const profitableAsset: Asset = {
      ...asset,
      current_quote: 110
    };
    render(PortfolioPositionsTable, {
      props: {
        rows: [{ position, asset: profitableAsset }],
        formatOptionalMoney: (value, currency) =>
          value != null && currency ? `R$ ${value.toFixed(2)}` : '—'
      }
    });

    expect(screen.getByText('+10,00%')).toBeTruthy();
  });
});
