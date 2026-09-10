'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Skeleton from '@/components/ui/skeleton'
import { getPublicProviderBySlug, INSTITUTION_TYPE_LABEL } from '@/lib/providerApi'
import type { PublicProviderDetail } from '@/lib/providerApi'
import { getImageUrl } from '@/lib/utils'
import { MapPin, Globe, Facebook, Building2, BadgeCheck, GraduationCap } from 'lucide-react'

export default function ProviderProfilePage() {
    const params = useParams<{ slug: string }>()
    const [provider, setProvider] = useState<PublicProviderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        getPublicProviderBySlug(params.slug).then((res) => {
            if (res.success && res.data) setProvider(res.data)
            else setNotFound(true)
            setLoading(false)
        })
    }, [params.slug])

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen py-16 max-w-3xl mx-auto px-4">
                    <Skeleton className="h-40 w-full rounded-2xl mb-6" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </main>
                <Footer />
            </>
        )
    }

    if (notFound || !provider) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen py-24 text-center text-gray-400 text-sm">Organization not found.</main>
                <Footer />
            </>
        )
    }

    const allCourses = provider.branches.flatMap((b) =>
        b.courses.map((c) => ({ ...c, branchName: b.name }))
    )

    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #f9fafb 160px)' }}>
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden mb-6">
                        <div className="h-24 bg-gradient-to-br from-emerald-500 to-teal-600" />
                        <div className="px-6 pb-6">
                            <div className="flex items-end gap-4 -mt-10 mb-3">
                                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-md shrink-0">
                                    {provider.logo ? (
                                        <img src={getImageUrl(provider.logo)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-2xl">
                                            {provider.institutionName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-emerald-500 mb-1">
                                    <BadgeCheck size={12} /> Verified
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mb-1">{provider.institutionName}</h1>
                            <p className="text-sm text-emerald-600 font-medium mb-3">{INSTITUTION_TYPE_LABEL[provider.institutionType]}</p>
                            <p className="text-sm text-gray-600 mb-4">{provider.description}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {provider.headquartersAddress}</span>
                                {provider.website && (
                                    <a href={provider.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-600">
                                        <Globe size={14} className="text-emerald-500" /> Website
                                    </a>
                                )}
                                {provider.facebookPage && (
                                    <a href={provider.facebookPage} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-600">
                                        <Facebook size={14} className="text-emerald-500" /> Facebook
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 mb-6">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Building2 size={15} className="text-emerald-600" /> Branches ({provider.branches.length})
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {provider.branches.map((b) => (
                                <div key={b.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                                    <p className="font-medium text-gray-800">{b.name}{b.isMain && <span className="ml-1.5 text-[10px] text-emerald-600 font-semibold">MAIN</span>}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{b.upazila}, {b.district}, {b.division}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <GraduationCap size={15} className="text-emerald-600" /> Open Courses ({allCourses.length})
                        </h2>
                        {allCourses.length === 0 ? (
                            <p className="text-sm text-gray-400">No open courses right now.</p>
                        ) : (
                            <div className="space-y-2">
                                {allCourses.map((c) => (
                                    <a key={c.id} href={`/grow-together/courses/${c.slug}`}
                                        className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3 text-sm hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{c.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{c.skillCategory} · {c.branchName}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 shrink-0">{c.duration}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}