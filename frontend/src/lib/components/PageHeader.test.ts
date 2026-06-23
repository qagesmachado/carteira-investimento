import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import PageHeaderHarness from './PageHeader.harness.svelte';
import PageHeader from './PageHeader.svelte';

describe('PageHeader', () => {
  it('renderiza título e subtítulo', () => {
    render(PageHeader, {
      props: {
        title: 'Rebalanceamento',
        subtitle: 'Compare alocação atual com metas da carteira.'
      }
    });

    expect(screen.getByRole('heading', { name: 'Rebalanceamento', level: 1 })).toBeTruthy();
    expect(screen.getByText('Compare alocação atual com metas da carteira.')).toBeTruthy();
  });

  it('renderiza slot actions quando fornecido', () => {
    render(PageHeaderHarness, { props: { showActions: true } });

    expect(screen.getByTestId('page-header-actions')).toBeTruthy();
  });

  it('mantém área de actions vazia sem quebrar layout quando slot ausente', () => {
    render(PageHeaderHarness, { props: { showActions: false } });

    expect(screen.queryByTestId('page-header-actions')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Título da página', level: 1 })).toBeTruthy();
  });
});
