"""Verification queries for trending_videos load.

Run from project root:  python scripts/verify_load.py
"""
from __future__ import annotations

import os
import sys

import psycopg2

DSN = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/yth_dev",
)

CHECKS = [
    (
        "row_counts",
        "SELECT COUNT(*) AS rows, COUNT(DISTINCT video_id) AS videos, COUNT(DISTINCT category_id) AS categories FROM trending_videos",
    ),
    (
        "constraints",
        "SELECT conname AS constraint_name, contype AS constraint_type "
        "FROM pg_constraint WHERE conrelid = 'trending_videos'::regclass ORDER BY conname",
    ),
    (
        "indexes",
        "SELECT indexname FROM pg_indexes WHERE tablename IN ('youtube_categories','trending_videos') ORDER BY tablename, indexname",
    ),
    (
        "fk_orphans",
        "SELECT COUNT(*) AS orphan_category_rows FROM trending_videos tv "
        "LEFT JOIN youtube_categories yc ON tv.category_id = yc.id WHERE yc.id IS NULL",
    ),
    (
        "soft_delete_distribution",
        "SELECT is_deleted, COUNT(*) FROM trending_videos GROUP BY is_deleted ORDER BY is_deleted",
    ),
    (
        "top_categories",
        "SELECT yc.name, COUNT(*) AS snapshots, SUM(views) AS total_views "
        "FROM trending_videos tv JOIN youtube_categories yc ON tv.category_id = yc.id "
        "WHERE tv.is_deleted = FALSE GROUP BY yc.name ORDER BY total_views DESC LIMIT 5",
    ),
]


def main() -> int:
    conn = psycopg2.connect(DSN)
    try:
        with conn.cursor() as cur:
            for name, sql in CHECKS:
                print(f"\n--- {name} ---")
                cur.execute(sql)
                cols = [d[0] for d in cur.description] if cur.description else []
                rows = cur.fetchall()
                if cols:
                    print(" | ".join(cols))
                for r in rows:
                    print(" | ".join(str(v) for v in r))
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
