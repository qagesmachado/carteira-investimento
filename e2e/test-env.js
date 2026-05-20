/** Portas dedicadas ao E2E (evitam conflito com dev em :8000 e :5173). */
const E2E_API_PORT = process.env.E2E_API_PORT || '8001';
const E2E_FRONTEND_PORT = process.env.E2E_FRONTEND_PORT || '5174';

module.exports = {
  E2E_API_PORT,
  E2E_FRONTEND_PORT,
  E2E_API_BASE_URL: `http://127.0.0.1:${E2E_API_PORT}`,
  E2E_FRONTEND_BASE_URL: `http://127.0.0.1:${E2E_FRONTEND_PORT}`
};
