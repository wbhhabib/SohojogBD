
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import VerifyEmailCard from '@/components/auth/VerifyEmailCard'
import { authApi } from '@/lib/api'

type VerifyStatus = 'loading' | 'success' | 'error'

function VerifyEmailContent() {
  const [status, setStatus] = useState<VerifyStatus>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('No verification token found. Please check your email link.')
      return
    }

    const verify = async () => {
      try {
        const data = await authApi.verifyEmail(token)
        if (data.success) {
          setStatus('success')
          setMessage('Your email has been verified. You can now log in.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed. The link may have expired.')
        }
      } catch {
        setStatus('error')
        setMessage('Something went wrong. Please try again or request a new verification email.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <VerifyEmailCard status={status} message={message} />
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}