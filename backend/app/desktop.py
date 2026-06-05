"""App empacotado: serve a SPA (Svelte build) e a API na mesma origem.

O backend de desenvolvimento (`app.main:app`) continua intacto. Aqui criamos um
app "wrapper" que monta a API sob `/api` e serve os arquivos estáticos do frontend
com fallback para `index.html` (roteamento client-side / deep-link).
"""

from __future__ import annotations

import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

from app.core.logging_config import configure_logging
from app.db.session import init_db
from app.main import app as api_app


def frontend_build_dir() -> Path:
    """Pasta com o build do frontend, no app empacotado ou em dev."""
    if getattr(sys, "frozen", False):
        base = Path(getattr(sys, "_MEIPASS"))
        return base / "frontend_build"
    return Path(__file__).resolve().parents[2] / "frontend" / "build"


class SpaStaticFiles(StaticFiles):
    """StaticFiles que cai no index.html quando o caminho não existe (SPA)."""

    async def get_response(self, path: str, scope: Scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


@asynccontextmanager
async def _lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Sub-apps montados não têm o lifespan executado automaticamente; garantimos
    # aqui a configuração de logging e a inicialização/migração do banco.
    configure_logging()
    init_db()
    yield


def create_desktop_app() -> FastAPI:
    root = FastAPI(title="Carteira Investimento (Desktop)", lifespan=_lifespan)
    root.mount("/api", api_app)

    build_dir = frontend_build_dir()
    if build_dir.is_dir():
        root.mount("/", SpaStaticFiles(directory=str(build_dir), html=True), name="spa")
    return root


app = create_desktop_app()
