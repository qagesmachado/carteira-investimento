# Cadastro unificado de renda fixa e previdência na carteira

## Objetivo

Permitir cadastrar renda fixa tradicional (CDB, LCI, LCA, Tesouro Selic, etc.) e
previdência privada **em um único passo**, diretamente na carteira (`/portfolios`),
sem precisar primeiro cadastrar o produto na base global (`/assets`) e depois
adicionar a posição.

Antes desta mudança havia dois cadastros separados para esses produtos:

1. Cadastro do produto na base local (`/assets`).
2. Cadastro da posição na carteira (`/portfolios`).

Como esses produtos são específicos de cada aplicação do usuário (contrato,
emissor, vencimento, valor aplicado), não há ganho em mantê-los na base global
como catálogo reutilizável. O cadastro passa a ser único e acontece na carteira.

## O que NÃO muda

- Ativos de **bolsa** (ação, ETF, FII, cripto e outros negociados por cotação)
  continuam sendo cadastrados na base global via `/assets` (lookup yfinance) e
  adicionados à carteira selecionando o ativo existente + quantidade e preço médio.
- **ETF nacional de renda fixa** (ex.: `AUPO11`, `AREA11`) continua sendo um ativo
  de mercado (`asset_type = etf`, `etf_subtype = fixed_income`): é cadastrado em
  `/assets` por lookup e usa cotação automática. **Não** é afetado por esta mudança,
  que vale apenas para renda fixa tradicional (`asset_type = fixed_income`) e
  previdência (`asset_type = pension`).
- O modelo de dados continua com duas entidades: `Asset` (produto) e `Position`
  (posição na carteira). A diferença é que, para renda fixa/previdência, os dois
  registros são criados/atualizados numa única ação atômica.

## Fluxo na interface (`/portfolios`)

1. Na carteira ativa, clicar em **Adicionar ativo à carteira**. Abre um modal.
2. Escolher o tipo: **Bolsa**, **Renda fixa** ou **Previdência**.
   - **Bolsa** = qualquer ativo que não seja renda fixa tradicional nem previdência.
3. **Bolsa:** selecionar o ativo já cadastrado na base + informar quantidade e preço
   médio (fluxo inalterado).
4. **Renda fixa / Previdência:** preencher os dados do produto (identificador,
   descrição, tipo de título, indexador, rentabilidade, datas, emissor/fonte pagadora,
   observações) **e** os valores da posição (Valor aplicado e Valor atual) na mesma tela.
   Ao salvar, o sistema cria o produto e a posição de uma só vez.
5. **Editar** uma posição de renda fixa/previdência reabre esse mesmo formulário,
   permitindo alterar tanto os dados do produto quanto os valores da posição.
   O identificador (symbol) é somente leitura na edição.

## Regras de negócio

- O cadastro unificado só aceita `asset_type` igual a `fixed_income` ou `pension`.
  Outros tipos retornam erro de validação (a bolsa usa o fluxo de posição comum).
- O identificador (symbol) deve ser único na base. Conflito retorna erro de
  ativo duplicado (mantém o comportamento atual de `409`).
- A **Rentabilidade** é um campo único: é gravada no produto
  (`fixed_income_yield_description`) e reaproveitada como rendimento contratado da
  posição (`contracted_yield`). Previdência não possui campo de rentabilidade próprio.
- Valor aplicado e valor atual são informados na posição (`invested_amount`,
  `current_value`). O rendimento da posição é derivado (`valor atual − valor aplicado`),
  nunca persistido como campo próprio.
- Renda fixa e previdência continuam **ignoradas** na atualização de cotações
  (`POST /portfolios/{id}/quotes/refresh`).

## API HTTP

| Método | Caminho | Uso |
|--------|---------|-----|
| `POST` | `/portfolios/{id}/fixed-income-positions` | Cria produto + posição de renda fixa/previdência numa transação única. |
| `PATCH` | `/portfolios/{id}/positions/{position_id}/fixed-income` | Atualiza produto + posição de renda fixa/previdência numa transação única (sem trocar o symbol). |

Corpo do `POST`:

```json
{
  "asset": { "symbol": "...", "name": "...", "asset_type": "fixed_income", ... },
  "invested_amount": 10000,
  "current_value": 10500,
  "entry_date": null
}
```

A base global (`/assets`) deixa de exibir e cadastrar renda fixa tradicional e
previdência. Esses registros continuam no banco, geridos pela carteira.

## Critérios de aceite

- O usuário cadastra um CDB informando dados do produto e valores em uma única tela.
- O usuário cadastra um plano de previdência da mesma forma.
- O usuário edita um produto de renda fixa já na carteira (produto + valores) numa só ação.
- A tela `/assets` não exibe mais renda fixa tradicional nem previdência na base local
  nem oferece botões para cadastrá-los.
- ETFs de renda fixa (ex.: `AUPO11`) continuam funcionando em `/assets` e na carteira.
