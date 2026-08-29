'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import { orgApi, openOrgDocument } from '@/lib/api'
import type { Organization, OrgVerificationLog, OrgVerificationStatus } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { ArrowLeft, FileText, ExternalLink, History } from 'lucide-react'

const REGISTERED_STATUSES: OrgVerificationStatus[] = ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'EXPIRED']
const TEAM_STATUSES: OrgVerificationStatus[] = ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'SUSPENDED']
const REASON_REQUIRED_STATUSES: OrgVerificationStatus[] = ['MORE_INFO_REQUIRED', 'REJECTED', 'SUSPENDED']

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700', UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    MORE_INFO_REQUIRED: 'bg-orange-100 text-orange-700', APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700', SUSPENDED: 'bg-red-100 text-red-700', EXPIRED: 'bg-gray-100 text-gray-600',
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
            onClick={() => openOrgDocument(url)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-sky-300 hover:text-sky-600 transition-colors"
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

export default function AdminOrgDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [org, setOrg] = useState<(Organization & { verificationLogs: OrgVerificationLog[] }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [newStatus, setNewStatus] = useState<OrgVerificationStatus | ''>('')
    const [reason, setReason] = useState('')
    const [adminNote, setAdminNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    const fetchOrg = useCallback(() => {
        setLoading(true)
        orgApi.adminGetById(id)
            .then((res) => { if (res.success && res.data) setOrg(res.data) })
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => { fetchOrg() }, [fetchOrg])

    const handleUpdateStatus = async () => {
        if (!newStatus) return
        setSaving(true)
        setSaveError('')
        const res = await orgApi.adminUpdateStatus(id, {
            status: newStatus,
            reason: reason.trim() || undefined,
            adminNote: adminNote.trim() || undefined,
        })
        if (!res.success) {
            setSaveError(res.message ?? 'Could not update status.')
            setSaving(false)
            return
        }
        setReason('')
        setNewStatus('')
        fetchOrg()
        setSaving(false)
    }

    if (loading || !org) {
        return (
            <ErrorBoundary>
                <DashboardLayout role="admin">
                    <div className="flex items-center justify-center h-64">
                        <span className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                </DashboardLayout>
            </ErrorBoundary>
        )
    }

    const statusOptions = (org.category === 'REGISTERED' ? REGISTERED_STATUSES : TEAM_STATUSES)
        .map((s) => ({ label: s.replace(/_/g, ' '), value: s }))
    const reasonRequired = newStatus ? REASON_REQUIRED_STATUSES.includes(newStatus) : false

    return (
        <ErrorBoundary>
            <DashboardLayout role="admin">
                <button onClick={() => router.push('/admin/organizations')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-600 mb-4">
                    <ArrowLeft size={14} /> Back to organizations
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {org.logo ? (
                            <img src={getImageUrl(org.logo)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">{org.name.charAt(0)}</div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{org.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{org.category === 'REGISTERED' ? 'Registered Organization' : 'Volunteer Team'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[org.status]}`}>
                                {org.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <Section title="Basic Information">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Organization Type" value={org.orgType === 'Other' ? org.orgTypeOther : org.orgType} />
                                <Field label="Established Year" value={org.establishedYear} />
                                <Field label="Contact Phone" value={org.contactPhone} />
                                <Field label="Contact Email" value={org.contactEmail} />
                                <Field label="Website" value={org.website} />
                                <Field label="Facebook Page" value={org.facebookPage} />
                            </div>
                            <div className="mt-3">
                                <p className="text-xs text-gray-400">Description</p>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{org.description}</p>
                            </div>
                        </Section>

                        <Section title="Areas of Work">
                            <div className="space-y-3">
                                {org.areasOfWork.map((a, i) => (
                                    <div key={a.id ?? i} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <p className="text-sm font-semibold text-sky-700">{a.area === 'Other' ? a.areaOther : a.area}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {org.category === 'REGISTERED' && org.registration && (
                            <Section title="Legal Registration">
                                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                                    <Field label="Authority" value={org.registration.registrationAuthority === 'Other Government Authority' ? org.registration.authorityOther : org.registration.registrationAuthority} />
                                    <Field label="Registration Number" value={org.registration.registrationNumber} />
                                    <Field label="Registration Date" value={org.registration.registrationDate ? new Date(org.registration.registrationDate).toLocaleDateString() : undefined} />
                                    <Field label="Expiry Date" value={org.registration.expiryDate ? new Date(org.registration.expiryDate).toLocaleDateString() : undefined} />
                                </div>
                                <DocLink label="Registration Certificate" url={org.registration.certificateUrl} />
                            </Section>
                        )}

                        {org.category === 'TEAM' && org.teamEvidence && (
                            <Section title="Volunteer Team Evidence">
                                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                                    <Field label="Previous Activities" value={org.teamEvidence.pastActivities} />
                                    <Field label="Number of Activities" value={org.teamEvidence.activityCount} />
                                    <Field label="Approx. Volunteers" value={org.teamEvidence.volunteerCountApprox} />
                                    <Field label="Most Recent Activity" value={org.teamEvidence.recentActivity} />
                                    <Field label="Facebook Page" value={org.teamEvidence.facebookPageUrl} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <DocLink label="Activity Report" url={org.teamEvidence.activityReportUrl} />
                                    <DocLink label="Supporting Document" url={org.teamEvidence.supportingDocUrl} />
                                </div>
                            </Section>
                        )}

                        {org.institution && (
                            <Section title="Institution Affiliation">
                                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                                    <Field label="Institution Name" value={org.institution.institutionName} />
                                    <Field label="Institution Type" value={org.institution.institutionType} />
                                    <Field label="Department" value={org.institution.department} />
                                    <Field label="Club/Society" value={org.institution.clubName} />
                                    <Field label="Advisor Name" value={org.institution.advisorName} />
                                    <Field label="Advisor Contact" value={org.institution.advisorContact} />
                                    <Field label="Affiliated" value={org.institution.affiliated} />
                                </div>
                                <DocLink label="Authorization Document" url={org.institution.authorizationDocUrl} />
                            </Section>
                        )}

                        {org.representative && (
                            <Section title="Representative (Confidential — admin only)">
                                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                                    <Field label="Full Name" value={org.representative.fullName} />
                                    <Field label="Designation" value={org.representative.designation === 'Other' ? org.representative.designationOther : org.representative.designation} />
                                    <Field label="Mobile" value={org.representative.mobile} />
                                    <Field label="Email" value={org.representative.email} />
                                    <Field label="NID Number" value={org.representative.nidNumber} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <DocLink label="NID Copy" url={org.representative.nidDocUrl} />
                                    <DocLink label={org.category === 'REGISTERED' ? 'Authorization Letter' : 'Leader Declaration'} url={org.representative.authorizationDocUrl} />
                                </div>
                            </Section>
                        )}

                        <Section title="Location">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Division" value={org.division} />
                                <Field label="District" value={org.district} />
                                <Field label="Upazila/Thana" value={org.upazila} />
                                <Field label="Postal Code" value={org.postalCode} />
                            </div>
                            <div className="mt-3">
                                <p className="text-xs text-gray-400">Full Address</p>
                                <p className="text-sm text-gray-700 mt-1">{org.fullAddress}</p>
                            </div>
                        </Section>

                        <Section title="">
                            <div className="flex items-center gap-2 mb-3 -mt-1">
                                <History size={14} className="text-gray-400" />
                                <h3 className="text-sm font-bold text-gray-900">Verification History</h3>
                            </div>
                            {org.verificationLogs.length === 0 ? (
                                <p className="text-xs text-gray-400">No status changes yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {org.verificationLogs.map((log) => (
                                        <div key={log.id} className="text-xs text-gray-600 border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                            <span className="font-medium text-gray-800">{log.admin?.name ?? 'Admin'}</span>
                                            {' changed status '}
                                            {log.oldStatus && <span>{log.oldStatus.replace(/_/g, ' ')} → </span>}
                                            <span className="font-semibold">{log.newStatus.replace(/_/g, ' ')}</span>
                                            {log.reason && <span className="block text-gray-500 mt-0.5">Reason: {log.reason}</span>}
                                            <span className="block text-gray-400 mt-0.5">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-4 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900">Update Verification Status</h2>
                            <Select
                                label="New Status"
                                placeholder="Select a status"
                                options={statusOptions}
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as OrgVerificationStatus)}
                            />
                            <Textarea
                                label={`Reason ${reasonRequired ? '(required)' : '(optional)'}`}
                                placeholder="Explain why (shown to the organization)"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <Textarea
                                label="Internal Note (optional, admin-only)"
                                placeholder="Not shown to the organization"
                                rows={2}
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                            <Button
                                variant="primary"
                                className="w-full"
                                isLoading={saving}
                                disabled={!newStatus || (reasonRequired && !reason.trim())}
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