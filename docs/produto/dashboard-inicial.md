# Dashboard Inicial

## Status de implementação

| Escopo | Status | Documentação |
| ------ | ------ | ------------ |
| Tier 1 + 2 (`/dashboard`) | **Implementado** | [desenvolvido/dashboard-inicial.md](desenvolvido/dashboard-inicial.md) |
| Tier 3 (extensões) | Candidato | [candidato/dashboard-tier-3.md](candidato/dashboard-tier-3.md) |
| Tier 4 (módulos separados) | Candidato | [candidato/modulos-tier-4.md](candidato/modulos-tier-4.md) |

## Objetivo

Oferecer uma visão executiva da carteira de investimentos selecionada, respondendo rapidamente: quanto tenho, como está distribuído, quanto recebi de proventos, como evoluiu meu patrimônio e onde devo aportar para manter a estratégia.

O dashboard usa a planilha como referência, mas não deve copiar suas tabelas. A aplicação deve reorganizar as informações em indicadores, gráficos, filtros e chamadas para ação.

## Referências na planilha

- `RESUMO`: consolida proventos, divisão da carteira e totais.
- `BALANCEAMENTO`: mostra alocação desejada, alocação atual e valores faltantes.
- `PATRIMÔNIO TOTAL`: acompanha evolução anual do patrimônio.
- `Proventos Cálculos`: consolida proventos mensais e anuais.
- `Proventos Cálculos internaciona`: consolida proventos internacionais.

## Perguntas que a tela deve responder

- Qual é meu patrimônio total hoje?
- Qual carteira estou visualizando?
- Como meu patrimônio está distribuído por classe de ativo?
- Minha carteira está aderente ao balanceamento desejado?
- Quanto recebi de proventos no mês e no ano?
- Como meus proventos evoluíram ao longo do tempo?
- Como meu patrimônio evoluiu por ano?
- Onde faz mais sentido aportar agora?

## Indicadores principais

### Carteira selecionada

O dashboard deve ter um seletor de carteira, como um dropdown.

Comportamento esperado:

- O usuário escolhe qual carteira deseja visualizar.
- Todos os indicadores passam a considerar apenas a carteira selecionada.
- Ao trocar a carteira, patrimônio, alocação, proventos, evolução e rebalanceamento são recalculados.
- Uma visão consolidada de todas as carteiras pode existir futuramente, mas a visão por carteira deve ser a base.

### Patrimônio total

Mostra o valor consolidado da carteira selecionada.

Deve considerar:

- Ações e ETFs brasileiros.
- Fundos imobiliários.
- Renda fixa, incluindo ETFs de renda fixa controlados por objetivo.
- Internacional convertido para reais quando necessário.
- Bitcoin.
- Previdência, se fizer parte da visão consolidada definida pelo usuário.

### Alocação por classe

Mostra a distribuição atual da carteira selecionada por classe de ativo.

Classes iniciais:

- Ações e ETFs BR.
- Fundos imobiliários.
- Renda fixa.
- Internacional.
- Bitcoin.
- Previdência.

Regra importante: ativos de `AUPO11AREA11` devem ser somados em renda fixa para fins de carteira e rebalanceamento, mesmo que também apareçam em uma visão específica de objetivos.

### Aderência ao rebalanceamento

Compara percentual atual e percentual desejado por classe dentro da carteira selecionada.

Deve indicar:

- Classes abaixo do alvo.
- Classes acima do alvo.
- Valor necessário para atingir o alvo.
- Prioridade sugerida de aporte.

### Proventos

Mostra proventos recebidos por período.

Visões esperadas:

- Mês atual.
- Ano atual.
- Período customizado.
- Por classe de ativo.
- Por ativo.
- Nacional e internacional.

A mesma base de dados deve alimentar diferentes filtros, em vez de existirem tabelas separadas para cada recorte.

### Evolução patrimonial

Mostra crescimento do patrimônio ao longo do tempo.

Deve permitir:

- Visualizar por ano.
- Comparar mais de um ano.
- Alternar entre valor absoluto e percentual de valorização.
- Separar por classe quando fizer sentido.

## Componentes da tela

### Cards de resumo

Cards sugeridos:

- Carteira selecionada.
- Patrimônio total.
- Proventos do mês.
- Proventos do ano.
- Classe mais abaixo do alvo.
- Evolução patrimonial no ano.

### Gráfico de alocação

Exibe a distribuição por classe de ativo.

Deve permitir alternar entre:

- Valor financeiro.
- Percentual da carteira.
- Comparação com percentual desejado.

### Bloco de rebalanceamento

Lista as classes com maior diferença entre atual e desejado.

Campos sugeridos:

- Classe.
- Percentual atual.
- Percentual desejado.
- Valor atual.
- Valor faltante ou excedente.
- Ação sugerida.

### Bloco de proventos

Mostra uma visão consolidada de renda recebida.

Filtros sugeridos:

- Período.
- Classe de ativo.
- Ativo.
- Nacional ou internacional.

Visualizações sugeridas:

- Total do período.
- Gráfico mensal.
- Ranking por ativo.

### Bloco de evolução patrimonial

Mostra histórico e tendência de crescimento.

Filtros sugeridos:

- Ano.
- Intervalo de anos.
- Classe de ativo.
- Valor absoluto ou percentual.

## Interações esperadas

- Trocar a carteira no dropdown deve atualizar todos os indicadores do dashboard.
- Clicar em uma classe de ativo deve levar para a carteira filtrada por essa classe.
- Clicar em proventos deve levar para o relatório de proventos filtrado pelo período.
- Clicar em uma sugestão de rebalanceamento deve levar para o detalhe do rebalanceamento.
- Filtros aplicados no dashboard devem atualizar os gráficos sem duplicar a estrutura da tela.

## Regras funcionais

- O dashboard deve ser derivado dos dados cadastrados, lançamentos e cálculos; não deve ter preenchimento manual próprio.
- O dashboard deve sempre considerar uma carteira selecionada.
- O cálculo de patrimônio deve respeitar moeda, cotação e classe de ativo.
- O internacional deve poder ser exibido em moeda original e convertido para reais.
- ETFs de renda fixa por objetivo devem compor renda fixa no dashboard.
- Proventos devem considerar data de recebimento e tipo de ativo.
- O usuário deve conseguir filtrar períodos sem depender de uma tabela fixa por ano.

## Fora de escopo inicial

- Escolha de biblioteca de gráficos.
- Layout visual definitivo.
- Integração automática com corretoras.
- Sincronização automática de cotações.
- Projeções avançadas de patrimônio. Essas projeções pertencem ao módulo de simulação.

## Critérios de aceite

- O usuário consegue ver patrimônio total, alocação, proventos e evolução patrimonial em uma única tela.
- O usuário consegue selecionar uma carteira e ver os dados filtrados por ela.
- O usuário consegue filtrar proventos por mês, ano ou período customizado.
- O usuário consegue comparar alocação atual contra alocação desejada.
- O usuário consegue identificar a próxima classe prioritária para aporte.
- Os valores de ETFs de renda fixa controlados por objetivo aparecem somados em renda fixa.
- O dashboard não exige cadastro manual de dados específicos da tela; ele apenas consolida informações de outros módulos.
