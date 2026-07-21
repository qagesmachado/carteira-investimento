# Relatório detalhado filtra por ano

## Metadados

- **ID:** `UI-IR-001`
- **Status:** aprovado
- **Página:** `/conferencia-ir`
- **Funcionalidade:** aba Detalhado exibe apenas proventos do ano selecionado
- **Depende de:** base de teste com proventos em anos distintos
- **Arquivo de teste:** `e2e/specs/conferencia-ir/01-relatorio-detalhado-filtra-ano.spec.ts`
- **Referência:** [conferencia-ir-anual.md](../../../../../docs/produto/desenvolvido/conferencia-ir-anual.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira-{N}.db`
- **Lookup:** não se aplica
- **URLs:** frontend worker · API worker (ver `e2e/worker-env.js`)

## Cenário — filtro anual na aba Detalhado

**Como** investidor  
**Quero** ver proventos discriminados apenas do ano escolhido  
**Para** conferir rendimentos do IR sem misturar outros anos

### Passo a passo

1. Semear carteira com proventos em 2023 e 2024.
2. Abrir `/conferencia-ir`.
3. Selecionar ano 2024.
4. Na aba Detalhado, verificar que aparecem só lançamentos de 2024.

## Notas para automação

- Usar `data-testid` da tabela detalhada e seletor de ano.
