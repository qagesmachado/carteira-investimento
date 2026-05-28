import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { Asset } from '$lib/api/assets';
import AssetList from './AssetList.svelte';

function stockAsset(id: number, symbol: string, name: string): Asset {
  return {
    id,
    symbol,
    name,
    asset_type: 'stock',
    market: 'national',
    currency: 'BRL',
    display_class: 'stocks'
  };
}

function expectPaginationRange(start: number, end: number, total: number) {
  const navigations = screen.getAllByRole('navigation', { name: 'Paginação da tabela de ativos' });
  const pattern = new RegExp(`Mostrando\\s*${start}\\s*[–-]\\s*${end}\\s*de\\s*${total}`);
  expect(navigations.some((nav) => pattern.test(nav.textContent ?? ''))).toBe(true);
}

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

  it('pagina lista com 20 itens por página', async () => {
    const assets = Array.from({ length: 25 }, (_, index) =>
      stockAsset(index + 1, `TST${String(index + 1).padStart(2, '0')}`, `Ativo ${index + 1}`)
    );

    render(AssetList, { assets });

    expectPaginationRange(1, 20, 25);
    expect(screen.getAllByText('TST01').length).toBeGreaterThan(0);

    const navigations = screen.getAllByRole('navigation', { name: 'Paginação da tabela de ativos' });
    const topNav = navigations[0];
    await fireEvent.click(within(topNav).getByRole('button', { name: 'Próxima' }));

    expectPaginationRange(21, 25, 25);
    expect(screen.getByText('TST21')).toBeTruthy();
    expect(screen.queryByText('TST01')).toBeNull();
  });

  it('volta para página 1 ao filtrar', async () => {
    const assets = [
      ...Array.from({ length: 25 }, (_, index) =>
        stockAsset(index + 1, `TST${String(index + 1).padStart(2, '0')}`, `Ativo ${index + 1}`)
      ),
      stockAsset(99, 'EGIE3', 'Engie Brasil')
    ];

    render(AssetList, { assets });

    const navigations = screen.getAllByRole('navigation', { name: 'Paginação da tabela de ativos' });
    await fireEvent.click(within(navigations[0]).getByRole('button', { name: 'Próxima' }));
    expectPaginationRange(21, 26, 26);

    const input = screen.getByPlaceholderText('Ex.: EGIE3 ou Engie');
    await fireEvent.input(input, { target: { value: 'engie' } });
    await new Promise((r) => setTimeout(r, 250));

    expectPaginationRange(1, 1, 1);
    expect(screen.getByText('Engie Brasil')).toBeTruthy();
  });
});