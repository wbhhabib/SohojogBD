'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { getAdminProviders } from '@/lib/providerApi'
import type { CourseProvider, CourseProviderStatus } from '@/lib/providerApi'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

type StatusFilter = 'all' | CourseProviderStatus

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Suspended', value: 'SUSPENDED' },
]

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-red-100 text-red-700',
}

export default function AdminCourseProvidersPage() {
    const [providers, setProviders] = useState<CourseProvider[]>([])
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchProviders = useCallback(() => {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(PAGE_SIZE))
        if (statusFilter !== 'all') params.set('status', statusFilter)

        getAdminProviders(params.toString())
            .then((res) => {
                if (res.success) {
                    setProviders(res.data)
                    setTotal(res.meta?.total ?? res.data.length)
                }
            })
            .finally(() => setIsLoading(false))
    }, [statusFilter, page])

    useEffect(() => { fetchProviders() }, [fetchProviders])

    const handleStatus = (val: StatusFilter) => { setStatusFilter(val); setPage(1) }

    const filtered = search.trim()
        ? providers.filter((p) => p.institutionName.toLowerCase().includes(search.trim().toLowerCase()))
        : providers

    return (
        <ErrorBoundary>
            <DashboardLayout role="admin">
                <PageHeader title="Course Provider Verification" />

                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search institution name…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleStatus(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 && !isLoading ? (
                    <EmptyState title="No course providers found" description="Try adjusting your search or filters." />
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Institution</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Location</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/course-providers/${p.id}`} className="flex items-center gap-2.5 group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    {p.logo ? (
                                                        <img src={p.logo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                                                            {p.institutionName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">{p.institutionName}</span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{p.institutionType.replace(/_/g, ' ')}</td>
                                        <td className="px-4 py-3 text-gray-500">{[p.headquartersDistrict, p.headquartersDivision].filter(Boolean).join(', ')}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {p.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPage((pg) => Math.max(1, pg - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage((pg) => Math.min(totalPages, pg + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </DashboardLayout>
        </ErrorBoundary>
    )
}