# Controle de patrimônio

## Objetivo

Permitir **listar e somar todo o patrimônio** da carteira ativa em uma única tela em Ferramentas, combinando:

- **Patrimônio investido** — calculado automaticamente a partir das posições da carteira (cotações + câmbio).
- **Itens manuais** — reserva de emergência cadastrada pelo usuário (localização: banco, corretora ou dinheiro em espécie).

## Escopo v1

- Página **`/ferramentas/controle-patrimonio`** (menu Ferramentas → «Controle de patrimônio»).
- Dados **por carteira** (`portfolio_id`), com seletor de carteira no cabeçalho.
- Categorias manuais:
  - `emergency_reserve` — reserva de emergência; campo **Localização** obrigatório (`banco`, `dinheiro_especie`, `corretora`). Dinheiro em espécie é cadastrado nesta categoria escolhendo localização «Dinheiro em espécie».
- Cards de resumo: Investido (carteira líquida), Reserva de emergência, **Total geral**.
- **Total geral** = valor bruto das posições na carteira + reserva manual externa.
- **Investido (card)** = posições na carteira **menos** fatias vinculadas como reserva nos objetivos.
- **Reserva (card)** = itens manuais + fatias vinculadas (`investido líquido + reserva = total`).
- CRUD de itens manuais via API aninhada em `/portfolios/{id}/manual-patrimony-items`.
- **Reserva vinculada:** fatias de objetivos marcadas como reserva de emergência aparecem **na mesma tabela** de reserva (somente leitura: coluna Observação + link «Ver na carteira», sem editar/excluir).

## Distinções importantes

| Conceito | Onde | Escopo |
| -------- | ---- | ------ |
| Patrimônio investido (controle) | Controle de patrimônio | Todas as posições da carteira |
| Patrimônio de objetivos | `/ferramentas/objetivos` | Mesmo total investido; usado para alocação por finalidade |
| Patrimônio de rebalanceamento | `/rebalanceamento` | Classes de balanceamento **menos** fatias em objetivos «não investimento» |
| Objetivo «Reserva Emergência» | Objetivos financeiros | Partição de **posições investidas**; espelhada no controle de patrimônio quando `is_emergency_reserve` |
| Reserva manual (banco/espécie) | Controle de patrimônio | Itens manuais fora da carteira |

Caixa e reserva manual **não entram** no cálculo de rebalanceamento.

## Modelo de dados

| Entidade | Campos principais |
| -------- | ----------------- |
| `ManualPatrimonyItem` | `portfolio_id`, `category`, `name`, `amount_brl`, `location`, `notes` |

Regras:

- `UNIQUE(portfolio_id, name)` — nome único por carteira.
- `amount_brl > 0`.
- `location` obrigatório quando `category = emergency_reserve`; valores: `banco`, `dinheiro_especie`, `corretora`.

## API

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/portfolios/{id}/patrimony-control` | Snapshot com investido, itens manuais e totais |
| POST | `/portfolios/{id}/manual-patrimony-items` | Criar item manual |
| PATCH | `/portfolios/{id}/manual-patrimony-items/{item_id}` | Atualizar item |
| DELETE | `/portfolios/{id}/manual-patrimony-items/{item_id}` | Excluir item |

**`PatrimonyControlSnapshotRead`:**

- `invested_portfolio_brl` — valor bruto de todas as posições
- `invested_excluding_emergency_brl` — bruto menos fatias vinculadas como reserva
- `linked_emergency_reserve_brl`
- `manual_items[]`
- `linked_emergency_reserve_items[]` — reserva derivada de objetivos (`is_emergency_reserve`)
- `total_emergency_reserve_brl`, `total_manual_brl`
- `total_patrimony_brl` = `invested_portfolio_brl` + `total_manual_brl`

## Fora do escopo (v1)

- Evolução anual / gráficos (ver candidato Tier 3).
- Agregação multi-carteira.
- Categorias extras (imóvel, veículo, outro).
- Integração com rebalanceamento ou objetivos.

## Referências

- Cálculo de patrimônio investido: `portfolio_patrimony.compute_portfolio_patrimony_brl` (mesma regra de objetivos).
- Padrão CRUD + snapshot: financiamento imóvel.
