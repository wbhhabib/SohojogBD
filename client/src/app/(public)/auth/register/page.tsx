
'use client'

import Link from 'next/link'
import { Handshake, Heart, Store, Sprout, GraduationCap, Siren } from 'lucide-react'
import RegisterForm from '@/components/auth/RegisterForm'

const MODULES = [
  { icon: Heart, name: 'Campaigns', desc: 'Raise funds for medical bills, education, or emergencies.' },
  { icon: Store, name: 'GrowTogether', desc: 'Small businesses pool orders to buy at wholesale prices.' },
  { icon: Sprout, name: 'Plant Sharing', desc: 'Give away or claim surplus plants and seedlings, free.' },
  { icon: Siren, name: 'Emergency Response', desc: 'Reach verified nearby responders when it matters most.' },
  { icon: GraduationCap, name: 'Courses', desc: 'Local training providers post courses by branch.' },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          backgroundColor: '#0F3D2E',
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 12px)',
        }}
      >
        <svg
          className="absolute -bottom-20 -right-20 w-96 h-96 opacity-[0.06] pointer-events-none"
          viewBox="0 0 200 200" fill="none" stroke="white" strokeWidth="1.5"
        >
          <path d="M100 20 C60 20 30 55 30 95 C30 145 65 175 100 185 C135 175 170 145 170 95 C170 55 140 20 100 20 Z" />
          <path d="M100 40 C100 90 100 140 100 180" />
          <path d="M100 70 C75 70 55 85 45 105" />
          <path d="M100 110 C125 110 145 125 155 145" />
        </svg>

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C1440E' }}>
              <Handshake className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">SohojogBD</span>
          </div>
          <p className="text-emerald-100/70 text-sm mt-3 leading-relaxed max-w-xs">
            One platform, many ways to help — and be helped.
          </p>
        </div>

        <div className="relative">
          <h2
            className="text-white text-[26px] leading-snug font-medium mb-7 max-w-sm"
            style={{ fontFamily: "'Lora', 'Georgia', serif" }}
          >
            Whatever your community needs, there&apos;s a place for it here.
          </h2>
          <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {MODULES.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="flex items-start gap-3.5 py-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/10">
                  <Icon size={15} className="text-emerald-50" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{name}</p>
                  <p className="text-emerald-100/60 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-emerald-100/50 text-xs italic max-w-xs" style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
          Built around the ways Bangladeshis already help each other — just easier to find and organize.
        </p>
      </div>

      <div
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12"
        style={{ backgroundColor: '#F7F3EA' }}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C1440E' }}>
              <Handshake className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-slate-900 text-lg font-bold">SohojogBD</span>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-sm shadow-black/5 p-8">
            <div className="mb-6">
              <h1
                className="text-3xl font-bold text-slate-900"
                style={{ fontFamily: "'Lora', 'Georgia', serif" }}
              >
                Create your account
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Join our community and start making a difference today.
              </p>
            </div>

            <RegisterForm />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold transition-colors"
              style={{ color: '#C1440E' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}