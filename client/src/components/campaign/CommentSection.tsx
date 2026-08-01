'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import Button from '@/components/ui/button'
import EmptyState from '@/components/common/EmptyState'
import { MessageCircle } from 'lucide-react'

interface CommentRaw {
  id: string
  content: string
  createdAt: string
  campaignId: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

interface Comment {
  id: string
  userId: string
  userName: string
  campaignId: string
  content: string
  createdAt: string
}

function toComment(raw: CommentRaw): Comment {
  return {
    id: raw.id,
    content: raw.content,
    createdAt: raw.createdAt,
    campaignId: raw.campaignId,
    userId: raw.user.id,
    userName: raw.user.name,
  }
}

interface CommentSectionProps {
  campaignId: string
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
]

export default function CommentSection({ campaignId }: CommentSectionProps) {
  const [comments, setComments]   = useState<Comment[]>([])
  const [text, setText]           = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [postError, setPostError] = useState('')

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get<CommentRaw[]>(`/comments/campaign/${campaignId}`)
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : []
        setComments(raw.map(toComment))
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function handlePost() {
    if (!text.trim()) return
    setIsPosting(true)
    setPostError('')
    try {
      const res = await api.post<CommentRaw>(`/comments/campaign/${campaignId}`, {
        content: text.trim(),
      })
      if (res.success) {
        setComments((prev) => [toComment(res.data), ...prev])
        setText('')
      } else {
        setPostError(res.message ?? 'Could not post comment. Please try again.')
      }
    } catch {
      setPostError('Could not post comment. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-base font-semibold text-slate-900">
        Comments{' '}
        {!loading && (
          <span className="text-slate-400 font-normal text-sm">({comments.length})</span>
        )}
      </h3>

      <div className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment of support..."
          rows={3}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none w-full"
        />
        {postError && (
          <p className="text-xs text-red-500">{postError}</p>
        )}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            isLoading={isPosting}
            disabled={!text.trim()}
            onClick={handlePost}
          >
            Post Comment
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <EmptyState
          icon={<MessageCircle size={40} />}
          title="No comments yet"
          description="Be the first to leave a message of support!"
        />
      )}

      {!loading && comments.length > 0 && (
        <div className="flex flex-col gap-4">
          {comments.map((comment, i) => (
            <div key={comment.id} className="flex gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  COLORS[i % COLORS.length]
                }`}
              >
                {getInitials(comment.userName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">{comment.userName}</span>
                  <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}