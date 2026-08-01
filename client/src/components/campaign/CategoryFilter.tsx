
'use client'

import React from 'react'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (c: string) => void
}

export default function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  const all = ['All', ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {all.map((cat) => {
        const isActive = cat === activeCategory
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${isActive
                ? 'bg-emerald-600 text-white'
                : 'border border-gray-200 text-slate-600 hover:border-emerald-300 bg-white'}
            `}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}