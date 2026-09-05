'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Textarea from '@/components/ui/textarea'
import Badge from '@/components/ui/badge'
import { useAuth } from '@/lib/AuthContext'
import { verificationApi } from '@/lib/verificationApi'
import { getPoolBySlug, joinPool, cancelPool, leavePool, CATEGORY_EMOJI } from '@/lib/growTogetherApi'
import type { WholesalePool } from '@/lib/growTogetherApi'
import {
    ArrowLeft, MapPin, Phone, User, Package,
    CheckCircle2, MessageCircle, Users, Loader2, XCircle, Lock, Facebook,
} from 'lucide-react'

export default function PoolDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const slug = params.slug as string

    const [pool, setPool] = useState<WholesalePool | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)
    const [note, setNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [actionBusy, setActionBusy] = useState(false)

    const fetchPool = useCallback(async () => {
        setLoading(true)
        const res = await getPoolBySlug(slug)
        if (!res.success || !res.data) {
            setNotFoundState(true)
        } else {
            setPool(res.data)
        }
        setLoading(false)
    }, [slug])

    useEffect(() => { fetchPool() }, [fetchPool])

    useEffect(() => {
        const draft = sessionStorage.getItem(`draft:pool-join:${slug}`)
        if (draft) {
            const parsed = JSON.parse(draft)
            setNote(parsed.note ?? '')
            sessionStorage.removeItem(`draft:pool-join:${slug}`)
        }
    }, [slug])

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        )
    }

    if (notFoundState || !pool) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-5xl">📦</p>
                    <h1 className="text-xl font-bold text-gray-900">Pool not found</h1>
                    <p className="text-sm text-gray-500">This pool may have been removed or the link is wrong.</p>
                    <a href="/grow-together/pools" className="text-sm font-semibold text-amber-600 hover:underline">Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    const isOwner = user?.id === pool.ownerId
    const hasJoined = pool.participants.some((p) => p.participant.id === user?.id)
    const isOpen = pool.status === 'OPEN'
    const canJoin = isOpen && !isOwner && !hasJoined
    const emoji = CATEGORY_EMOJI[pool.category] ?? '📦'
    // contact info null মানে backend already এটা লুকিয়ে পাঠিয়েছে (owner না, verified না)
    const contactHidden = !isOwner && pool.contactPhone === null && pool.groupLink === null

    const handleJoin = async () => {
        if (!user) {
            router.push(`/auth/login?next=/grow-together/pools/${slug}`)
            return
        }
        setError('')

        const check = await verificationApi.checkReadiness('WHOLESALE_JOIN')
        if (check.success && check.data && !check.data.ready) {
            sessionStorage.setItem(`draft:pool-join:${slug}`, JSON.stringify({ note }))
            router.push(`/verification/core?action=WHOLESALE_JOIN&redirect=${encodeURIComponent(`/grow-together/pools/${slug}`)}`)
            return
        }

        setSubmitting(true)
        const res = await joinPool(pool.id, { note: note.trim() || undefined }, { id: user.id, name: user.name, avatar: user.avatar })
        if (res.success && res.data) {
            setPool(res.data)
        } else {
            setError(res.message || 'Could not join this pool. Please try again.')
        }
        setSubmitting(false)
    }

    const handleLeave = async () => {
        if (!user) return
        setActionBusy(true)
        await leavePool(pool.id, user.id)
        await fetchPool()
        setActionBusy(false)
    }

    const handleCancelPool = async () => {
        if (!user) return
        setActionBusy(true)
        await cancelPool(pool.id, user.id)
        await fetchPool()
        setActionBusy(false)
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f9fafb 120px)' }}>
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <a href="/grow-together/pools" className="inline-flex items-center gap-1.5 text-sm mb-5 text-gray-500 hover:text-amber-600 transition-colors">
                        <ArrowLeft size={14} />
                        Back to pools
                    </a>

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* ── left: details ── */}
                        <div className="md:col-span-3 space-y-4">
                            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                        {emoji} {pool.category}
                                    </span>
                                    {pool.status !== 'OPEN' && (
                                        <Badge variant="default" className="capitalize">
                                            {pool.status.toLowerCase()}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-3"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    {pool.title}
                                </h1>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                    {pool.description}
                                </p>
                                <div className="flex flex-col gap-2 text-sm mt-4 pt-4 border-t border-amber-50 text-gray-600">
                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-amber-600" /> {pool.location}, {pool.upazila}, {pool.district}, {pool.division}</span>
                                    <span className="flex items-center gap-2"><Package size={14} className="text-amber-600" /> Unit: {pool.unit}</span>
                                    <span className="flex items-center gap-2"><User size={14} className="text-amber-600" /> Started by {pool.owner.name}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={15} className="text-amber-600" />
                                    Who&apos;s interested ({pool.participants.length})
                                </h2>
                                {pool.participants.length === 0 ? (
                                    <p className="text-sm text-gray-400">No one has joined yet — be the first!</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {pool.participants.map((pt) => (
                                            <div key={pt.id} className="flex flex-col text-sm">
                                                <span className="flex items-center gap-2 text-gray-800">
                                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-amber-50 text-amber-700">
                                                        {pt.participant.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    {pt.participant.name}
                                                </span>
                                                {pt.note && (
                                                    <span className="text-xs text-gray-400 pl-9">{pt.note}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── right: join box ── */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                                {isOwner ? (
                                    <div className="space-y-2">
                                        <div className="rounded-xl p-3 text-sm bg-amber-50 text-amber-700">
                                            This is your pool. You&apos;ll see who&apos;s interested right here.
                                        </div>
                                        {isOpen && (
                                            <button
                                                onClick={handleCancelPool}
                                                disabled={actionBusy}
                                                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                                            >
                                                <XCircle size={13} />
                                                Cancel this pool
                                            </button>
                                        )}
                                    </div>
                                ) : !isOpen && !hasJoined ? (
                                    <div className="rounded-xl p-3 text-sm bg-gray-50 text-gray-500">
                                        This pool is no longer accepting new joins.
                                    </div>
                                ) : hasJoined ? (
                                    <div className="space-y-3">
                                        <div className="rounded-xl p-4 flex items-start gap-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                            <span>You&apos;re in. Join the group to coordinate quantity, sizes, payment, and pickup.</span>
                                        </div>
                                        <button
                                            onClick={handleLeave}
                                            disabled={actionBusy}
                                            className="w-full text-xs font-medium py-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-60"
                                        >
                                            Withdraw my interest
                                        </button>
                                    </div>
                                ) : canJoin ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            label="Note to the pool starter (optional)"
                                            placeholder="e.g. I work with the same product, interested to join…"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows={3}
                                        />
                                        {error && <p className="text-xs text-red-600">{error}</p>}
                                        <button
                                            onClick={handleJoin}
                                            disabled={submitting}
                                            className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl transition-all disabled:opacity-60"
                                            style={{ background: 'linear-gradient(135deg, #d97706, #f97316)' }}
                                        >
                                            {submitting && <Loader2 size={15} className="animate-spin" />}
                                            I&apos;m Interested
                                        </button>
                                        {!user && (
                                            <p className="text-xs text-center text-gray-400">You&apos;ll need to log in first.</p>
                                        )}
                                    </div>
                                ) : null}

                                <div className="mt-4 pt-4 border-t border-dashed border-amber-100">
                                    {contactHidden ? (
                                        <div className="rounded-xl p-3 flex items-start gap-2 text-xs bg-gray-50 text-gray-500">
                                            <Lock size={13} className="mt-0.5 shrink-0" />
                                            <span>
                                                Contact info and group links are only visible to verified users.{' '}
                                                <a href="/verification/core" className="font-semibold text-amber-600 hover:underline">Get verified</a>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-sm text-gray-600">
                                            {pool.contactPhone && (
                                                <span className="flex items-center gap-2">
                                                    <Phone size={13} className="text-amber-600" />
                                                    {pool.contactPhone}
                                                </span>
                                            )}
                                            {pool.groupLink && (
                                                <a href={pool.groupLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                                                    style={{ background: '#25D366' }}
                                                >
                                                    <MessageCircle size={15} />
                                                    Open WhatsApp Group
                                                </a>
                                            )}
                                            {pool.facebookLink && (
                                                <a href={pool.facebookLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                                                    style={{ background: '#1877F2' }}
                                                >
                                                    <Facebook size={15} />
                                                    Open Facebook Page
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl p-4 text-xs flex items-start gap-2 bg-amber-50/60 border border-dashed border-amber-200 text-amber-700">
                                <MessageCircle size={14} className="mt-0.5 shrink-0" />
                                Coordinate exact quantity, sizes, payment, and pickup in the WhatsApp/Messenger group — not all details are managed on this page.
                            </div>
                        </div>
                    </div>
                </div>
            </main >
            <Footer />
        </>
    )
}