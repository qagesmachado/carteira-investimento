# Excluir ano previdenciário

## Metadados

- **ID:** `UI-OBJ-017`
- **Status:** aprovado
- **Página:** `/ferramentas/objetivos`
- **Funcionalidade:** remover sub-objetivo anual de previdência
- **Depende de:** `UI-OBJ-016`
- **Arquivo de teste:** `e2e/specs/ferramentas/objetivos/17-excluir-ano-previdencia.spec.ts`
- **Referência:** [controle-aporte-previdencia.md](../../../../../docs/produto/desenvolvido/controle-aporte-previdencia.md)

## Cenário — excluir um ano

**Como** investidor  
**Quero** excluir um ano específico do objetivo previdência  
**Para** remover registros incorretos sem apagar o objetivo inteiro

### Passo a passo

1. Abro objetivo previdência com dois anos cadastrados.
2. Seleciono o ano que quero remover.
3. Clico em «Excluir ano» e confirmo.
4. O ano some da tabela consolidada e das abas; permanece pelo menos um ano.

### Resultado esperado

- Ano removido do snapshot.
- Objetivo previdência continua existindo.
- Não é possível excluir o último ano restante.
