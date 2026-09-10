'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CourseGrid from '@/components/growtogether/CourseGrid'
import ProviderCard from '@/components/course-provider/ProviderCard'
import Skeleton from '@/components/ui/skeleton'
import Pagination from '@/components/ui/pagination'
import { getCourses, COURSE_CATEGORIES, CATEGORY_EMOJI, COURSE_MODES, MODE_LABEL } from '@/lib/courseApi'
import type { Course, CourseCategory, CourseMode } from '@/lib/courseApi'
import { getPublicProviders, INSTITUTION_TYPES, INSTITUTION_TYPE_LABEL } from '@/lib/providerApi'
import type { PublicProvider, InstitutionType } from '@/lib/providerApi'
import { DIVISIONS } from '@/lib/growTogetherApi'
import { Search, GraduationCap, Megaphone, Building2, SlidersHorizontal, X } from 'lucide-react'

const PAGE_SIZE = 9

export default function CoursesPage() {
    // ── Organizations & Course Providers (top section) ──
    const [search, setSearch] = useState('')
    const [institutionType, setInstitutionType] = useState<InstitutionType | 'All'>('All')
    const [providerDivision, setProviderDivision] = useState('All')
    const [page, setPage] = useState(1)
    const [providers, setProviders] = useState<PublicProvider[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // ── Free Courses (bottom section, like BDCare's "Regular Events") ──
    const [courses, setCourses] = useState<Course[]>([])
    const [coursesLoading, setCoursesLoading] = useState(false)
    const [courseCategory, setCourseCategory] = useState<CourseCategory | 'All'>('All')
    const [courseMode, setCourseMode] = useState<CourseMode | 'All'>('All')
    const [courseDivision, setCourseDivision] = useState('All')
    const [showCourseFilters, setShowCourseFilters] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchProviders = useCallback(() => {
        setIsLoading(true)
        getPublicProviders({ search, institutionType, division: providerDivision, page, limit: PAGE_SIZE })
            .then((res) => {
                if (res.success) {
                    setProviders(res.data.providers)
                    setTotal(res.data.total)
                }
            })
            .finally(() => setIsLoading(false))
    }, [search, institutionType, providerDivision, page])

    const fetchCourses = useCallback(() => {
        setCoursesLoading(true)
        getCourses({ skillCategory: courseCategory, mode: courseMode, division: courseDivision, limit: 9 })
            .then((res) => {
                if (res.success) setCourses(res.data.courses)
            })
            .finally(() => setCoursesLoading(false))
    }, [courseCategory, courseMode, courseDivision])

    useEffect(() => { fetchProviders() }, [fetchProviders])
    useEffect(() => { fetchCourses() }, [fetchCourses])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const handleInstitutionType = (val: InstitutionType | 'All') => { setInstitutionType(val); setPage(1) }
    const clearFilters = () => {
        setInstitutionType('All')
        setProviderDivision('All')
        setPage(1)
    }
    const activeFilterCount = [institutionType !== 'All', providerDivision !== 'All'].filter(Boolean).length

    const handleCourseCategory = (val: CourseCategory | 'All') => setCourseCategory(val)
    const handleCourseMode = (val: CourseMode | 'All') => setCourseMode(val)
    const clearCourseFilters = () => {
        setCourseCategory('All')
        setCourseMode('All')
        setCourseDivision('All')
    }
    const activeCourseFilterCount = [courseCategory !== 'All', courseMode !== 'All', courseDivision !== 'All'].filter(Boolean).length

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #6ee7b7, #14b8a6)' }} />

                    <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            <GraduationCap size={12} />
                            GrowTogether · Free Courses
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    Learn a skill,<br />
                                    <span className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                                        free of cost.
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-base max-w-lg">
                                    Verified organizations across Bangladesh (TTCs, youth development
                                    centers, TVET institutes, and more) offering free skill training.
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <a href="/grow-together/courses/provider/register"
                                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-emerald-600 hover:bg-emerald-700">
                                    <Building2 size={14} />
                                    Register Organization
                                </a>
                                <a href="/grow-together/courses/post"
                                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                    style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                                    <Megaphone size={14} />
                                    Post a Course
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
                                placeholder="Search by organization name, location…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-gray-800
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300
                  focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Organizations & Course Providers ── */}
                <section className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <h2 className="text-lg font-bold text-slate-900">Organizations &amp; Course Providers</h2>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all"
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
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Search filters</h3>
                                    <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                                            Institution Type
                                        </h4>
                                        <div className="flex flex-col gap-2.5">
                                            {(['All', ...INSTITUTION_TYPES] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => handleInstitutionType(t as InstitutionType | 'All')}
                                                    className={`text-left text-sm ${t === institutionType ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    {t === 'All' ? 'All Types' : INSTITUTION_TYPE_LABEL[t as InstitutionType]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                                            Location
                                        </h4>
                                        <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                                            {(['All', ...DIVISIONS] as const).map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => { setProviderDivision(d); setPage(1) }}
                                                    className={`text-left text-sm ${d === providerDivision ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    {d === 'All' ? 'All Areas' : d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
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
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
                        </div>
                    ) : providers.length === 0 ? (
                        <p className="text-sm text-slate-400">No verified organizations found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
                        </div>
                    )}

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

                {/* ── Free Courses (mirrors BDCare's "Regular Events" section) ── */}
                <section className="max-w-7xl mx-auto px-4 mt-6 mb-10 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-lg font-bold text-slate-900">Free Courses</h2>
                        <button
                            onClick={() => setShowCourseFilters(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                        >
                            <SlidersHorizontal size={15} />
                            Filters
                            {activeCourseFilterCount > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                                    {activeCourseFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {showCourseFilters && (
                        <div
                            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40"
                            onClick={() => setShowCourseFilters(false)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Search filters</h3>
                                    <button onClick={() => setShowCourseFilters(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                                            Category
                                        </h4>
                                        <div className="flex flex-col gap-2.5">
                                            {(['All', ...COURSE_CATEGORIES] as const).map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleCourseCategory(cat as CourseCategory | 'All')}
                                                    className={`text-left text-sm flex items-center gap-1.5 ${cat === courseCategory ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    <span>{cat === 'All' ? '🌟' : CATEGORY_EMOJI[cat as CourseCategory]}</span>
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                                            Mode
                                        </h4>
                                        <div className="flex flex-col gap-2.5">
                                            {(['All', ...COURSE_MODES] as const).map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => handleCourseMode(m as CourseMode | 'All')}
                                                    className={`text-left text-sm ${m === courseMode ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    {m === 'All' ? 'Any Mode' : MODE_LABEL[m as CourseMode]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                                            Location
                                        </h4>
                                        <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                                            {(['All', ...DIVISIONS] as const).map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => setCourseDivision(d)}
                                                    className={`text-left text-sm ${d === courseDivision ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                                                >
                                                    {d === 'All' ? 'All Areas' : d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <button onClick={clearCourseFilters} className="text-sm font-semibold text-gray-500 hover:text-red-600">
                                        Clear all filters
                                    </button>
                                    <button
                                        onClick={() => setShowCourseFilters(false)}
                                        className="text-sm font-bold text-white px-5 py-2 rounded-lg"
                                        style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <span />
                        <a href="/grow-together/courses/my" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                            <GraduationCap size={13} />
                            My organization&apos;s courses
                        </a>
                    </div>

                    <CourseGrid courses={courses} loading={coursesLoading} />
                </section>
            </main>
            <Footer />
        </>
    )
}