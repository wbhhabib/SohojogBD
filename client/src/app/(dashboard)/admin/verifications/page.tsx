'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Button from '@/components/ui/button'
import { verificationApi, VerificationProfile, openVerificationDocument } from '@/lib/verificationApi'
import { ShieldCheck, FileImage, CheckCircle2, XCircle } from 'lucide-react'

const PAGE_SIZE = 10

interface PendingUser extends VerificationProfile {
    id: string
    name: string
    email: string
}

export default function AdminVerificationsPage() {
    const [users, setUsers] = useState<PendingUser[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [activeUserId, setActiveUserId] = useState<string | null>(null)
    const [note, setNote] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchPending = useCallback(() => {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(PAGE_SIZE))

        verificationApi
            .adminGetPending(params.toString())
            .then((res) => {
                if (res.success) {
                    setUsers((res.data as unknown as PendingUser[]) ?? [])
                    setTotal(res.meta?.total ?? (res.data as unknown[])?.length ?? 0)
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [page])

    useEffect(() => {
        fetchPending()
    }, [fetchPending])

    const handleReview = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
        setSubmitting(true)
        const res = await verificationApi.adminReview(userId, { status, note: note.trim() || undefined })
        if (res.success) {
            setActiveUserId(null)
            setNote('')
            fetchPending()
        }
        setSubmitting(false)
    }

    return (
        <ErrorBoundary>
            <DashboardLayout role="admin">
                <PageHeader title="Profile Verifications" />

                <div className="px-6 pb-10">
                    {isLoading ? (
                        <p className="text-sm text-slate-400 mt-6">Loading…</p>
                    ) : users.length === 0 ? (
                        <EmptyState
                            icon={<ShieldCheck />}
                            title="No pending verifications"
                            description="All submitted profiles have been reviewed."
                        />
                    ) : (
                        <div className="mt-6 flex flex-col gap-4">
                            {users.map((u) => (
                                <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-slate-900">{u.name}</p>
                                            <p className="text-sm text-slate-500">{u.email}</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Phone: {u.phone ?? '—'} · Identity: {u.identityType ?? '—'} {u.identityNumber ?? ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {u.identityDocPicture && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => openVerificationDocument(u.identityDocPicture!)}
                                                >
                                                    <FileImage size={14} />
                                                    View ID
                                                </Button>
                                            )}
                                            {u.studentIdCard && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => openVerificationDocument(u.studentIdCard!)}
                                                >
                                                    <FileImage size={14} />
                                                    Student ID
                                                </Button>
                                            )}
                                            {u.trainingCertificate && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => openVerificationDocument(u.trainingCertificate!)}
                                                >
                                                    <FileImage size={14} />
                                                    Certificate
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {activeUserId === u.id ? (
                                        <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
                                            <textarea
                                                className="w-full text-sm border border-gray-200 rounded-lg p-2"
                                                placeholder="Reason (required for reject, optional for approve)"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                rows={2}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="primary"
                                                    isLoading={submitting}
                                                    onClick={() => handleReview(u.id, 'VERIFIED')}
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    isLoading={submitting}
                                                    disabled={!note.trim()}
                                                    onClick={() => handleReview(u.id, 'REJECTED')}
                                                >
                                                    <XCircle size={14} />
                                                    Reject
                                                </Button>
                                                <Button variant="ghost" onClick={() => { setActiveUserId(null); setNote('') }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <Button variant="outline" onClick={() => setActiveUserId(u.id)}>
                                                Review
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center justify-center gap-3 mt-4">
                                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                    Prev
                                </Button>
                                <span className="text-sm text-slate-500">
                                    Page {page} of {totalPages}
                                </span>
                                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ErrorBoundary>
    )
}