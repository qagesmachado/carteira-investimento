import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import AppToastStack from './AppToastStack.svelte';
import DismissibleAlert from './DismissibleAlert.svelte';
import { appToast } from '$lib/stores/appToast';

describe('DismissibleAlert', () => {
  beforeEach(() => {
    appToast.clear();
  });

  it('não adiciona toast quando o texto está vazio', () => {
    render(DismissibleAlert, { props: { text: '' } });
    expect(screen.queryByTestId('app-toast-stack')).toBeNull();
  });

  it('exibe toast de sucesso fixo e dispara dismiss ao fechar', async () => {
    const onDismiss = vi.fn();
    render(AppToastStack);
    const { component } = render(DismissibleAlert, {
      props: { text: 'Posição adicionada.', variant: 'success' }
    });
    component.$on('dismiss', onDismiss);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Posição adicionada.');
    expect(alert.classList.contains('alert-success')).toBe(true);
    expect(alert.closest('[data-testid="app-toast-stack"]')).not.toBeNull();

    await fireEvent.click(screen.getByRole('button', { name: 'Fechar mensagem' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('exibe toast de erro', () => {
    render(AppToastStack);
    render(DismissibleAlert, {
      props: { text: 'Este ativo já está nesta carteira.', variant: 'error' }
    });

    const alert = screen.getByRole('alert');
    expect(alert.classList.contains('alert-error')).toBe(true);
    expect(alert.textContent).toContain('Este ativo já está nesta carteira.');
  });

  it('exibe toast de aviso', () => {
    render(AppToastStack);
    render(DismissibleAlert, {
      props: { text: 'Alguns tickers não foram encontrados.', variant: 'warning' }
    });

    const alert = screen.getByRole('alert');
    expect(alert.classList.contains('alert-warning')).toBe(true);
    expect(alert.textContent).toContain('Alguns tickers não foram encontrados.');
  });
});

describe('AppToastStack', () => {
  beforeEach(() => {
    appToast.clear();
  });

  it('empilha toasts no canto inferior direito', async () => {
    render(AppToastStack);
    appToast.upsert({ id: '1', text: 'Um', variant: 'success' });
    appToast.upsert({ id: '2', text: 'Dois', variant: 'error' });
    await tick();

    const stack = screen.getByTestId('app-toast-stack');
    expect(stack.className).toContain('fixed');
    expect(stack.className).toContain('bottom-4');
    expect(stack.className).toContain('right-4');
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('fecha toast de sucesso automaticamente após 10 segundos', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(AppToastStack);
    appToast.upsert({ id: 'ok', text: 'Salvo.', variant: 'success', onDismiss });
    await tick();
    expect(screen.getByRole('alert')).toBeTruthy();

    vi.advanceTimersByTime(10_000);
    await tick();

    expect(screen.queryByRole('alert')).toBeNull();
    expect(onDismiss).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('não fecha toast de erro automaticamente', async () => {
    vi.useFakeTimers();
    render(AppToastStack);
    appToast.upsert({ id: 'err', text: 'Falhou.', variant: 'error' });
    await tick();

    vi.advanceTimersByTime(10_000);
    await tick();

    expect(screen.getByRole('alert')).toBeTruthy();
    vi.useRealTimers();
  });
});
