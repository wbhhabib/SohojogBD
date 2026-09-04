'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Handshake, Menu, LogOut, LayoutDashboard, User, Heart, Sprout, Store, GraduationCap } from 'lucide-react'
import Button from '@/components/ui/button'
import MobileMenu from './MobileMenu'
import NotificationBell from '@/components/notification/NotificationBell'
import { useAuth } from '@/lib/AuthContext'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'BDCare', href: '/bdcare' },
  { label: 'PlantEnthusists', href: '/plants' },
  { label: 'GrowTogether', href: '/grow-together' },
  { label: 'Aponjon', href: '/aponjon' },
  { label: 'Vaccination', href: '/vaccination' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]


const DASHBOARD_ROUTES: Record<string, string> = {
  donor: '/dashboard/donor',
  creator: '/dashboard/creator',
  admin: '/dashboard/admin',
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()

  const role = user?.role?.toLowerCase() as 'donor' | 'creator' | 'admin' | undefined
  const dashboardHref = role ? DASHBOARD_ROUTES[role] ?? '/dashboard/donor' : '/dashboard/donor'

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Handshake size={22} className="text-emerald-600" />
              <span className="text-lg font-bold text-emerald-600">SohojogBD</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive
                      ? 'text-emerald-600 font-medium bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                      }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
            <div className="hidden md:flex items-center gap-3">
              {user ? (

                <div className="flex items-center gap-1">
                  <NotificationBell userId={user.id} />
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                          <div className="px-4 py-2.5 border-b border-gray-100">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {role}
                            </span>
                          </div>
                          <Link
                            href={dashboardHref}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard size={15} className="text-slate-400" />
                            Dashboard
                          </Link>
                          <Link
                            href={`/${role}/settings`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                          >
                            <User size={15} className="text-slate-400" />
                            Profile Settings
                          </Link>
                          <Link
                            href="/plants/my"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                          >
                            <Sprout size={15} className="text-slate-400" />
                            My Plant Listings
                          </Link>
                          <Link
                            href="/grow-together/pools/my"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                          >
                            <Store size={15} className="text-slate-400" />
                            My Wholesale Pools
                          </Link>
                          <Link
                            href="/grow-together/courses/my"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                          >
                            <GraduationCap size={15} className="text-slate-400" />
                            My Courses
                          </Link>
                          {role === 'creator' && (
                            <Link
                              href="/creator/campaigns/create"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
                            >
                              <Heart size={15} className="text-emerald-500" />
                              Start Campaign
                            </Link>
                          )}

                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={15} />
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (

                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">Start Campaign</Button>
                  </Link>
                </>
              )}
            </div>
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}