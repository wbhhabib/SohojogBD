'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { orgApi } from '@/lib/api'
import type { OrgUpdate } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

function formatEventDateTime(dateStr?: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

export default function EventDetailPage() {
    const params = useParams<{ id: string }>()
    const id = params?.id
    const [event, setEvent] = useState<OrgUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)

    useEffect(() => {
        if (!id) return
        orgApi.getEventById(id).then((res) => {
            if (res.success && res.data) {
                setEvent(res.data)
            } else {
                setNotFoundState(true)
            }
            setLoading(false)
        })
    }, [id])

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

    if (notFoundState || !event) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                    <p className="text-slate-500">Event not found.</p>
                    <Link href="/bdcare" className="text-emerald-600 text-sm font-medium">← Back to BD Care</Link>
                </div>
                <Footer />
            </>
        )
    }

    const cover = event.images?.[0]
    const dateLabel = formatEventDateTime(event.eventDate)
    const placeLabel = [event.place, event.district, event.division].filter(Boolean).join(', ')

    const registrationHref = event.organization?.contactPhone
        ? `tel:${event.organization.contactPhone}`
        : event.organization
            ? `/bdcare/${event.organization.slug}`
            : undefined

    const registrationBtnClass =
        'bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors'

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

                    {cover && (
                        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-52 md:h-64">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getImageUrl(cover)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
                        {dateLabel && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar size={15} className="text-emerald-500 shrink-0" />
                                Date &amp; Time: {dateLabel}
                            </p>
                        )}
                        {placeLabel && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <MapPin size={15} className="text-emerald-500 shrink-0" />
                                Place: {placeLabel}
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                            {event.content}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between gap-3">
                        <span className="text-gray-900 font-semibold text-sm">To join the event</span>
                        {registrationHref ? (
                            registrationHref.startsWith('tel:') ? (
                                <a href={registrationHref} className={registrationBtnClass}>
                                    Registration
                                </a>
                            ) : (
                                <Link href={registrationHref} className={registrationBtnClass}>
                                    Registration
                                </Link>
                            )
                        ) : (
                            <span className="bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-not-allowed">
                                Registration
                            </span>
                        )}
                    </div>

                    {event.organization && (
                        <Link
                            href={`/bdcare/${event.organization.slug}`}
                            className="inline-block text-sm font-medium text-emerald-600"
                        >
                            Posted by {event.organization.name} →
                        </Link>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}