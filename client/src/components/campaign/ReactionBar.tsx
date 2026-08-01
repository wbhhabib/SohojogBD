
'use client'

import React, { useState } from 'react'

interface Reaction {
  emoji: string
  label: string
  count: number
}

const INITIAL_REACTIONS: Reaction[] = [
  { emoji: '❤️', label: 'Love', count: 142 },
  { emoji: '🙏', label: 'Pray', count: 98 },
  { emoji: '👏', label: 'Clap', count: 67 },
  { emoji: '💪', label: 'Strong', count: 53 },
]

export default function ReactionBar() {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL_REACTIONS)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function handleReaction(emoji: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(emoji)) {
        next.delete(emoji)
        setReactions((r) =>
          r.map((rx) => (rx.emoji === emoji ? { ...rx, count: rx.count - 1 } : rx))
        )
      } else {
        next.add(emoji)
        setReactions((r) =>
          r.map((rx) => (rx.emoji === emoji ? { ...rx, count: rx.count + 1 } : rx))
        )
      }
      return next
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {reactions.map((reaction) => {
        const isSelected = selected.has(reaction.emoji)
        return (
          <button
            key={reaction.emoji}
            onClick={() => handleReaction(reaction.emoji)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all
              ${isSelected
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 text-emerald-700'
                : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <span>{reaction.emoji}</span>
            <span className={`text-xs font-medium ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
              {reaction.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}