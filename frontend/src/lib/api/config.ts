function resolveApiBaseUrl(): string {
  const fromEnv =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined;
  if (fromEnv) {
    return fromEnv;
  }
  // Em dev, proxy do Vite evita CORS e requisições presas entre origens diferentes.
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return '/api';
  }
  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL = resolveApiBaseUrl();
