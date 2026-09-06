
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, ChevronRight, Home } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { userApi } from '@/lib/api'

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

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(null)
  const breadcrumbs = buildBreadcrumbs(pathname)

  useEffect(() => {
    userApi.getMe()
      .then((res) => {
        if (res.success) setUser(res.data)
      })
      .catch(() => {

      })
  }, [])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#faf9f7] flex">
        <div className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 z-30">
          <Sidebar role={role} user={user} />
        </div>
        {sidebarOpen && (
          <div className="lg:hidden fixed left-0 top-16 bottom-0 right-0 z-40 flex">
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
          <header className="sticky top-16 z-20 bg-white/90 backdrop-blur-sm border-b border-stone-100 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 px-4 sm:px-6 h-11">
              <button
                className="lg:hidden p-2 -ml-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
              <nav className="flex items-center gap-1.5 text-sm">
                <span className="text-stone-300">
                  <Home size={13} />
                </span>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight size={12} className="text-stone-300" />
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
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <footer className="px-6 py-3 border-t border-stone-100 bg-white/50">
            <p className="text-[11px] text-stone-400 text-center">
              SohojogBD · Made with{' '}
              <span className="text-rose-400">♥</span> for Bangladesh
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}