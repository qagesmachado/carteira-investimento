# Criar carteira com perfil Personalizado

## Metadados

- **ID:** `UI-PRT-028`
- **Status:** implementado
- **Página:** `/portfolios` → `/portfolios/{id}` → `/portfolios`
- **Funcionalidade:** sliders de metas por classe no modal Nova carteira
- **Depende de:** `UI-PRT-026`
- **Arquivo de teste:** `e2e/specs/portfolios/28-criar-carteira-perfil-personalizado.spec.ts`

## Ambiente de teste

- **Base de carteiras:** vazia no início do teste
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Metas customizadas na criação

**Como** investidor  
**Quero** definir percentuais por classe ao criar a carteira  
**Para** ter balanceamento alinhado à minha estratégia

### Passo a passo

1. Estou em `/portfolios` sem carteiras.
2. Abro «Nova carteira».
3. Escolho perfil **Personalizado**.
4. Vejo sliders por classe com ícones e barras coloridas.
5. Ajusto renda fixa para 60% e ações/ETF BR para 15% (soma permanece 100%).
6. Informo nome `E2E Personalizado`.
7. Confirmo criação e sou redirecionado para posições.
8. Volto ao hub e o card exibe perfil **Personalizado** no balanceamento sugerido.
