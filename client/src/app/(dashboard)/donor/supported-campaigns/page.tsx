'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import ProgressBar from '@/components/campaign/ProgressBar'
import { api } from '@/lib/api'
import { formatBDT, getImageUrl } from '@/lib/utils'

type StatusFilter = 'all' | 'active' | 'completed'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Completed', value: 'completed' },
]

const statusColors: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  draft:     'bg-gray-100 text-gray-600',
  paused:    'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
}

const gradients = [
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-cyan-500',
  'from-rose-400 to-pink-500',
]

interface Campaign {
  id: string
  title: string
  slug: string
  category: string
  status: string
  images: string[]
  goalAmount: number
  raisedAmount: number
  donorCount: number
  deadline: string
}

export default function DonorSupportedCampaignsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [campaigns, setCampaigns]       = useState<Campaign[]>([])
  const [loading, setLoading]           = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Campaign[]>('/campaigns/supported?limit=500')
      if (res.success && Array.isArray(res.data)) {
        setCampaigns(res.data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered: Campaign[] =
    statusFilter === 'all'
      ? campaigns
      : campaigns.filter((c) => c.status.toLowerCase() === statusFilter)

  const tabCounts: Record<StatusFilter, number> = {
    all:       campaigns.length,
    active:    campaigns.filter((c) => c.status.toLowerCase() === 'active').length,
    completed: campaigns.filter((c) => c.status.toLowerCase() === 'completed').length,
  }

  return (
    <DashboardLayout role="donor">
      <PageHeader title="Supported Campaigns" />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${statusFilter === tab.value ? 'text-emerald-600' : 'text-slate-400'}`}>
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No campaigns found"
          description={
            statusFilter === 'all'
              ? "You haven't supported any campaigns yet."
              : `No ${statusFilter} campaigns in your supported list.`
          }
          actionLabel="Browse Campaigns"
          onAction={() => router.push('/campaigns')}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, idx) => {
            const pct = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
            const gradient = gradients[idx % gradients.length]
            const status = c.status.toLowerCase()

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative">
                  {c.images?.[0] ? (
                    <img
                      src={getImageUrl(c.images[0])}
                      alt={c.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className={`w-full h-40 bg-gradient-to-br ${gradient}`} />
                  )}
                  <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {status}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-slate-400 mb-1">{c.category}</p>
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-3 flex-1">
                    {c.title}
                  </h3>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="font-medium text-emerald-600">{formatBDT(c.raisedAmount)}</span>
                      <span>{pct}%</span>
                    </div>
                    <ProgressBar raised={c.raisedAmount} goal={c.goalAmount} />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>of {formatBDT(c.goalAmount)}</span>
                      <span>{c.donorCount} donors</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-slate-400">
                      Ends {new Date(c.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <Link
                      href={`/campaigns/${c.slug}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}