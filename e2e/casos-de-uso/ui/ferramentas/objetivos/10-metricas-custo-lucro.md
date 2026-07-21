# Métricas de custo e lucro por alocação

## Metadados

- **ID:** `UI-OBJ-010`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** colunas custo, valor atual e lucro na tabela do objetivo
- **Depende de:** `seedObjetivosWithStock` + alocação via API
- **Arquivo de teste:** `e2e/specs/objetivos/10-metricas-custo-lucro.spec.ts`

## Cenário

**Como** investidor  
**Quero** ver custo e lucro da fatia alocada  
**Para** avaliar o desempenho daquela parte do ativo no objetivo

### Passo a passo

1. Seed com PETR4 (100 cotas, preço médio 8, cotação 10).
2. Objetivo «Reserva» com 50 cotas alocadas.
3. Abro detalhe de Reserva.
4. Vejo colunas Custo, Valor atual e Lucro preenchidas.
