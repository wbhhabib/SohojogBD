'use client'

import { useEffect, useState } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { verificationApi, VerificationProfile } from '@/lib/verificationApi'
import { Pencil } from 'lucide-react'

export default function BasicProfileFields() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [error, setError] = useState('')

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [emergencyContactName, setEmergencyContactName] = useState('')
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')

    const applyProfile = (p: VerificationProfile) => {
        setName(p.name ?? '')
        setPhone(p.phone ?? '')
        setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '')
        setEmergencyContactName(p.emergencyContactName ?? '')
        setEmergencyContactPhone(p.emergencyContactPhone ?? '')
        setDivision(p.division ?? '')
        setDistrict(p.district ?? '')
        setUpazila(p.upazila ?? '')
        setEditing(!(p.name && p.phone))
    }

    useEffect(() => {
        verificationApi.getMe().then((res) => {
            if (res.success && res.data) applyProfile(res.data)
            else setEditing(true)
            setLoading(false)
        })
    }, [])

    const handleSave = async () => {
        if (!name.trim() || !phone.trim()) {
            setError('Full name and phone are required')
            return
        }
        setSaving(true)
        setError('')
        const res = await verificationApi.submit({
            name: name.trim(),
            phone: phone.trim(),
            dateOfBirth: dateOfBirth || undefined,
            emergencyContactName: emergencyContactName.trim() || undefined,
            emergencyContactPhone: emergencyContactPhone.trim() || undefined,
            division: division || undefined,
            district: district || undefined,
            upazila: upazila || undefined,
        })
        if (res.success && res.data) {
            applyProfile(res.data)
        } else {
            setError(res.message ?? 'Could not save your info. Please try again.')
        }
        setSaving(false)
    }

    if (loading) {
        return <p className="text-xs text-gray-400">Loading your info…</p>
    }

    if (!editing) {
        return (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{name}</p>
                        <p className="text-xs text-gray-500">{phone}</p>
                        {dateOfBirth && <p className="text-xs text-gray-500">DOB: {dateOfBirth}</p>}
                        {(emergencyContactName || emergencyContactPhone) && (
                            <p className="text-xs text-gray-500">
                                Guardian: {[emergencyContactName, emergencyContactPhone].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        {(division || district || upazila) && (
                            <p className="text-xs text-gray-500">
                                {[upazila, district, division].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                        <Pencil size={12} /> Edit
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Phone Number" required placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Age / Date of Birth (optional)" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                <Input label="Guardian/Emergency Contact Name (optional)" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
                <Input label="Guardian/Emergency Contact Phone (optional)" placeholder="01XXXXXXXXX" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
                <Input label="Division (optional)" value={division} onChange={(e) => setDivision(e.target.value)} />
                <Input label="District (optional)" value={district} onChange={(e) => setDistrict(e.target.value)} />
                <Input label="Upazila (optional)" value={upazila} onChange={(e) => setUpazila(e.target.value)} />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button type="button" variant="primary" size="sm" isLoading={saving} onClick={handleSave}>
                Save
            </Button>
        </div>
    )
}