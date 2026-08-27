'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Rocket, Share2, Heart, Handshake, Sprout, ShoppingBasket,
  UserSearch, Syringe, ArrowRight, Users, ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignGrid from '@/components/campaign/CampaignGrid'
import PlantGrid from '@/components/plant/PlantGrid'
import type { Campaign, PlantListing } from '@/lib/api'

interface Initiative {
  icon: typeof Heart
  title: string
  tagline: string
  description: string
  href: string
  live: boolean
  iconWrap: string
  iconColor: string
  ring: string
}

const INITIATIVES: Initiative[] = [
  {
    icon: Heart,
    title: 'Campaign',
    tagline: 'Fundraising',
    description: 'Start or support fundraising campaigns for medical, education, disaster relief and community causes.',
    href: '/campaigns',
    live: true,
    iconWrap: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ring: 'hover:border-emerald-400',
  },
  {
    icon: Handshake,
    title: 'BDCare',
    tagline: 'Volunteering Network',
    description: 'Join hands with volunteering organizations, become a volunteer, and stay updated on every activity.',
    href: '/bdcare',
    live: true,
    iconWrap: 'bg-sky-100',
    iconColor: 'text-sky-600',
    ring: 'hover:border-sky-400',
  },
  {
    icon: Sprout,
    title: 'PlantEnthusists',
    tagline: 'Free Plant Giveaway',
    description: 'Students collect free plants \u2014 growing a love for nature and their country, away from bad influences.',
    href: '/plants',
    live: true,
    iconWrap: 'bg-green-100',
    iconColor: 'text-green-600',
    ring: 'hover:border-green-400',
  },
  {
    icon: ShoppingBasket,
    title: 'GrowTogether',
    tagline: 'Wholesale Buying & Free Courses',
    description: 'Small entrepreneurs pool orders to unlock wholesale rates together \u2014 free skill courses from partner organizations are coming soon.',
    href: '/grow-together',
    live: true,
    iconWrap: 'bg-amber-100',
    iconColor: 'text-amber-600',
    ring: 'hover:border-amber-400',
  },
  {
    icon: UserSearch,
    title: 'Aponjon',
    tagline: 'Family Finder',
    description: 'Helping people who lost touch with family find their way back home, together as a community.',
    href: '/contact',
    live: false,
    iconWrap: 'bg-rose-100',
    iconColor: 'text-rose-600',
    ring: 'hover:border-rose-400',
  },
  {
    icon: Syringe,
    title: 'Vaccination',
    tagline: 'Poultry Vaccine Pooling',
    description: 'Rural families pool together to vaccinate their hash-murgi-kobutor at lower cost, protecting Bangladesh\u2019s protein supply.',
    href: '/contact',
    live: false,
    iconWrap: 'bg-teal-100',
    iconColor: 'text-teal-600',
    ring: 'hover:border-teal-400',
  },
]

const MISSION_PILLARS = [
  {
    icon: Users,
    title: 'Community First',
    description: 'Neighbors helping neighbors — not top-down charity, but everyday people solving everyday problems together.',
  },
  {
    icon: Sprout,
    title: 'Youth & Environment',
    description: 'Programs like PlantEnthusists keep students connected to nature and away from drugs and bad company.',
  },
  {
    icon: Handshake,
    title: 'Shared Prosperity',
    description: 'GrowTogether and Vaccination let small entrepreneurs and rural families save more by pooling resources.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Transparency',
    description: 'Every campaign, listing, and pool stays visible to the community it serves — no hidden middlemen.',
  },
]


const HOW_IT_WORKS = [
  {
    icon: Rocket,
    step: 1,
    title: 'Pick Your Initiative',
    description:
      'Choose the initiative that fits — start a campaign, give away a plant, join a volunteer group, and more.',
  },
  {
    icon: Share2,
    step: 2,
    title: 'Share With Your Network',
    description:
      'Spread the word across WhatsApp, Facebook, and email. Every share brings more people into your effort.',
  },
  {
    icon: Heart,
    step: 3,
    title: 'See the Impact',
    description:
      'Watch support come in — donations, volunteers, plant requests, or new members — from across Bangladesh.',
  },
]

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

export default function HomePage() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([])
  const [featuredPlants, setFeaturedPlants] = useState<PlantListing[]>([])

  useEffect(() => {
    fetch(`${BASE_URL}/campaigns?limit=3&status=active`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setFeaturedCampaigns(res.data)
      })
      .catch(() => { })

    fetch(`${BASE_URL}/plants?limit=3`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setFeaturedPlants(res.data)
      })
      .catch(() => { })
  }, [])

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <section className="px-4 py-10 md:py-16 max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl px-6 py-14 md:px-14 md:py-20 text-center">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
                <svg
                  width="18"
                  height="13"
                  viewBox="0 0 20 14"
                  className="rounded-[2px] shadow-sm shrink-0"
                  aria-hidden="true"
                >
                  <rect width="20" height="14" fill="#006A4E" />
                  <circle cx="9" cy="7" r="4.6" fill="#F42A41" />
                </svg>
                Bangladesh&apos;s Community Support Platform
              </span>

              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto mb-5">
                Together, We Build a{' '}
                <span className="text-emerald-600">Culture of Support</span>
              </h1>

              <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                SohojogBD brings fundraising, volunteering, plant giveaways,
                group buying, family reunification, free skill courses, and
                community vaccination together — one platform where every
                Bangladeshi can give and get social support.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                <Link
                  href="/creator/campaigns/create"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Start a Campaign
                </Link>
                <Link
                  href="#initiatives"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors"
                >
                  Explore All Initiatives
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { value: '৳2.4 কোটি+', label: 'Raised' },
                  { value: '1,200+', label: 'Campaigns' },
                  { value: '15,000+', label: 'Donors' },
                  { value: '6', label: 'Initiatives' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-emerald-700">{stat.value}</p>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-10 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
              Why SohojogBD
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Built for how Bangladesh actually helps each other
            </h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              SohojogBD is built as a social support platform for Bangladesh —
              not just a place to ask for money. Fundraising, volunteering,
              plant giveaways, group buying, family reunification, free
              skill courses, and community vaccination all live here
              together, because real support looks different for every
              family, student, and small business in Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MISSION_PILLARS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3"
              >
                <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="initiatives" className="px-4 py-10 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Our Initiatives</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">
              Pick your way to help — big or small, every initiative matters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INITIATIVES.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group relative bg-white rounded-xl border border-gray-200 ${item.ring} hover:shadow-md p-6 flex flex-col gap-3 transition-all`}
                >
                  {!item.live && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold tracking-wide uppercase">
                      Coming Soon
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-lg ${item.iconWrap} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                      {item.tagline}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                    {item.live ? 'Explore' : 'Learn More'} <ArrowRight size={15} />
                  </span>
                </Link>
              )
            })}
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Plants</h2>
              <p className="text-slate-500 text-sm mt-1">Free saplings, cuttings, and seeds from fellow plant lovers</p>
            </div>
            <Link
              href="/plants"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              View All →
            </Link>
          </div>

          <PlantGrid listings={featuredPlants} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/plants"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              View All Plants →
            </Link>
          </div>
          <div className="mt-8 text-center hidden sm:block">
            <Link
              href="/plants"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors"
            >
              View All Plants
            </Link>
          </div>
        </section>
        <section className="px-4 py-10 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-1">Three simple steps, whichever initiative you choose</p>
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
              Join thousands of Bangladeshis who are already showing up for
              each other — in whichever way fits them best. It only takes a
              few minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="#initiatives"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors shadow-sm"
              >
                Explore Initiatives
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