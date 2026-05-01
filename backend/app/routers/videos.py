from __future__ import annotations

from datetime import date
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.deps import get_conn
from app.schemas.video import VideoCreate, VideoList, VideoOut, VideoUpdate

router = APIRouter()

SORT_MAP = {
    "views_desc": "tv.views DESC",
    "views_asc": "tv.views ASC",
    "trending_date_desc": "tv.trending_date DESC, tv.views DESC",
    "trending_date_asc": "tv.trending_date ASC, tv.views DESC",
    "likes_desc": "tv.likes DESC",
}

SELECT_COLS = """
    tv.snapshot_id, tv.video_id, tv.trending_date, tv.title, tv.channel_title,
    tv.channel_id, tv.views, tv.likes, tv.dislikes, tv.comments, tv.publish_time,
    tv.category_id, yc.name AS category_name, tv.tags, tv.description,
    tv.is_deleted, tv.created_at, tv.updated_at
"""


@router.get("", response_model=VideoList)
async def list_videos(
    category_id: Optional[int] = None,
    channel_title: Optional[str] = None,
    q: Optional[str] = Query(None, description="Title substring search"),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    sort: str = Query("trending_date_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    conn: asyncpg.Connection = Depends(get_conn),
):
    if sort not in SORT_MAP:
        raise HTTPException(status_code=400, detail=f"sort must be one of {sorted(SORT_MAP)}")
    order_by = SORT_MAP[sort]

    where = ["tv.is_deleted = FALSE"]
    args: list = []
    i = 0

    def add(cond: str, val):
        nonlocal i
        i += 1
        where.append(cond.replace("$?", f"${i}"))
        args.append(val)

    if category_id is not None:
        add("tv.category_id = $?", category_id)
    if channel_title:
        add("tv.channel_title ILIKE $?", f"%{channel_title}%")
    if q:
        add("tv.title ILIKE $?", f"%{q}%")
    if date_from is not None:
        add("tv.trending_date >= $?", date_from)
    if date_to is not None:
        add("tv.trending_date <= $?", date_to)

    where_sql = " AND ".join(where)
    base_from = "FROM trending_videos tv JOIN youtube_categories yc ON tv.category_id = yc.id"

    count_sql = f"SELECT COUNT(*) {base_from} WHERE {where_sql}"
    total = await conn.fetchval(count_sql, *args)

    offset = (page - 1) * page_size
    list_sql = (
        f"SELECT {SELECT_COLS} {base_from} WHERE {where_sql} "
        f"ORDER BY {order_by} LIMIT ${i+1} OFFSET ${i+2}"
    )
    rows = await conn.fetch(list_sql, *args, page_size, offset)
    return {"items": [dict(r) for r in rows], "total": total, "page": page, "page_size": page_size}


@router.get("/{snapshot_id}", response_model=VideoOut)
async def get_video(snapshot_id: int, conn: asyncpg.Connection = Depends(get_conn)):
    sql = (
        f"SELECT {SELECT_COLS} FROM trending_videos tv "
        "JOIN youtube_categories yc ON tv.category_id = yc.id "
        "WHERE tv.snapshot_id = $1"
    )
    row = await conn.fetchrow(sql, snapshot_id)
    if row is None:
        raise HTTPException(status_code=404, detail="video not found")
    return dict(row)


@router.post("", response_model=VideoOut, status_code=status.HTTP_201_CREATED)
async def create_video(payload: VideoCreate, conn: asyncpg.Connection = Depends(get_conn)):
    insert_sql = """
    INSERT INTO trending_videos (
        video_id, trending_date, title, channel_title, channel_id,
        views, likes, dislikes, comments, publish_time,
        category_id, tags, description
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING snapshot_id
    """
    try:
        new_id = await conn.fetchval(
            insert_sql,
            payload.video_id, payload.trending_date, payload.title, payload.channel_title,
            payload.channel_id, payload.views, payload.likes, payload.dislikes, payload.comments,
            payload.publish_time, payload.category_id, payload.tags, payload.description,
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail="video_id + trending_date already exists")
    except asyncpg.ForeignKeyViolationError:
        raise HTTPException(status_code=400, detail="category_id does not exist")
    except asyncpg.CheckViolationError as e:
        raise HTTPException(status_code=400, detail=f"check constraint violated: {e}")
    return await get_video(new_id, conn)


@router.patch("/{snapshot_id}", response_model=VideoOut)
async def update_video(
    snapshot_id: int,
    payload: VideoUpdate,
    conn: asyncpg.Connection = Depends(get_conn),
):
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="no fields to update")
    sets: list[str] = []
    args: list = []
    for idx, (col, val) in enumerate(data.items(), start=1):
        sets.append(f"{col} = ${idx}")
        args.append(val)
    args.append(snapshot_id)
    sql = (
        f"UPDATE trending_videos SET {', '.join(sets)} "
        f"WHERE snapshot_id = ${len(args)} AND is_deleted = FALSE RETURNING snapshot_id"
    )
    try:
        updated = await conn.fetchval(sql, *args)
    except asyncpg.ForeignKeyViolationError:
        raise HTTPException(status_code=400, detail="category_id does not exist")
    except asyncpg.CheckViolationError as e:
        raise HTTPException(status_code=400, detail=f"check constraint violated: {e}")
    if updated is None:
        raise HTTPException(status_code=404, detail="video not found or already deleted")
    return await get_video(updated, conn)


@router.delete("/{snapshot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def soft_delete_video(snapshot_id: int, conn: asyncpg.Connection = Depends(get_conn)):
    sql = (
        "UPDATE trending_videos SET is_deleted = TRUE "
        "WHERE snapshot_id = $1 AND is_deleted = FALSE RETURNING snapshot_id"
    )
    deleted = await conn.fetchval(sql, snapshot_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="video not found or already deleted")
    return None
