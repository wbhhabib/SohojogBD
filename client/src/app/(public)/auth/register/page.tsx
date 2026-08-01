
'use client'

import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
<div className="hidden lg:flex lg:w-1/2 bg-emerald-700 flex-col justify-between p-12">
<div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">FundRaise BD</span>
          </div>
          <p className="text-emerald-200 text-sm mt-2 leading-relaxed">
            Empowering Bangladesh through collective giving.
          </p>
        </div>
<div className="flex flex-col gap-4">
          <h2 className="text-white text-xl font-bold mb-1">
            Join thousands of changemakers
          </h2>
          {[
            { step: '01', title: 'Create your free account', desc: 'Sign up in under 2 minutes — no fees, no hidden charges.' },
            { step: '02', title: 'Launch your campaign', desc: 'Tell your story and set a fundraising goal in any category.' },
            { step: '03', title: 'Receive donations', desc: 'Get funds directly to your bank or mobile wallet instantly.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{step}</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-emerald-200 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
<div className="grid grid-cols-3 gap-3">
          {[
            { value: '1,200+', label: 'Campaigns' },
            { value: '15,000+', label: 'Donors' },
            { value: '৳2.4 কোটি', label: 'Raised' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 border border-white/20 text-center">
              <p className="text-lg font-bold text-white leading-tight">{value}</p>
              <p className="text-emerald-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
<div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
<div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-slate-900 text-lg font-bold">FundRaise BD</span>
          </div>
<div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Join our community and start making a difference today.
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}