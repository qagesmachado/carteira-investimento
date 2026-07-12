import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import PageHero from './PageHero.svelte';
import PageHeroActionsHarness from './PageHeroActionsHarness.svelte';

describe('PageHero', () => {
  it('renderiza título e subtítulo com variant primary', () => {
    render(PageHero, {
      props: {
        title: 'Dashboard',
        subtitle: 'Visão executiva da carteira selecionada',
        variant: 'primary'
      }
    });

    const hero = screen.getByTestId('page-hero');
    expect(hero.className).toContain('from-primary');
    expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeTruthy();
    expect(screen.getByText('Visão executiva da carteira selecionada')).toBeTruthy();
  });

  it('renderiza variant secondary', () => {
    render(PageHero, {
      props: {
        title: 'Carteiras',
        variant: 'secondary'
      }
    });

    expect(screen.getByTestId('page-hero').className).toContain('from-secondary');
  });

  it('alinha actions à direita e centraliza verticalmente no hero', () => {
    render(PageHeroActionsHarness);

    const row = screen.getByTestId('page-hero').firstElementChild as HTMLElement;
    const actions = screen.getByTestId('page-hero-actions');
    expect(row.className).toContain('items-center');
    expect(row.className).toContain('justify-between');
    expect(actions.className).not.toContain('flex-col');
  });
});
