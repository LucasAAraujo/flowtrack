import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.routers import auth, categories, time_entries, dashboard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("flowtrack")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Flowtrack API",
    description="Sistema de controle de tempo pessoal",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


register_exception_handlers(app)

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(categories.router, prefix=PREFIX)
app.include_router(time_entries.router, prefix=PREFIX)
app.include_router(dashboard.router, prefix=PREFIX)


@app.get("/health")
def health():
    return {"status": "ok"}
