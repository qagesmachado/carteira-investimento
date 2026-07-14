# Sequência TDD Inicial

As funcionalidades serão desenvolvidas em fatias pequenas, sempre começando por testes.

## 1. Cadastro de ativo

Primeiros comportamentos a testar:

- Criar ativo nacional com tipo e ticker.
- Exigir país quando o ativo for internacional.
- Exigir subtipo quando o ativo for ETF nacional.
- Classificar ETF nacional de renda fixa como renda fixa.
- Permitir salvar ativo na base sem vinculá-lo a uma carteira.

## 2. Carteiras

Primeiros comportamentos a testar:

- Criar carteira com nome.
- Listar carteiras existentes.
- Impedir nomes inválidos ou vazios.
- Permitir carteira com objetivo/descrição.

## 3. Cadastro de ativos na carteira

Primeiros comportamentos a testar:

- Adicionar ativo existente a uma carteira.
- Registrar quantidade e preço médio.
- Permitir o mesmo ativo em carteiras diferentes.
- Usar a classificação do ativo para exibição na carteira.
- Manter ETF nacional de renda fixa na classe renda fixa mesmo quando vinculado a objetivo.

## Regra de ciclo

Para cada fatia:

1. Escrever teste backend da regra.
2. Implementar o mínimo para passar.
3. Escrever teste frontend quando houver comportamento visual.
4. Implementar a menor tela/componente possível.
5. Refatorar mantendo testes verdes.
