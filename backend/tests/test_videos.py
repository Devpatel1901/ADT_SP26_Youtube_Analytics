import pytest


@pytest.mark.asyncio
async def test_list_empty(client):
    r = await client.get("/api/videos")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 0
    assert body["items"] == []


@pytest.mark.asyncio
async def test_list_with_seed(client, seeded):
    r = await client.get("/api/videos")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == len(seeded)
    titles = {i["title"] for i in body["items"]}
    assert titles == {"Music A", "Gaming B", "Science C"}


@pytest.mark.asyncio
async def test_filter_by_category(client, seeded):
    r = await client.get("/api/videos?category_id=10")
    body = r.json()
    assert all(i["category_id"] == 10 for i in body["items"])
    assert body["total"] == 2


@pytest.mark.asyncio
async def test_pagination(client, seeded):
    r = await client.get("/api/videos?page=1&page_size=2&sort=views_desc")
    body = r.json()
    assert len(body["items"]) == 2
    r2 = await client.get("/api/videos?page=2&page_size=2&sort=views_desc")
    body2 = r2.json()
    assert len(body2["items"]) == 2
    first_ids = {i["snapshot_id"] for i in body["items"]}
    second_ids = {i["snapshot_id"] for i in body2["items"]}
    assert first_ids.isdisjoint(second_ids)


@pytest.mark.asyncio
async def test_create_get_update_softdelete(client):
    payload = {
        "video_id": "t_create",
        "trending_date": "2024-12-10",
        "title": "Created",
        "channel_title": "Ch",
        "channel_id": "ch1",
        "views": 10, "likes": 1, "dislikes": 0, "comments": 0,
        "publish_time": "2024-12-09T00:00:00Z",
        "category_id": 10,
        "tags": "[none]",
    }
    r = await client.post("/api/videos", json=payload)
    assert r.status_code == 201, r.text
    sid = r.json()["snapshot_id"]

    rg = await client.get(f"/api/videos/{sid}")
    assert rg.status_code == 200
    assert rg.json()["title"] == "Created"

    rp = await client.patch(f"/api/videos/{sid}", json={"title": "Edited"})
    assert rp.status_code == 200
    assert rp.json()["title"] == "Edited"

    rd = await client.delete(f"/api/videos/{sid}")
    assert rd.status_code == 204

    rl = await client.get("/api/videos")
    assert sid not in [i["snapshot_id"] for i in rl.json()["items"]]

    rg2 = await client.get(f"/api/videos/{sid}")
    assert rg2.status_code == 200
    assert rg2.json()["is_deleted"] is True


@pytest.mark.asyncio
async def test_create_publish_after_trending_rejected(client):
    payload = {
        "video_id": "bad_temp",
        "trending_date": "2024-12-01",
        "title": "Bad",
        "channel_title": "Ch",
        "channel_id": "ch1",
        "views": 10, "likes": 1, "dislikes": 0, "comments": 0,
        "publish_time": "2024-12-05T00:00:00Z",
        "category_id": 10,
        "tags": "x",
    }
    r = await client.post("/api/videos", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_duplicate_rejected(client, seeded):
    payload = {
        "video_id": "v_music_a",
        "trending_date": "2024-11-15",
        "title": "Dup",
        "channel_title": "Ch",
        "channel_id": "ch1",
        "views": 1, "likes": 0, "dislikes": 0, "comments": 0,
        "publish_time": "2024-11-14T00:00:00Z",
        "category_id": 10,
        "tags": "x",
    }
    r = await client.post("/api/videos", json=payload)
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_double_delete_rejected(client, seeded):
    sid = seeded[0]
    r1 = await client.delete(f"/api/videos/{sid}")
    assert r1.status_code == 204
    r2 = await client.delete(f"/api/videos/{sid}")
    assert r2.status_code == 404
