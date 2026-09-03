'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import { getAdminProviderById, updateProviderStatus, openProviderDocument } from '@/lib/providerApi'
import type { CourseProvider, CourseProviderStatus } from '@/lib/providerApi'
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react'

const STATUS_OPTIONS: CourseProviderStatus[] = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-red-100 text-red-700',
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
    if (!value && value !== 0) return null
    return (
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    )
}

function DocLink({ label, url }: { label: string; url?: string | null }) {
    if (!url) return null
    return (
        <button
            onClick={() => openProviderDocument(url)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
        >
            <FileText size={12} /> {label} <ExternalLink size={11} />
        </button>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">{title}</h2>
            {children}
        </div>
    )
}

export default function AdminCourseProviderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [provider, setProvider] = useState<CourseProvider | null>(null)
    const [loading, setLoading] = useState(true)
    const [newStatus, setNewStatus] = useState<CourseProviderStatus | ''>('')
    const [adminNote, setAdminNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    const fetchProvider = useCallback(() => {
        setLoading(true)
        getAdminProviderById(id)
            .then((res) => { if (res.success && res.data) setProvider(res.data) })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => { fetchProvider() }, [fetchProvider])

    const handleUpdateStatus = async () => {
        if (!newStatus) return
        setSaving(true)
        setSaveError('')
        const res = await updateProviderStatus(id, {
            status: newStatus,
            adminNote: adminNote.trim() || undefined,
        })
        if (!res.success) {
            setSaveError(res.message ?? 'Could not update status.')
            setSaving(false)
            return
        }
        setNewStatus('')
        setAdminNote('')
        fetchProvider()
        setSaving(false)
    }

    if (loading || !provider) {
        return (
            <ErrorBoundary>
                <DashboardLayout role="admin">
                    <div className="flex items-center justify-center h-64">
                        <span className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                </DashboardLayout>
            </ErrorBoundary>
        )
    }

    const statusOptions = STATUS_OPTIONS.map((s) => ({ label: s.replace(/_/g, ' '), value: s }))

    return (
        <ErrorBoundary>
            <DashboardLayout role="admin">
                <button onClick={() => router.push('/admin/course-providers')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-4">
                    <ArrowLeft size={14} /> Back to course providers
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {provider.logo ? (
                            <img src={provider.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">{provider.institutionName.charAt(0)}</div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{provider.institutionName}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{provider.institutionType.replace(/_/g, ' ')}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[provider.status]}`}>
                                {provider.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <Section title="General Info">
                            <div className="grid sm:grid-cols-2 gap-4 mb-3">
                                <Field label="Institution Name" value={provider.institutionName} />
                                <Field label="Institution Type" value={provider.institutionType.replace(/_/g, ' ')} />
                                <Field label="Website" value={provider.website} />
                                <Field label="Facebook Page" value={provider.facebookPage} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Headquarters Address</p>
                                <p className="text-sm text-gray-700 mt-1">{provider.headquartersAddress}</p>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4 mt-3">
                                <Field label="Division" value={provider.headquartersDivision} />
                                <Field label="District" value={provider.headquartersDistrict} />
                                <Field label="Upazila" value={provider.headquartersUpazila} />
                            </div>
                        </Section>

                        <Section title="Legal & Verification">
                            <div className="grid sm:grid-cols-2 gap-4 mb-3">
                                <Field label="Registration Number" value={provider.registrationNumber} />
                            </div>
                            <DocLink label="Legal Document" url={provider.legalDocumentUrl} />
                        </Section>

                        <Section title="Focal Person (Confidential — admin only)">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Full Name" value={provider.contactPersonName} />
                                <Field label="Designation" value={provider.designation} />
                                <Field label="Official Email" value={provider.officialEmail} />
                                <Field label="Mobile" value={provider.mobileNumber} />
                                <Field label="NID Number" value={provider.nidNumber} />
                            </div>
                        </Section>

                        {provider.branches.length > 0 && (
                            <Section title={`Branches (${provider.branches.length})`}>
                                <div className="space-y-2">
                                    {provider.branches.map((b) => (
                                        <div key={b.id} className="text-sm text-gray-700 border-b border-gray-50 last:border-0 pb-2 last:pb-0 flex items-center justify-between">
                                            <span>{b.name} {b.isMain && <span className="text-xs text-emerald-600 font-medium">(Main)</span>}</span>
                                            <span className="text-xs text-gray-400">{b.upazila}, {b.district}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {provider.adminNote && (
                            <Section title="Current Admin Note">
                                <p className="text-sm text-gray-700">{provider.adminNote}</p>
                            </Section>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-4 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900">Update Verification Status</h2>
                            <Select
                                label="New Status"
                                placeholder="Select a status"
                                options={statusOptions}
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as CourseProviderStatus)}
                            />
                            <Textarea
                                label="Admin Note (optional)"
                                placeholder="Internal note or reason shown to the provider"
                                rows={3}
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                            {newStatus === 'APPROVED' && provider.branches.every((b) => !b.isMain) && (
                                <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">
                                    A Main Branch will be auto-created using the headquarters details above.
                                </p>
                            )}
                            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                            <Button
                                variant="primary"
                                className="w-full"
                                isLoading={saving}
                                disabled={!newStatus}
                                onClick={handleUpdateStatus}
                            >
                                Update Status
                            </Button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ErrorBoundary>
    )
}