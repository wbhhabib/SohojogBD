import React from 'react'
import Link from 'next/link'
import type { WholesalePool } from '@/lib/growTogetherApi'
import { CATEGORY_EMOJI, daysLeft, savingsPct } from '@/lib/growTogetherApi'
import { formatBDT } from '@/lib/utils'
import Badge from '@/components/ui/badge'
import PoolMeter from './PoolMeter'
import { MapPin, Users } from 'lucide-react'

interface PoolCardProps {
    pool: WholesalePool
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    OPEN: 'success',
    TARGET_REACHED: 'info',
    CLOSED: 'default',
    CANCELLED: 'danger',
}

const STATUS_LABEL: Record<string, string> = {
    OPEN: 'Open',
    TARGET_REACHED: 'Target reached',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
}

export default function PoolCard({ pool }: PoolCardProps) {
    const emoji = CATEGORY_EMOJI[pool.category] ?? '📦'
    const left = daysLeft(pool.deadline)
    const savings = savingsPct(pool)
    const isOpen = pool.status === 'OPEN'

    return (
        <Link
            href={`/grow-together/${pool.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="relative h-32 overflow-hidden bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center">
                <span className="text-5xl opacity-70">{emoji}</span>
                <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-amber-700 shadow-md">
                        <span>{emoji}</span>
                        {pool.category}
                    </span>
                </div>
                {!isOpen && (
                    <div className="absolute top-3 right-3">
                        <Badge variant={STATUS_VARIANT[pool.status]} className="shadow-md">
                            {STATUS_LABEL[pool.status]}
                        </Badge>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2.5 p-4 flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
                    {pool.title}
                </h3>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-600">Pool price</p>
                        <p className="text-lg font-bold tabular-nums text-gray-900">
                            {formatBDT(pool.pricePerUnit)}
                            <span className="text-xs font-medium text-gray-400">/{pool.unit}</span>
                        </p>
                    </div>
                    {savings !== null && (
                        <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 mb-0.5">
                            ↓ {savings}% vs retail
                        </span>
                    )}
                </div>

                <PoolMeter pool={pool} compact />

                <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-amber-50 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-amber-500" />
                        {pool.division}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={12} className="text-amber-500" />
                        {pool.participants.length} joined
                    </span>
                    <span className="font-medium">
                        {isOpen ? (left > 0 ? `${left}d left` : 'Closing soon') : '—'}
                    </span>
                </div>
            </div>
        </Link>
    )
}