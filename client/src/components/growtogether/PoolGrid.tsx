import React from 'react'
import type { WholesalePool } from '@/lib/growTogetherApi'
import PoolCard from './PoolCard'
import Skeleton from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { PackageSearch } from 'lucide-react'

interface PoolGridProps {
    pools: WholesalePool[]
    loading?: boolean
}

export default function PoolGrid({ pools, loading = false }: PoolGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: '#E9D9B8' }}>
                        <Skeleton className="h-9 w-full rounded-none" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (pools.length === 0) {
        return (
            <EmptyState
                icon={<PackageSearch size={48} />}
                title="No pools found"
                description="Try a different search, or be the first to start a wholesale pool for your area."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
            ))}
        </div>
    )
}