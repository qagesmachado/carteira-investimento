import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AssetForm from './AssetForm.svelte';

describe('AssetForm', () => {
  it('exibe dados retornados pelo lookup para revisão (ticker sem .SA)', () => {
    render(AssetForm, {
      asset: {
        symbol: 'PETR4.SA',
        name: 'Petrobras PN',
        asset_type: 'stock',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      }
    });

    expect(screen.getByDisplayValue('PETR4')).toBeTruthy();
    expect(screen.getByDisplayValue('Petrobras PN')).toBeTruthy();
  });

  it('traduz setor e formata cotação ao carregar lookup', () => {
    render(AssetForm, {
      asset: {
        symbol: 'RADL3',
        name: 'Raia Drogasil S.A.',
        asset_type: 'stock',
        market: 'national',
        country: 'BR',
        currency: 'BRL',
        sector: 'Healthcare',
        current_quote: 19.64,
        quote_source: 'yfinance'
      }
    });

    expect(screen.getByDisplayValue('Saúde')).toBeTruthy();
    expect(screen.getByDisplayValue('19,64')).toBeTruthy();
  });

  it('exige subtipo quando o ativo é ETF nacional', async () => {
    render(AssetForm, {
      asset: {
        symbol: 'AUPO11',
        name: 'AUPO11',
        asset_type: 'etf',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      }
    });

    expect(screen.getByLabelText('Tipo do ETF nacional')).toBeTruthy();
  });

  it('exibe e envia campos fiscais e classificação completos', async () => {
    const onSave = vi.fn();
    render(AssetForm, {
      asset: {
        symbol: 'PETR4',
        name: 'Petrobras',
        asset_type: 'stock',
        market: 'national',
        country: 'BR',
        currency: 'BRL',
        subsector: 'Exploração',
        segment: 'Petróleo',
        company_cnpj: '33.000.167/0001-01',
        payer_cnpj: '33.000.167/0002-90',
        payer_name: 'Petrobras',
        notes: 'Obs teste'
      },
      onSave
    });

    expect(screen.getByDisplayValue('Exploração')).toBeTruthy();
    expect(screen.getByDisplayValue('33.000.167/0001-01')).toBeTruthy();
    expect(screen.getByDisplayValue('Obs teste')).toBeTruthy();

    await fireEvent.click(screen.getByRole('button', { name: 'Salvar ativo' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        subsector: 'Exploração',
        segment: 'Petróleo',
        company_cnpj: '33.000.167/0001-01',
        payer_cnpj: '33.000.167/0002-90',
        payer_name: 'Petrobras',
        notes: 'Obs teste'
      })
    );
  });

  it('envia payload de criação ao salvar', async () => {
    const onSave = vi.fn();
    render(AssetForm, {
      asset: {
        symbol: 'BBSE3',
        name: 'BB Seguridade',
        asset_type: 'stock',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      },
      onSave
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Salvar ativo' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'BBSE3',
        name: 'BB Seguridade',
        asset_type: 'stock'
      })
    );
  });

  it('aceita submitLabel e cancelLabel customizados com showCancelButton', () => {
    const onCancel = vi.fn();
    render(AssetForm, {
      asset: {
        symbol: 'VALE3',
        name: 'Vale',
        asset_type: 'stock',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      },
      submitLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      showCancelButton: true,
      onCancel
    });

    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
  });

  it('atualiza o tipo quando o ativo de entrada muda para outro tipo manual', () => {
    const getTipoSelect = () =>
      Array.from(document.querySelectorAll('select')).find((el) =>
        Array.from(el.options).some((o) => o.value === 'stock')
      ) as HTMLSelectElement;

    const { unmount } = render(AssetForm, {
      asset: {
        symbol: '',
        name: '',
        asset_type: 'fixed_income',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      }
    });
    expect(getTipoSelect().value).toBe('fixed_income');
    unmount();

    render(AssetForm, {
      asset: {
        symbol: '',
        name: '',
        asset_type: 'pension',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      }
    });
    expect(getTipoSelect().value).toBe('pension');
  });

  it('adapta formulário para renda fixa manual', () => {
    render(AssetForm, {
      asset: {
        symbol: '',
        name: '',
        asset_type: 'fixed_income',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      }
    });

    expect(screen.getByText('Identificador')).toBeTruthy();
    expect(screen.getByText('Descrição do produto')).toBeTruthy();
    expect(screen.queryByText('Setor')).toBeNull();
    expect(screen.queryByText('Cotação atual')).toBeNull();
    expect(screen.getByText(/Carteiras/)).toBeTruthy();
  });

  it('em modo edição chama onUpdate e exibe cancelar', async () => {
    const onUpdate = vi.fn();
    const onCancel = vi.fn();
    render(AssetForm, {
      mode: 'edit',
      asset: {
        symbol: 'HGLG11',
        name: 'FII',
        asset_type: 'fii',
        market: 'national',
        country: 'BR',
        currency: 'BRL'
      },
      onUpdate,
      onCancel
    });

    expect(screen.getByRole('button', { name: 'Cancelar edição' })).toBeTruthy();
    await fireEvent.click(screen.getByRole('button', { name: 'Atualizar ativo' }));
    expect(onUpdate).toHaveBeenCalled();
  });
});
