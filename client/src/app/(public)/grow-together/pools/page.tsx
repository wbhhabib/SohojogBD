'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PoolGrid from '@/components/growtogether/PoolGrid'
import Pagination from '@/components/ui/pagination'
import { getPools, POOL_CATEGORIES, CATEGORY_EMOJI, DIVISIONS } from '@/lib/growTogetherApi'
import type { WholesalePool, PoolCategory, Division } from '@/lib/growTogetherApi'
import { Search, ShoppingBag, PackagePlus, Users, GraduationCap } from 'lucide-react'

const PAGE_SIZE = 9

export default function GrowTogetherPage() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<PoolCategory | 'All'>('All')
    const [division, setDivision] = useState<Division | 'All'>('All')
    const [page, setPage] = useState(1)
    const [pools, setPools] = useState<WholesalePool[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchPools = useCallback(() => {
        setIsLoading(true)
        getPools({ search, category, division, page, limit: PAGE_SIZE })
            .then((res) => {
                if (res.success) {
                    setPools(res.data.pools)
                    setTotal(res.data.total)
                }
            })
            .finally(() => setIsLoading(false))
    }, [search, category, division, page])

    useEffect(() => { fetchPools() }, [fetchPools])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const handleCategory = (val: PoolCategory | 'All') => { setCategory(val); setPage(1) }
    const handleDivision = (val: string) => { setDivision(val as Division | 'All'); setPage(1) }

    const openCount = pools.filter((p) => p.status === 'OPEN').length

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f9fafb 120px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #fcd34d, #fb923c)' }} />
                    <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #86efac, #34d399)' }} />

                    <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
                        <a href="/grow-together" className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 hover:bg-amber-100 transition-colors">
                            <ShoppingBag size={12} />
                            GrowTogether · Wholesale Pooling
                        </a>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    Buy wholesale,<br />
                                    <span className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #d97706, #f97316)' }}>
                                        not alone.
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-base max-w-lg">
                                    Small entrepreneurs pool their orders to unlock factory and wholesale
                                    rates — then take it to WhatsApp to sort out the rest.
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <a href="/grow-together/pools/create"
                                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #d97706, #f97316)' }}>
                                    <PackagePlus size={14} />
                                    Start a Pool
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── cross-link to Free Courses ─────────────── */}
                <section className="max-w-7xl mx-auto px-4 -mt-2 mb-6">

                    <a href="/grow-together/courses"
                        className="flex items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-white px-5 py-4 hover:bg-emerald-50/40 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
                            <GraduationCap size={16} className="text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Looking to learn a skill instead?</span>{' '}
                            Browse free courses from verified organizations across Bangladesh →
                        </p>
                    </a>
                </section>

                <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-amber-100/60 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search product, category, or area…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-amber-200/80 bg-amber-50/40 text-gray-800
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300
                  focus:bg-white transition-all"
                            />
                        </div>
                        <select
                            value={division}
                            onChange={(e) => handleDivision(e.target.value)}
                            className="text-sm px-3.5 py-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 focus:bg-white transition-all shrink-0"
                        >
                            <option value="All">All areas</option>
                            {DIVISIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <section className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-7">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {(['All', ...POOL_CATEGORIES] as const).map((cat) => {
                                const isActive = cat === category
                                const emoji = cat === 'All' ? '🌟' : CATEGORY_EMOJI[cat as PoolCategory]
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategory(cat as PoolCategory | 'All')}
                                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                                                ? 'text-white shadow-md shadow-amber-200'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50'
                                            }`}
                                        style={isActive ? { background: 'linear-gradient(135deg, #d97706, #f97316)' } : {}}
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
                                    <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    Loading pools…
                                </span>
                            ) : (
                                <>
                                    <span className="font-bold text-gray-800">{total}</span> pool{total !== 1 ? 's' : ''} found
                                    {openCount > 0 && !isLoading && <span className="ml-1">· {openCount} still open</span>}
                                </>
                            )}
                        </p>
                        <a href="/grow-together/pools/my" className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700">
                            <Users size={13} />
                            My pools &amp; interests
                        </a>
                    </div>

                    <PoolGrid pools={pools} loading={isLoading} />

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
            </main >
            <Footer />
        </>
    )
}