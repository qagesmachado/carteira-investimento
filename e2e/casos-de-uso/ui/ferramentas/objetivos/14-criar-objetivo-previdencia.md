# Criar objetivo previdência

## Metadados

- **ID:** `UI-OBJ-014`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** criar objetivo com modalidade controle de aporte previdenciário
- **Depende de:** `UI-OBJ-001`
- **Arquivo de teste:** `e2e/specs/objetivos/14-criar-objetivo-previdencia.spec.ts`
- **Referência:** [controle-aporte-previdencia.md](../../../../../docs/produto/desenvolvido/controle-aporte-previdencia.md)

## Cenário — criar objetivo previdência

**Como** investidor  
**Quero** criar um objetivo de controle de aporte previdenciário  
**Para** acompanhar minha meta anual de dedução no IR (PGBL)

### Passo a passo

1. Abro `/objetivos` com carteira seed.
2. Clico em «Novo objetivo».
3. Seleciono modalidade «Controle de aporte da previdência».
4. Informo nome «Previdência IR», ano corrente e renda bruta anual R$ 120.000.
5. Salvo.
6. Vejo o card do objetivo com badge «Previdência» e valor R$ 0,00 (nada aportado ainda).

### Resultado esperado

- Objetivo criado com `mode = pension_contribution`.
- Meta anual calculada: R$ 14.400 (12% de R$ 120.000).
