'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import PoolMeter from '@/components/growtogether/PoolMeter'
import { useAuth } from '@/lib/AuthContext'
import { formatBDT } from '@/lib/utils'
import {
    getPoolBySlug, joinPool, cancelPool, leavePool,
    CATEGORY_EMOJI, daysLeft, savingsPct,
} from '@/lib/growTogetherApi'
import type { WholesalePool } from '@/lib/growTogetherApi'
import {
    ArrowLeft, MapPin, Phone, User, Package, CalendarClock,
    CheckCircle2, MessageCircle, Users, Loader2, XCircle,
} from 'lucide-react'

export default function PoolDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const slug = params.slug as string

    const [pool, setPool] = useState<WholesalePool | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)
    const [quantity, setQuantity] = useState('')
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

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#E8A33D', borderTopColor: 'transparent' }} />
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
                    <h1 className="text-xl font-bold" style={{ color: '#2A2118' }}>Pool not found</h1>
                    <p className="text-sm" style={{ color: '#6B5B44' }}>This pool may have been removed or the link is wrong.</p>
                    <a href="/grow-together" className="text-sm font-semibold hover:underline" style={{ color: '#B4472A' }}>Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    const isOwner = user?.id === pool.ownerId
    const myEntry = pool.participants.find((p) => p.participant.id === user?.id)
    const hasJoined = !!myEntry
    const isOpen = pool.status === 'OPEN'
    const canJoin = isOpen && !isOwner && !hasJoined
    const left = daysLeft(pool.deadline)
    const savings = savingsPct(pool)
    const emoji = CATEGORY_EMOJI[pool.category] ?? '📦'

    const handleJoin = async () => {
        if (!user) {
            router.push(`/auth/login?next=/grow-together/${slug}`)
            return
        }
        setError('')
        const qty = Number(quantity)
        if (!qty || qty < pool.minJoinQuantity) {
            setError(`Please enter at least ${pool.minJoinQuantity} ${pool.unit}`)
            return
        }
        setSubmitting(true)
        const res = await joinPool(pool.id, { quantity: qty, note: note.trim() || undefined }, { id: user.id, name: user.name, avatar: user.avatar })
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
            <main className="min-h-screen" style={{ background: '#FBF3E7' }}>
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <a href="/grow-together" className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors" style={{ color: '#6B5B44' }}>
                        <ArrowLeft size={14} />
                        Back to pools
                    </a>

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* ── left: details ── */}
                        <div className="md:col-span-3 space-y-4">
                            <div className="rounded-2xl p-6" style={{ background: '#FFFDF9', border: '1px solid #E9D9B8' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: '#F0E4CE', color: '#8A5A20' }}
                                    >
                                        {emoji} {pool.category}
                                    </span>
                                    {pool.status !== 'OPEN' && (
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: '#F1F1EC', color: '#6B5B44' }}>
                                            {pool.status.replace('_', ' ').toLowerCase()}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1C1A17' }}>
                                    {pool.title}
                                </h1>
                                <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: '#4A3E2E' }}>
                                    {pool.description}
                                </p>
                            </div>

                            <div className="rounded-2xl p-6" style={{ background: '#FFFDF9', border: '1px solid #E9D9B8' }}>
                                <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#2A2118' }}>
                                    <Users size={15} style={{ color: '#B4472A' }} />
                                    Who&apos;s in ({pool.participants.length})
                                </h2>
                                {pool.participants.length === 0 ? (
                                    <p className="text-sm" style={{ color: '#A88860' }}>No one has joined yet — be the first!</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {pool.participants.map((pt) => (
                                            <div key={pt.id} className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2" style={{ color: '#2A2118' }}>
                                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#F0E4CE', color: '#8A5A20' }}>
                                                        {pt.participant.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    {pt.participant.name}
                                                </span>
                                                <span className="tabular-nums font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#6B5B44' }}>
                                                    {pt.quantity} {pool.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── right: pool meter + join box ── */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="rounded-2xl p-6" style={{ background: '#FFFDF9', border: '1px solid #E9D9B8' }}>
                                <div className="flex items-end justify-between mb-1">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#8A5A20' }}>Pool price</p>
                                        <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#B4472A' }}>
                                            {formatBDT(pool.pricePerUnit)}<span className="text-sm font-medium text-gray-400">/{pool.unit}</span>
                                        </p>
                                    </div>
                                    {savings !== null && (
                                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            ↓ {savings}% vs retail
                                        </span>
                                    )}
                                </div>
                                {pool.marketPricePerUnit && (
                                    <p className="text-xs mb-3" style={{ color: '#A88860' }}>
                                        Usual retail price: <span className="line-through">{formatBDT(pool.marketPricePerUnit)}</span>
                                    </p>
                                )}

                                <div className="my-4">
                                    <PoolMeter pool={pool} />
                                </div>

                                <div className="flex flex-col gap-2 text-sm mb-4" style={{ color: '#4A3E2E' }}>
                                    <span className="flex items-center gap-2"><MapPin size={14} style={{ color: '#B4472A' }} /> {pool.location}, {pool.division}</span>
                                    <span className="flex items-center gap-2"><Package size={14} style={{ color: '#B4472A' }} /> Min. {pool.minJoinQuantity} {pool.unit} per person</span>
                                    <span className="flex items-center gap-2"><CalendarClock size={14} style={{ color: '#B4472A' }} /> {left > 0 ? `${left} day${left !== 1 ? 's' : ''} left` : 'Deadline passed'}</span>
                                    <span className="flex items-center gap-2"><User size={14} style={{ color: '#B4472A' }} /> Started by {pool.owner.name}</span>
                                </div>

                                {isOwner ? (
                                    <div className="space-y-2">
                                        <div className="rounded-xl p-3 text-sm" style={{ background: '#F0E4CE', color: '#8A5A20' }}>
                                            This is your pool. You&apos;ll see who joins right here.
                                        </div>
                                        {isOpen && (
                                            <button
                                                onClick={handleCancelPool}
                                                disabled={actionBusy}
                                                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors disabled:opacity-60"
                                                style={{ borderColor: '#E0BFA0', color: '#B4472A' }}
                                            >
                                                <XCircle size={13} />
                                                Cancel this pool
                                            </button>
                                        )}
                                    </div>
                                ) : !isOpen && !hasJoined ? (
                                    <div className="rounded-xl p-3 text-sm" style={{ background: '#F1F1EC', color: '#6B5B44' }}>
                                        This pool is no longer accepting new joins.
                                    </div>
                                ) : hasJoined && myEntry ? (
                                    <div className="space-y-3">
                                        <div className="rounded-xl p-4 flex items-start gap-2 text-sm" style={{ background: 'rgba(60,107,75,0.08)', color: '#2F5A3F', border: '1px solid rgba(60,107,75,0.2)' }}>
                                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                            <span>You&apos;re in for <strong>{myEntry.quantity} {pool.unit}</strong>. Join the group to coordinate sizes, payment, and pickup.</span>
                                        </div>
                                        {pool.groupLink ? (
                                            <a
                                                href={pool.groupLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all"
                                                style={{ background: '#25D366' }}
                                            >
                                                <MessageCircle size={15} />
                                                Open WhatsApp Group
                                            </a>
                                        ) : (
                                            <div className="rounded-xl p-3 text-xs" style={{ background: '#F0E4CE', color: '#8A5A20' }}>
                                                No group link yet — reach the pool starter directly at {pool.contactPhone}.
                                            </div>
                                        )}
                                        <button
                                            onClick={handleLeave}
                                            disabled={actionBusy}
                                            className="w-full text-xs font-medium py-1.5 disabled:opacity-60"
                                            style={{ color: '#A88860' }}
                                        >
                                            Withdraw my interest
                                        </button>
                                    </div>
                                ) : canJoin ? (
                                    <div className="space-y-3">
                                        <Input
                                            label={`How much can you take? (min. ${pool.minJoinQuantity} ${pool.unit})`}
                                            type="number"
                                            min={pool.minJoinQuantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                        <Textarea
                                            label="Note to the pool starter (optional)"
                                            placeholder="e.g. I mostly need size M and L…"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows={3}
                                        />
                                        {error && <p className="text-xs text-red-600">{error}</p>}
                                        <button
                                            onClick={handleJoin}
                                            disabled={submitting}
                                            className="w-full inline-flex items-center justify-center gap-2 text-[#12293D] text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all disabled:opacity-60"
                                            style={{ background: 'linear-gradient(135deg, #E8A33D, #D98E2B)' }}
                                        >
                                            {submitting && <Loader2 size={15} className="animate-spin" />}
                                            Commit My Quantity
                                        </button>
                                        {!user && (
                                            <p className="text-xs text-center" style={{ color: '#A88860' }}>You&apos;ll need to log in first.</p>
                                        )}
                                    </div>
                                ) : null}

                                {pool.contactPhone && (isOwner || hasJoined) && (
                                    <div className="mt-3 pt-3 flex items-center gap-2 text-sm" style={{ borderTop: '1px dashed #E9D9B8', color: '#4A3E2E' }}>
                                        <Phone size={13} style={{ color: '#B4472A' }} />
                                        {pool.contactPhone}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl p-4 text-xs flex items-start gap-2" style={{ background: 'rgba(200,134,43,0.06)', border: '1px dashed #E9D9B8', color: '#8A5A20' }}>
                                <MessageCircle size={14} className="mt-0.5 shrink-0" />
                                Once you commit, coordinate exact sizes, payment, and pickup details in the WhatsApp/Messenger group — not all details are managed on this page.
                            </div>
                        </div>
                    </div>
                </div>
            </main >
            <Footer />
        </>
    )
}