from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.pool import close_pool, get_pool, init_pool
from app.routers import analytics, categories, videos


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(title="YouTube Trending Hub API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/healthz")
async def healthz():
    pool = get_pool()
    async with pool.acquire() as conn:
        one = await conn.fetchval("SELECT 1")
    return {"db": "ok" if one == 1 else "err"}
