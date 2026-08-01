'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

import EditCampaignClient from '@/components/campaign/EditCampaignClient'
import { campaignApi } from '@/lib/api'
import type { Campaign } from '@/lib/api'

export default function EditCampaignPage() {
  const params = useParams()
  // [id] is the campaign's database ID (not slug)
  const campaignId = params.id as string

  const [campaign, setCampaign]           = useState<Campaign | null>(null)
  const [loading, setLoading]             = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        // Use creator-specific endpoint that works for all statuses (DRAFT, PAUSED, etc.)
        const res = await campaignApi.getMyById(campaignId)

        if (res.success && res.data) {
          setCampaign(res.data)
        } else {
          setNotFoundState(true)
        }
      } catch {
        setNotFoundState(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (notFoundState || !campaign) return notFound()

  return <EditCampaignClient campaign={campaign} />
}