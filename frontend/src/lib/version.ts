// Versão do frontend injetada no build (vite `define`). Fallback para 'dev'
// quando a constante não estiver definida (ambientes fora do build).
export const FRONTEND_VERSION: string =
  typeof __FRONTEND_VERSION__ !== 'undefined' ? __FRONTEND_VERSION__ : 'dev';
