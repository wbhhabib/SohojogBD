'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProviderCard from '@/components/course-provider/ProviderCard'
import CourseGrid from '@/components/growtogether/CourseGrid'
import Pagination from '@/components/ui/pagination'
import Skeleton from '@/components/ui/skeleton'
import { getPublicProviders, INSTITUTION_TYPES, INSTITUTION_TYPE_LABEL } from '@/lib/providerApi'
import type { PublicProvider, InstitutionType } from '@/lib/providerApi'
import { getCourses } from '@/lib/courseApi'
import type { Course } from '@/lib/courseApi'
import { DIVISIONS } from '@/lib/growTogetherApi'
import { Search, Building2, GraduationCap, SlidersHorizontal } from 'lucide-react'

const PAGE_SIZE = 9

export default function CourseProvidersPage() {
    const [search, setSearch] = useState('')
    const [institutionType, setInstitutionType] = useState<InstitutionType | 'All'>('All')
    const [division, setDivision] = useState('All')
    const [page, setPage] = useState(1)
    const [providers, setProviders] = useState<PublicProvider[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const [courses, setCourses] = useState<Course[]>([])
    const [coursesLoading, setCoursesLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchProviders = useCallback(() => {
        setIsLoading(true)
        getPublicProviders({ search, institutionType, division, page, limit: PAGE_SIZE })
            .then((res) => {
                if (res.success) {
                    setProviders(res.data.providers)
                    setTotal(res.data.total)
                }
            })
            .finally(() => setIsLoading(false))
    }, [search, institutionType, division, page])

    const fetchCourses = useCallback(() => {
        setCoursesLoading(true)
        getCourses({ limit: 6 })
            .then((res) => {
                if (res.success) setCourses(res.data.courses)
            })
            .finally(() => setCoursesLoading(false))
    }, [])

    useEffect(() => { fetchProviders() }, [fetchProviders])
    useEffect(() => { fetchCourses() }, [fetchCourses])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const clearFilters = () => {
        setInstitutionType('All')
        setDivision('All')
        setPage(1)
    }
    const activeFilterCount = [institutionType !== 'All', division !== 'All'].filter(Boolean).length

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #6ee7b7, #14b8a6)' }} />

                    <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            <Building2 size={12} />
                            GrowTogether · Course Providers
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3"
                            style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                            Organizations &amp;<br />
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                                Course Providers
                            </span>
                        </h1>
                        <p className="text-gray-500 text-base max-w-lg">
                            Every organization here has been verified by our team — browse their profile to see who
                            they are and which free courses they&apos;re currently running.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search organization name…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 focus:bg-white transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-emerald-200/80 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all shrink-0"
                        >
                            <SlidersHorizontal size={15} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div
                            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40"
                            onClick={() => setShowFilters(false)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-5">Filters</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Type</h4>
                                        <div className="flex flex-col gap-2.5">
                                            {(['All', ...INSTITUTION_TYPES] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setInstitutionType(t as InstitutionType | 'All'); setPage(1) }}
                                                    className={`text-left text-sm ${t === institutionType ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    {t === 'All' ? 'All Types' : INSTITUTION_TYPE_LABEL[t as InstitutionType]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Division</h4>
                                        <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                                            {(['All', ...DIVISIONS] as const).map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => { setDivision(d); setPage(1) }}
                                                    className={`text-left text-sm ${d === division ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    {d === 'All' ? 'All Areas' : d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <button onClick={clearFilters} className="text-sm font-semibold text-gray-500 hover:text-red-600">
                                        Clear all filters
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="text-sm font-bold text-white px-5 py-2 rounded-lg"
                                        style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-gray-500">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    Loading organizations…
                                </span>
                            ) : (
                                <>
                                    <span className="font-bold text-gray-800">{total}</span> organization{total !== 1 ? 's' : ''} found
                                </>
                            )}
                        </p>
                        <a href="/grow-together/courses/provider/branches" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                            <Building2 size={13} />
                            My org &amp; branches
                        </a>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
                        </div>
                    ) : providers.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 text-sm">No verified organizations found.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-10 flex justify-center">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
                        </div>
                    )}
                </section>

                <section className="max-w-7xl mx-auto px-4 mt-6 mb-10 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-lg font-bold text-slate-900">Latest Free Courses</h2>

                        <a href="/grow-together/courses"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                        >
                            <GraduationCap size={15} />
                            See all courses
                        </a>
                    </div>

                    <CourseGrid courses={courses} loading={coursesLoading} />
                </section>
            </main >
            <Footer />
        </>
    )
}