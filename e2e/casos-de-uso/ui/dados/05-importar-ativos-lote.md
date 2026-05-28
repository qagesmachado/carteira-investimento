# Importar ativos em lote via /dados

## Metadados

- **ID:** `UI-DAD-005`
- **Status:** aprovado
- **Página:** `/dados` (seção Ativos)
- **Funcionalidade:** importação em lote do catálogo (preview + confirm) pela página Dados
- **Depende de:** `UI-DAD-001`; base pode estar vazia ou com ativos parciais
- **Arquivo de teste:** `e2e/specs/dados/05-importar-ativos-lote.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md) · `POST /data/import/assets/*`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** yfinance (quando o fluxo criar ativo com ticker de mercado)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Importar ativos novos em lote

**Como** investidor  
**Quero** importar vários ativos de uma vez em `/dados`  
**Para** popular o catálogo sem cadastro individual em `/assets`

### Passo a passo

1. `carteira.db` de teste não contém o ticker `WEGE3` (ou ticker escolhido no fixture).
2. Navego para `/dados`, seção **Ativos**.
3. Envio arquivo JSON de catálogo (fixture com `WEGE3` e ao menos um segundo ticker).
4. Aguardo pré-visualização: linhas novas com status **Pronto** ou equivalente.
5. Confirmo a importação.
6. **Verifico:** mensagem de sucesso.
7. Em `/assets`, `WEGE3` aparece na listagem.
8. **Verifico:** persistência após recarregar `/assets` (GET `/assets` contém o ticker).

## Cenário — Ativo já existente

1. Seed inclui `BBSE3` no catálogo.
2. O preview marca `BBSE3` como já existente / ignorado / conflito conforme regra da API.
3. A importação não duplica o registro; contagem final de `BBSE3` permanece 1.

## Notas para automação

- Reutilizar padrão de `bulkImport` e fixtures JSON em `e2e/fixtures/`.
- Fluxo de lote **não** deve mais ser o caminho principal em `/assets` (apenas CRUD individual).
