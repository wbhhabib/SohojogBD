
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Check, X } from 'lucide-react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { authApi } from '@/lib/api'

interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
]

function getStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: '', width: 'w-0' }
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  if (passed === 3) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' }
  if (passed === 2) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/3' }
  return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' }
}

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const strength = getStrength(password)
  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')


    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (!allRulesPassed) {
      setError('Password does not meet the requirements below.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const data = await authApi.register({
        name: name.trim(),
        email,
        password,
      })

      if (data.success) {
        setEmailSent(true)
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  if (emailSent) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <Mail size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Check your email</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            We sent a verification link to{' '}
            <span className="font-medium text-slate-700">{email}</span>.
            <br />
            Click the link to activate your account.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Didn&apos;t receive it? Check your spam folder.
        </p>
        <Link href="/auth/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to Login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Full Name" placeholder="Fatema Begum" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-1.5 space-y-1">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
            </div>
            <p className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
          </div>
        )}
        {password.length > 0 && (
          <ul className="mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(password)
              return (
                <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {passed
                    ? <Check size={12} className="shrink-0" />
                    : <X size={12} className="shrink-0" />
                  }
                  {rule.label}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={`border rounded-lg px-3 py-2 w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 ${confirmPassword && confirmPassword !== password ? 'border-red-400' : 'border-gray-200'
              }`}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {confirmPassword && confirmPassword !== password && (
          <p className="text-xs text-red-600">Passwords do not match</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">
        Create Account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Login
        </Link>
      </p>
    </form>
  )
}