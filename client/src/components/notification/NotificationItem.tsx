
'use client'

import type { Notification } from '@/lib/api'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

const TYPE_ICONS: Record<string, string> = {
  donation:  '💰',
  milestone: '🎯',
  comment:   '💬',
  system:    '🔔',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { id, type, title, message, isRead, createdAt } = notification

  return (
    <button
      onClick={() => onRead(id)}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
        isRead ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-base mt-0.5">
        {TYPE_ICONS[type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${isRead ? 'font-normal text-slate-700' : 'font-medium text-slate-900'}`}>
            {title}
          </p>
          {!isRead && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{message}</p>
        <p className="text-xs text-slate-400 mt-1">{timeAgo(createdAt)}</p>
      </div>
    </button>
  )
}