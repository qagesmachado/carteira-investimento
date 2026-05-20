const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiTimeoutError extends Error {
  constructor(message = 'Tempo esgotado ao conectar na API. Verifique se o backend está em execução.') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/** fetch com timeout; evita loading infinito quando a API não responde. */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { timeoutMs: _timeout, ...fetchInit } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...fetchInit, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
