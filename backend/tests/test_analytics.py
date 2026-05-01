import pytest


@pytest.mark.asyncio
async def test_top_channels(client, seeded):
    r = await client.get("/api/analytics/top-channels?limit=5")
    assert r.status_code == 200
    data = r.json()
    titles = [d["channel_title"] for d in data]
    assert titles[0] == "Play Channel"
    assert sum(d["snapshot_count"] for d in data) == len(seeded)


@pytest.mark.asyncio
async def test_category_distribution(client, seeded):
    r = await client.get("/api/analytics/category-distribution")
    data = r.json()
    names = {d["category_name"] for d in data}
    assert {"Music", "Gaming", "Science & Technology"} <= names


@pytest.mark.asyncio
async def test_trend_over_time(client, seeded):
    r = await client.get("/api/analytics/trend-over-time")
    data = r.json()
    assert {p["trending_date"] for p in data} == {"2024-11-15", "2024-11-16"}


@pytest.mark.asyncio
async def test_top_videos(client, seeded):
    r = await client.get("/api/analytics/top-videos?limit=2")
    data = r.json()
    assert data[0]["title"] == "Gaming B"
    assert len(data) == 2


@pytest.mark.asyncio
async def test_engagement(client, seeded):
    r = await client.get("/api/analytics/engagement?limit=10")
    data = r.json()
    assert len(data) == len(seeded)
    rates = [float(d["engagement_rate_pct"]) for d in data if d["engagement_rate_pct"] is not None]
    assert rates == sorted(rates, reverse=True)


@pytest.mark.asyncio
async def test_softdelete_excluded_from_analytics(client, seeded):
    sid = seeded[0]
    await client.delete(f"/api/videos/{sid}")
    r = await client.get("/api/analytics/category-distribution")
    cats = {d["category_name"]: d["video_snapshots"] for d in r.json()}
    assert cats.get("Music", 0) == 1
