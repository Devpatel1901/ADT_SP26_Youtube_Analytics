from __future__ import annotations

from datetime import date, datetime, timezone

import asyncpg
import httpx
import pytest_asyncio

from app.core.config import settings
from app.db import pool as pool_module
from app.main import app


@pytest_asyncio.fixture(scope="session", autouse=True, loop_scope="session")
async def _init_pool():
    await pool_module.init_pool(settings.TEST_DATABASE_URL)
    yield
    await pool_module.close_pool()


@pytest_asyncio.fixture(autouse=True, loop_scope="session")
async def _truncate():
    pool = pool_module.get_pool()
    async with pool.acquire() as conn:
        await conn.execute("TRUNCATE TABLE trending_videos RESTART IDENTITY")
    yield


@pytest_asyncio.fixture(loop_scope="session")
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture(loop_scope="session")
async def seeded():
    """Insert a small known dataset and return ids."""
    pool = pool_module.get_pool()
    rows = [
        ("v_music_a", date(2024, 11, 15), "Music A", "Music Channel", "ch_music",
         1000, 100, 1, 50, datetime(2024, 11, 14, 12, tzinfo=timezone.utc), 10, "music|a"),
        ("v_music_a", date(2024, 11, 16), "Music A", "Music Channel", "ch_music",
         2000, 200, 1, 60, datetime(2024, 11, 14, 12, tzinfo=timezone.utc), 10, "music|a"),
        ("v_game_b", date(2024, 11, 15), "Gaming B", "Play Channel", "ch_play",
         5000, 400, 5, 90, datetime(2024, 11, 14, 9, tzinfo=timezone.utc), 20, "gaming|b"),
        ("v_sci_c", date(2024, 11, 15), "Science C", "LabScope", "ch_sci",
         800, 80, 0, 30, datetime(2024, 11, 10, 18, tzinfo=timezone.utc), 28, "science|c"),
    ]
    async with pool.acquire() as conn:
        ids = []
        for r in rows:
            sid = await conn.fetchval(
                """
                INSERT INTO trending_videos (
                  video_id, trending_date, title, channel_title, channel_id,
                  views, likes, dislikes, comments, publish_time, category_id, tags
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                RETURNING snapshot_id
                """,
                *r,
            )
            ids.append(sid)
    return ids
