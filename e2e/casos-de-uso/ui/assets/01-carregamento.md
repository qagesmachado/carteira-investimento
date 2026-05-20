# Carregamento inicial da página

## Metadados

- **ID:** `UI-AST-001`
- **Status:** implementado
- **Página:** `/assets`
- **Funcionalidade:** carregar lista de ativos com base de teste vazia
- **Depende de:** base de teste vazia após `globalSetup`
- **Arquivo de teste:** `e2e/specs/assets/01-carregamento.spec.ts`

- **Referência:** `frontend/src/routes/assets/+page.svelte`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (vazia)
- **Base de carteiras:** `backend/data/test/portfolios.db` (vazia; não usada neste caso)
- **Lookup:** não se aplica (listagem apenas)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001` (portas dedicadas ao E2E; ver `e2e/test-env.js`)

## Cenário — Página carrega com lista vazia

**Como** investidor  
**Quero** abrir a página de ativos  
**Para** ver que ainda não há cadastros na base de teste

### Passo a passo

1. A suíte E2E executou `globalSetup` e `carteira.db` de teste está vazia.
2. Backend e frontend de teste estão no ar.
3. Navego para `/assets` (frontend E2E em `http://127.0.0.1:5174`).
4. Aguardo o fim do carregamento da lista.
5. A tabela de ativos cadastrados não exibe linhas de dados (estado vazio ou mensagem equivalente).
6. O formulário de busca e a seção de cadastro em lote estão visíveis.
7. Não há alerta de erro persistente na tela.

## Notas para automação (fase 2)

- Primeiro spec da suíte `assets/`; validar GET `/assets` ou lista vazia via UI.
