import { useState } from 'react'
import Filters from '@/components/Filters'
import Pagination from '@/components/Pagination'
import VideoTable from '@/components/VideoTable'
import { useDeleteVideo, useVideoList } from '@/hooks/useVideos'
import type { VideoFilters } from '@/types/api'

export default function VideosPage() {
  const [filters, setFilters] = useState<VideoFilters>({ page: 1, page_size: 20, sort: 'trending_date_desc' })
  const { data, isLoading, isError, error, refetch } = useVideoList(filters)
  const del = useDeleteVideo()

  const handleDelete = async (id: number) => {
    if (!confirm('Soft-delete this video?')) return
    try {
      await del.mutateAsync(id)
    } catch (e) {
      alert('Delete failed: ' + (e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Videos</h1>
      <Filters value={filters} onChange={setFilters} />

      {isLoading && <div className="text-muted-foreground">Loading...</div>}
      {isError && (
        <div className="text-destructive">
          Error: {(error as Error).message} <button onClick={() => refetch()} className="underline">retry</button>
        </div>
      )}
      {data && (
        <>
          <div className="rounded-md border">
            <VideoTable rows={data.items} onDelete={handleDelete} />
          </div>
          <Pagination
            total={data.total}
            page={data.page}
            pageSize={data.page_size}
            onChange={p => setFilters({ ...filters, page: p })}
          />
        </>
      )}
    </div>
  )
}
