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
  // Build de produção (app empacotado): mesma origem, API montada sob /api.
  return '/api';
}

export const API_BASE_URL = resolveApiBaseUrl();
