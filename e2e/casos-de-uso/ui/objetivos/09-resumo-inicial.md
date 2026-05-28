# Resumo inicial dos objetivos

## Metadados

- **ID:** `UI-OBJ-009`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** aba Resumo como visão inicial
- **Depende de:** seed API (`seedObjetivosWithStock`)
- **Arquivo de teste:** `e2e/specs/objetivos/09-resumo-inicial.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — dashboard resumo

**Como** investidor  
**Quero** abrir objetivos e ver um resumo agregado  
**Para** entender a divisão do patrimônio antes de entrar em cada objetivo

### Passo a passo

1. Carteira com posição e objetivo Livre (seed).
2. Abro `/objetivos`.
3. A aba «Resumo» está ativa e exibe patrimônio e tabela por objetivo.
4. Crio um objetivo custom e abro o detalhe dele (sem «Livre» na UI).
