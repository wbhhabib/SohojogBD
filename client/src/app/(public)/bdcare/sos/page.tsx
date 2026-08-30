'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sosApi } from '@/lib/api'
import type { SOSNearbyItem } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { timeAgo } from '@/lib/utils'
import { AlertTriangle, MapPin, Settings, PlusCircle } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    OPEN: 'danger',
    ACKNOWLEDGED: 'warning',
}

export default function SOSFeedPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [items, setItems] = useState<SOSNearbyItem[]>([])
    const [loading, setLoading] = useState(true)
    const [needsLocation, setNeedsLocation] = useState(false)
    const [error, setError] = useState('')

    const fetchFeed = useCallback(async () => {
        setLoading(true)
        setError('')
        setNeedsLocation(false)
        const res = await sosApi.getNearby()
        if (!res.success) {
            if (res.message?.toLowerCase().includes('location')) {
                setNeedsLocation(true)
            } else {
                setError(res.message ?? 'Could not load nearby requests.')
            }
            setLoading(false)
            return
        }
        setItems(res.data ?? [])
        setLoading(false)
    }, [])

    useEffect(() => {
        if (ready && !user) { router.push('/auth/login?next=/bdcare/sos'); return }
        if (user) fetchFeed()
    }, [ready, user, router, fetchFeed])

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={18} className="text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Nearby Help Requests</h1>
                                <p className="text-xs text-gray-500">Emergency requests near your set location</p>
                            </div>
                        </div>
                        <a href="/bdcare/sos/settings" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors">
                            <Settings size={16} />
                        </a>
                    </div>

                    <a href="/bdcare/sos/create">
                        <Button variant="danger" className="w-full mb-6">
                            <PlusCircle size={16} /> Send an SOS
                        </Button>
                    </a>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <span className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : needsLocation ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                            <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
                            <h2 className="font-semibold text-gray-800 mb-1">Set your responder location</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                To see nearby emergency requests, first set your location in Alert Settings.
                            </p>
                            <a href="/bdcare/sos/settings">
                                <Button variant="primary">Go to Alert Settings</Button>
                            </a>
                        </div>
                    ) : error ? (
                        <p className="text-sm text-red-600 text-center py-8">{error}</p>
                    ) : items.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                            <p className="text-3xl mb-2">✅</p>
                            <p className="text-sm text-gray-500">No open emergency requests near you right now.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <a key={item.id} href={`/bdcare/sos/${item.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-red-300 hover:shadow-sm transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm text-gray-800 line-clamp-2 flex-1">{item.message}</p>
                                        <Badge variant={statusVariant[item.status] ?? 'default'}>{item.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                        <span className="flex items-center gap-1"><MapPin size={11} /> {item.distanceKm.toFixed(1)} km away</span>
                                        <span>{timeAgo(item.createdAt)}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}