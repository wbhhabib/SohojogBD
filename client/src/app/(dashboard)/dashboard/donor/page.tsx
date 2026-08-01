
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, BarChart2, Receipt } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import CampaignCard from '@/components/campaign/CampaignCard'
import ReceiptDownload from '@/components/donation/ReceiptDownload'
import { api } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  PENDING:   'bg-amber-100 text-amber-700',
  REFUNDED:  'bg-red-100 text-red-700',
}

export default function DonorDashboardPage() {
  const [statsData,          setStatsData]          = useState<any>(null)
  const [recentDonations,    setRecentDonations]    = useState<any[]>([])
  const [supportedCampaigns, setSupportedCampaigns] = useState<any[]>([])
  const [isLoading,          setIsLoading]          = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<any>('/analytics/donor'),
      api.get<any>('/donations/my?limit=5'),


      api.get<any>('/campaigns/supported?limit=3'),
    ]).then(([statsRes, donationsRes, campaignsRes]) => {
      if (statsRes.success)     setStatsData(statsRes.data)
      if (donationsRes.success) setRecentDonations(donationsRes.data)
      if (campaignsRes.success) setSupportedCampaigns(campaignsRes.data)
    }).catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Total Donated',


      value: statsData ? formatBDT(statsData.totalDonated ?? 0) : '—',
      icon: Heart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Campaigns Supported',
      value: statsData?.campaignsSupported ?? '—',
      icon: BarChart2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Donations',

      value: statsData?.donationCount ?? '—',
      icon: Receipt,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ]

  return (
    <ErrorBoundary>
    <DashboardLayout role="donor">
      <PageHeader title="My Dashboard" />
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {isLoading ? '…' : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Donations</h2>
          <Link href="/donor/donations" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            View all
          </Link>
        </div>
        {recentDonations.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">No donations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800 max-w-[180px]">
                      <span className="truncate block max-w-[180px]" title={d.campaign?.title}>
                        {d.campaign?.title ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-emerald-600">{formatBDT(d.amount)}</td>
                    <td className="px-6 py-3 text-slate-400 hidden md:table-cell whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {d.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <ReceiptDownload donation={d} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
<div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Campaigns I Support</h2>
          <Link href="/donor/supported-campaigns" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            View all
          </Link>
        </div>
        {supportedCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-10 text-center text-slate-400 text-sm">
            You haven&apos;t supported any campaigns yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>
<div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Discover more campaigns</p>
          <p className="text-xs text-emerald-600 mt-0.5">Find causes that matter to you and make a difference today.</p>
        </div>
        <Link
          href="/campaigns"
          className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Browse More Campaigns
        </Link>
      </div>
    </DashboardLayout>
    </ErrorBoundary>
  )
}