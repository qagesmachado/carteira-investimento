# Bitcoin e taxas de movimentação

## Objetivo

Controlar a posição em BTC e registrar **taxas de compra e transferência**, equivalente às abas `Bitcoin` e `Bitcoin taxas` da planilha `Investimento_controle.xlsx`.

## Escopo MVP

- Página **`/ferramentas/bitcoin`** (menu Ferramentas → «Taxas bitcoin»): cards de resumo da posição + formulário e tabela de taxas.
- API **`/crypto-fees`**: CRUD de lançamentos de taxa.
- API **`GET /portfolios/{id}/bitcoin-snapshot`**: resumo consolidado (posição, rebalanceamento crypto, totais de taxas, lucro após taxas).
- Persistência em `carteira.db` (tabela `cryptofee`).
- Menu **Alocação → Bitcoin**.

## Modelo de dados (`CryptoFee`)

| Campo | Descrição |
| ----- | --------- |
| `portfolio_id` | Carteira dona do lançamento |
| `asset_id` | Ativo cripto (ex.: `BTC-USD`) |
| `fee_type` | `purchase` (taxa de compra) ou `transfer` (taxa transferência para Ledger) |
| `fee_date` | Data da movimentação |
| `quantity_moved` | Quantidade movimentada em BTC |
| `fee_quantity_btc` | Quantidade retida como taxa em BTC |
| `quote_brl` | Cotação BTC em reais na data |
| `fx_rate` | Fator de conversão R$/US$ |
| `notes` | Observações opcionais |

Campos **calculados** na leitura (como na planilha):

- `final_quantity_after_fee` = movimentado − taxa
- `fee_value_brl` = taxa × cotação
- `fee_value_usd` = valor R$ ÷ fator
- `fee_percent` = taxa ÷ movimentado × 100

Na tabela **Histórico de taxas**, colunas adicionais:

- **Cotação (R$)** — valor informado no cadastro (`quote_brl`)
- **Cotação (US$)** — calculada: `quote_brl ÷ fx_rate`

## Snapshot Bitcoin

Agrega:

- Posição crypto da carteira (quantidade, preço médio, valor investido/atual, lucro)
- Meta e faltante da classe **Bitcoin** no rebalanceamento
- Soma de taxas em R$ e US$
- Lucro e valorização **descontando taxas**
- **Conferência Ledger:** `transfer_ledger_final_btc` (soma de `final_quantity_after_fee` apenas em `fee_type = transfer`) e `transfer_ledger_count` (quantidade de lançamentos)

Card **Conferência Ledger** na página `/ferramentas/bitcoin`: exibe a soma para conferência manual com a Ledger e base para preço médio automatizado futuro.

## Visão consolidada

Na página **`/portfolios/consolidada`**, ao expandir **Detalhes** de uma posição cripto (ex.: `BTC-USD`), o bloco **Totais da posição** inclui **Lucro − taxas** (mesmo cálculo do snapshot), à direita do lucro bruto, com equivalente em reais e referência às taxas pagas quando houver lançamentos.

## Fora de escopo

- Importação em lote de taxas da planilha
- Múltiplos criptoativos além do BTC (estrutura preparada via `asset_id`)

## Casos de uso E2E

- `UI-BTC-001` — registrar taxa e exibir total no resumo
- `UI-BTC-002` — card Conferência Ledger com soma Final (BTC) das transferências
