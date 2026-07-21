# Financeiro sem perfil — onboarding

## Metadados

- **ID:** `UI-FIN-014`
- **Status:** aprovado
- **Página:** `/financeiro` (Painel, Orçamento, Despesas, Metas, Renda, Tags)
- **Funcionalidade:** estado vazio (nenhum perfil financeiro cadastrado)
- **Depende de:** base sem perfis de orçamento
- **Arquivo de teste:** `e2e/specs/financeiro/14-sem-perfil-onboarding.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001` (ver `e2e/worker-env.js`)

## Cenário — Sem perfil

**Como** usuário sem nenhum perfil financeiro
**Quero** ver orientação para criar um perfil
**Para** saber que preciso de um perfil antes de usar orçamento, despesas, metas e renda

### Passo a passo

1. Garanto a base sem perfis de orçamento.
2. Abro `/financeiro` (Painel).
3. Vejo o cabeçalho da seção **e** o onboarding «Nenhum perfil financeiro ainda» com botão **Criar perfil**.
4. O botão aponta para `/financeiro/perfis`.
5. Repito para Despesas e Metas: cabeçalho da seção continua visível no estado vazio.

## Notas para automação

- Seed: limpar todos os perfis (`clearAllBudgetProfiles`).
- Assert: `financeiro-painel-heading` visível + `financeiro-painel-sem-perfil-cta` com `href="/financeiro/perfis"`.
- Assert: headings `financeiro-despesas-heading` / `financeiro-metas-heading` visíveis mesmo sem perfil.
