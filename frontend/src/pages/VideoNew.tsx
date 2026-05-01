import { useNavigate } from 'react-router-dom'
import VideoForm from '@/components/VideoForm'
import { useCreateVideo } from '@/hooks/useVideos'

export default function VideoNew() {
  const create = useCreateVideo()
  const nav = useNavigate()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New trending video</h1>
      <VideoForm
        submitLabel="Create"
        onSubmit={async body => {
          try {
            const v = await create.mutateAsync(body)
            nav(`/videos/${v.snapshot_id}`)
          } catch (e: any) {
            const msg = e?.response?.data?.detail || e?.message || 'Failed'
            alert(`Create failed: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`)
          }
        }}
      />
    </div>
  )
}
