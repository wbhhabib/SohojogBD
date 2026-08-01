
'use client'

import React, { useEffect, useState } from 'react'
import EmptyState from '@/components/common/EmptyState'
import { Bell } from 'lucide-react'
import { campaignApi, type CampaignUpdate } from '@/lib/api'

interface CampaignUpdatesProps {
  campaignId: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CampaignUpdates({ campaignId }: CampaignUpdatesProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return
    const fetchUpdates = async () => {
      try {
        const res = await campaignApi.getUpdates(campaignId)
        if (res.success && Array.isArray(res.data)) {
          setUpdates(res.data)
        }
      } catch {

      } finally {
        setLoading(false)
      }
    }
    fetchUpdates()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gray-200 mt-1.5" />
              {i === 1 && <div className="w-0.5 flex-1 bg-gray-100 mt-1 min-h-[2rem]" />}
            </div>
            <div className="pb-8 flex-1">
              <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <EmptyState
        icon={<Bell size={40} />}
        title="No updates yet"
        description="The campaign creator hasn't posted any updates yet. Check back soon!"
      />
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {updates.map((update, i) => (
        <div key={update.id ?? i} className="flex gap-4">
<div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5 ring-2 ring-emerald-100" />
            {i < updates.length - 1 && (
              <div className="w-0.5 flex-1 bg-emerald-200 mt-1 mb-0 min-h-[2rem]" />
            )}
          </div>
<div className={`pb-8 ${i === updates.length - 1 ? 'pb-0' : ''}`}>
            <p className="text-xs text-slate-400 mb-1">{formatDate(update.createdAt)}</p>
            <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{update.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{update.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}