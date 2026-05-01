import { useQuery } from '@tanstack/react-query'
import { Analytics } from '@/api/endpoints'

const STALE = 60 * 1000

export const useTopChannels = (limit = 10) =>
  useQuery({ queryKey: ['analytics', 'top-channels', limit], queryFn: () => Analytics.topChannels(limit), staleTime: STALE })

export const useCategoryDistribution = () =>
  useQuery({ queryKey: ['analytics', 'category-distribution'], queryFn: Analytics.categoryDistribution, staleTime: STALE })

export const useTrendOverTime = (params?: { date_from?: string; date_to?: string }) =>
  useQuery({ queryKey: ['analytics', 'trend-over-time', params], queryFn: () => Analytics.trendOverTime(params), staleTime: STALE })

export const useTopVideos = (limit = 5) =>
  useQuery({ queryKey: ['analytics', 'top-videos', limit], queryFn: () => Analytics.topVideos(limit), staleTime: STALE })

export const useEngagement = (limit = 20) =>
  useQuery({ queryKey: ['analytics', 'engagement', limit], queryFn: () => Analytics.engagement(limit), staleTime: STALE })
