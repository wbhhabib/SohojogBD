'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import { sosApi } from '@/lib/api'
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '@/lib/push'
import { useAuth } from '@/lib/AuthContext'
import { verificationApi } from '@/lib/verificationApi'
import { Bell, BellOff, MapPin, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function SOSSettingsPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [loading, setLoading] = useState(true)
    const [hasLocation, setHasLocation] = useState(false)
    const [radiusKm, setRadiusKm] = useState(5)
    const [pushEnabled, setPushEnabled] = useState(false)
    const [browserSubscribed, setBrowserSubscribed] = useState(false)

    const [locating, setLocating] = useState(false)
    const [toggling, setToggling] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const loadSettings = useCallback(async () => {
        setLoading(true)
        const [settingsRes, subscribed] = await Promise.all([
            sosApi.getResponderSettings(),
            isPushSubscribed(),
        ])
        if (settingsRes.success && settingsRes.data) {
            setHasLocation(!!(settingsRes.data.respLat && settingsRes.data.respLng))
            setRadiusKm(settingsRes.data.respRadiusKm ?? 5)
            setPushEnabled(settingsRes.data.pushEnabled)
        }
        setBrowserSubscribed(subscribed)
        setLoading(false)
    }, [])

    useEffect(() => {
        if (ready && !user) { router.push('/auth/login?next=/bdcare/sos/settings'); return }
        if (user) loadSettings()
    }, [ready, user, router, loadSettings])

    const handleSetLocation = () => {
        if (!('geolocation' in navigator)) {
            setError('Your browser does not support location detection.')
            return
        }
        setLocating(true)
        setError('')
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const res = await sosApi.updateResponderSettings({
                    respLat: pos.coords.latitude,
                    respLng: pos.coords.longitude,
                })
                if (res.success) {
                    setHasLocation(true)
                    setMessage('Location updated.')
                } else {
                    setError(res.message ?? 'Could not save your location.')
                }
                setLocating(false)
            },
            () => {
                setError('Could not get your location. Please allow location access and try again.')
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleRadiusChange = async (value: number) => {
        setRadiusKm(value)
        await sosApi.updateResponderSettings({ respRadiusKm: value })
    }

    const handleTogglePush = async () => {
        setToggling(true)
        setError('')
        setMessage('')

        if (!pushEnabled) {
            const check = await verificationApi.checkReadiness('SOS_RESPOND')
            if (check.success && check.data && !check.data.ready) {
                router.push(`/verification/core?action=SOS_RESPOND&redirect=${encodeURIComponent('/bdcare/sos/settings')}`)
                setToggling(false)
                return
            }

            const result = await subscribeToPush()
            if (!result.success) {
                setError(result.message ?? 'Could not enable alerts.')
                setToggling(false)
                return
            }
            await sosApi.updateResponderSettings({ pushEnabled: true })
            setPushEnabled(true)
            setBrowserSubscribed(true)
            setMessage('Emergency alerts enabled.')
        } else {
            await unsubscribeFromPush()
            await sosApi.updateResponderSettings({ pushEnabled: false })
            setPushEnabled(false)
            setBrowserSubscribed(false)
            setMessage('Emergency alerts disabled.')
        }
        setToggling(false)
    }

    if (loading || !ready) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-lg mx-auto px-4">
                    <a href="/bdcare/sos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-5">
                        <ArrowLeft size={14} /> Back to nearby requests
                    </a>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Bell size={18} className="text-red-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Emergency Alert Settings</h1>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 mb-1">1. Your Location</h2>
                            <p className="text-xs text-gray-500 mb-3">
                                We use this to match you with emergency requests near you.
                            </p>
                            {hasLocation ? (
                                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Location set</span>
                                    <button type="button" onClick={handleSetLocation} disabled={locating} className="text-xs font-semibold underline">
                                        {locating ? 'Updating…' : 'Update'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSetLocation}
                                    disabled={locating}
                                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-red-300 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                                >
                                    {locating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                                    {locating ? 'Getting your location…' : '📍 Set My Location'}
                                </button>
                            )}
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-gray-900 mb-1">2. Alert Radius</h2>
                            <p className="text-xs text-gray-500 mb-3">
                                You&apos;ll be alerted for emergencies within this distance.
                            </p>
                            <label className="text-sm font-medium text-slate-700">
                                <span className="font-bold text-red-600">{radiusKm} km</span>
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={radiusKm}
                                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                                className="w-full accent-red-600 mt-1"
                            />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-gray-900 mb-1">3. Notifications</h2>
                            <p className="text-xs text-gray-500 mb-3">
                                Get a push notification instantly when someone nearby needs help.
                            </p>
                            <Button
                                variant={pushEnabled ? 'outline' : 'danger'}
                                className="w-full"
                                isLoading={toggling}
                                onClick={handleTogglePush}
                            >
                                {pushEnabled ? <BellOff size={16} /> : <Bell size={16} />}
                                {pushEnabled ? 'Disable Emergency Alerts' : 'Enable Emergency Alerts'}
                            </Button>
                            {pushEnabled && !browserSubscribed && (
                                <p className="text-xs text-amber-600 mt-2">
                                    Alerts are on, but this browser isn&apos;t subscribed — try enabling again on this device.
                                </p>
                            )}
                        </div>

                        {message && <p className="text-sm text-emerald-600">{message}</p>}
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        {(!hasLocation || !pushEnabled) && (
                            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                                Set your location and enable alerts to start receiving nearby emergency requests.
                            </p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}