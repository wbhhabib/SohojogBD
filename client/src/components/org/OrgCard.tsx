import React from 'react'
import Link from 'next/link'
import type { Organization } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { MapPin, Users, BadgeCheck } from 'lucide-react'

interface OrgCardProps {
    org: Organization
}

const CATEGORY_LABEL: Record<string, string> = {
    REGISTERED: 'Registered Organization',
    TEAM: 'Volunteer Team',
}

const CATEGORY_EMOJI: Record<string, string> = {
    REGISTERED: '📋',
    TEAM: '🤝',
}

function verificationBadge(org: Organization) {
    if (org.status !== 'APPROVED') return null
    return org.category === 'REGISTERED'
        ? { label: 'Registered & Verified', color: 'bg-emerald-500' }
        : { label: 'Verified Volunteer Team', color: 'bg-sky-500' }
}

export default function OrgCard({ org }: OrgCardProps) {
    const emoji = CATEGORY_EMOJI[org.category] ?? '📌'
    const badge = verificationBadge(org)
    const locationLabel = [org.district, org.division].filter(Boolean).join(', ') || org.fullAddress

    return (
        <Link
            href={`/bdcare/${org.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-sky-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="relative h-32 overflow-hidden bg-gray-100">
                {org.coverImage ? (
                    <img
                        src={getImageUrl(org.coverImage)}
                        alt={org.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center">
                        <span className="text-4xl opacity-70">{emoji}</span>
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md">
                        <span>{emoji}</span>
                        {CATEGORY_LABEL[org.category] ?? org.category}
                    </span>
                </div>
                {badge && (
                    <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-md ${badge.color}`}>
                            <BadgeCheck size={12} />
                            {badge.label}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 px-4 -mt-6">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm shrink-0">
                    {org.logo ? (
                        <img src={getImageUrl(org.logo)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                            {org.name.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2.5 p-4 pt-2 flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
                    {org.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{org.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-sky-50 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-sky-500" />
                        {locationLabel}
                    </span>
                    {typeof org._count?.requests === 'number' && (
                        <span className="flex items-center gap-1">
                            <Users size={12} className="text-sky-500" />
                            {org._count.requests} volunteer{org._count.requests !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}