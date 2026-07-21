import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import EmptyStateCallout from './EmptyStateCallout.svelte';

describe('EmptyStateCallout', () => {
  it('renderiza título, descrição e CTA com href', () => {
    render(EmptyStateCallout, {
      props: {
        title: 'Nenhuma carteira ainda',
        description: 'Crie sua primeira carteira para começar.',
        ctaLabel: 'Criar carteira',
        ctaHref: '/portfolios',
        icon: 'Wallet',
        testId: 'sem-carteira'
      }
    });

    expect(screen.getByTestId('sem-carteira')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nenhuma carteira ainda' })).toBeTruthy();
    expect(screen.getByText('Crie sua primeira carteira para começar.')).toBeTruthy();

    const cta = screen.getByTestId('sem-carteira-cta') as HTMLAnchorElement;
    expect(cta.tagName).toBe('A');
    expect(cta.getAttribute('href')).toBe('/portfolios');
    expect(cta.textContent?.trim()).toBe('Criar carteira');
  });

  it('não envolve em card quando card=false', () => {
    render(EmptyStateCallout, {
      props: {
        title: 'Sem carteira',
        ctaLabel: 'Criar carteira',
        ctaHref: '/portfolios',
        card: false,
        testId: 'inline'
      }
    });

    const wrapper = screen.getByTestId('inline');
    expect(wrapper.className).not.toContain('card');
  });

  it('omite o CTA quando falta label ou href', () => {
    render(EmptyStateCallout, {
      props: {
        title: 'Sem dados',
        description: 'Nada por aqui.',
        ctaLabel: '',
        ctaHref: '',
        testId: 'vazio'
      }
    });

    expect(screen.getByRole('heading', { name: 'Sem dados' })).toBeTruthy();
    expect(screen.queryByTestId('vazio-cta')).toBeNull();
  });
});
