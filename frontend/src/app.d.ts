declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  // Injetada no build via `define` em vite.config.ts.
  const __FRONTEND_VERSION__: string;
}

export {};
