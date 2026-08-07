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
import { Sprout, Sparkles, Loader2, X } from 'lucide-react'

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
    const [previews, setPreviews] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // AI auto-fill state
    const [analyzing, setAnalyzing] = useState(false)
    const [aiNote, setAiNote] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null)
    const [aiFilled, setAiFilled] = useState(false)

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/plants/create')
        }
    }, [ready, user, router])

    // Revoke object URLs on unmount to avoid memory leaks
    useEffect(() => {
        return () => previews.forEach((url) => URL.revokeObjectURL(url))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const runAiAnalysis = async (file: File) => {
        setAnalyzing(true)
        setAiNote(null)
        const res = await plantApi.analyzeImage(file)

        if (!res.success || !res.data) {
            setAiNote({
                type: 'error',
                text: res.message || 'Could not analyze the photo. You can still fill the details manually.',
            })
            setAnalyzing(false)
            return
        }

        const { title: aiTitle, description: aiDescription, plantType: aiType, confidence } = res.data

        // Only auto-fill fields the user hasn't typed into yet, so we never
        // clobber something they've already written.
        setTitle((prev) => (prev.trim() ? prev : aiTitle))
        setDescription((prev) => (prev.trim() ? prev : aiDescription))
        setPlantType((prev) => (prev ? prev : aiType))
        setAiFilled(true)

        if (confidence === 'low') {
            setAiNote({
                type: 'warning',
                text: "Couldn't clearly identify a plant in this photo — please double-check the title and description.",
            })
        } else {
            setAiNote({
                type: 'success',
                text: 'Title & description filled in from your photo — feel free to edit them.',
            })
        }
        setAnalyzing(false)
    }

    const handleFilesChange = (fileList: FileList | null) => {
        const files = Array.from(fileList ?? []).slice(0, 5)
        setImages(files)

        previews.forEach((url) => URL.revokeObjectURL(url))
        setPreviews(files.map((f) => URL.createObjectURL(f)))

        if (files.length > 0) {
            void runAiAnalysis(files[0])
        } else {
            setAiNote(null)
        }
    }

    const removeImage = (index: number) => {
        const nextFiles = images.filter((_, i) => i !== index)
        URL.revokeObjectURL(previews[index])
        const nextPreviews = previews.filter((_, i) => i !== index)
        setImages(nextFiles)
        setPreviews(nextPreviews)
        if (nextFiles.length === 0) setAiNote(null)
    }

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
                        {/* ── Photos first: upload a photo and AI fills the rest ── */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-700">Photos</label>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <Sparkles size={12} />
                                    AI auto-fill
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">
                                Upload a photo of the plant first — we&apos;ll use AI to suggest a title and description for you.
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFilesChange(e.target.files)}
                                className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:text-sm file:font-medium hover:file:bg-emerald-100"
                            />

                            {previews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {previews.map((src, i) => (
                                        <div key={src} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt={`Plant photo ${i + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white"
                                                aria-label="Remove photo"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {analyzing && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Loader2 size={13} className="animate-spin" />
                                    Analyzing your photo with AI…
                                </div>
                            )}
                            {!analyzing && aiNote && (
                                <p
                                    className={`text-xs mt-1 ${aiNote.type === 'success'
                                        ? 'text-emerald-600'
                                        : aiNote.type === 'warning'
                                            ? 'text-amber-600'
                                            : 'text-red-500'
                                        }`}
                                >
                                    {aiNote.text}
                                </p>
                            )}
                        </div>

                        <hr className="border-gray-100" />

                        <Input
                            label="Title"
                            required
                            placeholder="e.g. 3 Money Plant Cuttings"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">
                            At least 5 characters ({title.length}/5)
                            {aiFilled && <span className="text-emerald-600"> · filled by AI, edit freely</span>}
                        </p>
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