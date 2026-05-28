# Exportar catálogo de ativos JSON

## Metadados

- **ID:** `UI-DAD-004`
- **Status:** aprovado
- **Página:** `/dados` (seção Ativos)
- **Funcionalidade:** download do catálogo global de ativos em JSON
- **Depende de:** ao menos dois ativos cadastrados na base (ex.: `BBSE3`, `ITSA4`)
- **Arquivo de teste:** `e2e/specs/dados/04-exportar-catalogo-ativos.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md) · `GET /data/export/assets`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Exportar catálogo de ativos

**Como** investidor  
**Quero** exportar o catálogo de ativos  
**Para** backup ou migração da base global independente das carteiras

### Passo a passo

1. Via seed API: existem ao menos dois ativos no catálogo (`BBSE3`, `ITSA4` ou equivalentes).
2. Navego para `/dados`, seção **Ativos**.
3. Clico em exportar catálogo (JSON).
4. Aguardo o download.
5. Parseio o JSON baixado.
6. **Verifico:** o payload lista os ativos seed (por `symbol` ou estrutura documentada da API).
7. **Verifico:** campos essenciais do cadastro (ex.: `symbol`, `asset_type`, `market`) estão presentes nos itens exportados.
8. O arquivo não contém posições nem proventos (apenas catálogo).

## Notas para automação

- `page.waitForEvent('download')`.
- Pode cruzar com `GET /data/export/assets` via `request` para assert auxiliar.
