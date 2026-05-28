# Alocar ativo por cotas

## Metadados

- **ID:** `UI-OBJ-003`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** divisão por cotas (ações)
- **Depende de:** `UI-OBJ-002`
- **Arquivo de teste:** `e2e/specs/objetivos/03-alocar-ativo-cotas.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — alocar PETR4 por cotas

**Como** investidor  
**Quero** alocar 60 cotas de PETR4 para «Reserva Emergência»  
**Para** que 40 cotas permaneçam no objetivo Livre

### Passo a passo

1. Carteira com 100 cotas PETR4 e objetivo «Reserva Emergência».
2. Abro `/objetivos`, seleciono «Reserva Emergência».
3. Clico «Adicionar ativo», escolho PETR4.
4. Informo 60 cotas e salvo.
5. Reserva mostra 60 cotas; Livre mostra 40 cotas de PETR4.
