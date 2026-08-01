'use client'
















import { useEffect, useState, useCallback } from 'react'
import { setAccessToken, clearAccessToken } from '@/lib/auth-store'
import { AuthContext } from '@/lib/AuthContext'
import type { UserProfile } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'


async function silentRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) {
      clearAccessToken()
      return null
    }
    const data = await response.json()
    const token: string | undefined = data?.data?.accessToken ?? data?.accessToken
    if (token) {
      setAccessToken(token)
      return token
    }
    return null
  } catch {
    clearAccessToken()
    return null
  }
}

async function fetchMe(token: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
    if (!response.ok) return null
    const data = await response.json()
    return (data?.data as UserProfile) ?? null
  } catch {
    return null
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [ready, setReady] = useState(false)


  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {

    }
    clearAccessToken()
    setUser(null)
    window.location.href = '/auth/login'
  }, [])

  useEffect(() => {



    ;(async () => {
      const token = await silentRefresh()
      if (token) {
        const profile = await fetchMe(token)
        setUser(profile)
      }
      setReady(true)
    })()
  }, [])


  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, ready, logout }}>
      {children}
    </AuthContext.Provider>
  )
}