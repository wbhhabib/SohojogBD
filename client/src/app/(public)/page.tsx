
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Rocket, Share2, Heart } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignGrid from '@/components/campaign/CampaignGrid'
import { campaignApi } from '@/lib/api'
import type { Campaign } from '@/lib/api'

const CATEGORIES = [
  { emoji: '🎓', name: 'Education',       count: 142 },
  { emoji: '🏥', name: 'Medical',         count: 98  },
  { emoji: '🌿', name: 'Environment',     count: 67  },
  { emoji: '🆘', name: 'Disaster Relief', count: 54  },
  { emoji: '🐾', name: 'Animal Welfare',  count: 39  },
  { emoji: '🏘️', name: 'Community',       count: 83  },
]

const HOW_IT_WORKS = [
  {
    icon: Rocket,
    step: 1,
    title: 'Create Your Campaign',
    description:
      'Set up your fundraiser in minutes. Add your story, goal amount, and photos to connect with donors.',
  },
  {
    icon: Share2,
    step: 2,
    title: 'Share With Your Network',
    description:
      'Spread the word across WhatsApp, Facebook, and email. Every share brings you closer to your goal.',
  },
  {
    icon: Heart,
    step: 3,
    title: 'Receive Donations',
    description:
      'Watch contributions come in from supporters across Bangladesh and beyond — securely and instantly.',
  },
]

export default function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    campaignApi.getAll('limit=6&status=active')
      .then((res) => {
        if (res.success) setFeaturedCampaigns(res.data)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
<section className="px-4 py-10 md:py-16 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl px-6 py-14 md:px-14 md:py-20 text-center">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
              Bangladesh&apos;s Trusted Fundraising Platform
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto mb-5">
              Help Bangladesh —{' '}
              <span className="text-emerald-600">Raise Funds</span> for Causes
              That Matter
            </h1>

            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Whether it&apos;s education, medical emergencies, disaster relief, or
              community development — our platform empowers every Bangladeshi to
              create change. Start a campaign or support one today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link
                href="/creator/campaigns/create"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                Start a Campaign
              </Link>
              <Link
                href="/campaigns"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors"
              >
                Browse Campaigns
              </Link>
            </div>
<div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { value: '৳2.4 কোটি+', label: 'Raised'    },
                { value: '1,200+',      label: 'Campaigns'  },
                { value: '15,000+',     label: 'Donors'     },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-700">{stat.value}</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
<section className="px-4 py-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Campaigns</h2>
              <p className="text-slate-500 text-sm mt-1">Support causes making a real difference</p>
            </div>
            <Link
              href="/campaigns"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              View All →
            </Link>
          </div>

          <CampaignGrid campaigns={featuredCampaigns} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              View All Campaigns →
            </Link>
          </div>
          <div className="mt-8 text-center hidden sm:block">
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors"
            >
              View All Campaigns
            </Link>
          </div>
        </section>
<section className="px-4 py-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
            <p className="text-slate-500 text-sm mt-1">Find campaigns that align with your values</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/campaigns?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-sm p-5 flex flex-col items-center text-center gap-2 transition-all"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors leading-snug">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400">{cat.count} campaigns</span>
              </Link>
            ))}
          </div>
        </section>
<section className="px-4 py-10 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-1">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-emerald-100 z-0" />

            {HOW_IT_WORKS.map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                className="relative z-10 bg-white rounded-xl border border-gray-200 p-7 flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center mb-4 shadow-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-7 left-7 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700">{step}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>
<section className="px-4 py-10 max-w-7xl mx-auto pb-16">
          <div className="bg-emerald-700 rounded-2xl px-8 py-14 md:px-16 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Ready to make a difference?
            </h2>
            <p className="text-emerald-100 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Join thousands of Bangladeshis who are already changing lives. Start
              your campaign today — it only takes a few minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/creator/campaigns/create"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors shadow-sm"
              >
                Start Campaign
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white hover:bg-emerald-600 font-semibold text-sm transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}