
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react'

function FailContent() {
  const searchParams = useSearchParams()
  const tranId = searchParams.get('tran_id') ?? undefined
  const error  = searchParams.get('error')   ?? undefined

  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50
      flex items-center justify-center px-4 py-12 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>

      <div className="w-full max-w-md">
<div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4 shadow-sm">
            <XCircle size={40} className="text-red-500" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Failed</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center">
            Your payment could not be processed. No amount has been charged.
          </p>
        </div>
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
<div className="bg-red-500 px-6 py-4 text-center">
            <p className="text-white font-semibold">Transaction Unsuccessful</p>
            <p className="text-red-100 text-xs mt-0.5">Your card has not been charged</p>
          </div>

          <div className="px-6 py-5 space-y-3.5">
            {tranId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-medium text-slate-800 text-right max-w-[55%] break-all">{tranId}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Reason</span>
                <span className="font-medium text-red-600 text-right max-w-[55%]">{error}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-red-500">Failed</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3.5 flex items-center justify-between text-xs text-slate-400">
              <span>FundRaise BD</span>
              <span>{new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
<div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center gap-2 mb-2.5">
            <HelpCircle size={15} className="text-amber-600 shrink-0" />
            <p className="text-amber-800 text-xs font-semibold uppercase tracking-wide">Common reasons</p>
          </div>
          <ul className="text-amber-700 text-xs space-y-1.5 list-disc list-inside">
            <li>Insufficient balance in your account</li>
            <li>Card not enabled for online transactions</li>
            <li>Incorrect OTP or session timeout</li>
            <li>Bank declined the transaction</li>
          </ul>
        </div>
<div className="space-y-3">
          <Link
            href="/campaigns"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <RefreshCw size={15} />
            Try Again
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}