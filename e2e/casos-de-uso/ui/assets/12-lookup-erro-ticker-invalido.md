# Erro de lookup para ticker inválido

## Metadados

- **ID:** `UI-AST-012`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** mensagem de erro quando lookup não encontra ticker
- **Depende de:** base sem o ticker `INVALIDO_XYZ`
- **Arquivo de teste:** `e2e/specs/assets/12-lookup-erro-ticker-invalido.spec.ts`

- **Referência:** formulário de busca em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake` (fake) · `yfinance` (complete)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Lookup falha para ticker inválido

**Como** investidor  
**Quero** saber quando a busca falha  
**Para** corrigir o ticker digitado

### Passo a passo

1. Estou em `/assets` com base de teste vazia ou sem o ticker em questão.
2. Digito `INVALIDO_XYZ` no campo de busca.
3. Clico em «Buscar ativo».
4. Aguardo a resposta do lookup.
5. Vejo mensagem de erro de lookup (formulário de revisão não fica pronto para salvar).
6. Nenhuma nova linha aparece na tabela de cadastrados.

## Notas para automação (fase 2)

- **Fake:** o provider rejeita `INVALIDO_XYZ` com `ValueError` → API 404.
- **Complete:** o yfinance devolve payload vazio para símbolos inexistentes; o provider também rejeita (sem dados de cotação/nome/tipo) → API 404 e mesma mensagem na UI.
