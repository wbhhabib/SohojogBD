'use client'

import { useEffect } from 'react'
import { setAccessToken } from '@/lib/auth-store'
import { userApi } from '@/lib/api'

export default function GoogleCallbackPage() {
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))
    const token = params.get('token')
    const rawNext = params.get('next')
    const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null

    if (!token) {
      window.location.href = '/auth/login?error=google_failed'
      return
    }


    setAccessToken(token)
    window.history.replaceState(null, '', window.location.pathname)


    userApi.getMe()
      .then((res) => {
        if (!res.success) throw new Error('getMe failed')
        const role = res.data.role.toLowerCase()

        window.location.href = next || (role === 'admin' ? '/dashboard/admin' : '/')
      })
      .catch(() => {
        window.location.href = '/auth/login?error=google_failed'
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Signing you in with Google…</p>
      </div>
    </div>
  )
}