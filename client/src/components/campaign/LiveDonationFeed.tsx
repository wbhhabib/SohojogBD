
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { donationApi } from '@/lib/api'
import type { Donation } from '@/lib/api'
import { formatBDT, timeAgo } from '@/lib/utils'
import { Heart } from 'lucide-react'

interface FeedDonation {
  id: string
  donorName: string
  isAnonymous: boolean
  amount: number
  createdAt: string
}

function toFeedDonation(d: Donation): FeedDonation {
  return {
    id:          d.id,
    isAnonymous: d.isAnonymous,
    amount:      d.amount,
    createdAt:   d.createdAt,
    donorName:   d.isAnonymous ? 'Anonymous' : (d.donor?.name ?? 'Unknown'),
  }
}

interface LiveDonationFeedProps {
  campaignId: string
}

export default function LiveDonationFeed({ campaignId }: LiveDonationFeedProps) {
  const [donations, setDonations] = useState<FeedDonation[]>([])
  const [loading, setLoading]     = useState(true)

  const fetchDonations = useCallback(async () => {
    try {
      const res = await donationApi.getCampaignDonations(campaignId, 'limit=5&sort=newest')
      if (res.success) setDonations(res.data.map(toFeedDonation))
    } catch {

    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchDonations()

    const interval = setInterval(fetchDonations, 30_000)
    return () => clearInterval(interval)
  }, [fetchDonations])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-900">Recent Supporters</h3>
        </div>
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-100 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-900">Recent Supporters</h3>
        </div>
        <p className="text-sm text-slate-400 text-center py-4">
          Be the first to support this campaign!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-900">Recent Supporters</h3>
      </div>

      <div className="flex flex-col gap-3 overflow-hidden max-h-64">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="flex items-center justify-between gap-3 animate-fade-in"
          >
<div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Heart size={13} className="text-emerald-600 fill-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                </p>
                <p className="text-xs text-slate-400">{timeAgo(donation.createdAt)}</p>
              </div>
            </div>
<span className="text-sm font-semibold text-emerald-600 flex-shrink-0">
              {formatBDT(donation.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}