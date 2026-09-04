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
import { orgApi } from '@/lib/api'
import type { Organization, VolunteerRequest, OrgUpdate, EventRegistration } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { getImageUrl, timeAgo } from '@/lib/utils'
import { Handshake, Plus, MapPin, Check, X, Trash2, Calendar } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'danger', CANCELLED: 'default',
}

const orgStatusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
    PENDING: 'warning', UNDER_REVIEW: 'warning', MORE_INFO_REQUIRED: 'warning',
    APPROVED: 'success', REJECTED: 'danger', SUSPENDED: 'danger', EXPIRED: 'default',
}

const orgStatusLabel: Record<string, string> = {
    PENDING: 'Pending Review', UNDER_REVIEW: 'Under Review', MORE_INFO_REQUIRED: 'Info Needed',
    APPROVED: 'Approved', REJECTED: 'Rejected', SUSPENDED: 'Suspended', EXPIRED: 'Expired',
}

function EventRegistrationsPanel({ event }: { event: OrgUpdate }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [registrations, setRegistrations] = useState<EventRegistration[]>([])
    const [respondingMessage, setRespondingMessage] = useState<Record<string, string>>({})

    const load = async () => {
        setLoading(true)
        const res = await orgApi.getEventRegistrations(event.id, 'limit=50')
        if (res.success) setRegistrations(res.data)
        setLoading(false)
    }

    const toggle = async () => {
        if (!open) await load()
        setOpen((v) => !v)
    }

    const respond = async (regId: string, status: 'ACCEPTED' | 'REJECTED') => {
        const res = await orgApi.respondToEventRegistration(regId, status, respondingMessage[regId]?.trim() || undefined)
        if (!res.success) alert(res.message ?? 'Could not update this registration.')
        await load()
    }

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <button onClick={toggle} className="w-full flex items-center justify-between text-left">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar size={12} /> {event.title}
                </span>
                <span className="text-xs text-sky-600 font-semibold">{open ? 'Hide' : 'Event Registrations'}</span>
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    {loading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : registrations.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No registrations yet.</p>
                    ) : (
                        registrations.map((r) => (
                            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
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
                                    <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
                                        <input
                                            type="text"
                                            placeholder="Custom message (optional)"
                                            value={respondingMessage[r.id] ?? ''}
                                            onChange={(e) => setRespondingMessage((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
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
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function OrgRow({ org, onChange }: { org: Organization; onChange: () => void }) {
    const [open, setOpen] = useState(false)
    const [requests, setRequests] = useState<VolunteerRequest[]>([])
    const [loadingRequests, setLoadingRequests] = useState(false)

    const [eventsOpen, setEventsOpen] = useState(false)
    const [events, setEvents] = useState<OrgUpdate[]>([])
    const [loadingEvents, setLoadingEvents] = useState(false)

    const toggle = async () => {
        if (!open) {
            setLoadingRequests(true)
            const res = await orgApi.getOrgRequests(org.id, 'limit=50')
            if (res.success) setRequests(res.data)
            setLoadingRequests(false)
        }
        setOpen((v) => !v)
    }

    const toggleEvents = async () => {
        if (!eventsOpen) {
            setLoadingEvents(true)
            const res = await orgApi.getUpdates(org.id, 'limit=50')
            if (res.success) setEvents(res.data)
            setLoadingEvents(false)
        }
        setEventsOpen((v) => !v)
    }

    const respond = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
        const res = await orgApi.respondToRequest(requestId, status)
        if (!res.success) {
            alert(res.message ?? 'Could not update this request.')
        }
        const refreshed = await orgApi.getOrgRequests(org.id, 'limit=50')
        if (refreshed.success) setRequests(refreshed.data)
        onChange()
    }

    const handleDelete = async () => {
        if (!confirm('Delete this organization? This cannot be undone.')) return
        await orgApi.delete(org.id)
        onChange()
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {org.logo ? (
                        <img src={getImageUrl(org.logo)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center text-xl">🤝</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{org.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={11} /> {[org.district, org.division].filter(Boolean).join(', ') || org.fullAddress}
                    </p>
                </div>
                <Badge variant={orgStatusVariant[org.status]}>{orgStatusLabel[org.status] ?? org.status}</Badge>
                <button onClick={toggleEvents} className="text-xs font-semibold text-emerald-600 hover:underline">
                    {eventsOpen ? 'Hide events' : `Events (${org._count?.updates ?? 0})`}
                </button>
                <button onClick={toggle} className="text-xs font-semibold text-sky-600 hover:underline">
                    {open ? 'Hide requests' : `Requests (${org._count?.requests ?? 0})`}
                </button>
            </div>

            {eventsOpen && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-2">
                    {loadingEvents ? (
                        <Skeleton className="h-12 w-full" />
                    ) : events.length > 0 ? (
                        events.map((ev) => <EventRegistrationsPanel key={ev.id} event={ev} />)
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-2">No events posted yet.</p>
                    )}
                </div>
            )}

            {open && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3">
                    {loadingRequests ? (
                        <Skeleton className="h-12 w-full" />
                    ) : requests.length > 0 ? (
                        requests.map((req) => (
                            <div key={req.id} className="flex items-start justify-between gap-3 bg-white rounded-lg border border-gray-200 p-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800">{req.volunteer?.name}</p>
                                    {req.message && <p className="text-xs text-gray-500 mt-0.5">{req.message}</p>}
                                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(req.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant={statusVariant[req.status]} className="capitalize">{req.status.toLowerCase()}</Badge>
                                    {req.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => respond(req.id, 'ACCEPTED')} className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100">
                                                <Check size={13} />
                                            </button>
                                            <button onClick={() => respond(req.id, 'REJECTED')} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                                                <X size={13} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-2">No volunteer requests yet.</p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" variant="danger" onClick={handleDelete}>
                            <Trash2 size={13} /> Delete Organization
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function RequestRow({ request, onChange }: { request: VolunteerRequest; onChange: () => void }) {
    const handleCancel = async () => {
        await orgApi.cancelRequest(request.id)
        onChange()
    }

    return (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {request.organization?.logo ? (
                    <img src={getImageUrl(request.organization.logo)} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center text-xl">🤝</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{request.organization?.name}</p>
                <p className="text-xs text-gray-500">
                    {request.organization?.category === 'REGISTERED' ? 'Registered Organization' : 'Volunteer Team'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Requested {timeAgo(request.createdAt)}</p>
            </div>
            <Badge variant={statusVariant[request.status]} className="capitalize">{request.status.toLowerCase()}</Badge>
            {request.status === 'PENDING' && (
                <button onClick={handleCancel} className="text-xs font-semibold text-red-500 hover:underline">Cancel</button>
            )}
        </div>
    )
}

export default function MyOrgsPage() {
    const router = useRouter()
    const { user, ready } = useAuth()
    const [tab, setTab] = useState('orgs')
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [requests, setRequests] = useState<VolunteerRequest[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAll = useCallback(() => {
        setLoading(true)
        Promise.all([orgApi.getMy('limit=50'), orgApi.getMyVolunteerRequests('limit=50')])
            .then(([oRes, rRes]) => {
                if (oRes.success) setOrgs(oRes.data)
                if (rRes.success) setRequests(rRes.data)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/bdcare/my')
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
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                                <Handshake size={18} className="text-sky-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">My BDCare Activity</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href="/bdcare/sos/settings" className="text-xs font-semibold text-red-600 hover:underline">
                                🆘 Alert Settings
                            </a>
                            <a href="/bdcare/create">
                                <Button variant="primary" size="sm"><Plus size={14} /> New Organization</Button>
                            </a>
                        </div>
                    </div>

                    <Tabs
                        tabs={[
                            { label: `My Organizations (${orgs.length})`, value: 'orgs' },
                            { label: `My Requests (${requests.length})`, value: 'requests' },
                        ]}
                        activeTab={tab}
                        onTabChange={setTab}
                        className="mb-5"
                    />

                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                        </div>
                    ) : tab === 'orgs' ? (
                        orgs.length === 0 ? (
                            <EmptyState icon={<Handshake size={40} />} title="No organizations yet" description="Register your organization to start finding volunteers." actionLabel="Register Organization" onAction={() => router.push('/bdcare/create')} />
                        ) : (
                            <div className="space-y-3">
                                {orgs.map((o) => <OrgRow key={o.id} org={o} onChange={fetchAll} />)}
                            </div>
                        )
                    ) : requests.length === 0 ? (
                        <EmptyState icon={<Handshake size={40} />} title="No requests yet" description="Browse organizations and volunteer for a cause you care about." actionLabel="Browse Organizations" onAction={() => router.push('/bdcare')} />
                    ) : (
                        <div className="space-y-3">
                            {requests.map((r) => <RequestRow key={r.id} request={r} onChange={fetchAll} />)}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}