
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatBDT } from '@/lib/utils'

interface TrendPoint {
  label: string
  amount: number
  donations: number
}

interface DonationTrendChartProps {
  data?: TrendPoint[]
  donations?: TrendPoint[]
  days?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="text-slate-500 mb-0.5">{label}</p>
        <p className="font-semibold text-emerald-600">{formatBDT(payload[0].value)}</p>
        <p className="text-xs text-slate-400">{payload[0].payload.donations} donations</p>
      </div>
    )
  }
  return null
}

export default function DonationTrendChart({ data, donations = [] }: DonationTrendChartProps) {
  const sourceData = data ?? donations
  const chartData = sourceData.map((d) => ({ date: d.label, amount: d.amount, donations: d.donations }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-slate-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          interval={Math.floor(chartData.length / 6)}
        />
        <YAxis
          tickFormatter={(v) => formatBDT(v)}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#059669"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#059669', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
