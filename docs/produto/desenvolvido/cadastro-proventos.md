# Cadastro de proventos

## Objetivo

Registrar proventos recebidos (dividendos, JCP, créditos, etc.) por ativo, com histórico consultável, filtros e ordenação — equivalente transacional às abas `DB Proventos` e `DB Proventos internacional` da planilha.

## Escopo MVP

- Página **`/proventos`**: navegação por abas (padrão "Ferramenta área", igual a `/analise`) com três seções — **Resumo**, **Adicionar** e **Lançamentos**.
  - `/proventos` redireciona para **`/proventos/resumo`** (aba inicial ao entrar pelo menu/atalho).
  - **Resumo** (`/proventos/resumo`): KPIs (total no ano, este mês, nº de lançamentos, maior pagador) e uma linha com **três painéis** de gráfico de barras lado a lado — **Proventos por ano**, **Proventos por mês** (com seletor de ano) e **Top ativos por proventos** (sem botões de alternância). **Por ano/por mês usam o histórico completo** da carteira; **"Maior pagador" e "Top ativos" consideram apenas ativos em carteira** (mesma regra do painel "Top ativos" do Dashboard).
  - **Adicionar** (`/proventos/adicionar`): formulário de cadastro **e** importação em lote (CSV/Excel).
  - **Lançamentos** (`/proventos/lancamentos`): tabela com filtros, ordenação, edição e remoção.
- API **`/dividend-payments`**: CRUD com filtros; **`/dividend-payments/bulk/preview`** e **`/bulk`** para importação.
- Persistência em `carteira.db` (banco único); cada lançamento tem **FK** `portfolio_id` → `portfolio.id`.
- Rótulos da interface em **português**; API e enums em **inglês**.
- Total de proventos por ativo na **visão consolidada** (`/consolidada`, painel Detalhes), **filtrado pela carteira ativa**.

## Vínculo com carteira

Todo provento **pertence a uma carteira**. A regra é:

- `portfolio_id` é **obrigatório** no modelo `DividendPayment` e em qualquer criação (`POST /dividend-payments`).
- A carteira do lançamento é a **carteira ativa** definida no painel do topo da seção (não há seletor de carteira no formulário). No **cadastro** ela é aplicada automaticamente; na **edição** a carteira do lançamento aparece apenas como **texto fixo** (não editável).
- A listagem `/proventos` exibe a **coluna Carteira** e oferece **filtro por carteira** (default: carteira ativa).
- A importação em lote (CSV/XLSX) grava na **carteira ativa do painel do topo**, aplicada a todas as linhas; o arquivo não precisa conter coluna de carteira e não há seletor próprio de carteira no lote.
- A visão consolidada (`/consolidada`) e o dashboard (`/dashboard`) chamam `/dividend-payments?portfolio_id=<ativa>` — proventos de outras carteiras **não** vazam para o totalizador por ativo.
- O backfill da migração coloca todos os lançamentos legados (sem `portfolio_id`) na carteira chamada **`Controle investimento`** (match case-insensitive). Se essa carteira não existir, os lançamentos legados ficam órfãos e são listados apenas pelo endpoint sem filtro até serem reatribuídos via PATCH.

## Fora do escopo (fases posteriores)

- Projeção/estimativa de proventos futuros (yield on cost projetado).

## Modelo de dados

| Campo | Descrição |
|-------|-----------|
| `portfolio_id` | **Carteira dona** do lançamento (obrigatório; FK → `portfolio.id`) |
| `asset_id` | Ativo do catálogo |
| `payment_type` | `dividend`, `jcp`, `credit`, `fraction`, `redemption`, `other` |
| `payment_date` | Data de recebimento |
| `amount` | Valor total recebido (> 0) |
| `currency` | Moeda (padrão do ativo) |
| `notes` | Observações (coluna OUTROS da planilha) |
| `company_cnpj`, `payer_cnpj`, `payer_name` | Opcionais; override dos dados fiscais do ativo |

Mercado (nacional/internacional) é **derivado** do ativo, não duplicado em tabela.

Linhas `SOMA` da planilha são agregações — **não** são lançamentos transacionais.

## API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/dividend-payments` | Lista (query: `portfolio_id`, `asset_id`, `payment_type`, `market`, `from_date`, `to_date`, `symbol`). Sem `portfolio_id` retorna lançamentos de todas as carteiras + órfãos. |
| POST | `/dividend-payments` | Criar |
| GET | `/dividend-payments/{id}` | Detalhe |
| PATCH | `/dividend-payments/{id}` | Atualizar |
| DELETE | `/dividend-payments/{id}` | Remover |
| POST | `/dividend-payments/bulk/preview` | Validar linhas de importação |
| POST | `/dividend-payments/bulk` | Criar proventos em lote |

## Importação em lote

Dois formatos auto-detectados pelo cabeçalho:

- **Template:** `ticker`, `data`, `valor`, `tipo` (opcional), `moeda`, `observacoes`, campos fiscais.
- **Legado:** colunas das abas `DB Proventos` / `DB Proventos internacional` (`Ativo`, `Data`, `Valor`, etc.).

Arquivos: `.csv`, `.txt`, `.xlsx`. Fluxo: analisar → pré-visualizar no servidor → importar selecionados. A **carteira ativa do painel do topo** é aplicada a TODAS as linhas confirmadas (sem seletor de carteira no lote).

## Interface

- Menu **Carteira → Proventos** (abre em **Resumo**).
- Cabeçalho `PageHero` + pills de navegação (ícones Lucide) para as abas **Resumo**, **Adicionar** e **Lançamentos**.
- **Painel de carteira** (primeiro painel, logo após as pills): seletor único de carteira que define o escopo de **toda a seção** (Resumo, Adicionar, Lançamentos). Trocar a carteira aqui **persiste a carteira ativa** globalmente (mesmo padrão do Dashboard/Análise) e recarrega proventos e posições. Default = carteira ativa.
- **Resumo:** cards de KPI com ícone (total no ano, este mês, nº de lançamentos, maior pagador) e uma linha de **três painéis** de barras — **Proventos por ano**, **Proventos por mês** (seletor de ano) e "Top ativos por proventos". Não há botões de alternância (anual/mensal e tabela/barras foram substituídos por painéis dedicados).
  - "Proventos por ano" e "Proventos por mês" refletem **todo o histórico** da carteira (inclui ativos já vendidos).
  - "**Maior pagador**" e "**Top ativos por proventos**" contam **só ativos em carteira** (posição aberta) — igual ao painel "Top ativos → Proventos (total)" do Dashboard; assim os dois números batem.
- **Adicionar:**
  - Formulário: ativo (picker), tipo, data, valor, moeda, observações, dados fiscais opcionais. A **carteira** vem do painel do topo (sem seletor no formulário).
  - Importação em lote (CSV/XLSX) aplica a **carteira ativa do painel do topo** ao batch inteiro (sem seletor próprio).
- **Lançamentos:** tabela com filtros por texto, ano, tipo, mercado e período; ordenação por coluna; coluna **Carteira** visível. A carteira é definida pelo painel do topo (não há mais seletor de carteira dentro da lista). Coluna **Tipo** exibe rótulos PT («Dividendo», «JCP»), nunca slugs da API.
- A página `/dados` mantém apenas a **exportação** de proventos em CSV; a importação em lote passou para **Proventos → Adicionar**.
- **Sem nenhuma carteira cadastrada:** Resumo e Lançamentos exibem o onboarding padronizado (`EmptyStateCallout` «Nenhuma carteira ainda» + botão **Criar carteira** → `/portfolios`), **não** a leitura global. Nesse estado a listagem não busca proventos, evitando exibir registros órfãos (legado sem `portfolio_id`).

## Critérios de aceite

- O usuário cadastra um provento vinculado a um ativo existente **e a uma carteira**.
- O usuário edita e remove lançamentos pela tabela; a **carteira** do lançamento aparece como texto fixo na edição (não editável).
- Filtros e ordenação funcionam na listagem, **incluindo filtro por carteira**.
- Tipos e mercado aparecem em português na UI.
- Lançamento sem ativo, **sem carteira** ou com valor ≤ 0 é rejeitado.
- Provento cadastrado na carteira A **não** aparece nos totalizadores por ativo da carteira B (visão consolidada e dashboard).
- Importação em lote aplica a **carteira ativa do painel do topo** a todas as linhas; rejeita se não houver carteira ativa.

## Referências

- [abas.md — DB Proventos](../../planilha/abas.md)
- [funcionalidades.md — §6](../funcionalidades.md)
- Casos E2E: [e2e/casos-de-uso/ui/proventos/](../../../e2e/casos-de-uso/ui/proventos/README.md)
