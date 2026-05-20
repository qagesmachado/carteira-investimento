# Busca e cadastro via lookup individual

## Metadados

- **ID:** `UI-AST-002`
- **Status:** implementado
- **Nível:** `fake`
- **Página:** `/assets`
- **Funcionalidade:** buscar ticker no lookup (fake) e salvar ativo
- **Depende de:** base de teste vazia (`UI-AST-001` opcional)
- **Arquivo de teste:** `e2e/specs/assets/02-busca-lookup-individual.spec.ts`

- **Referência:** formulário de busca e revisão em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (vazia no início do cenário)
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001` (portas dedicadas ao E2E; ver `e2e/test-env.js`)

## Cenário — Cadastrar ativo via busca

**Como** investidor  
**Quero** buscar um ticker e salvá-lo  
**Para** ter o ativo no catálogo local de teste

### Passo a passo

1. `carteira.db` de teste não contém o ticker `BBSE3`.
2. Estou em `/assets` e a tabela de cadastrados está vazia.
3. Digito `BBSE3` no campo de busca de ticker.
4. Clico em «Buscar ativo» (ou equivalente).
5. Aguardo o formulário de revisão preenchido: ticker `BBSE3`, nome `BB Seguridade Participações S.A.`, tipo Ação, mercado Nacional, país Brasil (BR), moeda Real (BRL), setor `Serviços financeiros` (fake provider).
6. Clico em «Salvar ativo».
7. Vejo mensagem de sucesso indicando que o ativo foi salvo na base local.
8. A tabela lista uma linha com colunas Ticker, Nome, Tipo, Classe e Moeda coerentes com o lookup (`BBSE3`, nome completo, Ação, Ações e ETFs (Brasil), Real (BRL)).
9. Recarrego a página (F5).
10. O ativo `BBSE3` continua na tabela (persistido em `data/test/carteira.db`).

## Notas para automação (fase 2)

- Rodar com `npm run test:ui`.
- Usar ticker suportado pelo fake provider (`BBSE3`); asserts exatos nos campos do formulário e na tabela.
- Aguardar estado de loading do botão de busca antes de assertar formulário.
