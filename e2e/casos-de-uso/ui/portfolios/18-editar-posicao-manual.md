# Editar posição manual

## Metadados

- **ID:** `UI-PRT-018`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** editar renda fixa na carteira (produto + valores numa ação)
- **Depende de:** `UI-PRT-006`
- **Arquivo de teste:** `e2e/specs/portfolios/18-editar-posicao-manual.spec.ts`
- **Referência:** [Cadastro unificado de renda fixa e previdência na carteira](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md)

## Ambiente de teste

- **Base:** `backend/data/test/carteira-{N}.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Atualizar uma renda fixa na carteira

**Como** investidor
**Quero** atualizar dados do produto e o valor atual da RF
**Para** refletir o saldo e os dados do contrato

### Passo a passo

1. Existe posição de RF na carteira ativa (`UI-PRT-006`).
2. Abro **Editar**; o formulário completo (produto + valores) reabre.
3. Altero valor atual (e, se quiser, dados do produto). O identificador é somente leitura.
4. Salvo (`PATCH /portfolios/{id}/positions/{position_id}/fixed-income`).
5. A linha exibe os novos valores.
6. Campos específicos de manual permanecem (sem preço de mercado).

## Notas para automação

- Diferenciar o modal de mercado (`UI-PRT-007`) do formulário unificado de RF.
