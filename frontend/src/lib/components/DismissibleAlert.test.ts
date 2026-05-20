import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import DismissibleAlert from './DismissibleAlert.svelte';

describe('DismissibleAlert', () => {
  it('não renderiza quando o texto está vazio', () => {
    const { container } = render(DismissibleAlert, { props: { text: '' } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('exibe mensagem de sucesso e dispara dismiss ao fechar', async () => {
    const onDismiss = vi.fn();
    const { component } = render(DismissibleAlert, {
      props: { text: 'Posição adicionada.', variant: 'success' }
    });
    component.$on('dismiss', onDismiss);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Posição adicionada.');
    expect(alert.classList.contains('alert-success')).toBe(true);

    await fireEvent.click(screen.getByRole('button', { name: 'Fechar mensagem' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('exibe mensagem de erro', () => {
    render(DismissibleAlert, {
      props: { text: 'Este ativo já está nesta carteira.', variant: 'error' }
    });

    const alert = screen.getByRole('alert');
    expect(alert.classList.contains('alert-error')).toBe(true);
    expect(alert.textContent).toContain('Este ativo já está nesta carteira.');
  });
});
