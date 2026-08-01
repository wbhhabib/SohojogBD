import React from 'react'
import Link from 'next/link'
import type { PlantListing } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import Badge from '@/components/ui/badge'
import { MapPin, Leaf, MessageCircle } from 'lucide-react'

interface PlantCardProps {
  listing: PlantListing
}

const TYPE_EMOJIS: Record<string, string> = {
  Flowering: '🌸', Fruit: '🍊', Vegetable: '🥬', Succulent: '🌵',
  Herb: '🌿', 'Tree Sapling': '🌳', Indoor: '🪴', Seeds: '🌱', Other: '🍃',
}

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  AVAILABLE: 'success',
  CLAIMED: 'warning',
  COMPLETED: 'info',
  CANCELLED: 'default',
}

export default function PlantCard({ listing }: PlantCardProps) {
  const emoji = TYPE_EMOJIS[listing.plantType] ?? '🌱'

  return (
    <Link
      href={`/plants/${listing.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {listing.images[0] ? (
          <img
            src={getImageUrl(listing.images[0])}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center">
            <span className="text-5xl opacity-70">{emoji}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
            <span>{emoji}</span>
            {listing.plantType}
          </span>
        </div>
        {listing.status !== 'AVAILABLE' && (
          <div className="absolute top-3 right-3">
            <Badge variant={statusVariant[listing.status]} className="capitalize shadow-md">
              {listing.status.toLowerCase()}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
          {listing.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{listing.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-emerald-50 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-emerald-500" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <Leaf size={12} className="text-emerald-500" />
            Qty {listing.quantity}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>by {listing.owner?.name ?? 'a member'}</span>
          {typeof listing._count?.claims === 'number' && (
            <span className="flex items-center gap-1">
              <MessageCircle size={11} />
              {listing._count.claims} request{listing._count.claims !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}