# Documentação da Carteira de Investimentos

Esta documentação registra o funcionamento atual da planilha `Investimento_controle.xlsx` e traduz suas abas para conceitos de uma futura aplicação.

Neste momento não há decisão de stack, banco de dados, framework ou arquitetura técnica de implementação. O foco é entender o produto: quais informações existem, quais cálculos são feitos, como as abas se relacionam e como isso pode virar módulos de aplicação.

## Documentos

- [Visão geral da planilha](planilha/visao-geral.md): agrupamento das abas, papéis funcionais e fluxo principal de informações.
- [Análise aba a aba](planilha/abas.md): objetivo, campos principais, dependências e possível representação de cada aba em uma aplicação.
- [Arquitetura funcional](arquitetura/arquitetura-funcional.md): domínios, entidades conceituais e fluxos funcionais observados.
- [Funcionalidades candidatas](produto/funcionalidades.md): módulos, telas e capacidades que a aplicação pode oferecer.

## Princípios da documentação

- Registrar primeiro o comportamento atual da planilha.
- Separar entrada manual, base auxiliar, cálculo e visualização.
- Evitar copiar a estrutura da planilha diretamente para a aplicação.
- Tratar dados fiscais como requisitos funcionais, principalmente para declaração de Imposto de Renda.
- Representar ativos híbridos, como ETFs de renda fixa usados por objetivo, sem perder suas duas naturezas.
