'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PoolGrid from '@/components/growtogether/PoolGrid'
import Pagination from '@/components/ui/pagination'
import { getPools, POOL_CATEGORIES, CATEGORY_EMOJI, DIVISIONS } from '@/lib/growTogetherApi'
import type { WholesalePool, PoolCategory, Division } from '@/lib/growTogetherApi'
import { Search, Store, PackagePlus, Users, GraduationCap } from 'lucide-react'

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
            <main className="min-h-screen" style={{ background: '#FBF3E7' }}>
                {/* ── Hero: a bazaar signboard ───────────────────────── */}
                <section className="relative overflow-hidden" style={{ background: '#12293D' }}>
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(135deg, #E8A33D 0px, #E8A33D 1px, transparent 1px, transparent 14px)',
                        }}
                    />
                    <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-10 md:pt-20 md:pb-14">
                        <div className="inline-flex items-center gap-2 border text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
                            style={{ borderColor: 'rgba(232,163,61,0.4)', color: '#E8A33D', background: 'rgba(232,163,61,0.08)' }}>
                            <Store size={12} />
                            GrowTogether
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1
                                    className="text-3xl md:text-5xl font-bold leading-tight mb-3 text-white"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    Buy wholesale,<br />
                                    <span style={{ color: '#E8A33D' }}>not alone.</span>
                                </h1>
                                <p className="text-slate-300 text-base max-w-lg">
                                    Small entrepreneurs pool their orders to unlock factory and wholesale
                                    rates — then take it to WhatsApp to sort out the rest.
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <a href="/grow-together/create"
                                    className="inline-flex items-center gap-2 text-[#12293D] text-sm font-bold px-5 py-3 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #E8A33D, #D98E2B)' }}>
                                    <PackagePlus size={16} />
                                    Start a Pool
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── free courses teaser (coming soon) ─────────────── */}
                <section className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
                    <div
                        className="flex items-center gap-3 rounded-2xl px-5 py-4"
                        style={{ background: '#FFFDF9', border: '1px dashed #E9D9B8' }}
                    >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F0E4CE' }}>
                            <GraduationCap size={16} style={{ color: '#8A5A20' }} />
                        </div>
                        <p className="text-sm" style={{ color: '#6B5B44' }}>
                            <span className="font-semibold" style={{ color: '#2A2118' }}>Free skill courses</span> from
                            partner organizations are coming to GrowTogether next — for now, this page is all about wholesale pooling.
                        </p>
                    </div>
                </section>

                {/* ── search ─────────────────────────────────────────── */}
                <div className="sticky top-0 z-20 backdrop-blur-md border-b" style={{ background: 'rgba(251,243,231,0.92)', borderColor: '#E9D9B8' }}>
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#A88860' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search product, category, or area…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    border: '1px solid #E9D9B8',
                                    background: '#FFFDF9',
                                    color: '#2A2118',
                                }}
                            />
                        </div>
                        <select
                            value={division}
                            onChange={(e) => handleDivision(e.target.value)}
                            className="text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all shrink-0"
                            style={{ border: '1px solid #E9D9B8', background: '#FFFDF9', color: '#2A2118' }}
                        >
                            <option value="All">All areas</option>
                            {DIVISIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <section className="max-w-7xl mx-auto px-4 py-8">
                    {/* category chips */}
                    <div className="mb-7">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {(['All', ...POOL_CATEGORIES] as const).map((cat) => {
                                const isActive = cat === category
                                const emoji = cat === 'All' ? '🌟' : CATEGORY_EMOJI[cat as PoolCategory]
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategory(cat as PoolCategory | 'All')}
                                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200"
                                        style={
                                            isActive
                                                ? { background: 'linear-gradient(135deg, #C8862B, #E8A33D)', color: '#FFFDF9' }
                                                : { background: '#FFFDF9', border: '1px solid #E9D9B8', color: '#6B5B44' }
                                        }
                                    >
                                        <span>{emoji}</span>
                                        {cat}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm" style={{ color: '#6B5B44' }}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: '#E8A33D', borderTopColor: 'transparent' }} />
                                    Loading pools…
                                </span>
                            ) : (
                                <>
                                    <span className="font-bold" style={{ color: '#2A2118' }}>{total}</span> pool{total !== 1 ? 's' : ''} found
                                    {openCount > 0 && !isLoading && <span className="ml-1">· {openCount} still open</span>}
                                </>
                            )}
                        </p>
                        <a href="/grow-together/my" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#B4472A' }}>
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
            </main>
            <Footer />
        </>
    )
}