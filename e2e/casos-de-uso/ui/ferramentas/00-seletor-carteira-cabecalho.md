# Seletor de carteira no cabeçalho das Ferramentas

## Metadados

- **ID:** `UI-FERR-000`
- **Status:** aprovado
- **Página:** `/ferramentas/*` (rotas com escopo por carteira)
- **Funcionalidade:** seletor de carteira ativa no cabeçalho (`PageHeader`)
- **Depende de:** base de teste vazia após `pretest:ui` (cenário geral); seed mínimo no cenário com carteira
- **Arquivo de teste:** `e2e/specs/ferramentas/00-seletor-carteira-cabecalho.spec.ts`
- **Referência:** `frontend/src/lib/features/ferramentas/headerPortfolioSelect.ts`, `PageHeader.svelte`, `PortfolioSelect.svelte`

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira-{N}.db` (worker paralelo)
- **Lookup:** `yfinance` ou fake conforme worker
- **URLs:** frontend por worker · API por worker (ver `e2e/casos-de-uso/estrategia-e2e-ui.md`)

## Cenário — Presença do seletor no cabeçalho

**Como** investidor  
**Quero** trocar a carteira ativa no topo de cada ferramenta  
**Para** consultar dados da carteira correta sem rolar a página

### Passo a passo

1. Abro cada rota de ferramenta vinculada à carteira:
   - `/objetivos`
   - `/taxas-cripto`
   - `/financeiro/financiamento-imovel`
   - `/calculo-preco-medio`
   - `/conferencia-ir`
2. Vejo o título da página (`h1`) e, à direita, o combobox **Selecionar carteira** (`data-testid="portfolio-select-header"`).
3. Com carteira seedada, o combobox exibe o nome da carteira ativa.

### Cenário — Persistência global entre páginas

1. Com duas carteiras cadastradas, abro `/financeiro/financiamento-imovel`.
2. Troco o seletor do cabeçalho para a segunda carteira (PUT `/portfolios/active`).
3. Navego para `/calculo-preco-medio` e `/objetivos`.
4. O combobox do cabeçalho mantém a mesma carteira selecionada.

### Cenário — Cálculo de preço médio (aba Carteira)

1. Abro `/calculo-preco-medio`.
2. Confirmo um único seletor no cabeçalho (`portfolio-select-header`).
3. Abro a aba **Carteira**; o formulário interno pode ter outro seletor contextual, mas o do cabeçalho permanece visível e único com esse `testId`.

## Notas para automação

- Helper E2E: `e2e/specs/helpers/ferramentasPage.ts` (`headerPortfolioSelect`, `expectHeaderPortfolioSelectVisible`).
- Testes unitários: `PageHeader.test.ts`, `headerPortfolioSelect.test.ts`, `portfolioSelect.test.ts` (prop `testId`).
- Regressão crítica: falha deste spec indica perda do controle de carteira na UI.
