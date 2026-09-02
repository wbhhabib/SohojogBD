'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CourseGrid from '@/components/growtogether/CourseGrid'
import { useAuth } from '@/lib/AuthContext'
import { getMyOrgCourses, closeCourse } from '@/lib/courseApi'
import type { Course } from '@/lib/courseApi'
import { Megaphone, GraduationCap, XCircle } from 'lucide-react'

export default function MyCoursesPage() {
    const router = useRouter()
    const { user, ready } = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState<string | null>(null)

    const fetchCourses = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const res = await getMyOrgCourses()
        if (res.success) setCourses(res.data)
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/grow-together/courses/my')
        }
    }, [ready, user, router])

    useEffect(() => { fetchCourses() }, [fetchCourses])

    const handleClose = async (courseId: string) => {
        setBusyId(courseId)
        await closeCourse(courseId)
        await fetchCourses()
        setBusyId(null)
    }

    if (!ready || !user) return null

    const openCourses = courses.filter((c) => c.status === 'OPEN')

    return (
        <>
            <Navbar />
            <main className="min-h-screen py-10" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                                <GraduationCap size={18} className="text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    My Organization&apos;s Courses
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Courses posted by all organizations you own — {openCourses.length} currently open.
                                </p>
                            </div>
                        </div>

                        <a href="/grow-together/courses/post"
                            className="inline-flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
                            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                        >
                            <Megaphone size={15} />
                            Post a Course
                        </a>
                    </div>

                    {!loading && courses.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {courses.map((c) => c.status === 'OPEN' && (
                                <button
                                    key={c.id}
                                    onClick={() => handleClose(c.id)}
                                    disabled={busyId === c.id}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                                >
                                    <XCircle size={12} />
                                    Close &quot;{c.title.length > 30 ? c.title.slice(0, 30) + '…' : c.title}&quot;
                                </button>
                            ))}
                        </div>
                    )}

                    <CourseGrid courses={courses} loading={loading} />
                </div>
            </main >
            <Footer />
        </>
    )
}