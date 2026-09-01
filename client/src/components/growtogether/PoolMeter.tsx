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
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold uppercase tracking-wide ${reached ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {reached ? 'Target reached' : 'Pool filling up'}
                </span>
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} tabular-nums text-gray-600`}>
                    <strong className="text-gray-900">{joined}</strong> / {pool.targetQuantity} {pool.unit}
                </span>
            </div>
            <div className="relative h-2.5 rounded-full overflow-hidden bg-amber-50 border border-amber-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${reached ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}