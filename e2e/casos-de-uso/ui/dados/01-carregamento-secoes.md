# Carregamento da página Dados com seções

## Metadados

- **ID:** `UI-DAD-001`
- **Status:** aprovado
- **Página:** `/dados`
- **Funcionalidade:** exibir as quatro seções de exportação/importação na página centralizada
- **Depende de:** base de teste vazia após `globalSetup` (ou seed mínimo sem impactar layout)
- **Arquivo de teste:** `e2e/specs/dados/01-carregamento-secoes.spec.ts`
- **Referência:** [pagina-dados.md](../../../../docs/produto/desenvolvido/pagina-dados.md)

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001` (ver `e2e/test-env.js`)

> Ver [`dependencias.md`](../../dependencias.md) e [`estrategia-e2e-ui.md`](../../estrategia-e2e-ui.md).

## Cenário — Página carrega com seções Backup, Carteira, Ativos e Proventos

**Como** investidor  
**Quero** abrir a página Dados  
**Para** localizar em um só lugar todos os fluxos de backup, carteira, catálogo e proventos

### Passo a passo

1. Backend e frontend de teste estão no ar; `carteira.db` foi recriada pelo `pretest:ui`.
2. Navego para `/dados` (menu Cadastro → Dados).
3. Aguardo o fim do carregamento da página.
4. **Verifico:** a seção **Backup completo** está visível, com ações de exportar e importar backup JSON.
5. **Verifico:** a seção **Carteira** está visível, com export/import da carteira ativa (JSON).
6. **Verifico:** a seção **Ativos** está visível, com export/import do catálogo de ativos.
7. **Verifico:** a seção **Proventos** está visível, com export/import de proventos por carteira.
8. Não há alerta de erro persistente na tela.

## Notas para automação

- Assert por `heading` ou `data-testid` de cada seção; não exige dados cadastrados.
- Primeiro spec da pasta `dados/`.
