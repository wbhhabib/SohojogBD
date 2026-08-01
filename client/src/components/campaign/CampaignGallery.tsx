'use client'

import React, { useState } from 'react'
import { getImageUrl } from '@/lib/utils'

interface CampaignGalleryProps {
  images: string[]
}

export default function CampaignGallery({ images }: CampaignGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="h-80 w-full rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
        <span className="text-emerald-400 text-sm font-medium">No images available</span>
      </div>
    )
  }

  const thumbnails = images.slice(0, 4)

  return (
    <div className="flex flex-col gap-3">
<div className="h-80 w-full rounded-xl overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(images[activeIndex])}
          alt={`Campaign image ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
      </div>
{thumbnails.length > 1 && (
        <div className="flex gap-2">
          {thumbnails.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`
                w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all
                ${i === activeIndex ? 'ring-2 ring-emerald-500 ring-offset-1' : 'opacity-70 hover:opacity-100'}
              `}
            >
              <img src={getImageUrl(src)} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}