
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Target, Users, FileText, BarChart2,
  Plus, Pencil, ArrowUpRight, Megaphone, Sparkles, Heart,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import ProgressBar from '@/components/campaign/ProgressBar'
import { api } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import ErrorBoundary from '@/components/common/ErrorBoundary'


const statusColors: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  DRAFT:     'bg-stone-100 text-stone-600 border border-stone-200',
  PAUSED:    'bg-amber-100 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border border-blue-200',
  SUSPENDED: 'bg-red-100 text-red-700 border border-red-200',
}

const donationStatusColors: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  PENDING:   'bg-amber-100 text-amber-700 border border-amber-200',
  REFUNDED:  'bg-red-100 text-red-700 border border-red-200',
}

export default function CreatorDashboardPage() {
  const [statsData,       setStatsData]       = useState<any>(null)
  const [myCampaigns,     setMyCampaigns]     = useState<any[]>([])
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [isLoading,       setIsLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<any>('/analytics/creator'),
      api.get<any>('/campaigns/my?limit=5'),
      api.get<any>('/donations/creator?limit=5'),
    ]).then(([statsRes, campaignsRes, donationsRes]) => {
      if (statsRes.success)     setStatsData(statsRes.data)
      if (campaignsRes.success) setMyCampaigns(campaignsRes.data)
      if (donationsRes.success) setRecentDonations(donationsRes.data)
    }).catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Total Raised',
      value: statsData ? formatBDT(statsData.totalRaised) : '—',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500',
      cardBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
      border: 'border-emerald-100',
      valueColor: 'text-emerald-700',
      subText: 'All time earnings',
    },
    {
      label: 'Active Campaigns',
      value: statsData?.activeCampaigns ?? '—',
      icon: Target,
      iconBg: 'bg-blue-500',
      cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      border: 'border-blue-100',
      valueColor: 'text-blue-700',
      subText: 'Currently running',
    },
    {
      label: 'Total Donors',
      value: statsData?.totalDonors ?? '—',
      icon: Users,
      iconBg: 'bg-violet-500',
      cardBg: 'bg-gradient-to-br from-violet-50 to-violet-100/50',
      border: 'border-violet-100',
      valueColor: 'text-violet-700',
      subText: 'Unique supporters',
    },
    {
      label: 'Draft Campaigns',
      value: statsData?.draftCampaigns ?? '—',
      icon: FileText,
      iconBg: 'bg-amber-500',
      cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
      border: 'border-amber-100',
      valueColor: 'text-amber-700',
      subText: 'Ready to publish',
    },
  ]

  return (
    <ErrorBoundary>
    <DashboardLayout role="creator">
<div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={15} className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Creator Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">My Overview</h1>
          <p className="text-sm text-stone-500 mt-0.5">Track your campaigns and inspire more donors.</p>
        </div>
        <Link
          href="/creator/campaigns/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border ${stat.border} ${stat.cardBg} p-5 transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className={`text-2xl font-extrabold ${stat.valueColor} leading-none mb-1`}>
              {isLoading ? (
                <span className="inline-block w-16 h-6 bg-white/60 rounded-lg animate-pulse" />
              ) : stat.value}
            </p>
            <p className="text-sm font-semibold text-stone-700">{stat.label}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{stat.subText}</p>
          </div>
        ))}
      </div>
<div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Heart size={12} className="text-emerald-600 fill-emerald-200" />
              </div>
              <h2 className="text-sm font-semibold text-stone-800">Recent Donations</h2>
            </div>
            <Link
              href="/creator/donations"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {recentDonations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2">
                <Heart size={18} className="text-stone-300" />
              </div>
              <p className="text-sm text-stone-400 font-medium">No donations yet</p>
              <p className="text-xs text-stone-300 mt-1">Share your campaign to start receiving support</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-50">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Donor</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Campaign</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50/60 transition-colors border-b border-stone-50 last:border-0">
                      <td className="px-5 py-3.5 font-semibold text-stone-800 text-sm">
                        {d.isAnonymous ? (
                          <span className="text-stone-400 italic font-medium text-xs">Anonymous</span>
                        ) : (
                          d.donor?.name ?? '—'
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600">{formatBDT(d.amount)}</td>
                      <td className="px-5 py-3.5 text-stone-500 hidden md:table-cell max-w-[140px] truncate text-xs">
                        {d.campaign?.title ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 hidden lg:table-cell text-xs whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${donationStatusColors[d.status] ?? 'bg-stone-100 text-stone-600'}`}>
                          {d.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target size={12} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-stone-800">My Campaigns</h2>
            </div>
            <Link
              href="/creator/campaigns"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {myCampaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2">
                <Target size={18} className="text-stone-300" />
              </div>
              <p className="text-sm text-stone-400 font-medium">No campaigns yet</p>
              <Link href="/creator/campaigns/create" className="text-xs text-emerald-500 hover:underline font-medium mt-1 inline-block">
                Create your first campaign →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-stone-50">
              {myCampaigns.map((c) => {
                const pct = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
                return (
                  <li key={c.id} className="px-5 py-4 hover:bg-stone-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate leading-tight">{c.title}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                          <span className="text-emerald-600 font-semibold">{formatBDT(c.raisedAmount)}</span>
                          {' '}<span className="text-stone-300">of</span>{' '}
                          {formatBDT(c.goalAmount)}
                          <span className="ml-2 text-stone-400">· {pct}%</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColors[c.status] ?? 'bg-stone-100 text-stone-600'}`}>
                          {c.status.toLowerCase()}
                        </span>
                        <Link
                          href={`/creator/campaigns/${c.id}/edit`}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit campaign"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
<div className="relative w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-stone-800">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/creator/analytics"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            View Analytics
          </Link>
          <Link
            href="/creator/campaigns/create"
            className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
          <Link
            href="/creator/donations"
            className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            All Donations
          </Link>
        </div>
      </div>
    </DashboardLayout>
    </ErrorBoundary>
  )
}