'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import { verificationApi, VerificationProfile } from '@/lib/verificationApi'
import { CheckCircle2, ShieldCheck, Handshake } from 'lucide-react'

const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function VolunteerVerificationForm() {
    const router = useRouter()
    const params = useSearchParams()
    const redirectTo = params.get('redirect') || '/bdcare'
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [identityFile, setIdentityFile] = useState<File | null>(null)
    const [trainingFile, setTrainingFile] = useState<File | null>(null)

    // Section A — core fields
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [identityType, setIdentityType] = useState<'NID' | 'BIRTH_CERTIFICATE' | ''>('')
    const [identityNumber, setIdentityNumber] = useState('')
    const [emergencyContactName, setEmergencyContactName] = useState('')
    const [emergencyContactRelation, setEmergencyContactRelation] = useState('')
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

    // Section B — volunteer-specific fields
    const [sex, setSex] = useState('')
    const [occupation, setOccupation] = useState('')
    const [educationLevel, setEducationLevel] = useState('')
    const [institution, setInstitution] = useState('')
    const [bloodGroup, setBloodGroup] = useState('')
    const [skill, setSkill] = useState('')
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')
    const [hasTraining, setHasTraining] = useState(false)

    // Section C — consent
    const [accepted, setAccepted] = useState(false)

    // Prefill from whatever the user already submitted before (progressive profiling)
    useEffect(() => {
        verificationApi.getMe().then((res) => {
            if (res.success && res.data) {
                const p: VerificationProfile = res.data
                setPhone(p.phone ?? '')
                setAddress(p.address ?? '')
                setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '')
                setIdentityType((p.identityType as 'NID' | 'BIRTH_CERTIFICATE') ?? '')
                setIdentityNumber(p.identityNumber ?? '')
                setEmergencyContactName(p.emergencyContactName ?? '')
                setEmergencyContactRelation(p.emergencyContactRelation ?? '')
                setEmergencyContactPhone(p.emergencyContactPhone ?? '')
                setSex(p.sex ?? '')
                setOccupation(p.occupation ?? '')
                setEducationLevel(p.educationLevel ?? '')
                setInstitution(p.institution ?? '')
                setBloodGroup(p.bloodGroup ?? '')
                setSkill(p.skill ?? '')
                setDivision(p.division ?? '')
                setDistrict(p.district ?? '')
                setUpazila(p.upazila ?? '')
                setHasTraining(!!p.hasTraining)
            }
            setLoading(false)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accepted) {
            setError('Please accept the Volunteer Policy to continue.')
            return
        }
        setSubmitting(true)
        setError('')

        try {
            // Upload identity document first, if a new file was chosen
            let identityDocPicture: string | undefined
            if (identityFile) {
                const up = await verificationApi.uploadDocument(identityFile)
                if (up.success && up.data) identityDocPicture = up.data.filename
            }
            let trainingCertificate: string | undefined
            if (hasTraining && trainingFile) {
                const up = await verificationApi.uploadDocument(trainingFile)
                if (up.success && up.data) trainingCertificate = up.data.filename
            }

            const res = await verificationApi.submit({
                phone,
                address,
                dateOfBirth: dateOfBirth || undefined,
                identityType: identityType || undefined,
                identityNumber: identityNumber || undefined,
                ...(identityDocPicture ? { identityDocPicture } : {}),
                emergencyContactName,
                emergencyContactRelation,
                emergencyContactPhone,
                sex,
                occupation,
                educationLevel,
                institution,
                bloodGroup,
                skill,
                division,
                district,
                upazila,
                hasTraining,
                ...(trainingCertificate ? { trainingCertificate } : {}),
            })

            if (res.success) {
                // bdcare/[slug]/page.tsx restores its own draft message from sessionStorage
                router.push(redirectTo)
            } else {
                setError(res.message ?? 'Could not submit, please try again.')
            }
        } catch {
            setError('Something went wrong, please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!user) {
        router.push(`/auth/login?next=/verification/volunteer?redirect=${encodeURIComponent(redirectTo)}`)
        return null
    }

    return (
        <>
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-3">
                        <Handshake className="text-emerald-600" size={22} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Volunteer Registration</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        We need a few details before you can volunteer — for accountability and safety.
                    </p>
                </div>

                {loading ? (
                    <p className="text-center text-sm text-slate-400">Loading…</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section A — Common/core */}
                        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                Required for everyone (Security)
                            </h2>
                            <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                            <Input label="Address" required value={address} onChange={(e) => setAddress(e.target.value)} />
                            <Input label="Date of Birth" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                            <Select
                                label="Identity Document Type" required placeholder="Select one"
                                options={[{ label: 'NID', value: 'NID' }, { label: 'Birth Certificate', value: 'BIRTH_CERTIFICATE' }]}
                                value={identityType} onChange={(e) => setIdentityType(e.target.value as 'NID' | 'BIRTH_CERTIFICATE')}
                            />
                            <Input label="Identity Number" required value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} />
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700">
                                    Identity Document Photo <span className="text-red-500">*</span>
                                </label>
                                <input type="file" accept="image/*" onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)} className="text-sm" />
                            </div>
                            <Input label="Emergency Contact Name" required value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
                            <Input label="Relation" required placeholder="e.g. Father, Brother" value={emergencyContactRelation} onChange={(e) => setEmergencyContactRelation(e.target.value)} />
                            <Input label="Emergency Contact Phone" required value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
                        </section>

                        {/* Section B — Volunteer-specific */}
                        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                            <h2 className="text-sm font-bold text-slate-900">Volunteer Information</h2>
                            <Select label="Sex" required placeholder="Select" options={[{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'OTHER' }]} value={sex} onChange={(e) => setSex(e.target.value)} />
                            <Select label="Division" required placeholder="Select division" options={DIVISIONS.map((v) => ({ label: v, value: v }))} value={division} onChange={(e) => setDivision(e.target.value)} />
                            <Input label="District" required value={district} onChange={(e) => setDistrict(e.target.value)} />
                            <Input label="Upazila" required value={upazila} onChange={(e) => setUpazila(e.target.value)} />
                            <Input label="Occupation" required value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                            <Input label="Highest Level of Education" required value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} />
                            <Input label="Educational Institution's Name" required value={institution} onChange={(e) => setInstitution(e.target.value)} />
                            <Select label="Blood Group" required placeholder="Select" options={BLOOD_GROUPS.map((v) => ({ label: v, value: v }))} value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} />
                            <Input label="Skill" required placeholder="e.g. First Aid, Driving, Cooking" value={skill} onChange={(e) => setSkill(e.target.value)} />

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={hasTraining} onChange={(e) => setHasTraining(e.target.checked)} id="hasTraining" />
                                <label htmlFor="hasTraining" className="text-sm text-slate-700">Do you have any training on Emergency Response?</label>
                            </div>
                            {hasTraining && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-slate-700">Training Certificate Photo</label>
                                    <input type="file" accept="image/*" onChange={(e) => setTrainingFile(e.target.files?.[0] ?? null)} className="text-sm" />
                                </div>
                            )}
                        </section>

                        {/* Section C — Consent */}
                        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                            <Textarea
                                label="Volunteer Registration Policy"
                                value="Volunteer for Bangladesh respects your privacy. Your information is collected and used only for accountability and volunteer matching purposes."
                                disabled
                                rows={4}
                            />
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} id="accept" />
                                <label htmlFor="accept" className="text-sm text-slate-700">I accept the Terms and Conditions.</label>
                            </div>
                        </section>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
                            <CheckCircle2 size={16} />
                            Submit &amp; Continue
                        </Button>
                    </form>
                )}
            </main>
            <Footer />
        </>
    )
}

export default function VolunteerVerificationPage() {
    return (
        <Suspense fallback={null}>
            <VolunteerVerificationForm />
        </Suspense>
    )
}