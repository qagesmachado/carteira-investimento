import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import BrDecimalInputHost from './BrDecimalInputHost.svelte';

describe('BrDecimalInput', () => {
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
});
