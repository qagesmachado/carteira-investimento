# Adicionar posição manual de previdência

## Metadados

- **ID:** `UI-PRT-017`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** cadastro unificado de previdência (produto + posição numa ação)
- **Depende de:** `UI-PRT-002`
- **Arquivo de teste:** `e2e/specs/portfolios/17-adicionar-posicao-previdencia.spec.ts`
- **Referência:** [Cadastro unificado de renda fixa e previdência na carteira](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md)

## Ambiente de teste

- **Base:** `backend/data/test/carteira-{N}.db`
- **Lookup:** yfinance (não usado neste fluxo — cadastro manual)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Lançar saldo de previdência direto na carteira

**Como** investidor
**Quero** registrar um plano de previdência em um único passo
**Para** consolidar na visão da carteira sem cadastrar na base global

### Passo a passo

1. Carteira `E2E Principal` está ativa (`UI-PRT-002`).
2. Clico em **Adicionar ativo à carteira** e seleciono o tipo **Previdência**.
3. Preencho dados do plano (identificador, descrição) e os valores aplicado/atual.
4. Salvo (`POST /portfolios/{id}/fixed-income-positions`).
5. Linha de previdência visível na tabela de posições.
6. Tipo aparece no resumo «Por tipo» (`UI-PRT-012`).

## Notas para automação

- O plano de previdência **não** deve aparecer em `/assets` (base local).
