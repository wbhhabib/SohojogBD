import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { OrgUpdate } from '@/lib/api'

function formatEventDate(dateStr?: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EventCard({ event }: { event: OrgUpdate }) {
    const cover = event.images?.[0]
    const dateLabel = formatEventDate(event.eventDate)

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
                <p className="absolute bottom-2 left-3 right-3 text-white font-semibold text-sm line-clamp-2">
                    {event.title}
                </p>
            </div>
            <div className="p-3 space-y-1">
                {dateLabel && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {dateLabel}
                    </p>
                )}
                {event.place && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin size={12} />
                        {event.place}
                    </p>
                )}
                {event.organization && (
                    <p className="text-xs text-emerald-600 font-medium pt-1">{event.organization.name}</p>
                )}
            </div>
        </Link>
    )
}