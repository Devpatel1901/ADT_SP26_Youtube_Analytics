import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import type { VideoFilters } from '@/types/api'

interface Props {
  value: VideoFilters
  onChange: (next: VideoFilters) => void
}

export default function Filters({ value, onChange }: Props) {
  const { data: categories = [] } = useCategories()
  const set = (patch: Partial<VideoFilters>) => onChange({ ...value, ...patch, page: 1 })

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Title contains</label>
        <Input
          className="w-56"
          placeholder="Search title..."
          value={value.q ?? ''}
          onChange={e => set({ q: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Channel contains</label>
        <Input
          className="w-48"
          placeholder="Channel..."
          value={value.channel_title ?? ''}
          onChange={e => set({ channel_title: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Category</label>
        <Select
          value={value.category_id ? String(value.category_id) : 'all'}
          onValueChange={v => set({ category_id: v === 'all' ? undefined : Number(v) })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Date from</label>
        <Input type="date" className="w-40" value={value.date_from ?? ''} onChange={e => set({ date_from: e.target.value || undefined })} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Date to</label>
        <Input type="date" className="w-40" value={value.date_to ?? ''} onChange={e => set({ date_to: e.target.value || undefined })} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Sort</label>
        <Select value={value.sort ?? 'trending_date_desc'} onValueChange={v => set({ sort: v as VideoFilters['sort'] })}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending_date_desc">Newest trending</SelectItem>
            <SelectItem value="trending_date_asc">Oldest trending</SelectItem>
            <SelectItem value="views_desc">Most views</SelectItem>
            <SelectItem value="views_asc">Fewest views</SelectItem>
            <SelectItem value="likes_desc">Most likes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={() => onChange({ page: 1, page_size: value.page_size ?? 20, sort: 'trending_date_desc' })}>
        Reset
      </Button>
    </div>
  )
}
