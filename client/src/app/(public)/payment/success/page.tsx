
'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react'
import { donationApi } from '@/lib/api'

interface PaymentData {
  tranId?: string
  amount?: string
  currency?: string
  cardType?: string
  bankTranId?: string
  storeAmount?: string
  cardIssuer?: string
  cardBrand?: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const [data] = useState<PaymentData>({
    tranId:      searchParams.get('tran_id')      ?? undefined,
    amount:      searchParams.get('amount')        ?? undefined,
    currency:    searchParams.get('currency')      ?? 'BDT',
    cardType:    searchParams.get('card_type')     ?? undefined,
    bankTranId:  searchParams.get('bank_tran_id')  ?? undefined,
    storeAmount: searchParams.get('store_amount')  ?? undefined,
    cardIssuer:  searchParams.get('card_issuer')   ?? undefined,
    cardBrand:   searchParams.get('card_brand')    ?? undefined,
  })

  const campaignSlug = searchParams.get('campaignSlug') ?? ''
  const [show, setShow] = useState(false)
  const confirmedRef = useRef(false)

  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])










  useEffect(() => {
    const donationId = searchParams.get('donationId')
    if (!donationId || donationId.startsWith('MOCK-') || confirmedRef.current) return
    confirmedRef.current = true

    const confirm = async (attempt = 1) => {
      try {
        const res = await donationApi.mockConfirm(donationId)
        if (!res.success && attempt < 3) {
          setTimeout(() => confirm(attempt + 1), 800 * attempt)
        }
      } catch {
        if (attempt < 3) {
          setTimeout(() => confirm(attempt + 1), 800 * attempt)
        } else {
          console.error('[mockConfirm] Failed after 3 attempts — campaign stats may not update.')
        }
      }
    }

    confirm()
  }, [searchParams])


  const handlePrint = () => window.print()

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50
      flex items-center justify-center px-4 py-12 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
<style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="w-full max-w-md" id="receipt">
<div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle size={40} className="text-emerald-600" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Successful!</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center">
            Your donation has been received. জাজাকাল্লাহু খাইরান।
          </p>
        </div>
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
{data.amount && (
            <div className="bg-emerald-600 px-6 py-5 text-center">
              <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Amount Donated</p>
              <p className="text-white text-4xl font-bold">
                ৳{Number(data.storeAmount || data.amount).toLocaleString('en-BD')}
              </p>
              <p className="text-emerald-200 text-xs mt-1">{data.currency}</p>
            </div>
          )}
<div className="px-6 py-5 space-y-3.5">
            {[
              { label: 'Transaction ID', value: data.tranId },
              { label: 'Bank Tran ID',   value: data.bankTranId },
              { label: 'Payment Method', value: data.cardType },
              { label: 'Card Brand',     value: data.cardBrand },
              { label: 'Issuer',         value: data.cardIssuer },
              { label: 'Status',         value: 'Confirmed', highlight: true },
            ].filter(r => r.value).map(({ label, value, highlight }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className={`font-medium ${highlight ? 'text-emerald-600' : 'text-slate-800'} text-right max-w-[55%] break-all`}>
                  {value}
                </span>
              </div>
            ))}

            <div className="border-t border-dashed border-gray-200 pt-3.5 flex items-center justify-between text-xs text-slate-400">
              <span>FundRaise BD</span>
              <span>{new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
<div className="space-y-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <Receipt size={16} />
            Download Receipt
          </button>

          {campaignSlug && (
            <Link
              href={`/campaigns/${campaignSlug}?donated=1`}
              className="flex items-center justify-center gap-2 w-full bg-white border border-emerald-200 hover:border-emerald-400 hover:text-emerald-700 text-emerald-600 font-medium py-3 rounded-xl transition-colors text-sm"
            >
              <ArrowRight size={15} />
              Back to Campaign
            </Link>
          )}

          <Link
            href="/dashboard/donor"
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            View My Donations
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-700 font-medium py-2 text-sm transition-colors"
          >
            <Home size={15} />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}