import ChartTopChannels from '@/components/ChartTopChannels'
import ChartCategoryPie from '@/components/ChartCategoryPie'
import ChartTrendLine from '@/components/ChartTrendLine'
import ChartEngagement from '@/components/ChartEngagement'

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartTopChannels />
        <ChartCategoryPie />
        <ChartTrendLine />
        <ChartEngagement />
      </div>
    </div>
  )
}
