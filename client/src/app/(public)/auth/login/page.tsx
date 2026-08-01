
'use client'

import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
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
<div className="bg-white/10 rounded-2xl p-7 border border-white/20">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-white text-base leading-relaxed mb-5 italic">
            &ldquo;I raised enough to cover my sister&apos;s medical treatment within just 3 days.
            The support from strangers across Bangladesh was overwhelming. This platform
            truly changed our lives.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">NJ</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Nusrat Jahan</p>
              <p className="text-emerald-300 text-xs">Donor & Campaign Creator, Dhaka</p>
            </div>
          </div>
        </div>
<div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-2xl font-bold text-white">15,000+</p>
            <p className="text-emerald-200 text-xs mt-0.5">Donors across Bangladesh</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-2xl font-bold text-white">৳2.4 কোটি</p>
            <p className="text-emerald-200 text-xs mt-0.5">Successfully raised</p>
          </div>
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
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Sign in to your account to continue making a difference.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-slate-500 mt-6">
            New here?{' '}
            <Link
              href="/auth/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Create an account
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}