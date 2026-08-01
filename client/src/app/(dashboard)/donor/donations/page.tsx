
'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import DonationSummary from '@/components/donation/DonationSummary'
import ReceiptDownload from '@/components/donation/ReceiptDownload'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/lib/api'
import type { Donation, PaginationMeta } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 6

type DateFilter = '30' | '90' | '365' | 'all'

const DATE_TABS: { label: string; value: DateFilter }[] = [
  { label: 'Last 30 days', value: '30' },
  { label: '3 months',     value: '90' },
  { label: '1 year',       value: '365' },
  { label: 'All time',     value: 'all' },
]

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  PENDING:   'bg-amber-100 text-amber-700',
  refunded:  'bg-red-100 text-red-700',
  REFUNDED:  'bg-red-100 text-red-700',
}

export default function DonorDonationsPage() {
  const [dateFilter, setDateFilter]     = useState<DateFilter>('all')
  const [page, setPage]                 = useState(1)
  const [donations, setDonations]       = useState<Donation[]>([])
  const [meta, setMeta]                 = useState<PaginationMeta | null>(null)
  const [loading, setLoading]           = useState(true)
  const [summaryStats, setSummaryStats] = useState({
    totalRaised:     0,
    completedCount:  0,
    uniqueCampaigns: 0,
    avgDonation:     0,
  })

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: String(PAGE_SIZE),
        sort:  'newest',
      })
      if (dateFilter !== 'all') params.set('days', dateFilter)

      const res = await api.get<Donation[]>(`/donations/my?${params.toString()}`)
      if (res.success) {
        setDonations(res.data)

        if (res.meta) setMeta(res.meta)
      }
    } catch {

    } finally {
      setLoading(false)
    }
  }, [dateFilter, page])

  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' })
      if (dateFilter !== 'all') params.set('days', dateFilter)
      const res = await api.get<Donation[]>(`/donations/my?${params.toString()}`)
      if (res.success) {
        const all       = res.data
        const completed = all.filter((d) => d.status === 'completed')
        const totalRaised     = completed.reduce((s, d) => s + d.amount, 0)
        const uniqueCampaigns = new Set(all.map((d) => d.campaign?.id ?? d.campaignId)).size
        const avgDonation     = completed.length > 0 ? totalRaised / completed.length : 0
        setSummaryStats({ totalRaised, completedCount: completed.length, uniqueCampaigns, avgDonation })
      }
    } catch {

    }
  }, [dateFilter])

  useEffect(() => {
    fetchDonations()
    fetchSummary()
  }, [fetchDonations, fetchSummary])

  const handleDateFilter = (val: DateFilter) => {
    setDateFilter(val)
    setPage(1)
  }

  const totalPages = meta?.totalPages ?? 1

  return (
    <DashboardLayout role="donor">
      <PageHeader title="My Donations" />

      <div className="mb-6">
        <DonationSummary
          totalRaised={summaryStats.totalRaised}
          totalDonors={summaryStats.uniqueCampaigns}
          averageDonation={summaryStats.avgDonation}
          completedCount={summaryStats.completedCount}
        />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {DATE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleDateFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              dateFilter === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      )}

      {!loading && donations.length === 0 && (
        <EmptyState
          title="No donations found"
          description="You haven't made any donations in this period."
        />
      )}

      {!loading && donations.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((d) => {
                    const campaignTitle = d.campaign?.title ?? '—'
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800 truncate max-w-[160px]" title={campaignTitle}>
                              {campaignTitle}
                            </p>
                            {d.isAnonymous && (
                              <span className="shrink-0 inline-block px-1.5 py-0 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                Anon
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">
                          {formatBDT(d.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-400 hidden md:table-cell whitespace-nowrap">
                          {new Date(d.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-[200px]">
                          {d.message ? (
                            <span className="truncate block max-w-[200px]" title={d.message}>
                              {d.message}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {d.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ReceiptDownload donation={d} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta?.total ?? donations.length)} of {meta?.total ?? donations.length} donations
              </p>
              <p className="text-xs font-medium text-slate-600">
                Total: <span className="text-emerald-600">{formatBDT(summaryStats.totalRaised)}</span>
              </p>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-200 text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}