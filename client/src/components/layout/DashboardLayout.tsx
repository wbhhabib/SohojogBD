
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, ChevronRight, LogOut, User, Home, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import NotificationBell from '@/components/notification/NotificationBell'
import Dropdown from '@/components/ui/dropdown'
import { authApi, userApi } from '@/lib/api'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'creator' | 'donor' | 'admin'
}

interface StoredUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
}

function buildBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((seg) =>
    seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const roleHeaderAccent = {
  creator: {
    ring: 'ring-emerald-400',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    greeting: 'text-emerald-600',
  },
  donor: {
    ring: 'ring-amber-400',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    greeting: 'text-amber-600',
  },
  admin: {
    ring: 'ring-rose-400',
    dot: 'bg-rose-400',
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
    greeting: 'text-rose-600',
  },
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(null)
  const breadcrumbs = buildBreadcrumbs(pathname)
  const accent = roleHeaderAccent[role]

  useEffect(() => {
    userApi.getMe()
      .then((res) => {
        if (res.success) setUser(res.data)
      })
      .catch(() => {

      })
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex">
<div className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar role={role} user={user} />
      </div>
{sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 flex flex-col bg-white h-full z-50 shadow-2xl">
            <Sidebar role={role} user={user} />
          </div>
        </div>
      )}
<div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
<header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-stone-100 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between px-4 sm:px-6 h-[60px]">
<div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={19} />
              </button>
<nav className="hidden sm:flex items-center gap-1.5 text-sm">
                <span className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer">
                  <Home size={14} />
                </span>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight size={13} className="text-stone-300" />
                    <span
                      className={
                        i === breadcrumbs.length - 1
                          ? 'text-stone-800 font-semibold'
                          : 'text-stone-400 font-medium'
                      }
                    >
                      {crumb}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            </div>
<div className="flex items-center gap-2 sm:gap-3">
{user && (
                <span className="hidden md:block text-sm text-stone-400 font-medium">
                  Hello,{' '}
                  <span className={`font-semibold ${accent.greeting}`}>
                    {user.name.split(' ')[0]}
                  </span>
                </span>
              )}
<div className="relative">
                <NotificationBell userId={user?.id ?? ''} />
              </div>
<Dropdown
                trigger={
                  user?.avatar ? (
                    <div className="relative cursor-pointer">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={`w-9 h-9 rounded-full bg-stone-100 border-2 border-white shadow-sm hover:ring-2 ${accent.ring} transition-all`}
                      />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${accent.dot} rounded-full border-2 border-white`} />
                    </div>
                  ) : (
                    <div className={`relative w-9 h-9 rounded-full bg-stone-100 border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:ring-2 ${accent.ring} transition-all text-xs font-bold text-stone-600`}>
                      {user ? getInitials(user.name) : <User size={15} />}
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${accent.dot} rounded-full border-2 border-white`} />
                    </div>
                  )
                }
                items={[
                  {
                    label: user?.name ?? 'Profile',
                    value: 'profile',
                    onClick: () => router.push(`/${role}/settings`),
                  },
                  {
                    label: 'Logout',
                    value: 'logout',
                    danger: true,
                    onClick: handleLogout,
                  },
                ]}
                align="right"
              />
            </div>
          </div>
        </header>
<main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
<footer className="px-6 py-3 border-t border-stone-100 bg-white/50">
          <p className="text-[11px] text-stone-400 text-center">
            FundRaise Platform · Made with{' '}
            <span className="text-rose-400">♥</span> for Bangladesh
          </p>
        </footer>
      </div>
    </div>
  )
}