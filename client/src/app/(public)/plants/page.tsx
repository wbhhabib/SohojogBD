'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PlantGrid from '@/components/plant/PlantGrid'
import Pagination from '@/components/ui/pagination'
import { plantApi } from '@/lib/api'
import type { PlantListing } from '@/lib/api'
import { Search, Sprout, Gift, Users } from 'lucide-react'

const PLANT_TYPES = [
    'Flowering', 'Fruit', 'Vegetable', 'Succulent',
    'Herb', 'Tree Sapling', 'Indoor', 'Seeds', 'Other',
]

const TYPE_ICONS: Record<string, string> = {
    All: '🌟', Flowering: '🌸', Fruit: '🍊', Vegetable: '🥬', Succulent: '🌵',
    Herb: '🌿', 'Tree Sapling': '🌳', Indoor: '🪴', Seeds: '🌱', Other: '🍃',
}

const PAGE_SIZE = 9

export default function PlantsPage() {
    const [search, setSearch] = useState('')
    const [plantType, setPlantType] = useState('All')
    const [page, setPage] = useState(1)
    const [listings, setListings] = useState<PlantListing[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchListings = useCallback(() => {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(PAGE_SIZE))
        if (search.trim()) params.set('search', search.trim())
        if (plantType !== 'All') params.set('plantType', plantType)

        plantApi.getAll(params.toString())
            .then((res) => {
                if (res.success) {
                    setListings(res.data)
                    setTotal(res.meta?.total ?? res.data.length)
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [search, plantType, page])

    useEffect(() => { fetchListings() }, [fetchListings])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const handleType = (val: string) => { setPlantType(val); setPage(1) }

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f9fafb 120px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #86efac, #34d399)' }} />

                    <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            <Sprout size={12} />
                            PlantEnthusiasts
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    Share a Plant,<br />
                                    <span className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #059669, #34d399)' }}>
                                        Grow a Community
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-base max-w-lg">
                                    Give away extra saplings, cuttings, or seeds — and pick up something new
                                    from a fellow plant lover nearby.
                                </p>
                            </div>
                            <div className="flex gap-4 shrink-0">
                                <a href="/plants/create"
                                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
                                    <Gift size={14} />
                                    Give Away a Plant
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-emerald-100/60 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by plant name, location…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-gray-800
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300
                  focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                <section className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-7">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['All', ...PLANT_TYPES].map((type) => {
                                const isActive = type === plantType
                                const emoji = TYPE_ICONS[type] ?? '🌱'
                                return (
                                    <button
                                        key={type}
                                        onClick={() => handleType(type)}
                                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                                                ? 'text-white shadow-md shadow-emerald-200'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                                            }`}
                                        style={isActive ? { background: 'linear-gradient(135deg, #059669, #34d399)' } : {}}
                                    >
                                        <span>{emoji}</span>
                                        {type}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-gray-500">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    Loading listings…
                                </span>
                            ) : (
                                <>
                                    <span className="font-bold text-gray-800">{total}</span> plant{total !== 1 ? 's' : ''} available
                                </>
                            )}
                        </p>
                        <a href="/plants/my" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                            <Users size={13} />
                            My listings &amp; requests
                        </a>
                    </div>

                    <PlantGrid listings={listings} loading={isLoading} />

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