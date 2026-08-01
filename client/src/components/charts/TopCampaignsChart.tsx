
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatBDT } from '@/lib/utils'

interface CampaignDataPoint {
  name: string
  raised: number
}

interface CampaignSummary {
  title: string
  raisedAmount: number
}

interface TopCampaignsChartProps {
  data?: CampaignDataPoint[]
  campaigns?: CampaignSummary[]
}

function truncate(str: string, max = 20) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="text-slate-600 mb-0.5 max-w-[160px] leading-snug">{payload[0].payload.name}</p>
        <p className="font-semibold text-emerald-600">{formatBDT(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function TopCampaignsChart({ data, campaigns = [] }: TopCampaignsChartProps) {
  const chartData =
    data ?? campaigns.map((campaign) => ({
      name: campaign.title,
      raised: campaign.raisedAmount,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-slate-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatBDT(v)}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickFormatter={(v) => truncate(v)}
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
        <Bar dataKey="raised" fill="#059669" radius={[0, 4, 4, 0]} barSize={22}>
          {chartData.map((_, i) => (
            <Cell key={i} fill="#059669" fillOpacity={1 - i * 0.12} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
