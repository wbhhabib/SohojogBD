
import React from 'react'
import type { Campaign } from '@/lib/api'
import { formatBDT, daysLeft } from '@/lib/utils'
import { TrendingUp, Target, Users, Clock } from 'lucide-react'

interface CampaignStatsProps {
  campaign: Campaign
}

export default function CampaignStats({ campaign }: CampaignStatsProps) {
  const remaining = daysLeft(campaign.deadline ?? '')

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Raised',
      value: formatBDT(campaign.raisedAmount),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Target,
      label: 'Goal',
      value: formatBDT(campaign.goalAmount),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Users,
      label: 'Donors',
      value: campaign.donorCount.toLocaleString(),
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Clock,
      label: 'Days Left',
      value: remaining > 0 ? remaining.toString() : 'Ended',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
        >
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon size={18} className={color} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}