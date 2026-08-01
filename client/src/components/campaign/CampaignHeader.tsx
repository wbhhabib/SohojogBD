
import React from 'react'
import type { Campaign } from '@/lib/api'
import Badge, { campaignStatusVariant } from '@/components/ui/badge'

interface CampaignHeaderProps {
  campaign: Campaign
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const isActive = campaign.status.toUpperCase() === 'ACTIVE'

  const creatorName   = campaign.creatorName ?? campaign.creator?.name ?? 'Unknown'
  const creatorAvatar = campaign.creatorAvatar ?? campaign.creator?.avatar ?? undefined

  return (
    <div className="flex flex-col gap-4">
<div className="flex items-center gap-2 flex-wrap">
        <Badge variant="default">{campaign.category}</Badge>
        {!isActive && (
          <Badge variant={campaignStatusVariant(campaign.status)} className="capitalize">
            {campaign.status.toLowerCase()}
          </Badge>
        )}
      </div>
<h1 className="text-2xl font-bold text-slate-900 leading-snug">{campaign.title}</h1>
<div className="flex items-center gap-3">
        {creatorAvatar ? (
          <img
            src={creatorAvatar}
            alt={creatorName}
            className="w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 text-xs font-semibold">{getInitials(creatorName)}</span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-900">{creatorName}</p>
          <p className="text-xs text-slate-500">
            Campaign Creator · Created {formatDate(campaign.createdAt)}
          </p>
        </div>
      </div>

      <hr className="border-gray-200" />
    </div>
  )
}
