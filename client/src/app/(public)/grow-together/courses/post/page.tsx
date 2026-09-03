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
import {
    createCourse, getMyPostableOrgs, COURSE_CATEGORIES, COURSE_MODES, MODE_LABEL,
} from '@/lib/courseApi'
import type { CourseCategory, CourseMode, PostableOrg } from '@/lib/courseApi'
import { Megaphone, Loader2, ShieldAlert } from 'lucide-react'

const CATEGORY_OPTIONS = COURSE_CATEGORIES.map((v) => ({ label: v, value: v }))
const MODE_OPTIONS = COURSE_MODES.map((v) => ({ label: MODE_LABEL[v], value: v }))

export default function PostCoursePage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [orgs, setOrgs] = useState<PostableOrg[]>([])
    const [orgsLoading, setOrgsLoading] = useState(true)

    const [organizationId, setOrganizationId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [skillCategory, setSkillCategory] = useState<CourseCategory | ''>('')
    const [mode, setMode] = useState<CourseMode | ''>('')
    const [duration, setDuration] = useState('')
    const [eligibility, setEligibility] = useState('')
    const [venue, setVenue] = useState('')
    const [division, setDivision] = useState('')
    const [district, setDistrict] = useState('')
    const [upazila, setUpazila] = useState('')
    const [isOngoing, setIsOngoing] = useState(false)
    const [applicationDeadline, setApplicationDeadline] = useState('')
    const [seatsAvailable, setSeatsAvailable] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [applyLink, setApplyLink] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/grow-together/courses/post')
        }
    }, [ready, user, router])

    useEffect(() => {
        if (!user) return
        getMyPostableOrgs().then((res) => {
            if (res.success) setOrgs(res.data)
            setOrgsLoading(false)
        })
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!organizationId) return setError('Please select an organization')
        if (!skillCategory) return setError('Please select a skill category')
        if (!mode) return setError('Please select a mode')
        if (mode !== 'ONLINE' && (!division || !district.trim() || !upazila.trim())) {
            return setError('Division, district, and upazila are required for offline/hybrid courses')
        }
        if (!duration.trim()) return setError('Please specify the course duration')

        setSubmitting(true)
        const res = await createCourse({
            organizationId,
            title,
            description,
            skillCategory,
            mode,
            duration: duration.trim(),
            eligibility: eligibility || undefined,
            venue: venue || undefined,
            division: division || undefined,
            district: district.trim() || undefined,
            upazila: upazila.trim() || undefined,
            isOngoing,
            applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
            seatsAvailable: seatsAvailable ? Number(seatsAvailable) : undefined,
            contactPhone: contactPhone || undefined,
            contactEmail: contactEmail || undefined,
            applyLink: applyLink || undefined,
        })

        if (!res.success || !res.data) {
            setError(res.message || 'Could not post this course. Please check your details.')
            setSubmitting(false)
            return
        }

        router.push(`/grow-together/courses/${res.data.slug}`)
    }

    if (!ready || !user || orgsLoading) return null

    if (orgs.length === 0) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen py-16" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                    <div className="max-w-md mx-auto px-4 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-50">
                            <ShieldAlert size={22} className="text-emerald-600" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 mb-2">Approved organization needed</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Only verified &amp; approved organizations can post free courses, to keep listings
                            trustworthy. Register your organization first — once it&apos;s approved you can post
                            courses here.
                        </p>

                        <a href="/bdcare/create"
                            className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                        >
                            Register an Organization
                        </a>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen py-10" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                            <Megaphone size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900"
                                style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                Post a Free Course
                            </h1>
                            <p className="text-sm text-gray-500">
                                Let entrepreneurs and job seekers near you find your training program.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-5">
                        <Select
                            label="Posting as (organization)"
                            required
                            placeholder="Select your organization"
                            options={orgs.map((o) => ({ label: o.name, value: o.id }))}
                            value={organizationId}
                            onChange={(e) => setOrganizationId(e.target.value)}
                        />

                        <Input
                            label="Course title"
                            required
                            placeholder="e.g. 3-Month Freelancing & Digital Marketing Training"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">At least 5 characters ({title.length}/5)</p>

                        <Textarea
                            label="Description"
                            required
                            rows={4}
                            placeholder="What will students learn, how is it taught, any stipend/certificate details…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-xs -mt-3 text-gray-400">At least 20 characters ({description.length}/20)</p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Select
                                label="Skill category"
                                required
                                placeholder="Select a category"
                                options={CATEGORY_OPTIONS}
                                value={skillCategory}
                                onChange={(e) => setSkillCategory(e.target.value as CourseCategory)}
                            />
                            <Select
                                label="Mode"
                                required
                                placeholder="Select mode"
                                options={MODE_OPTIONS}
                                value={mode}
                                onChange={(e) => setMode(e.target.value as CourseMode)}
                            />
                        </div>

                        <Input
                            label="Duration"
                            required
                            placeholder="e.g. 3 months, 600 hours, 6 weeks"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />

                        <Textarea
                            label="Eligibility (optional)"
                            rows={2}
                            placeholder="e.g. SSC/HSC pass, age 18–35, unemployed youth…"
                            value={eligibility}
                            onChange={(e) => setEligibility(e.target.value)}
                        />

                        {mode !== 'ONLINE' && (
                            <>
                                <hr className="border-emerald-100" />
                                <Input
                                    label="Venue (optional)"
                                    placeholder="e.g. TTC Mirpur campus, Room 12"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
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
                            </>
                        )}

                        <hr className="border-emerald-100" />

                        <div className="flex items-center gap-2">
                            <input
                                id="isOngoing"
                                type="checkbox"
                                checked={isOngoing}
                                onChange={(e) => setIsOngoing(e.target.checked)}
                                className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-400"
                            />
                            <label htmlFor="isOngoing" className="text-sm text-gray-700">
                                Rolling admission (no fixed deadline)
                            </label>
                        </div>

                        {!isOngoing && (
                            <Input
                                label="Application deadline (optional)"
                                type="date"
                                value={applicationDeadline}
                                onChange={(e) => setApplicationDeadline(e.target.value)}
                            />
                        )}

                        <Input
                            label="Seats available (optional)"
                            type="number"
                            min="1"
                            placeholder="e.g. 30"
                            value={seatsAvailable}
                            onChange={(e) => setSeatsAvailable(e.target.value)}
                        />

                        <hr className="border-emerald-100" />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Contact phone (optional)"
                                placeholder="Leave blank to use organization's"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                            />
                            <Input
                                label="Contact email (optional)"
                                type="email"
                                placeholder="Leave blank to use organization's"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                            />
                        </div>
                        <Input
                            label="Apply / registration link (optional)"
                            placeholder="Google Form, website, or online application link"
                            value={applyLink}
                            onChange={(e) => setApplyLink(e.target.value)}
                        />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                        >
                            {submitting && <Loader2 size={15} className="animate-spin" />}
                            Publish Course
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    )
}