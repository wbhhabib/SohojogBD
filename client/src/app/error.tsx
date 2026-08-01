
'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full flex flex-col items-center gap-4">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
          {error?.message && (
            <p className="text-sm text-slate-500 max-w-xs mx-auto">{error.message}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full">
          <button
            onClick={reset}
            className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 text-center border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}