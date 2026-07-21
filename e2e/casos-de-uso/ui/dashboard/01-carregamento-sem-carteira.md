# Carregamento do dashboard sem carteira

## Metadados

- **ID:** `UI-DASH-001`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** estado vazio
- **Depende de:** base sem carteiras
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Sem carteira

**Como** investidor  
**Quero** ver orientação quando não há carteira  
**Para** saber como começar

### Passo a passo

1. Abro `/dashboard`.
2. Vejo título «Dashboard».
3. Onboarding «Nenhuma carteira ainda» indica ausência de carteira.
4. Botão **Criar carteira** (link para `/portfolios`) está visível.
