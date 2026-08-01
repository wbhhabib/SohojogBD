'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Textarea from '@/components/ui/textarea'
import { plantApi } from '@/lib/api'
import type { PlantListing } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { getImageUrl, timeAgo } from '@/lib/utils'
import { MapPin, Leaf, Phone, User, ArrowLeft, Gift, Send, CheckCircle2 } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
    AVAILABLE: 'success',
    CLAIMED: 'warning',
    COMPLETED: 'info',
    CANCELLED: 'default',
}

export default function PlantDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const slug = params.id as string

    const [listing, setListing] = useState<PlantListing | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const [error, setError] = useState('')

    const fetchListing = useCallback(async () => {
        setLoading(true)
        const res = await plantApi.getBySlug(slug)
        if (!res.success || !res.data) {
            setNotFoundState(true)
        } else {
            setListing(res.data)
        }
        setLoading(false)
    }, [slug])

    useEffect(() => { fetchListing() }, [fetchListing])

    const handleRequest = async () => {
        if (!user) {
            router.push(`/auth/login?next=/plants/${slug}`)
            return
        }
        setSubmitting(true)
        setError('')
        const res = await plantApi.requestClaim(listing!.id, { message: message.trim() || undefined })
        if (res.success) {
            setRequestSent(true)
        } else {
            setError(res.message ?? 'Could not send your request. Please try again.')
        }
        setSubmitting(false)
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        )
    }

    if (notFoundState || !listing) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-5xl">🌱</p>
                    <h1 className="text-xl font-bold text-gray-900">Listing not found</h1>
                    <p className="text-gray-500 text-sm">This plant listing may have been removed.</p>
                    <a href="/plants" className="text-emerald-600 text-sm font-semibold hover:underline">Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    const isOwner = user?.id === listing.ownerId
    const isAvailable = listing.status === 'AVAILABLE'

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <a href="/plants" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-5 transition-colors">
                        <ArrowLeft size={14} />
                        Back to listings
                    </a>

                    <div className="grid md:grid-cols-5 gap-6">
                        <div className="md:col-span-3">
                            <div className="rounded-2xl overflow-hidden bg-gray-100 h-72 md:h-96 mb-4">
                                {listing.images[0] ? (
                                    <img src={getImageUrl(listing.images[0])} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center">
                                        <span className="text-7xl opacity-70">🌱</span>
                                    </div>
                                )}
                            </div>
                            {listing.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 mb-6">
                                    {listing.images.slice(1).map((img, i) => (
                                        <img key={i} src={getImageUrl(img)} alt="" className="h-20 w-full object-cover rounded-lg" />
                                    ))}
                                </div>
                            )}

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-sm font-bold text-gray-900 mb-2">About this plant</h2>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{listing.description}</p>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <Badge variant="success" className="capitalize">{listing.plantType}</Badge>
                                    <Badge variant={statusVariant[listing.status]} className="capitalize">{listing.status.toLowerCase()}</Badge>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                                    {listing.title}
                                </h1>
                                <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /> {listing.location}</span>
                                    <span className="flex items-center gap-2"><Leaf size={14} className="text-emerald-500" /> Quantity available: {listing.quantity}</span>
                                    <span className="flex items-center gap-2"><User size={14} className="text-emerald-500" /> Shared by {listing.owner?.name ?? 'a member'}</span>
                                    <span className="text-xs text-gray-400">Posted {timeAgo(listing.createdAt)}</span>
                                </div>

                                {isOwner ? (
                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-700">
                                        This is your listing. Manage requests from{' '}
                                        <a href="/plants/my" className="font-semibold underline">My Listings</a>.
                                    </div>
                                ) : !isAvailable ? (
                                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
                                        This listing is no longer available.
                                    </div>
                                ) : requestSent ? (
                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-2 text-sm text-emerald-700">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                        Request sent! The owner will reach out if they choose you.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Textarea
                                            label="Message to the owner (optional)"
                                            placeholder="Hi! I'd love this plant for my balcony garden…"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3}
                                        />
                                        {error && <p className="text-xs text-red-600">{error}</p>}
                                        <Button variant="primary" className="w-full" isLoading={submitting} onClick={handleRequest}>
                                            <Gift size={15} />
                                            Request this Plant
                                        </Button>
                                        {!user && (
                                            <p className="text-xs text-gray-400 text-center">You'll need to log in first.</p>
                                        )}
                                    </div>
                                )}

                                {listing.contactPhone && (isOwner || !isAvailable) && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={13} className="text-emerald-500" />
                                        {listing.contactPhone}
                                    </div>
                                )}
                            </div>

                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-700 flex items-start gap-2">
                                <Send size={14} className="mt-0.5 shrink-0" />
                                Coordinate pickup details directly with the owner once your request is accepted. Meet in safe, public places when possible.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}