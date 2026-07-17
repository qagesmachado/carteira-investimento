export function parseApiError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) {
    return fallback;
  }

  const raw = err.message.trim();
  if (!raw) {
    return fallback;
  }

  try {
    const body = JSON.parse(raw) as { detail?: string | Array<{ msg?: string }> };
    if (typeof body.detail === 'string') {
      return translateDetail(body.detail);
    }
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg ?? '').filter(Boolean).join(', ') || fallback;
    }
  } catch {
    /* not JSON */
  }

  return translateDetail(raw);
}

function translateDetail(detail: string): string {
  if (detail.includes('asset not found')) {
    return 'Ativo não encontrado na base. Cadastre-o em Ativos.';
  }
  if (detail.includes('portfolio name already exists')) {
    return 'Já existe uma carteira com este nome. Escolha outro.';
  }
  if (detail.includes('position for this asset already exists')) {
    return 'Este ativo já está nesta carteira.';
  }
  if (
    detail.includes('asset already exists') ||
    (detail.includes('asset ') && detail.includes('already exists'))
  ) {
    return 'Já existe um ativo com este ticker na base.';
  }
  if (detail.includes('portfolio not found')) {
    return 'Carteira não encontrada.';
  }
  if (detail === 'Not Found') {
    return 'Recurso da API não encontrado. Reinicie o backend para carregar a versão mais recente.';
  }
  if (detail.includes('could not resolve unique portfolio name')) {
    return 'Não foi possível gerar um nome único para a carteira. Renomeie manualmente.';
  }
  return detail;
}
