# Trava de exclusão no hub

## Metadados

- **ID:** `UI-PRT-030`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** checkbox no modal Editar bloqueia botão Excluir do card
- **Depende de:** `UI-PRT-027`
- **Arquivo de teste:** `e2e/specs/portfolios/30-trava-exclusao-carteira-hub.spec.ts`

## Ambiente de teste

- **Base de carteiras:** auxiliar `E2E Aux`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Bloquear exclusão pelo modal Editar

**Como** investidor  
**Quero** impedir exclusão acidental de uma carteira  
**Para** proteger carteiras importantes

### Passo a passo

1. Estou em `/portfolios` com carteira `E2E Aux`.
2. Abro **Editar** e marco «Bloquear exclusão desta carteira».
3. Salvo e o modal fecha.
4. O botão **Excluir** do card fica desabilitado.
