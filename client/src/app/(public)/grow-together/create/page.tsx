'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import { createPool, POOL_CATEGORIES, DIVISIONS, UNITS } from '@/lib/growTogetherApi'
import type { PoolCategory, Division } from '@/lib/growTogetherApi'
import { PackagePlus, Loader2 } from 'lucide-react'

const CATEGORY_OPTIONS = POOL_CATEGORIES.map((v) => ({ label: v, value: v }))
const DIVISION_OPTIONS = DIVISIONS.map((v) => ({ label: v, value: v }))
const UNIT_OPTIONS = UNITS.map((v) => ({ label: v, value: v }))

function minDateStr(daysFromNow: number) {
    const d = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
}

export default function CreatePoolPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState<PoolCategory | ''>('')
    const [unit, setUnit] = useState('')
    const [targetQuantity, setTargetQuantity] = useState('')
    const [minJoinQuantity, setMinJoinQuantity] = useState('1')
    const [pricePerUnit, setPricePerUnit] = useState('')
    const [marketPricePerUnit, setMarketPricePerUnit] = useState('')
    const [division, setDivision] = useState<Division | ''>('')
    const [location, setLocation] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [groupLink, setGroupLink] = useState('')
    const [deadline, setDeadline] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/grow-together/create')
        }
    }, [ready, user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!category) return setError('Please select a product category')
        if (!unit) return setError('Please select a unit')
        if (!division) return setError('Please select your area')
        if (!deadline) return setError('Please pick a deadline for the pool')
        if (Number(targetQuantity) <= 0) return setError('Target quantity must be greater than 0')
        if (Number(pricePerUnit) <= 0) return setError('Pool price must be greater than 0')

        setSubmitting(true)
        const res = await createPool(
            {
                title,
                description,
                category,
                unit,
                targetQuantity: Number(targetQuantity),
                minJoinQuantity: Number(minJoinQuantity) || 1,
                pricePerUnit: Number(pricePerUnit),
                marketPricePerUnit: marketPricePerUnit ? Number(marketPricePerUnit) : undefined,
                division,
                location,
                contactPhone,
                groupLink: groupLink || undefined,
                deadline: new Date(deadline).toISOString(),
            },
            { id: user!.id, name: user!.name, avatar: user!.avatar }
        )

        if (!res.success || !res.data) {
            setError(res.message || 'Could not start this pool. Please check your details.')
            setSubmitting(false)
            return
        }

        router.push(`/grow-together/${res.data.slug}`)
    }

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen py-10" style={{ background: '#FBF3E7' }}>
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E4CE' }}>
                            <PackagePlus size={18} style={{ color: '#8A5A20' }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: '#2A2118', fontFamily: "'Space Grotesk', sans-serif" }}>
                                Start a Wholesale Pool
                            </h1>
                            <p className="text-sm" style={{ color: '#6B5B44' }}>
                                Set a target quantity — once enough entrepreneurs join, everyone gets the wholesale rate.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-5" style={{ background: '#FFFDF9', border: '1px solid #E9D9B8' }}>
                        <Input
                            label="Product name"
                            required
                            placeholder="e.g. Winter Jacket Wholesale Lot"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-xs -mt-3" style={{ color: '#A88860' }}>At least 5 characters ({title.length}/5)</p>

                        <Textarea
                            label="Description"
                            required
                            rows={4}
                            placeholder="What's the deal — supplier, sizes/variants, why the group rate is good…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-xs -mt-3" style={{ color: '#A88860' }}>At least 20 characters ({description.length}/20)</p>

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

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Target quantity"
                                type="number"
                                min="1"
                                required
                                placeholder="e.g. 100"
                                value={targetQuantity}
                                onChange={(e) => setTargetQuantity(e.target.value)}
                            />
                            <Input
                                label="Min. quantity per participant"
                                type="number"
                                min="1"
                                value={minJoinQuantity}
                                onChange={(e) => setMinJoinQuantity(e.target.value)}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Pool price per unit (৳)"
                                type="number"
                                min="1"
                                required
                                placeholder="e.g. 420"
                                value={pricePerUnit}
                                onChange={(e) => setPricePerUnit(e.target.value)}
                            />
                            <Input
                                label="Usual retail price per unit (৳, optional)"
                                type="number"
                                min="0"
                                placeholder="Shown as a savings badge"
                                value={marketPricePerUnit}
                                onChange={(e) => setMarketPricePerUnit(e.target.value)}
                            />
                        </div>

                        <Input
                            label="Deadline to reach the target"
                            type="date"
                            required
                            min={minDateStr(1)}
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />

                        <hr style={{ borderColor: '#E9D9B8' }} />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Select
                                label="Area (division)"
                                required
                                placeholder="Select your area"
                                options={DIVISION_OPTIONS}
                                value={division}
                                onChange={(e) => setDivision(e.target.value as Division)}
                            />
                            <Input
                                label="Location (area/market)"
                                required
                                placeholder="e.g. Mirpur 10, Dhaka"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <Input
                            label="Contact phone"
                            required
                            placeholder="01XXXXXXXXX"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                        />
                        <Input
                            label="WhatsApp / Messenger group link (optional)"
                            placeholder="Paste an existing group link, or add one later"
                            value={groupLink}
                            onChange={(e) => setGroupLink(e.target.value)}
                        />
                        <p className="text-xs -mt-3" style={{ color: '#A88860' }}>
                            Interested entrepreneurs will commit a quantity here, then move to this group to work out sizes, payment, and pickup.
                        </p>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 text-[#12293D] text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #E8A33D, #D98E2B)' }}
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