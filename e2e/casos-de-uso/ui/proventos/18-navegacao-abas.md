# Navegacao por abas de proventos

## Metadados

- **ID:** `UI-PRV-018`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** navegacao por abas (Resumo / Adicionar / Lancamentos)
- **Depende de:** base de teste sem proventos
- **Arquivo de teste:** `e2e/specs/proventos/18-navegacao-abas.spec.ts`
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Menu abre em Resumo e navega entre abas

**Como** investidor
**Quero** navegar entre Resumo, Adicionar e Lancamentos por abas
**Para** organizar o cadastro e o acompanhamento dos proventos

### Passo a passo

1. Abro `/proventos`.
2. Sou redirecionado para `/proventos/resumo` e vejo os cards de KPI.
3. Clico na aba **Adicionar** e a URL vira `/proventos/adicionar`, exibindo o formulario "Novo provento".
4. Clico na aba **Lancamentos** e a URL vira `/proventos/lancamentos`, exibindo a tabela "Proventos cadastrados".
5. Clico na aba **Resumo** e volto para `/proventos/resumo` com os cards de KPI.

## Notas para automacao

- Seed via API: `seedProventosEmpty` no `beforeEach`.
- Pills identificadas por `data-testid="proventos-section-tab-<id>"`.
