"use client";

import { Bell, CheckCheck } from "lucide-react";
import type { Notification } from "@/lib/api";

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onRead: (id: string) => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationDropdown({
  notifications,
  onClose,
  onMarkAllRead,
  onRead,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
            <Bell className="h-8 w-8 opacity-40" />
            <span className="text-xs">No notifications yet</span>
          </div>
        ) : (
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRead(item.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                item.isRead ? "bg-white" : "bg-blue-50"
              }`}
            >
              <span
                data-unread={!item.isRead}
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 opacity-0 data-[unread=true]:opacity-100"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={`truncate text-sm ${
                      item.isRead
                        ? "font-medium text-slate-700"
                        : "font-semibold text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-400">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {item.message}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg py-1.5 text-xs font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
