# Importacao em lote com seletor de carteira

## Metadados

- **ID:** `UI-PRV-017`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** importacao em lote (CSV) aplica a carteira selecionada a todas as linhas
- **Depende de:** ao menos duas carteiras criadas
- **Arquivo de teste:** `e2e/specs/proventos/17-import-lote-seletor-carteira.spec.ts`
- **Referencia:** [cadastro-proventos.md](../../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (carteiras `Carteira A` e `Carteira B`)
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Importacao em lote aplica a carteira escolhida

**Como** investidor importando varios proventos por arquivo  
**Quero** escolher uma carteira de destino para todo o lote  
**Para** nao ter que repetir essa informacao em cada linha do arquivo

### Passo a passo

1. Existe ativo `BBSE3` na base.
2. Em `/proventos`, abro a area de importacao em lote.
3. Seleciono `Carteira B` no seletor de carteira do lote.
4. Colo um CSV com duas linhas validas para BBSE3 (R$ 10,00 em datas diferentes) e clico em "Pre-visualizar".
5. Confirmo a importacao das duas linhas selecionadas.
6. Mudo a carteira ativa para `Carteira A`.
7. **Verifico** em `/consolidada` que o resumo de BBSE3 da carteira A nao traz os dois proventos importados (continua igual ao anterior).
8. Mudo a carteira ativa para `Carteira B`.
9. **Verifico** em `/consolidada` que o resumo de BBSE3 da carteira B passou a contar 2 lancamentos novos somando R$ 20,00.

## Notas para automacao

- Seed via API: criar carteiras + ativo + posicao em `Carteira B`.
- Page object futuro: `e2e/specs/helpers/proventosPage.ts` com helpers de "selecionar carteira no lote" e "submeter CSV".
