'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Textarea from '@/components/ui/textarea'
import Input from '@/components/ui/input'
import { orgApi } from '@/lib/api'
import type { Organization, OrgUpdate } from '@/lib/api'
import { verificationApi } from '@/lib/verificationApi'
import { useAuth } from '@/lib/AuthContext'
import { getImageUrl, timeAgo } from '@/lib/utils'
import BasicProfileFields from '@/components/shared/BasicProfileFields'
import { AREAS_OF_WORK, AVAILABILITY_OPTIONS } from '@/lib/bdcareConstants'
import {
    MapPin, Phone, Mail, Globe, Facebook, ArrowLeft, Handshake, Send,
    CheckCircle2, Megaphone, BadgeCheck, Clock, AlertCircle, XCircle, Ban,
} from 'lucide-react'

const CATEGORY_LABEL: Record<string, string> = {
    REGISTERED: 'Registered Volunteer Organization',
    TEAM: 'Volunteer Team / Community Group',
}

function StatusBanner({ org }: { org: Organization }) {
    const map: Record<string, { icon: React.ElementType; color: string; text: string }> = {
        PENDING: { icon: Clock, color: 'bg-amber-50 border-amber-200 text-amber-700', text: 'Your registration is submitted and waiting for admin review.' },
        UNDER_REVIEW: { icon: Clock, color: 'bg-amber-50 border-amber-200 text-amber-700', text: 'An admin is currently reviewing your registration.' },
        MORE_INFO_REQUIRED: { icon: AlertCircle, color: 'bg-orange-50 border-orange-200 text-orange-700', text: org.adminNote ? `More information needed: ${org.adminNote}` : 'The admin has requested more information.' },
        REJECTED: { icon: XCircle, color: 'bg-red-50 border-red-200 text-red-700', text: org.rejectReason ? `Registration rejected: ${org.rejectReason}` : 'Your registration was rejected.' },
        SUSPENDED: { icon: Ban, color: 'bg-red-50 border-red-200 text-red-700', text: 'This organization has been suspended by the platform.' },
        EXPIRED: { icon: AlertCircle, color: 'bg-gray-50 border-gray-200 text-gray-600', text: 'Verification has expired. Please contact support to renew.' },
    }
    const entry = map[org.status]
    if (!entry) return null
    const Icon = entry.icon
    return (
        <div className={`flex items-start gap-2 rounded-xl border p-4 text-sm mb-5 ${entry.color}`}>
            <Icon size={16} className="mt-0.5 shrink-0" />
            {entry.text}
        </div>
    )
}

function VerificationBadge({ org }: { org: Organization }) {
    if (org.status !== 'APPROVED') return null
    const isRegistered = org.category === 'REGISTERED'
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${isRegistered ? 'bg-emerald-500' : 'bg-sky-500'}`}>
            <BadgeCheck size={13} />
            {isRegistered ? 'Registered & Verified' : 'Verified Volunteer Team'}
        </span>
    )
}

export default function OrgDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const slug = params.slug as string

    const [org, setOrg] = useState<Organization | null>(null)
    const [updates, setUpdates] = useState<OrgUpdate[]>([])
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [interestAreas, setInterestAreas] = useState<string[]>([])
    const [availability, setAvailability] = useState('')
    const [requestSent, setRequestSent] = useState(false)
    const [error, setError] = useState('')

    const [postTitle, setPostTitle] = useState('')
    const [postContent, setPostContent] = useState('')
    const [postImage, setPostImage] = useState<File | null>(null)
    const [postEventDate, setPostEventDate] = useState('')
    const [postPlace, setPostPlace] = useState('')
    const [postDivision, setPostDivision] = useState('')
    const [postDistrict, setPostDistrict] = useState('')
    const [postUpazila, setPostUpazila] = useState('')
    const [posting, setPosting] = useState(false)

    const fetchOrg = useCallback(async () => {
        setLoading(true)
        const res = await orgApi.getBySlug(slug)
        if (!res.success || !res.data) {
            setNotFoundState(true)
            setLoading(false)
            return
        }
        setOrg(res.data)
        setPostDivision(res.data.division ?? '')
        setPostDistrict(res.data.district ?? '')
        setPostUpazila(res.data.upazila ?? '')
        if (res.data.status === 'APPROVED') {
            const updatesRes = await orgApi.getUpdates(res.data.id)
            if (updatesRes.success) setUpdates(updatesRes.data)
        }
        setLoading(false)
    }, [slug])

    useEffect(() => { fetchOrg() }, [fetchOrg])
    useEffect(() => {
        const draft = sessionStorage.getItem(`draft:volunteer:${slug}`)
        if (draft) {
            setMessage(draft)
            sessionStorage.removeItem(`draft:volunteer:${slug}`)
        }
    }, [slug])

    const handleRequest = async () => {
        if (!user) {
            router.push(`/auth/login?next=/bdcare/${slug}`)
            return
        }
        setSubmitting(true)
        setError('')

        const res = await orgApi.sendVolunteerRequest(org!.id, {
            message: message.trim() || undefined,
            interestAreas,
            availability: availability || undefined,
        })
        if (res.success) {
            setRequestSent(true)
        } else {
            setError(res.message ?? 'Could not send your request. Please try again.')
        }
        setSubmitting(false)
    }

    const handlePostUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setPosting(true)

        let imageUrl: string | undefined
        if (postImage) {
            const fd = new FormData()
            fd.append('image', postImage)
            const up = await orgApi.uploadUpdateImage(fd)
            if (up.success && up.data) imageUrl = up.data.url
        }

        const res = await orgApi.createUpdate(org!.id, {
            title: postTitle,
            content: postContent,
            images: imageUrl ? [imageUrl] : [],
            eventDate: postEventDate,
            place: postPlace,
            division: postDivision,
            district: postDistrict,
            upazila: postUpazila,
        })
        if (res.success && res.data) {
            setUpdates((prev) => [res.data!, ...prev])
            setPostTitle('')
            setPostContent('')
            setPostImage(null)
            setPostEventDate('')
            // division/district/upazila reset করবে না — org-এর নিজের এলাকা দিয়ে prefill থাকুক পরের event-এর জন্যও
        }
        setPosting(false)
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        )
    }

    if (notFoundState || !org) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-5xl">🤝</p>
                    <h1 className="text-xl font-bold text-gray-900">Organization not found</h1>
                    <p className="text-gray-500 text-sm">This organization may not exist, or is still awaiting approval.</p>
                    <a href="/bdcare" className="text-sky-600 text-sm font-semibold hover:underline">Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    const isOwner = user?.id === org.ownerId
    const isApproved = org.status === 'APPROVED'
    const locationLine = [org.upazila, org.district, org.division].filter(Boolean).join(', ') || org.fullAddress

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <a href="/bdcare" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-600 mb-5 transition-colors">
                        <ArrowLeft size={14} />
                        Back to organizations
                    </a>

                    {isOwner && <StatusBanner org={org} />}

                    <div className="rounded-2xl overflow-hidden bg-gray-100 h-40 md:h-56 mb-4">
                        {org.coverImage ? (
                            <img src={getImageUrl(org.coverImage)} alt={org.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center">
                                <span className="text-7xl opacity-70">🤝</span>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        <div className="md:col-span-3 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-14 h-14 rounded-full border-4 border-white bg-sky-100 overflow-hidden shadow-sm shrink-0 -mt-12">
                                        {org.logo ? (
                                            <img src={getImageUrl(org.logo)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sky-600 font-bold text-lg">
                                                {org.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="info">{CATEGORY_LABEL[org.category] ?? org.category}</Badge>
                                        <VerificationBadge org={org} />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                                    {org.name}
                                </h1>
                                <p className="text-xs text-gray-400 mb-3">
                                    {org.orgType === 'Other' ? org.orgTypeOther : org.orgType}
                                    {org.establishedYear ? ` · Established ${org.establishedYear}` : ''}
                                </p>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-4">{org.description}</p>

                                {org.registration?.registrationAuthority && (
                                    <p className="text-xs text-gray-500 mb-3">
                                        Registered with: <span className="font-medium text-gray-700">
                                            {org.registration.registrationAuthority === 'Other Government Authority'
                                                ? org.registration.authorityOther
                                                : org.registration.registrationAuthority}
                                        </span>
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <span className="flex items-center gap-1.5"><MapPin size={13} className="text-sky-500" /> {locationLine}</span>
                                    {org.contactPhone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-sky-500" /> {org.contactPhone}</span>}
                                    {org.contactEmail && <span className="flex items-center gap-1.5"><Mail size={13} className="text-sky-500" /> {org.contactEmail}</span>}
                                    {org.website && <span className="flex items-center gap-1.5"><Globe size={13} className="text-sky-500" /> {org.website}</span>}
                                    {org.facebookPage && <span className="flex items-center gap-1.5"><Facebook size={13} className="text-sky-500" /> {org.facebookPage}</span>}
                                </div>
                            </div>

                            {org.areasOfWork.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h2 className="text-sm font-bold text-gray-900 mb-4">Areas of Work</h2>
                                    <div className="space-y-4">
                                        {org.areasOfWork.map((a, i) => (
                                            <div key={a.id ?? i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                <h3 className="text-sm font-semibold text-sky-700">
                                                    {a.area === 'Other' ? a.areaOther : a.area}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {org.institution?.institutionName && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h2 className="text-sm font-bold text-gray-900 mb-4">Institution</h2>
                                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-400">Institution Name</p>
                                            <p className="text-gray-800">{org.institution.institutionName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Institution Type</p>
                                            <p className="text-gray-800">{org.institution.institutionType}</p>
                                        </div>
                                        {org.institution.department && (
                                            <div>
                                                <p className="text-xs text-gray-400">Department / Faculty</p>
                                                <p className="text-gray-800">{org.institution.department}</p>
                                            </div>
                                        )}
                                        {org.institution.clubName && (
                                            <div>
                                                <p className="text-xs text-gray-400">Club / Society</p>
                                                <p className="text-gray-800">{org.institution.clubName}</p>
                                            </div>
                                        )}
                                    </div>
                                    {org.institution.affiliated === 'YES' && (
                                        <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
                                            <BadgeCheck size={13} /> Officially affiliated with this institution
                                        </p>
                                    )}
                                </div>
                            )}

                            {isOwner && (
                                <form onSubmit={handlePostUpdate} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Megaphone size={15} className="text-sky-500" />
                                        Create Event
                                    </h2>
                                    {!isApproved && (
                                        <p className="text-xs text-gray-400">Updates will be visible once your organization is approved.</p>
                                    )}
                                    <Input
                                        placeholder="Update title"
                                        required
                                        disabled={!isApproved}
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Share what's happening…"
                                        rows={3}
                                        required
                                        disabled={!isApproved}
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                    />
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-600">Event Cover Image (optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={!isApproved}
                                            onChange={(e) => setPostImage(e.target.files?.[0] ?? null)}
                                            className="text-sm"
                                        />
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        placeholder="Event date & time"
                                        required
                                        disabled={!isApproved}
                                        value={postEventDate}
                                        onChange={(e) => setPostEventDate(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Place"
                                        required
                                        disabled={!isApproved}
                                        value={postPlace}
                                        onChange={(e) => setPostPlace(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Division"
                                            required
                                            disabled={!isApproved}
                                            value={postDivision}
                                            onChange={(e) => setPostDivision(e.target.value)}
                                        />
                                        <Input
                                            placeholder="District"
                                            required
                                            disabled={!isApproved}
                                            value={postDistrict}
                                            onChange={(e) => setPostDistrict(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Upazila"
                                            required
                                            disabled={!isApproved}
                                            value={postUpazila}
                                            onChange={(e) => setPostUpazila(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" variant="primary" isLoading={posting} disabled={!isApproved}>
                                        Create Event
                                    </Button>
                                </form>
                            )}

                            {isApproved && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h2 className="text-sm font-bold text-gray-900 mb-4">Events</h2>
                                    {updates.length === 0 ? (
                                        <p className="text-sm text-gray-400">No updates posted yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {updates.map((u) => (
                                                <div key={u.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                    <h3 className="text-sm font-semibold text-gray-900">{u.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{u.content}</p>
                                                    <span className="text-xs text-gray-400 mt-1 block">{timeAgo(u.createdAt)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                {isOwner ? (
                                    <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-700 space-y-2">
                                        <p>
                                            This is your organization. Manage requests from{' '}
                                            <a href="/bdcare/my" className="font-semibold underline">My Orgs</a>.
                                        </p>
                                        <a href={`/bdcare/${slug}/edit`} className="inline-block px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition-colors">
                                            Edit Organization
                                        </a>
                                    </div>
                                ) : !isApproved ? (
                                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
                                        This organization isn&apos;t open for volunteers yet.
                                    </div>
                                ) : requestSent ? (
                                    <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 flex items-start gap-2 text-sm text-sky-700">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                        Request sent! The organization will review it soon.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Handshake size={15} className="text-sky-500" />
                                            Volunteer with this organization
                                        </h2>
                                        <BasicProfileFields />

                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Areas of interest (optional)</label>
                                            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                                                {AREAS_OF_WORK.map((area) => (
                                                    <label key={area} className="flex items-center gap-1.5 text-xs text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={interestAreas.includes(area)}
                                                            onChange={(e) => {
                                                                setInterestAreas((prev) =>
                                                                    e.target.checked ? [...prev, area] : prev.filter((a) => a !== area)
                                                                )
                                                            }}
                                                        />
                                                        {area}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Availability (optional)</label>
                                            <select
                                                value={availability}
                                                onChange={(e) => setAvailability(e.target.value)}
                                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                                            >
                                                <option value="">Select...</option>
                                                {AVAILABILITY_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Textarea
                                            label="Message (optional)"
                                            placeholder="Tell them why you'd like to join…"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3}
                                        />
                                        {error && <p className="text-xs text-red-600">{error}</p>}
                                        <Button variant="primary" className="w-full" isLoading={submitting} onClick={handleRequest}>
                                            <Send size={15} />
                                            Send Volunteer Request
                                        </Button>
                                        {!user && (
                                            <p className="text-xs text-gray-400 text-center">You&apos;ll need to log in first.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}