# Rejeitar ticker duplicado

## Metadados

- **ID:** `UI-AST-014`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** erro ao salvar ticker já existente na base de teste
- **Depende de:** `UI-AST-002` (`BBSE3` cadastrado)
- **Arquivo de teste:** `e2e/specs/assets/14-ticker-duplicado.spec.ts`

- **Referência:** validação em `asset_service`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (contém `BBSE3`)
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Impedir cadastro duplicado de BBSE3

**Como** investidor  
**Quero** ser avisado ao cadastrar ticker já existente  
**Para** não duplicar o catálogo

### Passo a passo

1. O caso `UI-AST-002` já deixou `BBSE3` cadastrado em `data/test/carteira.db`.
2. Estou em `/assets`.
3. Busco novamente `BBSE3` (ou variante normalizada se o lookup retornar equivalente).
4. Tento salvar o ativo.
5. Vejo mensagem de erro indicando ticker duplicado (texto amigável da API).
6. Não há segunda linha com o mesmo ticker na tabela.
7. A contagem de ativos permanece a mesma.

## Notas para automação (fase 2)

- Rodar após `02-busca-lookup` na mesma suíte.
