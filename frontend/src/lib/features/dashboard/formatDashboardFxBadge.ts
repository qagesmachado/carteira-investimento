export function formatDashboardFxTimestamp(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

export function formatDashboardFxBadge(
  rate: number | null | undefined,
  refreshedAt: string | null | undefined
): string | null {
  if (rate == null) {
    return null;
  }
  const rateLabel = rate.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const timestamp = formatDashboardFxTimestamp(refreshedAt);
  if (!timestamp) {
    return `USD/BRL ${rateLabel}`;
  }
  return `USD/BRL ${rateLabel} · ${timestamp}`;
}

export function formatDashboardQuotesBadge(refreshedAt: string | null | undefined): string | null {
  const timestamp = formatDashboardFxTimestamp(refreshedAt);
  if (!timestamp) {
    return null;
  }
  return `Cotações · ${timestamp}`;
}
