export type AppTheme = 'light' | 'dark';

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
}
