import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Video } from '@/types/api'

interface Props {
  rows: Video[]
  onDelete: (id: number) => void
}

const fmt = (n: number) => n.toLocaleString()

export default function VideoTable({ rows, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Trending</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right">Likes</TableHead>
          <TableHead className="text-right">Comments</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">No results</TableCell>
          </TableRow>
        )}
        {rows.map(v => (
          <TableRow key={v.snapshot_id}>
            <TableCell className="max-w-[280px] truncate font-medium" title={v.title}>{v.title}</TableCell>
            <TableCell className="max-w-[160px] truncate" title={v.channel_title}>{v.channel_title}</TableCell>
            <TableCell>{v.category_name ?? v.category_id}</TableCell>
            <TableCell>{v.trending_date}</TableCell>
            <TableCell className="text-right">{fmt(v.views)}</TableCell>
            <TableCell className="text-right">{fmt(v.likes)}</TableCell>
            <TableCell className="text-right">{fmt(v.comments)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Link to={`/videos/${v.snapshot_id}`}>
                <Button size="sm" variant="outline">Edit</Button>
              </Link>
              <Button size="sm" variant="destructive" onClick={() => onDelete(v.snapshot_id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
