
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { notificationApi } from '@/lib/api'
import type { Notification } from '@/lib/api'
import NotificationDropdown from '@/components/notification/NotificationDropdown'

interface NotificationBellProps {
  userId?: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen]                     = useState(false)
  const [notifications, setNotifications]   = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]       = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount()
      if (res.success) setUnreadCount((res.data as { count: number }).count)
    } catch {

    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll('limit=20')
      if (res.success) setNotifications(res.data as Notification[])
    } catch {

    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(() => {
      if (!document.hidden) fetchUnreadCount()
    }, 60_000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  const handleToggle = () => setOpen((prev) => !prev)
  const handleClose  = () => setOpen(false)

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {

    }
  }

  const handleRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {

    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onClose={handleClose}
          onMarkAllRead={handleMarkAllRead}
          onRead={handleRead}
        />
      )}
    </div>
  )
}