from __future__ import annotations

from datetime import date, datetime
from typing import Annotated, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

NonBlankStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
Tags = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class VideoBase(BaseModel):
    video_id: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=20)]
    trending_date: date
    title: NonBlankStr
    channel_title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
    channel_id: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    views: int = Field(ge=0, default=0)
    likes: int = Field(ge=0, default=0)
    dislikes: int = Field(ge=0, default=0)
    comments: int = Field(ge=0, default=0)
    publish_time: datetime
    category_id: int
    tags: Tags = "[none]"
    description: Optional[str] = None

    @model_validator(mode="after")
    def _publish_before_trending(self):
        if self.publish_time.date() > self.trending_date:
            raise ValueError("publish_time must be on or before trending_date")
        return self


class VideoCreate(VideoBase):
    pass


class VideoUpdate(BaseModel):
    title: Optional[NonBlankStr] = None
    channel_title: Optional[Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]] = None
    channel_id: Optional[Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]] = None
    views: Optional[int] = Field(default=None, ge=0)
    likes: Optional[int] = Field(default=None, ge=0)
    dislikes: Optional[int] = Field(default=None, ge=0)
    comments: Optional[int] = Field(default=None, ge=0)
    publish_time: Optional[datetime] = None
    category_id: Optional[int] = None
    tags: Optional[Tags] = None
    description: Optional[str] = None


class VideoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    snapshot_id: int
    video_id: str
    trending_date: date
    title: str
    channel_title: str
    channel_id: str
    views: int
    likes: int
    dislikes: int
    comments: int
    publish_time: datetime
    category_id: int
    category_name: Optional[str] = None
    tags: str
    description: Optional[str] = None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class VideoList(BaseModel):
    items: list[VideoOut]
    total: int
    page: int
    page_size: int
