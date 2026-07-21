# Importação em lote CSV/Excel

## Metadados

- **ID:** `UI-PRV-014`
- **Status:** aprovado
- **Página:** `/proventos/adicionar`
- **Funcionalidade:** importar proventos via CSV ou Excel (template ou layout legado)
- **Depende de:** `UI-PRV-001`, ativos cadastrados na base
- **Referência:** `DividendBulkImport.svelte`, `POST /dividend-payments/bulk/preview`

## Ambiente de teste

- Ativo `ITSA4` (ou equivalente) cadastrado em `/assets`
- URLs: frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Importar proventos a partir de CSV template

**Como** investidor  
**Quero** colar ou enviar um arquivo com vários proventos  
**Para** cadastrar o histórico de uma vez

### Passo a passo

1. Acesso `/proventos/adicionar` e rolo até **Proventos em lote**.
2. Cole CSV com cabeçalho `ticker,data,valor,tipo` e ao menos uma linha válida.
3. Clico **Analisar conteúdo** — mensagem indica linhas válidas e formato `template`.
4. Clico **Pré-visualizar no servidor** — tabela com status **Pronto** para linhas válidas.
5. Mantenho linhas selecionadas e clico **Importar selecionados**.
6. Mensagem de sucesso; ao abrir a aba **Lançamentos** a tabela exibe os novos proventos.

## Cenário — Layout legado e linhas repetidas

1. Envio `.xlsx` ou CSV com colunas `Ativo`, `Tipo de provento`, `Data`, `Valor em reais`.
2. Pré-visualização detecta formato `legacy`.
3. Linhas idênticas (mesmo ativo, data, tipo e valor) permanecem **Pronto** e selecionadas.
4. Importação cria um lançamento por linha enviada, inclusive repetidas na planilha.

## Notas para automação 

- Fixture CSV em memória ou arquivo temporário.
- Assert `POST /dividend-payments/bulk/preview` e `POST /dividend-payments/bulk`.
