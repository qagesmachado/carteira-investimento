# Cadastro de proventos

## Objetivo

Registrar proventos recebidos (dividendos, JCP, créditos, etc.) por ativo, com histórico consultável, filtros e ordenação — equivalente transacional às abas `DB Proventos` e `DB Proventos internacional` da planilha.

## Escopo MVP

- Página **`/proventos`**: formulário de cadastro/edição, importação em lote (CSV/Excel) e tabela de lançamentos.
- API **`/dividend-payments`**: CRUD com filtros; **`/dividend-payments/bulk/preview`** e **`/bulk`** para importação.
- Persistência em `carteira.db` (mesmo banco do catálogo de ativos).
- Rótulos da interface em **português**; API e enums em **inglês**.
- Total de proventos por ativo na **visão consolidada** (`/portfolios/consolidada`, painel Detalhes).

## Fora do escopo (fases posteriores)

- Abas `Proventos Cálculos*` (agregações mensais/anuais).
- Automação Playwright (casos documentados em `e2e/casos-de-uso/ui/proventos/`).

## Modelo de dados

| Campo | Descrição |
|-------|-----------|
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
| GET | `/dividend-payments` | Lista (query: `asset_id`, `payment_type`, `market`, `from_date`, `to_date`, `symbol`) |
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

Arquivos: `.csv`, `.txt`, `.xlsx`. Fluxo: analisar → pré-visualizar no servidor → importar selecionados.

## Interface

- Menu **Cadastro → Proventos**.
- Formulário: ativo (picker), tipo, data, valor, moeda, observações, dados fiscais opcionais.
- Tabela: filtros por texto, tipo, mercado, período; ordenação por coluna.
- Coluna **Tipo** exibe rótulos PT («Dividendo», «JCP»), nunca slugs da API.

## Critérios de aceite

- O usuário cadastra um provento vinculado a um ativo existente.
- O usuário edita e remove lançamentos pela tabela.
- Filtros e ordenação funcionam na listagem.
- Tipos e mercado aparecem em português na UI.
- Lançamento sem ativo ou com valor ≤ 0 é rejeitado.

## Referências

- [abas.md — DB Proventos](../../planilha/abas.md)
- [funcionalidades.md — §6](../funcionalidades.md)
- Casos E2E: [e2e/casos-de-uso/ui/proventos/](../../../e2e/casos-de-uso/ui/proventos/README.md)
