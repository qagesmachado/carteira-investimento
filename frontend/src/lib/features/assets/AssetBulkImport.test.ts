import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as assetsApi from '$lib/api/assets';

import AssetBulkImport from './AssetBulkImport.svelte';

vi.mock('$lib/api/assets', async (importOriginal) => {
  const actual = await importOriginal<typeof assetsApi>();
  return {
    ...actual,
    previewBulkAssets: vi.fn(),
    createBulkAssets: vi.fn()
  };
});

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

function makeTxtFile(name: string) {
  const content = readFileSync(join(fixtureDir, 'bulk-import-comma-line.txt'), 'utf8');
  return new File([content], name, { type: 'text/plain' });
}

describe('AssetBulkImport', () => {
  beforeEach(() => {
    vi.mocked(assetsApi.previewBulkAssets).mockReset();
    vi.mocked(assetsApi.createBulkAssets).mockReset();
  });

  it('exibe nome do arquivo após upload', async () => {
    render(AssetBulkImport);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeTxtFile('bulk-import-comma-line.txt');

    await fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const row = screen.getByText('Arquivo selecionado:').closest('p');
      expect(row?.textContent).toContain('bulk-import-comma-line.txt');
    });
    expect(screen.getByDisplayValue('FESA4, FLRY3, ITSA4, KLBN')).toBeTruthy();
  });

  it('processa arquivo arrastado com vários tickers na mesma linha', async () => {
    render(AssetBulkImport);
    const file = makeTxtFile('lista.txt');
    const dropZone = screen.getByRole('region', { name: /arrastar arquivo/i });

    await fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    });

    await waitFor(() => {
      const row = screen.getByText('Arquivo selecionado:').closest('p');
      expect(row?.textContent).toContain('lista.txt');
    });
    expect(screen.getByDisplayValue('FESA4, FLRY3, ITSA4, KLBN')).toBeTruthy();
  });

  it('salva via createBulkAssets usando rascunho do modal', async () => {
    const onSaved = vi.fn();
    vi.mocked(assetsApi.previewBulkAssets).mockResolvedValue({
      items: [
        {
          symbol: 'BBSE3',
          lookup: {
            symbol: 'BBSE3',
            name: 'BB Seguridade',
            asset_type: 'stock',
            market: 'national',
            country: 'BR',
            currency: 'BRL',
            sector: null,
            subsector: null,
            segment: null,
            company_cnpj: null,
            payer_cnpj: null,
            payer_name: null,
            quote_source: null,
            current_quote: null
          },
          error: null,
          already_in_db: false
        }
      ]
    });
    vi.mocked(assetsApi.createBulkAssets).mockResolvedValue({
      results: [{ symbol: 'BBSE3', status: 'created' }]
    });

    render(AssetBulkImport, { onSaved });

    await fireEvent.input(screen.getByPlaceholderText('PETR4, BBSE3, VALE3'), {
      target: { value: 'BBSE3' }
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Buscar no yfinance' }));

    await waitFor(() => {
      expect(screen.getByText('BB Seguridade')).toBeTruthy();
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeTruthy();
    });

    const nameInput = screen.getByDisplayValue('BB Seguridade');
    await fireEvent.input(nameInput, { target: { value: 'BB Seguridade Revisada' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('BB Seguridade Revisada');
    });

    await fireEvent.click(screen.getByRole('button', { name: /Salvar selecionados/i }));

    await waitFor(() => {
      expect(assetsApi.createBulkAssets).toHaveBeenCalledWith([
        expect.objectContaining({ symbol: 'BBSE3', name: 'BB Seguridade Revisada' })
      ]);
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('atualiza ticker, tipo e moeda na tabela após confirmar edição no modal', async () => {
    vi.mocked(assetsApi.previewBulkAssets).mockResolvedValue({
      items: [
        {
          symbol: 'ODPV3',
          lookup: {
            symbol: 'ODPV3',
            name: 'Odontoprev SA',
            asset_type: 'stock',
            market: 'national',
            country: 'BR',
            currency: 'BRL',
            sector: null,
            subsector: null,
            segment: null,
            company_cnpj: null,
            payer_cnpj: null,
            payer_name: null,
            quote_source: null,
            current_quote: null
          },
          error: null,
          already_in_db: false
        }
      ]
    });

    render(AssetBulkImport);

    await fireEvent.input(screen.getByPlaceholderText('PETR4, BBSE3, VALE3'), {
      target: { value: 'ODPV3' }
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Buscar no yfinance' }));

    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Odontoprev SA' })).toBeTruthy();
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeTruthy();
    });

    const modal = screen.getByRole('dialog');
    const modalScope = within(modal);
    const [typeSelect] = modalScope.getAllByRole('combobox');

    await fireEvent.input(modalScope.getByDisplayValue('ODPV3'), { target: { value: 'ODPV4' } });
    await fireEvent.input(modalScope.getByDisplayValue('Odontoprev SA'), {
      target: { value: 'Odontoprev Revisado' }
    });
    await fireEvent.change(typeSelect, { target: { value: 'fii' } });
    await fireEvent.change(modalScope.getByLabelText('Moeda'), { target: { value: 'USD' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('ODPV4');
      expect(table.textContent).toContain('Odontoprev Revisado');
      expect(table.textContent).toContain('Fundo imobiliário');
      expect(table.textContent).toContain('Dólar (USD)');
      expect(table.textContent).toContain('Revisado');
    });
  });
});
