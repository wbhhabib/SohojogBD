import React from 'react'
import Link from 'next/link'
import type { WholesalePool } from '@/lib/growTogetherApi'
import { CATEGORY_EMOJI, daysLeft, savingsPct } from '@/lib/growTogetherApi'
import { formatBDT } from '@/lib/utils'
import PoolMeter from './PoolMeter'
import { MapPin, Users } from 'lucide-react'

interface PoolCardProps {
    pool: WholesalePool
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
            className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{
                background: '#FFFDF9',
                border: '1px solid #E9D9B8',
                boxShadow: '0 1px 2px rgba(42,33,24,0.06)',
            }}
        >
            {/* stall header strip */}
            <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: '#12293D' }}
            >
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 uppercase tracking-wide">
                    <span className="text-sm">{emoji}</span>
                    {pool.category}
                </span>
                <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{
                        background: isOpen ? 'rgba(232,163,61,0.18)' : 'rgba(255,255,255,0.12)',
                        color: isOpen ? '#E8A33D' : '#CBD5C0',
                    }}
                >
                    {STATUS_LABEL[pool.status]}
                </span>
            </div>

            <div className="flex flex-col gap-3 p-4 flex-1">
                <h3
                    className="font-semibold text-[15px] leading-snug line-clamp-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1C1A17' }}
                >
                    {pool.title}
                </h3>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#8A5A20' }}>
                            Pool price
                        </p>
                        <p
                            className="text-lg font-bold tabular-nums"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#B4472A' }}
                        >
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

                <div className="flex items-center justify-between mt-auto pt-2.5 text-xs" style={{ borderTop: '1px dashed #E9D9B8', color: '#6B5B44' }}>
                    <span className="flex items-center gap-1">
                        <MapPin size={12} style={{ color: '#B4472A' }} />
                        {pool.division}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={12} style={{ color: '#B4472A' }} />
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