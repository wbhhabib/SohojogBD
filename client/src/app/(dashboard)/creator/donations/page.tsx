
'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import DonationSummary from '@/components/donation/DonationSummary'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/lib/api'
import { formatBDT } from '@/lib/utils'

interface Campaign {
  id: string
  title: string
  slug: string
}

interface Donation {
  id: string
  amount: number
  message?: string
  isAnonymous: boolean
  status: 'pending' | 'completed' | 'refunded'
  createdAt: string
  campaign: { id: string; title: string; slug: string }
  donor: { id: string; name: string; avatar: string | null }
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  refunded:  'bg-red-100 text-red-700',
}

export default function CreatorDonationsPage() {
  const [campaigns, setCampaigns]           = useState<Campaign[]>([])
  const [donations, setDonations]           = useState<Donation[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [loading, setLoading]               = useState(true)


  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await api.get<Campaign[]>('/campaigns/my?limit=100')
      if (res.success) setCampaigns(res.data)
    } catch {

    }
  }, [])


  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '500', sort: 'newest' })
      if (selectedCampaign !== 'all') params.set('campaignId', selectedCampaign)

      const res = await api.get<Donation[]>(`/donations/creator?${params.toString()}`)
      if (res.success) setDonations(res.data)
    } catch {

    } finally {
      setLoading(false)
    }
  }, [selectedCampaign])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])
  useEffect(() => { fetchDonations() }, [fetchDonations])


  const completed      = donations.filter((d) => d.status === 'completed')
  const totalRaised    = completed.reduce((s, d) => s + d.amount, 0)
  const totalDonors    = new Set(completed.filter((d) => !d.isAnonymous).map((d) => d.donor.id)).size
  const avgDonation    = completed.length > 0 ? totalRaised / completed.length : 0


  const donationsByCampaign = donations.reduce<Record<string, number>>((acc, d) => {
    acc[d.campaign.id] = (acc[d.campaign.id] ?? 0) + 1
    return acc
  }, {})

  return (
    <DashboardLayout role="creator">
      <PageHeader title="Donations Received" />
<div className="mb-6">
        <DonationSummary
          totalRaised={totalRaised}
          totalDonors={totalDonors}
          averageDonation={avgDonation}
          completedCount={completed.length}
        />
      </div>
<div className="flex items-center gap-3 mb-5 flex-wrap">
        <label className="text-sm font-medium text-slate-600 shrink-0">Filter by campaign:</label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-w-[220px]"
        >
          <option value="all">All Campaigns ({donations.length})</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({donationsByCampaign[c.id] ?? 0})
            </option>
          ))}
        </select>
        {selectedCampaign !== 'all' && (
          <button
            onClick={() => setSelectedCampaign('all')}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
{loading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      )}
{!loading && donations.length === 0 && (
        <EmptyState
          title="No donations found"
          description={
            selectedCampaign === 'all'
              ? "You haven't received any donations yet."
              : 'No donations for this campaign yet.'
          }
        />
      )}

      {!loading && donations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
<td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-emerald-700">
                            {d.isAnonymous ? '?' : d.donor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {d.isAnonymous ? 'Anonymous' : d.donor.name}
                          </p>
                          {d.isAnonymous && (
                            <span className="inline-block mt-0.5 px-1.5 py-0 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                              Anonymous
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
<td className="px-4 py-3 font-semibold text-emerald-600">{formatBDT(d.amount)}</td>
<td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[200px]">
                      {d.message ? (
                        <span className="truncate block max-w-[200px]" title={d.message}>
                          {d.message}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>
<td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-[160px]">
                      <span className="truncate block max-w-[160px]" title={d.campaign.title}>
                        {d.campaign.title}
                      </span>
                    </td>
<td className="px-4 py-3 text-slate-400 hidden lg:table-cell whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
<td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
<div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-slate-400">
              Showing {donations.length} donation{donations.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs font-medium text-slate-600">
              Total: <span className="text-emerald-600">{formatBDT(totalRaised)}</span>
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}