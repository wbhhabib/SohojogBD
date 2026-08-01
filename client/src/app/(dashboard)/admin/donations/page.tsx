
'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import DonationSummary from '@/components/donation/DonationSummary'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/lib/api'
import type { Donation } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import ErrorBoundary from '@/components/common/ErrorBoundary'

interface PlatformStats {
  donations: { total: number; totalAmountRaised: number; thisMonth: { count: number; amount: number } }
  users: { total: number; creators: number; donors: number }
  campaigns: { total: number; active: number; completed: number }
  topCategories: { category: string; totalRaised: number }[]
}

interface DonationsApiResponse {
  success: boolean
  data: Donation[]
  message: string
  meta?: { total: number }
}

const PAGE_SIZE = 8

type StatusFilter = 'all' | 'PENDING' | 'COMPLETED' | 'REFUNDED'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending',   value: 'PENDING'   },
  { label: 'Refunded',  value: 'REFUNDED'  },
]

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  PENDING:   'bg-amber-100 text-amber-700',
  REFUNDED:  'bg-red-100 text-red-700',
}

export default function AdminDonationsPage() {
  const [donations,    setDonations]    = useState<Donation[]>([])
  const [total,        setTotal]        = useState(0)
  const [summary,      setSummary]      = useState<PlatformStats | null>(null)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page,         setPage]         = useState(1)
  const [isLoading,    setIsLoading]    = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const totalDonationCount = summary?.donations?.total ?? 0
  const totalAmountRaised = summary?.donations?.totalAmountRaised ?? 0
  const averageDonation =
    totalDonationCount > 0 ? totalAmountRaised / totalDonationCount : 0

  const fetchDonations = useCallback(() => {
    setIsLoading(true)
    const params = new URLSearchParams()
    params.set('page',  String(page))
    params.set('limit', String(PAGE_SIZE))
    if (search.trim())          params.set('search', search.trim())
    if (statusFilter !== 'all') params.set('status', statusFilter)

    Promise.all([
      api.get<Donation[]>(`/donations/admin/all?${params.toString()}`),
      api.get<PlatformStats>('/analytics/platform'),
    ]).then(([donationsRes, statsRes]) => {
      if (donationsRes.success) {
        setDonations(donationsRes.data)
        setTotal((donationsRes as unknown as DonationsApiResponse).meta?.total ?? donationsRes.data.length)
      }
      if (statsRes.success) setSummary(statsRes.data)
    }).catch(() => {}).finally(() => setIsLoading(false))
  }, [search, statusFilter, page])

  useEffect(() => { fetchDonations() }, [fetchDonations])

  const handleSearch       = (val: string)       => { setSearch(val);       setPage(1) }
  const handleStatusFilter = (val: StatusFilter) => { setStatusFilter(val); setPage(1) }

  return (
    <ErrorBoundary>
      <DashboardLayout role="admin">
      <PageHeader title="All Donations" />

      <div className="mb-6">
        <DonationSummary
          totalRaised={totalAmountRaised}
          totalDonors={summary?.users?.donors ?? 0}
          averageDonation={averageDonation}
          completedCount={totalDonationCount}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search donor or campaign…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {donations.length === 0 && !isLoading ? (
        <EmptyState title="No donations found" description="Try adjusting your search or status filter." />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Donor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-emerald-700">
                              {d.isAnonymous ? '?' : (d.donor?.name ?? '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-slate-800 whitespace-nowrap">
                            {d.isAnonymous ? 'Anonymous' : d.donor?.name ?? '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[180px]">
                        <span className="truncate block max-w-[180px]">{d.campaign?.title ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{formatBDT(d.amount)}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-[180px]">
                        {d.message ? <span className="truncate block max-w-[180px]">{d.message}</span> : <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {d.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-slate-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} donations</p>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-emerald-600 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
    </ErrorBoundary>
  )
}
