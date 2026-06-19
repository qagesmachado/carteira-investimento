# Adicionar renda fixa pelo modal unificado da carteira

## Metadados

- **ID:** `UI-PRT-006`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** cadastro unificado de renda fixa (produto + posição numa ação)
- **Depende de:** `UI-PRT-002`
- **Arquivo de teste:** `e2e/specs/portfolios/06-adicionar-posicao-rf-manual.spec.ts`
- **Referência:** [Cadastro unificado de renda fixa e previdência na carteira](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md)

## Ambiente de teste

- **Base:** `backend/data/test/carteira-{N}.db`
- **Lookup:** yfinance (não usado neste fluxo — cadastro manual)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Cadastrar CDB direto na carteira

**Como** investidor
**Quero** cadastrar uma aplicação de renda fixa em um único passo
**Para** não precisar registrar o produto na base global antes

### Passo a passo

1. Carteira `E2E Principal` está ativa (`UI-PRT-002`).
2. Clico em **Adicionar ativo à carteira**; abre o modal.
3. Seleciono o tipo **Renda fixa**.
4. Preencho dados do produto (identificador, descrição, tipo de título, indexador, rentabilidade) e os valores **Valor aplicado** e **Valor atual**.
5. Salvo.
6. O sistema cria o produto e a posição numa única ação (`POST /portfolios/{id}/fixed-income-positions`).
7. A posição aparece na tabela com valores manuais (sem cotação de mercado) e persiste após recarregar.

## Notas para automação

- O ativo de renda fixa **não** deve aparecer em `/assets` (base local).
