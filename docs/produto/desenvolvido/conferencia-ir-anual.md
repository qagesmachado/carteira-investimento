# Conferência anual de IR

## Objetivo

Facilitar a conferência anual de proventos e posições para declaração de Imposto de Renda — equivalente às abas `DB Proventos`, `Proventos Cálculos` e às abas de carteira (`Ações`, `Fundos`, `Internacional`) da planilha, com snapshot de posições em 31/12.

## Escopo MVP

- Página **`/ferramentas/conferencia-ir`**: seletor de carteira e ano, três abas (Detalhado, Resumo, Posições), congelamento de snapshot e exportação.
- API de **snapshot** por carteira/ano: congela quantidade e preço médio das posições ativas.
- API de **relatório anual**: proventos do ano discriminados por ativo e tipo, resumo pivot e posições do snapshot.
- Exportação **CSV** (backend, 3 seções) e **Excel** (frontend, 3 abas).

## Fora do escopo

- Conferência automática com informe de rendimentos (PDF/XML).
- IR retido na fonte, códigos Receita Federal.
- Snapshot automático em 01/01.
- Ganho de capital / DARF.
- Relatório consolidado multi-carteira.

## Snapshot de fim de ano

| Campo | Descrição |
|-------|-----------|
| `portfolio_id` | Carteira |
| `year` | Ano calendário (ex. 2024) |
| `snapshot_date` | Data de referência (default `31/12/{year}`) |
| `created_at` | Momento do congelamento |

Cada snapshot copia as **posições ativas** (`status = active`) com `quantity`, `average_price`, `invested_amount` e `currency` do ativo.

**Fluxo recomendado:** em janeiro, antes de alterar posições, congelar o ano anterior. Um snapshot por `(portfolio_id, year)`; sobrescrever exige confirmação na UI.

Sem snapshot para o ano selecionado, a aba **Posições** exibe aviso — não usa posições atuais silenciosamente.

## Relatório anual

Filtra proventos com `payment_date` entre `01/01/{ano}` e `31/12/{ano}` da carteira selecionada.

**Roll-up fiscal:** se `company_cnpj`, `payer_cnpj` ou `payer_name` estiverem vazios no lançamento, usa os defaults do ativo no catálogo.

### Abas da UI

| Aba | Conteúdo |
|-----|----------|
| Detalhado | Cada lançamento: ativo (sem `.SA`), tipo do ativo, **classe** (nacional/internacional), tipo de provento, data, valor, CNPJs; filtros (tipo de ativo, classe, tipo de provento), ordenação por coluna e paginação |
| Resumo | Linhas = ativos; colunas = classe, tipos de provento + total; filtros por tipo de ativo e classe; ordenação e paginação |
| Posições | Qty e preço médio do snapshot de 31/12; **sem renda fixa nem previdência**; colunas tipo do ativo e **classe** (nacional/internacional); filtros por tipo de ativo e classe; ordenação e paginação |

**Classe** = mercado do ativo (`national` / `international`), exibido como Nacional ou Internacional — permite separar rendimentos e bens no exterior na conferência do IR.

## API

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/portfolios/{id}/year-snapshots` | Congela posições (`year`, `snapshot_date?`, `replace?`) |
| GET | `/portfolios/{id}/year-snapshots` | Lista anos com snapshot |
| GET | `/portfolios/{id}/year-snapshots/{year}` | Detalhe das posições congeladas |
| DELETE | `/portfolios/{id}/year-snapshots/{year}` | Remove snapshot |
| GET | `/portfolios/{id}/annual-ir-report?year=` | Relatório JSON completo |
| GET | `/portfolios/{id}/annual-ir-report/export?year=&format=csv` | Export CSV (3 seções) |

## Estados vazios

- **Sem carteira ativa:** exibe o onboarding padronizado (`EmptyStateCallout` «Nenhuma carteira ainda» + botão **Criar carteira** → `/portfolios`). Congelar snapshot e exportar ficam desabilitados.

## Exportação

- **CSV:** seções `# DETALHADO`, `# RESUMO`, `# POSICOES` no mesmo arquivo.
- **Excel:** arquivo `conferencia-ir-{carteira}-{ano}.xlsx` com abas Detalhado, Resumo, Posições (gerado no frontend via `xlsx`).

## Casos de uso E2E

Prefixo `UI-IR-` em `e2e/casos-de-uso/ui/ferramentas/conferencia-ir/`.
