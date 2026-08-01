
import React from 'react'
import type { Campaign } from '@/lib/api'
import CampaignCard from './CampaignCard'
import Skeleton from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { LayoutGrid } from 'lucide-react'

interface CampaignGridProps {
  campaigns: Campaign[]
  loading?: boolean
}

export default function CampaignGrid({ campaigns, loading = false }: CampaignGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid size={48} />}
        title="No campaigns found"
        description="Try adjusting your search or filter to find what you're looking for."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}