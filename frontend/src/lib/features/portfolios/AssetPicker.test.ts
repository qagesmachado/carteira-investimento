import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';

import AssetPickerHost from './AssetPickerHost.svelte';

const sampleAssets: Asset[] = [
  {
    id: 1,
    symbol: 'ITSA4.SA',
    name: 'Itaúsa S.A.',
    asset_type: 'stock',
    market: 'national',
    currency: 'BRL',
    display_class: 'stocks'
  },
  {
    id: 2,
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    asset_type: 'etf',
    market: 'international',
    currency: 'USD',
    display_class: 'international'
  }
];

describe('AssetPicker', () => {
  it('filtra por ticker e seleciona ativo', async () => {
    const { component } = render(AssetPickerHost, {
      props: { assets: sampleAssets, value: '' }
    });

    await fireEvent.click(screen.getByRole('button'));
    await fireEvent.input(screen.getByPlaceholderText('Ex.: ITSA4'), {
      target: { value: 'ITSA' }
    });

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByRole('option', { name: /ITSA4/i })).toBeTruthy();
    expect(within(listbox).queryByRole('option', { name: /VOO/i })).toBeNull();

    await fireEvent.click(within(listbox).getByRole('option', { name: /ITSA4/i }));

    expect(component.value).toBe(1);
    expect(screen.getByRole('button').textContent).toContain('ITSA4');
  });

  it('mostra mensagem quando busca não encontra ativos', async () => {
    render(AssetPickerHost, { props: { assets: sampleAssets, value: '' } });

    await fireEvent.click(screen.getByRole('button'));
    await fireEvent.input(screen.getByPlaceholderText('Ex.: ITSA4'), {
      target: { value: 'XYZ999' }
    });

    expect(screen.getByText('Nenhum ativo corresponde à busca.')).toBeTruthy();
  });
});
