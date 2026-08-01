'use client'

import { useEffect, useState } from 'react'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

export default function MaintenancePage() {
  const [message, setMessage] = useState(
    'We are currently performing scheduled maintenance. We will be back shortly. Thank you for your patience.'
  )

  useEffect(() => {
    fetch(`${BASE_URL}/settings/public`)
      .then((r) => r.json())
      .then((json) => {
        const msg = json?.data?.maintenanceMessage
        if (msg) setMessage(msg)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-emerald-50/80 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-100/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-100/30" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-3xl bg-white border border-emerald-100 shadow-lg flex items-center justify-center">
            <svg
              className="w-12 h-12 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          {/* Pulse dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold tracking-widest uppercase border border-amber-200">
            Scheduled Maintenance
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2">
            We&apos;ll be back{' '}
            <span className="text-emerald-600">shortly</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-emerald-200 mb-6" />

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">FundRaise</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-400">Bangladesh&apos;s Trusted Platform</span>
        </div>

      </div>
    </div>
  )
}