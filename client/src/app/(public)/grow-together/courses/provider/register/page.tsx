'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import Button from '@/components/ui/button'
import LocationSelect from '@/components/common/LocationSelect'
import ProviderDocUpload from '@/components/course-provider/ProviderDocUpload'
import { useAuth } from '@/lib/AuthContext'
import {
    registerProvider, INSTITUTION_TYPES, INSTITUTION_TYPE_LABEL, LEGAL_DOC_HINT,
} from '@/lib/providerApi'
import type { InstitutionType } from '@/lib/providerApi'
import { GraduationCap } from 'lucide-react'

const INSTITUTION_TYPE_OPTIONS = INSTITUTION_TYPES.map((v) => ({ label: INSTITUTION_TYPE_LABEL[v], value: v }))

const STEP_LABELS = ['General Info', 'Legal & Verification', 'Focal Person', 'Review']

export default function RegisterCourseProviderPage() {
    const router = useRouter()
    const { user, ready } = useAuth()
    const [step, setStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitted, setSubmitted] = useState(false)

    // ── Step 0: General Info ──
    const [institutionName, setInstitutionName] = useState('')
    const [institutionType, setInstitutionType] = useState<InstitutionType | ''>('')
    const [logo, setLogo] = useState('')
    const [website, setWebsite] = useState('')
    const [facebookPage, setFacebookPage] = useState('')
    const [headquartersAddress, setHeadquartersAddress] = useState('')
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')

    // ── Step 1: Legal & Verification ──
    const [registrationNumber, setRegistrationNumber] = useState('')
    const [legalDocumentUrl, setLegalDocumentUrl] = useState('')

    // ── Step 2: Focal Person ──
    const [contactPersonName, setContactPersonName] = useState('')
    const [designation, setDesignation] = useState('')
    const [officialEmail, setOfficialEmail] = useState('')
    const [mobileNumber, setMobileNumber] = useState('')
    const [nidNumber, setNidNumber] = useState('')

    useEffect(() => {
        if (ready && !user) router.push('/auth/login?next=/grow-together/courses/provider/register')
    }, [ready, user, router])

    const stepValid = (): boolean => {
        switch (step) {
            case 0: return (
                institutionName.trim().length >= 3 &&
                !!institutionType &&
                headquartersAddress.trim().length >= 10 &&
                !!division && !!district.trim() && !!upazila.trim()
            )
            case 1: return registrationNumber.trim().length >= 2 && !!legalDocumentUrl
            case 2: return (
                contactPersonName.trim().length >= 2 &&
                designation.trim().length >= 2 &&
                /\S+@\S+\.\S+/.test(officialEmail) &&
                mobileNumber.trim().length >= 6 &&
                nidNumber.trim().length >= 5
            )
            default: return true
        }
    }

    const goNext = () => setStep((s) => Math.min(s + 1, 3))
    const goBack = () => setStep((s) => Math.max(s - 1, 0))

    const handleSubmit = async () => {
        if (!institutionType) return
        setSubmitting(true)
        setSubmitError('')

        const res = await registerProvider({
            institutionName,
            institutionType,
            logo: logo || undefined,
            website: website || undefined,
            facebookPage: facebookPage || undefined,
            headquartersAddress,
            headquartersDivision: division,
            headquartersDistrict: district,
            headquartersUpazila: upazila,
            registrationNumber,
            legalDocumentUrl,
            contactPersonName,
            designation,
            officialEmail,
            mobileNumber,
            nidNumber,
        })

        if (!res.success || !res.data) {
            const detailed = res.errors?.map((e) => e.message).join(' ')
            setSubmitError(detailed || res.message || 'Could not submit your registration. Please check your details.')
            setSubmitting(false)
            return
        }

        setSubmitting(false)
        setSubmitted(true)
    }

    if (!ready || !user) return null

    if (submitted) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center py-16" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                    <div className="max-w-md mx-auto px-4 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-50">
                            <GraduationCap size={22} className="text-emerald-600" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 mb-2">Registration submitted</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Your course provider registration is now <strong>Pending</strong> review. Once an admin
                            approves it, a Main Branch will be created automatically and you can start posting
                            courses.
                        </p>
                        <a href="/grow-together/courses"
                            className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                        >
                            Back to Courses
                        </a>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <GraduationCap size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Register as a Course Provider</h1>
                            <p className="text-sm text-gray-500">Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}</p>
                        </div>
                    </div>

                    <div className="flex gap-1 mb-6">
                        {STEP_LABELS.map((_, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

                        {/* Step 0: General Info */}
                        {step === 0 && (
                            <div className="space-y-4">
                                <Input
                                    label="Institution Name"
                                    required
                                    placeholder="e.g. SPTC — Skills for Prosperity Training Center"
                                    value={institutionName}
                                    onChange={(e) => setInstitutionName(e.target.value)}
                                />
                                <Select
                                    label="Institution Type"
                                    required
                                    placeholder="Select institution type"
                                    options={INSTITUTION_TYPE_OPTIONS}
                                    value={institutionType}
                                    onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                                />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Website (optional)"
                                        placeholder="https://…"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />
                                    <Input
                                        label="Facebook Page (optional)"
                                        placeholder="https://facebook.com/…"
                                        value={facebookPage}
                                        onChange={(e) => setFacebookPage(e.target.value)}
                                    />
                                </div>
                                <Textarea
                                    label="Headquarters Address"
                                    required
                                    rows={3}
                                    placeholder="Detailed head-office address"
                                    value={headquartersAddress}
                                    onChange={(e) => setHeadquartersAddress(e.target.value)}
                                />
                                <p className="text-xs -mt-3 text-gray-400">
                                    Used to auto-create your Main Branch once approved — pick the division/district/upazila below too.
                                </p>
                                <LocationSelect
                                    division={division}
                                    district={district}
                                    upazila={upazila}
                                    onDivisionChange={setDivision}
                                    onDistrictChange={setDistrict}
                                    onUpazilaChange={setUpazila}
                                    required
                                />
                            </div>
                        )}

                        {/* Step 1: Legal & Verification */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <Input
                                    label="Registration / License Number"
                                    required
                                    placeholder="e.g. NGOAB reg. no. or Trade License no."
                                    value={registrationNumber}
                                    onChange={(e) => setRegistrationNumber(e.target.value)}
                                />
                                <ProviderDocUpload
                                    label="Legal Document"
                                    required
                                    value={legalDocumentUrl}
                                    onChange={setLegalDocumentUrl}
                                    hint={institutionType ? LEGAL_DOC_HINT[institutionType] : 'PDF or image of your registration/authorization document'}
                                />
                            </div>
                        )}

                        {/* Step 2: Focal Person */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <Input
                                    label="Contact Person Name"
                                    required
                                    value={contactPersonName}
                                    onChange={(e) => setContactPersonName(e.target.value)}
                                />
                                <Input
                                    label="Designation"
                                    required
                                    placeholder="e.g. Program Coordinator"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                />
                                <Input
                                    label="Official Email"
                                    type="email"
                                    required
                                    value={officialEmail}
                                    onChange={(e) => setOfficialEmail(e.target.value)}
                                />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Mobile Number"
                                        required
                                        placeholder="01XXXXXXXXX"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                    />
                                    <Input
                                        label="NID Number"
                                        required
                                        value={nidNumber}
                                        onChange={(e) => setNidNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-900">Review your registration</h2>
                                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 text-sm">
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Institution</span><span className="font-medium">{institutionName}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{institutionType ? INSTITUTION_TYPE_LABEL[institutionType] : ''}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Headquarters</span><span className="font-medium">{upazila}, {district}, {division}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Registration No.</span><span className="font-medium">{registrationNumber}</span></div>
                                    <div className="p-3 flex justify-between"><span className="text-gray-500">Focal Person</span><span className="font-medium">{contactPersonName}</span></div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    After submitting, your registration status will be <strong>Pending</strong> until an admin reviews it.
                                    Once approved, a Main Branch is created automatically using the headquarters details above.
                                </p>
                                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            {step > 0 ? (
                                <Button type="button" variant="outline" onClick={goBack}>Back</Button>
                            ) : <span />}

                            {step === 3 ? (
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