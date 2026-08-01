
import React from 'react'

interface ProgressBarProps {
  raised: number
  goal: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export default function ProgressBar({ raised, goal, showLabel = false, size = 'md' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((raised / goal) * 100))

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-1">{percentage}% funded</p>
      )}
    </div>
  )
}