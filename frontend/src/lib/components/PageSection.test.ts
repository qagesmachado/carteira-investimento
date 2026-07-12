import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import PageSectionHarness from './PageSection.harness.svelte';
import PageSection from './PageSection.svelte';

describe('PageSection', () => {
  it('renderiza card com título', () => {
    render(PageSection, {
      props: {
        title: 'Balanceamento desejado',
        testId: 'rebalance-section'
      }
    });

    const section = screen.getByTestId('rebalance-section');
    expect(section.className).toContain('card');
    expect(section.className).toContain('shadow');
    expect(screen.getByRole('heading', { name: 'Balanceamento desejado', level: 2 })).toBeTruthy();
  });

  it('renderiza slot sem título', () => {
    render(PageSectionHarness);

    expect(screen.getByTestId('page-section-content')).toBeTruthy();
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
