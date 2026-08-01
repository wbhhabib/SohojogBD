
'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import DonationTrendChart from '@/components/charts/DonationTrendChart'
import TopCampaignsChart from '@/components/charts/TopCampaignsChart'
import { api } from '@/lib/api'
import { formatBDT, timeAgo } from '@/lib/utils'
import { TrendingUp, Calendar, Trophy, BarChart2 } from 'lucide-react'

type DateRange = '7' | '30' | '90'

const DATE_RANGE_TABS: { label: string; value: DateRange }[] = [
  { label: 'Last 7 days',  value: '7'  },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
]

interface CreatorStats {
  campaigns: { total: number; active: number }
  totalRaised: number
  thisMonthRaised: number
  totalDonors: number
  topCampaign: {
    id: string
    title: string
    slug: string
    raisedAmount: number
    goalAmount: number
  } | null
}

interface TrendPoint {
  label: string
  donations: number
  amount: number
}

interface RecentDonation {
  id: string
  amount: number
  isAnonymous: boolean
  createdAt: string
  campaign: { id: string; title: string }
  donor: { id: string; name: string }
}

export default function CreatorAnalyticsPage() {
  const [dateRange, setDateRange]     = useState<DateRange>('30')
  const [stats, setStats]             = useState<CreatorStats | null>(null)
  const [trendData, setTrendData]     = useState<TrendPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentDonation[]>([])
  const [loading, setLoading]         = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, trendRes, activityRes] = await Promise.all([
        api.get<CreatorStats>('/analytics/creator'),
        api.get<TrendPoint[]>(`/analytics/creator/trend`),
        api.get<RecentDonation[]>('/donations/creator?limit=5&sort=newest'),
      ])

      if (statsRes.success)    setStats(statsRes.data)
      if (trendRes.success)    setTrendData(trendRes.data)
      if (activityRes.success) setRecentActivity(activityRes.data)
    } catch {

    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  const statCards = stats
    ? [
        {
          label: 'Total Raised',
          value: formatBDT(stats.totalRaised),
          icon: TrendingUp,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          sub: `${stats.totalDonors} total donors`,
        },
        {
          label: 'This Month',
          value: formatBDT(stats.thisMonthRaised),
          icon: Calendar,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          sub: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        },
        {
          label: 'Top Campaign',
          value: stats.topCampaign ? stats.topCampaign.title : '—',
          icon: Trophy,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          sub: stats.topCampaign ? formatBDT(stats.topCampaign.raisedAmount) : 'No campaigns',
          truncate: true,
        },
        {
          label: 'Active Campaigns',
          value: stats.campaigns.active.toString(),
          icon: BarChart2,
          color: 'text-violet-600',
          bg: 'bg-violet-50',
          sub: `${stats.campaigns.total} total campaigns`,
        },
      ]
    : []

  return (
    <DashboardLayout role="creator">
      <PageHeader title="Analytics" />
<div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {DATE_RANGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setDateRange(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              dateRange === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
{loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded flex-1 mt-3" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
              <p className={`text-xl font-bold text-slate-900 ${stat.truncate ? 'truncate' : ''}`} title={stat.truncate ? stat.value : undefined}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 mt-1 truncate">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Donation Trend</h2>
          <DonationTrendChart donations={trendData} days={parseInt(dateRange)} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top Campaigns</h2>
          <TopCampaignsChart campaigns={stats ? (stats.topCampaign ? [stats.topCampaign] : []) : []} />
        </div>
      </div>
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-100 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentActivity.map((d) => (
              <li key={d.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-emerald-700">
                    {d.isAnonymous ? '?' : d.donor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {d.isAnonymous ? 'Anonymous' : d.donor.name}
                    <span className="font-normal text-slate-500"> donated </span>
                    <span className="text-emerald-600 font-semibold">{formatBDT(d.amount)}</span>
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{d.campaign.title}</p>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                  {timeAgo(d.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}