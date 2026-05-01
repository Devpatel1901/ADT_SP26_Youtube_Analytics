from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class TopChannel(BaseModel):
    channel_title: str
    snapshot_count: int
    total_views: int
    avg_likes: Optional[Decimal] = None


class CategoryDistribution(BaseModel):
    category_name: str
    video_snapshots: int
    total_views: int
    avg_comments: Optional[Decimal] = None


class TrendPoint(BaseModel):
    trending_date: date
    snapshot_count: int
    daily_views: int
    daily_likes: int


class TopVideo(BaseModel):
    video_id: str
    title: str
    channel_title: str
    category_name: str
    views: int
    likes: int
    comments: int


class EngagementRow(BaseModel):
    snapshot_id: int
    video_id: str
    trending_date: date
    title: str
    views: int
    likes: int
    comments: int
    engagement_rate_pct: Optional[Decimal] = None
