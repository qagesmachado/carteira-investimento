# Objetivo de um ativo com visão de partição

## Metadados

- **ID:** `UI-OBJ-011`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** modalidade single_asset e partição unificada no Resumo
- **Depende de:** `seedObjetivosWithStock`
- **Arquivo de teste:** `e2e/specs/objetivos/11-objetivo-single-asset-particao.spec.ts`

## Cenário

**Como** investidor  
**Quero** criar objetivos que particionam o mesmo ativo  
**Para** ver no Resumo como as fatias se distribuem

### Passo a passo

1. Seed PETR4 100 cotas.
2. Crio objetivo «Viagem» modo um ativo (PETR4) com 30 cotas.
3. Crio objetivo «Reserva» modo um ativo (PETR4) com 40 cotas.
4. No Resumo, card de partição PETR4 mostra Viagem, Reserva e Livre (30 restantes).
