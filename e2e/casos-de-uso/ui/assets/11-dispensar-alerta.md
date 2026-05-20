# Dispensar alerta na página

## Metadados

- **ID:** `UI-AST-011`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** fechar alerta de sucesso ou erro
- **Depende de:** alerta visível na página (ação anterior na mesma sessão)
- **Arquivo de teste:** `e2e/specs/assets/11-dispensar-alerta.spec.ts`

- **Referência:** `frontend/src/routes/assets/+page.svelte`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Dispensar alerta de sucesso ou erro

**Como** investidor  
**Quero** fechar um alerta exibido na página  
**Para** continuar usando a tela sem a mensagem

### Passo a passo

1. Estou em `/assets` com um alerta visível (sucesso ou erro de uma ação anterior na mesma sessão).
2. Clico no controle de fechar/dispensar do alerta.
3. O alerta deixa de ser exibido.
4. O restante da página permanece utilizável.

## Notas para automação (fase 2)

- Se houver `role="alert"`, usar `getByRole('alert')` e botão de dismiss.
- Pode exigir ação prévia (ex.: salvar ativo) para gerar o alerta.
