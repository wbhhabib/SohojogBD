'use client'






import { createContext, useContext } from 'react'
import type { UserProfile } from '@/lib/api'

export interface AuthContextValue {
  user: UserProfile | null
  ready: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  logout: async () => {},
})

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}