'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import { useAuth } from '@/lib/AuthContext'
import { verificationApi, VerificationProfile, ActionType } from '@/lib/verificationApi'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

function CoreVerificationForm() {
    const router = useRouter()
    const params = useSearchParams()
    const redirectTo = params.get('redirect') || '/'
    const action = (params.get('action') as ActionType) || 'CAMPAIGN_CREATE'
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [identityFile, setIdentityFile] = useState<File | null>(null)
    const [studentIdFile, setStudentIdFile] = useState<File | null>(null)

    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [identityType, setIdentityType] = useState<'NID' | 'BIRTH_CERTIFICATE' | ''>('')
    const [identityNumber, setIdentityNumber] = useState('')
    const [emergencyContactName, setEmergencyContactName] = useState('')
    const [emergencyContactRelation, setEmergencyContactRelation] = useState('')
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

    // Only needed for PLANT_CLAIM
    const [isStudent, setIsStudent] = useState(false)
    const [institution, setInstitution] = useState('')

    const needsStudentProof = action === 'PLANT_CLAIM'
    const needsIdentity = action !== 'WHOLESALE_JOIN'

    useEffect(() => {
        verificationApi.getMe().then((res) => {
            if (res.success && res.data) {
                const p: VerificationProfile = res.data
                setPhone(p.phone ?? '')
                setAddress(p.address ?? '')
                setIdentityType((p.identityType as 'NID' | 'BIRTH_CERTIFICATE') ?? '')
                setIdentityNumber(p.identityNumber ?? '')
                setEmergencyContactName(p.emergencyContactName ?? '')
                setEmergencyContactRelation(p.emergencyContactRelation ?? '')
                setEmergencyContactPhone(p.emergencyContactPhone ?? '')
                setIsStudent(!!p.isStudent)
                setInstitution(p.institution ?? '')
            }
            setLoading(false)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            let identityDocPicture: string | undefined
            if (identityFile) {
                const up = await verificationApi.uploadDocument(identityFile)
                if (up.success && up.data) identityDocPicture = up.data.filename
            }
            let studentIdCard: string | undefined
            if (studentIdFile) {
                const up = await verificationApi.uploadDocument(studentIdFile)
                if (up.success && up.data) studentIdCard = up.data.filename
            }

            const res = await verificationApi.submit({
                phone,
                address,
                ...(needsIdentity
                    ? {
                        identityType: identityType || undefined,
                        identityNumber: identityNumber || undefined,
                        ...(identityDocPicture ? { identityDocPicture } : {}),
                        emergencyContactName,
                        emergencyContactRelation,
                        emergencyContactPhone,
                    }
                    : {}),
                ...(needsStudentProof
                    ? {
                        isStudent,
                        institution,
                        ...(studentIdCard ? { studentIdCard } : {}),
                    }
                    : {}),
            })

            if (res.success) {
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
        router.push(`/auth/login?next=/verification/core?action=${action}&redirect=${encodeURIComponent(redirectTo)}`)
        return null
    }

    return (
        <>
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-3">
                        <ShieldCheck className="text-emerald-600" size={22} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Complete Your Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        A few details are required before you can continue, for accountability and safety.
                    </p>
                </div>

                {loading ? (
                    <p className="text-center text-sm text-slate-400">Loading…</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                            <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                            <Input label="Address" required value={address} onChange={(e) => setAddress(e.target.value)} />

                            {needsIdentity && (
                                <>
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
                                </>
                            )}

                            {needsStudentProof && (
                                <>
                                    <Input label="Educational Institution's Name" required value={institution} onChange={(e) => setInstitution(e.target.value)} />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} id="isStudent" />
                                        <label htmlFor="isStudent" className="text-sm text-slate-700">I am a current student</label>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-slate-700">
                                            Student ID Card Photo <span className="text-red-500">*</span>
                                        </label>
                                        <input type="file" accept="image/*" onChange={(e) => setStudentIdFile(e.target.files?.[0] ?? null)} className="text-sm" />
                                    </div>
                                </>
                            )}
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

export default function CoreVerificationPage() {
    return (
        <Suspense fallback={null}>
            <CoreVerificationForm />
        </Suspense>
    )
}