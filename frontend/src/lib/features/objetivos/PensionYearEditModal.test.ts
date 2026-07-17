import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import PensionYearEditModal from './PensionYearEditModal.svelte';

describe('PensionYearEditModal', () => {
  it('preenche campos ao abrir e emite save', async () => {
    const onSave = vi.fn();
    const { component } = render(PensionYearEditModal, {
      props: {
        open: true,
        planYear: 2026,
        initialAnnualGrossIncomeBrl: 216_000,
        initialContributedYtdBrl: 9_800
      }
    });
    component.$on('save', onSave);

    expect(document.querySelector('[data-testid="pension-year-edit-modal"]')).toBeTruthy();

    const income = document.querySelector(
      '[data-testid="pension-income-input"]'
    ) as HTMLInputElement;
    const contributed = document.querySelector(
      '[data-testid="pension-contributed-input"]'
    ) as HTMLInputElement;

    expect(income.value).toMatch(/216\.000,00/);
    expect(contributed.value).toMatch(/9\.800,00/);

    await fireEvent.focus(contributed);
    await fireEvent.input(contributed, { target: { value: '12000' } });

    const saveBtn = document.querySelector('[data-testid="pension-save-btn"]') as HTMLButtonElement;
    await fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          planYear: 2026,
          annualGrossIncomeBrl: 216_000,
          contributedYtdBrl: 12_000
        }
      })
    );
  });

  it('emite close ao cancelar', async () => {
    const onClose = vi.fn();
    const { component } = render(PensionYearEditModal, {
      props: { open: true, planYear: 2025 }
    });
    component.$on('close', onClose);

    const cancelBtn = document.querySelector('[data-testid="pension-cancel-btn"]') as HTMLButtonElement;
    await fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
