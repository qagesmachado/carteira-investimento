# Exportar proventos filtrados por carteira (CSV)

## Metadados

- **ID:** `UI-DAD-006`
- **Status:** aprovado
- **Página:** `/dados` (seção Proventos)
- **Funcionalidade:** exportar proventos da carteira selecionada em CSV (ou JSON, se exposto na UI)
- **Depende de:** duas carteiras com proventos distintos no mesmo ticker (cenário análogo a `UI-PRV-015`)
- **Arquivo de teste:** `e2e/specs/dados/06-exportar-proventos-csv.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md) · `GET /data/export/dividends`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — CSV contém apenas proventos da carteira escolhida

**Como** investidor  
**Quero** exportar proventos filtrados por carteira  
**Para** analisar ou importar em outro ambiente sem misturar carteiras

### Passo a passo

1. Via seed API: existem `Carteira A` e `Carteira B`, cada uma com provento de `BBSE3` (valores distintos, ex.: R$ 50,00 e R$ 12,00).
2. Navego para `/dados`, seção **Proventos**.
3. Seleciono **Carteira A** no seletor de exportação.
4. Escolho formato **CSV** e disparo exportação.
5. Aguardo o download e leio o CSV.
6. **Verifico:** há linha(s) com o valor do provento da Carteira A (R$ 50,00).
7. **Verifico:** não há linha com o valor exclusivo da Carteira B (R$ 12,00).
8. Repito com **Carteira B** selecionada: o CSV contém R$ 12,00 e não contém R$ 50,00.

## Notas para automação

- Parse CSV simples (cabeçalho + colunas `ticker`, `valor`, `data` ou layout documentado).
- Seed: `seedProventos.ts` ou helper dedicado em `seedDados.ts`.
