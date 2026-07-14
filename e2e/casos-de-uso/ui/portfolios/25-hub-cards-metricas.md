# Hub de carteiras

## Metadados

- **ID:** `UI-PRT-025`
- **Status:** aprovado
- **Página:** `/portfolios`
- **Funcionalidade:** hub exibe cards com KPIs resumidos
- **Depende de:** `UI-PRT-005` (seed com posição)
- **Arquivo de teste:** `e2e/specs/portfolios/25-hub-cards-metricas.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Hub exibe métricas da carteira

**Como** investidor  
**Quero** ver resumo de patrimônio no hub  
**Para** escolher qual carteira abrir

### Passo a passo

1. Existe carteira com posição BBSE3 na base de teste.
2. Navego para `/portfolios`.
3. Vejo card da carteira com rótulos Total aplicado, Total atual, Lucro e **Perfil** de balanceamento com link para Rebalanceamento.
4. Botão «Gerenciar posições» está visível no card.
