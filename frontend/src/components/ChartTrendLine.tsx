import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrendOverTime } from '@/hooks/useAnalytics'

export default function ChartTrendLine() {
  const { data = [], isLoading } = useTrendOverTime()
  const rows = data.map(d => ({ ...d, daily_views: Number(d.daily_views), daily_likes: Number(d.daily_likes) }))
  return (
    <Card>
      <CardHeader><CardTitle>Daily views & likes</CardTitle></CardHeader>
      <CardContent className="h-72">
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trending_date" fontSize={11} />
              <YAxis tickFormatter={n => Intl.NumberFormat('en', { notation: 'compact' }).format(n as number)} fontSize={11} />
              <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="daily_views" stroke="#2563eb" dot={false} />
              <Line type="monotone" dataKey="daily_likes" stroke="#16a34a" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
