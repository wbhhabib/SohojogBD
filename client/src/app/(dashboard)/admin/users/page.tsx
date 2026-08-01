
'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/lib/api'
import type { UserProfile } from '@/lib/api'
import { Search, ChevronLeft, ChevronRight, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const PAGE_SIZE = 8

type RoleFilter   = 'all' | 'DONOR' | 'CREATOR' | 'ADMIN'
type StatusFilter = 'all' | 'active' | 'banned'

interface UsersApiResponse {
  success: boolean
  data: UserProfile[]
  message: string
  meta?: { total: number; page: number; limit: number; totalPages: number }
}

const roleColors: Record<string, string> = {
  ADMIN:   'bg-red-100 text-red-700',
  CREATOR: 'bg-emerald-100 text-emerald-700',
  DONOR:   'bg-blue-100 text-blue-700',
}

const avatarColors = [
  'bg-emerald-500', 'bg-violet-500', 'bg-blue-500',
  'bg-amber-500',   'bg-rose-500',   'bg-teal-500', 'bg-indigo-500',
]

export default function AdminUsersPage() {
  const [users,        setUsers]        = useState<UserProfile[]>([])
  const [total,        setTotal]        = useState(0)
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page,         setPage]         = useState(1)
  const [isLoading,    setIsLoading]    = useState(false)
  const [banTarget,    setBanTarget]    = useState<UserProfile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null)
  const [actionError,  setActionError]  = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchUsers = useCallback(() => {
    setIsLoading(true)
    const params = new URLSearchParams()
    params.set('page',  String(page))
    params.set('limit', String(PAGE_SIZE))
    if (search.trim())             params.set('search',   search.trim())
    if (roleFilter !== 'all')      params.set('role',     roleFilter)
    if (statusFilter === 'banned') params.set('isBanned', 'true')
    if (statusFilter === 'active') params.set('isBanned', 'false')

    api.get<UserProfile[]>(`/users?${params.toString()}`)
      .then((res) => {
        if (res.success) {
          setUsers(res.data)
          setTotal((res as unknown as UsersApiResponse).meta?.total ?? res.data.length)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch       = (val: string)       => { setSearch(val);       setPage(1) }
  const handleRoleFilter   = (val: RoleFilter)   => { setRoleFilter(val);   setPage(1) }
  const handleStatusFilter = (val: StatusFilter) => { setStatusFilter(val); setPage(1) }

  const handleToggleBan = async () => {
    if (!banTarget) return
    setActionError(null)
    try {
      const endpoint = banTarget.isBanned
        ? `/users/${banTarget.id}/unban`
        : `/users/${banTarget.id}/ban`
      const res = await api.patch<{ message: string }>(endpoint)
      if (!res.success) setActionError(res.message ?? null)
    } catch {
      setActionError('Something went wrong. Please try again.')
    } finally {
      setBanTarget(null)
      fetchUsers()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionError(null)
    try {
      const res = await api.delete<{ message: string }>(`/users/${deleteTarget.id}`)
      if (!res.success) setActionError(res.message ?? null)
    } catch {
      setActionError('Something went wrong. Please try again.')
    } finally {
      setDeleteTarget(null)
      fetchUsers()
    }
  }

  return (
    <ErrorBoundary>
      <DashboardLayout role="admin">
      <PageHeader title="Users" />

      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-4 text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          {(['all', 'DONOR', 'CREATOR', 'ADMIN'] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                roleFilter === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r === 'all' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value as StatusFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {users.length === 0 && !isLoading ? (
        <EmptyState title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, idx) => {
                    const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    const avatarBg = avatarColors[idx % avatarColors.length]
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>
                              <span className="text-xs font-bold text-white">{initials}</span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 whitespace-nowrap">{u.name}</p>
                              {u.isVerified && <span className="text-[10px] text-emerald-500 font-medium">Verified</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {u.role.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.isBanned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title={u.isBanned ? 'Unban' : 'Ban'}
                              onClick={() => setBanTarget(u)}
                              className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                            >
                              {u.isBanned ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                            </button>
                            <button
                              title="Delete"
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} users
              </p>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-emerald-600 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!banTarget}
        title={banTarget?.isBanned ? 'Unban User' : 'Ban User'}
        description={banTarget?.isBanned ? `Unban "${banTarget?.name}"? They will regain access.` : `Ban "${banTarget?.name}"? They will lose access.`}
        confirmLabel={banTarget?.isBanned ? 'Unban' : 'Ban'}
        variant={banTarget?.isBanned ? 'default' : 'danger'}
        onConfirm={handleToggleBan}
        onCancel={() => setBanTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        description={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
    </ErrorBoundary>
  )
}