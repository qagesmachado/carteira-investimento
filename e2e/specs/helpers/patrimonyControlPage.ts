import { expect, type Page } from '@playwright/test';

export async function gotoPatrimonyControlPage(page: Page): Promise<void> {
  await page.goto('/ferramentas/controle-patrimonio', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Controle de patrimônio', exact: true })
  ).toBeVisible({ timeout: 15_000 });
}

export type EmergencyReserveLocation = 'banco' | 'dinheiro_especie' | 'corretora';

export async function openManualPatrimonyForm(page: Page): Promise<void> {
  await page.getByTestId('add-emergency_reserve').click();
  await expect(page.getByTestId('manual-patrimony-name')).toBeVisible();
}

export async function fillManualPatrimonyForm(
  page: Page,
  options: {
    name: string;
    amount: string;
    location?: EmergencyReserveLocation;
  }
): Promise<void> {
  await page.getByTestId('manual-patrimony-name').fill(options.name);
  if (options.location != null) {
    await page.getByTestId('manual-patrimony-location').selectOption(options.location);
  }
  await page.getByTestId('manual-patrimony-amount').fill(options.amount);
}

export async function saveManualPatrimonyForm(page: Page): Promise<void> {
  const reloadPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/patrimony-control') &&
      response.request().method() === 'GET' &&
      response.ok(),
    { timeout: 15_000 }
  );
  await page.getByTestId('manual-patrimony-save').click();
  await reloadPromise;
  await expect(page.getByTestId('manual-patrimony-save')).not.toBeVisible();
}
