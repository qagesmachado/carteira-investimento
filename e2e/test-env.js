/** Portas do worker 0 — ver worker-env.js para offsets por worker. */
const {
  E2E_API_PORT,
  E2E_FRONTEND_PORT,
  E2E_API_BASE_URL,
  E2E_FRONTEND_BASE_URL,
  E2E_WORKER_COUNT,
  getWorkerEnv
} = require('./worker-env');

module.exports = {
  E2E_API_PORT,
  E2E_FRONTEND_PORT,
  E2E_API_BASE_URL,
  E2E_FRONTEND_BASE_URL,
  E2E_WORKER_COUNT,
  getWorkerEnv
};
