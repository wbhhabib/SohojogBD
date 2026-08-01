'use client'

import { useState } from 'react'
import type { Campaign } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'

import ReportCampaignButton from '@/components/campaign/ReportCampaignButton'
import CampaignGallery    from '@/components/campaign/CampaignGallery'
import CampaignHeader     from '@/components/campaign/CampaignHeader'
import CampaignDetails    from '@/components/campaign/CampaignDetails'
import CampaignUpdates    from '@/components/campaign/CampaignUpdates'
import CampaignSidebar    from '@/components/campaign/CampaignSidebar'
import CommentSection     from '@/components/campaign/CommentSection'
import ReactionBar        from '@/components/campaign/ReactionBar'
import LiveStats          from '@/components/campaign/LiveStats'
import LiveDonationFeed   from '@/components/campaign/LiveDonationFeed'
import ShareButton        from '@/components/campaign/ShareButton'
import { formatBDT, daysLeft } from '@/lib/utils'
import { TrendingUp, Target, Users, Clock, BookOpen, RefreshCw, MessageCircle, Heart, Sparkles } from 'lucide-react'

type Tab = 'story' | 'updates' | 'comments'

interface ApiComment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatar: string | null }
}

interface CampaignDetailClientProps {
  campaign: Campaign
  comments?: ApiComment[]
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'story',    label: 'Story',    icon: BookOpen      },
  { key: 'updates',  label: 'Updates',  icon: RefreshCw     },
  { key: 'comments', label: 'Comments', icon: MessageCircle },
]

const CATEGORY_GRADIENTS: Record<string, string> = {
  Education:         'from-sky-500 to-blue-600',
  Medical:           'from-rose-500 to-red-600',
  'Disaster Relief': 'from-amber-500 to-orange-600',
  Environment:       'from-emerald-500 to-teal-600',
  'Animal Welfare':  'from-lime-500 to-green-600',
  Community:         'from-violet-500 to-purple-600',
}

export default function CampaignDetailClient({ campaign }: CampaignDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('story')
  const { user } = useAuth()

  const remaining = daysLeft(campaign.deadline)
  const pct       = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
  const gradient  = CATEGORY_GRADIENTS[campaign.category] ?? 'from-emerald-500 to-teal-500'

  const statsData = [
    {
      icon: TrendingUp, label: 'Total Raised',  value: formatBDT(campaign.raisedAmount),
      sub: `${pct}% of goal`,  colorClass: 'text-emerald-600',  bgClass: 'bg-emerald-50',  borderClass: 'border-emerald-200',
    },
    {
      icon: Target,     label: 'Funding Goal',  value: formatBDT(campaign.goalAmount),
      sub: 'Target amount',    colorClass: 'text-amber-600',    bgClass: 'bg-amber-50',    borderClass: 'border-amber-200',
    },
    {
      icon: Heart,      label: 'Donors',         value: campaign.donorCount.toLocaleString(),
      sub: 'Generous hearts',  colorClass: 'text-violet-600',   bgClass: 'bg-violet-50',   borderClass: 'border-violet-200',
    },
    {
      icon: Clock,
      label: remaining > 0 ? 'Days Left' : 'Campaign',
      value: remaining > 0 ? remaining.toString() : 'Ended',
      sub: remaining > 0 ? 'Until deadline' : 'Campaign closed',
      colorClass:   remaining <= 7 && remaining > 0 ? 'text-red-500'    : 'text-emerald-600',
      bgClass:      remaining <= 7 && remaining > 0 ? 'bg-red-50'       : 'bg-emerald-50',
      borderClass:  remaining <= 7 && remaining > 0 ? 'border-red-200'  : 'border-emerald-200',
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f9fafb 200px)' }}>
      <div className={`relative h-14 bg-gradient-to-r ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-4 gap-2">
          <Sparkles size={13} className="text-white/70" />
          <span className="text-white/90 text-sm font-semibold">{campaign.category}</span>
          <span className="text-white/50 text-sm">·</span>
          <span className="text-white/70 text-xs">Verified Campaign</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[63%] flex flex-col gap-6">

            <div className="rounded-2xl overflow-hidden shadow-md border border-emerald-100">
              <CampaignGallery images={campaign.images} />
            </div>

            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
              <CampaignHeader campaign={campaign} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statsData.map(({ icon: Icon, label, value, sub, colorClass, bgClass, borderClass }) => (
                <div key={label}
                  className={`bg-white rounded-2xl border ${borderClass} p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center`}>
                    <Icon size={16} className={colorClass} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    <p className={`text-lg font-bold ${colorClass} leading-tight`}>{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Campaign Progress</span>
                <span className="text-sm font-bold text-emerald-600">{pct}%</span>
              </div>
              <div className="w-full h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                <div
                  className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #059669, #34d399, #fbbf24)' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">৳0</span>
                <span className="text-xs text-gray-400">{formatBDT(campaign.goalAmount)}</span>
              </div>
            </div>
            <div className="lg:hidden flex flex-col gap-5">
              <CampaignSidebar campaign={campaign} />
              <LiveStats campaignId={campaign.id} />
              <ShareButton campaignTitle={campaign.title} />
              <LiveDonationFeed campaignId={campaign.id} />
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-emerald-100 bg-emerald-50/30">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold
                        transition-all duration-200 relative
                        ${isActive ? 'text-emerald-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}
                    >
                      <TabIcon size={14} />
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                          style={{ background: 'linear-gradient(90deg, #059669, #34d399)' }} />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="p-6">
                {activeTab === 'story'    && <CampaignDetails campaign={campaign} />}
                {activeTab === 'updates'  && <CampaignUpdates campaignId={campaign.id} />}
                {activeTab === 'comments' && <CommentSection campaignId={campaign.id} />}
              </div>
            </div>

            {/* ── Report button — only shown to logged-in users ── */}
            <div className="flex justify-end">
              <ReportCampaignButton
                campaignId={campaign.id}
                isLoggedIn={!!user}
              />
            </div>

            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
              <ReactionBar />
            </div>
          </div>
          <div className="hidden lg:flex w-full lg:w-[37%] flex-col gap-5">
            <div className="sticky top-6 flex flex-col gap-4">
              <CampaignSidebar campaign={campaign} />
              <LiveStats campaignId={campaign.id} />
              <ShareButton campaignTitle={campaign.title} />
              <LiveDonationFeed campaignId={campaign.id} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}