'use client'

import { useEffect, useState, use } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { orgApi } from '@/lib/api'
import type { OrgUpdate } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Calendar, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

function formatEventDateTime(dateStr?: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [event, setEvent] = useState<OrgUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)

    useEffect(() => {
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

    return (
        <>
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-10">
                {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={getImageUrl(cover)}
                        alt={event.title}
                        className="w-full h-56 object-cover rounded-2xl mb-5"
                    />
                )}

                <h1 className="text-xl font-bold text-slate-900 mb-3">{event.title}</h1>

                <div className="flex flex-col gap-2 mb-5 bg-white border border-gray-100 rounded-2xl p-4">
                    {dateLabel && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Calendar size={15} className="text-emerald-500" />
                            {dateLabel}
                        </p>
                    )}
                    {event.place && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                            <MapPin size={15} className="text-emerald-500" />
                            {event.place}
                            {event.district ? `, ${event.district}` : ''}
                            {event.division ? `, ${event.division}` : ''}
                        </p>
                    )}
                    {event.organization?.contactPhone && (
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Phone size={15} className="text-emerald-500" />
                            {event.organization.contactPhone}
                        </p>
                    )}
                </div>

                <div className="prose prose-sm max-w-none whitespace-pre-line text-slate-700">
                    {event.content}
                </div>

                {event.organization && (
                    <Link
                        href={`/bdcare/${event.organization.slug}`}
                        className="inline-block mt-6 text-sm font-medium text-emerald-600"
                    >
                        Posted by {event.organization.name} →
                    </Link>
                )}
            </main>
            <Footer />
        </>
    )
}