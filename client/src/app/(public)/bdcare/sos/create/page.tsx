'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Textarea from '@/components/ui/textarea'
import Button from '@/components/ui/button'
import { sosApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { useEffect } from 'react'
import { AlertTriangle, MapPin, Loader2, PhoneCall } from 'lucide-react'

export default function CreateSOSPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [message, setMessage] = useState('')
    const [radiusKm, setRadiusKm] = useState(5)
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [locating, setLocating] = useState(false)
    const [locationError, setLocationError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    useEffect(() => {
        if (ready && !user) router.push('/auth/login?next=/bdcare/sos/create')
    }, [ready, user, router])

    const handleDetectLocation = () => {
        if (!('geolocation' in navigator)) {
            setLocationError('Your browser does not support location detection.')
            return
        }
        setLocating(true)
        setLocationError('')
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                setLocating(false)
            },
            () => {
                setLocationError('Could not get your location. Please allow location access and try again.')
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleSubmit = async () => {
        if (!coords) {
            setSubmitError('Please share your location first.')
            return
        }
        if (message.trim().length < 5) {
            setSubmitError('Please describe the emergency in a few words.')
            return
        }

        setSubmitting(true)
        setSubmitError('')

        const res = await sosApi.create({
            message: message.trim(),
            latitude: coords.lat,
            longitude: coords.lng,
            radiusKm,
        })

        if (!res.success || !res.data) {
            setSubmitError(res.message ?? 'Could not send your SOS. Please try again.')
            setSubmitting(false)
            return
        }

        router.push(`/bdcare/sos/${res.data.id}`)
    }

    if (!ready || !user) return null

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-lg mx-auto px-4">

                    <div className="rounded-2xl bg-red-50 border border-red-200 p-5 mb-6">
                        <div className="flex items-start gap-3">
                            <PhoneCall size={20} className="text-red-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-red-700 text-sm">
                                    In a life-threatening emergency, call 999 first.
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    This tool alerts nearby volunteers as extra support — it is not a
                                    replacement for Bangladesh&apos;s national emergency service, and there
                                    is no guarantee anyone will respond in time.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Request Nearby Help</h1>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                        <Textarea
                            label="What's happening?"
                            required
                            rows={4}
                            placeholder="Briefly describe the emergency — e.g. 'Road accident, person injured and bleeding, needs help now.'"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">Your Location <span className="text-red-500">*</span></label>
                            {coords ? (
                                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} /> Location captured
                                    </span>
                                    <button type="button" onClick={handleDetectLocation} className="text-xs font-semibold underline">
                                        Refresh
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={locating}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-red-300 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                                >
                                    {locating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                                    {locating ? 'Getting your location…' : '📍 Use My Current Location'}
                                </button>
                            )}
                            {locationError && <p className="text-xs text-red-600">{locationError}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">
                                Search radius: <span className="font-bold text-red-600">{radiusKm} km</span>
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={radiusKm}
                                onChange={(e) => setRadiusKm(Number(e.target.value))}
                                className="w-full accent-red-600"
                            />
                            <p className="text-xs text-gray-400">
                                Volunteers within this distance will be alerted. Increase it if you&apos;re in a rural area with fewer volunteers nearby.
                            </p>
                        </div>

                        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                        <Button
                            variant="danger"
                            className="w-full"
                            isLoading={submitting}
                            onClick={handleSubmit}
                        >
                            <AlertTriangle size={16} /> Send SOS to Nearby Volunteers
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}