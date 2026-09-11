'use client'

import { useState } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import LocationSelect from '@/components/common/LocationSelect'
import { createBranch } from '@/lib/providerApi'

interface CreateBranchModalProps {
    providerId: string | null
    onClose: () => void
    onCreated: () => void | Promise<void>
}

export default function CreateBranchModal({ providerId, onClose, onCreated }: CreateBranchModalProps) {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const reset = () => {
        setName('')
        setAddress('')
        setDivision('')
        setDistrict('')
        setUpazila('')
        setLoginEmail('')
        setLoginPassword('')
        setError('')
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleSubmit = async () => {
        if (!providerId) return
        setError('')

        if (!name.trim() || !address.trim() || !division || !district.trim() || !upazila.trim() || !loginEmail.trim() || !loginPassword) {
            setError('Please fill in every field')
            return
        }
        if (loginPassword.length < 8 || !/[A-Z]/.test(loginPassword) || !/[0-9]/.test(loginPassword)) {
            setError('Password must be at least 8 characters, with an uppercase letter and a number')
            return
        }

        setSubmitting(true)
        const res = await createBranch(providerId, {
            name: name.trim(),
            address: address.trim(),
            division,
            district: district.trim(),
            upazila: upazila.trim(),
            loginEmail: loginEmail.trim(),
            loginPassword,
        })

        if (!res.success) {
            const detailed = res.errors?.map((e) => e.message).join(' ')
            setError(detailed || res.message || 'Could not create this branch.')
            setSubmitting(false)
            return
        }

        setSubmitting(false)
        reset()
        onClose()
        await onCreated()
    }

    return (
        <Modal isOpen={!!providerId} onClose={handleClose} title="Add a New Branch" size="md">
            <div className="space-y-4">
                <Input
                    label="Branch Name"
                    required
                    placeholder="e.g. SPTC Mirpur Branch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input
                    label="Detailed Address"
                    required
                    placeholder="House/road/area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <LocationSelect
                    division={division}
                    district={district}
                    upazila={upazila}
                    onDivisionChange={setDivision}
                    onDistrictChange={setDistrict}
                    onUpazilaChange={setUpazila}
                    required
                />
                <Input
                    label="Branch Login Email"
                    type="email"
                    required
                    placeholder="branch-mirpur@institute.org"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="off"
                />
                <Input
                    label="Initial Password"
                    type="password"
                    required
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="new-password"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" isLoading={submitting} onClick={handleSubmit}>
                        Create Branch
                    </Button>
                </div>
            </div>
        </Modal>
    )
}