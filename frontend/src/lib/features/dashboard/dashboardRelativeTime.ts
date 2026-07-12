export function formatRelativeMinutes(
  iso: string | null | undefined,
  reference: Date = new Date()
): string {
  if (!iso) {
    return '';
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const diffMs = reference.getTime() - parsed.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 1) {
    return 'agora';
  }
  if (minutes === 1) {
    return 'há 1 min';
  }
  if (minutes < 60) {
    return `há ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return 'há 1 h';
  }
  if (hours < 24) {
    return `há ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? 'há 1 dia' : `há ${days} dias`;
}

export function buildDashboardHeroSubtitle(
  portfolioName: string | null,
  refreshedAt: string | null | undefined,
  reference: Date = new Date()
): string {
  const name = portfolioName?.trim() || 'Carteira';
  const relative = formatRelativeMinutes(refreshedAt, reference);
  if (!relative) {
    return name;
  }
  return `${name} · atualizado ${relative}`;
}
