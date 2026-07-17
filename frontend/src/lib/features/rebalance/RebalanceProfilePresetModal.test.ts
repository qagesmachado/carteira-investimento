import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { defaultAllocationTargets } from '$lib/features/rebalance/allocationTargets';

import RebalanceProfilePresetModal from './RebalanceProfilePresetModal.svelte';

describe('RebalanceProfilePresetModal', () => {
  it('aplica metas do perfil selecionado ao confirmar', async () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(RebalanceProfilePresetModal, {
      props: { open: true, onApply, onClose }
    });

    await fireEvent.click(screen.getByTestId('rebalance-profile-preset-conservative'));
    await fireEvent.click(screen.getByTestId('rebalance-profile-preset-apply'));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0].classes.fixed_income).toBe(80);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('nao renderiza quando fechado', () => {
    render(RebalanceProfilePresetModal, {
      props: { open: false, onApply: () => undefined, onClose: () => undefined }
    });

    expect(screen.queryByTestId('rebalance-profile-preset-modal')).toBeNull();
  });

  it('cancelar fecha sem aplicar', async () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(RebalanceProfilePresetModal, {
      props: { open: true, onApply, onClose }
    });

    await fireEvent.click(screen.getByTestId('rebalance-profile-preset-cancel'));
    expect(onApply).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('cloneAllocationTargets', () => {
  it('cria copia independente', async () => {
    const { cloneAllocationTargets } = await import('$lib/features/rebalance/allocationTargets');
    const original = defaultAllocationTargets();
    const copy = cloneAllocationTargets(original);
    copy.classes.stocks = 99;
    expect(original.classes.stocks).not.toBe(99);
  });
});
