'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Badge from '@/components/ui/badge'
import { orgApi } from '@/lib/api'
import type { OrgUpdate, EventRegistration } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { verificationApi } from '@/lib/verificationApi'
import { getImageUrl, timeAgo } from '@/lib/utils'
import { Calendar, MapPin, CheckCircle2, Send, Users, Check, X } from 'lucide-react'
import Link from 'next/link'

function formatEventDateTime(dateStr?: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'danger', CANCELLED: 'default',
}

// Owner-only inline registrations manager — shown right on the event page
// instead of a "Join" form, so the org doesn't have to hop over to /bdcare/my.
function EventOwnerPanel({ eventId }: { eventId: string }) {
    const [loading, setLoading] = useState(true)
    const [registrations, setRegistrations] = useState<EventRegistration[]>([])
    const [respondingMessage, setRespondingMessage] = useState<Record<string, string>>({})

    const load = useCallback(async () => {
        setLoading(true)
        const res = await orgApi.getEventRegistrations(eventId, 'limit=100')
        if (res.success) setRegistrations(res.data)
        setLoading(false)
    }, [eventId])

    useEffect(() => { load() }, [load])

    const respond = async (regId: string, status: 'ACCEPTED' | 'REJECTED') => {
        const res = await orgApi.respondToEventRegistration(regId, status, respondingMessage[regId]?.trim() || undefined)
        if (!res.success) alert(res.message ?? 'Could not update this registration.')
        await load()
    }

    const pendingCount = registrations.filter((r) => r.status === 'PENDING').length
    const acceptedCount = registrations.filter((r) => r.status === 'ACCEPTED').length
    const rejectedCount = registrations.filter((r) => r.status === 'REJECTED').length

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Users size={15} className="text-sky-500" />
                    Event Registrations {!loading && `(${registrations.length})`}
                </h2>
                {!loading && registrations.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Badge variant="warning">{pendingCount} Pending</Badge>
                        <Badge variant="success">{acceptedCount} Accepted</Badge>
                        <Badge variant="danger">{rejectedCount} Rejected</Badge>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : registrations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No one has registered for this event yet.</p>
            ) : (
                <div className="space-y-2">
                    {registrations.map((r) => (
                        <div key={r.id} className="bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5 flex-wrap">
                                        {r.fullName}
                                        <Badge variant={r.isRegisteredVolunteer ? 'success' : 'info'} className="text-[10px]">
                                            {r.isRegisteredVolunteer ? 'Registered Volunteer' : 'General User'}
                                        </Badge>
                                    </p>
                                    {r.phone && <p className="text-xs text-gray-500">📞 {r.phone}</p>}
                                    {r.guardianPhone && <p className="text-xs text-gray-500">Guardian: {r.guardianPhone}</p>}
                                    {r.message && <p className="text-xs text-gray-500 mt-0.5">{r.message}</p>}
                                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(r.createdAt)}</p>
                                </div>
                                <Badge variant={statusVariant[r.status]} className="capitalize shrink-0">{r.status.toLowerCase()}</Badge>
                            </div>
                            {r.status === 'PENDING' && (
                                <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Custom message (optional)"
                                        value={respondingMessage[r.id] ?? ''}
                                        onChange={(e) => setRespondingMessage((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => respond(r.id, 'ACCEPTED')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-semibold">
                                            <Check size={13} /> Approve
                                        </button>
                                        <button onClick={() => respond(r.id, 'REJECTED')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold">
                                            <X size={13} /> Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function EventDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = params?.id
    const { user, ready } = useAuth()

    const [event, setEvent] = useState<OrgUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)

    const [checkingStatus, setCheckingStatus] = useState(true)
    const [alreadyRegistered, setAlreadyRegistered] = useState(false)
    const [regStatus, setRegStatus] = useState<string | null>(null)
    const [isRegisteredVolunteer, setIsRegisteredVolunteer] = useState(false)

    const [note, setNote] = useState('')
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [guardianPhone, setGuardianPhone] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [justRegistered, setJustRegistered] = useState(false)

    const isOwner = !!user && !!event?.organization?.ownerId && event.organization.ownerId === user.id

    useEffect(() => {
        if (!id) return
        orgApi.getEventById(id).then((res) => {
            if (res.success && res.data) {
                setEvent(res.data)
            } else {
                setNotFoundState(true)
            }
            setLoading(false)
        })
    }, [id])

    useEffect(() => {
        if (!id || !ready || !user || isOwner) {
            setCheckingStatus(false)
            return
        }
        orgApi.getMyEventRegistrationStatus(id).then((res) => {
            if (res.success && res.data) {
                setAlreadyRegistered(res.data.alreadyRegistered)
                setRegStatus(res.data.status)
                setIsRegisteredVolunteer(res.data.isRegisteredVolunteer)
            }
            setCheckingStatus(false)
        })
    }, [id, ready, user, isOwner])

    useEffect(() => {
        if (!user || isOwner || isRegisteredVolunteer) return
        // Path B হলে profile থেকে default prefill (শুধু সুবিধার জন্য, submit event-registration row-তেই সেভ হয়, User-এ না)
        verificationApi.getMe().then((res) => {
            if (res.success && res.data) {
                setFullName(res.data.name ?? '')
                setPhone(res.data.phone ?? '')
                setGuardianPhone(res.data.emergencyContactPhone ?? '')
            }
        })
    }, [user, isOwner, isRegisteredVolunteer])

    const handleRegister = async () => {
        if (!user) {
            router.push(`/auth/login?next=/bdcare/events/${id}`)
            return
        }
        if (!id) return
        setSubmitting(true)
        setError('')

        const payload = isRegisteredVolunteer
            ? { note: note.trim() || undefined }
            : {
                fullName: fullName.trim(),
                phone: phone.trim(),
                guardianPhone: guardianPhone.trim() || undefined,
                message: message.trim() || undefined,
            }

        const res = await orgApi.createEventRegistration(id, payload)
        if (res.success) {
            setJustRegistered(true)
        } else {
            setError(res.message ?? 'Could not register. Please try again.')
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

    if (notFoundState || !event) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                    <p className="text-slate-500">Event not found.</p>
                    <Link href="/bdcare" className="text-emerald-600 text-sm font-medium">← Back to BD Care</Link>
                </div>
                <Footer />
            </>
        )
    }

    const cover = event.images?.[0]
    const dateLabel = formatEventDateTime(event.eventDate)
    const placeLabel = [event.place, event.upazila, event.district, event.division].filter(Boolean).join(', ')

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

                    {cover && (
                        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-52 md:h-64">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getImageUrl(cover)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        {isOwner && (
                            <span className="inline-block mb-2 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                                Your event
                            </span>
                        )}
                        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar size={15} className="text-emerald-500 shrink-0" />
                            Date &amp; Time: {dateLabel}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin size={15} className="text-emerald-500 shrink-0" />
                            Place: {placeLabel}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                            {event.content}
                        </p>
                    </div>

                    {isOwner ? (
                        <EventOwnerPanel eventId={event.id} />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                            <h2 className="text-sm font-bold text-gray-900">Join this event</h2>

                            {checkingStatus ? (
                                <p className="text-xs text-gray-400">Checking your registration status…</p>
                            ) : justRegistered || alreadyRegistered ? (
                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-2 text-sm text-emerald-700">
                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                    {regStatus === 'ACCEPTED' || justRegistered
                                        ? "You're registered for this event. The organization will review it soon."
                                        : `Your registration status: ${regStatus}`}
                                </div>
                            ) : !user ? (
                                <Button variant="primary" className="w-full" onClick={handleRegister}>
                                    <Send size={15} /> Log in to Join
                                </Button>
                            ) : isRegisteredVolunteer ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500">You&apos;re a registered volunteer with this organization — one click to join.</p>
                                    <Textarea
                                        label="Note (optional)"
                                        placeholder="e.g. I'm bringing 2 more people"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={2}
                                        maxLength={300}
                                    />
                                    {error && <p className="text-xs text-red-600">{error}</p>}
                                    <Button variant="primary" className="w-full" isLoading={submitting} onClick={handleRegister}>
                                        <Send size={15} /> Join Event
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Input label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                    <Input label="Phone Number" required placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    <Input label="Guardian/Emergency Contact Phone (optional)" placeholder="01XXXXXXXXX" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
                                    <Textarea label="Message (optional)" placeholder="Anything the organizer should know?" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={500} />
                                    {error && <p className="text-xs text-red-600">{error}</p>}
                                    <Button variant="primary" className="w-full" isLoading={submitting} onClick={handleRegister} disabled={!fullName.trim() || !phone.trim()}>
                                        <Send size={15} /> Join Event
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {event.organization && (
                        <Link
                            href={`/bdcare/${event.organization.slug}`}
                            className="inline-block text-sm font-medium text-emerald-600"
                        >
                            Posted by {event.organization.name} →
                        </Link>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}