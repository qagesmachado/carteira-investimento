# API — Import/export de carteira

## Cenários

1. `GET /portfolios/{id}/export` retorna JSON `version: 1` com `portfolio`, `assets`, `positions`.
2. `POST /portfolios/import/preview` com fixture marca ativo ausente como `missing`.
3. Com ativo existente e nome diferente, preview retorna `conflict` e lista de campos.
4. `POST /portfolios/import` com resoluções cria carteira, ativos e posições.
