# Carregamento de carteiras

## Metadados

- **ID:** `UI-PRT-001`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** carregar página sem carteiras na base de teste
- **Depende de:** suíte assets; `portfolios.db` vazia
- **Arquivo de teste:** `e2e/specs/portfolios/01-carregamento-carteiras.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (com ativos)
- **Base de carteiras:** `backend/data/test/portfolios.db` (vazia)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Página carrega sem carteiras

**Como** investidor  
**Quero** abrir carteiras pela primeira vez na base de teste  
**Para** ver que ainda não há carteira criada

### Passo a passo

1. `portfolios.db` de teste está vazia após `globalSetup`.
2. Existem ativos em `carteira.db` (suíte assets executada antes).
3. Navego para `http://127.0.0.1:5173/portfolios`.
4. Aguardo o carregamento.
5. Não há carteira ativa selecionada ou a lista de carteiras está vazia.
6. A seção de posições indica ausência de carteira ou estado equivalente.
7. Não há erro fatal na página.

## Notas para automação (fase 2)

- Validar que API de carteiras responde contra `data/test/portfolios.db`.
