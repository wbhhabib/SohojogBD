import Link from 'next/link'
import { Calendar, Clock, MapPin, Building2 } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { OrgUpdate } from '@/lib/api'

function formatEventDate(dateStr?: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatEventTime(dateStr?: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function EventCard({ event }: { event: OrgUpdate }) {
    const cover = event.images?.[0]
    const dateLabel = formatEventDate(event.eventDate)
    const timeLabel = formatEventTime(event.eventDate)

    return (
        <Link
            href={`/bdcare/events/${event.id}`}
            className="block rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow"
        >
            <div className="relative h-40 w-full bg-emerald-700">
                {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImageUrl(cover)} alt={event.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {event.organization && (
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md">
                            <Building2 size={12} />
                            {event.organization.name}
                        </span>
                    </div>
                )}

                <p className="absolute bottom-2 left-3 right-3 text-white font-semibold text-sm line-clamp-2">
                    {event.title}
                </p>
            </div>
            <div className="p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {dateLabel}
                    </p>
                    {timeLabel && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Clock size={12} />
                            {timeLabel}
                        </p>
                    )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={12} />
                    {event.place}
                </p>
            </div>
        </Link>
    )
}