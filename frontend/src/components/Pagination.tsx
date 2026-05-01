import { Button } from '@/components/ui/button'

interface Props {
  total: number
  page: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ total, page, pageSize, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const prev = () => page > 1 && onChange(page - 1)
  const next = () => page < totalPages && onChange(page + 1)
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {total === 0 ? '0 results' : `Page ${page} of ${totalPages} · ${total} total`}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={prev}>Prev</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={next}>Next</Button>
      </div>
    </div>
  )
}
