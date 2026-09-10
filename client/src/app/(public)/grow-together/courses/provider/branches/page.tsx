'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import CreateBranchModal from '@/components/course-provider/CreateBranchModal'
import { useAuth } from '@/lib/AuthContext'
import {
    getMyProviders, blockBranch, unblockBranch, deleteBranch,
} from '@/lib/providerApi'
import type { CourseProvider } from '@/lib/providerApi'
import { Building2, Plus, Lock, Unlock, Trash2, Loader2, ShieldAlert } from 'lucide-react'

const STATUS_MESSAGE: Record<string, string> = {
    PENDING: 'Your registration is submitted and waiting for an admin to review it.',
    UNDER_REVIEW: 'Your registration is currently being reviewed by our team.',
    REJECTED: 'This registration was not approved.',
    SUSPENDED: 'This organization has been suspended.',
}

export default function BranchesPage() {
    const router = useRouter()
    const { user, ready } = useAuth()

    const [providers, setProviders] = useState<CourseProvider[]>([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState<string | null>(null)

    // ── Add-branch modal ──
    const [modalProviderId, setModalProviderId] = useState<string | null>(null)

    const fetchProviders = useCallback(async () => {
        setLoading(true)
        const res = await getMyProviders()
        if (res.success) setProviders(res.data)
        setLoading(false)
    }, [])

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/grow-together/courses/provider/branches')
        }
    }, [ready, user, router])

    useEffect(() => { if (user) fetchProviders() }, [user, fetchProviders])

    const handleToggleBlock = async (branchId: string, currentlyBlocked: boolean) => {
        setBusyId(branchId)
        await (currentlyBlocked ? unblockBranch(branchId) : blockBranch(branchId))
        await fetchProviders()
        setBusyId(null)
    }

    const handleDelete = async (branchId: string, branchName: string) => {
        if (!confirm(`Delete branch "${branchName}"? This also removes its login and cannot be undone.`)) return
        setBusyId(branchId)
        await deleteBranch(branchId)
        await fetchProviders()
        setBusyId(null)
    }

    if (!ready || !user || loading) return null

    if (providers.length === 0) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen py-16" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 120px)' }}>
                    <div className="max-w-md mx-auto px-4 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-50">
                            <ShieldAlert size={22} className="text-emerald-600" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 mb-2">No course provider found</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Branch management is only available to registered course providers. Register your
                            institution first.
                        </p>
                        <a href="/grow-together/courses/provider/register"
                            className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                        >
                            Register as a Course Provider
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
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                            <Building2 size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900"
                                style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                Branch Management
                            </h1>
                            <p className="text-sm text-gray-500">
                                Add district/upazila branches — each gets its own login to post courses.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {providers.map((provider) => (
                            <div key={provider.id} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">{provider.institutionName}</h2>
                                        <Badge variant={provider.status === 'APPROVED' ? 'success' : 'warning'} className="mt-1">
                                            {provider.status}
                                        </Badge>
                                    </div>
                                    {provider.status === 'APPROVED' && (
                                        <div className="flex items-center gap-2">

                                            <a href={`/grow-together/courses/providers/${provider.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                            >
                                                View Public Profile
                                            </a>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setModalProviderId(provider.id)}
                                            >
                                                <span className="inline-flex items-center gap-1.5"><Plus size={14} /> Add Branch</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {
                                    provider.status !== 'APPROVED' ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">
                                                {STATUS_MESSAGE[provider.status] ?? `Current status: ${provider.status}.`}
                                            </p>
                                            {provider.adminNote && (
                                                <p className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-600">
                                                    <span className="font-semibold">Admin note: </span>{provider.adminNote}
                                                </p>
                                            )}
                                        </div>
                                    ) : provider.branches.length === 0 ? (
                                        <p className="text-sm text-gray-500">No branches yet.</p>
                                    ) : (
                                        <div className="overflow-x-auto -mx-2">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                                                        <th className="px-2 py-2 font-medium">Branch</th>
                                                        <th className="px-2 py-2 font-medium">Division</th>
                                                        <th className="px-2 py-2 font-medium">District</th>
                                                        <th className="px-2 py-2 font-medium">Upazila</th>
                                                        <th className="px-2 py-2 font-medium">Login</th>
                                                        <th className="px-2 py-2 font-medium text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {provider.branches.map((b) => (
                                                        <tr key={b.id} className="border-b border-gray-50 last:border-0">
                                                            <td className="px-2 py-2.5">
                                                                <span className="font-medium text-gray-900">{b.name}</span>
                                                                {b.isMain && <Badge variant="info" className="ml-1.5">Main</Badge>}
                                                                {b.isBlocked && <Badge variant="danger" className="ml-1.5">Blocked</Badge>}
                                                            </td>
                                                            <td className="px-2 py-2.5 text-gray-500">{b.division}</td>
                                                            <td className="px-2 py-2.5 text-gray-500">{b.district}</td>
                                                            <td className="px-2 py-2.5 text-gray-500">{b.upazila}</td>
                                                            <td className="px-2 py-2.5 text-gray-500">{b.loginUser.email}</td>
                                                            <td className="px-2 py-2.5">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {!b.isMain && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleToggleBlock(b.id, b.isBlocked)}
                                                                                disabled={busyId === b.id}
                                                                                title={b.isBlocked ? 'Unblock' : 'Block'}
                                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                                            >
                                                                                {b.isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(b.id, b.name)}
                                                                                disabled={busyId === b.id}
                                                                                title="Delete"
                                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {busyId === b.id && <Loader2 size={14} className="animate-spin text-gray-400" />}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </main >
            <Footer />

            <CreateBranchModal
                providerId={modalProviderId}
                onClose={() => setModalProviderId(null)}
                onCreated={fetchProviders}
            />
        </>
    )
}