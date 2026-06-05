# Objetivos financeiros

## Objetivo

Permitir dividir **partes de uma mesma posição** entre objetivos distintos dentro da carteira ativa — por exemplo, R$ 100k em um CDB com R$ 50k para reserva de emergência e R$ 50k para viagem, ou 100 cotas de PETR4 com 60 para objetivo A e 40 livres.

Origem na planilha: aba `AUPO11AREA11` (ETFs de renda fixa por caixinha). Na aplicação, o conceito generaliza para **qualquer ativo** da carteira.

## Escopo MVP

- Página **`/ferramentas/objetivos`** (menu Ferramentas → «Gerenciamento de objetivos»): visualização e gestão de alocações parciais por objetivo (sem venda/remoção de posição).
- **Aba Resumo** (inicial): dashboard com patrimônio, tabela só de **objetivos custom** e **partição unificada por ativo**.
- Objetivo **«Livre»** continua na API (resto não alocado), mas **não aparece** nas abas, no resumo nem nas tabelas de partição.
- Objetivos **por carteira** (`Objective.portfolio_id`).
- Objetivo automático **«Livre»** (`is_default=true`) recebe o restante não alocado explicitamente.
- **Modalidades de objetivo:**
  - `multi_asset` — vários ativos no mesmo objetivo (padrão).
  - `single_asset` — vinculado a um `partition_asset_id`; só aloca fatias desse ativo (partição entre objetivos).
  - `pension_contribution` — controle de aporte previdenciário anual (meta 12% PGBL); sem alocações de ativos. Ver [controle-aporte-previdencia.md](controle-aporte-previdencia.md).
- **Métricas por alocação** no snapshot: `invested_value_brl`, `profit_brl`, `profit_percent` (proporcionais à fatia).
- **Split por tipo de ativo** (`asset_type`):
  - `fixed_income` e `pension` → divisão por **valor (R$)**.
  - Demais (`stock`, `etf`, `fii`, `crypto`, `other`) → divisão por **cotas**.
- **Divergência**: se a posição mudar em outra tela (venda/aporte) e a soma das alocações explícitas ultrapassar o total atual, exibir flag com `delta` e **bloquear edições** desse ativo até regularizar.
- API **`/portfolios/{id}/objectives`**: CRUD de objetivos + `PUT /{id}/allocations`.

## Fora do escopo

- Meta de valor alvo por objetivo (barra de progresso).
- Objetivos globais cross-carteira.
- Objetivos no cálculo de rebalanceamento (continua agregando por `display_class`).
- Patrimônio por objetivo no dashboard.
- Auto-ajuste proporcional após venda externa.
- Migração de `Position.linked_objective` (string legada) para alocações.

## Modelo de dados

| Entidade | Campos principais |
| -------- | ----------------- |
| `Objective` | `portfolio_id`, `name`, `description`, `is_default`, `mode`, `partition_asset_id`, `plan_year`, `annual_gross_income_brl`, `contributed_ytd_brl`, `status` |
| `ObjectiveAllocation` | `objective_id`, `asset_id`, `slice_name`, `quantity` **ou** `amount` |

Regras:

- Um objetivo «Livre» por carteira (criado automaticamente).
- Alocações explícitas só em objetivos **não-default**; «Livre» é calculado como resto.
- `UNIQUE(objective_id, slice_name)` — várias fatias do mesmo ativo no objetivo, com nomes internos distintos (ex.: Viagem, Reserva).
- Soma das alocações explícitas por ativo ≤ total da posição (cotas ou valor).

## Critério de split

Usa `uses_manual_position_values` (`fixed_income`, `pension`):

| Modo | Tipos | Total da posição | Input na UI |
| ---- | ----- | ---------------- | ----------- |
| `amount` | RF, Previdência | `position.current_value` | R$ |
| `shares` | Ações, ETF, FII, Crypto, Outros | `position.quantity` | Cotas |

## Detecção de divergência

Para cada ativo com alocações explícitas:

```
total = quantidade ou valor atual da posição
alocado_explicito = soma(alocações em objetivos não-Livre)
livre = total - alocado_explicito
```

| Condição | Status | Comportamento |
| -------- | ------ | ------------- |
| `alocado_explicito <= total` | `ok` | Livre = resto; edição permitida |
| `alocado_explicito > total` | `over_total` | Banner com delta; bloqueio de edição do ativo |

Exemplo: 100 cotas alocadas (60+40), vendeu 50 → total=50, alocado=100, delta=-50.

## Integração com outros módulos

| Módulo | Relação |
| ------ | ------- |
| Carteiras (`/portfolios`) | Posição é a verdade do total; objetivos só subdividem |
| Rebalanceamento | Ignora objetivos; agrega por `display_class` |
| Dashboard | Ignora objetivos no MVP |
| `Position.linked_objective` | Deprecado; manter só retrocompat |

## API

| Método | Rota | Uso |
| ------ | ---- | --- |
| `GET` | `/portfolios/{id}/objectives` | Snapshot com objetivos, alocações, divergências e `asset_partitions` |
| `POST` | `/portfolios/{id}/objectives` | Criar objetivo |
| `PATCH` | `/portfolios/{id}/objectives/{oid}` | Renomear/descrever (não default) |
| `DELETE` | `/portfolios/{id}/objectives/{oid}` | Excluir objetivo (alocações voltam ao Livre) |
| `PUT` | `/portfolios/{id}/objectives/{oid}/allocations` | Substituir alocações do objetivo |

## Referências

- [Arquitetura funcional — Objetivos financeiros](../../arquitetura/arquitetura-funcional.md)
- [Planilha — AUPO11AREA11](../../planilha/abas.md)
- [Rebalanceamento](rebalanceamento.md)
- [Controle de aporte previdenciário](controle-aporte-previdencia.md)
- [Casos E2E — objetivos](../../../e2e/casos-de-uso/ui/ferramentas/objetivos/README.md)
