# Importar carteira via wizard em /dados

## Metadados

- **ID:** `UI-DAD-003`
- **Status:** aprovado
- **Página:** `/dados` (seção Carteira)
- **Funcionalidade:** importar JSON de carteira (v1 ou v2) pelo wizard com pré-visualização e confirmação
- **Depende de:** `UI-DAD-002` ou fixture `.carteira.json` v2; ativos do JSON presentes ou marcados como novos no preview
- **Arquivo de teste:** `e2e/specs/dados/03-importar-carteira-wizard.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md) · `POST /portfolios/import/*`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** yfinance (quando preview criar ativo ausente via lookup)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Importar como nova carteira pelo wizard

**Como** investidor  
**Quero** importar um arquivo de carteira pela página Dados  
**Para** restaurar posições e proventos sem usar `/portfolios`

### Passo a passo

1. Tenho arquivo JSON exportado em `UI-DAD-002` (v2 com `dividend_payments`) ou fixture equivalente em `e2e/fixtures/`.
2. Os ativos referenciados no JSON existem em `carteira.db` de teste ou serão criados conforme resolução do preview.
3. Navego para `/dados`, seção **Carteira**.
4. Inicio o fluxo de importação e seleciono o arquivo JSON (`setInputFiles`).
5. Aguardo pré-visualização com status por ativo (`ok` / `novo` / `conflito` / `missing`).
6. Escolho criar como **nova carteira** e confirmo a importação.
7. **Verifico:** mensagem de sucesso e a nova carteira aparece no seletor de carteiras (ou lista auxiliar da seção).
8. Defino a carteira importada como ativa (se o fluxo não fizer automaticamente).
9. Em `/portfolios`, as posições importadas aparecem na tabela.
10. Em `/proventos` com a carteira importada ativa, os proventos do JSON aparecem na listagem (quando o arquivo era v2).

## Cenário — Import v1 sem proventos continua suportado

1. Importo fixture v1 (sem `dividend_payments`).
2. O wizard conclui com sucesso; posições são criadas.
3. Não há erro por ausência do array de proventos.

## Notas para automação

- Helper de upload compartilhado com `e2e/specs/helpers/bulkImport.ts` ou novo `seedDados.ts`.
- Não depender de botões de import em `/portfolios` (removidos da UI de cadastro).
