
import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
}

export function Loader({ size = 'md', color }: LoaderProps) {
  return (
    <div
      className={`
        rounded-full border-t-transparent animate-spin
        ${sizeClasses[size]}
        ${color ? '' : 'border-emerald-600'}
      `}
      style={color ? { borderColor: color, borderTopColor: 'transparent' } : undefined}
    />
  )
}

export default Loader