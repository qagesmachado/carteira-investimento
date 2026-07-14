import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import NavbarDropdownHarness from './NavbarDropdown.harness.svelte';

describe('NavbarDropdown', () => {
  it('renderiza label e chevron no gatilho', () => {
    render(NavbarDropdownHarness);

    expect(screen.getByRole('button', { name: 'Carteira' })).toBeTruthy();
    expect(screen.getByTestId('lucide-icon-ChevronDown')).toBeTruthy();
  });

  it('usa dropdown-hover para abrir no mouse over', () => {
    const { container } = render(NavbarDropdownHarness);

    expect(container.querySelector('.dropdown-hover')).toBeTruthy();
  });
});
