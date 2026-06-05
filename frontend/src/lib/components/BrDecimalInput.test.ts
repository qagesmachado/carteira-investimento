import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import BrDecimalInput from './BrDecimalInput.svelte';
import BrDecimalInputHost from './BrDecimalInputHost.svelte';

describe('BrDecimalInput', () => {
  beforeEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  afterEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  it('formata exibição no blur e volta à edição no foco', async () => {
    const { component } = render(BrDecimalInputHost, { props: { value: 0 } });

    const input = screen.getByRole('textbox');
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: '1234,56' } });
    await fireEvent.blur(input);

    expect(component.value).toBe(1234.56);
    expect((input as HTMLInputElement).value).toBe('1.234,56');

    await fireEvent.focus(input);
    expect((input as HTMLInputElement).value).toBe('1234,56');

    expect(component.inputRef.flush()).toBe(true);
  });

  it('flush retorna false para valor inválido', async () => {
    const { component } = render(BrDecimalInputHost, { props: { value: 0 } });
    const input = screen.getByRole('textbox');

    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: '12,' } });

    expect(component.inputRef.flush()).toBe(false);
  });

  it('flush sem blur grava texto digitado (evita regressão ao clicar Salvar)', async () => {
    const { component } = render(BrDecimalInputHost, { props: { value: 2 } });

    const input = screen.getByRole('textbox');
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: '5,75' } });

    expect(component.inputRef.flush()).toBe(true);
    expect(component.value).toBe(5.75);
    expect((input as HTMLInputElement).value).toBe('5,75');
  });

  it('exibe máscara R$ quando bloqueado com currency', () => {
    render(BrDecimalInput, {
      props: { value: 216_000, currency: true, disabled: true }
    });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/R\$\s?216\.000,00/);
  });

  it('mascara valor bloqueado quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    render(BrDecimalInput, {
      props: { value: 216_000, currency: true, disabled: true }
    });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('R$ ••••••');
  });

  it('mostra valor real ao editar mesmo com ocultar valores ativo', async () => {
    setHideMoneyValues(true);
    render(BrDecimalInput, {
      props: { value: 216_000, currency: true, disabled: false }
    });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await fireEvent.focus(input);
    expect(input.value).toBe('216000');
  });

  it('formata BTC com 8 casas na exibição e na edição', async () => {
    render(BrDecimalInput, {
      props: { value: 0.00003, btcQuantity: true }
    });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('0,00003000');

    await fireEvent.focus(input);
    expect(input.value).toBe('0,00003000');
  });
});
