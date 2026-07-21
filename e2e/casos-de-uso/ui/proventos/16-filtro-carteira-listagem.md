# Painel de carteira no topo filtra a listagem de proventos

## Metadados

- **ID:** `UI-PRV-016`
- **Status:** aprovado
- **Pagina:** `/proventos/lancamentos`
- **Funcionalidade:** painel de carteira no topo da seção (após as abas) define o escopo de toda a seção Proventos; a listagem reflete a carteira selecionada, com default na carteira ativa
- **Depende de:** duas carteiras com proventos distintos
- **Arquivo de teste:** `e2e/specs/proventos/16-filtro-carteira-listagem.spec.ts`
- **Referencia:** [cadastro-proventos.md](../../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (carteiras `Carteira A` e `Carteira B`)
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Painel de carteira troca o escopo da listagem

**Como** investidor com mais de uma carteira  
**Quero** trocar a carteira pelo painel no topo da seção Proventos  
**Para** revisar os lancamentos de cada carteira separadamente

### Passo a passo

1. Existem proventos cadastrados nas duas carteiras (R$ 50,00 em BBSE3 carteira A; R$ 12,00 em BBSE3 carteira B).
2. Acesso `/proventos/lancamentos` com `Carteira A` definida como ativa.
3. **Verifico:** o painel de carteira mostra `Carteira A` e a tabela exibe apenas o lancamento de R$ 50,00 (coluna "Carteira" = "Carteira A").
4. Seleciono `Carteira B` no painel do topo.
5. **Verifico:** a tabela passa a exibir apenas o lancamento de R$ 12,00 (carteira B).

## Notas para automacao

- Seed via API: criar duas carteiras + dois proventos.
- Trocar a carteira pelo painel: `data-testid="proventos-portfolio-select"` (helper `selectProventosPortfolio`).
- O painel persiste a carteira ativa globalmente (mesmo comportamento do Dashboard/Análise).
