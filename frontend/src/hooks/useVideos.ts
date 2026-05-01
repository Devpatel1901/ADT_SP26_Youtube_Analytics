import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Videos } from '@/api/endpoints'
import type { VideoCreate, VideoFilters, VideoUpdate } from '@/types/api'

export function useVideoList(filters: VideoFilters) {
  return useQuery({
    queryKey: ['videos', filters],
    queryFn: () => Videos.list(filters),
    staleTime: 10 * 1000,
  })
}

export function useVideo(id: number | undefined) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => Videos.get(id as number),
    enabled: id !== undefined,
  })
}

export function useCreateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: VideoCreate) => Videos.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useUpdateVideo(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: VideoUpdate) => Videos.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['video', id] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => Videos.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
