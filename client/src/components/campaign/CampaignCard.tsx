import React from 'react'
import Link from 'next/link'
import type { Campaign } from '@/lib/api'
import { formatBDT, daysLeft, getImageUrl } from '@/lib/utils'
import ProgressBar from './ProgressBar'
import Badge from '@/components/ui/badge'
import { campaignStatusVariant } from '@/components/ui/badge'
import { Users, Clock, Heart } from 'lucide-react'

interface CampaignCardProps {
  campaign: Campaign
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Education:         'from-sky-400 to-blue-600',
  Medical:           'from-rose-400 to-red-600',
  'Disaster Relief': 'from-amber-400 to-orange-600',
  Environment:       'from-emerald-400 to-teal-600',
  'Animal Welfare':  'from-lime-400 to-green-600',
  Community:         'from-violet-400 to-purple-600',
  Poverty:           'from-orange-400 to-red-500',
  Arts:              'from-pink-400 to-rose-600',
  Sports:            'from-cyan-400 to-blue-500',
  Technology:        'from-indigo-400 to-violet-600',
  Other:             'from-slate-400 to-gray-600',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Education: '📚', Medical: '❤️‍🩹', 'Disaster Relief': '🆘',
  Environment: '🌿', 'Animal Welfare': '🐾', Community: '🤝',
  Poverty: '🏠', Arts: '🎨', Sports: '⚽', Technology: '💡', Other: '✨',
}


function getCreatorName(campaign: Campaign): string {
  return campaign.creatorName ?? campaign.creator?.name ?? 'Unknown'
}
function getCreatorAvatar(campaign: Campaign): string | undefined {
  return campaign.creatorAvatar ?? campaign.creator?.avatar ?? undefined
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const remaining   = daysLeft(campaign.deadline ?? '')
  const pct         = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
  const gradient    = CATEGORY_GRADIENTS[campaign.category] ?? 'from-emerald-400 to-teal-600'
  const emoji       = CATEGORY_EMOJIS[campaign.category] ?? '✨'
  const isUrgent    = remaining <= 7 && remaining > 0

  const isActive    = campaign.status.toUpperCase() === 'ACTIVE'
  const creatorName   = getCreatorName(campaign)
  const creatorAvatar = getCreatorAvatar(campaign)

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
<div className="relative h-52 overflow-hidden bg-gray-100">
        {campaign.images[0] ? (
          <img
            src={getImageUrl(campaign.images[0])}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl opacity-60">{emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
<div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-md`}>
            <span>{emoji}</span>
            {campaign.category}
          </span>
        </div>
{!isActive && (
          <div className="absolute top-3 right-3">
            <Badge variant={campaignStatusVariant(campaign.status)} className="capitalize shadow-md">
              {campaign.status.toLowerCase()}
            </Badge>
          </div>
        )}
{isUrgent && isActive && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse shadow-md">
            <Clock size={10} />
            {remaining}d left!
          </div>
        )}
<div className="absolute bottom-3 left-3">
          <span className="text-white text-xs font-bold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {pct}% funded
          </span>
        </div>
      </div>
<div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2"
          style={{ fontFamily: "'Lora', Georgia, serif" }}>
          {campaign.title}
        </h3>
<div className="flex items-center gap-2">
          {creatorAvatar ? (
            <img src={creatorAvatar} alt={creatorName}
              className="w-7 h-7 rounded-full object-cover border-2 border-emerald-100 flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 flex-shrink-0 flex items-center justify-center">
              <span className="text-emerald-600 text-[10px] font-bold">
                {creatorName?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500 truncate font-medium">
            by {creatorName}
          </span>
        </div>
<div className="w-full h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #059669, #34d399, #fbbf24)',
            }}
          />
        </div>
<div className="flex items-baseline justify-between">
          <span>
            <span className="text-base font-bold text-gray-900">{formatBDT(campaign.raisedAmount)}</span>
            <span className="text-xs text-gray-400 ml-1">raised</span>
          </span>
          <span className="text-xs text-gray-400">of {formatBDT(campaign.goalAmount)}</span>
        </div>

        <div className="border-t border-emerald-50 mt-0.5" />
<div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Heart size={11} className="text-emerald-400 fill-emerald-300" />
            <span className="font-semibold text-gray-700">{campaign.donorCount}</span>
            <span>donors</span>
          </span>
          <span className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
            <Clock size={11} />
            {remaining > 0 ? `${remaining} days left` : 'Ended'}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-emerald-200 transition-all duration-300 pointer-events-none" />
    </Link>
  )
}