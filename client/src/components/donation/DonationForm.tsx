
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatBDT } from '@/lib/utils'

const PRESET_AMOUNTS = [100, 500, 1000, 5000]

export default function DonationForm() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500)
  const [customAmount, setCustomAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePreset = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomChange = (val: string) => {
    setCustomAmount(val)
    setSelectedAmount(null)
  }

  const finalAmount = selectedAmount ?? (customAmount ? parseInt(customAmount) : 0)

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-emerald-800 mb-1">Thank you! Donation successful.</h3>
        <p className="text-emerald-600 text-sm">Your contribution of {formatBDT(finalAmount)} has been received.</p>
        <Button
          className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          onClick={() => { setSuccess(false); setSelectedAmount(500); setCustomAmount(''); setMessage(''); setIsAnonymous(false) }}
        >
          Donate Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
<div>
        <p className="text-sm font-medium text-slate-700 mb-2">Select Amount</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => handlePreset(amt)}
              className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                selectedAmount === amt
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
              }`}
            >
              {formatBDT(amt)}
            </button>
          ))}
        </div>
      </div>
<div>
        <p className="text-sm font-medium text-slate-700 mb-2">Or Enter Custom Amount</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">৳</span>
          <Input
            type="number"
            placeholder="0"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="pl-8 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            min={1}
          />
        </div>
      </div>
<div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <p className="text-sm font-medium text-slate-700">Donate Anonymously</p>
          <p className="text-xs text-slate-400">Your name won&apos;t be shown publicly</p>
        </div>
        <button
          role="switch"
          aria-checked={isAnonymous}
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isAnonymous ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isAnonymous ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
<div>
        <p className="text-sm font-medium text-slate-700 mb-2">Message <span className="text-slate-400 font-normal">(optional)</span></p>
        <Textarea
          placeholder="Leave a message of support..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
        />
      </div>
{finalAmount > 0 && (
        <div className="bg-emerald-50 rounded-lg px-4 py-3 flex justify-between items-center border border-emerald-100">
          <span className="text-sm text-emerald-700 font-medium">You are donating</span>
          <span className="text-lg font-bold text-emerald-700">{formatBDT(finalAmount)}</span>
        </div>
      )}
<Button
        onClick={handleSubmit}
        disabled={loading || !finalAmount || finalAmount <= 0}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-3 font-semibold text-base disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Donate Now'
        )}
      </Button>
    </div>
  )
}
