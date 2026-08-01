
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Ban, ArrowLeft, Home } from 'lucide-react'

function CancelContent() {
  const searchParams = useSearchParams()
  const tranId = searchParams.get('tran_id') ?? undefined

  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50
      flex items-center justify-center px-4 py-12 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>

      <div className="w-full max-w-md">
<div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-sm">
            <Ban size={38} className="text-slate-500" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Cancelled</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center">
            You cancelled the payment. No amount has been charged.
          </p>
        </div>
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

          <div className="bg-slate-600 px-6 py-4 text-center">
            <p className="text-white font-semibold">Transaction Cancelled</p>
            <p className="text-slate-300 text-xs mt-0.5">You can try again whenever you&apos;re ready</p>
          </div>

          <div className="px-6 py-5 space-y-3.5">
            {tranId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-medium text-slate-800 text-right max-w-[55%] break-all">{tranId}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-slate-500">Cancelled</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Charge</span>
              <span className="font-medium text-emerald-600">None — ৳0</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3.5 flex items-center justify-between text-xs text-slate-400">
              <span>FundRaise BD</span>
              <span>{new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
<div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 text-blue-700 text-sm text-center leading-relaxed">
          আপনার donation-এর ইচ্ছা মূল্যবান। যখন প্রস্তুত, আবার চেষ্টা করুন।
          <br />
          <span className="text-blue-500 text-xs">Every contribution makes a difference.</span>
        </div>
<div className="space-y-3">
          <Link
            href="/campaigns"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            Back to Campaigns
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:border-slate-300 text-slate-700 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <Home size={15} />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
      </div>
    }>
      <CancelContent />
    </Suspense>
  )
}
