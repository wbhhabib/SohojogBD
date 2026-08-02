'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import Button from '@/components/ui/button'
import { plantApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { Sprout } from 'lucide-react'

const PLANT_TYPES = [
    'Flowering', 'Fruit', 'Vegetable', 'Succulent',
    'Herb', 'Tree Sapling', 'Indoor', 'Seeds', 'Other',
].map((v) => ({ label: v, value: v }))

export default function CreatePlantListingPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [plantType, setPlantType] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [location, setLocation] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [images, setImages] = useState<File[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/plants/create')
        }
    }, [ready, user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!plantType) {
            setError('Please select a plant type')
            return
        }

        setSubmitting(true)
        const res = await plantApi.create({
            title,
            description,
            plantType,
            quantity: Number(quantity) || 1,
            location,
            contactPhone: contactPhone || undefined,
            images: [],
        })

        if (!res.success || !res.data) {
            const detailed = res.errors?.map((e) => e.message).join(' ')
            setError(detailed || res.message || 'Could not create listing. Please check your details.')
            setSubmitting(false)
            return
        }

        if (images.length > 0) {
            const fd = new FormData()
            images.forEach((file) => fd.append('images', file))
            await plantApi.uploadImages(res.data.id, fd)
        }

        router.push(`/plants/${res.data.slug}`)
    }

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Sprout size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Give Away a Plant</h1>
                            <p className="text-sm text-gray-500">Share your extra saplings, cuttings, or seeds with the community.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                        <Input
                            label="Title"
                            required
                            placeholder="e.g. 3 Money Plant Cuttings"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">
                            At least 5 characters ({title.length}/5)
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Select
                                label="Plant type"
                                required
                                placeholder="Select a type"
                                options={PLANT_TYPES}
                                value={plantType}
                                onChange={(e) => setPlantType(e.target.value)}
                            />
                            <Input
                                label="Quantity"
                                type="number"
                                min="1"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <Textarea
                            label="Description"
                            required
                            rows={4}
                            placeholder="Tell people about the plant — care needs, size, why you're giving it away…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">
                            At least 20 characters ({description.length}/20)
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Location (area/city)"
                                required
                                placeholder="e.g. Dhanmondi, Dhaka"
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
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Photos (optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 5))}
                                className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:text-sm file:font-medium hover:file:bg-emerald-100"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
                            Publish Listing
                        </Button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    )
}