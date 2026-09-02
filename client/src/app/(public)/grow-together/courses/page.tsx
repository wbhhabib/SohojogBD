'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CourseGrid from '@/components/growtogether/CourseGrid'
import Pagination from '@/components/ui/pagination'
import { getCourses, COURSE_CATEGORIES, CATEGORY_EMOJI, COURSE_MODES, MODE_LABEL } from '@/lib/courseApi'
import type { Course, CourseCategory, CourseMode } from '@/lib/courseApi'
import { DIVISIONS } from '@/lib/growTogetherApi'
import { Search, GraduationCap, Megaphone } from 'lucide-react'

const PAGE_SIZE = 9

export default function CoursesPage() {
    const [search, setSearch] = useState('')
    const [skillCategory, setSkillCategory] = useState<CourseCategory | 'All'>('All')
    const [mode, setMode] = useState<CourseMode | 'All'>('All')
    const [division, setDivision] = useState<string>('All')
    const [page, setPage] = useState(1)
    const [courses, setCourses] = useState<Course[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchCourses = useCallback(() => {
        setIsLoading(true)
        getCourses({ search, skillCategory, mode, division, page, limit: PAGE_SIZE })
            .then((res) => {
                if (res.success) {
                    setCourses(res.data.courses)
                    setTotal(res.data.total)
                }
            })
            .finally(() => setIsLoading(false))
    }, [search, skillCategory, mode, division, page])

    useEffect(() => { fetchCourses() }, [fetchCourses])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const handleCategory = (val: CourseCategory | 'All') => { setSkillCategory(val); setPage(1) }
    const handleMode = (val: string) => { setMode(val as CourseMode | 'All'); setPage(1) }
    const handleDivision = (val: string) => { setDivision(val); setPage(1) }

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #6ee7b7, #14b8a6)' }} />
                    <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #fcd34d, #fb923c)' }} />

                    <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
                        <a href="/grow-together" className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 hover:bg-emerald-100 transition-colors">
                            <GraduationCap size={12} />
                            GrowTogether · Free Courses
                        </a>
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
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search course, skill, or organization…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-gray-800
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300
                  focus:bg-white transition-all"
                            />
                        </div>
                        <select
                            value={mode}
                            onChange={(e) => handleMode(e.target.value)}
                            className="text-sm px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 focus:bg-white transition-all shrink-0"
                        >
                            <option value="All">Any mode</option>
                            {COURSE_MODES.map((m) => (
                                <option key={m} value={m}>{MODE_LABEL[m]}</option>
                            ))}
                        </select>
                        <select
                            value={division}
                            onChange={(e) => handleDivision(e.target.value)}
                            className="text-sm px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 focus:bg-white transition-all shrink-0"
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
                            {(['All', ...COURSE_CATEGORIES] as const).map((cat) => {
                                const isActive = cat === skillCategory
                                const emoji = cat === 'All' ? '🌟' : CATEGORY_EMOJI[cat as CourseCategory]
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategory(cat as CourseCategory | 'All')}
                                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                                                ? 'text-white shadow-md shadow-emerald-200'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                                            }`}
                                        style={isActive ? { background: 'linear-gradient(135deg, #059669, #0d9488)' } : {}}
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
                                    <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    Loading courses…
                                </span>
                            ) : (
                                <>
                                    <span className="font-bold text-gray-800">{total}</span> course{total !== 1 ? 's' : ''} found
                                </>
                            )}
                        </p>
                        <a href="/grow-together/courses/my" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                            <GraduationCap size={13} />
                            My organization&apos;s courses
                        </a>
                    </div>

                    <CourseGrid courses={courses} loading={isLoading} />

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