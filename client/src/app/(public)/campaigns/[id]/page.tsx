'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignDetailClient from '@/components/campaign/CampaignDetailClient'
import { campaignApi } from '@/lib/api'
import type { Campaign } from '@/lib/api'


interface ApiComment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatar: string | null }
}

export default function CampaignDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const slug = params.id as string

  const [campaign, setCampaign]   = useState<Campaign | null>(null)
  const [comments, setComments]   = useState<ApiComment[]>([])
  const [loading, setLoading]     = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  const fetchData = useCallback(async () => {
    try {

      const res = await campaignApi.getBySlug(slug)

      if (!res.success || !res.data) {
        setNotFoundState(true)
        return
      }

      const data = res.data as Campaign & { comments?: ApiComment[] }
      setCampaign(data)


      if (data.comments && Array.isArray(data.comments)) {
        setComments(data.comments)
      }
    } catch {
      setNotFoundState(true)
    } finally {
      setLoading(false)
    }
  }, [slug])


  useEffect(() => { fetchData() }, [fetchData])



  useEffect(() => {
    if (searchParams.get('donated') === '1') {
      setLoading(true)
      fetchData()
    }
  }, [searchParams, fetchData])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  )

  if (notFoundState) return notFound()
  if (!campaign) return null

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <CampaignDetailClient
          campaign={campaign}
          comments={comments}
        />
      </main>
      <Footer />
    </>
  )
}