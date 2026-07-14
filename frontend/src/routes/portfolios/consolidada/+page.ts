import { redirect } from '@sveltejs/kit';

/** Redireciona URL legada para a rota de menu principal. */
export function load({ url }) {
  const target = url.search ? `/consolidada${url.search}` : '/consolidada';
  redirect(308, target);
}
