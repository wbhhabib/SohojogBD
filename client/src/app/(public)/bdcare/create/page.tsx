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
import { Handshake } from 'lucide-react'

const ORG_CATEGORIES = [
    'Education', 'Health', 'Disaster Relief', 'Environment',
    'Animal Welfare', 'Community', 'Poverty', 'Youth Development', 'Other',
].map((v) => ({ label: v, value: v }))

export default function CreateOrgPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [location, setLocation] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [logo, setLogo] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/bdcare/create')
        }
    }, [ready, user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!category) {
            setError('Please select a category')
            return
        }

        setSubmitting(true)
        const res = await orgApi.create({
            name,
            description,
            category,
            location,
            contactPhone: contactPhone || undefined,
            contactEmail: contactEmail || undefined,
        })

        if (!res.success || !res.data) {
            const detailed = res.errors?.map((e) => e.message).join(' ')
            setError(detailed || res.message || 'Could not register organization. Please check your details.')
            setSubmitting(false)
            return
        }

        if (logo) {
            const fd = new FormData()
            fd.append('images', logo)
            fd.append('field', 'logo')
            await orgApi.uploadImages(res.data.id, fd)
        }
        if (coverImage) {
            const fd = new FormData()
            fd.append('images', coverImage)
            fd.append('field', 'coverImage')
            await orgApi.uploadImages(res.data.id, fd)
        }

        router.push(`/bdcare/${res.data.slug}`)
    }

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                            <Handshake size={18} className="text-sky-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Register Your Organization</h1>
                            <p className="text-sm text-gray-500">Join BDCare and connect with volunteers across Bangladesh.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                        <Input
                            label="Organization name"
                            required
                            placeholder="e.g. Green Bangladesh Foundation"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">
                            At least 3 characters ({name.length}/3)
                        </p>
                        <Textarea
                            label="Description"
                            required
                            rows={4}
                            placeholder="What does your organization do? Who does it help?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">
                            At least 20 characters ({description.length}/20)
                        </p>
                        <Select
                            label="Category"
                            required
                            placeholder="Select a category"
                            options={ORG_CATEGORIES}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Location (area/city)"
                                required
                                placeholder="e.g. Mirpur, Dhaka"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            <Input
                                label="Contact phone (optional)"
                                placeholder="01XXXXXXXXX"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                            />
                        </div>
                        <Input
                            label="Contact email (optional)"
                            type="email"
                            placeholder="org@example.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                        />

                        <hr className="border-gray-100" />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Logo (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                                    className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:text-sm file:font-medium hover:file:bg-sky-100"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Cover image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                                    className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:text-sm file:font-medium hover:file:bg-sky-100"
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
                            Register Organization
                        </Button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    )
}