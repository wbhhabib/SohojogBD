
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Megaphone,
  HandCoins,
  BarChart2,
  Settings,
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Handshake,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react'

interface SidebarUser {
  name: string
  avatar: string | null
}

interface SidebarProps {
  role: 'creator' | 'donor' | 'admin'
  user?: SidebarUser | null
}

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
}

// donor/creator role আর আলাদা account-type না — তাই দুটো nav-ই এখন একই,
// combined list (যেকোনো ইউজার campaign-ও চালাতে পারে, donate-ও করতে পারে)।
// GrowTogether/Plants/BDCare-এর মতো বাকি module গুলোর নিজস্ব পুরো পেজ-শেল
// (Navbar সহ) আছে, dashboard shell-এর ভেতরে জোর করে ঢোকালে ক্লিক করলেই পুরো
// Sidebar হারিয়ে যায় — সেটা bad UX, তাই এখানে রাখা হচ্ছে না।
const userNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Campaigns', href: '/creator/campaigns', icon: Megaphone },
  { label: 'Donations Received', href: '/creator/donations', icon: HandCoins },
  { label: 'My Donations', href: '/donor/donations', icon: HandCoins },
  { label: 'Supported Campaigns', href: '/donor/supported-campaigns', icon: BookOpen },
  { label: 'Analytics', href: '/creator/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/donor/settings', icon: Settings },
]

const creatorNav: NavItem[] = userNav
const donorNav: NavItem[] = userNav

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { label: 'Organizations', href: '/admin/organizations', icon: Handshake },
  { label: 'Course Providers', href: '/admin/course-providers', icon: GraduationCap },
  { label: 'Verifications', href: '/admin/verifications', icon: ShieldCheck },
  { label: 'Donations', href: '/admin/donations', icon: HandCoins },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

const navMap = { creator: creatorNav, donor: donorNav, admin: adminNav }

const userMap = {
  creator: { name: 'Fatema Begum', role: 'Campaign Creator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema' },
  donor: { name: 'Nusrat Jahan', role: 'Generous Donor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat' },
  admin: { name: 'Rahim Uddin Ahmed', role: 'Platform Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim' },
}

const roleTagColors = {
  creator: 'bg-emerald-100 text-emerald-700',
  donor: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
}

const roleAccentGroups = {
  creator: { text: 'text-emerald-600', activeBg: 'bg-emerald-50', activeBorder: 'border-emerald-500', activeText: 'text-emerald-700', hoverBg: 'hover:bg-emerald-50/60' },
  donor: { text: 'text-amber-600', activeBg: 'bg-amber-50', activeBorder: 'border-amber-500', activeText: 'text-amber-700', hoverBg: 'hover:bg-amber-50/60' },
  admin: { text: 'text-rose-600', activeBg: 'bg-rose-50', activeBorder: 'border-rose-500', activeText: 'text-rose-700', hoverBg: 'hover:bg-rose-50/60' },
}

const OVERVIEW_HREFS = ['/dashboard', '/dashboard/creator', '/dashboard/donor', '/dashboard/admin']

export default function Sidebar({ role, user: userProp }: SidebarProps) {
  const pathname = usePathname()
  const navItems = navMap[role]
  const fallback = userMap[role]
  const displayUser = {
    name: userProp?.name ?? fallback.name,
    avatar: userProp?.avatar ?? fallback.avatar,
    role: fallback.role,
  }
  const accent = roleAccentGroups[role]

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-stone-100 shadow-[2px_0_20px_rgba(0,0,0,0.04)]">
      <div className="px-4 pt-5 pb-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${roleTagColors[role]}`}>
          <Sparkles size={10} />
          {role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (!OVERVIEW_HREFS.includes(item.href) &&
              pathname.startsWith(item.href + '/'))
          const exactActive = pathname === item.href
          const active = isActive || exactActive

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                border-l-[3px] transition-all duration-150
                ${active
                  ? `${accent.activeBg} ${accent.activeText} ${accent.activeBorder}`
                  : `text-stone-500 hover:text-stone-800 border-transparent ${accent.hoverBg}`}
              `}
            >
              <Icon
                size={17}
                className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${active ? accent.activeText : 'text-stone-400'}`}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight size={13} className={`${accent.activeText} opacity-60`} />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-100/60">
        <p className="text-[11px] text-stone-500 leading-relaxed">
          <span className="text-emerald-600 font-semibold">Every taka counts.</span>{' '}
          Together we build a better tomorrow.
        </p>
      </div>
      <div className="px-4 py-4 border-t border-stone-100">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="w-9 h-9 rounded-full bg-stone-100 border-2 border-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-800 truncate leading-tight">{displayUser.name}</p>
            <p className="text-[11px] text-stone-400 truncate">{displayUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}