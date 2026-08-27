import React from 'react'
import type { WholesalePool } from '@/lib/growTogetherApi'
import { joinedQuantity, progressPct } from '@/lib/growTogetherApi'

interface PoolMeterProps {
    pool: WholesalePool
    compact?: boolean
}

export default function PoolMeter({ pool, compact = false }: PoolMeterProps) {
    const joined = joinedQuantity(pool)
    const pct = progressPct(pool)
    const reached = pct >= 100

    return (
        <div className="w-full">
            <div className="flex items-baseline justify-between mb-1.5">
                <span
                    className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold uppercase tracking-wide`}
                    style={{ color: '#8A5A20' }}
                >
                    {reached ? 'Target reached' : 'Pool filling up'}
                </span>
                <span
                    className={`${compact ? 'text-[11px]' : 'text-xs'} tabular-nums`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#2A2118' }}
                >
                    <strong>{joined}</strong> / {pool.targetQuantity} {pool.unit}
                </span>
            </div>
            <div
                className="relative h-3 rounded-full overflow-hidden"
                style={{
                    background: '#F0E4CE',
                    border: '1px dashed #C9A876',
                }}
            >
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        background: reached
                            ? 'linear-gradient(90deg, #3C6B4B, #4F8862)'
                            : 'linear-gradient(90deg, #C8862B, #E8A33D)',
                    }}
                />
            </div>
        </div>
    )
}