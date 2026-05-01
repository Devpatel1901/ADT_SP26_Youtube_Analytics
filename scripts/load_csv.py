"""ETL: load US_Trending.csv into trending_videos.

Idempotent: ON CONFLICT (video_id, trending_date) DO NOTHING.
Run from project root:  python scripts/load_csv.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "US_Trending.csv"

DSN = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/yth_dev",
)

INSERT_SQL = """
INSERT INTO trending_videos (
    video_id, trending_date, title, channel_title, channel_id,
    views, likes, dislikes, comments, publish_time,
    category_id, tags, description
) VALUES %s
ON CONFLICT (video_id, trending_date) DO NOTHING
"""


def main() -> int:
    if not CSV_PATH.exists():
        print(f"CSV not found: {CSV_PATH}", file=sys.stderr)
        return 1

    print(f"Reading {CSV_PATH} ...")
    df = pd.read_csv(CSV_PATH, dtype={"video_id": str, "channel_id": str})
    total_in = len(df)
    print(f"  rows read: {total_in}")

    df["trending_date"] = pd.to_datetime(df["trending_date"], format="%y.%d.%m", errors="coerce")
    df["publish_time"] = pd.to_datetime(df["publish_time"], utc=True, errors="coerce")

    bad_dates = df["trending_date"].isna().sum() + df["publish_time"].isna().sum()
    if bad_dates:
        print(f"  dropping {bad_dates} rows with unparseable dates")
        df = df.dropna(subset=["trending_date", "publish_time"])

    second_token_max = pd.read_csv(CSV_PATH, usecols=["trending_date"], nrows=2000)["trending_date"]
    seconds = second_token_max.str.split(".", expand=True)[1].astype(int)
    if seconds.max() <= 12:
        print(
            "WARNING: in 2000-row sample, all DD tokens are <= 12. "
            "Cannot conclusively confirm DD-MM order. Proceeding anyway."
        )
    else:
        print(f"  date order confirmed: max DD token = {seconds.max()} (must be DD-MM)")

    bad_temporal = (df["publish_time"].dt.tz_convert(None).dt.normalize() > df["trending_date"]).sum()
    if bad_temporal:
        print(f"  dropping {bad_temporal} rows where publish_time > trending_date")
        df = df[df["publish_time"].dt.tz_convert(None).dt.normalize() <= df["trending_date"]]

    df["tags"] = df["tags"].fillna("").astype(str).str.strip()
    df.loc[df["tags"] == "", "tags"] = "[none]"
    df["description"] = df["description"].where(df["description"].notna(), None)

    for col in ("views", "likes", "dislikes", "comments", "category_id"):
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    print(f"Connecting to {DSN}")
    conn = psycopg2.connect(DSN)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM youtube_categories")
            valid_ids = {row[0] for row in cur.fetchall()}
            csv_ids = set(df["category_id"].unique().tolist())
            missing = csv_ids - valid_ids
            if missing:
                print(f"ERROR: CSV uses category_ids not in youtube_categories: {sorted(missing)}", file=sys.stderr)
                return 2
            print(f"  category_ids ok ({len(csv_ids)} distinct, all present)")

            cur.execute("SELECT COUNT(*) FROM trending_videos")
            before = cur.fetchone()[0]

            rows = [
                (
                    r.video_id,
                    r.trending_date.date(),
                    r.title if isinstance(r.title, str) and r.title.strip() else "(no title)",
                    r.channel_title if isinstance(r.channel_title, str) and r.channel_title.strip() else "(no channel)",
                    r.channel_id if isinstance(r.channel_id, str) and r.channel_id.strip() else "(no channel id)",
                    int(r.views),
                    int(r.likes),
                    int(r.dislikes),
                    int(r.comments),
                    r.publish_time.to_pydatetime(),
                    int(r.category_id),
                    r.tags if r.tags else "[none]",
                    r.description if isinstance(r.description, str) else None,
                )
                for r in df.itertuples(index=False)
            ]
            print(f"  inserting {len(rows)} rows in batches ...")
            execute_values(cur, INSERT_SQL, rows, page_size=1000)

            cur.execute("SELECT COUNT(*) FROM trending_videos")
            after = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    inserted = after - before
    skipped = len(rows) - inserted
    print(f"DONE: input={total_in} prepared={len(rows)} inserted={inserted} skipped(duplicates)={skipped} total_rows={after}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
