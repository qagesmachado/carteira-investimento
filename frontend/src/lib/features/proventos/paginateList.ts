export type PageSizeOption = 10 | 20 | 50 | 100;

export const DIVIDEND_PAGE_SIZE_OPTIONS: PageSizeOption[] = [10, 20, 50, 100];

export const DEFAULT_DIVIDEND_PAGE_SIZE: PageSizeOption = 20;

export type PaginateListOptions = {
  page: number;
  pageSize: number;
};

export type PaginateListResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
};

export function paginateList<T>(
  items: T[],
  { page, pageSize }: PaginateListOptions
): PaginateListResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    items: slice,
    page: safePage,
    pageSize,
    totalPages,
    totalItems,
    rangeStart: totalItems === 0 ? 0 : start + 1,
    rangeEnd: totalItems === 0 ? 0 : Math.min(start + pageSize, totalItems)
  };
}
