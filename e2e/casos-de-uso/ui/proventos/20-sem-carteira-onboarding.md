# Proventos sem carteira — onboarding

## Metadados

- **ID:** `UI-PRV-020`
- **Status:** aprovado
- **Página:** `/proventos/resumo` e `/proventos/lancamentos`
- **Funcionalidade:** estado vazio (nenhuma carteira cadastrada)
- **Depende de:** base sem carteiras
- **Arquivo de teste:** `e2e/specs/proventos/20-sem-carteira-onboarding.spec.ts`
- **Referência:** [cadastro-proventos.md](../../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001` (ver `e2e/worker-env.js`)

## Cenário — Sem carteira

**Como** investidor sem nenhuma carteira
**Quero** ver orientação para criar uma carteira
**Para** saber que preciso de uma carteira antes de registrar proventos

### Passo a passo

1. Garanto a base sem carteiras.
2. Abro `/proventos/resumo`.
3. Vejo o onboarding «Nenhuma carteira ainda» com botão **Criar carteira**.
4. O botão aponta para `/portfolios`.
5. Abro `/proventos/lancamentos`.
6. Vejo o mesmo onboarding (sem listagem global de proventos).

## Notas para automação

- Seed: limpar todas as carteiras (`clearAllPortfolios`).
- Assert: `getByTestId('proventos-resumo-sem-carteira-cta')` visível e `href="/portfolios"`.
- Assert: a tabela de lançamentos (`proventos-lista-section`) não é renderizada.
