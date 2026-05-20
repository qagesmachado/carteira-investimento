import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AssetLookupForm from './AssetLookupForm.svelte';

describe('AssetLookupForm', () => {
  it('renderiza campo de busca e chama lookup ao enviar', async () => {
    const onLookup = vi.fn();
    render(AssetLookupForm, { onLookup });

    await fireEvent.input(screen.getByLabelText('Ticker ou símbolo'), {
      target: { value: 'PETR4.SA' }
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Buscar ativo' }));

    expect(onLookup).toHaveBeenCalledWith('PETR4.SA');
  });
});
