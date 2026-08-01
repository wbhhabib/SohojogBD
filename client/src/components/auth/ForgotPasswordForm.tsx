'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSentEmail(email)
        setSubmitted(true)
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Check your inbox</h3>
          <p className="text-sm text-slate-500">
            Reset link sent to <span className="font-medium text-slate-700">{sentEmail}</span>
          </p>
        </div>
        <Link href="/auth/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to Login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">
        Send Reset Link
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to Login
        </Link>
      </p>
    </form>
  )
}