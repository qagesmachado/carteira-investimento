# Análise Aba a Aba

Este documento descreve cada aba da planilha `Investimento_controle.xlsx`, seu papel funcional, campos principais, dependências observadas e como ela poderia ser representada em uma aplicação.

## `RESUMO`

Tipo: dashboard consolidado.

Objetivo: apresentar visão geral de proventos, divisão da carteira, valores por classe de ativo e totais recebidos.

Principais informações:

- Controle mensal e anual de proventos.
- Separação de proventos totais, FIIs, ações e ETFs.
- Divisão da carteira por classe de ativo.
- Total de proventos recebidos no ano atual.

Dependências:

- `BALANCEAMENTO`
- `Internacional`
- `Previdência`
- `Proventos Cálculos`

Na aplicação: tela inicial ou dashboard financeiro com cartões de patrimônio, gráficos de alocação, resumo de proventos e indicadores anuais.

## `BALANCEAMENTO`

Tipo: cálculo e planejamento de alocação.

Objetivo: comparar a alocação desejada com a alocação atual e indicar quanto falta para cada classe de ativo.

Principais informações:

- Percentual desejado por classe: ações/ETF BR, fundos, internacional, renda fixa e bitcoin.
- Valor alvo por classe.
- Valor atual por classe.
- Diferença entre alvo e atual.
- Cotação do dólar e cotação de bitcoin usadas nos cálculos.
- Relação desejada entre ETF e ação dentro da carteira brasileira.

Dependências:

- `Ações`
- `Fundos`
- `Internacional`
- `Previdência`
- `Renda Fixa`
- `Bitcoin`

Na aplicação: módulo de rebalanceamento com metas por classe, situação atual, valor faltante e sugestão de aporte.

## `Previdência`

Tipo: planejamento e acompanhamento.

Objetivo: controlar aportes anuais em previdência e comparar com metas baseadas em renda.

Principais informações:

- Ano.
- Total investido no ano.
- Valor desejado ao final do ano.
- Valor faltante.
- Previsão de salário anual.
- Previsão de aporte anual.
- Aporte mensal necessário e ideal.
- Total aportado, total atual e lucro bruto.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: módulo de planejamento previdenciário com metas anuais, aportes realizados e valor restante para atingir o objetivo.

## `Ações`

Tipo: carteira de posições.

Objetivo: controlar posição atual de ações e ETFs brasileiros, com preço médio, cotação, retorno, percentual na carteira e indicação de rebalanceamento.

Principais informações:

- ID, ticker, nome e posição.
- Quantidade.
- Valor médio de compra.
- Valor total de compra.
- Dividendos recebidos.
- Última cotação.
- Valor atual.
- Valorização, retorno total e potencial de ganho.
- Percentual atual e percentual desejado.
- Valor máximo e recomendação de compra.

Dependências:

- `Análise de açõesetf br`
- `DB Ativos`

Na aplicação: tela de carteira de renda variável brasileira, com posição por ativo, performance, dividendos acumulados e sugestão de compra/rebalanceamento.

## `Fundos`

Tipo: carteira de posições.

Objetivo: controlar posição atual em fundos imobiliários, incluindo retorno, dividendos, preço teto, potencial e indicação de compra.

Principais informações:

- ID, ticker, nome e posição.
- Quantidade.
- Valor médio de compra.
- Valor total investido.
- Dividendos recebidos.
- Última cotação.
- Valor atual.
- Valorização e retorno.
- Potencial de ganho.
- Percentual da carteira.
- Valor máximo e valor faltante.

Dependências:

- `Análise de fundos`
- `DB Ativos`

Na aplicação: tela de carteira de FIIs, com acompanhamento de posição, renda recebida, preço teto e prioridade de aporte.

## `Internacional`

Tipo: carteira de posições.

Objetivo: controlar posição em ETFs internacionais, com quantidades fracionárias, cotação em dólar, valor atual e alocação desejada.

Principais informações:

- ID, ticker e nome.
- Quantidade.
- Valor médio de compra.
- Valor total de compra.
- Dividendos recebidos.
- Última cotação em dólar.
- Valor atual.
- Valorização e retorno.
- Percentual atual e desejado.
- Valor máximo e valor faltante.

Dependências:

- `Análise etf`
- `DB Ativos`

Na aplicação: módulo de carteira internacional, com suporte a moeda estrangeira, cotação, conversão cambial e rebalanceamento por ETF.

## `Bitcoin`

Tipo: carteira de posição cripto.

Objetivo: controlar posição atual em BTC, preço médio em reais e dólar, valor atual, taxas e necessidade de compra.

Principais informações:

- Ativo BTC.
- Quantidade.
- Valor médio de compra em reais.
- Valor médio de compra em dólar.
- Valor total investido.
- Cotação atual em reais e dólar.
- Valor atual.
- Total de taxas pagas.
- Valorização.
- Valor alvo, valor faltante e valor acima do alvo.

Dependências:

- `BALANCEAMENTO`

Na aplicação: módulo de criptoativos, com posição, preço médio, taxas, cotação e aderência ao percentual alvo da carteira.

## `Renda Fixa`

Tipo: carteira de posições e consolidação.

Objetivo: controlar aplicações de renda fixa, rentabilidade, liquidez, vencimento e participação na carteira.

Principais informações:

- Descrição do investimento.
- Tipo: CDB, LCI, ETF, entre outros.
- Indexador: pré-fixado, IPCA, Selic.
- Local/custódia.
- Valor aplicado e valor atual.
- Rendimento.
- Lucro líquido total, anual e em reais.
- Liquidez.
- Datas de início, vencimento e consulta.
- Observações e percentual na carteira.

Dependências:

- `AUPO11AREA11`
- `BALANCEAMENTO`

Na aplicação: tela de renda fixa com visão por aplicação, indexador, vencimento, liquidez, rentabilidade e participação no total. Os valores de ETFs de renda fixa controlados por objetivo, como `AUPO11AREA11`, devem aparecer aqui e também compor o rebalanceamento da classe renda fixa.

## `AUPO11AREA11`

Tipo: investimento híbrido, controle por objetivo e componente de renda fixa.

Objetivo: controlar ETFs de renda fixa que podem ser usados para objetivos diferentes, como reserva de emergência, celular, financiamento de apartamento ou outras caixinhas. Na planilha isso aparece em uma aba separada por facilidade e limitação do Excel, mas na aplicação deve ser uma funcionalidade flexível de objetivos vinculados a ativos.

Principais informações:

- Descrição do ETF.
- Objetivo associado.
- Custódia/local.
- Quantidade individual.
- Quantidade total.
- Preço médio de compra.
- Valor aplicado individual.
- Proventos.
- Percentual de alocação por objetivo.
- Preço médio atual.
- Valor atual total e individual.
- Lucro líquido total e em reais.
- Data de consulta.

Dependências:

- `DB Ativos`

Na aplicação: funcionalidade de objetivos financeiros vinculados a investimentos. O ativo continua sendo ETF e renda fixa, deve aparecer junto aos ativos de renda fixa e deve compor a estratégia de renda fixa no rebalanceamento. Esse conceito deve permitir que um mesmo ativo financie objetivos diferentes sem duplicar o cadastro do ativo.

## `Análise de açõesetf br`

Tipo: análise e regra de alocação.

Objetivo: avaliar ações e ETFs brasileiros, calcular pontuação, definir viabilidade e determinar percentuais desejados.

Principais informações:

- Ticker, tipo e nome.
- Setor, subsetor e segmento.
- Carteira/estratégia.
- Indicação se está em posse.
- Viabilidade.
- Critérios como lucros, dívida líquida/EBITDA, tag along, listagem e outros indicadores.
- Pontuação, peso, fator e percentual desejado.
- Valor desejável e preço de referência.

Dependências:

- `BALANCEAMENTO`
- `DIAGRAMA AÇÕES`

Na aplicação: cadastro analítico de ativos brasileiros, com score, critérios, decisão de elegibilidade e percentual alvo.

## `Análise etf`

Tipo: planejamento de alocação internacional.

Objetivo: definir ETFs internacionais elegíveis e percentuais desejados dentro da carteira internacional.

Principais informações:

- ID, ticker e nome.
- Tipo.
- Percentual desejado.
- Valor desejável em reais.
- Valor desejável em dólar.
- Link de análise.

Dependências:

- `BALANCEAMENTO`

Na aplicação: configuração de alocação internacional, com percentual alvo por ETF e referência externa de análise.

## `Análise de fundos`

Tipo: análise e regra de alocação.

Objetivo: avaliar FIIs, definir pesos desejados, preço teto e potencial máximo.

Principais informações:

- ID, ticker e nome.
- Segmento e tipo.
- Carteira.
- Pontuação do diagrama.
- Percentual desejado.
- Valor desejável.
- Preço teto.
- Potencial máximo.
- Métricas de análise, média normalizada, análise IA e média final.

Dependências:

- `BALANCEAMENTO`
- `DIAGRAMA FIIS`

Na aplicação: cadastro analítico de FIIs, com critérios, score, preço teto, percentual alvo e sugestão de aporte.

## `Bitcoin taxas`

Tipo: base transacional de taxas.

Objetivo: registrar taxas de compra e transferência de BTC, permitindo calcular quantidade final, valor da taxa e impacto percentual.

Principais informações:

- Ativo.
- Tipo de taxa.
- Quantidade movimentada.
- Quantidade de taxa.
- Quantidade final após taxas.
- Cotação.
- Valor da taxa em reais e dólar.
- Fator de conversão.
- Percentual da taxa.
- Data, mês e ano.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: histórico de movimentações e taxas de criptoativos, vinculado à posição de BTC.

## `DB Proventos`

Tipo: base de dados de proventos nacionais.

Objetivo: registrar e calcular proventos nacionais por ativo, tipo, data, valor e informações fiscais.

Principais informações:

- Código composto por ativo e tipo de provento.
- Tipo do ativo.
- Setor/nome.
- Ativo.
- Tipo de provento.
- Data.
- Valor em reais.
- Mês e ano.
- Outros campos auxiliares.
- CNPJ da empresa.
- CNPJ da fonte pagadora.

Dependências:

- `DB Ativos`

Na aplicação: base transacional de proventos nacionais, com suporte a filtros por ativo, tipo, período e informações para declaração de IR.

## `DB Proventos internacional`

Tipo: base de dados de proventos internacionais.

Objetivo: registrar dividendos internacionais por ativo, data e valor.

Principais informações:

- Código composto por ativo e tipo de provento.
- Tipo do ativo.
- Setor/nome.
- Ativo.
- Provento.
- Data.
- Valor.
- Mês e ano.
- Outros campos auxiliares.

Dependências:

- `DB Ativos`

Na aplicação: base transacional de dividendos internacionais, com suporte a moeda, período e origem do ativo.

## `Proventos Cálculos`

Tipo: cálculo e relatório.

Objetivo: consolidar proventos nacionais mensal e anualmente, separados por FIIs, ações, ETFs e total.

Principais informações:

- Ano atual.
- Mês atual.
- Tabelas mensais por tipo de ativo.
- Total mensal.
- Total anual.
- Consultas por mês, ano e tipo.

Dependências:

- `DB Proventos`
- `DB Proventos internacional`

Na aplicação: motor de agregação de proventos e relatórios de renda passiva por período e classe de ativo.

## `Proventos Cálculos internaciona`

Tipo: cálculo e relatório.

Objetivo: consolidar proventos internacionais mensal e anualmente.

Principais informações:

- Ano atual.
- Mês atual.
- Tabela mensal de ETF internacional.
- Resultado por mês e ano.

Dependências:

- `DB Proventos internacional`

Na aplicação: relatório de dividendos internacionais por mês, ano e ativo.

## `DIAGRAMA AÇÕES`

Tipo: matriz de critérios.

Objetivo: pontuar ações com base em perguntas qualitativas e quantitativas.

Principais informações:

- Ticker.
- Soma da pontuação.
- Critérios como ROE, crescimento, dividendos, tecnologia, tempo de mercado, vantagem competitiva, perenidade, tamanho, governança, independência e endividamento.
- Flag de atualização.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: questionário ou checklist de análise fundamentalista de ações, gerando score para apoiar decisão de investimento.

## `DIAGRAMA FIIS`

Tipo: matriz de critérios.

Objetivo: pontuar FIIs com base em perguntas sobre qualidade dos imóveis, P/VP, dividendos e dependência.

Principais informações:

- Ticker.
- Soma da pontuação.
- Critérios de localização, propriedades, P/VP, dividendos, dependência e setor.
- Flag de P/VP maior que 1,5.
- Flag de atualização.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: questionário de análise de FIIs, gerando score e alertas.

## `Perguntas`

Tipo: catálogo de critérios.

Objetivo: armazenar as perguntas usadas nas análises de ações e FIIs.

Principais informações:

- Critérios de ações.
- Perguntas de ações.
- Critérios de FIIs.
- Perguntas de FIIs.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: cadastro de critérios e perguntas de análise, permitindo reuso e evolução dos questionários.

## `Simulação de dividendos`

Tipo: simulador.

Objetivo: projetar evolução de capital, dividendos, aportes, saques e renda futura ao longo do tempo.

Principais informações:

- Mês.
- Capital.
- Dividendos.
- Aporte mensal.
- Aporte extra.
- Saque.
- Total.
- Tempo.
- Aporte acumulado.
- Capital inicial.
- Valorização anual e mensal.
- Reajuste de aporte.
- Ano de início.
- Cenários por anos, meses, capital e renda.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: simulador de independência financeira ou renda passiva, com premissas editáveis e cenários de longo prazo.

## `PATRIMÔNIO TOTAL`

Tipo: dashboard histórico e projeção.

Objetivo: acompanhar evolução anual do patrimônio em reais, dólar, cripto e total, além de projetar anos futuros.

Principais informações:

- Evolução anual em reais.
- Evolução anual em dólar.
- Evolução anual em cripto.
- Evolução anual total.
- Projeção futura.
- Patrimônio e evolução percentual por ano.

Dependências:

- `BALANCEAMENTO`
- `Internacional`

Na aplicação: relatório de evolução patrimonial anual, com separação por moeda/classe e projeções.

## `DB Ativos`

Tipo: cadastro mestre.

Objetivo: centralizar dados dos ativos usados em carteiras, proventos e análises.

Principais informações:

- Ativo/ticker.
- Nome.
- Tipo.
- Cotação fixa.
- Cotação em reais.
- Cotação em dólar.
- Indicação se está em posse.
- CNPJ da empresa/fundo.
- CNPJ da fonte pagadora.
- Fonte pagadora.
- Custódia.
- Link de acesso.

Dependências: nenhuma dependência externa relevante observada.

Na aplicação: cadastro mestre de ativos. Deve suportar classificação por tipo, cotações, posse atual, custódia e dados fiscais para IR.
