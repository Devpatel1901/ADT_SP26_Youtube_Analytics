# YouTube Trending Hub

Full-stack CRUD + analytics web app over the US YouTube trending dataset.

- **Database:** PostgreSQL 16 (Docker), schema in `youtube_trending_hub_database.sql`
- **Backend:** FastAPI + asyncpg (`backend/`)
- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn-style UI + Recharts (`frontend/`)
- **ETL:** `scripts/load_csv.py` loads `US_Trending.csv` (~16,400 rows)

## Quick start

Three terminals, in order.

### 1. Database

```bash
docker compose -f db/docker-compose.yml up -d
# Apply schema (with seed) to dev and test databases
docker exec -i yth_db_dev  psql -U postgres -d yth_dev  < youtube_trending_hub_database.sql
docker exec -i yth_db_test psql -U postgres -d yth_test < youtube_trending_hub_database.sql
# Load 16,400 rows into dev DB
source .venv/bin/activate
pip install pandas psycopg2-binary
python scripts/load_csv.py
python scripts/verify_load.py
```

### 2. Backend

```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
# tests
pytest
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install --cache /tmp/npm-cache-yth   # first time only; isolated cache avoids root-owned npm cache files
npm run dev
# tests
npx vitest run
```

App: http://localhost:5173

## End-to-end smoke checklist (used for the demo video)

1. Open `http://localhost:5173/` — the four dashboard charts render with non-empty data.
2. Click **Videos** — table populates, paginates, filters narrow results.
3. Click **New** — submit a valid row → 201 → row appears in the list.
4. Click **Edit** on that row, change the title, save — `updated_at` advances.
5. Click **Delete** — row disappears from the list; `is_deleted = TRUE` in psql; analytics totals shift accordingly.

## Architecture summary

- `youtube_categories` (lookup) and `trending_videos` (fact) with `UNIQUE(video_id, trending_date)`, FK to categories, soft-delete via `is_deleted`, `set_updated_at()` trigger, and 5 indexes.
- Backend uses raw SQL (asyncpg) so each endpoint maps directly to a query in the milestone-2 SQL file.
- Frontend uses TanStack Query for fetching, React Hook Form + zod for forms (mirroring backend Pydantic), and Recharts for the four dashboard charts.

## Endpoints

| Method | Path | Source SQL in `youtube_trending_hub_database.sql` |
| --- | --- | --- |
| GET | `/api/categories` | seed lookup |
| GET | `/api/videos` | READ 1 (line 207) + Query 5 (line 376) |
| GET | `/api/videos/{id}` | READ 1 with `WHERE snapshot_id = $1` |
| POST | `/api/videos` | CREATE (line 185) |
| PATCH | `/api/videos/{id}` | UPDATE 1/2 (lines 280, 289) |
| DELETE | `/api/videos/{id}` | soft delete (line 296) |
| GET | `/api/analytics/top-channels` | READ 3 (lines 240–250) |
| GET | `/api/analytics/category-distribution` | READ 4 (lines 254–264) |
| GET | `/api/analytics/trend-over-time` | READ 5 (lines 268–276) |
| GET | `/api/analytics/top-videos` | Query 1 (lines 318–331) |
| GET | `/api/analytics/engagement` | Query 2 (lines 335–345) |
| GET | `/healthz` | `SELECT 1` |

## Deployment

Local-only with a recorded demo video (proposal-sanctioned fallback). All three components run on the developer machine; Docker Compose handles Postgres.
