# Página Info mostra estado do banco

## Metadados

- **ID:** `UI-INFO-001`
- **Status:** aprovado
- **Página:** `/info`
- **Funcionalidade:** estado do banco (versão/migration) e suporte
- **Depende de:** nenhuma (endpoint `/info` sempre disponível)
- **Arquivo de teste:** `e2e/specs/info/01-info-versoes.spec.ts`
- **Referência:** [pagina-info-versionamento.md](../../../../docs/produto/desenvolvido/pagina-info-versionamento.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Página Info exibe estado do banco

**Como** usuário/suporte  
**Quero** ver a versão do banco e o caminho do arquivo  
**Para** conferir se o banco está atualizado (migration) e localizar o arquivo

### Passo a passo

1. Acesso `/info`.
2. Vejo o título **Informações do sistema**.
3. A tabela mostra a versão do banco (arquivo do usuário) e o caminho do banco.
4. Como o banco é inicializado/migrado na subida, o selo do banco aparece como **atualizado**.

## Cenário — Indicador de versão no rodapé

1. Abro o **Dashboard**.
2. No rodapé há um link discreto que leva para `/info`.
3. Clico no link e sou levado para `/info`.

## Notas para automação

- Valores conferidos por `data-testid` (`info-db-version`, `info-db-status`, `info-db-path`).
- Link do rodapé via `data-testid="footer-version-link"`.
