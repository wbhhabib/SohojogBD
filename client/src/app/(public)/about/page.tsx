
import Link from 'next/link'
import { Eye, TrendingUp, Users, ShieldCheck, Zap, HeartHandshake } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const STATS = [
  { value: '৳2.4 কোটি', label: 'Total Raised',   sub: 'and counting'      },
  { value: '1,200+',     label: 'Campaigns',       sub: 'launched to date'  },
  { value: '15,000+',    label: 'Donors',           sub: 'across Bangladesh' },
  { value: '98%',        label: 'Success Rate',     sub: 'funded campaigns'  },
]

const VALUES = [
  {
    icon: Eye,
    title: 'Transparency',
    description:
      'Every taka is accounted for. Donors can track exactly where their contributions go, with real-time updates from campaign creators.',
  },
  {
    icon: TrendingUp,
    title: 'Impact',
    description:
      'We measure success by lives changed. From flood relief to education funds, every campaign is built around meaningful, measurable outcomes.',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'We believe in the power of collective action. Our platform connects compassionate donors with passionate changemakers across Bangladesh.',
  },
]

const TEAM = [
  {
    initials: 'RA',
    name: 'Rahim Uddin Ahmed',
    role: 'Co-founder & CEO',
    bio: 'Former BRAC program director with 12 years in social development.',
    color: 'bg-emerald-600',
  },
  {
    initials: 'FB',
    name: 'Fatema Begum',
    role: 'Co-founder & CTO',
    bio: 'Full-stack engineer who built fintech platforms for Southeast Asia.',
    color: 'bg-teal-600',
  },
  {
    initials: 'KH',
    name: 'Karim Hossain',
    role: 'Head of Partnerships',
    bio: 'Connects NGOs and corporates to amplify campaign reach nationwide.',
    color: 'bg-blue-600',
  },
  {
    initials: 'NJ',
    name: 'Nusrat Jahan',
    role: 'Head of Community',
    bio: 'Champions donor trust and creator support across every campaign.',
    color: 'bg-purple-600',
  },
]

const WHY_US = [
  {
    icon: ShieldCheck,
    title: 'Secure & Verified',
    description:
      'All campaigns go through a verification process before going live. Donor funds are held securely and released only upon milestone confirmation.',
  },
  {
    icon: Zap,
    title: 'Fast & Easy Setup',
    description:
      'Launch a campaign in under 10 minutes. Our step-by-step creator flow guides you from idea to live fundraiser with zero technical knowledge needed.',
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated Support',
    description:
      'Our team is available to help creators craft compelling stories and assist donors with any questions — in Bangla and English.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
<section className="bg-emerald-50 border-b border-emerald-100">
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
              Our Story
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
              Empowering Bangladesh Through{' '}
              <span className="text-emerald-600">Collective Giving</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We started with a simple belief — that every Bangladeshi deserves access
              to support in times of need. Our platform removes barriers between
              generous donors and the causes that need them most, building a stronger,
              more compassionate Bangladesh one campaign at a time.
            </p>
          </div>
        </section>
<section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-800">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>
<section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Our Mission &amp; Values
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              Everything we build is guided by three core principles that keep
              donors, creators, and beneficiaries at the centre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 flex flex-col items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
<section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Meet the Team</h2>
            <p className="text-slate-500 text-sm mt-2">
              Passionate people working to build a better Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center gap-3"
              >
                <div
                  className={`w-16 h-16 rounded-full ${member.color} flex items-center justify-center shrink-0`}
                >
                  <span className="text-lg font-bold text-white">{member.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{member.name}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">{member.role}</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
<section className="bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Why Choose Us
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
                We&apos;ve built every feature with the Bangladesh context in mind —
                because local problems deserve local solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WHY_US.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
<section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="bg-emerald-700 rounded-2xl px-8 py-14 md:px-16 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Join us today
            </h2>
            <p className="text-emerald-100 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Whether you want to raise funds for a cause or support someone in need —
              there&apos;s a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/creator/campaigns/create"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-colors shadow-sm"
              >
                Start Campaign
              </Link>
              <Link
                href="/campaigns"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white hover:bg-emerald-600 font-semibold text-sm transition-colors"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}