# Funcionalidades Candidatas

Este documento traduz a planilha em módulos e telas possíveis para uma aplicação. As funcionalidades abaixo ainda não representam escopo fechado de desenvolvimento; elas servem para organizar o produto antes de discutir stack ou implementação.

## 1. Dashboard inicial

Detalhamento: [Dashboard inicial](dashboard-inicial.md) · **Implementado (Tier 1+2):** [desenvolvido/dashboard-inicial.md](desenvolvido/dashboard-inicial.md) · **Futuro:** [candidato/dashboard-tier-3.md](candidato/dashboard-tier-3.md)

**Status:** parcial — rota `/dashboard` com patrimônio, alocação, proventos agregados e drill-down. Rebalanceamento, evolução patrimonial e multi-carteira permanecem candidatos (Tier 3).

Origem na planilha:

- `RESUMO`
- `BALANCEAMENTO`
- `PATRIMÔNIO TOTAL`
- `Proventos Cálculos`
- `Proventos Cálculos internaciona`

Objetivo: apresentar uma visão executiva da carteira, respondendo quanto tenho, como está distribuído, quanto recebi de proventos, como evoluiu meu patrimônio e onde devo aportar.

Funcionalidades:

- Exibir patrimônio total.
- Exibir divisão da carteira por classe de ativo.
- Exibir proventos por mês, ano ou período customizado usando filtros sobre a mesma base de dados.
- Exibir comparação entre alocação atual e desejada.
- Exibir evolução patrimonial anual, com filtros por ano, intervalo de anos, valor absoluto e percentual de valorização.
- Destacar classes ou ativos que precisam de aporte para rebalanceamento.
- Somar ETFs de renda fixa por objetivo, como `AUPO11AREA11`, dentro da classe renda fixa para carteira e rebalanceamento.

Possíveis telas:

- Visão geral.
- Proventos do ano.
- Alocação por classe.
- Evolução patrimonial.

## 2. Cadastro de ativos e carteiras

Detalhamento:

- [Cadastro de ativos e carteiras](cadastro-de-ativos.md)
- [Cadastro de ativos no banco de dados](cadastro-ativos-banco-de-dados.md)
- [Criação de carteira](criacao-de-carteira.md)
- [Cadastro de ativos na carteira](cadastro-ativos-na-carteira.md)

Origem na planilha:

- `DB Ativos`
- `Análise de açõesetf br`
- `Análise etf`
- `Análise de fundos`

Objetivo: separar dados globais dos ativos, criação de carteiras e cadastro de posições dentro de cada carteira. Isso permite controlar carteiras de pessoas diferentes ou com objetivos diferentes no mesmo aplicativo.

Funcionalidades:

- Buscar ativo por ticker, nome ou identificador e preencher dados públicos via API de terceiros sempre que possível.
- Cadastrar ativo na base por fluxo guiado: tipo do ativo, local nacional ou internacional, país quando aplicável e dados específicos.
- Classificar ativo por tipo, mercado, moeda e classe de exibição na carteira.
- Exigir subtipo para ETF nacional: renda variável ou renda fixa.
- Permitir salvar o ativo apenas na base de dados, mesmo sem estar em carteira.
- Exportar e importar carteira em JSON, criando ativos ausentes na base e resolvendo conflitos de metadados em tabela de conferência.
- Editar ou excluir um ativo já persistido na base (ex.: `PATCH` e `DELETE` na API local).
- Na interface de cadastro, exibir tickers da B3 **sem** sufixo `.SA`, mesmo quando a fonte externa ou o banco usem o formato Yahoo (`PETR4.SA`).
- Permitir criar múltiplas carteiras.
- Permitir adicionar um ativo da base a uma carteira específica, informando quantidade, preço médio, custódia e dados pessoais da posição.
- Registrar fonte ou estratégia de cotação, permitindo integração com fonte pública, atualização automática, atualização manual ou cotação fixa/manual.
- Registrar links ou fontes de consulta.
- Registrar dados fiscais do ativo.
- Persistir os dados em banco de dados a ser definido.

Campos fiscais importantes:

- CNPJ da empresa ou fundo.
- CNPJ da fonte pagadora.
- Nome da fonte pagadora.
- Custódia.

Observação: o cadastro deve permitir que o CNPJ do ativo e o CNPJ da fonte pagadora sejam diferentes.

Regra importante: a classificação definida na base de ativos determina onde o ativo aparece em qualquer carteira e no rebalanceamento. Se um ETF nacional for marcado como renda fixa, ele deve compor renda fixa. Dados públicos devem vir de API quando possível; dados pessoais da posição pertencem ao cadastro do ativo na carteira.

## 3. Carteira de investimentos

Origem na planilha:

- `Ações`
- `Fundos`
- `Internacional`
- `Bitcoin`
- `Renda Fixa`
- `Previdência`
- `AUPO11AREA11`, como origem de posições de ETF de renda fixa divididas por objetivo.

Objetivo: controlar posições atuais e desempenho por carteira, usando a classificação definida no cadastro do ativo.

Detalhamento da **visão consolidada em tabela única** (filtros, ordenação, conversão USD→BRL para totais): [Visualização da carteira (consolidada)](visualizacao-carteira.md).

Funcionalidades:

- Registrar quantidade e preço médio.
- Calcular valor aplicado.
- Calcular valor atual.
- Calcular valorização.
- Calcular retorno total incluindo proventos.
- Exibir percentual da posição na carteira.
- Comparar percentual atual com percentual desejado.
- Mostrar valor faltante ou excedente por ativo.
- Exibir ativos na classe correta conforme cadastro, incluindo ETFs nacionais de renda fixa dentro de renda fixa.
- Permitir atualização de cotações por rotina externa, periodicidade configurável ou botão de atualização na visão de carteira/detalhe do ativo.
- Permitir alternar entre carteiras para controlar pessoas ou objetivos diferentes.
- Visualizar todas as posições da carteira ativa numa **única tabela**, com filtros e ordenação por colunas, valores na moeda do ativo e equivalente em reais usando cotação de câmbio atualizável (ver [visualização consolidada](visualizacao-carteira.md)).

Possíveis telas:

- **Carteira consolidada (tabela única)** — visão analítica unificada; substitui na prática a navegação por abas separadas da planilha (detalhes em [visualizacao-carteira.md](visualizacao-carteira.md)).
- Carteira por classe (legado / planilha): seletor de carteira; telas ou filtros equivalentes a ações, fundos, internacional, cripto, renda fixa e previdência.
- Seletor de carteira.
- Ações e ETFs brasileiros.
- Fundos imobiliários.
- Internacional.
- Criptoativos.
- Renda fixa.
- Previdência.

## 5. Rebalanceamento

Origem na planilha:

- `BALANCEAMENTO`
- `Ações`
- `Fundos`
- `Internacional`
- `Bitcoin`
- `Renda Fixa`
- `AUPO11AREA11`, compondo a classe renda fixa por meio dos objetivos vinculados.

Objetivo: orientar aportes conforme a alocação desejada.

Funcionalidades:

- Definir percentual alvo por classe.
- Calcular valor alvo por classe.
- Calcular valor atual por classe.
- Calcular valor faltante.
- Exibir classes abaixo ou acima do alvo.
- Sugerir onde aportar primeiro.
- Considerar cotação do dólar para investimentos internacionais.
- Considerar cotação do bitcoin para cripto.
- Considerar ETFs de renda fixa por objetivo como parte da alocação de renda fixa.

Possíveis telas:

- Configuração de metas.
- Comparativo atual x desejado.
- Sugestão de aporte.

## 6. Proventos e renda passiva

Origem na planilha:

- `DB Proventos`
- `DB Proventos internacional`
- `Proventos Cálculos`
- `Proventos Cálculos internaciona`
- `RESUMO`

Objetivo: registrar e analisar proventos nacionais e internacionais.

Funcionalidades:

- Registrar provento por ativo.
- Registrar tipo de provento.
- Registrar data e valor.
- Classificar por mês e ano.
- Consolidar por ativo, classe e período.
- Separar proventos nacionais e internacionais.
- Exibir total mensal.
- Exibir total anual.
- Exibir histórico por classe: ações, FIIs, ETFs e total.

Possíveis telas:

- Lançamento de proventos.
- Calendário ou histórico de recebimentos.
- Relatório mensal.
- Relatório anual.
- Comparativo por classe de ativo.

## 7. Apoio à declaração de Imposto de Renda

Origem na planilha:

- `DB Ativos`
- `DB Proventos`
- `DB Proventos internacional`

Objetivo: facilitar conferência e organização das informações usadas na declaração de IR.

Funcionalidades:

- Manter dados fiscais por ativo.
- Manter dados fiscais por fonte pagadora.
- Relacionar proventos com fonte pagadora.
- Permitir divergência entre CNPJ do ativo/fundo e CNPJ da fonte pagadora.
- Gerar visão anual por ativo.
- Gerar visão anual por fonte pagadora.
- Apoiar conferência com informes de rendimentos.

Possíveis telas:

- Cadastro fiscal do ativo.
- Fontes pagadoras.
- Proventos para IR.
- Relatório anual de rendimentos.

## 8. Análise de ativos

**Status:** parcialmente implementado — [classificacao-ativos-acoes-br.md](desenvolvido/classificacao-ativos-acoes-br.md) (Ações/ETF BR + DIAGRAMA AÇÕES + configuração).

Origem na planilha:

- `Análise de açõesetf br` — **MVP**
- `DIAGRAMA AÇÕES` — **MVP**
- `Análise etf`, `Análise de fundos`, `DIAGRAMA FIIS`, `Perguntas` — candidato

Objetivo: apoiar decisão de investimento com critérios e pontuações.

Funcionalidades (MVP entregue):

- Critérios fundamentais (lucros, dívida, tag along, segmento) com scores 1–5.
- Questionário DIAGRAMA AÇÕES configurável.
- Viabilidade calculada por motor editável (pesos e faixas na UI).
- Telas `/analise/acoes-br`, `/analise/configuracao`.
- Atalho Classificar em carteiras.

Funcionalidades (fases posteriores):

- FIIs, ETF internacional, % desejado, preço teto, ranking global.

## 9. Renda fixa

Origem na planilha:

- `Renda Fixa`
- `AUPO11AREA11`

Objetivo: acompanhar aplicações de renda fixa, vencimentos, liquidez e rentabilidade.

Funcionalidades:

- Registrar descrição, tipo e indexador.
- Registrar local ou custódia.
- Registrar valor aplicado e valor atual.
- Registrar rendimento contratado ou observado.
- Calcular lucro líquido.
- Controlar liquidez.
- Controlar vencimento.
- Diferenciar CDB, LCI, ETF de renda fixa e outros tipos.
- Integrar ETFs de renda fixa com objetivos financeiros quando necessário.
- Mostrar ETFs de renda fixa por objetivo junto dos demais ativos de renda fixa, preservando a visão de caixinhas em uma tela própria.

Possíveis telas:

- Lista de renda fixa.
- Detalhe da aplicação.
- Vencimentos.
- Rentabilidade por indexador.
- Objetivos vinculados a ETFs de renda fixa.

## 10. Criptoativos e taxas

Origem na planilha:

- `Bitcoin`
- `Bitcoin taxas`

Objetivo: acompanhar posição em BTC e custos de movimentação.

Funcionalidades:

- Registrar quantidade de BTC.
- Registrar preço médio em reais e dólar.
- Registrar cotação atual em reais e dólar.
- Calcular valor atual.
- Registrar taxas de compra.
- Registrar taxas de transferência.
- Calcular quantidade final após taxas.
- Calcular custo das taxas em reais e dólar.
- Calcular percentual de taxa.

Possíveis telas:

- Posição em BTC.
- Histórico de taxas.
- Rentabilidade de cripto.

## 11. Simulações e planejamento

Origem na planilha:

- `Simulação de dividendos`
- `Previdência`
- `PATRIMÔNIO TOTAL`

Objetivo: simular futuro financeiro e metas de longo prazo.

Funcionalidades:

- Definir capital inicial.
- Definir aporte mensal.
- Definir aporte extra.
- Definir saque.
- Definir valorização anual.
- Definir reajuste de aporte.
- Projetar capital futuro.
- Projetar renda passiva.
- Projetar evolução anual.
- Simular previdência com base em renda e meta de aporte.

Possíveis telas:

- Simulador de dividendos.
- Simulador de patrimônio.
- Planejamento de previdência.
- Cenários de independência financeira.

## 12. Relatórios

Objetivo: consolidar informações para análise e acompanhamento.

Relatórios candidatos:

- Patrimônio por ano.
- Evolução percentual por ano.
- Alocação atual por classe.
- Alocação desejada por classe.
- Proventos mensais.
- Proventos anuais.
- Proventos por fonte pagadora.
- Posições por custódia.
- Renda fixa por vencimento.
- Objetivos financeiros por valor atual.
- Ativos com recomendação de compra.

## Priorização inicial sugerida

Uma possível ordem de construção futura, ainda sem compromisso técnico:

1. Cadastro de ativos e dados fiscais.
2. Carteira de posições.
3. Proventos.
4. Dashboard inicial.
5. Rebalanceamento.
6. Objetivos financeiros.
7. Análise de ativos.
8. Simulações.
9. Relatórios avançados para IR.

Essa ordem prioriza primeiro os dados-base que alimentam o restante da aplicação.
