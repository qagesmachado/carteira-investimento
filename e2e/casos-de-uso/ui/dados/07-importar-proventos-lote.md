# Importar proventos em lote via /dados

## Metadados

- **ID:** `UI-DAD-007`
- **Status:** aprovado
- **Página:** `/dados` (seção Proventos)
- **Funcionalidade:** importação em lote de proventos (CSV template ou layout legado) com seleção de carteira
- **Depende de:** ativos cadastrados; carteira ativa ou selecionada no wizard
- **Arquivo de teste:** `e2e/specs/dados/07-importar-proventos-lote.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md) · [cadastro-proventos.md](../../../../docs/produto/desenvolvido/cadastro-proventos.md) · `POST /data/import/dividends/*`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Importar proventos CSV template na carteira selecionada

**Como** investidor  
**Quero** importar proventos em lote pela página Dados  
**Para** carregar histórico sem usar o bloco de lote em `/proventos`

### Passo a passo

1. Via seed: ativo `ITSA4` no catálogo; carteira «E2E Principal» ativa com posição opcional do mesmo ticker.
2. Navego para `/dados`, seção **Proventos**.
3. Seleciono a carteira destino da importação (ex.: «E2E Principal»).
4. Envio CSV com cabeçalho `ticker,data,valor,tipo` e uma linha válida para `ITSA4`.
5. Aguardo pré-visualização: formato `template`, linha **Pronto**.
6. Confirmo importação dos selecionados.
7. **Verifico:** mensagem de sucesso.
8. Em `/proventos` com a mesma carteira ativa, o lançamento importado aparece na tabela.

## Cenário — Layout legado

1. Envio CSV com colunas `Ativo`, `Tipo de provento`, `Data`, `Valor em reais`.
2. Pré-visualização detecta formato `legacy`.
3. Importação conclui com sucesso; lançamento visível em `/proventos`.

## Notas para automação

- Fixture CSV em memória; assert `POST` preview/import se exposto na rede.
- Alinhar com `UI-PRV-014` (comportamento de parse), mudando apenas a rota UI para `/dados`.
