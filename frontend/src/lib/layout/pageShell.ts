export const PAGE_SHELL_WIDTH_CLASS = 'mx-auto w-full min-w-0 max-w-none 2xl:max-w-page';
export const PAGE_SHELL_PADDING_X_CLASS = 'px-4';

export type PageShellPaddingY = 'py-4' | 'py-2-px-4' | 'pb-4' | 'none';

const PADDING_Y_CLASS: Record<PageShellPaddingY, string> = {
  'py-4': 'py-4',
  'py-2-px-4': 'py-2 px-4',
  'pb-4': 'pb-4',
  none: ''
};

export function pageShellPaddingClass(paddingY: PageShellPaddingY): string {
  if (paddingY === 'py-2-px-4') {
    return 'py-2 px-4';
  }
  return [PAGE_SHELL_PADDING_X_CLASS, PADDING_Y_CLASS[paddingY]].filter(Boolean).join(' ');
}

export function pageShellClass(paddingY: PageShellPaddingY, extraClass = ''): string {
  return [PAGE_SHELL_WIDTH_CLASS, pageShellPaddingClass(paddingY), extraClass].filter(Boolean).join(' ');
}
