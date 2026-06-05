const os = require('node:os');

const E2E_API_BASE_PORT = Number(process.env.E2E_API_BASE_PORT || 8001);
const E2E_FRONTEND_BASE_PORT = Number(process.env.E2E_FRONTEND_BASE_PORT || 5174);

function resolveWorkerCount() {
  if (process.env.E2E_WORKERS != null && process.env.E2E_WORKERS !== '') {
    const parsed = Number(process.env.E2E_WORKERS);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.floor(parsed);
    }
  }

  const logicalCores = os.cpus()?.length ?? 4;
  return Math.min(4, Math.max(1, Math.floor(logicalCores / 2)));
}

/**
 * @param {number} workerIndex
 */
function getWorkerEnv(workerIndex = 0) {
  const i = Number.isFinite(workerIndex) ? Math.max(0, Math.floor(workerIndex)) : 0;
  const apiPort = E2E_API_BASE_PORT + i;
  const frontendPort = E2E_FRONTEND_BASE_PORT + i;

  // Smoke contra o executável: origem única (SPA + API sob /api na mesma porta).
  // Quando SMOKE_BASE_URL está definido, ignoramos o índice de worker.
  const smokeBaseUrl = (process.env.SMOKE_BASE_URL || '').trim();
  if (smokeBaseUrl) {
    return {
      workerIndex: i,
      apiPort,
      frontendPort,
      apiBaseUrl: `${smokeBaseUrl}/api`,
      frontendBaseUrl: smokeBaseUrl,
      dbFile: `carteira-${i}.db`,
      databaseUrl: `sqlite:///./data/test/carteira-${i}.db`
    };
  }

  return {
    workerIndex: i,
    apiPort,
    frontendPort,
    apiBaseUrl: `http://127.0.0.1:${apiPort}`,
    frontendBaseUrl: `http://127.0.0.1:${frontendPort}`,
    dbFile: `carteira-${i}.db`,
    databaseUrl: `sqlite:///./data/test/carteira-${i}.db`
  };
}

function listWorkerDbFiles(workerCount) {
  const files = ['carteira.db'];
  for (let i = 0; i < workerCount; i += 1) {
    files.push(getWorkerEnv(i).dbFile);
  }
  return files;
}

const E2E_WORKER_COUNT = resolveWorkerCount();
const worker0 = getWorkerEnv(0);

module.exports = {
  E2E_API_BASE_PORT,
  E2E_FRONTEND_BASE_PORT,
  E2E_WORKER_COUNT,
  getWorkerEnv,
  listWorkerDbFiles,
  /** Worker 0 — compatível com docs existentes (8001 / 5174). */
  E2E_API_PORT: String(worker0.apiPort),
  E2E_FRONTEND_PORT: String(worker0.frontendPort),
  E2E_API_BASE_URL: worker0.apiBaseUrl,
  E2E_FRONTEND_BASE_URL: worker0.frontendBaseUrl
};
