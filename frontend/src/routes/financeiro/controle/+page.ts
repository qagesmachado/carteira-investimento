import { redirect } from '@sveltejs/kit';

import { currentYearMonth } from '$lib/features/financeiro/budgetMonth';

export function load() {
  throw redirect(302, `/financeiro/controle/${currentYearMonth()}`);
}
