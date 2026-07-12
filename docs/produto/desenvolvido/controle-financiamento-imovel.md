# Controle de financiamento imóvel

## Objetivo

Permitir controlar, **por carteira**, receitas e despesas de financiamentos imobiliários — parcelas, aluguel, taxas e entradas — com visão de lucro e capital investido.

A carteira funciona como proxy do titular (campo `holder`); não há camada de login/perfil nesta entrega.

## Escopo MVP

- Seção **Ferramentas** na navbar → **Financiamento imóvel** em `/ferramentas/financiamento-imovel`.
- Financiamentos vinculados a `portfolio_id` (como Objetivos).
- **Aba Resumo**: total recebido, capital investido, lucro consolidado, tabela por imóvel, gráfico receitas vs despesas.
- **Detalhe por imóvel**: KPIs, gráfico, formulário de lançamento (estilo taxas BTC) e lista de eventos.
- Tipos de imóvel: casa, lote, apartamento, galpão, sala comercial.
- Lançamentos por **data** com tipo do evento (Receita/Despesa), categoria (Aluguel, Financiamento, Outras taxas, Entrada do financiamento), descrição e valor.
- **Padrões de lançamento** por imóvel: pré-preenchimento de tipo, evento, valor e descrição (sem data); CRUD independente dos lançamentos.
- API: `/portfolios/{portfolio_id}/property-financings`.

## Padrões de lançamento

Por imóvel (`financing_id`), o usuário pode salvar padrões nomeados que preenchem o formulário «Registrar lançamento»:

| Campo no padrão | Campo no lançamento |
| --------------- | ------------------- |
| `name` | — (rótulo do padrão) |
| `entry_type` | Tipo do evento |
| `event_category` | Evento |
| `description` | Descrição |
| `amount_brl` | Valor (R$) |

Regras:

- **Data não faz parte do padrão** — informada a cada lançamento.
- Aplicar padrão **não cria** lançamento; o usuário pode editar campos antes de Salvar.
- Editar ou excluir padrão **não altera** lançamentos já registrados.
- `UNIQUE(financing_id, name)` — nomes únicos por imóvel.
- Não é recorrência nem geração automática de meses.

API:

| Método | Path |
| ------ | ---- |
| GET (snapshot) | lista em `financings[].entry_templates` |
| POST | `/{financing_id}/entry-templates` |
| PATCH | `/entry-templates/{template_id}` |
| DELETE | `/entry-templates/{template_id}` |

## Fora do escopo

- Recorrência ou geração automática de lançamentos mensais.
- Padrões compartilhados entre imóveis da mesma carteira.
- Login/perfil de usuário.
- Vínculo com ativo imobiliário cadastrado na carteira.
- Importação automática de aluguel a partir de proventos.
- Consolidado cross-carteira entre titulares.

## Modelo de dados

| Entidade | Campos principais |
| -------- | ----------------- |
| `PropertyFinancing` | `portfolio_id`, `name`, `property_type`, `description` |
| `PropertyFinancingEntry` | `financing_id`, `event_date`, `entry_type` (`income` \| `expense`), `event_category`, `description`, `amount_brl` |
| `PropertyFinancingEntryTemplate` | `financing_id`, `name`, `entry_type`, `event_category`, `description`, `amount_brl`, `sort_order` |

Regras:

- `UNIQUE(portfolio_id, name)` — nomes únicos por carteira.
- `event_category` deve ser compatível com `entry_type` (ex.: `aluguel` só com receita).

## Métricas

```
total_income_brl      = sum(receitas)
total_expenses_brl    = sum(despesas)
profit_brl            = total_income - total_expenses
capital_invested_brl  = total_expenses
```

Consolidado da carteira: soma de todos os lançamentos de todos os imóveis.

## Rotas e telas

| Rota | Descrição |
| ---- | --------- |
| `/ferramentas/financiamento-imovel` | Resumo + detalhe por imóvel |

Componentes: `FinancingPanel`, `FinancingSummary`, `FinancingDetail`, `FinancingEventForm`, modais de edição.

## Casos de uso E2E

Ver `e2e/casos-de-uso/ui/ferramentas/financiamento-imovel/` (prefixo `UI-FERR-`).

## Referências

- [Objetivos financeiros](objetivos-financeiros.md) — padrão master-detail Resumo + detalhe.
- [Funcionalidades](../funcionalidades.md) — índice de módulos.
