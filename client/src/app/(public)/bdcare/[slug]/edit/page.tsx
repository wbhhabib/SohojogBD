'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import Button from '@/components/ui/button'
import DocUpload from '@/components/org/DocUpload'
import PhotosUpload from '@/components/org/PhotosUpload'
import { orgApi } from '@/lib/api'
import type { Organization, AreaOfWork } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { ArrowLeft, AlertCircle, Clock, XCircle } from 'lucide-react'
import LocationSelect from '@/components/common/LocationSelect'

const REGISTERED_ORG_TYPES = [
    'Registered Volunteer Organization', 'NGO', 'Foundation',
    'Social Welfare Organization', 'Non-Profit Organization', 'Other',
]
const TEAM_ORG_TYPES = [
    'Local Volunteer Team', 'Community Volunteer Group', 'Youth Volunteer Team',
    'School Volunteer Group', 'College Volunteer Group', 'University Volunteer Group',
    'Student Volunteer Organization', 'Area-Based Volunteer Group', 'Other',
]
const INSTITUTION_ORG_TYPES = ['School Volunteer Group', 'College Volunteer Group', 'University Volunteer Group']
const AREAS_OF_WORK = [
    'Education', 'Climate Change & Environment', 'Youth Development', 'Women & Girls Empowerment',
    'Healthcare', 'Blood Donation', 'Disaster Response & Relief', 'Food Support',
    'Agriculture & Farmer Support', 'Animal Welfare', 'Child Welfare', 'Disability Support',
    'Community Development', 'Human Rights', 'Good Governance & Civic Engagement',
    'Technology & Digital Inclusion', 'Employment & Skill Development', 'Poverty Alleviation',
    'Tree Plantation & Conservation', 'Cleanliness & Waste Management', 'Research & Knowledge',
    'Sports', 'Culture & Arts', 'Humanitarian Aid', 'Safety & Public Awareness',
    'Mental Health & Well-being', 'Rural Development', 'Urban Development',
    'Awareness & Advocacy', 'Sustainable Development', 'Other',
]
const REGISTRATION_AUTHORITIES = [
    'Department of Social Services (DSS)', 'NGO Affairs Bureau (NGOAB)', 'RJSC', 'Other Government Authority',
]
const REGISTERED_DESIGNATIONS = [
    'President', 'General Secretary', 'Executive Director', 'Founder', 'Director',
    'Volunteer Coordinator', 'Authorized Representative', 'Other',
]
const TEAM_DESIGNATIONS = [
    'Team Leader', 'Team Coordinator', 'Founder', 'Group Admin',
    'Volunteer Coordinator', 'President', 'General Secretary', 'Other',
]

interface AreaEntry { area: string; areaOther: string; description: string }

function dateInput(d?: string | null) {
    if (!d) return ''
    return new Date(d).toISOString().slice(0, 10)
}

export default function EditOrgPage() {
    const params = useParams()
    const router = useRouter()
    const { user, ready } = useAuth()
    const slug = params.slug as string

    const [org, setOrg] = useState<Organization | null>(null)
    const [loading, setLoading] = useState(true)
    const [notAllowed, setNotAllowed] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [saved, setSaved] = useState(false)

    const [logo, setLogo] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [uploadingImages, setUploadingImages] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [orgType, setOrgType] = useState('')
    const [orgTypeOther, setOrgTypeOther] = useState('')
    const [establishedYear, setEstablishedYear] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [website, setWebsite] = useState('')
    const [facebookPage, setFacebookPage] = useState('')
    const [otherSocialLinks, setOtherSocialLinks] = useState('')

    const [areas, setAreas] = useState<AreaEntry[]>([])

    const [regAuthority, setRegAuthority] = useState('')
    const [regAuthorityOther, setRegAuthorityOther] = useState('')
    const [regNumber, setRegNumber] = useState('')
    const [regDate, setRegDate] = useState('')
    const [regExpiry, setRegExpiry] = useState('')
    const [certificateUrl, setCertificateUrl] = useState('')

    const [pastActivities, setPastActivities] = useState('')
    const [activityCount, setActivityCount] = useState('')
    const [volunteerCountApprox, setVolunteerCountApprox] = useState('')
    const [recentActivity, setRecentActivity] = useState('')
    const [facebookPageUrl, setFacebookPageUrl] = useState('')
    const [previousCampaignLinks, setPreviousCampaignLinks] = useState('')
    const [activityReportUrl, setActivityReportUrl] = useState('')
    const [supportingDocUrl, setSupportingDocUrl] = useState('')
    const [teamPhotos, setTeamPhotos] = useState<string[]>([])

    const [institutionName, setInstitutionName] = useState('')
    const [institutionType, setInstitutionType] = useState('')
    const [department, setDepartment] = useState('')
    const [clubName, setClubName] = useState('')
    const [advisorName, setAdvisorName] = useState('')
    const [advisorContact, setAdvisorContact] = useState('')
    const [affiliated, setAffiliated] = useState<'YES' | 'NO' | 'NOT_APPLICABLE'>('NOT_APPLICABLE')
    const [institutionAuthDocUrl, setInstitutionAuthDocUrl] = useState('')

    const [repFullName, setRepFullName] = useState('')
    const [repDesignation, setRepDesignation] = useState('')
    const [repDesignationOther, setRepDesignationOther] = useState('')
    const [repMobile, setRepMobile] = useState('')
    const [repEmail, setRepEmail] = useState('')
    const [nidNumber, setNidNumber] = useState('')
    const [nidDocUrl, setNidDocUrl] = useState('')
    const [repAuthDocUrl, setRepAuthDocUrl] = useState('')

    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [postalCode, setPostalCode] = useState('')

    const fetchOrg = useCallback(async () => {
        setLoading(true)
        const res = await orgApi.getBySlug(slug)
        if (!res.success || !res.data) {
            setNotAllowed(true)
            setLoading(false)
            return
        }
        const o = res.data
        if (user && o.ownerId !== user.id) {
            setNotAllowed(true)
            setLoading(false)
            return
        }
        setOrg(o)

        setName(o.name)
        setDescription(o.description)
        setOrgType(o.orgType)
        setOrgTypeOther(o.orgTypeOther ?? '')
        setEstablishedYear(o.establishedYear ? String(o.establishedYear) : '')
        setContactPhone(o.contactPhone)
        setContactEmail(o.contactEmail ?? '')
        setWebsite(o.website ?? '')
        setFacebookPage(o.facebookPage ?? '')
        setOtherSocialLinks(o.otherSocialLinks ?? '')

        setAreas((o.areasOfWork ?? []).map((a: AreaOfWork) => ({
            area: a.area, areaOther: a.areaOther ?? '', description: a.description,
        })))

        if (o.registration) {
            setRegAuthority(o.registration.registrationAuthority)
            setRegAuthorityOther(o.registration.authorityOther ?? '')
            setRegNumber(o.registration.registrationNumber ?? '')
            setRegDate(dateInput(o.registration.registrationDate))
            setRegExpiry(dateInput(o.registration.expiryDate))
            setCertificateUrl(o.registration.certificateUrl ?? '')
        }

        if (o.teamEvidence) {
            setPastActivities(o.teamEvidence.pastActivities ?? '')
            setActivityCount(o.teamEvidence.activityCount != null ? String(o.teamEvidence.activityCount) : '')
            setVolunteerCountApprox(o.teamEvidence.volunteerCountApprox != null ? String(o.teamEvidence.volunteerCountApprox) : '')
            setRecentActivity(o.teamEvidence.recentActivity ?? '')
            setFacebookPageUrl(o.teamEvidence.facebookPageUrl ?? '')
            setPreviousCampaignLinks((o.teamEvidence.previousCampaignLinks ?? []).join(', '))
            setActivityReportUrl(o.teamEvidence.activityReportUrl ?? '')
            setSupportingDocUrl(o.teamEvidence.supportingDocUrl ?? '')
            setTeamPhotos(o.teamEvidence.photos ?? [])
        }

        if (o.institution) {
            setInstitutionName(o.institution.institutionName)
            setInstitutionType(o.institution.institutionType)
            setDepartment(o.institution.department ?? '')
            setClubName(o.institution.clubName ?? '')
            setAdvisorName(o.institution.advisorName ?? '')
            setAdvisorContact(o.institution.advisorContact ?? '')
            setAffiliated(o.institution.affiliated ?? 'NOT_APPLICABLE')
            setInstitutionAuthDocUrl(o.institution.authorizationDocUrl ?? '')
        }

        if (o.representative) {
            setRepFullName(o.representative.fullName)
            setRepDesignation(o.representative.designation)
            setRepDesignationOther(o.representative.designationOther ?? '')
            setRepMobile(o.representative.mobile)
            setRepEmail(o.representative.email ?? '')
            setNidNumber(o.representative.nidNumber ?? '')
            setNidDocUrl(o.representative.nidDocUrl ?? '')
            setRepAuthDocUrl(o.representative.authorizationDocUrl ?? '')
        }

        setDivision(o.division ?? '')
        setDistrict(o.district ?? '')
        setUpazila(o.upazila ?? '')
        setFullAddress(o.fullAddress)
        setPostalCode(o.postalCode ?? '')

        setLoading(false)
    }, [slug, user])

    useEffect(() => {
        if (ready && !user) { router.push(`/auth/login?next=/bdcare/${slug}/edit`); return }
        if (user) fetchOrg()
    }, [ready, user, router, slug, fetchOrg])

    const isInstitutionType = INSTITUTION_ORG_TYPES.includes(orgType)
    const orgTypeOptions = (org?.category === 'REGISTERED' ? REGISTERED_ORG_TYPES : TEAM_ORG_TYPES).map((v) => ({ label: v, value: v }))
    const designationOptions = (org?.category === 'REGISTERED' ? REGISTERED_DESIGNATIONS : TEAM_DESIGNATIONS).map((v) => ({ label: v, value: v }))

    const toggleArea = (area: string) => {
        setAreas((prev) => {
            const exists = prev.find((a) => a.area === area)
            if (exists) return prev.filter((a) => a.area !== area)
            return [...prev, { area, areaOther: '', description: '' }]
        })
    }
    const updateAreaField = (area: string, field: 'areaOther' | 'description', value: string) => {
        setAreas((prev) => prev.map((a) => (a.area === area ? { ...a, [field]: value } : a)))
    }

    const handleSave = async () => {
        if (!org) return
        setSaving(true)
        setSaveError('')
        setSaved(false)

        const payload: Record<string, unknown> = {
            name,
            description,
            orgType,
            orgTypeOther: orgType === 'Other' ? orgTypeOther : undefined,
            establishedYear: establishedYear ? Number(establishedYear) : undefined,
            contactPhone,
            contactEmail: contactEmail || undefined,
            website: website || undefined,
            facebookPage: facebookPage || undefined,
            otherSocialLinks: otherSocialLinks || undefined,
            areasOfWork: areas.map((a) => ({
                area: a.area,
                areaOther: a.area === 'Other' ? a.areaOther : undefined,
                description: a.description,
            })),
            representative: {
                fullName: repFullName,
                designation: repDesignation,
                designationOther: repDesignation === 'Other' ? repDesignationOther : undefined,
                mobile: repMobile,
                email: repEmail || undefined,
                nidNumber,
                nidDocUrl,
                authorizationDocUrl: repAuthDocUrl,
            },
            location: {
                division, district, upazila, fullAddress,
                postalCode: postalCode || undefined,
            },
        }

        if (org.category === 'REGISTERED') {
            payload.registration = {
                registrationAuthority: regAuthority,
                authorityOther: regAuthority === 'Other Government Authority' ? regAuthorityOther : undefined,
                registrationNumber: regNumber,
                registrationDate: regDate,
                expiryDate: regExpiry || undefined,
                certificateUrl,
            }
        } else {
            payload.teamEvidence = {
                pastActivities: pastActivities || undefined,
                activityCount: activityCount ? Number(activityCount) : undefined,
                volunteerCountApprox: volunteerCountApprox ? Number(volunteerCountApprox) : undefined,
                recentActivity: recentActivity || undefined,
                facebookPageUrl: facebookPageUrl || undefined,
                previousCampaignLinks: previousCampaignLinks
                    ? previousCampaignLinks.split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
                activityReportUrl: activityReportUrl || undefined,
                supportingDocUrl: supportingDocUrl || undefined,
                photos: teamPhotos,
            }
        }

        if (isInstitutionType) {
            payload.institution = {
                institutionName, institutionType,
                department: department || undefined,
                clubName: clubName || undefined,
                advisorName: advisorName || undefined,
                advisorContact: advisorContact || undefined,
                affiliated,
                authorizationDocUrl: affiliated === 'YES' ? institutionAuthDocUrl : undefined,
            }
        }

        const res = await orgApi.update(org.id, payload)
        if (!res.success || !res.data) {
            const detailed = res.errors?.map((e: { message: string }) => e.message).join(' ')
            setSaveError(detailed || res.message || 'Could not save your changes. Please check your details.')
            setSaving(false)
            return
        }

        if (logo || coverImage) {
            setUploadingImages(true)
            if (logo) {
                const fd = new FormData()
                fd.append('images', logo)
                fd.append('field', 'logo')
                await orgApi.uploadImages(org.id, fd)
            }
            if (coverImage) {
                const fd = new FormData()
                fd.append('images', coverImage)
                fd.append('field', 'coverImage')
                await orgApi.uploadImages(org.id, fd)
            }
            setUploadingImages(false)
        }

        setSaved(true)
        setSaving(false)
        setTimeout(() => router.push(`/bdcare/${slug}`), 1200)
    }

    if (loading || !ready) {
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

    if (notAllowed || !org) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
                    <p className="text-5xl">🚫</p>
                    <h1 className="text-xl font-bold text-gray-900">You can&apos;t edit this organization</h1>
                    <p className="text-gray-500 text-sm">This page is only available to the organization&apos;s owner.</p>
                    <a href="/bdcare" className="text-sky-600 text-sm font-semibold hover:underline">Back to browse</a>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <a href={`/bdcare/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-600 mb-4">
                        <ArrowLeft size={14} /> Back to organization
                    </a>

                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-gray-900">Edit Organization</h1>
                        <p className="text-sm text-gray-500">{org.name} — {org.category === 'REGISTERED' ? 'Registered Organization' : 'Volunteer Team'}</p>
                    </div>

                    {(org.status === 'MORE_INFO_REQUIRED' || org.status === 'REJECTED') && (org.adminNote || org.rejectReason) && (
                        <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 p-4 text-sm mb-5">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">The admin left a note:</p>
                                <p>{org.adminNote || org.rejectReason}</p>
                            </div>
                        </div>
                    )}
                    {org.status === 'UNDER_REVIEW' && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 p-4 text-sm mb-5">
                            <Clock size={16} className="mt-0.5 shrink-0" />
                            Editing an organization under review will keep it in review — an admin will re-check your updated info.
                        </div>
                    )}
                    {org.status === 'APPROVED' && (
                        <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 p-4 text-sm mb-5">
                            <Clock size={16} className="mt-0.5 shrink-0" />
                            This organization is currently approved. Saving changes will send it back for re-review before it&apos;s public again.
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900">Basic information</h2>
                            <Input label="Organization / Team Name" required value={name} onChange={(e) => setName(e.target.value)} />
                            <Textarea label="Short Description" required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                            <Select label="Organization Type" required options={orgTypeOptions} value={orgType} onChange={(e) => setOrgType(e.target.value)} />
                            {orgType === 'Other' && (
                                <Input label="Please specify" required value={orgTypeOther} onChange={(e) => setOrgTypeOther(e.target.value)} />
                            )}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input label="Established Year" type="number" min="1900" max={new Date().getFullYear()} placeholder="e.g. 2020" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} />
                                <Input label="Contact Number" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input label="Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                                <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input label="Facebook Page" value={facebookPage} onChange={(e) => setFacebookPage(e.target.value)} />
                                <Input label="Other Social Links" value={otherSocialLinks} onChange={(e) => setOtherSocialLinks(e.target.value)} />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700">Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                                        className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:text-sm file:font-medium hover:file:bg-sky-100"
                                    />
                                    {org.logo && !logo && <p className="text-xs text-gray-400">Current logo is set — choose a file to replace it.</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700">Cover Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                                        className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:text-sm file:font-medium hover:file:bg-sky-100"
                                    />
                                    {org.coverImage && !coverImage && <p className="text-xs text-gray-400">Current cover is set — choose a file to replace it.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900">Areas of Work</h2>
                            <div className="flex flex-wrap gap-2">
                                {AREAS_OF_WORK.map((a) => {
                                    const active = areas.some((x) => x.area === a)
                                    return (
                                        <button
                                            key={a}
                                            type="button"
                                            onClick={() => toggleArea(a)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-sky-300'}`}
                                        >
                                            {a}
                                        </button>
                                    )
                                })}
                            </div>
                            {areas.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    {areas.map((a) => (
                                        <div key={a.area} className="rounded-xl border border-gray-200 p-4 space-y-2">
                                            <p className="text-sm font-semibold text-sky-700">{a.area}</p>
                                            {a.area === 'Other' && (
                                                <Input placeholder="Specify area" value={a.areaOther} onChange={(e) => updateAreaField(a.area, 'areaOther', e.target.value)} />
                                            )}
                                            <Textarea
                                                placeholder="Description"
                                                rows={2}
                                                value={a.description}
                                                onChange={(e) => updateAreaField(a.area, 'description', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {org.category === 'REGISTERED' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Legal Registration</h2>
                                <Select
                                    label="Registration Authority"
                                    required
                                    options={REGISTRATION_AUTHORITIES.map((v) => ({ label: v, value: v }))}
                                    value={regAuthority}
                                    onChange={(e) => setRegAuthority(e.target.value)}
                                />
                                {regAuthority === 'Other Government Authority' && (
                                    <Input label="Specify Registration Authority" required value={regAuthorityOther} onChange={(e) => setRegAuthorityOther(e.target.value)} />
                                )}
                                <Input label="Registration Number" required value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Registration Date" type="date" required value={regDate} onChange={(e) => setRegDate(e.target.value)} />
                                    <Input label="Renewal / Expiry Date" type="date" value={regExpiry} onChange={(e) => setRegExpiry(e.target.value)} />
                                </div>
                                <DocUpload label="Registration Certificate" required value={certificateUrl} onChange={setCertificateUrl} />
                            </div>
                        )}

                        {org.category === 'TEAM' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Volunteer Team Evidence</h2>
                                <Textarea label="Previous Volunteer Activities" rows={3} value={pastActivities} onChange={(e) => setPastActivities(e.target.value)} />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Number of Previous Activities" type="number" value={activityCount} onChange={(e) => setActivityCount(e.target.value)} />
                                    <Input label="Approximate Number of Volunteers" type="number" value={volunteerCountApprox} onChange={(e) => setVolunteerCountApprox(e.target.value)} />
                                </div>
                                <Textarea label="Most Recent Activity" rows={2} value={recentActivity} onChange={(e) => setRecentActivity(e.target.value)} />
                                <Input label="Facebook / Social Media Page" value={facebookPageUrl} onChange={(e) => setFacebookPageUrl(e.target.value)} />
                                <Input label="Previous Campaign Links (comma-separated)" value={previousCampaignLinks} onChange={(e) => setPreviousCampaignLinks(e.target.value)} />
                                <DocUpload label="Activity Report" value={activityReportUrl} onChange={setActivityReportUrl} />
                                <DocUpload label="Supporting Documents (optional)" value={supportingDocUrl} onChange={setSupportingDocUrl} />
                                <PhotosUpload label="Activity Photos (optional)" value={teamPhotos} onChange={setTeamPhotos} />
                            </div>
                        )}

                        {isInstitutionType && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Institution details</h2>
                                <Input label="Institution Name" required value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
                                <Input label="Institution Type" required value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Department / Faculty" value={department} onChange={(e) => setDepartment(e.target.value)} />
                                    <Input label="Club / Society Name" value={clubName} onChange={(e) => setClubName(e.target.value)} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Teacher / Faculty Advisor Name" value={advisorName} onChange={(e) => setAdvisorName(e.target.value)} />
                                    <Input label="Advisor Contact Number" value={advisorContact} onChange={(e) => setAdvisorContact(e.target.value)} />
                                </div>
                                <Select
                                    label="Is this volunteer group affiliated with the institution?"
                                    options={[{ label: 'Yes', value: 'YES' }, { label: 'No', value: 'NO' }, { label: 'Not Applicable', value: 'NOT_APPLICABLE' }]}
                                    value={affiliated}
                                    onChange={(e) => setAffiliated(e.target.value as 'YES' | 'NO' | 'NOT_APPLICABLE')}
                                />
                                {affiliated === 'YES' && (
                                    <DocUpload label="Institution Authorization / Approval Document" required value={institutionAuthDocUrl} onChange={setInstitutionAuthDocUrl} />
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900">Organization Representative</h2>
                            <Input label="Full Name" required value={repFullName} onChange={(e) => setRepFullName(e.target.value)} />
                            <Select
                                label="Designation"
                                required
                                options={designationOptions}
                                value={repDesignation}
                                onChange={(e) => setRepDesignation(e.target.value)}
                            />
                            {repDesignation === 'Other' && (
                                <Input label="Specify Designation" required value={repDesignationOther} onChange={(e) => setRepDesignationOther(e.target.value)} />
                            )}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input label="Mobile Number" required value={repMobile} onChange={(e) => setRepMobile(e.target.value)} />
                                <Input label="Email" type="email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} />
                            </div>
                            <Input label="NID Number" required value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} />
                            <DocUpload label="NID Copy" required value={nidDocUrl} onChange={setNidDocUrl} />
                            <DocUpload
                                label={org.category === 'REGISTERED' ? 'Authorization Letter' : 'Team Leader / Coordinator Declaration'}
                                required
                                value={repAuthDocUrl}
                                onChange={setRepAuthDocUrl}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900">
                                {org.category === 'REGISTERED' ? 'Official Office Address' : 'Primary Operating Area'}
                            </h2>
                            <LocationSelect
                                required
                                division={division}
                                district={district}
                                upazila={upazila}
                                onDivisionChange={setDivision}
                                onDistrictChange={setDistrict}
                                onUpazilaChange={setUpazila}
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                            </div>
                            <Textarea label="Full Address / Operating Area" required rows={2} value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
                        </div>

                        {saveError && (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
                                <XCircle size={16} className="mt-0.5 shrink-0" /> {saveError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pb-8">
                            <a href={`/bdcare/${slug}`} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</a>
                            <Button type="button" variant="primary" isLoading={saving || uploadingImages} onClick={handleSave}>
                                {saved ? 'Saved!' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}