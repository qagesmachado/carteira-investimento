# Página Info mostra as novidades da versão

## Metadados

- **ID:** `UI-INFO-002`
- **Status:** aprovado
- **Página:** `/info`
- **Funcionalidade:** release notes (novidades) lidas do `CHANGELOG.md`
- **Depende de:** nenhuma (endpoint `/info` sempre disponível)
- **Arquivo de teste:** `e2e/specs/info/02-info-novidades.spec.ts`
- **Referência:** [pagina-info-versionamento.md](../../../../docs/produto/desenvolvido/pagina-info-versionamento.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Página Info exibe novidades da versão

**Como** usuário/suporte
**Quero** ver o que mudou na versão atual
**Para** acompanhar as novidades sem sair do app

### Passo a passo

1. Acesso `/info`.
2. Abaixo da tabela de versões, vejo a seção **Novidades da versão vX.Y.Z**.
3. A seção lista, em tópicos, as mudanças da versão atual (lidas do `CHANGELOG.md`).
4. Quando a versão tem data de lançamento, ela aparece ao lado do título.

## Notas para automação

- Seção via `data-testid="info-release-notes"`; lista de itens dentro dela.
- A versão atual (`0.1.0`) tem seção correspondente no `CHANGELOG.md`, então a
  área de novidades sempre aparece nos testes.
