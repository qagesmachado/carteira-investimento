import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AssetList from './AssetList.svelte';

describe('AssetList', () => {
  it('renderiza ativos cadastrados', () => {
    render(AssetList, {
      assets: [
        {
          id: 1,
          symbol: 'HGLG11',
          name: 'CSHG Logística',
          asset_type: 'fii',
          market: 'national',
          currency: 'BRL',
          display_class: 'funds'
        }
      ]
    });

    expect(screen.getByText('HGLG11')).toBeTruthy();
    expect(screen.getByText('CSHG Logística')).toBeTruthy();
    expect(screen.getByText('Fundo imobiliário')).toBeTruthy();
    expect(screen.getByText('Fundos imobiliários')).toBeTruthy();
  });

  it('mostra ticker sem sufixo .SA', () => {
    render(AssetList, {
      assets: [
        {
          id: 2,
          symbol: 'EGIE3.SA',
          name: 'Engie',
          asset_type: 'stock',
          market: 'national',
          currency: 'BRL',
          display_class: 'stocks'
        }
      ]
    });

    expect(screen.getByText('EGIE3')).toBeTruthy();
  });

  it('filtra por ticker ou nome', async () => {
    render(AssetList, {
      assets: [
        {
          id: 1,
          symbol: 'EGIE3.SA',
          name: 'Engie Brasil',
          asset_type: 'stock',
          market: 'national',
          currency: 'BRL',
          display_class: 'stocks'
        },
        {
          id: 2,
          symbol: 'PETR4',
          name: 'Petrobras',
          asset_type: 'stock',
          market: 'national',
          currency: 'BRL',
          display_class: 'stocks'
        }
      ]
    });

    const input = screen.getByPlaceholderText('Ex.: EGIE3 ou Engie');
    await fireEvent.input(input, { target: { value: 'engie' } });
    await new Promise((r) => setTimeout(r, 250));

    expect(screen.getByText('Engie Brasil')).toBeTruthy();
    expect(screen.queryByText('Petrobras')).toBeNull();
  });

  it('dispara onEdit e onDelete', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const asset = {
      id: 3,
      symbol: 'TEST',
      name: 'test',
      asset_type: 'stock' as const,
      market: 'national' as const,
      currency: 'BRL',
      display_class: 'stocks' as const
    };

    render(AssetList, { assets: [asset], onEdit, onDelete });

    await fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onEdit).toHaveBeenCalledWith(asset);
    expect(onDelete).toHaveBeenCalledWith(asset);
  });
});