import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import AppPageShell from './AppPageShell.svelte';

describe('AppPageShell', () => {
  it('renderiza com largura de página e padding horizontal padrão', () => {
    render(AppPageShell, {
      props: {
        paddingY: 'py-4'
      }
    });

    const shell = screen.getByTestId('app-page-shell');
    expect(shell.className).toContain('2xl:max-w-page');
    expect(shell.className).toContain('px-4');
    expect(shell.className).toContain('py-4');
  });

  it('usa padding uniforme py-2 px-4 quando solicitado', () => {
    render(AppPageShell, {
      props: {
        paddingY: 'py-2-px-4',
        class: 'space-y-3'
      }
    });

    const shell = screen.getByTestId('app-page-shell');
    expect(shell.className).toContain('py-2');
    expect(shell.className).toContain('px-4');
    expect(shell.className).not.toContain('px-4 py-4');
    expect(shell.className).toContain('space-y-3');
  });

  it('renderiza elemento main quando configurado', () => {
    render(AppPageShell, {
      props: {
        element: 'main',
        paddingY: 'py-2-px-4'
      }
    });

    expect(screen.getByTestId('app-page-shell').tagName).toBe('MAIN');
  });
});
