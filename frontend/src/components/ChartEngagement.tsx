import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTopVideos } from '@/hooks/useAnalytics'

export default function ChartEngagement() {
  const { data = [], isLoading } = useTopVideos(5)
  return (
    <Card>
      <CardHeader><CardTitle>Top 5 most-viewed active videos</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(v => (
                <TableRow key={v.video_id}>
                  <TableCell className="max-w-[260px] truncate" title={v.title}>{v.title}</TableCell>
                  <TableCell>{v.channel_title}</TableCell>
                  <TableCell>{v.category_name}</TableCell>
                  <TableCell className="text-right">{Number(v.views).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
