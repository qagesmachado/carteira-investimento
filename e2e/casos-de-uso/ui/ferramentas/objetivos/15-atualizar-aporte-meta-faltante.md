# Atualizar aporte e ver meta/faltante

## Metadados

- **ID:** `UI-OBJ-015`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** atualizar total aportado e visualizar métricas previdenciárias
- **Depende de:** `UI-OBJ-014`
- **Arquivo de teste:** `e2e/specs/objetivos/15-atualizar-aporte-meta-faltante.spec.ts`
- **Referência:** [controle-aporte-previdencia.md](../../../../../docs/produto/desenvolvido/controle-aporte-previdencia.md)

## Cenário — atualizar aportes e métricas

**Como** investidor  
**Quero** informar quanto já aportei no ano  
**Para** saber quanto falta e qual o aporte mensal necessário

### Pré-condição

- Objetivo «Previdência IR» criado com renda R$ 120.000 (meta R$ 14.400).

### Passo a passo

1. Abro `/objetivos` e seleciono o objetivo «Previdência IR».
2. Vejo meta anual R$ 14.400, faltante R$ 14.400 e aporte mensal necessário calculado.
3. Informo total aportado no ano: R$ 6.000.
4. Salvo.
5. Vejo faltante R$ 8.400 e barra de progresso ~41,7%.

### Resultado esperado

- `contributed_ytd_brl = 6000`
- `remaining_brl = 8400`
- `progress_percent ≈ 41.67`
