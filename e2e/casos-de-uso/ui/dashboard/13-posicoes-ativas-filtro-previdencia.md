# Posições ativas respeitam filtros de patrimônio

## Metadados

- **ID:** `UI-DASH-013`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** KPI «Posições ativas» sincronizado com filtros Previdência / não-investimento
- **Depende de:** seed consolidada com previdência
- **Arquivo de teste:** `e2e/specs/dashboard/13-posicoes-ativas-filtro-previdencia.spec.ts`

## Cenário — previdência excluída do contador por padrão

**Como** investidor  
**Quero** que o card «Posições ativas» conte só os ativos do escopo patrimonial atual  
**Para** não ver previdência no total quando o filtro está desmarcado

### Pré-condição

- Carteira ativa com 4 posições tradicionais + 1 previdência (seed `seedConsolidadaWithPension`).

### Passo a passo

1. Abro `/dashboard`.
2. Vejo filtro **Previdência** desmarcado no card Patrimônio total.
3. Card **Posições ativas** exibe **4**.
4. Marco **Previdência**.
5. Card **Posições ativas** passa a exibir **5**.

### Resultado esperado

- Contagem alinhada aos filtros de patrimônio (mesma regra do patrimônio total e top ativos).
