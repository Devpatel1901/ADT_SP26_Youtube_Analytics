import { api } from './client'
import type {
  Category,
  CategoryDistribution,
  EngagementRow,
  TopChannel,
  TopVideo,
  TrendPoint,
  Video,
  VideoCreate,
  VideoFilters,
  VideoList,
  VideoUpdate,
} from '@/types/api'

export const Categories = {
  list: () => api.get<Category[]>('/api/categories').then(r => r.data),
}

export const Videos = {
  list: (params: VideoFilters) =>
    api.get<VideoList>('/api/videos', { params }).then(r => r.data),
  get: (id: number) => api.get<Video>(`/api/videos/${id}`).then(r => r.data),
  create: (body: VideoCreate) =>
    api.post<Video>('/api/videos', body).then(r => r.data),
  update: (id: number, body: VideoUpdate) =>
    api.patch<Video>(`/api/videos/${id}`, body).then(r => r.data),
  remove: (id: number) => api.delete<void>(`/api/videos/${id}`),
}

export const Analytics = {
  topChannels: (limit = 10) =>
    api.get<TopChannel[]>('/api/analytics/top-channels', { params: { limit } }).then(r => r.data),
  categoryDistribution: () =>
    api.get<CategoryDistribution[]>('/api/analytics/category-distribution').then(r => r.data),
  trendOverTime: (params?: { date_from?: string; date_to?: string }) =>
    api.get<TrendPoint[]>('/api/analytics/trend-over-time', { params }).then(r => r.data),
  topVideos: (limit = 5) =>
    api.get<TopVideo[]>('/api/analytics/top-videos', { params: { limit } }).then(r => r.data),
  engagement: (limit = 20) =>
    api.get<EngagementRow[]>('/api/analytics/engagement', { params: { limit } }).then(r => r.data),
}
