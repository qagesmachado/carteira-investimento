# Validação de campos no modal unificado de renda fixa

## Metadados

- **ID:** `UI-PRT-024`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** impedir cadastro de renda fixa incompleto no modal
- **Depende de:** `UI-PRT-002`
- **Arquivo de teste:** `e2e/specs/portfolios/24-validacao-rf-modal-unificado.spec.ts`
- **Referência:** [Cadastro unificado de renda fixa e previdência na carteira](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md)

## Ambiente de teste

- **Base:** `backend/data/test/carteira-{N}.db`
- **Lookup:** yfinance (não usado neste fluxo)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Não cadastrar renda fixa com campos obrigatórios vazios

**Como** investidor
**Quero** ser impedido de salvar uma renda fixa incompleta
**Para** não gravar dados inválidos na carteira

### Passo a passo

1. Carteira `E2E Principal` está ativa.
2. Abro **Adicionar ativo à carteira** e seleciono **Renda fixa**.
3. Tento salvar sem identificador/descrição ou sem valor aplicado.
4. A posição não é criada (validação no formulário).
5. A contagem de posições na tabela não aumenta.
