// client/src/components/verification/CoreInfoForm.tsx
// Section A — common/core fields, সব action-এর জন্য পুনঃব্যবহারযোগ্য।
// Volunteer form-এ এটাকে Section B (volunteer-specific) আর Section C (consent)-এর
// উপরে বসিয়ে দেওয়া হবে; অন্য action-এ inline modal হিসেবেও ব্যবহার করা যাবে।

'use client'

import React, { useEffect, useState } from 'react'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import { verificationApi, VerificationProfile } from '@/lib/verificationApi'

interface CoreInfoFormProps {
    onSaved?: (profile: VerificationProfile) => void
    submitLabel?: string
}

const IDENTITY_OPTIONS = [
    { label: 'National ID (NID)', value: 'NID' },
    { label: 'Birth Certificate', value: 'BIRTH_CERTIFICATE' },
]

export default function CoreInfoForm({ onSaved, submitLabel = 'Save' }: CoreInfoFormProps) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [status, setStatus] = useState<VerificationProfile['verificationStatus']>('NOT_SUBMITTED')
    const [note, setNote] = useState<string | null>(null)

    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [identityType, setIdentityType] = useState('')
    const [identityNumber, setIdentityNumber] = useState('')
    const [identityDocPicture, setIdentityDocPicture] = useState<string | null>(null)
    const [identityFile, setIdentityFile] = useState<File | null>(null)
    const [emergencyContactName, setEmergencyContactName] = useState('')
    const [emergencyContactRelation, setEmergencyContactRelation] = useState('')
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

    // প্রথমবার mount হলে বর্তমান verification profile load করে ফর্মে prefill করা
    useEffect(() => {
        (async () => {
            const res = await verificationApi.getMe()
            if (res.success && res.data) {
                const p = res.data
                setStatus(p.verificationStatus)
                setNote(p.verificationNote ?? null)
                setPhone(p.phone ?? '')
                setAddress(p.address ?? '')
                setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '')
                setIdentityType(p.identityType ?? '')
                setIdentityNumber(p.identityNumber ?? '')
                setIdentityDocPicture(p.identityDocPicture ?? null)
                setEmergencyContactName(p.emergencyContactName ?? '')
                setEmergencyContactRelation(p.emergencyContactRelation ?? '')
                setEmergencyContactPhone(p.emergencyContactPhone ?? '')
            }
            setLoading(false)
        })()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            let uploadedFilename = identityDocPicture

            // নতুন ফাইল বেছে নিলে আগে আপলোড করে filename নিতে হবে, তারপর submit
            if (identityFile) {
                const uploadRes = await verificationApi.uploadDocument(identityFile)
                if (!uploadRes.success || !uploadRes.data) {
                    setError(uploadRes.message || 'Document upload failed.')
                    setSaving(false)
                    return
                }
                uploadedFilename = uploadRes.data.filename
            }

            // progressive submit — খালি ফিল্ড undefined পাঠালে backend আগেরটাই রেখে দেবে
            const res = await verificationApi.submit({
                phone: phone || undefined,
                address: address || undefined,
                dateOfBirth: dateOfBirth || undefined,
                identityType: identityType || undefined,
                identityNumber: identityNumber || undefined,
                identityDocPicture: uploadedFilename || undefined,
                emergencyContactName: emergencyContactName || undefined,
                emergencyContactRelation: emergencyContactRelation || undefined,
                emergencyContactPhone: emergencyContactPhone || undefined,
            })

            if (res.success && res.data) {
                setStatus(res.data.verificationStatus)
                setNote(res.data.verificationNote ?? null)
                onSaved?.(res.data)
            } else {
                setError(res.message || 'Could not save. Please try again.')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p className="text-sm text-slate-500">Loading...</p>

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-slate-800">Core Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Needed for accountability — only admins can see this.
                    {status === 'PENDING' && (
                        <span className="ml-2 text-amber-600 font-medium">Review in progress</span>
                    )}
                    {status === 'VERIFIED' && (
                        <span className="ml-2 text-emerald-600 font-medium">Verified</span>
                    )}
                    {status === 'REJECTED' && (
                        <span className="ml-2 text-red-600 font-medium">Rejected — please resubmit</span>
                    )}
                </p>
                {status === 'REJECTED' && note && (
                    <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <span className="font-semibold">Reason from admin: </span>
                        {note}
                    </p>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Phone Number" name="phone" required value={phone}
                    onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                <Input label="Date of Birth" name="dateOfBirth" type="date" value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>

            <Input label="Address" name="address" required value={address}
                onChange={(e) => setAddress(e.target.value)} placeholder="Enter your current address" />

            <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Identity Document Type" name="identityType" required
                    options={IDENTITY_OPTIONS} value={identityType}
                    onChange={(e) => setIdentityType(e.target.value)} placeholder="Select one" />
                <Input label="Identity Document Number" name="identityNumber" required
                    value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                    Identity Document Photo<span className="text-red-500 ml-1">*</span>
                </label>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)}
                    className="text-sm text-slate-600" />
                {identityDocPicture && !identityFile && (
                    <p className="text-xs text-emerald-600">✓ A document has already been submitted</p>
                )}
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Emergency Contact</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                    <Input label="Name" required value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)} />
                    <Input label="Relation" value={emergencyContactRelation}
                        onChange={(e) => setEmergencyContactRelation(e.target.value)} placeholder="e.g. Father" />
                    <Input label="Phone Number" required value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
            </div>

            <Button type="submit" isLoading={saving}>{submitLabel}</Button>
        </form>
    )
}