# Revamp visual — posições da carteira

## Metadados

- **ID:** `UI-PRT-031`
- **Status:** implementado
- **Página:** `/portfolios/{id}`
- **Funcionalidade:** layout Hub na tela de detalhe (hero, resumo, alocação, tabela enriquecida)
- **Depende de:** `UI-PRT-027`
- **Arquivo de teste:** `e2e/specs/portfolios/31-revamp-posicoes-carteira.spec.ts`

## Ambiente de teste

- **Base de carteiras:** principal `E2E Principal` (mix de posições)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Layout Hub na página de detalhe

**Como** investidor  
**Quero** gerenciar posições com a mesma linguagem visual do hub  
**Para** navegar com consistência e ler KPIs/alocação rapidamente

### Passo a passo

1. Estou em `/portfolios/{id}` com carteira `E2E Principal` e posições.
2. O hero usa gradiente dashboard com nome da carteira.
3. O botão «Todas as carteiras» no hero volta ao hub.
4. O painel de resumo exibe KPIs, alocação detailed e link «Abrir rebalanceamento».
5. A tabela de posições usa ticker pill e botão Detalhes por linha.
