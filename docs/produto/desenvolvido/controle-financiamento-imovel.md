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
- API: `/portfolios/{portfolio_id}/property-financings`.

## Fora do escopo

- Login/perfil de usuário.
- Vínculo com ativo imobiliário cadastrado na carteira.
- Importação automática de aluguel a partir de proventos.
- Consolidado cross-carteira entre titulares.

## Modelo de dados

| Entidade | Campos principais |
| -------- | ----------------- |
| `PropertyFinancing` | `portfolio_id`, `name`, `property_type`, `description` |
| `PropertyFinancingEntry` | `financing_id`, `event_date`, `entry_type` (`income` \| `expense`), `event_category`, `description`, `amount_brl` |

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
