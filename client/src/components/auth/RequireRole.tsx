'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

type AppRole = 'USER' | 'ADMIN'

interface RequireRoleProps {
    children: React.ReactNode
    /**
     * যেসব role-এর এই সাবট্রি-তে ঢোকার অনুমতি আছে। বাদ দিলে শুধু
     * "লগইন করা থাকতে হবে" চেক করা হয়, নির্দিষ্ট role লাগে না।
     */
    roles?: AppRole[]
    /** অথোরাইজড না হলে কোথায় পাঠানো হবে (ডিফল্ট: লগইন না থাকলে /auth/login, role না মিললে /) */
    redirectTo?: string
}

/**
 * ব্যাকএন্ড API সবসময়ই আসল গেটকিপার (authenticate + authorize middleware) —
 * এই কম্পোনেন্ট সেটা প্রতিস্থাপন করে না, বরং ফ্রন্টএন্ডে "defense in depth"
 * হিসেবে যোগ হয়:
 *   - একজন সাধারণ ইউজার সরাসরি /admin/... URL টাইপ করলে অ্যাডমিন UI/শেল
 *     রেন্ডার হয়ে ভাঙা/ফাঁকা ড্যাশবোর্ড দেখানোর বদলে সাথে সাথে রিডাইরেক্ট হয়
 *   - লগইন ছাড়া কেউ dashboard route-এ গেলে সাথে সাথে লগইন পেজে পাঠানো হয়
 *
 * session resolve হওয়ার আগে (ready === false) কোনো রিডাইরেক্ট করা হয় না,
 * যাতে পেজ রিফ্রেশে বৈধ লগইন করা ইউজারকেও ভুলবশত লগআউট/রিডাইরেক্ট না করা হয়।
 */
export default function RequireRole({ children, roles, redirectTo }: RequireRoleProps) {
    const { user, ready } = useAuth()
    const router = useRouter()

    const isAuthorized =
        !!user && (!roles || roles.length === 0 || roles.includes(user.role as AppRole))

    useEffect(() => {
        if (!ready) return

        if (!user) {
            router.replace(redirectTo ?? '/auth/login')
            return
        }

        if (!isAuthorized) {
            router.replace(redirectTo ?? '/')
        }
    }, [ready, user, isAuthorized, redirectTo, router])

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user || !isAuthorized) return null

    return <>{children}</>
}