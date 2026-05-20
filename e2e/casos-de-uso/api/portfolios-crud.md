# API — CRUD de carteiras e posições

## Pré-condições

- API em `http://127.0.0.1:8000`
- `PORTFOLIOS_DATABASE_URL` apontando para banco de teste

## Cenários

1. `GET /portfolios` retorna lista vazia inicialmente.
2. `POST /portfolios` cria carteira com nome único.
3. `PUT /portfolios/active` persiste carteira ativa.
4. Com ativo em `/assets`, `POST /portfolios/{id}/positions` cria posição.
5. Segunda posição para o mesmo ativo retorna 409.
