from __future__ import annotations

from datetime import date
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends, Query

from app.deps import get_conn
from app.schemas.analytics import (
    CategoryDistribution,
    EngagementRow,
    TopChannel,
    TopVideo,
    TrendPoint,
)

router = APIRouter()


@router.get("/top-channels", response_model=list[TopChannel])
async def top_channels(
    limit: int = Query(10, ge=1, le=50),
    conn: asyncpg.Connection = Depends(get_conn),
):
    rows = await conn.fetch(
        """
        SELECT
            channel_title,
            COUNT(*)::bigint AS snapshot_count,
            SUM(views)::bigint AS total_views,
            ROUND(AVG(likes)::NUMERIC, 2) AS avg_likes
        FROM trending_videos
        WHERE is_deleted = FALSE
        GROUP BY channel_title
        ORDER BY total_views DESC, snapshot_count DESC
        LIMIT $1
        """,
        limit,
    )
    return [dict(r) for r in rows]


@router.get("/category-distribution", response_model=list[CategoryDistribution])
async def category_distribution(conn: asyncpg.Connection = Depends(get_conn)):
    rows = await conn.fetch(
        """
        SELECT
            yc.name AS category_name,
            COUNT(*)::bigint AS video_snapshots,
            SUM(tv.views)::bigint AS total_views,
            ROUND(AVG(tv.comments)::NUMERIC, 2) AS avg_comments
        FROM trending_videos tv
        JOIN youtube_categories yc ON tv.category_id = yc.id
        WHERE tv.is_deleted = FALSE
        GROUP BY yc.name
        ORDER BY total_views DESC
        """,
    )
    return [dict(r) for r in rows]


@router.get("/trend-over-time", response_model=list[TrendPoint])
async def trend_over_time(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    conn: asyncpg.Connection = Depends(get_conn),
):
    where = ["is_deleted = FALSE"]
    args: list = []
    if date_from is not None:
        args.append(date_from)
        where.append(f"trending_date >= ${len(args)}")
    if date_to is not None:
        args.append(date_to)
        where.append(f"trending_date <= ${len(args)}")
    sql = f"""
        SELECT
            trending_date,
            COUNT(*)::bigint AS snapshot_count,
            SUM(views)::bigint AS daily_views,
            SUM(likes)::bigint AS daily_likes
        FROM trending_videos
        WHERE {' AND '.join(where)}
        GROUP BY trending_date
        ORDER BY trending_date
    """
    rows = await conn.fetch(sql, *args)
    return [dict(r) for r in rows]


@router.get("/top-videos", response_model=list[TopVideo])
async def top_videos(
    limit: int = Query(5, ge=1, le=50),
    conn: asyncpg.Connection = Depends(get_conn),
):
    rows = await conn.fetch(
        """
        SELECT
            tv.video_id,
            tv.title,
            tv.channel_title,
            yc.name AS category_name,
            tv.views,
            tv.likes,
            tv.comments
        FROM trending_videos tv
        JOIN youtube_categories yc ON tv.category_id = yc.id
        WHERE tv.is_deleted = FALSE
        ORDER BY tv.views DESC, tv.likes DESC
        LIMIT $1
        """,
        limit,
    )
    return [dict(r) for r in rows]


@router.get("/engagement", response_model=list[EngagementRow])
async def engagement(
    limit: int = Query(20, ge=1, le=100),
    conn: asyncpg.Connection = Depends(get_conn),
):
    rows = await conn.fetch(
        """
        SELECT
            snapshot_id,
            video_id,
            trending_date,
            title,
            views,
            likes,
            comments,
            ROUND(((likes + comments)::NUMERIC / NULLIF(views, 0)) * 100, 2) AS engagement_rate_pct
        FROM trending_videos
        WHERE is_deleted = FALSE
        ORDER BY engagement_rate_pct DESC NULLS LAST, views DESC
        LIMIT $1
        """,
        limit,
    )
    return [dict(r) for r in rows]
