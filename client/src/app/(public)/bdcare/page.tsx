'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OrgGrid from '@/components/org/OrgGrid'
import EventCard from '@/components/org/EventCard'
import type { OrgUpdate } from '@/lib/api'
import Pagination from '@/components/ui/pagination'
import { orgApi } from '@/lib/api'
import type { Organization } from '@/lib/api'
import { Search, Handshake, PlusCircle, Users } from 'lucide-react'

const ORG_CATEGORIES = [
    'Education', 'Health', 'Disaster Relief', 'Environment',
    'Animal Welfare', 'Community', 'Poverty', 'Youth Development', 'Other',
]
const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh']

const CATEGORY_ICONS: Record<string, string> = {
    All: '🌟', Education: '🎓', Health: '🏥', 'Disaster Relief': '🆘', Environment: '🌿',
    'Animal Welfare': '🐾', Community: '🏘️', Poverty: '🤝', 'Youth Development': '🌟', Other: '📌',
}

const PAGE_SIZE = 9

export default function BDCarePage() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [page, setPage] = useState(1)
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [events, setEvents] = useState<OrgUpdate[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [eventDivision, setEventDivision] = useState('')
    const [eventDistrict, setEventDistrict] = useState('')

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchOrgs = useCallback(() => {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(PAGE_SIZE))
        if (search.trim()) params.set('search', search.trim())
        if (category !== 'All') params.set('category', category)

        orgApi.getAll(params.toString())
            .then((res) => {
                if (res.success) {
                    setOrgs(res.data)
                    setTotal(res.meta?.total ?? res.data.length)
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [search, category, page])

    const fetchEvents = useCallback(() => {
        setEventsLoading(true)
        const params = new URLSearchParams()
        params.set('limit', '9')
        if (eventDivision) params.set('division', eventDivision)
        if (eventDistrict.trim()) params.set('district', eventDistrict.trim())

        orgApi.getEventsFeed(params.toString())
            .then((res) => {
                if (res.success) setEvents(res.data)
            })
            .catch(() => { })
            .finally(() => setEventsLoading(false))
    }, [eventDivision, eventDistrict])

    useEffect(() => { fetchEvents() }, [fetchEvents])

    useEffect(() => { fetchOrgs() }, [fetchOrgs])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const handleCategory = (val: string) => { setCategory(val); setPage(1) }

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #f9fafb 120px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #7dd3fc, #3b82f6)' }} />

                    <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
                        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            <Handshake size={12} />
                            BDCare
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    Find Your Cause,<br />
                                    <span className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #0284c7, #3b82f6)' }}>
                                        Join the Network
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-base max-w-lg">
                                    Discover volunteering organizations across Bangladesh, join hands,
                                    and stay updated on the causes you care about.
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <a href="/bdcare/sos"
                                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-red-600 hover:bg-red-700">
                                    🆘 Emergency SOS
                                </a>
                                <a href="/bdcare/create"
                                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-sky-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #0284c7, #3b82f6)' }}>
                                    <PlusCircle size={14} />
                                    Register Your Organization
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-sky-100/60 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by organization name, location…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-sky-200/80 bg-sky-50/40 text-gray-800
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300
                  focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-lg font-bold text-slate-900">Regular Events</h2>
                        <div className="flex items-center gap-2">
                            <select
                                value={eventDivision}
                                onChange={(e) => setEventDivision(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                            >
                                <option value="">All Divisions</option>
                                {DIVISIONS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="District"
                                value={eventDistrict}
                                onChange={(e) => setEventDistrict(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-32"
                            />
                        </div>
                    </div>

                    {eventsLoading ? (
                        <p className="text-sm text-slate-400">Loading…</p>
                    ) : events.length === 0 ? (
                        <p className="text-sm text-slate-400">No events found for this area yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </section>
                <section className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-7">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['All', ...ORG_CATEGORIES].map((cat) => {
                                const isActive = cat === category
                                const emoji = CATEGORY_ICONS[cat] ?? '📌'
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategory(cat)}
                                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                                                ? 'text-white shadow-md shadow-sky-200'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50'
                                            }`}
                                        style={isActive ? { background: 'linear-gradient(135deg, #0284c7, #3b82f6)' } : {}}
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
                                    <span className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                                    Loading organizations…
                                </span>
                            ) : (
                                <>
                                    <span className="font-bold text-gray-800">{total}</span> organization{total !== 1 ? 's' : ''} found
                                </>
                            )}
                        </p>
                        <a href="/bdcare/my" className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700">
                            <Users size={13} />
                            My orgs &amp; requests
                        </a>
                    </div>

                    <OrgGrid orgs={orgs} loading={isLoading} />

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