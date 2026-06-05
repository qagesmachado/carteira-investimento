# Soma Livre sempre 100%

## Metadados

- **ID:** `UI-OBJ-008`
- **Status:** aprovado
- **Página:** `/ferramentas/objetivos`
- **Funcionalidade:** invariante alocado + Livre = total
- **Depende de:** `UI-OBJ-003`
- **Arquivo de teste:** `e2e/specs/ferramentas/objetivos/08-soma-livre-100.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — soma 100%

**Como** investidor  
**Quero** que alocações explícitas + Livre sempre somem 100%  
**Para** ter visão completa da posição

### Passo a passo

1. Carteira com PETR4 100 cotas.
2. Aloco 60 em «Reserva».
3. Livre exibe 40 cotas (40%).
4. Reserva exibe 60 cotas (60%).
5. Soma = 100 cotas = posição total.
