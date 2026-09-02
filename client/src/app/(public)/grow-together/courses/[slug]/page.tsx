'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Badge from '@/components/ui/badge'
import { getCourseBySlug, CATEGORY_EMOJI, MODE_LABEL, daysLeft } from '@/lib/courseApi'
import type { Course } from '@/lib/courseApi'
import {
    ArrowLeft, MapPin, Phone, Mail, Clock, CalendarClock,
    Users, ExternalLink, GraduationCap, BadgeCheck,
} from 'lucide-react'

export default function CourseDetailPage() {
    const params = useParams()
    const slug = params.slug as string

    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)

    const fetchCourse = useCallback(async () => {
        setLoading(true)
        const res = await getCourseBySlug(slug)
        if (!res.success || !res.data) {
            setNotFoundState(true)
        } else {
            setCourse(res.data)
        }
        setLoading(false)
    }, [slug])

    useEffect(() => { fetchCourse() }, [fetchCourse])

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        )
    }

    if (notFoundState || !course) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-5xl">📚</p>
                    <h1 className="text-xl font-bold text-gray-900">Course not found</h1>
                    <p className="text-sm text-gray-500">This course may have closed or the link is wrong.</p>
                    <a href="/grow-together/courses" className="text-sm font-semibold text-emerald-600 hover:underline">Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    const emoji = CATEGORY_EMOJI[course.skillCategory] ?? '📚'
    const left = course.applicationDeadline ? daysLeft(course.applicationDeadline) : null
    const isClosed = course.status === 'CLOSED'
    const locationLine = course.mode === 'ONLINE'
        ? 'Fully online'
        : [course.venue, course.upazila, course.district, course.division].filter(Boolean).join(', ')

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <a href="/grow-together/courses" className="inline-flex items-center gap-1.5 text-sm mb-5 text-gray-500 hover:text-emerald-600 transition-colors">
                        <ArrowLeft size={14} />
                        Back to courses
                    </a>

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* ── left: details ── */}
                        <div className="md:col-span-3 space-y-4">
                            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                        {emoji} {course.skillCategory}
                                    </span>
                                    <Badge variant="info">{MODE_LABEL[course.mode]}</Badge>
                                    {isClosed && <Badge variant="default">Closed</Badge>}
                                    {course.isOngoing && <Badge variant="success">Rolling admission</Badge>}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-3"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    {course.title}
                                </h1>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                    {course.description}
                                </p>
                            </div>

                            {course.eligibility && (
                                <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                                    <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <BadgeCheck size={15} className="text-emerald-600" />
                                        Eligibility
                                    </h2>
                                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                        {course.eligibility}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── right: organization + contact ── */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-emerald-50">
                                    {course.organization.logo ? (
                                        <img src={course.organization.logo} alt={course.organization.name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-50 text-emerald-700">
                                            {course.organization.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-400">Offered by</p>
                                        <p className="text-sm font-semibold text-gray-900">{course.organization.name}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5 text-sm mb-4 text-gray-600">
                                    <span className="flex items-center gap-2"><Clock size={14} className="text-emerald-600" /> {course.duration}</span>
                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-emerald-600" /> {locationLine}</span>
                                    {course.seatsAvailable && (
                                        <span className="flex items-center gap-2"><Users size={14} className="text-emerald-600" /> {course.seatsAvailable} seats available</span>
                                    )}
                                    {course.applicationDeadline && (
                                        <span className="flex items-center gap-2">
                                            <CalendarClock size={14} className="text-emerald-600" />
                                            {left !== null && left > 0 ? `${left} day${left !== 1 ? 's' : ''} left to apply` : 'Application deadline passed'}
                                        </span>
                                    )}
                                </div>

                                {isClosed ? (
                                    <div className="rounded-xl p-3 text-sm bg-gray-50 text-gray-500">
                                        This course is no longer accepting applicants.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {course.applyLink && (

                                            <a href={course.applyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                                                style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                                            >
                                                <ExternalLink size={15} />
                                                Apply / Register
                                            </a>
                                        )}
                                        {(course.contactPhone || course.organization.contactPhone) && (

                                            <a href={`tel:${course.contactPhone || course.organization.contactPhone}`}
                                                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                                            >
                                                <Phone size={14} />
                                                {course.contactPhone || course.organization.contactPhone}
                                            </a>
                                        )}
                                        {(course.contactEmail || course.organization.contactEmail) && (

                                            <a href={`mailto:${course.contactEmail || course.organization.contactEmail}`}
                                                className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium py-1.5 text-gray-500 hover:text-emerald-600"
                                            >
                                                <Mail size={13} />
                                                {course.contactEmail || course.organization.contactEmail}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl p-4 text-xs flex items-start gap-2 bg-emerald-50/60 border border-dashed border-emerald-200 text-emerald-700">
                                <GraduationCap size={14} className="mt-0.5 shrink-0" />
                                Application/enrollment happens directly with the organization — this page is only for discovery, not a booking system.
                            </div>
                        </div>
                    </div >
                </div >
            </main >
            <Footer />
        </>
    )
}