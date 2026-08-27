import React from 'react'
import type { Organization } from '@/lib/api'
import OrgCard from './OrgCard'
import Skeleton from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Handshake } from 'lucide-react'

interface OrgGridProps {
    orgs: Organization[]
    loading?: boolean
}

export default function OrgGrid({ orgs, loading = false }: OrgGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <Skeleton className="h-32 w-full rounded-none" />
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

    if (orgs.length === 0) {
        return (
            <EmptyState
                icon={<Handshake size={48} />}
                title="No organizations found"
                description="Try a different search, or be the first to register your organization."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((org) => (
                <OrgCard key={org.id} org={org} />
            ))}
        </div>
    )
}