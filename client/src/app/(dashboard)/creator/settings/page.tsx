'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatorSettingsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/donor/settings')
  }, [router])
  return null
}