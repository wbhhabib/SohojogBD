
import React from 'react'
import type { Campaign } from '@/lib/api'
import { Heart } from 'lucide-react'

interface CampaignDetailsProps {
  campaign: Campaign
}

export default function CampaignDetails({ campaign }: CampaignDetailsProps) {
  return (
    <div className="flex flex-col gap-8">
<section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">About this Campaign</h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {campaign.story}
        </p>
      </section>
<section className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={18} className="text-emerald-600 fill-emerald-600" />
          <h2 className="text-base font-semibold text-slate-900">Who We&apos;re Helping</h2>
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-1">{campaign.beneficiaryName}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{campaign.beneficiaryInfo}</p>
      </section>
    </div>
  )
}