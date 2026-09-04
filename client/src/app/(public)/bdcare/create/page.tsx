'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import Button from '@/components/ui/button'
import { orgApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { Handshake, ShieldCheck, Users2 } from 'lucide-react'
import DocUpload from '@/components/org/DocUpload'
import PhotosUpload from '@/components/org/PhotosUpload'
import LocationSelect from '@/components/common/LocationSelect'
import { AREAS_OF_WORK } from '@/lib/bdcareConstants'

// ── Constants mirrored from server/src/modules/orgs/org.schema.ts ─────────
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

const STEP_LABELS = [
    'Category', 'Basic Info', 'Areas of Work', 'Verification Info',
    'Institution', 'Representative', 'Location', 'Declaration', 'Review',
]

export default function RegisterOrgPage() {
    const router = useRouter()
    const { user, ready } = useAuth()
    const [step, setStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    // ── Step 1: Category ──
    const [category, setCategory] = useState<'REGISTERED' | 'TEAM' | ''>('')

    // ── Step 2: Basic Info ──
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

    // ── Step 3: Areas of Work ──
    const [areas, setAreas] = useState<AreaEntry[]>([])

    // ── Step 4a: Registration (REGISTERED only) ──
    const [regAuthority, setRegAuthority] = useState('')
    const [regAuthorityOther, setRegAuthorityOther] = useState('')
    const [regNumber, setRegNumber] = useState('')
    const [regDate, setRegDate] = useState('')
    const [regExpiry, setRegExpiry] = useState('')
    const [certificateUrl, setCertificateUrl] = useState('')

    // ── Step 4b: Team Evidence (TEAM only) ──
    const [pastActivities, setPastActivities] = useState('')
    const [activityCount, setActivityCount] = useState('')
    const [volunteerCountApprox, setVolunteerCountApprox] = useState('')
    const [recentActivity, setRecentActivity] = useState('')
    const [facebookPageUrl, setFacebookPageUrl] = useState('')
    const [previousCampaignLinks, setPreviousCampaignLinks] = useState('')
    const [activityReportUrl, setActivityReportUrl] = useState('')
    const [supportingDocUrl, setSupportingDocUrl] = useState('')
    const [teamPhotos, setTeamPhotos] = useState<string[]>([])

    // ── Step 5: Institution (conditional on orgType) ──
    const [institutionName, setInstitutionName] = useState('')
    const [institutionType, setInstitutionType] = useState('')
    const [department, setDepartment] = useState('')
    const [clubName, setClubName] = useState('')
    const [advisorName, setAdvisorName] = useState('')
    const [advisorContact, setAdvisorContact] = useState('')
    const [affiliated, setAffiliated] = useState<'YES' | 'NO' | 'NOT_APPLICABLE'>('NOT_APPLICABLE')
    const [institutionAuthDocUrl, setInstitutionAuthDocUrl] = useState('')

    // ── Step 6: Representative ──
    const [repFullName, setRepFullName] = useState('')
    const [repDesignation, setRepDesignation] = useState('')
    const [repDesignationOther, setRepDesignationOther] = useState('')
    const [repMobile, setRepMobile] = useState('')
    const [repEmail, setRepEmail] = useState('')
    const [nidNumber, setNidNumber] = useState('')
    const [nidDocUrl, setNidDocUrl] = useState('')
    const [repAuthDocUrl, setRepAuthDocUrl] = useState('')

    // ── Step 7: Location ──
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [postalCode, setPostalCode] = useState('')

    // ── Step 8: Declaration ──
    const [declTrue, setDeclTrue] = useState(false)
    const [declAuthorized, setDeclAuthorized] = useState(false)
    const [declPolicy, setDeclPolicy] = useState(false)
    const [declExtra, setDeclExtra] = useState(false) // verify-consent (REGISTERED) / not-legal (TEAM)

    useEffect(() => {
        if (ready && !user) router.push('/auth/login?next=/bdcare/create')
    }, [ready, user, router])

    const isInstitutionType = INSTITUTION_ORG_TYPES.includes(orgType)
    const orgTypeOptions = (category === 'REGISTERED' ? REGISTERED_ORG_TYPES : TEAM_ORG_TYPES).map((v) => ({ label: v, value: v }))
    const designationOptions = (category === 'REGISTERED' ? REGISTERED_DESIGNATIONS : TEAM_DESIGNATIONS).map((v) => ({ label: v, value: v }))

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

    // ── Per-step validation (lightweight, client-side only — server re-validates) ──
    const stepValid = (): boolean => {
        switch (step) {
            case 0: return !!category
            case 1: return (
                name.trim().length >= 3 &&
                description.trim().length >= 20 &&
                !!orgType &&
                (orgType !== 'Other' || !!orgTypeOther.trim()) &&
                contactPhone.trim().length >= 6
            )
            case 2: return areas.length > 0 && areas.every((a) =>
                (a.area !== 'Other' || !!a.areaOther.trim()) && a.description.trim().length >= 20
            )
            case 3:
                if (category === 'REGISTERED') {
                    return !!regAuthority &&
                        (regAuthority !== 'Other Government Authority' || !!regAuthorityOther.trim()) &&
                        !!regNumber.trim() && !!regDate && !!certificateUrl
                }
                return true // team evidence fields are all optional
            case 4: {
                if (!isInstitutionType) return true
                const base = !!institutionName.trim() && !!institutionType.trim()
                if (affiliated === 'YES') return base && !!institutionAuthDocUrl
                return base
            }
            case 5: return (
                !!repFullName.trim() && !!repDesignation &&
                (repDesignation !== 'Other' || !!repDesignationOther.trim()) &&
                repMobile.trim().length >= 6 && !!nidNumber.trim() && !!nidDocUrl && !!repAuthDocUrl
            )
            case 6: return !!division && !!district.trim() && !!upazila.trim() && fullAddress.trim().length >= 5
            case 7: return declTrue && declAuthorized && declPolicy && declExtra
            default: return true
        }
    }

    // Steps: 0 Category, 1 BasicInfo, 2 Areas, 3 Verification, 4 Institution(conditional), 5 Representative, 6 Location, 7 Declaration, 8 Review
    const visibleSteps = isInstitutionType
        ? [0, 1, 2, 3, 4, 5, 6, 7, 8]
        : [0, 1, 2, 3, 5, 6, 7, 8] // skip institution step entirely if not applicable

    const currentIndex = visibleSteps.indexOf(step)
    const goNext = () => {
        const idx = visibleSteps.indexOf(step)
        if (idx < visibleSteps.length - 1) setStep(visibleSteps[idx + 1])
    }
    const goBack = () => {
        const idx = visibleSteps.indexOf(step)
        if (idx > 0) setStep(visibleSteps[idx - 1])
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setSubmitError('')

        const payload: Record<string, unknown> = {
            category,
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
            declarationAccepted: true,
        }

        if (category === 'REGISTERED') {
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

        const res = await orgApi.create(payload)
        if (!res.success || !res.data) {
            const detailed = res.errors?.map((e: { message: string }) => e.message).join(' ')
            setSubmitError(detailed || res.message || 'Could not submit your registration. Please check your details.')
            setSubmitting(false)
            return
        }

        router.push(`/bdcare/${res.data.slug}`)
    }

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                            <Handshake size={18} className="text-sky-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Register Your Organization</h1>
                            <p className="text-sm text-gray-500">Step {currentIndex + 1} of {visibleSteps.length} — {STEP_LABELS[step]}</p>
                        </div>
                    </div>

                    <div className="flex gap-1 mb-6">
                        {visibleSteps.map((s, i) => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= currentIndex ? 'bg-sky-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

                        {/* Step 0: Category */}
                        {step === 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-bold text-gray-900">Choose your category</h2>
                                <button
                                    type="button"
                                    onClick={() => { setCategory('REGISTERED'); setOrgType('') }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${category === 'REGISTERED' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
                                >
                                    <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                                        <ShieldCheck size={16} className="text-emerald-600" /> Registered Volunteer Organization
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">For officially/legally registered volunteer organizations (NGO, foundation, etc.)</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setCategory('TEAM'); setOrgType('') }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${category === 'TEAM' ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-sky-300'}`}
                                >
                                    <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                                        <Users2 size={16} className="text-sky-600" /> Volunteer Team / Community Group
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Local, school, college, university, or community groups that are not legally registered.</p>
                                </button>
                            </div>
                        )}

                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Basic information</h2>
                                <Input label="Organization / Team Name" required value={name} onChange={(e) => setName(e.target.value)} />
                                <Textarea label="Short Description" required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                                <p className="text-xs -mt-3 text-gray-400">At least 20 characters ({description.length}/20)</p>
                                <Select
                                    label="Organization Type"
                                    required
                                    placeholder="Select a type"
                                    options={orgTypeOptions}
                                    value={orgType}
                                    onChange={(e) => setOrgType(e.target.value)}
                                />
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
                            </div>
                        )}

                        {/* Step 2: Areas of Work */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Areas of Work</h2>
                                <p className="text-xs text-gray-500">Select every area that applies. You can add a short description for each.</p>
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
                                    <div className="space-y-4 pt-2">
                                        {areas.map((a) => (
                                            <div key={a.area} className="rounded-xl border border-gray-200 p-4 space-y-2">
                                                <p className="text-sm font-semibold text-sky-700">{a.area}</p>
                                                {a.area === 'Other' && (
                                                    <Input
                                                        placeholder="Specify area"
                                                        value={a.areaOther}
                                                        onChange={(e) => updateAreaField(a.area, 'areaOther', e.target.value)}
                                                    />
                                                )}
                                                <Textarea
                                                    placeholder={`Describe your work in ${a.area === 'Other' ? (a.areaOther || 'this area') : a.area}…`}
                                                    rows={2}
                                                    value={a.description}
                                                    onChange={(e) => updateAreaField(a.area, 'description', e.target.value)}
                                                />
                                                <p className="text-xs text-gray-400">{a.description.length}/300 (min 20)</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Registration (REGISTERED) or Team Evidence (TEAM) */}
                        {step === 3 && category === 'REGISTERED' && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Legal Registration</h2>
                                <Select
                                    label="Registration Authority"
                                    required
                                    placeholder="Select authority"
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
                                <DocUpload
                                    label="Registration Certificate"
                                    required
                                    value={certificateUrl}
                                    onChange={setCertificateUrl}
                                    hint="Upload a clear and readable copy of your official registration certificate (PDF/JPG/PNG, max 10MB)."
                                />
                            </div>
                        )}

                        {step === 3 && category === 'TEAM' && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Show us you&apos;re a genuine volunteer team</h2>
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

                        {/* Step 4: Institution (conditional) */}
                        {step === 4 && isInstitutionType && (
                            <div className="space-y-4">
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
                                    <DocUpload
                                        label="Institution Authorization / Approval Document"
                                        required
                                        value={institutionAuthDocUrl}
                                        onChange={setInstitutionAuthDocUrl}
                                    />
                                )}
                            </div>
                        )}

                        {/* Step 5: Representative */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Organization Representative</h2>
                                <Input label="Full Name" required value={repFullName} onChange={(e) => setRepFullName(e.target.value)} />
                                <Select
                                    label="Designation"
                                    required
                                    placeholder="Select designation"
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
                                    label={category === 'REGISTERED' ? 'Authorization Letter' : 'Team Leader / Coordinator Declaration'}
                                    required
                                    value={repAuthDocUrl}
                                    onChange={setRepAuthDocUrl}
                                />
                                <p className="text-xs text-gray-400">Your NID information stays private and is only visible to platform admins.</p>
                            </div>
                        )}

                        {/* Step 6: Location */}
                        {step === 6 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">
                                    {category === 'REGISTERED' ? 'Official Office Address' : 'Primary Operating Area'}
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
                        )}

                        {/* Step 7: Declaration */}
                        {step === 7 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Declaration</h2>
                                <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="mt-0.5" checked={declTrue} onChange={(e) => setDeclTrue(e.target.checked)} />
                                    I confirm that the information provided is true and accurate.
                                </label>
                                <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="mt-0.5" checked={declAuthorized} onChange={(e) => setDeclAuthorized(e.target.checked)} />
                                    I confirm that I am authorized to represent this organization/team on this platform.
                                </label>
                                <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="mt-0.5" checked={declPolicy} onChange={(e) => setDeclPolicy(e.target.checked)} />
                                    I agree to follow the platform&apos;s volunteer safety, conduct and safeguarding policies.
                                </label>
                                <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="mt-0.5" checked={declExtra} onChange={(e) => setDeclExtra(e.target.checked)} />
                                    {category === 'REGISTERED'
                                        ? 'I authorize the platform to verify the submitted registration information.'
                                        : 'I understand that platform verification does not mean that my team is legally registered with the Government of Bangladesh.'}
                                </label>
                            </div>
                        )}

                        {/* Step 8: Review */}
                        {step === 8 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Review your registration</h2>
                                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 text-sm">
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{category === 'REGISTERED' ? 'Registered Organization' : 'Volunteer Team'}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{name}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{orgType === 'Other' ? orgTypeOther : orgType}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Areas of Work</span><span className="font-medium">{areas.length}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Representative</span><span className="font-medium">{repFullName}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{upazila}, {district}, {division}</span></div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    After submitting, your registration status will be <strong>Pending</strong> until an admin reviews it.
                                </p>
                                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            {currentIndex > 0 ? (
                                <Button type="button" variant="outline" onClick={goBack}>Back</Button>
                            ) : <span />}

                            {step === 8 ? (
                                <Button type="button" variant="primary" isLoading={submitting} onClick={handleSubmit}>
                                    Submit Registration
                                </Button>
                            ) : (
                                <Button type="button" variant="primary" disabled={!stepValid()} onClick={goNext}>
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}