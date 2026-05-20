# Validação de campos obrigatórios na RF manual

## Metadados

- **ID:** `UI-AST-013`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** impedir salvar renda fixa manual incompleta
- **Depende de:** nenhum
- **Arquivo de teste:** `e2e/specs/assets/13-rf-validacao-campos-obrigatorios.spec.ts`

- **Referência:** formulário de nova renda fixa em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Não salvar RF com campos obrigatórios vazios

**Como** investidor  
**Quero** ser impedido de salvar RF incompleta  
**Para** não gravar dados inválidos na base de teste

### Passo a passo

1. Estou no formulário de nova renda fixa manual com campos obrigatórios vazios.
2. Tento salvar sem preencher campos obrigatórios.
3. O ativo não é criado.
4. Vejo indicação de validação (mensagem ou campos destacados).
5. A contagem de linhas na tabela não aumenta.

## Notas para automação (fase 2)

- Pode rodar antes de `UI-AST-003` na mesma run (não persiste RF).
