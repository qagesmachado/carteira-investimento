# Página Info mostra versões e estado do banco

## Metadados

- **ID:** `UI-INFO-001`
- **Status:** aprovado
- **Página:** `/info`
- **Funcionalidade:** versionamento (app, frontend, schema, banco) e suporte
- **Depende de:** nenhuma (endpoint `/info` sempre disponível)
- **Arquivo de teste:** `e2e/specs/info/01-info-versoes.spec.ts`
- **Referência:** [pagina-info-versionamento.md](../../../../docs/produto/desenvolvido/pagina-info-versionamento.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Página Info exibe versões

**Como** usuário/suporte  
**Quero** ver as versões do app, frontend, schema e banco  
**Para** conferir o que está rodando e diagnosticar problemas

### Passo a passo

1. Acesso `/info`.
2. Vejo o título **Informações do sistema**.
3. A tabela mostra versão da aplicação (backend), frontend, schema esperado, versão do banco, Python, modo de lookup e caminho do banco.
4. Como o banco é inicializado/migrado na subida, o selo do banco aparece como **atualizado**.

## Cenário — Indicador de versão no rodapé

1. Abro o **Dashboard**.
2. No rodapé há um link discreto com a versão.
3. Clico no link e sou levado para `/info`.

## Notas para automação

- Valores conferidos por `data-testid` (`info-app-version`, `info-frontend-version`, `info-schema-version`, `info-db-version`, `info-db-status`, `info-python-version`, `info-db-path`).
- Link do rodapé via `data-testid="footer-version-link"`.
