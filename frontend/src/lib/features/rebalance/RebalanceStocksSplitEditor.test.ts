import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { defaultAllocationTargets } from '$lib/features/rebalance/allocationTargets';

import RebalanceStocksSplitEditor from './RebalanceStocksSplitEditor.svelte';

describe('RebalanceStocksSplitEditor', () => {
  it('atualiza percentual ao mover slider no modo by_subtype', async () => {
    const targets = defaultAllocationTargets();
    targets.stocks_split_mode = 'by_subtype';
    render(RebalanceStocksSplitEditor, {
      props: { targets }
    });

    const slider = screen.getByTestId('stocks-split-slider-etf');
    await fireEvent.input(slider, { target: { value: '80' } });

    expect(targets.stocks_split.etf).toBe(80);
    expect(screen.getByTestId('stocks-split-sum').textContent).toContain('130%');
    expect(screen.getByTestId('stocks-split-sum').className).toContain('text-error');
  });

  it('nao renderiza quando meta de stocks e menor que 1%', () => {
    const targets = defaultAllocationTargets();
    targets.classes.stocks = 0;
    render(RebalanceStocksSplitEditor, {
      props: { targets }
    });

    expect(screen.queryByTestId('rebalance-stocks-split-editor')).toBeNull();
  });

  it('indica soma valida quando totaliza 100% no modo by_subtype', () => {
    const targets = defaultAllocationTargets();
    targets.stocks_split_mode = 'by_subtype';
    render(RebalanceStocksSplitEditor, {
      props: { targets }
    });

    expect(screen.getByTestId('stocks-split-sum').textContent).toContain('100%');
    expect(screen.getByTestId('stocks-split-sum').className).not.toContain('text-error');
  });

  it('oculta sliders no modo unified (padrao)', () => {
    const targets = defaultAllocationTargets();
    render(RebalanceStocksSplitEditor, {
      props: { targets }
    });

    expect(screen.queryByTestId('stocks-split-slider-etf')).toBeNull();
    expect(screen.getByTestId('rebalance-stocks-split-unified-note')).toBeTruthy();
  });

  it('troca para by_subtype com split 50/50 apos confirmação', async () => {
    const targets = defaultAllocationTargets();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(RebalanceStocksSplitEditor, { props: { targets } });

    const bySubtypeOption = screen.getByTestId('rebalance-stocks-split-mode-by_subtype');
    const checkbox = bySubtypeOption.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
    await fireEvent.change(checkbox!, { target: { checked: true } });

    expect(targets.stocks_split_mode).toBe('by_subtype');
    expect(targets.stocks_split.etf).toBe(50);
    expect(targets.stocks_split.stock).toBe(50);
    expect(screen.getByTestId('stocks-split-slider-etf')).toBeTruthy();
  });

  it('preserva 70/30 ao trocar de unified para by_subtype', async () => {
    const targets = defaultAllocationTargets();
    targets.stocks_split = { etf: 70, stock: 30 };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(RebalanceStocksSplitEditor, { props: { targets } });

    const bySubtypeOption = screen.getByTestId('rebalance-stocks-split-mode-by_subtype');
    const checkbox = bySubtypeOption.querySelector('input[type="checkbox"]');
    await fireEvent.change(checkbox!, { target: { checked: true } });

    expect(targets.stocks_split_mode).toBe('by_subtype');
    expect(targets.stocks_split.etf).toBe(70);
    expect(targets.stocks_split.stock).toBe(30);
    expect((screen.getByTestId('stocks-split-slider-etf') as HTMLInputElement).value).toBe('70');
  });

  it('trava opções quando locked e exibe motivo', () => {
    const targets = defaultAllocationTargets();
    render(RebalanceStocksSplitEditor, {
      props: { targets, locked: true }
    });

    expect(screen.getByTestId('rebalance-stocks-split-locked-note')).toBeTruthy();
    expect(screen.getByTestId('rebalance-stocks-split-mode-by_subtype').className).toContain(
      'cursor-not-allowed'
    );
    const bySubtypeCheckbox = screen
      .getByTestId('rebalance-stocks-split-mode-by_subtype')
      .querySelector('input[type="checkbox"]');
    expect((bySubtypeCheckbox as HTMLInputElement).disabled).toBe(true);
  });
});
