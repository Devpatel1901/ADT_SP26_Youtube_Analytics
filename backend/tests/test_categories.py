import pytest


@pytest.mark.asyncio
async def test_list_categories(client):
    r = await client.get("/api/categories")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 15
    ids = {c["id"] for c in data}
    for required in (1, 2, 10, 15, 17, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29):
        assert required in ids, f"missing category id {required}"
