import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'specs/assets');

fs.mkdirSync(assetsDir, { recursive: true });

const shared = {
  '03-cadastro-manual-renda-fixa': {
    id: '003',
    title: 'Cadastro manual de renda fixa',
    md: '03-cadastro-manual-renda-fixa.md',
    body: `import { expect, test } from '../fixtures/test';

import { registeredAssetsTable } from '../helpers/assetsPage';
import { E2E_CDB_NAME } from '../helpers/e2eFixtures';
import {
  fillAndSaveManualFixedIncome,
  startManualFixedIncome
} from '../helpers/manualAssetForm';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';
import { getWorkerApiBaseUrl } from '../helpers/workerContext';

test.describe('UI-AST-003', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('cadastra renda fixa manual e persiste', async ({ page }) => {
    await gotoAssetsPage(page);
    await startManualFixedIncome(page);
    await fillAndSaveManualFixedIncome(page);

    const table = registeredAssetsTable(page);
    await expect(table.locator('tbody tr')).toContainText('Renda fixa');
    await expect(table.locator('tbody tr')).toContainText(E2E_CDB_NAME);

    await page.reload();
    await expect(table.locator('tbody tr')).toContainText(E2E_CDB_NAME);
  });
});
`
  }
};

for (const [file, spec] of Object.entries(shared)) {
  const content = `/**\n * UI-AST-${spec.id} — ${spec.title}\n * @see ../../../casos-de-uso/ui/assets/${spec.md}\n */\n${spec.body}`;
  fs.writeFileSync(path.join(assetsDir, `${file}.spec.ts`), content, 'utf8');
}

console.log('Specs written:', Object.keys(shared).length);
