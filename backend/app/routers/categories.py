from __future__ import annotations

from fastapi import APIRouter, Depends

import asyncpg

from app.deps import get_conn
from app.schemas.category import CategoryOut

router = APIRouter()


@router.get("", response_model=list[CategoryOut])
async def list_categories(conn: asyncpg.Connection = Depends(get_conn)):
    rows = await conn.fetch(
        "SELECT id, name, created_at FROM youtube_categories ORDER BY id"
    )
    return [dict(r) for r in rows]
