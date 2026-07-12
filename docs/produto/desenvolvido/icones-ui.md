# Ícones de UI (Lucide)

## Padrão

Toda interface do frontend usa ícones da biblioteca **[Lucide](https://lucide.dev/icons/)** via pacote `lucide-svelte`.

| Artefato | Caminho |
| --- | --- |
| Regra Cursor | `.cursor/rules/app/lucide-icons.mdc` (índice: `.cursor/rules/README.md`) |
| Registro no código | `frontend/src/lib/icons/lucideIconCatalog.ts` |
| Componente | `frontend/src/lib/components/LucideIcon.svelte` |
| Galeria dev | `/dev/icones-lucide` |

## Por que Lucide

- Ícones vetoriais consistentes (traço, proporção, `currentColor`)
- Catálogo grande e pesquisável em [lucide.dev/icons](https://lucide.dev/icons/)
- Sem PNG/SVG manual que pixeliza ou diverge do design system

## Como adicionar um ícone

1. Encontrar o nome em PascalCase no site (ex.: `CircleDollarSign` → [circle-dollar-sign](https://lucide.dev/icons/circle-dollar-sign)).
2. Importar em `lucideIconCatalog.ts` e incluir em `LUCIDE_ICON_ENTRIES`.
3. Usar `<LucideIcon name="…" size="lg" class="text-primary" />`.
4. Para ícones fixos de produto, exportar constante semântica (ex.: `DASHBOARD_PATRIMONY_LUCIDE_ICON`).

## Legado

`DashboardIcon` e arquivos em `frontend/static/icons/dashboard/` permanecem só até migração completa. **Não** adicionar ícones novos nessa pasta.

Exceção: assets não-Lucide documentados (ex.: bandeira `us-flag.svg` no badge USD/BRL).

## Ícones do dashboard (referência)

| Uso | Lucide | Constante |
| --- | --- | --- |
| Seletor «Carteira» (painel) | [Wallet](https://lucide.dev/icons/wallet) | `DASHBOARD_PORTFOLIO_LUCIDE_ICON` |
| Patrimônio total (KPI) | [WalletMinimal](https://lucide.dev/icons/wallet-minimal) | `DASHBOARD_PATRIMONY_LUCIDE_ICON` |
| Valor investido (KPI) | [BanknoteArrowUp](https://lucide.dev/icons/banknote-arrow-up) | `DASHBOARD_INVESTED_LUCIDE_ICON` |
| Lucro / prejuízo (KPI) | [TrendingUp](https://lucide.dev/icons/trending-up) | `DASHBOARD_PROFIT_LUCIDE_ICON` |
| Proventos (mês) (KPI) | [Receipt](https://lucide.dev/icons/receipt) | `DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON` |
| Proventos (ano) (KPI) | [ChartNoAxesColumn](https://lucide.dev/icons/chart-no-axes-column) | `DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON` |
| Posições ativas (KPI) | [ScrollText](https://lucide.dev/icons/scroll-text) | `DASHBOARD_POSITIONS_LUCIDE_ICON` |
| Atualizar cotações (hero) | [RotateCw](https://lucide.dev/icons/rotate-cw) | `DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON` |
| Atualizar câmbio (hero) | [Banknote](https://lucide.dev/icons/banknote) | `DASHBOARD_FX_REFRESH_LUCIDE_ICON` |
| Badge cotações | [CircleDollarSign](https://lucide.dev/icons/circle-dollar-sign) | `DASHBOARD_QUOTES_LUCIDE_ICON` |
| Último provento / recentes | [HandCoins](https://lucide.dev/icons/hand-coins) | `LAST_DIVIDEND_LUCIDE_ICON` |
| Classe em destaque | [ChartPie](https://lucide.dev/icons/chart-pie) | `FEATURED_CLASS_LUCIDE_ICON` |
