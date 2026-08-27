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
import { useAuth } from '@/lib/AuthContext'
import { getImageUrl, timeAgo } from '@/lib/utils'
import { MapPin, Phone, Mail, ArrowLeft, Handshake, Send, CheckCircle2, Megaphone } from 'lucide-react'

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
    const [requestSent, setRequestSent] = useState(false)
    const [error, setError] = useState('')

    // owner: post-update form
    const [postTitle, setPostTitle] = useState('')
    const [postContent, setPostContent] = useState('')
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
        const updatesRes = await orgApi.getUpdates(res.data.id)
        if (updatesRes.success) setUpdates(updatesRes.data)
        setLoading(false)
    }, [slug])

    useEffect(() => { fetchOrg() }, [fetchOrg])

    const handleRequest = async () => {
        if (!user) {
            router.push(`/auth/login?next=/bdcare/${slug}`)
            return
        }
        setSubmitting(true)
        setError('')
        const res = await orgApi.sendVolunteerRequest(org!.id, {
            message: message.trim() || undefined,
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
        const res = await orgApi.createUpdate(org!.id, { title: postTitle, content: postContent, images: [] })
        if (res.success && res.data) {
            setUpdates((prev) => [res.data!, ...prev])
            setPostTitle('')
            setPostContent('')
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
                    <p className="text-gray-500 text-sm">This organization may have been removed.</p>
                    <a href="/bdcare" className="text-sky-600 text-sm font-semibold hover:underline">Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    const isOwner = user?.id === org.ownerId

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <a href="/bdcare" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-600 mb-5 transition-colors">
                        <ArrowLeft size={14} />
                        Back to organizations
                    </a>

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
                                    <Badge variant="info" className="capitalize">{org.category}</Badge>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Lora', Georgia, serif" }}>
                                    {org.name}
                                </h1>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-4">{org.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <span className="flex items-center gap-1.5"><MapPin size={13} className="text-sky-500" /> {org.location}</span>
                                    {org.contactPhone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-sky-500" /> {org.contactPhone}</span>}
                                    {org.contactEmail && <span className="flex items-center gap-1.5"><Mail size={13} className="text-sky-500" /> {org.contactEmail}</span>}
                                </div>
                            </div>

                            {isOwner && (
                                <form onSubmit={handlePostUpdate} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Megaphone size={15} className="text-sky-500" />
                                        Post an update
                                    </h2>
                                    <Input
                                        placeholder="Update title"
                                        required
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Share what's happening…"
                                        rows={3}
                                        required
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                    />
                                    <Button type="submit" variant="primary" isLoading={posting}>
                                        Post Update
                                    </Button>
                                </form>
                            )}

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-sm font-bold text-gray-900 mb-4">Updates</h2>
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
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                {isOwner ? (
                                    <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-700">
                                        This is your organization. Manage requests from{' '}
                                        <a href="/bdcare/my" className="font-semibold underline">My Orgs</a>.
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