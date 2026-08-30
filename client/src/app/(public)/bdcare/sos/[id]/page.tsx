'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sosApi } from '@/lib/api'
import type { SOSRequestDetail } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { timeAgo } from '@/lib/utils'
import { AlertTriangle, MapPin, Phone, ArrowLeft, CheckCircle2, XCircle, Send } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    OPEN: 'danger',
    ACKNOWLEDGED: 'warning',
    RESOLVED: 'success',
    CANCELLED: 'default',
}

export default function SOSDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, ready } = useAuth()
    const id = params.id as string

    const [sos, setSos] = useState<SOSRequestDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)
    const [responding, setResponding] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState('')

    const fetchSOS = useCallback(async () => {
        setLoading(true)
        const res = await sosApi.getById(id)
        if (!res.success || !res.data) {
            setNotFoundState(true)
            setLoading(false)
            return
        }
        setSos(res.data)
        setLoading(false)
    }, [id])

    useEffect(() => {
        if (ready && !user) { router.push(`/auth/login?next=/bdcare/sos/${id}`); return }
        if (user) fetchSOS()
    }, [ready, user, router, id, fetchSOS])

    const handleRespond = async () => {
        setResponding(true)
        setError('')
        const res = await sosApi.respond(id, 'ACKNOWLEDGED')
        if (!res.success) {
            setError(res.message ?? 'Could not send your response.')
        } else {
            await fetchSOS()
        }
        setResponding(false)
    }

    const handleUpdateStatus = async (status: 'RESOLVED' | 'CANCELLED') => {
        setUpdating(true)
        setError('')
        const res = await sosApi.updateStatus(id, status)
        if (!res.success) {
            setError(res.message ?? 'Could not update status.')
        } else {
            await fetchSOS()
        }
        setUpdating(false)
    }

    if (loading || !ready) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        )
    }

    if (notFoundState || !sos) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-5xl">🆘</p>
                    <h1 className="text-xl font-bold text-gray-900">Request not found</h1>
                    <a href="/bdcare" className="text-sky-600 text-sm font-semibold hover:underline">Back to BDCare</a>
                </div>
                <Footer />
            </>
        )
    }

    const isRequester = user?.id === sos.requesterId
    const isOpenOrAck = sos.status === 'OPEN' || sos.status === 'ACKNOWLEDGED'
    const alreadyResponded = sos.responses.some((r) => r.responder.id === user?.id)
    const mapsUrl = `https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <a href="/bdcare/sos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-5">
                        <ArrowLeft size={14} /> Back to nearby requests
                    </a>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                    <AlertTriangle size={18} className="text-red-600" />
                                </div>
                                <h1 className="text-lg font-bold text-gray-900">Emergency Request</h1>
                            </div>
                            <Badge variant={statusVariant[sos.status]}>{sos.status}</Badge>
                        </div>

                        <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{sos.message}</p>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sky-600 hover:underline">
                                <MapPin size={13} /> View location on map
                            </a>
                            {sos.requester?.phone && (isRequester || alreadyResponded) && (
                                <a href={`tel:${sos.requester.phone}`} className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                                    <Phone size={13} /> {sos.requester.phone}
                                </a>
                            )}
                            <span>Posted {timeAgo(sos.createdAt)}</span>
                            <span>{sos._count?.responses ?? sos.responses.length} volunteer{(sos._count?.responses ?? sos.responses.length) !== 1 ? 's' : ''} responded</span>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

                    {isRequester ? (
                        isOpenOrAck && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-3 mb-5">
                                <Button variant="primary" isLoading={updating} onClick={() => handleUpdateStatus('RESOLVED')} className="flex-1">
                                    <CheckCircle2 size={15} /> Mark as Resolved
                                </Button>
                                <Button variant="outline" isLoading={updating} onClick={() => handleUpdateStatus('CANCELLED')} className="flex-1">
                                    <XCircle size={15} /> Cancel Request
                                </Button>
                            </div>
                        )
                    ) : (
                        isOpenOrAck && !alreadyResponded && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
                                <Button variant="danger" className="w-full" isLoading={responding} onClick={handleRespond}>
                                    <Send size={15} /> I&apos;m Responding to This
                                </Button>
                            </div>
                        )
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Responders</h2>
                        {sos.responses.length === 0 ? (
                            <p className="text-sm text-gray-400">No one has responded yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {sos.responses.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <span className="font-medium text-gray-800">{r.responder.name}</span>
                                        <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}