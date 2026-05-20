# Criar carteira sem nome

## Metadados

- **ID:** `UI-PRT-013`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** validação de nome obrigatório
- **Depende de:** nenhum
- **Arquivo de teste:** `e2e/specs/portfolios/13-criar-carteira-nome-obrigatorio.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Impedir criação sem nome

**Como** investidor  
**Quero** ser impedido de criar sem nome  
**Para** não gravar carteira inválida

### Passo a passo

1. Estou no formulário de nova carteira com nome vazio.
2. Tento criar a carteira.
3. Nenhuma nova carteira é criada em `portfolios.db`.
4. Vejo validação de campo obrigatório.

## Notas para automação (fase 2)

- Pode rodar antes de `UI-PRT-002` se não houver carteira criada.
