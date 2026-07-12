# Tags — CRUD e cores únicas

## Metadados

- **ID:** `UI-FIN-007`
- **Status:** aprovado
- **Página:** `/financeiro/metas/tags`
- **Arquivo de teste:** `e2e/specs/financeiro/07-tags-crud.spec.ts`
- **Referência:** [controle-orcamentario.md](../../../../docs/produto/desenvolvido/controle-orcamentario.md)

## Cenário — CRUD

1. Com perfil seed, abro `/financeiro/metas/tags`.
2. Gero cor aleatória, crio tag «Transporte», edito para «Transporte urbano» e excluo.

## Cenário — cores únicas

1. Via API crio duas tags com a mesma cor.
2. Abro `/financeiro/metas/tags`.
3. As tags passam a ter cores distintas (dedupe ao carregar).
4. A cor do formulário e a gerada por **Cor aleatória** não coincidem com cores já usadas.
