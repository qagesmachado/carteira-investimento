import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

import pkg from './package.json';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    __FRONTEND_VERSION__: JSON.stringify(pkg.version)
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['src/test-setup.ts']
  }
});
