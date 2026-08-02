'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Tabs from '@/components/ui/tabs'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import EmptyState from '@/components/common/EmptyState'
import Skeleton from '@/components/ui/skeleton'
import { plantApi } from '@/lib/api'
import type { PlantListing, PlantClaim } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { getImageUrl, timeAgo } from '@/lib/utils'
import { Sprout, Plus, MapPin, Check, X, Trash2, CheckCircle2 } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    AVAILABLE: 'success', CLAIMED: 'warning', COMPLETED: 'info', CANCELLED: 'default',
    PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'danger',
}

function ListingRow({ listing, onChange }: { listing: PlantListing; onChange: () => void }) {
    const [open, setOpen] = useState(false)
    const [full, setFull] = useState<PlantListing | null>(null)
    const [loadingClaims, setLoadingClaims] = useState(false)

    const toggle = async () => {
        if (!open && !full) {
            setLoadingClaims(true)
            const res = await plantApi.getMyById(listing.id)
            if (res.success) setFull(res.data)
            setLoadingClaims(false)
        }
        setOpen((v) => !v)
    }

    const respond = async (claimId: string, status: 'ACCEPTED' | 'REJECTED') => {
        const res = await plantApi.respondToClaim(claimId, status)
        if (!res.success) {
            alert(res.message ?? 'Could not update this request.')
        }
        const refreshed = await plantApi.getMyById(listing.id)
        if (refreshed.success) setFull(refreshed.data)
        onChange()
    }

    const handleComplete = async () => {
        await plantApi.markCompleted(listing.id)
        onChange()
    }

    const handleDelete = async () => {
        if (!confirm('Delete this listing?')) return
        await plantApi.delete(listing.id)
        onChange()
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {listing.images[0] ? (
                        <img src={getImageUrl(listing.images[0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-xl">🌱</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {listing.location}</p>
                </div>
                <Badge variant={statusVariant[listing.status]} className="capitalize">{listing.status.toLowerCase()}</Badge>
                <button onClick={toggle} className="text-xs font-semibold text-emerald-600 hover:underline">
                    {open ? 'Hide requests' : `Requests (${listing._count?.claims ?? 0})`}
                </button>
            </div>

            {open && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3">
                    {loadingClaims ? (
                        <Skeleton className="h-12 w-full" />
                    ) : full?.claims && full.claims.length > 0 ? (
                        full.claims.map((claim) => (
                            <div key={claim.id} className="flex items-start justify-between gap-3 bg-white rounded-lg border border-gray-200 p-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800">
                                        {claim.claimant?.name}
                                        <span className="text-emerald-600 font-semibold"> · wants {claim.quantity}</span>
                                    </p>
                                    {claim.message && <p className="text-xs text-gray-500 mt-0.5">{claim.message}</p>}
                                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(claim.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant={statusVariant[claim.status]} className="capitalize">{claim.status.toLowerCase()}</Badge>
                                    {claim.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => respond(claim.id, 'ACCEPTED')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                                                <Check size={13} />
                                            </button>
                                            <button onClick={() => respond(claim.id, 'REJECTED')} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                                                <X size={13} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-2">No requests yet.</p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        {listing.status === 'AVAILABLE' && (
                            <Button size="sm" variant="outline" onClick={handleComplete}>
                                <CheckCircle2 size={13} /> Mark Completed
                            </Button>
                        )}
                        {listing.status !== 'COMPLETED' && (
                            <Button size="sm" variant="danger" onClick={handleDelete}>
                                <Trash2 size={13} /> Delete
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function RequestRow({ claim, onChange }: { claim: PlantClaim; onChange: () => void }) {
    const handleCancel = async () => {
        await plantApi.cancelClaim(claim.id)
        onChange()
    }

    return (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {claim.listing?.images?.[0] ? (
                    <img src={getImageUrl(claim.listing.images[0])} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-xl">🌱</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{claim.listing?.title}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {claim.listing?.location} · requested {claim.quantity}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Requested {timeAgo(claim.createdAt)}</p>
            </div>
            <Badge variant={statusVariant[claim.status]} className="capitalize">{claim.status.toLowerCase()}</Badge>
            {claim.status === 'PENDING' && (
                <button onClick={handleCancel} className="text-xs font-semibold text-red-500 hover:underline">Cancel</button>
            )}
        </div>
    )
}

export default function MyPlantsPage() {
    const router = useRouter()
    const { user, ready } = useAuth()
    const [tab, setTab] = useState('listings')
    const [listings, setListings] = useState<PlantListing[]>([])
    const [claims, setClaims] = useState<PlantClaim[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAll = useCallback(() => {
        setLoading(true)
        Promise.all([plantApi.getMy('limit=50'), plantApi.getMyClaims('limit=50')])
            .then(([lRes, cRes]) => {
                if (lRes.success) setListings(lRes.data)
                if (cRes.success) setClaims(cRes.data)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/plants/my')
            return
        }
        if (user) fetchAll()
    }, [ready, user, router, fetchAll])

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Sprout size={18} className="text-emerald-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">My Plant Activity</h1>
                        </div>
                        <a href="/plants/create">
                            <Button variant="primary" size="sm"><Plus size={14} /> New Listing</Button>
                        </a>
                    </div>

                    <Tabs
                        tabs={[
                            { label: `My Listings (${listings.length})`, value: 'listings' },
                            { label: `My Requests (${claims.length})`, value: 'requests' },
                        ]}
                        activeTab={tab}
                        onTabChange={setTab}
                        className="mb-5"
                    />

                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                        </div>
                    ) : tab === 'listings' ? (
                        listings.length === 0 ? (
                            <EmptyState icon={<Sprout size={40} />} title="No listings yet" description="Share your first plant with the community." actionLabel="Give Away a Plant" onAction={() => router.push('/plants/create')} />
                        ) : (
                            <div className="space-y-3">
                                {listings.map((l) => <ListingRow key={l.id} listing={l} onChange={fetchAll} />)}
                            </div>
                        )
                    ) : claims.length === 0 ? (
                        <EmptyState icon={<Sprout size={40} />} title="No requests yet" description="Browse listings and request a plant you'd love to have." actionLabel="Browse Plants" onAction={() => router.push('/plants')} />
                    ) : (
                        <div className="space-y-3">
                            {claims.map((c) => <RequestRow key={c.id} claim={c} onChange={fetchAll} />)}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}