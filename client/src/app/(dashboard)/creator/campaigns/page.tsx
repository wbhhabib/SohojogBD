'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Pause, Play, Loader2, Bell, X, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import ProgressBar from '@/components/campaign/ProgressBar'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { campaignApi } from '@/lib/api'
import { formatBDT, getImageUrl } from '@/lib/utils'

interface Campaign {
  id: string
  title: string
  slug: string
  category: string
  status: string
  images: string[]
  goalAmount: number
  raisedAmount: number
  donorCount: number
  deadline: string
}

type StatusFilter = 'all' | 'active' | 'draft' | 'paused' | 'completed'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Draft',     value: 'draft'     },
  { label: 'Paused',    value: 'paused'    },
  { label: 'Completed', value: 'completed' },
]

const statusColors: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  draft:     'bg-gray-100 text-gray-600',
  paused:    'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
}

const gradients = [
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-cyan-500',
  'from-rose-400 to-pink-500',
]

export default function CreatorCampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns]       = useState<Campaign[]>([])
  const [activeTab, setActiveTab]       = useState<StatusFilter>('all')
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const [togglingId, setTogglingId]     = useState<string | null>(null)
  const [loading, setLoading]           = useState(true)
  const [actionError, setActionError]   = useState('')

  // Post Update modal state
  const [updateTarget, setUpdateTarget]   = useState<Campaign | null>(null)
  const [updateTitle, setUpdateTitle]     = useState('')
  const [updateContent, setUpdateContent] = useState('')
  const [isPosting, setIsPosting]         = useState(false)
  const [postError, setPostError]         = useState('')
  const [postSuccess, setPostSuccess]     = useState(false)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await campaignApi.getMy('limit=100')
      if (res.success) setCampaigns(res.data as Campaign[])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status.toLowerCase() === 'active' ? 'PAUSED' : 'ACTIVE'
    setTogglingId(campaign.id)
    setActionError('')
    try {
      const res = await campaignApi.update(campaign.id, { status: newStatus })
      if (res.success) {
        // Update local state only on confirmed server success
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaign.id ? { ...c, status: newStatus.toLowerCase() } : c
          )
        )
      } else {
        setActionError(res.message ?? 'Failed to update campaign status. Please try again.')
      }
    } catch {
      setActionError('Network error. Please check your connection and try again.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionError('')
    try {
      const res = await campaignApi.delete(deleteTarget.id)
      if (res.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      } else {
        setActionError(res.message ?? 'Failed to delete campaign. Only DRAFT campaigns can be deleted.')
      }
    } catch {
      setActionError('Network error. Please check your connection and try again.')
    } finally {
      setDeleteTarget(null)
    }
  }

  const openUpdateModal = (campaign: Campaign) => {
    setUpdateTarget(campaign)
    setUpdateTitle('')
    setUpdateContent('')
    setPostError('')
    setPostSuccess(false)
  }

  const closeUpdateModal = () => {
    setUpdateTarget(null)
    setUpdateTitle('')
    setUpdateContent('')
    setPostError('')
    setPostSuccess(false)
  }

  const handlePostUpdate = async () => {
    if (!updateTarget || !updateTitle.trim() || !updateContent.trim()) return
    setIsPosting(true)
    setPostError('')
    try {
      const res = await campaignApi.addUpdate(updateTarget.id, {
        title: updateTitle.trim(),
        content: updateContent.trim(),
      })
      if (res.success) {
        setPostSuccess(true)
        setTimeout(() => closeUpdateModal(), 1500)
      } else {
        setPostError(res.message ?? 'Failed to post update. Try again.')
      }
    } catch {
      setPostError('Failed to post update. Try again.')
    } finally {
      setIsPosting(false)
    }
  }

  const filtered = activeTab === 'all'
    ? campaigns
    : campaigns.filter((c) => c.status.toLowerCase() === activeTab)

  const tabCounts: Record<StatusFilter, number> = {
    all:       campaigns.length,
    active:    campaigns.filter((c) => c.status.toLowerCase() === 'active').length,
    draft:     campaigns.filter((c) => c.status.toLowerCase() === 'draft').length,
    paused:    campaigns.filter((c) => c.status.toLowerCase() === 'paused').length,
    completed: campaigns.filter((c) => c.status.toLowerCase() === 'completed').length,
  }

  return (
    <DashboardLayout role="creator">
      <PageHeader
        title="My Campaigns"
        action={
          <Link
            href="/creator/campaigns/create"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New
          </Link>
        }
      />

      {/* Action error banner */}
      {actionError && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{actionError}</p>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.value ? 'text-emerald-600' : 'text-slate-400'}`}>
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No campaigns found"
          description={activeTab === 'all' ? "You haven't created any campaigns yet." : `No ${activeTab} campaigns.`}
          actionLabel="Create Campaign"
          onAction={() => router.push('/creator/campaigns/create')}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Goal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Raised</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Donors</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden xl:table-cell">Deadline</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, idx) => {
                  const pct       = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
                  const gradient  = gradients[idx % gradients.length]
                  const status    = c.status.toLowerCase()
                  const canToggle = status === 'active' || status === 'paused'
                  const canUpdate = status === 'active' || status === 'paused' || status === 'completed'
                  // Only DRAFT campaigns can be deleted by creator
                  const canDelete = status === 'draft'

                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {c.images?.[0] ? (
                            <img
                              src={getImageUrl(c.images[0])}
                              alt={c.title}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} shrink-0`} />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[160px]">{c.title}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{c.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatBDT(c.goalAmount)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 hidden md:table-cell">{formatBDT(c.raisedAmount)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="w-28">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>{pct}%</span>
                          </div>
                          <ProgressBar raised={c.raisedAmount} goal={c.goalAmount} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{c.donorCount}</td>
                      <td className="px-4 py-3 text-slate-400 hidden xl:table-cell">
                        {new Date(c.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <button
                              onClick={() => openUpdateModal(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Post Update"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/creator/campaigns/${c.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {canToggle && (
                            <button
                              onClick={() => handleToggleStatus(c)}
                              disabled={togglingId === c.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                              title={status === 'active' ? 'Pause' : 'Activate'}
                            >
                              {togglingId === c.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : status === 'active'
                                  ? <Pause className="w-4 h-4" />
                                  : <Play className="w-4 h-4" />
                              }
                            </button>
                          )}
                          {canDelete ? (
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 rounded-lg text-slate-200 cursor-not-allowed"
                              title="Only DRAFT campaigns can be deleted"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Update Modal */}
      {updateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Post Campaign Update</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[320px]">{updateTarget.title}</p>
              </div>
              <button
                onClick={closeUpdateModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  placeholder="e.g. We reached 50% of our goal!"
                  maxLength={120}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder="Share progress, milestones, or news with your donors..."
                  rows={5}
                  maxLength={2000}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-400 text-right mt-1">{updateContent.length}/2000</p>
              </div>

              {postError && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{postError}</p>
              )}

              {postSuccess && (
                <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  ✓ Update posted successfully! Donors have been notified.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostUpdate}
                disabled={isPosting || !updateTitle.trim() || !updateContent.trim() || postSuccess}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isPosting ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}