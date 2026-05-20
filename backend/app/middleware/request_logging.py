import logging
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        if response.status_code >= 400:
            logger.warning(
                "%s %s -> %s",
                request.method,
                request.url.path,
                response.status_code,
            )
        return response
