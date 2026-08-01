
'use client'

import { useState } from 'react'
import type { Notification } from '@/lib/api'
import NotificationItem from '@/components/notification/NotificationItem'
import EmptyState from '@/components/common/EmptyState'

interface NotificationListProps {
  notifications: Notification[]
}

type FilterTab = 'all' | 'unread' | 'donations' | 'system'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'unread',    label: 'Unread'    },
  { key: 'donations', label: 'Donations' },
  { key: 'system',    label: 'System'    },
]

export default function NotificationList({ notifications: initial }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initial)
  const [activeTab, setActiveTab]         = useState<FilterTab>('all')

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all')       return true
    if (activeTab === 'unread')    return !n.isRead
    if (activeTab === 'donations') return n.type === 'donation'
    if (activeTab === 'system')    return n.type === 'system'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/60">
        {TABS.map((tab) => {
          const count =
            tab.key === 'unread'
              ? notifications.filter((n) => !n.isRead).length
              : tab.key === 'donations'
              ? notifications.filter((n) => n.type === 'donation').length
              : tab.key === 'system'
              ? notifications.filter((n) => n.type === 'system').length
              : notifications.length

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-slate-900 border border-gray-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              {tab.label}
              <span className={`text-xs ${activeTab === tab.key ? 'text-slate-500' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No notifications"
              description={
                activeTab === 'unread'
                  ? 'You have no unread notifications.'
                  : `No ${activeTab} notifications found.`
              }
            />
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={handleRead} />
          ))
        )}
      </div>
    </div>
  )
}