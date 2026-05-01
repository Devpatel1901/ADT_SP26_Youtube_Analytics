export interface Category {
  id: number
  name: string
  created_at: string
}

export interface Video {
  snapshot_id: number
  video_id: string
  trending_date: string
  title: string
  channel_title: string
  channel_id: string
  views: number
  likes: number
  dislikes: number
  comments: number
  publish_time: string
  category_id: number
  category_name?: string | null
  tags: string
  description?: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface VideoList {
  items: Video[]
  total: number
  page: number
  page_size: number
}

export interface VideoCreate {
  video_id: string
  trending_date: string
  title: string
  channel_title: string
  channel_id: string
  views: number
  likes: number
  dislikes: number
  comments: number
  publish_time: string
  category_id: number
  tags: string
  description?: string | null
}

export type VideoUpdate = Partial<Omit<VideoCreate, 'video_id' | 'trending_date'>>

export interface VideoFilters {
  category_id?: number
  channel_title?: string
  q?: string
  date_from?: string
  date_to?: string
  sort?: 'views_desc' | 'views_asc' | 'trending_date_desc' | 'trending_date_asc' | 'likes_desc'
  page?: number
  page_size?: number
}

export interface TopChannel {
  channel_title: string
  snapshot_count: number
  total_views: number
  avg_likes: string | null
}
export interface CategoryDistribution {
  category_name: string
  video_snapshots: number
  total_views: number
  avg_comments: string | null
}
export interface TrendPoint {
  trending_date: string
  snapshot_count: number
  daily_views: number
  daily_likes: number
}
export interface TopVideo {
  video_id: string
  title: string
  channel_title: string
  category_name: string
  views: number
  likes: number
  comments: number
}
export interface EngagementRow {
  snapshot_id: number
  video_id: string
  trending_date: string
  title: string
  views: number
  likes: number
  comments: number
  engagement_rate_pct: string | null
}
