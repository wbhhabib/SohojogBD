
'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignGrid from '@/components/campaign/CampaignGrid'
import Pagination from '@/components/ui/pagination'
import { campaignApi } from '@/lib/api'
import type { Campaign } from '@/lib/api'
import { Search, SlidersHorizontal, Sparkles, Heart, Users, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  'Education', 'Medical', 'Environment',
  'Disaster Relief', 'Animal Welfare', 'Community',
]

const SORT_OPTIONS = [
  { value: 'newest',      label: '✨ Newest'      },
  { value: 'most-funded', label: '🔥 Most Funded'  },
  { value: 'ending-soon', label: '⏰ Ending Soon'  },
  { value: 'most-donors', label: '❤️ Most Donors'  },
]

const CATEGORY_ICONS: Record<string, string> = {
  All: '🌟', Education: '📚', Medical: '❤️‍🩹',
  'Disaster Relief': '🆘', Environment: '🌿',
  'Animal Welfare': '🐾', Community: '🤝',
}

const PAGE_SIZE = 6

export default function CampaignsPage() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [sort,     setSort]     = useState('newest')
  const [page,     setPage]     = useState(1)
  const [campaigns,  setCampaigns]  = useState<Campaign[]>([])
  const [total,      setTotal]      = useState(0)
  const [isLoading,  setIsLoading]  = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchCampaigns = useCallback(() => {
    setIsLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(PAGE_SIZE))
    params.set('status', 'active')
    if (search.trim())      params.set('search',   search.trim())
    if (category !== 'All') params.set('category', category)
    params.set('sort', sort)

    campaignApi.getAll(params.toString())
      .then((res: any) => {
        if (res.success) {
          setCampaigns(res.data)
          setTotal(res.meta?.total ?? res.data.length)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [search, category, sort, page])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const handleSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const handleCategory = (val: string) => { setCategory(val); setPage(1) }
  const handleSort     = (val: string) => { setSort(val);     setPage(1) }

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff7f3 0%, #f9fafb 120px)' }}>
<section className="relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #fca5a5, #fb923c)' }} />
          <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #86efac, #34d399)' }} />

          <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={12} />
              Discover Causes Across Bangladesh
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3"
                  style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                  Every Donation<br />
                  <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(135deg, #f43f5e, #fb923c)' }}>
                    Changes a Life
                  </span>
                </h1>
                <p className="text-gray-500 text-base max-w-lg">
                  Browse verified campaigns helping real people across Bangladesh.
                  Small or large — every contribution matters.
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                {[
                  { icon: Heart,      label: 'Causes',  value: total > 0 ? `${total}+` : '…', color: 'text-rose-500',    bg: 'bg-rose-50'    },
                  { icon: Users,      label: 'Donors',  value: '12K+',                          color: 'text-violet-500', bg: 'bg-violet-50'  },
                  { icon: TrendingUp, label: 'Raised',  value: '৳4.2M',                         color: 'text-emerald-600',bg: 'bg-emerald-50' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={`flex flex-col items-center ${bg} rounded-xl px-4 py-3 min-w-[72px]`}>
                    <Icon size={16} className={color} />
                    <span className="text-sm font-bold text-gray-900 mt-1">{value}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
<div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-rose-100/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search campaigns, causes, stories…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-rose-200/80 bg-rose-50/40 text-gray-800
                    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300
                    focus:bg-white transition-all"
                />
                {search && (
                  <button onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal size={14} className="text-gray-400" />
                <select
                  value={sort}
                  onChange={(e) => handleSort(e.target.value)}
                  className="text-sm border border-rose-200/80 rounded-xl px-3 py-2.5 text-gray-700 bg-rose-50/40
                    focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer transition-all hover:bg-rose-50"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
<section className="max-w-7xl mx-auto px-4 py-8">
<div className="mb-7">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', ...CATEGORIES].map((cat) => {
                const isActive = cat === category
                const emoji = CATEGORY_ICONS[cat] ?? '✨'
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategory(cat)}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'text-white shadow-md shadow-rose-200'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #f43f5e, #fb923c)' } : {}}
                  >
                    <span>{emoji}</span>
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
<div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  Loading campaigns…
                </span>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-bold text-gray-800">
                    {campaigns.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                  </span>{' '}
                  of <span className="font-bold text-gray-800">{total}</span> campaign{total !== 1 ? 's' : ''}
                </>
              )}
            </p>
            {(search || category !== 'All') && (
              <button
                onClick={() => { setSearch(''); setCategory('All'); setPage(1) }}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full transition-colors"
              >
                Clear filters ✕
              </button>
            )}
          </div>

          <CampaignGrid campaigns={campaigns} loading={isLoading} />

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </div>
          )}
        </section>
<section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fef3c7 50%, #f0fdf4 100%)' }}>
            <div className="relative">
              <p className="text-3xl mb-3">💝</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Lora', Georgia, serif" }}>
                Have a cause worth sharing?
              </h2>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Start your fundraising campaign today and reach thousands of generous donors across Bangladesh.
              </p>
              <a href="/auth/register"
                className="inline-flex items-center gap-2 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #fb923c)' }}>
                <Heart size={14} fill="white" />
                Start a Campaign
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}