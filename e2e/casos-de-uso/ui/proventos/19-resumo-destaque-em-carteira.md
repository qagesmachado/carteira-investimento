# Destaque e Top ativos consideram só ativos em carteira

## Metadados

- **ID:** `UI-PRV-019`
- **Status:** aprovado
- **Pagina:** `/proventos/resumo`
- **Funcionalidade:** "Maior pagador" e "Top ativos" restritos a ativos em carteira; totais mantêm histórico
- **Depende de:** carteira ativa com um ativo em posição e outro já vendido, ambos com proventos
- **Arquivo de teste:** `e2e/specs/proventos/19-resumo-destaque-em-carteira.spec.ts`
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `Carteira Proventos` (ativa) com posição só em BBSE3
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Destaque em carteira, total histórico

**Como** investidor
**Quero** que o "Maior pagador" e o "Top ativos" reflitam o que ainda tenho em carteira
**Para** que o Resumo fique consistente com o Dashboard, sem esconder proventos de ativos vendidos nos totais

### Passo a passo

1. Carteira ativa tem BBSE3 (com posição) e ITSA4 (sem posição, "vendido").
2. BBSE3 recebeu R$ 100,00 e ITSA4 recebeu R$ 500,00 no mesmo ano.
3. Abro `/proventos/resumo`.
4. O card **Maior pagador** mostra **BBSE3** (não ITSA4), mesmo ITSA4 tendo pago mais.
5. O painel **Top ativos por proventos** lista **BBSE3** e **não** lista ITSA4.
6. Os totais/gráfico do Resumo somam **R$ 600,00** (100 + 500), incluindo o ativo vendido.

## Notas para automacao

- Seed via API: `seedProventosHeldVsSold` no `beforeEach`.
- Cards por `data-testid="proventos-kpi-maior-pagador"` e seção `data-testid="proventos-top-ativos"`.
