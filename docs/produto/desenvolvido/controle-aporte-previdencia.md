# Controle de aporte previdenciário

## Objetivo

Permitir acompanhar **aportes anuais em previdência privada (PGBL)** dentro da tela `/ferramentas/objetivos`, comparando o total aportado em cada ano-calendário com a meta de dedução fiscal (12% da renda bruta anual).

Origem na planilha: aba `Previdência`.

## Escopo MVP

- Nova modalidade de objetivo: **`pension_contribution`** (Controle de aporte da previdência).
- **Um objetivo previdência por carteira**, com **sub-registros anuais** (`PensionContributionYear`):
  - `plan_year` — ano-calendário do controle.
  - `annual_gross_income_brl` — renda bruta anual informada pelo usuário.
  - `contributed_ytd_brl` — total aportado no ano (atualização manual).
- Métricas calculadas por ano no snapshot:
  - Meta anual (12% da renda).
  - Valor faltante para atingir a meta.
  - Meses restantes no ano.
  - Aporte mensal necessário.
  - Percentual de progresso.
- **Consolidado:** soma de `contributed_ytd_brl` de todos os anos + tabela por ano.
- Objetivos previdência **não** aceitam alocações de ativos (`PUT allocations` retorna 422).
- Migração automática: objetivos previdência legados (campos no `Objective`) viram anos; duplicatas por ano são fundidas em um único objetivo.

## Regras de negócio

### Meta anual (PGBL)

```
target_annual_brl = annual_gross_income_brl × 0.12
```

O teto legal de dedução para PGBL é 12% da renda bruta tributável anual. O usuário informa a renda; a aplicação calcula a meta.

### Valor faltante

```
remaining_brl = max(0, target_annual_brl − contributed_ytd_brl)
```

Se o aportado ultrapassar a meta, `remaining_brl = 0` (meta atingida).

### Meses restantes

| Situação | Cálculo |
| -------- | ------- |
| `plan_year` = ano corrente | meses do mês atual até dezembro (inclusive) |
| `plan_year` > ano corrente | 12 |
| `plan_year` < ano corrente | 0 |

### Aporte mensal necessário

```
monthly_needed_brl = remaining_brl / months_remaining   (se months_remaining > 0)
monthly_needed_brl = null                               (se months_remaining = 0)
```

Exemplo: renda R$ 120.000 → meta R$ 14.400; aportado R$ 6.000 em maio → faltam R$ 8.400 em 8 meses (mai–dez) → R$ 1.050/mês.

Exemplo (jul/2026): renda R$ 216.000 → meta R$ 25.920; aportado R$ 12.800 → faltam R$ 13.120 em 6 meses (jul–dez) → R$ 2.186,67/mês. Aportes maiores no início reduzem o faltante e, portanto, o valor mensal necessário.

### Progresso

```
progress_percent = min(100, contributed_ytd_brl / target_annual_brl × 100)
```

Se `target_annual_brl = 0`, progresso = 0.

### Unicidade

- Máximo **1 objetivo** `pension_contribution` por carteira.
- Máximo **1 registro por `plan_year`** dentro do objetivo.

## UI

### Criação (`ObjectiveEditModal`)

Terceira opção de modalidade:

> **Controle de aporte da previdência** — meta anual para dedução no IR (PGBL)

Campos na criação: nome (sugestão «Previdência»), ano inicial (default corrente), renda bruta anual.

### Detalhe (`PensionContributionDetail`)

Substitui a tabela de alocações quando `mode = pension_contribution`.

1. **Consolidado por ano** — tabela com aportado, meta e progresso de cada ano.
2. **Total aportado (todos os anos)** — soma consolidada no cabeçalho.
3. **Abas por ano** + botão **+ Ano** para adicionar sub-objetivo anual.
4. **Detalhe do ano selecionado** — renda e aporte somente leitura; **Editar** abre modal para alterar renda e aporte; **Excluir ano** remove o sub-registro (desde que reste pelo menos um ano).

| Campo | Editável |
| ----- | -------- |
| Renda bruta anual (ano selecionado) | sim (modal Editar) |
| Total aportado no ano | sim (modal Editar) |
| Meta anual (12%) | não |
| Faltante | não |
| Aporte mensal necessário | não |
| Barra de progresso | não |

### Painel de abas

Badge **Previdência** no card do objetivo; valor exibido = soma de todos os anos (`consolidated_total_brl`).

## API

Base: `/portfolios/{id}/objectives`

| Método | Rota | Uso |
| ------ | ---- | --- |
| `POST` | `/objectives` | Criar com `mode: "pension_contribution"` + primeiro ano (`plan_year`, `annual_gross_income_brl`) |
| `PATCH` | `/objectives/{id}` | Renomear / descrição (sem campos previdenciários) |
| `GET` | `/objectives` | Snapshot com `pension_contribution.years[]` e `consolidated_total_brl` |
| `POST` | `/objectives/{id}/pension-years` | Adicionar ano |
| `PUT` | `/objectives/{id}/pension-years/{plan_year}` | Atualizar renda e/ou aportado do ano |
| `DELETE` | `/objectives/{id}/pension-years/{plan_year}` | Excluir ano (mínimo 1 ano por objetivo) |

## Fora de escopo

- Tipo de plano PGBL vs VGBL.
- Lista de lançamentos individuais (data + valor).
- Vínculo automático com posição de previdência na carteira.
- Múltiplos planos no mesmo ano.
- Simulação de longo prazo.

## Integração com outros módulos

| Módulo | Relação |
| ------ | ------- |
| Objetivos | Nova modalidade; sem alocações de ativos |
| Rebalanceamento | Ignora objetivos previdência |
| Cadastro previdência | Posição manual continua independente |
