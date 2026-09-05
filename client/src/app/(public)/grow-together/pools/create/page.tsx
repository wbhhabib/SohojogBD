'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import LocationSelect from '@/components/common/LocationSelect'
import { useAuth } from '@/lib/AuthContext'
import { verificationApi } from '@/lib/verificationApi'
import { createPool, POOL_CATEGORIES, UNITS } from '@/lib/growTogetherApi'
import type { PoolCategory, Division } from '@/lib/growTogetherApi'
import { PackagePlus, Loader2 } from 'lucide-react'

const CATEGORY_OPTIONS = POOL_CATEGORIES.map((v) => ({ label: v, value: v }))
const UNIT_OPTIONS = UNITS.map((v) => ({ label: v, value: v }))

const DRAFT_KEY = 'draft:pool-create'

export default function CreatePoolPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState<PoolCategory | ''>('')
    const [unit, setUnit] = useState('')
    const [division, setDivision] = useState<Division | ''>('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')
    const [location, setLocation] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [groupLink, setGroupLink] = useState('')
    const [facebookLink, setFacebookLink] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/grow-together/pools/create')
        }
    }, [ready, user, router])

    useEffect(() => {
        const draft = sessionStorage.getItem(DRAFT_KEY)
        if (draft) {
            const parsed = JSON.parse(draft)
            setTitle(parsed.title ?? '')
            setDescription(parsed.description ?? '')
            setCategory(parsed.category ?? '')
            setUnit(parsed.unit ?? '')
            setDivision(parsed.division ?? '')
            setDistrict(parsed.district ?? '')
            setUpazila(parsed.upazila ?? '')
            setLocation(parsed.location ?? '')
            setContactPhone(parsed.contactPhone ?? '')
            setGroupLink(parsed.groupLink ?? '')
            setFacebookLink(parsed.facebookLink ?? '')
            sessionStorage.removeItem(DRAFT_KEY)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!category) return setError('Please select a product category')
        if (!unit) return setError('Please select a unit')
        if (!division) return setError('Please select your area')
        if (!district.trim()) return setError('Please enter your district')
        if (!upazila.trim()) return setError('Please enter your upazila/thana')
        if (!groupLink.trim()) return setError('A WhatsApp/Messenger group link is required so interested people can reach you')

        const draft = {
            title, description, category, unit, division, district, upazila,
            location, contactPhone, groupLink, facebookLink,
        }

        const check = await verificationApi.checkReadiness('WHOLESALE_JOIN')
        if (check.success && check.data && !check.data.ready) {
            sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
            router.push(`/verification/core?action=WHOLESALE_JOIN&redirect=${encodeURIComponent('/grow-together/pools/create')}`)
            return
        }

        setSubmitting(true)
        const res = await createPool(
            {
                title,
                description,
                category,
                unit,
                division,
                district: district.trim(),
                upazila: upazila.trim(),
                location,
                contactPhone,
                groupLink,
                facebookLink: facebookLink || undefined,
            },
            { id: user!.id, name: user!.name, avatar: user!.avatar }
        )

        if (!res.success || !res.data) {
            setError(res.message || 'Could not start this pool. Please check your details.')
            setSubmitting(false)
            return
        }

        router.push(`/grow-together/pools/${res.data.slug}`)
    }

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen py-10" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f9fafb 120px)' }}>
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
                            <PackagePlus size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900"
                                style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                Find Your Wholesale Group
                            </h1>
                            <p className="text-sm text-gray-500">
                                Tell other small-capital businessmen with the same interest what you work on — they&apos;ll find you and team up.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-5">
                        <Input
                            label="Product name"
                            required
                            placeholder="e.g. Winter Jacket Wholesale Group"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">At least 5 characters ({title.length}/5)</p>

                        <Textarea
                            label="Description"
                            required
                            rows={4}
                            placeholder="What product do you work with, why are you looking for a wholesale group, and what kind of partners you're hoping to find…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">At least 20 characters ({description.length}/20)</p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Select
                                label="Product category"
                                required
                                placeholder="Select a category"
                                options={CATEGORY_OPTIONS}
                                value={category}
                                onChange={(e) => setCategory(e.target.value as PoolCategory)}
                            />
                            <Select
                                label="Unit"
                                required
                                placeholder="Select unit"
                                options={UNIT_OPTIONS}
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            />
                        </div>

                        <hr className="border-amber-100" />

                        <LocationSelect
                            division={division}
                            district={district}
                            upazila={upazila}
                            onDivisionChange={(val) => setDivision(val as Division)}
                            onDistrictChange={setDistrict}
                            onUpazilaChange={setUpazila}
                            required
                        />

                        <Input
                            label="Location (area/market)"
                            required
                            placeholder="e.g. Mirpur 10, Dhaka"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />

                        <Input
                            label="Contact phone"
                            required
                            placeholder="01XXXXXXXXX"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                        />
                        <Input
                            label="WhatsApp / Messenger group link"
                            required
                            placeholder="Interested people will use this to reach your group"
                            value={groupLink}
                            onChange={(e) => setGroupLink(e.target.value)}
                        />
                        <Input
                            label="Facebook page/group link (optional)"
                            placeholder="Paste your Facebook page or group link"
                            value={facebookLink}
                            onChange={(e) => setFacebookLink(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">
                            Only verified users will be able to see your contact info and group links, and join your group.
                        </p>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl transition-all disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #d97706, #f97316)' }}
                        >
                            {submitting && <Loader2 size={15} className="animate-spin" />}
                            Publish Pool
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    )
}