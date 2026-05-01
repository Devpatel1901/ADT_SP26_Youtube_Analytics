import { useNavigate, useParams } from 'react-router-dom'
import VideoForm from '@/components/VideoForm'
import { useUpdateVideo, useVideo } from '@/hooks/useVideos'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const sid = id ? Number(id) : undefined
  const { data, isLoading, isError, error } = useVideo(sid)
  const update = useUpdateVideo(sid as number)
  const nav = useNavigate()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div className="text-destructive">Error: {(error as Error).message}</div>
  if (!data) return null

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit video #{data.snapshot_id}</h1>
      {data.is_deleted && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          This row is soft-deleted. Updates will be rejected by the API.
        </div>
      )}
      <VideoForm
        initial={data}
        submitLabel="Save"
        disableKeys
        onSubmit={async body => {
          const { video_id: _vi, trending_date: _td, ...rest } = body
          try {
            await update.mutateAsync(rest)
            nav('/videos')
          } catch (e: any) {
            const msg = e?.response?.data?.detail || e?.message || 'Failed'
            alert(`Update failed: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`)
          }
        }}
      />
    </div>
  )
}
