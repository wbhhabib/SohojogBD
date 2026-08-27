'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Heart, LayoutDashboard, LogOut, User } from 'lucide-react'
import Button from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Campaigns', href: '/campaigns' },
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

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const role = user?.role?.toLowerCase() as 'donor' | 'creator' | 'admin' | undefined
  const dashboardHref = role ? DASHBOARD_ROUTES[role] ?? '/dashboard/donor' : '/dashboard/donor'

  const handleLogout = async () => {
    onClose()
    await logout()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Heart size={20} className="text-emerald-600 fill-emerald-600" />
            <span className="text-lg font-bold text-emerald-600">SohojogBD</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {user && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-emerald-700 font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                {role}
              </span>
            </div>
          </div>
        )}
        <nav className="px-4 py-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`
                  block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'}
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-5 pt-2 space-y-2 border-t border-gray-100 mt-2">
          {user ? (

            <>
              <Link href={dashboardHref} onClick={onClose} className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors">
                <LayoutDashboard size={16} className="text-slate-400" />
                Dashboard
              </Link>

              <Link href={`/${role}/settings`} onClick={onClose} className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors">
                <User size={16} className="text-slate-400" />
                Profile Settings
              </Link>

              {role === 'creator' && (
                <Link href="/creator/campaigns/create" onClick={onClose} className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Heart size={16} className="text-emerald-500" />
                  Start Campaign
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (

            <>
              <Link href="/auth/login" onClick={onClose} className="block">
                <Button variant="outline" size="md" className="w-full">Login</Button>
              </Link>
              <Link href="/auth/register" onClick={onClose} className="block">
                <Button variant="primary" size="md" className="w-full">Start Campaign</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}