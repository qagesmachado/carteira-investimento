/**
 * Apaga os SQLite de teste antes do Playwright subir o webServer.
 * Deve rodar via npm (antes de `playwright test`), não no globalSetup.
 */
const fs = require('node:fs');
const path = require('node:path');

const testDbDir = path.join(__dirname, '..', '..', 'backend', 'data', 'test');
const dbFiles = ['carteira.db'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.unlinkSync(filePath);
      return;
    } catch (error) {
      if (error.code === 'EBUSY' || error.code === 'EPERM') {
        if (attempt === 7) {
          console.error(
            `reset-test-db: não foi possível apagar ${filePath} (arquivo em uso).\n` +
              'Feche processos na porta 8001 (backend E2E) ou apague manualmente backend/data/test/*.db'
          );
          process.exit(1);
        }
        await sleep(250);
        continue;
      }
      throw error;
    }
  }
}

async function main() {
  fs.mkdirSync(testDbDir, { recursive: true });
  for (const name of dbFiles) {
    const base = path.join(testDbDir, name);
    await removeIfExists(base);
    await removeIfExists(`${base}-wal`);
    await removeIfExists(`${base}-shm`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
