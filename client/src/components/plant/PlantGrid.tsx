import React from 'react'
import type { PlantListing } from '@/lib/api'
import PlantCard from './PlantCard'
import Skeleton from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Sprout } from 'lucide-react'

interface PlantGridProps {
    listings: PlantListing[]
    loading?: boolean
}

export default function PlantGrid({ listings, loading = false }: PlantGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <Skeleton className="h-44 w-full rounded-none" />
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

    if (listings.length === 0) {
        return (
            <EmptyState
                icon={<Sprout size={48} />}
                title="No plant giveaways found"
                description="Try a different search, or be the first to share a plant with the community."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
                <PlantCard key={listing.id} listing={listing} />
            ))}
        </div>
    )
}