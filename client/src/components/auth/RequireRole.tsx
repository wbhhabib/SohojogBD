'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

type AppRole = 'USER' | 'ADMIN'

interface RequireRoleProps {
    children: React.ReactNode
    roles?: AppRole[]
    redirectTo?: string
}


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