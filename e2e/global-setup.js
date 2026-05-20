const fs = require('node:fs');
const path = require('node:path');

const testDbDir = path.join(__dirname, '..', 'backend', 'data', 'test');

/**
 * Garante que o diretório de teste existe.
 * A limpeza dos .db é feita em scripts/reset-test-db.js (antes do Playwright subir o webServer).
 */
module.exports = async function globalSetup() {
  fs.mkdirSync(testDbDir, { recursive: true });
};
