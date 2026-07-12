import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      maxWidth: {
        page: '112rem'
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark']
  }
};
