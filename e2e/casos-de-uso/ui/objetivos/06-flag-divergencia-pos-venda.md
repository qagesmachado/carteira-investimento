# Flag de divergência após venda

## Metadados

- **ID:** `UI-OBJ-006`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** divergência após mudança externa de posição
- **Depende de:** alocações + venda em `/portfolios`
- **Arquivo de teste:** `e2e/specs/objetivos/06-flag-divergencia-pos-venda.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — banner após venda

**Como** investidor  
**Quero** ver alerta quando vendo cotas alocadas em outra tela  
**Para** saber que preciso reajustar as alocações

### Passo a passo

1. 100 cotas PETR4 alocadas (60 Reserva + 40 Livre implícito).
2. Em `/portfolios`, reduzo posição para 50 cotas.
3. Volto a `/objetivos`.
4. Banner indica divergência (-50 cotas removidas) para PETR4.
