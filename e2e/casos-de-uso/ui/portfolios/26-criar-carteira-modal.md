# Criar carteira via modal

## Metadados

- **ID:** `UI-PRT-026`
- **Status:** aprovado
- **Página:** `/portfolios` → `/portfolios/{id}`
- **Funcionalidade:** modal com perfil de investidor e template
- **Depende de:** `UI-PRT-001`
- **Arquivo de teste:** `e2e/specs/portfolios/26-criar-carteira-modal.spec.ts`

## Ambiente de teste

- **Base de carteiras:** vazia no início do teste
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Criar carteira pelo modal guiado

**Como** investidor  
**Quero** criar carteira escolhendo perfil e tipo  
**Para** começar com metas alinhadas ao meu perfil

### Passo a passo

1. Estou em `/portfolios` sem carteiras.
2. Abro «Nova carteira».
3. Escolho perfil Moderado e template Pessoal.
4. Informo nome `E2E Modal Principal`.
5. Confirmo criação.
6. Sou redirecionado para `/portfolios/{id}` com heading «Posições da carteira».
