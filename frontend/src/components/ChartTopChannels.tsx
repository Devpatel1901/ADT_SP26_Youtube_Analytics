import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTopChannels } from '@/hooks/useAnalytics'

export default function ChartTopChannels() {
  const { data = [], isLoading } = useTopChannels(10)
  const rows = data.map(d => ({ ...d, total_views: Number(d.total_views) }))
  return (
    <Card>
      <CardHeader><CardTitle>Top channels by total views</CardTitle></CardHeader>
      <CardContent className="h-72">
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: 8, right: 16, top: 8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel_title" angle={-30} textAnchor="end" interval={0} height={70} fontSize={11} />
              <YAxis tickFormatter={n => Intl.NumberFormat('en', { notation: 'compact' }).format(n as number)} fontSize={11} />
              <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
              <Bar dataKey="total_views" fill="hsl(222.2 47.4% 35%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
