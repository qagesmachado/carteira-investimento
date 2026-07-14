# Cadastro de proventos

## Objetivo

Registrar proventos recebidos (dividendos, JCP, créditos, etc.) por ativo, com histórico consultável, filtros e ordenação — equivalente transacional às abas `DB Proventos` e `DB Proventos internacional` da planilha.

## Escopo MVP

- Página **`/proventos`**: formulário de cadastro/edição, importação em lote (CSV/Excel) e tabela de lançamentos.
- API **`/dividend-payments`**: CRUD com filtros; **`/dividend-payments/bulk/preview`** e **`/bulk`** para importação.
- Persistência em `carteira.db` (banco único); cada lançamento tem **FK** `portfolio_id` → `portfolio.id`.
- Rótulos da interface em **português**; API e enums em **inglês**.
- Total de proventos por ativo na **visão consolidada** (`/consolidada`, painel Detalhes), **filtrado pela carteira ativa**.

## Vínculo com carteira

Todo provento **pertence a uma carteira**. A regra é:

- `portfolio_id` é **obrigatório** no modelo `DividendPayment` e em qualquer criação (`POST /dividend-payments`).
- No formulário, o seletor de carteira inicia com a **carteira ativa** (top-bar) mas pode ser alterado.
- A listagem `/proventos` exibe a **coluna Carteira** e oferece **filtro por carteira** (default: carteira ativa).
- A importação em lote (CSV/XLSX) usa **um seletor único de carteira** aplicado a todas as linhas; o arquivo não precisa conter coluna de carteira.
- A visão consolidada (`/consolidada`) e o dashboard (`/dashboard`) chamam `/dividend-payments?portfolio_id=<ativa>` — proventos de outras carteiras **não** vazam para o totalizador por ativo.
- O backfill da migração coloca todos os lançamentos legados (sem `portfolio_id`) na carteira chamada **`Controle investimento`** (match case-insensitive). Se essa carteira não existir, os lançamentos legados ficam órfãos e são listados apenas pelo endpoint sem filtro até serem reatribuídos via PATCH.

## Fora do escopo (fases posteriores)

- Abas `Proventos Cálculos*` (agregações mensais/anuais).
- Automação Playwright (casos documentados em `e2e/casos-de-uso/ui/proventos/`).

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

Arquivos: `.csv`, `.txt`, `.xlsx`. Fluxo: escolher **carteira de destino** → analisar → pré-visualizar no servidor → importar selecionados. A carteira escolhida vai aplicada a TODAS as linhas confirmadas.

## Interface

- Menu **Carteira → Proventos**.
- Formulário: **carteira** (default = ativa), ativo (picker), tipo, data, valor, moeda, observações, dados fiscais opcionais.
- Tabela: filtros por texto, **carteira** (default = ativa), tipo, mercado, período; ordenação por coluna; coluna **Carteira** visível.
- Coluna **Tipo** exibe rótulos PT («Dividendo», «JCP»), nunca slugs da API.
- Importação em lote tem **seletor de carteira** próprio (default = ativa) aplicado ao batch inteiro.

## Critérios de aceite

- O usuário cadastra um provento vinculado a um ativo existente **e a uma carteira**.
- O usuário edita e remove lançamentos pela tabela; pode **reatribuir o provento para outra carteira** pela edição.
- Filtros e ordenação funcionam na listagem, **incluindo filtro por carteira**.
- Tipos e mercado aparecem em português na UI.
- Lançamento sem ativo, **sem carteira** ou com valor ≤ 0 é rejeitado.
- Provento cadastrado na carteira A **não** aparece nos totalizadores por ativo da carteira B (visão consolidada e dashboard).
- Importação em lote aplica a carteira selecionada a todas as linhas; rejeita se nenhuma carteira for escolhida.

## Referências

- [abas.md — DB Proventos](../../planilha/abas.md)
- [funcionalidades.md — §6](../funcionalidades.md)
- Casos E2E: [e2e/casos-de-uso/ui/proventos/](../../../e2e/casos-de-uso/ui/proventos/README.md)
