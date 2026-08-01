'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { api } from '@/lib/api'
import Link from 'next/link'
import { CheckCircle, XCircle, ShieldAlert, Loader2, RefreshCw } from 'lucide-react'

type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED'
type FilterTab    = 'all' | ReportStatus

interface ApiReport {
  id:        string
  reason:    string
  status:    ReportStatus
  note:      string | null
  createdAt: string
  reporter:  { id: string; name: string; email: string }
  campaign:  { id: string; title: string; slug: string; status: string }
}

const reasonLabels: Record<string, string> = {
  FAKE_CAMPAIGN:  'Fake Campaign',
  SPAM:           'Spam',
  MISLEADING:     'Misleading',
  INAPPROPRIATE:  'Inappropriate',
}

const reasonColors: Record<string, string> = {
  FAKE_CAMPAIGN:  'bg-red-100 text-red-700 border-red-200',
  SPAM:           'bg-amber-100 text-amber-700 border-amber-200',
  MISLEADING:     'bg-orange-100 text-orange-700 border-orange-200',
  INAPPROPRIATE:  'bg-purple-100 text-purple-700 border-purple-200',
}

const statusColors: Record<ReportStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  REVIEWED:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  DISMISSED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const statusLabels: Record<ReportStatus, string> = {
  PENDING:   'Pending',
  REVIEWED:  'Reviewed',
  DISMISSED: 'Dismissed',
}

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'PENDING',   label: 'Pending'   },
  { key: 'REVIEWED',  label: 'Reviewed'  },
  { key: 'DISMISSED', label: 'Dismissed' },
]

export default function AdminReportsPage() {
  const [reports,       setReports]       = useState<ApiReport[]>([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState<FilterTab>('all')
  const [suspendTarget, setSuspendTarget] = useState<ApiReport | null>(null)
  const [suspending,    setSuspending]    = useState(false)
  const [suspendError,  setSuspendError]  = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Always fetch ALL reports so counts stay accurate across tabs
  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiReport[]>('/reports/admin?limit=200')
      if (res.success && res.data) {
        // Backend returns data wrapped in ApiResponse — handle both array and paginated shapes
        const list = Array.isArray(res.data) ? res.data : (res.data as any)
        setReports(list)
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const counts = {
    all:       reports.length,
    PENDING:   reports.filter((r) => r.status === 'PENDING').length,
    REVIEWED:  reports.filter((r) => r.status === 'REVIEWED').length,
    DISMISSED: reports.filter((r) => r.status === 'DISMISSED').length,
  }

  const markAs = async (id: string, status: ReportStatus) => {
    setActionLoading(id + status)
    try {
      const res = await api.patch(`/reports/${id}`, { status })
      if (res.success) {
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
      }
    } catch {
      // silently ignore
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspendConfirm = async () => {
    if (!suspendTarget) return
    setSuspendError('')
    setSuspending(true)
    try {
      const res = await api.patch(`/campaigns/admin/${suspendTarget.campaign.id}`, {
        status: 'SUSPENDED',
      })
      if (res.success) {
        await markAs(suspendTarget.id, 'REVIEWED')
        setSuspendTarget(null)
      } else {
        setSuspendError(res.message ?? 'Failed to suspend campaign.')
      }
    } catch {
      setSuspendError('Something went wrong. Please try again.')
    } finally {
      setSuspending(false)
    }
  }

  // Client-side filter — no re-fetch on tab change
  const filtered =
    activeTab === 'all' ? reports : reports.filter((r) => r.status === activeTab)

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Reports & Abuse"
        description="Review and manage reported campaigns from users."
      />
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-white border border-b-white border-gray-200 text-emerald-700 -mb-px'
                : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
        <button
          onClick={fetchReports}
          className="ml-auto mb-1 p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="mt-0 bg-white border border-gray-200 rounded-b-xl rounded-tr-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No reports found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Reporter</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Campaign</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Reason</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                      {report.reporter.name}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <Link
                        href={`/campaigns/${report.campaign.slug}`}
                        className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium line-clamp-1"
                      >
                        {report.campaign.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          reasonColors[report.reason] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {reasonLabels[report.reason] ?? report.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString('en-GB', {
                        day:   '2-digit',
                        month: 'short',
                        year:  'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[report.status]}`}
                      >
                        {statusLabels[report.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {report.status !== 'REVIEWED' && (
                          <button
                            onClick={() => markAs(report.id, 'REVIEWED')}
                            disabled={actionLoading === report.id + 'REVIEWED'}
                            className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {actionLoading === report.id + 'REVIEWED'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle className="w-3.5 h-3.5" />}
                            Review
                          </button>
                        )}
                        {report.status !== 'DISMISSED' && (
                          <button
                            onClick={() => markAs(report.id, 'DISMISSED')}
                            disabled={actionLoading === report.id + 'DISMISSED'}
                            className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-slate-600 border border-gray-200 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {actionLoading === report.id + 'DISMISSED'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <XCircle className="w-3.5 h-3.5" />}
                            Dismiss
                          </button>
                        )}
                        <button
                          onClick={() => { setSuspendError(''); setSuspendTarget(report) }}
                          className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {suspendTarget && (
        <ConfirmDialog
          open={!!suspendTarget}
          onClose={() => { if (!suspending) setSuspendTarget(null) }}
          onConfirm={handleSuspendConfirm}
          title="Suspend Campaign"
          description={
            suspendError
              ? suspendError
              : `Are you sure you want to suspend "${suspendTarget.campaign.title}"? This will make the campaign inaccessible to donors.`
          }
          confirmLabel={suspending ? 'Suspending…' : 'Suspend Campaign'}
          variant="danger"
        />
      )}
    </DashboardLayout>
  )
}