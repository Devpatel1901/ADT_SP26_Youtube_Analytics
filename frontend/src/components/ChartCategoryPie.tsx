import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCategoryDistribution } from '@/hooks/useAnalytics'

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#9333ea', '#06b6d4', '#65a30d', '#ea580c', '#0ea5e9', '#a855f7', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16']

export default function ChartCategoryPie() {
  const { data = [], isLoading } = useCategoryDistribution()
  const rows = data.map(d => ({ name: d.category_name, value: Number(d.total_views) }))
  return (
    <Card>
      <CardHeader><CardTitle>Total views by category</CardTitle></CardHeader>
      <CardContent className="h-72">
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={false}>
                {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
