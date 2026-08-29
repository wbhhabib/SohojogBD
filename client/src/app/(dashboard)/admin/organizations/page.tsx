'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { orgApi } from '@/lib/api'
import type { Organization } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

type StatusFilter = 'all' | 'PENDING' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'EXPIRED'
type CategoryFilter = 'all' | 'REGISTERED' | 'TEAM'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Info Needed', value: 'MORE_INFO_REQUIRED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Suspended', value: 'SUSPENDED' },
]

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    MORE_INFO_REQUIRED: 'bg-orange-100 text-orange-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-gray-100 text-gray-600',
}

export default function AdminOrganizationsPage() {
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const fetchOrgs = useCallback(() => {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(PAGE_SIZE))
        if (search.trim()) params.set('search', search.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (categoryFilter !== 'all') params.set('category', categoryFilter)

        orgApi.adminGetAll(params.toString())
            .then((res) => {
                if (res.success) {
                    setOrgs(res.data)
                    setTotal(res.meta?.total ?? res.data.length)
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [search, statusFilter, categoryFilter, page])

    useEffect(() => { fetchOrgs() }, [fetchOrgs])

    const handleSearch = (val: string) => { setSearch(val); setPage(1) }
    const handleStatus = (val: StatusFilter) => { setStatusFilter(val); setPage(1) }
    const handleCategory = (val: CategoryFilter) => { setCategoryFilter(val); setPage(1) }

    return (
        <ErrorBoundary>
        <DashboardLayout role= "admin" >
        <PageHeader title="Organization Verification" />

            <div className="flex flex-col sm:flex-row gap-3 mb-5" >
                <div className="relative flex-1 max-w-sm" >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
    placeholder = "Search name, location…"
    value = { search }
    onChange = {(e) => handleSearch(e.target.value)
}
className = "w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    />
    </div>
    < div className = "flex gap-1 bg-gray-100 p-1 rounded-lg w-fit" >
        {(['all', 'REGISTERED', 'TEAM'] as CategoryFilter[]).map((c) => (
            <button
                                key= { c }
                                onClick = {() => handleCategory(c)}
            className = {`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${categoryFilter === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
            { c === 'all' ? 'All Types' : c === 'REGISTERED' ? 'Registered' : 'Team'}
            </button>
        ))}
</div>
    </div>

    < div className = "flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap" >
    {
        STATUS_TABS.map((tab) => (
            <button
                            key= { tab.value }
                            onClick = {() => handleStatus(tab.value)}
className = {`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
{ tab.label }
    </button>
                    ))}
</div>

{
    orgs.length === 0 && !isLoading ? (
        <EmptyState title= "No organizations found" description = "Try adjusting your search or filters." />
                ) : (
        <div className= "bg-white rounded-xl border border-gray-200 overflow-hidden" >
        <table className="w-full text-sm" >
            <thead className="bg-gray-50 border-b border-gray-200" >
                <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600" > Organization </th>
                    < th className = "text-left px-4 py-3 font-semibold text-gray-600" > Category </th>
                        < th className = "text-left px-4 py-3 font-semibold text-gray-600" > Location </th>
                            < th className = "text-left px-4 py-3 font-semibold text-gray-600" > Status </th>
                                < th className = "text-left px-4 py-3 font-semibold text-gray-600" > Submitted </th>
                                    </tr>
                                    </thead>
                                    < tbody className = "divide-y divide-gray-100" >
                                    {
                                        orgs.map((org) => (
                                            <tr key= { org.id } className = "hover:bg-gray-50 transition-colors" >
                                            <td className="px-4 py-3" >
                                        <Link href={`/admin/organizations/${org.id}`} className = "flex items-center gap-2.5 group" >
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0" >
                                                {
                                                    org.logo ? (
                                                        <img src= { getImageUrl(org.logo) } alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                            <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold" >
                                                            { org.name.charAt(0) }
                                                        </div>
                                                        )
}
</div>
    < span className = "font-medium text-gray-900 group-hover:text-sky-600 transition-colors" > { org.name } </span>
        </Link>
        </td>
        < td className = "px-4 py-3 text-gray-500" > { org.category === 'REGISTERED' ? 'Registered' : 'Team' } </td>
            < td className = "px-4 py-3 text-gray-500" > { [org.district, org.division].filter(Boolean).join(', ') } </td>
                < td className = "px-4 py-3" >
                    <span className={ `px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[org.status] ?? 'bg-gray-100 text-gray-600'}` }>
                    { org.status.replace(/_/g, ' ') }
                        </span>
                        </td>
                        < td className = "px-4 py-3 text-gray-400" > { new Date(org.createdAt).toLocaleDateString() } </td>
                            </tr>
                                ))}
</tbody>
    </table>
    </div>
                )}

{
    totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6" >
            <button
                            onClick={ () => setPage((p) => Math.max(1, p - 1)) }
    disabled = { page === 1
}
className = "p-2 rounded-lg border border-gray-200 disabled:opacity-40"
    >
    <ChevronLeft size={ 16 } />
        </button>
        < span className = "text-sm text-gray-500" > Page { page } of { totalPages } </span>
            < button
onClick = {() => setPage((p) => Math.min(totalPages, p + 1))}
disabled = { page === totalPages}
className = "p-2 rounded-lg border border-gray-200 disabled:opacity-40"
    >
    <ChevronRight size={ 16 } />
        </button>
        </div>
                )}
</DashboardLayout>
    </ErrorBoundary>
    )
}