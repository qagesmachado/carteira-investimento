# Excluir carteira pelo hub

## Metadados

- **ID:** `UI-PRT-029`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** botão Excluir no card com confirmação
- **Depende de:** `UI-PRT-003`
- **Arquivo de teste:** `e2e/specs/portfolios/29-excluir-carteira-hub.spec.ts`

## Ambiente de teste

- **Base de carteiras:** principal + auxiliar para exclusão
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Excluir carteira auxiliar no hub

**Como** investidor  
**Quero** excluir uma carteira direto na listagem  
**Para** limpar carteiras sem abrir posições

### Passo a passo

1. Estou em `/portfolios` com carteira auxiliar `E2E Aux` visível no hub.
2. Clico **Excluir** no card dessa carteira.
3. Confirmo o diálogo «Excluir carteira … e todas as posições?».
4. O card some da listagem e permaneço no hub.
