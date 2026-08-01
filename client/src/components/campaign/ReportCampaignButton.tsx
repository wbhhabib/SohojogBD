// src/components/campaign/ReportCampaignButton.tsx
'use client'

import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

const REASONS = [
  { value: 'FAKE_CAMPAIGN', label: 'Fake Campaign' },
  { value: 'SPAM',          label: 'Spam'          },
  { value: 'MISLEADING',    label: 'Misleading'    },
  { value: 'INAPPROPRIATE', label: 'Inappropriate' },
] as const

interface ReportCampaignButtonProps {
  campaignId: string
  isLoggedIn: boolean
}

export default function ReportCampaignButton({ campaignId, isLoggedIn }: ReportCampaignButtonProps) {
  const [open,      setOpen]      = useState(false)
  const [reason,    setReason]    = useState<string>('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/reports', { campaignId, reason })
      if (res.success) {
        setSubmitted(true)
      } else {
        setError(res.message ?? 'Failed to submit report.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) return null

  return (
    <>
      <button
        onClick={() => { setOpen(true); setSubmitted(false); setError(''); setReason('') }}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
      >
        <Flag size={12} />
        Report this campaign
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Flag className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-800 mb-1">Report Submitted</p>
                <p className="text-sm text-slate-500">Our team will review it shortly.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-slate-800 mb-1">Report Campaign</h3>
                <p className="text-sm text-slate-500 mb-4">Select a reason for reporting this campaign.</p>

                <div className="space-y-2 mb-4">
                  {REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => { setReason(r.value); setError('') }}
                        className="text-emerald-600"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">{r.label}</span>
                    </label>
                  ))}
                </div>

                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 text-slate-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}