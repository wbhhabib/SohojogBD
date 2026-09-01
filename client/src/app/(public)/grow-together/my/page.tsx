'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PoolGrid from '@/components/growtogether/PoolGrid'
import { useAuth } from '@/lib/AuthContext'
import { getMyPools, getJoinedPools } from '@/lib/growTogetherApi'
import type { WholesalePool } from '@/lib/growTogetherApi'
import { PackagePlus, ShoppingBag } from 'lucide-react'

type TabKey = 'mine' | 'joined'

export default function MyPoolsPage() {
    const router = useRouter()
    const { user, ready } = useAuth()
    const [tab, setTab] = useState<TabKey>('mine')
    const [myPools, setMyPools] = useState<WholesalePool[]>([])
    const [joinedPools, setJoinedPools] = useState<WholesalePool[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAll = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const [mine, joined] = await Promise.all([getMyPools(user.id), getJoinedPools(user.id)])
        if (mine.success) setMyPools(mine.data)
        if (joined.success) setJoinedPools(joined.data)
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (ready && !user) {
            router.push('/auth/login?next=/grow-together/my')
        }
    }, [ready, user, router])

    useEffect(() => { fetchAll() }, [fetchAll])

    if (!ready || !user) return null

    const activeList = tab === 'mine' ? myPools : joinedPools

    return (
        <>
            <Navbar />
            <main className="min-h-screen py-10" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f9fafb 120px)' }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
                                <ShoppingBag size={18} className="text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900"
                                    style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                    My Pools &amp; Interests
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Track pools you&apos;ve started and ones you&apos;ve joined.
                                </p>
                            </div>
                        </div>

                        <a href="/grow-together/create"
                            className="inline-flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
                            style={{ background: 'linear-gradient(135deg, #d97706, #f97316)' }}
                        >
                            <PackagePlus size={15} />
                            Start a Pool
                        </a>
                    </div>

                    <div className="flex gap-1.5 mb-6 rounded-xl p-1 w-fit bg-amber-50">
                        {([
                            { key: 'mine', label: `Started by me (${myPools.length})` },
                            { key: 'joined', label: `I've joined (${joinedPools.length})` },
                        ] as { key: TabKey; label: string }[]).map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key
                                    ? 'bg-white text-amber-700 shadow-sm'
                                    : 'text-amber-500/70 hover:text-amber-600'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <PoolGrid pools={activeList} loading={loading} />
                </div>
            </main >
            <Footer />
        </>
    )
}