

'use client'

import React, { useState } from 'react'
import type { Campaign } from '@/lib/api'
import { donationApi } from '@/lib/api'
import { formatBDT, daysLeft } from '@/lib/utils'
import Toast from '@/components/ui/toast'
import { Users, Clock, AlertCircle, Heart, Shield, ChevronRight, Sparkles } from 'lucide-react'


const USE_MOCK_PAYMENT = true
const MOCK_GATEWAY_PATH = '/payment/mock-gateway'


interface CampaignSidebarProps {
  campaign: Campaign
}

const PRESETS = [
  { amount: 100,  tag: ''          },
  { amount: 500,  tag: 'Popular'   },
  { amount: 1000, tag: ''          },
  { amount: 5000, tag: '💫 Generous' },
]

export default function CampaignSidebar({ campaign }: CampaignSidebarProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(500)
  const [customAmount,   setCustomAmount]   = useState('')
  const [isAnonymous,    setIsAnonymous]    = useState(false)
  const [message,        setMessage]        = useState('')
  const [isLoading,      setIsLoading]      = useState(false)
  const [error,          setError]          = useState('')
  const [showToast,      setShowToast]      = useState(false)
  const [toastMessage,   setToastMessage]   = useState('')
  const [toastType,      setToastType]      = useState<'success' | 'error'>('success')

  const remaining       = daysLeft(campaign.deadline)

  const isActive        = USE_MOCK_PAYMENT ? true : campaign.status === 'ACTIVE'
  const effectiveAmount = selectedPreset !== null ? selectedPreset : Number(customAmount)
  const pct             = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))

  function handlePresetClick(amount: number) {
    setSelectedPreset(amount); setCustomAmount(''); setError('')
  }
  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedPreset(null); setCustomAmount(e.target.value); setError('')
  }

  async function handleDonate() {
    if (!isActive || !effectiveAmount || effectiveAmount <= 0) return
    if (effectiveAmount < 10) { setError('Minimum donation amount is ৳10.'); return }
    setIsLoading(true); setError('')

    try {
      if (USE_MOCK_PAYMENT) {


        const donationRes = await donationApi.create({
          campaignId: campaign.id,
          amount: effectiveAmount,

          isAnonymous,
          message: message.trim() || undefined,
        })
        if (!donationRes.success) {
          setError((donationRes as any).message ?? 'Could not create donation.')
          return
        }
        const donationId = (donationRes.data as any).donationId ?? (donationRes.data as any).id


        const params = new URLSearchParams({
          amount:       String(effectiveAmount),
          donationId,
          campaign:     encodeURIComponent(campaign.title ?? 'Campaign'),
          campaignSlug: campaign.slug ?? '',
          successUrl:   '/payment/success',
          failUrl:      '/payment/fail',
        })
        window.location.href = `${MOCK_GATEWAY_PATH}?${params.toString()}`
        return

      }


















    } catch { setError('Something went wrong. Please try again.') }
    finally { setIsLoading(false) }
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-emerald-100">
<div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #059669, #34d399, #fbbf24)' }} />

      <div className="bg-white p-5 flex flex-col gap-5">
<div>
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-2xl font-bold text-gray-900">{formatBDT(campaign.raisedAmount)}</span>
              <span className="text-sm text-gray-400 ml-1.5">raised</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{pct}%</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">of {formatBDT(campaign.goalAmount)} goal</p>
          <div className="w-full h-2.5 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #059669, #34d399, #fbbf24)' }} />
          </div>
        </div>
<div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-xl px-3 py-1.5">
            <Users size={13} className="text-violet-500" />
            <span className="text-xs font-semibold text-violet-700">{campaign.donorCount} donors</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 border
            ${remaining <= 7 && remaining > 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
            <Clock size={13} className={remaining <= 7 && remaining > 0 ? 'text-red-500' : 'text-amber-500'} />
            <span className={`text-xs font-semibold ${remaining <= 7 && remaining > 0 ? 'text-red-600' : 'text-amber-700'}`}>
              {remaining > 0 ? `${remaining} days left` : 'Ended'}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-emerald-100" />
{!isActive ? (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium">
              This campaign is not accepting donations at this time.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-emerald-500 fill-emerald-400" />
              <h3 className="text-sm font-bold text-gray-900">Choose Your Impact</h3>
            </div>
<div className="grid grid-cols-2 gap-2">
              {PRESETS.map(({ amount, tag }) => {
                const isSelected = selectedPreset === amount
                return (
                  <button key={amount} onClick={() => handlePresetClick(amount)}
                    className={`relative py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200
                      ${isSelected
                        ? 'text-white border-transparent shadow-lg shadow-emerald-200'
                        : 'border-gray-200 text-gray-700 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    style={isSelected ? { background: 'linear-gradient(135deg, #059669, #34d399)' } : {}}
                  >
                    {formatBDT(amount)}
                    {tag && (
                      <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap
                        ${isSelected ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}>
                        {tag}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
<div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold transition-colors
                ${selectedPreset === null && customAmount ? 'text-emerald-600' : 'text-gray-400'}`}>
                ৳
              </span>
              <input type="number" placeholder="Enter custom amount" value={customAmount}
                onChange={handleCustomChange} min={10}
                className={`w-full border-2 rounded-xl pl-8 pr-4 py-2.5 text-sm text-gray-900
                  placeholder:text-gray-400 focus:outline-none transition-all
                  ${selectedPreset === null && customAmount
                    ? 'border-emerald-400 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-200'
                    : 'border-gray-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100'
                  }`}
              />
            </div>
<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-gray-700">Donate anonymously</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Your name won&apos;t be shown publicly</p>
              </div>
              <button type="button" onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none
                  ${isAnonymous ? '' : 'bg-gray-200'}`}
                style={isAnonymous ? { background: 'linear-gradient(135deg, #059669, #34d399)' } : {}}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
                  ${isAnonymous ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
            </div>
<div className="relative">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a heartfelt message of support…" rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900
                  placeholder:text-gray-400 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100
                  resize-none transition-all" />
              <span className="absolute bottom-2 right-2.5 text-[10px] text-gray-300 select-none">
                {message.length}/300
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        )}
<button onClick={handleDonate}
          disabled={!isActive || (!selectedPreset && !customAmount) || isLoading}
          className={`w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400
            ${(!isActive || (!selectedPreset && !customAmount))
              ? 'opacity-50 cursor-not-allowed bg-gray-300'
              : 'hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            }`}
          style={isActive && (selectedPreset || customAmount) ? {
            background: 'linear-gradient(135deg, #059669, #34d399)',
            boxShadow: '0 8px 24px -4px rgba(5,150,105,0.4)',
          } : {}}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              Redirecting to payment…
            </>
          ) : (
            <>
              <Heart size={15} fill="white" />
              Donate {effectiveAmount > 0 ? formatBDT(effectiveAmount) : 'Now'}
              <ChevronRight size={14} />
            </>
          )}
        </button>
<div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <Shield size={11} className="text-emerald-500" />
          Secured by <span className="font-semibold text-gray-500">SSLCommerz</span> · 100% safe
        </div>
{campaign.donorCount > 5 && (
          <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2.5">
            <Sparkles size={12} className="text-emerald-400 flex-shrink-0" />
            <p className="text-[11px] text-emerald-600 font-medium">
              <span className="font-bold">{campaign.donorCount} people</span> have already donated to this cause
            </p>
          </div>
        )}
      </div>

      {showToast && (
        <Toast type={toastType} message={toastMessage}
          onClose={() => setShowToast(false)} duration={3000} />
      )}
    </div>
  )
}