
'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import DonationTrendChart from '@/components/charts/DonationTrendChart'
import Link from 'next/link'
import { Users, Target, Receipt, TrendingUp, ArrowUpRight, Crown, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const roleColors: Record<string, string> = {
  ADMIN:   'bg-rose-100 text-rose-700 border border-rose-200',
  CREATOR: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  DONOR:   'bg-blue-100 text-blue-700 border border-blue-200',
}

const statusColors: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  DRAFT:     'bg-stone-100 text-stone-600 border border-stone-200',
  PAUSED:    'bg-amber-100 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border border-blue-200',
  SUSPENDED: 'bg-red-100 text-red-700 border border-red-200',
}

const avatarColors = [
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-blue-400 to-blue-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-teal-400 to-teal-600',
]

export default function AdminDashboardPage() {
  const [stats,           setStats]           = useState<any>(null)
  const [recentUsers,     setRecentUsers]     = useState<any[]>([])
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])
  const [trendData,       setTrendData]       = useState<any[]>([])
  const [isLoading,       setIsLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<any>('/analytics/platform'),
      api.get<any>('/analytics/platform/trend?days=30'),
      api.get<any>('/users?limit=5&sort=newest'),
      api.get<any>('/campaigns/admin/all?limit=5&sort=newest'),
    ]).then(([statsRes, trendRes, usersRes, campaignsRes]) => {
      if (statsRes.success)     setStats(statsRes.data)
      if (trendRes.success)     setTrendData(trendRes.data)
      if (usersRes.success)     setRecentUsers(usersRes.data)
      if (campaignsRes.success) setRecentCampaigns(campaignsRes.data)
    }).catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total ?? '—',
      icon: Users,
      iconBg: 'bg-blue-500',
      cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100/60',
      border: 'border-blue-100',
      valueColor: 'text-blue-700',
      subText: 'Registered members',
      href: '/admin/users',
    },
    {
      label: 'Total Campaigns',
      value: stats?.campaigns?.total ?? '—',
      icon: Target,
      iconBg: 'bg-emerald-500',
      cardBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60',
      border: 'border-emerald-100',
      valueColor: 'text-emerald-700',
      subText: 'Across all categories',
      href: '/admin/campaigns',
    },
    {
      label: 'Total Donations',
      value: stats?.donations?.total ?? '—',
      icon: Receipt,
      iconBg: 'bg-violet-500',
      cardBg: 'bg-gradient-to-br from-violet-50 to-violet-100/60',
      border: 'border-violet-100',
      valueColor: 'text-violet-700',
      subText: 'Transactions completed',
      href: '/admin/donations',
    },
    {
      label: 'Total Raised',
      value: stats ? formatBDT(stats.donations.totalAmountRaised) : '—',
      icon: TrendingUp,
      iconBg: 'bg-amber-500',
      cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100/60',
      border: 'border-amber-100',
      valueColor: 'text-amber-700',
      subText: 'Lives impacted',
      href: '/admin/analytics',
    },
  ]

  return (
    <ErrorBoundary>
    <DashboardLayout role="admin">
<div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={16} className="text-rose-500" />
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest">Admin Overview</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800">Platform Dashboard</h1>
        <p className="text-sm text-stone-500 mt-0.5">Monitor and manage your fundraising platform.</p>
      </div>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative rounded-2xl border ${stat.border} ${stat.cardBg} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
          >
<div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight
                size={15}
                className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
<p className={`text-2xl font-extrabold ${stat.valueColor} leading-none mb-1`}>
              {isLoading ? (
                <span className="inline-block w-16 h-6 bg-white/60 rounded-lg animate-pulse" />
              ) : stat.value}
            </p>
<p className="text-sm font-semibold text-stone-700">{stat.label}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{stat.subText}</p>
          </Link>
        ))}
      </div>
<div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={13} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-stone-800">Recent Users</h2>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, idx) => {
                  const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  const gradBg = avatarColors[idx % avatarColors.length]
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/60 transition-colors border-b border-stone-50 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradBg} flex items-center justify-center shrink-0 shadow-sm`}>
                            <span className="text-[11px] font-bold text-white">{initials}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800 text-sm whitespace-nowrap leading-tight">{u.name}</p>
                            {u.isBanned && (
                              <span className="text-[10px] bg-red-50 text-red-500 font-semibold px-1.5 py-0.5 rounded-full">Banned</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 hidden md:table-cell text-xs">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${roleColors[u.role] ?? 'bg-stone-100 text-stone-600'}`}>
                          {u.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 text-xs hidden lg:table-cell whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Target size={13} className="text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-stone-800">Recent Campaigns</h2>
            </div>
            <Link
              href="/admin/campaigns"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Creator</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">Raised</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-colors border-b border-stone-50 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-stone-800 text-sm truncate max-w-[150px]" title={c.title}>{c.title}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5 capitalize">{c.category?.toLowerCase()}</p>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 text-xs hidden md:table-cell whitespace-nowrap">
                      {c.creator?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColors[c.status] ?? 'bg-stone-100 text-stone-600'}`}>
                        {c.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600 text-sm hidden lg:table-cell whitespace-nowrap">
                      {formatBDT(c.raisedAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
            <Activity size={14} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Donation Trend</h2>
            <p className="text-[11px] text-stone-400">Last 30 days</p>
          </div>
        </div>
        <DonationTrendChart donations={trendData} days={30} />
      </div>
    </DashboardLayout>
    </ErrorBoundary>
  )
}