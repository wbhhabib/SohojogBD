
'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import MonthlyGrowthChart from '@/components/charts/MonthlyGrowthChart'
import DonationTrendChart from '@/components/charts/DonationTrendChart'
import TopCampaignsChart from '@/components/charts/TopCampaignsChart'
import TopCategoriesChart from '@/components/charts/TopCategoriesChart'
import { api } from '@/lib/api'
import type { Campaign } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import { TrendingUp, BarChart2, Users, Layers, Loader2 } from 'lucide-react'
import ErrorBoundary from '@/components/common/ErrorBoundary'

type DateRange = '7d' | '30d' | '90d' | '1y'

const DATE_RANGE_OPTIONS: { key: DateRange; label: string; days: string }[] = [
  { key: '7d',  label: 'Last 7 days',  days: '7'   },
  { key: '30d', label: 'Last 30 days', days: '30'  },
  { key: '90d', label: 'Last 90 days', days: '90'  },
  { key: '1y',  label: '1 year',       days: '365' },
]

interface PlatformStats {
  users: { total: number; creators: number; donors: number }
  campaigns: { total: number; active: number; completed: number }
  donations: { total: number; totalAmountRaised: number; thisMonth: { count: number; amount: number } }
  topCategories: { category: string; totalRaised: number }[]
}

interface TrendPoint {
  label: string
  donations: number
  amount: number
}

interface StatCardProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  iconBg: string
  trend?: 'up' | 'neutral'
  loading?: boolean
}

function StatCard({ label, value, sub, icon, iconBg, trend = 'up', loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`${iconBg} p-3 rounded-xl shrink-0`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
        )}
        <p className={`text-xs mt-0.5 font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}>
          {sub}
        </p>
      </div>
    </div>
  )
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full animate-pulse bg-gray-50 rounded-lg flex items-center justify-center" style={{ height }}>
      <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange>('30d')
  const [stats,        setStats]        = useState<PlatformStats | null>(null)
  const [trendData,    setTrendData]    = useState<TrendPoint[]>([])
  const [topCampaigns, setTopCampaigns] = useState<{ name: string; raised: number }[]>([])
  const [statsLoading,     setStatsLoading]     = useState(true)
  const [trendLoading,     setTrendLoading]     = useState(true)
  const [campaignsLoading, setCampaignsLoading] = useState(true)

  useEffect(() => {
    setStatsLoading(true)
    api.get<PlatformStats>('/analytics/platform')
      .then((res) => { if (res.success) setStats(res.data) })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  const fetchTrend = useCallback(() => {
    const opt = DATE_RANGE_OPTIONS.find((o) => o.key === range)!
    setTrendLoading(true)
    api.get<TrendPoint[]>(`/analytics/platform/trend?days=${opt.days}`)
      .then((res) => { if (res.success) setTrendData(res.data) })
      .catch(() => {})
      .finally(() => setTrendLoading(false))
  }, [range])

  useEffect(() => { fetchTrend() }, [fetchTrend])

  useEffect(() => {
    setCampaignsLoading(true)
    api.get<Campaign[]>('/campaigns/admin/all?limit=5&sort=raisedAmount')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map((c) => ({ name: c.title, raised: c.raisedAmount ?? 0 }))
          mapped.sort((a, b) => b.raised - a.raised)
          setTopCampaigns(mapped.slice(0, 5))
        }
      })
      .catch(() => {})
      .finally(() => setCampaignsLoading(false))
  }, [])

  const totalRaised     = stats?.donations.totalAmountRaised ?? 0
  const activeCampaigns = stats?.campaigns.active ?? 0
  const totalUsers      = stats?.users.total ?? 0
  const thisMonthAmt    = stats?.donations.thisMonth.amount ?? 0
  const prevMonthEst    = totalRaised > 0 ? totalRaised / 12 : 1
  const growthPct       = prevMonthEst > 0 ? (((thisMonthAmt - prevMonthEst) / prevMonthEst) * 100).toFixed(1) : '0.0'

  const topCategoriesData = (stats?.topCategories ?? []).map((c) => ({
    name: c.category, value: c.totalRaised, totalRaised: c.totalRaised,
  }))

  return (
    <ErrorBoundary>
      <DashboardLayout role="admin">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader title="Platform Analytics" description="Monitor platform-wide performance, growth, and donation trends." />
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start shrink-0">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => setRange(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${range === opt.key ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Raised" value={formatBDT(totalRaised)} sub="Across all campaigns" icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50" trend="up" loading={statsLoading} />
        <StatCard label="Monthly Growth" value={`${growthPct}%`} sub="vs monthly average" icon={<BarChart2 className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" trend="up" loading={statsLoading} />
        <StatCard label="Active Campaigns" value={activeCampaigns.toString()} sub="Currently running" icon={<Layers className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50" trend="neutral" loading={statsLoading} />
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} sub={`${stats?.users.creators ?? 0} creators · ${stats?.users.donors ?? 0} donors`} icon={<Users className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" trend="up" loading={statsLoading} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Growth</h3>
          {trendLoading ? <ChartSkeleton height={300} /> : <MonthlyGrowthChart data={trendData} />}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Donation Trend</h3>
          {trendLoading ? <ChartSkeleton height={300} /> : <DonationTrendChart data={trendData} />}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Campaigns</h3>
          {campaignsLoading ? <ChartSkeleton height={280} /> : <TopCampaignsChart data={topCampaigns} />}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Categories</h3>
          {statsLoading ? <ChartSkeleton height={300} /> : <TopCategoriesChart data={topCategoriesData} />}
        </div>
      </div>
    </DashboardLayout>
    </ErrorBoundary>
  )
}