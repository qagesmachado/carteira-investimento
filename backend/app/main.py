from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.budget import router as budget_router
from app.api.analysis import router as analysis_router
from app.api.assets import router as assets_router
from app.api.dividend_payments import router as dividend_payments_router
from app.api.fx import router as fx_router
from app.api.crypto_fees import router as crypto_fees_router
from app.api.data import router as data_router
from app.api.portfolios import router as portfolios_router
from app.api.health import router as health_router
from app.api.info import router as info_router
from app.api.objectives import router as objectives_router
from app.api.patrimony_control import router as patrimony_control_router
from app.api.property_financings import router as property_financings_router
from app.core.config import settings
from app.core.logging_config import configure_logging
from app.db.session import init_db
from app.middleware.request_logging import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    init_db()
    yield


def _cors_allow_origins() -> list[str]:
    origins = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]
    # Dev (5173) + E2E worker 0 (5174) + workers paralelos até 5179
    for port in range(5174, 5180):
        origins.append(f"http://127.0.0.1:{port}")
        origins.append(f"http://localhost:{port}")
    return origins


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_allow_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(budget_router)
    app.include_router(assets_router)
    app.include_router(analysis_router)
    app.include_router(dividend_payments_router)
    app.include_router(crypto_fees_router)
    app.include_router(portfolios_router)
    app.include_router(objectives_router)
    app.include_router(property_financings_router)
    app.include_router(patrimony_control_router)
    app.include_router(fx_router)
    app.include_router(data_router)
    app.include_router(health_router)
    app.include_router(info_router)

    return app


app = create_app()
