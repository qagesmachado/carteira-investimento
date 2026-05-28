# Exportar carteira ativa JSON v2 com proventos

## Metadados

- **ID:** `UI-DAD-002`
- **Status:** aprovado
- **Página:** `/dados` (seção Carteira)
- **Funcionalidade:** download do JSON da carteira ativa no formato `version: 2`, incluindo `dividend_payments`
- **Depende de:** carteira ativa com pelo menos uma posição e um provento vinculado à mesma carteira
- **Arquivo de teste:** `e2e/specs/dados/02-exportar-carteira-json-v2.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md) · `GET /portfolios/{id}/export`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Exportar carteira ativa com proventos embutidos

**Como** investidor  
**Quero** exportar a carteira ativa em JSON v2  
**Para** fazer backup completo da carteira incluindo o histórico de proventos

### Passo a passo

1. Via seed API: existe carteira ativa (ex.: «E2E Principal») com posição de mercado (ex.: `BBSE3`) e ao menos um provento dessa carteira para o mesmo ticker.
2. Navego para `/dados` e localizo a seção **Carteira**.
3. Confirmo que a carteira ativa exibida corresponde à seed.
4. Clico em exportar carteira (JSON).
5. Aguardo o download de um arquivo `.carteira.json` (ou nome equivalente).
6. Abro/parseio o JSON baixado.
7. **Verifico:** `version` é `2`.
8. **Verifico:** existem chaves `portfolio`, `assets`, `positions`.
9. **Verifico:** existe array `dividend_payments` com ao menos um item referenciando o ticker e a data/valor do provento seed.
10. O ticker da posição aparece em `positions` e o mesmo ticker em `dividend_payments[].symbol`.

## Notas para automação

- `page.waitForEvent('download')` e validar JSON parseável.
- Fixture pode ser reutilizada em `UI-DAD-003`.
